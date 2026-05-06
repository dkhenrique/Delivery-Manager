"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { uploadPhotoAction, type UploadPhotoState } from "../actions";
import { Camera, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-blue-600"
    >
      {pending ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Enviando…
        </>
      ) : (
        <>
          <Camera className="h-3.5 w-3.5" />
          Enviar
        </>
      )}
    </button>
  );
}

export function PhotoUploadButton({ packageId }: { packageId: string }) {
  const [state, formAction] = useActionState<UploadPhotoState, FormData>(
    uploadPhotoAction,
    { success: false },
  );
  const [fileName, setFileName] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setClientError(null);
    const file = e.target.files?.[0];

    if (!file) {
      setFileName(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setClientError("Formato inválido. Use JPG, PNG ou WEBP.");
      setFileName(null);
      e.target.value = "";
      return;
    }

    if (file.size > MAX_SIZE) {
      setClientError("Arquivo muito grande. O tamanho máximo é 5MB.");
      setFileName(null);
      e.target.value = "";
      return;
    }

    setFileName(file.name);
  }

  function handleClear() {
    setFileName(null);
    setClientError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // Mensagem de sucesso
  if (state.success) {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400">
        <CheckCircle2 className="h-3.5 w-3.5" />
        {state.message}
      </div>
    );
  }

  const errorMessage = clientError || (state.message && !state.success ? state.message : null);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="packageId" value={packageId} />

      <div className="flex items-center gap-2">
        <label
          htmlFor={`photo-${packageId}`}
          className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <Camera className="h-3.5 w-3.5" />
          {fileName ? "Trocar" : "Selecionar foto"}
        </label>
        <input
          ref={fileInputRef}
          id={`photo-${packageId}`}
          type="file"
          name="photo"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="sr-only"
          aria-describedby={`photo-help-${packageId}`}
        />

        {fileName && (
          <>
            <span className="text-xs text-muted-foreground truncate max-w-32">
              {fileName}
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center justify-center h-5 w-5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Remover arquivo selecionado"
            >
              <X className="h-3 w-3" />
            </button>
            <SubmitButton />
          </>
        )}
      </div>

      <p id={`photo-help-${packageId}`} className="sr-only">
        Formatos aceitos: JPG, PNG, WEBP. Tamanho máximo: 5MB.
      </p>

      {errorMessage && (
        <div className="inline-flex items-center gap-1.5 text-xs text-red-700 dark:text-red-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {errorMessage}
        </div>
      )}
    </form>
  );
}
