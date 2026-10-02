import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';
import { tooltip } from '$lib/actions/tooltip';

var root = $.from_html(`<div class="key-content svelte-dk22ld"><div class="code-block svelte-dk22ld"><code class="svelte-dk22ld"> </code></div></div>`);
var root_1 = $.from_html(`<div class="key-hidden svelte-dk22ld"><!> Private key hidden for security</div>`);
var root_2 = $.from_html(`<div class="keys-section svelte-dk22ld"><div class="section-header svelte-dk22ld"><h3 class="svelte-dk22ld"><!> Generated Keys</h3></div> <div class="key-item svelte-dk22ld"><div class="key-header svelte-dk22ld"><h4 class="svelte-dk22ld">Private Key</h4> <div class="key-actions svelte-dk22ld"><button type="button" class="toggle-btn svelte-dk22ld"><!> </button> <button type="button"><!> </button></div></div> <!> <div class="security-warning svelte-dk22ld"><!> Keep this private key secure. Never share it publicly or store it in version control.</div></div> <div class="key-item svelte-dk22ld"><div class="key-header svelte-dk22ld"><h4 class="svelte-dk22ld">Public Key</h4> <div class="key-actions svelte-dk22ld"><button type="button"><!> </button> <button type="button"><!> </button></div></div> <div class="key-content svelte-dk22ld"><div class="code-block svelte-dk22ld"><code class="svelte-dk22ld"> </code></div></div></div></div>`);
var root_3 = $.from_html(`<div class="results-section"><div class="dns-section"><div class="section-header svelte-dk22ld"><h3 class="svelte-dk22ld">DNS TXT Record</h3> <div class="actions svelte-dk22ld"><button type="button"><!> </button> <button type="button"><!> </button></div></div> <div class="record-output svelte-dk22ld"><h4 class="svelte-dk22ld">Zone File Format:</h4> <div class="code-block svelte-dk22ld"><code class="svelte-dk22ld"> </code></div></div> <div class="record-output svelte-dk22ld"><h4 class="svelte-dk22ld">DKIM Record Value:</h4> <div class="code-block svelte-dk22ld"><code class="svelte-dk22ld"> </code></div></div></div> <div class="validation-section"><div class="section-header svelte-dk22ld"><h3 class="svelte-dk22ld"><!> Implementation Notes</h3></div> <div class="info-grid svelte-dk22ld"><div class="info-item svelte-dk22ld"><strong class="svelte-dk22ld">Selector:</strong> </div> <div class="info-item svelte-dk22ld"><strong class="svelte-dk22ld">Domain:</strong> </div> <div class="info-item svelte-dk22ld"><strong class="svelte-dk22ld">Key Size:</strong> </div> <div class="info-item svelte-dk22ld"><strong class="svelte-dk22ld">Algorithm:</strong> RSA-SHA256 (rsa-sha256)</div></div> <div class="implementation-steps svelte-dk22ld"><h4 class="svelte-dk22ld">Next Steps:</h4> <ol class="svelte-dk22ld"><li class="svelte-dk22ld">Add the DNS TXT record to your domain's DNS configuration</li> <li class="svelte-dk22ld">Configure your mail server with the private key</li> <li class="svelte-dk22ld">Set up DKIM signing for outgoing emails</li> <li class="svelte-dk22ld">Test DKIM signatures using online validation tools</li></ol></div></div></div>`);
var root_4 = $.from_html(`<button type="button" class="example-card svelte-dk22ld"><div class="example-header svelte-dk22ld"><strong class="svelte-dk22ld"> </strong></div> <div class="example-details svelte-dk22ld"><div>Selector: <code class="svelte-dk22ld"> </code></div> <div>Domain: <code class="svelte-dk22ld"> </code></div> <div>Key Size: <code class="svelte-dk22ld"> </code></div></div></button>`);
var root_5 = $.from_html(`<div class="card"><div class="card-header"><h1>DKIM Key Generator</h1> <p class="card-subtitle">Generate DKIM RSA keypairs with selectors and DNS TXT records for email authentication.</p></div> <div class="grid-layout"><div class="input-section"><div class="config-section svelte-dk22ld"><div class="section-header svelte-dk22ld"><h3 class="svelte-dk22ld"><!> Configuration</h3></div> <div class="config-grid svelte-dk22ld"><div class="input-group svelte-dk22ld"><label for="selector" class="svelte-dk22ld">Selector:</label> <input id="selector" type="text" placeholder="default" class="svelte-dk22ld"/></div> <div class="input-group svelte-dk22ld"><label for="domain" class="svelte-dk22ld">Domain:</label> <input id="domain" type="text" placeholder="example.com" class="svelte-dk22ld"/></div> <div class="input-group svelte-dk22ld"><label for="keySize" class="svelte-dk22ld">Key Size:</label> <select id="keySize" class="svelte-dk22ld"><option>1024-bit (Legacy)</option><option>2048-bit (Recommended)</option></select></div></div> <button type="button" class="generate-btn svelte-dk22ld"><!> </button></div> <!></div> <!></div> <div class="examples-section svelte-dk22ld"><details class="examples-toggle svelte-dk22ld"><summary class="svelte-dk22ld"><!> Example Configurations</summary> <div class="examples-grid svelte-dk22ld"></div></details></div></div>`);

