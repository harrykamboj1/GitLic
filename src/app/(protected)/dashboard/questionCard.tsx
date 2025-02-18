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
import React, { useState } from "react";
import { askQuestion } from "./action";
import { readStreamableValue } from "ai/rsc";

const QuestionCard = () => {
  const { project } = useProject();
  const [question, setQuestion] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
    if (!project?.id) {
      return;
    }
    setOpen(true);
    setLoading(true);

    const { output, fileReferences } = await askQuestion(project.id, question);
    setFileReferences(fileReferences);
    setLoading(false);

    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        setAnswer((ans) => ans + delta);
      }
    }

    setLoading(false);
  };
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <Image src={"/logo.png"} alt="logo" width={40} height={40} />
            </DialogTitle>
          </DialogHeader>
          {answer}
          <h1>Files References</h1>
          {fileReferences.map((file) => {
            return <span key={file.fileName}>{file.fileName}</span>;
          })}
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
            <Button type="submit" className="text-white">
              Ask Gitlic
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default QuestionCard;
