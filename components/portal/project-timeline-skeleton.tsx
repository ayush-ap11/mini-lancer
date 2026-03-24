const PROJECT_CARD_SKELETON_KEYS = [
  "portal-project-card-skeleton-1",
  "portal-project-card-skeleton-2",
  "portal-project-card-skeleton-3",
] as const;

const STAGE_SKELETON_KEYS = [
  "portal-stage-skeleton-1",
  "portal-stage-skeleton-2",
  "portal-stage-skeleton-3",
  "portal-stage-skeleton-4",
] as const;

export default function ProjectTimelineSkeleton() {
  return (
    <div className="space-y-6">
      <div className="hidden rounded-xl border border-slate-200 bg-white p-4 md:block">
        <div className="flex items-start">
          {STAGE_SKELETON_KEYS.map((stageKey, index) => (
            <div key={stageKey} className="flex flex-1 items-start">
              <div className="flex w-full flex-col items-center">
                <div className="size-8 rounded-full border-2 border-slate-300 bg-slate-100" />
                <div className="mt-2 h-3 w-20 rounded bg-slate-200" />
              </div>
              {index < STAGE_SKELETON_KEYS.length - 1 ? (
                <div className="mt-4 h-0.5 flex-1 bg-slate-200" />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 md:hidden">
        <div className="space-y-4">
          {STAGE_SKELETON_KEYS.map((stageKey, index) => (
            <div key={`${stageKey}-mobile`} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="size-6 rounded-full border-2 border-slate-300 bg-slate-100" />
                {index < STAGE_SKELETON_KEYS.length - 1 ? (
                  <div className="mt-1 h-8 w-0.5 bg-slate-200" />
                ) : null}
              </div>
              <div className="h-4 w-28 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {PROJECT_CARD_SKELETON_KEYS.map((projectKey) => (
          <div
            key={projectKey}
            className="rounded-xl border border-slate-200 border-l-4 border-l-slate-300 bg-white p-4 shadow-sm"
          >
            <div className="space-y-2">
              <div className="h-5 w-48 rounded bg-slate-200" />
              <div className="h-4 w-24 rounded bg-slate-100" />
              <div className="h-4 w-36 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
