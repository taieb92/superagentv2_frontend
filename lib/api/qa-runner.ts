/**
 * API client for the LiveKit Agent Test Runner (runner_api.py).
 *
 * Connects to the FastAPI server running alongside the voice agent.
 * Base URL defaults to http://localhost:8090 for local development.
 */

const QA_RUNNER_BASE_URL =
  process.env.NEXT_PUBLIC_QA_RUNNER_URL || "http://localhost:8090";

// --- Types ---

export interface ScenarioSummary {
  name: string;
  description: string;
  tags: string[];
  category: string;
  contract_type: string;
  mode: string;
  turn_count: number;
  file_path: string;
  last_result: "passed" | "failed" | null;
}

export interface ScenarioDetail {
  name: string;
  description: string;
  tags: string[];
  category: string;
  contract_type: string;
  mode: string;
  mock_prompt_file: string;
  prefilled_fields: Record<string, string>;
  mock_extract_responses: Record<string, unknown>[];
  mock_contracts: Record<string, unknown>[];
  error_config: Record<string, boolean>;
  is_guest: boolean;
  guest_contract_id: string;
  turns: TurnSpec[];
}

export interface TurnSpec {
  user_input: string;
  expect_tool_call?: { name: string; arguments?: Record<string, string> } | string;
  expect_no_tool_call?: boolean;
  expect_message_intent?: string;
  expect_contains?: string[];
  expect_not_contains?: string[];
  expect_field_asked?: string;
  expect_field_not_asked?: string[];
}

export interface TurnCheckResult {
  type: string;
  passed: boolean;
  expected: unknown;
  actual: unknown;
  reason: string;
}

export interface TurnResult {
  turn: number;
  user_input: string;
  agent_response: string;
  tool_calls: { name: string; arguments: Record<string, unknown> }[];
  checks: TurnCheckResult[];
}

export interface ScenarioRunResult {
  scenario: string;
  status: "passed" | "failed" | "error";
  duration_ms: number;
  error?: string;
  turns: TurnResult[];
}

export interface RunAllResult {
  total: number;
  passed: number;
  failed: number;
  errors: number;
  duration_ms: number;
  results: ScenarioRunResult[];
}

export interface ScenarioCreateRequest {
  name: string;
  description?: string;
  tags?: string[];
  category?: string;
  contract_type?: string;
  mode?: string;
  mock_prompt_file?: string;
  prefilled_fields?: Record<string, string>;
  mock_extract_responses?: Record<string, unknown>[];
  mock_contracts?: Record<string, unknown>[];
  error_config?: Record<string, boolean>;
  is_guest?: boolean;
  guest_contract_id?: string;
  turns?: TurnSpec[];
}

// --- Fetch helper ---

async function qaFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${QA_RUNNER_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail || body.message || `Request failed: ${res.status}`);
  }

  return res.json();
}

// --- Scenario CRUD ---

export async function listScenarios(): Promise<ScenarioSummary[]> {
  return qaFetch<ScenarioSummary[]>("/scenarios");
}

export async function getScenario(name: string): Promise<ScenarioDetail> {
  return qaFetch<ScenarioDetail>(`/scenarios/${encodeURIComponent(name)}`);
}

export async function createScenario(
  data: ScenarioCreateRequest
): Promise<ScenarioSummary> {
  return qaFetch<ScenarioSummary>("/scenarios", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateScenario(
  name: string,
  data: ScenarioCreateRequest
): Promise<ScenarioSummary> {
  return qaFetch<ScenarioSummary>(`/scenarios/${encodeURIComponent(name)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteScenario(name: string): Promise<void> {
  await qaFetch(`/scenarios/${encodeURIComponent(name)}`, {
    method: "DELETE",
  });
}

// --- Test execution ---

export async function runScenario(name: string): Promise<ScenarioRunResult> {
  return qaFetch<ScenarioRunResult>(`/run/${encodeURIComponent(name)}`, {
    method: "POST",
  });
}

export async function runAllScenarios(): Promise<RunAllResult> {
  return qaFetch<RunAllResult>("/run", {
    method: "POST",
  });
}

// --- Generation ---

export async function generateScenario(
  description: string,
  mockPromptFile?: string
): Promise<ScenarioCreateRequest> {
  return qaFetch<ScenarioCreateRequest>("/generate", {
    method: "POST",
    body: JSON.stringify({
      description,
      mock_prompt_file: mockPromptFile ?? "",
    }),
  });
}

// --- Prompts ---

export async function listPrompts(): Promise<string[]> {
  const data = await qaFetch<{ prompts: string[] }>("/prompts");
  return data.prompts;
}

export async function getPromptContent(
  name: string
): Promise<string> {
  const data = await qaFetch<{ name: string; content: string }>(
    `/prompts/${encodeURIComponent(name)}`
  );
  return data.content;
}

export async function getPromptFields(
  name: string
): Promise<string[]> {
  const data = await qaFetch<{ name: string; fields: string[] }>(
    `/prompt-fields/${encodeURIComponent(name)}`
  );
  return data.fields;
}

// --- Health ---

export async function checkHealth(): Promise<{
  status: string;
  scenarios_count: number;
  prompts_count: number;
}> {
  return qaFetch("/health");
}
