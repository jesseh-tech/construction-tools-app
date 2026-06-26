"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { type Job, seedJob, blankJob, newId } from "@/lib/store";

const STORE = "tencent.projects.v1";
const LEGACY = "tencent.project.v1";

type ProjectsState = { current: string; items: Record<string, Job> };

type ProjectContextValue = {
  job: Job;
  setJob: (j: Job) => void;
  reset: () => void;
  projects: { id: string; name: string }[];
  currentId: string;
  switchProject: (id: string) => void;
  newProject: () => void;
  deleteProject: (id: string) => void;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

function ssrInitial(): ProjectsState {
  return { current: "seed", items: { seed: seedJob() } };
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProjectsState>(ssrInitial);

  // Load real data after mount (migrating a legacy single job if present).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) {
        const parsed = JSON.parse(raw) as ProjectsState;
        if (parsed && parsed.items && parsed.items[parsed.current]) {
          setState(parsed);
          return;
        }
      }
      const legacy = localStorage.getItem(LEGACY);
      const job = legacy ? (JSON.parse(legacy) as Job) : seedJob();
      const id = newId();
      const initial: ProjectsState = { current: id, items: { [id]: job } };
      setState(initial);
      localStorage.setItem(STORE, JSON.stringify(initial));
    } catch {
      /* keep SSR default */
    }
  }, []);

  const persist = useCallback((next: ProjectsState) => {
    setState(next);
    try {
      localStorage.setItem(STORE, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const job = state.items[state.current] ?? seedJob();

  const setJob = useCallback(
    (j: Job) => persist({ current: state.current, items: { ...state.items, [state.current]: j } }),
    [persist, state],
  );

  const reset = useCallback(
    () => persist({ current: state.current, items: { ...state.items, [state.current]: seedJob() } }),
    [persist, state],
  );

  const switchProject = useCallback(
    (id: string) => { if (state.items[id]) persist({ ...state, current: id }); },
    [persist, state],
  );

  const newProject = useCallback(() => {
    const id = newId();
    persist({ current: id, items: { ...state.items, [id]: blankJob() } });
  }, [persist, state]);

  const deleteProject = useCallback(
    (id: string) => {
      const items = { ...state.items };
      delete items[id];
      const ids = Object.keys(items);
      if (ids.length === 0) {
        const nid = newId();
        persist({ current: nid, items: { [nid]: blankJob() } });
      } else {
        persist({ current: state.current === id ? ids[0] : state.current, items });
      }
    },
    [persist, state],
  );

  const projects = Object.entries(state.items).map(([id, j]) => ({ id, name: j.meta.name || "Untitled" }));

  return (
    <ProjectContext.Provider value={{ job, setJob, reset, projects, currentId: state.current, switchProject, newProject, deleteProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within a ProjectProvider");
  return ctx;
}
