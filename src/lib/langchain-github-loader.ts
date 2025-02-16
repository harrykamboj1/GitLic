import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { aiGenerateEmbeddings, summariseCode } from "./gemini";
import { db } from "@/server/db";
export const loadGithubRepo = async (githubUrl: string, githubToken?: string) => {
    const loader = new GithubRepoLoader(
        githubUrl,
        {
          accessToken:githubToken ?? '',
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
  const allEmbeddings = await generateEmbeddings(docs);
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