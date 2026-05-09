import "./functions/chatHttpStart";
import "./functions/getChatStatus";
import "./functions/chatOrchestrator";
import "./functions/loadConversation";
import "./functions/classifyIntent";
import "./functions/retrieveContext";
import "./functions/runFurusatoAgent";
import "./functions/runDisasterSimulationAgent";
import "./functions/runDisasterLearningAgent";
import "./functions/aggregateAnswer";
import "./functions/applyGuardrails";
import "./functions/saveConversation";
import "./functions/trackTelemetry";

import { initAppInsights } from "./services/appInsights";

initAppInsights();
