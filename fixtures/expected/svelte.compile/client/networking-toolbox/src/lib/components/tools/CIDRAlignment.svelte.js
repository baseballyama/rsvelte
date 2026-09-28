import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { checkCIDRAlignment } from '$lib/utils/cidr-alignment.js';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import '../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<button><div class="example-label"> </div> <div class="example-preview"> </div></button>`);
var root_1 = $.from_html(`<div class="validation-error svelte-fznzbj"><!> </div>`);
var root_2 = $.from_html(`<div class="validation-errors svelte-fznzbj"></div>`);
var root_3 = $.from_html(`<div class="loading svelte-fznzbj"><!> Checking alignment...</div>`);
var root_4 = $.from_html(`<div class="error-item svelte-fznzbj"> </div>`);
var root_5 = $.from_html(`<div class="errors svelte-fznzbj"><h3 class="svelte-fznzbj"><!> Errors</h3> <!></div>`);
var root_6 = $.from_html(`<!> <span class="status-text svelte-fznzbj"> </span>`, 1);
var root_7 = $.from_html(`<div class="aligned-cidr svelte-fznzbj"><span class="aligned-label svelte-fznzbj">Aligned CIDR:</span> <div class="cidr-with-copy svelte-fznzbj"><code class="aligned-code svelte-fznzbj"> </code> <button type="button"><!></button></div></div>`);
var root_8 = $.from_html(`<div class="reason svelte-fznzbj"><span class="reason-label svelte-fznzbj">Reason:</span> <span class="reason-text svelte-fznzbj"> </span></div>`);
var root_9 = $.from_html(`<div class="suggestion-cidr svelte-fznzbj"><code class="suggestion-code svelte-fznzbj"> </code> <button type="button"><!></button></div>`);
var root_10 = $.from_html(`<div class="suggestion-efficiency svelte-fznzbj"> </div>`);
var root_11 = $.from_html(`<div class="suggestion svelte-fznzbj"><div class="suggestion-type svelte-fznzbj"><!> <span class="suggestion-description svelte-fznzbj"> </span></div> <div class="suggestion-cidrs svelte-fznzbj"></div> <!></div>`);
var root_12 = $.from_html(`<div class="suggestions svelte-fznzbj"><span class="suggestions-label svelte-fznzbj">Suggestions:</span> <!></div>`);
var root_13 = $.from_html(`<div><div class="check-header svelte-fznzbj"><div class="check-input svelte-fznzbj"><span class="input-text svelte-fznzbj"> </span> <span class="input-type svelte-fznzbj"> </span></div> <div class="check-status svelte-fznzbj"><!></div></div> <!> <!> <!></div>`);
var root_14 = $.from_html(`<div class="summary svelte-fznzbj"><h3 class="svelte-fznzbj">Alignment Summary</h3> <div class="summary-stats svelte-fznzbj"><div class="stat svelte-fznzbj"><span class="stat-value svelte-fznzbj"> </span> <span class="stat-label svelte-fznzbj">Total Inputs</span></div> <div class="stat aligned svelte-fznzbj"><span class="stat-value svelte-fznzbj"> </span> <span class="stat-label svelte-fznzbj">Aligned</span></div> <div class="stat misaligned svelte-fznzbj"><span class="stat-value svelte-fznzbj"> </span> <span class="stat-label svelte-fznzbj">Misaligned</span></div> <div class="stat svelte-fznzbj"><span class="stat-value svelte-fznzbj"> </span> <span class="stat-label svelte-fznzbj">Alignment Rate</span></div></div></div> <div class="checks svelte-fznzbj"><div class="checks-header svelte-fznzbj"><h3 class="svelte-fznzbj">Alignment Checks</h3> <div class="export-buttons svelte-fznzbj"><button class="svelte-fznzbj"><!> Export CSV</button> <button class="svelte-fznzbj"><!> Export JSON</button></div></div> <div class="checks-list svelte-fznzbj"></div></div>`, 1);
var root_15 = $.from_html(`<div class="results svelte-fznzbj"><!> <!></div>`);

