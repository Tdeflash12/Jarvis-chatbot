import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Sliders, Info, Bookmark } from 'lucide-react';
import { SYSTEM_PRESETS } from '../utils/constants';
import { SystemPreset } from '../types/chat';

interface SystemPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPrompt: string;
  onSavePrompt: (prompt: string, saveAsDefault: boolean) => void;
}

export const SystemPromptModal: React.FC<SystemPromptModalProps> = ({
  isOpen,
  onClose,
  currentPrompt,
  onSavePrompt,
}) => {
  const [promptValue, setPromptValue] = useState(currentPrompt);
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  useEffect(() => {
    setPromptValue(currentPrompt);
    const matched = SYSTEM_PRESETS.find((p) => p.prompt === currentPrompt);
    setSelectedPresetId(matched ? matched.id : null);
  }, [currentPrompt, isOpen]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: SystemPreset) => {
    setSelectedPresetId(preset.id);
    setPromptValue(preset.prompt);
  };

  const handleSave = () => {
    onSavePrompt(promptValue.trim(), saveAsDefault);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Assistant Persona & System Instructions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Guide the style, domain expertise, and reasoning depth of Gemini.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Presets List */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
            Select Pre-Configured Persona
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {SYSTEM_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`flex flex-col text-left p-3 rounded-xl border text-xs transition-all ${
                  selectedPresetId === preset.id
                    ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/40 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between font-semibold mb-0.5">
                  <span>{preset.name}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                    {preset.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  {preset.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Instructions Textarea */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Active System Instructions
          </label>
          <textarea
            value={promptValue}
            onChange={(e) => {
              setPromptValue(e.target.value);
              setSelectedPresetId(null);
            }}
            rows={4}
            placeholder="Provide custom directives (e.g., 'Always provide TypeScript code with strict types', 'Answer in bullet points')..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-xs leading-relaxed text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
          />
        </div>

        {/* Options */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="saveAsDefault"
            checked={saveAsDefault}
            onChange={(e) => setSaveAsDefault(e.target.checked)}
            className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
          />
          <label
            htmlFor="saveAsDefault"
            className="text-xs text-slate-600 dark:text-slate-400 select-none cursor-pointer"
          >
            Apply as default system instruction for all new chats
          </label>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
          >
            Save Persona
          </button>
        </div>
      </div>
    </div>
  );
};
