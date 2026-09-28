import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tooltip from '$lib/components/global/Tooltip.svelte';
import { formatNumber } from '$lib/utils/formatters';

var root = $.from_html(`<span class="segment-label svelte-1e0xnjm">N</span>`);
var root_1 = $.from_html(`<span class="segment-label svelte-1e0xnjm">B</span>`);
var root_2 = $.from_html(`<div class="range-segment broadcast svelte-1e0xnjm" title="Broadcast Address"><!></div>`);
var root_3 = $.from_html(`<div class="legend-item svelte-1e0xnjm"><div class="legend-color broadcast svelte-1e0xnjm"></div> <span>Broadcast</span></div>`);
var root_4 = $.from_html(`<span> </span>`);
var root_5 = $.from_html(`<div class="binary-row svelte-1e0xnjm"><span class="octet-decimal svelte-1e0xnjm"> </span> <span class="arrow svelte-1e0xnjm">→</span> <div class="bits-group svelte-1e0xnjm"></div> <span class="octet-label svelte-1e0xnjm"></span></div>`);
var root_6 = $.from_html(`<div><!></div>`);
var root_7 = $.from_html(`<section class="grid-section svelte-1e0xnjm"><h4 class="svelte-1e0xnjm">Address Grid</h4> <div class="address-grid-wrap svelte-1e0xnjm"><div class="address-grid svelte-1e0xnjm"></div></div></section>`);
var root_8 = $.from_html(`<div><section class="visualizer-section svelte-1e0xnjm"><h3 class="svelte-1e0xnjm">Network Visualization</h3> <div class="range-section svelte-1e0xnjm"><div class="range-header svelte-1e0xnjm"><span class="range-label svelte-1e0xnjm">Address Range</span> <span class="range-count svelte-1e0xnjm"> </span></div> <div class="range-bar svelte-1e0xnjm"><div class="range-segment network svelte-1e0xnjm" title="Network Address"><!></div> <div class="range-segment usable svelte-1e0xnjm" title="Usable Host Addresses"></div> <!></div> <div class="range-legend svelte-1e0xnjm"><div class="legend-item svelte-1e0xnjm"><div class="legend-color network svelte-1e0xnjm"></div> <span>Network</span></div> <div class="legend-item svelte-1e0xnjm"><div class="legend-color usable svelte-1e0xnjm"></div> <span> </span></div> <!></div></div></section> <section class="binary-section svelte-1e0xnjm"><h4 class="svelte-1e0xnjm">Subnet Mask Binary Breakdown</h4> <div class="binary-display svelte-1e0xnjm"></div> <div class="binary-summary svelte-1e0xnjm"><div class="bit-stats svelte-1e0xnjm"><div class="bit-stat svelte-1e0xnjm"><div class="legend-color network svelte-1e0xnjm"></div> <span> </span></div> <div class="bit-stat svelte-1e0xnjm"><div class="legend-color host svelte-1e0xnjm"></div> <span> </span></div></div></div></section> <!> <section class="efficiency-section svelte-1e0xnjm"><h4 class="svelte-1e0xnjm">Network Efficiency</h4> <div class="efficiency-grid svelte-1e0xnjm"><div class="efficiency-metric svelte-1e0xnjm"><div> </div> <div class="metric-label svelte-1e0xnjm">Address Utilization</div></div> <div class="efficiency-metric svelte-1e0xnjm"><div class="metric-value svelte-1e0xnjm"> </div> <div class="metric-label svelte-1e0xnjm">Network Specificity</div></div></div></section></div>`);

