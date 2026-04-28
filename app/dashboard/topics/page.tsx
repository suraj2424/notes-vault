import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TopicsLibraryClient } from "./TopicsLibraryClient";
import { escapeRegex, formatTopic } from "@/lib/topics";

export default async function TopicsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const page = parseInt((resolvedSearchParams.page as string) || "1", 10);
  const search = (resolvedSearchParams.search as string) || "";
  const includeArchived = resolvedSearchParams.includeArchived === "true";
  const pageSize = 18;

  const { connectToDatabase } = await import("@/lib/mongodb");
  const Topic = (await import("@/models/Topic")).default;

  await connectToDatabase();

  const query: Record<string, unknown> = {
    userId,
    ...(includeArchived ? {} : { isArchived: false }),
  };

  if (search.trim()) {
    const pattern = new RegExp(escapeRegex(search.trim()), "i");
    query.$or = [{ title: pattern }, { description: pattern }];
  }

  const [topics, total] = await Promise.all([
    Topic.find(query).sort({ updatedAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean(),
    Topic.countDocuments(query),
  ]);

  return (
    <TopicsLibraryClient
      initialTopics={topics.map(formatTopic)}
      totalPages={Math.ceil(total / pageSize)}
      currentPage={page}
    />
  );
}
