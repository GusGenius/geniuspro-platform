"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Agent {
  id: string;
  name: string;
  description?: string;
  lastActive?: Date;
}

interface PanelState {
  chatVisible: boolean;
  agentsVisible: boolean;
  chatWidth: number;
  agentsWidth: number;
  currentAgentId: string | null;
  agents: Agent[];
}

interface PanelStateContextType {
  panelState: PanelState;
  toggleChat: () => void;
  toggleAgents: () => void;
  setChatVisible: (visible: boolean) => void;
  setAgentsVisible: (visible: boolean) => void;
  setChatWidth: (width: number) => void;
  setAgentsWidth: (width: number) => void;
  setCurrentAgent: (agentId: string | null) => void;
  addAgent: (agent: Agent) => void;
  updateAgent: (agentId: string, updates: Partial<Agent>) => void;
  deleteAgent: (agentId: string) => void;
  getCurrentAgent: () => Agent | null;
}

const defaultState: PanelState = {
  chatVisible: true,
  agentsVisible: true,
  chatWidth: 400,
  agentsWidth: 300,
  currentAgentId: null,
  agents: [],
};

const PanelStateContext = createContext<PanelStateContextType | undefined>(undefined);

const STORAGE_KEY = "geniuspro-platform-panel-state";
const AGENTS_STORAGE_KEY = "geniuspro-platform-agents";
const CURRENT_AGENT_KEY = "geniuspro-platform-current-agent";

export function PanelStateProvider({ children }: { children: ReactNode }) {
  const [panelState, setPanelState] = useState<PanelState>(defaultState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const savedAgents = localStorage.getItem(AGENTS_STORAGE_KEY);
      const savedCurrentAgent = localStorage.getItem(CURRENT_AGENT_KEY);
      
      let parsedState = defaultState;
      if (saved) {
        parsedState = { ...defaultState, ...JSON.parse(saved) };
      }
      
      let agents: Agent[] = [];
      if (savedAgents) {
        const parsed = JSON.parse(savedAgents);
        agents = parsed.map((a: any) => ({
          ...a,
          lastActive: a.lastActive ? new Date(a.lastActive) : undefined,
        }));
      }
      
      const currentAgentId = savedCurrentAgent ? JSON.parse(savedCurrentAgent) : null;
      
      setPanelState({
        ...parsedState,
        agents,
        currentAgentId,
      });
    } catch (error) {
      console.error("Failed to load panel state:", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (isHydrated) {
      try {
        const { agents, currentAgentId, ...panelStateWithoutAgents } = panelState;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(panelStateWithoutAgents));
        localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(agents));
        if (currentAgentId) {
          localStorage.setItem(CURRENT_AGENT_KEY, JSON.stringify(currentAgentId));
        } else {
          localStorage.removeItem(CURRENT_AGENT_KEY);
        }
      } catch (error) {
        console.error("Failed to save panel state:", error);
      }
    }
  }, [panelState, isHydrated]);

  const toggleChat = () => {
    setPanelState((prev) => ({ ...prev, chatVisible: !prev.chatVisible }));
  };

  const toggleAgents = () => {
    setPanelState((prev) => ({ ...prev, agentsVisible: !prev.agentsVisible }));
  };

  const setChatVisible = (visible: boolean) => {
    setPanelState((prev) => ({ ...prev, chatVisible: visible }));
  };

  const setAgentsVisible = (visible: boolean) => {
    setPanelState((prev) => ({ ...prev, agentsVisible: visible }));
  };

  const setChatWidth = (width: number) => {
    setPanelState((prev) => ({ ...prev, chatWidth: Math.max(300, Math.min(width, 800)) }));
  };

  const setAgentsWidth = (width: number) => {
    setPanelState((prev) => ({ ...prev, agentsWidth: Math.max(250, Math.min(width, 600)) }));
  };

  const setCurrentAgent = (agentId: string | null) => {
    setPanelState((prev) => ({ ...prev, currentAgentId: agentId }));
  };

  const addAgent = (agent: Agent) => {
    setPanelState((prev) => ({
      ...prev,
      agents: [agent, ...prev.agents],
    }));
  };

  const updateAgent = (agentId: string, updates: Partial<Agent>) => {
    setPanelState((prev) => ({
      ...prev,
      agents: prev.agents.map((agent) =>
        agent.id === agentId ? { ...agent, ...updates } : agent
      ),
    }));
  };

  const deleteAgent = (agentId: string) => {
    setPanelState((prev) => {
      const newAgents = prev.agents.filter((agent) => agent.id !== agentId);
      const newCurrentAgentId =
        prev.currentAgentId === agentId ? null : prev.currentAgentId;
      return {
        ...prev,
        agents: newAgents,
        currentAgentId: newCurrentAgentId,
      };
    });
  };

  const getCurrentAgent = () => {
    if (!panelState.currentAgentId) return null;
    return (
      panelState.agents.find((a) => a.id === panelState.currentAgentId) || null
    );
  };

  return (
    <PanelStateContext.Provider
      value={{
        panelState,
        toggleChat,
        toggleAgents,
        setChatVisible,
        setAgentsVisible,
        setChatWidth,
        setAgentsWidth,
        setCurrentAgent,
        addAgent,
        updateAgent,
        deleteAgent,
        getCurrentAgent,
      }}
    >
      {children}
    </PanelStateContext.Provider>
  );
}

export function usePanelState() {
  const context = useContext(PanelStateContext);
  if (context === undefined) {
    throw new Error("usePanelState must be used within a PanelStateProvider");
  }
  return context;
}
