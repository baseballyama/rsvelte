import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';
import { tooltip } from '$lib/actions/tooltip';
import { SvelteSet } from 'svelte/reactivity';

export default function CAABuilder($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let domain = 'example.com';

		let records = [
			{ flag: 0, tag: 'issue', value: '', enabled: false },
			{ flag: 0, tag: 'issuewild', value: '', enabled: false },
			{ flag: 0, tag: 'iodef', value: '', enabled: false }
		];

		let showExamples = false;
		let selectedExample = null;

		// Button success states
		let buttonStates = {};

		const commonCAs = [
			{ name: "Let's Encrypt", value: 'letsencrypt.org' },
			{ name: 'DigiCert', value: 'digicert.com' },
			{ name: 'Sectigo', value: 'sectigo.com' },
			{ name: 'GlobalSign', value: 'globalsign.com' },
			{ name: 'GoDaddy', value: 'godaddy.com' },
			{ name: 'Amazon (ACM)', value: 'amazon.com' },
			{ name: 'Google Trust Services', value: 'pki.goog' },
			{ name: 'Cloudflare', value: 'comodoca.com' }
		];

		const tagDescriptions = {
			issue: 'Authorize certificate issuance for this domain',
			issuewild: 'Authorize wildcard certificate issuance for this domain',
			iodef: 'Contact information for certificate abuse reports'
		};

		const _flagDescriptions = {
			0: 'Non-critical flag - unknown tags can be ignored',
			128: 'Critical flag - unknown tags must cause rejection'
		};

		const caaRecords = $.derived(() => {
			return records.filter((record) => record.enabled && record.value.trim()).map((record) => {
				let value = record.value.trim();

				// Format iodef values properly
				if (record.tag === 'iodef') {
					if (value.includes('@') && !value.startsWith('mailto:')) {
						value = `mailto:${value}`;
					} else if (value.startsWith('http') && !value.startsWith('http://') && !value.startsWith('https://')) {
						value = `https://${value}`;
					}
				}

				return `${domain}. IN CAA ${record.flag} ${record.tag} "${value}"`;
			});
		});

		const validation = $.derived(() => {
			const warnings = [];
			const errors = [];
			const enabledRecords = records.filter((r) => r.enabled);

			// Check domain format
			if (!domain.trim()) {
				errors.push('Domain is required');
			} else if (!domain.includes('.')) {
				warnings.push('Domain should include TLD (e.g., .com, .org)');
			}

			// Check if any records are enabled
			if (enabledRecords.length === 0) {
				warnings.push('No CAA records enabled - this will not provide any protection');
			}

			// Check for issue records
			const issueRecords = enabledRecords.filter((r) => r.tag === 'issue');

			const issuewildRecords = enabledRecords.filter((r) => r.tag === 'issuewild');

			if (issueRecords.length === 0 && issuewildRecords.length === 0) {
				warnings.push('No issue or issuewild records - certificates can be issued by any CA');
			}

			// Check for wildcard without base issue
			if (issuewildRecords.length > 0 && issueRecords.length === 0) {
				warnings.push('Wildcard authorization without base domain authorization may cause issues');
			}

			// Check for deny-all configuration
			const hasIssueNone = issueRecords.some((r) => r.value.trim() === ';');

			const hasIssuewildNone = issuewildRecords.some((r) => r.value.trim() === ';');

			if (hasIssueNone && hasIssuewildNone) {
				warnings.push('Both issue and issuewild set to ";" - this will block ALL certificate issuance');
			}

			// Validate iodef records
			const iodefRecords = enabledRecords.filter((r) => r.tag === 'iodef');

			for (const record of iodefRecords) {
				const value = record.value.trim();

				if (value) {
					if (value.includes('@')) {
						// Email format
						if (!value.includes('@') || !value.startsWith('mailto:') && value.indexOf('@') === -1) {
							errors.push('Invalid iodef email format - use "mailto:user@domain.com" or "user@domain.com"');
						}
					} else if (!value.startsWith('http://') && !value.startsWith('https://')) {
						warnings.push('iodef URL should start with http:// or https://');
					}
				}
			}

			// Check for conflicting records
			const duplicateValues = new SvelteSet();

			const seen = new SvelteSet();

			for (const record of enabledRecords) {
				const key = `${record.tag}:${record.value.trim()}`;

				if (seen.has(key)) {
					duplicateValues.add(record.value.trim());
				}

				seen.add(key);
			}

			if (duplicateValues.size > 0) {
				warnings.push(`Duplicate CAA records found: ${Array.from(duplicateValues).join(', ')}`);
			}

			return {
				isValid: errors.length === 0,
				errors,
				warnings,
				recordCount: enabledRecords.length
			};
		});

		function addRecord(tag) {
			records.push({ flag: 0, tag, value: '', enabled: true });
			records = records;
		}

		function removeRecord(index) {
			records.splice(index, 1);
			records = records;
		}

		function addCA(recordIndex, ca) {
			records[recordIndex].value = ca;
			records[recordIndex].enabled = true;
			records = records;
		}

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
			const zoneContent = caaRecords().join('\n');
			const blob = new Blob([zoneContent], { type: 'text/plain' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');

			a.href = url;
			a.download = `${domain}-caa-records.zone`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			showButtonSuccess('export-caa');
		}

		const exampleConfigurations = [
			{
				name: "Let's Encrypt Only",
				description: "Allow only Let's Encrypt certificates",
				domain: 'example.com',
				records: [
					{
						flag: 0,
						tag: 'issue',
						value: 'letsencrypt.org',
						enabled: true
					},

					{
						flag: 0,
						tag: 'iodef',
						value: 'security@example.com',
						enabled: true
					}
				]
			},

			{
				name: 'Multiple CAs',
				description: 'Allow certificates from multiple providers',
				domain: 'mycompany.com',
				records: [
					{
						flag: 0,
						tag: 'issue',
						value: 'letsencrypt.org',
						enabled: true
					},
					{ flag: 0, tag: 'issue', value: 'digicert.com', enabled: true },
					{
						flag: 0,
						tag: 'issuewild',
						value: 'letsencrypt.org',
						enabled: true
					},

					{
						flag: 0,
						tag: 'iodef',
						value: 'certificates@mycompany.com',
						enabled: true
					}
				]
			},

			{
				name: 'No Certificates',
				description: 'Block all certificate issuance',
				domain: 'secure.example.com',
				records: [
					{ flag: 0, tag: 'issue', value: ';', enabled: true },
					{ flag: 0, tag: 'issuewild', value: ';', enabled: true },
					{
						flag: 0,
						tag: 'iodef',
						value: 'security@example.com',
						enabled: true
					}
				]
			}
		];

		function loadExample(example) {
			domain = example.domain;

			// Reset all records
			records = records.map((r) => ({ ...r, enabled: false, value: '' }));

			// Add example records
			for (const exampleRecord of example.records) {
				const existingIndex = records.findIndex((r) => r.tag === exampleRecord.tag && !r.enabled);

				if (existingIndex >= 0) {
					records[existingIndex] = { ...exampleRecord };
				} else {
					records.push({ ...exampleRecord });
				}
			}

			records = records;
			selectedExample = example.name;
			showExamples = false;
		}

		const securityTips = [
			'Start with monitoring: Add iodef records first to receive notifications',
			'Use specific CAs: Only authorize certificate authorities you actually use',
			'Include wildcards: Add issuewild records if you use wildcard certificates',
			'Monitor regularly: Check iodef notifications for unauthorized issuance attempts',
			'Test thoroughly: Verify legitimate certificate renewals still work after deployment'
		];

		$$renderer.push(`<div class="card"><div class="card-header"><h1>CAA Record Builder</h1> <p class="card-subtitle">Build CAA (Certificate Authority Authorization) records to control which CAs can issue certificates for your
      domain.</p></div> <div class="grid-layout"><div class="input-section"><div class="domain-section svelte-1dy6vo6"><div class="section-header svelte-1dy6vo6"><h3 class="svelte-1dy6vo6">`);

		Icon($$renderer, { name: 'globe', size: 'sm' });
		$$renderer.push(`<!----> Domain Configuration</h3></div> <div class="input-group svelte-1dy6vo6"><label for="domain" class="svelte-1dy6vo6">Domain:</label> <input id="domain" type="text"${$.attr('value', domain)} placeholder="example.com" class="svelte-1dy6vo6"/></div></div> <div class="records-section svelte-1dy6vo6"><div class="section-header svelte-1dy6vo6"><h3 class="svelte-1dy6vo6">`);
		Icon($$renderer, { name: 'shield', size: 'sm' });
		$$renderer.push(`<!----> CAA Records</h3> <div class="add-buttons svelte-1dy6vo6"><button type="button" class="add-btn svelte-1dy6vo6">`);
		Icon($$renderer, { name: 'plus', size: 'sm' });
		$$renderer.push(`<!----> Issue</button> <button type="button" class="add-btn svelte-1dy6vo6">`);
		Icon($$renderer, { name: 'plus', size: 'sm' });
		$$renderer.push(`<!----> Wildcard</button> <button type="button" class="add-btn svelte-1dy6vo6">`);
		Icon($$renderer, { name: 'plus', size: 'sm' });
		$$renderer.push(`<!----> Contact</button></div></div> <div class="records-list svelte-1dy6vo6"><!--[-->`);

		const each_array = $.ensure_array_like(records);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let record = each_array[index];

			$$renderer.push(`<div${$.attr_class('record-item svelte-1dy6vo6', void 0, { 'enabled': record.enabled })}><div class="record-header svelte-1dy6vo6"><label class="record-toggle svelte-1dy6vo6"><input type="checkbox"${$.attr('checked', record.enabled, true)} class="svelte-1dy6vo6"/> <span class="record-tag svelte-1dy6vo6">${$.escape(record.tag.toUpperCase())}</span> <span class="record-description svelte-1dy6vo6">${$.escape(tagDescriptions[record.tag])}</span></label> <div class="record-controls svelte-1dy6vo6"><div class="flag-select svelte-1dy6vo6">`);

			$$renderer.select(
				{ value: record.flag, disabled: !record.enabled, class: '' },
				($$renderer) => {
					$$renderer.option({ value: 0 }, ($$renderer) => {
						$$renderer.push(`Flag 0 (Non-critical)`);
					});

					$$renderer.option({ value: 128 }, ($$renderer) => {
						$$renderer.push(`Flag 128 (Critical)`);
					});
				},
				'svelte-1dy6vo6'
			);

			$$renderer.push(`</div> <button type="button" class="remove-btn svelte-1dy6vo6">`);
			Icon($$renderer, { name: 'x', size: 'sm' });

			$$renderer.push(`<!----></button></div></div> <div class="record-value-section svelte-1dy6vo6"><input type="text"${$.attr('value', record.value)}${$.attr('disabled', !record.enabled, true)}${$.attr('placeholder', record.tag === 'issue'
				? 'letsencrypt.org or ; (to deny all)'
				: record.tag === 'issuewild'
					? 'letsencrypt.org or ; (to deny all)'
					: 'security@example.com or https://example.com/security')} class="record-input svelte-1dy6vo6"/> `);

			if ((record.tag === 'issue' || record.tag === 'issuewild') && record.enabled) {
				$$renderer.push(`<!--[0--><div class="ca-shortcuts svelte-1dy6vo6"><span class="shortcuts-label svelte-1dy6vo6">Common CAs:</span> <div class="ca-buttons svelte-1dy6vo6"><!--[-->`);

				const each_array_1 = $.ensure_array_like(commonCAs.slice(0, 4));

				for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
					let ca = each_array_1[$$index];

					$$renderer.push(`<button type="button" class="ca-btn svelte-1dy6vo6">${$.escape(ca.name)}</button>`);
				}

				$$renderer.push(`<!--]--> <button type="button" class="ca-btn deny-all svelte-1dy6vo6">Deny All</button></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		$$renderer.push(`<!--]--></div></div></div> <div class="results-section"><div class="records-output-section"><div class="section-header svelte-1dy6vo6"><h3 class="svelte-1dy6vo6">Generated CAA Records</h3> <div class="actions svelte-1dy6vo6"><button type="button"${$.attr_class('copy-btn svelte-1dy6vo6', void 0, { 'success': buttonStates['copy-caa'] })}${$.attr('disabled', caaRecords().length === 0, true)}>`);

		Icon($$renderer, {
			name: buttonStates['copy-caa'] ? 'check' : 'copy',
			size: 'sm'
		});

		$$renderer.push(`<!----> ${$.escape(buttonStates['copy-caa'] ? 'Copied!' : 'Copy')}</button> <button type="button"${$.attr_class('export-btn svelte-1dy6vo6', void 0, { 'success': buttonStates['export-caa'] })}${$.attr('disabled', caaRecords().length === 0, true)}>`);

		Icon($$renderer, {
			name: buttonStates['export-caa'] ? 'check' : 'download',
			size: 'sm'
		});

		$$renderer.push(`<!----> ${$.escape(buttonStates['export-caa'] ? 'Downloaded!' : 'Export')}</button></div></div> `);

		if (caaRecords().length > 0) {
			$$renderer.push(`<!--[0--><div class="records-output"><!--[-->`);

			const each_array_2 = $.ensure_array_like(caaRecords());

			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let record = each_array_2[$$index_2];

				$$renderer.push(`<div class="code-block svelte-1dy6vo6"><code class="svelte-1dy6vo6">${$.escape(record)}</code></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="no-records svelte-1dy6vo6">`);
			Icon($$renderer, { name: 'info', size: 'sm' });
			$$renderer.push(`<!----> <span>Enable and configure CAA records to see output</span></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="validation-section"><div class="section-header svelte-1dy6vo6"><h3 class="svelte-1dy6vo6">`);
		Icon($$renderer, { name: 'bar-chart', size: 'sm' });

		$$renderer.push(`<!----> Policy Validation</h3></div> <div class="validation-stats svelte-1dy6vo6"><div class="stat-item svelte-1dy6vo6"><span class="stat-label svelte-1dy6vo6">Active Records:</span> <span class="stat-value svelte-1dy6vo6">${$.escape(validation().recordCount)}</span></div> <div class="stat-item svelte-1dy6vo6"><span class="stat-label svelte-1dy6vo6">Status:</span> <span${$.attr_class('stat-value svelte-1dy6vo6', void 0, {
			'success': validation().isValid,
			'error': !validation().isValid
		})}>${$.escape(validation().isValid ? 'Valid' : 'Invalid')}</span></div></div> `);

		if (validation().errors.length > 0) {
			$$renderer.push(`<!--[0--><div class="validation-messages error svelte-1dy6vo6">`);
			Icon($$renderer, { name: 'x-circle', size: 'sm' });
			$$renderer.push(`<!----> <div class="messages svelte-1dy6vo6"><!--[-->`);

			const each_array_3 = $.ensure_array_like(validation().errors);

			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let error = each_array_3[$$index_3];

				$$renderer.push(`<div class="message svelte-1dy6vo6">${$.escape(error)}</div>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (validation().warnings.length > 0) {
			$$renderer.push(`<!--[0--><div class="validation-messages warning svelte-1dy6vo6">`);
			Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
			$$renderer.push(`<!----> <div class="messages svelte-1dy6vo6"><!--[-->`);

			const each_array_4 = $.ensure_array_like(validation().warnings);

			for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
				let warning = each_array_4[$$index_4];

				$$renderer.push(`<div class="message svelte-1dy6vo6">${$.escape(warning)}</div>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (validation().isValid && validation().errors.length === 0 && validation().warnings.length === 0) {
			$$renderer.push(`<!--[0--><div class="validation-messages success svelte-1dy6vo6">`);
			Icon($$renderer, { name: 'check-circle', size: 'sm' });
			$$renderer.push(`<!----> <div class="message svelte-1dy6vo6">CAA configuration is valid and ready to deploy!</div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="security-guide"><div class="section-header svelte-1dy6vo6"><h3 class="svelte-1dy6vo6">`);
		Icon($$renderer, { name: 'info', size: 'sm' });
		$$renderer.push(`<!----> Security Tips</h3></div> <div class="security-tips svelte-1dy6vo6"><ul class="svelte-1dy6vo6"><!--[-->`);

		const each_array_5 = $.ensure_array_like(securityTips);

		for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
			let tip = each_array_5[$$index_5];

			$$renderer.push(`<li class="svelte-1dy6vo6">${$.escape(tip)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div></div></div></div> <div class="examples-section svelte-1dy6vo6"><details class="examples-toggle svelte-1dy6vo6"${$.attr('open', showExamples, true)}><summary class="svelte-1dy6vo6">`);
		Icon($$renderer, { name: 'lightbulb', size: 'sm' });
		$$renderer.push(`<!----> Example Configurations</summary> <div class="examples-grid svelte-1dy6vo6"><!--[-->`);

		const each_array_6 = $.ensure_array_like(exampleConfigurations);

		for (let $$index_7 = 0, $$length = each_array_6.length; $$index_7 < $$length; $$index_7++) {
			let example = each_array_6[$$index_7];

			$$renderer.push(`<button type="button"${$.attr_class('example-card svelte-1dy6vo6', void 0, { 'selected': selectedExample === example.name })}><div class="example-header svelte-1dy6vo6"><strong class="svelte-1dy6vo6">${$.escape(example.name)}</strong></div> <p class="example-description svelte-1dy6vo6">${$.escape(example.description)}</p> <div class="example-records svelte-1dy6vo6"><!--[-->`);

			const each_array_7 = $.ensure_array_like(example.records);

			for (let $$index_6 = 0, $$length = each_array_7.length; $$index_6 < $$length; $$index_6++) {
				let record = each_array_7[$$index_6];

				$$renderer.push(`<div class="example-record svelte-1dy6vo6"><code class="svelte-1dy6vo6">${$.escape(record.tag)}: ${$.escape(record.value)}</code></div>`);
			}

			$$renderer.push(`<!--]--></div></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div></div>`);
	});
}