export default function DKIMKeyGenerator($$anchor, $$props) {
	$.push($$props, true);

	let keySize = $.state(2048);
	let selector = $.state('default');
	let domain = $.state('example.com');
	let generatedKey = $.state(null);
	let isGenerating = $.state(false);
	let showPrivateKey = $.state(false);

	// Button success states
	let buttonStates = $.proxy({});

	// Generate RSA key pair using Web Crypto API
	async function generateDKIMKeys() {
		if ($.get(isGenerating)) return;

		$.set(isGenerating, true);

		try {
			// Generate RSA key pair
			const keyPair = await window.crypto.subtle.generateKey(
				{
					name: 'RSA-PSS',
					modulusLength: $.get(keySize),
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

			$.set(
				generatedKey,
				{
					privateKey: privateKeyPEM,
					publicKey: publicKeyPEM,
					publicKeyForDNS,
					selector: $.get(selector).trim() || 'default',
					keySize: $.get(keySize)
				},
				true
			);
		} catch(error) {
			console.error('Failed to generate DKIM keys:', error);
			alert('Failed to generate DKIM keys. Please try again.');
		} finally {
			$.set(isGenerating, false);
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
		if (!$.get(generatedKey)) return '';

		return `${$.get(generatedKey).selector}._domainkey.${$.get(domain)}. IN TXT "v=DKIM1; k=rsa; p=${$.get(generatedKey).publicKeyForDNS}"`;
	});

	const dkimRecord = $.derived(() => {
		if (!$.get(generatedKey)) return '';

		return `v=DKIM1; k=rsa; p=${$.get(generatedKey).publicKeyForDNS}`;
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
		if (!$.get(generatedKey)) return;

		const blob = new Blob([$.get(generatedKey).privateKey], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		a.href = url;
		a.download = `${$.get(generatedKey).selector}.${$.get(domain)}.private.pem`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		showButtonSuccess('download-private');
	}

	function downloadPublicKey() {
		if (!$.get(generatedKey)) return;

		const blob = new Blob([$.get(generatedKey).publicKey], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		a.href = url;
		a.download = `${$.get(generatedKey).selector}.${$.get(domain)}.public.pem`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		showButtonSuccess('download-public');
	}

	function downloadTXTRecord() {
		if (!$.get(txtRecord)) return;

		const blob = new Blob([$.get(txtRecord)], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		a.href = url;
		a.download = `${$.get(generatedKey)?.selector}.${$.get(domain)}.dns.txt`;
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
		$.set(selector, example.selector, true);
		$.set(domain, example.domain, true);
		$.set(keySize, example.keySize, true);
		$.set(generatedKey, null);
	}

	var div = root_5();
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var div_4 = $.child(div_3);
	var h3 = $.child(div_4);
	var node = $.child(h3);

	Icon(node, { name: 'settings', size: 'sm' });
	$.next();
	$.reset(h3);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var div_6 = $.child(div_5);
	var label = $.child(div_6);

	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => "Unique identifier for this DKIM key (e.g., 'default', '202412', 'mailgun')");

	var input = $.sibling(label, 2);

	$.remove_input_defaults(input);
	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var label_1 = $.child(div_7);

	$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Domain that will use this DKIM key for signing emails');

	var input_1 = $.sibling(label_1, 2);

	$.remove_input_defaults(input_1);
	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var label_2 = $.child(div_8);

	$.action(label_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'RSA key size in bits. 2048-bit recommended for security, 1024-bit for compatibility');

	var select = $.sibling(label_2, 2);
	var option = $.child(select);

	option.value = option.__value = 1024;

	var option_1 = $.sibling(option);

	option_1.value = option_1.__value = 2048;
	$.reset(select);
	$.init_select(select);
	$.reset(div_8);
	$.reset(div_5);

	var button = $.sibling(div_5, 2);
	var node_1 = $.child(button);

	{
		let $0 = $.derived(() => $.get(isGenerating) ? 'loader' : 'key');

		Icon(node_1, {
			get name() {
				return $.get($0);
			},
			size: 'sm'
		});
	}

	var text_1 = $.sibling(node_1);

	$.reset(button);
	$.reset(div_3);

	var node_2 = $.sibling(div_3, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_9 = root_2();
			var div_10 = $.child(div_9);
			var h3_1 = $.child(div_10);
			var node_3 = $.child(h3_1);

			Icon(node_3, { name: 'shield', size: 'sm' });
			$.next();
			$.reset(h3_1);
			$.reset(div_10);

			var div_11 = $.sibling(div_10, 2);
			var div_12 = $.child(div_11);
			var div_13 = $.sibling($.child(div_12), 2);
			var button_1 = $.child(div_13);
			var node_4 = $.child(button_1);

			{
				let $0 = $.derived(() => $.get(showPrivateKey) ? 'hide' : 'eye');

				Icon(node_4, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			var text_2 = $.sibling(node_4);

			$.reset(button_1);
			$.action(button_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => $.get(showPrivateKey) ? 'Hide private key' : 'Show private key');

			var button_2 = $.sibling(button_1, 2);
			let classes;
			var node_5 = $.child(button_2);

			{
				let $0 = $.derived(() => buttonStates['download-private'] ? 'check' : 'download');

				Icon(node_5, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			var text_3 = $.sibling(node_5);

			$.reset(button_2);
			$.action(button_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Download private key as PEM file');
			$.reset(div_13);
			$.reset(div_12);

			var node_6 = $.sibling(div_12, 2);

			{
				var consequent = ($$anchor) => {
					var div_14 = root();
					var div_15 = $.child(div_14);
					var code = $.child(div_15);
					var text_4 = $.only_child(code, true);

					$.reset(div_15);
					$.reset(div_14);
					$.template_effect(() => $.set_text(text_4, $.get(generatedKey).privateKey));
					$.append($$anchor, div_14);
				};

				var alternate = ($$anchor) => {
					var div_16 = root_1();
					var node_7 = $.child(div_16);

					Icon(node_7, { name: 'hide', size: 'sm' });
					$.next();
					$.reset(div_16);
					$.append($$anchor, div_16);
				};

				$.if(node_6, ($$render) => {
					if ($.get(showPrivateKey)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			var div_17 = $.sibling(node_6, 2);
			var node_8 = $.child(div_17);

			Icon(node_8, { name: 'alert-triangle', size: 'sm' });
			$.next();
			$.reset(div_17);
			$.reset(div_11);

			var div_18 = $.sibling(div_11, 2);
			var div_19 = $.child(div_18);
			var div_20 = $.sibling($.child(div_19), 2);
			var button_3 = $.child(div_20);
			let classes_1;
			var node_9 = $.child(button_3);

			{
				let $0 = $.derived(() => buttonStates['copy-public'] ? 'check' : 'copy');

				Icon(node_9, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			var text_5 = $.sibling(node_9);

			$.reset(button_3);
			$.action(button_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Copy public key to clipboard');

			var button_4 = $.sibling(button_3, 2);
			let classes_2;
			var node_10 = $.child(button_4);

			{
				let $0 = $.derived(() => buttonStates['download-public'] ? 'check' : 'download');

				Icon(node_10, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			var text_6 = $.sibling(node_10);

			$.reset(button_4);
			$.action(button_4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Download public key as PEM file');
			$.reset(div_20);
			$.reset(div_19);

			var div_21 = $.sibling(div_19, 2);
			var div_22 = $.child(div_21);
			var code_1 = $.child(div_22);
			var text_7 = $.only_child(code_1, true);

			$.reset(div_22);
			$.reset(div_21);
			$.reset(div_18);
			$.reset(div_9);

			$.template_effect(() => {
				$.set_text(text_2, ` ${$.get(showPrivateKey) ? 'Hide' : 'Show'}`);
				classes = $.set_class(button_2, 1, 'download-btn svelte-dk22ld', null, classes, { success: buttonStates['download-private'] });
				$.set_text(text_3, ` ${buttonStates['download-private'] ? 'Downloaded!' : 'Download'}`);
				classes_1 = $.set_class(button_3, 1, 'copy-btn svelte-dk22ld', null, classes_1, { success: buttonStates['copy-public'] });
				$.set_text(text_5, ` ${buttonStates['copy-public'] ? 'Copied!' : 'Copy'}`);
				classes_2 = $.set_class(button_4, 1, 'download-btn svelte-dk22ld', null, classes_2, { success: buttonStates['download-public'] });
				$.set_text(text_6, ` ${buttonStates['download-public'] ? 'Downloaded!' : 'Download'}`);
				$.set_text(text_7, $.get(generatedKey).publicKey);
			});

			$.delegated('click', button_1, () => $.set(showPrivateKey, !$.get(showPrivateKey)));
			$.delegated('click', button_2, downloadPrivateKey);
			$.delegated('click', button_3, () => copyToClipboard($.get(generatedKey)?.publicKey || '', 'copy-public'));
			$.delegated('click', button_4, downloadPublicKey);
			$.append($$anchor, div_9);
		};

		$.if(node_2, ($$render) => {
			if ($.get(generatedKey)) $$render(consequent_1);
		});
	}

	$.reset(div_2);

	var node_11 = $.sibling(div_2, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_23 = root_3();
			var div_24 = $.child(div_23);
			var div_25 = $.child(div_24);
			var div_26 = $.sibling($.child(div_25), 2);
			var button_5 = $.child(div_26);
			let classes_3;
			var node_12 = $.child(button_5);

			{
				let $0 = $.derived(() => buttonStates['copy-txt'] ? 'check' : 'copy');

				Icon(node_12, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			var text_8 = $.sibling(node_12);

			$.reset(button_5);
			$.action(button_5, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Copy DNS TXT record to clipboard');

			var button_6 = $.sibling(button_5, 2);
			let classes_4;
			var node_13 = $.child(button_6);

			{
				let $0 = $.derived(() => buttonStates['download-txt'] ? 'check' : 'download');

				Icon(node_13, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			var text_9 = $.sibling(node_13);

			$.reset(button_6);
			$.action(button_6, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Download DNS record as text file');
			$.reset(div_26);
			$.reset(div_25);

			var div_27 = $.sibling(div_25, 2);
			var div_28 = $.sibling($.child(div_27), 2);
			var code_2 = $.child(div_28);
			var text_10 = $.only_child(code_2, true);

			$.reset(div_28);
			$.reset(div_27);

			var div_29 = $.sibling(div_27, 2);
			var div_30 = $.sibling($.child(div_29), 2);
			var code_3 = $.child(div_30);
			var text_11 = $.only_child(code_3, true);

			$.reset(div_30);
			$.reset(div_29);
			$.reset(div_24);

			var div_31 = $.sibling(div_24, 2);
			var div_32 = $.child(div_31);
			var h3_2 = $.child(div_32);
			var node_14 = $.child(h3_2);

			Icon(node_14, { name: 'info', size: 'sm' });
			$.next();
			$.reset(h3_2);
			$.reset(div_32);

			var div_33 = $.sibling(div_32, 2);
			var div_34 = $.child(div_33);
			var text_12 = $.sibling($.child(div_34));

			$.reset(div_34);

			var div_35 = $.sibling(div_34, 2);
			var text_13 = $.sibling($.child(div_35));

			$.reset(div_35);

			var div_36 = $.sibling(div_35, 2);
			var text_14 = $.sibling($.child(div_36));

			$.reset(div_36);
			$.next(2);
			$.reset(div_33);
			$.next(2);
			$.reset(div_31);
			$.reset(div_23);

			$.template_effect(() => {
				classes_3 = $.set_class(button_5, 1, 'copy-btn svelte-dk22ld', null, classes_3, { success: buttonStates['copy-txt'] });
				$.set_text(text_8, ` ${buttonStates['copy-txt'] ? 'Copied!' : 'Copy'}`);
				classes_4 = $.set_class(button_6, 1, 'export-btn svelte-dk22ld', null, classes_4, { success: buttonStates['download-txt'] });
				$.set_text(text_9, ` ${buttonStates['download-txt'] ? 'Downloaded!' : 'Export'}`);
				$.set_text(text_10, $.get(txtRecord));
				$.set_text(text_11, $.get(dkimRecord));
				$.set_text(text_12, ` ${$.get(generatedKey).selector ?? ''}`);
				$.set_text(text_13, ` ${$.get(domain) ?? ''}`);
				$.set_text(text_14, ` ${$.get(generatedKey).keySize ?? ''}-bit RSA`);
			});

			$.delegated('click', button_5, () => copyToClipboard($.get(txtRecord), 'copy-txt'));
			$.delegated('click', button_6, downloadTXTRecord);
			$.append($$anchor, div_23);
		};

		$.if(node_11, ($$render) => {
			if ($.get(generatedKey)) $$render(consequent_2);
		});
	}

	$.reset(div_1);

	var div_37 = $.sibling(div_1, 2);
	var details = $.child(div_37);
	var summary = $.child(details);
	var node_15 = $.child(summary);

	Icon(node_15, { name: 'lightbulb', size: 'sm' });
	$.next();
	$.reset(summary);

	var div_38 = $.sibling(summary, 2);

	$.each(div_38, 23, () => examples, (example, exIdx) => `${example.name}-${exIdx}`, ($$anchor, example) => {
		var button_7 = root_4();
		var div_39 = $.child(button_7);
		var strong = $.child(div_39);
		var text_15 = $.only_child(strong, true);

		$.reset(div_39);

		var div_40 = $.sibling(div_39, 2);
		var div_41 = $.child(div_40);
		var code_4 = $.sibling($.child(div_41));
		var text_16 = $.only_child(code_4, true);

		$.reset(div_41);

		var div_42 = $.sibling(div_41, 2);
		var code_5 = $.sibling($.child(div_42));
		var text_17 = $.only_child(code_5, true);

		$.reset(div_42);

		var div_43 = $.sibling(div_42, 2);
		var code_6 = $.sibling($.child(div_43));
		var text_18 = $.only_child(code_6);

		$.reset(div_43);
		$.reset(div_40);
		$.reset(button_7);

		$.template_effect(() => {
			$.set_text(text_15, $.get(example).name);
			$.set_text(text_16, $.get(example).selector);
			$.set_text(text_17, $.get(example).domain);
			$.set_text(text_18, `${$.get(example).keySize ?? ''}-bit`);
		});

		$.delegated('click', button_7, () => loadExample($.get(example)));
		$.append($$anchor, button_7);
	});

	$.reset(div_38);
	$.reset(details);
	$.reset(div_37);
	$.reset(div);

	$.template_effect(
		($0) => {
			button.disabled = $0;
			$.set_text(text_1, ` ${$.get(isGenerating) ? 'Generating...' : 'Generate DKIM Keys'}`);
		},
		[
			() => $.get(isGenerating) || !$.get(selector).trim() || !$.get(domain).trim()
		]
	);

	$.bind_value(input, () => $.get(selector), ($$value) => $.set(selector, $$value));
	$.bind_value(input_1, () => $.get(domain), ($$value) => $.set(domain, $$value));
	$.bind_select_value(select, () => $.get(keySize), ($$value) => $.set(keySize, $$value));
	$.delegated('click', button, generateDKIMKeys);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);