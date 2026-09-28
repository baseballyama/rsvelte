import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import { generateRandomIPAddresses } from '$lib/utils/random-ip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { useClipboard } from '$lib/composables';
import '../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<button><div class="example-input"> </div> <div class="example-description"> </div></button>`);
var root_1 = $.from_html(`<div class="loading"><!> Generating random IPs...</div>`);
var root_2 = $.from_html(`<div class="error-message svelte-jhsjpm"><!> <span class="svelte-jhsjpm"> </span></div>`);
var root_3 = $.from_html(`<div class="card error-card svelte-jhsjpm"><div class="card-header row"><h3><!> Errors</h3></div> <div class="card-content"></div></div>`);
var root_4 = $.from_html(`<button type="button"> <!></button>`);
var root_5 = $.from_html(`<div class="all-ips-list svelte-jhsjpm"></div>`);
var root_6 = $.from_html(`<div class="info-item"><span class="info-label">Seed:</span> <button type="button" class="code-button info-code" title="Click to copy"> </button></div>`);
var root_7 = $.from_html(`<div class="network-details"><h4>Network Range</h4> <div class="range-info"><div class="range-item"><span class="range-label">Start:</span> <button type="button" class="code-button range-code" title="Click to copy"> </button></div> <div class="range-item"><span class="range-label">End:</span> <button type="button" class="code-button range-code" title="Click to copy"> </button></div> <div class="range-item"><span class="range-label">Total:</span> <span class="range-value"> </span></div></div></div>`);
var root_8 = $.from_html(`<div class="generated-ips svelte-jhsjpm"><div class="details-header svelte-jhsjpm"><h4 class="svelte-jhsjpm"> </h4></div> <div class="ips-list svelte-jhsjpm"></div></div>`);
var root_9 = $.from_html(`<div class="generation-details svelte-jhsjpm"><div class="generation-info svelte-jhsjpm"><div class="info-grid svelte-jhsjpm"><div class="info-item"><span class="info-label">Requested:</span> <span class="info-value"> </span></div> <div class="info-item"><span class="info-label">Generated:</span> <span class="info-value"> </span></div> <div class="info-item"><span class="info-label">Unique:</span> <span class="info-value"> </span></div> <!></div></div> <!> <!></div>`);
var root_10 = $.from_html(`<div><div class="card-header row"><div class="network-info"><span class="network-text"> </span> <div class="network-meta"><span class="network-type"> </span> <span class="ip-version"> </span></div></div> <div class="status svelte-jhsjpm"><!></div></div> <!></div>`);
var root_11 = $.from_html(`<div class="card summary-card svelte-jhsjpm"><div class="card-header row"><h3>Generation Summary</h3> <button><!> </button></div> <div class="card-content"><div class="summary-stats svelte-jhsjpm"><div class="info-card"><div class="info-label">Total Networks</div> <div class="metric-value"> </div></div> <div class="info-card"><div class="info-label">Valid</div> <div class="metric-value success"> </div></div> <div class="info-card"><div class="info-label">Invalid</div> <div class="metric-value error"> </div></div> <div class="info-card"><div class="info-label">Total IPs</div> <div class="metric-value info"> </div></div> <div class="info-card"><div class="info-label">Unique IPs</div> <div class="metric-value"> </div></div></div></div></div> <div class="card all-ips-card svelte-jhsjpm"><div class="card-header row"><h3> </h3> <div class="export-buttons svelte-jhsjpm"><button><!> </button> <button class="svelte-jhsjpm"><!> TXT</button> <button class="svelte-jhsjpm"><!> CSV</button> <button class="svelte-jhsjpm"><!> JSON</button></div></div> <div class="card-content"><!></div></div> <div class="generations"><h3>Network Generations</h3> <div class="generations-list svelte-jhsjpm"></div></div>`, 1);
var root_12 = $.from_html(`<div class="results-container svelte-jhsjpm"><!> <!></div>`);

