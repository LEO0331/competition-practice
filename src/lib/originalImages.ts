import { useSyncExternalStore } from "react";

const storageKey = "competition-practice:show-original-images:v1";
const changeEvent = "original-images-change";
declare global {
  interface Window {
    originalImagesPreference?: { enabled: boolean; storageUnavailable: boolean };
  }
}

function sessionPreference() {
  return window.originalImagesPreference ??= { enabled: false, storageUnavailable: false };
}

function readPreference() {
  const session = sessionPreference();
  if (session.storageUnavailable) return session.enabled;
  try { return window.localStorage.getItem(storageKey) === "true"; }
  catch { return session.enabled; }
}

function subscribe(onChange: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === storageKey || event.key === null) onChange();
  }
  window.addEventListener(changeEvent, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(changeEvent, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function setShowOriginalImages(enabled: boolean) {
  const session = sessionPreference();
  session.enabled = enabled;
  try { window.localStorage.setItem(storageKey, String(enabled)); }
  catch { session.storageUnavailable = true; }
  window.dispatchEvent(new Event(changeEvent));
}

export function useShowOriginalImages() {
  return useSyncExternalStore(subscribe, readPreference, () => false);
}
