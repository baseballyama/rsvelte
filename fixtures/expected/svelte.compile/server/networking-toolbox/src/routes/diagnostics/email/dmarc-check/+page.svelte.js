import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';
import { useDiagnosticState, useClipboard, useExamples } from '$lib/composables';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import ErrorCard from '$lib/components/common/ErrorCard.svelte';
import '../../../../styles/diagnostics-pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let domain = 'gmail.com';
		const diagnosticState = useDiagnosticState();
		const clipboard = useClipboard();

		const examplesList = [
			{
				domain: 'gmail.com',
				description: 'Google Gmail DMARC policy'
			},

			{
				domain: 'outlook.com',
				description: 'Microsoft Outlook DMARC setup'
			},
			{ domain: 'github.com', description: 'GitHub enterprise DMARC' },
			{
				domain: 'paypal.com',
				description: 'PayPal strict DMARC policy'
			},

			{
				domain: 'amazon.com',
				description: 'Amazon DMARC implementation'
			},

			{
				domain: 'salesforce.com',
				description: 'Salesforce DMARC configuration'
			}
		];

		const examples = useExamples(examplesList);

		async function checkDMARC() {
			diagnosticState.startOperation();

			try {
				const response = await fetch('/api/internal/diagnostics/email', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ action: 'dmarc-check', domain: domain.trim() })
				});

				if (!response.ok) {
					throw new Error(`DMARC check failed: ${response.status}`);
				}

				const data = await response.json();

				diagnosticState.setResults(data);
			} catch(err) {
				diagnosticState.setError(err instanceof Error ? err.message : 'Unknown error occurred');
			}
		}

		function loadExample(example, index) {
			domain = example.domain;
			examples.select(index);
			checkDMARC();
		}

		function getPolicyColor(policy) {
			switch (policy) {
				case 'reject':
					return 'success';

				case 'quarantine':
					return 'warning';

				case 'none':
					return 'error';

				default:
					return 'secondary';
			}
		}

		function getPolicyIcon(policy) {
			switch (policy) {
				case 'reject':
					return 'shield-check';

				case 'quarantine':
					return 'shield-alert';

				case 'none':
					return 'shield-x';

				default:
					return 'shield';
			}
		}

		function getAlignmentColor(alignment) {
			switch (alignment) {
				case 's':
					return 'success';

				case 'r':
					return 'warning';

				default:
					return 'secondary';
			}
		}

		async function copyResults() {
			if (!diagnosticState.results) return;

			let text = `DMARC Check for ${domain}\n`;

			text += `Generated at: ${new Date().toISOString()}\n\n`;

			if (diagnosticState.results.record) {
				text += `DMARC Record:\n${diagnosticState.results.record}\n\n`;
			}

			if (diagnosticState.results.deliverabilityHints) {
				text += `Email Deliverability Impact:\n`;
				text += `${diagnosticState.results.deliverabilityHints.policyImpact}\n\n`;

				if (diagnosticState.results.deliverabilityHints.recommendations.length > 0) {
					text += `Recommendations:\n`;

					diagnosticState.results.deliverabilityHints.recommendations.forEach((rec) => {
						text += `  • ${rec}\n`;
					});

					text += `\n`;
				}
			}

			if (diagnosticState.results.parsed) {
				const p = diagnosticState.results.parsed;

				text += `Policy Configuration:\n`;
				text += `  Main Policy: ${p.policy}\n`;

				if (p.subdomainPolicy) text += `  Subdomain Policy: ${p.subdomainPolicy}\n`;

				text += `  DKIM Alignment: ${p.alignment.dkim} (${p.alignment.dkim === 's' ? 'strict' : 'relaxed'})\n`;
				text += `  SPF Alignment: ${p.alignment.spf} (${p.alignment.spf === 's' ? 'strict' : 'relaxed'})\n`;
				text += `  Percentage: ${p.percentage}%\n`;

				if (p.reporting.aggregate) text += `  Aggregate Reports: ${p.reporting.aggregate}\n`;
				if (p.reporting.forensic) text += `  Forensic Reports: ${p.reporting.forensic}\n`;
			}

			await clipboard.copy(text);
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h1>Email DMARC Policy Checker</h1> <p>Check DMARC (Domain-based Message Authentication, Reporting &amp; Conformance) policies with focus on email
      deliverability impact. Understand how DMARC affects your email delivery and reputation.</p></header> `);

		ExamplesCard($$renderer, {
			examples: examplesList,
			selectedIndex: examples.selectedIndex,
			onSelect: loadExample,
			title: 'DMARC Examples',
			getLabel: (ex) => ex.domain,
			getDescription: (ex) => ex.description,
			getTooltip: (ex) => `Check DMARC policy for ${ex.domain}`
		});

		$$renderer.push(`<!----> <div class="card input-card"><div class="card-header"><h3>DMARC Policy Check</h3></div> <div class="card-content"><div class="form-group"><label for="domain">Domain Name <input id="domain" type="text"${$.attr('value', domain)} placeholder="example.com"/></label></div> <div class="action-section svelte-yzmxcb"><button class="check-btn lookup-btn"${$.attr('disabled', diagnosticState.loading || !domain.trim(), true)}>`);

		if (diagnosticState.loading) {
			$$renderer.push('<!--[0-->');
			Icon($$renderer, { name: 'loader', size: 'sm', animate: 'spin' });
			$$renderer.push(`<!----> Checking DMARC...`);
		} else {
			$$renderer.push('<!--[-1-->');
			Icon($$renderer, { name: 'shield-check', size: 'sm' });
			$$renderer.push(`<!----> Check DMARC Policy`);
		}

		$$renderer.push(`<!--]--></button></div></div></div> `);

		if (diagnosticState.results && diagnosticState.results.hasRecord) {
			$$renderer.push(`<!--[0--><div class="card results-card"><div class="card-header row"><h3>DMARC Policy Analysis</h3> <button class="copy-btn"${$.attr('disabled', clipboard.isCopied(), true)}>`);
			Icon($$renderer, { name: clipboard.isCopied() ? 'check' : 'copy', size: 'xs' });
			$$renderer.push(`<!----> ${$.escape(clipboard.isCopied() ? 'Copied!' : 'Copy Results')}</button></div> <div class="card-content">`);

			if (diagnosticState.results.parsed && diagnosticState.results.deliverabilityHints) {
				$$renderer.push(`<!--[0--><div class="deliverability-section svelte-yzmxcb"><div${$.attr_class(`deliverability-overview ${$.stringify(getPolicyColor(diagnosticState.results.parsed.policy))}`, 'svelte-yzmxcb')}>`);

				Icon($$renderer, {
					name: getPolicyIcon(diagnosticState.results.parsed.policy),
					size: 'md'
				});

				$$renderer.push(`<!----> <div><h4 class="svelte-yzmxcb">Email Deliverability Impact</h4> <p class="policy-impact svelte-yzmxcb">${$.escape(diagnosticState.results.deliverabilityHints.policyImpact)}</p> `);

				if (diagnosticState.results.deliverabilityHints.alignmentComplexity?.strict) {
					$$renderer.push(`<!--[0--><p class="alignment-warning svelte-yzmxcb">${$.escape(diagnosticState.results.deliverabilityHints.alignmentComplexity.strict)}</p>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div> `);

				if (diagnosticState.results.deliverabilityHints.recommendations.length > 0) {
					$$renderer.push('<!--[0-->');

					const hintsData = diagnosticState.results.deliverabilityHints;

					$$renderer.push(`<div class="recommendations-section svelte-yzmxcb"><h5 class="svelte-yzmxcb">Deliverability Recommendations</h5> <div class="recommendation-list svelte-yzmxcb"><!--[-->`);

					const each_array = $.ensure_array_like(hintsData.recommendations);

					for (let recIndex = 0, $$length = each_array.length; recIndex < $$length; recIndex++) {
						let recommendation = each_array[recIndex];

						$$renderer.push(`<div class="recommendation-item svelte-yzmxcb">`);
						Icon($$renderer, { name: 'lightbulb', size: 'xs' });
						$$renderer.push(`<!----> <span>${$.escape(recommendation)}</span></div>`);
					}

					$$renderer.push(`<!--]--></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> <div class="record-section svelte-yzmxcb"><h4 class="svelte-yzmxcb">DMARC Record</h4> <div class="record-display svelte-yzmxcb"><div class="record-location svelte-yzmxcb">_dmarc.${$.escape(domain)}</div> <code class="svelte-yzmxcb">${$.escape(diagnosticState.results.record)}</code></div></div> <div class="policy-section svelte-yzmxcb"><h4 class="svelte-yzmxcb">Policy Configuration</h4> <div class="policy-grid svelte-yzmxcb"><div${$.attr_class(`policy-item ${$.stringify(getPolicyColor(diagnosticState.results.parsed.policy))}`, 'svelte-yzmxcb')}><div class="policy-header svelte-yzmxcb">`);
				Icon($$renderer, { name: 'shield', size: 'sm' });
				$$renderer.push(`<!----> <span>Main Policy</span></div> <div class="policy-value svelte-yzmxcb"><span class="policy-text svelte-yzmxcb">${$.escape(diagnosticState.results.parsed.policy)}</span> <span class="policy-description svelte-yzmxcb">`);

				if (diagnosticState.results.parsed.policy === 'reject') {
					$$renderer.push(`<!--[0-->Reject non-compliant messages`);
				} else if (diagnosticState.results.parsed.policy === 'quarantine') {
					$$renderer.push(`<!--[1-->Quarantine suspicious messages`);
				} else if (diagnosticState.results.parsed.policy === 'none') {
					$$renderer.push(`<!--[2-->Monitor only, no action`);
				} else {
					$$renderer.push(`<!--[-1-->Unknown policy`);
				}

				$$renderer.push(`<!--]--></span></div></div> `);

				if (diagnosticState.results.parsed.subdomainPolicy) {
					$$renderer.push(`<!--[0--><div${$.attr_class(`policy-item ${$.stringify(getPolicyColor(diagnosticState.results.parsed.subdomainPolicy))}`, 'svelte-yzmxcb')}><div class="policy-header svelte-yzmxcb">`);
					Icon($$renderer, { name: 'git-branch', size: 'sm' });
					$$renderer.push(`<!----> <span>Subdomain Policy</span></div> <div class="policy-value svelte-yzmxcb"><span class="policy-text svelte-yzmxcb">${$.escape(diagnosticState.results.parsed.subdomainPolicy)}</span></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <div${$.attr_class(`policy-item ${parseInt(diagnosticState.results.parsed.percentage) === 100 ? 'success' : 'warning'}`, 'svelte-yzmxcb')}><div class="policy-header svelte-yzmxcb">`);
				Icon($$renderer, { name: 'percent', size: 'sm' });
				$$renderer.push(`<!----> <span>Coverage</span></div> <div class="policy-value svelte-yzmxcb"><span class="policy-text svelte-yzmxcb">${$.escape(diagnosticState.results.parsed.percentage)}%</span> <span class="policy-description svelte-yzmxcb">of messages affected</span></div></div> <div${$.attr_class(`policy-item ${$.stringify(getAlignmentColor(diagnosticState.results.parsed.alignment.dkim))}`, 'svelte-yzmxcb')}><div class="policy-header svelte-yzmxcb">`);
				Icon($$renderer, { name: 'key', size: 'sm' });

				$$renderer.push(`<!----> <span>DKIM Alignment</span></div> <div class="policy-value svelte-yzmxcb"><span class="policy-text svelte-yzmxcb">${$.escape(diagnosticState.results.parsed.alignment.dkim === 's' ? 'Strict' : 'Relaxed')}</span> <span class="policy-description svelte-yzmxcb">${$.escape(diagnosticState.results.parsed.alignment.dkim === 's'
					? 'Exact domain match required'
					: 'Organizational domain match allowed')}</span></div></div> <div${$.attr_class(`policy-item ${$.stringify(getAlignmentColor(diagnosticState.results.parsed.alignment.spf))}`, 'svelte-yzmxcb')}><div class="policy-header svelte-yzmxcb">`);

				Icon($$renderer, { name: 'mail', size: 'sm' });

				$$renderer.push(`<!----> <span>SPF Alignment</span></div> <div class="policy-value svelte-yzmxcb"><span class="policy-text svelte-yzmxcb">${$.escape(diagnosticState.results.parsed.alignment.spf === 's' ? 'Strict' : 'Relaxed')}</span> <span class="policy-description svelte-yzmxcb">${$.escape(diagnosticState.results.parsed.alignment.spf === 's'
					? 'Exact domain match required'
					: 'Organizational domain match allowed')}</span></div></div> <div class="policy-item secondary svelte-yzmxcb"><div class="policy-header svelte-yzmxcb">`);

				Icon($$renderer, { name: 'settings', size: 'sm' });
				$$renderer.push(`<!----> <span>Failure Options</span></div> <div class="policy-value svelte-yzmxcb"><span class="policy-text svelte-yzmxcb">${$.escape(diagnosticState.results.parsed.reporting.failureOptions)}</span> <span class="policy-description svelte-yzmxcb">`);

				if (diagnosticState.results.parsed.reporting.failureOptions === '0') {
					$$renderer.push(`<!--[0-->DKIM and SPF failure`);
				} else if (diagnosticState.results.parsed.reporting.failureOptions === '1') {
					$$renderer.push(`<!--[1-->Any alignment failure`);
				} else if (diagnosticState.results.parsed.reporting.failureOptions === 'd') {
					$$renderer.push(`<!--[2-->DKIM failure only`);
				} else if (diagnosticState.results.parsed.reporting.failureOptions === 's') {
					$$renderer.push(`<!--[3-->SPF failure only`);
				} else {
					$$renderer.push(`<!--[-1-->Custom configuration`);
				}

				$$renderer.push(`<!--]--></span></div></div></div></div> <div class="reporting-section svelte-yzmxcb"><h4 class="svelte-yzmxcb">Email Reporting Configuration</h4> <div class="reporting-grid svelte-yzmxcb"><div class="reporting-item svelte-yzmxcb"><div class="reporting-header svelte-yzmxcb">`);
				Icon($$renderer, { name: 'bar-chart', size: 'sm' });
				$$renderer.push(`<!----> <span>Aggregate Reports (RUA)</span></div> <div class="reporting-value svelte-yzmxcb">`);

				if (diagnosticState.results.parsed.reporting.aggregate) {
					$$renderer.push(`<!--[0--><span class="email-address svelte-yzmxcb">${$.escape(diagnosticState.results.parsed.reporting.aggregate)}</span> <span class="reporting-description svelte-yzmxcb">Daily summaries of DMARC activity</span>`);
				} else {
					$$renderer.push(`<!--[-1--><span class="not-configured svelte-yzmxcb">Not configured</span> <span class="reporting-description svelte-yzmxcb">Missing aggregate reporting - consider adding rua=</span>`);
				}

				$$renderer.push(`<!--]--></div></div> <div class="reporting-item svelte-yzmxcb"><div class="reporting-header svelte-yzmxcb">`);
				Icon($$renderer, { name: 'search', size: 'sm' });
				$$renderer.push(`<!----> <span>Forensic Reports (RUF)</span></div> <div class="reporting-value svelte-yzmxcb">`);

				if (diagnosticState.results.parsed.reporting.forensic) {
					$$renderer.push(`<!--[0--><span class="email-address svelte-yzmxcb">${$.escape(diagnosticState.results.parsed.reporting.forensic)}</span> <span class="reporting-description svelte-yzmxcb">Real-time failure reports with message samples</span>`);
				} else {
					$$renderer.push(`<!--[-1--><span class="not-configured svelte-yzmxcb">Not configured</span> <span class="reporting-description svelte-yzmxcb">Optional - provides detailed failure analysis</span>`);
				}

				$$renderer.push(`<!--]--></div></div></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (diagnosticState.results && diagnosticState.results.hasRecord === false) {
			$$renderer.push(`<!--[0--><div class="card warning-card none-found svelte-yzmxcb"><div class="card-content"><div class="warning-content svelte-yzmxcb">`);
			Icon($$renderer, { name: 'shield-x', size: 'md' });
			$$renderer.push(`<!----> <div><strong class="svelte-yzmxcb">No DMARC Record Found</strong> <p class="svelte-yzmxcb">Domain <code class="svelte-yzmxcb">${$.escape(domain)}</code> does not have a DMARC policy configured at <code class="svelte-yzmxcb">_dmarc.${$.escape(domain)}</code>.</p> <div class="deliverability-impact svelte-yzmxcb"><h5 class="svelte-yzmxcb">Email Deliverability Impact:</h5> <ul class="svelte-yzmxcb"><li class="svelte-yzmxcb">No protection against email spoofing</li> <li class="svelte-yzmxcb">May affect email reputation with major providers</li> <li class="svelte-yzmxcb">Missing visibility into email authentication failures</li> <li class="svelte-yzmxcb">Consider implementing DMARC starting with p=none for monitoring</li></ul></div></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		ErrorCard($$renderer, { title: 'DMARC Check Failed', error: diagnosticState.error });
		$$renderer.push(`<!----> <div class="card info-card"><div class="card-header"><h3>Understanding DMARC for Email Delivery</h3></div> <div class="card-content"><div class="info-grid"><div class="info-section"><h4>DMARC Policies &amp; Email Impact</h4> <div class="policy-explanations svelte-yzmxcb"><div class="explanation-item svelte-yzmxcb"><strong class="svelte-yzmxcb">none:</strong> Monitor mode - no delivery impact, collect data only</div> <div class="explanation-item svelte-yzmxcb"><strong class="svelte-yzmxcb">quarantine:</strong> Failed messages may go to spam/junk folder</div> <div class="explanation-item svelte-yzmxcb"><strong class="svelte-yzmxcb">reject:</strong> Failed messages rejected outright - strongest protection</div></div></div> <div class="info-section"><h4>Email Delivery Best Practices</h4> <ul><li>Start with p=none to monitor before enforcement</li> <li>Gradually increase to p=quarantine then p=reject</li> <li>Set up aggregate reporting to monitor delivery</li> <li>Test alignment requirements carefully</li> <li>Consider subdomain policy for comprehensive coverage</li></ul></div> <div class="info-section"><h4>Alignment Modes &amp; Delivery</h4> <div class="alignment-explanations svelte-yzmxcb"><div class="explanation-item svelte-yzmxcb"><strong class="svelte-yzmxcb">Relaxed (r):</strong> Allows organizational domain matching (safer for delivery)</div> <div class="explanation-item svelte-yzmxcb"><strong class="svelte-yzmxcb">Strict (s):</strong> Requires exact domain matching (higher security, delivery risk)</div></div></div> <div class="info-section"><h4>Common Delivery Issues</h4> <ul><li>Strict alignment with third-party senders</li> <li>Forwarded emails failing DMARC checks</li> <li>Mailing lists modifying message headers</li> <li>Percentage rollout causing inconsistent delivery</li></ul></div></div></div></div></div>`);
	});
}