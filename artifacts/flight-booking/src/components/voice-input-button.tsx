import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  title?: string;
  lang?: string;
}

type RecognitionState = "idle" | "starting" | "recording" | "error";

// Proper type declarations for Web Speech API
interface ISpeechRecognitionResult {
  readonly length: number;
  item(index: number): { transcript: string; confidence: number };
  [index: number]: { transcript: string; confidence: number };
}

interface ISpeechRecognitionResultList {
  readonly length: number;
  item(index: number): ISpeechRecognitionResult;
  [index: number]: ISpeechRecognitionResult;
}

interface ISpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: ISpeechRecognitionResultList;
}

interface ISpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

function getSpeechRecognitionClass(): (new () => ISpeechRecognition) | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function VoiceInputButton({ onTranscript, className, title, lang }: VoiceInputButtonProps) {
  const [state, setState] = useState<RecognitionState>("idle");
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsSupported(!!getSpeechRecognitionClass());
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  function startRecording() {
    const SR = getSpeechRecognitionClass();
    if (!SR) return;

    try {
      const recognition = new SR();
      recognition.lang = lang || "ar-EG";
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setState("recording");
      };

      recognition.onresult = (event: ISpeechRecognitionEvent) => {
        const parts: string[] = [];
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result && result[0]) {
            parts.push(result[0].transcript);
          }
        }
        const transcript = parts.join(" ").trim();
        if (transcript) onTranscript(transcript);
      };

      recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
        setState("error");
        const err = event.error;
        if (err === "not-allowed" || err === "permission-denied") {
          toast({
            title: "الميكروفون محظور",
            description: "اسمح بالوصول للميكروفون من إعدادات المتصفح ثم أعد المحاولة.",
            variant: "destructive",
          });
        } else if (err === "no-speech") {
          toast({ title: "لم يُكتشف صوت", description: "حاول مرة أخرى وتكلم بوضوح." });
        } else if (err === "network") {
          toast({
            title: "خطأ في الشبكة",
            description: "التعرف على الصوت يتطلب اتصالاً بالإنترنت.",
            variant: "destructive",
          });
        } else if (err === "audio-capture") {
          toast({
            title: "لا يوجد ميكروفون",
            description: "تأكد من توصيل الميكروفون بجهازك.",
            variant: "destructive",
          });
        } else {
          toast({ title: "خطأ في التعرف على الصوت", description: err, variant: "destructive" });
        }
        setTimeout(() => setState("idle"), 1500);
      };

      recognition.onend = () => {
        setState((prev) => (prev === "recording" ? "idle" : prev));
      };

      recognitionRef.current = recognition;
      setState("starting");
      recognition.start();
    } catch (err) {
      setState("idle");
      toast({
        title: "تعذر تشغيل الميكروفون",
        description: String(err),
        variant: "destructive",
      });
    }
  }

  function stopRecording() {
    recognitionRef.current?.stop();
    setState("idle");
  }

  if (!isSupported) return null;

  const isRecording = state === "recording";
  const isStarting = state === "starting";
  const isError = state === "error";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "h-7 w-7 flex-shrink-0 transition-colors",
        isRecording && "text-destructive hover:text-destructive animate-pulse",
        isStarting && "text-amber-500 animate-pulse",
        isError && "text-destructive",
        !isRecording && !isStarting && !isError && "text-muted-foreground hover:text-foreground",
        className
      )}
      onClick={isRecording ? stopRecording : isStarting ? undefined : startRecording}
      title={title ?? (isRecording ? "إيقاف التسجيل" : isStarting ? "جارٍ التحضير…" : "إدخال صوتي")}
      disabled={isStarting}
    >
      {isRecording ? (
        <Square className="h-3.5 w-3.5 fill-current" />
      ) : isError ? (
        <MicOff className="h-3.5 w-3.5" />
      ) : (
        <Mic className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}
