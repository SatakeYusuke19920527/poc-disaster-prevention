import * as df from "durable-functions";
import type { AgentOutput } from "../types/chat";

interface Input {
  output: AgentOutput;
}

const DISASTER_KEYWORDS = ["地震", "津波", "台風", "洪水", "豪雨", "避難", "火災"];
const OFFICIAL_NOTE =
  "※ シミュレーションや学習目的の情報です。実際の災害時は気象庁・自治体・消防など公式情報を必ず確認してください。";

function needsOfficialNote(answer: string): boolean {
  return DISASTER_KEYWORDS.some((k) => answer.includes(k));
}

export async function applyGuardrails(input: Input): Promise<AgentOutput> {
  const o = input.output;
  let answer = o.answer ?? "";
  const safetyNotes = [...(o.safetyNotes ?? [])];

  if (needsOfficialNote(answer) && !answer.includes(OFFICIAL_NOTE)) {
    answer = `${answer}\n\n${OFFICIAL_NOTE}`;
    if (!safetyNotes.includes(OFFICIAL_NOTE)) safetyNotes.push(OFFICIAL_NOTE);
  }

  return { ...o, answer, safetyNotes };
}

df.app.activity("applyGuardrails", { handler: applyGuardrails });