var root_16 = $.from_html(`<div class="card"><header class="card-header"><h2>CIDR Boundary Alignment</h2> <p>Check if IP addresses, ranges, and CIDR blocks align to specific prefix boundaries</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary"><!> <h4>Quick Examples</h4></summary> <div class="examples-grid"></div></details></div> <div class="input-section svelte-fznzbj"><div class="inputs-card svelte-fznzbj"><h3 class="svelte-fznzbj">Network Inputs</h3> <div class="input-group svelte-fznzbj"><label for="inputs" class="svelte-fznzbj">IP Addresses, CIDRs, or Ranges</label> <textarea id="inputs" placeholder="192.168.1.0/24
10.0.0.0-10.0.0.255
172.16.1.5
2001:db8::/32" rows="8" class="svelte-fznzbj"></textarea> <div class="input-help svelte-fznzbj">Enter one per line: CIDR blocks (192.168.1.0/24), IP ranges (10.0.0.1-10.0.0.100), or single IPs (172.16.1.5)</div></div> <div class="input-group svelte-fznzbj"><label for="prefix" class="svelte-fznzbj">Target Prefix Length</label> <input id="prefix" type="number" min="0" max="128" placeholder="24"/> <div class="input-help svelte-fznzbj">Prefix length to check alignment against (0-32 for IPv4, 0-128 for IPv6)</div> <!></div></div></div> <!> <!></div>`);

