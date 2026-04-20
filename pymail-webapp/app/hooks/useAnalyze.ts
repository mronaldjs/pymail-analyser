import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { IMAPCredentials, AnalysisResponse } from "@/types/api";
import { resolveApiErrorMessage } from "../resolveApiErrorMessage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useAnalyze() {
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mutation = useMutation({
    mutationFn: async (creds: IMAPCredentials) => {
      setIsLoading(true);
      const response = await axios.post<AnalysisResponse>(
        `${API_BASE_URL}/analyze`,
        creds,
      );
      return response.data;
    },
    onSuccess: (data) => {
      setIsLoading(false);
      setData(data);
    },
    onError: (error: unknown) => {
      setIsLoading(false);
      const message = resolveApiErrorMessage(
        error,
        "Falha ao conectar com o servidor.",
      );
      alert("Falha ao conectar: " + message);
    },
  });

  const analyze = (credentials: IMAPCredentials) => {
    mutation.mutate(credentials);
  };

  const reset = () => {
    setData(null);
    setIsLoading(false);
  };

  return {
    data,
    setData,
    isLoading,
    analyze,
    reset,
  };
}
