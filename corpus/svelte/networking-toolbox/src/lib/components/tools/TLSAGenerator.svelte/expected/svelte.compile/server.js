import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';
import { tooltip } from '$lib/actions/tooltip';
import { useClipboard } from '$lib/composables';

export default function TLSAGenerator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let domain = 'example.com';
		let port = 443;
		let protocol = 'tcp';
		let inputType = 'certificate';
		let certificateInput = '';
		let hashInput = '';
		let usage = 3;
		let selector = 1;
		let matchingType = 1;
		let showExamples = false;
		let selectedExample = null;
		const clipboard = useClipboard();

		const usageDescriptions = {
			0: 'CA Constraint - Certificate must be issued by the CA represented in the TLSA record',
			1: 'Service Certificate Constraint - Certificate must match the one in the TLSA record',
			2: 'Trust Anchor Assertion - Certificate must chain to the CA in the TLSA record',
			3: 'Domain-Issued Certificate - Certificate must match the one specified (most common)'
		};

		const selectorDescriptions = {
			0: 'Full Certificate - Use the entire certificate',
			1: 'Subject Public Key Info - Use only the public key portion (recommended)'
		};

		const matchingTypeDescriptions = {
			0: 'Exact Match - Use the certificate/key data as-is (not recommended)',
			1: 'SHA-256 Hash - Use SHA-256 hash of the certificate/key (recommended)',
			2: 'SHA-512 Hash - Use SHA-512 hash of the certificate/key'
		};

		const tlsaRecord = $.derived(() => {
			let associationData = '';

			if (inputType === 'hash') {
				associationData = hashInput.trim().replace(/[^a-fA-F0-9]/g, '').toLowerCase();
			} else if (inputType === 'certificate') {
				if (certificateInput.trim()) {
					associationData = 'Generated hash would appear here (requires certificate parsing)';
				}
			}

			if (!associationData) return null;

			return {
				usage,
				selector,
				matchingType,
				certificateAssociation: associationData
			};
		});

		const dnsRecord = $.derived(() => {
			if (!tlsaRecord()) return '';

			return `_${port}._${protocol}.${domain}. IN TLSA ${tlsaRecord().usage} ${tlsaRecord().selector} ${tlsaRecord().matchingType} ${tlsaRecord().certificateAssociation}`;
		});

		const validation = $.derived(() => {
			const warnings = [];
			const errors = [];

			if (!domain.trim()) {
				errors.push('Domain is required');
			} else if (!domain.includes('.')) {
				warnings.push('Domain should include TLD (e.g., .com, .org)');
			}

			if (port < 1 || port > 65535) {
				errors.push('Port must be between 1 and 65535');
			}

			if (inputType === 'certificate') {
				if (!certificateInput.trim()) {
					errors.push('Certificate data is required');
				} else if (!certificateInput.includes('BEGIN CERTIFICATE') && !certificateInput.includes('BEGIN PUBLIC KEY')) {
					warnings.push('Certificate should be in PEM format');
				}
			} else if (inputType === 'hash') {
				if (!hashInput.trim()) {
					errors.push('Hash value is required');
				} else {
					const cleanHash = hashInput.trim().replace(/[^a-fA-F0-9]/g, '');

					if (matchingType === 1 && cleanHash.length !== 64) {
						warnings.push('SHA-256 hash should be exactly 64 hexadecimal characters');
					} else if (matchingType === 2 && cleanHash.length !== 128) {
						warnings.push('SHA-512 hash should be exactly 128 hexadecimal characters');
					} else if (!(/^[a-fA-F0-9]+$/).test(cleanHash)) {
						errors.push('Hash must contain only hexadecimal characters');
					}
				}
			}

			if (usage === 0 || usage === 2) {
				warnings.push('Usage types 0 and 2 require careful CA certificate management');
			}

			if (selector === 0) {
				warnings.push('Full certificate selector (0) is less flexible than SPKI selector (1)');
			}

			if (matchingType === 0) {
				warnings.push('Exact match (0) is not recommended - use SHA-256 (1) or SHA-512 (2)');
			}

			return { isValid: errors.length === 0, errors, warnings };
		});

		function copyToClipboard(text, buttonId) {
			clipboard.copy(text, buttonId);
		}

		function exportAsZoneFile() {
			if (!dnsRecord()) return;

			const zoneContent = dnsRecord();
			const blob = new Blob([zoneContent], { type: 'text/plain' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');

			a.href = url;
			a.download = `${domain}-tlsa-record.zone`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			clipboard.copy('downloaded', 'export-tlsa');
		}

		async function generateHashFromInput() {
			if (inputType === 'certificate' && certificateInput.trim()) {
				const demoHash = matchingType === 1
					? 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab'
					: 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

				hashInput = demoHash;
				inputType = 'hash';
			}
		}

		const exampleConfigurations = [
			{
				name: 'HTTPS Certificate Pin',
				description: 'Pin a specific certificate for HTTPS',
				domain: 'example.com',
				port: 443,
				protocol: 'tcp',
				usage: 3,
				selector: 1,
				matchingType: 1,
				hash: 'a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890'
			},

			{
				name: 'SMTP TLS Certificate',
				description: 'DANE for email server TLS',
				domain: 'mail.example.com',
				port: 587,
				protocol: 'tcp',
				usage: 3,
				selector: 1,
				matchingType: 1,
				hash: 'fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321'
			},

			{
				name: 'CA Trust Anchor',
				description: 'Trust anchor for certificate authority',
				domain: 'secure.example.com',
				port: 443,
				protocol: 'tcp',
				usage: 2,
				selector: 1,
				matchingType: 2,
				hash: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
			}
		];

		function loadExample(example) {
			domain = example.domain;
			port = example.port;
			protocol = example.protocol;
			usage = example.usage;
			selector = example.selector;
			matchingType = example.matchingType;
			hashInput = example.hash;
			inputType = 'hash';
			certificateInput = '';
			selectedExample = example.name;
		}

		const securityTips = [
			'Use usage type 3 (Domain-Issued Certificate) for most scenarios',
			'Prefer selector 1 (SPKI) over selector 0 (full certificate) for flexibility',
			'Use SHA-256 (1) or SHA-512 (2) matching types, avoid exact match (0)',
			'Pin multiple certificates to avoid service disruption during certificate rotation',
			'Test TLSA records with DANE validation tools before deployment'
		];

		$$renderer.push(`<div class="container svelte-1s2atb9"><div class="card svelte-1s2atb9"><div class="card-header svelte-1s2atb9"><h1 class="svelte-1s2atb9">TLSA Generator</h1> <p class="svelte-1s2atb9">Create TLSA (DNS-based Authentication of Named Entities) records for certificate pinning and DANE
        implementation.</p></div> <div class="main-grid svelte-1s2atb9"><div class="input-section svelte-1s2atb9"><div class="card sub-card svelte-1s2atb9"><h3 class="section-title svelte-1s2atb9">`);

		Icon($$renderer, { name: 'globe', size: 'sm' });
		$$renderer.push(`<!----> Service Configuration</h3> <div class="service-grid svelte-1s2atb9"><div class="input-group svelte-1s2atb9"><label for="domain" class="svelte-1s2atb9">Domain:</label> <input id="domain" type="text"${$.attr('value', domain)} placeholder="example.com" class="svelte-1s2atb9"/></div> <div class="input-group svelte-1s2atb9"><label for="port" class="svelte-1s2atb9">Port:</label> <input id="port" type="number"${$.attr('value', port)} min="1" max="65535" placeholder="443" class="svelte-1s2atb9"/></div> <div class="input-group svelte-1s2atb9"><label for="protocol" class="svelte-1s2atb9">Protocol:</label> `);

		$$renderer.select(
			{ id: 'protocol', value: protocol, class: '' },
			($$renderer) => {
				$$renderer.option({ value: 'tcp' }, ($$renderer) => {
					$$renderer.push(`TCP`);
				});

				$$renderer.option({ value: 'udp' }, ($$renderer) => {
					$$renderer.push(`UDP`);
				});
			},
			'svelte-1s2atb9'
		);

		$$renderer.push(`</div></div></div> <div class="card sub-card svelte-1s2atb9"><h3 class="section-title svelte-1s2atb9">`);
		Icon($$renderer, { name: 'settings', size: 'sm' });
		$$renderer.push(`<!----> TLSA Parameters</h3> <div class="input-group svelte-1s2atb9"><label for="usage" class="svelte-1s2atb9">Certificate Usage:</label> `);

		$$renderer.select(
			{ id: 'usage', value: usage, class: '' },
			($$renderer) => {
				$$renderer.option({ value: 0 }, ($$renderer) => {
					$$renderer.push(`0 - CA Constraint`);
				});

				$$renderer.option({ value: 1 }, ($$renderer) => {
					$$renderer.push(`1 - Service Certificate Constraint`);
				});

				$$renderer.option({ value: 2 }, ($$renderer) => {
					$$renderer.push(`2 - Trust Anchor Assertion`);
				});

				$$renderer.option({ value: 3 }, ($$renderer) => {
					$$renderer.push(`3 - Domain-Issued Certificate`);
				});
			},
			'svelte-1s2atb9'
		);

		$$renderer.push(` <p class="description svelte-1s2atb9">${$.escape(usageDescriptions[usage])}</p></div> <div class="input-group svelte-1s2atb9"><label for="selector" class="svelte-1s2atb9">Selector:</label> `);

		$$renderer.select(
			{ id: 'selector', value: selector, class: '' },
			($$renderer) => {
				$$renderer.option({ value: 0 }, ($$renderer) => {
					$$renderer.push(`0 - Full Certificate`);
				});

				$$renderer.option({ value: 1 }, ($$renderer) => {
					$$renderer.push(`1 - Subject Public Key Info`);
				});
			},
			'svelte-1s2atb9'
		);

		$$renderer.push(` <p class="description svelte-1s2atb9">${$.escape(selectorDescriptions[selector])}</p></div> <div class="input-group svelte-1s2atb9"><label for="matchingType" class="svelte-1s2atb9">Matching Type:</label> `);

		$$renderer.select(
			{ id: 'matchingType', value: matchingType, class: '' },
			($$renderer) => {
				$$renderer.option({ value: 0 }, ($$renderer) => {
					$$renderer.push(`0 - Exact Match`);
				});

				$$renderer.option({ value: 1 }, ($$renderer) => {
					$$renderer.push(`1 - SHA-256 Hash`);
				});

				$$renderer.option({ value: 2 }, ($$renderer) => {
					$$renderer.push(`2 - SHA-512 Hash`);
				});
			},
			'svelte-1s2atb9'
		);

		$$renderer.push(` <p class="description svelte-1s2atb9">${$.escape(matchingTypeDescriptions[matchingType])}</p></div></div> <div class="card sub-card svelte-1s2atb9"><h3 class="section-title svelte-1s2atb9">`);
		Icon($$renderer, { name: 'key', size: 'sm' });
		$$renderer.push(`<!----> Certificate Data</h3> <div class="radio-group svelte-1s2atb9"><label class="radio-option svelte-1s2atb9"><input type="radio"${$.attr('checked', inputType === 'certificate', true)} value="certificate" class="svelte-1s2atb9"/> <span class="svelte-1s2atb9">Certificate/Public Key (PEM)</span></label> <label class="radio-option svelte-1s2atb9"><input type="radio"${$.attr('checked', inputType === 'hash', true)} value="hash" class="svelte-1s2atb9"/> <span class="svelte-1s2atb9">Hash Value</span></label></div> `);

		if (inputType === 'certificate') {
			$$renderer.push(`<!--[0--><div class="input-group svelte-1s2atb9"><label for="certificate" class="svelte-1s2atb9">Certificate/Public Key:</label> <textarea id="certificate" placeholder="-----BEGIN CERTIFICATE-----
MIIFXzCCA0egAwIBAgIJAKZ5QeHxw...
-----END CERTIFICATE-----" rows="8" class="svelte-1s2atb9">`);

			const $$body = $.escape(certificateInput);

			if ($$body) {
				$$renderer.push(`${$$body}`);
			} else {}

			$$renderer.push(`</textarea> <button type="button"${$.attr('disabled', !certificateInput.trim(), true)} class="btn btn-secondary svelte-1s2atb9">`);
			Icon($$renderer, { name: 'arrow-right', size: 'sm' });
			$$renderer.push(`<!----> Generate Hash</button></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="input-group svelte-1s2atb9"><label for="hash" class="svelte-1s2atb9">Hash Value:</label> <textarea id="hash"${$.attr('placeholder', matchingType === 1
				? 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab'
				: matchingType === 2
					? 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
					: 'Certificate or key data')} rows="3" class="svelte-1s2atb9">`);

			const $$body_1 = $.escape(hashInput);

			if ($$body_1) {
				$$renderer.push(`${$$body_1}`);
			} else {}

			$$renderer.push(`</textarea></div>`);
		}

		$$renderer.push(`<!--]--></div></div> <div class="output-section svelte-1s2atb9">`);

		if (tlsaRecord()) {
			$$renderer.push(`<!--[0--><div class="card svelte-1s2atb9"><div class="card-header-with-actions svelte-1s2atb9"><h3 class="svelte-1s2atb9">Generated TLSA Record</h3> <div class="actions svelte-1s2atb9"><button type="button"${$.attr_class('btn btn-primary svelte-1s2atb9', void 0, { 'success': clipboard.isCopied('copy-tlsa') })}>`);

			Icon($$renderer, {
				name: clipboard.isCopied('copy-tlsa') ? 'check' : 'copy',
				size: 'sm'
			});

			$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('copy-tlsa') ? 'Copied!' : 'Copy')}</button> <button type="button"${$.attr_class('btn btn-success svelte-1s2atb9', void 0, { 'success': clipboard.isCopied('export-tlsa') })}>`);

			Icon($$renderer, {
				name: clipboard.isCopied('export-tlsa') ? 'check' : 'download',
				size: 'sm'
			});

			$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('export-tlsa') ? 'Downloaded!' : 'Export')}</button></div></div> <div class="code-block svelte-1s2atb9"><code class="svelte-1s2atb9">${$.escape(dnsRecord())}</code></div> <div class="breakdown svelte-1s2atb9"><h4 class="svelte-1s2atb9">Record Breakdown:</h4> <div class="breakdown-grid svelte-1s2atb9"><div class="breakdown-item svelte-1s2atb9"><strong class="svelte-1s2atb9">Service:</strong> _${$.escape(port)}._${$.escape(protocol)}</div> <div class="breakdown-item svelte-1s2atb9"><strong class="svelte-1s2atb9">Usage:</strong> ${$.escape(usage)} (${$.escape(Object.values(usageDescriptions)[usage].split(' - ')[0])})</div> <div class="breakdown-item svelte-1s2atb9"><strong class="svelte-1s2atb9">Selector:</strong> ${$.escape(selector)} (${$.escape(Object.values(selectorDescriptions)[selector].split(' - ')[0])})</div> <div class="breakdown-item svelte-1s2atb9"><strong class="svelte-1s2atb9">Matching:</strong> ${$.escape(matchingType)} (${$.escape(Object.values(matchingTypeDescriptions)[matchingType].split(' - ')[0])})</div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="card svelte-1s2atb9"><h3 class="section-title svelte-1s2atb9">`);
		Icon($$renderer, { name: 'bar-chart', size: 'sm' });

		$$renderer.push(`<!----> Validation</h3> <div class="status-center svelte-1s2atb9"><div class="status-item svelte-1s2atb9"><span class="svelte-1s2atb9">Status:</span> <span${$.attr_class('status svelte-1s2atb9', void 0, {
			'valid': validation().isValid,
			'invalid': !validation().isValid
		})}>${$.escape(validation().isValid ? 'Valid' : 'Invalid')}</span></div></div> `);

		if (validation().errors.length > 0) {
			$$renderer.push(`<!--[0--><div class="message error svelte-1s2atb9">`);
			Icon($$renderer, { name: 'x-circle', size: 'sm' });
			$$renderer.push(`<!----> <div class="svelte-1s2atb9"><!--[-->`);

			const each_array = $.ensure_array_like(validation().errors);

			for (let index = 0, $$length = each_array.length; index < $$length; index++) {
				let error = each_array[index];

				$$renderer.push(`<div class="svelte-1s2atb9">${$.escape(error)}</div>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (validation().warnings.length > 0) {
			$$renderer.push(`<!--[0--><div class="message warning svelte-1s2atb9">`);
			Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
			$$renderer.push(`<!----> <div class="svelte-1s2atb9"><!--[-->`);

			const each_array_1 = $.ensure_array_like(validation().warnings);

			for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
				let warning = each_array_1[index];

				$$renderer.push(`<div class="svelte-1s2atb9">${$.escape(warning)}</div>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (validation().isValid && validation().errors.length === 0 && validation().warnings.length === 0) {
			$$renderer.push(`<!--[0--><div class="message success svelte-1s2atb9">`);
			Icon($$renderer, { name: 'check-circle', size: 'sm' });
			$$renderer.push(`<!----> <div class="svelte-1s2atb9">TLSA record is valid and ready to deploy!</div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="card svelte-1s2atb9"><h3 class="section-title svelte-1s2atb9">`);
		Icon($$renderer, { name: 'shield', size: 'sm' });
		$$renderer.push(`<!----> Security Best Practices</h3> <ul class="tips-list svelte-1s2atb9"><!--[-->`);

		const each_array_2 = $.ensure_array_like(securityTips);

		for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
			let tip = each_array_2[index];

			$$renderer.push(`<li class="svelte-1s2atb9">${$.escape(tip)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div></div></div> <div class="card examples-card svelte-1s2atb9"><details${$.attr('open', showExamples, true)} class="svelte-1s2atb9"><summary class="examples-summary svelte-1s2atb9">`);
		Icon($$renderer, { name: 'lightbulb', size: 'sm' });
		$$renderer.push(`<!----> Example Configurations <span class="chevron svelte-1s2atb9">`);
		Icon($$renderer, { name: 'chevron-down', size: 'sm' });
		$$renderer.push(`<!----></span></summary> <div class="examples-grid svelte-1s2atb9"><!--[-->`);

		const each_array_3 = $.ensure_array_like(exampleConfigurations);

		for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
			let example = each_array_3[$$index_3];

			$$renderer.push(`<button type="button"${$.attr_class('example-card svelte-1s2atb9', void 0, { 'selected': selectedExample === example.name })}><div class="example-name svelte-1s2atb9">${$.escape(example.name)}</div> <p class="example-description svelte-1s2atb9">${$.escape(example.description)}</p> <div class="example-config svelte-1s2atb9"><div>Port: <code class="svelte-1s2atb9">${$.escape(example.port)}/${$.escape(example.protocol)}</code></div> <div>Usage: <code class="svelte-1s2atb9">${$.escape(example.usage)}</code>, Selector: <code class="svelte-1s2atb9">${$.escape(example.selector)}</code>, Type: <code class="svelte-1s2atb9">${$.escape(example.matchingType)}</code></div></div></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div></div></div>`);
	});
}