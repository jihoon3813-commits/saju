import React from "react";
import ManseDashboardClient from "@/components/manse/ManseDashboardClient";
import { getManseChartAction } from "@/app/actions/manse";
import { Container } from "@/components/layout/Container";

interface PageProps {
  searchParams: Promise<{
    profileId?: string;
    id?: string;
  }>;
}

export default async function MansePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const pId = params.profileId || params.id;

  let initialChart = null;

  if (pId) {
    const res = await getManseChartAction({ profileId: pId });
    if (res.success && res.chart) {
      initialChart = res.chart;
    }
  }

  return (
    <Container className="py-8">
      <ManseDashboardClient initialChart={initialChart} profileId={pId} />
    </Container>
  );
}
