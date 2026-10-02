import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import { calculateNthIPs } from '$lib/utils/nth-ip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { useClipboard } from '$lib/composables';
import '../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<button><h5> </h5> <p> </p></button>`);
var root_1 = $.from_html(`<div class="card loading-card"><div class="card-content"><div class="loading svelte-1e7d9k3"><!> Calculating IPs...</div></div></div>`);
var root_2 = $.from_html(`<p class="svelte-1e7d9k3"> </p>`);
var root_3 = $.from_html(`<div class="card error-card svelte-1e7d9k3"><div class="card-content"><div class="error-content svelte-1e7d9k3"><!> <div><strong class="svelte-1e7d9k3">Calculation Errors</strong> <!></div></div></div></div>`);
var root_4 = $.from_html(`<span><!></span>`);
var root_5 = $.from_html(`<div class="bounds-warning svelte-1e7d9k3"><!> <span>Index out of bounds</span></div>`);
var root_6 = $.from_html(`<div><div class="details-header"><h4>Network Details</h4></div> <div class="network-details svelte-1e7d9k3"><div class="details-grid svelte-1e7d9k3"><div class="info-card svelte-1e7d9k3"><div class="info-label">Start</div> <div class="value-copy svelte-1e7d9k3"><span class="ip-value"> </span> <button><!></button></div></div> <div class="info-card svelte-1e7d9k3"><div class="info-label">End</div> <div class="value-copy svelte-1e7d9k3"><span class="ip-value"> </span> <button><!></button></div></div> <div class="info-card svelte-1e7d9k3"><div class="info-label">Actual Index</div> <div class="metric-value info svelte-1e7d9k3"> </div></div> <div class="info-card svelte-1e7d9k3"><div class="info-label">Max Index</div> <div class="metric-value svelte-1e7d9k3"> </div></div></div></div></div>`);
var root_7 = $.from_html(`<div class="calculation-details svelte-1e7d9k3"><div class="result-section svelte-1e7d9k3"><div class="result-ip svelte-1e7d9k3"><span class="result-label svelte-1e7d9k3">Result IP:</span> <div class="value-copy"><span class="result-value svelte-1e7d9k3"> </span> <button><!></button></div></div> <!></div> <div class="calculation-info svelte-1e7d9k3"><div class="details-header"><h4>Calculation Details</h4></div> <div class="info-grid svelte-1e7d9k3"><div class="info-card svelte-1e7d9k3"><div class="info-label">Network</div> <div class="value-copy svelte-1e7d9k3"><span class="ip-value"> </span> <button><!></button></div></div> <div class="info-card svelte-1e7d9k3"><div class="info-label">Total Addresses</div> <div class="metric-value svelte-1e7d9k3"> </div></div> <div class="info-card svelte-1e7d9k3"><div class="info-label">Index</div> <div class="metric-value info svelte-1e7d9k3"> </div></div> <div class="info-card svelte-1e7d9k3"><div class="info-label">Offset</div> <div class="metric-value svelte-1e7d9k3"> </div></div></div></div> <!></div>`);
var root_8 = $.from_html(`<div class="error-message svelte-1e7d9k3"><!> <span class="svelte-1e7d9k3"> </span></div>`);
var root_9 = $.from_html(`<div><div class="calc-header svelte-1e7d9k3"><div class="input-info svelte-1e7d9k3"><div class="value-copy"><span class="input-text svelte-1e7d9k3"> </span> <button><!></button></div> <div class="input-meta svelte-1e7d9k3"><span class="network-type svelte-1e7d9k3"> </span> <span class="ip-version svelte-1e7d9k3"> </span></div></div> <div class="status svelte-1e7d9k3"><!></div></div> <!></div>`);
var root_10 = $.from_html(`<div class="card summary-card svelte-1e7d9k3"><div class="card-header row"><h3>Calculation Summary</h3> <button><!> </button></div> <div class="card-content"><div class="summary-stats svelte-1e7d9k3"><div class="info-card"><div class="info-label">Total</div> <div class="metric-value"> </div></div> <div class="info-card"><div class="info-label">Valid</div> <div class="metric-value success"> </div></div> <div class="info-card"><div class="info-label">Invalid</div> <div> </div></div> <div class="info-card"><div class="info-label">Out of Bounds</div> <div> </div></div></div></div></div> <div class="card calculations-card svelte-1e7d9k3"><div class="card-header row"><h3>IP Calculations</h3> <div class="export-buttons svelte-1e7d9k3"><button class="svelte-1e7d9k3"><!> Export CSV</button> <button class="svelte-1e7d9k3"><!> Export JSON</button></div></div> <div class="card-content"><div class="calculations-list svelte-1e7d9k3"></div></div></div>`, 1);
var root_11 = $.from_html(`<div class="results svelte-1e7d9k3"><!> <!></div>`);

