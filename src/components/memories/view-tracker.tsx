"use client";

import { useEffect } from "react";

export function ViewTracker({ activityId }: { activityId: string }) {
  useEffect(() => {
    void fetch(`/api/activities/${activityId}/view`, {
      method: "POST",
    });
  }, [activityId]);

  return null;
}
