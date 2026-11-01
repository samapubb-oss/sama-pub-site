"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AtSign,
  Image as ImageIcon,
  Plus,
  Sparkles,
  Upload,
  Video,
} from "lucide-react";

export interface PromptMediaOption {
  tag: string;
  label: string;
  fileName: string;
  previewUrl: string;
  kind: "image" | "video";
  durationSec?: number;
}

interface PromptMentionInputProps {
  value: string;
  onChange: (nextValue: string) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  maxLength: number;
  availableImages: PromptMediaOption[];
  availableVideos: PromptMediaOption[];
  canImportMoreImages: boolean;
  nextImageTag: string;
  canImportMoreVideos: boolean;
  nextVideoTag: string;
  onImportImageForMention: (files: File[]) => Promise<string[]>;
  onImportVideoForMention: (files: File[]) => Promise<string[]>;
  textareaRef?: React.MutableRefObject<HTMLTextAreaElement | null>;
}

type MentionMenuActionItem =
  | {
      type: "media";
      key: string;
      option: PromptMediaOption;
    }
  | {
      type: "import-image";
      key: "import-image";
      nextTag: string;
    }
  | {
      type: "import-video";
      key: "import-video";
      nextTag: string;
    };

interface ActiveMentionTrigger {
  start: number;
  end: number;
  query: string;
}

const MIN_EDITOR_HEIGHT = 100;
const MAX_EDITOR_HEIGHT = 380;

/**
 * Métriques typographiques strictement identiques entre le calque de coloration
 * et le <textarea> natif superposé pour garantir zéro décalage du curseur,
 * même sur de très longs prompts multi-paragraphes.
 * Taille 14px pour éviter tout auto-zoom intempestif sur Safari iOS.
 */
const SHARED_TEXT_METRICS: React.CSSProperties = {
  fontFamily: "inherit",
  fontSize: "14px",
  lineHeight: "22px",
  fontWeight: 500,
  letterSpacing: "0px",
  wordSpacing: "0px",
  fontVariantLigatures: "none",
  padding: "12px",
  margin: 0,
  border: "none",
  boxSizing: "border-box",
  whiteSpace: "pre-wrap",
  overflowWrap: "break-word",
  wordBreak: "break-word",
  tabSize: 4,
};