var root_12 = $.from_html(`<div class="card"><header class="card-header"><h1>Nth IP Calculator</h1> <p>Resolve the IP address at a specific index within networks and ranges with optional global offset.</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary"><!> <h4>Quick Examples</h4></summary> <div class="examples-grid"></div></details></div> <div class="card input-card"><div class="card-header"><h3>Network Configuration</h3></div> <div class="card-content"><div class="form-row svelte-1e7d9k3"><div class="form-group textarea-group svelte-1e7d9k3"><label for="inputs" class="svelte-1e7d9k3">Network and Index Specifications</label> <textarea id="inputs" placeholder="192.168.1.0/24 @ 10
10.0.0.0-10.0.0.255 [50]
172.16.0.0/16 100
2001:db8::/64#1000" rows="6" class="svelte-1e7d9k3"></textarea> <div class="input-help svelte-1e7d9k3">Formats: network @ index, network [index], network index, or network#index. Optional offset: + number</div></div> <div class="options-section svelte-1e7d9k3"><div class="option-group svelte-1e7d9k3"><label for="offset" class="svelte-1e7d9k3">Global Offset</label> <input id="offset" type="number" placeholder="0" min="0" class="svelte-1e7d9k3"/> <div class="option-help svelte-1e7d9k3">Add this value to all index calculations (0-based indexing)</div></div></div></div></div></div> <!> <!></div>`);

