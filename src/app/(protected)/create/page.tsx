"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import Image from "next/image";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type FormInput = {
  githubToken: string;
  repoUrl: string;
  projectName: string;
};

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const createProject = api.project.createProject.useMutation();

  function onSubmit(data: FormInput) {
    debugger;
    window.alert(JSON.stringify(data));
    createProject.mutate(
      {
        githubUrl: data.repoUrl,
        githubToken: data.githubToken,
        name: data.projectName,
      },
      {
        onSuccess: () => {
          toast.success("Project Created Successfully");
          reset();
        },
        onError: () => {
          toast.error("Failed to create Project");
        },
      },
    );
    return true;
  }
  return (
    <div className="flex h-full items-center justify-center gap-12">
      <Image
        src="/createPage1.jpeg"
        alt="Create Image"
        width={300}
        height={300}
      />
      <div>
        <div>
          <h1 className="text-3xl font-semibold">
            Link your Github Repository
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter the URL of your repository to link it to the Gitlic
          </p>
        </div>
        <div className="h-4"></div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              type="text"
              required
              placeholder="Project Name"
              {...register("projectName")}
            />
            <div className="h-2"></div>
            <Input
              type="url"
              required
              placeholder="Github URL"
              {...register("repoUrl")}
            />
            <div className="h-2"></div>
            <Input
              placeholder="Github Token (Optional)"
              {...register("githubToken")}
            />
            <div className="h-2"></div>
            <Button type="submit" disabled={createProject.isPending}>
              Create Project
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
