import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import { generateRandomIPAddresses } from '$lib/utils/random-ip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { useClipboard } from '$lib/composables';
import '../../../styles/diagnostics-pages.scss';

export default function RandomIP($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let inputText = '192.168.1.0/24 x 10\n10.0.0.0-10.0.0.255 5\n172.16.0.0/16 * 3\n2001:db8::/64[15]';
		let defaultCount = 5;
		let unique = true;
		let seed = '';
		let result = null;
		let isLoading = false;
		let selectedExampleIndex = null;
		let _userModified = false;
		const clipboard = useClipboard();

		const examples = [
			{
				input: '192.168.1.0/24 x 5',
				description: 'Generate 5 random IPs from a /24 subnet'
			},

			{
				input: '10.0.0.0-10.0.0.255 * 3\n172.16.0.0/16 [8]',
				description: 'Multiple formats: range and CIDR with different counts'
			},

			{
				input: '2001:db8::/64 # 10\nfe80::/10 x 5',
				description: 'IPv6 networks with various syntax formats'
			},

			{
				input: '192.168.0.0/16 100\n203.0.113.0/24 * 20',
				description: 'Large generation counts from different networks'
			},

			{
				input: '127.0.0.0/8\n::1/128 x 1\n169.254.0.0/16 [10]',
				description: 'Special-use addresses: loopback and link-local'
			},

			{
				input: '198.51.100.0/24 * 15\n198.18.0.0/15 [25]',
				description: 'Test networks for documentation and benchmarking'
			}
		];

		function generateIPs() {
			if (!inputText.trim()) {
				result = null;

				return;
			}

			isLoading = true;

			try {
				const inputs = inputText.split('\n').filter((line) => line.trim());
				const actualSeed = seed.trim() || undefined;

				result = generateRandomIPAddresses(inputs, defaultCount, unique, actualSeed);
			} catch(error) {
				result = {
					generations: [],
					summary: {
						totalNetworks: 0,
						validNetworks: 0,
						invalidNetworks: 0,
						totalIPsGenerated: 0,
						uniqueIPsGenerated: 0
					},
					errors: [error instanceof Error ? error.message : 'Unknown error'],
					allGeneratedIPs: []
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
			let mimeType = 'text/plain';

			if (format === 'csv') {
				const headers = 'Network,Type,Version,Requested,Generated,Seed,Valid,Error';
				const rows = result.generations.map((gen) => `"${gen.network}","${gen.networkType}","IPv${gen.version}","${gen.requestedCount}","${gen.generatedIPs.length}","${gen.seed || ''}","${gen.isValid}","${gen.error || ''}"`);

				content = [headers, ...rows].join('\n');
				filename = `random-ips-${timestamp}.csv`;
				mimeType = 'text/csv';
			} else if (format === 'json') {
				content = JSON.stringify(result, null, 2);
				filename = `random-ips-${timestamp}.json`;
				mimeType = 'application/json';
			} else {
				// Plain text format with just the IPs
				content = result.allGeneratedIPs.join('\n');

				filename = `random-ips-${timestamp}.txt`;
				mimeType = 'text/plain';
			}

			const blob = new Blob([content], { type: mimeType });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');

			a.href = url;
			a.download = filename;
			a.click();
			URL.revokeObjectURL(url);
		}

		function copyAllIPs() {
			if (result && result.allGeneratedIPs.length > 0) {
				clipboard.copy(result.allGeneratedIPs.join('\n'), 'all-ips');
			}
		}

		function generateNewSeed() {
			seed = Math.random().toString(36).substring(2, 15);
		}

		function selectExample(index) {
			const example = examples[index];

			if (example) {
				inputText = example.input;
				selectedExampleIndex = index;
				_userModified = false;
			}
		}

		function handleInputChange() {
			_userModified = true;
			selectedExampleIndex = null;
		}

		$$renderer.push(`<div class="tool-container"><div class="tool-header"><h1>Random IP Generator</h1> <p>Generate random IP addresses from networks and ranges with uniqueness control and seeded randomness</p></div> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary">`);
		Icon($$renderer, { name: 'chevron-right', size: 'xs' });
		$$renderer.push(`<!----> <h4>Quick Examples</h4></summary> <div class="examples-grid"><!--[-->`);

		const each_array = $.ensure_array_like(
			// Auto-generate when inputs change
			examples
		);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let example = each_array[index];

			$$renderer.push(`<button${$.attr_class('example-card', void 0, { 'selected': selectedExampleIndex === index })}><div class="example-input">${$.escape(example.input.split('\n')[0])}${$.escape(example.input.includes('\n') ? '...' : '')}</div> <div class="example-description">${$.escape(example.description)}</div></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="card"><h3>Network Configuration</h3> <div class="form-row svelte-jhsjpm"><div class="textarea-group svelte-jhsjpm"><div class="form-group svelte-jhsjpm"><label for="inputs" class="svelte-jhsjpm">Networks and Counts</label> <textarea id="inputs" placeholder="192.168.1.0/24 x 10
10.0.0.0-10.0.0.255 5
172.16.0.0/16 * 3
2001:db8::/64[15]" rows="6" class="svelte-jhsjpm">`);

		const $$body = $.escape(inputText);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea> <div class="input-help svelte-jhsjpm">Formats: network x count, network * count, network count, network#count, network[count]</div></div></div> <div class="options-group svelte-jhsjpm"><div class="option-card svelte-jhsjpm"><label for="default-count" class="svelte-jhsjpm">Default Count</label> <input id="default-count" type="number"${$.attr('value', defaultCount)} min="1" max="1000" placeholder="5" class="svelte-jhsjpm"/></div> <div class="checkbox-group"><label class="checkbox-label"><input type="checkbox"${$.attr('checked', unique, true)}/> <span class="checkmark"></span> Unique IPs Only</label></div> <div class="option-card svelte-jhsjpm"><label for="seed" class="svelte-jhsjpm">Random Seed</label> <div class="seed-input svelte-jhsjpm"><input id="seed" type="text"${$.attr('value', seed)} placeholder="Optional seed for reproducible results" class="svelte-jhsjpm"/> <button type="button" class="svelte-jhsjpm">`);
		Icon($$renderer, { name: 'refresh', size: 'sm' });
		$$renderer.push(`<!----></button></div></div></div></div></div> `);

		if (isLoading) {
			$$renderer.push(`<!--[0--><div class="loading">`);
			Icon($$renderer, { name: 'loader' });
			$$renderer.push(`<!----> Generating random IPs...</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (result) {
			$$renderer.push(`<!--[0--><div class="results-container svelte-jhsjpm">`);

			if (result.errors.length > 0) {
				$$renderer.push(`<!--[0--><div class="card error-card svelte-jhsjpm"><div class="card-header row"><h3>`);
				Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
				$$renderer.push(`<!----> Errors</h3></div> <div class="card-content"><!--[-->`);

				const each_array_1 = $.ensure_array_like(result.errors);

				for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
					let error = each_array_1[index];

					$$renderer.push(`<div class="error-message svelte-jhsjpm">`);
					Icon($$renderer, { name: 'alert-circle', size: 'sm' });
					$$renderer.push(`<!----> <span class="svelte-jhsjpm">${$.escape(error)}</span></div>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (result.generations.length > 0) {
				$$renderer.push(`<!--[0--><div class="card summary-card svelte-jhsjpm"><div class="card-header row"><h3>Generation Summary</h3> <button${$.attr_class('copy-btn', void 0, { 'copied': clipboard.isCopied('summary') })}>`);

				Icon($$renderer, {
					name: clipboard.isCopied('summary') ? 'check' : 'copy',
					size: 'xs'
				});

				$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('summary') ? 'Copied!' : 'Copy')}</button></div> <div class="card-content"><div class="summary-stats svelte-jhsjpm"><div class="info-card"><div class="info-label">Total Networks</div> <div class="metric-value">${$.escape(result.summary.totalNetworks)}</div></div> <div class="info-card"><div class="info-label">Valid</div> <div class="metric-value success">${$.escape(result.summary.validNetworks)}</div></div> <div class="info-card"><div class="info-label">Invalid</div> <div class="metric-value error">${$.escape(result.summary.invalidNetworks)}</div></div> <div class="info-card"><div class="info-label">Total IPs</div> <div class="metric-value info">${$.escape(result.summary.totalIPsGenerated)}</div></div> <div class="info-card"><div class="info-label">Unique IPs</div> <div class="metric-value">${$.escape(result.summary.uniqueIPsGenerated)}</div></div></div></div></div> <div class="card all-ips-card svelte-jhsjpm"><div class="card-header row"><h3>All Generated IPs (${$.escape(result.allGeneratedIPs.length)})</h3> <div class="export-buttons svelte-jhsjpm"><button${$.attr_class('copy-btn svelte-jhsjpm', void 0, { 'copied': clipboard.isCopied('all-ips') })}>`);

				Icon($$renderer, {
					name: clipboard.isCopied('all-ips') ? 'check' : 'copy',
					size: 'xs'
				});

				$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('all-ips') ? 'Copied!' : 'Copy All')}</button> <button class="svelte-jhsjpm">`);
				Icon($$renderer, { name: 'download', size: 'xs' });
				$$renderer.push(`<!----> TXT</button> <button class="svelte-jhsjpm">`);
				Icon($$renderer, { name: 'csv-file', size: 'xs' });
				$$renderer.push(`<!----> CSV</button> <button class="svelte-jhsjpm">`);
				Icon($$renderer, { name: 'json-file', size: 'xs' });
				$$renderer.push(`<!----> JSON</button></div></div> <div class="card-content">`);

				if (result.allGeneratedIPs.length > 0) {
					$$renderer.push(`<!--[0--><div class="all-ips-list svelte-jhsjpm"><!--[-->`);

					const each_array_2 = $.ensure_array_like(result.allGeneratedIPs);

					for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
						let ip = each_array_2[index];

						$$renderer.push(`<button type="button"${$.attr_class('ip-tag svelte-jhsjpm', void 0, { 'copied': clipboard.isCopied(`ip-${index}`) })}>${$.escape(ip)} `);

						Icon($$renderer, {
							name: clipboard.isCopied(`ip-${index}`) ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----></button>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div> <div class="generations"><h3>Network Generations</h3> <div class="generations-list svelte-jhsjpm"><!--[-->`);

				const each_array_3 = $.ensure_array_like(result.generations);

				for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
					let generation = each_array_3[index];

					$$renderer.push(`<div${$.attr_class('generation-card svelte-jhsjpm', void 0, { 'valid': generation.isValid, 'invalid': !generation.isValid })}><div class="card-header row"><div class="network-info"><span class="network-text">${$.escape(generation.network)}</span> <div class="network-meta"><span class="network-type">${$.escape(generation.networkType.toUpperCase())}</span> <span class="ip-version">IPv${$.escape(generation.version)}</span></div></div> <div class="status svelte-jhsjpm">`);

					if (generation.isValid) {
						$$renderer.push('<!--[0-->');
						Icon($$renderer, { name: 'check-circle' });
					} else {
						$$renderer.push('<!--[-1-->');
						Icon($$renderer, { name: 'x-circle' });
					}

					$$renderer.push(`<!--]--></div></div> `);

					if (generation.isValid) {
						$$renderer.push(`<!--[0--><div class="generation-details svelte-jhsjpm"><div class="generation-info svelte-jhsjpm"><div class="info-grid svelte-jhsjpm"><div class="info-item"><span class="info-label">Requested:</span> <span class="info-value">${$.escape(generation.requestedCount)}</span></div> <div class="info-item"><span class="info-label">Generated:</span> <span class="info-value">${$.escape(generation.generatedIPs.length)}</span></div> <div class="info-item"><span class="info-label">Unique:</span> <span class="info-value">${$.escape(generation.uniqueIPs ? 'Yes' : 'No')}</span></div> `);

						if (generation.seed) {
							$$renderer.push(`<!--[0--><div class="info-item"><span class="info-label">Seed:</span> <button type="button" class="code-button info-code" title="Click to copy">${$.escape(generation.seed)}</button></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div></div> `);

						if (generation.networkDetails) {
							$$renderer.push(`<!--[0--><div class="network-details"><h4>Network Range</h4> <div class="range-info"><div class="range-item"><span class="range-label">Start:</span> <button type="button" class="code-button range-code" title="Click to copy">${$.escape(generation.networkDetails.start)}</button></div> <div class="range-item"><span class="range-label">End:</span> <button type="button" class="code-button range-code" title="Click to copy">${$.escape(generation.networkDetails.end)}</button></div> <div class="range-item"><span class="range-label">Total:</span> <span class="range-value">${$.escape(generation.networkDetails.totalAddresses)}</span></div></div></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (generation.generatedIPs.length > 0) {
							$$renderer.push(`<!--[0--><div class="generated-ips svelte-jhsjpm"><div class="details-header svelte-jhsjpm"><h4 class="svelte-jhsjpm">Generated IPs (${$.escape(generation.generatedIPs.length)})</h4></div> <div class="ips-list svelte-jhsjpm"><!--[-->`);

							const each_array_4 = $.ensure_array_like(generation.generatedIPs);

							for (let ipIndex = 0, $$length = each_array_4.length; ipIndex < $$length; ipIndex++) {
								let ip = each_array_4[ipIndex];

								$$renderer.push(`<button type="button"${$.attr_class('ip-tag svelte-jhsjpm', void 0, { 'copied': clipboard.isCopied(`gen-${index}-ip-${ipIndex}`) })}>${$.escape(ip)} `);

								Icon($$renderer, {
									name: clipboard.isCopied(`gen-${index}-ip-${ipIndex}`) ? 'check' : 'copy',
									size: 'xs'
								});

								$$renderer.push(`<!----></button>`);
							}

							$$renderer.push(`<!--]--></div></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
					} else {
						$$renderer.push(`<!--[-1--><div class="error-message svelte-jhsjpm">`);
						Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
						$$renderer.push(`<!----> <span class="svelte-jhsjpm">${$.escape(generation.error)}</span></div>`);
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