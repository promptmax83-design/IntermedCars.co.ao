"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface GeolocationState {
  position: { lat: number; lng: number } | null;
  accuracy: number;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  watchPosition?: boolean;
  maxAge?: number;
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    watchPosition = true,
    maxAge = 30000,
  } = options;

  const [state, setState] = useState<GeolocationState>({
    position: null,
    accuracy: 0,
    loading: true,
    error: null,
    permissionDenied: false,
  });

  const watchIdRef = useRef<number | null>(null);

  const handleSuccess = useCallback((pos: GeolocationPosition) => {
    setState({
      position: { lat: pos.coords.latitude, lng: pos.coords.longitude },
      accuracy: pos.coords.accuracy,
      loading: false,
      error: null,
      permissionDenied: false,
    });
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    if (err.code === err.PERMISSION_DENIED) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Permissao de localizacao negada",
        permissionDenied: true,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Erro ao obter localizacao",
      }));
    }
  }, []);

  const refresh = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Geolocalizacao nao suportada",
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));

    if (watchPosition) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      watchIdRef.current = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        { enableHighAccuracy, maximumAge: maxAge }
      );
    } else {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
        enableHighAccuracy,
        maximumAge: maxAge,
      });
    }
  }, [watchPosition, enableHighAccuracy, maxAge, handleSuccess, handleError]);

  const setManualPosition = useCallback((lat: number, lng: number) => {
    setState({
      position: { lat, lng },
      accuracy: 0,
      loading: false,
      error: null,
      permissionDenied: false,
    });
  }, []);

  useEffect(() => {
    refresh();

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [refresh]);

  return { ...state, refresh, setManualPosition };
}
