import * as $ from 'svelte/internal/server';
import { normalizeIPv6Addresses } from '$lib/utils/ipv6-normalize.js';
import Icon from '$lib/components/global/Icon.svelte';
import { useClipboard } from '$lib/composables';

export default function IPv6Normalize($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let inputText = '2001:0db8:0000:0000:0000:ff00:0042:8329\n2001:db8:0:0:1:0:0:1\n2001:0db8:0001:0000:0000:0ab9:C0A8:0102\n2001:db8::1\nfe80::1%eth0';
		let result = null;
		let isLoading = false;
		const clipboard = useClipboard();

		function normalizeAddresses() {
			if (!inputText.trim()) {
				result = null;

				return;
			}

			isLoading = true;

			try {
				const inputs = inputText.split('\n').filter((line) => line.trim());

				result = normalizeIPv6Addresses(inputs);
			} catch(error) {
				result = {
					normalizations: [],
					summary: {
						totalInputs: 0,
						validInputs: 0,
						invalidInputs: 0,
						alreadyNormalizedInputs: 0
					},
					errors: [error instanceof Error ? error.message : 'Unknown error']
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
				const headers = 'Input,Normalized,Valid,Compression Applied,Leading Zeros Removed,Lowercase Applied,Error';
				const rows = result.normalizations.map((norm) => `"${norm.input}","${norm.normalized}","${norm.isValid}","${norm.compressionApplied}","${norm.leadingZerosRemoved}","${norm.lowercaseApplied}","${norm.error || ''}"`);

				content = [headers, ...rows].join('\n');
				filename = `ipv6-normalized-${timestamp}.csv`;
				mimeType = 'text/csv';
			} else if (format === 'json') {
				content = JSON.stringify(result, null, 2);
				filename = `ipv6-normalized-${timestamp}.json`;
				mimeType = 'application/json';
			} else {
				// Plain text format with just normalized addresses
				content = result.normalizations.filter((n) => n.isValid).map((n) => n.normalized).join('\n');

				filename = `ipv6-normalized-${timestamp}.txt`;
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

		function copyAllNormalized() {
			if (result) {
				const normalized = result.normalizations.filter((n) => n.isValid).map((n) => n.normalized).join('\n');

				clipboard.copy(normalized, 'copy-all');
			}
		}

		$$renderer.push(`<div class="card svelte-1q1k7x8"><header class="card-header"><h2 class="svelte-1q1k7x8">IPv6 Normalizer</h2> <p class="svelte-1q1k7x8">Normalize IPv6 addresses to RFC 5952 canonical form with lowercase, zero compression, and leading zero removal</p></header> <div class="input-section svelte-1q1k7x8"><div class="input-group svelte-1q1k7x8"><label for="inputs" class="svelte-1q1k7x8">IPv6 Addresses</label> <textarea id="inputs" placeholder="2001:0db8:0000:0000:0000:ff00:0042:8329
2001:db8:0:0:1:0:0:1
2001:0db8:0001:0000:0000:0ab9:C0A8:0102
fe80::1%eth0" rows="6" class="svelte-1q1k7x8">`);

		const $$body = $.escape(
			// Auto-normalize when inputs change
			inputText
		);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea> <div class="input-help svelte-1q1k7x8">Enter one IPv6 address per line. Supports zone identifiers (%) and IPv4-mapped addresses</div></div> <div class="rfc-info svelte-1q1k7x8"><h3 class="svelte-1q1k7x8">RFC 5952 Normalization Rules</h3> <ul class="svelte-1q1k7x8"><li class="svelte-1q1k7x8">Convert hexadecimal to lowercase</li> <li class="svelte-1q1k7x8">Remove leading zeros in each group</li> <li class="svelte-1q1k7x8">Compress longest sequence of consecutive zero groups with ::</li> <li class="svelte-1q1k7x8">Preserve zone identifiers (%)</li> <li class="svelte-1q1k7x8">Support IPv4-mapped IPv6 addresses</li></ul></div></div> `);

		if (isLoading) {
			$$renderer.push(`<!--[0--><div class="loading svelte-1q1k7x8">`);
			Icon($$renderer, { name: 'loader' });
			$$renderer.push(`<!----> Normalizing addresses...</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (result) {
			$$renderer.push(`<!--[0--><div class="results svelte-1q1k7x8">`);

			if (result.errors.length > 0) {
				$$renderer.push(`<!--[0--><div class="errors svelte-1q1k7x8"><h3 class="svelte-1q1k7x8">`);
				Icon($$renderer, { name: 'alert-triangle' });
				$$renderer.push(`<!----> Errors</h3> <!--[-->`);

				const each_array = $.ensure_array_like(result.errors);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let error = each_array[$$index];

					$$renderer.push(`<div class="error-item svelte-1q1k7x8">${$.escape(error)}</div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (result.normalizations.length > 0) {
				$$renderer.push(`<!--[0--><div class="summary svelte-1q1k7x8"><h3 class="svelte-1q1k7x8">Normalization Summary</h3> <div class="summary-stats svelte-1q1k7x8"><div class="stat svelte-1q1k7x8"><span class="stat-value svelte-1q1k7x8">${$.escape(result.summary.totalInputs)}</span> <span class="stat-label svelte-1q1k7x8">Total Inputs</span></div> <div class="stat valid svelte-1q1k7x8"><span class="stat-value svelte-1q1k7x8">${$.escape(result.summary.validInputs)}</span> <span class="stat-label svelte-1q1k7x8">Valid</span></div> <div class="stat invalid svelte-1q1k7x8"><span class="stat-value svelte-1q1k7x8">${$.escape(result.summary.invalidInputs)}</span> <span class="stat-label svelte-1q1k7x8">Invalid</span></div> <div class="stat already-normalized svelte-1q1k7x8"><span class="stat-value svelte-1q1k7x8">${$.escape(result.summary.alreadyNormalizedInputs)}</span> <span class="stat-label svelte-1q1k7x8">Already Normalized</span></div></div></div> <div class="normalized-addresses"><div class="normalized-header svelte-1q1k7x8"><h3 class="svelte-1q1k7x8">Normalized Addresses</h3> <div class="export-buttons svelte-1q1k7x8"><button${$.attr_class('svelte-1q1k7x8', void 0, { 'copied': clipboard.isCopied('copy-all') })}>`);
				Icon($$renderer, { name: clipboard.isCopied('copy-all') ? 'check' : 'copy' });
				$$renderer.push(`<!----> Copy All</button> <button class="svelte-1q1k7x8">`);
				Icon($$renderer, { name: 'download' });
				$$renderer.push(`<!----> Export TXT</button> <button class="svelte-1q1k7x8">`);
				Icon($$renderer, { name: 'csv-file' });
				$$renderer.push(`<!----> Export CSV</button> <button class="svelte-1q1k7x8">`);
				Icon($$renderer, { name: 'json-file' });
				$$renderer.push(`<!----> Export JSON</button></div></div></div> <div class="normalizations"><div class="normalizations-list svelte-1q1k7x8"><!--[-->`);

				const each_array_1 = $.ensure_array_like(result.normalizations);

				for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
					let normalization = each_array_1[index];

					$$renderer.push(`<div${$.attr_class('normalization-card svelte-1q1k7x8', void 0, {
						'valid': normalization.isValid,
						'invalid': !normalization.isValid
					})}><div class="status svelte-1q1k7x8">`);

					if (normalization.isValid) {
						$$renderer.push('<!--[0-->');
						Icon($$renderer, { name: 'check-circle' });
					} else {
						$$renderer.push('<!--[-1-->');
						Icon($$renderer, { name: 'x-circle' });
					}

					$$renderer.push(`<!--]--></div> <div class="card-content svelte-1q1k7x8"><div class="address-info svelte-1q1k7x8"><div class="original-address svelte-1q1k7x8"><span class="address-label svelte-1q1k7x8">Original:</span> <button type="button" class="code-button svelte-1q1k7x8" title="Click to copy">${$.escape(normalization.input)}</button></div> `);

					if (normalization.isValid) {
						$$renderer.push(`<!--[0--><div class="normalized-address svelte-1q1k7x8"><span class="address-label svelte-1q1k7x8">Normalized:</span> <div class="normalized-content svelte-1q1k7x8"><button type="button" class="code-button normalized svelte-1q1k7x8" title="Click to copy">${$.escape(normalization.normalized)}</button> <button type="button"${$.attr_class('copy-button svelte-1q1k7x8', void 0, { 'copied': clipboard.isCopied(`copy-${index}`) })} title="Copy normalized address">`);

						Icon($$renderer, {
							name: clipboard.isCopied(`copy-${index}`) ? 'check' : 'copy',
							size: 'sm'
						});

						$$renderer.push(`<!----></button></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></div> `);

					if (normalization.isValid) {
						$$renderer.push(`<!--[0--><div class="normalization-details svelte-1q1k7x8">`);

						if (normalization.input === normalization.normalized) {
							$$renderer.push(`<!--[0--><div class="already-normalized svelte-1q1k7x8">`);
							Icon($$renderer, { name: 'check' });
							$$renderer.push(`<!----> Address is already in RFC 5952 canonical form</div>`);
						} else {
							$$renderer.push(`<!--[-1--><div class="applied-rules svelte-1q1k7x8"><h4 class="svelte-1q1k7x8">Applied Normalization Rules:</h4> <div class="rules-list svelte-1q1k7x8">`);

							if (normalization.lowercaseApplied) {
								$$renderer.push(`<!--[0--><div class="rule-applied svelte-1q1k7x8">`);
								Icon($$renderer, { name: 'check' });
								$$renderer.push(`<!----> Converted to lowercase</div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (normalization.leadingZerosRemoved) {
								$$renderer.push(`<!--[0--><div class="rule-applied svelte-1q1k7x8">`);
								Icon($$renderer, { name: 'check' });
								$$renderer.push(`<!----> Removed leading zeros</div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (normalization.compressionApplied) {
								$$renderer.push(`<!--[0--><div class="rule-applied svelte-1q1k7x8">`);
								Icon($$renderer, { name: 'check' });
								$$renderer.push(`<!----> Applied zero compression (::)</div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div></div> `);

							if (normalization.steps.length > 0) {
								$$renderer.push(`<!--[0--><div class="normalization-steps svelte-1q1k7x8"><h4 class="svelte-1q1k7x8">Normalization Steps:</h4> <!--[-->`);

								const each_array_2 = $.ensure_array_like(normalization.steps);

								for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
									let step = each_array_2[$$index_1];

									$$renderer.push(`<div class="step svelte-1q1k7x8"><div class="step-header svelte-1q1k7x8"><span class="step-number svelte-1q1k7x8">Step ${$.escape(step.step)}</span> <span class="step-description svelte-1q1k7x8">${$.escape(step.description)}</span></div> <div class="step-transformation svelte-1q1k7x8"><div class="transformation-item svelte-1q1k7x8"><span class="transformation-label svelte-1q1k7x8">Before:</span> <code class="svelte-1q1k7x8">${$.escape(step.before)}</code></div> <div class="transformation-arrow svelte-1q1k7x8">→</div> <div class="transformation-item svelte-1q1k7x8"><span class="transformation-label svelte-1q1k7x8">After:</span> <code class="svelte-1q1k7x8">${$.escape(step.after)}</code></div></div></div>`);
								}

								$$renderer.push(`<!--]--></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}

						$$renderer.push(`<!--]--></div>`);
					} else {
						$$renderer.push(`<!--[-1--><div class="error-message svelte-1q1k7x8">`);
						Icon($$renderer, { name: 'alert-triangle' });
						$$renderer.push(`<!----> ${$.escape(normalization.error)}</div>`);
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