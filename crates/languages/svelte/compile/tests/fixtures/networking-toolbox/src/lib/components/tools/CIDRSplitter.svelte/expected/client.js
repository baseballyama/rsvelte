import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { splitCIDRByCount, splitCIDRByPrefix } from '$lib/utils/cidr-split.js';
import { tooltip } from '$lib/actions/tooltip.js';
import { useClipboard } from '$lib/composables';
import Icon from '$lib/components/global/Icon.svelte';
import '../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<button type="button"> </button>`);
var root_1 = $.from_html(`<label for="subnet-count" class="svelte-1qlf1oz">Number of subnets</label> <input id="subnet-count" type="number" min="1" max="1024" class="input-field svelte-1qlf1oz"/>`, 1);
var root_2 = $.from_html(`<label for="target-prefix" class="svelte-1qlf1oz">Target prefix length</label> <input id="target-prefix" type="number" min="1" max="128" class="input-field svelte-1qlf1oz"/>`, 1);
var root_3 = $.from_html(`<button><h5 class="svelte-1qlf1oz"> </h5> <p class="svelte-1qlf1oz"> </p></button>`);
var root_4 = $.from_html(`<div class="info-panel error svelte-1qlf1oz"><h3 class="svelte-1qlf1oz">Split Error</h3> <p class="svelte-1qlf1oz"> </p></div>`);
var root_5 = $.from_html(`<div class="stat-card svelte-1qlf1oz"><span class="stat-label svelte-1qlf1oz">Utilization</span> <span class="stat-value svelte-1qlf1oz"> </span></div>`);
var root_6 = $.from_html(`<div class="subnet-segment svelte-1qlf1oz"></div>`);
var root_7 = $.from_html(`<div class="subnet-card svelte-1qlf1oz"><div class="subnet-header svelte-1qlf1oz"><code class="subnet-cidr svelte-1qlf1oz"> </code> <button type="button"><!></button></div> <div class="subnet-details svelte-1qlf1oz"><div class="detail-row svelte-1qlf1oz"><span class="detail-label svelte-1qlf1oz">Network:</span> <span class="detail-value svelte-1qlf1oz"> </span></div> <div class="detail-row svelte-1qlf1oz"><span class="detail-label svelte-1qlf1oz">Broadcast:</span> <span class="detail-value svelte-1qlf1oz"> </span></div> <div class="detail-row svelte-1qlf1oz"><span class="detail-label svelte-1qlf1oz">Usable:</span> <span class="detail-value svelte-1qlf1oz"> </span></div> <div class="detail-row svelte-1qlf1oz"><span class="detail-label svelte-1qlf1oz">Hosts:</span> <span class="detail-value svelte-1qlf1oz"> </span></div></div></div>`);
var root_8 = $.from_html(`<div class="stats-section svelte-1qlf1oz"><div class="summary-header svelte-1qlf1oz"><h3 class="svelte-1qlf1oz">Split Results</h3> <button type="button"><!> Copy All CIDRs</button></div> <div class="stats-grid svelte-1qlf1oz"><div class="stat-card svelte-1qlf1oz"><span class="stat-label svelte-1qlf1oz">Parent Network</span> <span class="stat-value svelte-1qlf1oz"> </span></div> <div class="stat-card svelte-1qlf1oz"><span class="stat-label svelte-1qlf1oz">Child Subnets</span> <span class="stat-value svelte-1qlf1oz"> </span></div> <div class="stat-card svelte-1qlf1oz"><span class="stat-label svelte-1qlf1oz">Child Prefix</span> <span class="stat-value svelte-1qlf1oz"> </span></div> <div class="stat-card svelte-1qlf1oz"><span class="stat-label svelte-1qlf1oz">Addresses per Child</span> <span class="stat-value svelte-1qlf1oz"> </span></div> <!></div></div> <div class="visualization-section svelte-1qlf1oz"><h4 class="svelte-1qlf1oz">Address Space Visualization</h4> <div class="address-bar svelte-1qlf1oz"></div></div> <div class="subnets-section svelte-1qlf1oz"><h4 class="svelte-1qlf1oz">Child Subnets</h4> <div class="subnets-grid svelte-1qlf1oz"></div></div>`, 1);
var root_9 = $.from_html(`<div class="results-section svelte-1qlf1oz"><!></div>`);
var root_10 = $.from_html(`<div class="card svelte-1qlf1oz"><header class="card-header svelte-1qlf1oz"><h2 class="svelte-1qlf1oz">CIDR Subnet Splitter</h2> <p class="svelte-1qlf1oz">Split a network into equal child subnets by count or target prefix length.</p></header> <div class="mode-section svelte-1qlf1oz"><h3 class="svelte-1qlf1oz">Split Mode</h3> <div class="tabs svelte-1qlf1oz"></div></div> <div class="input-section svelte-1qlf1oz"><h3 class="svelte-1qlf1oz">Parent Network</h3> <div class="form-group svelte-1qlf1oz"><label for="input-cidr" class="svelte-1qlf1oz">Parent CIDR block</label> <div class="input-wrapper svelte-1qlf1oz"><input id="input-cidr" type="text" placeholder="192.168.1.0/24" class="input-field svelte-1qlf1oz"/> <button type="button" class="btn btn-secondary btn-sm clear-btn svelte-1qlf1oz"><!></button></div></div> <div class="form-group svelte-1qlf1oz"><!></div></div> <div class="card examples-card svelte-1qlf1oz"><details class="examples-details svelte-1qlf1oz"><summary class="examples-summary svelte-1qlf1oz"><!> <h4 class="svelte-1qlf1oz">Quick Examples</h4></summary> <div class="examples-grid svelte-1qlf1oz"></div></details></div> <!></div>`);

