import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { aiGenerateEmbeddings, summariseCode } from "./gemini";
import { db } from "@/server/db";
import { Octokit } from "octokit";

const ignoreFiles = [
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'bun.lockb',
  '.gitignore',
  '*.md' // This needs special handling
];


export const getfileCount = async (path:string,octokit:Octokit,githubOwner:string,githubRepo:string,acc: number = 0)=>{

  const {data} = await octokit.rest.repos.getContent({
    owner:githubOwner,
    repo:githubRepo,
    path
  })

  const files = Array.isArray(data) ? data : [data];
  const filteredFiles = files.filter((file): file is typeof files[0] => {
    // Exact match exclusion
    if (ignoreFiles.includes(file.name)) return false;
    
    // Handle wildcard '*.md' - Exclude all Markdown files
    if (file.name.endsWith('.md')) return false;
  
    return true;
  });
  

  if(!Array.isArray(filteredFiles) && filteredFiles.type === 'file'){
    return acc + 1;
  }

  if(Array.isArray(filteredFiles)){
    let fileCount = 0;
    const directories: string[] = []
    for(const item of filteredFiles){
      if(item.type === 'dir'){
        directories.push(item.path)
      }else{
        fileCount++;
      }
    }
    if(directories.length > 0){
      const directoryCount = await Promise.all(
        directories.map(dirPath=> getfileCount(dirPath,octokit,githubOwner,githubRepo,0))
      )
      if(directoryCount == null || directoryCount == undefined){
        return fileCount;
      }else{
        const res =  directoryCount.reduce((acc, count) => acc + count, 0);
        fileCount = fileCount + res;
      }
    }

    return fileCount + acc;
  }
  return acc;
}

export const checkCredits = async (githubUrl:string,githubToken:string)=>{

  const octokit = new Octokit({ auth:process.env.GITHUB_ACCESS_TOKEN})
  const githubOwner = githubUrl.split('/')[3];
  const githubRepo = githubUrl.split('/')[4];
  if(!githubOwner || !githubRepo){
    return 0;
  }
  const repo  = githubRepo.split('.').length >= 2 ? githubRepo.split('.')[0] : githubRepo;
  const fileCount = await getfileCount('',octokit,githubOwner,repo!,0);
  return fileCount;
}
export const loadGithubRepo = async (githubUrl: string, githubToken?: string) => {
    const loader = new GithubRepoLoader(
        githubUrl,
        {
          accessToken: process.env.GITHUB_PERSONAL_TOKEN,
          branch: "main",
          recursive: true,
          unknown: "warn",
          maxConcurrency: 5, 
          ignoreFiles:['package-lock.json','yarn.lock','pnpm-lock.yaml','bun.lockb','*.md'],
        }
      );
      const docs = await loader.load();
      return docs;
}

export const  indexGithubRepo = async (projectId:string,githubUrl:string,githubToken:string)=>{
  const docs = await loadGithubRepo(githubUrl,githubToken);
 
  if(!docs){
    return;
  }
  const filteredDocs = docs.filter(doc => {
    const source = doc.metadata.source as string;
    const fileName = source.split('/').pop() ?? '';
  
    // Check for exact match
    if (ignoreFiles.includes(fileName)) return false;
  
    // Handle wildcard '*.md' - Ignore all Markdown files
    if (fileName.endsWith('.md')) return false;
  
    return true;
  });

  const allEmbeddings = await generateEmbeddings(filteredDocs);
  await Promise.allSettled(allEmbeddings.map(async(embedding,index)=> {
    console.log(`processing ${index} of ${allEmbeddings.length}`)
    if(!embedding){
      return;
    }

    try {
     const sourceCodeEmbedding =  await db.sourceCodeEmbedding.create({
        data:{
          summary:embedding.summary,
          sourceCode:embedding.sourceCode,
          fileName:embedding.fileName,
          projectId
        }
      });

      await db.$executeRaw`
      UPDATE "SourceCodeEmbedding"
      SET "summaryEmbedding" = ${embedding.embedding} :: vector
      WHERE "id"= ${sourceCodeEmbedding.id}`
      
    } catch (error) {
      console.error('Failed to create embedding:', error);
    }
  }))
}

const generateEmbeddings = async(docs:Document[])=> {
  return await Promise.all(docs.map(async doc => {
    const summary = await summariseCode(doc);
    const embedding  = await aiGenerateEmbeddings(summary);
    return {
      summary,
      embedding,
      sourceCode: JSON.stringify(doc.pageContent),
      fileName: doc.metadata.source as string,
    }
  }))
}