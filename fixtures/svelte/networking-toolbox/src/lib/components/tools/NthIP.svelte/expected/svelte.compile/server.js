import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import { calculateNthIPs } from '$lib/utils/nth-ip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { useClipboard } from '$lib/composables';
import '../../../styles/diagnostics-pages.scss';

export default function NthIP($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let inputText = '192.168.1.0/24 @ 10\n10.0.0.0-10.0.0.255 [50]\n172.16.0.0/16 100\n2001:db8::/64#1000';
		let globalOffset = 0;
		let result = null;
		let isLoading = false;
		let selectedExampleIndex = null;
		let userModified = false;
		const clipboard = useClipboard();

		const examples = [
			{
				input: '192.168.1.0/24 @ 10',
				description: 'Get 10th IP from a /24 subnet'
			},

			{
				input: '10.0.0.0-10.0.0.255 [128]\n172.16.0.0/16 1000',
				description: 'Multiple range types with different indices'
			},

			{
				input: '2001:db8::/64#100\nfe80::/10 @ 50',
				description: 'IPv6 networks with various formats'
			},

			{
				input: '192.168.0.0/16 + 100\n10.0.0.0/8 [5000]',
				description: 'Large networks with high indices'
			},

			{
				input: '203.0.113.0/24 @ 1\n203.0.113.0/24 @ -1',
				description: 'First and last IP using positive/negative indexing'
			},

			{
				input: '192.168.1.1-192.168.1.100 [25]\n192.168.1.101-192.168.1.200 [75]',
				description: 'Sequential IP ranges with specific indices'
			},

			{
				input: '2001:db8:85a3::/48#65536\nfc00::/7 @ 1000000',
				description: 'Large IPv6 address spaces'
			},

			{
				input: '127.0.0.0/8 @ 256\n::1/128 @ 0\n169.254.0.0/16 [32768]',
				description: 'Special-use addresses: loopback and link-local'
			}
		];

		function calculateIPs() {
			if (!inputText.trim()) {
				result = null;

				return;
			}

			isLoading = true;

			try {
				const inputs = inputText.split('\n').filter((line) => line.trim());

				if (inputs.length === 0) {
					result = {
						calculations: [],
						summary: {
							totalCalculations: 0,
							validCalculations: 0,
							invalidCalculations: 0,
							outOfBoundsCalculations: 0
						},
						errors: ['No valid input lines found']
					};

					return;
				}

				result = calculateNthIPs(inputs, globalOffset);
			} catch(error) {
				result = {
					calculations: [],
					summary: {
						totalCalculations: 0,
						validCalculations: 0,
						invalidCalculations: 0,
						outOfBoundsCalculations: 0
					},
					errors: [
						error instanceof Error
							? error.message
							: 'Unknown error occurred while calculating nth IPs'
					]
				};
			} finally {
				isLoading = false;
			}
		}

		function exportResults(format) {
			if (!result) return;

			const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
			let content = '';
			let filename = '';

			if (format === 'csv') {
				const headers = 'Input,Network,Index,Offset,Result IP,Version,Total Addresses,In Bounds,Valid,Error';
				const rows = result.calculations.map((calc) => `"${calc.input}","${calc.network}","${calc.index}","${calc.offset}","${calc.resultIP}","IPv${calc.version}","${calc.totalAddresses}","${calc.isInBounds}","${calc.isValid}","${calc.error || ''}"`);

				content = [headers, ...rows].join('\n');
				filename = `nth-ip-${timestamp}.csv`;
			} else {
				content = JSON.stringify(result, null, 2);
				filename = `nth-ip-${timestamp}.json`;
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
			inputText = example.input;
			selectedExampleIndex = index;
			userModified = false;
			calculateIPs();
		}

		function handleInputChange() {
			userModified = true;
			selectedExampleIndex = null;
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h1>Nth IP Calculator</h1> <p>Resolve the IP address at a specific index within networks and ranges with optional global offset.</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary">`);
		Icon($$renderer, { name: 'chevron-right', size: 'xs' });
		$$renderer.push(`<!----> <h4>Quick Examples</h4></summary> <div class="examples-grid"><!--[-->`);

		const each_array = $.ensure_array_like(
			// Auto-calculate when inputs change
			examples
		);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let example = each_array[i];

			$$renderer.push(`<button${$.attr_class('example-card', void 0, { 'selected': selectedExampleIndex === i && !userModified })}><h5>${$.escape(example.input.split('\n')[0])}</h5> <p>${$.escape(example.description)}</p></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="card input-card"><div class="card-header"><h3>Network Configuration</h3></div> <div class="card-content"><div class="form-row svelte-1e7d9k3"><div class="form-group textarea-group svelte-1e7d9k3"><label for="inputs" class="svelte-1e7d9k3">Network and Index Specifications</label> <textarea id="inputs" placeholder="192.168.1.0/24 @ 10
10.0.0.0-10.0.0.255 [50]
172.16.0.0/16 100
2001:db8::/64#1000" rows="6" class="svelte-1e7d9k3">`);

		const $$body = $.escape(inputText);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea> <div class="input-help svelte-1e7d9k3">Formats: network @ index, network [index], network index, or network#index. Optional offset: + number</div></div> <div class="options-section svelte-1e7d9k3"><div class="option-group svelte-1e7d9k3"><label for="offset" class="svelte-1e7d9k3">Global Offset</label> <input id="offset" type="number"${$.attr('value', globalOffset)} placeholder="0" min="0" class="svelte-1e7d9k3"/> <div class="option-help svelte-1e7d9k3">Add this value to all index calculations (0-based indexing)</div></div></div></div></div></div> `);

		if (isLoading) {
			$$renderer.push(`<!--[0--><div class="card loading-card"><div class="card-content"><div class="loading svelte-1e7d9k3">`);
			Icon($$renderer, { name: 'loader', size: 'sm', animate: 'spin' });
			$$renderer.push(`<!----> Calculating IPs...</div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (result) {
			$$renderer.push(`<!--[0--><div class="results svelte-1e7d9k3">`);

			if (result.errors.length > 0) {
				$$renderer.push(`<!--[0--><div class="card error-card svelte-1e7d9k3"><div class="card-content"><div class="error-content svelte-1e7d9k3">`);
				Icon($$renderer, { name: 'alert-triangle', size: 'md' });
				$$renderer.push(`<!----> <div><strong class="svelte-1e7d9k3">Calculation Errors</strong> <!--[-->`);

				const each_array_1 = $.ensure_array_like(result.errors);

				for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
					let error = each_array_1[index];

					$$renderer.push(`<p class="svelte-1e7d9k3">${$.escape(error)}</p>`);
				}

				$$renderer.push(`<!--]--></div></div></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (result.calculations.length > 0) {
				$$renderer.push(`<!--[0--><div class="card summary-card svelte-1e7d9k3"><div class="card-header row"><h3>Calculation Summary</h3> <button${$.attr_class('copy-btn', void 0, { 'copied': clipboard.isCopied('summary') })}>`);

				Icon($$renderer, {
					name: clipboard.isCopied('summary') ? 'check' : 'copy',
					size: 'xs'
				});

				$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('summary') ? 'Copied!' : 'Copy')}</button></div> <div class="card-content"><div class="summary-stats svelte-1e7d9k3"><div class="info-card"><div class="info-label">Total</div> <div class="metric-value">${$.escape(result.summary.totalCalculations)}</div></div> <div class="info-card"><div class="info-label">Valid</div> <div class="metric-value success">${$.escape(result.summary.validCalculations)}</div></div> <div class="info-card"><div class="info-label">Invalid</div> <div${$.attr_class('metric-value', void 0, { 'error': result.summary.invalidCalculations > 0 })}>${$.escape(result.summary.invalidCalculations)}</div></div> <div class="info-card"><div class="info-label">Out of Bounds</div> <div${$.attr_class('metric-value', void 0, { 'warning': result.summary.outOfBoundsCalculations > 0 })}>${$.escape(result.summary.outOfBoundsCalculations)}</div></div></div></div></div> <div class="card calculations-card svelte-1e7d9k3"><div class="card-header row"><h3>IP Calculations</h3> <div class="export-buttons svelte-1e7d9k3"><button class="svelte-1e7d9k3">`);
				Icon($$renderer, { name: 'csv-file', size: 'xs' });
				$$renderer.push(`<!----> Export CSV</button> <button class="svelte-1e7d9k3">`);
				Icon($$renderer, { name: 'json-file', size: 'xs' });
				$$renderer.push(`<!----> Export JSON</button></div></div> <div class="card-content"><div class="calculations-list svelte-1e7d9k3"><!--[-->`);

				const each_array_2 = $.ensure_array_like(result.calculations);

				for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
					let calculation = each_array_2[index];

					$$renderer.push(`<div${$.attr_class('calculation-card svelte-1e7d9k3', void 0, {
						'valid': calculation.isValid && calculation.isInBounds,
						'out-of-bounds': calculation.isValid && !calculation.isInBounds,
						'invalid': !calculation.isValid
					})}><div class="calc-header svelte-1e7d9k3"><div class="input-info svelte-1e7d9k3"><div class="value-copy"><span class="input-text svelte-1e7d9k3">${$.escape(calculation.input)}</span> <button${$.attr_class('copy-btn', void 0, { 'copied': clipboard.isCopied(`input-${index}`) })}>`);

					Icon($$renderer, {
						name: clipboard.isCopied(`input-${index}`) ? 'check' : 'copy',
						size: 'xs'
					});

					$$renderer.push(`<!----></button></div> <div class="input-meta svelte-1e7d9k3"><span class="network-type svelte-1e7d9k3">${$.escape(calculation.inputType.toUpperCase())}</span> <span class="ip-version svelte-1e7d9k3">IPv${$.escape(calculation.version)}</span></div></div> <div class="status svelte-1e7d9k3">`);

					if (calculation.isValid && calculation.isInBounds) {
						$$renderer.push(`<!--[0--><span>`);
						Icon($$renderer, { name: 'check-circle', size: 'md' });
						$$renderer.push(`<!----></span>`);
					} else if (calculation.isValid && !calculation.isInBounds) {
						$$renderer.push(`<!--[1--><span>`);
						Icon($$renderer, { name: 'alert-circle', size: 'md' });
						$$renderer.push(`<!----></span>`);
					} else {
						$$renderer.push(`<!--[-1--><span>`);
						Icon($$renderer, { name: 'x-circle', size: 'md' });
						$$renderer.push(`<!----></span>`);
					}

					$$renderer.push(`<!--]--></div></div> `);

					if (calculation.isValid) {
						$$renderer.push(`<!--[0--><div class="calculation-details svelte-1e7d9k3"><div class="result-section svelte-1e7d9k3"><div class="result-ip svelte-1e7d9k3"><span class="result-label svelte-1e7d9k3">Result IP:</span> <div class="value-copy"><span class="result-value svelte-1e7d9k3">${$.escape(calculation.resultIP)}</span> <button${$.attr_class('copy-btn', void 0, { 'copied': clipboard.isCopied(`result-${index}`) })}>`);

						Icon($$renderer, {
							name: clipboard.isCopied(`result-${index}`) ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----></button></div></div> `);

						if (!calculation.isInBounds) {
							$$renderer.push(`<!--[0--><div class="bounds-warning svelte-1e7d9k3">`);
							Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
							$$renderer.push(`<!----> <span>Index out of bounds</span></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> <div class="calculation-info svelte-1e7d9k3"><div class="details-header"><h4>Calculation Details</h4></div> <div class="info-grid svelte-1e7d9k3"><div class="info-card svelte-1e7d9k3"><div class="info-label">Network</div> <div class="value-copy svelte-1e7d9k3"><span class="ip-value">${$.escape(calculation.network)}</span> <button${$.attr_class('copy-btn', void 0, { 'copied': clipboard.isCopied(`network-${index}`) })}>`);

						Icon($$renderer, {
							name: clipboard.isCopied(`network-${index}`) ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----></button></div></div> <div class="info-card svelte-1e7d9k3"><div class="info-label">Total Addresses</div> <div class="metric-value svelte-1e7d9k3">${$.escape(calculation.totalAddresses)}</div></div> <div class="info-card svelte-1e7d9k3"><div class="info-label">Index</div> <div class="metric-value info svelte-1e7d9k3">${$.escape(calculation.index)}</div></div> <div class="info-card svelte-1e7d9k3"><div class="info-label">Offset</div> <div class="metric-value svelte-1e7d9k3">${$.escape(calculation.offset)}</div></div></div></div> `);

						if (calculation.details) {
							$$renderer.push(`<!--[0--><div><div class="details-header"><h4>Network Details</h4></div> <div class="network-details svelte-1e7d9k3"><div class="details-grid svelte-1e7d9k3"><div class="info-card svelte-1e7d9k3"><div class="info-label">Start</div> <div class="value-copy svelte-1e7d9k3"><span class="ip-value">${$.escape(calculation.details.networkStart)}</span> <button${$.attr_class('copy-btn', void 0, { 'copied': clipboard.isCopied(`start-${index}`) })}>`);

							Icon($$renderer, {
								name: clipboard.isCopied(`start-${index}`) ? 'check' : 'copy',
								size: 'xs'
							});

							$$renderer.push(`<!----></button></div></div> <div class="info-card svelte-1e7d9k3"><div class="info-label">End</div> <div class="value-copy svelte-1e7d9k3"><span class="ip-value">${$.escape(calculation.details.networkEnd)}</span> <button${$.attr_class('copy-btn', void 0, { 'copied': clipboard.isCopied(`end-${index}`) })}>`);

							Icon($$renderer, {
								name: clipboard.isCopied(`end-${index}`) ? 'check' : 'copy',
								size: 'xs'
							});

							$$renderer.push(`<!----></button></div></div> <div class="info-card svelte-1e7d9k3"><div class="info-label">Actual Index</div> <div class="metric-value info svelte-1e7d9k3">${$.escape(calculation.details.actualIndex)}</div></div> <div class="info-card svelte-1e7d9k3"><div class="info-label">Max Index</div> <div class="metric-value svelte-1e7d9k3">${$.escape(calculation.details.maxIndex)}</div></div></div></div></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
					} else {
						$$renderer.push(`<!--[-1--><div class="error-message svelte-1e7d9k3">`);
						Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
						$$renderer.push(`<!----> <span class="svelte-1e7d9k3">${$.escape(calculation.error)}</span></div>`);
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]--></div></div></div>`);
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