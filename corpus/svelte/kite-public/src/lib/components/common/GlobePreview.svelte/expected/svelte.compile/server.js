import * as $ from 'svelte/internal/server';
import * as THREE from 'three';
import { feature } from 'topojson-client';
import worldTopo from 'world-atlas/countries-110m.json';

export default function GlobePreview($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { lat, lng, size = 120 } = $$props;
		let containerEl = undefined;
		let isDarkMode = false;

		// Watch theme
		// Convert topojson to geojson once
		const topo = worldTopo;

		const countries = feature(topo, topo.objects.countries);
		const countryFeatures = 'features' in countries ? countries.features : [];

		// Point-in-polygon ray casting
		function pointInPolygon(px, py, ring) {
			let inside = false;

			for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
				const xi = ring[i][0], yi = ring[i][1];
				const xj = ring[j][0], yj = ring[j][1];

				if (yi > py !== yj > py && px < (xj - xi) * (py - yi) / (yj - yi) + xi) {
					inside = !inside;
				}
			}

			return inside;
		}

		function pointInGeometry(pLng, pLat, geometry) {
			if (geometry.type === 'Polygon') {
				return pointInPolygon(pLng, pLat, geometry.coordinates[0]);
			} else if (geometry.type === 'MultiPolygon') {
				return geometry.coordinates.some((poly) => pointInPolygon(pLng, pLat, poly[0]));
			}

			return false;
		}

		function findCountryId(targetLat, targetLng) {
			for (const feat of countryFeatures) {
				if (feat.geometry && pointInGeometry(targetLng, targetLat, feat.geometry)) {
					return String(feat.id);
				}
			}

			return null;
		}

		// Compute the geographic centroid and span of a specific polygon ring
		function getPolygonCentroid(ring) {
			let sumLng = 0;
			let sumLat = 0;
			let count = 0;
			let minLng = Infinity;
			let maxLng = -Infinity;
			let minLat = Infinity;
			let maxLat = -Infinity;

			// Skip last point (same as first in closed rings)
			for (let i = 0; i < ring.length - 1; i++) {
				const lng = ring[i][0];
				const lat = ring[i][1];

				sumLng += lng;
				sumLat += lat;

				if (lng < minLng) minLng = lng;
				if (lng > maxLng) maxLng = lng;
				if (lat < minLat) minLat = lat;
				if (lat > maxLat) maxLat = lat;

				count++;
			}

			if (count === 0) return null;

			const span = Math.max(maxLng - minLng, maxLat - minLat);

			return { lat: sumLat / count, lng: sumLng / count, span };
		}

		// Compute the centroid of the polygon that contains the target point (handles overseas territories)
		function getCountryCentroid(countryId, targetLat, targetLng) {
			const feat = countryFeatures.find((f) => String(f.id) === countryId);

			if (!feat?.geometry) return null;

			const geom = feat.geometry;

			if (geom.type === 'Polygon') {
				return getPolygonCentroid(geom.coordinates[0]);
			} else if (geom.type === 'MultiPolygon') {
				// Find the polygon that contains the target point
				for (const poly of geom.coordinates) {
					if (pointInPolygon(targetLng, targetLat, poly[0])) {
						return getPolygonCentroid(poly[0]);
					}
				}

				// Fallback: use the largest polygon (by vertex count) if point not found in any
				let largestPoly = null;

				let maxVertices = 0;

				for (const poly of geom.coordinates) {
					if (poly[0].length > maxVertices) {
						maxVertices = poly[0].length;
						largestPoly = poly[0];
					}
				}

				if (largestPoly) {
					return getPolygonCentroid(largestPoly);
				}
			}

			return null;
		}

		// Draw GeoJSON geometry onto canvas (equirectangular projection)
		function drawGeometry(ctx, geometry, canvasW, canvasH) {
			const drawRings = (rings) => {
				ctx.beginPath();

				for (const ring of rings) {
					let prevX = 0;

					for (let i = 0; i < ring.length; i++) {
						const [cLng, cLat] = ring[i];
						const x = (cLng + 180) / 360 * canvasW;
						const y = (90 - cLat) / 180 * canvasH;

						// Skip segments that cross the antimeridian (huge horizontal jump)
						if (i === 0 || Math.abs(x - prevX) > canvasW * 0.5) {
							ctx.moveTo(x, y);
						} else {
							ctx.lineTo(x, y);
						}

						prevX = x;
					}
				}

				ctx.fill();
				ctx.stroke();
			};

			if (geometry.type === 'Polygon') {
				drawRings(geometry.coordinates);
			} else if (geometry.type === 'MultiPolygon') {
				for (const polygon of geometry.coordinates) {
					drawRings(polygon);
				}
			}
		}

		function createGlobeTexture(dark, highlightId) {
			const canvas = document.createElement('canvas');
			const w = 2048;
			const h = 1024;

			canvas.width = w;
			canvas.height = h;

			const ctx = canvas.getContext('2d');

			// Ocean
			ctx.fillStyle = dark ? '#0d1321' : '#a8c4e0';

			ctx.fillRect(0, 0, w, h);

			// Draw all countries
			for (const feat of countryFeatures) {
				if (!feat.geometry) continue;

				const isHighlighted = String(feat.id) === highlightId;

				ctx.fillStyle = isHighlighted
					? dark ? '#1a5c3a' : '#5aad5a'
					: dark ? '#1c2a3a' : '#c8d8b4';

				ctx.strokeStyle = dark ? '#2a3e52' : '#8aaa88';
				ctx.lineWidth = 0.8;
				drawGeometry(ctx, feat.geometry, w, h);
			}

			return canvas;
		}

		function latLngToVector3(pLat, pLng, radius) {
			const phi = (90 - pLat) * Math.PI / 180;
			const theta = pLng * Math.PI / 180;

			return new THREE.Vector3(radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), -radius * Math.sin(phi) * Math.sin(theta));
		}

		$$renderer.push(`<div${$.attr_style(`width: ${$.stringify(
			// Three.js scene
			// Find which country contains the target point
			// Create texture from GeoJSON (standard equirectangular projection)
			// Scene setup
			// Globe group - everything rotates together
			// Globe sphere with country texture
			// Location marker (child of globeGroup so it rotates with the globe)
			// Marker dot
			// Marker ring (pulsing)
			// Atmosphere glow
			// Lighting
			// Blend marker position with country centroid for better framing of large countries
			// How far the marker is from centroid relative to country size (0 = at centroid, 1 = at edge)
			// Only pull toward centroid when marker is near the edge of a large country
			// Y rotation: -90 - lng works for horizontal centering
			// X rotation: try positive value ~= latitude to tilt north toward camera
			// Start slightly offset for a spin-in animation
			// Smooth lerp toward target rotation
			// Pulse the ring
			size
		)}px; height: ${$.stringify(size)}px;`)} class="overflow-hidden rounded-lg"></div>`);
	});
}