var root_13 = $.from_html(`<div class="tool-container"><div class="tool-header"><h1>Random IP Generator</h1> <p>Generate random IP addresses from networks and ranges with uniqueness control and seeded randomness</p></div> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary"><!> <h4>Quick Examples</h4></summary> <div class="examples-grid"></div></details></div> <div class="card"><h3>Network Configuration</h3> <div class="form-row svelte-jhsjpm"><div class="textarea-group svelte-jhsjpm"><div class="form-group svelte-jhsjpm"><label for="inputs" class="svelte-jhsjpm">Networks and Counts</label> <textarea id="inputs" placeholder="192.168.1.0/24 x 10
10.0.0.0-10.0.0.255 5
172.16.0.0/16 * 3
2001:db8::/64[15]" rows="6" class="svelte-jhsjpm"></textarea> <div class="input-help svelte-jhsjpm">Formats: network x count, network * count, network count, network#count, network[count]</div></div></div> <div class="options-group svelte-jhsjpm"><div class="option-card svelte-jhsjpm"><label for="default-count" class="svelte-jhsjpm">Default Count</label> <input id="default-count" type="number" min="1" max="1000" placeholder="5" class="svelte-jhsjpm"/></div> <div class="checkbox-group"><label class="checkbox-label"><input type="checkbox"/> <span class="checkmark"></span> Unique IPs Only</label></div> <div class="option-card svelte-jhsjpm"><label for="seed" class="svelte-jhsjpm">Random Seed</label> <div class="seed-input svelte-jhsjpm"><input id="seed" type="text" placeholder="Optional seed for reproducible results" class="svelte-jhsjpm"/> <button type="button" class="svelte-jhsjpm"><!></button></div></div></div></div></div> <!> <!></div>`);

