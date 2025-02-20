import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import useProject from "@/hooks/use-projects";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { askQuestion } from "./action";
import { readStreamableValue } from "ai/rsc";
import MDEditor from "@uiw/react-md-editor";
import { useTheme } from "next-themes";
import { CodeReferences } from "./code-references";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";

const QuestionCard = () => {
  const { theme } = useTheme();
  const [bgColor, setBgColor] = useState("white");
  const [textColor, setTextColor] = useState("black");
  const { project } = useProject();
  const [question, setQuestion] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const saveAnswer = api.project.saveAnswers.useMutation();
  const [fileReferences, setFileReferences] = useState<
    {
      fileName: string;
      sourceCode: string;
      summary: string;
    }[]
  >([]);
  const [answer, setAnswer] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAnswer("");
    setFileReferences([]);
    if (!project?.id) {
      return;
    }

    setLoading(true);

    const { output, fileReferences } = await askQuestion(project.id, question);
    setOpen(true);
    setFileReferences(fileReferences);
    setLoading(false);

    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        setAnswer((ans) => ans + delta);
      }
    }

    setLoading(false);
  };
  const refetch = useRefetch();

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[90vw]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle>
                <Image src={"/logo.png"} alt="logo" width={40} height={40} />
              </DialogTitle>
              <Button
                disabled={saveAnswer.isPending}
                variant={"outline"}
                onClick={async () =>
                  saveAnswer.mutate(
                    {
                      projectId: project!.id,
                      answer: answer,
                      question: question,
                      fileReferences: fileReferences,
                    },
                    {
                      onSuccess: () => {
                        toast.success("Answer Saved Successfully");
                        refetch();
                      },
                      onError: () => {
                        toast.error("Something went wrong");
                      },
                    },
                  )
                }
              >
                Save Answer
              </Button>
            </div>
          </DialogHeader>
          <MDEditor.Markdown
            source={answer}
            style={{ background: "white", color: "black" }}
            className="h-full max-h-[30vh] max-w-[80vw] overflow-scroll"
          />
          <div className="h-4"></div>
          <CodeReferences fileReferences={fileReferences} />
          <Button
            className="max-w-[90vw]"
            type="button"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a Question</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit}>
            <Textarea
              placeholder="Which File Should I edit?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="h-4"></div>
            <Button type="submit" className="text-white" disabled={loading}>
              Ask Gitlic
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default QuestionCard;
