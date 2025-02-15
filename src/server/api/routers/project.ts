import { z } from "zod";
import { authProcedure, createTRPCRouter, publicProcedure } from "../trpc";
import { pollCommits } from "@/lib/github";

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
    })
})