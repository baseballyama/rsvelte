import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';
import { tooltip } from '$lib/actions/tooltip';
import { useClipboard } from '$lib/composables';

export default function LOCBuilder($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let domain = '';
		let latitude = '37.7749';
		let longitude = '-122.4194';
		let altitude = '10';
		let size = '1';
		let horizontalPrecision = '10000';
		let verticalPrecision = '10';
		let locString = '';
		let parseMode = false;
		let showExamples = false;
		const clipboard = useClipboard();

		const cityExamples = [
			{ name: 'San Francisco', lat: 37.7749, lng: -122.4194, alt: 10 },
			{ name: 'New York', lat: 40.7128, lng: -74.006, alt: 10 },
			{ name: 'London', lat: 51.5074, lng: -0.1278, alt: 11 },
			{ name: 'Tokyo', lat: 35.6762, lng: 139.6503, alt: 40 },
			{ name: 'Sydney', lat: -33.8688, lng: 151.2093, alt: 58 }
		];

		function degreesToLOC(degrees, isLongitude = false) {
			const hemisphere = isLongitude ? degrees >= 0 ? 'E' : 'W' : degrees >= 0 ? 'N' : 'S';
			const absDegrees = Math.abs(degrees);
			const deg = Math.floor(absDegrees);
			const minFloat = (absDegrees - deg) * 60;
			const min = Math.floor(minFloat);
			const sec = Math.round((minFloat - min) * 60 * 1000);

			return `${deg.toString().padStart(isLongitude ? 3 : 2, '0')} ${min.toString().padStart(2, '0')} ${sec.toString().padStart(5, '0')}.000 ${hemisphere}`;
		}

		function altitudeToLOC(altMeters) {
			const altCm = Math.round((altMeters + 100000) * 100);

			return altCm.toString().padStart(8, '0');
		}

		function sizeToLOC(sizeMeters) {
			if (sizeMeters === 0) return '00';

			let mantissa = 0;
			let exponent = 0;
			let value = sizeMeters * 100; // Convert to centimeters

			while (value >= 10) {
				value /= 10;
				exponent++;
			}

			mantissa = Math.round(value);

			if (mantissa >= 10) {
				mantissa = Math.round(mantissa / 10);
				exponent++;
			}

			return (mantissa * 16 + exponent).toString(16).padStart(2, '0');
		}

		let locRecord = $.derived(() => {
			if (parseMode) {
				return parseLocString();
			} else {
				return generateLocRecord();
			}
		});

		function generateLocRecord() {
			if (!domain.trim()) return '';

			const latLoc = degreesToLOC(parseFloat(latitude));
			const lngLoc = degreesToLOC(parseFloat(longitude), true);
			const altLoc = altitudeToLOC(parseFloat(altitude));
			const sizeLoc = sizeToLOC(parseFloat(size));
			const hpLoc = sizeToLOC(parseFloat(horizontalPrecision));
			const vpLoc = sizeToLOC(parseFloat(verticalPrecision));

			return `${domain.trim()}. IN LOC ${latLoc} ${lngLoc} ${altLoc}m ${sizeLoc} ${hpLoc} ${vpLoc}`;
		}

		function parseLocString() {
			if (!locString.trim()) return '';

			return `Parsed: ${locString}`;
		}

		function _locToData(locRecord) {
			// Simplified parsing for demo
			const parts = locRecord.split(' ');

			if (parts.length < 8) return null;

			return {
				lat: 'Parsed latitude',
				lng: 'Parsed longitude',
				alt: 'Parsed altitude',
				size: 'Parsed size'
			};
		}

		let isValid = $.derived(() => {
			if (parseMode) {
				return locString.trim() !== '';
			} else {
				return domain.trim() !== '' && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude)) && !isNaN(parseFloat(altitude));
			}
		});

		function copyToClipboard() {
			clipboard.copy(locRecord(), 'copy');
		}

		function downloadRecord() {
			const blob = new Blob([locRecord()], { type: 'text/plain' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');

			a.href = url;
			a.download = `${domain.replace(/\.$/, '') || 'loc'}-record.txt`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			clipboard.copy('', 'download');
		}

		function loadCity(city) {
			latitude = city.lat.toString();
			longitude = city.lng.toString();
			altitude = city.alt.toString();
			parseMode = false;
		}

		$$renderer.push(`<div class="container svelte-1ambgsj"><div class="card svelte-1ambgsj"><div class="card-header"><h1>LOC Record Builder</h1> <p>Convert latitude/longitude coordinates ↔ DNS LOC records for geographic positioning</p></div> <div class="content svelte-1ambgsj"><div class="mode-toggle svelte-1ambgsj"><button${$.attr_class('mode-btn svelte-1ambgsj', void 0, { 'active': !parseMode })}>`);
		Icon($$renderer, { name: 'map-pin', size: 'sm' });
		$$renderer.push(`<!----> Coordinates → LOC</button> <button${$.attr_class('mode-btn svelte-1ambgsj', void 0, { 'active': parseMode })}>`);
		Icon($$renderer, { name: 'file', size: 'sm' });
		$$renderer.push(`<!----> LOC → Coordinates</button></div> <div class="examples-card svelte-1ambgsj"><details${$.attr('open', showExamples, true)}><summary class="examples-summary svelte-1ambgsj">`);
		Icon($$renderer, { name: 'lightbulb', size: 'sm' });
		$$renderer.push(`<!----> City Examples `);
		Icon($$renderer, { name: 'chevron-down', size: 'sm' });
		$$renderer.push(`<!----></summary> <div class="examples-grid svelte-1ambgsj"><!--[-->`);

		const each_array = $.ensure_array_like(cityExamples);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let city = each_array[$$index];

			$$renderer.push(`<button class="example-btn svelte-1ambgsj">${$.escape(city.name)}</button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="main-grid svelte-1ambgsj"><div class="input-section card svelte-1ambgsj"><div class="input-group svelte-1ambgsj"><label for="domain" class="svelte-1ambgsj">Domain Name *</label> <input id="domain" type="text"${$.attr('value', domain)} placeholder="example.com" class="svelte-1ambgsj"/></div> `);

		if (parseMode) {
			$$renderer.push(`<!--[0--><div class="input-group svelte-1ambgsj"><label for="locString" class="svelte-1ambgsj">LOC Record String</label> <textarea id="locString" placeholder="example.com. IN LOC 37 46 29.000 N 122 25 10.000 W 10.00m 1m 10000m 10m" rows="3" class="svelte-1ambgsj">`);

			const $$body = $.escape(locString);

			if ($$body) {
				$$renderer.push(`${$$body}`);
			} else {}

			$$renderer.push(`</textarea></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="coord-grid svelte-1ambgsj"><div class="input-group svelte-1ambgsj"><label for="latitude" class="svelte-1ambgsj">Latitude *</label> <input id="latitude" type="number"${$.attr('value', latitude)} step="0.000001" min="-90" max="90" placeholder="37.7749" class="svelte-1ambgsj"/></div> <div class="input-group svelte-1ambgsj"><label for="longitude" class="svelte-1ambgsj">Longitude *</label> <input id="longitude" type="number"${$.attr('value', longitude)} step="0.000001" min="-180" max="180" placeholder="-122.4194" class="svelte-1ambgsj"/></div></div> <div class="input-group svelte-1ambgsj"><label for="altitude" class="svelte-1ambgsj">Altitude (m) *</label> <input id="altitude" type="number"${$.attr('value', altitude)} step="0.1" placeholder="10" class="svelte-1ambgsj"/></div> <div class="precision-grid svelte-1ambgsj"><div class="input-group svelte-1ambgsj"><label for="size" class="svelte-1ambgsj">Size (m)</label> <input id="size" type="number"${$.attr('value', size)} step="0.1" min="0" placeholder="1" class="svelte-1ambgsj"/></div> <div class="input-group svelte-1ambgsj"><label for="horizontalPrecision" class="svelte-1ambgsj">H. Precision (m)</label> <input id="horizontalPrecision" type="number"${$.attr('value', horizontalPrecision)} step="1" min="0" placeholder="10000" class="svelte-1ambgsj"/></div> <div class="input-group svelte-1ambgsj"><label for="verticalPrecision" class="svelte-1ambgsj">V. Precision (m)</label> <input id="verticalPrecision" type="number"${$.attr('value', verticalPrecision)} step="0.1" min="0" placeholder="10" class="svelte-1ambgsj"/></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="output-section svelte-1ambgsj"><div class="card svelte-1ambgsj"><h3 class="section-title svelte-1ambgsj">${$.escape(parseMode ? 'Parsed Coordinates' : 'Generated LOC Record')}</h3> <div class="code-block svelte-1ambgsj">`);

		if (isValid()) {
			$$renderer.push(`<!--[0--><code class="svelte-1ambgsj">${$.escape(locRecord())}</code>`);
		} else {
			$$renderer.push(`<!--[-1--><p class="placeholder svelte-1ambgsj">Fill in the required fields to generate the LOC record</p>`);
		}

		$$renderer.push(`<!--]--></div></div> `);

		if (isValid()) {
			$$renderer.push(`<!--[0--><div class="actions svelte-1ambgsj"><button${$.attr_class('btn btn-primary svelte-1ambgsj', void 0, { 'success': clipboard.isCopied('copy') })}>`);

			Icon($$renderer, {
				name: clipboard.isCopied('copy') ? 'check' : 'copy',
				size: 'sm'
			});

			$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('copy') ? 'Copied!' : 'Copy Record')}</button> <button${$.attr_class('btn btn-success svelte-1ambgsj', void 0, { 'success': clipboard.isCopied('download') })}>`);

			Icon($$renderer, {
				name: clipboard.isCopied('download') ? 'check' : 'download',
				size: 'sm'
			});

			$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('download') ? 'Downloaded!' : 'Download')}</button></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div> <div class="info-section svelte-1ambgsj"><div class="card info-card svelte-1ambgsj"><h3 class="svelte-1ambgsj">About LOC Records</h3> <p class="svelte-1ambgsj">LOC (Location) records store geographic location information in DNS. They specify latitude, longitude,
            altitude, and precision values, allowing applications to discover the physical location associated with a
            domain name.</p></div> <div class="info-grid svelte-1ambgsj"><div class="card info-card svelte-1ambgsj"><h4 class="svelte-1ambgsj">Record Format</h4> <ul class="format-list svelte-1ambgsj"><li class="svelte-1ambgsj"><strong class="svelte-1ambgsj">Latitude/Longitude:</strong> Degrees, minutes, seconds</li> <li class="svelte-1ambgsj"><strong class="svelte-1ambgsj">Altitude:</strong> Meters above/below sea level</li> <li class="svelte-1ambgsj"><strong class="svelte-1ambgsj">Size:</strong> Diameter of the location sphere</li> <li class="svelte-1ambgsj"><strong class="svelte-1ambgsj">Precision:</strong> Horizontal and vertical accuracy</li></ul></div> <div class="card info-card svelte-1ambgsj"><h4 class="svelte-1ambgsj">Use Cases</h4> <ul class="use-case-list svelte-1ambgsj"><li class="svelte-1ambgsj">Geographic service discovery</li> <li class="svelte-1ambgsj">Network topology mapping</li> <li class="svelte-1ambgsj">Emergency services location</li> <li class="svelte-1ambgsj">Content delivery optimization</li> <li class="svelte-1ambgsj">Legal jurisdiction identification</li></ul></div></div></div></div></div></div>`);
	});
}