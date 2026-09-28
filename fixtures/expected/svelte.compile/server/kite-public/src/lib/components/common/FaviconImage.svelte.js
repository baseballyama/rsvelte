import * as $ from 'svelte/internal/server';
import { fetchFavicon, getImmediateFaviconUrl } from '$lib/services/faviconService';

export default function FaviconImage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			domain,
			alt = '',
			class: className = 'h-5 w-5 rounded-sm',
			loading = 'lazy'
		} = $$props;

		// State for favicon URL - initialized empty, effect handles updates
		let faviconUrl = '';

		let isBestQuality = false;

		// Brightness detection state
		let avgLuminance = null;

		let isDarkMode = false;

		// Derive initial URL from domain prop reactively
		const initialUrl = $.derived(() => getImmediateFaviconUrl(domain));

		// Display URL: use fetched URL if available, otherwise derived initial
		const displayUrl = $.derived(() => faviconUrl || initialUrl());

		// Reactively determine if the favicon needs inversion based on luminance + theme
		const DARK_THRESHOLD = 50; // Icons darker than this get inverted in dark mode

		const LIGHT_THRESHOLD = 210; // Icons lighter than this get inverted in light mode
		let needsInvert = $.derived(() => avgLuminance !== null && (isDarkMode && avgLuminance < DARK_THRESHOLD || !isDarkMode && avgLuminance > LIGHT_THRESHOLD));

		// Watch for theme changes via MutationObserver on <html> class
		// Update when domain changes
		// Reset state for new domain
		// Fetch with updates
		/**
		 * Analyze the favicon's brightness by drawing it to an offscreen canvas
		 * and computing the average luminance of opaque pixels.
		 */
		function analyzeBrightness(img) {
			try {
				const canvas = document.createElement('canvas');
				const size = 16;

				canvas.width = size;
				canvas.height = size;

				const ctx = canvas.getContext('2d', { willReadFrequently: true });

				if (!ctx) return;

				ctx.drawImage(img, 0, 0, size, size);

				const imageData = ctx.getImageData(0, 0, size, size);
				const data = imageData.data;
				let totalLuminance = 0;
				let opaquePixels = 0;

				for (let i = 0; i < data.length; i += 4) {
					const a = data[i + 3];

					if (a < 128) continue; // Skip transparent/semi-transparent pixels

					const r = data[i];
					const g = data[i + 1];
					const b = data[i + 2];

					totalLuminance += 0.299 * r + 0.587 * g + 0.114 * b;
					opaquePixels++;
				}

				if (opaquePixels === 0) return;

				avgLuminance = totalLuminance / opaquePixels;
			} catch {
				// Canvas tainted or other error - silently ignore
			}
		}

		$$renderer.push(`<img${$.attr('src', displayUrl())}${$.attr('alt', alt || `${domain} favicon`)}${$.attr_class($.clsx(className), 'svelte-17bjp6z', { 'high-quality': isBestQuality, 'needs-invert': needsInvert() })}${$.attr('loading', loading)} crossorigin="anonymous" onload="this.__e=event" onerror="this.__e=event"/>`);
	});
}