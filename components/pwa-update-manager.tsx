"use client";

import { useEffect } from "react";

const VERSION_STORAGE_KEY = "mme:pwa-version";
const VERSION_RELOAD_KEY = "mme:pwa-reloaded-version";
const UPDATE_CHECK_INTERVAL_MS = 5 * 60 * 1000;
const UPDATE_CHECK_THROTTLE_MS = 30 * 1000;

type AppVersionResponse = {
  version?: string;
};

export function PwaUpdateManager() {
  useEffect(() => {
    if (!canUseServiceWorker()) {
      return;
    }

    let disposed = false;
    let lastUpdateCheckAt = 0;
    let reloadTriggered = false;
    let hadController = Boolean(navigator.serviceWorker.controller);

    const registrationPromise = registerServiceWorker();

    async function checkForUpdates() {
      if (disposed) {
        return;
      }

      const now = Date.now();
      if (now - lastUpdateCheckAt < UPDATE_CHECK_THROTTLE_MS) {
        return;
      }

      lastUpdateCheckAt = now;

      const registration = await registrationPromise;
      await registration?.update().catch(() => undefined);
      await checkAppVersion();
    }

    function handleControllerChange() {
      if (!hadController) {
        hadController = true;
        return;
      }

      reloadOnce();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void checkForUpdates();
      }
    }

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange,
    );
    window.addEventListener("focus", checkForUpdates);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    void checkForUpdates();

    const intervalId = window.setInterval(
      checkForUpdates,
      UPDATE_CHECK_INTERVAL_MS,
    );

    return () => {
      disposed = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", checkForUpdates);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange,
      );
    };

    async function registerServiceWorker() {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });

        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }

        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;

          if (!worker) {
            return;
          }

          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              worker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });

        return registration;
      } catch {
        return null;
      }
    }

    async function checkAppVersion() {
      try {
        const response = await fetch("/api/app-version", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (!response.ok) {
          return;
        }

        const { version } = (await response.json()) as AppVersionResponse;

        if (!version || version === "local") {
          return;
        }

        const previousVersion = readStorage(window.localStorage, VERSION_STORAGE_KEY);
        writeStorage(window.localStorage, VERSION_STORAGE_KEY, version);

        if (!previousVersion || previousVersion === version) {
          return;
        }

        const reloadedVersion = readStorage(
          window.sessionStorage,
          VERSION_RELOAD_KEY,
        );

        if (reloadedVersion === version) {
          return;
        }

        writeStorage(window.sessionStorage, VERSION_RELOAD_KEY, version);
        reloadOnce();
      } catch {
        // Ignore update checks when the device is offline or storage is blocked.
      }
    }

    function reloadOnce() {
      if (reloadTriggered) {
        return;
      }

      reloadTriggered = true;
      window.location.reload();
    }
  }, []);

  return null;
}

function canUseServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return false;
  }

  return (
    window.location.protocol === "https:" ||
    window.location.hostname === "localhost"
  );
}

function readStorage(storage: Storage, key: string) {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(storage: Storage, key: string, value: string) {
  try {
    storage.setItem(key, value);
  } catch {
    // Storage can be unavailable in private browsing modes.
  }
}
