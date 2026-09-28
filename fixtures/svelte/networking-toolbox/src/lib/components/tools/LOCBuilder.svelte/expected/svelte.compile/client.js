import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';
import { tooltip } from '$lib/actions/tooltip';
import { useClipboard } from '$lib/composables';

var root = $.from_html(`<button class="example-btn svelte-1ambgsj"> </button>`);
var root_1 = $.from_html(`<div class="input-group svelte-1ambgsj"><label for="locString" class="svelte-1ambgsj">LOC Record String</label> <textarea id="locString" placeholder="example.com. IN LOC 37 46 29.000 N 122 25 10.000 W 10.00m 1m 10000m 10m" rows="3" class="svelte-1ambgsj"></textarea></div>`);
var root_2 = $.from_html(`<div class="coord-grid svelte-1ambgsj"><div class="input-group svelte-1ambgsj"><label for="latitude" class="svelte-1ambgsj">Latitude *</label> <input id="latitude" type="number" step="0.000001" min="-90" max="90" placeholder="37.7749" class="svelte-1ambgsj"/></div> <div class="input-group svelte-1ambgsj"><label for="longitude" class="svelte-1ambgsj">Longitude *</label> <input id="longitude" type="number" step="0.000001" min="-180" max="180" placeholder="-122.4194" class="svelte-1ambgsj"/></div></div> <div class="input-group svelte-1ambgsj"><label for="altitude" class="svelte-1ambgsj">Altitude (m) *</label> <input id="altitude" type="number" step="0.1" placeholder="10" class="svelte-1ambgsj"/></div> <div class="precision-grid svelte-1ambgsj"><div class="input-group svelte-1ambgsj"><label for="size" class="svelte-1ambgsj">Size (m)</label> <input id="size" type="number" step="0.1" min="0" placeholder="1" class="svelte-1ambgsj"/></div> <div class="input-group svelte-1ambgsj"><label for="horizontalPrecision" class="svelte-1ambgsj">H. Precision (m)</label> <input id="horizontalPrecision" type="number" step="1" min="0" placeholder="10000" class="svelte-1ambgsj"/></div> <div class="input-group svelte-1ambgsj"><label for="verticalPrecision" class="svelte-1ambgsj">V. Precision (m)</label> <input id="verticalPrecision" type="number" step="0.1" min="0" placeholder="10" class="svelte-1ambgsj"/></div></div>`, 1);
var root_3 = $.from_html(`<code class="svelte-1ambgsj"> </code>`);
var root_4 = $.from_html(`<p class="placeholder svelte-1ambgsj">Fill in the required fields to generate the LOC record</p>`);
var root_5 = $.from_html(`<div class="actions svelte-1ambgsj"><button><!> </button> <button><!> </button></div>`);

