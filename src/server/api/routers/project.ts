import { z } from "zod";
import { authProcedure, createTRPCRouter, publicProcedure } from "../trpc";

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

        return project;
    })
})