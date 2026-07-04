import { useState } from 'react';
import { useStore, useSelectedLocation } from '../state/store';
import { LocationIcon, RefreshIcon } from './icons';
import { HourlyStrip } from './HourlyStrip';
import { TenDayForecast } from './TenDayForecast';
import { TileGrid } from './Tiles';
import { formatLocationName, formatTemperature, formatTime } from './format';
import { MapCard } from './MapCard';
import { FullscreenMapModal } from './FullscreenMapModal';

export function Hero() {
  const { locations, refresh, refreshingId, select } = useStore();
  const selected = useSelectedLocation();
  const [isMapOpen, setIsMapOpen] = useState(false);

  if (!selected) {
    return (
      <>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 pb-6 pt-20 lg:px-8 lg:pb-8 lg:pt-24">
            <section className="rounded-[2rem] border px-6 py-12 text-center backdrop-blur-2xl theme-border theme-surface-soft">
              <p className="text-2xl font-light theme-text">Select a location</p>
              <p className="mt-2 text-sm theme-text-muted">
                Add a Singapore coordinate from the sidebar to see its weather and explore it on
                the map.
              </p>
            </section>

            {locations.length > 0 && (
              <MapCard
                locations={locations}
                selectedId={null}
                onExpand={() => setIsMapOpen(true)}
                onSelectLocation={select}
              />
            )}
          </div>
        </main>

        {isMapOpen && locations.length > 0 && (
          <FullscreenMapModal
            locations={locations}
            selectedId={null}
            onClose={() => setIsMapOpen(false)}
            onSelectLocation={select}
          />
        )}
      </>
    );
  }

  const isHome = locations[0]?.id === selected.id;
  const area = formatLocationName(selected.weather?.area, selected.latitude, selected.longitude);
  const condition = selected.weather?.condition || 'Conditions unavailable';
  const observed = formatTime(selected.weather?.observed_at);
  const validPeriod = selected.weather?.valid_period_text;
  const source = selected.weather?.source;
  const isRefreshing = refreshingId === selected.id;
  const temperature = formatTemperature(selected.weather?.temperature_c);
  const high = formatTemperature(selected.weather?.forecast_high_c);
  const low = formatTemperature(selected.weather?.forecast_low_c);

  return (
    <>
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 pb-6 pt-20 lg:px-8 lg:pb-8 lg:pt-24">
          <header className="flex flex-col items-center pt-6 pb-2 text-center">
            {isHome && (
              <div className="mb-2 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.18em] theme-text-muted">
                <LocationIcon className="h-3 w-3" />
                <span>Home</span>
              </div>
            )}
            <h1 className="text-4xl font-light leading-tight theme-text">{area}</h1>
            <div className="mt-2 text-[6.5rem] font-extralight leading-none tracking-tight theme-text">
              {temperature}
            </div>
            <div className="mt-1 text-lg theme-text">{condition}</div>
            <div className="mt-1 text-sm tabular-nums theme-text-muted">
              H:{high} L:{low}
            </div>
            {observed && <div className="mt-3 text-xs theme-text-soft">Updated {observed}</div>}
          </header>

          {validPeriod && <p className="px-2 pb-1 text-center text-xs theme-text-muted">{validPeriod}</p>}

          <HourlyStrip periods={selected.weather?.forecast_periods} />
          <TenDayForecast weather={selected.weather} />
          <MapCard
            locations={locations}
            selectedId={selected.id}
            onExpand={() => setIsMapOpen(true)}
            onSelectLocation={select}
          />
          <TileGrid weather={selected.weather} />

          <footer className="mt-2 flex flex-col items-center gap-3 pb-8 text-xs theme-text-soft">
            <button
              type="button"
              onClick={() => void refresh(selected.id)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-xl hover:bg-white/[0.14] disabled:cursor-not-allowed disabled:opacity-60 theme-border theme-surface theme-text"
            >
              <RefreshIcon className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <p>
              Weather for {area}
              {source ? ` · ${source}` : ''}
            </p>
          </footer>
        </div>
      </main>

      {isMapOpen && (
        <FullscreenMapModal
          locations={locations}
          selectedId={selected.id}
          onClose={() => setIsMapOpen(false)}
          onSelectLocation={select}
        />
      )}
    </>
  );
}
