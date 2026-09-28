import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	parseParameterList,
	searchFingerprints,
	searchByDevice,
	analyzeOptions,
	formatParameterListToHex,
	formatParameterListDisplay,
	exportAsJSON,
	exportAsCSV,
	DHCP_OPTION_NAMES,
	FINGERPRINT_DATABASE
} from '$lib/utils/dhcp-fingerprinting';

import { untrack } from 'svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import { useClipboard } from '$lib/composables/useClipboard.svelte';

var root = $.from_html(`<div class="error-card svelte-1rwntcp"><strong class="svelte-1rwntcp">Error:</strong> <p class="svelte-1rwntcp"> </p></div>`);
var root_1 = $.from_html(`<div class="option-badge svelte-1rwntcp"><span class="option-num svelte-1rwntcp"> </span> <span class="option-name svelte-1rwntcp"> </span></div>`);
var root_2 = $.from_html(`<div class="warning-item svelte-1rwntcp"> </div>`);
var root_3 = $.from_html(`<div class="card warning-card svelte-1rwntcp"><h3 class="svelte-1rwntcp">Security Warnings</h3> <!></div>`);
var root_4 = $.from_html(`<div class="info-section svelte-1rwntcp"><h4 class="svelte-1rwntcp">Unusual Options Detected</h4> <p class="svelte-1rwntcp">These options may indicate vendor-specific configurations:</p> <code class="code-value svelte-1rwntcp"> </code></div>`);
var root_5 = $.from_html(`<div class="info-section svelte-1rwntcp"><h4 class="svelte-1rwntcp">Missing Options (vs. Best Match)</h4> <p class="svelte-1rwntcp">Options present in the best match but not in your fingerprint:</p> <code class="code-value svelte-1rwntcp"> </code></div>`);
var root_6 = $.from_html(`<div class="card analysis-card svelte-1rwntcp"><h3 class="svelte-1rwntcp">Option Analysis</h3> <!> <!></div>`);
var root_7 = $.from_html(`<div class="card result-card svelte-1rwntcp"><h3 class="svelte-1rwntcp">Requested DHCP Options</h3> <div class="result-item svelte-1rwntcp"><span class="label svelte-1rwntcp">Parameter List:</span> <code class="code-value svelte-1rwntcp"> </code> <button aria-label="Copy"> </button></div> <div class="result-item svelte-1rwntcp"><span class="label svelte-1rwntcp">Hex Encoded:</span> <code class="code-value svelte-1rwntcp"> </code> <button aria-label="Copy hex"> </button></div> <div class="options-grid svelte-1rwntcp"></div> <!> <!></div>`);
var root_8 = $.from_html(`<div class="detail-row svelte-1rwntcp"><span class="detail-label svelte-1rwntcp">Description:</span> <span> </span></div>`);
var root_9 = $.from_html(`<div class="match-item svelte-1rwntcp"><div class="match-header svelte-1rwntcp"><div class="match-title svelte-1rwntcp"><span class="category-badge svelte-1rwntcp"> </span> <h4 class="svelte-1rwntcp"> </h4> <span class="confidence svelte-1rwntcp"> </span></div> <div class="match-score svelte-1rwntcp"><span class="score-value svelte-1rwntcp"> </span> <span class="score-label svelte-1rwntcp">Match</span></div></div> <div class="match-details"><div class="detail-row svelte-1rwntcp"><span class="detail-label svelte-1rwntcp">OS:</span> <span> </span></div> <div class="detail-row svelte-1rwntcp"><span class="detail-label svelte-1rwntcp">Matched On:</span> <span> </span></div> <!> <div class="detail-row svelte-1rwntcp"><span class="detail-label svelte-1rwntcp">Known Parameters:</span> <code class="code-small svelte-1rwntcp"> </code></div></div></div>`);
var root_10 = $.from_html(`<div class="card matches-card svelte-1rwntcp"><div class="matches-header svelte-1rwntcp"><h3 class="svelte-1rwntcp"> </h3> <div class="export-buttons svelte-1rwntcp"><button class="btn btn-secondary btn-sm svelte-1rwntcp">Export JSON</button> <button class="btn btn-secondary btn-sm svelte-1rwntcp">Export CSV</button></div></div> <div class="matches-list"></div></div>`);
var root_11 = $.from_html(`<div class="card no-match-card svelte-1rwntcp"><h3 class="svelte-1rwntcp">No Matches Found</h3> <p class="svelte-1rwntcp">The provided fingerprint doesn't match any known devices in the database. This could be:</p> <ul class="svelte-1rwntcp"><li>A custom DHCP client configuration</li> <li>An uncommon device or operating system</li> <li>A device with a modified DHCP request list</li></ul> <p class="hint svelte-1rwntcp">Try adding the Vendor Class Identifier if available.</p></div>`);
var root_12 = $.from_html(`<!> <div class="card input-card svelte-1rwntcp"><h3 class="svelte-1rwntcp">Device Fingerprint Lookup</h3> <div class="form-group svelte-1rwntcp"><label for="param-list" class="svelte-1rwntcp">Parameter Request List (Option 55)</label> <input id="param-list" type="text" placeholder="e.g., 1,3,6,15 or 0103060f or 1 3 6 15" class="input svelte-1rwntcp"/> <span class="hint svelte-1rwntcp">Enter as comma-separated, hex, or space-separated numbers</span></div> <div class="form-group svelte-1rwntcp"><label for="vendor-class" class="svelte-1rwntcp">Vendor Class Identifier (Option 60) - Optional</label> <input id="vendor-class" type="text" placeholder="e.g., MSFT, dhcpcd, Cisco" class="input svelte-1rwntcp"/> <span class="hint svelte-1rwntcp">Helps improve match accuracy</span></div> <!></div> <!> <!>`, 1);
var root_13 = $.from_html(`<div class="detail-row svelte-1rwntcp"><span class="detail-label svelte-1rwntcp">Vendor Class Pattern:</span> <code class="code-small svelte-1rwntcp"> </code></div>`);
var root_14 = $.from_html(`<div class="reverse-item svelte-1rwntcp"><div class="reverse-header svelte-1rwntcp"><span class="category-badge svelte-1rwntcp"> </span> <h4 class="svelte-1rwntcp"> </h4> <span class="confidence"> </span></div> <div class="reverse-details svelte-1rwntcp"><div class="detail-row svelte-1rwntcp"><span class="detail-label svelte-1rwntcp">OS:</span> <span> </span></div> <!> <div class="detail-row svelte-1rwntcp"><span class="detail-label svelte-1rwntcp">Parameter Request List:</span> <code class="code-small svelte-1rwntcp"> </code> <button aria-label="Copy parameter list"> </button></div> <!></div></div>`);
var root_15 = $.from_html(`<div class="card result-card svelte-1rwntcp"><h3 class="svelte-1rwntcp"> </h3> <!></div>`);
var root_16 = $.from_html(`<div class="card no-match-card svelte-1rwntcp"><h3 class="svelte-1rwntcp">No Devices Found</h3> <p class="svelte-1rwntcp"> </p></div>`);
var root_17 = $.from_html(`<div class="card input-card svelte-1rwntcp"><h3 class="svelte-1rwntcp">Search by Device or OS</h3> <div class="form-group svelte-1rwntcp"><label for="reverse-query" class="svelte-1rwntcp">Search for Device/OS/Vendor</label> <input id="reverse-query" type="text" placeholder="e.g., iPhone, Windows, Cisco, Printer..." class="input svelte-1rwntcp"/> <span class="hint svelte-1rwntcp">Search the database by device name, OS, or vendor</span></div></div> <!>`, 1);

