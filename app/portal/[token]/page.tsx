import { redirect } from "next/navigation";

type PortalRootPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function PortalRootPage({ params }: PortalRootPageProps) {
  const { token } = await params;
  redirect(`/portal/${token}/projects`);
}