export default function NetworkVisualizer($$anchor, $$props) {
	$.push($$props, true);

	let className = $.prop($$props, 'class', 3, '');

	/**
	 * Generates visual representation of network range
	 */
	function generateNetworkBlocks() {
		const { hostCount, cidr } = $$props.subnetInfo;
		const maxBlocks = 256;
		const blocksToShow = Math.min(hostCount, maxBlocks);
		const blockSize = hostCount > maxBlocks ? Math.ceil(hostCount / maxBlocks) : 1;

		return Array.from({ length: blocksToShow }, (_, i) => {
			const isFirst = i === 0;
			const isLast = i === blocksToShow - 1;

			// RFC 3021: /31 and /32 have all IPs usable
			if (cidr === 31) {
				return {
					id: i,
					type: 'usable',
					represents: blockSize,
					tooltip: isFirst ? 'Usable Host 1 (P2P)' : 'Usable Host 2 (P2P)'
				};
			}

			if (cidr === 32) {
				return {
					id: i,
					type: 'usable',
					represents: blockSize,
					tooltip: 'Single Host'
				};
			}

			// Normal subnets have network/broadcast reserved
			const type = isFirst
				? 'network'
				: isLast && hostCount > 2 ? 'broadcast' : 'usable';

			const tooltip = isFirst
				? 'Network Address'
				: isLast && hostCount > 2
					? 'Broadcast Address'
					: `Usable Host${blockSize > 1 ? 's' : ''}`;

			return { id: i, type, represents: blockSize, tooltip };
		});
	}

	let networkBlocks = $.derived(generateNetworkBlocks);

	let usablePercentage = $.derived(() => $$props.subnetInfo.hostCount > 0
		? $$props.subnetInfo.usableHosts / $$props.subnetInfo.hostCount * 100
		: 0);

	/**
	 * Get color class based on address utilization percentage
	 */
	function getUtilizationColor(percentage) {
		if (percentage >= 70) return 'success';
		if (percentage >= 40) return 'warning';

		return 'error';
	}

	var div = root_8();
	var section = $.child(div);
	var div_1 = $.sibling($.child(section), 2);
	var div_2 = $.child(div_1);
	var span = $.sibling($.child(div_2), 2);
	var text = $.only_child(span);

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var div_4 = $.child(div_3);
	var node = $.child(div_4);

	{
		var consequent = ($$anchor) => {
			var span_1 = root();

			$.append($$anchor, span_1);
		};

		$.if(node, ($$render) => {
			if ($$props.subnetInfo.hostCount <= 32) $$render(consequent);
		});
	}

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_1 = $.sibling(div_5, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_6 = root_2();
			var node_2 = $.child(div_6);

			{
				var consequent_1 = ($$anchor) => {
					var span_2 = root_1();

					$.append($$anchor, span_2);
				};

				$.if(node_2, ($$render) => {
					if ($$props.subnetInfo.hostCount <= 32) $$render(consequent_1);
				});
			}

			$.reset(div_6);
			$.template_effect(() => $.set_style(div_6, `width: ${100 / $$props.subnetInfo.hostCount}%`));
			$.append($$anchor, div_6);
		};

		$.if(node_1, ($$render) => {
			if ($$props.subnetInfo.hostCount > 1) $$render(consequent_2);
		});
	}

	$.reset(div_3);

	var div_7 = $.sibling(div_3, 2);
	var div_8 = $.sibling($.child(div_7), 2);
	var span_3 = $.sibling($.child(div_8), 2);
	var text_1 = $.only_child(span_3);

	$.reset(div_8);

	var node_3 = $.sibling(div_8, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_9 = root_3();

			$.append($$anchor, div_9);
		};

		$.if(node_3, ($$render) => {
			if ($$props.subnetInfo.hostCount > 1) $$render(consequent_3);
		});
	}

	$.reset(div_7);
	$.reset(div_1);
	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var div_10 = $.sibling($.child(section_1), 2);

	$.each(div_10, 21, () => $$props.subnetInfo.subnet.octets, $.index, ($$anchor, octet, i) => {
		var div_11 = root_5();
		var span_4 = $.child(div_11);
		var text_2 = $.only_child(span_4, true);
		var div_12 = $.sibling(span_4, 4);

		$.each(div_12, 21, () => $.get(octet).toString(2).padStart(8, '0').split(''), $.index, ($$anchor, bit, bitIndex) => {
			{
				let $0 = $.derived(() => $.get(bit) === '1' ? 'Network bit (1)' : 'Host bit (0)');

				Tooltip($$anchor, {
					get text() {
						return `${$.get($0) ?? ''} - Position ${i * 8 + bitIndex + 1}`;
					},
					position: 'top',
					children: ($$anchor, $$slotProps) => {
						var span_5 = root_4();
						var text_3 = $.only_child(span_5, true);

						$.template_effect(() => {
							$.set_class(span_5, 1, `bit-box ${$.get(bit) === '1' ? 'network-bit' : 'host-bit'}`, 'svelte-1e0xnjm');
							$.set_text(text_3, $.get(bit));
						});

						$.append($$anchor, span_5);
					},
					$$slots: { default: true }
				});
			}
		});

		$.reset(div_12);

		var span_6 = $.sibling(div_12, 2);

		span_6.textContent = `(Octet ${i + 1})`;
		$.reset(div_11);
		$.template_effect(($0) => $.set_text(text_2, $0), [() => $.get(octet).toString().padStart(3, '0')]);
		$.append($$anchor, div_11);
	});

	$.reset(div_10);

	var div_13 = $.sibling(div_10, 2);
	var div_14 = $.child(div_13);
	var div_15 = $.child(div_14);
	var span_7 = $.sibling($.child(div_15), 2);
	var text_4 = $.only_child(span_7);

	$.reset(div_15);

	var div_16 = $.sibling(div_15, 2);
	var span_8 = $.sibling($.child(div_16), 2);
	var text_5 = $.only_child(span_8);

	$.reset(div_16);
	$.reset(div_14);
	$.reset(div_13);
	$.reset(section_1);

	var node_4 = $.sibling(section_1, 2);

	{
		var consequent_6 = ($$anchor) => {
			var section_2 = root_7();
			var div_17 = $.sibling($.child(section_2), 2);
			var div_18 = $.child(div_17);

			$.each(div_18, 21, () => $.get(networkBlocks), (block) => block.id, ($$anchor, block) => {
				Tooltip($$anchor, {
					get text() {
						return $.get(block).tooltip;
					},
					position: 'top',
					children: ($$anchor, $$slotProps) => {
						var div_19 = root_6();
						var node_5 = $.child(div_19);

						{
							var consequent_4 = ($$anchor) => {
								var text_6 = $.text('N');

								$.append($$anchor, text_6);
							};

							var consequent_5 = ($$anchor) => {
								var text_7 = $.text('B');

								$.append($$anchor, text_7);
							};

							var alternate = ($$anchor) => {
								var text_8 = $.text();

								$.template_effect(() => $.set_text(text_8, $.get(block).id));
								$.append($$anchor, text_8);
							};

							$.if(node_5, ($$render) => {
								if ($.get(block).type === 'network') $$render(consequent_4); else if ($.get(block).type === 'broadcast') $$render(consequent_5, 1); else $$render(alternate, -1);
							});
						}

						$.reset(div_19);
						$.template_effect(() => $.set_class(div_19, 1, `address-block ${$.get(block).type ?? ''}`, 'svelte-1e0xnjm'));
						$.append($$anchor, div_19);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_18);
			$.reset(div_17);
			$.reset(section_2);
			$.append($$anchor, section_2);
		};

		$.if(node_4, ($$render) => {
			if ($$props.subnetInfo.hostCount <= 64) $$render(consequent_6);
		});
	}

	var section_3 = $.sibling(node_4, 2);
	var div_20 = $.sibling($.child(section_3), 2);
	var div_21 = $.child(div_20);
	var div_22 = $.child(div_21);
	var text_9 = $.only_child(div_22);

	$.next(2);
	$.reset(div_21);

	var div_23 = $.sibling(div_21, 2);
	var div_24 = $.child(div_23);
	var text_10 = $.only_child(div_24);

	$.next(2);
	$.reset(div_23);
	$.reset(div_20);
	$.reset(section_3);
	$.reset(div);

	$.template_effect(
		($0, $1, $2, $3) => {
			$.set_class(div, 1, `network-visualizer ${className() ?? ''}`, 'svelte-1e0xnjm');
			$.set_text(text, `${$0 ?? ''} total addresses`);
			$.set_style(div_4, `width: ${100 / $$props.subnetInfo.hostCount}%`);
			$.set_style(div_5, `left: ${100 / $$props.subnetInfo.hostCount}%; width: ${$.get(usablePercentage) * (1 - 2 / $$props.subnetInfo.hostCount)}%`);
			$.set_text(text_1, `Usable Hosts (${$1 ?? ''})`);
			$.set_text(text_4, `Network bits: ${$$props.subnetInfo.cidr ?? ''}`);
			$.set_text(text_5, `Host bits: ${32 - $$props.subnetInfo.cidr}`);
			$.set_class(div_22, 1, `metric-value ${$2 ?? ''}`, 'svelte-1e0xnjm');
			$.set_text(text_9, `${$3 ?? ''}%`);
			$.set_text(text_10, `${$$props.subnetInfo.cidr ?? ''}/32`);
		},
		[
			() => formatNumber($$props.subnetInfo.hostCount),
			() => formatNumber($$props.subnetInfo.usableHosts),
			() => getUtilizationColor($.get(usablePercentage)),
			() => $.get(usablePercentage).toFixed(1)
		]
	);

	$.append($$anchor, div);
	$.pop();
}