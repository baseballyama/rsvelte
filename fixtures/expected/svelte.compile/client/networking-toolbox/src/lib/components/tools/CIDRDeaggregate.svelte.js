import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { useClipboard } from '$lib/composables';
import { cidrDeaggregate, getSubnetSize } from '$lib/utils/cidr-deaggregate.js';
import { formatNumber } from '$lib/utils/formatters';
import '../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<button><div class="example-label"> </div> <div class="example-preview"> </div></button>`);
var root_1 = $.from_html(`<button><!> </button>`);
var root_2 = $.from_html(`<div class="summary-item svelte-gcckok"><span class="summary-label svelte-gcckok">Note:</span> <span class="summary-value address-diff svelte-gcckok"> </span></div>`);
var root_3 = $.from_html(`<span class="subnet-size svelte-gcckok"> </span>`);
var root_4 = $.from_html(`<div class="subnet-card svelte-gcckok"><div class="subnet-header svelte-gcckok"><code class="subnet-cidr svelte-gcckok"> </code> <button aria-label="Copy CIDR block"><!></button></div> <div class="subnet-info svelte-gcckok"><span class="address-count svelte-gcckok"> </span> <!></div></div>`);
var root_5 = $.from_html(`<div class="subnets-grid svelte-gcckok"></div>`);
var root_6 = $.from_html(`<div class="no-subnets svelte-gcckok"><!> <h4 class="svelte-gcckok">No Subnets Generated</h4> <p>The target prefix length may be too large for the input networks, or the input is empty.</p></div>`);
var root_7 = $.from_html(`<div class="results-header svelte-gcckok"><h3 class="svelte-gcckok">Deaggregated Subnets</h3> <div class="results-actions svelte-gcckok"><div class="results-summary svelte-gcckok"><span class="metric svelte-gcckok"><!> </span> <span class="metric svelte-gcckok"><!> </span></div> <!></div></div> <div class="input-summary svelte-gcckok"><div class="summary-item svelte-gcckok"><span class="summary-label svelte-gcckok">Input:</span> <span class="summary-value svelte-gcckok"> </span></div> <div class="summary-item svelte-gcckok"><span class="summary-label svelte-gcckok">Output:</span> <span class="summary-value svelte-gcckok"> </span></div> <!></div> <!>`, 1);
var root_8 = $.from_html(`<div class="error-message svelte-gcckok"><!> <h4 class="svelte-gcckok">Deaggregation Error</h4> <p> </p></div>`);
var root_9 = $.from_html(`<section class="results-section svelte-gcckok"><!></section>`);

var root_10 = $.from_html(`<div class="card"><header class="card-header"><h2>CIDR Deaggregate</h2> <p>Decompose CIDR blocks and ranges into uniform target prefix subnets</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary"><!> <h4>Quick Examples</h4></summary> <div class="examples-grid"></div></details></div> <section class="input-section svelte-gcckok"><div class="input-grid svelte-gcckok"><div class="input-group"><label for="input">Input Networks/Ranges</label> <textarea id="input" placeholder="192.168.0.0/22
10.0.0.0-10.0.255.255
172.16.1.1" rows="6" required="" class="svelte-gcckok"></textarea></div> <div class="input-group"><label for="target-prefix">Target Prefix Length</label> <div class="prefix-input-wrapper svelte-gcckok"><input id="target-prefix" type="number" min="1" max="32" required="" class="svelte-gcckok"/> <span class="prefix-hint svelte-gcckok"> </span></div> <div class="prefix-info svelte-gcckok"><!></div></div></div></section> <!></div>`);

