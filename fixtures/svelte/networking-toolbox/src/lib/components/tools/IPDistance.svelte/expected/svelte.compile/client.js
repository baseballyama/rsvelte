import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import { calculateIPDistances } from '$lib/utils/ip-distance.js';
import Icon from '$lib/components/global/Icon.svelte';
import { useClipboard } from '$lib/composables';
import { formatNumber } from '$lib/utils/formatters';
import '../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<button><h5> </h5> <p> </p></button>`);
var root_1 = $.from_html(`<div class="card loading-card"><div class="card-content"><div class="loading svelte-esn2mq"><!> Calculating distances...</div></div></div>`);
var root_2 = $.from_html(`<p class="svelte-esn2mq"> </p>`);
var root_3 = $.from_html(`<div class="card error-card svelte-esn2mq"><div class="card-content"><div class="error-content svelte-esn2mq"><!> <div><strong class="svelte-esn2mq">Calculation Errors</strong> <!></div></div></div></div>`);
var root_4 = $.from_html(`<div class="value-copy"><span class="ip-value"> </span> <button><!></button></div>`);
var root_5 = $.from_html(`<span class="more-indicator svelte-esn2mq"> </span>`);
var root_6 = $.from_html(`<div class="intermediates svelte-esn2mq"><div class="intermediates-header svelte-esn2mq"><h4 class="svelte-esn2mq">Intermediate Addresses</h4> <button><!> Copy All</button></div> <div class="intermediate-list svelte-esn2mq"><!> <!></div></div>`);
var root_7 = $.from_html(`<div class="calculation-details svelte-esn2mq"><div class="distance-info svelte-esn2mq"><div class="distance-value svelte-esn2mq"><div class="value-copy"><span class="distance-number svelte-esn2mq"> </span> <button><!></button></div> <span class="distance-label svelte-esn2mq"> </span></div> <div class="calculation-meta svelte-esn2mq"><span class="meta-item svelte-esn2mq"><!> </span> <span class="meta-item svelte-esn2mq"><!> </span></div></div> <!></div>`);
var root_8 = $.from_html(`<div class="error-message svelte-esn2mq"><!> <span class="svelte-esn2mq"> </span></div>`);
var root_9 = $.from_html(`<div><div class="calc-header svelte-esn2mq"><div class="ip-pair svelte-esn2mq"><div class="ip-address svelte-esn2mq"><span class="ip-label svelte-esn2mq">Start</span> <div class="value-copy"><span class="ip-value"> </span> <button><!></button></div></div> <div class="direction-arrow svelte-esn2mq"> </div> <div class="ip-address svelte-esn2mq"><span class="ip-label svelte-esn2mq">End</span> <div class="value-copy"><span class="ip-value"> </span> <button><!></button></div></div></div> <div class="status svelte-esn2mq"><!></div></div> <!></div>`);
var root_10 = $.from_html(`<div class="card summary-card svelte-esn2mq"><div class="card-header svelte-esn2mq"><h3>Distance Summary</h3> <button><!> </button></div> <div class="card-content"><div class="summary-stats svelte-esn2mq"><div class="info-card svelte-esn2mq"><div class="info-label">Total Pairs</div> <div class="metric-value"> </div></div> <div class="info-card svelte-esn2mq"><div class="info-label">Valid</div> <div class="metric-value success"> </div></div> <div class="info-card svelte-esn2mq"><div class="info-label">Invalid</div> <div> </div></div> <div class="info-card svelte-esn2mq"><div class="info-label">Total Distance</div> <div class="metric-value info"> </div></div> <div class="info-card svelte-esn2mq"><div class="info-label">Average Distance</div> <div class="metric-value"> </div></div></div></div></div> <div class="card calculations-card svelte-esn2mq"><div class="card-header svelte-esn2mq"><h3>Distance Calculations</h3> <div class="export-buttons svelte-esn2mq"><button class="svelte-esn2mq"><!> Export CSV</button> <button class="svelte-esn2mq"><!> Export JSON</button></div></div> <div class="card-content"><div class="calculations-list svelte-esn2mq"></div></div></div>`, 1);
var root_11 = $.from_html(`<div class="results svelte-esn2mq"><!> <!></div>`);

