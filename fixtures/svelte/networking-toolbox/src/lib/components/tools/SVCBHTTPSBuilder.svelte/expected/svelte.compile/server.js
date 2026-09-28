import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';
import { tooltip } from '$lib/actions/tooltip';
import { useClipboard } from '$lib/composables';

export default function SVCBHTTPSBuilder($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let domain = 'example.com';
		let recordType = 'HTTPS';
		let priority = 1;
		let targetName = '.';

		let parameters = [
			{ key: 'mandatory', value: '', enabled: false },
			{ key: 'alpn', value: '', enabled: false },
			{ key: 'no-default-alpn', value: '', enabled: false },
			{ key: 'port', value: '', enabled: false },
			{ key: 'ipv4hint', value: '', enabled: false },
			{ key: 'ech', value: '', enabled: false },
			{ key: 'ipv6hint', value: '', enabled: false }
		];

		let showExamples = false;
		let selectedExample = null;

		// Button success states
		const clipboard = useClipboard();

		const parameterDescriptions = {
			mandatory: 'Mandatory parameters that must be understood by the client',
			alpn: 'Application-Layer Protocol Negotiation identifiers (e.g., h2, h3)',
			'no-default-alpn': 'Indicates that no default ALPN should be assumed',
			port: 'Alternative port number for the service',
			ipv4hint: 'IPv4 address hints to avoid additional DNS lookups',
			ech: 'Encrypted Client Hello configuration',
			ipv6hint: 'IPv6 address hints to avoid additional DNS lookups'
		};

		const parameterKeyMap = {
			mandatory: 0,
			alpn: 1,
			'no-default-alpn': 2,
			port: 3,
			ipv4hint: 4,
			ech: 5,
			ipv6hint: 6
		};

		const serviceRecord = $.derived(() => {
			const enabledParams = parameters.filter((p) => p.enabled && (p.value.trim() || p.key === 'no-default-alpn'));

			return {
				recordType,
				priority,
				targetName: targetName.trim() || '.',
				parameters: enabledParams
			};
		});

		const dnsRecord = $.derived(() => {
			const record = serviceRecord();
			const target = record.targetName === '.' ? '.' : record.targetName;
			let recordString = `${domain}. IN ${record.recordType} ${record.priority} ${target}`;

			if (record.parameters.length > 0) {
				const paramStrings = record.parameters.map((param) => {
					const _keyNum = parameterKeyMap[param.key];

					if (param.key === 'no-default-alpn') {
						return `${param.key}`;
					} else if (param.key === 'alpn') {
						// Format ALPN values as comma-separated quoted strings
						const alpnValues = param.value.split(',').map((v) => v.trim()).filter((v) => v);

						return `${param.key}=${alpnValues.join(',')}`;
					} else if (param.key === 'ipv4hint' || param.key === 'ipv6hint') {
						// Format IP hints as comma-separated values
						const ipValues = param.value.split(',').map((v) => v.trim()).filter((v) => v);

						return `${param.key}=${ipValues.join(',')}`;
					} else {
						return `${param.key}=${param.value.trim()}`;
					}
				});

				recordString += ` ${paramStrings.join(' ')}`;
			}

			return recordString;
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

			// Check priority
			if (priority < 0 || priority > 65535) {
				errors.push('Priority must be between 0 and 65535');
			}

			if (priority === 0 && targetName !== '.') {
				warnings.push('Priority 0 should typically use "." as target (alias mode)');
			}

			// Check target name
			if (targetName && targetName !== '.' && !targetName.includes('.')) {
				warnings.push('Target name should be a FQDN or "." for same domain');
			}

			// Validate parameters
			const enabledParams = parameters.filter((p) => p.enabled);

			for (const param of enabledParams) {
				if (param.key === 'port') {
					const port = parseInt(param.value);

					if (isNaN(port) || port < 1 || port > 65535) {
						errors.push('Port must be a number between 1 and 65535');
					}
				}

				if (param.key === 'alpn' && !param.value.trim()) {
					errors.push('ALPN parameter requires at least one protocol identifier');
				}

				if (param.key === 'ipv4hint') {
					const ips = param.value.split(',').map((ip) => ip.trim());

					for (const ip of ips) {
						if (ip && !(/^(\d{1,3}\.){3}\d{1,3}$/).test(ip)) {
							errors.push(`Invalid IPv4 address in ipv4hint: ${ip}`);
						}
					}
				}

				if (param.key === 'ipv6hint') {
					const ips = param.value.split(',').map((ip) => ip.trim());

					for (const ip of ips) {
						if (ip && !ip.includes(':')) {
							errors.push(`Invalid IPv6 address in ipv6hint: ${ip}`);
						}
					}
				}
			}

			// Check for conflicting parameters
			const hasAlpn = enabledParams.some((p) => p.key === 'alpn');

			const hasNoDefaultAlpn = enabledParams.some((p) => p.key === 'no-default-alpn');

			if (hasAlpn && hasNoDefaultAlpn) {
				warnings.push('Using both alpn and no-default-alpn may cause conflicts');
			}

			// Check record type specific recommendations
			if (recordType === 'HTTPS' && priority > 0) {
				const hasPort = enabledParams.some((p) => p.key === 'port');

				if (!hasPort) {
					warnings.push('HTTPS records typically benefit from port parameter');
				}
			}

			return {
				isValid: errors.length === 0,
				errors,
				warnings,
				parameterCount: enabledParams.length
			};
		});

		function exportAsZoneFile() {
			if (!dnsRecord()) return;

			const zoneContent = dnsRecord();
			const blob = new Blob([zoneContent], { type: 'text/plain' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');

			a.href = url;
			a.download = `${domain}-${recordType.toLowerCase()}-record.zone`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			clipboard.copy('downloaded', 'export-svcb');
		}

		function _addParameter(key) {
			const param = parameters.find((p) => p.key === key);

			if (param) {
				param.enabled = true;
				parameters = parameters;
			}
		}

		const exampleConfigurations = [
			{
				name: 'HTTPS with HTTP/2',
				description: 'Basic HTTPS service with HTTP/2 support',
				recordType: 'HTTPS',
				domain: 'example.com',
				priority: 1,
				targetName: '.',
				parameters: [
					{ key: 'alpn', value: 'h2,h3', enabled: true },
					{ key: 'port', value: '443', enabled: true }
				]
			},

			{
				name: 'CDN Endpoint',
				description: 'HTTPS service pointing to CDN with IP hints',
				recordType: 'HTTPS',
				domain: 'www.example.com',
				priority: 1,
				targetName: 'cdn.example.com',
				parameters: [
					{ key: 'alpn', value: 'h2', enabled: true },
					{
						key: 'ipv4hint',
						value: '203.0.113.1,203.0.113.2',
						enabled: true
					},
					{ key: 'port', value: '443', enabled: true }
				]
			},

			{
				name: 'Alternative Service',
				description: 'Alternative HTTPS service on different port',
				recordType: 'HTTPS',
				domain: 'api.example.com',
				priority: 2,
				targetName: 'api-alt.example.com',
				parameters: [
					{ key: 'alpn', value: 'h2', enabled: true },
					{ key: 'port', value: '8443', enabled: true },
					{ key: 'ipv4hint', value: '203.0.113.10', enabled: true }
				]
			}
		];

		function loadExample(example) {
			domain = example.domain;
			recordType = example.recordType;
			priority = example.priority;
			targetName = example.targetName;

			// Reset all parameters
			parameters = parameters.map((p) => ({ ...p, enabled: false, value: '' }));

			// Set example parameters
			for (const exampleParam of example.parameters) {
				const param = parameters.find((p) => p.key === exampleParam.key);

				if (param) {
					param.enabled = exampleParam.enabled;
					param.value = exampleParam.value;
				}
			}

			parameters = parameters;
			selectedExample = example.name;
		}

		const usageNotes = [
			'Priority 0 creates an alias record (AliasMode), priority >0 creates a service record (ServiceMode)',
			'Use "." as target name to indicate the same domain as the owner name',
			'ALPN values should match the protocols actually supported by the service',
			'IP hints can improve connection performance by avoiding additional DNS lookups',
			'ECH parameter enables Encrypted Client Hello for enhanced privacy'
		];

		$$renderer.push(`<div class="card"><div class="card-header"><h1>SVCB/HTTPS Builder</h1> <p class="card-subtitle">Build SVCB and HTTPS resource records with service parameters for enhanced service discovery and connection
      optimization.</p></div> <div class="grid-layout"><div class="input-section"><div class="service-config-section svelte-xt4xlo"><div class="section-header svelte-xt4xlo"><h3 class="svelte-xt4xlo">`);

		Icon($$renderer, { name: 'globe', size: 'sm' });
		$$renderer.push(`<!----> Service Configuration</h3></div> <div class="service-config-grid svelte-xt4xlo"><div class="input-group svelte-xt4xlo"><label for="domain" class="svelte-xt4xlo">Domain:</label> <input id="domain" type="text"${$.attr('value', domain)} placeholder="example.com" class="svelte-xt4xlo"/></div> <div class="input-group svelte-xt4xlo"><label for="recordType" class="svelte-xt4xlo">Record Type:</label> `);

		$$renderer.select(
			{ id: 'recordType', value: recordType, class: '' },
			($$renderer) => {
				$$renderer.option({ value: 'HTTPS' }, ($$renderer) => {
					$$renderer.push(`HTTPS`);
				});

				$$renderer.option({ value: 'SVCB' }, ($$renderer) => {
					$$renderer.push(`SVCB`);
				});
			},
			'svelte-xt4xlo'
		);

		$$renderer.push(`</div> <div class="input-group svelte-xt4xlo"><label for="priority" class="svelte-xt4xlo">Priority:</label> <input id="priority" type="number"${$.attr('value', priority)} min="0" max="65535" placeholder="1" class="svelte-xt4xlo"/></div> <div class="input-group svelte-xt4xlo"><label for="targetName" class="svelte-xt4xlo">Target Name:</label> <input id="targetName" type="text"${$.attr('value', targetName)} placeholder=". (same domain)" class="svelte-xt4xlo"/></div></div></div> <div class="parameters-section svelte-xt4xlo"><div class="section-header svelte-xt4xlo"><h3 class="svelte-xt4xlo">`);
		Icon($$renderer, { name: 'settings', size: 'sm' });
		$$renderer.push(`<!----> Service Parameters</h3></div> <div class="parameters-list svelte-xt4xlo"><!--[-->`);

		const each_array = $.ensure_array_like(parameters);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let parameter = each_array[$$index];

			$$renderer.push(`<div${$.attr_class('parameter-item svelte-xt4xlo', void 0, { 'enabled': parameter.enabled })}><div class="parameter-header svelte-xt4xlo"><label class="parameter-toggle svelte-xt4xlo"><input type="checkbox"${$.attr('checked', parameter.enabled, true)} class="svelte-xt4xlo"/> <span class="parameter-name svelte-xt4xlo">${$.escape(parameter.key)}</span> <span class="parameter-description svelte-xt4xlo">${$.escape(parameterDescriptions[parameter.key])}</span></label></div> `);

			if (parameter.key !== 'no-default-alpn') {
				$$renderer.push(`<!--[0--><div class="parameter-value svelte-xt4xlo"><input type="text"${$.attr('value', parameter.value)}${$.attr('disabled', !parameter.enabled, true)}${$.attr('placeholder', parameter.key === 'alpn'
					? 'h2,h3'
					: parameter.key === 'port'
						? '443'
						: parameter.key === 'ipv4hint'
							? '203.0.113.1,203.0.113.2'
							: parameter.key === 'ipv6hint'
								? '2001:db8::1,2001:db8::2'
								: parameter.key === 'ech'
									? 'base64-encoded-config'
									: parameter.key === 'mandatory' ? '1,3' : 'value')} class="parameter-input svelte-xt4xlo"/></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></div></div></div> <div class="results-section"><div class="record-section"><div class="section-header svelte-xt4xlo"><h3 class="svelte-xt4xlo">Generated ${$.escape(recordType)} Record</h3> <div class="actions svelte-xt4xlo"><button type="button"${$.attr_class('copy-btn svelte-xt4xlo', void 0, { 'success': clipboard.isCopied('copy-svcb') })}>`);

		Icon($$renderer, {
			name: clipboard.isCopied('copy-svcb') ? 'check' : 'copy',
			size: 'sm'
		});

		$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('copy-svcb') ? 'Copied!' : 'Copy')}</button> <button type="button"${$.attr_class('export-btn svelte-xt4xlo', void 0, { 'success': clipboard.isCopied('export-svcb') })}>`);

		Icon($$renderer, {
			name: clipboard.isCopied('export-svcb') ? 'check' : 'download',
			size: 'sm'
		});

		$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('export-svcb') ? 'Downloaded!' : 'Export')}</button></div></div> <div class="record-output"><div class="code-block svelte-xt4xlo"><code class="svelte-xt4xlo">${$.escape(dnsRecord())}</code></div></div> <div class="record-breakdown svelte-xt4xlo"><h4 class="svelte-xt4xlo">Record Breakdown:</h4> <div class="breakdown-grid svelte-xt4xlo"><div class="breakdown-item svelte-xt4xlo"><strong class="svelte-xt4xlo">Type:</strong> ${$.escape(recordType)}</div> <div class="breakdown-item svelte-xt4xlo"><strong class="svelte-xt4xlo">Priority:</strong> ${$.escape(priority)} (${$.escape(priority === 0 ? 'Alias Mode' : 'Service Mode')})</div> <div class="breakdown-item svelte-xt4xlo"><strong class="svelte-xt4xlo">Target:</strong> ${$.escape(serviceRecord().targetName)}</div> <div class="breakdown-item svelte-xt4xlo"><strong class="svelte-xt4xlo">Parameters:</strong> ${$.escape(validation().parameterCount)}</div></div></div></div> <div class="validation-section"><div class="section-header svelte-xt4xlo"><h3 class="svelte-xt4xlo">`);
		Icon($$renderer, { name: 'bar-chart', size: 'sm' });

		$$renderer.push(`<!----> Validation</h3></div> <div class="validation-status svelte-xt4xlo"><div class="status-item svelte-xt4xlo"><span class="status-label svelte-xt4xlo">Status:</span> <span${$.attr_class('status-value svelte-xt4xlo', void 0, {
			'success': validation().isValid,
			'error': !validation().isValid
		})}>${$.escape(validation().isValid ? 'Valid' : 'Invalid')}</span></div></div> `);

		if (validation().errors.length > 0) {
			$$renderer.push(`<!--[0--><div class="validation-messages error svelte-xt4xlo">`);
			Icon($$renderer, { name: 'x-circle', size: 'sm' });
			$$renderer.push(`<!----> <div class="messages svelte-xt4xlo"><!--[-->`);

			const each_array_1 = $.ensure_array_like(validation().errors);

			for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
				let error = each_array_1[index];

				$$renderer.push(`<div class="message svelte-xt4xlo">${$.escape(error)}</div>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (validation().warnings.length > 0) {
			$$renderer.push(`<!--[0--><div class="validation-messages warning svelte-xt4xlo">`);
			Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
			$$renderer.push(`<!----> <div class="messages svelte-xt4xlo"><!--[-->`);

			const each_array_2 = $.ensure_array_like(validation().warnings);

			for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
				let warning = each_array_2[index];

				$$renderer.push(`<div class="message svelte-xt4xlo">${$.escape(warning)}</div>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (validation().isValid && validation().errors.length === 0 && validation().warnings.length === 0) {
			$$renderer.push(`<!--[0--><div class="validation-messages success svelte-xt4xlo">`);
			Icon($$renderer, { name: 'check-circle', size: 'sm' });
			$$renderer.push(`<!----> <div class="message svelte-xt4xlo">${$.escape(recordType)} record is valid and ready to deploy!</div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="usage-guide"><div class="section-header svelte-xt4xlo"><h3 class="svelte-xt4xlo">`);
		Icon($$renderer, { name: 'info', size: 'sm' });
		$$renderer.push(`<!----> Usage Notes</h3></div> <div class="usage-tips svelte-xt4xlo"><ul class="svelte-xt4xlo"><!--[-->`);

		const each_array_3 = $.ensure_array_like(usageNotes);

		for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
			let note = each_array_3[index];

			$$renderer.push(`<li class="svelte-xt4xlo">${$.escape(note)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div></div></div></div> <div class="examples-section svelte-xt4xlo"><details class="examples-toggle svelte-xt4xlo"${$.attr('open', showExamples, true)}><summary class="svelte-xt4xlo">`);
		Icon($$renderer, { name: 'lightbulb', size: 'sm' });
		$$renderer.push(`<!----> Example Configurations</summary> <div class="examples-grid svelte-xt4xlo"><!--[-->`);

		const each_array_4 = $.ensure_array_like(exampleConfigurations);

		for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
			let example = each_array_4[$$index_4];

			$$renderer.push(`<button type="button"${$.attr_class('example-card svelte-xt4xlo', void 0, { 'selected': selectedExample === example.name })}><div class="example-header svelte-xt4xlo"><strong class="svelte-xt4xlo">${$.escape(example.name)}</strong></div> <p class="example-description svelte-xt4xlo">${$.escape(example.description)}</p> <div class="example-config svelte-xt4xlo"><div>Type: <code class="svelte-xt4xlo">${$.escape(example.recordType)}</code>, Priority: <code class="svelte-xt4xlo">${$.escape(example.priority)}</code></div> <div>Target: <code class="svelte-xt4xlo">${$.escape(example.targetName)}</code></div> <div class="example-params svelte-xt4xlo">Params: ${$.escape(example.parameters.map((p) => `${p.key}=${p.value}`).join(', '))}</div></div></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div></div>`);
	});
}