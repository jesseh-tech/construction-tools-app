"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { type Job, seedJob } from "@/lib/store";

const KEY = "tencent.project.v1";

type ProjectContextValue = {
  job: Job;
  setJob: (j: Job) => void;
  reset: () => void;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [job, setJobState] = useState<Job>(seedJob);

  // Load any saved job on first mount (client-only).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setJobState(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const setJob = useCallback((j: Job) => {
    setJobState(j);
    try {
      localStorage.setItem(KEY, JSON.stringify(j));
    } catch {
      /* ignore */
    }
  }, []);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setJobState(seedJob());
  }, []);

  return <ProjectContext.Provider value={{ job, setJob, reset }}>{children}</ProjectContext.Provider>;
}

export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within a ProjectProvider");
  return ctx;
}
