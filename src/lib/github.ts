import {Octokit} from "octokit";
import { components } from "@octokit/openapi-types";
import { db } from "@/server/db";
import axios from 'axios';
import { generateAiSummariseCommit } from "./gemini";

export const octokit = new Octokit({
    auth:process.env.GITHUB_ACCESS_TOKEN
})



type Response = {
    commitHash:string,
    commitMessage:string,
    commitDate:string,
    commitAuthorName:string,
    commitAuthorAvatar:string
}


export const getCommitHashes = async (githubUrl: string): Promise<Response[]> => {
    const [owner,repo]  = githubUrl.split('/').slice(-2);
    if(!owner || !repo){
        throw new Error('Invalid github url')
    }
    const { data } = await octokit.rest.repos.listCommits({
       owner: owner,
       repo: repo
    });

    const sortedCommits = data.sort((a,b) => new Date(b.commit.author?.date ?? '').getTime() - new Date(a.commit.author?.date ?? '').getTime());
    return sortedCommits.slice(0,10).map((commit: components['schemas']['commit']) => ({
        commitHash: commit.sha,
        commitMessage: commit.commit.message,
        commitDate: commit.commit.author?.date ?? '',
        commitAuthorName: commit.commit.author?.name ?? '',
        commitAuthorAvatar: commit.author?.avatar_url ?? ''
    }));
}
async function summariseCommit(githubUrl:string,commitHash:string) {
    const {data} = await axios.get(`${githubUrl}/commit/${commitHash}.diff`,{
        headers:{
            Accept:'application/vnd.github.v3.diff'
        }
    })

    return await generateAiSummariseCommit(data) || ""
}
export const pollCommits = async (projectId:string) => {
    const {project,githubUrl} = await fetchProjectAndGithub(projectId);
    const commitHashes = await getCommitHashes(githubUrl);
    const unprocessCommits = await filterUnProcessCommits(projectId,commitHashes);
    const summaryResponses = await Promise.allSettled(unprocessCommits.map((commit)=> {
        return summariseCommit(githubUrl,commit.commitHash)
    }))
    const summaries = summaryResponses.map(response => {
        if(response.status === 'fulfilled'){
            return response.value
        }
        return ""
    })
    const commits = await db.commit.createMany({
        data:summaries.map((summary,index)=>{
            console.log(`processing summary :: ` + index)
            return {
                projectId:projectId,
                commitHash:unprocessCommits[index]?.commitHash ?? '',
                commitMessage:unprocessCommits[index]?.commitMessage ?? '',
                commitAuthorAvatar:unprocessCommits[index]?.commitAuthorAvatar ?? '',
                commitAuthorName:unprocessCommits[index]?.commitAuthorName ?? '',
                commitDate:unprocessCommits[index]?.commitDate ?? '',
                summary
            }
        })
    })
    return commits;
}

 const fetchProjectAndGithub = async (projectId:string)=>{
    const project = await db.project.findUnique({
        where:{
            id:projectId
        },
        select:{
            githubUrl:true
        }
    })
    if(!project?.githubUrl){
        throw new Error("Project has no github url")
    }

    return {project,githubUrl:project.githubUrl}
}

async function filterUnProcessCommits(projectId:string,commitHashes:Response[]){
    const processedCommits = await db.commit.findMany({
            where:{
                 projectId
            },
            select: {
                commitHash: true
            }
    })

    const unprocessCommits = commitHashes.filter((commit)=> !processedCommits.some((processedCommit)=> processedCommit.commitHash === commit.commitHash))
    return unprocessCommits;
}

