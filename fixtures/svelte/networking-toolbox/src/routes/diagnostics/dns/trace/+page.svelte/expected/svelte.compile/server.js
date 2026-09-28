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

		const examples = [
			{
				domain: 'www.cloudflare.com',
				description: 'Cloudflare edge network'
			},

			{
				domain: 'www.google.com',
				description: 'Popular service with CDN'
			},
			{ domain: 'github.com', description: 'GitHub platform trace' },
			{ domain: 'bbc.co.uk', description: 'Multi-level TLD (.co.uk)' },
			{
				domain: 'aws.amazon.com',
				description: 'AWS subdomain delegation'
			},

			{
				domain: 'aliciasykes.com',
				description: 'Homepage hosted on Vercel'
			}
		];

		async function performTrace() {
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
					body: JSON.stringify({ action: 'trace', domain: domainName.trim().toLowerCase() })
				});

				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.message || 'Failed to trace domain');
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
			performTrace();
		}

		function clearExampleSelection() {
			selectedExampleIndex = null;
		}

		function formatTiming(ms) {
			if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`;
			if (ms < 1000) return `${ms.toFixed(1)}ms`;

			return `${(ms / 1000).toFixed(2)}s`;
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h1>DNS Trace Tool</h1> <p>Iterative trace from root to authoritative nameservers via DNS over HTTPS</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary">`);
		Icon($$renderer, { name: 'chevron-right', size: 'xs' });
		$$renderer.push(`<!----> <h4>Quick Examples</h4></summary> <div class="examples-grid"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let example = each_array[i];

			$$renderer.push(`<button${$.attr_class('example-card', void 0, { 'selected': selectedExampleIndex === i })}><h5>${$.escape(example.domain)}</h5> <p>${$.escape(example.description)}</p></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="card input-card"><div class="card-header"><h3>Trace Configuration</h3></div> <div class="card-content"><div class="form-group"><label for="domain">Domain Name</label> <div class="input-flex-container"><input id="domain" type="text"${$.attr('value', domainName)} placeholder="example.com"${$.attr('disabled', loading, true)}/> <button${$.attr('disabled', loading, true)} class="primary">`);

		if (loading) {
			$$renderer.push('<!--[0-->');
			Icon($$renderer, { name: 'loader', size: 'sm', animate: 'spin' });
			$$renderer.push(`<!----> Tracing...`);
		} else {
			$$renderer.push('<!--[-1-->');
			Icon($$renderer, { name: 'search', size: 'sm' });
			$$renderer.push(`<!----> Trace`);
		}

		$$renderer.push(`<!--]--></button></div></div></div></div> `);

		if (error) {
			$$renderer.push(`<!--[0--><div class="card error-card"><div class="card-content"><div class="error-content">`);
			Icon($$renderer, { name: 'alert-triangle', size: 'md' });
			$$renderer.push(`<!----> <div><strong>Trace Failed</strong> <p>${$.escape(error)}</p></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (loading) {
			$$renderer.push(`<!--[0--><div class="card"><div class="card-content"><div class="loading-state svelte-123bgah">`);
			Icon($$renderer, { name: 'loader', size: 'lg', animate: 'spin' });
			$$renderer.push(`<!----> <div class="loading-text svelte-123bgah"><h3 class="svelte-123bgah">Performing DNS Trace</h3> <p class="svelte-123bgah">Following the DNS resolution path from root servers to authoritative nameservers...</p></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (results) {
			$$renderer.push(`<!--[0--><div class="card results-card"><div class="card-header"><h3>Trace Path</h3></div> <div class="card-content"><div class="trace-timeline svelte-123bgah"><!--[-->`);

			const each_array_1 = $.ensure_array_like(results.path);

			for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
				let step = each_array_1[i];

				$$renderer.push(`<div class="trace-step svelte-123bgah"><div class="step-marker svelte-123bgah"><span class="step-number svelte-123bgah">${$.escape(i + 1)}</span></div> <div class="step-content svelte-123bgah"><div class="step-header svelte-123bgah"><span class="step-type svelte-123bgah">${$.escape(step.type)}</span> <span class="step-timing svelte-123bgah">${$.escape(formatTiming(step.timing))}</span></div> <div class="step-query svelte-123bgah"><strong class="svelte-123bgah">Query:</strong> ${$.escape(step.query)} `);

				if (step.qtype) {
					$$renderer.push(`<!--[0--><span class="record-type svelte-123bgah">${$.escape(step.qtype)}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> <div class="step-server svelte-123bgah"><strong class="svelte-123bgah">Server:</strong> ${$.escape(step.server)} `);

				if (step.serverName) {
					$$renderer.push(`<!--[0--><span class="server-name svelte-123bgah">(${$.escape(step.serverName)})</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> `);

				if (step.response) {
					$$renderer.push(`<!--[0--><div class="step-response svelte-123bgah"><strong class="svelte-123bgah">Response:</strong> `);

					if (step.response.type === 'referral') {
						$$renderer.push(`<!--[0--><span class="referral svelte-123bgah">Referral to ${$.escape(step.response.nameservers.join(', '))}</span>`);
					} else if (step.response.type === 'answer') {
						$$renderer.push(`<!--[1--><span class="answer svelte-123bgah">`);

						if (Array.isArray(step.response.data)) {
							$$renderer.push(`<!--[0-->${$.escape(step.response.data.join(', '))}`);
						} else {
							$$renderer.push(`<!--[-1-->${$.escape(step.response.data)}`);
						}

						$$renderer.push(`<!--]--></span>`);
					} else if (step.response.type === 'nodata') {
						$$renderer.push(`<!--[2--><span class="nodata svelte-123bgah">No data for this record type</span>`);
					} else if (step.response.type === 'nxdomain') {
						$$renderer.push(`<!--[3--><span class="nxdomain svelte-123bgah">Domain does not exist</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (step.flags) {
					$$renderer.push(`<!--[0--><div class="step-flags svelte-123bgah">`);

					if (step.flags.aa) {
						$$renderer.push(`<!--[0--><span class="flag authoritative svelte-123bgah">AA</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (step.flags.ad) {
						$$renderer.push(`<!--[0--><span class="flag dnssec svelte-123bgah">AD</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (step.flags.rd) {
						$$renderer.push(`<!--[0--><span class="flag svelte-123bgah">RD</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (step.flags.ra) {
						$$renderer.push(`<!--[0--><span class="flag svelte-123bgah">RA</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div>`);
			}

			$$renderer.push(`<!--]--></div></div></div> `);

			if (results.summary) {
				$$renderer.push(`<!--[0--><div class="card"><div class="card-header"><h3>Trace Summary</h3></div> <div class="card-content"><div class="stats-grid"><div class="stat-card svelte-123bgah"><div class="stat-label">Total Time</div> <div class="stat-value svelte-123bgah">`);
				Icon($$renderer, { name: 'timer', size: 'sm' });
				$$renderer.push(`<!----> ${$.escape(formatTiming(results.summary.totalTime))}</div></div> <div class="stat-card svelte-123bgah"><div class="stat-label">DNS Queries</div> <div class="stat-value svelte-123bgah">${$.escape(results.summary.queryCount)}</div></div> `);

				if (results.summary.finalServer) {
					$$renderer.push(`<!--[0--><div class="stat-card svelte-123bgah"><div class="stat-label">Final Server</div> <div class="stat-value mono svelte-123bgah">${$.escape(results.summary.finalServer)}</div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (results.summary.recordType) {
					$$renderer.push(`<!--[0--><div class="stat-card svelte-123bgah"><div class="stat-label">Record Type</div> <div class="stat-value svelte-123bgah">${$.escape(results.summary.recordType)}</div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (results.summary.totalHops) {
					$$renderer.push(`<!--[0--><div class="stat-card svelte-123bgah"><div class="stat-label">Total Hops</div> <div class="stat-value svelte-123bgah">${$.escape(results.summary.totalHops)}</div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (results.summary.averageLatency) {
					$$renderer.push(`<!--[0--><div class="stat-card svelte-123bgah"><div class="stat-label">Avg Latency</div> <div class="stat-value svelte-123bgah">${$.escape(results.summary.averageLatency)}ms</div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (results.summary.dnssecValid !== undefined) {
					$$renderer.push(`<!--[0--><div class="stat-card svelte-123bgah"><div class="stat-label">DNSSEC Status</div> <div${$.attr_class('stat-value svelte-123bgah', void 0, {
						'valid': results.summary.dnssecValid,
						'invalid': !results.summary.dnssecValid
					})}>`);

					Icon($$renderer, {
						name: results.summary.dnssecValid ? 'shield-check' : 'shield-x',
						size: 'sm'
					});

					$$renderer.push(`<!----> ${$.escape(results.summary.dnssecValid ? 'Valid' : 'Not Validated')}</div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (results.summary.authoritativeAnswer !== undefined) {
					$$renderer.push(`<!--[0--><div class="stat-card svelte-123bgah"><div class="stat-label">Authoritative</div> <div${$.attr_class('stat-value svelte-123bgah', void 0, {
						'valid': results.summary.authoritativeAnswer,
						'invalid': !results.summary.authoritativeAnswer
					})}>`);

					Icon($$renderer, {
						name: results.summary.authoritativeAnswer ? 'check-circle' : 'x-circle',
						size: 'sm'
					});

					$$renderer.push(`<!----> ${$.escape(results.summary.authoritativeAnswer ? 'Yes' : 'No')}</div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (results.summary.resolverPath) {
					$$renderer.push(`<!--[0--><div class="stat-card double-width svelte-123bgah"><div class="stat-label">Resolution Path</div> <div class="stat-value mono resolver-path svelte-123bgah">${$.escape(results.summary.resolverPath)}</div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (results.summary.finalAnswer) {
					$$renderer.push(`<!--[0--><div class="stat-card double-width svelte-123bgah"><div class="stat-label">Final Answer</div> <div class="stat-value mono svelte-123bgah">${$.escape(Array.isArray(results.summary.finalAnswer)
						? results.summary.finalAnswer.join(', ')
						: results.summary.finalAnswer)}</div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div></div>`);
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