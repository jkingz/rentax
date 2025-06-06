'use client';
import Loader from '@/app/loading';
import NotFound from '@/app/not-found';
import { useGetPropertyQuery } from '@/state/api';
import { Compass, MapPin } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef } from 'react';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

const PropertyLocation = ({ propertyId }: PropertyDetailsProps) => {
  const {
    data: property,
    isError,
    isLoading,
  } = useGetPropertyQuery(propertyId);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    if (isLoading || isError || !property || !property.location?.coordinates)
      return;

    const { longitude = 0, latitude = 0 } = property.location.coordinates;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current!,
      // style: 'mapbox://styles/jkingz/cm9o11nu300et01so7n05c496',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [longitude, latitude],
      zoom: 14,
    });

    const marker = new mapboxgl.Marker()
      .setLngLat([longitude, latitude])
      .addTo(map);

    const markerElement = marker.getElement();
    const path = markerElement.querySelector("path[fill='#3FB1CE']");
    if (path) path.setAttribute('fill', '#000000');

    return () => map.remove();
  }, [property, isError, isLoading]);

  if (isLoading) return <Loader />;
  if (isError || !property || !property.location?.coordinates)
    return <NotFound />;

  const { location } = property;

  return (
    <div className="py-16">
      <h3 className="text-xl font-semibold text-primary-800 dark:text-primary-100">
        Map and Location
      </h3>
      <div className="flex justify-between items-center text-sm text-primary-500 mt-2">
        <div className="flex items-center text-gray-500">
          <MapPin className="w-4 h-4 mr-1 text-gray-700" />
          Property Address:
          <span className="ml-2 font-semibold text-gray-700">
            {location?.address || 'Address not available'}
          </span>
        </div>
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(
            location?.address || '',
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex justify-between items-center hover:underline gap-2 text-primary-600"
        >
          <Compass className="w-5 h-5" />
          Get Directions
        </a>
      </div>
      <div
        className="relative mt-4 h-[300px] rounded-lg overflow-hidden"
        ref={mapContainerRef}
      />
    </div>
  );
};

export default PropertyLocation;
