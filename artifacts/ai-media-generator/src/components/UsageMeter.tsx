import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Zap, Crown } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const FREE_LIMIT = 5;

export function UsageMeter() {
  const { data: me, isLoading } = useGetMe();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsub = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === "updated" && event.query.queryHash.includes("generate")) {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      }
    });
    return unsub;
  }, [queryClient]);

  if (isLoading || !me) return null;

  if (me.isPro) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-600/10 border border-violet-500/20">
        <Crown className="h-4 w-4 text-violet-400 shrink-0" />
        <span className="text-sm font-medium text-violet-300">Pro — Unlimited</span>
      </div>
    );
  }

  const used = me.todayCount;
  const remaining = me.remainingToday;
  const pct = Math.min((used / FREE_LIMIT) * 100, 100);
  const exhausted = remaining === 0;

  return (
    <div className="space-y-2 px-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Zap className="h-3.5 w-3.5" />
          Daily generations
        </span>
        <span className={exhausted ? "text-red-400 font-medium" : "text-foreground font-medium"}>
          {used} / {FREE_LIMIT}
        </span>
      </div>

      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            exhausted ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-violet-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {exhausted ? (
        <p className="text-xs text-red-400">
          Limit reached — resets tomorrow
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          {remaining} generation{remaining !== 1 ? "s" : ""} left today
        </p>
      )}
    </div>
  );
}
