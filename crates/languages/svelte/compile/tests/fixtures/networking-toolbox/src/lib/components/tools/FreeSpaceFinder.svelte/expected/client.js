import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { computeCIDRDifference } from '$lib/utils/cidr-diff.js';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { useClipboard } from '$lib/composables';
import { formatNumber } from '$lib/utils/formatters';
import '../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<button><div class="example-label"> </div> <div class="example-preview"> </div></button>`);
var root_1 = $.from_html(`<div class="address-block pool-block svelte-105p0aw"></div>`);
var root_2 = $.from_html(`<div class="address-block allocated-block svelte-105p0aw"></div>`);
var root_3 = $.from_html(`<div class="address-block available-block svelte-105p0aw"><span class="block-label svelte-105p0aw"> </span></div>`);
var root_4 = $.from_html(`<div class="visualization-section svelte-105p0aw"><h4 class="svelte-105p0aw">Address Space Visualization</h4> <div class="visualization-container svelte-105p0aw"><div class="viz-legend svelte-105p0aw"><div class="legend-item svelte-105p0aw"><div class="legend-color pools svelte-105p0aw"></div> <span>Network Pools</span></div> <div class="legend-item svelte-105p0aw"><div class="legend-color allocated svelte-105p0aw"></div> <span>Allocated Space</span></div> <div class="legend-item svelte-105p0aw"><div class="legend-color available svelte-105p0aw"></div> <span>Available Space</span></div></div> <div class="address-blocks svelte-105p0aw"><!> <!> <!></div> <div class="address-scale svelte-105p0aw"><span class="scale-start"> </span> <span class="scale-end"> </span></div></div></div>`);
var root_5 = $.from_html(`<span class="can-fit svelte-105p0aw"><!> </span>`);
var root_6 = $.from_html(`<div class="free-block-card svelte-105p0aw"><div class="block-header svelte-105p0aw"><code class="block-cidr svelte-105p0aw"> </code> <button aria-label="Copy CIDR block"><!></button></div> <div class="block-info svelte-105p0aw"><span class="address-count svelte-105p0aw"> </span> <!></div></div>`);
var root_7 = $.from_html(`<div class="free-blocks-grid svelte-105p0aw"></div>`);
var root_8 = $.from_html(`<div class="no-gaps svelte-105p0aw"><!> <h4 class="svelte-105p0aw">No Available Space</h4> <p>All address space in the pools is allocated or there are no pools defined.</p></div>`);
var root_9 = $.from_html(`<div class="results-header svelte-105p0aw"><h3 class="svelte-105p0aw">Available Free Space</h3> <div class="results-summary svelte-105p0aw"><span class="metric svelte-105p0aw"><!> </span> <span class="metric svelte-105p0aw"><!> </span></div></div> <!> <!>`, 1);
var root_10 = $.from_html(`<div class="error-message svelte-105p0aw"><!> <h4 class="svelte-105p0aw">Calculation Error</h4> <p> </p></div>`);
var root_11 = $.from_html(`<section class="results-section svelte-105p0aw"><!></section>`);

var root_12 = $.from_html(`<div class="card"><header class="card-header"><h2>Free Space Finder</h2> <p>Discover all available address blocks within network pools</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary"><!> <h4>Quick Examples</h4></summary> <div class="examples-grid"></div></details></div> <section class="input-section svelte-105p0aw"><div class="input-grid svelte-105p0aw"><div class="input-group"><label for="pools">Network Pools</label> <textarea id="pools" placeholder="192.168.0.0/16
10.0.0.0/8" rows="4" required=""></textarea></div> <div class="input-group"><label for="allocations">Allocated Blocks</label> <textarea id="allocations" placeholder="192.168.1.0/24
192.168.10.0/24" rows="4"></textarea></div></div> <div class="filter-section svelte-105p0aw"><div class="input-group"><label for="target-prefix">Target Prefix Length (Optional)</label> <div class="prefix-input-wrapper svelte-105p0aw"><input id="target-prefix" type="number" min="1" max="32" placeholder="e.g., 24" class="svelte-105p0aw"/> <span class="prefix-hint svelte-105p0aw"> </span> <button class="clear-filter svelte-105p0aw" aria-label="Clear filter"><!></button></div></div></div></section> <!></div>`);