var root_6 = $.from_html(`<div class="container svelte-1ambgsj"><div class="card svelte-1ambgsj"><div class="card-header"><h1>LOC Record Builder</h1> <p>Convert latitude/longitude coordinates ↔ DNS LOC records for geographic positioning</p></div> <div class="content svelte-1ambgsj"><div class="mode-toggle svelte-1ambgsj"><button><!> Coordinates → LOC</button> <button><!> LOC → Coordinates</button></div> <div class="examples-card svelte-1ambgsj"><details><summary class="examples-summary svelte-1ambgsj"><!> City Examples <!></summary> <div class="examples-grid svelte-1ambgsj"></div></details></div> <div class="main-grid svelte-1ambgsj"><div class="input-section card svelte-1ambgsj"><div class="input-group svelte-1ambgsj"><label for="domain" class="svelte-1ambgsj">Domain Name *</label> <input id="domain" type="text" placeholder="example.com" class="svelte-1ambgsj"/></div> <!></div> <div class="output-section svelte-1ambgsj"><div class="card svelte-1ambgsj"><h3 class="section-title svelte-1ambgsj"> </h3> <div class="code-block svelte-1ambgsj"><!></div></div> <!></div></div> <div class="info-section svelte-1ambgsj"><div class="card info-card svelte-1ambgsj"><h3 class="svelte-1ambgsj">About LOC Records</h3> <p class="svelte-1ambgsj">LOC (Location) records store geographic location information in DNS. They specify latitude, longitude,
            altitude, and precision values, allowing applications to discover the physical location associated with a
            domain name.</p></div> <div class="info-grid svelte-1ambgsj"><div class="card info-card svelte-1ambgsj"><h4 class="svelte-1ambgsj">Record Format</h4> <ul class="format-list svelte-1ambgsj"><li class="svelte-1ambgsj"><strong class="svelte-1ambgsj">Latitude/Longitude:</strong> Degrees, minutes, seconds</li> <li class="svelte-1ambgsj"><strong class="svelte-1ambgsj">Altitude:</strong> Meters above/below sea level</li> <li class="svelte-1ambgsj"><strong class="svelte-1ambgsj">Size:</strong> Diameter of the location sphere</li> <li class="svelte-1ambgsj"><strong class="svelte-1ambgsj">Precision:</strong> Horizontal and vertical accuracy</li></ul></div> <div class="card info-card svelte-1ambgsj"><h4 class="svelte-1ambgsj">Use Cases</h4> <ul class="use-case-list svelte-1ambgsj"><li class="svelte-1ambgsj">Geographic service discovery</li> <li class="svelte-1ambgsj">Network topology mapping</li> <li class="svelte-1ambgsj">Emergency services location</li> <li class="svelte-1ambgsj">Content delivery optimization</li> <li class="svelte-1ambgsj">Legal jurisdiction identification</li></ul></div></div></div></div></div></div>`);

