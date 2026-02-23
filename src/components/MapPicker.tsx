'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Script from 'next/script'
import { useLanguage } from '@/context/LanguageContext'

interface MapPickerProps {
    lat: number
    lng: number
    onLocationChange: (lat: number, lng: number) => void
    onClose: () => void
}

declare global {
    interface Window {
        L: any
    }
}

export default function MapPicker({ lat, lng, onLocationChange, onClose }: MapPickerProps) {
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstance = useRef<any>(null)
    const markerRef = useRef<any>(null)
    const [leafletLoaded, setLeafletLoaded] = useState(!!window?.L)
    const [selectedLat, setSelectedLat] = useState(lat)
    const [selectedLng, setSelectedLng] = useState(lng)
    const { t } = useLanguage()
    const initializedRef = useRef(false)

    // Initialize map only once when Leaflet is ready
    useEffect(() => {
        if (!leafletLoaded || !mapRef.current || initializedRef.current) return

        const L = window.L
        if (!L) return

        initializedRef.current = true

        const map = L.map(mapRef.current, {
            center: [lat, lng],
            zoom: 17,
            zoomControl: true,
        })

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
            maxZoom: 19,
        }).addTo(map)

        const marker = L.marker([lat, lng], {
            draggable: true,
            autoPan: true,
        }).addTo(map)

        marker.on('dragend', () => {
            const pos = marker.getLatLng()
            setSelectedLat(pos.lat)
            setSelectedLng(pos.lng)
        })

        map.on('click', (e: any) => {
            marker.setLatLng(e.latlng)
            setSelectedLat(e.latlng.lat)
            setSelectedLng(e.latlng.lng)
        })

        mapInstance.current = map
        markerRef.current = marker

        // Multiple invalidateSize calls to ensure tiles render properly
        setTimeout(() => map.invalidateSize(), 100)
        setTimeout(() => map.invalidateSize(), 300)
        setTimeout(() => map.invalidateSize(), 600)

        return () => {
            map.remove()
            mapInstance.current = null
            markerRef.current = null
            initializedRef.current = false
        }
    }, [leafletLoaded]) // Only depends on leafletLoaded, NOT lat/lng

    const handleConfirm = () => {
        onLocationChange(selectedLat, selectedLng)
        onClose()
    }

    return (
        <>
            {/* Load Leaflet CSS */}
            <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                crossOrigin=""
            />
            {/* Load Leaflet JS */}
            <Script
                src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
                integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
                crossOrigin=""
                onLoad={() => setLeafletLoaded(true)}
                strategy="afterInteractive"
            />

            <div className="map-overlay">
                <div className="map-container-wrapper">
                    <div className="map-header">
                        <h4>{t('checkout.mapTitle')}</h4>
                        <p>{t('checkout.mapSubtitle')}</p>
                    </div>

                    <div
                        ref={mapRef}
                        className="map-container"
                    />

                    <div className="map-coordinates">
                        📌 {selectedLat.toFixed(5)}, {selectedLng.toFixed(5)}
                    </div>

                    <div className="map-actions">
                        <button className="btn-confirm" onClick={handleConfirm}>
                            ✅ {t('checkout.confirmLocation')}
                        </button>
                        <button className="btn-cancel" onClick={onClose}>
                            {t('checkout.cancel')}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .map-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1rem;
                    backdrop-filter: blur(4px);
                }
                .map-container-wrapper {
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                    width: 100%;
                    max-width: 600px;
                    max-height: 90vh;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    display: flex;
                    flex-direction: column;
                }
                .map-header {
                    padding: 1rem 1.25rem;
                    background: linear-gradient(135deg, #f97316, #ea580c);
                    color: white;
                    text-align: center;
                }
                .map-header h4 {
                    margin: 0;
                    font-size: 1.1rem;
                }
                .map-header p {
                    margin: 0.25rem 0 0;
                    font-size: 0.8rem;
                    opacity: 0.9;
                }
                .map-container {
                    width: 100%;
                    height: 350px;
                    min-height: 250px;
                }
                .map-coordinates {
                    padding: 0.6rem 1rem;
                    background: #f8f9fa;
                    text-align: center;
                    font-size: 0.85rem;
                    color: #555;
                    direction: ltr;
                    font-family: monospace;
                    border-top: 1px solid #eee;
                    border-bottom: 1px solid #eee;
                }
                .map-actions {
                    display: flex;
                    gap: 0.75rem;
                    padding: 1rem 1.25rem;
                }
                .btn-confirm {
                    flex: 1;
                    padding: 0.75rem;
                    background: linear-gradient(135deg, #f97316, #ea580c);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.15s;
                }
                .btn-confirm:hover {
                    transform: scale(1.02);
                }
                .btn-confirm:active {
                    transform: scale(0.98);
                }
                .btn-cancel {
                    padding: 0.75rem 1.25rem;
                    background: #f1f1f1;
                    color: #666;
                    border: none;
                    border-radius: 10px;
                    font-size: 0.9rem;
                    cursor: pointer;
                }
                .btn-cancel:hover {
                    background: #e5e5e5;
                }
                @media (max-width: 768px) {
                    .map-container {
                        height: 300px;
                    }
                    .map-overlay {
                        padding: 0.5rem;
                    }
                }
            `}</style>
        </>
    )
}