export default function DHCPFingerprinting($$anchor, $$props) {
	$.push($$props, true);

	const clipboard = useClipboard(1800);
	let activeTab = $.state('lookup');
	let parameterInput = $.state('');
	let vendorClass = $.state('');
	let matches = $.state($.proxy([]));
	let parsedParams = $.state($.proxy([]));
	let error = $.state('');
	let analysis = $.state(null);
	let reverseQuery = $.state('');
	let reverseResults = $.state($.proxy([]));

	const examples = [
		{
			label: 'Windows 10/11',
			description: 'Modern Windows desktop',
			params: '1,3,6,15,31,33,43,44,46,47,119,121,249,252',
			vendor: ''
		},

		{
			label: 'macOS/iOS',
			description: 'Apple device',
			params: '1,3,6,15,119,252',
			vendor: ''
		},

		{
			label: 'Android',
			description: 'Android smartphone',
			params: '1,3,6,15,26,28,51,58,59,43',
			vendor: 'dhcpcd'
		},

		{
			label: 'Linux (dhclient)',
			description: 'Linux with ISC dhclient',
			params: '1,3,6,15,26,28,42',
			vendor: ''
		},

		{
			label: 'Cisco IP Phone',
			description: 'Cisco VoIP device',
			params: '1,3,6,12,15,28,42,66,67,120,150',
			vendor: 'Cisco'
		},

		{
			label: 'Raspberry Pi',
			description: 'Raspberry Pi OS (Debian)',
			params: '1,3,6,12,15,28,40,41,42',
			vendor: ''
		},

		{
			label: 'Samsung Smart TV',
			description: 'Smart TV device',
			params: '1,3,6,12,15,28,40,41,42,119',
			vendor: 'SAMSUNG'
		}
	];

	const navOptions = [
		{
			value: 'lookup',
			label: 'Fingerprint Lookup',
			icon: 'fingerprint'
		},
		{ value: 'reverse', label: 'Device Search', icon: 'monitor' }
	];

	function loadExample(ex) {
		$.set(activeTab, 'lookup');
		$.set(parameterInput, ex.params, true);
		$.set(vendorClass, ex.vendor, true);
	}

	function downloadFile(content, filename, type) {
		const blob = new Blob([content], { type });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}

	function handleExportJSON() {
		if (!$.get(analysis) || $.get(matches).length === 0) return;

		const json = exportAsJSON($.get(parsedParams), $.get(matches), $.get(analysis), $.get(vendorClass) || undefined);

		downloadFile(json, 'dhcp-fingerprint.json', 'application/json');
	}

	function handleExportCSV() {
		if ($.get(matches).length === 0) return;

		const csv = exportAsCSV($.get(matches));

		downloadFile(csv, 'dhcp-fingerprint.csv', 'text/csv');
	}

	// Search effect for fingerprint lookup
	$.user_effect(() => {
		if ($.get(activeTab) !== 'lookup') return;

		const currentInput = $.get(parameterInput);
		const currentVendor = $.get(vendorClass);

		untrack(() => {
			if (!currentInput.trim()) {
				$.set(matches, [], true);
				$.set(parsedParams, [], true);
				$.set(error, '');
				$.set(analysis, null);

				return;
			}

			try {
				$.set(parsedParams, parseParameterList(currentInput), true);

				if ($.get(parsedParams).some(isNaN)) {
					$.set(error, 'Invalid parameter list format');
					$.set(matches, [], true);
					$.set(analysis, null);

					return;
				}

				$.set(matches, searchFingerprints($.get(parsedParams), currentVendor || undefined), true);
				$.set(analysis, analyzeOptions($.get(parsedParams), $.get(matches)), true);
				$.set(error, '');
			} catch(err) {
				$.set(error, err instanceof Error ? err.message : 'Error parsing input', true);
				$.set(matches, [], true);
				$.set(parsedParams, [], true);
				$.set(analysis, null);
			}
		});
	});

	// Search effect for reverse lookup
	$.user_effect(() => {
		if ($.get(activeTab) !== 'reverse') return;

		const currentQuery = $.get(reverseQuery);

		untrack(() => {
			if (!currentQuery.trim()) {
				$.set(reverseResults, [], true);

				return;
			}

			$.set(reverseResults, searchByDevice(currentQuery), true);
		});
	});

	const categoryColors = {
		desktop: 'var(--color-primary)',
		mobile: 'var(--color-info)',
		iot: 'var(--color-warning)',
		server: 'var(--color-success)',
		network: 'var(--color-purple)',
		gaming: 'var(--color-primary)',
		other: 'var(--text-tertiary)'
	};

	const confidenceBadges = { high: '🟢', medium: '🟡', low: '🔴' };

	ToolContentContainer($$anchor, {
		title: 'DHCP Fingerprinting Database',
		get description() {
			return `Identify devices based on their DHCP fingerprints using Parameter Request List (Option 55) and Vendor Class Identifier (Option 60). Database contains ${FINGERPRINT_DATABASE.length ?? ''} known fingerprints from common devices, operating systems, and IoT equipment.`;
		},

		get navOptions() {
			return navOptions;
		},

		get selectedNav() {
			return $.get(activeTab);
		},

		set selectedNav($$value) {
			$.set(activeTab, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent_9 = ($$anchor) => {
					var fragment_2 = root_12();
					var node_1 = $.first_child(fragment_2);

					ExamplesCard(node_1, {
						get examples() {
							return examples;
						},
						onSelect: loadExample,
						getLabel: (ex) => ex.label,
						getDescription: (ex) => ex.description
					});

					var div = $.sibling(node_1, 2);
					var div_1 = $.sibling($.child(div), 2);
					var input = $.sibling($.child(div_1), 2);

					$.remove_input_defaults(input);
					$.next(2);
					$.reset(div_1);

					var div_2 = $.sibling(div_1, 2);
					var input_1 = $.sibling($.child(div_2), 2);

					$.remove_input_defaults(input_1);
					$.next(2);
					$.reset(div_2);

					var node_2 = $.sibling(div_2, 2);

					{
						var consequent = ($$anchor) => {
							var div_3 = root();
							var p = $.sibling($.child(div_3), 2);
							var text = $.only_child(p, true);

							$.reset(div_3);
							$.template_effect(() => $.set_text(text, $.get(error)));
							$.append($$anchor, div_3);
						};

						$.if(node_2, ($$render) => {
							if ($.get(error)) $$render(consequent);
						});
					}

					$.reset(div);

					var node_3 = $.sibling(div, 2);

					{
						var consequent_5 = ($$anchor) => {
							var div_4 = root_7();
							var div_5 = $.sibling($.child(div_4), 2);
							var code = $.sibling($.child(div_5), 2);
							var text_1 = $.only_child(code, true);
							var button = $.sibling(code, 2);
							let classes;
							var text_2 = $.only_child(button, true);

							$.reset(div_5);

							var div_6 = $.sibling(div_5, 2);
							var code_1 = $.sibling($.child(div_6), 2);
							var text_3 = $.only_child(code_1, true);
							var button_1 = $.sibling(code_1, 2);
							let classes_1;
							var text_4 = $.only_child(button_1, true);

							$.reset(div_6);

							var div_7 = $.sibling(div_6, 2);

							$.each(div_7, 21, () => $.get(parsedParams), $.index, ($$anchor, param) => {
								var div_8 = root_1();
								var span = $.child(div_8);
								var text_5 = $.only_child(span, true);
								var span_1 = $.sibling(span, 2);
								var text_6 = $.only_child(span_1, true);

								$.reset(div_8);

								$.template_effect(() => {
									$.set_text(text_5, $.get(param));
									$.set_text(text_6, DHCP_OPTION_NAMES[$.get(param)] || 'Unknown');
								});

								$.append($$anchor, div_8);
							});

							$.reset(div_7);

							var node_4 = $.sibling(div_7, 2);

							{
								var consequent_1 = ($$anchor) => {
									var div_9 = root_3();
									var node_5 = $.sibling($.child(div_9), 2);

									$.each(node_5, 17, () => $.get(analysis).warnings, $.index, ($$anchor, warning) => {
										var div_10 = root_2();
										var text_7 = $.only_child(div_10);

										$.template_effect(() => $.set_text(text_7, `⚠️ ${$.get(warning) ?? ''}`));
										$.append($$anchor, div_10);
									});

									$.reset(div_9);
									$.append($$anchor, div_9);
								};

								$.if(node_4, ($$render) => {
									if ($.get(analysis) && $.get(analysis).warnings.length > 0) $$render(consequent_1);
								});
							}

							var node_6 = $.sibling(node_4, 2);

							{
								var consequent_4 = ($$anchor) => {
									var div_11 = root_6();
									var node_7 = $.sibling($.child(div_11), 2);

									{
										var consequent_2 = ($$anchor) => {
											var div_12 = root_4();
											var code_2 = $.sibling($.child(div_12), 4);
											var text_8 = $.only_child(code_2, true);

											$.reset(div_12);

											$.template_effect(($0) => $.set_text(text_8, $0), [
												() => $.get(analysis).unusual.map((o) => `${o} (${DHCP_OPTION_NAMES[o] || 'Unknown'})`).join(', ')
											]);

											$.append($$anchor, div_12);
										};

										$.if(node_7, ($$render) => {
											if ($.get(analysis).unusual.length > 0) $$render(consequent_2);
										});
									}

									var node_8 = $.sibling(node_7, 2);

									{
										var consequent_3 = ($$anchor) => {
											var div_13 = root_5();
											var code_3 = $.sibling($.child(div_13), 4);
											var text_9 = $.only_child(code_3, true);

											$.reset(div_13);

											$.template_effect(($0) => $.set_text(text_9, $0), [
												() => $.get(analysis).missing.map((o) => `${o} (${DHCP_OPTION_NAMES[o] || 'Unknown'})`).join(', ')
											]);

											$.append($$anchor, div_13);
										};

										$.if(node_8, ($$render) => {
											if ($.get(analysis).missing.length > 0 && $.get(matches).length > 0) $$render(consequent_3);
										});
									}

									$.reset(div_11);
									$.append($$anchor, div_11);
								};

								$.if(node_6, ($$render) => {
									if ($.get(analysis) && ($.get(analysis).unusual.length > 0 || $.get(analysis).missing.length > 0 && $.get(matches).length > 0)) $$render(consequent_4);
								});
							}

							$.reset(div_4);

							$.template_effect(
								($0, $1, $2, $3, $4, $5) => {
									$.set_text(text_1, $0);
									classes = $.set_class(button, 1, 'btn-copy svelte-1rwntcp', null, classes, { copied: $1 });
									$.set_text(text_2, $2);
									$.set_text(text_3, $3);
									classes_1 = $.set_class(button_1, 1, 'btn-copy svelte-1rwntcp', null, classes_1, { copied: $4 });
									$.set_text(text_4, $5);
								},
								[
									() => formatParameterListDisplay($.get(parsedParams)),
									() => clipboard.isCopied('param-list'),
									() => clipboard.isCopied('param-list') ? 'Copied' : 'Copy',
									() => formatParameterListToHex($.get(parsedParams)),
									() => clipboard.isCopied('param-hex'),
									() => clipboard.isCopied('param-hex') ? 'Copied' : 'Copy'
								]
							);

							$.delegated('click', button, () => clipboard.copy(formatParameterListDisplay($.get(parsedParams)), 'param-list'));
							$.delegated('click', button_1, () => clipboard.copy(formatParameterListToHex($.get(parsedParams)), 'param-hex'));
							$.append($$anchor, div_4);
						};

						$.if(node_3, ($$render) => {
							if ($.get(parsedParams).length > 0) $$render(consequent_5);
						});
					}

					var node_9 = $.sibling(node_3, 2);

					{
						var consequent_7 = ($$anchor) => {
							var div_14 = root_10();
							var div_15 = $.child(div_14);
							var h3 = $.child(div_15);
							var text_10 = $.only_child(h3);
							var div_16 = $.sibling(h3, 2);
							var button_2 = $.child(div_16);
							var button_3 = $.sibling(button_2, 2);

							$.reset(div_16);
							$.reset(div_15);

							var div_17 = $.sibling(div_15, 2);

							$.each(div_17, 21, () => $.get(matches), $.index, ($$anchor, match) => {
								var div_18 = root_9();
								var div_19 = $.child(div_18);
								var div_20 = $.child(div_19);
								var span_2 = $.child(div_20);
								var text_11 = $.only_child(span_2, true);
								var h4 = $.sibling(span_2, 2);
								var text_12 = $.only_child(h4, true);
								var span_3 = $.sibling(h4, 2);
								var text_13 = $.only_child(span_3);

								$.reset(div_20);

								var div_21 = $.sibling(div_20, 2);
								var span_4 = $.child(div_21);
								var text_14 = $.only_child(span_4);

								$.next(2);
								$.reset(div_21);
								$.reset(div_19);

								var div_22 = $.sibling(div_19, 2);
								var div_23 = $.child(div_22);
								var span_5 = $.sibling($.child(div_23), 2);
								var text_15 = $.only_child(span_5, true);

								$.reset(div_23);

								var div_24 = $.sibling(div_23, 2);
								var span_6 = $.sibling($.child(div_24), 2);
								var text_16 = $.only_child(span_6, true);

								$.reset(div_24);

								var node_10 = $.sibling(div_24, 2);

								{
									var consequent_6 = ($$anchor) => {
										var div_25 = root_8();
										var span_7 = $.sibling($.child(div_25), 2);
										var text_17 = $.only_child(span_7, true);

										$.reset(div_25);
										$.template_effect(() => $.set_text(text_17, $.get(match).fingerprint.description));
										$.append($$anchor, div_25);
									};

									$.if(node_10, ($$render) => {
										if ($.get(match).fingerprint.description) $$render(consequent_6);
									});
								}

								var div_26 = $.sibling(node_10, 2);
								var code_4 = $.sibling($.child(div_26), 2);
								var text_18 = $.only_child(code_4, true);

								$.reset(div_26);
								$.reset(div_22);
								$.reset(div_18);

								$.template_effect(
									($0, $1, $2) => {
										$.set_style(span_2, `background: ${(categoryColors[$.get(match).fingerprint.category] || categoryColors.other) ?? ''}`);
										$.set_text(text_11, $.get(match).fingerprint.category);
										$.set_text(text_12, $.get(match).fingerprint.device);

										$.set_text(text_13, `${(confidenceBadges[$.get(match).fingerprint.confidence] || '') ?? ''}
                    ${$.get(match).fingerprint.confidence ?? ''} confidence`);

										$.set_text(text_14, `${$0 ?? ''}%`);
										$.set_text(text_15, $.get(match).fingerprint.os);
										$.set_text(text_16, $1);
										$.set_text(text_18, $2);
									},
									[
										() => $.get(match).matchScore.toFixed(0),
										() => $.get(match).matchedOn.join(', '),
										() => formatParameterListDisplay($.get(match).fingerprint.parameterRequestList)
									]
								);

								$.append($$anchor, div_18);
							});

							$.reset(div_17);
							$.reset(div_14);
							$.template_effect(() => $.set_text(text_10, `Matching Devices (${$.get(matches).length ?? ''})`));
							$.delegated('click', button_2, handleExportJSON);
							$.delegated('click', button_3, handleExportCSV);
							$.append($$anchor, div_14);
						};

						var consequent_8 = ($$anchor) => {
							var div_27 = root_11();

							$.append($$anchor, div_27);
						};

						$.if(node_9, ($$render) => {
							if ($.get(matches).length > 0) $$render(consequent_7); else if ($.get(parsedParams).length > 0 && !$.get(error)) $$render(consequent_8, 1);
						});
					}

					$.bind_value(input, () => $.get(parameterInput), ($$value) => $.set(parameterInput, $$value));
					$.bind_value(input_1, () => $.get(vendorClass), ($$value) => $.set(vendorClass, $$value));
					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var fragment_3 = root_17();
					var div_28 = $.first_child(fragment_3);
					var div_29 = $.sibling($.child(div_28), 2);
					var input_2 = $.sibling($.child(div_29), 2);

					$.remove_input_defaults(input_2);
					$.next(2);
					$.reset(div_29);
					$.reset(div_28);

					var node_11 = $.sibling(div_28, 2);

					{
						var consequent_12 = ($$anchor) => {
							var div_30 = root_15();
							var h3_1 = $.child(div_30);
							var text_19 = $.only_child(h3_1);
							var node_12 = $.sibling(h3_1, 2);

							$.each(node_12, 17, () => $.get(reverseResults), $.index, ($$anchor, device, i) => {
								var div_31 = root_14();
								var div_32 = $.child(div_31);
								var span_8 = $.child(div_32);
								var text_20 = $.only_child(span_8, true);
								var h4_1 = $.sibling(span_8, 2);
								var text_21 = $.only_child(h4_1, true);
								var span_9 = $.sibling(h4_1, 2);
								var text_22 = $.only_child(span_9);

								$.reset(div_32);

								var div_33 = $.sibling(div_32, 2);
								var div_34 = $.child(div_33);
								var span_10 = $.sibling($.child(div_34), 2);
								var text_23 = $.only_child(span_10, true);

								$.reset(div_34);

								var node_13 = $.sibling(div_34, 2);

								{
									var consequent_10 = ($$anchor) => {
										var div_35 = root_8();
										var span_11 = $.sibling($.child(div_35), 2);
										var text_24 = $.only_child(span_11, true);

										$.reset(div_35);
										$.template_effect(() => $.set_text(text_24, $.get(device).description));
										$.append($$anchor, div_35);
									};

									$.if(node_13, ($$render) => {
										if ($.get(device).description) $$render(consequent_10);
									});
								}

								var div_36 = $.sibling(node_13, 2);
								var code_5 = $.sibling($.child(div_36), 2);
								var text_25 = $.only_child(code_5, true);
								var button_4 = $.sibling(code_5, 2);
								let classes_2;
								var text_26 = $.only_child(button_4, true);

								$.reset(div_36);

								var node_14 = $.sibling(div_36, 2);

								{
									var consequent_11 = ($$anchor) => {
										var div_37 = root_13();
										var code_6 = $.sibling($.child(div_37), 2);
										var text_27 = $.only_child(code_6, true);

										$.reset(div_37);
										$.template_effect(() => $.set_text(text_27, $.get(device).vendorClassPattern));
										$.append($$anchor, div_37);
									};

									$.if(node_14, ($$render) => {
										if ($.get(device).vendorClassPattern) $$render(consequent_11);
									});
								}

								$.reset(div_33);
								$.reset(div_31);

								$.template_effect(
									($0, $1, $2) => {
										$.set_style(span_8, `background: ${(categoryColors[$.get(device).category] || categoryColors.other) ?? ''}`);
										$.set_text(text_20, $.get(device).category);
										$.set_text(text_21, $.get(device).device);

										$.set_text(text_22, `${(confidenceBadges[$.get(device).confidence] || '') ?? ''}
                ${$.get(device).confidence ?? ''} confidence`);

										$.set_text(text_23, $.get(device).os);
										$.set_text(text_25, $0);
										classes_2 = $.set_class(button_4, 1, 'btn-copy svelte-1rwntcp', null, classes_2, { copied: $1 });
										$.set_text(text_26, $2);
									},
									[
										() => formatParameterListDisplay($.get(device).parameterRequestList),
										() => clipboard.isCopied(`reverse-${i}`),
										() => clipboard.isCopied(`reverse-${i}`) ? 'Copied' : 'Copy'
									]
								);

								$.delegated('click', button_4, () => clipboard.copy(formatParameterListDisplay($.get(device).parameterRequestList), `reverse-${i}`));
								$.append($$anchor, div_31);
							});

							$.reset(div_30);
							$.template_effect(() => $.set_text(text_19, `Found ${$.get(reverseResults).length ?? ''} Device${$.get(reverseResults).length > 1 ? 's' : ''}`));
							$.append($$anchor, div_30);
						};

						var consequent_13 = ($$anchor) => {
							var div_38 = root_16();
							var p_1 = $.sibling($.child(div_38), 2);
							var text_28 = $.only_child(p_1);

							$.reset(div_38);
							$.template_effect(() => $.set_text(text_28, `No devices matched "${$.get(reverseQuery) ?? ''}". Try a different search term.`));
							$.append($$anchor, div_38);
						};

						var d = $.derived(() => $.get(reverseQuery).trim());

						$.if(node_11, ($$render) => {
							if ($.get(reverseResults).length > 0) $$render(consequent_12); else if ($.get(d)) $$render(consequent_13, 1);
						});
					}

					$.bind_value(input_2, () => $.get(reverseQuery), ($$value) => $.set(reverseQuery, $$value));
					$.append($$anchor, fragment_3);
				};

				$.if(node, ($$render) => {
					if ($.get(activeTab) === 'lookup') $$render(consequent_9); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);