export default function FreeSpaceFinder($$anchor, $$props) {
	$.push($$props, true);

	let pools = $.state(`192.168.0.0/16
10.0.0.0/8`);

	let allocations = $.state(`192.168.1.0/24
192.168.10.0/24
10.0.0.0/16`);

	let targetPrefix = $.state(null);
	let result = $.state(null);
	const clipboard = useClipboard();
	let _selectedExample = $.state(null);
	let selectedExampleIndex = $.state(null);
	let _userModified = $.state(false);

	const examples = [
		{
			label: 'Office Network Gaps',
			pools: '192.168.0.0/16',
			allocations: `192.168.1.0/24
192.168.10.0/24
192.168.100.0/24`,
			targetPrefix: 24
		},

		{
			label: 'Large Pool Analysis',
			pools: '10.0.0.0/8',
			allocations: `10.0.0.0/16
10.1.0.0/16
10.255.0.0/16`,
			targetPrefix: null
		},

		{
			label: 'Multi-Pool Setup',
			pools: `172.16.0.0/12
192.168.0.0/16`,

			allocations: `172.16.1.0/24
192.168.100.0/24`,
			targetPrefix: 28
		},

		{
			label: 'Campus Network Planning',
			pools: `10.10.0.0/16
10.20.0.0/16`,

			allocations: `10.10.1.0/24
10.10.5.0/24
10.20.10.0/24`,
			targetPrefix: 25
		},

		{
			label: 'Data Center Allocation',
			pools: '172.20.0.0/14',
			allocations: `172.20.0.0/16
172.21.0.0/16
172.23.128.0/17`,
			targetPrefix: 20
		},

		{
			label: 'Service Provider Space',
			pools: `203.0.113.0/24
198.51.100.0/24`,

			allocations: `203.0.113.0/26
203.0.113.128/25
198.51.100.64/26`,
			targetPrefix: 27
		}
	];

	function loadExample(example, index) {
		$.set(pools, example.pools, true);
		$.set(allocations, example.allocations, true);
		$.set(targetPrefix, example.targetPrefix, true);
		$.set(_selectedExample, example.label, true);
		$.set(selectedExampleIndex, index, true);
		$.set(_userModified, false);
		calculateGaps();
	}

	function calculateGaps() {
		try {
			if (!$.get(pools).trim()) {
				$.set(result, null);

				return;
			}

			// Use CIDR diff to get all available blocks (A - B = pools - allocations)
			const diffResult = computeCIDRDifference($.get(pools), $.get(allocations) || '', 'minimal');

			// Check for errors
			if (diffResult.errors.length > 0) {
				$.set(
					result,
					{
						success: false,
						error: diffResult.errors.join('; '),
						availableBlocks: [],
						totalBlocks: 0,
						totalAddresses: 0
					},
					true
				);

				return;
			}

			// Combine IPv4 and IPv6 results
			const allBlocks = [...diffResult.ipv4, ...diffResult.ipv6];

			// Filter by target prefix if specified
			let filteredBlocks = allBlocks;

			if ($.get(targetPrefix) !== null) {
				const target = $.get(targetPrefix // Capture for closure
				);

				filteredBlocks = allBlocks.filter((block) => {
					// Extract prefix length from CIDR notation
					const match = block.match(/\/(\d+)$/);

					if (!match) return false;

					const prefixLength = parseInt(match[1]);

					return prefixLength <= target; // Can be subdivided to target prefix
				});
			}

			// Calculate total addresses
			const totalAddresses = filteredBlocks.reduce(
				(sum, block) => {
					const match = block.match(/\/(\d+)$/);

					if (!match) return sum;

					const prefixLength = parseInt(match[1]);
					const version = block.includes(':') ? 6 : 4;
					const totalBits = version === 4 ? 32 : 128;

					return sum + Math.pow(2, totalBits - prefixLength);
				},
				0
			);

			$.set(
				result,
				{
					success: true,
					availableBlocks: filteredBlocks,
					totalBlocks: filteredBlocks.length,
					totalAddresses,
					stats: diffResult.stats,
					visualization: diffResult.visualization
				},
				true
			);
		} catch(error) {
			$.set(
				result,
				{
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error occurred',
					availableBlocks: [],
					totalBlocks: 0,
					totalAddresses: 0
				},
				true
			);
		}
	}

	function handleInputChange() {
		$.set(_userModified, true);
		$.set(_selectedExample, null);
		$.set(selectedExampleIndex, null);
		calculateGaps();
	}

	// Visualization helper functions
	function getBlockPosition(start, totalRange) {
		const rangeSize = totalRange.end - totalRange.start;
		const blockOffset = start - totalRange.start;

		return Number(blockOffset * 10000n / rangeSize) / 100;
	}

	function getBlockWidth(start, end, totalRange) {
		const rangeSize = totalRange.end - totalRange.start;
		const blockSize = end - start + 1n;

		return Number(blockSize * 10000n / rangeSize) / 100;
	}

	function formatAddress(addr, version) {
		if (version === 4) {
			// Convert bigint to IPv4 dotted decimal
			const num = Number(addr);

			return [
				num >>> 24 & 0xff,
				num >>> 16 & 0xff,
				num >>> 8 & 0xff,
				num & 0xff
			].join('.');
		} else {
			// Convert bigint to IPv6 (simplified)
			const hex = addr.toString(16).padStart(32, '0');

			return [0, 1, 2, 3, 4, 5, 6, 7].map((i) => hex.substr(i * 4, 4)).join(':').replace(/(:0{1,3})+/g, ':').replace(/^:|:$/g, '').replace(/::/g, '::');
		}
	}

	// Calculate on component load
	calculateGaps();

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
		var div_3 = $.child(button);
		var text = $.only_child(div_3, true);
		var div_4 = $.sibling(div_3, 2);
		var text_1 = $.only_child(div_4);

		$.reset(button);

		$.template_effect(
			($0, $1) => {
				classes = $.set_class(button, 1, 'example-card', null, classes, { selected: $.get(selectedExampleIndex) === i });
				$.set_text(text, $.get(example).label);

				$.set_text(text_1, `${$0 ?? ''}
              ${$1 ?? ''}`);
			},
			[
				() => $.get(example).pools.split('\n')[0],
				() => $.get(example).pools.includes('\n') ? '...' : ''
			]
		);

		$.delegated('click', button, () => loadExample($.get(example), i));
		$.append($$anchor, button);
	});

	$.reset(div_2);
	$.reset(details);
	$.reset(div_1);

	var section = $.sibling(div_1, 2);
	var div_5 = $.child(section);
	var div_6 = $.child(div_5);
	var label = $.child(div_6);

	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter network pools - one CIDR block per line (e.g., 192.168.0.0/16)');

	var textarea = $.sibling(label, 2);

	$.remove_textarea_child(textarea);
	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var label_1 = $.child(div_7);

	$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter allocated/used blocks - one CIDR block per line');

	var textarea_1 = $.sibling(label_1, 2);

	$.remove_textarea_child(textarea_1);
	$.reset(div_7);
	$.reset(div_5);

	var div_8 = $.sibling(div_5, 2);
	var div_9 = $.child(div_8);
	var label_2 = $.child(div_9);

	$.action(label_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Filter results to show only blocks that can accommodate the target prefix length');

	var div_10 = $.sibling(label_2, 2);
	var input = $.child(div_10);

	$.remove_input_defaults(input);

	var span = $.sibling(input, 2);
	var text_2 = $.only_child(span);
	var button_1 = $.sibling(span, 2);
	var node_1 = $.child(button_1);

	Icon(node_1, { name: 'x', size: 'xs' });
	$.reset(button_1);
	$.reset(div_10);
	$.reset(div_9);
	$.reset(div_8);
	$.reset(section);

	var node_2 = $.sibling(section, 2);

	{
		var consequent_4 = ($$anchor) => {
			var section_1 = root_11();
			var node_3 = $.child(section_1);

			{
				var consequent_3 = ($$anchor) => {
					var fragment = root_9();
					var div_11 = $.first_child(fragment);
					var div_12 = $.sibling($.child(div_11), 2);
					var span_1 = $.child(div_12);
					var node_4 = $.child(span_1);

					Icon(node_4, { name: 'free-blocks', size: 'sm' });

					var text_3 = $.sibling(node_4);

					$.reset(span_1);

					var span_2 = $.sibling(span_1, 2);
					var node_5 = $.child(span_2);

					Icon(node_5, { name: 'network', size: 'sm' });

					var text_4 = $.sibling(node_5);

					$.reset(span_2);
					$.reset(div_12);
					$.reset(div_11);

					var node_6 = $.sibling(div_11, 2);

					{
						var consequent = ($$anchor) => {
							var div_13 = root_4();
							var div_14 = $.sibling($.child(div_13), 2);
							var div_15 = $.sibling($.child(div_14), 2);
							var node_7 = $.child(div_15);

							$.each(node_7, 17, () => $.get(result).visualization.setA, (pool) => pool.start + pool.end, ($$anchor, pool) => {
								var div_16 = root_1();

								$.template_effect(
									($0, $1, $2) => {
										$.set_style(div_16, `left: ${$0 ?? ''}%; width: ${$1 ?? ''}%`);
										$.set_attribute(div_16, 'title', `Pool: ${$2 ?? ''}`);
									},
									[
										() => getBlockPosition($.get(pool).start, $.get(result).visualization.totalRange),
										() => getBlockWidth($.get(pool).start, $.get(pool).end, $.get(result).visualization.totalRange),
										() => $.get(pool).cidr || `${formatAddress($.get(pool).start, $.get(result).visualization.version)}-${formatAddress($.get(pool).end, $.get(result).visualization.version)}`
									]
								);

								$.append($$anchor, div_16);
							});

							var node_8 = $.sibling(node_7, 2);

							$.each(node_8, 17, () => $.get(result).visualization.setB, (allocation) => allocation.start + allocation.end, ($$anchor, allocation) => {
								var div_17 = root_2();

								$.template_effect(
									($0, $1, $2) => {
										$.set_style(div_17, `left: ${$0 ?? ''}%; width: ${$1 ?? ''}%`);
										$.set_attribute(div_17, 'title', `Allocated: ${$2 ?? ''}`);
									},
									[
										() => getBlockPosition($.get(allocation).start, $.get(result).visualization.totalRange),
										() => getBlockWidth($.get(allocation).start, $.get(allocation).end, $.get(result).visualization.totalRange),
										() => $.get(allocation).cidr || `${formatAddress($.get(allocation).start, $.get(result).visualization.version)}-${formatAddress($.get(allocation).end, $.get(result).visualization.version)}`
									]
								);

								$.append($$anchor, div_17);
							});

							var node_9 = $.sibling(node_8, 2);

							$.each(node_9, 17, () => $.get(result).visualization.result, (available) => available.start + available.end, ($$anchor, available) => {
								var div_18 = root_3();
								var span_3 = $.child(div_18);
								var text_5 = $.only_child(span_3, true);

								$.reset(div_18);

								$.template_effect(
									($0, $1) => {
										$.set_style(div_18, `left: ${$0 ?? ''}%; width: ${$1 ?? ''}%`);
										$.set_attribute(div_18, 'title', `Available: ${$.get(available).cidr ?? ''}`);
										$.set_text(text_5, $.get(available).cidr);
									},
									[
										() => getBlockPosition($.get(available).start, $.get(result).visualization.totalRange),
										() => getBlockWidth($.get(available).start, $.get(available).end, $.get(result).visualization.totalRange)
									]
								);

								$.append($$anchor, div_18);
							});

							$.reset(div_15);

							var div_19 = $.sibling(div_15, 2);
							var span_4 = $.child(div_19);
							var text_6 = $.only_child(span_4, true);
							var span_5 = $.sibling(span_4, 2);
							var text_7 = $.only_child(span_5, true);

							$.reset(div_19);
							$.reset(div_14);
							$.reset(div_13);

							$.template_effect(
								($0, $1) => {
									$.set_text(text_6, $0);
									$.set_text(text_7, $1);
								},
								[
									() => formatAddress($.get(result).visualization.totalRange.start, $.get(result).visualization.version),
									() => formatAddress($.get(result).visualization.totalRange.end, $.get(result).visualization.version)
								]
							);

							$.append($$anchor, div_13);
						};

						$.if(node_6, ($$render) => {
							if ($.get(result).availableBlocks.length > 0 && $.get(result).visualization) $$render(consequent);
						});
					}

					var node_10 = $.sibling(node_6, 2);

					{
						var consequent_2 = ($$anchor) => {
							var div_20 = root_7();

							$.each(div_20, 21, () => $.get(result).availableBlocks, $.index, ($$anchor, block, index) => {
								const blockAddresses = $.derived(() => (() => {
									const match = $.get(block).match(/\/(\d+)$/);

									if (!match) return 0;

									const prefixLength = parseInt(match[1]);
									const version = $.get(block).includes(':') ? 6 : 4;
									const totalBits = version === 4 ? 32 : 128;

									return Math.pow(2, totalBits - prefixLength);
								})());

								var div_21 = root_6();
								var div_22 = $.child(div_21);
								var code = $.child(div_22);
								var text_8 = $.only_child(code, true);
								var button_2 = $.sibling(code, 2);
								var node_11 = $.child(button_2);

								{
									let $0 = $.derived(() => clipboard.isCopied(`block-${index}`) ? 'check' : 'copy');

									Icon(node_11, {
										get name() {
											return $.get($0);
										},
										size: 'xs'
									});
								}

								$.reset(button_2);
								$.reset(div_22);

								var div_23 = $.sibling(div_22, 2);
								var span_6 = $.child(div_23);
								var text_9 = $.only_child(span_6);
								var node_12 = $.sibling(span_6, 2);

								{
									var consequent_1 = ($$anchor) => {
										var span_7 = root_5();
										var node_13 = $.child(span_7);

										Icon(node_13, { name: 'check-circle', size: 'xs' });

										var text_10 = $.sibling(node_13);

										$.reset(span_7);
										$.template_effect(() => $.set_text(text_10, ` Can fit /${$.get(targetPrefix) ?? ''}`));
										$.append($$anchor, span_7);
									};

									var d = $.derived(() => $.get(targetPrefix) && $.get(blockAddresses) >= Math.pow(2, 32 - $.get(targetPrefix)));

									$.if(node_12, ($$render) => {
										if ($.get(d)) $$render(consequent_1);
									});
								}

								$.reset(div_23);
								$.reset(div_21);

								$.template_effect(
									($0, $1) => {
										$.set_text(text_8, $.get(block));
										$.set_class(button_2, 1, `copy-button ${$0 ?? ''}`, 'svelte-105p0aw');
										$.set_text(text_9, `${$1 ?? ''} addresses`);
									},
									[
										() => clipboard.isCopied(`block-${index}`) ? 'copied' : '',
										() => formatNumber($.get(blockAddresses))
									]
								);

								$.delegated('click', button_2, () => clipboard.copy($.get(block), `block-${index}`));
								$.append($$anchor, div_21);
							});

							$.reset(div_20);
							$.append($$anchor, div_20);
						};

						var alternate = ($$anchor) => {
							var div_24 = root_8();
							var node_14 = $.child(div_24);

							Icon(node_14, { name: 'alert-circle' });
							$.next(4);
							$.reset(div_24);
							$.append($$anchor, div_24);
						};

						$.if(node_10, ($$render) => {
							if ($.get(result).availableBlocks.length > 0) $$render(consequent_2); else $$render(alternate, -1);
						});
					}

					$.template_effect(
						($0) => {
							$.set_text(text_3, ` ${$.get(result).totalBlocks ?? ''} free blocks`);
							$.set_text(text_4, ` ${$0 ?? ''} addresses`);
						},
						[() => formatNumber($.get(result).totalAddresses)]
					);

					$.append($$anchor, fragment);
				};

				var alternate_1 = ($$anchor) => {
					var div_25 = root_10();
					var node_15 = $.child(div_25);

					Icon(node_15, { name: 'alert-triangle' });

					var p = $.sibling(node_15, 4);
					var text_11 = $.only_child(p, true);

					$.reset(div_25);
					$.template_effect(() => $.set_text(text_11, $.get(result).error || 'Unknown error occurred'));
					$.append($$anchor, div_25);
				};

				$.if(node_3, ($$render) => {
					if ($.get(result).success) $$render(consequent_3); else $$render(alternate_1, -1);
				});
			}

			$.reset(section_1);
			$.append($$anchor, section_1);
		};

		$.if(node_2, ($$render) => {
			if ($.get(result)) $$render(consequent_4);
		});
	}

	$.reset(div);
	$.template_effect(() => $.set_text(text_2, `/${($.get(targetPrefix) || 'xx') ?? ''}`));
	$.delegated('input', textarea, handleInputChange);
	$.bind_value(textarea, () => $.get(pools), ($$value) => $.set(pools, $$value));
	$.delegated('input', textarea_1, handleInputChange);
	$.bind_value(textarea_1, () => $.get(allocations), ($$value) => $.set(allocations, $$value));
	$.delegated('input', input, handleInputChange);
	$.bind_value(input, () => $.get(targetPrefix), ($$value) => $.set(targetPrefix, $$value));

	$.delegated('click', button_1, () => {
		$.set(targetPrefix, null);
		handleInputChange();
	});

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'input']);