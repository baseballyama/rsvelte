import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';
import { tooltip } from '$lib/actions/tooltip';

export default function DMARCBuilder($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let domain = 'example.com';

		let policy = {
			version: 'DMARC1',
			policy: 'none',
			subdomainPolicy: undefined,
			dkimAlignment: 'r',
			spfAlignment: 'r',
			percentage: 100,
			reportingURI: undefined,
			forensicURI: undefined,
			failureOptions: ['0'],
			reportInterval: 86400
		};

		let showAdvanced = false;
		let selectedExample = null;

		// Button success states
		let buttonStates = {};

		const policyDescriptions = {
			none: 'Monitor only - no action taken on failed emails',
			quarantine: 'Failed emails sent to spam/junk folder',
			reject: 'Failed emails rejected at SMTP level'
		};

		const alignmentDescriptions = {
			r: 'Relaxed - domain and subdomains match',
			s: 'Strict - exact domain match only'
		};

		const failureOptionDescriptions = {
			'0': 'Generate reports if both SPF and DKIM fail',
			'1': 'Generate reports if either SPF or DKIM fail',
			d: 'Generate reports if DKIM fails',
			s: 'Generate reports if SPF fails'
		};

		const dmarcRecord = $.derived(() => {
			let record = `v=${policy.version}; p=${policy.policy}`;

			if (policy.subdomainPolicy && policy.subdomainPolicy !== policy.policy) {
				record += `; sp=${policy.subdomainPolicy}`;
			}

			if (policy.dkimAlignment !== 'r') {
				record += `; adkim=${policy.dkimAlignment}`;
			}

			if (policy.spfAlignment !== 'r') {
				record += `; aspf=${policy.spfAlignment}`;
			}

			if (policy.percentage !== 100) {
				record += `; pct=${policy.percentage}`;
			}

			if (policy.reportingURI?.trim()) {
				record += `; rua=mailto:${policy.reportingURI.trim()}`;
			}

			if (policy.forensicURI?.trim()) {
				record += `; ruf=mailto:${policy.forensicURI.trim()}`;
			}

			if (policy.failureOptions.length > 0) {
				record += `; fo=${policy.failureOptions.join(':')}`;
			}

			if (policy.reportInterval !== 86400) {
				record += `; ri=${policy.reportInterval}`;
			}

			return record;
		});

		const txtRecord = $.derived(() => {
			return `_dmarc.${domain}. IN TXT "${dmarcRecord()}"`;
		});

		const validation = $.derived(() => {
			const warnings = [];
			const errors = [];

			// Check domain format
			if (!domain.trim()) {
				errors.push('Domain is required');
			} else if (!domain.includes('.')) {
				warnings.push('Domain should include TLD (e.g., .com, .org)');
			}

			// Policy progression warnings
			if (policy.policy === 'reject' && !policy.reportingURI) {
				warnings.push('Consider adding reporting URI before using reject policy');
			}

			if (policy.policy === 'none' && policy.percentage < 100) {
				warnings.push('Percentage should be 100% for monitoring-only policy');
			}

			// Alignment warnings
			if (policy.dkimAlignment === 's' && policy.spfAlignment === 's') {
				warnings.push('Strict alignment for both SPF and DKIM may cause legitimate emails to fail');
			}

			// Reporting warnings
			if (policy.reportingURI && !policy.reportingURI.includes('@')) {
				errors.push('Reporting URI must be a valid email address');
			}

			if (policy.forensicURI && !policy.forensicURI.includes('@')) {
				errors.push('Forensic URI must be a valid email address');
			}

			// Record length check
			const recordLength = dmarcRecord().length;

			if (recordLength > 255) {
				errors.push(`DMARC record too long (${recordLength} chars). DNS TXT limit is 255.`);
			} else if (recordLength > 200) {
				warnings.push(`DMARC record is long (${recordLength} chars). Consider shortening.`);
			}

			return { isValid: errors.length === 0, errors, warnings, recordLength };
		});

		function showButtonSuccess(buttonId) {
			buttonStates[buttonId] = true;

			setTimeout(
				() => {
					buttonStates[buttonId] = false;
				},
				2000
			);
		}

		function copyToClipboard(text, buttonId) {
			navigator.clipboard.writeText(text);
			showButtonSuccess(buttonId);
		}

		function exportAsZoneFile() {
			const zoneContent = txtRecord();
			const blob = new Blob([zoneContent], { type: 'text/plain' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');

			a.href = url;
			a.download = `${domain}-dmarc-record.zone`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			showButtonSuccess('export-zone');
		}

		function toggleFailureOption(option) {
			if (policy.failureOptions.includes(option)) {
				policy.failureOptions = policy.failureOptions.filter((o) => o !== option);
			} else {
				policy.failureOptions = [...policy.failureOptions, option];
			}
		}

		const examplePolicies = [
			{
				name: 'Monitor Only',
				description: 'Start monitoring without affecting email delivery',
				domain: 'example.com',
				config: {
					policy: 'none',
					percentage: 100,
					reportingURI: 'dmarc@example.com',
					dkimAlignment: 'r',
					spfAlignment: 'r',
					failureOptions: ['0']
				}
			},

			{
				name: 'Quarantine Phase',
				description: 'Move suspicious emails to spam folder',
				domain: 'mycompany.com',
				config: {
					policy: 'quarantine',
					percentage: 25,
					reportingURI: 'dmarc-reports@mycompany.com',
					dkimAlignment: 'r',
					spfAlignment: 'r',
					failureOptions: ['1']
				}
			},

			{
				name: 'Full Protection',
				description: 'Reject all failing emails with forensics',
				domain: 'secure.example.com',
				config: {
					policy: 'reject',
					subdomainPolicy: 'reject',
					percentage: 100,
					reportingURI: 'dmarc@secure.example.com',
					forensicURI: 'forensics@secure.example.com',
					dkimAlignment: 's',
					spfAlignment: 's',
					failureOptions: ['1']
				}
			}
		];

		function loadExample(example) {
			domain = example.domain;
			policy = { version: 'DMARC1', reportInterval: 86400, ...example.config };
			selectedExample = example.name;
		}

		const deploymentSteps = [
			'Start with p=none to monitor current email authentication status',
			'Analyze DMARC reports to identify legitimate vs malicious sources',
			'Configure SPF and DKIM for all legitimate sending sources',
			'Gradually increase to p=quarantine with low percentage (pct=25)',
			'Monitor for false positives and adjust alignment if needed',
			'Increase percentage gradually (50%, 75%, 100%)',
			'Finally move to p=reject when confident in configuration'
		];

		$$renderer.push(`<div class="card"><div class="card-header"><h1>DMARC Policy Builder</h1> <p class="card-subtitle">Create DMARC policies with alignment options, reporting addresses, and failure handling configuration.</p></div> <div class="grid-layout"><div class="input-section"><div class="domain-section svelte-1o3uqd0"><div class="section-header svelte-1o3uqd0"><h3 class="svelte-1o3uqd0">`);
		Icon($$renderer, { name: 'globe', size: 'sm' });
		$$renderer.push(`<!----> Domain Configuration</h3></div> <div class="input-group svelte-1o3uqd0"><label for="domain" class="svelte-1o3uqd0">Domain:</label> <input id="domain" type="text"${$.attr('value', domain)} placeholder="example.com" class="svelte-1o3uqd0"/></div></div> <div class="policy-section svelte-1o3uqd0"><div class="section-header svelte-1o3uqd0"><h3 class="svelte-1o3uqd0">`);
		Icon($$renderer, { name: 'shield', size: 'sm' });
		$$renderer.push(`<!----> Policy Configuration</h3></div> <div class="policy-grid svelte-1o3uqd0"><div class="input-group svelte-1o3uqd0"><label for="policy" class="svelte-1o3uqd0">Policy (p):</label> `);

		$$renderer.select(
			{ id: 'policy', value: policy.policy, class: '' },
			($$renderer) => {
				$$renderer.option({ value: 'none' }, ($$renderer) => {
					$$renderer.push(`none - Monitor only`);
				});

				$$renderer.option({ value: 'quarantine' }, ($$renderer) => {
					$$renderer.push(`quarantine - Send to spam`);
				});

				$$renderer.option({ value: 'reject' }, ($$renderer) => {
					$$renderer.push(`reject - Block email`);
				});
			},
			'svelte-1o3uqd0'
		);

		$$renderer.push(` <div class="policy-description svelte-1o3uqd0">${$.escape(policyDescriptions[policy.policy])}</div></div> <div class="input-group svelte-1o3uqd0"><label for="percentage" class="svelte-1o3uqd0">Percentage (pct):</label> <div class="percentage-input svelte-1o3uqd0"><input id="percentage" type="range"${$.attr('value', policy.percentage)} min="0" max="100" step="5" class="svelte-1o3uqd0"/> <span class="percentage-value svelte-1o3uqd0">${$.escape(policy.percentage)}%</span></div></div></div> <details class="advanced-toggle svelte-1o3uqd0"${$.attr('open', showAdvanced, true)}><summary class="svelte-1o3uqd0">`);
		Icon($$renderer, { name: 'settings', size: 'sm' });
		$$renderer.push(`<!----> Advanced Options</summary> <div class="advanced-grid svelte-1o3uqd0"><div class="input-group svelte-1o3uqd0"><label for="subdomainPolicy" class="svelte-1o3uqd0">Subdomain Policy (sp):</label> `);

		$$renderer.select(
			{
				id: 'subdomainPolicy',
				value: policy.subdomainPolicy,
				class: ''
			},
			($$renderer) => {
				$$renderer.option({ value: undefined }, ($$renderer) => {
					$$renderer.push(`Inherit from main policy`);
				});

				$$renderer.option({ value: 'none' }, ($$renderer) => {
					$$renderer.push(`none - Monitor only`);
				});

				$$renderer.option({ value: 'quarantine' }, ($$renderer) => {
					$$renderer.push(`quarantine - Send to spam`);
				});

				$$renderer.option({ value: 'reject' }, ($$renderer) => {
					$$renderer.push(`reject - Block email`);
				});
			},
			'svelte-1o3uqd0'
		);

		$$renderer.push(`</div> <div class="alignment-section svelte-1o3uqd0"><h4 class="svelte-1o3uqd0">Authentication Alignment</h4> <div class="alignment-grid svelte-1o3uqd0"><div class="input-group svelte-1o3uqd0"><label for="dkimAlignment" class="svelte-1o3uqd0">DKIM Alignment (adkim):</label> `);

		$$renderer.select(
			{ id: 'dkimAlignment', value: policy.dkimAlignment, class: '' },
			($$renderer) => {
				$$renderer.option({ value: 'r' }, ($$renderer) => {
					$$renderer.push(`r - Relaxed`);
				});

				$$renderer.option({ value: 's' }, ($$renderer) => {
					$$renderer.push(`s - Strict`);
				});
			},
			'svelte-1o3uqd0'
		);

		$$renderer.push(` <div class="alignment-description svelte-1o3uqd0">${$.escape(alignmentDescriptions[policy.dkimAlignment])}</div></div> <div class="input-group svelte-1o3uqd0"><label for="spfAlignment" class="svelte-1o3uqd0">SPF Alignment (aspf):</label> `);

		$$renderer.select(
			{ id: 'spfAlignment', value: policy.spfAlignment, class: '' },
			($$renderer) => {
				$$renderer.option({ value: 'r' }, ($$renderer) => {
					$$renderer.push(`r - Relaxed`);
				});

				$$renderer.option({ value: 's' }, ($$renderer) => {
					$$renderer.push(`s - Strict`);
				});
			},
			'svelte-1o3uqd0'
		);

		$$renderer.push(` <div class="alignment-description svelte-1o3uqd0">${$.escape(alignmentDescriptions[policy.spfAlignment])}</div></div></div></div> <div class="reporting-section svelte-1o3uqd0"><h4 class="svelte-1o3uqd0">Reporting Configuration</h4> <div class="reporting-grid svelte-1o3uqd0"><div class="input-group svelte-1o3uqd0"><label for="reportingURI" class="svelte-1o3uqd0">Reporting Email (rua):</label> <input id="reportingURI" type="email"${$.attr('value', policy.reportingURI)} placeholder="dmarc@example.com" class="svelte-1o3uqd0"/></div> <div class="input-group svelte-1o3uqd0"><label for="forensicURI" class="svelte-1o3uqd0">Forensic Email (ruf):</label> <input id="forensicURI" type="email"${$.attr('value', policy.forensicURI)} placeholder="forensic@example.com" class="svelte-1o3uqd0"/></div> <div class="input-group svelte-1o3uqd0"><label for="reportInterval" class="svelte-1o3uqd0">Report Interval (ri):</label> `);

		$$renderer.select(
			{
				id: 'reportInterval',
				value: policy.reportInterval,
				class: ''
			},
			($$renderer) => {
				$$renderer.option({ value: 3600 }, ($$renderer) => {
					$$renderer.push(`1 hour`);
				});

				$$renderer.option({ value: 86400 }, ($$renderer) => {
					$$renderer.push(`24 hours (daily)`);
				});

				$$renderer.option({ value: 604800 }, ($$renderer) => {
					$$renderer.push(`7 days (weekly)`);
				});
			},
			'svelte-1o3uqd0'
		);

		$$renderer.push(`</div></div></div> <div class="failure-options-section svelte-1o3uqd0"><h4 class="svelte-1o3uqd0">Failure Reporting Options (fo):</h4> <div class="failure-options svelte-1o3uqd0"><!--[-->`);

		const each_array = $.ensure_array_like(Object.entries(failureOptionDescriptions));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [option, description] = each_array[$$index];

			$$renderer.push(`<label class="failure-option svelte-1o3uqd0"><input type="checkbox"${$.attr('checked', policy.failureOptions.includes(option), true)} class="svelte-1o3uqd0"/> <span class="option-code svelte-1o3uqd0">${$.escape(option)}:</span> <span class="option-description svelte-1o3uqd0">${$.escape(description)}</span></label>`);
		}

		$$renderer.push(`<!--]--></div></div></div></details></div></div> <div class="results-section"><div class="record-section"><div class="section-header svelte-1o3uqd0"><h3 class="svelte-1o3uqd0">Generated DMARC Record</h3> <div class="actions svelte-1o3uqd0"><button type="button"${$.attr_class('copy-btn svelte-1o3uqd0', void 0, { 'success': buttonStates['copy-dmarc'] })}>`);

		Icon($$renderer, {
			name: buttonStates['copy-dmarc'] ? 'check' : 'copy',
			size: 'sm'
		});

		$$renderer.push(`<!----> ${$.escape(buttonStates['copy-dmarc'] ? 'Copied!' : 'Copy')}</button> <button type="button"${$.attr_class('export-btn svelte-1o3uqd0', void 0, { 'success': buttonStates['export-zone'] })}>`);

		Icon($$renderer, {
			name: buttonStates['export-zone'] ? 'check' : 'download',
			size: 'sm'
		});

		$$renderer.push(`<!----> ${$.escape(buttonStates['export-zone'] ? 'Downloaded!' : 'Export')}</button></div></div> <div class="record-output"><div class="code-block svelte-1o3uqd0"><code class="svelte-1o3uqd0">${$.escape(dmarcRecord())}</code></div></div> <div class="zone-file-output svelte-1o3uqd0"><h4 class="svelte-1o3uqd0">DNS TXT Record:</h4> <div class="code-block svelte-1o3uqd0"><code class="svelte-1o3uqd0">${$.escape(txtRecord())}</code></div></div></div> <div class="validation-section"><div class="section-header svelte-1o3uqd0"><h3 class="svelte-1o3uqd0">`);
		Icon($$renderer, { name: 'bar-chart', size: 'sm' });

		$$renderer.push(`<!----> Policy Validation</h3></div> <div class="validation-stats svelte-1o3uqd0"><div class="stat-item svelte-1o3uqd0"><span class="stat-label svelte-1o3uqd0">Record Length:</span> <span${$.attr_class('stat-value svelte-1o3uqd0', void 0, {
			'warning': validation().recordLength > 200,
			'error': validation().recordLength > 255
		})}>${$.escape(validation().recordLength)}/255 chars</span></div> <div class="stat-item svelte-1o3uqd0"><span class="stat-label svelte-1o3uqd0">Status:</span> <span${$.attr_class('stat-value svelte-1o3uqd0', void 0, {
			'success': validation().isValid,
			'error': !validation().isValid
		})}>${$.escape(validation().isValid ? 'Valid' : 'Invalid')}</span></div></div> `);

		if (validation().errors.length > 0) {
			$$renderer.push(`<!--[0--><div class="validation-messages error svelte-1o3uqd0">`);
			Icon($$renderer, { name: 'x-circle', size: 'sm' });
			$$renderer.push(`<!----> <div class="messages svelte-1o3uqd0"><!--[-->`);

			const each_array_1 = $.ensure_array_like(validation().errors);

			for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
				let error = each_array_1[index];

				$$renderer.push(`<div class="message svelte-1o3uqd0">${$.escape(error)}</div>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (validation().warnings.length > 0) {
			$$renderer.push(`<!--[0--><div class="validation-messages warning svelte-1o3uqd0">`);
			Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
			$$renderer.push(`<!----> <div class="messages svelte-1o3uqd0"><!--[-->`);

			const each_array_2 = $.ensure_array_like(validation().warnings);

			for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
				let warning = each_array_2[index];

				$$renderer.push(`<div class="message svelte-1o3uqd0">${$.escape(warning)}</div>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (validation().isValid && validation().errors.length === 0 && validation().warnings.length === 0) {
			$$renderer.push(`<!--[0--><div class="validation-messages success svelte-1o3uqd0">`);
			Icon($$renderer, { name: 'check-circle', size: 'sm' });
			$$renderer.push(`<!----> <div class="message svelte-1o3uqd0">DMARC policy is valid and ready to deploy!</div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="deployment-guide svelte-1o3uqd0"><div class="section-header svelte-1o3uqd0"><h3 class="svelte-1o3uqd0">`);
		Icon($$renderer, { name: 'info', size: 'sm' });
		$$renderer.push(`<!----> Deployment Guide</h3></div> <div class="deployment-steps svelte-1o3uqd0"><ol class="svelte-1o3uqd0"><!--[-->`);

		const each_array_3 = $.ensure_array_like(deploymentSteps);

		for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
			let step = each_array_3[index];

			$$renderer.push(`<li${$.attr_class('svelte-1o3uqd0', void 0, {
				'current': policy.policy === 'none' && index === 0 || policy.policy === 'quarantine' && index >= 2 && index <= 5 || policy.policy === 'reject' && index === 6
			})}>${$.escape(step)}</li>`);
		}

		$$renderer.push(`<!--]--></ol></div></div></div></div> <div class="examples-section svelte-1o3uqd0"><details class="examples-toggle svelte-1o3uqd0"><summary class="svelte-1o3uqd0">`);
		Icon($$renderer, { name: 'lightbulb', size: 'sm' });
		$$renderer.push(`<!----> Example Policies</summary> <div class="examples-grid svelte-1o3uqd0"><!--[-->`);

		const each_array_4 = $.ensure_array_like(examplePolicies);

		for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
			let example = each_array_4[$$index_4];

			$$renderer.push(`<button type="button"${$.attr_class('example-card svelte-1o3uqd0', void 0, { 'selected': selectedExample === example.name })}><div class="example-header svelte-1o3uqd0"><strong class="svelte-1o3uqd0">${$.escape(example.name)}</strong></div> <p class="example-description svelte-1o3uqd0">${$.escape(example.description)}</p> <div class="example-config svelte-1o3uqd0"><div>Policy: <code class="svelte-1o3uqd0">${$.escape(example.config.policy)}</code></div> <div>Percentage: <code class="svelte-1o3uqd0">${$.escape(example.config.percentage)}%</code></div> `);

			if (example.config.reportingURI) {
				$$renderer.push(`<!--[0--><div>Reports: <code class="svelte-1o3uqd0">${$.escape(example.config.reportingURI)}</code></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div></div>`);
	});
}