import type { Location } from '../types';
import { ExpandIcon, LocationIcon } from './icons';
import { MapView } from './MapView';

interface MapCardProps {
  locations: Location[];
  selectedId: number | null;
  onExpand: () => void;
  onSelectLocation: (id: number) => void;
}

export function MapCard({ locations, selectedId, onExpand, onSelectLocation }: MapCardProps) {
  return (
    <section className="overflow-hidden rounded-[2rem] border shadow-[0_18px_50px_rgba(10,20,35,0.18)] backdrop-blur-2xl theme-border theme-surface">
      <div className="flex items-start justify-between gap-4 px-5 pb-4 pt-5">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] theme-text-muted">
            <LocationIcon className="h-3.5 w-3.5" />
            <span>Weather Map</span>
          </div>
          <h2 className="mt-2 text-2xl font-light theme-text">Saved locations at a glance</h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed theme-text-muted">
            Scan every saved place on one polished map, then open it into a fullscreen view for a
            wider weather canvas.
          </p>
        </div>
        <button
          type="button"
          onClick={onExpand}
          className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-xl hover:bg-white/15 theme-border theme-surface theme-text"
        >
          <ExpandIcon className="h-4 w-4" />
          <span>Expand</span>
        </button>
      </div>

      <div className="px-4 pb-4">
        {locations.length === 0 ? (
          <div className="flex h-[20rem] items-center justify-center rounded-[1.75rem] border border-dashed p-6 text-center theme-border theme-surface-soft">
            <div>
              <p className="text-lg font-light theme-text">No saved locations yet</p>
              <p className="mt-2 text-sm theme-text-muted">
                Add coordinates from the sidebar to see them appear as weather pins here.
              </p>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onExpand}
            className="group relative block h-[20rem] w-full rounded-[1.75rem] text-left"
            aria-label="Open fullscreen weather map"
          >
            <div className="pointer-events-none absolute inset-x-3 top-3 z-[500] flex justify-end">
              <div className="rounded-full border px-3 py-1 text-xs backdrop-blur-xl theme-border theme-surface theme-text-muted">
                Tap to open fullscreen
              </div>
            </div>
            <MapView
              className="h-[20rem] w-full border transition duration-300 group-hover:scale-[1.01] theme-border theme-surface-soft"
              locations={locations}
              selectedId={selectedId}
              interactive={false}
              onSelectLocation={onSelectLocation}
            />
          </button>
        )}
      </div>
    </section>
  );
}