function isDelimiterChar(ch: string | undefined): boolean {
  if (!ch) return true;
  return /[\s([{"',.;:!?/\\-]/.test(ch);
}

/**
 * Détecte si le curseur se trouve juste après un `@` ou `@...` en cours de saisie.
 */
function detectMentionTrigger(
  text: string,
  caretPos: number
): ActiveMentionTrigger | null {
  if (caretPos < 0 || caretPos > text.length) return null;
  const before = text.slice(0, caretPos);
  const match = before.match(/(@[a-zA-Z0-9_]*)$/);
  if (!match) return null;

  const token = match[1];
  const start = caretPos - token.length;
  const prevChar = start > 0 ? text[start - 1] : undefined;

  // Évite de déclencher le menu sur une adresse e-mail (ex: contact@entreprise.sn)
  if (!isDelimiterChar(prevChar)) return null;

  return {
    start,
    end: caretPos,
    query: token.slice(1).toLowerCase(),
  };
}

/**
 * Découpe un prompt pour afficher les mentions @image_X et @video_X en couleur
 * dans les cartes de la galerie (lecture seule).
 */
export function renderFormattedPromptText(text: string): React.ReactNode {
  if (!text) return null;
  const parts: React.ReactNode[] = [];
  const regex = /@(?:image_(?:10|[1-9])|video_[1-5])\b/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const idx = match.index;
    const prev = idx > 0 ? text[idx - 1] : undefined;
    if (!isDelimiterChar(prev)) {
      continue;
    }

    if (idx > lastIndex) {
      parts.push(text.slice(lastIndex, idx));
    }

    const token = match[0];
    const isVideo = token.toLowerCase().startsWith("@video_");
    parts.push(
      <span
        key={`${idx}-${token}`}
        className={
          isVideo
            ? "inline-block px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-700 font-bold"
            : "inline-block px-1.5 py-0.2 rounded bg-[#FF6B00]/15 text-[#EA580C] font-bold"
        }
      >
        {token}
      </span>
    );
    lastIndex = idx + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export const PromptMentionInput: React.FC<PromptMentionInputProps> = ({
  value,
  onChange,
  disabled = false,
  required = false,
  placeholder,
  maxLength,
  availableImages,
  availableVideos,
  canImportMoreImages,
  nextImageTag,
  canImportMoreVideos,
  nextVideoTag,
  onImportImageForMention,
  onImportVideoForMention,
  textareaRef: externalTextareaRef,
}) => {
  const internalTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const textareaRef = externalTextareaRef || internalTextareaRef;
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const quickImagePickerRef = useRef<HTMLInputElement | null>(null);
  const quickVideoPickerRef = useRef<HTMLInputElement | null>(null);

  // Stocke la position `@...` à remplacer quand l'utilisateur choisit "+ Importer une image/vidéo"
  const pendingReplaceRangeRef = useRef<{ start: number; end: number } | null>(
    null
  );

  const [trigger, setTrigger] = useState<ActiveMentionTrigger | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [editorHeight, setEditorHeight] = useState<number>(MIN_EDITOR_HEIGHT);
  const [isScrollable, setIsScrollable] = useState(false);

  const uploadedImageTagSet = useMemo(
    () => new Set(availableImages.map((img) => img.tag.toLowerCase())),
    [availableImages]
  );
  const uploadedVideoTagSet = useMemo(
    () => new Set(availableVideos.map((vid) => vid.tag.toLowerCase())),
    [availableVideos]
  );

  // Ajustement dynamique de la hauteur pour accueillir de longs prompts sans limite artificielle à 2500 caractères
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const measured = Math.max(MIN_EDITOR_HEIGHT, el.scrollHeight);
    const clamped = Math.min(MAX_EDITOR_HEIGHT, measured);
    setEditorHeight(clamped);
    setIsScrollable(measured > MAX_EDITOR_HEIGHT);
    el.style.height = `${clamped}px`;
    if (backdropRef.current) {
      backdropRef.current.scrollTop = el.scrollTop;
    }
  }, [value, textareaRef]);

  // Fermer le menu `@` au clic extérieur
  useEffect(() => {
    if (!trigger) return;
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setTrigger(null);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [trigger]);

  // Liste des suggestions filtrées dans le menu `@`
  const menuItems = useMemo<MentionMenuActionItem[]>(() => {
    if (!trigger) return [];
    const q = trigger.query;
    const items: MentionMenuActionItem[] = [];

    for (const img of availableImages) {
      const cleanTag = img.tag.slice(1).toLowerCase(); // ex: image_1
      const numOnly = cleanTag.replace("image_", "");
      if (
        !q ||
        cleanTag.includes(q) ||
        numOnly === q ||
        img.fileName.toLowerCase().includes(q)
      ) {
        items.push({
          type: "media",
          key: `img-${img.tag}`,
          option: img,
        });
      }
    }

    for (const vid of availableVideos) {
      const cleanTag = vid.tag.slice(1).toLowerCase(); // ex: video_1
      const numOnly = cleanTag.replace("video_", "");
      if (
        !q ||
        cleanTag.includes(q) ||
        numOnly === q ||
        vid.fileName.toLowerCase().includes(q)
      ) {
        items.push({
          type: "media",
          key: `vid-${vid.tag}`,
          option: vid,
        });
      }
    }

    if (canImportMoreImages && (!q || "image".includes(q) || nextImageTag.slice(1).includes(q))) {
      items.push({
        type: "import-image",
        key: "import-image",
        nextTag: nextImageTag,
      });
    }

    if (canImportMoreVideos && (!q || "video".includes(q) || nextVideoTag.slice(1).includes(q))) {
      items.push({
        type: "import-video",
        key: "import-video",
        nextTag: nextVideoTag,
      });
    }

    return items;
  }, [
    trigger,
    availableImages,
    availableVideos,
    canImportMoreImages,
    nextImageTag,
    canImportMoreVideos,
    nextVideoTag,
  ]);

  useEffect(() => {
    setActiveIndex(0);
  }, [trigger?.query, menuItems.length]);

  const replaceRangeWithTags = useCallback(
    (range: { start: number; end: number }, tags: string[]) => {
      if (tags.length === 0) return;
      const inserted = tags.join(" ");
      const before = value.slice(0, range.start);
      const after = value.slice(range.end);
      const needsTrailingSpace = after.length === 0 || !after.startsWith(" ");
      const insertionWithSpace = needsTrailingSpace ? `${inserted} ` : inserted;
      const nextVal = `${before}${insertionWithSpace}${after}`;
      const nextCaret = before.length + insertionWithSpace.length;

      onChange(nextVal);
      setTrigger(null);

      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (el) {
          el.focus();
          el.setSelectionRange(nextCaret, nextCaret);
        }
      });
    },
    [onChange, textareaRef, value]
  );

  const handleSelectMenuItem = useCallback(
    (item: MentionMenuActionItem) => {
      if (!trigger) return;

      if (item.type === "media") {
        replaceRangeWithTags(
          { start: trigger.start, end: trigger.end },
          [item.option.tag]
        );
        return;
      }

      if (item.type === "import-image") {
        pendingReplaceRangeRef.current = {
          start: trigger.start,
          end: trigger.end,
        };
        setTrigger(null);
        quickImagePickerRef.current?.click();
        return;
      }

      if (item.type === "import-video") {
        pendingReplaceRangeRef.current = {
          start: trigger.start,
          end: trigger.end,
        };
        setTrigger(null);
        quickVideoPickerRef.current?.click();
      }
    },
    [replaceRangeWithTags, trigger]
  );

  const handleQuickImagePicked = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const pickedFiles = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = "";
    if (pickedFiles.length === 0) {
      pendingReplaceRangeRef.current = null;
      return;
    }
    const savedRange = pendingReplaceRangeRef.current;
    pendingReplaceRangeRef.current = null;

    const assignedTags = await onImportImageForMention(pickedFiles);

    if (assignedTags.length > 0 && savedRange) {
      replaceRangeWithTags(savedRange, assignedTags);
    }
  };

  const handleQuickVideoPicked = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const pickedFiles = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = "";
    if (pickedFiles.length === 0) {
      pendingReplaceRangeRef.current = null;
      return;
    }
    const savedRange = pendingReplaceRangeRef.current;
    pendingReplaceRangeRef.current = null;

    const assignedTags = await onImportVideoForMention(pickedFiles);

    if (assignedTags.length > 0 && savedRange) {
      replaceRangeWithTags(savedRange, assignedTags);
    }
  };

  const handleOpenAtMenuFromButton = () => {
    if (disabled) return;
    const el = textareaRef.current;
    if (!el) return;

    const caret = el.selectionStart ?? value.length;
    const before = value.slice(0, caret);
    const after = value.slice(caret);

    // Si le curseur est déjà juste après un `@`, on ouvre simplement le menu
    const existing = detectMentionTrigger(value, caret);
    if (existing) {
      setTrigger(existing);
      el.focus();
      return;
    }

    const prefixSpace =
      before.length > 0 && !isDelimiterChar(before[before.length - 1])
        ? " @"
        : "@";
    const nextValue = `${before}${prefixSpace}${after}`;
    const nextCaret = before.length + prefixSpace.length;

    onChange(nextValue);
    setTrigger({
      start: nextCaret - 1,
      end: nextCaret,
      query: "",
    });

    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(nextCaret, nextCaret);
    });
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextText = e.target.value;
    const caret = e.target.selectionStart ?? nextText.length;
    onChange(nextText);
    setTrigger(detectMentionTrigger(nextText, caret));
  };

  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (!trigger || menuItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % menuItems.length);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + menuItems.length) % menuItems.length);
      return;
    }

    if (e.key === "Enter" || e.key === "Tab") {
      const target = menuItems[activeIndex] || menuItems[0];
      if (target) {
        e.preventDefault();
        handleSelectMenuItem(target);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setTrigger(null);
    }
  };

  // Rendu du calque de coloration synchronisé (aucune altération de largeur des glyphes)
  const highlightedBackdropContent = useMemo(() => {
    if (!value) return null;

    const nodes: React.ReactNode[] = [];
    const tokenRegex = /@[a-zA-Z0-9_]*/g;
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(value)) !== null) {
      const idx = match.index;
      const prevChar = idx > 0 ? value[idx - 1] : undefined;

      if (!isDelimiterChar(prevChar)) {
        continue;
      }

      if (idx > lastIdx) {
        nodes.push(value.slice(lastIdx, idx));
      }

      const rawToken = match[0];
      const lower = rawToken.toLowerCase();
      const isImageRef = /^@image_(?:10|[1-9])$/.test(lower);
      const isVideoRef = /^@video_[1-5]$/.test(lower);

      let markStyle: React.CSSProperties;
      if (isImageRef) {
        const isLinked = uploadedImageTagSet.has(lower);
        markStyle = isLinked
          ? {
              backgroundColor: "rgba(255, 107, 0, 0.17)",
              color: "#EA580C",
              borderRadius: "4px",
              boxShadow: "0 0 0 2px rgba(255, 107, 0, 0.14)",
            }
          : {
              backgroundColor: "rgba(14, 165, 233, 0.16)",
              color: "#0284C7",
              borderRadius: "4px",
              boxShadow: "0 0 0 2px rgba(14, 165, 233, 0.14)",
            };
      } else if (isVideoRef) {
        const isLinked = uploadedVideoTagSet.has(lower);
        markStyle = isLinked
          ? {
              backgroundColor: "rgba(16, 185, 129, 0.17)",
              color: "#059669",
              borderRadius: "4px",
              boxShadow: "0 0 0 2px rgba(16, 185, 129, 0.14)",
            }
          : {
              backgroundColor: "rgba(14, 165, 233, 0.16)",
              color: "#0284C7",
              borderRadius: "4px",
              boxShadow: "0 0 0 2px rgba(14, 165, 233, 0.14)",
            };
      } else {
        // Jeton `@` en cours de frappe
        markStyle = {
          backgroundColor: "rgba(255, 107, 0, 0.13)",
          color: "#FF6B00",
          borderRadius: "4px",
          boxShadow: "0 0 0 1px rgba(255, 107, 0, 0.12)",
        };
      }

      nodes.push(
        <mark key={`${idx}-${rawToken}`} style={markStyle}>
          {rawToken}
        </mark>
      );

      lastIdx = idx + rawToken.length;
    }

    if (lastIdx < value.length) {
      nodes.push(value.slice(lastIdx));
    }

    // Assure un alignement exact de hauteur si le prompt se termine par un retour à la ligne
    if (value.endsWith("\n")) {
      nodes.push("\u200b");
    }

    return nodes;
  }, [value, uploadedImageTagSet, uploadedVideoTagSet]);

  // Détecte les balises @image_X / @video_X présentes dans le prompt pour afficher des pastilles visuelles sous le champ
  const referencedTagsInPrompt = useMemo(() => {
    const foundImages = new Set<string>();
    const foundVideos = new Set<string>();
    const regex = /@(image_(?:10|[1-9])|video_[1-5])\b/gi;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(value)) !== null) {
      const idx = m.index;
      const prev = idx > 0 ? value[idx - 1] : undefined;
      if (!isDelimiterChar(prev)) continue;
      const normalized = `@${m[1].toLowerCase()}`;
      if (normalized.startsWith("@image_")) {
        foundImages.add(normalized);
      } else {
        foundVideos.add(normalized);
      }
    }
    return {
      imageTags: Array.from(foundImages),
      videoTags: Array.from(foundVideos),
    };
  }, [value]);

  return (
    <div ref={containerRef} className="relative space-y-2">
      {/* Inputs cachés pour l'import direct depuis le menu `@` */}
      <input
        ref={quickImagePickerRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleQuickImagePicked}
        className="hidden"
      />
      <input
        ref={quickVideoPickerRef}
        type="file"
        multiple
        accept="video/mp4"
        onChange={handleQuickVideoPicked}
        className="hidden"
      />

      {/* En-tête du champ Prompt + bouton rapide `@ Média` + compteur souple */}
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor="video-prompt"
          className="text-xs font-bold text-slate-700 flex items-center gap-1"
        >
          <span>Prompt de la scène</span>
          {required ? (
            <span className="text-sama-orange font-bold">*</span>
          ) : (
            <span className="text-[10px] font-normal text-slate-400 hidden sm:inline">
              (optionnel)
            </span>
          )}
        </label>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={handleOpenAtMenuFromButton}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#FFF7ED] hover:bg-orange-100/80 text-[#EA580C] border border-orange-200/80 text-[10px] sm:text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
            title="Tapez @ ou cliquez ici pour référencer ou importer une image/vidéo"
          >
            <AtSign className="w-3 h-3 text-sama-orange" />
            <span>@ Média</span>
          </button>

          <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
            {value.length > 20000
              ? `${value.length.toLocaleString("fr-FR")} / ${maxLength.toLocaleString("fr-FR")}`
              : `${value.length} car.`}
          </span>
        </div>
      </div>

      {/* Menu contextuel flottant `@` style Higgsfield */}
      {trigger && menuItems.length > 0 && (
        <div className="z-40 rounded-2xl bg-slate-900 text-white border border-slate-700/80 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <AtSign className="w-3.5 h-3.5 text-sama-orange" />
              <span>Choisir ou importer une référence</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              ↑↓ · Entrée · Échap
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
            {menuItems.map((item, idx) => {
              const isSelected = idx === activeIndex;

              if (item.type === "media") {
                const { option } = item;
                const isVid = option.kind === "video";
                return (
                  <button
                    key={item.key}
                    type="button"
                    onMouseEnter={() => setActiveIndex(idx)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectMenuItem(item);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-white/15 text-white ring-1 ring-sama-orange/50"
                        : "hover:bg-white/10 text-slate-200"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-800 border border-white/15 shrink-0">
                      {isVid ? (
                        <video
                          src={option.previewUrl}
                          muted
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={option.previewUrl}
                          alt={option.tag}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold ${
                            isVid
                              ? "bg-emerald-500/25 text-emerald-300"
                              : "bg-[#FF6B00]/25 text-orange-300"
                          }`}
                        >
                          {option.tag}
                        </span>
                        <span className="text-xs font-semibold truncate">
                          {option.label}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {option.fileName}
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-sama-orange shrink-0">
                      Insérer ↵
                    </span>
                  </button>
                );
              }

              if (item.type === "import-image") {
                return (
                  <button
                    key={item.key}
                    type="button"
                    onMouseEnter={() => setActiveIndex(idx)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectMenuItem(item);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#FF6B00]/25 text-white ring-1 ring-sama-orange/60"
                        : "hover:bg-white/10 text-slate-200"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#FF6B00]/20 border border-[#FF6B00]/40 flex items-center justify-center shrink-0">
                      <Upload className="w-4 h-4 text-sama-orange" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">
                          Importer une image
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-[#FF6B00]/30 text-orange-200 text-[10px] font-mono font-bold">
                          {item.nextTag}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Sélectionner une photo et remplir {item.nextTag}{" "}
                        automatiquement
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-sama-orange shrink-0" />
                  </button>
                );
              }

              return (
                <button
                  key={item.key}
                  type="button"
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectMenuItem(item);
                  }}
                  className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-emerald-500/25 text-white ring-1 ring-emerald-400/50"
                      : "hover:bg-white/10 text-slate-200"
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <Video className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">
                        Importer une vidéo MP4
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-200 text-[10px] font-mono font-bold">
                        {item.nextTag}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Sélectionner un MP4 et remplir {item.nextTag}{" "}
                      automatiquement
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-emerald-400 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Zone de saisie superposée : Calque de coloration @ + Textarea natif */}
      <div className="relative rounded-xl border border-slate-200 bg-slate-50/60 focus-within:bg-white focus-within:border-sama-orange focus-within:ring-2 focus-within:ring-sama-orange/20 transition-all overflow-hidden">
        {/* Calque 1 : Coloration en direct des @image_X et @video_X */}
        <div
          ref={backdropRef}
          aria-hidden="true"
          style={{
            ...SHARED_TEXT_METRICS,
            height: `${editorHeight}px`,
            overflowY: isScrollable ? "scroll" : "hidden",
          }}
          className="pointer-events-none select-none w-full text-slate-900"
        >
          {highlightedBackdropContent}
        </div>

        {/* Calque 2 : Textarea natif (curseur, sélection, copier-coller long, raccourcis clavier) */}
        <textarea
          ref={textareaRef}
          id="video-prompt"
          maxLength={maxLength}
          value={value}
          disabled={disabled}
          onChange={handleTextareaChange}
          onKeyDown={handleTextareaKeyDown}
          onClick={(e) => {
            const caret = e.currentTarget.selectionStart ?? 0;
            const detected = detectMentionTrigger(e.currentTarget.value, caret);
            if (!detected && trigger) {
              setTrigger(null);
            }
          }}
          onScroll={(e) => {
            if (backdropRef.current) {
              backdropRef.current.scrollTop = e.currentTarget.scrollTop;
              backdropRef.current.scrollLeft = e.currentTarget.scrollLeft;
            }
          }}
          placeholder={placeholder}
          style={{
            ...SHARED_TEXT_METRICS,
            height: `${editorHeight}px`,
            overflowY: isScrollable ? "scroll" : "hidden",
          }}
          className={`absolute inset-0 z-10 w-full bg-transparent resize-none focus:outline-none placeholder:text-slate-400 selection:bg-sama-orange/20 ${
            value.length > 0
              ? "text-transparent caret-slate-900"
              : "text-slate-900"
          }`}
        />
      </div>

      {/* Pastilles visuelles sous le prompt : aperçu des références utilisées ou bouton pour remplir une référence manquante */}
      {(referencedTagsInPrompt.imageTags.length > 0 ||
        referencedTagsInPrompt.videoTags.length > 0) && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {referencedTagsInPrompt.imageTags.map((tag) => {
            const matched = availableImages.find(
              (img) => img.tag.toLowerCase() === tag
            );
            if (matched) {
              return (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-full bg-[#FFF7ED] border border-orange-200 text-[11px] font-bold text-[#EA580C]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={matched.previewUrl}
                    alt={matched.tag}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                  <span className="font-mono">{matched.tag}</span>
                </span>
              );
            }

            return (
              <button
                key={tag}
                type="button"
                disabled={disabled || !canImportMoreImages}
                onClick={() => {
                  pendingReplaceRangeRef.current = null;
                  quickImagePickerRef.current?.click();
                }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-50 hover:bg-sky-100 border border-sky-200 text-[11px] font-bold text-sky-700 transition-colors cursor-pointer"
                title="Cliquez pour importer l'image correspondant à cette référence"
              >
                <ImageIcon className="w-3 h-3" />
                <span className="font-mono">{tag}</span>
                <span className="text-[10px] underline">
                  · choisir l&apos;image
                </span>
              </button>
            );
          })}

          {referencedTagsInPrompt.videoTags.map((tag) => {
            const matched = availableVideos.find(
              (vid) => vid.tag.toLowerCase() === tag
            );
            if (matched) {
              return (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700"
                >
                  <Video className="w-3 h-3" />
                  <span className="font-mono">{matched.tag}</span>
                </span>
              );
            }

            return (
              <button
                key={tag}
                type="button"
                disabled={disabled || !canImportMoreVideos}
                onClick={() => {
                  pendingReplaceRangeRef.current = null;
                  quickVideoPickerRef.current?.click();
                }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-50 hover:bg-sky-100 border border-sky-200 text-[11px] font-bold text-sky-700 transition-colors cursor-pointer"
                title="Cliquez pour importer la vidéo MP4 correspondant à cette référence"
              >
                <Video className="w-3 h-3" />
                <span className="font-mono">{tag}</span>
                <span className="text-[10px] underline">
                  · choisir la vidéo
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 border border-slate-200/70 px-2.5 py-1 rounded-xl w-fit">
        <Sparkles className="w-3 h-3 text-sama-orange shrink-0" />
        <span>
          Astuce : tapez <strong className="text-sama-orange font-mono font-bold">@</strong> pour lier une image ou vidéo
        </span>
      </div>
    </div>
  );
};