export default function RandomIP($$anchor, $$props) {
	$.push($$props, true);

	let inputText = $.state('192.168.1.0/24 x 10\n10.0.0.0-10.0.0.255 5\n172.16.0.0/16 * 3\n2001:db8::/64[15]');
	let defaultCount = $.state(5);
	let unique = $.state(true);
	let seed = $.state('');
	let result = $.state(null);
	let isLoading = $.state(false);
	let selectedExampleIndex = $.state(null);
	let _userModified = $.state(false);
	const clipboard = useClipboard();

	const examples = [
		{
			input: '192.168.1.0/24 x 5',
			description: 'Generate 5 random IPs from a /24 subnet'
		},

		{
			input: '10.0.0.0-10.0.0.255 * 3\n172.16.0.0/16 [8]',
			description: 'Multiple formats: range and CIDR with different counts'
		},

		{
			input: '2001:db8::/64 # 10\nfe80::/10 x 5',
			description: 'IPv6 networks with various syntax formats'
		},

		{
			input: '192.168.0.0/16 100\n203.0.113.0/24 * 20',
			description: 'Large generation counts from different networks'
		},

		{
			input: '127.0.0.0/8\n::1/128 x 1\n169.254.0.0/16 [10]',
			description: 'Special-use addresses: loopback and link-local'
		},

		{
			input: '198.51.100.0/24 * 15\n198.18.0.0/15 [25]',
			description: 'Test networks for documentation and benchmarking'
		}
	];

	function generateIPs() {
		if (!$.get(inputText).trim()) {
			$.set(result, null);

			return;
		}

		$.set(isLoading, true);

		try {
			const inputs = $.get(inputText).split('\n').filter((line) => line.trim());
			const actualSeed = $.get(seed).trim() || undefined;

			$.set(result, generateRandomIPAddresses(inputs, $.get(defaultCount), $.get(unique), actualSeed), true);
		} catch(error) {
			$.set(
				result,
				{
					generations: [],
					summary: {
						totalNetworks: 0,
						validNetworks: 0,
						invalidNetworks: 0,
						totalIPsGenerated: 0,
						uniqueIPsGenerated: 0
					},
					errors: [error instanceof Error ? error.message : 'Unknown error'],
					allGeneratedIPs: []
				},
				true
			);
		} finally {
			$.set(isLoading, false);
		}
	}

	function exportResults(format) {
		if (!$.get(result)) return;

		const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
		let content = '';
		let filename = '';
		let mimeType = 'text/plain';

		if (format === 'csv') {
			const headers = 'Network,Type,Version,Requested,Generated,Seed,Valid,Error';
			const rows = $.get(result).generations.map((gen) => `"${gen.network}","${gen.networkType}","IPv${gen.version}","${gen.requestedCount}","${gen.generatedIPs.length}","${gen.seed || ''}","${gen.isValid}","${gen.error || ''}"`);

			content = [headers, ...rows].join('\n');
			filename = `random-ips-${timestamp}.csv`;
			mimeType = 'text/csv';
		} else if (format === 'json') {
			content = JSON.stringify($.get(result), null, 2);
			filename = `random-ips-${timestamp}.json`;
			mimeType = 'application/json';
		} else {
			// Plain text format with just the IPs
			content = $.get(result).allGeneratedIPs.join('\n');

			filename = `random-ips-${timestamp}.txt`;
			mimeType = 'text/plain';
		}

		const blob = new Blob([content], { type: mimeType });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}

	function copyAllIPs() {
		if ($.get(result) && $.get(result).allGeneratedIPs.length > 0) {
			clipboard.copy($.get(result).allGeneratedIPs.join('\n'), 'all-ips');
		}
	}

	function generateNewSeed() {
		$.set(seed, Math.random().toString(36).substring(2, 15), true);
	}

	function selectExample(index) {
		const example = examples[index];

		if (example) {
			$.set(inputText, example.input, true);
			$.set(selectedExampleIndex, index, true);
			$.set(_userModified, false);
		}
	}

	function handleInputChange() {
		$.set(_userModified, true);
		$.set(selectedExampleIndex, null);
	}

	// Auto-generate when inputs change
	$.user_effect(() => {
		if ($.get(inputText).trim()) {
			const timeoutId = setTimeout(generateIPs, 300);

			return () => clearTimeout(timeoutId);
		}
	});

	var div = root_13();
	var div_1 = $.sibling($.child(div), 2);
	var details = $.child(div_1);
	var summary = $.child(details);
	var node = $.child(summary);

	Icon(node, { name: 'chevron-right', size: 'xs' });
	$.next(2);
	$.reset(summary);
	$.action(summary, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Click to see example inputs');

	var div_2 = $.sibling(summary, 2);

	$.each(div_2, 23, () => examples, (example, index) => `${example.input}-${index}`, ($$anchor, example, index) => {
		var button = root();
		let classes;
		var div_3 = $.child(button);
		var text = $.only_child(div_3);
		var div_4 = $.sibling(div_3, 2);
		var text_1 = $.only_child(div_4, true);

		$.reset(button);
		$.action(button, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => $.get(example).description);

		$.template_effect(
			($0, $1) => {
				classes = $.set_class(button, 1, 'example-card', null, classes, { selected: $.get(selectedExampleIndex) === $.get(index) });
				$.set_text(text, `${$0 ?? ''}${$1 ?? ''}`);
				$.set_text(text_1, $.get(example).description);
			},
			[
				() => $.get(example).input.split('\n')[0],
				() => $.get(example).input.includes('\n') ? '...' : ''
			]
		);

		$.delegated('click', button, () => selectExample($.get(index)));
		$.append($$anchor, button);
	});

	$.reset(div_2);
	$.reset(details);
	$.reset(div_1);

	var div_5 = $.sibling(div_1, 2);
	var div_6 = $.sibling($.child(div_5), 2);
	var div_7 = $.child(div_6);
	var div_8 = $.child(div_7);
	var label = $.child(div_8);

	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter networks with generation counts using various formats');

	var textarea = $.sibling(label, 2);

	$.remove_textarea_child(textarea);
	$.effect(() => $.bind_value(textarea, () => $.get(inputText), ($$value) => $.set(inputText, $$value)));
	$.action(textarea, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Specify networks and generation counts');
	$.next(2);
	$.reset(div_8);
	$.reset(div_7);

	var div_9 = $.sibling(div_7, 2);
	var div_10 = $.child(div_9);
	var label_1 = $.child(div_10);

	$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Number of IPs to generate when count is not specified');

	var input = $.sibling(label_1, 2);

	$.remove_input_defaults(input);
	$.effect(() => $.bind_value(input, () => $.get(defaultCount), ($$value) => $.set(defaultCount, $$value)));
	$.action(input, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Default generation count');
	$.reset(div_10);

	var div_11 = $.sibling(div_10, 2);
	var label_2 = $.child(div_11);
	var input_1 = $.child(label_2);

	$.remove_input_defaults(input_1);
	$.next(3);
	$.reset(label_2);
	$.action(label_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Ensure all generated IPs are unique within each network');
	$.reset(div_11);

	var div_12 = $.sibling(div_11, 2);
	var label_3 = $.child(div_12);

	$.action(label_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Use the same seed for reproducible random results');

	var div_13 = $.sibling(label_3, 2);
	var input_2 = $.child(div_13);

	$.remove_input_defaults(input_2);
	$.effect(() => $.bind_value(input_2, () => $.get(seed), ($$value) => $.set(seed, $$value)));
	$.action(input_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter seed for reproducible randomness');

	var button_1 = $.sibling(input_2, 2);
	var node_1 = $.child(button_1);

	Icon(node_1, { name: 'refresh', size: 'sm' });
	$.reset(button_1);
	$.action(button_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Generate new random seed');
	$.reset(div_13);
	$.reset(div_12);
	$.reset(div_9);
	$.reset(div_6);
	$.reset(div_5);

	var node_2 = $.sibling(div_5, 2);

	{
		var consequent = ($$anchor) => {
			var div_14 = root_1();
			var node_3 = $.child(div_14);

			Icon(node_3, { name: 'loader' });
			$.next();
			$.reset(div_14);
			$.append($$anchor, div_14);
		};

		$.if(node_2, ($$render) => {
			if ($.get(isLoading)) $$render(consequent);
		});
	}

	var node_4 = $.sibling(node_2, 2);

	{
		var consequent_9 = ($$anchor) => {
			var div_15 = root_12();
			var node_5 = $.child(div_15);

			{
				var consequent_1 = ($$anchor) => {
					var div_16 = root_3();
					var div_17 = $.child(div_16);
					var h3 = $.child(div_17);
					var node_6 = $.child(h3);

					Icon(node_6, { name: 'alert-triangle', size: 'sm' });
					$.next();
					$.reset(h3);
					$.reset(div_17);

					var div_18 = $.sibling(div_17, 2);

					$.each(div_18, 21, () => $.get(result).errors, $.index, ($$anchor, error) => {
						var div_19 = root_2();
						var node_7 = $.child(div_19);

						Icon(node_7, { name: 'alert-circle', size: 'sm' });

						var span = $.sibling(node_7, 2);
						var text_2 = $.only_child(span, true);

						$.reset(div_19);
						$.template_effect(() => $.set_text(text_2, $.get(error)));
						$.append($$anchor, div_19);
					});

					$.reset(div_18);
					$.reset(div_16);
					$.append($$anchor, div_16);
				};

				$.if(node_5, ($$render) => {
					if ($.get(result).errors.length > 0) $$render(consequent_1);
				});
			}

			var node_8 = $.sibling(node_5, 2);

			{
				var consequent_8 = ($$anchor) => {
					var fragment = root_11();
					var div_20 = $.first_child(fragment);
					var div_21 = $.child(div_20);
					var button_2 = $.sibling($.child(div_21), 2);
					let classes_1;
					var node_9 = $.child(button_2);

					{
						let $0 = $.derived(() => clipboard.isCopied('summary') ? 'check' : 'copy');

						Icon(node_9, {
							get name() {
								return $.get($0);
							},
							size: 'xs'
						});
					}

					var text_3 = $.sibling(node_9);

					$.reset(button_2);
					$.action(button_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Copy summary to clipboard');
					$.reset(div_21);

					var div_22 = $.sibling(div_21, 2);
					var div_23 = $.child(div_22);
					var div_24 = $.child(div_23);
					var div_25 = $.child(div_24);

					$.action(div_25, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Total number of networks processed');

					var div_26 = $.sibling(div_25, 2);
					var text_4 = $.only_child(div_26, true);

					$.reset(div_24);

					var div_27 = $.sibling(div_24, 2);
					var div_28 = $.child(div_27);

					$.action(div_28, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Networks that were processed successfully');

					var div_29 = $.sibling(div_28, 2);
					var text_5 = $.only_child(div_29, true);

					$.reset(div_27);

					var div_30 = $.sibling(div_27, 2);
					var div_31 = $.child(div_30);

					$.action(div_31, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Networks that had processing errors');

					var div_32 = $.sibling(div_31, 2);
					var text_6 = $.only_child(div_32, true);

					$.reset(div_30);

					var div_33 = $.sibling(div_30, 2);
					var div_34 = $.child(div_33);

					$.action(div_34, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Total IP addresses generated across all networks');

					var div_35 = $.sibling(div_34, 2);
					var text_7 = $.only_child(div_35, true);

					$.reset(div_33);

					var div_36 = $.sibling(div_33, 2);
					var div_37 = $.child(div_36);

					$.action(div_37, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Number of unique IP addresses generated');

					var div_38 = $.sibling(div_37, 2);
					var text_8 = $.only_child(div_38, true);

					$.reset(div_36);
					$.reset(div_23);
					$.reset(div_22);
					$.reset(div_20);

					var div_39 = $.sibling(div_20, 2);
					var div_40 = $.child(div_39);
					var h3_1 = $.child(div_40);
					var text_9 = $.only_child(h3_1);
					var div_41 = $.sibling(h3_1, 2);
					var button_3 = $.child(div_41);
					let classes_2;
					var node_10 = $.child(button_3);

					{
						let $0 = $.derived(() => clipboard.isCopied('all-ips') ? 'check' : 'copy');

						Icon(node_10, {
							get name() {
								return $.get($0);
							},
							size: 'xs'
						});
					}

					var text_10 = $.sibling(node_10);

					$.reset(button_3);
					$.action(button_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Copy all generated IPs to clipboard');

					var button_4 = $.sibling(button_3, 2);
					var node_11 = $.child(button_4);

					Icon(node_11, { name: 'download', size: 'xs' });
					$.next();
					$.reset(button_4);
					$.action(button_4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Export as plain text file');

					var button_5 = $.sibling(button_4, 2);
					var node_12 = $.child(button_5);

					Icon(node_12, { name: 'csv-file', size: 'xs' });
					$.next();
					$.reset(button_5);
					$.action(button_5, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Export as CSV file');

					var button_6 = $.sibling(button_5, 2);
					var node_13 = $.child(button_6);

					Icon(node_13, { name: 'json-file', size: 'xs' });
					$.next();
					$.reset(button_6);
					$.action(button_6, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Export as JSON file');
					$.reset(div_41);
					$.reset(div_40);

					var div_42 = $.sibling(div_40, 2);
					var node_14 = $.child(div_42);

					{
						var consequent_2 = ($$anchor) => {
							var div_43 = root_5();

							$.each(div_43, 23, () => $.get(result).allGeneratedIPs, (ip, index) => `${ip}-${index}`, ($$anchor, ip, index) => {
								var button_7 = root_4();
								let classes_3;
								var text_11 = $.child(button_7);
								var node_15 = $.sibling(text_11);

								{
									let $0 = $.derived(() => clipboard.isCopied(`ip-${$.get(index)}`) ? 'check' : 'copy');

									Icon(node_15, {
										get name() {
											return $.get($0);
										},
										size: 'xs'
									});
								}

								$.reset(button_7);
								$.action(button_7, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Click to copy IP address');

								$.template_effect(
									($0) => {
										classes_3 = $.set_class(button_7, 1, 'ip-tag svelte-jhsjpm', null, classes_3, { copied: $0 });
										$.set_text(text_11, `${$.get(ip) ?? ''} `);
									},
									[() => clipboard.isCopied(`ip-${$.get(index)}`)]
								);

								$.delegated('click', button_7, () => clipboard.copy($.get(ip), `ip-${$.get(index)}`));
								$.append($$anchor, button_7);
							});

							$.reset(div_43);
							$.append($$anchor, div_43);
						};

						$.if(node_14, ($$render) => {
							if ($.get(result).allGeneratedIPs.length > 0) $$render(consequent_2);
						});
					}

					$.reset(div_42);
					$.reset(div_39);

					var div_44 = $.sibling(div_39, 2);
					var div_45 = $.sibling($.child(div_44), 2);

					$.each(div_45, 21, () => $.get(result).generations, $.index, ($$anchor, generation, index) => {
						var div_46 = root_10();
						let classes_4;
						var div_47 = $.child(div_46);
						var div_48 = $.child(div_47);
						var span_1 = $.child(div_48);
						var text_12 = $.only_child(span_1, true);
						var div_49 = $.sibling(span_1, 2);
						var span_2 = $.child(div_49);
						var text_13 = $.only_child(span_2, true);
						var span_3 = $.sibling(span_2, 2);
						var text_14 = $.only_child(span_3);

						$.reset(div_49);
						$.reset(div_48);

						var div_50 = $.sibling(div_48, 2);
						var node_16 = $.child(div_50);

						{
							var consequent_3 = ($$anchor) => {
								Icon($$anchor, { name: 'check-circle' });
							};

							var alternate = ($$anchor) => {
								Icon($$anchor, { name: 'x-circle' });
							};

							$.if(node_16, ($$render) => {
								if ($.get(generation).isValid) $$render(consequent_3); else $$render(alternate, -1);
							});
						}

						$.reset(div_50);
						$.reset(div_47);

						var node_17 = $.sibling(div_47, 2);

						{
							var consequent_7 = ($$anchor) => {
								var div_51 = root_9();
								var div_52 = $.child(div_51);
								var div_53 = $.child(div_52);
								var div_54 = $.child(div_53);
								var span_4 = $.sibling($.child(div_54), 2);
								var text_15 = $.only_child(span_4, true);

								$.reset(div_54);

								var div_55 = $.sibling(div_54, 2);
								var span_5 = $.sibling($.child(div_55), 2);
								var text_16 = $.only_child(span_5, true);

								$.reset(div_55);

								var div_56 = $.sibling(div_55, 2);
								var span_6 = $.sibling($.child(div_56), 2);
								var text_17 = $.only_child(span_6, true);

								$.reset(div_56);

								var node_18 = $.sibling(div_56, 2);

								{
									var consequent_4 = ($$anchor) => {
										var div_57 = root_6();
										var button_8 = $.sibling($.child(div_57), 2);
										var text_18 = $.only_child(button_8, true);

										$.reset(div_57);
										$.template_effect(() => $.set_text(text_18, $.get(generation).seed));
										$.delegated('click', button_8, () => clipboard.copy($.get(generation).seed, 'seed'));
										$.append($$anchor, div_57);
									};

									$.if(node_18, ($$render) => {
										if ($.get(generation).seed) $$render(consequent_4);
									});
								}

								$.reset(div_53);
								$.reset(div_52);

								var node_19 = $.sibling(div_52, 2);

								{
									var consequent_5 = ($$anchor) => {
										var div_58 = root_7();
										var div_59 = $.sibling($.child(div_58), 2);
										var div_60 = $.child(div_59);
										var button_9 = $.sibling($.child(div_60), 2);
										var text_19 = $.only_child(button_9, true);

										$.reset(div_60);

										var div_61 = $.sibling(div_60, 2);
										var button_10 = $.sibling($.child(div_61), 2);
										var text_20 = $.only_child(button_10, true);

										$.reset(div_61);

										var div_62 = $.sibling(div_61, 2);
										var span_7 = $.sibling($.child(div_62), 2);
										var text_21 = $.only_child(span_7, true);

										$.reset(div_62);
										$.reset(div_59);
										$.reset(div_58);

										$.template_effect(() => {
											$.set_text(text_19, $.get(generation).networkDetails.start);
											$.set_text(text_20, $.get(generation).networkDetails.end);
											$.set_text(text_21, $.get(generation).networkDetails.totalAddresses);
										});

										$.delegated('click', button_9, () => clipboard.copy($.get(generation).networkDetails.start, 'start'));
										$.delegated('click', button_10, () => clipboard.copy($.get(generation).networkDetails.end, 'end'));
										$.append($$anchor, div_58);
									};

									$.if(node_19, ($$render) => {
										if ($.get(generation).networkDetails) $$render(consequent_5);
									});
								}

								var node_20 = $.sibling(node_19, 2);

								{
									var consequent_6 = ($$anchor) => {
										var div_63 = root_8();
										var div_64 = $.child(div_63);
										var h4 = $.child(div_64);
										var text_22 = $.only_child(h4);

										$.reset(div_64);

										var div_65 = $.sibling(div_64, 2);

										$.each(div_65, 23, () => $.get(generation).generatedIPs, (ip, ipIndex) => `${ip}-${ipIndex}`, ($$anchor, ip, ipIndex) => {
											var button_11 = root_4();
											let classes_5;
											var text_23 = $.child(button_11);
											var node_21 = $.sibling(text_23);

											{
												let $0 = $.derived(() => clipboard.isCopied(`gen-${index}-ip-${$.get(ipIndex)}`) ? 'check' : 'copy');

												Icon(node_21, {
													get name() {
														return $.get($0);
													},
													size: 'xs'
												});
											}

											$.reset(button_11);
											$.action(button_11, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Click to copy IP address');

											$.template_effect(
												($0) => {
													classes_5 = $.set_class(button_11, 1, 'ip-tag svelte-jhsjpm', null, classes_5, { copied: $0 });
													$.set_text(text_23, `${$.get(ip) ?? ''} `);
												},
												[
													() => clipboard.isCopied(`gen-${index}-ip-${$.get(ipIndex)}`)
												]
											);

											$.delegated('click', button_11, () => clipboard.copy($.get(ip), `gen-${index}-ip-${$.get(ipIndex)}`));
											$.append($$anchor, button_11);
										});

										$.reset(div_65);
										$.reset(div_63);
										$.template_effect(() => $.set_text(text_22, `Generated IPs (${$.get(generation).generatedIPs.length ?? ''})`));
										$.append($$anchor, div_63);
									};

									$.if(node_20, ($$render) => {
										if ($.get(generation).generatedIPs.length > 0) $$render(consequent_6);
									});
								}

								$.reset(div_51);

								$.template_effect(() => {
									$.set_text(text_15, $.get(generation).requestedCount);
									$.set_text(text_16, $.get(generation).generatedIPs.length);
									$.set_text(text_17, $.get(generation).uniqueIPs ? 'Yes' : 'No');
								});

								$.append($$anchor, div_51);
							};

							var alternate_1 = ($$anchor) => {
								var div_66 = root_2();
								var node_22 = $.child(div_66);

								Icon(node_22, { name: 'alert-triangle', size: 'sm' });

								var span_8 = $.sibling(node_22, 2);
								var text_24 = $.only_child(span_8, true);

								$.reset(div_66);
								$.template_effect(() => $.set_text(text_24, $.get(generation).error));
								$.append($$anchor, div_66);
							};

							$.if(node_17, ($$render) => {
								if ($.get(generation).isValid) $$render(consequent_7); else $$render(alternate_1, -1);
							});
						}

						$.reset(div_46);

						$.template_effect(
							($0) => {
								classes_4 = $.set_class(div_46, 1, 'generation-card svelte-jhsjpm', null, classes_4, {
									valid: $.get(generation).isValid,
									invalid: !$.get(generation).isValid
								});

								$.set_text(text_12, $.get(generation).network);
								$.set_text(text_13, $0);
								$.set_text(text_14, `IPv${$.get(generation).version ?? ''}`);
							},
							[() => $.get(generation).networkType.toUpperCase()]
						);

						$.append($$anchor, div_46);
					});

					$.reset(div_45);
					$.reset(div_44);

					$.template_effect(
						($0, $1, $2, $3) => {
							classes_1 = $.set_class(button_2, 1, 'copy-btn', null, classes_1, { copied: $0 });
							$.set_text(text_3, ` ${$1 ?? ''}`);
							$.set_text(text_4, $.get(result).summary.totalNetworks);
							$.set_text(text_5, $.get(result).summary.validNetworks);
							$.set_text(text_6, $.get(result).summary.invalidNetworks);
							$.set_text(text_7, $.get(result).summary.totalIPsGenerated);
							$.set_text(text_8, $.get(result).summary.uniqueIPsGenerated);
							$.set_text(text_9, `All Generated IPs (${$.get(result).allGeneratedIPs.length ?? ''})`);
							classes_2 = $.set_class(button_3, 1, 'copy-btn svelte-jhsjpm', null, classes_2, { copied: $2 });
							$.set_text(text_10, ` ${$3 ?? ''}`);
						},
						[
							() => clipboard.isCopied('summary'),
							() => clipboard.isCopied('summary') ? 'Copied!' : 'Copy',
							() => clipboard.isCopied('all-ips'),
							() => clipboard.isCopied('all-ips') ? 'Copied!' : 'Copy All'
						]
					);

					$.delegated('click', button_2, () => $.get(result) && $.get(result).summary && clipboard.copy(`Total Networks: ${$.get(result).summary.totalNetworks}\nValid: ${$.get(result).summary.validNetworks}\nInvalid: ${$.get(result).summary.invalidNetworks}\nTotal IPs: ${$.get(result).summary.totalIPsGenerated}\nUnique IPs: ${$.get(result).summary.uniqueIPsGenerated}`, 'summary'));
					$.delegated('click', button_3, copyAllIPs);
					$.delegated('click', button_4, () => exportResults('txt'));
					$.delegated('click', button_5, () => exportResults('csv'));
					$.delegated('click', button_6, () => exportResults('json'));
					$.append($$anchor, fragment);
				};

				$.if(node_8, ($$render) => {
					if ($.get(result).generations.length > 0) $$render(consequent_8);
				});
			}

			$.reset(div_15);
			$.append($$anchor, div_15);
		};

		$.if(node_4, ($$render) => {
			if ($.get(result)) $$render(consequent_9);
		});
	}

	$.reset(div);
	$.delegated('input', textarea, handleInputChange);
	$.bind_checked(input_1, () => $.get(unique), ($$value) => $.set(unique, $$value));
	$.delegated('click', button_1, generateNewSeed);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'input']);