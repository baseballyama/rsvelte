import * as $ from 'svelte/internal/server';
import Tooltip from '$lib/components/global/Tooltip.svelte';
import { formatNumber } from '$lib/utils/formatters';

export default function NetworkVisualizer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { subnetInfo, class: className = '' } = $$props;

		/**
		 * Generates visual representation of network range
		 */
		function generateNetworkBlocks() {
			const { hostCount, cidr } = subnetInfo;
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

		let usablePercentage = $.derived(() => subnetInfo.hostCount > 0
			? subnetInfo.usableHosts / subnetInfo.hostCount * 100
			: 0);

		/**
		 * Get color class based on address utilization percentage
		 */
		function getUtilizationColor(percentage) {
			if (percentage >= 70) return 'success';
			if (percentage >= 40) return 'warning';

			return 'error';
		}

		$$renderer.push(`<div${$.attr_class(`network-visualizer ${$.stringify(className)}`, 'svelte-1e0xnjm')}><section class="visualizer-section svelte-1e0xnjm"><h3 class="svelte-1e0xnjm">Network Visualization</h3> <div class="range-section svelte-1e0xnjm"><div class="range-header svelte-1e0xnjm"><span class="range-label svelte-1e0xnjm">Address Range</span> <span class="range-count svelte-1e0xnjm">${$.escape(formatNumber(subnetInfo.hostCount))} total addresses</span></div> <div class="range-bar svelte-1e0xnjm"><div class="range-segment network svelte-1e0xnjm"${$.attr_style(`width: ${$.stringify(100 / subnetInfo.hostCount)}%`)} title="Network Address">`);

		if (subnetInfo.hostCount <= 32) {
			$$renderer.push(`<!--[0--><span class="segment-label svelte-1e0xnjm">N</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="range-segment usable svelte-1e0xnjm"${$.attr_style(`left: ${$.stringify(100 / subnetInfo.hostCount)}%; width: ${$.stringify(usablePercentage() * (1 - 2 / subnetInfo.hostCount))}%`)} title="Usable Host Addresses"></div> `);

		if (subnetInfo.hostCount > 1) {
			$$renderer.push(`<!--[0--><div class="range-segment broadcast svelte-1e0xnjm"${$.attr_style(`width: ${$.stringify(100 / subnetInfo.hostCount)}%`)} title="Broadcast Address">`);

			if (subnetInfo.hostCount <= 32) {
				$$renderer.push(`<!--[0--><span class="segment-label svelte-1e0xnjm">B</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="range-legend svelte-1e0xnjm"><div class="legend-item svelte-1e0xnjm"><div class="legend-color network svelte-1e0xnjm"></div> <span>Network</span></div> <div class="legend-item svelte-1e0xnjm"><div class="legend-color usable svelte-1e0xnjm"></div> <span>Usable Hosts (${$.escape(formatNumber(subnetInfo.usableHosts))})</span></div> `);

		if (subnetInfo.hostCount > 1) {
			$$renderer.push(`<!--[0--><div class="legend-item svelte-1e0xnjm"><div class="legend-color broadcast svelte-1e0xnjm"></div> <span>Broadcast</span></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div></section> <section class="binary-section svelte-1e0xnjm"><h4 class="svelte-1e0xnjm">Subnet Mask Binary Breakdown</h4> <div class="binary-display svelte-1e0xnjm"><!--[-->`);

		const each_array = $.ensure_array_like(subnetInfo.subnet.octets);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let octet = each_array[i];

			$$renderer.push(`<div class="binary-row svelte-1e0xnjm"><span class="octet-decimal svelte-1e0xnjm">${$.escape(octet.toString().padStart(3, '0'))}</span> <span class="arrow svelte-1e0xnjm">→</span> <div class="bits-group svelte-1e0xnjm"><!--[-->`);

			const each_array_1 = $.ensure_array_like(octet.toString(2).padStart(8, '0').split(''));

			for (let bitIndex = 0, $$length = each_array_1.length; bitIndex < $$length; bitIndex++) {
				let bit = each_array_1[bitIndex];

				Tooltip($$renderer, {
					text: `${bit === '1' ? 'Network bit (1)' : 'Host bit (0)'} - Position ${$.stringify(i * 8 + bitIndex + 1)}`,
					position: 'top',
					children: ($$renderer) => {
						$$renderer.push(`<span${$.attr_class(`bit-box ${bit === '1' ? 'network-bit' : 'host-bit'}`, 'svelte-1e0xnjm')}>${$.escape(bit)}</span>`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]--></div> <span class="octet-label svelte-1e0xnjm">(Octet ${$.escape(i + 1)})</span></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="binary-summary svelte-1e0xnjm"><div class="bit-stats svelte-1e0xnjm"><div class="bit-stat svelte-1e0xnjm"><div class="legend-color network svelte-1e0xnjm"></div> <span>Network bits: ${$.escape(subnetInfo.cidr)}</span></div> <div class="bit-stat svelte-1e0xnjm"><div class="legend-color host svelte-1e0xnjm"></div> <span>Host bits: ${$.escape(32 - subnetInfo.cidr)}</span></div></div></div></section> `);

		if (subnetInfo.hostCount <= 64) {
			$$renderer.push(`<!--[0--><section class="grid-section svelte-1e0xnjm"><h4 class="svelte-1e0xnjm">Address Grid</h4> <div class="address-grid-wrap svelte-1e0xnjm"><div class="address-grid svelte-1e0xnjm"><!--[-->`);

			const each_array_2 = $.ensure_array_like(networkBlocks());

			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let block = each_array_2[$$index_2];

				Tooltip($$renderer, {
					text: block.tooltip,
					position: 'top',
					children: ($$renderer) => {
						$$renderer.push(`<div${$.attr_class(`address-block ${$.stringify(block.type)}`, 'svelte-1e0xnjm')}>`);

						if (block.type === 'network') {
							$$renderer.push(`<!--[0-->N`);
						} else if (block.type === 'broadcast') {
							$$renderer.push(`<!--[1-->B`);
						} else {
							$$renderer.push(`<!--[-1-->${$.escape(block.id)}`);
						}

						$$renderer.push(`<!--]--></div>`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]--></div></div></section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <section class="efficiency-section svelte-1e0xnjm"><h4 class="svelte-1e0xnjm">Network Efficiency</h4> <div class="efficiency-grid svelte-1e0xnjm"><div class="efficiency-metric svelte-1e0xnjm"><div${$.attr_class(`metric-value ${$.stringify(getUtilizationColor(usablePercentage()))}`, 'svelte-1e0xnjm')}>${$.escape(usablePercentage().toFixed(1))}%</div> <div class="metric-label svelte-1e0xnjm">Address Utilization</div></div> <div class="efficiency-metric svelte-1e0xnjm"><div class="metric-value svelte-1e0xnjm">${$.escape(subnetInfo.cidr)}/32</div> <div class="metric-label svelte-1e0xnjm">Network Specificity</div></div></div></section></div>`);
	});
}