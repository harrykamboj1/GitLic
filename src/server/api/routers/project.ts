import { string, z } from "zod";
import { authProcedure, createTRPCRouter, publicProcedure } from "../trpc";
import { pollCommits } from "@/lib/github";
import { indexGithubRepo } from "@/lib/langchain-github-loader";

export const projectRouter = createTRPCRouter({
    createProject: authProcedure.input(
        z.object({
            name:z.string(),
            githubUrl:z.string(),
            githubToken: z.string().optional(),
        })
    ).mutation(async ( {ctx,input} ) => {
        const project = await ctx.db.project.create({
            data:{
                githubUrl: input.githubUrl,
                name:input.name,
                UserToProject:{
                    create:{
                        userId:ctx.user.userId!
                    }
                }
            }
        })
        await indexGithubRepo(project.id,project.githubUrl,input.githubToken!)
        await pollCommits(project.id)
        return project;
    }),
    getProjects: authProcedure.query(async ({ctx})=>{
        return await ctx.db.project.findMany({
            where:{
                UserToProject:{
                    some:{
                        userId:ctx.user.userId!
                    }
                },
                deletedAt:null
            }
        })
    }),
    getCommits: authProcedure.input(z.object({
        projectId:z.string(),
    })).query(async({ctx,input})=> {
        pollCommits(input.projectId).then().catch(console.error)
        return await ctx.db.commit.findMany({
            where:{
                projectId:input.projectId
            }
        })
    }),
    saveAnswers: authProcedure.input(z.object({
        projectId:z.string(),
        question:z.string(),
        fileReferences:z.any(),
        answer:z.string(),

    })).mutation(async ({ctx,input})=>{
        const result =  await ctx.db.question.create({
            data:{
                answer:input.answer,
                question:input.question,
                fileReferences:input.fileReferences,
                projectId:input.projectId,
                userId:ctx.user.userId!
            }
        })

        return result;
    }),
    getQuestions:authProcedure.input(z.object({
        projectId:z.string()
    })).query(async({ctx,input})=>{
        const result = await ctx.db.question.findMany({
            where:{
                projectId:input.projectId
            },
            include:{
                user:true
            },
            orderBy:{
                createdAt: 'desc'
            }
        })

        return result;
    }),
    uploadMeeting: authProcedure.input(
        z.object({
            name:z.string(),
            meetingUrl:z.string(),
            projectId: z.string(),
        })
    ).mutation(async ( {ctx,input} ) => {
        const result = await ctx.db.meeting.create({
            data:{
                meetingUrl: input.meetingUrl,
                name:input.name,
                projectId:input.projectId,
            }
        })
        return result;
    }),
    getMeetings: authProcedure.input(z.object({
        projectId:z.string(),
    })).query(async ({ctx,input})=>{
        const meetings = await ctx.db.meeting.findMany({
            where:{
                projectId:input.projectId
            },
            include:{
                Issues:true,
            }
        })

        return meetings;
    }),
    deleteMeetings: authProcedure.input(z.object({
        meetingId:z.string(),
    })).mutation(async ({ctx,input})=>{ 
        const result1 = await ctx.db.issues.deleteMany({
            where:{
                meetingId:input.meetingId
            },
        })

        const result = await ctx.db.meeting.delete({
            where:{
                id:input.meetingId
            },
        })

        return result;
    }),
    getMeetingById: authProcedure.input(z.object({
        meetingId:z.string(),
    })).query(async ({ctx,input})=>{
        const meeting = await ctx.db.meeting.findUnique({
            where:{
                id:input.meetingId
            },
            include:{
                Issues:true
            }
        })

        return meeting;
    }),
    archieveProject: authProcedure.input(z.object({
        projectId:z.string(),
    })).mutation(async ({ctx,input})=>{
        const result = await ctx.db.project.update({
            where:{
                id:input.projectId
            },
            data:{
                deletedAt:new Date()
            }
        })

        return result;
    }
    ),
    getTeamMembers: authProcedure.input(z.object({ projectId:z.string() })).query(async ({ctx,input})=>{
       return  await ctx.db.userToProject.findMany({
            where:{
                projectId:input.projectId
            },
            include:{
                user:true
            }
        })})
})