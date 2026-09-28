import * as $ from 'svelte/internal/server';
import { computeCIDRDifference } from '$lib/utils/cidr-diff.js';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { useClipboard } from '$lib/composables';
import { formatNumber } from '$lib/utils/formatters';
import '../../../styles/diagnostics-pages.scss';

export default function FreeSpaceFinder($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let pools = `192.168.0.0/16
10.0.0.0/8`;

		let allocations = `192.168.1.0/24
192.168.10.0/24
10.0.0.0/16`;

		let targetPrefix = null;
		let result = null;
		const clipboard = useClipboard();
		let _selectedExample = null;
		let selectedExampleIndex = null;
		let _userModified = false;

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
			pools = example.pools;
			allocations = example.allocations;
			targetPrefix = example.targetPrefix;
			_selectedExample = example.label;
			selectedExampleIndex = index;
			_userModified = false;
			calculateGaps();
		}

		function calculateGaps() {
			try {
				if (!pools.trim()) {
					result = null;

					return;
				}

				// Use CIDR diff to get all available blocks (A - B = pools - allocations)
				const diffResult = computeCIDRDifference(pools, allocations || '', 'minimal');

				// Check for errors
				if (diffResult.errors.length > 0) {
					result = {
						success: false,
						error: diffResult.errors.join('; '),
						availableBlocks: [],
						totalBlocks: 0,
						totalAddresses: 0
					};

					return;
				}

				// Combine IPv4 and IPv6 results
				const allBlocks = [...diffResult.ipv4, ...diffResult.ipv6];

				// Filter by target prefix if specified
				let filteredBlocks = allBlocks;

				if (targetPrefix !== null) {
					const target = targetPrefix; // Capture for closure

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

				result = {
					success: true,
					availableBlocks: filteredBlocks,
					totalBlocks: filteredBlocks.length,
					totalAddresses,
					stats: diffResult.stats,
					visualization: diffResult.visualization
				};
			} catch(error) {
				result = {
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error occurred',
					availableBlocks: [],
					totalBlocks: 0,
					totalAddresses: 0
				};
			}
		}

		function handleInputChange() {
			_userModified = true;
			_selectedExample = null;
			selectedExampleIndex = null;
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

		$$renderer.push(`<div class="card"><header class="card-header"><h2>Free Space Finder</h2> <p>Discover all available address blocks within network pools</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary">`);
		Icon($$renderer, { name: 'chevron-right', size: 'xs' });
		$$renderer.push(`<!----> <h4>Quick Examples</h4></summary> <div class="examples-grid"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let example = each_array[i];

			$$renderer.push(`<button${$.attr_class('example-card', void 0, { 'selected': selectedExampleIndex === i })}><div class="example-label">${$.escape(example.label)}</div> <div class="example-preview">${$.escape(example.pools.split('\n')[0])}
              ${$.escape(example.pools.includes('\n') ? '...' : '')}</div></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <section class="input-section svelte-105p0aw"><div class="input-grid svelte-105p0aw"><div class="input-group"><label for="pools">Network Pools</label> <textarea id="pools" placeholder="192.168.0.0/16
10.0.0.0/8" rows="4" required="">`);

		const $$body = $.escape(pools);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea></div> <div class="input-group"><label for="allocations">Allocated Blocks</label> <textarea id="allocations" placeholder="192.168.1.0/24
192.168.10.0/24" rows="4">`);

		const $$body_1 = $.escape(allocations);

		if ($$body_1) {
			$$renderer.push(`${$$body_1}`);
		} else {}

		$$renderer.push(`</textarea></div></div> <div class="filter-section svelte-105p0aw"><div class="input-group"><label for="target-prefix">Target Prefix Length (Optional)</label> <div class="prefix-input-wrapper svelte-105p0aw"><input id="target-prefix" type="number"${$.attr('value', targetPrefix)} min="1" max="32" placeholder="e.g., 24" class="svelte-105p0aw"/> <span class="prefix-hint svelte-105p0aw">/${$.escape(targetPrefix || 'xx')}</span> <button class="clear-filter svelte-105p0aw" aria-label="Clear filter">`);
		Icon($$renderer, { name: 'x', size: 'xs' });
		$$renderer.push(`<!----></button></div></div></div></section> `);

		if (result) {
			$$renderer.push(`<!--[0--><section class="results-section svelte-105p0aw">`);

			if (result.success) {
				$$renderer.push(`<!--[0--><div class="results-header svelte-105p0aw"><h3 class="svelte-105p0aw">Available Free Space</h3> <div class="results-summary svelte-105p0aw"><span class="metric svelte-105p0aw">`);
				Icon($$renderer, { name: 'free-blocks', size: 'sm' });
				$$renderer.push(`<!----> ${$.escape(result.totalBlocks)} free blocks</span> <span class="metric svelte-105p0aw">`);
				Icon($$renderer, { name: 'network', size: 'sm' });
				$$renderer.push(`<!----> ${$.escape(formatNumber(result.totalAddresses))} addresses</span></div></div> `);

				if (result.availableBlocks.length > 0 && result.visualization) {
					$$renderer.push(`<!--[0--><div class="visualization-section svelte-105p0aw"><h4 class="svelte-105p0aw">Address Space Visualization</h4> <div class="visualization-container svelte-105p0aw"><div class="viz-legend svelte-105p0aw"><div class="legend-item svelte-105p0aw"><div class="legend-color pools svelte-105p0aw"></div> <span>Network Pools</span></div> <div class="legend-item svelte-105p0aw"><div class="legend-color allocated svelte-105p0aw"></div> <span>Allocated Space</span></div> <div class="legend-item svelte-105p0aw"><div class="legend-color available svelte-105p0aw"></div> <span>Available Space</span></div></div> <div class="address-blocks svelte-105p0aw"><!--[-->`);

					const each_array_1 = $.ensure_array_like(result.visualization.setA);

					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let pool = each_array_1[$$index_1];

						$$renderer.push(`<div class="address-block pool-block svelte-105p0aw"${$.attr_style(`left: ${$.stringify(getBlockPosition(pool.start, result.visualization.totalRange))}%; width: ${$.stringify(getBlockWidth(pool.start, pool.end, result.visualization.totalRange))}%`)}${$.attr('title', `Pool: ${$.stringify(pool.cidr || `${formatAddress(pool.start, result.visualization.version)}-${formatAddress(pool.end, result.visualization.version)}`)}`)}></div>`);
					}

					$$renderer.push(`<!--]--> <!--[-->`);

					const each_array_2 = $.ensure_array_like(result.visualization.setB);

					for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
						let allocation = each_array_2[$$index_2];

						$$renderer.push(`<div class="address-block allocated-block svelte-105p0aw"${$.attr_style(`left: ${$.stringify(getBlockPosition(allocation.start, result.visualization.totalRange))}%; width: ${$.stringify(getBlockWidth(allocation.start, allocation.end, result.visualization.totalRange))}%`)}${$.attr('title', `Allocated: ${$.stringify(allocation.cidr || `${formatAddress(allocation.start, result.visualization.version)}-${formatAddress(allocation.end, result.visualization.version)}`)}`)}></div>`);
					}

					$$renderer.push(`<!--]--> <!--[-->`);

					const each_array_3 = $.ensure_array_like(result.visualization.result);

					for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
						let available = each_array_3[$$index_3];

						$$renderer.push(`<div class="address-block available-block svelte-105p0aw"${$.attr_style(`left: ${$.stringify(getBlockPosition(available.start, result.visualization.totalRange))}%; width: ${$.stringify(getBlockWidth(available.start, available.end, result.visualization.totalRange))}%`)}${$.attr('title', `Available: ${$.stringify(available.cidr)}`)}><span class="block-label svelte-105p0aw">${$.escape(available.cidr)}</span></div>`);
					}

					$$renderer.push(`<!--]--></div> <div class="address-scale svelte-105p0aw"><span class="scale-start">${$.escape(formatAddress(result.visualization.totalRange.start, result.visualization.version))}</span> <span class="scale-end">${$.escape(formatAddress(result.visualization.totalRange.end, result.visualization.version))}</span></div></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (result.availableBlocks.length > 0) {
					$$renderer.push(`<!--[0--><div class="free-blocks-grid svelte-105p0aw"><!--[-->`);

					const each_array_4 = $.ensure_array_like(result.availableBlocks);

					for (let index = 0, $$length = each_array_4.length; index < $$length; index++) {
						let block = each_array_4[index];

						const blockAddresses = (() => {
							const match = block.match(/\/(\d+)$/);

							if (!match) return 0;

							const prefixLength = parseInt(match[1]);
							const version = block.includes(':') ? 6 : 4;
							const totalBits = version === 4 ? 32 : 128;

							return Math.pow(2, totalBits - prefixLength);
						})();

						$$renderer.push(`<div class="free-block-card svelte-105p0aw"><div class="block-header svelte-105p0aw"><code class="block-cidr svelte-105p0aw">${$.escape(block)}</code> <button${$.attr_class(`copy-button ${clipboard.isCopied(`block-${index}`) ? 'copied' : ''}`, 'svelte-105p0aw')} aria-label="Copy CIDR block">`);

						Icon($$renderer, {
							name: clipboard.isCopied(`block-${index}`) ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----></button></div> <div class="block-info svelte-105p0aw"><span class="address-count svelte-105p0aw">${$.escape(formatNumber(blockAddresses))} addresses</span> `);

						if (targetPrefix && blockAddresses >= Math.pow(2, 32 - targetPrefix)) {
							$$renderer.push(`<!--[0--><span class="can-fit svelte-105p0aw">`);
							Icon($$renderer, { name: 'check-circle', size: 'xs' });
							$$renderer.push(`<!----> Can fit /${$.escape(targetPrefix)}</span>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div></div>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push(`<!--[-1--><div class="no-gaps svelte-105p0aw">`);
					Icon($$renderer, { name: 'alert-circle' });
					$$renderer.push(`<!----> <h4 class="svelte-105p0aw">No Available Space</h4> <p>All address space in the pools is allocated or there are no pools defined.</p></div>`);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push(`<!--[-1--><div class="error-message svelte-105p0aw">`);
				Icon($$renderer, { name: 'alert-triangle' });
				$$renderer.push(`<!----> <h4 class="svelte-105p0aw">Calculation Error</h4> <p>${$.escape(result.error || 'Unknown error occurred')}</p></div>`);
			}

			$$renderer.push(`<!--]--></section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}