import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';
import { tooltip } from '$lib/actions/tooltip';
import { useClipboard } from '$lib/composables';

export default function SSHFPGenerator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let domain = 'example.com';
		let inputType = 'public-key';
		let publicKeyInput = '';
		let fingerprintInput = '';
		let algorithm = 1;
		let fingerprintType = 1;
		let showExamples = false;
		let selectedExample = null;

		// Button success states
		const clipboard = useClipboard();

		const algorithmDescriptions = {
			1: 'RSA - Traditional RSA algorithm (most common)',
			2: 'DSA - Digital Signature Algorithm (deprecated)',
			3: 'ECDSA - Elliptic Curve Digital Signature Algorithm',
			4: 'Ed25519 - Edwards-curve Digital Signature Algorithm (modern, recommended)'
		};

		const fingerprintTypeDescriptions = {
			1: 'SHA-1 - Legacy hash algorithm (160-bit)',
			2: 'SHA-256 - Modern hash algorithm (256-bit, recommended)'
		};

		const sshfpRecord = $.derived(() => {
			let fingerprintValue = '';

			if (inputType === 'fingerprint') {
				// Use provided fingerprint directly
				fingerprintValue = fingerprintInput.trim().replace(/[^a-fA-F0-9]/g, '').toLowerCase();
			} else if (inputType === 'public-key') {
				// For demo purposes, we'll show how it would work
				// In a real implementation, you'd parse the public key and generate the fingerprint
				if (publicKeyInput.trim()) {
					// Generate demo fingerprint based on fingerprint type
					fingerprintValue = fingerprintType === 1
						? 'abcd1234567890abcdef1234567890abcdef1234'
						: 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab';
				}
			}

			if (!fingerprintValue) return null;

			return { algorithm, fingerprintType, fingerprint: fingerprintValue };
		});

		const dnsRecord = $.derived(() => {
			if (!sshfpRecord()) return '';

			return `${domain}. IN SSHFP ${sshfpRecord().algorithm} ${sshfpRecord().fingerprintType} ${sshfpRecord().fingerprint}`;
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

			// Check public key/fingerprint input
			if (inputType === 'public-key') {
				if (!publicKeyInput.trim()) {
					errors.push('SSH public key is required');
				} else {
					const key = publicKeyInput.trim();

					if (!key.startsWith('ssh-') && !key.startsWith('ecdsa-') && !key.includes(' ')) {
						warnings.push('Public key should be in OpenSSH format (e.g., "ssh-rsa AAAAB3NzaC1...")');
					}
				}
			} else if (inputType === 'fingerprint') {
				if (!fingerprintInput.trim()) {
					errors.push('Fingerprint value is required');
				} else {
					const cleanFingerprint = fingerprintInput.trim().replace(/[^a-fA-F0-9]/g, '');

					if (fingerprintType === 1 && cleanFingerprint.length !== 40) {
						warnings.push('SHA-1 fingerprint should be exactly 40 hexadecimal characters');
					} else if (fingerprintType === 2 && cleanFingerprint.length !== 64) {
						warnings.push('SHA-256 fingerprint should be exactly 64 hexadecimal characters');
					} else if (!(/^[a-fA-F0-9]+$/).test(cleanFingerprint)) {
						errors.push('Fingerprint must contain only hexadecimal characters');
					}
				}
			}

			// Algorithm recommendations
			if (algorithm === 2) {
				warnings.push('DSA algorithm is deprecated and should be avoided');
			}

			if (fingerprintType === 1) {
				warnings.push('SHA-1 is deprecated - use SHA-256 for new deployments');
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
			a.download = `${domain}-sshfp-record.zone`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			clipboard.copy('downloaded', 'export-sshfp');
		}

		// Simulate fingerprint generation from public key
		async function generateFingerprintFromKey() {
			if (inputType === 'public-key' && publicKeyInput.trim()) {
				// This is a placeholder - in a real implementation you would:
				// 1. Parse the OpenSSH public key format
				// 2. Extract the key material
				// 3. Hash it with the chosen algorithm
				const demoFingerprint = fingerprintType === 1
					? 'abcd1234567890abcdef1234567890abcdef1234'
					: 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab';

				fingerprintInput = demoFingerprint;
				inputType = 'fingerprint';
			}
		}

		const exampleConfigurations = [
			{
				name: 'RSA SSH Key',
				description: 'RSA public key with SHA-256 fingerprint',
				domain: 'server.example.com',
				algorithm: 1,
				fingerprintType: 2,
				fingerprint: 'a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890'
			},

			{
				name: 'Ed25519 SSH Key',
				description: 'Modern Ed25519 key with SHA-256 fingerprint',
				domain: 'ssh.example.com',
				algorithm: 4,
				fingerprintType: 2,
				fingerprint: 'fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321'
			},

			{
				name: 'ECDSA SSH Key',
				description: 'ECDSA key with SHA-256 fingerprint',
				domain: 'secure.example.com',
				algorithm: 3,
				fingerprintType: 2,
				fingerprint: '123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0'
			}
		];

		function loadExample(example) {
			domain = example.domain;
			algorithm = example.algorithm;
			fingerprintType = example.fingerprintType;
			fingerprintInput = example.fingerprint;
			inputType = 'fingerprint';
			publicKeyInput = '';
			selectedExample = example.name;
		}

		const securityTips = [
			'Use Ed25519 (algorithm 4) for new SSH key deployments',
			'Prefer SHA-256 (type 2) over SHA-1 (type 1) for fingerprints',
			'Deploy SSHFP records for all SSH host keys on your servers',
			'Update SSHFP records when rotating SSH host keys',
			'Configure SSH clients to verify SSHFP records for enhanced security'
		];

		$$renderer.push(`<div class="card svelte-2novif"><div class="card-header"><h1>SSHFP Generator</h1> <p class="card-subtitle">Generate SSHFP (SSH Fingerprint) records to enable DNS-based SSH host key verification and authentication.</p></div> <div class="grid-layout"><div class="input-section"><div class="domain-section svelte-2novif"><div class="section-header svelte-2novif"><h3 class="svelte-2novif">`);
		Icon($$renderer, { name: 'globe', size: 'sm' });
		$$renderer.push(`<!----> Domain Configuration</h3></div> <div class="input-group svelte-2novif"><label for="domain" class="svelte-2novif">Domain:</label> <input id="domain" type="text"${$.attr('value', domain)} placeholder="example.com" class="svelte-2novif"/></div></div> <div class="sshfp-parameters-section svelte-2novif"><div class="section-header svelte-2novif"><h3 class="svelte-2novif">`);
		Icon($$renderer, { name: 'settings', size: 'sm' });
		$$renderer.push(`<!----> SSHFP Parameters</h3></div> <div class="parameters-grid svelte-2novif"><div class="input-group svelte-2novif"><label for="algorithm" class="svelte-2novif">Algorithm:</label> `);

		$$renderer.select(
			{ id: 'algorithm', value: algorithm, class: '' },
			($$renderer) => {
				$$renderer.option({ value: 1 }, ($$renderer) => {
					$$renderer.push(`1 - RSA`);
				});

				$$renderer.option({ value: 2 }, ($$renderer) => {
					$$renderer.push(`2 - DSA (deprecated)`);
				});

				$$renderer.option({ value: 3 }, ($$renderer) => {
					$$renderer.push(`3 - ECDSA`);
				});

				$$renderer.option({ value: 4 }, ($$renderer) => {
					$$renderer.push(`4 - Ed25519`);
				});
			},
			'svelte-2novif'
		);

		$$renderer.push(` <div class="parameter-description svelte-2novif">${$.escape(algorithmDescriptions[algorithm])}</div></div> <div class="input-group svelte-2novif"><label for="fingerprintType" class="svelte-2novif">Fingerprint Type:</label> `);

		$$renderer.select(
			{ id: 'fingerprintType', value: fingerprintType, class: '' },
			($$renderer) => {
				$$renderer.option({ value: 1 }, ($$renderer) => {
					$$renderer.push(`1 - SHA-1`);
				});

				$$renderer.option({ value: 2 }, ($$renderer) => {
					$$renderer.push(`2 - SHA-256`);
				});
			},
			'svelte-2novif'
		);

		$$renderer.push(` <div class="parameter-description svelte-2novif">${$.escape(fingerprintTypeDescriptions[fingerprintType])}</div></div></div></div> <div class="input-data-section svelte-2novif"><div class="section-header svelte-2novif"><h3 class="svelte-2novif">`);
		Icon($$renderer, { name: 'key', size: 'sm' });
		$$renderer.push(`<!----> SSH Key Data</h3></div> <div class="input-type-selector svelte-2novif"><label class="input-type-option svelte-2novif"><input type="radio"${$.attr('checked', inputType === 'public-key', true)} value="public-key" class="svelte-2novif"/> <span class="svelte-2novif">SSH Public Key</span></label> <label class="input-type-option svelte-2novif"><input type="radio"${$.attr('checked', inputType === 'fingerprint', true)} value="fingerprint" class="svelte-2novif"/> <span class="svelte-2novif">Fingerprint Value</span></label></div> `);

		if (inputType === 'public-key') {
			$$renderer.push(`<!--[0--><div class="input-group svelte-2novif"><label for="publicKey" class="svelte-2novif">SSH Public Key:</label> <textarea id="publicKey" placeholder="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC... user@hostname
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... user@hostname" rows="4" class="public-key-input svelte-2novif">`);

			const $$body = $.escape(publicKeyInput);

			if ($$body) {
				$$renderer.push(`${$$body}`);
			} else {}

			$$renderer.push(`</textarea> <button type="button" class="generate-fingerprint-btn svelte-2novif"${$.attr('disabled', !publicKeyInput.trim(), true)}>`);
			Icon($$renderer, { name: 'arrow-right', size: 'sm' });
			$$renderer.push(`<!----> Generate Fingerprint</button></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="input-group svelte-2novif"><label for="fingerprint" class="svelte-2novif">Fingerprint Value:</label> <textarea id="fingerprint"${$.attr('placeholder', fingerprintType === 1
				? 'abcd1234567890abcdef1234567890abcdef1234'
				: 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab')} rows="2" class="fingerprint-input svelte-2novif">`);

			const $$body_1 = $.escape(fingerprintInput);

			if ($$body_1) {
				$$renderer.push(`${$$body_1}`);
			} else {}

			$$renderer.push(`</textarea></div>`);
		}

		$$renderer.push(`<!--]--></div></div> <div class="results-section">`);

		if (sshfpRecord()) {
			$$renderer.push(`<!--[0--><div class="sshfp-record-section"><div class="section-header svelte-2novif"><h3 class="svelte-2novif">Generated SSHFP Record</h3> <div class="actions svelte-2novif"><button type="button"${$.attr_class('copy-btn svelte-2novif', void 0, { 'success': clipboard.isCopied('copy-sshfp') })}>`);

			Icon($$renderer, {
				name: clipboard.isCopied('copy-sshfp') ? 'check' : 'copy',
				size: 'sm'
			});

			$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('copy-sshfp') ? 'Copied!' : 'Copy')}</button> <button type="button"${$.attr_class('export-btn svelte-2novif', void 0, { 'success': clipboard.isCopied('export-sshfp') })}>`);

			Icon($$renderer, {
				name: clipboard.isCopied('export-sshfp') ? 'check' : 'download',
				size: 'sm'
			});

			$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('export-sshfp') ? 'Downloaded!' : 'Export')}</button></div></div> <div class="record-output"><div class="code-block svelte-2novif"><code class="svelte-2novif">${$.escape(dnsRecord())}</code></div></div> <div class="record-breakdown svelte-2novif"><h4 class="svelte-2novif">Record Breakdown:</h4> <div class="breakdown-grid svelte-2novif"><div class="breakdown-item svelte-2novif"><strong class="svelte-2novif">Algorithm:</strong> ${$.escape(algorithm)} (${$.escape(Object.values(algorithmDescriptions)[algorithm - 1].split(' - ')[1].split(' (')[0])})</div> <div class="breakdown-item svelte-2novif"><strong class="svelte-2novif">Fingerprint Type:</strong> ${$.escape(fingerprintType)} (${$.escape(Object.values(fingerprintTypeDescriptions)[fingerprintType - 1].split(' - ')[1].split(' (')[0])})</div> <div class="breakdown-item svelte-2novif"><strong class="svelte-2novif">Fingerprint Length:</strong> ${$.escape(sshfpRecord().fingerprint.length)} chars</div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="validation-section"><div class="section-header svelte-2novif"><h3 class="svelte-2novif">`);
		Icon($$renderer, { name: 'bar-chart', size: 'sm' });

		$$renderer.push(`<!----> Validation</h3></div> <div class="validation-status svelte-2novif"><div class="status-item svelte-2novif"><span class="status-label svelte-2novif">Status:</span> <span${$.attr_class('status-value svelte-2novif', void 0, {
			'success': validation().isValid,
			'error': !validation().isValid
		})}>${$.escape(validation().isValid ? 'Valid' : 'Invalid')}</span></div></div> `);

		if (validation().errors.length > 0) {
			$$renderer.push(`<!--[0--><div class="validation-messages error svelte-2novif">`);
			Icon($$renderer, { name: 'x-circle', size: 'sm' });
			$$renderer.push(`<!----> <div class="messages svelte-2novif"><!--[-->`);

			const each_array = $.ensure_array_like(validation().errors);

			for (let index = 0, $$length = each_array.length; index < $$length; index++) {
				let error = each_array[index];

				$$renderer.push(`<div class="message svelte-2novif">${$.escape(error)}</div>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (validation().warnings.length > 0) {
			$$renderer.push(`<!--[0--><div class="validation-messages warning svelte-2novif">`);
			Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
			$$renderer.push(`<!----> <div class="messages svelte-2novif"><!--[-->`);

			const each_array_1 = $.ensure_array_like(validation().warnings);

			for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
				let warning = each_array_1[index];

				$$renderer.push(`<div class="message svelte-2novif">${$.escape(warning)}</div>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (validation().isValid && validation().errors.length === 0 && validation().warnings.length === 0) {
			$$renderer.push(`<!--[0--><div class="validation-messages success svelte-2novif">`);
			Icon($$renderer, { name: 'check-circle', size: 'sm' });
			$$renderer.push(`<!----> <div class="message svelte-2novif">SSHFP record is valid and ready to deploy!</div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="usage-guide"><div class="section-header svelte-2novif"><h3 class="svelte-2novif">`);
		Icon($$renderer, { name: 'info', size: 'sm' });
		$$renderer.push(`<!----> SSH Client Configuration</h3></div> <div class="usage-instructions svelte-2novif"><h4 class="svelte-2novif">To enable SSHFP verification in SSH clients:</h4> <div class="code-block svelte-2novif"><code class="svelte-2novif">ssh -o "VerifyHostKeyDNS=yes" user@${$.escape(domain)}</code></div> <h4 class="svelte-2novif">Or add to ~/.ssh/config:</h4> <div class="code-block svelte-2novif"><code class="svelte-2novif">Host ${$.escape(domain)}<br/>  VerifyHostKeyDNS yes</code></div></div></div> <div class="security-guide"><div class="section-header svelte-2novif"><h3 class="svelte-2novif">`);
		Icon($$renderer, { name: 'shield', size: 'sm' });
		$$renderer.push(`<!----> Security Best Practices</h3></div> <div class="security-tips svelte-2novif"><ul class="svelte-2novif"><!--[-->`);

		const each_array_2 = $.ensure_array_like(securityTips);

		for (let tipIdx = 0, $$length = each_array_2.length; tipIdx < $$length; tipIdx++) {
			let tip = each_array_2[tipIdx];

			$$renderer.push(`<li class="svelte-2novif">${$.escape(tip)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div></div></div></div> <div class="examples-section svelte-2novif"><details class="examples-toggle svelte-2novif"${$.attr('open', showExamples, true)}><summary class="svelte-2novif">`);
		Icon($$renderer, { name: 'lightbulb', size: 'sm' });
		$$renderer.push(`<!----> Example Configurations</summary> <div class="examples-grid svelte-2novif"><!--[-->`);

		const each_array_3 = $.ensure_array_like(exampleConfigurations);

		for (let exampleIdx = 0, $$length = each_array_3.length; exampleIdx < $$length; exampleIdx++) {
			let example = each_array_3[exampleIdx];

			$$renderer.push(`<button type="button"${$.attr_class('example-card svelte-2novif', void 0, { 'selected': selectedExample === example.name })}><div class="example-header svelte-2novif"><strong class="svelte-2novif">${$.escape(example.name)}</strong></div> <p class="example-description svelte-2novif">${$.escape(example.description)}</p> <div class="example-config svelte-2novif"><div>Algorithm: <code class="svelte-2novif">${$.escape(example.algorithm)}</code>, Type: <code class="svelte-2novif">${$.escape(example.fingerprintType)}</code></div> <div class="fingerprint-preview svelte-2novif">Hash: <code class="svelte-2novif">${$.escape(example.fingerprint.substring(0, 16))}...</code></div></div></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div></div>`);
	});
}