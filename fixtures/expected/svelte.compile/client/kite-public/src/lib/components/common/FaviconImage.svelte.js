import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fetchFavicon, getImmediateFaviconUrl } from '$lib/services/faviconService';

var root = $.from_html(`<img crossorigin="anonymous"/>`);

export default function FaviconImage($$anchor, $$props) {
	$.push($$props, true);

	let alt = $.prop($$props, 'alt', 3, ''),
		className = $.prop($$props, 'class', 3, 'h-5 w-5 rounded-sm'),
		loading = $.prop($$props, 'loading', 3, 'lazy');

	// State for favicon URL - initialized empty, effect handles updates
	let faviconUrl = $.state('');

	let isBestQuality = $.state(false);

	// Brightness detection state
	let avgLuminance = $.state(null);

	let isDarkMode = $.state(false);

	// Derive initial URL from domain prop reactively
	const initialUrl = $.derived(() => getImmediateFaviconUrl($$props.domain));

	// Display URL: use fetched URL if available, otherwise derived initial
	const displayUrl = $.derived(() => $.get(faviconUrl) || $.get(initialUrl));

	// Reactively determine if the favicon needs inversion based on luminance + theme
	const DARK_THRESHOLD = 50; // Icons darker than this get inverted in dark mode

	const LIGHT_THRESHOLD = 210; // Icons lighter than this get inverted in light mode
	let needsInvert = $.derived(() => $.get(avgLuminance) !== null && ($.get(isDarkMode) && $.get(avgLuminance) < DARK_THRESHOLD || !$.get(isDarkMode) && $.get(avgLuminance) > LIGHT_THRESHOLD));

	// Watch for theme changes via MutationObserver on <html> class
	$.user_effect(() => {
		if (typeof document === 'undefined') return;

		$.set(isDarkMode, document.documentElement.classList.contains('dark'), true);

		const observer = new MutationObserver(() => {
			$.set(isDarkMode, document.documentElement.classList.contains('dark'), true);
		});

		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

		return () => observer.disconnect();
	});

	// Update when domain changes
	$.user_effect(() => {
		if ($$props.domain) {
			// Reset state for new domain
			$.set(faviconUrl, '');

			$.set(isBestQuality, false);
			$.set(avgLuminance, null);

			// Fetch with updates
			fetchFavicon($$props.domain, (result) => {
				$.set(faviconUrl, result.url, true);
				$.set(isBestQuality, result.quality === 'best');
			});
		}
	});

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

			$.set(avgLuminance, totalLuminance / opaquePixels);
		} catch {
			// Canvas tainted or other error - silently ignore
		}
	}

	var img_1 = root();
	let classes;

	$.template_effect(() => {
		$.set_attribute(img_1, 'src', $.get(displayUrl));
		$.set_attribute(img_1, 'alt', alt() || `${$$props.domain} favicon`);

		classes = $.set_class(img_1, 1, $.clsx(className()), 'svelte-17bjp6z', classes, {
			'high-quality': $.get(isBestQuality),
			'needs-invert': $.get(needsInvert)
		});

		$.set_attribute(img_1, 'loading', loading());
	});

	$.event('load', img_1, (e) => analyzeBrightness(e.currentTarget));

	$.event('error', img_1, (e) => {
		// Fallback to placeholder on error
		const target = e.currentTarget;

		target.src = "/svg/placeholder.svg";
	});

	$.replay_events(img_1);
	$.append($$anchor, img_1);
	$.pop();
}