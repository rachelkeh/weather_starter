import { useState } from 'react';
import type { FormEvent } from 'react';
import { useStore } from '../state/store';
import { LocationIcon, PlusIcon } from './icons';

export function AddLocationForm() {
  const { isAdding, setAdding, create, detect } = useStore();
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const cancel = () => {
    setLatitude('');
    setLongitude('');
    setSubmitError(null);
    setAdding(false);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      await create({ latitude: Number(latitude), longitude: Number(longitude) });
      setLatitude('');
      setLongitude('');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not add location');
    } finally {
      setSubmitting(false);
    }
  };

  const useCurrentLocation = async () => {
    setSubmitError(null);
    if (!('geolocation' in navigator)) {
      setSubmitError('Your browser does not support location lookup. Enter coordinates manually.');
      return;
    }

    setDetecting(true);
    try {
      const position = await getCurrentPosition();
      await detect({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch (err) {
      setSubmitError(formatGeolocationError(err));
    } finally {
      setDetecting(false);
    }
  };

  if (!isAdding) {
    return (
      <div className="grid gap-2">
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={detecting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-sm font-medium backdrop-blur-xl hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-60 theme-border theme-surface theme-text"
        >
          <LocationIcon className="h-4 w-4" />
          <span>{detecting ? 'Locating...' : 'Use my location'}</span>
        </button>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-sm font-medium backdrop-blur-xl hover:bg-white/[0.12] theme-border theme-surface theme-text"
        >
          <PlusIcon />
          <span>Add coordinates</span>
        </button>
        {submitError && (
          <p className="rounded-md border border-red-300/30 bg-red-500/15 px-2.5 py-1.5 text-xs text-red-100">
            {submitError}
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-2.5 rounded-2xl border p-3 backdrop-blur-xl theme-border theme-surface"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] theme-text-muted">
        New coordinate
      </p>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
        <label className="grid min-w-0 gap-1">
          <span className="text-[11px] theme-text-muted">Latitude</span>
          <input
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="1.3508"
            required
            className="min-w-0 w-full rounded-md border px-2 py-1.5 text-sm placeholder:text-white/40 theme-border theme-surface theme-text"
          />
        </label>
        <label className="grid min-w-0 gap-1">
          <span className="text-[11px] theme-text-muted">Longitude</span>
          <input
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="103.8390"
            required
            className="min-w-0 w-full rounded-md border px-2 py-1.5 text-sm placeholder:text-white/40 theme-border theme-surface theme-text"
          />
        </label>
      </div>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={detecting || submitting}
          className="mr-auto flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium theme-text-muted hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LocationIcon />
          <span>{detecting ? 'Locating...' : 'Use my location'}</span>
        </button>
        <button
          type="button"
          onClick={cancel}
          className="rounded-md px-2.5 py-1.5 text-xs font-medium theme-text-muted hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Adding…' : 'Add'}
        </button>
      </div>
      {submitError && (
        <p className="rounded-md border border-red-300/30 bg-red-500/15 px-2.5 py-1.5 text-xs text-red-100">
          {submitError}
        </p>
      )}
    </form>
  );
}

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      maximumAge: 60_000,
      timeout: 10_000,
    });
  });
}

function formatGeolocationError(error: unknown): string {
  if (error instanceof Error && error.name !== 'GeolocationPositionError') {
    return error.message;
  }

  const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : null;
  if (code === 1) {
    return 'Location permission was denied. Allow location access or enter coordinates manually.';
  }
  if (code === 2) {
    return 'Your location is unavailable right now. Enter coordinates manually.';
  }
  if (code === 3) {
    return 'Location lookup timed out. Try again or enter coordinates manually.';
  }

  return 'Could not use your current location. Enter coordinates manually.';
}
