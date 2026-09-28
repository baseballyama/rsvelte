import * as $ from 'svelte/internal/server';
import { checkCIDRAlignment } from '$lib/utils/cidr-alignment.js';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import '../../../styles/diagnostics-pages.scss';

export default function CIDRAlignment($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let inputText = '192.168.1.0/24\n10.0.0.0-10.0.0.255\n172.16.1.5';
		let targetPrefix = 24;
		let result = null;
		let isLoading = false;
		let copiedStates = {};
		let _selectedExample = null;
		let selectedExampleIndex = null;
		let _userModified = false;
		let validationErrors = [];

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
			if (isNaN(targetPrefix) || targetPrefix === null || targetPrefix === undefined) {
				errors.push('Target prefix length must be a valid number');

				return errors;
			}

			// Check if target prefix is within basic bounds
			if (targetPrefix < 0 || targetPrefix > 128) {
				errors.push('Target prefix length must be between 0 and 128');

				return errors;
			}

			// Check if inputs exist to validate against
			if (!inputText.trim()) {
				return errors;
			}

			// Analyze input types to determine valid prefix ranges
			const inputs = inputText.split('\n').filter((line) => line.trim());

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
			if (hasIPv4 && !hasIPv6 && targetPrefix > 32) {
				errors.push('Target prefix length cannot exceed 32 for IPv4 addresses');
			}

			if (hasIPv6 && targetPrefix > 128) {
				errors.push('Target prefix length cannot exceed 128 for IPv6 addresses');
			}

			// Additional practical validation
			if (targetPrefix === 0) {
				errors.push('Target prefix length of 0 is not practical for alignment checking');
			}

			return errors;
		}

		function checkAlignment() {
			// Reset validation errors
			validationErrors = [];

			if (!inputText.trim()) {
				result = null;

				return;
			}

			// Validate target prefix first
			const prefixErrors = validateTargetPrefix();

			if (prefixErrors.length > 0) {
				validationErrors = prefixErrors;

				result = {
					checks: [],
					summary: {
						totalInputs: 0,
						alignedInputs: 0,
						misalignedInputs: 0,
						alignmentRate: 0
					},
					errors: prefixErrors
				};

				return;
			}

			isLoading = true;

			try {
				const inputs = inputText.split('\n').filter((line) => line.trim());

				result = checkCIDRAlignment(inputs, targetPrefix);
				validationErrors = []; // Clear validation errors on success
			} catch(error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error';

				validationErrors = [errorMessage];

				result = {
					checks: [],
					summary: {
						totalInputs: 0,
						alignedInputs: 0,
						misalignedInputs: 0,
						alignmentRate: 0
					},
					errors: [errorMessage]
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
				const headers = 'Input,Type,Is Aligned,Target Prefix,Aligned CIDR,Reason';
				const rows = result.checks.map((check) => `"${check.input}","${check.type}","${check.isAligned}","${check.targetPrefix}","${check.alignedCIDR || ''}","${check.reason || ''}"`);

				content = [headers, ...rows].join('\n');
				filename = `cidr-alignment-${timestamp}.csv`;
			} else {
				content = JSON.stringify(result, null, 2);
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
			inputText = example.input;
			targetPrefix = example.targetPrefix;
			_selectedExample = example.label;
			selectedExampleIndex = index;
			_userModified = false;
		}

		function handleInputChange() {
			_userModified = true;
			_selectedExample = null;
			selectedExampleIndex = null;
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h2>CIDR Boundary Alignment</h2> <p>Check if IP addresses, ranges, and CIDR blocks align to specific prefix boundaries</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary">`);
		Icon($$renderer, { name: 'chevron-right', size: 'xs' });
		$$renderer.push(`<!----> <h4>Quick Examples</h4></summary> <div class="examples-grid"><!--[-->`);

		const each_array = $.ensure_array_like(
			// Auto-check when inputs change
			examples
		);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let example = each_array[i];

			$$renderer.push(`<button${$.attr_class('example-card', void 0, { 'selected': selectedExampleIndex === i })}><div class="example-label">${$.escape(example.label)}</div> <div class="example-preview">Target: /${$.escape(example.targetPrefix)}</div></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="input-section svelte-fznzbj"><div class="inputs-card svelte-fznzbj"><h3 class="svelte-fznzbj">Network Inputs</h3> <div class="input-group svelte-fznzbj"><label for="inputs" class="svelte-fznzbj">IP Addresses, CIDRs, or Ranges</label> <textarea id="inputs" placeholder="192.168.1.0/24
10.0.0.0-10.0.0.255
172.16.1.5
2001:db8::/32" rows="8" class="svelte-fznzbj">`);

		const $$body = $.escape(inputText);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea> <div class="input-help svelte-fznzbj">Enter one per line: CIDR blocks (192.168.1.0/24), IP ranges (10.0.0.1-10.0.0.100), or single IPs (172.16.1.5)</div></div> <div class="input-group svelte-fznzbj"><label for="prefix" class="svelte-fznzbj">Target Prefix Length</label> <input id="prefix" type="number"${$.attr('value', targetPrefix)} min="0" max="128" placeholder="24"${$.attr_class('svelte-fznzbj', void 0, { 'error': validationErrors.length > 0 })}/> <div class="input-help svelte-fznzbj">Prefix length to check alignment against (0-32 for IPv4, 0-128 for IPv6)</div> `);

		if (validationErrors.length > 0) {
			$$renderer.push(`<!--[0--><div class="validation-errors svelte-fznzbj"><!--[-->`);

			const each_array_1 = $.ensure_array_like(validationErrors);

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let error = each_array_1[$$index_1];

				$$renderer.push(`<div class="validation-error svelte-fznzbj">`);
				Icon($$renderer, { name: 'alert-circle', size: 'xs' });
				$$renderer.push(`<!----> ${$.escape(error)}</div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div></div> `);

		if (isLoading) {
			$$renderer.push(`<!--[0--><div class="loading svelte-fznzbj">`);
			Icon($$renderer, { name: 'loader' });
			$$renderer.push(`<!----> Checking alignment...</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (result) {
			$$renderer.push(`<!--[0--><div class="results svelte-fznzbj">`);

			if (result.errors.length > 0) {
				$$renderer.push(`<!--[0--><div class="errors svelte-fznzbj"><h3 class="svelte-fznzbj">`);
				Icon($$renderer, { name: 'alert-triangle' });
				$$renderer.push(`<!----> Errors</h3> <!--[-->`);

				const each_array_2 = $.ensure_array_like(result.errors);

				for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
					let error = each_array_2[$$index_2];

					$$renderer.push(`<div class="error-item svelte-fznzbj">${$.escape(error)}</div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (result.checks.length > 0) {
				$$renderer.push(`<!--[0--><div class="summary svelte-fznzbj"><h3 class="svelte-fznzbj">Alignment Summary</h3> <div class="summary-stats svelte-fznzbj"><div class="stat svelte-fznzbj"><span class="stat-value svelte-fznzbj">${$.escape(result.summary.totalInputs)}</span> <span class="stat-label svelte-fznzbj">Total Inputs</span></div> <div class="stat aligned svelte-fznzbj"><span class="stat-value svelte-fznzbj">${$.escape(result.summary.alignedInputs)}</span> <span class="stat-label svelte-fznzbj">Aligned</span></div> <div class="stat misaligned svelte-fznzbj"><span class="stat-value svelte-fznzbj">${$.escape(result.summary.misalignedInputs)}</span> <span class="stat-label svelte-fznzbj">Misaligned</span></div> <div class="stat svelte-fznzbj"><span class="stat-value svelte-fznzbj">${$.escape(result.summary.alignmentRate)}%</span> <span class="stat-label svelte-fznzbj">Alignment Rate</span></div></div></div> <div class="checks svelte-fznzbj"><div class="checks-header svelte-fznzbj"><h3 class="svelte-fznzbj">Alignment Checks</h3> <div class="export-buttons svelte-fznzbj"><button class="svelte-fznzbj">`);
				Icon($$renderer, { name: 'csv-file' });
				$$renderer.push(`<!----> Export CSV</button> <button class="svelte-fznzbj">`);
				Icon($$renderer, { name: 'json-file' });
				$$renderer.push(`<!----> Export JSON</button></div></div> <div class="checks-list svelte-fznzbj"><!--[-->`);

				const each_array_3 = $.ensure_array_like(result.checks);

				for (let $$index_5 = 0, $$length = each_array_3.length; $$index_5 < $$length; $$index_5++) {
					let check = each_array_3[$$index_5];

					$$renderer.push(`<div${$.attr_class('check-item svelte-fznzbj', void 0, { 'aligned': check.isAligned, 'misaligned': !check.isAligned })}><div class="check-header svelte-fznzbj"><div class="check-input svelte-fznzbj"><span class="input-text svelte-fznzbj">${$.escape(check.input)}</span> <span class="input-type svelte-fznzbj">${$.escape(check.type.toUpperCase())}</span></div> <div class="check-status svelte-fznzbj">`);

					if (check.isAligned) {
						$$renderer.push('<!--[0-->');
						Icon($$renderer, { name: 'check-circle', size: 'sm' });
						$$renderer.push(`<!----> <span class="status-text svelte-fznzbj">Aligned to /${$.escape(check.targetPrefix)}</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
						Icon($$renderer, { name: 'x-circle', size: 'sm' });
						$$renderer.push(`<!----> <span class="status-text svelte-fznzbj">Not aligned to /${$.escape(check.targetPrefix)}</span>`);
					}

					$$renderer.push(`<!--]--></div></div> `);

					if (check.alignedCIDR) {
						$$renderer.push(`<!--[0--><div class="aligned-cidr svelte-fznzbj"><span class="aligned-label svelte-fznzbj">Aligned CIDR:</span> <div class="cidr-with-copy svelte-fznzbj"><code class="aligned-code svelte-fznzbj">${$.escape(check.alignedCIDR)}</code> <button type="button"${$.attr_class(`copy-button ${copiedStates[`cidr-${check.input}`] ? 'copied' : ''}`, 'svelte-fznzbj')}>`);

						Icon($$renderer, {
							name: copiedStates[`cidr-${check.input}`] ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----></button></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (check.reason) {
						$$renderer.push(`<!--[0--><div class="reason svelte-fznzbj"><span class="reason-label svelte-fznzbj">Reason:</span> <span class="reason-text svelte-fznzbj">${$.escape(check.reason)}</span></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (check.suggestions.length > 0) {
						$$renderer.push(`<!--[0--><div class="suggestions svelte-fznzbj"><span class="suggestions-label svelte-fznzbj">Suggestions:</span> <!--[-->`);

						const each_array_4 = $.ensure_array_like(check.suggestions);

						for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
							let suggestion = each_array_4[$$index_4];

							$$renderer.push(`<div class="suggestion svelte-fznzbj"><div class="suggestion-type svelte-fznzbj">`);

							if (suggestion.type === 'larger') {
								$$renderer.push('<!--[0-->');
								Icon($$renderer, { name: 'zoom-out', size: 'sm' });
							} else if (suggestion.type === 'smaller') {
								$$renderer.push('<!--[1-->');
								Icon($$renderer, { name: 'zoom-in', size: 'sm' });
							} else {
								$$renderer.push('<!--[-1-->');
								Icon($$renderer, { name: 'scissors', size: 'sm' });
							}

							$$renderer.push(`<!--]--> <span class="suggestion-description svelte-fznzbj">${$.escape(suggestion.description)}</span></div> <div class="suggestion-cidrs svelte-fznzbj"><!--[-->`);

							const each_array_5 = $.ensure_array_like(suggestion.cidrs);

							for (let idx = 0, $$length = each_array_5.length; idx < $$length; idx++) {
								let cidr = each_array_5[idx];

								$$renderer.push(`<div class="suggestion-cidr svelte-fznzbj"><code class="suggestion-code svelte-fznzbj">${$.escape(cidr)}</code> <button type="button"${$.attr_class(`copy-button ${copiedStates[`suggestion-${check.input}-${idx}`] ? 'copied' : ''}`, 'svelte-fznzbj')}>`);

								Icon($$renderer, {
									name: copiedStates[`suggestion-${check.input}-${idx}`] ? 'check' : 'copy',
									size: 'xs'
								});

								$$renderer.push(`<!----></button></div>`);
							}

							$$renderer.push(`<!--]--></div> `);

							if (suggestion.efficiency) {
								$$renderer.push(`<!--[0--><div class="suggestion-efficiency svelte-fznzbj">Efficiency: ${$.escape(suggestion.efficiency)}%</div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div>`);
						}

						$$renderer.push(`<!--]--></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
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