export default function NthIP($$anchor, $$props) {
	$.push($$props, true);

	let inputText = $.state('192.168.1.0/24 @ 10\n10.0.0.0-10.0.0.255 [50]\n172.16.0.0/16 100\n2001:db8::/64#1000');
	let globalOffset = $.state(0);
	let result = $.state(null);
	let isLoading = $.state(false);
	let selectedExampleIndex = $.state(null);
	let userModified = $.state(false);
	const clipboard = useClipboard();

	const examples = [
		{
			input: '192.168.1.0/24 @ 10',
			description: 'Get 10th IP from a /24 subnet'
		},

		{
			input: '10.0.0.0-10.0.0.255 [128]\n172.16.0.0/16 1000',
			description: 'Multiple range types with different indices'
		},

		{
			input: '2001:db8::/64#100\nfe80::/10 @ 50',
			description: 'IPv6 networks with various formats'
		},

		{
			input: '192.168.0.0/16 + 100\n10.0.0.0/8 [5000]',
			description: 'Large networks with high indices'
		},

		{
			input: '203.0.113.0/24 @ 1\n203.0.113.0/24 @ -1',
			description: 'First and last IP using positive/negative indexing'
		},

		{
			input: '192.168.1.1-192.168.1.100 [25]\n192.168.1.101-192.168.1.200 [75]',
			description: 'Sequential IP ranges with specific indices'
		},

		{
			input: '2001:db8:85a3::/48#65536\nfc00::/7 @ 1000000',
			description: 'Large IPv6 address spaces'
		},

		{
			input: '127.0.0.0/8 @ 256\n::1/128 @ 0\n169.254.0.0/16 [32768]',
			description: 'Special-use addresses: loopback and link-local'
		}
	];

	function calculateIPs() {
		if (!$.get(inputText).trim()) {
			$.set(result, null);

			return;
		}

		$.set(isLoading, true);

		try {
			const inputs = $.get(inputText).split('\n').filter((line) => line.trim());

			if (inputs.length === 0) {
				$.set(
					result,
					{
						calculations: [],
						summary: {
							totalCalculations: 0,
							validCalculations: 0,
							invalidCalculations: 0,
							outOfBoundsCalculations: 0
						},
						errors: ['No valid input lines found']
					},
					true
				);

				return;
			}

			$.set(result, calculateNthIPs(inputs, $.get(globalOffset)), true);
		} catch(error) {
			$.set(
				result,
				{
					calculations: [],
					summary: {
						totalCalculations: 0,
						validCalculations: 0,
						invalidCalculations: 0,
						outOfBoundsCalculations: 0
					},
					errors: [
						error instanceof Error
							? error.message
							: 'Unknown error occurred while calculating nth IPs'
					]
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

		if (format === 'csv') {
			const headers = 'Input,Network,Index,Offset,Result IP,Version,Total Addresses,In Bounds,Valid,Error';
			const rows = $.get(result).calculations.map((calc) => `"${calc.input}","${calc.network}","${calc.index}","${calc.offset}","${calc.resultIP}","IPv${calc.version}","${calc.totalAddresses}","${calc.isInBounds}","${calc.isValid}","${calc.error || ''}"`);

			content = [headers, ...rows].join('\n');
			filename = `nth-ip-${timestamp}.csv`;
		} else {
			content = JSON.stringify($.get(result), null, 2);
			filename = `nth-ip-${timestamp}.json`;
		}

		const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}

	function loadExample(example, index) {
		$.set(inputText, example.input, true);
		$.set(selectedExampleIndex, index, true);
		$.set(userModified, false);
		calculateIPs();
	}

	function handleInputChange() {
		$.set(userModified, true);
		$.set(selectedExampleIndex, null);
	}

	// Auto-calculate when inputs change
	$.user_effect(() => {
		if ($.get(inputText).trim()) {
			const timeoutId = setTimeout(calculateIPs, 300);

			return () => clearTimeout(timeoutId);
		} else {
			$.set(result, null);
		}
	});

	var div = root_12();
	var div_1 = $.sibling($.child(div), 2);
	var details = $.child(div_1);
	var summary = $.child(details);
	var node = $.child(summary);

	Icon(node, { name: 'chevron-right', size: 'xs' });
	$.next(2);
	$.reset(summary);

	var div_2 = $.sibling(summary, 2);

	$.each(div_2, 23, () => examples, (example, i) => `${example.input}-${i}`, ($$anchor, example, i) => {
		var button = root();
		let classes;
		var h5 = $.child(button);
		var text = $.only_child(h5, true);
		var p = $.sibling(h5, 2);
		var text_1 = $.only_child(p, true);

		$.reset(button);
		$.action(button, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => `Calculate: ${$.get(example).input.split('\n')[0]}`);

		$.template_effect(
			($0) => {
				classes = $.set_class(button, 1, 'example-card', null, classes, {
					selected: $.get(selectedExampleIndex) === $.get(i) && !$.get(userModified)
				});

				$.set_text(text, $0);
				$.set_text(text_1, $.get(example).description);
			},
			[() => $.get(example).input.split('\n')[0]]
		);

		$.delegated('click', button, () => loadExample($.get(example), $.get(i)));
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

	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter network and index specifications, one per line. Supports formats: network @ index, network [index], network index, or network#index');

	var textarea = $.sibling(label, 2);

	$.remove_textarea_child(textarea);
	$.next(2);
	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var div_8 = $.child(div_7);
	var label_1 = $.child(div_8);

	$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Add this value to all index calculations (0-based indexing)');

	var input = $.sibling(label_1, 2);

	$.remove_input_defaults(input);
	$.next(2);
	$.reset(div_8);
	$.reset(div_7);
	$.reset(div_5);
	$.reset(div_4);
	$.reset(div_3);

	var node_1 = $.sibling(div_3, 2);

	{
		var consequent = ($$anchor) => {
			var div_9 = root_1();
			var div_10 = $.child(div_9);
			var div_11 = $.child(div_10);
			var node_2 = $.child(div_11);

			Icon(node_2, { name: 'loader', size: 'sm', animate: 'spin' });
			$.next();
			$.reset(div_11);
			$.reset(div_10);
			$.reset(div_9);
			$.append($$anchor, div_9);
		};

		$.if(node_1, ($$render) => {
			if ($.get(isLoading)) $$render(consequent);
		});
	}

	var node_3 = $.sibling(node_1, 2);

	{
		var consequent_8 = ($$anchor) => {
			var div_12 = root_11();
			var node_4 = $.child(div_12);

			{
				var consequent_1 = ($$anchor) => {
					var div_13 = root_3();
					var div_14 = $.child(div_13);
					var div_15 = $.child(div_14);
					var node_5 = $.child(div_15);

					Icon(node_5, { name: 'alert-triangle', size: 'md' });

					var div_16 = $.sibling(node_5, 2);
					var node_6 = $.sibling($.child(div_16), 2);

					$.each(node_6, 17, () => $.get(result).errors, $.index, ($$anchor, error) => {
						var p_1 = root_2();
						var text_2 = $.only_child(p_1, true);

						$.template_effect(() => $.set_text(text_2, $.get(error)));
						$.append($$anchor, p_1);
					});

					$.reset(div_16);
					$.reset(div_15);
					$.reset(div_14);
					$.reset(div_13);
					$.append($$anchor, div_13);
				};

				$.if(node_4, ($$render) => {
					if ($.get(result).errors.length > 0) $$render(consequent_1);
				});
			}

			var node_7 = $.sibling(node_4, 2);

			{
				var consequent_7 = ($$anchor) => {
					var fragment = root_10();
					var div_17 = $.first_child(fragment);
					var div_18 = $.child(div_17);
					var button_1 = $.sibling($.child(div_18), 2);
					let classes_1;
					var node_8 = $.child(button_1);

					{
						let $0 = $.derived(() => clipboard.isCopied('summary') ? 'check' : 'copy');

						Icon(node_8, {
							get name() {
								return $.get($0);
							},
							size: 'xs'
						});
					}

					var text_3 = $.sibling(node_8);

					$.reset(button_1);
					$.action(button_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Copy summary to clipboard');
					$.reset(div_18);

					var div_19 = $.sibling(div_18, 2);
					var div_20 = $.child(div_19);
					var div_21 = $.child(div_20);
					var div_22 = $.sibling($.child(div_21), 2);
					var text_4 = $.only_child(div_22, true);

					$.reset(div_21);

					var div_23 = $.sibling(div_21, 2);
					var div_24 = $.sibling($.child(div_23), 2);
					var text_5 = $.only_child(div_24, true);

					$.reset(div_23);

					var div_25 = $.sibling(div_23, 2);
					var div_26 = $.sibling($.child(div_25), 2);
					let classes_2;
					var text_6 = $.only_child(div_26, true);

					$.reset(div_25);

					var div_27 = $.sibling(div_25, 2);
					var div_28 = $.sibling($.child(div_27), 2);
					let classes_3;
					var text_7 = $.only_child(div_28, true);

					$.reset(div_27);
					$.reset(div_20);
					$.reset(div_19);
					$.reset(div_17);

					var div_29 = $.sibling(div_17, 2);
					var div_30 = $.child(div_29);
					var div_31 = $.sibling($.child(div_30), 2);
					var button_2 = $.child(div_31);
					var node_9 = $.child(button_2);

					Icon(node_9, { name: 'csv-file', size: 'xs' });
					$.next();
					$.reset(button_2);
					$.action(button_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Export results as CSV file');

					var button_3 = $.sibling(button_2, 2);
					var node_10 = $.child(button_3);

					Icon(node_10, { name: 'json-file', size: 'xs' });
					$.next();
					$.reset(button_3);
					$.action(button_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Export results as JSON file');
					$.reset(div_31);
					$.reset(div_30);

					var div_32 = $.sibling(div_30, 2);
					var div_33 = $.child(div_32);

					$.each(div_33, 23, () => $.get(result).calculations, (calculation, index) => `${calculation.index}-${index}`, ($$anchor, calculation, index) => {
						var div_34 = root_9();
						let classes_4;
						var div_35 = $.child(div_34);
						var div_36 = $.child(div_35);
						var div_37 = $.child(div_36);
						var span = $.child(div_37);
						var text_8 = $.only_child(span, true);
						var button_4 = $.sibling(span, 2);
						let classes_5;
						var node_11 = $.child(button_4);

						{
							let $0 = $.derived(() => clipboard.isCopied(`input-${$.get(index)}`) ? 'check' : 'copy');

							Icon(node_11, {
								get name() {
									return $.get($0);
								},
								size: 'xs'
							});
						}

						$.reset(button_4);
						$.action(button_4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Copy input specification');
						$.reset(div_37);

						var div_38 = $.sibling(div_37, 2);
						var span_1 = $.child(div_38);
						var text_9 = $.only_child(span_1, true);

						$.action(span_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => `Network type: ${$.get(calculation).inputType}`);

						var span_2 = $.sibling(span_1, 2);
						var text_10 = $.only_child(span_2);

						$.action(span_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => `IP version ${$.get(calculation).version}`);
						$.reset(div_38);
						$.reset(div_36);

						var div_39 = $.sibling(div_36, 2);
						var node_12 = $.child(div_39);

						{
							var consequent_2 = ($$anchor) => {
								var span_3 = root_4();
								var node_13 = $.child(span_3);

								Icon(node_13, { name: 'check-circle', size: 'md' });
								$.reset(span_3);
								$.action(span_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Valid calculation within bounds');
								$.append($$anchor, span_3);
							};

							var consequent_3 = ($$anchor) => {
								var span_4 = root_4();
								var node_14 = $.child(span_4);

								Icon(node_14, { name: 'alert-circle', size: 'md' });
								$.reset(span_4);
								$.action(span_4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Valid calculation but index out of bounds');
								$.append($$anchor, span_4);
							};

							var alternate = ($$anchor) => {
								var span_5 = root_4();
								var node_15 = $.child(span_5);

								Icon(node_15, { name: 'x-circle', size: 'md' });
								$.reset(span_5);
								$.action(span_5, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Invalid calculation');
								$.append($$anchor, span_5);
							};

							$.if(node_12, ($$render) => {
								if ($.get(calculation).isValid && $.get(calculation).isInBounds) $$render(consequent_2); else if ($.get(calculation).isValid && !$.get(calculation).isInBounds) $$render(consequent_3, 1); else $$render(alternate, -1);
							});
						}

						$.reset(div_39);
						$.reset(div_35);

						var node_16 = $.sibling(div_35, 2);

						{
							var consequent_6 = ($$anchor) => {
								var div_40 = root_7();
								var div_41 = $.child(div_40);
								var div_42 = $.child(div_41);
								var span_6 = $.child(div_42);

								$.action(span_6, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'The calculated IP address at the specified index');

								var div_43 = $.sibling(span_6, 2);
								var span_7 = $.child(div_43);
								var text_11 = $.only_child(span_7, true);
								var button_5 = $.sibling(span_7, 2);
								let classes_6;
								var node_17 = $.child(button_5);

								{
									let $0 = $.derived(() => clipboard.isCopied(`result-${$.get(index)}`) ? 'check' : 'copy');

									Icon(node_17, {
										get name() {
											return $.get($0);
										},
										size: 'xs'
									});
								}

								$.reset(button_5);
								$.action(button_5, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Copy result IP address');
								$.reset(div_43);
								$.reset(div_42);

								var node_18 = $.sibling(div_42, 2);

								{
									var consequent_4 = ($$anchor) => {
										var div_44 = root_5();
										var node_19 = $.child(div_44);

										Icon(node_19, { name: 'alert-triangle', size: 'sm' });
										$.next(2);
										$.reset(div_44);
										$.append($$anchor, div_44);
									};

									$.if(node_18, ($$render) => {
										if (!$.get(calculation).isInBounds) $$render(consequent_4);
									});
								}

								$.reset(div_41);

								var div_45 = $.sibling(div_41, 2);
								var div_46 = $.sibling($.child(div_45), 2);
								var div_47 = $.child(div_46);
								var div_48 = $.child(div_47);

								$.action(div_48, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Network or range being processed');

								var div_49 = $.sibling(div_48, 2);
								var span_8 = $.child(div_49);
								var text_12 = $.only_child(span_8, true);
								var button_6 = $.sibling(span_8, 2);
								let classes_7;
								var node_20 = $.child(button_6);

								{
									let $0 = $.derived(() => clipboard.isCopied(`network-${$.get(index)}`) ? 'check' : 'copy');

									Icon(node_20, {
										get name() {
											return $.get($0);
										},
										size: 'xs'
									});
								}

								$.reset(button_6);
								$.action(button_6, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Copy network address');
								$.reset(div_49);
								$.reset(div_47);

								var div_50 = $.sibling(div_47, 2);
								var div_51 = $.child(div_50);

								$.action(div_51, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Total number of addresses in this network');

								var div_52 = $.sibling(div_51, 2);
								var text_13 = $.only_child(div_52, true);

								$.reset(div_50);

								var div_53 = $.sibling(div_50, 2);
								var div_54 = $.child(div_53);

								$.action(div_54, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'The index position requested');

								var div_55 = $.sibling(div_54, 2);
								var text_14 = $.only_child(div_55, true);

								$.reset(div_53);

								var div_56 = $.sibling(div_53, 2);
								var div_57 = $.child(div_56);

								$.action(div_57, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Global offset applied to the calculation');

								var div_58 = $.sibling(div_57, 2);
								var text_15 = $.only_child(div_58, true);

								$.reset(div_56);
								$.reset(div_46);
								$.reset(div_45);

								var node_21 = $.sibling(div_45, 2);

								{
									var consequent_5 = ($$anchor) => {
										var div_59 = root_6();
										var div_60 = $.sibling($.child(div_59), 2);
										var div_61 = $.child(div_60);
										var div_62 = $.child(div_61);
										var div_63 = $.child(div_62);

										$.action(div_63, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'First IP address in the network');

										var div_64 = $.sibling(div_63, 2);
										var span_9 = $.child(div_64);
										var text_16 = $.only_child(span_9, true);
										var button_7 = $.sibling(span_9, 2);
										let classes_8;
										var node_22 = $.child(button_7);

										{
											let $0 = $.derived(() => clipboard.isCopied(`start-${$.get(index)}`) ? 'check' : 'copy');

											Icon(node_22, {
												get name() {
													return $.get($0);
												},
												size: 'xs'
											});
										}

										$.reset(button_7);
										$.action(button_7, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Copy network start address');
										$.reset(div_64);
										$.reset(div_62);

										var div_65 = $.sibling(div_62, 2);
										var div_66 = $.child(div_65);

										$.action(div_66, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Last IP address in the network');

										var div_67 = $.sibling(div_66, 2);
										var span_10 = $.child(div_67);
										var text_17 = $.only_child(span_10, true);
										var button_8 = $.sibling(span_10, 2);
										let classes_9;
										var node_23 = $.child(button_8);

										{
											let $0 = $.derived(() => clipboard.isCopied(`end-${$.get(index)}`) ? 'check' : 'copy');

											Icon(node_23, {
												get name() {
													return $.get($0);
												},
												size: 'xs'
											});
										}

										$.reset(button_8);
										$.action(button_8, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Copy network end address');
										$.reset(div_67);
										$.reset(div_65);

										var div_68 = $.sibling(div_65, 2);
										var div_69 = $.child(div_68);

										$.action(div_69, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'The actual index used (including offset)');

										var div_70 = $.sibling(div_69, 2);
										var text_18 = $.only_child(div_70, true);

										$.reset(div_68);

										var div_71 = $.sibling(div_68, 2);
										var div_72 = $.child(div_71);

										$.action(div_72, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Maximum valid index for this network');

										var div_73 = $.sibling(div_72, 2);
										var text_19 = $.only_child(div_73, true);

										$.reset(div_71);
										$.reset(div_61);
										$.reset(div_60);
										$.reset(div_59);

										$.template_effect(
											($0, $1) => {
												$.set_text(text_16, $.get(calculation).details.networkStart);
												classes_8 = $.set_class(button_7, 1, 'copy-btn', null, classes_8, { copied: $0 });
												$.set_text(text_17, $.get(calculation).details.networkEnd);
												classes_9 = $.set_class(button_8, 1, 'copy-btn', null, classes_9, { copied: $1 });
												$.set_text(text_18, $.get(calculation).details.actualIndex);
												$.set_text(text_19, $.get(calculation).details.maxIndex);
											},
											[
												() => clipboard.isCopied(`start-${$.get(index)}`),
												() => clipboard.isCopied(`end-${$.get(index)}`)
											]
										);

										$.delegated('click', button_7, () => $.get(calculation).details && clipboard.copy($.get(calculation).details.networkStart, `start-${$.get(index)}`));
										$.delegated('click', button_8, () => $.get(calculation).details && clipboard.copy($.get(calculation).details.networkEnd, `end-${$.get(index)}`));
										$.append($$anchor, div_59);
									};

									$.if(node_21, ($$render) => {
										if ($.get(calculation).details) $$render(consequent_5);
									});
								}

								$.reset(div_40);

								$.template_effect(
									($0, $1) => {
										$.set_text(text_11, $.get(calculation).resultIP);
										classes_6 = $.set_class(button_5, 1, 'copy-btn', null, classes_6, { copied: $0 });
										$.set_text(text_12, $.get(calculation).network);
										classes_7 = $.set_class(button_6, 1, 'copy-btn', null, classes_7, { copied: $1 });
										$.set_text(text_13, $.get(calculation).totalAddresses);
										$.set_text(text_14, $.get(calculation).index);
										$.set_text(text_15, $.get(calculation).offset);
									},
									[
										() => clipboard.isCopied(`result-${$.get(index)}`),
										() => clipboard.isCopied(`network-${$.get(index)}`)
									]
								);

								$.delegated('click', button_5, () => clipboard.copy($.get(calculation).resultIP, `result-${$.get(index)}`));
								$.delegated('click', button_6, () => clipboard.copy($.get(calculation).network, `network-${$.get(index)}`));
								$.append($$anchor, div_40);
							};

							var alternate_1 = ($$anchor) => {
								var div_74 = root_8();
								var node_24 = $.child(div_74);

								Icon(node_24, { name: 'alert-triangle', size: 'sm' });

								var span_11 = $.sibling(node_24, 2);
								var text_20 = $.only_child(span_11, true);

								$.reset(div_74);
								$.template_effect(() => $.set_text(text_20, $.get(calculation).error));
								$.append($$anchor, div_74);
							};

							$.if(node_16, ($$render) => {
								if ($.get(calculation).isValid) $$render(consequent_6); else $$render(alternate_1, -1);
							});
						}

						$.reset(div_34);

						$.template_effect(
							($0, $1) => {
								classes_4 = $.set_class(div_34, 1, 'calculation-card svelte-1e7d9k3', null, classes_4, {
									valid: $.get(calculation).isValid && $.get(calculation).isInBounds,
									'out-of-bounds': $.get(calculation).isValid && !$.get(calculation).isInBounds,
									invalid: !$.get(calculation).isValid
								});

								$.set_text(text_8, $.get(calculation).input);
								classes_5 = $.set_class(button_4, 1, 'copy-btn', null, classes_5, { copied: $0 });
								$.set_text(text_9, $1);
								$.set_text(text_10, `IPv${$.get(calculation).version ?? ''}`);
							},
							[
								() => clipboard.isCopied(`input-${$.get(index)}`),
								() => $.get(calculation).inputType.toUpperCase()
							]
						);

						$.delegated('click', button_4, () => clipboard.copy($.get(calculation).input, `input-${$.get(index)}`));
						$.append($$anchor, div_34);
					});

					$.reset(div_33);
					$.reset(div_32);
					$.reset(div_29);

					$.template_effect(
						($0, $1) => {
							classes_1 = $.set_class(button_1, 1, 'copy-btn', null, classes_1, { copied: $0 });
							$.set_text(text_3, ` ${$1 ?? ''}`);
							$.set_text(text_4, $.get(result).summary.totalCalculations);
							$.set_text(text_5, $.get(result).summary.validCalculations);
							classes_2 = $.set_class(div_26, 1, 'metric-value', null, classes_2, { error: $.get(result).summary.invalidCalculations > 0 });
							$.set_text(text_6, $.get(result).summary.invalidCalculations);
							classes_3 = $.set_class(div_28, 1, 'metric-value', null, classes_3, { warning: $.get(result).summary.outOfBoundsCalculations > 0 });
							$.set_text(text_7, $.get(result).summary.outOfBoundsCalculations);
						},
						[
							() => clipboard.isCopied('summary'),
							() => clipboard.isCopied('summary') ? 'Copied!' : 'Copy'
						]
					);

					$.delegated('click', button_1, () => $.get(result) && $.get(result).summary && clipboard.copy(`Total: ${$.get(result).summary.totalCalculations}\nValid: ${$.get(result).summary.validCalculations}\nInvalid: ${$.get(result).summary.invalidCalculations}\nOut of Bounds: ${$.get(result).summary.outOfBoundsCalculations}`, 'summary'));
					$.delegated('click', button_2, () => exportResults('csv'));
					$.delegated('click', button_3, () => exportResults('json'));
					$.append($$anchor, fragment);
				};

				$.if(node_7, ($$render) => {
					if ($.get(result).calculations.length > 0) $$render(consequent_7);
				});
			}

			$.reset(div_12);
			$.append($$anchor, div_12);
		};

		$.if(node_3, ($$render) => {
			if ($.get(result)) $$render(consequent_8);
		});
	}

	$.reset(div);
	$.delegated('input', textarea, handleInputChange);
	$.bind_value(textarea, () => $.get(inputText), ($$value) => $.set(inputText, $$value));
	$.delegated('input', input, handleInputChange);
	$.bind_value(input, () => $.get(globalOffset), ($$value) => $.set(globalOffset, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'input']);