export default function LOCBuilder($$anchor, $$props) {
	$.push($$props, true);

	let domain = $.state('');
	let latitude = $.state('37.7749');
	let longitude = $.state('-122.4194');
	let altitude = $.state('10');
	let size = $.state('1');
	let horizontalPrecision = $.state('10000');
	let verticalPrecision = $.state('10');
	let locString = $.state('');
	let parseMode = $.state(false);
	let showExamples = $.state(false);
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
		if ($.get(parseMode)) {
			return parseLocString();
		} else {
			return generateLocRecord();
		}
	});

	function generateLocRecord() {
		if (!$.get(domain).trim()) return '';

		const latLoc = degreesToLOC(parseFloat($.get(latitude)));
		const lngLoc = degreesToLOC(parseFloat($.get(longitude)), true);
		const altLoc = altitudeToLOC(parseFloat($.get(altitude)));
		const sizeLoc = sizeToLOC(parseFloat($.get(size)));
		const hpLoc = sizeToLOC(parseFloat($.get(horizontalPrecision)));
		const vpLoc = sizeToLOC(parseFloat($.get(verticalPrecision)));

		return `${$.get(domain).trim()}. IN LOC ${latLoc} ${lngLoc} ${altLoc}m ${sizeLoc} ${hpLoc} ${vpLoc}`;
	}

	function parseLocString() {
		if (!$.get(locString).trim()) return '';

		return `Parsed: ${$.get(locString)}`;
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
		if ($.get(parseMode)) {
			return $.get(locString).trim() !== '';
		} else {
			return $.get(domain).trim() !== '' && !isNaN(parseFloat($.get(latitude))) && !isNaN(parseFloat($.get(longitude))) && !isNaN(parseFloat($.get(altitude)));
		}
	});

	function copyToClipboard() {
		clipboard.copy($.get(locRecord), 'copy');
	}

	function downloadRecord() {
		const blob = new Blob([$.get(locRecord)], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		a.href = url;
		a.download = `${$.get(domain).replace(/\.$/, '') || 'loc'}-record.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		clipboard.copy('', 'download');
	}

	function loadCity(city) {
		$.set(latitude, city.lat.toString(), true);
		$.set(longitude, city.lng.toString(), true);
		$.set(altitude, city.alt.toString(), true);
		$.set(parseMode, false);
	}

	var div = root_6();
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var div_3 = $.child(div_2);
	var button = $.child(div_3);
	let classes;
	var node = $.child(button);

	Icon(node, { name: 'map-pin', size: 'sm' });
	$.next();
	$.reset(button);

	var button_1 = $.sibling(button, 2);
	let classes_1;
	var node_1 = $.child(button_1);

	Icon(node_1, { name: 'file', size: 'sm' });
	$.next();
	$.reset(button_1);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var details = $.child(div_4);
	var summary = $.child(details);
	var node_2 = $.child(summary);

	Icon(node_2, { name: 'lightbulb', size: 'sm' });

	var node_3 = $.sibling(node_2, 2);

	Icon(node_3, { name: 'chevron-down', size: 'sm' });
	$.reset(summary);

	var div_5 = $.sibling(summary, 2);

	$.each(div_5, 21, () => cityExamples, (city) => city.name, ($$anchor, city) => {
		var button_2 = root();
		var text = $.only_child(button_2, true);

		$.template_effect(() => $.set_text(text, $.get(city).name));
		$.delegated('click', button_2, () => loadCity($.get(city)));
		$.append($$anchor, button_2);
	});

	$.reset(div_5);
	$.reset(details);
	$.reset(div_4);

	var div_6 = $.sibling(div_4, 2);
	var div_7 = $.child(div_6);
	var div_8 = $.child(div_7);
	var label = $.child(div_8);

	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Domain name for the LOC record');

	var input = $.sibling(label, 2);

	$.remove_input_defaults(input);
	$.reset(div_8);

	var node_4 = $.sibling(div_8, 2);

	{
		var consequent = ($$anchor) => {
			var div_9 = root_1();
			var label_1 = $.child(div_9);

			$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Paste existing LOC record to parse');

			var textarea = $.sibling(label_1, 2);

			$.remove_textarea_child(textarea);
			$.reset(div_9);
			$.bind_value(textarea, () => $.get(locString), ($$value) => $.set(locString, $$value));
			$.append($$anchor, div_9);
		};

		var alternate = ($$anchor) => {
			var fragment = root_2();
			var div_10 = $.first_child(fragment);
			var div_11 = $.child(div_10);
			var label_2 = $.child(div_11);

			$.action(label_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Latitude in decimal degrees (-90 to 90)');

			var input_1 = $.sibling(label_2, 2);

			$.remove_input_defaults(input_1);
			$.reset(div_11);

			var div_12 = $.sibling(div_11, 2);
			var label_3 = $.child(div_12);

			$.action(label_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Longitude in decimal degrees (-180 to 180)');

			var input_2 = $.sibling(label_3, 2);

			$.remove_input_defaults(input_2);
			$.reset(div_12);
			$.reset(div_10);

			var div_13 = $.sibling(div_10, 2);
			var label_4 = $.child(div_13);

			$.action(label_4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Altitude in meters above sea level');

			var input_3 = $.sibling(label_4, 2);

			$.remove_input_defaults(input_3);
			$.reset(div_13);

			var div_14 = $.sibling(div_13, 2);
			var div_15 = $.child(div_14);
			var label_5 = $.child(div_15);

			$.action(label_5, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Size/diameter of the location in meters');

			var input_4 = $.sibling(label_5, 2);

			$.remove_input_defaults(input_4);
			$.reset(div_15);

			var div_16 = $.sibling(div_15, 2);
			var label_6 = $.child(div_16);

			$.action(label_6, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Horizontal precision in meters');

			var input_5 = $.sibling(label_6, 2);

			$.remove_input_defaults(input_5);
			$.reset(div_16);

			var div_17 = $.sibling(div_16, 2);
			var label_7 = $.child(div_17);

			$.action(label_7, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Vertical precision in meters');

			var input_6 = $.sibling(label_7, 2);

			$.remove_input_defaults(input_6);
			$.reset(div_17);
			$.reset(div_14);
			$.bind_value(input_1, () => $.get(latitude), ($$value) => $.set(latitude, $$value));
			$.bind_value(input_2, () => $.get(longitude), ($$value) => $.set(longitude, $$value));
			$.bind_value(input_3, () => $.get(altitude), ($$value) => $.set(altitude, $$value));
			$.bind_value(input_4, () => $.get(size), ($$value) => $.set(size, $$value));
			$.bind_value(input_5, () => $.get(horizontalPrecision), ($$value) => $.set(horizontalPrecision, $$value));
			$.bind_value(input_6, () => $.get(verticalPrecision), ($$value) => $.set(verticalPrecision, $$value));
			$.append($$anchor, fragment);
		};

		$.if(node_4, ($$render) => {
			if ($.get(parseMode)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div_7);

	var div_18 = $.sibling(div_7, 2);
	var div_19 = $.child(div_18);
	var h3 = $.child(div_19);
	var text_1 = $.only_child(h3, true);
	var div_20 = $.sibling(h3, 2);
	var node_5 = $.child(div_20);

	{
		var consequent_1 = ($$anchor) => {
			var code = root_3();
			var text_2 = $.only_child(code, true);

			$.template_effect(() => $.set_text(text_2, $.get(locRecord)));
			$.append($$anchor, code);
		};

		var alternate_1 = ($$anchor) => {
			var p = root_4();

			$.append($$anchor, p);
		};

		$.if(node_5, ($$render) => {
			if ($.get(isValid)) $$render(consequent_1); else $$render(alternate_1, -1);
		});
	}

	$.reset(div_20);
	$.reset(div_19);

	var node_6 = $.sibling(div_19, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_21 = root_5();
			var button_3 = $.child(div_21);
			let classes_2;
			var node_7 = $.child(button_3);

			{
				let $0 = $.derived(() => clipboard.isCopied('copy') ? 'check' : 'copy');

				Icon(node_7, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			var text_3 = $.sibling(node_7);

			$.reset(button_3);

			var button_4 = $.sibling(button_3, 2);
			let classes_3;
			var node_8 = $.child(button_4);

			{
				let $0 = $.derived(() => clipboard.isCopied('download') ? 'check' : 'download');

				Icon(node_8, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			var text_4 = $.sibling(node_8);

			$.reset(button_4);
			$.reset(div_21);

			$.template_effect(
				($0, $1, $2, $3) => {
					classes_2 = $.set_class(button_3, 1, 'btn btn-primary svelte-1ambgsj', null, classes_2, { success: $0 });
					$.set_text(text_3, ` ${$1 ?? ''}`);
					classes_3 = $.set_class(button_4, 1, 'btn btn-success svelte-1ambgsj', null, classes_3, { success: $2 });
					$.set_text(text_4, ` ${$3 ?? ''}`);
				},
				[
					() => clipboard.isCopied('copy'),
					() => clipboard.isCopied('copy') ? 'Copied!' : 'Copy Record',
					() => clipboard.isCopied('download'),
					() => clipboard.isCopied('download') ? 'Downloaded!' : 'Download'
				]
			);

			$.delegated('click', button_3, copyToClipboard);
			$.delegated('click', button_4, downloadRecord);
			$.append($$anchor, div_21);
		};

		$.if(node_6, ($$render) => {
			if ($.get(isValid)) $$render(consequent_2);
		});
	}

	$.reset(div_18);
	$.reset(div_6);
	$.next(2);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		classes = $.set_class(button, 1, 'mode-btn svelte-1ambgsj', null, classes, { active: !$.get(parseMode) });
		classes_1 = $.set_class(button_1, 1, 'mode-btn svelte-1ambgsj', null, classes_1, { active: $.get(parseMode) });
		$.set_text(text_1, $.get(parseMode) ? 'Parsed Coordinates' : 'Generated LOC Record');
	});

	$.delegated('click', button, () => $.set(parseMode, false));
	$.delegated('click', button_1, () => $.set(parseMode, true));
	$.bind_property('open', 'toggle', details, ($$value) => $.set(showExamples, $$value), () => $.get(showExamples));
	$.bind_value(input, () => $.get(domain), ($$value) => $.set(domain, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);