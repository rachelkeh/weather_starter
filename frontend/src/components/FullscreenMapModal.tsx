import { useEffect } from 'react';
import type { Location } from '../types';
import { CloseIcon, ExpandIcon } from './icons';
import { MapView } from './MapView';

interface FullscreenMapModalProps {
  locations: Location[];
  selectedId: number | null;
  onClose: () => void;
  onSelectLocation: (id: number) => void;
}

export function FullscreenMapModal({
  locations,
  selectedId,
  onClose,
  onSelectLocation,
}: FullscreenMapModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-slate-950/65 p-3 backdrop-blur-2xl sm:p-5">
      <button
        type="button"
        aria-label="Close map overlay"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <section className="relative flex h-full w-full max-w-[96rem] flex-col overflow-hidden rounded-[2rem] border border-white/15 bg-[radial-gradient(circle_at_top,rgba(202,221,255,0.24),transparent_30%),linear-gradient(180deg,rgba(21,34,50,0.92),rgba(8,16,28,0.94))] shadow-[0_30px_80px_rgba(3,8,18,0.45)]">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
              <ExpandIcon className="h-3.5 w-3.5" />
              <span>Fullscreen Weather Map</span>
            </div>
            <h2 className="mt-2 text-2xl font-light text-white/95">All saved locations</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/15"
          >
            <CloseIcon className="h-4 w-4" />
            <span>Close</span>
          </button>
        </header>

        <div className="flex-1 p-3 sm:p-4">
          <MapView
            className="h-full min-h-[24rem] w-full border border-white/10 bg-slate-900/15"
            locations={locations}
            selectedId={selectedId}
            onSelectLocation={onSelectLocation}
          />
        </div>
      </section>
    </div>
  );
}
