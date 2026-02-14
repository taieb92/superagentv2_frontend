"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Play } from "lucide-react";
import { toast } from "sonner";

import { AdminShell } from "@/components/superagent/shell/AdminShell";
import { PageHeader } from "@/components/superagent/ui/PageHeader";
import { ScenarioList } from "@/components/superagent/qa/ScenarioList";
import { Button } from "@/components/ui/button";
import {
  listScenarios,
  runAllScenarios,
  type ScenarioSummary,
  type RunAllResult,
} from "@/lib/api/qa-runner";

export default function QaTestsPage() {
  const router = useRouter();
  const [scenarios, setScenarios] = useState<ScenarioSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningAll, setIsRunningAll] = useState(false);

  useEffect(() => {
    loadScenarios();
  }, []);

  async function loadScenarios() {
    try {
      setIsLoading(true);
      const data = await listScenarios();
      setScenarios(data);
    } catch (err) {
      toast.error("Failed to load scenarios. Is the test runner API running?");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRunAll() {
    try {
      setIsRunningAll(true);
      toast.info("Running all scenarios...");
      const result: RunAllResult = await runAllScenarios();
      toast.success(
        `Done: ${result.passed} passed, ${result.failed} failed, ${result.errors} errors (${result.duration_ms}ms)`
      );
      await loadScenarios();
    } catch (err) {
      toast.error("Failed to run scenarios");
    } finally {
      setIsRunningAll(false);
    }
  }

  return (
    <AdminShell>
      <div className="max-w-[1280px] mx-auto space-y-8">
        <PageHeader
          title="QA Tests"
          subtitle="Voice agent test scenarios — build, run, and review"
          action={
            <Button onClick={() => router.push("/qa-tests/new")}>
              <Plus className="h-4 w-4" />
              New Scenario
            </Button>
          }
          right={
            <Button
              variant="outline"
              onClick={handleRunAll}
              disabled={isRunningAll || scenarios.length === 0}
            >
              <Play className="h-4 w-4" />
              {isRunningAll ? "Running..." : "Run All"}
            </Button>
          }
        />

        <ScenarioList
          scenarios={scenarios}
          isLoading={isLoading}
          onRunAll={handleRunAll}
          isRunningAll={isRunningAll}
        />
      </div>
    </AdminShell>
  );
}
