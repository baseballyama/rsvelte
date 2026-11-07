import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';
import { tooltip } from '$lib/actions/tooltip';

export default function DKIMKeyGenerator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let keySize = 2048;
		let selector = 'default';
		let domain = 'example.com';
		let generatedKey = null;
		let isGenerating = false;
		let showPrivateKey = false;

		// Button success states
		let buttonStates = {};

		// Generate RSA key pair using Web Crypto API
		async function generateDKIMKeys() {
			if (isGenerating) return;

			isGenerating = true;

			try {
				// Generate RSA key pair
				const keyPair = await window.crypto.subtle.generateKey(
					{
						name: 'RSA-PSS',
						modulusLength: keySize,
						publicExponent: new Uint8Array([1, 0, 1]),
						hash: 'SHA-256'
					},
					true, // extractable
					['sign', 'verify']
				);

				// Export private key
				const privateKeyBuffer = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

				const privateKeyBase64 = arrayBufferToBase64(privateKeyBuffer);
				const privateKeyPEM = formatPrivateKey(privateKeyBase64);

				// Export public key
				const publicKeyBuffer = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);

				const publicKeyBase64 = arrayBufferToBase64(publicKeyBuffer);
				const publicKeyPEM = formatPublicKey(publicKeyBase64);

				// Create DNS-formatted public key (remove headers and whitespace)
				const publicKeyForDNS = publicKeyBase64.replace(/\s/g, '');

				generatedKey = {
					privateKey: privateKeyPEM,
					publicKey: publicKeyPEM,
					publicKeyForDNS,
					selector: selector.trim() || 'default',
					keySize
				};
			} catch(error) {
				console.error('Failed to generate DKIM keys:', error);
				alert('Failed to generate DKIM keys. Please try again.');
			} finally {
				isGenerating = false;
			}
		}

		function arrayBufferToBase64(buffer) {
			const bytes = new Uint8Array(buffer);
			let binary = '';

			for (let i = 0; i < bytes.byteLength; i++) {
				binary += String.fromCharCode(bytes[i]);
			}

			return btoa(binary);
		}

		function formatPrivateKey(base64) {
			const formatted = base64.match(/.{1,64}/g)?.join('\n') || base64;

			return `-----BEGIN PRIVATE KEY-----\n${formatted}\n-----END PRIVATE KEY-----`;
		}

		function formatPublicKey(base64) {
			const formatted = base64.match(/.{1,64}/g)?.join('\n') || base64;

			return `-----BEGIN PUBLIC KEY-----\n${formatted}\n-----END PUBLIC KEY-----`;
		}

		const txtRecord = $.derived(() => {
			if (!generatedKey) return '';

			return `${generatedKey.selector}._domainkey.${domain}. IN TXT "v=DKIM1; k=rsa; p=${generatedKey.publicKeyForDNS}"`;
		});

		const dkimRecord = $.derived(() => {
			if (!generatedKey) return '';

			return `v=DKIM1; k=rsa; p=${generatedKey.publicKeyForDNS}`;
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

		function downloadPrivateKey() {
			if (!generatedKey) return;

			const blob = new Blob([generatedKey.privateKey], { type: 'text/plain' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');

			a.href = url;
			a.download = `${generatedKey.selector}.${domain}.private.pem`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			showButtonSuccess('download-private');
		}

		function downloadPublicKey() {
			if (!generatedKey) return;

			const blob = new Blob([generatedKey.publicKey], { type: 'text/plain' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');

			a.href = url;
			a.download = `${generatedKey.selector}.${domain}.public.pem`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			showButtonSuccess('download-public');
		}

		function downloadTXTRecord() {
			if (!txtRecord()) return;

			const blob = new Blob([txtRecord()], { type: 'text/plain' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');

			a.href = url;
			a.download = `${generatedKey?.selector}.${domain}.dns.txt`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			showButtonSuccess('download-txt');
		}

		const examples = [
			{
				name: 'Standard Setup',
				selector: 'default',
				domain: 'example.com',
				keySize: 2048
			},

			{
				name: 'Monthly Rotation',
				selector: '202412',
				domain: 'mycompany.com',
				keySize: 2048
			},

			{
				name: 'Service-Specific',
				selector: 'mailgun',
				domain: 'notifications.example.com',
				keySize: 1024
			}
		];

		function loadExample(example) {
			selector = example.selector;
			domain = example.domain;
			keySize = example.keySize;
			generatedKey = null;
		}

		$$renderer.push(`<div class="card"><div class="card-header"><h1>DKIM Key Generator</h1> <p class="card-subtitle">Generate DKIM RSA keypairs with selectors and DNS TXT records for email authentication.</p></div> <div class="grid-layout"><div class="input-section"><div class="config-section svelte-dk22ld"><div class="section-header svelte-dk22ld"><h3 class="svelte-dk22ld">`);
		Icon($$renderer, { name: 'settings', size: 'sm' });
		$$renderer.push(`<!----> Configuration</h3></div> <div class="config-grid svelte-dk22ld"><div class="input-group svelte-dk22ld"><label for="selector" class="svelte-dk22ld">Selector:</label> <input id="selector" type="text"${$.attr('value', selector)} placeholder="default" class="svelte-dk22ld"/></div> <div class="input-group svelte-dk22ld"><label for="domain" class="svelte-dk22ld">Domain:</label> <input id="domain" type="text"${$.attr('value', domain)} placeholder="example.com" class="svelte-dk22ld"/></div> <div class="input-group svelte-dk22ld"><label for="keySize" class="svelte-dk22ld">Key Size:</label> `);

		$$renderer.select(
			{ id: 'keySize', value: keySize, class: '' },
			($$renderer) => {
				$$renderer.option({ value: 1024 }, ($$renderer) => {
					$$renderer.push(`1024-bit (Legacy)`);
				});

				$$renderer.option({ value: 2048 }, ($$renderer) => {
					$$renderer.push(`2048-bit (Recommended)`);
				});
			},
			'svelte-dk22ld'
		);

		$$renderer.push(`</div></div> <button type="button" class="generate-btn svelte-dk22ld"${$.attr('disabled', isGenerating || !selector.trim() || !domain.trim(), true)}>`);
		Icon($$renderer, { name: isGenerating ? 'loader' : 'key', size: 'sm' });
		$$renderer.push(`<!----> ${$.escape(isGenerating ? 'Generating...' : 'Generate DKIM Keys')}</button></div> `);

		if (generatedKey) {
			$$renderer.push(`<!--[0--><div class="keys-section svelte-dk22ld"><div class="section-header svelte-dk22ld"><h3 class="svelte-dk22ld">`);
			Icon($$renderer, { name: 'shield', size: 'sm' });
			$$renderer.push(`<!----> Generated Keys</h3></div> <div class="key-item svelte-dk22ld"><div class="key-header svelte-dk22ld"><h4 class="svelte-dk22ld">Private Key</h4> <div class="key-actions svelte-dk22ld"><button type="button" class="toggle-btn svelte-dk22ld">`);
			Icon($$renderer, { name: showPrivateKey ? 'hide' : 'eye', size: 'sm' });
			$$renderer.push(`<!----> ${$.escape(showPrivateKey ? 'Hide' : 'Show')}</button> <button type="button"${$.attr_class('download-btn svelte-dk22ld', void 0, { 'success': buttonStates['download-private'] })}>`);

			Icon($$renderer, {
				name: buttonStates['download-private'] ? 'check' : 'download',
				size: 'sm'
			});

			$$renderer.push(`<!----> ${$.escape(buttonStates['download-private'] ? 'Downloaded!' : 'Download')}</button></div></div> `);

			if (showPrivateKey) {
				$$renderer.push(`<!--[0--><div class="key-content svelte-dk22ld"><div class="code-block svelte-dk22ld"><code class="svelte-dk22ld">${$.escape(generatedKey.privateKey)}</code></div></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="key-hidden svelte-dk22ld">`);
				Icon($$renderer, { name: 'hide', size: 'sm' });
				$$renderer.push(`<!----> Private key hidden for security</div>`);
			}

			$$renderer.push(`<!--]--> <div class="security-warning svelte-dk22ld">`);
			Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
			$$renderer.push(`<!----> Keep this private key secure. Never share it publicly or store it in version control.</div></div> <div class="key-item svelte-dk22ld"><div class="key-header svelte-dk22ld"><h4 class="svelte-dk22ld">Public Key</h4> <div class="key-actions svelte-dk22ld"><button type="button"${$.attr_class('copy-btn svelte-dk22ld', void 0, { 'success': buttonStates['copy-public'] })}>`);

			Icon($$renderer, {
				name: buttonStates['copy-public'] ? 'check' : 'copy',
				size: 'sm'
			});

			$$renderer.push(`<!----> ${$.escape(buttonStates['copy-public'] ? 'Copied!' : 'Copy')}</button> <button type="button"${$.attr_class('download-btn svelte-dk22ld', void 0, { 'success': buttonStates['download-public'] })}>`);

			Icon($$renderer, {
				name: buttonStates['download-public'] ? 'check' : 'download',
				size: 'sm'
			});

			$$renderer.push(`<!----> ${$.escape(buttonStates['download-public'] ? 'Downloaded!' : 'Download')}</button></div></div> <div class="key-content svelte-dk22ld"><div class="code-block svelte-dk22ld"><code class="svelte-dk22ld">${$.escape(generatedKey.publicKey)}</code></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (generatedKey) {
			$$renderer.push(`<!--[0--><div class="results-section"><div class="dns-section"><div class="section-header svelte-dk22ld"><h3 class="svelte-dk22ld">DNS TXT Record</h3> <div class="actions svelte-dk22ld"><button type="button"${$.attr_class('copy-btn svelte-dk22ld', void 0, { 'success': buttonStates['copy-txt'] })}>`);

			Icon($$renderer, {
				name: buttonStates['copy-txt'] ? 'check' : 'copy',
				size: 'sm'
			});

			$$renderer.push(`<!----> ${$.escape(buttonStates['copy-txt'] ? 'Copied!' : 'Copy')}</button> <button type="button"${$.attr_class('export-btn svelte-dk22ld', void 0, { 'success': buttonStates['download-txt'] })}>`);

			Icon($$renderer, {
				name: buttonStates['download-txt'] ? 'check' : 'download',
				size: 'sm'
			});

			$$renderer.push(`<!----> ${$.escape(buttonStates['download-txt'] ? 'Downloaded!' : 'Export')}</button></div></div> <div class="record-output svelte-dk22ld"><h4 class="svelte-dk22ld">Zone File Format:</h4> <div class="code-block svelte-dk22ld"><code class="svelte-dk22ld">${$.escape(txtRecord())}</code></div></div> <div class="record-output svelte-dk22ld"><h4 class="svelte-dk22ld">DKIM Record Value:</h4> <div class="code-block svelte-dk22ld"><code class="svelte-dk22ld">${$.escape(dkimRecord())}</code></div></div></div> <div class="validation-section"><div class="section-header svelte-dk22ld"><h3 class="svelte-dk22ld">`);
			Icon($$renderer, { name: 'info', size: 'sm' });
			$$renderer.push(`<!----> Implementation Notes</h3></div> <div class="info-grid svelte-dk22ld"><div class="info-item svelte-dk22ld"><strong class="svelte-dk22ld">Selector:</strong> ${$.escape(generatedKey.selector)}</div> <div class="info-item svelte-dk22ld"><strong class="svelte-dk22ld">Domain:</strong> ${$.escape(domain)}</div> <div class="info-item svelte-dk22ld"><strong class="svelte-dk22ld">Key Size:</strong> ${$.escape(generatedKey.keySize)}-bit RSA</div> <div class="info-item svelte-dk22ld"><strong class="svelte-dk22ld">Algorithm:</strong> RSA-SHA256 (rsa-sha256)</div></div> <div class="implementation-steps svelte-dk22ld"><h4 class="svelte-dk22ld">Next Steps:</h4> <ol class="svelte-dk22ld"><li class="svelte-dk22ld">Add the DNS TXT record to your domain's DNS configuration</li> <li class="svelte-dk22ld">Configure your mail server with the private key</li> <li class="svelte-dk22ld">Set up DKIM signing for outgoing emails</li> <li class="svelte-dk22ld">Test DKIM signatures using online validation tools</li></ol></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="examples-section svelte-dk22ld"><details class="examples-toggle svelte-dk22ld"><summary class="svelte-dk22ld">`);
		Icon($$renderer, { name: 'lightbulb', size: 'sm' });
		$$renderer.push(`<!----> Example Configurations</summary> <div class="examples-grid svelte-dk22ld"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let exIdx = 0, $$length = each_array.length; exIdx < $$length; exIdx++) {
			let example = each_array[exIdx];

			$$renderer.push(`<button type="button" class="example-card svelte-dk22ld"><div class="example-header svelte-dk22ld"><strong class="svelte-dk22ld">${$.escape(example.name)}</strong></div> <div class="example-details svelte-dk22ld"><div>Selector: <code class="svelte-dk22ld">${$.escape(example.selector)}</code></div> <div>Domain: <code class="svelte-dk22ld">${$.escape(example.domain)}</code></div> <div>Key Size: <code class="svelte-dk22ld">${$.escape(example.keySize)}-bit</code></div></div></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div></div>`);
	});
}