var root_12 = $.from_html(`<div class="card"><header class="card-header"><h1>IP Distance Calculator</h1> <p>Calculate the number of addresses between two IP addresses with inclusive/exclusive counting and detailed
      analysis.</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary"><!> <h4>Quick Examples</h4></summary> <div class="examples-grid"></div></details></div> <div class="card input-card"><div class="card-header"><h3>Distance Configuration</h3></div> <div class="card-content"><div class="form-row svelte-esn2mq"><div class="form-group textarea-group svelte-esn2mq"><label for="inputs" class="svelte-esn2mq">IP Address Pairs</label> <textarea id="inputs" placeholder="192.168.1.1 -> 192.168.1.100
10.0.0.1 -> 10.0.0.255
2001:db8::1 -> 2001:db8::ffff" rows="6" class="svelte-esn2mq"></textarea> <div class="input-help svelte-esn2mq">Enter one pair per line. Formats: start → end, start -> end, start end, start - end</div></div> <div class="checkbox-section svelte-esn2mq"><div class="checkbox-group svelte-esn2mq"><label class="checkbox-label svelte-esn2mq"><input type="checkbox"/> <div class="checkbox-text svelte-esn2mq"><span>Inclusive Counting</span> <span><!></span></div></label></div> <div class="checkbox-group svelte-esn2mq"><label class="checkbox-label svelte-esn2mq"><input type="checkbox"/> <div class="checkbox-text svelte-esn2mq"><span>Show Intermediate IPs</span> <span><!></span></div></label></div></div></div></div></div> <!> <!></div>`);

