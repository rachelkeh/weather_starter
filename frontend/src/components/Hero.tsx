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
          <div className="mx-auto flex max-w-5xl flex-col gap-4 p-6 lg:p-8">
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] px-6 py-12 text-center backdrop-blur-2xl">
              <p className="text-2xl font-light text-white/85">Select a location</p>
              <p className="mt-2 text-sm text-white/60">
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
        <div className="mx-auto flex max-w-5xl flex-col gap-3 p-6 lg:p-8">
          <header className="flex flex-col items-center pt-6 pb-2 text-center">
            {isHome && (
              <div className="mb-2 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                <LocationIcon className="h-3 w-3" />
                <span>Home</span>
              </div>
            )}
            <h1 className="text-4xl font-light leading-tight text-white">{area}</h1>
            <div className="mt-2 text-[6.5rem] font-extralight leading-none tracking-tight text-white">
              {temperature}
            </div>
            <div className="mt-1 text-lg text-white/90">{condition}</div>
            <div className="mt-1 text-sm tabular-nums text-white/70">
              H:{high} L:{low}
            </div>
            {observed && <div className="mt-3 text-xs text-white/55">Updated {observed}</div>}
          </header>

          {validPeriod && <p className="px-2 pb-1 text-center text-xs text-white/65">{validPeriod}</p>}

          <HourlyStrip periods={selected.weather?.forecast_periods} />
          <TenDayForecast weather={selected.weather} />
          <MapCard
            locations={locations}
            selectedId={selected.id}
            onExpand={() => setIsMapOpen(true)}
            onSelectLocation={select}
          />
          <TileGrid weather={selected.weather} />

          <footer className="mt-2 flex flex-col items-center gap-3 pb-8 text-xs text-white/55">
            <button
              type="button"
              onClick={() => void refresh(selected.id)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-xs font-medium text-white/85 backdrop-blur-xl hover:bg-white/[0.14] disabled:cursor-not-allowed disabled:opacity-60"
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
