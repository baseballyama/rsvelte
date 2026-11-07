import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { asnGeoContent } from '$lib/content/asn-geo';
import '../../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<button><h5> </h5> <p> </p></button>`);
var root_1 = $.from_html(`<!> Looking up...`, 1);
var root_2 = $.from_html(`<!> Lookup`, 1);
var root_3 = $.from_html(`<div class="info-item svelte-2zofru"><!> <div class="info-content svelte-2zofru"><span class="info-label svelte-2zofru">ASN</span> <span class="info-value asn-badge svelte-2zofru"> </span></div></div>`);
var root_4 = $.from_html(`<div class="info-item svelte-2zofru"><!> <div class="info-content svelte-2zofru"><span class="info-label svelte-2zofru">Organization</span> <span class="info-value svelte-2zofru"> </span></div></div>`);
var root_5 = $.from_html(`<div class="info-item svelte-2zofru"><!> <div class="info-content svelte-2zofru"><span class="info-label svelte-2zofru">ISP</span> <span class="info-value svelte-2zofru"> </span></div></div>`);
var root_6 = $.from_html(`<div class="info-item svelte-2zofru"><!> <div class="info-content svelte-2zofru"><span class="info-label svelte-2zofru">Country</span> <span class="info-value svelte-2zofru"> </span></div></div>`);
var root_7 = $.from_html(`<div class="info-item svelte-2zofru"><!> <div class="info-content svelte-2zofru"><span class="info-label svelte-2zofru">Region</span> <span class="info-value svelte-2zofru"> </span></div></div>`);
var root_8 = $.from_html(`<div class="info-item svelte-2zofru"><!> <div class="info-content svelte-2zofru"><span class="info-label svelte-2zofru">City</span> <span class="info-value svelte-2zofru"> </span></div></div>`);
var root_9 = $.from_html(`<div class="info-item svelte-2zofru"><!> <div class="info-content svelte-2zofru"><span class="info-label svelte-2zofru">Timezone</span> <span class="info-value svelte-2zofru"> </span></div></div>`);
var root_10 = $.from_html(`<div class="result-card svelte-2zofru"><h4 class="svelte-2zofru">Coordinates</h4> <div class="coordinates-display svelte-2zofru"><div class="coordinate-info svelte-2zofru"><div class="coordinate-item svelte-2zofru"><!> <div class="coordinate-values svelte-2zofru"><div class="coordinate-row svelte-2zofru"><span class="coordinate-label svelte-2zofru">Latitude:</span> <span class="coordinate-value svelte-2zofru"> </span></div> <div class="coordinate-row svelte-2zofru"><span class="coordinate-label svelte-2zofru">Longitude:</span> <span class="coordinate-value svelte-2zofru"> </span></div></div></div> <a target="_blank" rel="noopener noreferrer" class="map-link svelte-2zofru"><!> View full map</a></div> <div class="map-container svelte-2zofru"><iframe title="Location map" style="border: 0" class="svelte-2zofru"></iframe></div></div></div>`);
var root_11 = $.from_html(`<div class="card results-card"><div class="card-header row"><h3> </h3> <button class="copy-btn"><!> </button></div> <div class="card-content"><div class="results-grid svelte-2zofru"><div class="result-card svelte-2zofru"><h4 class="svelte-2zofru">Network Information</h4> <div class="info-list svelte-2zofru"><!> <!> <!></div></div> <div class="result-card svelte-2zofru"><h4 class="svelte-2zofru">Geographic Location</h4> <div class="info-list svelte-2zofru"><!> <!> <!> <!></div></div> <!> <div class="result-card svelte-2zofru"><h4 class="svelte-2zofru">Connection Type</h4> <div class="connection-flags svelte-2zofru"><div><!> <span>Mobile Network</span></div> <div><!> <span>Proxy/VPN</span></div> <div><!> <span>Hosting/Datacenter</span></div></div></div></div></div></div>`);
var root_12 = $.from_html(`<div class="card error-card"><div class="card-content"><div class="error-content"><!> <div><strong>Lookup Failed</strong> <p> </p></div></div></div></div>`);
var root_13 = $.from_html(`<li><strong> </strong> </li>`);
var root_14 = $.from_html(`<li class="svelte-2zofru"> </li>`);
var root_15 = $.from_html(`<div class="card"><header class="card-header"><h1> </h1> <p> </p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary"><!> <h4>Example Lookups</h4></summary> <div class="examples-grid"></div></details></div> <div class="card input-card"><div class="card-header"><h3>IP Lookup</h3></div> <div class="card-content"><div class="lookup-form svelte-2zofru"><div class="input-row svelte-2zofru"><label for="ip" class="svelte-2zofru">IP Address</label> <input id="ip" type="text" placeholder="8.8.8.8 or 2001:4860:4860::8888" class="svelte-2zofru"/></div> <button class="lookup-btn svelte-2zofru"><!></button></div></div></div> <!> <!> <div class="card info-card svelte-2zofru"><div class="card-header"><h3>About ASN & Geolocation</h3></div> <div class="card-content"><div class="info-grid"><div class="info-section"><h4> </h4> <p> </p></div> <div class="info-section"><h4> </h4> <ul></ul></div> <div class="info-section"><h4> </h4> <p> </p></div> <div class="info-section"><h4> </h4> <p> </p></div></div> <div class="quick-tips svelte-2zofru"><h4 class="svelte-2zofru">Quick Tips</h4> <ul class="svelte-2zofru"></ul></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let ip = $.state('8.8.8.8');
	let loading = $.state(false);
	let results = $.state(null);
	let error = $.state(null);
	let copiedState = $.state(false);
	let selectedExampleIndex = $.state(null);

	const examples = [
		{ ip: '8.8.8.8', description: 'Google Public DNS' },
		{ ip: '2.58.47.0', description: 'M247 Proton' },
		{ ip: '1.1.1.1', description: 'Cloudflare DNS' },
		{ ip: '140.82.121.4', description: 'GitHub' },
		{ ip: '151.101.1.140', description: 'Fastly CDN' },
		{ ip: '2606:4700:4700::1111', description: 'Cloudflare IPv6' }
	];

	async function lookupIP() {
		$.set(loading, true);
		$.set(error, null);
		$.set(results, null);

		try {
			const response = await fetch('/api/internal/diagnostics/asn-geo', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ip: $.get(ip).trim() })
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));

				throw new Error(errorData.message || `Lookup failed: ${response.status}`);
			}

			$.set(results, await response.json(), true);
		} catch(err) {
			$.set(error, err instanceof Error ? err.message : 'Unknown error occurred', true);
		} finally {
			$.set(loading, false);
		}
	}

	function loadExample(example, index) {
		$.set(ip, example.ip, true);
		$.set(selectedExampleIndex, index, true);
		lookupIP();
	}

	function clearExampleSelection() {
		$.set(selectedExampleIndex, null);
	}

	async function copyResults() {
		if (!$.get(results)) return;

		let text = `ASN & Geolocation Lookup for ${$.get(results).ip}\n`;

		text += `Generated at: ${$.get(results).timestamp}\n\n`;

		if ($.get(results).asn) {
			text += `ASN: AS${$.get(results).asn}\n`;

			if ($.get(results).asnOrg) text += `AS Organization: ${$.get(results).asnOrg}\n`;
		}

		if ($.get(results).isp) text += `ISP: ${$.get(results).isp}\n`;
		if ($.get(results).organization) text += `Organization: ${$.get(results).organization}\n`;

		text += `\nLocation:\n`;

		if ($.get(results).city) text += `City: ${$.get(results).city}\n`;
		if ($.get(results).regionName) text += `Region: ${$.get(results).regionName}\n`;
		if ($.get(results).country) text += `Country: ${$.get(results).country} (${$.get(results).countryCode})\n`;
		if ($.get(results).zip) text += `ZIP: ${$.get(results).zip}\n`;
		if ($.get(results).timezone) text += `Timezone: ${$.get(results).timezone}\n`;

		if ($.get(results).latitude !== undefined && $.get(results).longitude !== undefined) {
			text += `\nCoordinates: ${$.get(results).latitude}, ${$.get(results).longitude}\n`;
		}

		text += `\nConnection Type:\n`;
		text += `Mobile: ${$.get(results).mobile ? 'Yes' : 'No'}\n`;
		text += `Proxy/VPN: ${$.get(results).proxy ? 'Yes' : 'No'}\n`;
		text += `Hosting/Datacenter: ${$.get(results).hosting ? 'Yes' : 'No'}\n`;
		await navigator.clipboard.writeText(text);
		$.set(copiedState, true);
		setTimeout(() => $.set(copiedState, false), 1500);
	}

	var div = root_15();
	var header = $.child(div);
	var h1 = $.child(header);
	var text_1 = $.only_child(h1, true);
	var p = $.sibling(h1, 2);
	var text_2 = $.only_child(p, true);

	$.reset(header);

	var div_1 = $.sibling(header, 2);
	var details = $.child(div_1);
	var summary = $.child(details);
	var node = $.child(summary);

	Icon(node, { name: 'chevron-right', size: 'xs' });
	$.next(2);
	$.reset(summary);

	var div_2 = $.sibling(summary, 2);

	$.each(div_2, 21, () => examples, $.index, ($$anchor, example, i) => {
		var button = root();
		let classes;
		var h5 = $.child(button);
		var text_3 = $.only_child(h5, true);
		var p_1 = $.sibling(h5, 2);
		var text_4 = $.only_child(p_1, true);

		$.reset(button);
		$.action(button, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => `Look up ${$.get(example).ip}`);

		$.template_effect(() => {
			classes = $.set_class(button, 1, 'example-card', null, classes, { selected: $.get(selectedExampleIndex) === i });
			$.set_text(text_3, $.get(example).ip);
			$.set_text(text_4, $.get(example).description);
		});

		$.delegated('click', button, () => loadExample($.get(example), i));
		$.append($$anchor, button);
	});

	$.reset(div_2);
	$.reset(details);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var div_4 = $.sibling($.child(div_3), 2);
	var div_5 = $.child(div_4);
	var div_6 = $.child(div_5);
	var label = $.child(div_6);

	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter an IPv4 or IPv6 address');

	var input = $.sibling(label, 2);

	$.remove_input_defaults(input);
	$.reset(div_6);

	var button_1 = $.sibling(div_6, 2);
	var node_1 = $.child(button_1);

	{
		var consequent = ($$anchor) => {
			var fragment = root_1();
			var node_2 = $.first_child(fragment);

			Icon(node_2, { name: 'loader', size: 'sm', animate: 'spin' });
			$.next();
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_2();
			var node_3 = $.first_child(fragment_1);

			Icon(node_3, { name: 'search', size: 'sm' });
			$.next();
			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(loading)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button_1);
	$.reset(div_5);
	$.reset(div_4);
	$.reset(div_3);

	var node_4 = $.sibling(div_3, 2);

	{
		var consequent_9 = ($$anchor) => {
			var div_7 = root_11();
			var div_8 = $.child(div_7);
			var h3 = $.child(div_8);
			var text_5 = $.only_child(h3);
			var button_2 = $.sibling(h3, 2);
			var node_5 = $.child(button_2);

			{
				let $0 = $.derived(() => $.get(copiedState) ? 'check' : 'copy');

				Icon(node_5, {
					get name() {
						return $.get($0);
					},
					size: 'xs'
				});
			}

			var text_6 = $.sibling(node_5);

			$.reset(button_2);
			$.reset(div_8);

			var div_9 = $.sibling(div_8, 2);
			var div_10 = $.child(div_9);
			var div_11 = $.child(div_10);
			var div_12 = $.sibling($.child(div_11), 2);
			var node_6 = $.child(div_12);

			{
				var consequent_1 = ($$anchor) => {
					var div_13 = root_3();
					var node_7 = $.child(div_13);

					Icon(node_7, { name: 'hash', size: 'sm' });

					var div_14 = $.sibling(node_7, 2);
					var span = $.sibling($.child(div_14), 2);
					var text_7 = $.only_child(span);

					$.reset(div_14);
					$.reset(div_13);
					$.template_effect(() => $.set_text(text_7, `AS${$.get(results).asn ?? ''}`));
					$.append($$anchor, div_13);
				};

				$.if(node_6, ($$render) => {
					if ($.get(results).asn) $$render(consequent_1);
				});
			}

			var node_8 = $.sibling(node_6, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_15 = root_4();
					var node_9 = $.child(div_15);

					Icon(node_9, { name: 'building', size: 'sm' });

					var div_16 = $.sibling(node_9, 2);
					var span_1 = $.sibling($.child(div_16), 2);
					var text_8 = $.only_child(span_1, true);

					$.reset(div_16);
					$.reset(div_15);
					$.template_effect(() => $.set_text(text_8, $.get(results).asnOrg));
					$.append($$anchor, div_15);
				};

				$.if(node_8, ($$render) => {
					if ($.get(results).asnOrg) $$render(consequent_2);
				});
			}

			var node_10 = $.sibling(node_8, 2);

			{
				var consequent_3 = ($$anchor) => {
					var div_17 = root_5();
					var node_11 = $.child(div_17);

					Icon(node_11, { name: 'wifi', size: 'sm' });

					var div_18 = $.sibling(node_11, 2);
					var span_2 = $.sibling($.child(div_18), 2);
					var text_9 = $.only_child(span_2, true);

					$.reset(div_18);
					$.reset(div_17);
					$.template_effect(() => $.set_text(text_9, $.get(results).isp));
					$.append($$anchor, div_17);
				};

				$.if(node_10, ($$render) => {
					if ($.get(results).isp) $$render(consequent_3);
				});
			}

			$.reset(div_12);
			$.reset(div_11);

			var div_19 = $.sibling(div_11, 2);
			var div_20 = $.sibling($.child(div_19), 2);
			var node_12 = $.child(div_20);

			{
				var consequent_4 = ($$anchor) => {
					var div_21 = root_6();
					var node_13 = $.child(div_21);

					Icon(node_13, { name: 'flag', size: 'sm' });

					var div_22 = $.sibling(node_13, 2);
					var span_3 = $.sibling($.child(div_22), 2);
					var text_10 = $.only_child(span_3);

					$.reset(div_22);
					$.reset(div_21);
					$.template_effect(() => $.set_text(text_10, `${$.get(results).country ?? ''} (${$.get(results).countryCode ?? ''})`));
					$.append($$anchor, div_21);
				};

				$.if(node_12, ($$render) => {
					if ($.get(results).country) $$render(consequent_4);
				});
			}

			var node_14 = $.sibling(node_12, 2);

			{
				var consequent_5 = ($$anchor) => {
					var div_23 = root_7();
					var node_15 = $.child(div_23);

					Icon(node_15, { name: 'map-pin', size: 'sm' });

					var div_24 = $.sibling(node_15, 2);
					var span_4 = $.sibling($.child(div_24), 2);
					var text_11 = $.only_child(span_4, true);

					$.reset(div_24);
					$.reset(div_23);
					$.template_effect(() => $.set_text(text_11, $.get(results).regionName));
					$.append($$anchor, div_23);
				};

				$.if(node_14, ($$render) => {
					if ($.get(results).regionName) $$render(consequent_5);
				});
			}

			var node_16 = $.sibling(node_14, 2);

			{
				var consequent_6 = ($$anchor) => {
					var div_25 = root_8();
					var node_17 = $.child(div_25);

					Icon(node_17, { name: 'building', size: 'sm' });

					var div_26 = $.sibling(node_17, 2);
					var span_5 = $.sibling($.child(div_26), 2);
					var text_12 = $.only_child(span_5, true);

					$.reset(div_26);
					$.reset(div_25);
					$.template_effect(() => $.set_text(text_12, $.get(results).city));
					$.append($$anchor, div_25);
				};

				$.if(node_16, ($$render) => {
					if ($.get(results).city) $$render(consequent_6);
				});
			}

			var node_18 = $.sibling(node_16, 2);

			{
				var consequent_7 = ($$anchor) => {
					var div_27 = root_9();
					var node_19 = $.child(div_27);

					Icon(node_19, { name: 'clock', size: 'sm' });

					var div_28 = $.sibling(node_19, 2);
					var span_6 = $.sibling($.child(div_28), 2);
					var text_13 = $.only_child(span_6, true);

					$.reset(div_28);
					$.reset(div_27);
					$.template_effect(() => $.set_text(text_13, $.get(results).timezone));
					$.append($$anchor, div_27);
				};

				$.if(node_18, ($$render) => {
					if ($.get(results).timezone) $$render(consequent_7);
				});
			}

			$.reset(div_20);
			$.reset(div_19);

			var node_20 = $.sibling(div_19, 2);

			{
				var consequent_8 = ($$anchor) => {
					var div_29 = root_10();
					var div_30 = $.sibling($.child(div_29), 2);
					var div_31 = $.child(div_30);
					var div_32 = $.child(div_31);
					var node_21 = $.child(div_32);

					Icon(node_21, { name: 'navigation', size: 'md' });

					var div_33 = $.sibling(node_21, 2);
					var div_34 = $.child(div_33);
					var span_7 = $.sibling($.child(div_34), 2);
					var text_14 = $.only_child(span_7);

					$.reset(div_34);

					var div_35 = $.sibling(div_34, 2);
					var span_8 = $.sibling($.child(div_35), 2);
					var text_15 = $.only_child(span_8);

					$.reset(div_35);
					$.reset(div_33);
					$.reset(div_32);

					var a = $.sibling(div_32, 2);
					var node_22 = $.child(a);

					Icon(node_22, { name: 'external-link', size: 'xs' });
					$.next();
					$.reset(a);
					$.reset(div_31);

					var div_36 = $.sibling(div_31, 2);
					var iframe = $.only_child(div_36);

					$.reset(div_30);
					$.reset(div_29);

					$.template_effect(
						($0, $1) => {
							$.set_text(text_14, `${$0 ?? ''}°`);
							$.set_text(text_15, `${$1 ?? ''}°`);
							$.set_attribute(a, 'href', `https://www.openstreetmap.org/?mlat=${$.get(results).latitude}&mlon=${$.get(results).longitude}&zoom=12`);
							$.set_attribute(iframe, 'src', `https://www.openstreetmap.org/export/embed.html?bbox=${$.get(results).longitude - 0.1},${$.get(results).latitude - 0.1},${$.get(results).longitude + 0.1},${$.get(results).latitude + 0.1}&layer=mapnik&marker=${$.get(results).latitude},${$.get(results).longitude}`);
						},
						[
							() => $.get(results).latitude.toFixed(4),
							() => $.get(results).longitude.toFixed(4)
						]
					);

					$.append($$anchor, div_29);
				};

				$.if(node_20, ($$render) => {
					if ($.get(results).latitude !== undefined && $.get(results).longitude !== undefined) $$render(consequent_8);
				});
			}

			var div_37 = $.sibling(node_20, 2);
			var div_38 = $.sibling($.child(div_37), 2);
			var div_39 = $.child(div_38);
			let classes_1;
			var node_23 = $.child(div_39);

			{
				let $0 = $.derived(() => $.get(results).mobile ? 'check-circle' : 'circle');

				Icon(node_23, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			$.next(2);
			$.reset(div_39);

			var div_40 = $.sibling(div_39, 2);
			let classes_2;
			var node_24 = $.child(div_40);

			{
				let $0 = $.derived(() => $.get(results).proxy ? 'check-circle' : 'circle');

				Icon(node_24, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			$.next(2);
			$.reset(div_40);

			var div_41 = $.sibling(div_40, 2);
			let classes_3;
			var node_25 = $.child(div_41);

			{
				let $0 = $.derived(() => $.get(results).hosting ? 'check-circle' : 'circle');

				Icon(node_25, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			$.next(2);
			$.reset(div_41);
			$.reset(div_38);
			$.reset(div_37);
			$.reset(div_10);
			$.reset(div_9);
			$.reset(div_7);

			$.template_effect(() => {
				$.set_text(text_5, `Results for ${$.get(results).ip ?? ''}`);
				button_2.disabled = $.get(copiedState);
				$.set_text(text_6, ` ${$.get(copiedState) ? 'Copied!' : 'Copy Results'}`);
				classes_1 = $.set_class(div_39, 1, 'flag-item svelte-2zofru', null, classes_1, { active: $.get(results).mobile });
				classes_2 = $.set_class(div_40, 1, 'flag-item svelte-2zofru', null, classes_2, { active: $.get(results).proxy });
				classes_3 = $.set_class(div_41, 1, 'flag-item svelte-2zofru', null, classes_3, { active: $.get(results).hosting });
			});

			$.delegated('click', button_2, copyResults);
			$.append($$anchor, div_7);
		};

		$.if(node_4, ($$render) => {
			if ($.get(results)) $$render(consequent_9);
		});
	}

	var node_26 = $.sibling(node_4, 2);

	{
		var consequent_10 = ($$anchor) => {
			var div_42 = root_12();
			var div_43 = $.child(div_42);
			var div_44 = $.child(div_43);
			var node_27 = $.child(div_44);

			Icon(node_27, { name: 'alert-triangle', size: 'md' });

			var div_45 = $.sibling(node_27, 2);
			var p_2 = $.sibling($.child(div_45), 2);
			var text_16 = $.only_child(p_2, true);

			$.reset(div_45);
			$.reset(div_44);
			$.reset(div_43);
			$.reset(div_42);
			$.template_effect(() => $.set_text(text_16, $.get(error)));
			$.append($$anchor, div_42);
		};

		$.if(node_26, ($$render) => {
			if ($.get(error)) $$render(consequent_10);
		});
	}

	var div_46 = $.sibling(node_26, 2);
	var div_47 = $.sibling($.child(div_46), 2);
	var div_48 = $.child(div_47);
	var div_49 = $.child(div_48);
	var h4 = $.child(div_49);
	var text_17 = $.only_child(h4, true);
	var p_3 = $.sibling(h4, 2);
	var text_18 = $.only_child(p_3, true);

	$.reset(div_49);

	var div_50 = $.sibling(div_49, 2);
	var h4_1 = $.child(div_50);
	var text_19 = $.only_child(h4_1, true);
	var ul = $.sibling(h4_1, 2);

	$.each(ul, 21, () => asnGeoContent.sections.accuracy.levels, (level) => level.level, ($$anchor, level) => {
		var li = root_13();
		var strong = $.child(li);
		var text_20 = $.only_child(strong);
		var text_21 = $.sibling(strong);

		$.reset(li);

		$.template_effect(() => {
			$.set_text(text_20, `${$.get(level).level ?? ''} (${$.get(level).accuracy ?? ''}):`);
			$.set_text(text_21, ` ${$.get(level).description ?? ''}`);
		});

		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(div_50);

	var div_51 = $.sibling(div_50, 2);
	var h4_2 = $.child(div_51);
	var text_22 = $.only_child(h4_2, true);
	var p_4 = $.sibling(h4_2, 2);
	var text_23 = $.only_child(p_4, true);

	$.reset(div_51);

	var div_52 = $.sibling(div_51, 2);
	var h4_3 = $.child(div_52);
	var text_24 = $.only_child(h4_3, true);
	var p_5 = $.sibling(h4_3, 2);
	var text_25 = $.only_child(p_5, true);

	$.reset(div_52);
	$.reset(div_48);

	var div_53 = $.sibling(div_48, 2);
	var ul_1 = $.sibling($.child(div_53), 2);

	$.each(ul_1, 21, () => asnGeoContent.quickTips, $.index, ($$anchor, tip) => {
		var li_1 = root_14();
		var text_26 = $.only_child(li_1, true);

		$.template_effect(() => $.set_text(text_26, $.get(tip)));
		$.append($$anchor, li_1);
	});

	$.reset(ul_1);
	$.reset(div_53);
	$.reset(div_47);
	$.reset(div_46);
	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_text(text_1, asnGeoContent.title);
			$.set_text(text_2, asnGeoContent.description);
			button_1.disabled = $0;
			$.set_text(text_17, asnGeoContent.sections.whatIsGeoIP.title);
			$.set_text(text_18, asnGeoContent.sections.whatIsGeoIP.content);
			$.set_text(text_19, asnGeoContent.sections.accuracy.title);
			$.set_text(text_22, asnGeoContent.sections.asnExplained.title);
			$.set_text(text_23, asnGeoContent.sections.asnExplained.content);
			$.set_text(text_24, asnGeoContent.sections.dataSource.title);
			$.set_text(text_25, asnGeoContent.sections.dataSource.content);
		},
		[() => $.get(loading) || !$.get(ip).trim()]
	);

	$.delegated('change', input, () => {
		clearExampleSelection();

		if ($.get(ip).trim()) lookupIP();
	});

	$.bind_value(input, () => $.get(ip), ($$value) => $.set(ip, $$value));
	$.delegated('click', button_1, lookupIP);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'change']);