export default function IPDistance($$anchor, $$props) {
	$.push($$props, true);

	let inputText = $.state('192.168.1.1 -> 192.168.1.100\n10.0.0.1 -> 10.0.0.255\n2001:db8::1 -> 2001:db8::ffff');
	let inclusive = $.state(true);
	let showIntermediates = $.state(false);
	let result = $.state(null);
	let isLoading = $.state(false);
	let selectedExampleIndex = $.state(null);
	let userModified = $.state(false);
	const clipboard = useClipboard();

	const examples = [
		{
			input: '192.168.1.1 -> 192.168.1.10',
			description: 'Basic IPv4 range counting'
		},

		{
			input: '2001:db8::1 -> 2001:db8::100\nfe80::1 -> fe80::ffff',
			description: 'IPv6 address distances'
		},

		{
			input: '10.0.0.1 -> 10.255.255.254\n172.16.0.1 -> 172.31.255.254',
			description: 'Large private network ranges'
		},

		{
			input: '192.168.1.1 -> 192.168.1.2\n192.168.1.2 -> 192.168.1.1',
			description: 'Adjacent IPs and reverse counting'
		}
	];

	function calculateDistances() {
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
							totalDistance: '0',
							averageDistance: '0'
						},
						errors: ['No valid input lines found']
					},
					true
				);

				return;
			}

			$.set(result, calculateIPDistances(inputs, $.get(inclusive), $.get(showIntermediates)), true);
		} catch(error) {
			$.set(
				result,
				{
					calculations: [],
					summary: {
						totalCalculations: 0,
						validCalculations: 0,
						invalidCalculations: 0,
						totalDistance: '0',
						averageDistance: '0'
					},
					errors: [
						error instanceof Error
							? error.message
							: 'Unknown error occurred while calculating distances'
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
			const headers = 'Start IP,End IP,Distance,Version,Inclusive,Direction,Valid,Error';
			const rows = $.get(result).calculations.map((calc) => `"${calc.startIP}","${calc.endIP}","${calc.distance}","IPv${calc.version}","${calc.inclusive}","${calc.direction}","${calc.isValid}","${calc.error || ''}"`);

			content = [headers, ...rows].join('\n');
			filename = `ip-distances-${timestamp}.csv`;
		} else {
			content = JSON.stringify($.get(result), null, 2);
			filename = `ip-distances-${timestamp}.json`;
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
		calculateDistances();
	}

	function handleInputChange() {
		$.set(userModified, true);
		$.set(selectedExampleIndex, null);
	}

	function formatDirection(direction) {
		return direction === 'forward' ? '→' : '←';
	}

	function getDirectionColor(direction) {
		return direction === 'forward' ? '#059669' : '#d97706';
	}

	// Auto-calculate when inputs change
	$.user_effect(() => {
		if ($.get(inputText).trim()) {
			const timeoutId = setTimeout(calculateDistances, 300);

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

	$.each(div_2, 21, () => examples, $.index, ($$anchor, example, i) => {
		var button = root();
		let classes;
		var h5 = $.child(button);
		var text = $.only_child(h5, true);
		var p = $.sibling(h5, 2);
		var text_1 = $.only_child(p, true);

		$.reset(button);
		$.action(button, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => `Calculate distance for: ${$.get(example).input.split('\n')[0]}`);

		$.template_effect(
			($0) => {
				classes = $.set_class(button, 1, 'example-card', null, classes, {
					selected: $.get(selectedExampleIndex) === i && !$.get(userModified)
				});

				$.set_text(text, $0);
				$.set_text(text_1, $.get(example).description);
			},
			[() => $.get(example).input.split('\n')[0]]
		);

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

	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter IP address pairs, one per line. Supports formats: start → end, start -> end, start end, start - end');

	var textarea = $.sibling(label, 2);

	$.remove_textarea_child(textarea);
	$.next(2);
	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var div_8 = $.child(div_7);
	var label_1 = $.child(div_8);
	var input = $.child(label_1);

	$.remove_input_defaults(input);

	var div_9 = $.sibling(input, 2);
	var span = $.sibling($.child(div_9), 2);
	var node_1 = $.child(span);

	Icon(node_1, { name: 'help-circle', size: 'xs' });
	$.reset(span);
	$.action(span, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Include both start and end addresses in the count. Exclusive counting only counts addresses between the endpoints.');
	$.reset(div_9);
	$.reset(label_1);
	$.reset(div_8);

	var div_10 = $.sibling(div_8, 2);
	var label_2 = $.child(div_10);
	var input_1 = $.child(label_2);

	$.remove_input_defaults(input_1);

	var div_11 = $.sibling(input_1, 2);
	var span_1 = $.sibling($.child(div_11), 2);
	var node_2 = $.child(span_1);

	Icon(node_2, { name: 'help-circle', size: 'xs' });
	$.reset(span_1);
	$.action(span_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Display sample addresses between start and end (maximum 10 addresses shown)');
	$.reset(div_11);
	$.reset(label_2);
	$.reset(div_10);
	$.reset(div_7);
	$.reset(div_5);
	$.reset(div_4);
	$.reset(div_3);

	var node_3 = $.sibling(div_3, 2);

	{
		var consequent = ($$anchor) => {
			var div_12 = root_1();
			var div_13 = $.child(div_12);
			var div_14 = $.child(div_13);
			var node_4 = $.child(div_14);

			Icon(node_4, { name: 'loader', size: 'sm', animate: 'spin' });
			$.next();
			$.reset(div_14);
			$.reset(div_13);
			$.reset(div_12);
			$.append($$anchor, div_12);
		};

		$.if(node_3, ($$render) => {
			if ($.get(isLoading)) $$render(consequent);
		});
	}

	var node_5 = $.sibling(node_3, 2);

	{
		var consequent_7 = ($$anchor) => {
			var div_15 = root_11();
			var node_6 = $.child(div_15);

			{
				var consequent_1 = ($$anchor) => {
					var div_16 = root_3();
					var div_17 = $.child(div_16);
					var div_18 = $.child(div_17);
					var node_7 = $.child(div_18);

					Icon(node_7, { name: 'alert-triangle', size: 'md' });

					var div_19 = $.sibling(node_7, 2);
					var node_8 = $.sibling($.child(div_19), 2);

					$.each(node_8, 16, () => $.get(result).errors, (error) => error, ($$anchor, error) => {
						var p_1 = root_2();
						var text_2 = $.only_child(p_1, true);

						$.template_effect(() => $.set_text(text_2, error));
						$.append($$anchor, p_1);
					});

					$.reset(div_19);
					$.reset(div_18);
					$.reset(div_17);
					$.reset(div_16);
					$.append($$anchor, div_16);
				};

				$.if(node_6, ($$render) => {
					if ($.get(result).errors.length > 0) $$render(consequent_1);
				});
			}

			var node_9 = $.sibling(node_6, 2);

			{
				var consequent_6 = ($$anchor) => {
					var fragment = root_10();
					var div_20 = $.first_child(fragment);
					var div_21 = $.child(div_20);
					var button_1 = $.sibling($.child(div_21), 2);
					let classes_1;
					var node_10 = $.child(button_1);

					{
						let $0 = $.derived(() => clipboard.isCopied('summary') ? 'check' : 'copy');

						Icon(node_10, {
							get name() {
								return $.get($0);
							},
							size: 'xs'
						});
					}

					var text_3 = $.sibling(node_10);

					$.reset(button_1);
					$.action(button_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Copy summary to clipboard');
					$.reset(div_21);

					var div_22 = $.sibling(div_21, 2);
					var div_23 = $.child(div_22);
					var div_24 = $.child(div_23);
					var div_25 = $.sibling($.child(div_24), 2);
					var text_4 = $.only_child(div_25, true);

					$.reset(div_24);

					var div_26 = $.sibling(div_24, 2);
					var div_27 = $.sibling($.child(div_26), 2);
					var text_5 = $.only_child(div_27, true);

					$.reset(div_26);

					var div_28 = $.sibling(div_26, 2);
					var div_29 = $.sibling($.child(div_28), 2);
					let classes_2;
					var text_6 = $.only_child(div_29, true);

					$.reset(div_28);

					var div_30 = $.sibling(div_28, 2);
					var div_31 = $.sibling($.child(div_30), 2);
					var text_7 = $.only_child(div_31, true);

					$.reset(div_30);

					var div_32 = $.sibling(div_30, 2);
					var div_33 = $.sibling($.child(div_32), 2);
					var text_8 = $.only_child(div_33, true);

					$.reset(div_32);
					$.reset(div_23);
					$.reset(div_22);
					$.reset(div_20);

					var div_34 = $.sibling(div_20, 2);
					var div_35 = $.child(div_34);
					var div_36 = $.sibling($.child(div_35), 2);
					var button_2 = $.child(div_36);
					var node_11 = $.child(button_2);

					Icon(node_11, { name: 'csv-file', size: 'xs' });
					$.next();
					$.reset(button_2);
					$.action(button_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Export results as CSV file');

					var button_3 = $.sibling(button_2, 2);
					var node_12 = $.child(button_3);

					Icon(node_12, { name: 'json-file', size: 'xs' });
					$.next();
					$.reset(button_3);
					$.action(button_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Export results as JSON file');
					$.reset(div_36);
					$.reset(div_35);

					var div_37 = $.sibling(div_35, 2);
					var div_38 = $.child(div_37);

					$.each(div_38, 21, () => $.get(result).calculations, $.index, ($$anchor, calculation, index) => {
						var div_39 = root_9();
						let classes_3;
						var div_40 = $.child(div_39);
						var div_41 = $.child(div_40);
						var div_42 = $.child(div_41);
						var span_2 = $.child(div_42);

						$.action(span_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Starting IP address');

						var div_43 = $.sibling(span_2, 2);
						var span_3 = $.child(div_43);
						var text_9 = $.only_child(span_3, true);
						var button_4 = $.sibling(span_3, 2);
						let classes_4;
						var node_13 = $.child(button_4);

						{
							let $0 = $.derived(() => clipboard.isCopied(`start-${index}`) ? 'check' : 'copy');

							Icon(node_13, {
								get name() {
									return $.get($0);
								},
								size: 'xs'
							});
						}

						$.reset(button_4);
						$.action(button_4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Copy start IP');
						$.reset(div_43);
						$.reset(div_42);

						var div_44 = $.sibling(div_42, 2);
						var text_10 = $.only_child(div_44, true);

						$.action(div_44, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => `Direction: ${$.get(calculation).direction}`);

						var div_45 = $.sibling(div_44, 2);
						var span_4 = $.child(div_45);

						$.action(span_4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Ending IP address');

						var div_46 = $.sibling(span_4, 2);
						var span_5 = $.child(div_46);
						var text_11 = $.only_child(span_5, true);
						var button_5 = $.sibling(span_5, 2);
						let classes_5;
						var node_14 = $.child(button_5);

						{
							let $0 = $.derived(() => clipboard.isCopied(`end-${index}`) ? 'check' : 'copy');

							Icon(node_14, {
								get name() {
									return $.get($0);
								},
								size: 'xs'
							});
						}

						$.reset(button_5);
						$.action(button_5, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Copy end IP');
						$.reset(div_46);
						$.reset(div_45);
						$.reset(div_41);

						var div_47 = $.sibling(div_41, 2);
						var node_15 = $.child(div_47);

						{
							var consequent_2 = ($$anchor) => {
								Icon($$anchor, { name: 'check-circle', size: 'sm' });
							};

							var alternate = ($$anchor) => {
								Icon($$anchor, { name: 'x-circle', size: 'sm' });
							};

							$.if(node_15, ($$render) => {
								if ($.get(calculation).isValid) $$render(consequent_2); else $$render(alternate, -1);
							});
						}

						$.reset(div_47);
						$.reset(div_40);

						var node_16 = $.sibling(div_40, 2);

						{
							var consequent_5 = ($$anchor) => {
								var div_48 = root_7();
								var div_49 = $.child(div_48);
								var div_50 = $.child(div_49);
								var div_51 = $.child(div_50);
								var span_6 = $.child(div_51);
								var text_12 = $.only_child(span_6, true);
								var button_6 = $.sibling(span_6, 2);
								let classes_6;
								var node_17 = $.child(button_6);

								{
									let $0 = $.derived(() => clipboard.isCopied(`distance-${index}`) ? 'check' : 'copy');

									Icon(node_17, {
										get name() {
											return $.get($0);
										},
										size: 'xs'
									});
								}

								$.reset(button_6);
								$.action(button_6, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Copy distance value');
								$.reset(div_51);

								var span_7 = $.sibling(div_51, 2);
								var text_13 = $.only_child(span_7);

								$.reset(div_50);

								var div_52 = $.sibling(div_50, 2);
								var span_8 = $.child(div_52);
								var node_18 = $.child(span_8);

								Icon(node_18, { name: 'globe', size: 'xs' });

								var text_14 = $.sibling(node_18);

								$.reset(span_8);
								$.action(span_8, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => `IP version ${$.get(calculation).version}`);

								var span_9 = $.sibling(span_8, 2);
								var node_19 = $.child(span_9);

								Icon(node_19, { name: 'arrow-right', size: 'xs' });

								var text_15 = $.sibling(node_19);

								$.reset(span_9);
								$.action(span_9, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => `Calculation direction: ${$.get(calculation).direction}`);
								$.reset(div_52);
								$.reset(div_49);

								var node_20 = $.sibling(div_49, 2);

								{
									var consequent_4 = ($$anchor) => {
										var div_53 = root_6();
										var div_54 = $.child(div_53);
										var button_7 = $.sibling($.child(div_54), 2);
										let classes_7;
										var node_21 = $.child(button_7);

										{
											let $0 = $.derived(() => clipboard.isCopied(`intermediates-${index}`) ? 'check' : 'copy');

											Icon(node_21, {
												get name() {
													return $.get($0);
												},
												size: 'xs'
											});
										}

										$.next();
										$.reset(button_7);
										$.action(button_7, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Copy all intermediate addresses');
										$.reset(div_54);

										var div_55 = $.sibling(div_54, 2);
										var node_22 = $.child(div_55);

										$.each(node_22, 17, () => $.get(calculation).intermediateAddresses, $.index, ($$anchor, ip, ipIndex) => {
											var div_56 = root_4();
											var span_10 = $.child(div_56);
											var text_16 = $.only_child(span_10, true);
											var button_8 = $.sibling(span_10, 2);
											let classes_8;
											var node_23 = $.child(button_8);

											{
												let $0 = $.derived(() => clipboard.isCopied(`intermediate-${index}-${ipIndex}`) ? 'check' : 'copy');

												Icon(node_23, {
													get name() {
														return $.get($0);
													},
													size: 'xs'
												});
											}

											$.reset(button_8);
											$.action(button_8, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Copy this IP address');
											$.reset(div_56);

											$.template_effect(
												($0) => {
													$.set_text(text_16, $.get(ip));
													classes_8 = $.set_class(button_8, 1, 'copy-btn', null, classes_8, { copied: $0 });
												},
												[() => clipboard.isCopied(`intermediate-${index}-${ipIndex}`)]
											);

											$.delegated('click', button_8, () => clipboard.copy($.get(ip), `intermediate-${index}-${ipIndex}`));
											$.append($$anchor, div_56);
										});

										var node_24 = $.sibling(node_22, 2);

										{
											var consequent_3 = ($$anchor) => {
												var span_11 = root_5();
												var text_17 = $.only_child(span_11);

												$.template_effect(($0) => $.set_text(text_17, `... and ${$0 ?? ''} more`), [
													() => formatNumber(Number($.get(calculation).distanceNumber - BigInt($.get(calculation).intermediateAddresses.length + 2)))
												]);

												$.append($$anchor, span_11);
											};

											var d = $.derived(() => $.get(calculation).distanceNumber > BigInt($.get(calculation).intermediateAddresses.length + 2));

											$.if(node_24, ($$render) => {
												if ($.get(d)) $$render(consequent_3);
											});
										}

										$.reset(div_55);
										$.reset(div_53);
										$.template_effect(($0) => classes_7 = $.set_class(button_7, 1, 'copy-btn', null, classes_7, { copied: $0 }), [() => clipboard.isCopied(`intermediates-${index}`)]);
										$.delegated('click', button_7, () => clipboard.copy($.get(calculation).intermediateAddresses.join('\n'), `intermediates-${index}`));
										$.append($$anchor, div_53);
									};

									$.if(node_20, ($$render) => {
										if ($.get(calculation).intermediateAddresses.length > 0) $$render(consequent_4);
									});
								}

								$.reset(div_48);

								$.template_effect(
									($0, $1) => {
										$.set_text(text_12, $.get(calculation).distance);
										classes_6 = $.set_class(button_6, 1, 'copy-btn', null, classes_6, { copied: $0 });

										$.set_text(text_13, `address${$.get(calculation).distanceNumber === 1n ? '' : 'es'}
                            (${$.get(calculation).inclusive ? 'inclusive' : 'exclusive'})`);

										$.set_text(text_14, ` IPv${$.get(calculation).version ?? ''}`);
										$.set_style(span_9, `color: ${$1 ?? ''}`);
										$.set_text(text_15, ` ${$.get(calculation).direction ?? ''}`);
									},
									[
										() => clipboard.isCopied(`distance-${index}`),
										() => getDirectionColor($.get(calculation).direction)
									]
								);

								$.delegated('click', button_6, () => clipboard.copy($.get(calculation).distance, `distance-${index}`));
								$.append($$anchor, div_48);
							};

							var alternate_1 = ($$anchor) => {
								var div_57 = root_8();
								var node_25 = $.child(div_57);

								Icon(node_25, { name: 'alert-triangle', size: 'sm' });

								var span_12 = $.sibling(node_25, 2);
								var text_18 = $.only_child(span_12, true);

								$.reset(div_57);
								$.template_effect(() => $.set_text(text_18, $.get(calculation).error));
								$.append($$anchor, div_57);
							};

							$.if(node_16, ($$render) => {
								if ($.get(calculation).isValid) $$render(consequent_5); else $$render(alternate_1, -1);
							});
						}

						$.reset(div_39);

						$.template_effect(
							($0, $1, $2, $3) => {
								classes_3 = $.set_class(div_39, 1, 'calculation-card svelte-esn2mq', null, classes_3, {
									valid: $.get(calculation).isValid,
									invalid: !$.get(calculation).isValid
								});

								$.set_text(text_9, $.get(calculation).startIP);
								classes_4 = $.set_class(button_4, 1, 'copy-btn', null, classes_4, { copied: $0 });
								$.set_style(div_44, `color: ${$1 ?? ''}`);
								$.set_text(text_10, $2);
								$.set_text(text_11, $.get(calculation).endIP);
								classes_5 = $.set_class(button_5, 1, 'copy-btn', null, classes_5, { copied: $3 });
							},
							[
								() => clipboard.isCopied(`start-${index}`),
								() => getDirectionColor($.get(calculation).direction),
								() => formatDirection($.get(calculation).direction),
								() => clipboard.isCopied(`end-${index}`)
							]
						);

						$.delegated('click', button_4, () => clipboard.copy($.get(calculation).startIP, `start-${index}`));
						$.delegated('click', button_5, () => clipboard.copy($.get(calculation).endIP, `end-${index}`));
						$.append($$anchor, div_39);
					});

					$.reset(div_38);
					$.reset(div_37);
					$.reset(div_34);

					$.template_effect(
						($0, $1) => {
							classes_1 = $.set_class(button_1, 1, 'copy-btn', null, classes_1, { copied: $0 });
							$.set_text(text_3, ` ${$1 ?? ''}`);
							$.set_text(text_4, $.get(result).summary.totalCalculations);
							$.set_text(text_5, $.get(result).summary.validCalculations);
							classes_2 = $.set_class(div_29, 1, 'metric-value', null, classes_2, { error: $.get(result).summary.invalidCalculations > 0 });
							$.set_text(text_6, $.get(result).summary.invalidCalculations);
							$.set_text(text_7, $.get(result).summary.totalDistance);
							$.set_text(text_8, $.get(result).summary.averageDistance);
						},
						[
							() => clipboard.isCopied('summary'),
							() => clipboard.isCopied('summary') ? 'Copied!' : 'Copy'
						]
					);

					$.delegated('click', button_1, () => $.get(result) && clipboard.copy(`Total Pairs: ${$.get(result).summary.totalCalculations}\nValid: ${$.get(result).summary.validCalculations}\nInvalid: ${$.get(result).summary.invalidCalculations}\nTotal Distance: ${$.get(result).summary.totalDistance}\nAverage Distance: ${$.get(result).summary.averageDistance}`, 'summary'));
					$.delegated('click', button_2, () => exportResults('csv'));
					$.delegated('click', button_3, () => exportResults('json'));
					$.append($$anchor, fragment);
				};

				$.if(node_9, ($$render) => {
					if ($.get(result).calculations.length > 0) $$render(consequent_6);
				});
			}

			$.reset(div_15);
			$.append($$anchor, div_15);
		};

		$.if(node_5, ($$render) => {
			if ($.get(result)) $$render(consequent_7);
		});
	}

	$.reset(div);
	$.delegated('input', textarea, handleInputChange);
	$.bind_value(textarea, () => $.get(inputText), ($$value) => $.set(inputText, $$value));
	$.delegated('change', input, handleInputChange);
	$.bind_checked(input, () => $.get(inclusive), ($$value) => $.set(inclusive, $$value));
	$.delegated('change', input_1, handleInputChange);
	$.bind_checked(input_1, () => $.get(showIntermediates), ($$value) => $.set(showIntermediates, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'input', 'change']);