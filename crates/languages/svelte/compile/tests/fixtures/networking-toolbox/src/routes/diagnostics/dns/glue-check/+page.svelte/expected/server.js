import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import '../../../../styles/diagnostics-pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let zoneName = 'example.com';
		let loading = false;
		let results = null;
		let error = null;
		let selectedExampleIndex = null;

		const examples = [
			{
				zone: 'cloudflare.com',
				description: 'Multiple NS with full IPv4+IPv6 glue records'
			},

			{
				zone: 'yahoo.com',
				description: 'Mixed glue status with warning (missing IPv6 on one NS)'
			},

			{
				zone: 'bbc.co.uk',
				description: 'Mixed delegation: internal and external nameservers'
			},

			{
				zone: 'github.com',
				description: 'All external nameservers (NSOne + AWS Route53)'
			},

			{
				zone: 'twitch.tv',
				description: 'Different TLD (.tv) with external AWS nameservers'
			},

			{
				zone: 'apple.com',
				description: 'Clean 4-nameserver setup with complete glue records'
			}
		];

		async function checkGlue() {
			if (!zoneName?.trim()) {
				error = 'Please enter a zone name';

				return;
			}

			loading = true;
			error = null;
			results = null;

			try {
				const response = await fetch('/api/internal/diagnostics/dns', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ action: 'glue-check', zone: zoneName.trim().toLowerCase() })
				});

				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.message || 'Failed to check glue records');
				}

				results = data;
			} catch(err) {
				error = err instanceof Error ? err.message : 'An error occurred';
			} finally {
				loading = false;
			}
		}

		function loadExample(example, index) {
			zoneName = example.zone;
			selectedExampleIndex = index;
			checkGlue();
		}

		function clearExampleSelection() {
			selectedExampleIndex = null;
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h1>DNS Glue Check Tool</h1> <p>Check which NS names require glue records and whether A/AAAA records exist</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary">`);
		Icon($$renderer, { name: 'chevron-right', size: 'xs' });
		$$renderer.push(`<!----> <h4>Quick Examples</h4></summary> <div class="examples-grid"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let example = each_array[i];

			$$renderer.push(`<button${$.attr_class('example-card', void 0, { 'selected': selectedExampleIndex === i })}><h5>${$.escape(example.zone)}</h5> <p>${$.escape(example.description)}</p></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="card input-card"><div class="card-header"><h3>Glue Check Configuration</h3></div> <div class="card-content"><div class="form-group"><label for="zone">Zone Name</label> <div class="input-flex-container"><input id="zone" type="text"${$.attr('value', zoneName)} placeholder="example.com"${$.attr('disabled', loading, true)}/> <button${$.attr('disabled', loading, true)} class="primary">`);

		if (loading) {
			$$renderer.push('<!--[0-->');
			Icon($$renderer, { name: 'loader', size: 'sm', animate: 'spin' });
			$$renderer.push(`<!----> Checking...`);
		} else {
			$$renderer.push('<!--[-1-->');
			Icon($$renderer, { name: 'search', size: 'sm' });
			$$renderer.push(`<!----> Check Glue`);
		}

		$$renderer.push(`<!--]--></button></div></div></div></div> `);

		if (error) {
			$$renderer.push(`<!--[0--><div class="card error-card"><div class="card-content"><div class="error-content">`);
			Icon($$renderer, { name: 'alert-triangle', size: 'md' });
			$$renderer.push(`<!----> <div><strong>Glue Check Failed</strong> <p>${$.escape(error)}</p></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (loading) {
			$$renderer.push(`<!--[0--><div class="card"><div class="card-content"><div class="loading-state">`);
			Icon($$renderer, { name: 'loader', size: 'lg', animate: 'spin' });
			$$renderer.push(`<!----> <div class="loading-text"><h3>Checking Glue Records</h3> <p>Analyzing nameservers and checking for required glue records...</p></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (results) {
			$$renderer.push(`<!--[0--><div class="card results-card"><div class="card-header"><h3>Glue Check Results</h3></div> <div class="card-content"><div class="results-section"><div class="zone-info svelte-1ib8npq"><h2 class="svelte-1ib8npq">Zone: ${$.escape(results.zone)}</h2> `);

			if (results.parent) {
				$$renderer.push(`<!--[0--><p class="parent-zone svelte-1ib8npq">Parent Zone: ${$.escape(results.parent)}</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <div class="nameservers-section"><div class="section-header svelte-1ib8npq">`);
			Icon($$renderer, { name: 'server', size: 'md' });
			$$renderer.push(`<!----> <h3 class="svelte-1ib8npq">Nameservers Analysis</h3></div> <div class="nameserver-grid svelte-1ib8npq"><!--[-->`);

			const each_array_1 = $.ensure_array_like(results.nameservers);

			for (let $$index_3 = 0, $$length = each_array_1.length; $$index_3 < $$length; $$index_3++) {
				let ns = each_array_1[$$index_3];

				$$renderer.push(`<div${$.attr_class('nameserver-card svelte-1ib8npq', void 0, {
					'requires-glue': ns.requiresGlue,
					'has-issues': ns.status === 'error' || ns.status === 'warning'
				})}><div class="ns-header svelte-1ib8npq"><div class="ns-title svelte-1ib8npq">`);

				Icon($$renderer, { name: 'dns', size: 'sm' });
				$$renderer.push(`<!----> <span class="ns-name svelte-1ib8npq">${$.escape(ns.name)}</span></div> <div class="ns-badges svelte-1ib8npq">`);

				if (ns.requiresGlue) {
					$$renderer.push(`<!--[0--><span class="glue-badge glue-required svelte-1ib8npq">`);
					Icon($$renderer, { name: 'link', size: 'xs' });
					$$renderer.push(`<!----> Glue Required</span>`);
				} else {
					$$renderer.push(`<!--[-1--><span class="glue-badge external svelte-1ib8npq">`);
					Icon($$renderer, { name: 'external-link', size: 'xs' });
					$$renderer.push(`<!----> External</span>`);
				}

				$$renderer.push(`<!--]--></div></div> <div class="ns-details svelte-1ib8npq">`);

				if (ns.requiresGlue) {
					$$renderer.push(`<!--[0--><div class="glue-records svelte-1ib8npq"><div class="record-group svelte-1ib8npq"><div class="record-header svelte-1ib8npq">`);
					Icon($$renderer, { name: 'globe', size: 'xs' });
					$$renderer.push(`<!----> <span class="record-label svelte-1ib8npq">A Records</span></div> `);

					if (ns.glue.a && ns.glue.a.length > 0) {
						$$renderer.push(`<!--[0--><div class="record-list svelte-1ib8npq"><!--[-->`);

						const each_array_2 = $.ensure_array_like(ns.glue.a);

						for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
							let ip = each_array_2[$$index_1];

							$$renderer.push(`<span class="ip-address ipv4 svelte-1ib8npq">`);
							Icon($$renderer, { name: 'globe', size: 'xs' });
							$$renderer.push(`<!----> ${$.escape(ip)}</span>`);
						}

						$$renderer.push(`<!--]--></div>`);
					} else {
						$$renderer.push(`<!--[-1--><div class="missing-records svelte-1ib8npq">`);
						Icon($$renderer, { name: 'x-circle', size: 'xs' });
						$$renderer.push(`<!----> <span class="missing svelte-1ib8npq">No A records found</span></div>`);
					}

					$$renderer.push(`<!--]--></div> <div class="record-group svelte-1ib8npq"><div class="record-header svelte-1ib8npq">`);
					Icon($$renderer, { name: 'globe', size: 'xs' });
					$$renderer.push(`<!----> <span class="record-label svelte-1ib8npq">AAAA Records</span></div> `);

					if (ns.glue.aaaa && ns.glue.aaaa.length > 0) {
						$$renderer.push(`<!--[0--><div class="record-list svelte-1ib8npq"><!--[-->`);

						const each_array_3 = $.ensure_array_like(ns.glue.aaaa);

						for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
							let ip = each_array_3[$$index_2];

							$$renderer.push(`<span class="ip-address ipv6 svelte-1ib8npq">`);
							Icon($$renderer, { name: 'globe', size: 'xs' });
							$$renderer.push(`<!----> ${$.escape(ip)}</span>`);
						}

						$$renderer.push(`<!--]--></div>`);
					} else {
						$$renderer.push(`<!--[-1--><div class="missing-records svelte-1ib8npq">`);
						Icon($$renderer, { name: 'x-circle', size: 'xs' });
						$$renderer.push(`<!----> <span class="missing svelte-1ib8npq">No AAAA records found</span></div>`);
					}

					$$renderer.push(`<!--]--></div></div>`);
				} else {
					$$renderer.push(`<!--[-1--><div class="external-ns-info svelte-1ib8npq">`);
					Icon($$renderer, { name: 'info', size: 'sm' });
					$$renderer.push(`<!----> <div><p class="external-ns svelte-1ib8npq">External nameserver</p> <span class="external-explanation svelte-1ib8npq">No glue records required as this nameserver is outside the zone</span></div></div>`);
				}

				$$renderer.push(`<!--]--></div> `);

				if (ns.status) {
					$$renderer.push(`<!--[0--><div class="ns-status-footer svelte-1ib8npq"><div${$.attr_class('status-indicator svelte-1ib8npq', void 0, {
						'error': ns.status === 'error',
						'warning': ns.status === 'warning',
						'success': ns.status === 'ok'
					})}>`);

					if (ns.status === 'error') {
						$$renderer.push('<!--[0-->');
						Icon($$renderer, { name: 'alert-circle', size: 'sm' });
						$$renderer.push(`<!----> <span>Critical: No glue records found</span>`);
					} else if (ns.status === 'warning') {
						$$renderer.push('<!--[1-->');
						Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
						$$renderer.push(`<!----> <span>Warning: Incomplete glue records</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
						Icon($$renderer, { name: 'check-circle', size: 'sm' });
						$$renderer.push(`<!----> <span>Healthy: All glue records present</span>`);
					}

					$$renderer.push(`<!--]--></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			}

			$$renderer.push(`<!--]--></div></div></div></div></div> `);

			if (results.summary) {
				$$renderer.push(`<!--[0--><div class="card"><div class="card-header"><h3>Glue Check Summary</h3></div> <div class="card-content"><div class="stats-grid"><div class="stat-card"><div class="stat-label">Total Nameservers</div> <div class="stat-value">${$.escape(results.summary.total)}</div></div> <div class="stat-card"><div class="stat-label">Requiring Glue</div> <div class="stat-value">${$.escape(results.summary.requiringGlue)}</div></div> <div class="stat-card"><div class="stat-label">With Valid Glue</div> <div${$.attr_class('stat-value', void 0, {
					'success': results.summary.withValidGlue === results.summary.requiringGlue,
					'warning': results.summary.withValidGlue > 0 && results.summary.withValidGlue < results.summary.requiringGlue
				})}>`);

				Icon($$renderer, {
					name: results.summary.withValidGlue === results.summary.requiringGlue
						? 'check-circle'
						: results.summary.withValidGlue > 0 ? 'alert-triangle' : 'x-circle',
					size: 'sm'
				});

				$$renderer.push(`<!----> ${$.escape(results.summary.withValidGlue)}</div></div> <div class="stat-card"><div class="stat-label">Missing Glue</div> <div${$.attr_class('stat-value', void 0, { 'error': results.summary.missingGlue > 0 })}>`);

				Icon($$renderer, {
					name: results.summary.missingGlue > 0 ? 'alert-circle' : 'check-circle',
					size: 'sm'
				});

				$$renderer.push(`<!----> ${$.escape(results.summary.missingGlue)}</div></div></div></div></div> `);

				if (results.summary.issues && results.summary.issues.length > 0) {
					$$renderer.push(`<!--[0--><div class="card"><div class="card-header"><h3>Issues Found</h3></div> <div class="card-content"><div class="issues-section"><ul class="issues-list"><!--[-->`);

					const each_array_4 = $.ensure_array_like(results.summary.issues);

					for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
						let issue = each_array_4[$$index_4];

						$$renderer.push(`<li class="issue-item">`);
						Icon($$renderer, { name: 'alert-circle' });
						$$renderer.push(`<!----> ${$.escape(issue)}</li>`);
					}

					$$renderer.push(`<!--]--></ul></div></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}