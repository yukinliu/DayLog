import { useEffect, useState } from "react";

export interface EnergyActivity {
  id: number;
  category: string;
  title: string;
  detail: string;
  duration: string;
}

let activitiesRequest: Promise<EnergyActivity[]> | null = null;

function loadActivities() {
  if (!activitiesRequest) {
    activitiesRequest = fetch("data/energy-activities.json", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("energy activities not found");
        return response.json() as Promise<EnergyActivity[]>;
      })
      .then((items) => items.filter((item) => item.title && item.detail));
  }
  return activitiesRequest;
}

export function useEnergyActivities() {
  const [activities, setActivities] = useState<EnergyActivity[]>([]);
  useEffect(() => {
    let active = true;
    loadActivities().then((items) => {
      if (active) setActivities(items);
    }).catch(() => {
      if (active) setActivities([]);
    });
    return () => {
      active = false;
    };
  }, []);
  return activities;
}
