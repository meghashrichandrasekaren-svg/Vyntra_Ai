import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Send,
  Bot,
  User,
  Mic,
  Plane,
  Compass,
  Luggage,
  Clock,
  Radio,
} from 'lucide-react';
import { BookingOrder } from '../types/travel.ts';

interface AIAssistantModalProps {
  onClose: () => void;
  trips: BookingOrder[];
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  actionSnippet?: any;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ onClose, trips }) => {
  const latestTrip = trips[0];
  const offer = latestTrip?.flightOffer;
  const firstSeg = offer?.itineraries[0]?.segments[0];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'assistant',
      text: `Hello! I am Okay Vyntra, your intelligent travel copilot. ${
        latestTrip
          ? `I see your upcoming flight ${offer?.flightNumber} to ${firstSeg?.arrival.iataCode} on ${new Date(
              firstSeg?.departure.at || ''
            ).toLocaleDateString()}. How can I assist you with your journey today?`
          : 'How can I assist you with your flight search, travel credentials, or trip schedule today?'
      }`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const samplePrompts = [
    'Okay Vyntra, what is my flight time?',
    'Which gate is my flight from?',
    'Show my upcoming trip.',
    'Take me to Gate 18.',
    'What is my baggage allowance?',
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      const q = text.toLowerCase();

      if (q.includes('flight time') || q.includes('time')) {
        reply = latestTrip
          ? `Your flight ${offer?.flightNumber} departs from ${firstSeg?.departure.iataCode} at ${new Date(
              firstSeg?.departure.at || ''
            ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Boarding commences 45 minutes prior at ${firstSeg?.departure.terminal || 'Terminal 1'}.`
          : 'You do not have an active flight booking yet. You can search flights on the Flight Search tab.';
      } else if (q.includes('gate') || q.includes('gate 18')) {
        reply = `Your flight ${offer?.flightNumber || '6E 521'} is scheduled to board from Gate 18A at Terminal 1. Walking time from Security Checkpoint 3 is approximately 4 minutes.`;
      } else if (q.includes('upcoming trip') || q.includes('my trip')) {
        reply = latestTrip
          ? `You have a confirmed booking (PNR: ${latestTrip.pnr}) on ${offer?.airlineName} flying ${firstSeg?.departure.iataCode} ➔ ${firstSeg?.arrival.iataCode}. Total fare paid: ${latestTrip.payment.currency} ${latestTrip.payment.amount.toLocaleString()}.`
          : 'No upcoming trips found. Search for flights to book your next journey!';
      } else if (q.includes('baggage')) {
        reply = `Your allowance for ${offer?.airlineName || 'this flight'} is: Cabin Baggage up to 7 kg (1 bag + laptop bag) and Checked-in Baggage up to 15 kg per passenger.`;
      } else if (q.includes('aura') || q.includes('ring')) {
        reply =
          'Your AURA Ring is securely synced with your digital PNR credential. You can tap your ring at participating airport fast-track gates. Remember that your physical passport / national ID is still mandatory for statutory identification.';
      } else {
        reply =
          'I can assist you with your flight status, gate notifications, boarding schedules, baggage policies, or airport navigation. What would you like to know?';
      }

      const botMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
      <div className="relative flex h-[620px] w-full max-w-xl flex-col rounded-3xl border border-indigo-500/30 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 p-4 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-500 text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                "Okay Vyntra"
                <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                  AI Travel Assistant
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Contextual flight assistant & airport concierge</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white'
                    : 'border border-slate-800 bg-slate-950/70 text-slate-200'
                }`}
              >
                <p>{m.text}</p>
                <span
                  className={`block mt-1 text-[9px] ${
                    m.sender === 'user' ? 'text-sky-100 text-right' : 'text-slate-500'
                  }`}
                >
                  {m.time}
                </span>
              </div>

              {m.sender === 'user' && (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 pl-9">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping" />
              <span>Okay Vyntra is analyzing your trip data...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="border-t border-slate-800/80 bg-slate-950/40 p-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="whitespace-nowrap rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-slate-300 hover:border-indigo-500/50 hover:text-indigo-300 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="border-t border-slate-800 p-3 bg-slate-950 rounded-b-3xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask 'Okay Vyntra' about flight status, gates, or credentials..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md hover:opacity-90"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
