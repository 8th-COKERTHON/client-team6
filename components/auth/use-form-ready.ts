"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

export function useFormReady() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isReady, setIsReady] = useState(false);

  const syncFormReady = useCallback((event?: FormEvent<HTMLFormElement>) => {
    const form = event?.currentTarget ?? formRef.current;

    setIsReady(Boolean(form?.checkValidity()));
  }, []);

  useEffect(() => {
    syncFormReady();
  }, [syncFormReady]);

  return {
    formRef,
    isReady,
    syncFormReady,
  };
}
