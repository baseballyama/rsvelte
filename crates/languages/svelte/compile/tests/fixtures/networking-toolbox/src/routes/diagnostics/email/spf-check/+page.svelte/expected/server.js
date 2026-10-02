import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import '../../../../styles/diagnostics-pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let domain = 'gmail.com';
		let loading = false;
		let results = null;
		let error = null;
		let copiedState = false;
		let selectedExampleIndex = null;

		const examples = [
			{ domain: 'gmail.com', description: 'Google Gmail SPF policy' },
			{
				domain: 'outlook.com',
				description: 'Microsoft Outlook SPF setup'
			},

			{
				domain: 'salesforce.com',
				description: 'Salesforce SPF configuration'
			},

			{
				domain: 'mailchimp.com',
				description: 'MailChimp email service SPF'
			},

			{
				domain: 'github.com',
				description: 'GitHub enterprise SPF policy'
			},

			{
				domain: 'sendgrid.com',
				description: 'SendGrid email platform SPF'
			}
		];

		async function checkSPF() {
			loading = true;
			error = null;
			results = null;

			try {
				const response = await fetch('/api/internal/diagnostics/email', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ action: 'spf-check', domain: domain.trim() })
				});

				if (!response.ok) {
					throw new Error(`SPF check failed: ${response.status}`);
				}

				results = await response.json();
			} catch(err) {
				error = err instanceof Error ? err.message : 'Unknown error occurred';
			} finally {
				loading = false;
			}
		}

		function loadExample(example, index) {
			domain = example.domain;
			selectedExampleIndex = index;
			checkSPF();
		}

		function clearExampleSelection() {
			selectedExampleIndex = null;
		}

		function getDeliverabilityColor(risk) {
			switch (risk) {
				case 'low':
					return 'success';

				case 'medium':
					return 'warning';

				case 'high':
					return 'error';

				default:
					return 'secondary';
			}
		}

		function getDeliverabilityIcon(risk) {
			switch (risk) {
				case 'low':
					return 'shield-check';

				case 'medium':
					return 'shield-alert';

				case 'high':
					return 'shield-x';

				default:
					return 'shield';
			}
		}

		async function copyResults() {
			if (!results) return;

			let text = `SPF Check for ${domain}\n`;

			text += `Generated at: ${new Date().toISOString()}\n\n`;

			if (results.record) {
				text += `SPF Record:\n${results.record}\n\n`;
			}

			if (results.emailAnalysis) {
				text += `Email Deliverability Analysis:\n`;
				text += `  Risk Level: ${results.emailAnalysis.deliverabilityRisk}\n`;
				text += `  Hard Fail (-all): ${results.emailAnalysis.hasHardFail ? 'Yes' : 'No'}\n`;
				text += `  Soft Fail (~all): ${results.emailAnalysis.hasSoftFail ? 'Yes' : 'No'}\n`;
				text += `  Allows All (+all): ${results.emailAnalysis.allowsAll ? 'Yes' : 'No'}\n\n`;
			}

			const expandedResults = results;

			if (expandedResults.expanded) {
				text += `Expanded SPF Analysis:\n`;
				text += `  Total DNS lookups: ${expandedResults.lookupCount || 0}\n`;
				text += `  Mechanisms: ${expandedResults.expanded.mechanisms.join(', ')}\n`;

				if (expandedResults.expanded.includes.length > 0) {
					text += `  Includes: ${expandedResults.expanded.includes.map((inc) => inc.domain).join(', ')}\n`;
				}
			}

			await navigator.clipboard.writeText(text);
			copiedState = true;
			setTimeout(() => copiedState = false, 1500);
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h1>Email SPF Policy Checker</h1> <p>Check SPF (Sender Policy Framework) records for email authentication and deliverability. Analyze which servers are
      authorized to send email for your domain and assess delivery risk.</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary">`);

		Icon($$renderer, { name: 'chevron-right', size: 'xs' });
		$$renderer.push(`<!----> <h4>SPF Examples</h4></summary> <div class="examples-grid"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let example = each_array[i];

			$$renderer.push(`<button${$.attr_class('example-card', void 0, { 'selected': selectedExampleIndex === i })}><h5>${$.escape(example.domain)}</h5> <p>${$.escape(example.description)}</p></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="card input-card"><div class="card-header"><h3>SPF Policy Check</h3></div> <div class="card-content"><div class="form-group"><label for="domain">Domain Name <input id="domain" type="text"${$.attr('value', domain)} placeholder="example.com"/></label></div> <div class="action-section svelte-1ohibvx"><button class="check-btn lookup-btn"${$.attr('disabled', loading || !domain.trim(), true)}>`);

		if (loading) {
			$$renderer.push('<!--[0-->');
			Icon($$renderer, { name: 'loader', size: 'sm', animate: 'spin' });
			$$renderer.push(`<!----> Checking SPF...`);
		} else {
			$$renderer.push('<!--[-1-->');
			Icon($$renderer, { name: 'mail-check', size: 'sm' });
			$$renderer.push(`<!----> Check SPF Policy`);
		}

		$$renderer.push(`<!--]--></button></div></div></div> `);

		if (results) {
			$$renderer.push(`<!--[0--><div class="card results-card"><div class="card-header row"><h3>SPF Policy Analysis</h3> <button class="copy-btn"${$.attr('disabled', copiedState, true)}>`);
			Icon($$renderer, { name: copiedState ? 'check' : 'copy', size: 'xs' });
			$$renderer.push(`<!----> ${$.escape(copiedState ? 'Copied!' : 'Copy Results')}</button></div> <div class="card-content">`);

			if (results.record) {
				$$renderer.push('<!--[0-->');

				if (results.emailAnalysis) {
					$$renderer.push(`<!--[0--><div class="deliverability-section svelte-1ohibvx"><div${$.attr_class(`deliverability-overview ${$.stringify(getDeliverabilityColor(results.emailAnalysis.deliverabilityRisk))}`, 'svelte-1ohibvx')}>`);

					Icon($$renderer, {
						name: getDeliverabilityIcon(results.emailAnalysis.deliverabilityRisk),
						size: 'md'
					});

					$$renderer.push(`<!----> <div class="svelte-1ohibvx"><h4 class="svelte-1ohibvx">Email Deliverability Risk: ${$.escape(results.emailAnalysis.deliverabilityRisk.toUpperCase())}</h4> <p class="svelte-1ohibvx">`);

					if (results.emailAnalysis.deliverabilityRisk === 'low') {
						$$renderer.push(`<!--[0-->Strong SPF policy with hard fail - excellent email security`);
					} else if (results.emailAnalysis.deliverabilityRisk === 'medium') {
						$$renderer.push(`<!--[1-->Moderate SPF policy with soft fail - good but could be stronger`);
					} else {
						$$renderer.push(`<!--[-1-->Weak or missing SPF policy - high risk of email spoofing`);
					}

					$$renderer.push(`<!--]--></p></div></div> <div class="deliverability-details svelte-1ohibvx"><div${$.attr_class(`detail-item ${results.emailAnalysis.hasHardFail ? 'success' : 'warning'}`, 'svelte-1ohibvx')}>`);

					Icon($$renderer, {
						name: results.emailAnalysis.hasHardFail ? 'check-circle' : 'alert-circle',
						size: 'sm'
					});

					$$renderer.push(`<!----> <div class="svelte-1ohibvx"><span class="detail-label svelte-1ohibvx">Hard Fail (-all)</span> <span class="detail-value svelte-1ohibvx">${$.escape(results.emailAnalysis.hasHardFail ? 'Enabled' : 'Disabled')}</span> <span class="detail-description svelte-1ohibvx">${$.escape(results.emailAnalysis.hasHardFail
						? 'Unauthorized emails will be rejected'
						: 'Consider upgrading to -all for better security')}</span></div></div> <div${$.attr_class(
						`detail-item ${results.emailAnalysis.hasSoftFail
							? 'warning'
							: results.emailAnalysis.hasHardFail ? 'success' : 'error'}`,
						'svelte-1ohibvx'
					)}>`);

					Icon($$renderer, {
						name: results.emailAnalysis.hasSoftFail
							? 'alert-triangle'
							: results.emailAnalysis.hasHardFail ? 'check-circle' : 'x-circle',
						size: 'sm'
					});

					$$renderer.push(`<!----> <div class="svelte-1ohibvx"><span class="detail-label svelte-1ohibvx">Soft Fail (~all)</span> <span class="detail-value svelte-1ohibvx">${$.escape(results.emailAnalysis.hasSoftFail ? 'Enabled' : 'Disabled')}</span> <span class="detail-description svelte-1ohibvx">${$.escape(results.emailAnalysis.hasSoftFail
						? 'Unauthorized emails marked as suspicious'
						: results.emailAnalysis.hasHardFail
							? 'Using stronger hard fail instead'
							: 'No SPF enforcement configured')}</span></div></div> `);

					if (results.emailAnalysis.allowsAll) {
						$$renderer.push(`<!--[0--><div class="detail-item error svelte-1ohibvx">`);
						Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
						$$renderer.push(`<!----> <div class="svelte-1ohibvx"><span class="detail-label svelte-1ohibvx">Allows All (+all)</span> <span class="detail-value svelte-1ohibvx">Enabled</span> <span class="detail-description svelte-1ohibvx">WARNING: Any server can send email for this domain</span></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <div class="record-section svelte-1ohibvx"><h4 class="svelte-1ohibvx">SPF Record</h4> <div class="record-display svelte-1ohibvx"><div class="record-location svelte-1ohibvx">TXT record for ${$.escape(domain)}</div> <code class="svelte-1ohibvx">${$.escape(results.record)}</code></div></div> `);

				if (results.expanded) {
					$$renderer.push(`<!--[0--><div class="analysis-section svelte-1ohibvx"><h4 class="svelte-1ohibvx">SPF Policy Breakdown</h4> `);

					if (results.lookupCount > 8) {
						$$renderer.push(`<!--[0--><div class="warning-box svelte-1ohibvx">`);
						Icon($$renderer, { name: 'alert-triangle', size: 'sm' });

						$$renderer.push(`<!----> <div><strong class="svelte-1ohibvx">DNS Lookup Limit Exceeded</strong> <p class="svelte-1ohibvx">This SPF record requires ${$.escape(results.lookupCount)} DNS lookups, which exceeds the RFC limit of 10. This
                      may cause delivery failures.</p></div></div>`);
					} else if (results.lookupCount > 6) {
						$$renderer.push(`<!--[1--><div class="info-box svelte-1ohibvx">`);
						Icon($$renderer, { name: 'info', size: 'sm' });

						$$renderer.push(`<!----> <div><strong class="svelte-1ohibvx">High DNS Lookup Count</strong> <p class="svelte-1ohibvx">This SPF record requires ${$.escape(results.lookupCount)} DNS lookups. Consider optimizing to stay well below
                      the 10-lookup limit.</p></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (results.expanded.mechanisms.length > 0) {
						$$renderer.push('<!--[0-->');

						const spfExpanded = results.expanded;

						$$renderer.push(`<div class="mechanisms-section svelte-1ohibvx"><h5 class="svelte-1ohibvx">Direct Mechanisms</h5> <div class="mechanism-list svelte-1ohibvx"><!--[-->`);

						const each_array_1 = $.ensure_array_like(spfExpanded.mechanisms);

						for (let mechanismIndex = 0,
							$$length = each_array_1.length; mechanismIndex < $$length; mechanismIndex++) {
							let mechanism = each_array_1[mechanismIndex];

							$$renderer.push(`<div class="mechanism-item svelte-1ohibvx"><code class="svelte-1ohibvx">${$.escape(mechanism)}</code> <span class="mechanism-description svelte-1ohibvx">`);

							if (mechanism.startsWith('v=spf1')) {
								$$renderer.push(`<!--[0-->SPF version identifier`);
							} else if (mechanism.startsWith('ip4:')) {
								$$renderer.push(`<!--[1-->IPv4 address or network: ${$.escape(mechanism.substring(4))}`);
							} else if (mechanism.startsWith('ip6:')) {
								$$renderer.push(`<!--[2-->IPv6 address or network: ${$.escape(mechanism.substring(4))}`);
							} else if (mechanism.startsWith('a:')) {
								$$renderer.push(`<!--[3-->A record lookup for: ${$.escape(mechanism.substring(2))}`);
							} else if (mechanism === 'a') {
								$$renderer.push(`<!--[4-->A record lookup for domain itself`);
							} else if (mechanism.startsWith('mx:')) {
								$$renderer.push(`<!--[5-->MX record lookup for: ${$.escape(mechanism.substring(3))}`);
							} else if (mechanism === 'mx') {
								$$renderer.push(`<!--[6-->MX record lookup for domain itself`);
							} else if (mechanism.startsWith('exists:')) {
								$$renderer.push(`<!--[7-->DNS lookup test: ${$.escape(mechanism.substring(7))}`);
							} else if (mechanism === '-all') {
								$$renderer.push(`<!--[8-->Hard fail - reject unauthorized emails`);
							} else if (mechanism === '~all') {
								$$renderer.push(`<!--[9-->Soft fail - mark unauthorized emails as suspicious`);
							} else if (mechanism === '+all') {
								$$renderer.push(`<!--[10-->Pass all - allow any server (dangerous)`);
							} else if (mechanism === '?all') {
								$$renderer.push(`<!--[11-->Neutral - no policy decision`);
							} else {
								$$renderer.push(`<!--[-1-->${$.escape(mechanism)}`);
							}

							$$renderer.push(`<!--]--></span></div>`);
						}

						$$renderer.push(`<!--]--></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (results.expanded.includes.length > 0) {
						$$renderer.push('<!--[0-->');

						const spfIncludes = results.expanded;

						$$renderer.push(`<div class="includes-section svelte-1ohibvx"><h5 class="svelte-1ohibvx">Included SPF Policies</h5> <div class="include-list svelte-1ohibvx"><!--[-->`);

						const each_array_2 = $.ensure_array_like(spfIncludes.includes);

						for (let includeIndex = 0,
							$$length = each_array_2.length; includeIndex < $$length; includeIndex++) {
							let include = each_array_2[includeIndex];

							$$renderer.push(`<div class="include-item svelte-1ohibvx"><div class="include-header svelte-1ohibvx">`);
							Icon($$renderer, { name: 'external-link', size: 'xs' });
							$$renderer.push(`<!----> <span class="include-domain svelte-1ohibvx">${$.escape(include.domain)}</span></div> `);

							if (include.result.record) {
								$$renderer.push(`<!--[0--><div class="include-record svelte-1ohibvx"><code class="svelte-1ohibvx">${$.escape(include.result.record)}</code></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (include.result.error) {
								$$renderer.push(`<!--[0--><div class="include-error svelte-1ohibvx">`);
								Icon($$renderer, { name: 'alert-triangle', size: 'xs' });
								$$renderer.push(`<!----> <span>${$.escape(include.result.error)}</span></div>`);
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

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push(`<!--[-1--><div class="no-record-section svelte-1ohibvx"><div class="no-record-content svelte-1ohibvx">`);
				Icon($$renderer, { name: 'alert-triangle', size: 'md' });

				$$renderer.push(`<!----> <div><h4 class="svelte-1ohibvx">No SPF Record Found</h4> <p class="svelte-1ohibvx">Domain <code class="svelte-1ohibvx">${$.escape(domain)}</code> does not have an SPF record configured.</p> <p class="risk-warning svelte-1ohibvx">This means anyone can send email claiming to be from this domain, significantly increasing spoofing
                  risk.</p></div></div></div>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (error) {
			$$renderer.push(`<!--[0--><div class="card error-card"><div class="card-content"><div class="error-content">`);
			Icon($$renderer, { name: 'alert-triangle', size: 'md' });
			$$renderer.push(`<!----> <div><strong>SPF Check Failed</strong> <p>${$.escape(error)}</p></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="card info-card"><div class="card-header"><h3>Understanding SPF for Email</h3></div> <div class="card-content"><div class="info-grid"><div class="info-section"><h4>SPF Mechanisms</h4> <div class="mechanism-explanations svelte-1ohibvx"><div class="mechanism-explanation svelte-1ohibvx"><strong class="svelte-1ohibvx">ip4/ip6:</strong> Authorize specific IP addresses or networks</div> <div class="mechanism-explanation svelte-1ohibvx"><strong class="svelte-1ohibvx">a/mx:</strong> Authorize servers from A or MX records</div> <div class="mechanism-explanation svelte-1ohibvx"><strong class="svelte-1ohibvx">include:</strong> Include another domain's SPF policy</div> <div class="mechanism-explanation svelte-1ohibvx"><strong class="svelte-1ohibvx">all:</strong> Final policy decision (+pass, ~soft fail, -hard fail)</div></div></div> <div class="info-section"><h4>Email Deliverability</h4> <ul><li><strong>Hard Fail (-all):</strong> Best security, blocks unauthorized senders</li> <li><strong>Soft Fail (~all):</strong> Marks suspicious, doesn't block delivery</li> <li><strong>No SPF:</strong> High spoofing risk, may affect deliverability</li> <li><strong>Too many lookups:</strong> Can cause delivery failures</li></ul></div> <div class="info-section"><h4>Best Practices</h4> <ul><li>Use -all for hard fail when possible</li> <li>Keep DNS lookups under 10 (preferably under 5)</li> <li>Test SPF changes before deployment</li> <li>Monitor email delivery after SPF changes</li></ul></div> <div class="info-section"><h4>Common SPF Examples</h4> <div class="spf-examples svelte-1ohibvx"><div class="spf-example svelte-1ohibvx"><code class="svelte-1ohibvx">v=spf1 include:_spf.google.com ~all</code> <span>Use Google Workspace with soft fail</span></div> <div class="spf-example svelte-1ohibvx"><code class="svelte-1ohibvx">v=spf1 ip4:192.168.1.1 -all</code> <span>Only allow specific IP with hard fail</span></div> <div class="spf-example svelte-1ohibvx"><code class="svelte-1ohibvx">v=spf1 a mx -all</code> <span>Allow A and MX record servers with hard fail</span></div></div></div></div></div></div></div>`);
	});
}