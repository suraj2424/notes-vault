import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TopicForm } from "../TopicForm";

export default async function NewTopicPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  return <TopicForm mode="create" />;
}
