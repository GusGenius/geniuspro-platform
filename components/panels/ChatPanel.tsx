"use client";

import { useState, useRef, useEffect } from "react";
import { usePanelState } from "../layout/PanelStateContext";
import { X, ChevronDown, AtSign, Globe, Mic, ArrowUp } from "lucide-react";

type ChatMode = "ask" | "code" | "agent";
type ChatState = "empty" | "active" | "processing";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

export default function ChatPanel() {
  const { panelState, setChatVisible, setChatWidth, getCurrentAgent } = usePanelState();
  const [chatState, setChatState] = useState<ChatState>("empty");
  const [mode, setMode] = useState<ChatMode>("ask");
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  const [isHeaderModeDropdownOpen, setIsHeaderModeDropdownOpen] = useState(false);
  const modeDropdownRef = useRef<HTMLDivElement>(null);
  const headerModeDropdownRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [headerInput, setHeaderInput] = useState("");
  const [isResizing, setIsResizing] = useState(false);
  const [previousAgentId, setPreviousAgentId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const headerTextareaRef = useRef<HTMLTextAreaElement>(null);

  const currentAgent = getCurrentAgent();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(event.target as Node)) {
        setIsModeDropdownOpen(false);
      }
      if (headerModeDropdownRef.current && !headerModeDropdownRef.current.contains(event.target as Node)) {
        setIsHeaderModeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  useEffect(() => {
    const textarea = headerTextareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [headerInput]);

  useEffect(() => {
    const handle = resizeHandleRef.current;
    if (!handle) return;

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      const startX = e.clientX;
      const startWidth = panelState.chatWidth;

      const handleMouseMove = (e: MouseEvent) => {
        const diff = startX - e.clientX;
        const newWidth = startWidth + diff;
        setChatWidth(newWidth);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    handle.addEventListener("mousedown", handleMouseDown);
    return () => handle.removeEventListener("mousedown", handleMouseDown);
  }, [panelState.chatWidth, setChatWidth]);

  useEffect(() => {
    if (panelState.currentAgentId) {
      if (previousAgentId && previousAgentId !== panelState.currentAgentId) {
        setMessages([]);
      }
      setChatState("active");
      setPreviousAgentId(panelState.currentAgentId);
    } else {
      setMessages([]);
      setChatState("empty");
      setPreviousAgentId(null);
    }
  }, [panelState.currentAgentId, previousAgentId]);

  const handleSend = (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setChatState("active");
    setInput("");
    setHeaderInput("");

    // TODO: Add AI response logic
  };

  const handleClose = () => {
    setChatVisible(false);
    setChatState("empty");
    setMessages([]);
    setInput("");
    setHeaderInput("");
    setPreviousAgentId(null);
  };

  if (!panelState.chatVisible) return null;

  return (
    <div
      className={`fixed top-10 h-[calc(100vh-40px)] flex flex-col bg-gray-900/95 backdrop-blur-xl border-l border-gray-700 shadow-2xl z-30 transition-all duration-300 ${
        isResizing ? "select-none" : ""
      }`}
      style={{ 
        width: `${panelState.chatWidth}px`, 
        minWidth: "300px", 
        maxWidth: "calc(100vw - 200px)",
        right: panelState.agentsVisible ? `${panelState.agentsWidth}px` : "0px"
      }}
    >
      {/* Resize Handle */}
      <div
        ref={resizeHandleRef}
        className={`absolute left-0 top-0 w-1 h-full cursor-ew-resize transition-colors ${
          isResizing ? "bg-blue-500" : "bg-transparent hover:bg-blue-500/50"
        }`}
      />

      {/* Header */}
      <div className="flex-shrink-0 min-h-[40px] p-2 pb-0 flex flex-col gap-2">
        <div className="flex items-center justify-between w-full">
          {chatState !== "empty" && (
            <div className="text-xs font-semibold text-gray-400 opacity-70">
              {currentAgent ? currentAgent.name : "Chat Conversation"}
            </div>
          )}
          {chatState === "empty" && <div />}
          <button
            onClick={handleClose}
            className="p-1.5 rounded-md text-gray-400 hover:bg-gray-800 hover:text-blue-400 transition-colors ml-auto"
            title="Close Chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Header Input */}
        {chatState === "empty" && (
          <div className="w-full">
            <div className="p-1.5 flex flex-col gap-1 bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-md">
              <textarea
                ref={headerTextareaRef}
                value={headerInput}
                onChange={(e) => setHeaderInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(headerInput);
                  }
                }}
                placeholder="Type a message..."
                className="w-full px-1.5 py-2 bg-transparent border-none rounded text-sm text-gray-100 placeholder-gray-400 resize-none outline-none focus:ring-0"
                rows={1}
              />
              <div className="flex items-center justify-between px-1.5 pb-1">
                <div className="relative" ref={headerModeDropdownRef}>
                  <button
                    onClick={() => setIsHeaderModeDropdownOpen(!isHeaderModeDropdownOpen)}
                    className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/30 rounded-full text-xs font-medium text-blue-400 hover:bg-blue-500/40 transition-colors"
                  >
                    <span className="capitalize">{mode}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {isHeaderModeDropdownOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-32 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
                      {(["ask", "code", "agent"] as ChatMode[]).map((m) => (
                        <button
                          key={m}
                          onClick={() => {
                            setMode(m);
                            setIsHeaderModeDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 transition-colors capitalize"
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded text-gray-400 hover:bg-gray-800 hover:text-blue-400 transition-colors" title="@ for context">
                    <AtSign className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 rounded text-gray-400 hover:bg-gray-800 hover:text-blue-400 transition-colors" title="Web search">
                    <Globe className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSend(headerInput)}
                    className="p-1.5 rounded-full bg-blue-500/40 text-blue-400 hover:bg-blue-500/50 transition-colors"
                    title="Send (Enter)"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Messages Container */}
      {chatState !== "empty" && (
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-3">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8 opacity-60">
                <div className="text-sm font-semibold text-gray-400 mb-2">
                  {currentAgent ? `Start chatting with ${currentAgent.name}` : "Start a conversation"}
                </div>
                <div className="text-xs text-gray-500">
                  Type a message below to get started
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-xl text-sm ${
                        message.role === "user"
                          ? "bg-gray-800 border border-gray-700 text-gray-100"
                          : "bg-transparent text-gray-100"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>
      )}

      {/* Input Area */}
      {chatState !== "empty" && (
        <div className="flex-shrink-0 border-t border-gray-700 p-2">
          <div className="p-1.5 flex flex-col gap-1 bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-md">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              placeholder="Type a message..."
              className="w-full px-1.5 py-2 bg-transparent border-none rounded text-sm text-gray-100 placeholder-gray-400 resize-none outline-none focus:ring-0"
              rows={1}
            />
            <div className="flex items-center justify-between px-1.5 pb-1">
              <div className="relative" ref={modeDropdownRef}>
                <button
                  onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
                  className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/30 rounded-full text-xs font-medium text-blue-400 hover:bg-blue-500/40 transition-colors"
                >
                  <span className="capitalize">{mode}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {isModeDropdownOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-32 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
                    {(["ask", "code", "agent"] as ChatMode[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          setMode(m);
                          setIsModeDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 transition-colors capitalize"
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded text-gray-400 hover:bg-gray-800 hover:text-blue-400 transition-colors" title="@ for context">
                  <AtSign className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded text-gray-400 hover:bg-gray-800 hover:text-blue-400 transition-colors" title="Web search">
                  <Globe className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleSend(input)}
                  className="p-1.5 rounded-full bg-blue-500/40 text-blue-400 hover:bg-blue-500/50 transition-colors"
                  title="Send (Enter)"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
