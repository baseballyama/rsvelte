import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { useClipboard } from '$lib/composables';
import { cidrDeaggregate, getSubnetSize } from '$lib/utils/cidr-deaggregate.js';
import { formatNumber } from '$lib/utils/formatters';
import '../../../styles/diagnostics-pages.scss';

export default function CIDRDeaggregate($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let input = `192.168.0.0/22
10.0.0.0-10.0.0.255`;

		let targetPrefix = 24;
		let result = null;
		const clipboard = useClipboard();
		let _selectedExample = null;
		let selectedExampleIndex = null;
		let _userModified = false;

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
			input = example.input;
			targetPrefix = example.targetPrefix;
			_selectedExample = example.label;
			selectedExampleIndex = index;
			_userModified = false;
			performDeaggregation();
		}

		function performDeaggregation() {
			if (!input.trim()) {
				result = null;

				return;
			}

			result = cidrDeaggregate({ input, targetPrefix });
		}

		function handleInputChange() {
			_userModified = true;
			_selectedExample = null;
			selectedExampleIndex = null;
			performDeaggregation();
		}

		async function copyAllSubnets() {
			if (!result?.subnets.length) return;

			const allText = result.subnets.join('\n');

			await clipboard.copy(allText, 'all-subnets');
		}

		// Calculate on component load
		performDeaggregation();

		$$renderer.push(`<div class="card"><header class="card-header"><h2>CIDR Deaggregate</h2> <p>Decompose CIDR blocks and ranges into uniform target prefix subnets</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary">`);
		Icon($$renderer, { name: 'chevron-right', size: 'xs' });
		$$renderer.push(`<!----> <h4>Quick Examples</h4></summary> <div class="examples-grid"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let example = each_array[i];

			$$renderer.push(`<button${$.attr_class('example-card', void 0, { 'selected': selectedExampleIndex === i })}><div class="example-label">${$.escape(example.label)}</div> <div class="example-preview">Target: /${$.escape(example.targetPrefix)}</div></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <section class="input-section svelte-gcckok"><div class="input-grid svelte-gcckok"><div class="input-group"><label for="input">Input Networks/Ranges</label> <textarea id="input" placeholder="192.168.0.0/22
10.0.0.0-10.0.255.255
172.16.1.1" rows="6" required="" class="svelte-gcckok">`);

		const $$body = $.escape(input);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea></div> <div class="input-group"><label for="target-prefix">Target Prefix Length</label> <div class="prefix-input-wrapper svelte-gcckok"><input id="target-prefix" type="number"${$.attr('value', targetPrefix)} min="1" max="32" required="" class="svelte-gcckok"/> <span class="prefix-hint svelte-gcckok">/${$.escape(targetPrefix)}</span></div> <div class="prefix-info svelte-gcckok">`);

		if (targetPrefix) {
			$$renderer.push('<!--[0-->');

			const addresses = getSubnetSize(targetPrefix);

			$$renderer.push(`Each /${$.escape(targetPrefix)} subnet = ${$.escape(formatNumber(addresses))} addresses`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div></div></section> `);

		if (result) {
			$$renderer.push(`<!--[0--><section class="results-section svelte-gcckok">`);

			if (result.success) {
				$$renderer.push(`<!--[0--><div class="results-header svelte-gcckok"><h3 class="svelte-gcckok">Deaggregated Subnets</h3> <div class="results-actions svelte-gcckok"><div class="results-summary svelte-gcckok"><span class="metric svelte-gcckok">`);
				Icon($$renderer, { name: 'network', size: 'sm' });
				$$renderer.push(`<!----> ${$.escape(result.totalSubnets)} subnets</span> <span class="metric svelte-gcckok">`);
				Icon($$renderer, { name: 'database', size: 'sm' });
				$$renderer.push(`<!----> ${$.escape(formatNumber(result.totalAddresses))} addresses</span></div> `);

				if (result.subnets.length > 0) {
					$$renderer.push(`<!--[0--><button${$.attr_class(`copy-all-button ${clipboard.isCopied('all-subnets') ? 'copied' : ''}`, 'svelte-gcckok')}>`);

					Icon($$renderer, {
						name: clipboard.isCopied('all-subnets') ? 'check' : 'copy',
						size: 'sm'
					});

					$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('all-subnets') ? 'Copied!' : 'Copy All')}</button>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div> <div class="input-summary svelte-gcckok"><div class="summary-item svelte-gcckok"><span class="summary-label svelte-gcckok">Input:</span> <span class="summary-value svelte-gcckok">${$.escape(result.inputSummary.totalInputs)} items, ${$.escape(formatNumber(result.inputSummary.totalInputAddresses))} addresses</span></div> <div class="summary-item svelte-gcckok"><span class="summary-label svelte-gcckok">Output:</span> <span class="summary-value svelte-gcckok">${$.escape(result.totalSubnets)} /${$.escape(targetPrefix)} subnets, ${$.escape(formatNumber(result.totalAddresses))} addresses</span></div> `);

				if (result.totalAddresses !== result.inputSummary.totalInputAddresses) {
					$$renderer.push(`<!--[0--><div class="summary-item svelte-gcckok"><span class="summary-label svelte-gcckok">Note:</span> <span class="summary-value address-diff svelte-gcckok">${$.escape(result.totalAddresses > result.inputSummary.totalInputAddresses ? 'Expanded' : 'Reduced')} by ${$.escape(formatNumber(Math.abs(result.totalAddresses - result.inputSummary.totalInputAddresses)))} addresses (due to alignment to /${$.escape(targetPrefix)} boundaries)</span></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> `);

				if (result.subnets.length > 0) {
					$$renderer.push(`<!--[0--><div class="subnets-grid svelte-gcckok"><!--[-->`);

					const each_array_1 = $.ensure_array_like(result.subnets);

					for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
						let subnet = each_array_1[index];
						const subnetSize = getSubnetSize(targetPrefix);

						$$renderer.push(`<div class="subnet-card svelte-gcckok"><div class="subnet-header svelte-gcckok"><code class="subnet-cidr svelte-gcckok">${$.escape(subnet)}</code> <button${$.attr_class(`copy-button ${clipboard.isCopied(`subnet-${index}`) ? 'copied' : ''}`, 'svelte-gcckok')} aria-label="Copy CIDR block">`);

						Icon($$renderer, {
							name: clipboard.isCopied(`subnet-${index}`) ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----></button></div> <div class="subnet-info svelte-gcckok"><span class="address-count svelte-gcckok">${$.escape(formatNumber(subnetSize))} addresses</span> `);

						if (subnetSize >= 256) {
							$$renderer.push(`<!--[0--><span class="subnet-size svelte-gcckok">${$.escape(subnetSize >= 65536
								? `${(subnetSize / 65536).toFixed(0)}×/16`
								: subnetSize >= 256 ? `${(subnetSize / 256).toFixed(0)}×/24` : '')}</span>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div></div>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push(`<!--[-1--><div class="no-subnets svelte-gcckok">`);
					Icon($$renderer, { name: 'alert-circle' });
					$$renderer.push(`<!----> <h4 class="svelte-gcckok">No Subnets Generated</h4> <p>The target prefix length may be too large for the input networks, or the input is empty.</p></div>`);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push(`<!--[-1--><div class="error-message svelte-gcckok">`);
				Icon($$renderer, { name: 'alert-triangle' });
				$$renderer.push(`<!----> <h4 class="svelte-gcckok">Deaggregation Error</h4> <p>${$.escape(result.error || 'Unknown error occurred')}</p></div>`);
			}

			$$renderer.push(`<!--]--></section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}