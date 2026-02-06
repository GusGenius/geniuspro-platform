"use client";

import { useState } from "react";
import { usePanelState, Agent } from "../layout/PanelStateContext";
import { Search, Bot, Trash2, Plus } from "lucide-react";

export default function AgentsPanel() {
  const {
    panelState,
    setChatVisible,
    setCurrentAgent,
    addAgent,
    deleteAgent,
  } = usePanelState();
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  const mockAgents: Agent[] = [
    { id: "1", name: "Code Assistant", description: "Helps with coding tasks", lastActive: new Date() },
    { id: "2", name: "API Helper", description: "Assists with API integration", lastActive: new Date(Date.now() - 3600000) },
  ];

  const displayAgents = panelState.agents.length > 0 ? panelState.agents : mockAgents;

  const filteredAgents = displayAgents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAgentClick = async (agentId: string) => {
    try {
      if (!panelState.chatVisible) {
        setChatVisible(true);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      setCurrentAgent(agentId);
    } catch (error) {
      console.error("[AgentsPanel] Error opening agent:", error);
    }
  };

  const handleDeleteAgentClick = (id: string) => {
    deleteAgent(id);
  };

  const handleNewAgent = async () => {
    try {
      if (!panelState.chatVisible) {
        setChatVisible(true);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const agentId = `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newAgent: Agent = {
        id: agentId,
        name: "New Agent",
        description: undefined,
        lastActive: new Date(),
      };

      addAgent(newAgent);
      setCurrentAgent(agentId);
      setSearchQuery("");
    } catch (error) {
      console.error("[AgentsPanel] Error creating new agent:", error);
    }
  };

  const formatTime = (date?: Date) => {
    if (!date) return "";
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  if (!panelState.agentsVisible) return null;

  return (
    <div
      className="fixed top-10 h-[calc(100vh-40px)] flex flex-col bg-gray-900/95 backdrop-blur-xl border-l border-gray-700 shadow-2xl z-20 transition-all duration-300 overflow-hidden"
      style={{
        width: `${panelState.agentsWidth}px`,
        minWidth: "250px",
        maxWidth: "600px",
        right: "0px",
      }}
    >
      <div className="flex flex-col h-full p-4 gap-4 overflow-hidden">
        {/* Search Input */}
        <div className="flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Agents..."
              className="w-full pl-8 pr-3 py-2 bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-md text-xs text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>
        </div>

        {/* New Agent Button */}
        <button
          onClick={handleNewAgent}
          className="flex-shrink-0 w-full h-8 px-4 bg-transparent border border-gray-600 rounded-lg text-xs font-normal text-gray-300 hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" />
          New Agent
        </button>

        {/* Agents List */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <h3 className="text-xs font-semibold text-gray-400 opacity-70 mb-3 flex-shrink-0">
            Agents
          </h3>
          <div className="flex-1 overflow-y-auto space-y-1">
            {filteredAgents.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-gray-400 opacity-60 text-center px-4 py-8">
                No agents found
              </div>
            ) : (
              filteredAgents.map((agent) => {
                const isActive = agent.id === panelState.currentAgentId;
                return (
                  <div
                    key={agent.id}
                    onClick={() => handleAgentClick(agent.id)}
                    onMouseEnter={() => setHoveredAgent(agent.id)}
                    onMouseLeave={() => setHoveredAgent(null)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                      isActive ? "bg-blue-500/10" : "hover:bg-blue-500/10"
                    } group`}
                  >
                    <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 opacity-80">
                      <Bot className="w-full h-full" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-normal truncate ${
                        isActive ? "text-gray-100" : "text-gray-300"
                      }`}>
                        {agent.name}
                      </div>
                      {agent.description && (
                        <div className="text-xs text-gray-400 opacity-50 truncate mt-0.5">
                          {agent.description}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {agent.lastActive && (
                        <span className="text-xs text-gray-400 opacity-60 transition-opacity group-hover:opacity-0">
                          {formatTime(agent.lastActive)}
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAgentClick(agent.id);
                        }}
                        className={`p-1 rounded text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all ${
                          hoveredAgent === agent.id ? "opacity-100" : "opacity-0"
                        }`}
                        title="Delete agent"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
