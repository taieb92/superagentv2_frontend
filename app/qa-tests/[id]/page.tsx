"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { AdminShell } from "@/components/superagent/shell/AdminShell";
import { PageHeader } from "@/components/superagent/ui/PageHeader";
import { ScenarioBuilder } from "@/components/superagent/qa/ScenarioBuilder";
import { TestResultsTimeline } from "@/components/superagent/qa/TestResultsTimeline";
import { RunButton } from "@/components/superagent/qa/RunButton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getScenario,
  createScenario,
  updateScenario,
  deleteScenario,
  runScenario,
  type ScenarioDetail,
  type ScenarioCreateRequest,
  type ScenarioRunResult,
} from "@/lib/api/qa-runner";

export default function ScenarioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params.id as string;
  const isNew = rawId === "new";
  const scenarioId = isNew ? "" : decodeURIComponent(rawId);

  const [scenario, setScenario] = useState<ScenarioDetail | null>(null);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [runResult, setRunResult] = useState<ScenarioRunResult | null>(null);
  const [activeTab, setActiveTab] = useState("builder");

  useEffect(() => {
    if (!isNew && scenarioId) {
      loadScenario();
    }
  }, [scenarioId, isNew]);

  async function loadScenario() {
    try {
      setIsLoading(true);
      const data = await getScenario(scenarioId);
      setScenario(data);
    } catch (err) {
      toast.error("Failed to load scenario");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave(data: ScenarioCreateRequest) {
    try {
      setIsSaving(true);
      if (isNew) {
        const result = await createScenario(data);
        toast.success("Scenario created");
        router.push(`/qa-tests/${encodeURIComponent(result.file_path)}`);
      } else {
        await updateScenario(scenarioId, data);
        toast.success("Scenario saved");
        await loadScenario();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRun() {
    try {
      setIsRunning(true);
      setActiveTab("results");
      toast.info("Running scenario...");
      const result = await runScenario(scenarioId);
      setRunResult(result);
      if (result.status === "passed") {
        toast.success(`Passed (${result.duration_ms}ms)`);
      } else if (result.status === "failed") {
        const failCount = result.turns.reduce(
          (acc, t) => acc + t.checks.filter((c) => !c.passed).length,
          0
        );
        toast.error(`${failCount} check(s) failed (${result.duration_ms}ms)`);
      } else {
        toast.error("Execution error");
      }
    } catch (err) {
      toast.error("Failed to run scenario");
    } finally {
      setIsRunning(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this scenario? This cannot be undone.")) return;
    try {
      setIsDeleting(true);
      await deleteScenario(scenarioId);
      toast.success("Scenario deleted");
      router.push("/qa-tests");
    } catch (err) {
      toast.error("Failed to delete scenario");
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <AdminShell>
        <div className="max-w-[1280px] mx-auto space-y-8">
          <div className="h-[40px] w-[300px] bg-white animate-pulse border" />
          <div className="h-[500px] bg-white animate-pulse border" />
        </div>
      </AdminShell>
    );
  }

  const initialData: ScenarioCreateRequest | undefined = scenario
    ? {
        name: scenario.name,
        description: scenario.description,
        tags: scenario.tags,
        category: scenario.category,
        contract_type: scenario.contract_type,
        mode: scenario.mode,
        mock_prompt_file: scenario.mock_prompt_file,
        prefilled_fields: scenario.prefilled_fields,
        mock_extract_responses: scenario.mock_extract_responses,
        mock_contracts: scenario.mock_contracts,
        error_config: scenario.error_config,
        is_guest: scenario.is_guest,
        guest_contract_id: scenario.guest_contract_id,
        turns: scenario.turns,
      }
    : undefined;

  return (
    <AdminShell>
      <div className="max-w-[1280px] mx-auto space-y-6">
        <PageHeader
          title={isNew ? "New Scenario" : scenario?.name ?? "Scenario"}
          subtitle={isNew ? "Create a new test scenario" : scenario?.description}
          action={
            !isNew ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
                <RunButton
                  onClick={handleRun}
                  isRunning={isRunning}
                  lastStatus={runResult?.status}
                />
              </div>
            ) : undefined
          }
          right={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/qa-tests")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          }
        />

        {isNew ? (
          <div className="bg-white border border-[#E5E7EB] shadow-sm p-6">
            <ScenarioBuilder
              onSave={handleSave}
              isSaving={isSaving}
            />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="rounded-none border border-[#E5E7EB]">
              <TabsTrigger value="builder" className="rounded-none">
                Builder
              </TabsTrigger>
              <TabsTrigger value="results" className="rounded-none">
                Results
                {runResult && (
                  <span
                    className={`ml-1.5 inline-block h-2 w-2 rounded-full ${
                      runResult.status === "passed" ? "bg-emerald-500" : "bg-red-500"
                    }`}
                  />
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="builder" className="mt-4">
              <div className="bg-white border border-[#E5E7EB] shadow-sm p-6">
                <ScenarioBuilder
                  initial={initialData}
                  onSave={handleSave}
                  isSaving={isSaving}
                />
              </div>
            </TabsContent>

            <TabsContent value="results" className="mt-4">
              {runResult ? (
                <TestResultsTimeline
                  turns={runResult.turns}
                  status={runResult.status}
                  durationMs={runResult.duration_ms}
                  error={runResult.error}
                />
              ) : (
                <div className="border border-[#E5E7EB] bg-white p-8 text-center">
                  <p className="text-[14px] text-[#6B7280]">
                    No results yet. Click &quot;Run Test&quot; to execute this scenario.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AdminShell>
  );
}
