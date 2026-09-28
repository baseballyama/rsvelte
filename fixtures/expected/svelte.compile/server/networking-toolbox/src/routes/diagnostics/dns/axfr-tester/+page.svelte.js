import * as $ from 'svelte/internal/server';
import { SvelteSet } from 'svelte/reactivity';
import Icon from '$lib/components/global/Icon.svelte';
import { isValidDomainName, formatDNSError } from '$lib/utils/dns-validation.js';
import { axfrContent } from '$lib/content/axfr.js';
import '../../../../styles/diagnostics-pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let domain = 'example.com';
		let loading = false;
		let results = null;
		let error = null;
		let selectedExampleIndex = null;
		let expandedRecords = new SvelteSet();

		const isInputValid = $.derived(() => () => {
			const trimmed = domain.trim();

			return trimmed.length > 0 && isValidDomainName(trimmed);
		});

		const examples = [
			{ domain: 'bbc.co.uk', description: '' },
			{ domain: 'zonetransfer.me', description: '' },
			{ domain: 'networkingtoolbox.net', description: '' },
			{ domain: 'amazon.com', description: '' },
			{ domain: 'wikipedia.org', description: '' },
			{ domain: 'github.com', description: '' },
			{ domain: 'gov.uk', description: '' },
			{ domain: 'proton.me', description: '' },
			{ domain: 'loveholidays.com', description: '' }
		];

		async function testAXFR() {
			loading = true;
			error = null;
			results = null;

			const trimmed = domain.trim();

			if (!trimmed) {
				error = 'Domain name is required';
				loading = false;

				return;
			}

			if (!isValidDomainName(trimmed)) {
				error = 'Invalid domain name format';
				loading = false;

				return;
			}

			try {
				const response = await fetch('/api/internal/diagnostics/axfr', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ domain: trimmed })
				});

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({}));

					throw new Error(errorData.message || `AXFR test failed (${response.status})`);
				}

				results = await response.json();
			} catch(err) {
				error = formatDNSError(err);
			} finally {
				loading = false;
			}
		}

		function loadExample(example, index) {
			domain = example.domain;
			selectedExampleIndex = index;
			testAXFR();
		}

		function toggleRecords(nameserver) {
			if (expandedRecords.has(nameserver)) {
				expandedRecords.delete(nameserver);
			} else {
				expandedRecords.add(nameserver);
			}
		}

		function getStatusColor(ns) {
			if (ns.vulnerable) return 'error';
			if (ns.error) return 'warning';

			return 'success';
		}

		function getStatusIcon(ns) {
			if (ns.vulnerable) return 'alert-circle';
			if (ns.error) return 'alert-triangle';

			return 'shield-check';
		}

		function getStatusText(ns) {
			if (ns.vulnerable) return 'Vulnerable';
			if (ns.error) return 'Error';

			return 'Secure';
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h1>DNS Zone Transfer (AXFR) Security Tester</h1> <p>Test if zone transfers are improperly exposed - a critical DNS security vulnerability</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary">`);
		Icon($$renderer, { name: 'chevron-right', size: 'xs' });
		$$renderer.push(`<!----> <h4>Quick Examples</h4></summary> <div class="examples-grid"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let example = each_array[i];

			$$renderer.push(`<button${$.attr_class('example-card', void 0, { 'selected': selectedExampleIndex === i })}${$.attr('disabled', loading, true)}><span class="example-domain">${$.escape(example.domain)}</span> <span class="example-description">${$.escape(example.description)}</span></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <form class="inline-form svelte-71af8j"><div class="form-group flex-grow svelte-71af8j"><label for="domain" class="svelte-71af8j">Domain Name</label> <input id="domain" type="text"${$.attr('value', domain)} placeholder="example.com"${$.attr('disabled', loading, true)}${$.attr('aria-invalid', !isInputValid())} class="svelte-71af8j"/></div> <button type="submit" class="submit-btn svelte-71af8j"${$.attr('disabled', loading || !isInputValid(), true)}>`);

		if (loading) {
			$$renderer.push('<!--[0-->');
			Icon($$renderer, { name: 'loader', size: 'sm' });
			$$renderer.push(`<!----> Testing...`);
		} else {
			$$renderer.push('<!--[-1-->');
			Icon($$renderer, { name: 'search', size: 'sm' });
			$$renderer.push(`<!----> Test AXFR`);
		}

		$$renderer.push(`<!--]--></button></form> `);

		if (error) {
			$$renderer.push(`<!--[0--><div class="alert alert-error svelte-71af8j" role="alert">`);
			Icon($$renderer, { name: 'alert-circle', size: 'sm' });
			$$renderer.push(`<!----> <div class="svelte-71af8j"><strong class="svelte-71af8j">Error</strong> <p class="svelte-71af8j">${$.escape(error)}</p></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (results) {
			$$renderer.push('<!--[0-->');

			if (results.limitedMode) {
				$$renderer.push(`<!--[0--><div class="alert alert-warning svelte-71af8j" role="alert">`);
				Icon($$renderer, { name: 'alert-triangle', size: 'md' });
				$$renderer.push(`<!----> <div class="svelte-71af8j"><strong class="svelte-71af8j">Limited Testing Mode</strong> <p class="svelte-71af8j">${$.escape(results.limitedModeReason)}</p></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (results.summary.vulnerable > 0) {
				$$renderer.push(`<!--[0--><div class="alert alert-error svelte-71af8j" role="alert">`);
				Icon($$renderer, { name: 'alert-circle', size: 'md' });

				$$renderer.push(`<!----> <div class="svelte-71af8j"><strong class="svelte-71af8j">Critical Security Vulnerability Detected!</strong> <p class="svelte-71af8j">${$.escape(results.summary.vulnerable)} nameserver${$.escape(results.summary.vulnerable > 1 ? 's' : '')} allowed unrestricted zone
            transfer. Your entire DNS zone is exposed to anyone. <strong class="svelte-71af8j">Immediate action required!</strong></p></div></div>`);
			} else if (results.summary.secure > 0) {
				$$renderer.push(`<!--[1--><div class="alert alert-success svelte-71af8j">`);
				Icon($$renderer, { name: 'shield-check', size: 'md' });
				$$renderer.push(`<!----> <div class="svelte-71af8j"><strong class="svelte-71af8j">All Nameservers Secure</strong> <p class="svelte-71af8j">Zone transfers are properly restricted. No AXFR vulnerabilities detected.</p></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="stats-summary svelte-71af8j"><div class="stat-card svelte-71af8j">`);
			Icon($$renderer, { name: 'server', size: 'md' });
			$$renderer.push(`<!----> <div class="stat-content svelte-71af8j"><span class="stat-label svelte-71af8j">Total Nameservers</span> <span class="stat-value svelte-71af8j">${$.escape(results.summary.total)}</span></div></div> <div class="stat-card stat-error svelte-71af8j">`);
			Icon($$renderer, { name: 'alert-circle', size: 'md' });
			$$renderer.push(`<!----> <div class="stat-content svelte-71af8j"><span class="stat-label svelte-71af8j">Vulnerable</span> <span class="stat-value svelte-71af8j">${$.escape(results.summary.vulnerable)}</span></div></div> <div class="stat-card stat-success svelte-71af8j">`);
			Icon($$renderer, { name: 'shield-check', size: 'md' });
			$$renderer.push(`<!----> <div class="stat-content svelte-71af8j"><span class="stat-label svelte-71af8j">Secure</span> <span class="stat-value svelte-71af8j">${$.escape(results.summary.secure)}</span></div></div> <div class="stat-card stat-warning svelte-71af8j">`);
			Icon($$renderer, { name: 'alert-triangle', size: 'md' });
			$$renderer.push(`<!----> <div class="stat-content svelte-71af8j"><span class="stat-label svelte-71af8j">Errors</span> <span class="stat-value svelte-71af8j">${$.escape(results.summary.errors)}</span></div></div></div> <div class="results-section"><h3>Nameserver Test Results</h3> <div class="nameserver-results svelte-71af8j"><!--[-->`);

			const each_array_1 = $.ensure_array_like(results.nameservers);

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let ns = each_array_1[$$index_1];

				$$renderer.push(`<div${$.attr_class(`nameserver-card status-${$.stringify(getStatusColor(ns))}`, 'svelte-71af8j')}><div class="nameserver-header svelte-71af8j"><div class="nameserver-info svelte-71af8j">`);
				Icon($$renderer, { name: getStatusIcon(ns), size: 'md' });
				$$renderer.push(`<!----> <div class="svelte-71af8j"><h4 class="svelte-71af8j">${$.escape(ns.nameserver)}</h4> <span class="nameserver-ip svelte-71af8j">${$.escape(ns.ip)}</span></div></div> <div class="nameserver-status svelte-71af8j"><span class="response-time svelte-71af8j">${$.escape(ns.responseTime)}ms</span> <span${$.attr_class(`status-badge status-${$.stringify(getStatusColor(ns))}`, 'svelte-71af8j')}>${$.escape(getStatusText(ns))}</span></div></div> `);

				if (ns.vulnerable && ns.recordCount) {
					$$renderer.push(`<!--[0--><div class="vulnerability-details svelte-71af8j"><div class="vulnerability-warning svelte-71af8j">`);
					Icon($$renderer, { name: 'alert-circle', size: 'sm' });
					$$renderer.push(`<!----> <strong class="svelte-71af8j">Zone transfer succeeded!</strong> Exposed ${$.escape(ns.recordCount)} DNS records</div> `);

					if (ns.records && ns.records.length > 0) {
						$$renderer.push(`<!--[0--><button${$.attr_class('toggle-records-btn svelte-71af8j', void 0, { 'expanded': expandedRecords.has(ns.nameserver) })}>`);
						Icon($$renderer, { name: 'chevron-right', size: 'xs' });
						$$renderer.push(`<!----> ${$.escape(expandedRecords.has(ns.nameserver) ? 'Hide' : 'Show')} exposed records (${$.escape(ns.records.length)} of ${$.escape(ns.recordCount)})</button> `);

						if (expandedRecords.has(ns.nameserver)) {
							$$renderer.push(`<!--[0--><div class="exposed-records svelte-71af8j"><pre class="svelte-71af8j">${$.escape(ns.records.join('\n'))}</pre> `);

							if (ns.recordCount > ns.records.length) {
								$$renderer.push(`<!--[0--><p class="truncated-note svelte-71af8j">Showing first ${$.escape(ns.records.length)} of ${$.escape(ns.recordCount)} total records</p>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				} else if (ns.error) {
					$$renderer.push(`<!--[1--><div class="error-details svelte-71af8j">`);
					Icon($$renderer, { name: 'info-circle', size: 'xs' });
					$$renderer.push(`<!----> <span>${$.escape(ns.error)}</span></div>`);
				} else {
					$$renderer.push(`<!--[-1--><div class="secure-details svelte-71af8j">`);
					Icon($$renderer, { name: 'check-circle', size: 'xs' });
					$$renderer.push(`<!----> <span>Zone transfer properly refused</span></div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			}

			$$renderer.push(`<!--]--></div></div> <div class="test-metadata svelte-71af8j"><p class="svelte-71af8j"><strong class="svelte-71af8j">Domain:</strong> ${$.escape(results.domain)} • <strong class="svelte-71af8j">Tested:</strong> ${$.escape(new Date(results.timestamp).toLocaleString())}</p></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <section class="card educational-part svelte-71af8j"><div class="card info-card svelte-71af8j"><h2>${$.escape(axfrContent.sections.whatIsAXFR.title)}</h2> <p>${$.escape(axfrContent.sections.whatIsAXFR.content)}</p></div> <div class="card info-card svelte-71af8j"><h2>${$.escape(axfrContent.sections.security.title)}</h2> <div class="risks-grid svelte-71af8j"><!--[-->`);

		const each_array_2 = $.ensure_array_like(axfrContent.sections.security.risks);

		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let risk = each_array_2[$$index_2];

			$$renderer.push(`<div${$.attr_class(`risk-card severity-${$.stringify(risk.severity.toLowerCase())}`, 'svelte-71af8j')}><div class="risk-header svelte-71af8j"><h4 class="svelte-71af8j">${$.escape(risk.risk)}</h4> <span${$.attr_class(`severity-badge severity-${$.stringify(risk.severity.toLowerCase())}`, 'svelte-71af8j')}>${$.escape(risk.severity)}</span></div> <p class="risk-description svelte-71af8j">${$.escape(risk.description)}</p> <div class="risk-impact svelte-71af8j">`);
			Icon($$renderer, { name: 'info-circle', size: 'xs' });
			$$renderer.push(`<!----> <em>${$.escape(risk.impact)}</em></div></div>`);
		}

		$$renderer.push(`<!--]--></div></div> <div class="card info-card svelte-71af8j"><h2>${$.escape(axfrContent.sections.interpretation.title)}</h2> <div class="statuses-list svelte-71af8j"><!--[-->`);

		const each_array_3 = $.ensure_array_like(axfrContent.sections.interpretation.statuses);

		for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
			let status = each_array_3[$$index_3];

			$$renderer.push(`<div${$.attr_class(`status-explanation status-${$.stringify(status.color)}`, 'svelte-71af8j')}><div class="status-header svelte-71af8j">`);

			Icon($$renderer, {
				name: status.status === 'Vulnerable'
					? 'alert-circle'
					: status.status === 'Secure' ? 'shield-check' : 'alert-triangle',
				size: 'sm'
			});

			$$renderer.push(`<!----> <h4 class="svelte-71af8j">${$.escape(status.status)}: ${$.escape(status.meaning)}</h4></div> <p class="svelte-71af8j">${$.escape(status.description)}</p> <div class="status-action svelte-71af8j">`);
			Icon($$renderer, { name: 'arrow-right', size: 'xs' });
			$$renderer.push(`<!----> <strong class="svelte-71af8j">Action:</strong> ${$.escape(status.action)}</div></div>`);
		}

		$$renderer.push(`<!--]--></div></div> <div class="card info-card svelte-71af8j"><h2>${$.escape(axfrContent.sections.properConfiguration.title)}</h2> <!--[-->`);

		const each_array_4 = $.ensure_array_like(axfrContent.sections.properConfiguration.configurations);

		for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
			let config = each_array_4[$$index_4];

			$$renderer.push(`<div class="config-section svelte-71af8j"><h4 class="svelte-71af8j">${$.escape(config.server)}</h4> <p class="svelte-71af8j">${$.escape(config.description)}</p> <pre class="svelte-71af8j"><code class="svelte-71af8j">${$.escape(config.syntax)}</code></pre></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="card info-card svelte-71af8j"><h2>${$.escape(axfrContent.sections.remediation.title)}</h2> <div class="remediation-steps svelte-71af8j"><!--[-->`);

		const each_array_5 = $.ensure_array_like(axfrContent.sections.remediation.steps);

		for (let i = 0, $$length = each_array_5.length; i < $$length; i++) {
			let step = each_array_5[i];

			$$renderer.push(`<div class="remediation-step svelte-71af8j"><div class="step-number svelte-71af8j">${$.escape(i + 1)}</div> <div class="step-content svelte-71af8j"><h4 class="svelte-71af8j">${$.escape(step.step)}</h4> <p class="svelte-71af8j">${$.escape(step.details)}</p> `);

			if (step.command) {
				$$renderer.push(`<!--[0--><pre class="svelte-71af8j"><code class="svelte-71af8j">${$.escape(step.command)}</code></pre>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		$$renderer.push(`<!--]--></div></div> <div class="card info-card svelte-71af8j"><h2>${$.escape(axfrContent.sections.bestPractices.title)}</h2> <div class="practices-list svelte-71af8j"><!--[-->`);

		const each_array_6 = $.ensure_array_like(axfrContent.sections.bestPractices.practices);

		for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
			let practice = each_array_6[$$index_6];

			$$renderer.push(`<div${$.attr_class(`practice-item priority-${$.stringify(practice.priority.toLowerCase())}`, 'svelte-71af8j')}><div class="practice-header svelte-71af8j">`);
			Icon($$renderer, { name: 'check-circle', size: 'sm' });
			$$renderer.push(`<!----> <h4 class="svelte-71af8j">${$.escape(practice.practice)}</h4> <span${$.attr_class(`priority-badge priority-${$.stringify(practice.priority.toLowerCase())}`, 'svelte-71af8j')}>${$.escape(practice.priority)}</span></div> <p class="svelte-71af8j">${$.escape(practice.description)}</p></div>`);
		}

		$$renderer.push(`<!--]--></div></div></section>`);
	});
}