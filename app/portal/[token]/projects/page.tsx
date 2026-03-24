"use client";

import { FolderOpen } from "lucide-react";
import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import PortalEmptyState from "@/components/portal/portal-empty-state";
import PortalTabs from "@/components/portal/portal-tabs";
import ProjectTimeline from "@/components/portal/project-timeline";
import ProjectTimelineSkeleton from "@/components/portal/project-timeline-skeleton";
import { usePortalProjects } from "@/hooks/use-portal";

type PortalProjectsPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default function PortalProjectsPage({
  params,
}: PortalProjectsPageProps) {
  const { token } = use(params);
  const router = useRouter();

  const projectsQuery = usePortalProjects(token);

  useEffect(() => {
    const status =
      typeof projectsQuery.error === "object" &&
      projectsQuery.error !== null &&
      "status" in projectsQuery.error
        ? (projectsQuery.error.status as number)
        : null;

    if (status === 401) {
      router.push("/portal/invalid");
    }
  }, [projectsQuery.error, router]);

  const projects = projectsQuery.data ?? [];

  return (
    <div className="space-y-6 pt-4">
      <PortalTabs token={token} activeTab="projects" />

      <section className="space-y-2 pt-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Your Projects
        </h1>
        <p className="text-sm text-slate-500">
          Track the progress of your work in real time
        </p>
      </section>

      {projectsQuery.isLoading ? (
        <ProjectTimelineSkeleton />
      ) : projects.length === 0 ? (
        <PortalEmptyState
          icon={FolderOpen}
          heading="No projects yet"
          subtext="Your freelancer hasn't created any projects for you yet"
        />
      ) : (
        <ProjectTimeline projects={projects} />
      )}
    </div>
  );
}
