import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const BACKEND = "http://localhost:3000";

// ─── Storage helpers ───────────────────────────────────────────────
function getHistory(roomId) {
  try {
    return JSON.parse(localStorage.getItem(`dc:${roomId}`) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(roomId, messages) {
  const trimmed = messages.slice(-200);
  localStorage.setItem(`dc:${roomId}`, JSON.stringify(trimmed));
}

// ─── Icons ────────────────────────────────────────────────────────
const SendIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

const BackIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const CopyIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const EnterIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
  </svg>
);

// ─── Landing ──────────────────────────────────────────────────────
function Landing({ onHost, onJoin }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 p-6">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
            <span className="text-zinc-500 text-xs tracking-widest uppercase font-mono">DiscussConnect</span>
          </div>
          <h1 className="text-white text-2xl font-semibold tracking-tight font-mono leading-snug">
            Group chat,<br />with AI in the loop.
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onHost}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-violet-500/50 hover:bg-zinc-800/80 transition-all duration-200 group"
          >
            <span className="text-zinc-500 group-hover:text-violet-400 transition-colors">
              <PlusIcon />
            </span>
            <div className="text-center">
              <p className="text-white text-sm font-medium font-mono">Host</p>
              <p className="text-zinc-500 text-xs mt-0.5 font-mono">Create a room</p>
            </div>
          </button>

          <button
            onClick={onJoin}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-violet-500/50 hover:bg-zinc-800/80 transition-all duration-200 group"
          >
            <span className="text-zinc-500 group-hover:text-violet-400 transition-colors">
              <EnterIcon />
            </span>
            <div className="text-center">
              <p className="text-white text-sm font-medium font-mono">Join</p>
              <p className="text-zinc-500 text-xs mt-0.5 font-mono">Enter with code</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Host ─────────────────────────────────────────────────────────
function HostScreen({ onBack, onCreated }) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const create = async () => {
    if (!username.trim()) return setErr("Enter a username");
    setLoading(true);
    setErr("");
    try {
      const r1 = await fetch(`${BACKEND}/room/create`, { method: "POST" });
      const { roomId } = await r1.json();
      await fetch(`${BACKEND}/room/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, username }),
      });
      onCreated({ roomId, username });
    } catch {
      setErr("Cannot reach backend on :3000");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 p-6">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-white text-xs transition-colors w-fit font-mono"
        >
          <BackIcon /> back
        </button>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col gap-5">
          <div>
            <p className="text-white font-medium text-sm font-mono">Create a room</p>
            <p className="text-zinc-500 text-xs mt-1 font-mono">Share the code with your team.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-zinc-400 text-xs font-mono">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && create()}
              placeholder="e.g. anish"
              className="bg-zinc-950 border border-zinc-800 focus:border-zinc-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-zinc-700 transition-colors w-full font-mono outline-none"
            />
          </div>

          {err && <p className="text-red-400 text-xs font-mono">{err}</p>}

          <button
            onClick={create}
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 active:scale-[0.98] text-white text-sm font-medium py-2.5 rounded-lg transition-all duration-150 font-mono"
          >
            {loading ? "Creating…" : "Create room"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Join ─────────────────────────────────────────────────────────
function JoinScreen({ onBack, onJoined }) {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const join = async () => {
    if (!roomId.trim() || !username.trim()) return setErr("Fill both fields");
    setLoading(true);
    setErr("");
    try {
      const r = await fetch(`${BACKEND}/room/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: roomId.trim(), username }),
      });
      const d = await r.json();
      if (!r.ok) return setErr(d.message || "Could not join");
      onJoined({ roomId: roomId.trim(), username });
    } catch {
      setErr("Cannot reach backend on :3000");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 p-6">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-white text-xs transition-colors w-fit font-mono"
        >
          <BackIcon /> back
        </button>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col gap-5">
          <div>
            <p className="text-white font-medium text-sm font-mono">Join a room</p>
            <p className="text-zinc-500 text-xs mt-1 font-mono">Paste the code the host shared.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-zinc-400 text-xs font-mono">Room code</label>
            <input
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className="bg-zinc-950 border border-zinc-800 focus:border-zinc-600 rounded-lg px-3 py-2.5 text-white text-xs placeholder-zinc-700 transition-colors w-full font-mono outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-zinc-400 text-xs font-mono">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && join()}
              placeholder="e.g. rahul"
              className="bg-zinc-950 border border-zinc-800 focus:border-zinc-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-zinc-700 transition-colors w-full font-mono outline-none"
            />
          </div>

          {err && <p className="text-red-400 text-xs font-mono">{err}</p>}

          <button
            onClick={join}
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 active:scale-[0.98] text-white text-sm font-medium py-2.5 rounded-lg transition-all duration-150 font-mono"
          >
            {loading ? "Joining…" : "Join room"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Chat ─────────────────────────────────────────────────────────
function ChatScreen({ roomId, username, onLeave }) {
  const [messages, setMessages] = useState(() => getHistory(roomId));
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const socket = io(BACKEND);
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join-room", roomId);
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("user-joined", ({ userId }) => {
      setMessages((prev) => {
        const next = [...prev, { type: "system", text: `${userId} joined`, ts: Date.now() }];
        saveHistory(roomId, next);
        return next;
      });
    });

    socket.on("chat", ({ from, text, ts }) => {
      setMessages((prev) => {
        const next = [...prev, { from, text, ts, mine: false }];
        saveHistory(roomId, next);
        return next;
      });
    });

    return () => socket.disconnect();
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !socketRef.current) return;
    const msg = { from: username, text, ts: Date.now(), mine: true };
    socketRef.current.emit("chat", { roomId, message: text, from: username });
    setMessages((prev) => {
      const next = [...prev, msg];
      saveHistory(roomId, next);
      return next;
    });
    setInput("");
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const fmt = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 p-4">
      <div className="w-full max-w-lg h-[580px] bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full transition-colors ${connected ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-white text-sm font-medium font-mono">{username}</span>
            <span className="text-zinc-600 text-xs font-mono">in</span>
            <span className="text-zinc-400 text-xs bg-zinc-800 px-2 py-0.5 rounded font-mono border border-zinc-700">
              {roomId.slice(0, 8)}…
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 text-zinc-500 hover:text-white text-xs px-2.5 py-1.5 rounded border border-zinc-800 hover:border-zinc-600 transition-all font-mono"
            >
              <CopyIcon />
              {copied ? <span className="text-green-400">copied!</span> : "copy code"}
            </button>
            <button
              onClick={onLeave}
              className="text-zinc-500 hover:text-red-400 text-xs px-2.5 py-1.5 rounded border border-zinc-800 hover:border-red-900 transition-all font-mono"
            >
              leave
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <div className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-zinc-600" />
              </div>
              <p className="text-zinc-600 text-xs font-mono">No messages yet</p>
            </div>
          ) : (
            messages.map((m, i) => {
              if (m.type === "system") {
                return (
                  <div key={i} className="text-center text-zinc-600 text-xs py-1 font-mono">
                    {m.text}
                  </div>
                );
              }
              return (
                <div key={i} className={`flex flex-col gap-0.5 animate-[fadeUp_0.15s_ease] ${m.mine ? "items-end" : "items-start"}`}>
                  {!m.mine && (
                    <span className="text-zinc-500 text-xs px-1 font-mono">{m.from}</span>
                  )}
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-xl text-sm break-words font-mono ${
                      m.mine
                        ? "bg-violet-600 text-white rounded-br-sm"
                        : "bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-bl-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-zinc-600 text-[10px] px-1 font-mono">{fmt(m.ts)}</span>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-3 py-3 border-t border-zinc-800 flex gap-2 bg-zinc-950/30 shrink-0">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message…"
            className="flex-1 bg-zinc-800 border border-zinc-700 focus:border-zinc-500 rounded-lg px-3 py-2.5 text-white text-sm placeholder-zinc-600 transition-colors font-mono outline-none"
          />
          <button
            onClick={sendMessage}
            className="bg-violet-600 hover:bg-violet-500 active:scale-95 text-white px-3.5 rounded-lg transition-all duration-150 flex items-center justify-center"
          >
            <SendIcon />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [session, setSession] = useState(null);

  if (screen === "landing")
    return <Landing onHost={() => setScreen("host")} onJoin={() => setScreen("join")} />;

  if (screen === "host")
    return (
      <HostScreen
        onBack={() => setScreen("landing")}
        onCreated={(s) => { setSession(s); setScreen("chat"); }}
      />
    );

  if (screen === "join")
    return (
      <JoinScreen
        onBack={() => setScreen("landing")}
        onJoined={(s) => { setSession(s); setScreen("chat"); }}
      />
    );

  if (screen === "chat")
    return (
      <ChatScreen
        {...session}
        onLeave={() => { setSession(null); setScreen("landing"); }}
      />
    );
}