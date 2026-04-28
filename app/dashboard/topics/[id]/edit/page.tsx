import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { TopicForm } from "../../TopicForm";
import { formatTopic } from "@/lib/topics";

export default async function EditTopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const { id } = await params;
  const { connectToDatabase } = await import("@/lib/mongodb");
  const Topic = (await import("@/models/Topic")).default;

  await connectToDatabase();

  const topic = await Topic.findOne({ _id: id, userId }).lean();
  if (!topic) {
    notFound();
  }

  return <TopicForm mode="edit" topic={formatTopic(topic)} />;
}
