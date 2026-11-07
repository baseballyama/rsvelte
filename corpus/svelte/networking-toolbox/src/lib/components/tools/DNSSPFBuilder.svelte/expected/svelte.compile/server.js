import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';
import { tooltip } from '$lib/actions/tooltip';

export default function DNSSPFBuilder($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let showExamples = false;
		let selectedExample = null;

		// Button success states
		let buttonStates = {};

		let mechanisms = [
			{ type: 'ip4', qualifier: '+', value: '', enabled: false },
			{ type: 'ip6', qualifier: '+', value: '', enabled: false },
			{ type: 'a', qualifier: '+', value: '', enabled: false },
			{ type: 'mx', qualifier: '+', value: '', enabled: false },
			{ type: 'include', qualifier: '+', value: '', enabled: false },
			{ type: 'ptr', qualifier: '~', value: '', enabled: false },
			{ type: 'exists', qualifier: '+', value: '', enabled: false },
			{ type: 'all', qualifier: '~', value: '', enabled: true }
		];

		let modifiers = [
			{ type: 'redirect', value: '', enabled: false },
			{ type: 'exp', value: '', enabled: false }
		];

		const _qualifierLabels = { '+': 'Pass', '-': 'Fail', '~': 'SoftFail', '?': 'Neutral' };

		const mechanismDescriptions = {
			all: 'Matches all IPs (should be last)',
			include: 'Include another domains SPF record',
			a: 'Match A/AAAA records of domain',
			mx: 'Match MX records of domain',
			ptr: 'Match PTR records (discouraged)',
			ip4: 'Match specific IPv4 address/range',
			ip6: 'Match specific IPv6 address/range',
			exists: 'Check if domain exists'
		};

		const spfRecord = $.derived(() => {
			const enabledMechanisms = mechanisms.filter((m) => m.enabled);
			const enabledModifiers = modifiers.filter((m) => m.enabled);
			let record = 'v=spf1';

			// Add mechanisms
			for (const mech of enabledMechanisms) {
				let mechString = '';

				if (mech.type === 'all') {
					mechString = `${mech.qualifier}all`;
				} else if (mech.type === 'a' || mech.type === 'mx' || mech.type === 'ptr') {
					mechString = `${mech.qualifier}${mech.type}`;

					if (mech.value.trim()) {
						mechString += `:${mech.value.trim()}`;
					}
				} else {
					if (mech.value.trim()) {
						mechString = `${mech.qualifier}${mech.type}:${mech.value.trim()}`;
					}
				}

				if (mechString) {
					record += ` ${mechString}`;
				}
			}

			// Add modifiers
			for (const mod of enabledModifiers) {
				if (mod.value.trim()) {
					record += ` ${mod.type}=${mod.value.trim()}`;
				}
			}

			return record;
		});

		const validation = $.derived(() => {
			const enabledMechanisms = mechanisms.filter((m) => m.enabled);
			const _enabledModifiers = modifiers.filter((m) => m.enabled);
			const messages = [];
			const warnings = [];
			let dnsLookups = 0;

			// Check for required elements
			if (enabledMechanisms.length === 0) {
				messages.push('At least one mechanism must be enabled');
			}

			// Count DNS lookups
			for (const mech of enabledMechanisms) {
				if (['include', 'a', 'mx', 'exists'].includes(mech.type)) {
					dnsLookups++;
				}

				if (mech.type === 'ptr') {
					dnsLookups += 2; // PTR requires reverse and forward lookup
				}
			}

			// Check DNS lookup limit
			if (dnsLookups > 10) {
				messages.push(`Too many DNS lookups (${dnsLookups}). SPF limit is 10.`);
			} else if (dnsLookups > 8) {
				warnings.push(`High DNS lookup count (${dnsLookups}). Consider consolidating.`);
			}

			// Validate mechanism values
			for (const mech of enabledMechanisms) {
				if ((mech.type === 'include' || mech.type === 'exists') && !mech.value.trim()) {
					messages.push(`${mech.type} mechanism requires a domain value`);
				}

				if ((mech.type === 'ip4' || mech.type === 'ip6') && !mech.value.trim()) {
					messages.push(`${mech.type} mechanism requires an IP address`);
				}

				// Basic IP validation
				if (mech.type === 'ip4' && mech.value.trim()) {
					const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;

					if (!ipv4Regex.test(mech.value.trim())) {
						messages.push(`Invalid IPv4 address/range: ${mech.value}`);
					}
				}

				if (mech.type === 'ip6' && mech.value.trim()) {
					// Basic IPv6 validation (simplified)
					if (!mech.value.includes(':')) {
						messages.push(`Invalid IPv6 address: ${mech.value}`);
					}
				}
			}

			// Check for 'all' mechanism position
			const allIndex = enabledMechanisms.findIndex((m) => m.type === 'all');

			if (allIndex >= 0 && allIndex < enabledMechanisms.length - 1) {
				warnings.push("'all' mechanism should typically be last");
			}

			// Check for PTR usage
			if (enabledMechanisms.some((m) => m.type === 'ptr')) {
				warnings.push('PTR mechanism is discouraged (slow and unreliable)');
			}

			// Check record length
			const recordLength = spfRecord().length;

			if (recordLength > 255) {
				messages.push(`SPF record too long (${recordLength} chars). DNS TXT limit is 255.`);
			} else if (recordLength > 200) {
				warnings.push(`SPF record is long (${recordLength} chars). Consider shortening.`);
			}

			// Check for conflicting modifiers
			const redirectEnabled = modifiers.find((m) => m.type === 'redirect' && m.enabled);

			if (redirectEnabled && enabledMechanisms.length > 0) {
				warnings.push('redirect modifier should not be used with mechanisms');
			}

			return {
				isValid: messages.length === 0,
				messages,
				warnings,
				dnsLookups,
				recordLength
			};
		});

		function addCustomMechanism() {
			mechanisms.unshift({ type: 'include', qualifier: '+', value: '', enabled: true });
			mechanisms = mechanisms;
		}

		function removeMechanism(index) {
			mechanisms.splice(index, 1);
			mechanisms = mechanisms;
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
			const zoneContent = `example.com. IN TXT "${spfRecord()}"`;
			const blob = new Blob([zoneContent], { type: 'text/plain' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');

			a.href = url;
			a.download = 'spf-record.zone';
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			showButtonSuccess('export-spf');
		}

		function loadExample(example) {
			mechanisms = mechanisms.map((m) => ({ ...m, enabled: false }));

			for (const exampleMech of example.mechanisms) {
				const existing = mechanisms.find((m) => m.type === exampleMech.type && !m.enabled);

				if (existing) {
					existing.enabled = exampleMech.enabled;
					existing.qualifier = exampleMech.qualifier;
					existing.value = exampleMech.value;
				}
			}

			mechanisms = mechanisms;
			selectedExample = example.name;
		}

		const examplePolicies = [
			{
				name: 'Basic Email Provider',
				description: 'Simple SPF policy for Google Workspace',
				mechanisms: [
					{
						type: 'include',
						qualifier: '+',
						value: '_spf.google.com',
						enabled: true
					},
					{ type: 'all', qualifier: '~', value: '', enabled: true }
				]
			},

			{
				name: 'Multiple Providers',
				description: 'SPF policy for multiple email services',
				mechanisms: [
					{
						type: 'include',
						qualifier: '+',
						value: '_spf.google.com',
						enabled: true
					},

					{
						type: 'include',
						qualifier: '+',
						value: 'mailgun.org',
						enabled: true
					},

					{
						type: 'include',
						qualifier: '+',
						value: 'servers.mcsv.net',
						enabled: true
					},
					{ type: 'all', qualifier: '~', value: '', enabled: true }
				]
			},

			{
				name: 'Server + Provider',
				description: 'Dedicated server with email provider fallback',
				mechanisms: [
					{
						type: 'ip4',
						qualifier: '+',
						value: '203.0.113.1',
						enabled: true
					},
					{ type: 'mx', qualifier: '+', value: '', enabled: true },
					{
						type: 'include',
						qualifier: '+',
						value: '_spf.google.com',
						enabled: true
					},
					{ type: 'all', qualifier: '-', value: '', enabled: true }
				]
			},

			{
				name: 'Strict Policy',
				description: 'Restrictive SPF policy with hard fail',
				mechanisms: [
					{
						type: 'ip4',
						qualifier: '+',
						value: '203.0.113.0/24',
						enabled: true
					},

					{
						type: 'include',
						qualifier: '+',
						value: '_spf.google.com',
						enabled: true
					},
					{ type: 'all', qualifier: '-', value: '', enabled: true }
				]
			}
		];

		$$renderer.push(`<div class="card"><div class="card-header"><h1>SPF Policy Builder</h1> <p class="card-subtitle">Craft SPF (Sender Policy Framework) policies with mechanisms, qualifiers, and validation.</p></div> <div class="grid-layout"><div class="input-section"><div class="mechanisms-section svelte-jtzall"><div class="section-header svelte-jtzall"><h3 class="svelte-jtzall">`);
		Icon($$renderer, { name: 'settings', size: 'sm' });
		$$renderer.push(`<!----> SPF Mechanisms</h3> <button type="button" class="add-btn svelte-jtzall">`);
		Icon($$renderer, { name: 'plus', size: 'sm' });
		$$renderer.push(`<!----> Add Custom</button></div> <div class="mechanisms-list svelte-jtzall"><!--[-->`);

		const each_array = $.ensure_array_like(mechanisms);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let mechanism = each_array[index];

			$$renderer.push(`<div${$.attr_class('mechanism-item svelte-jtzall', void 0, { 'enabled': mechanism.enabled })}><div class="mechanism-header svelte-jtzall"><label class="mechanism-toggle svelte-jtzall"><input type="checkbox"${$.attr('checked', mechanism.enabled, true)} class="svelte-jtzall"/> <span class="mechanism-type svelte-jtzall">${$.escape(mechanism.type.toUpperCase())}</span> <span class="mechanism-description svelte-jtzall">${$.escape(mechanismDescriptions[mechanism.type])}</span></label> <div class="mechanism-controls svelte-jtzall"><div class="qualifier-select svelte-jtzall">`);

			$$renderer.select(
				{
					value: mechanism.qualifier,
					disabled: !mechanism.enabled,
					class: ''
				},
				($$renderer) => {
					$$renderer.option({ value: '+' }, ($$renderer) => {
						$$renderer.push(`+ Pass`);
					});

					$$renderer.option({ value: '-' }, ($$renderer) => {
						$$renderer.push(`- Fail`);
					});

					$$renderer.option({ value: '~' }, ($$renderer) => {
						$$renderer.push(`~ SoftFail`);
					});

					$$renderer.option({ value: '?' }, ($$renderer) => {
						$$renderer.push(`? Neutral`);
					});
				},
				'svelte-jtzall'
			);

			$$renderer.push(`</div> `);

			if (!['all', 'a', 'mx', 'ptr', 'ip4', 'ip6', 'include', 'exists'].includes(mechanism.type) || index < 3) {
				$$renderer.push(`<!--[0--><button type="button" class="remove-btn svelte-jtzall">`);
				Icon($$renderer, { name: 'x', size: 'sm' });
				$$renderer.push(`<!----></button>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div> `);

			if (!['all'].includes(mechanism.type)) {
				$$renderer.push(`<!--[0--><input type="text"${$.attr('value', mechanism.value)}${$.attr('disabled', !mechanism.enabled, true)}${$.attr('placeholder', mechanism.type === 'ip4'
					? '203.0.113.1 or 203.0.113.0/24'
					: mechanism.type === 'ip6'
						? '2001:db8::1 or 2001:db8::/32'
						: mechanism.type === 'include'
							? '_spf.google.com'
							: mechanism.type === 'exists' ? 'check.example.com' : 'domain.com (optional)')} class="mechanism-input svelte-jtzall"/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></div></div> <div class="modifiers-section svelte-jtzall"><div class="section-header svelte-jtzall"><h3 class="svelte-jtzall">`);
		Icon($$renderer, { name: 'wrench', size: 'sm' });
		$$renderer.push(`<!----> SPF Modifiers</h3></div> <div class="modifiers-list svelte-jtzall"><!--[-->`);

		const each_array_1 = $.ensure_array_like(modifiers);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let modifier = each_array_1[$$index_1];

			$$renderer.push(`<div${$.attr_class('modifier-item svelte-jtzall', void 0, { 'enabled': modifier.enabled })}><label class="modifier-toggle svelte-jtzall"><input type="checkbox"${$.attr('checked', modifier.enabled, true)} class="svelte-jtzall"/> <span class="modifier-type svelte-jtzall">${$.escape(modifier.type)}=</span></label> <input type="text"${$.attr('value', modifier.value)}${$.attr('disabled', !modifier.enabled, true)}${$.attr('placeholder', modifier.type === 'redirect' ? 'fallback.example.com' : 'explain.example.com')} class="modifier-input svelte-jtzall"/></div>`);
		}

		$$renderer.push(`<!--]--></div></div></div> <div class="results-section"><div class="spf-record-section svelte-jtzall"><div class="section-header svelte-jtzall"><h3 class="svelte-jtzall">Generated SPF Record</h3> <div class="actions svelte-jtzall"><button type="button"${$.attr_class('copy-btn svelte-jtzall', void 0, { 'success': buttonStates['copy-spf'] })}>`);

		Icon($$renderer, {
			name: buttonStates['copy-spf'] ? 'check' : 'copy',
			size: 'sm'
		});

		$$renderer.push(`<!----> ${$.escape(buttonStates['copy-spf'] ? 'Copied!' : 'Copy')}</button> <button type="button"${$.attr_class('export-btn svelte-jtzall', void 0, { 'success': buttonStates['export-spf'] })}>`);

		Icon($$renderer, {
			name: buttonStates['export-spf'] ? 'check' : 'download',
			size: 'sm'
		});

		$$renderer.push(`<!----> ${$.escape(buttonStates['export-spf'] ? 'Downloaded!' : 'Export')}</button></div></div> <div class="record-output svelte-jtzall"><div class="code-block svelte-jtzall"><code class="svelte-jtzall">${$.escape(spfRecord())}</code></div></div> <div class="zone-file-output svelte-jtzall"><h4 class="svelte-jtzall">Zone File Format:</h4> <div class="code-block svelte-jtzall"><code class="svelte-jtzall">example.com. IN TXT "${$.escape(spfRecord())}"</code></div></div></div> <div class="validation-section svelte-jtzall"><div class="section-header svelte-jtzall"><h3 class="svelte-jtzall">`);
		Icon($$renderer, { name: 'certified', size: 'sm' });

		$$renderer.push(`<!----> Policy Validation</h3></div> <div class="stats-grid svelte-jtzall"><div class="stat-item svelte-jtzall"><span class="stat-label svelte-jtzall">DNS Lookups:</span> <span${$.attr_class('stat-value svelte-jtzall', void 0, {
			'warning': validation().dnsLookups > 8,
			'error': validation().dnsLookups > 10
		})}>${$.escape(validation().dnsLookups)}/10</span></div> <div class="stat-item svelte-jtzall"><span class="stat-label svelte-jtzall">Record Length:</span> <span${$.attr_class('stat-value svelte-jtzall', void 0, {
			'warning': validation().recordLength > 200,
			'error': validation().recordLength > 255
		})}>${$.escape(validation().recordLength)}/255 chars</span></div> <div class="stat-item svelte-jtzall"><span class="stat-label svelte-jtzall">Status:</span> <span${$.attr_class('stat-value svelte-jtzall', void 0, {
			'success': validation().isValid,
			'error': !validation().isValid
		})}>${$.escape(validation().isValid ? 'Valid' : 'Invalid')}</span></div></div> `);

		if (validation().messages.length > 0) {
			$$renderer.push(`<!--[0--><div class="validation-messages error svelte-jtzall">`);
			Icon($$renderer, { name: 'x-circle', size: 'sm' });
			$$renderer.push(`<!----> <div class="messages svelte-jtzall"><!--[-->`);

			const each_array_2 = $.ensure_array_like(validation().messages);

			for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
				let message = each_array_2[index];

				$$renderer.push(`<div class="message svelte-jtzall">${$.escape(message)}</div>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (validation().warnings.length > 0) {
			$$renderer.push(`<!--[0--><div class="validation-messages warning svelte-jtzall">`);
			Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
			$$renderer.push(`<!----> <div class="messages svelte-jtzall"><!--[-->`);

			const each_array_3 = $.ensure_array_like(validation().warnings);

			for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
				let warning = each_array_3[index];

				$$renderer.push(`<div class="message svelte-jtzall">${$.escape(warning)}</div>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (validation().isValid && validation().messages.length === 0 && validation().warnings.length === 0) {
			$$renderer.push(`<!--[0--><div class="validation-messages success svelte-jtzall">`);
			Icon($$renderer, { name: 'check-circle', size: 'sm' });
			$$renderer.push(`<!----> <div class="message svelte-jtzall">SPF policy is valid and ready to use!</div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div></div> <div class="examples-section svelte-jtzall"><details class="examples-toggle svelte-jtzall"${$.attr('open', showExamples, true)}><summary class="svelte-jtzall">`);
		Icon($$renderer, { name: 'lightbulb', size: 'sm' });
		$$renderer.push(`<!----> Example Policies</summary> <div class="examples-grid svelte-jtzall"><!--[-->`);

		const each_array_4 = $.ensure_array_like(examplePolicies);

		for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
			let example = each_array_4[$$index_4];

			$$renderer.push(`<button type="button"${$.attr_class('example-card svelte-jtzall', void 0, { 'selected': selectedExample === example.name })}><div class="example-header svelte-jtzall"><strong class="svelte-jtzall">${$.escape(example.name)}</strong></div> <p class="example-description svelte-jtzall">${$.escape(example.description)}</p> <div class="example-preview svelte-jtzall">${$.escape(example.mechanisms.map((m) => `${m.qualifier}${m.type}${m.value ? `:${m.value}` : ''}`).join(' '))}</div></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div></div>`);
	});
}