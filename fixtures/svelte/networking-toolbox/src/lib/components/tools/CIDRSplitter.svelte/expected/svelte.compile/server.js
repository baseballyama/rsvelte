import * as $ from 'svelte/internal/server';
import { splitCIDRByCount, splitCIDRByPrefix } from '$lib/utils/cidr-split.js';
import { tooltip } from '$lib/actions/tooltip.js';
import { useClipboard } from '$lib/composables';
import Icon from '$lib/components/global/Icon.svelte';
import '../../../styles/diagnostics-pages.scss';

export default function CIDRSplitter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let inputCIDR = '192.168.1.0/24';
		let splitMode = 'count';
		let subnetCount = 4;
		let targetPrefix = 26;
		let result = null;
		const clipboard = useClipboard();
		let selectedExampleIndex = null;

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
			inputCIDR = example.cidr;
			splitMode = example.mode;

			if (example.mode === 'count') {
				subnetCount = example.count;
			} else {
				targetPrefix = example.prefix;
			}

			selectedExampleIndex = index;
			performSplit();
		}

		/* Clear example selection when input changes */
		function _clearExampleSelection() {
			selectedExampleIndex = null;
		}

		/* Copy all subnets */
		function copyAllSubnets() {
			if (!result?.subnets) return;

			const text = result.subnets.map((s) => s.cidr).join('\n');

			clipboard.copy(text, 'all-subnets');
		}

		/* Clear input */
		function clearInput() {
			inputCIDR = '';
			result = null;
		}

		/* Perform split */
		function performSplit() {
			if (!inputCIDR.trim()) {
				result = null;

				return;
			}

			try {
				result = splitMode === 'count'
					? splitCIDRByCount(inputCIDR, subnetCount)
					: splitCIDRByPrefix(inputCIDR, targetPrefix);
			} catch(error) {
				result = {
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
				};
			}
		}

		/* Calculate visualization bar width percentage */
		function getBarWidth(childRange) {
			if (!result?.visualization) return 0;

			const parentSize = result.visualization.parentEnd - result.visualization.parentStart + 1n;
			const childSize = childRange.size;

			return Number(childSize * 10000n / parentSize) / 100;
		}

		/* Calculate visualization bar offset percentage */
		function getBarOffset(childRange) {
			if (!result?.visualization) return 0;

			const parentSize = result.visualization.parentEnd - result.visualization.parentStart + 1n;
			const offset = childRange.start - result.visualization.parentStart;

			return Number(offset * 10000n / parentSize) / 100;
		}

		/* Generate tooltip text for subnet segment */
		function getSubnetTooltipText(childRange) {
			if (!result?.subnets) return childRange.cidr;

			const subnet = result.subnets.find((s) => s.cidr === childRange.cidr);

			if (!subnet) return childRange.cidr;

			return `${subnet.cidr}\nRange: ${subnet.network} - ${subnet.broadcast}\nHosts: ${subnet.totalHosts}`;
		}

		$$renderer.push(`<div class="card svelte-1qlf1oz"><header class="card-header svelte-1qlf1oz"><h2 class="svelte-1qlf1oz">CIDR Subnet Splitter</h2> <p class="svelte-1qlf1oz">Split a network into equal child subnets by count or target prefix length.</p></header> <div class="mode-section svelte-1qlf1oz"><h3 class="svelte-1qlf1oz">Split Mode</h3> <div class="tabs svelte-1qlf1oz"><!--[-->`);

		const each_array = $.ensure_array_like(
			// Reactive split and example selection tracking
			// Check if current input matches any example
			modes
		);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let modeOption = each_array[$$index];

			$$renderer.push(`<button type="button"${$.attr_class('tab svelte-1qlf1oz', void 0, { 'active': splitMode === modeOption.value })}>${$.escape(modeOption.label)}</button>`);
		}

		$$renderer.push(`<!--]--></div></div> <div class="input-section svelte-1qlf1oz"><h3 class="svelte-1qlf1oz">Parent Network</h3> <div class="form-group svelte-1qlf1oz"><label for="input-cidr" class="svelte-1qlf1oz">Parent CIDR block</label> <div class="input-wrapper svelte-1qlf1oz"><input id="input-cidr" type="text"${$.attr('value', inputCIDR)} placeholder="192.168.1.0/24" class="input-field svelte-1qlf1oz"/> <button type="button" class="btn btn-secondary btn-sm clear-btn svelte-1qlf1oz">`);
		Icon($$renderer, { name: 'trash', size: 'sm' });
		$$renderer.push(`<!----></button></div></div> <div class="form-group svelte-1qlf1oz">`);

		if (splitMode === 'count') {
			$$renderer.push(`<!--[0--><label for="subnet-count" class="svelte-1qlf1oz">Number of subnets</label> <input id="subnet-count" type="number"${$.attr('value', subnetCount)} min="1" max="1024" class="input-field svelte-1qlf1oz"/>`);
		} else {
			$$renderer.push(`<!--[-1--><label for="target-prefix" class="svelte-1qlf1oz">Target prefix length</label> <input id="target-prefix" type="number"${$.attr('value', targetPrefix)} min="1" max="128" class="input-field svelte-1qlf1oz"/>`);
		}

		$$renderer.push(`<!--]--></div></div> <div class="card examples-card svelte-1qlf1oz"><details class="examples-details svelte-1qlf1oz"><summary class="examples-summary svelte-1qlf1oz">`);
		Icon($$renderer, { name: 'chevron-right', size: 'xs' });
		$$renderer.push(`<!----> <h4 class="svelte-1qlf1oz">Quick Examples</h4></summary> <div class="examples-grid svelte-1qlf1oz"><!--[-->`);

		const each_array_1 = $.ensure_array_like(examples);

		for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
			let example = each_array_1[i];

			$$renderer.push(`<button${$.attr_class('example-card svelte-1qlf1oz', void 0, { 'selected': selectedExampleIndex === i })}><h5 class="svelte-1qlf1oz">${$.escape(example.cidr)}</h5> <p class="svelte-1qlf1oz">${$.escape(example.label)}</p></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> `);

		if (result) {
			$$renderer.push(`<!--[0--><div class="results-section svelte-1qlf1oz">`);

			if (result.error) {
				$$renderer.push(`<!--[0--><div class="info-panel error svelte-1qlf1oz"><h3 class="svelte-1qlf1oz">Split Error</h3> <p class="svelte-1qlf1oz">${$.escape(result.error)}</p></div>`);
			} else if (result.subnets.length > 0) {
				$$renderer.push(`<!--[1--><div class="stats-section svelte-1qlf1oz"><div class="summary-header svelte-1qlf1oz"><h3 class="svelte-1qlf1oz">Split Results</h3> <button type="button"${$.attr_class('btn btn-primary btn-sm svelte-1qlf1oz', void 0, { 'copied': clipboard.isCopied('all-subnets') })}>`);

				Icon($$renderer, {
					name: clipboard.isCopied('all-subnets') ? 'check' : 'copy',
					size: 'sm'
				});

				$$renderer.push(`<!----> Copy All CIDRs</button></div> <div class="stats-grid svelte-1qlf1oz"><div class="stat-card svelte-1qlf1oz"><span class="stat-label svelte-1qlf1oz">Parent Network</span> <span class="stat-value svelte-1qlf1oz">${$.escape(result.stats.parentCIDR)}</span></div> <div class="stat-card svelte-1qlf1oz"><span class="stat-label svelte-1qlf1oz">Child Subnets</span> <span class="stat-value svelte-1qlf1oz">${$.escape(result.stats.childCount)}</span></div> <div class="stat-card svelte-1qlf1oz"><span class="stat-label svelte-1qlf1oz">Child Prefix</span> <span class="stat-value svelte-1qlf1oz">/${$.escape(result.stats.childPrefix)}</span></div> <div class="stat-card svelte-1qlf1oz"><span class="stat-label svelte-1qlf1oz">Addresses per Child</span> <span class="stat-value svelte-1qlf1oz">${$.escape(result.stats.addressesPerChild)}</span></div> `);

				if (result.stats.utilizationPercent < 100) {
					$$renderer.push(`<!--[0--><div class="stat-card svelte-1qlf1oz"><span class="stat-label svelte-1qlf1oz">Utilization</span> <span class="stat-value svelte-1qlf1oz">${$.escape(result.stats.utilizationPercent)}%</span></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div> <div class="visualization-section svelte-1qlf1oz"><h4 class="svelte-1qlf1oz">Address Space Visualization</h4> <div class="address-bar svelte-1qlf1oz"><!--[-->`);

				const each_array_2 = $.ensure_array_like(result.visualization.childRanges);

				for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
					let childRange = each_array_2[$$index_2];

					$$renderer.push(`<div class="subnet-segment svelte-1qlf1oz"${$.attr_style(`width: ${$.stringify(getBarWidth(childRange))}%; left: ${$.stringify(getBarOffset(childRange))}%`)}></div>`);
				}

				$$renderer.push(`<!--]--></div></div> <div class="subnets-section svelte-1qlf1oz"><h4 class="svelte-1qlf1oz">Child Subnets</h4> <div class="subnets-grid svelte-1qlf1oz"><!--[-->`);

				const each_array_3 = $.ensure_array_like(result.subnets);

				for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
					let subnet = each_array_3[$$index_3];

					$$renderer.push(`<div class="subnet-card svelte-1qlf1oz"><div class="subnet-header svelte-1qlf1oz"><code class="subnet-cidr svelte-1qlf1oz">${$.escape(subnet.cidr)}</code> <button type="button"${$.attr_class('btn btn-icon btn-xs svelte-1qlf1oz', void 0, { 'copied': clipboard.isCopied(subnet.cidr) })}>`);

					Icon($$renderer, {
						name: clipboard.isCopied(subnet.cidr) ? 'check' : 'copy',
						size: 'xs'
					});

					$$renderer.push(`<!----></button></div> <div class="subnet-details svelte-1qlf1oz"><div class="detail-row svelte-1qlf1oz"><span class="detail-label svelte-1qlf1oz">Network:</span> <span class="detail-value svelte-1qlf1oz">${$.escape(subnet.network)}</span></div> <div class="detail-row svelte-1qlf1oz"><span class="detail-label svelte-1qlf1oz">Broadcast:</span> <span class="detail-value svelte-1qlf1oz">${$.escape(subnet.broadcast)}</span></div> <div class="detail-row svelte-1qlf1oz"><span class="detail-label svelte-1qlf1oz">Usable:</span> <span class="detail-value svelte-1qlf1oz">${$.escape(subnet.firstHost)} - ${$.escape(subnet.lastHost)}</span></div> <div class="detail-row svelte-1qlf1oz"><span class="detail-label svelte-1qlf1oz">Hosts:</span> <span class="detail-value svelte-1qlf1oz">${$.escape(subnet.usableHosts)}</span></div></div></div>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}