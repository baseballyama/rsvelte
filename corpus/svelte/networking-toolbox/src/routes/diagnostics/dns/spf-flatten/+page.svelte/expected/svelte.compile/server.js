import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import '../../../../styles/diagnostics-pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let domainName = 'example.com';
		let loading = false;
		let results = null;
		let error = null;
		let selectedExampleIndex = null;
		let copySuccess = false;

		const examples = [
			{ domain: 'github.com', description: 'GitHub SPF' },
			{ domain: 'google.com', description: 'Google SPF' },
			{ domain: 'microsoft.com', description: 'Microsoft SPF' }
		];

		async function flattenSPF() {
			if (!domainName?.trim()) {
				error = 'Please enter a domain name';

				return;
			}

			loading = true;
			error = null;
			results = null;

			try {
				const response = await fetch('/api/internal/diagnostics/dns', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						action: 'spf-flatten',
						domain: domainName.trim().toLowerCase()
					})
				});

				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.message || 'Failed to flatten SPF');
				}

				results = data;
			} catch(err) {
				error = err instanceof Error ? err.message : 'An error occurred';
			} finally {
				loading = false;
			}
		}

		function loadExample(example, index) {
			domainName = example.domain;
			selectedExampleIndex = index;
			flattenSPF();
		}

		function clearExampleSelection() {
			selectedExampleIndex = null;
		}

		async function copyFlattened() {
			if (results?.flattened) {
				await navigator.clipboard.writeText(results.flattened);
				copySuccess = true;

				setTimeout(
					() => {
						copySuccess = false;
					},
					500
				);
			}
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h1>SPF Flatten</h1> <p>Resolve include:/redirect= and output a flattened SPF with lookup counts</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary">`);
		Icon($$renderer, { name: 'chevron-right', size: 'xs' });
		$$renderer.push(`<!----> <h4>Quick Examples</h4></summary> <div class="examples-grid"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let example = each_array[i];

			$$renderer.push(`<button${$.attr_class('example-card', void 0, { 'selected': selectedExampleIndex === i })}><h5>${$.escape(example.domain)}</h5> <p>${$.escape(example.description)}</p></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="card input-card"><div class="card-header"><h3>SPF Flatten Configuration</h3></div> <div class="card-content"><div class="form-group"><label for="domain">Domain Name</label> <div class="input-flex-container"><input id="domain" type="text"${$.attr('value', domainName)} placeholder="example.com"${$.attr('disabled', loading, true)}/> <button${$.attr('disabled', loading, true)} class="primary">`);

		if (loading) {
			$$renderer.push('<!--[0-->');
			Icon($$renderer, { name: 'loader', size: 'sm', animate: 'spin' });
			$$renderer.push(`<!----> Flattening...`);
		} else {
			$$renderer.push('<!--[-1-->');
			Icon($$renderer, { name: 'search', size: 'sm' });
			$$renderer.push(`<!----> Flatten SPF`);
		}

		$$renderer.push(`<!--]--></button></div></div></div></div> `);

		if (error) {
			$$renderer.push(`<!--[0--><div class="card error-card"><div class="card-content"><div class="error-content">`);
			Icon($$renderer, { name: 'alert-triangle', size: 'md' });
			$$renderer.push(`<!----> <div><strong>SPF Flatten Failed</strong> <p>${$.escape(error)}</p></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (loading) {
			$$renderer.push(`<!--[0--><div class="card"><div class="card-content"><div class="loading-state">`);
			Icon($$renderer, { name: 'loader', size: 'lg', animate: 'spin' });
			$$renderer.push(`<!----> <div class="loading-text"><h3>Flattening SPF Record</h3> <p>Resolving SPF includes and redirects to create a flattened record...</p></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (results) {
			$$renderer.push(`<!--[0--><div class="card results-card"><div class="card-header"><h3>SPF Flatten Results</h3></div> <div class="card-content"><div class="results-section svelte-bvqwjc"><div class="card original-section svelte-bvqwjc"><div class="card-header"><h3>Original SPF Record</h3></div> <div class="card-content"><div class="spf-record original svelte-bvqwjc"><code class="svelte-bvqwjc">${$.escape(results.original)}</code></div></div></div> <div class="card flattened-section svelte-bvqwjc"><div class="card-header"><div class="section-header svelte-bvqwjc"><h3 class="svelte-bvqwjc">Flattened SPF Record</h3> <button${$.attr_class('copy-button svelte-bvqwjc', void 0, { 'success': copySuccess })}>`);
			Icon($$renderer, { name: copySuccess ? 'check' : 'copy', size: 'sm' });
			$$renderer.push(`<!----> ${$.escape(copySuccess ? 'Copied!' : 'Copy')}</button></div></div> <div class="card-content"><div class="spf-record flattened svelte-bvqwjc"><code class="svelte-bvqwjc">${$.escape(results.flattened)}</code></div></div></div> `);

			if (results.expansions && results.expansions.length > 0) {
				$$renderer.push(`<!--[0--><div class="card expansion-section svelte-bvqwjc"><div class="card-header"><h3>Expansion Tree</h3></div> <div class="card-content"><div class="tree-container svelte-bvqwjc"><!--[-->`);

				const each_array_1 = $.ensure_array_like(results.expansions);

				for (let _i = 0, $$length = each_array_1.length; _i < $$length; _i++) {
					let expansion = each_array_1[_i];

					$$renderer.push(`<div class="expansion-item svelte-bvqwjc"${$.attr_style(`margin-left: ${$.stringify(expansion.depth * 1.5)}rem`)}><div class="expansion-header svelte-bvqwjc"><span class="expansion-type svelte-bvqwjc">${$.escape(expansion.type)}</span> <span class="expansion-value svelte-bvqwjc">${$.escape(expansion.value)}</span> <span class="lookup-count svelte-bvqwjc">${$.escape(expansion.lookups)}</span></div> `);

					if (expansion.resolved) {
						$$renderer.push(`<!--[0--><div class="resolved-items svelte-bvqwjc"><!--[-->`);

						const each_array_2 = $.ensure_array_like(expansion.resolved);

						for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
							let item = each_array_2[$$index_1];

							$$renderer.push(`<span class="resolved-item svelte-bvqwjc">${$.escape(item)}</span>`);
						}

						$$renderer.push(`<!--]--></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]--></div></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="card stats-section svelte-bvqwjc"><div class="card-header"><h3>Statistics</h3></div> <div class="card-content"><div class="stats-grid"><div class="stat-card"><div class="stat-label">DNS Lookups</div> <div${$.attr_class('stat-value svelte-bvqwjc', void 0, {
				'warning': results.stats.dnsLookups > 7,
				'error': results.stats.dnsLookups > 10
			})}>`);

			Icon($$renderer, {
				name: results.stats.dnsLookups > 10
					? 'alert-circle'
					: results.stats.dnsLookups > 7 ? 'alert-triangle' : 'check-circle',
				size: 'sm'
			});

			$$renderer.push(`<!----> ${$.escape(results.stats.dnsLookups)}/10</div> `);

			if (results.stats.dnsLookups > 10) {
				$$renderer.push(`<!--[0--><div class="stat-warning svelte-bvqwjc">Exceeds RFC limit!</div>`);
			} else if (results.stats.dnsLookups > 7) {
				$$renderer.push(`<!--[1--><div class="stat-warning svelte-bvqwjc">Close to limit</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <div class="stat-card"><div class="stat-label">IPv4 Addresses</div> <div class="stat-value svelte-bvqwjc">${$.escape(results.stats.ipv4Count)}</div></div> <div class="stat-card"><div class="stat-label">IPv6 Addresses</div> <div class="stat-value svelte-bvqwjc">${$.escape(results.stats.ipv6Count)}</div></div> <div class="stat-card"><div class="stat-label">Max Include Depth</div> <div class="stat-value svelte-bvqwjc">${$.escape(results.stats.includeDepth)}</div></div> <div class="stat-card"><div class="stat-label">Record Length</div> <div${$.attr_class('stat-value svelte-bvqwjc', void 0, { 'warning': results.stats.recordLength > 400 })}>`);

			Icon($$renderer, {
				name: results.stats.recordLength > 450 ? 'alert-triangle' : 'check-circle',
				size: 'sm'
			});

			$$renderer.push(`<!----> ${$.escape(results.stats.recordLength)}</div> `);

			if (results.stats.recordLength > 450) {
				$$renderer.push(`<!--[0--><div class="stat-warning svelte-bvqwjc">May need splitting</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <div class="stat-card"><div class="stat-label">Total Mechanisms</div> <div class="stat-value svelte-bvqwjc">${$.escape(results.stats.mechanisms)}</div></div></div></div></div> `);

			if (results.warnings && results.warnings.length > 0) {
				$$renderer.push(`<!--[0--><div class="card warnings-section svelte-bvqwjc"><div class="card-header"><h3>Warnings</h3></div> <div class="card-content"><div class="warnings-list svelte-bvqwjc"><!--[-->`);

				const each_array_3 = $.ensure_array_like(results.warnings);

				for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
					let warning = each_array_3[$$index_3];

					$$renderer.push(`<div class="warning-item svelte-bvqwjc">`);
					Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
					$$renderer.push(`<!----> <span class="svelte-bvqwjc">${$.escape(warning)}</span></div>`);
				}

				$$renderer.push(`<!--]--></div></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}