export default function CIDRAlignment($$anchor, $$props) {
	$.push($$props, true);

	let inputText = $.state('192.168.1.0/24\n10.0.0.0-10.0.0.255\n172.16.1.5');
	let targetPrefix = $.state(24);
	let result = $.state(null);
	let isLoading = $.state(false);
	let copiedStates = $.proxy({});
	let _selectedExample = $.state(null);
	let selectedExampleIndex = $.state(null);
	let _userModified = $.state(false);
	let validationErrors = $.state($.proxy([]));

	const examples = [
		{
			label: 'Basic IPv4 Alignment',
			input: `192.168.1.0/24
192.168.2.0/24
192.168.3.0/24`,
			targetPrefix: 22
		},

		{
			label: 'Mixed IP Types',
			input: `10.0.0.0-10.0.0.255
172.16.5.100
192.168.1.0/25`,
			targetPrefix: 24
		},

		{
			label: 'Subnet Aggregation Check',
			input: `192.168.0.0/26
192.168.0.64/26
192.168.0.128/26
192.168.0.192/26`,
			targetPrefix: 24
		},

		{
			label: 'Network Consolidation',
			input: `10.1.0.0/24
10.1.1.0/24
10.1.2.0/24
10.1.3.0/24`,
			targetPrefix: 22
		},

		{
			label: 'VLAN Alignment Check',
			input: `172.16.10.0/24
172.16.11.0/24
172.16.15.0/24
172.16.20.0/24`,
			targetPrefix: 20
		},

		{
			label: 'Point-to-Point Links',
			input: `192.168.100.0/30
192.168.100.4/30
192.168.100.8/30
192.168.100.12/30`,
			targetPrefix: 28
		}
	];

	function validateTargetPrefix() {
		const errors = [];

		// Check if target prefix is a valid number
		if (isNaN($.get(targetPrefix)) || $.get(targetPrefix) === null || $.get(targetPrefix) === undefined) {
			errors.push('Target prefix length must be a valid number');

			return errors;
		}

		// Check if target prefix is within basic bounds
		if ($.get(targetPrefix) < 0 || $.get(targetPrefix) > 128) {
			errors.push('Target prefix length must be between 0 and 128');

			return errors;
		}

		// Check if inputs exist to validate against
		if (!$.get(inputText).trim()) {
			return errors;
		}

		// Analyze input types to determine valid prefix ranges
		const inputs = $.get(inputText).split('\n').filter((line) => line.trim());

		let hasIPv4 = false;
		let hasIPv6 = false;

		for (const input of inputs) {
			const trimmed = input.trim();

			if (!trimmed) continue;

			// Check for IPv6 (contains colons)
			if (trimmed.includes(':')) {
				hasIPv6 = true;
			} else // Check for IPv4 patterns
			if (trimmed.match(/^\d+\.\d+\.\d+\.\d+/) || trimmed.includes('-') || trimmed.includes('/')) {
				hasIPv4 = true;
			}
		}

		// Validate prefix length based on IP types present
		if (hasIPv4 && !hasIPv6 && $.get(targetPrefix) > 32) {
			errors.push('Target prefix length cannot exceed 32 for IPv4 addresses');
		}

		if (hasIPv6 && $.get(targetPrefix) > 128) {
			errors.push('Target prefix length cannot exceed 128 for IPv6 addresses');
		}

		// Additional practical validation
		if ($.get(targetPrefix) === 0) {
			errors.push('Target prefix length of 0 is not practical for alignment checking');
		}

		return errors;
	}

	function checkAlignment() {
		// Reset validation errors
		$.set(validationErrors, [], true);

		if (!$.get(inputText).trim()) {
			$.set(result, null);

			return;
		}

		// Validate target prefix first
		const prefixErrors = validateTargetPrefix();

		if (prefixErrors.length > 0) {
			$.set(validationErrors, prefixErrors, true);

			$.set(
				result,
				{
					checks: [],
					summary: {
						totalInputs: 0,
						alignedInputs: 0,
						misalignedInputs: 0,
						alignmentRate: 0
					},
					errors: prefixErrors
				},
				true
			);

			return;
		}

		$.set(isLoading, true);

		try {
			const inputs = $.get(inputText).split('\n').filter((line) => line.trim());

			$.set(result, checkCIDRAlignment(inputs, $.get(targetPrefix)), true);

			$.set(
				validationErrors,
				[], // Clear validation errors on success
				true
			);
		} catch(error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';

			$.set(validationErrors, [errorMessage], true);

			$.set(
				result,
				{
					checks: [],
					summary: {
						totalInputs: 0,
						alignedInputs: 0,
						misalignedInputs: 0,
						alignmentRate: 0
					},
					errors: [errorMessage]
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
			const headers = 'Input,Type,Is Aligned,Target Prefix,Aligned CIDR,Reason';
			const rows = $.get(result).checks.map((check) => `"${check.input}","${check.type}","${check.isAligned}","${check.targetPrefix}","${check.alignedCIDR || ''}","${check.reason || ''}"`);

			content = [headers, ...rows].join('\n');
			filename = `cidr-alignment-${timestamp}.csv`;
		} else {
			content = JSON.stringify($.get(result), null, 2);
			filename = `cidr-alignment-${timestamp}.json`;
		}

		const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}

	async function copyToClipboard(text, id) {
		try {
			await navigator.clipboard.writeText(text);
			copiedStates[id] = true;

			setTimeout(
				() => {
					copiedStates[id] = false;
				},
				2000
			);
		} catch(err) {
			console.error('Failed to copy text: ', err);
		}
	}

	function loadExample(example, index) {
		$.set(inputText, example.input, true);
		$.set(targetPrefix, example.targetPrefix, true);
		$.set(_selectedExample, example.label, true);
		$.set(selectedExampleIndex, index, true);
		$.set(_userModified, false);
	}

	function handleInputChange() {
		$.set(_userModified, true);
		$.set(_selectedExample, null);
		$.set(selectedExampleIndex, null);
	}

	// Auto-check when inputs change
	$.user_effect(() => {
		if ($.get(inputText).trim() && $.get(targetPrefix) > 0) {
			const timeoutId = setTimeout(checkAlignment, 300);

			return () => clearTimeout(timeoutId);
		}
	});

	var div = root_16();
	var div_1 = $.sibling($.child(div), 2);
	var details = $.child(div_1);
	var summary = $.child(details);
	var node = $.child(summary);

	Icon(node, { name: 'chevron-right', size: 'xs' });
	$.next(2);
	$.reset(summary);

	var div_2 = $.sibling(summary, 2);

	$.each(div_2, 23, () => examples, (example) => example.label, ($$anchor, example, i) => {
		var button = root();
		let classes;
		var div_3 = $.child(button);
		var text_1 = $.only_child(div_3, true);
		var div_4 = $.sibling(div_3, 2);
		var text_2 = $.only_child(div_4);

		$.reset(button);

		$.template_effect(() => {
			classes = $.set_class(button, 1, 'example-card', null, classes, { selected: $.get(selectedExampleIndex) === $.get(i) });
			$.set_text(text_1, $.get(example).label);
			$.set_text(text_2, `Target: /${$.get(example).targetPrefix ?? ''}`);
		});

		$.delegated('click', button, () => loadExample($.get(example), $.get(i)));
		$.append($$anchor, button);
	});

	$.reset(div_2);
	$.reset(details);
	$.reset(div_1);

	var div_5 = $.sibling(div_1, 2);
	var div_6 = $.child(div_5);
	var h3 = $.child(div_6);

	$.action(h3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter IP addresses, CIDR blocks, or ranges to check alignment');

	var div_7 = $.sibling(h3, 2);
	var label = $.child(div_7);

	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter one per line: CIDR blocks, IP ranges, or individual IP addresses');

	var textarea = $.sibling(label, 2);

	$.remove_textarea_child(textarea);
	$.next(2);
	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var label_1 = $.child(div_8);

	$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'The prefix length boundary to check alignment against (e.g., 24 for /24 boundaries)');

	var input_1 = $.sibling(label_1, 2);

	$.remove_input_defaults(input_1);

	let classes_1;
	var node_1 = $.sibling(input_1, 4);

	{
		var consequent = ($$anchor) => {
			var div_9 = root_2();

			$.each(div_9, 20, () => $.get(validationErrors), (error) => error, ($$anchor, error) => {
				var div_10 = root_1();
				var node_2 = $.child(div_10);

				Icon(node_2, { name: 'alert-circle', size: 'xs' });

				var text_3 = $.sibling(node_2);

				$.reset(div_10);
				$.template_effect(() => $.set_text(text_3, ` ${error ?? ''}`));
				$.append($$anchor, div_10);
			});

			$.reset(div_9);
			$.append($$anchor, div_9);
		};

		$.if(node_1, ($$render) => {
			if ($.get(validationErrors).length > 0) $$render(consequent);
		});
	}

	$.reset(div_8);
	$.reset(div_6);
	$.reset(div_5);

	var node_3 = $.sibling(div_5, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_11 = root_3();
			var node_4 = $.child(div_11);

			Icon(node_4, { name: 'loader' });
			$.next();
			$.reset(div_11);
			$.append($$anchor, div_11);
		};

		$.if(node_3, ($$render) => {
			if ($.get(isLoading)) $$render(consequent_1);
		});
	}

	var node_5 = $.sibling(node_3, 2);

	{
		var consequent_11 = ($$anchor) => {
			var div_12 = root_15();
			var node_6 = $.child(div_12);

			{
				var consequent_2 = ($$anchor) => {
					var div_13 = root_5();
					var h3_1 = $.child(div_13);
					var node_7 = $.child(h3_1);

					Icon(node_7, { name: 'alert-triangle' });
					$.next();
					$.reset(h3_1);

					var node_8 = $.sibling(h3_1, 2);

					$.each(node_8, 16, () => $.get(result).errors, (error) => error, ($$anchor, error) => {
						var div_14 = root_4();
						var text_4 = $.only_child(div_14, true);

						$.template_effect(() => $.set_text(text_4, error));
						$.append($$anchor, div_14);
					});

					$.reset(div_13);
					$.append($$anchor, div_13);
				};

				$.if(node_6, ($$render) => {
					if ($.get(result).errors.length > 0) $$render(consequent_2);
				});
			}

			var node_9 = $.sibling(node_6, 2);

			{
				var consequent_10 = ($$anchor) => {
					var fragment = root_14();
					var div_15 = $.first_child(fragment);
					var h3_2 = $.child(div_15);

					$.action(h3_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Overview of alignment results across all inputs');

					var div_16 = $.sibling(h3_2, 2);
					var div_17 = $.child(div_16);
					var span = $.child(div_17);
					var text_5 = $.only_child(span, true);
					var span_1 = $.sibling(span, 2);

					$.action(span_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Total number of network inputs processed');
					$.reset(div_17);

					var div_18 = $.sibling(div_17, 2);
					var span_2 = $.child(div_18);
					var text_6 = $.only_child(span_2, true);
					var span_3 = $.sibling(span_2, 2);

					$.action(span_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Networks that align to the target prefix boundary');
					$.reset(div_18);

					var div_19 = $.sibling(div_18, 2);
					var span_4 = $.child(div_19);
					var text_7 = $.only_child(span_4, true);
					var span_5 = $.sibling(span_4, 2);

					$.action(span_5, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Networks that do not align to the target prefix boundary');
					$.reset(div_19);

					var div_20 = $.sibling(div_19, 2);
					var span_6 = $.child(div_20);
					var text_8 = $.only_child(span_6);
					var span_7 = $.sibling(span_6, 2);

					$.action(span_7, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Percentage of inputs that align to the target boundary');
					$.reset(div_20);
					$.reset(div_16);
					$.reset(div_15);

					var div_21 = $.sibling(div_15, 2);
					var div_22 = $.child(div_21);
					var h3_3 = $.child(div_22);

					$.action(h3_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Detailed results for each network input');

					var div_23 = $.sibling(h3_3, 2);
					var button_1 = $.child(div_23);
					var node_10 = $.child(button_1);

					Icon(node_10, { name: 'csv-file' });
					$.next();
					$.reset(button_1);

					var button_2 = $.sibling(button_1, 2);
					var node_11 = $.child(button_2);

					Icon(node_11, { name: 'json-file' });
					$.next();
					$.reset(button_2);
					$.reset(div_23);
					$.reset(div_22);

					var div_24 = $.sibling(div_22, 2);

					$.each(div_24, 21, () => $.get(result).checks, (check) => check.input, ($$anchor, check) => {
						var div_25 = root_13();
						let classes_2;
						var div_26 = $.child(div_25);
						var div_27 = $.child(div_26);
						var span_8 = $.child(div_27);
						var text_9 = $.only_child(span_8, true);
						var span_9 = $.sibling(span_8, 2);
						var text_10 = $.only_child(span_9, true);

						$.reset(div_27);

						var div_28 = $.sibling(div_27, 2);
						var node_12 = $.child(div_28);

						{
							var consequent_3 = ($$anchor) => {
								var fragment_1 = root_6();
								var node_13 = $.first_child(fragment_1);

								Icon(node_13, { name: 'check-circle', size: 'sm' });

								var span_10 = $.sibling(node_13, 2);
								var text_11 = $.only_child(span_10);

								$.template_effect(() => $.set_text(text_11, `Aligned to /${$.get(check).targetPrefix ?? ''}`));
								$.append($$anchor, fragment_1);
							};

							var alternate = ($$anchor) => {
								var fragment_2 = root_6();
								var node_14 = $.first_child(fragment_2);

								Icon(node_14, { name: 'x-circle', size: 'sm' });

								var span_11 = $.sibling(node_14, 2);
								var text_12 = $.only_child(span_11);

								$.template_effect(() => $.set_text(text_12, `Not aligned to /${$.get(check).targetPrefix ?? ''}`));
								$.append($$anchor, fragment_2);
							};

							$.if(node_12, ($$render) => {
								if ($.get(check).isAligned) $$render(consequent_3); else $$render(alternate, -1);
							});
						}

						$.reset(div_28);
						$.reset(div_26);

						var node_15 = $.sibling(div_26, 2);

						{
							var consequent_4 = ($$anchor) => {
								var div_29 = root_7();
								var span_12 = $.child(div_29);

								$.action(span_12, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'The CIDR block that properly aligns to the target prefix boundary');

								var div_30 = $.sibling(span_12, 2);
								var code = $.child(div_30);
								var text_13 = $.only_child(code, true);
								var button_3 = $.sibling(code, 2);
								var node_16 = $.child(button_3);

								{
									let $0 = $.derived(() => copiedStates[`cidr-${$.get(check).input}`] ? 'check' : 'copy');

									Icon(node_16, {
										get name() {
											return $.get($0);
										},
										size: 'xs'
									});
								}

								$.reset(button_3);
								$.action(button_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Copy aligned CIDR to clipboard');
								$.reset(div_30);
								$.reset(div_29);

								$.template_effect(() => {
									$.set_text(text_13, $.get(check).alignedCIDR);
									$.set_class(button_3, 1, `copy-button ${copiedStates[`cidr-${$.get(check).input}`] ? 'copied' : ''}`, 'svelte-fznzbj');
								});

								$.delegated('click', button_3, () => copyToClipboard($.get(check).alignedCIDR, `cidr-${$.get(check).input}`));
								$.append($$anchor, div_29);
							};

							$.if(node_15, ($$render) => {
								if ($.get(check).alignedCIDR) $$render(consequent_4);
							});
						}

						var node_17 = $.sibling(node_15, 2);

						{
							var consequent_5 = ($$anchor) => {
								var div_31 = root_8();
								var span_13 = $.child(div_31);

								$.action(span_13, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => "Explanation of why this input aligns or doesn't align");

								var span_14 = $.sibling(span_13, 2);
								var text_14 = $.only_child(span_14, true);

								$.reset(div_31);
								$.template_effect(() => $.set_text(text_14, $.get(check).reason));
								$.append($$anchor, div_31);
							};

							$.if(node_17, ($$render) => {
								if ($.get(check).reason) $$render(consequent_5);
							});
						}

						var node_18 = $.sibling(node_17, 2);

						{
							var consequent_9 = ($$anchor) => {
								var div_32 = root_12();
								var span_15 = $.child(div_32);

								$.action(span_15, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Alternative CIDR configurations that would align to the target boundary');

								var node_19 = $.sibling(span_15, 2);

								$.each(node_19, 17, () => $.get(check).suggestions, (suggestion) => suggestion.type + suggestion.description, ($$anchor, suggestion) => {
									var div_33 = root_11();
									var div_34 = $.child(div_33);
									var node_20 = $.child(div_34);

									{
										var consequent_6 = ($$anchor) => {
											Icon($$anchor, { name: 'zoom-out', size: 'sm' });
										};

										var consequent_7 = ($$anchor) => {
											Icon($$anchor, { name: 'zoom-in', size: 'sm' });
										};

										var alternate_1 = ($$anchor) => {
											Icon($$anchor, { name: 'scissors', size: 'sm' });
										};

										$.if(node_20, ($$render) => {
											if ($.get(suggestion).type === 'larger') $$render(consequent_6); else if ($.get(suggestion).type === 'smaller') $$render(consequent_7, 1); else $$render(alternate_1, -1);
										});
									}

									var span_16 = $.sibling(node_20, 2);
									var text_15 = $.only_child(span_16, true);

									$.reset(div_34);

									var div_35 = $.sibling(div_34, 2);

									$.each(div_35, 22, () => $.get(suggestion).cidrs, (cidr) => cidr, ($$anchor, cidr, idx) => {
										var div_36 = root_9();
										var code_1 = $.child(div_36);
										var text_16 = $.only_child(code_1, true);
										var button_4 = $.sibling(code_1, 2);
										var node_21 = $.child(button_4);

										{
											let $0 = $.derived(() => copiedStates[`suggestion-${$.get(check).input}-${$.get(idx)}`] ? 'check' : 'copy');

											Icon(node_21, {
												get name() {
													return $.get($0);
												},
												size: 'xs'
											});
										}

										$.reset(button_4);
										$.action(button_4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Copy suggested CIDR to clipboard');
										$.reset(div_36);

										$.template_effect(() => {
											$.set_text(text_16, cidr);
											$.set_class(button_4, 1, `copy-button ${copiedStates[`suggestion-${$.get(check).input}-${$.get(idx)}`] ? 'copied' : ''}`, 'svelte-fznzbj');
										});

										$.delegated('click', button_4, () => copyToClipboard(cidr, `suggestion-${$.get(check).input}-${$.get(idx)}`));
										$.append($$anchor, div_36);
									});

									$.reset(div_35);

									var node_22 = $.sibling(div_35, 2);

									{
										var consequent_8 = ($$anchor) => {
											var div_37 = root_10();
											var text_17 = $.only_child(div_37);

											$.action(div_37, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Address space utilization efficiency of this suggestion');
											$.template_effect(() => $.set_text(text_17, `Efficiency: ${$.get(suggestion).efficiency ?? ''}%`));
											$.append($$anchor, div_37);
										};

										$.if(node_22, ($$render) => {
											if ($.get(suggestion).efficiency) $$render(consequent_8);
										});
									}

									$.reset(div_33);
									$.template_effect(() => $.set_text(text_15, $.get(suggestion).description));
									$.append($$anchor, div_33);
								});

								$.reset(div_32);
								$.append($$anchor, div_32);
							};

							$.if(node_18, ($$render) => {
								if ($.get(check).suggestions.length > 0) $$render(consequent_9);
							});
						}

						$.reset(div_25);

						$.template_effect(
							($0) => {
								classes_2 = $.set_class(div_25, 1, 'check-item svelte-fznzbj', null, classes_2, {
									aligned: $.get(check).isAligned,
									misaligned: !$.get(check).isAligned
								});

								$.set_text(text_9, $.get(check).input);
								$.set_text(text_10, $0);
							},
							[() => $.get(check).type.toUpperCase()]
						);

						$.append($$anchor, div_25);
					});

					$.reset(div_24);
					$.reset(div_21);

					$.template_effect(() => {
						$.set_text(text_5, $.get(result).summary.totalInputs);
						$.set_text(text_6, $.get(result).summary.alignedInputs);
						$.set_text(text_7, $.get(result).summary.misalignedInputs);
						$.set_text(text_8, `${$.get(result).summary.alignmentRate ?? ''}%`);
					});

					$.delegated('click', button_1, () => exportResults('csv'));
					$.delegated('click', button_2, () => exportResults('json'));
					$.append($$anchor, fragment);
				};

				$.if(node_9, ($$render) => {
					if ($.get(result).checks.length > 0) $$render(consequent_10);
				});
			}

			$.reset(div_12);
			$.append($$anchor, div_12);
		};

		$.if(node_5, ($$render) => {
			if ($.get(result)) $$render(consequent_11);
		});
	}

	$.reset(div);
	$.template_effect(() => classes_1 = $.set_class(input_1, 1, 'svelte-fznzbj', null, classes_1, { error: $.get(validationErrors).length > 0 }));
	$.delegated('input', textarea, handleInputChange);
	$.bind_value(textarea, () => $.get(inputText), ($$value) => $.set(inputText, $$value));
	$.delegated('input', input_1, handleInputChange);
	$.bind_value(input_1, () => $.get(targetPrefix), ($$value) => $.set(targetPrefix, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'input']);