export default function CIDRDeaggregate($$anchor, $$props) {
	$.push($$props, true);

	let input = $.state(`192.168.0.0/22
10.0.0.0-10.0.0.255`);

	let targetPrefix = $.state(24);
	let result = $.state(null);
	const clipboard = useClipboard();
	let _selectedExample = $.state(null);
	let selectedExampleIndex = $.state(null);
	let _userModified = $.state(false);

	const examples = [
		{
			label: 'Break /22 into /24s',
			input: '192.168.0.0/22',
			targetPrefix: 24
		},

		{
			label: 'Decompose Range to /28s',
			input: '10.0.0.0-10.0.0.255',
			targetPrefix: 28
		},

		{
			label: 'Multiple Blocks to /26s',
			input: `172.16.0.0/24
172.16.2.0/25`,
			targetPrefix: 26
		},

		{
			label: 'Enterprise Campus to /25s',
			input: `10.10.0.0/16
10.20.0.0/17`,
			targetPrefix: 25
		},

		{
			label: 'Data Center Racks to /29s',
			input: `192.168.100.0/24
192.168.101.0-192.168.101.127`,
			targetPrefix: 29
		},

		{
			label: 'Service Provider to /30s',
			input: `203.0.113.0/26
198.51.100.64/27
198.51.100.96/28`,
			targetPrefix: 30
		}
	];

	function loadExample(example, index) {
		$.set(input, example.input, true);
		$.set(targetPrefix, example.targetPrefix, true);
		$.set(_selectedExample, example.label, true);
		$.set(selectedExampleIndex, index, true);
		$.set(_userModified, false);
		performDeaggregation();
	}

	function performDeaggregation() {
		if (!$.get(input).trim()) {
			$.set(result, null);

			return;
		}

		$.set(result, cidrDeaggregate({ input: $.get(input), targetPrefix: $.get(targetPrefix) }), true);
	}

	function handleInputChange() {
		$.set(_userModified, true);
		$.set(_selectedExample, null);
		$.set(selectedExampleIndex, null);
		performDeaggregation();
	}

	async function copyAllSubnets() {
		if (!$.get(result)?.subnets.length) return;

		const allText = $.get(result).subnets.join('\n');

		await clipboard.copy(allText, 'all-subnets');
	}

	// Calculate on component load
	performDeaggregation();

	var div = root_10();
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
		var text = $.only_child(div_3, true);
		var div_4 = $.sibling(div_3, 2);
		var text_1 = $.only_child(div_4);

		$.reset(button);

		$.template_effect(() => {
			classes = $.set_class(button, 1, 'example-card', null, classes, { selected: $.get(selectedExampleIndex) === $.get(i) });
			$.set_text(text, $.get(example).label);
			$.set_text(text_1, `Target: /${$.get(example).targetPrefix ?? ''}`);
		});

		$.delegated('click', button, () => loadExample($.get(example), $.get(i)));
		$.append($$anchor, button);
	});

	$.reset(div_2);
	$.reset(details);
	$.reset(div_1);

	var section = $.sibling(div_1, 2);
	var div_5 = $.child(section);
	var div_6 = $.child(div_5);
	var label = $.child(div_6);

	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter CIDR blocks, IP ranges, or individual IPs - one per line');

	var textarea = $.sibling(label, 2);

	$.remove_textarea_child(textarea);
	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var label_1 = $.child(div_7);

	$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Target prefix length for uniform decomposition (e.g., 24 for /24 subnets)');

	var div_8 = $.sibling(label_1, 2);
	var input_1 = $.child(div_8);

	$.remove_input_defaults(input_1);

	var span = $.sibling(input_1, 2);
	var text_2 = $.only_child(span);

	$.reset(div_8);

	var div_9 = $.sibling(div_8, 2);
	var node_1 = $.child(div_9);

	{
		var consequent = ($$anchor) => {
			const addresses = $.derived(() => getSubnetSize($.get(targetPrefix)));
			var text_3 = $.text();

			$.template_effect(($0) => $.set_text(text_3, `Each /${$.get(targetPrefix) ?? ''} subnet = ${$0 ?? ''} addresses`), [() => formatNumber($.get(addresses))]);
			$.append($$anchor, text_3);
		};

		$.if(node_1, ($$render) => {
			if ($.get(targetPrefix)) $$render(consequent);
		});
	}

	$.reset(div_9);
	$.reset(div_7);
	$.reset(div_5);
	$.reset(section);

	var node_2 = $.sibling(section, 2);

	{
		var consequent_6 = ($$anchor) => {
			var section_1 = root_9();
			var node_3 = $.child(section_1);

			{
				var consequent_5 = ($$anchor) => {
					var fragment_1 = root_7();
					var div_10 = $.first_child(fragment_1);
					var h3 = $.child(div_10);

					$.action(h3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Generated uniform subnets from input networks and ranges');

					var div_11 = $.sibling(h3, 2);
					var div_12 = $.child(div_11);
					var span_1 = $.child(div_12);
					var node_4 = $.child(span_1);

					Icon(node_4, { name: 'network', size: 'sm' });

					var text_4 = $.sibling(node_4);

					$.reset(span_1);

					var span_2 = $.sibling(span_1, 2);
					var node_5 = $.child(span_2);

					Icon(node_5, { name: 'database', size: 'sm' });

					var text_5 = $.sibling(node_5);

					$.reset(span_2);
					$.reset(div_12);

					var node_6 = $.sibling(div_12, 2);

					{
						var consequent_1 = ($$anchor) => {
							var button_1 = root_1();
							var node_7 = $.child(button_1);

							{
								let $0 = $.derived(() => clipboard.isCopied('all-subnets') ? 'check' : 'copy');

								Icon(node_7, {
									get name() {
										return $.get($0);
									},
									size: 'sm'
								});
							}

							var text_6 = $.sibling(node_7);

							$.reset(button_1);

							$.template_effect(
								($0, $1) => {
									$.set_class(button_1, 1, `copy-all-button ${$0 ?? ''}`, 'svelte-gcckok');
									$.set_text(text_6, ` ${$1 ?? ''}`);
								},
								[
									() => clipboard.isCopied('all-subnets') ? 'copied' : '',
									() => clipboard.isCopied('all-subnets') ? 'Copied!' : 'Copy All'
								]
							);

							$.delegated('click', button_1, copyAllSubnets);
							$.append($$anchor, button_1);
						};

						$.if(node_6, ($$render) => {
							if ($.get(result).subnets.length > 0) $$render(consequent_1);
						});
					}

					$.reset(div_11);
					$.reset(div_10);

					var div_13 = $.sibling(div_10, 2);
					var div_14 = $.child(div_13);
					var span_3 = $.child(div_14);

					$.action(span_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Original networks, ranges, and addresses provided');

					var span_4 = $.sibling(span_3, 2);
					var text_7 = $.only_child(span_4);

					$.reset(div_14);

					var div_15 = $.sibling(div_14, 2);
					var span_5 = $.child(div_15);

					$.action(span_5, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Uniform subnets generated from input');

					var span_6 = $.sibling(span_5, 2);
					var text_8 = $.only_child(span_6);

					$.reset(div_15);

					var node_8 = $.sibling(div_15, 2);

					{
						var consequent_2 = ($$anchor) => {
							var div_16 = root_2();
							var span_7 = $.child(div_16);

							$.action(span_7, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Address count difference due to subnet boundary alignment');

							var span_8 = $.sibling(span_7, 2);
							var text_9 = $.only_child(span_8);

							$.reset(div_16);

							$.template_effect(($0) => $.set_text(text_9, `${$.get(result).totalAddresses > $.get(result).inputSummary.totalInputAddresses ? 'Expanded' : 'Reduced'} by ${$0 ?? ''} addresses (due to alignment to /${$.get(targetPrefix) ?? ''} boundaries)`), [
								() => formatNumber(Math.abs($.get(result).totalAddresses - $.get(result).inputSummary.totalInputAddresses))
							]);

							$.append($$anchor, div_16);
						};

						$.if(node_8, ($$render) => {
							if ($.get(result).totalAddresses !== $.get(result).inputSummary.totalInputAddresses) $$render(consequent_2);
						});
					}

					$.reset(div_13);

					var node_9 = $.sibling(div_13, 2);

					{
						var consequent_4 = ($$anchor) => {
							var div_17 = root_5();

							$.each(div_17, 22, () => $.get(result).subnets, (subnet) => subnet, ($$anchor, subnet, index) => {
								const subnetSize = $.derived(() => getSubnetSize($.get(targetPrefix)));
								var div_18 = root_4();
								var div_19 = $.child(div_18);
								var code = $.child(div_19);
								var text_10 = $.only_child(code, true);
								var button_2 = $.sibling(code, 2);
								var node_10 = $.child(button_2);

								{
									let $0 = $.derived(() => clipboard.isCopied(`subnet-${$.get(index)}`) ? 'check' : 'copy');

									Icon(node_10, {
										get name() {
											return $.get($0);
										},
										size: 'xs'
									});
								}

								$.reset(button_2);
								$.reset(div_19);

								var div_20 = $.sibling(div_19, 2);
								var span_9 = $.child(div_20);
								var text_11 = $.only_child(span_9);
								var node_11 = $.sibling(span_9, 2);

								{
									var consequent_3 = ($$anchor) => {
										var span_10 = root_3();
										var text_12 = $.only_child(span_10, true);

										$.template_effect(($0) => $.set_text(text_12, $0), [
											() => $.get(subnetSize) >= 65536
												? `${($.get(subnetSize) / 65536).toFixed(0)}×/16`
												: $.get(subnetSize) >= 256 ? `${($.get(subnetSize) / 256).toFixed(0)}×/24` : ''
										]);

										$.append($$anchor, span_10);
									};

									$.if(node_11, ($$render) => {
										if ($.get(subnetSize) >= 256) $$render(consequent_3);
									});
								}

								$.reset(div_20);
								$.reset(div_18);

								$.template_effect(
									($0, $1) => {
										$.set_text(text_10, subnet);
										$.set_class(button_2, 1, `copy-button ${$0 ?? ''}`, 'svelte-gcckok');
										$.set_text(text_11, `${$1 ?? ''} addresses`);
									},
									[
										() => clipboard.isCopied(`subnet-${$.get(index)}`) ? 'copied' : '',
										() => formatNumber($.get(subnetSize))
									]
								);

								$.delegated('click', button_2, () => clipboard.copy(subnet, `subnet-${$.get(index)}`));
								$.append($$anchor, div_18);
							});

							$.reset(div_17);
							$.append($$anchor, div_17);
						};

						var alternate = ($$anchor) => {
							var div_21 = root_6();
							var node_12 = $.child(div_21);

							Icon(node_12, { name: 'alert-circle' });
							$.next(4);
							$.reset(div_21);
							$.append($$anchor, div_21);
						};

						$.if(node_9, ($$render) => {
							if ($.get(result).subnets.length > 0) $$render(consequent_4); else $$render(alternate, -1);
						});
					}

					$.template_effect(
						($0, $1, $2) => {
							$.set_text(text_4, ` ${$.get(result).totalSubnets ?? ''} subnets`);
							$.set_text(text_5, ` ${$0 ?? ''} addresses`);
							$.set_text(text_7, `${$.get(result).inputSummary.totalInputs ?? ''} items, ${$1 ?? ''} addresses`);
							$.set_text(text_8, `${$.get(result).totalSubnets ?? ''} /${$.get(targetPrefix) ?? ''} subnets, ${$2 ?? ''} addresses`);
						},
						[
							() => formatNumber($.get(result).totalAddresses),
							() => formatNumber($.get(result).inputSummary.totalInputAddresses),
							() => formatNumber($.get(result).totalAddresses)
						]
					);

					$.append($$anchor, fragment_1);
				};

				var alternate_1 = ($$anchor) => {
					var div_22 = root_8();
					var node_13 = $.child(div_22);

					Icon(node_13, { name: 'alert-triangle' });

					var p = $.sibling(node_13, 4);
					var text_13 = $.only_child(p, true);

					$.reset(div_22);
					$.template_effect(() => $.set_text(text_13, $.get(result).error || 'Unknown error occurred'));
					$.append($$anchor, div_22);
				};

				$.if(node_3, ($$render) => {
					if ($.get(result).success) $$render(consequent_5); else $$render(alternate_1, -1);
				});
			}

			$.reset(section_1);
			$.append($$anchor, section_1);
		};

		$.if(node_2, ($$render) => {
			if ($.get(result)) $$render(consequent_6);
		});
	}

	$.reset(div);
	$.template_effect(() => $.set_text(text_2, `/${$.get(targetPrefix) ?? ''}`));
	$.delegated('input', textarea, handleInputChange);
	$.bind_value(textarea, () => $.get(input), ($$value) => $.set(input, $$value));
	$.delegated('input', input_1, handleInputChange);
	$.bind_value(input_1, () => $.get(targetPrefix), ($$value) => $.set(targetPrefix, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'input']);