export default function CIDRSplitter($$anchor, $$props) {
	$.push($$props, true);

	let inputCIDR = $.state('192.168.1.0/24');
	let splitMode = $.state('count');
	let subnetCount = $.state(4);
	let targetPrefix = $.state(26);
	let result = $.state(null);
	const clipboard = useClipboard();
	let selectedExampleIndex = $.state(null);

	const modes = [
		{
			value: 'count',
			label: 'By Count',
			description: 'Split into N equal subnets'
		},

		{
			value: 'prefix',
			label: 'By Prefix',
			description: 'Split to target prefix length'
		}
	];

	const examples = [
		{
			label: 'Split /24 → 4 subnets',
			cidr: '192.168.1.0/24',
			mode: 'count',
			count: 4
		},

		{
			label: 'Split /16 → /20',
			cidr: '10.0.0.0/16',
			mode: 'prefix',
			prefix: 20
		},

		{
			label: 'IPv6 /48 → 16 subnets',
			cidr: '2001:db8::/48',
			mode: 'count',
			count: 16
		},

		{
			label: 'IPv6 /32 → /40',
			cidr: '2001:db8::/32',
			mode: 'prefix',
			prefix: 40
		}
	];

	/* Set example */
	function setExample(example, index) {
		$.set(inputCIDR, example.cidr, true);
		$.set(splitMode, example.mode, true);

		if (example.mode === 'count') {
			$.set(subnetCount, example.count, true);
		} else {
			$.set(targetPrefix, example.prefix, true);
		}

		$.set(selectedExampleIndex, index, true);
		performSplit();
	}

	/* Clear example selection when input changes */
	function _clearExampleSelection() {
		$.set(selectedExampleIndex, null);
	}

	/* Copy all subnets */
	function copyAllSubnets() {
		if (!$.get(result)?.subnets) return;

		const text = $.get(result).subnets.map((s) => s.cidr).join('\n');

		clipboard.copy(text, 'all-subnets');
	}

	/* Clear input */
	function clearInput() {
		$.set(inputCIDR, '');
		$.set(result, null);
	}

	/* Perform split */
	function performSplit() {
		if (!$.get(inputCIDR).trim()) {
			$.set(result, null);

			return;
		}

		try {
			$.set(
				result,
				$.get(splitMode) === 'count'
					? splitCIDRByCount($.get(inputCIDR), $.get(subnetCount))
					: splitCIDRByPrefix($.get(inputCIDR), $.get(targetPrefix)),
				true
			);
		} catch(error) {
			$.set(
				result,
				{
					subnets: [],
					stats: {
						parentCIDR: '',
						childCount: 0,
						childPrefix: 0,
						addressesPerChild: '0',
						totalAddressesCovered: '0',
						utilizationPercent: 0
					},
					visualization: { parentStart: 0n, parentEnd: 0n, childRanges: [] },
					error: error instanceof Error ? error.message : 'Unknown error'
				},
				true
			);
		}
	}

	/* Calculate visualization bar width percentage */
	function getBarWidth(childRange) {
		if (!$.get(result)?.visualization) return 0;

		const parentSize = $.get(result).visualization.parentEnd - $.get(result).visualization.parentStart + 1n;
		const childSize = childRange.size;

		return Number(childSize * 10000n / parentSize) / 100;
	}

	/* Calculate visualization bar offset percentage */
	function getBarOffset(childRange) {
		if (!$.get(result)?.visualization) return 0;

		const parentSize = $.get(result).visualization.parentEnd - $.get(result).visualization.parentStart + 1n;
		const offset = childRange.start - $.get(result).visualization.parentStart;

		return Number(offset * 10000n / parentSize) / 100;
	}

	/* Generate tooltip text for subnet segment */
	function getSubnetTooltipText(childRange) {
		if (!$.get(result)?.subnets) return childRange.cidr;

		const subnet = $.get(result).subnets.find((s) => s.cidr === childRange.cidr);

		if (!subnet) return childRange.cidr;

		return `${subnet.cidr}\nRange: ${subnet.network} - ${subnet.broadcast}\nHosts: ${subnet.totalHosts}`;
	}

	// Reactive split and example selection tracking
	$.user_effect(() => {
		if ($.get(inputCIDR).trim()) {
			performSplit();
		}

		// Check if current input matches any example
		const matchingIndex = examples.findIndex((example) => example.cidr === $.get(inputCIDR) && example.mode === $.get(splitMode) && (example.mode === 'count'
			? example.count === $.get(subnetCount)
			: example.prefix === $.get(targetPrefix)));

		if (matchingIndex !== -1 && $.get(selectedExampleIndex) !== matchingIndex) {
			$.set(selectedExampleIndex, matchingIndex, true);
		} else if (matchingIndex === -1 && $.get(selectedExampleIndex) !== null) {
			$.set(selectedExampleIndex, null);
		}
	});

	var div = root_10();
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.sibling($.child(div_1), 2);

	$.each(div_2, 21, () => modes, (modeOption) => modeOption.value, ($$anchor, modeOption) => {
		var button = root();
		let classes;
		var text_1 = $.only_child(button, true);

		$.action(button, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => $.get(modeOption).description);

		$.template_effect(() => {
			classes = $.set_class(button, 1, 'tab svelte-1qlf1oz', null, classes, { active: $.get(splitMode) === $.get(modeOption).value });
			$.set_text(text_1, $.get(modeOption).label);
		});

		$.delegated('click', button, () => $.set(splitMode, $.get(modeOption).value, true));
		$.append($$anchor, button);
	});

	$.reset(div_2);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var div_4 = $.sibling($.child(div_3), 2);
	var label = $.child(div_4);

	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter IPv4 or IPv6 network in CIDR notation (e.g., 192.168.1.0/24)');

	var div_5 = $.sibling(label, 2);
	var input = $.child(div_5);

	$.remove_input_defaults(input);

	var button_1 = $.sibling(input, 2);
	var node = $.child(button_1);

	Icon(node, { name: 'trash', size: 'sm' });
	$.reset(button_1);
	$.action(button_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Clear input');
	$.reset(div_5);
	$.reset(div_4);

	var div_6 = $.sibling(div_4, 2);
	var node_1 = $.child(div_6);

	{
		var consequent = ($$anchor) => {
			var fragment = root_1();
			var label_1 = $.first_child(fragment);

			$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'How many equal subnets to create (will be rounded to nearest power of 2)');

			var input_1 = $.sibling(label_1, 2);

			$.remove_input_defaults(input_1);
			$.bind_value(input_1, () => $.get(subnetCount), ($$value) => $.set(subnetCount, $$value));
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_2();
			var label_2 = $.first_child(fragment_1);

			$.action(label_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'The prefix length for child subnets (must be larger than parent prefix)');

			var input_2 = $.sibling(label_2, 2);

			$.remove_input_defaults(input_2);
			$.bind_value(input_2, () => $.get(targetPrefix), ($$value) => $.set(targetPrefix, $$value));
			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(splitMode) === 'count') $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div_6);
	$.reset(div_3);

	var div_7 = $.sibling(div_3, 2);
	var details = $.child(div_7);
	var summary = $.child(details);
	var node_2 = $.child(summary);

	Icon(node_2, { name: 'chevron-right', size: 'xs' });
	$.next(2);
	$.reset(summary);

	var div_8 = $.sibling(summary, 2);

	$.each(div_8, 23, () => examples, (example) => example.label, ($$anchor, example, i) => {
		var button_2 = root_3();
		let classes_1;
		var h5 = $.child(button_2);
		var text_2 = $.only_child(h5, true);
		var p = $.sibling(h5, 2);
		var text_3 = $.only_child(p, true);

		$.reset(button_2);

		$.action(button_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => `${$.get(example).mode === 'count'
			? 'Split into ' + $.get(example).count + ' subnets'
			: 'Split to /' + $.get(example).prefix + ' prefix'}`);

		$.template_effect(() => {
			classes_1 = $.set_class(button_2, 1, 'example-card svelte-1qlf1oz', null, classes_1, { selected: $.get(selectedExampleIndex) === $.get(i) });
			$.set_text(text_2, $.get(example).cidr);
			$.set_text(text_3, $.get(example).label);
		});

		$.delegated('click', button_2, () => setExample($.get(example), $.get(i)));
		$.append($$anchor, button_2);
	});

	$.reset(div_8);
	$.reset(details);
	$.reset(div_7);

	var node_3 = $.sibling(div_7, 2);

	{
		var consequent_4 = ($$anchor) => {
			var div_9 = root_9();
			var node_4 = $.child(div_9);

			{
				var consequent_1 = ($$anchor) => {
					var div_10 = root_4();
					var p_1 = $.sibling($.child(div_10), 2);
					var text_4 = $.only_child(p_1, true);

					$.reset(div_10);
					$.template_effect(() => $.set_text(text_4, $.get(result).error));
					$.append($$anchor, div_10);
				};

				var consequent_3 = ($$anchor) => {
					var fragment_2 = root_8();
					var div_11 = $.first_child(fragment_2);
					var div_12 = $.child(div_11);
					var button_3 = $.sibling($.child(div_12), 2);
					let classes_2;
					var node_5 = $.child(button_3);

					{
						let $0 = $.derived(() => clipboard.isCopied('all-subnets') ? 'check' : 'copy');

						Icon(node_5, {
							get name() {
								return $.get($0);
							},
							size: 'sm'
						});
					}

					$.next();
					$.reset(button_3);
					$.reset(div_12);

					var div_13 = $.sibling(div_12, 2);
					var div_14 = $.child(div_13);
					var span = $.child(div_14);

					$.action(span, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'The original network that was split');

					var span_1 = $.sibling(span, 2);
					var text_5 = $.only_child(span_1, true);

					$.reset(div_14);

					var div_15 = $.sibling(div_14, 2);
					var span_2 = $.child(div_15);

					$.action(span_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Number of child subnets created');

					var span_3 = $.sibling(span_2, 2);
					var text_6 = $.only_child(span_3, true);

					$.reset(div_15);

					var div_16 = $.sibling(div_15, 2);
					var span_4 = $.child(div_16);

					$.action(span_4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Prefix length of each child subnet');

					var span_5 = $.sibling(span_4, 2);
					var text_7 = $.only_child(span_5);

					$.reset(div_16);

					var div_17 = $.sibling(div_16, 2);
					var span_6 = $.child(div_17);

					$.action(span_6, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Total IP addresses in each child subnet');

					var span_7 = $.sibling(span_6, 2);
					var text_8 = $.only_child(span_7, true);

					$.reset(div_17);

					var node_6 = $.sibling(div_17, 2);

					{
						var consequent_2 = ($$anchor) => {
							var div_18 = root_5();
							var span_8 = $.child(div_18);

							$.action(span_8, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => "Percentage of parent network's address space used");

							var span_9 = $.sibling(span_8, 2);
							var text_9 = $.only_child(span_9);

							$.reset(div_18);
							$.template_effect(() => $.set_text(text_9, `${$.get(result).stats.utilizationPercent ?? ''}%`));
							$.append($$anchor, div_18);
						};

						$.if(node_6, ($$render) => {
							if ($.get(result).stats.utilizationPercent < 100) $$render(consequent_2);
						});
					}

					$.reset(div_13);
					$.reset(div_11);

					var div_19 = $.sibling(div_11, 2);
					var div_20 = $.sibling($.child(div_19), 2);

					$.each(div_20, 21, () => $.get(result).visualization.childRanges, (childRange) => childRange.cidr, ($$anchor, childRange) => {
						var div_21 = root_6();

						$.action(div_21, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => ({
							text: getSubnetTooltipText($.get(childRange)),
							position: 'top',
							delay: 300
						}));

						$.template_effect(($0, $1) => $.set_style(div_21, `width: ${$0 ?? ''}%; left: ${$1 ?? ''}%`), [
							() => getBarWidth($.get(childRange)),
							() => getBarOffset($.get(childRange))
						]);

						$.append($$anchor, div_21);
					});

					$.reset(div_20);
					$.reset(div_19);

					var div_22 = $.sibling(div_19, 2);
					var div_23 = $.sibling($.child(div_22), 2);

					$.each(div_23, 21, () => $.get(result).subnets, (subnet) => subnet.cidr, ($$anchor, subnet) => {
						var div_24 = root_7();
						var div_25 = $.child(div_24);
						var code = $.child(div_25);
						var text_10 = $.only_child(code, true);
						var button_4 = $.sibling(code, 2);
						let classes_3;
						var node_7 = $.child(button_4);

						{
							let $0 = $.derived(() => clipboard.isCopied($.get(subnet).cidr) ? 'check' : 'copy');

							Icon(node_7, {
								get name() {
									return $.get($0);
								},
								size: 'xs'
							});
						}

						$.reset(button_4);
						$.reset(div_25);

						var div_26 = $.sibling(div_25, 2);
						var div_27 = $.child(div_26);
						var span_10 = $.sibling($.child(div_27), 2);
						var text_11 = $.only_child(span_10, true);

						$.reset(div_27);

						var div_28 = $.sibling(div_27, 2);
						var span_11 = $.sibling($.child(div_28), 2);
						var text_12 = $.only_child(span_11, true);

						$.reset(div_28);

						var div_29 = $.sibling(div_28, 2);
						var span_12 = $.sibling($.child(div_29), 2);
						var text_13 = $.only_child(span_12);

						$.reset(div_29);

						var div_30 = $.sibling(div_29, 2);
						var span_13 = $.sibling($.child(div_30), 2);
						var text_14 = $.only_child(span_13, true);

						$.reset(div_30);
						$.reset(div_26);
						$.reset(div_24);

						$.template_effect(
							($0) => {
								$.set_text(text_10, $.get(subnet).cidr);
								classes_3 = $.set_class(button_4, 1, 'btn btn-icon btn-xs svelte-1qlf1oz', null, classes_3, { copied: $0 });
								$.set_text(text_11, $.get(subnet).network);
								$.set_text(text_12, $.get(subnet).broadcast);
								$.set_text(text_13, `${$.get(subnet).firstHost ?? ''} - ${$.get(subnet).lastHost ?? ''}`);
								$.set_text(text_14, $.get(subnet).usableHosts);
							},
							[() => clipboard.isCopied($.get(subnet).cidr)]
						);

						$.delegated('click', button_4, () => clipboard.copy($.get(subnet).cidr, $.get(subnet).cidr));
						$.append($$anchor, div_24);
					});

					$.reset(div_23);
					$.reset(div_22);

					$.template_effect(
						($0) => {
							classes_2 = $.set_class(button_3, 1, 'btn btn-primary btn-sm svelte-1qlf1oz', null, classes_2, { copied: $0 });
							$.set_text(text_5, $.get(result).stats.parentCIDR);
							$.set_text(text_6, $.get(result).stats.childCount);
							$.set_text(text_7, `/${$.get(result).stats.childPrefix ?? ''}`);
							$.set_text(text_8, $.get(result).stats.addressesPerChild);
						},
						[() => clipboard.isCopied('all-subnets')]
					);

					$.delegated('click', button_3, copyAllSubnets);
					$.append($$anchor, fragment_2);
				};

				$.if(node_4, ($$render) => {
					if ($.get(result).error) $$render(consequent_1); else if ($.get(result).subnets.length > 0) $$render(consequent_3, 1);
				});
			}

			$.reset(div_9);
			$.append($$anchor, div_9);
		};

		$.if(node_3, ($$render) => {
			if ($.get(result)) $$render(consequent_4);
		});
	}

	$.reset(div);
	$.bind_value(input, () => $.get(inputCIDR), ($$value) => $.set(inputCIDR, $$value));
	$.delegated('click', button_1, clearInput);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);