export function watchFocusLoss(
  windowEvents: EventTarget,
  documentEvents: EventTarget & { readonly hidden: boolean },
  onFocusLost: () => void,
): () => void {
  const onVisibility = () => {
    if (documentEvents.hidden) onFocusLost();
  };
  windowEvents.addEventListener('blur', onFocusLost);
  documentEvents.addEventListener('visibilitychange', onVisibility);
  if (documentEvents.hidden) onFocusLost();
  return () => {
    windowEvents.removeEventListener('blur', onFocusLost);
    documentEvents.removeEventListener('visibilitychange', onVisibility);
  };
}
