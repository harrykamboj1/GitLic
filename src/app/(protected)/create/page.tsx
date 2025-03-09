"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import { Info } from "lucide-react";
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
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput>();
  const checkCredits = api.project.checkCredits.useMutation();
  const createProject = api.project.createProject.useMutation();
  const refetch = useRefetch();
  function onSubmit(data: FormInput) {
    if (!!checkCredits.data) {
      createProject.mutate(
        {
          githubUrl: data.repoUrl,
          githubToken: data.githubToken,
          name: data.projectName,
        },
        {
          onSuccess: () => {
            toast.success("Project Created Successfully");
            void refetch();
            reset();
          },
          onError: () => {
            toast.error("Failed to create Project");
          },
        },
      );
    } else {
      checkCredits.mutate({
        githuburl: data.repoUrl,
        githubToken: data.githubToken,
      });
    }
  }

  const hasCredits = checkCredits.data?.userCredits
    ? checkCredits.data.fileCount <= checkCredits.data.userCredits
    : true;
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
              {...register("projectName", {
                pattern: {
                  value: /^[a-zA-Z0-9\s]+$/,
                  message:
                    "Project name can only contain letters, numbers and spaces",
                },
              })}
            />
            {errors.projectName && (
              <p className="text-sm text-red-500">
                {errors.projectName.message}
              </p>
            )}
            <div className="h-2"></div>
            <Input
              type="text"
              placeholder="Github URL"
              {...register("repoUrl", {
                required: "GitHub URL is required",
                pattern: {
                  value:
                    /^(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9-_.]+(\/[A-Za-z0-9-_.]+)?$/,
                  message: "Invalid GitHub URL",
                },
              })}
            />
            {errors.repoUrl && (
              <p className="text-sm text-red-500">{errors.repoUrl.message}</p>
            )}
            <div className="h-2"></div>
            <Input
              placeholder="Github Token (Optional)"
              {...register("githubToken")}
            />
            {!!checkCredits.data && (
              <>
                <div className="mt-4 rounded-md border-orange-200 bg-orange-50 px-4 py-2 text-orange-700">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="flex items-center justify-center gap-x-2">
                        <Info className="size-4" />
                        <p className="text-sm">
                          You will be charged{" "}
                          <strong>{checkCredits.data.fileCount}</strong> credits
                          for this repository
                        </p>
                      </div>
                      <p className="ml-6 text-sm text-blue-600">
                        You have{" "}
                        <strong>{checkCredits.data?.userCredits} </strong>
                        credits remaining
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
            <div className="h-2"></div>
            <Button
              type="submit"
              disabled={
                createProject.isPending ||
                !!checkCredits.isPending ||
                !hasCredits
              }
            >
              {!!checkCredits.data ? "Create Project" : "Check Credits"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
