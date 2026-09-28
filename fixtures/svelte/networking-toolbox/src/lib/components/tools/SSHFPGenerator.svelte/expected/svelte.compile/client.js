import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';
import { tooltip } from '$lib/actions/tooltip';
import { useClipboard } from '$lib/composables';

var root = $.from_html(`<div class="input-group svelte-2novif"><label for="publicKey" class="svelte-2novif">SSH Public Key:</label> <textarea id="publicKey" placeholder="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC... user@hostname
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... user@hostname" rows="4" class="public-key-input svelte-2novif"></textarea> <button type="button" class="generate-fingerprint-btn svelte-2novif"><!> Generate Fingerprint</button></div>`);

var root_1 = $.from_html(`<div class="input-group svelte-2novif"><label for="fingerprint" class="svelte-2novif">Fingerprint Value:</label> <textarea id="fingerprint" rows="2" class="fingerprint-input svelte-2novif"></textarea></div>`);
var root_2 = $.from_html(`<div class="sshfp-record-section"><div class="section-header svelte-2novif"><h3 class="svelte-2novif">Generated SSHFP Record</h3> <div class="actions svelte-2novif"><button type="button"><!> </button> <button type="button"><!> </button></div></div> <div class="record-output"><div class="code-block svelte-2novif"><code class="svelte-2novif"> </code></div></div> <div class="record-breakdown svelte-2novif"><h4 class="svelte-2novif">Record Breakdown:</h4> <div class="breakdown-grid svelte-2novif"><div class="breakdown-item svelte-2novif"><strong class="svelte-2novif">Algorithm:</strong> </div> <div class="breakdown-item svelte-2novif"><strong class="svelte-2novif">Fingerprint Type:</strong> </div> <div class="breakdown-item svelte-2novif"><strong class="svelte-2novif">Fingerprint Length:</strong> </div></div></div></div>`);
var root_3 = $.from_html(`<div class="message svelte-2novif"> </div>`);
var root_4 = $.from_html(`<div class="validation-messages error svelte-2novif"><!> <div class="messages svelte-2novif"></div></div>`);
var root_5 = $.from_html(`<div class="validation-messages warning svelte-2novif"><!> <div class="messages svelte-2novif"></div></div>`);
var root_6 = $.from_html(`<div class="validation-messages success svelte-2novif"><!> <div class="message svelte-2novif">SSHFP record is valid and ready to deploy!</div></div>`);
var root_7 = $.from_html(`<li class="svelte-2novif"> </li>`);
var root_8 = $.from_html(`<button type="button"><div class="example-header svelte-2novif"><strong class="svelte-2novif"> </strong></div> <p class="example-description svelte-2novif"> </p> <div class="example-config svelte-2novif"><div>Algorithm: <code class="svelte-2novif"> </code>, Type: <code class="svelte-2novif"> </code></div> <div class="fingerprint-preview svelte-2novif">Hash: <code class="svelte-2novif"> </code></div></div></button>`);
var root_9 = $.from_html(`<div class="card svelte-2novif"><div class="card-header"><h1>SSHFP Generator</h1> <p class="card-subtitle">Generate SSHFP (SSH Fingerprint) records to enable DNS-based SSH host key verification and authentication.</p></div> <div class="grid-layout"><div class="input-section"><div class="domain-section svelte-2novif"><div class="section-header svelte-2novif"><h3 class="svelte-2novif"><!> Domain Configuration</h3></div> <div class="input-group svelte-2novif"><label for="domain" class="svelte-2novif">Domain:</label> <input id="domain" type="text" placeholder="example.com" class="svelte-2novif"/></div></div> <div class="sshfp-parameters-section svelte-2novif"><div class="section-header svelte-2novif"><h3 class="svelte-2novif"><!> SSHFP Parameters</h3></div> <div class="parameters-grid svelte-2novif"><div class="input-group svelte-2novif"><label for="algorithm" class="svelte-2novif">Algorithm:</label> <select id="algorithm" class="svelte-2novif"><option>1 - RSA</option><option>2 - DSA (deprecated)</option><option>3 - ECDSA</option><option>4 - Ed25519</option></select> <div class="parameter-description svelte-2novif"> </div></div> <div class="input-group svelte-2novif"><label for="fingerprintType" class="svelte-2novif">Fingerprint Type:</label> <select id="fingerprintType" class="svelte-2novif"><option>1 - SHA-1</option><option>2 - SHA-256</option></select> <div class="parameter-description svelte-2novif"> </div></div></div></div> <div class="input-data-section svelte-2novif"><div class="section-header svelte-2novif"><h3 class="svelte-2novif"><!> SSH Key Data</h3></div> <div class="input-type-selector svelte-2novif"><label class="input-type-option svelte-2novif"><input type="radio" class="svelte-2novif"/> <span class="svelte-2novif">SSH Public Key</span></label> <label class="input-type-option svelte-2novif"><input type="radio" class="svelte-2novif"/> <span class="svelte-2novif">Fingerprint Value</span></label></div> <!></div></div> <div class="results-section"><!> <div class="validation-section"><div class="section-header svelte-2novif"><h3 class="svelte-2novif"><!> Validation</h3></div> <div class="validation-status svelte-2novif"><div class="status-item svelte-2novif"><span class="status-label svelte-2novif">Status:</span> <span> </span></div></div> <!> <!> <!></div> <div class="usage-guide"><div class="section-header svelte-2novif"><h3 class="svelte-2novif"><!> SSH Client Configuration</h3></div> <div class="usage-instructions svelte-2novif"><h4 class="svelte-2novif">To enable SSHFP verification in SSH clients:</h4> <div class="code-block svelte-2novif"><code class="svelte-2novif"> </code></div> <h4 class="svelte-2novif">Or add to ~/.ssh/config:</h4> <div class="code-block svelte-2novif"><code class="svelte-2novif"> <br/>&nbsp;&nbsp;VerifyHostKeyDNS yes</code></div></div></div> <div class="security-guide"><div class="section-header svelte-2novif"><h3 class="svelte-2novif"><!> Security Best Practices</h3></div> <div class="security-tips svelte-2novif"><ul class="svelte-2novif"></ul></div></div></div></div> <div class="examples-section svelte-2novif"><details class="examples-toggle svelte-2novif"><summary class="svelte-2novif"><!> Example Configurations</summary> <div class="examples-grid svelte-2novif"></div></details></div></div>`);

export default function SSHFPGenerator($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	let domain = $.state('example.com');
	let inputType = $.state('public-key');
	let publicKeyInput = $.state('');
	let fingerprintInput = $.state('');
	let algorithm = $.state(1);
	let fingerprintType = $.state(1);
	let showExamples = $.state(false);
	let selectedExample = $.state(null);

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

		if ($.get(inputType) === 'fingerprint') {
			// Use provided fingerprint directly
			fingerprintValue = $.get(fingerprintInput).trim().replace(/[^a-fA-F0-9]/g, '').toLowerCase();
		} else if ($.get(inputType) === 'public-key') {
			// For demo purposes, we'll show how it would work
			// In a real implementation, you'd parse the public key and generate the fingerprint
			if ($.get(publicKeyInput).trim()) {
				// Generate demo fingerprint based on fingerprint type
				fingerprintValue = $.get(fingerprintType) === 1
					? 'abcd1234567890abcdef1234567890abcdef1234'
					: 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab';
			}
		}

		if (!fingerprintValue) return null;

		return {
			algorithm: $.get(algorithm),
			fingerprintType: $.get(fingerprintType),
			fingerprint: fingerprintValue
		};
	});

	const dnsRecord = $.derived(() => {
		if (!$.get(sshfpRecord)) return '';

		return `${$.get(domain)}. IN SSHFP ${$.get(sshfpRecord).algorithm} ${$.get(sshfpRecord).fingerprintType} ${$.get(sshfpRecord).fingerprint}`;
	});

	const validation = $.derived(() => {
		const warnings = [];
		const errors = [];

		// Check domain format
		if (!$.get(domain).trim()) {
			errors.push('Domain is required');
		} else if (!$.get(domain).includes('.')) {
			warnings.push('Domain should include TLD (e.g., .com, .org)');
		}

		// Check public key/fingerprint input
		if ($.get(inputType) === 'public-key') {
			if (!$.get(publicKeyInput).trim()) {
				errors.push('SSH public key is required');
			} else {
				const key = $.get(publicKeyInput).trim();

				if (!key.startsWith('ssh-') && !key.startsWith('ecdsa-') && !key.includes(' ')) {
					warnings.push('Public key should be in OpenSSH format (e.g., "ssh-rsa AAAAB3NzaC1...")');
				}
			}
		} else if ($.get(inputType) === 'fingerprint') {
			if (!$.get(fingerprintInput).trim()) {
				errors.push('Fingerprint value is required');
			} else {
				const cleanFingerprint = $.get(fingerprintInput).trim().replace(/[^a-fA-F0-9]/g, '');

				if ($.get(fingerprintType) === 1 && cleanFingerprint.length !== 40) {
					warnings.push('SHA-1 fingerprint should be exactly 40 hexadecimal characters');
				} else if ($.get(fingerprintType) === 2 && cleanFingerprint.length !== 64) {
					warnings.push('SHA-256 fingerprint should be exactly 64 hexadecimal characters');
				} else if (!(/^[a-fA-F0-9]+$/).test(cleanFingerprint)) {
					errors.push('Fingerprint must contain only hexadecimal characters');
				}
			}
		}

		// Algorithm recommendations
		if ($.get(algorithm) === 2) {
			warnings.push('DSA algorithm is deprecated and should be avoided');
		}

		if ($.get(fingerprintType) === 1) {
			warnings.push('SHA-1 is deprecated - use SHA-256 for new deployments');
		}

		return { isValid: errors.length === 0, errors, warnings };
	});

	function copyToClipboard(text, buttonId) {
		clipboard.copy(text, buttonId);
	}

	function exportAsZoneFile() {
		if (!$.get(dnsRecord)) return;

		const zoneContent = $.get(dnsRecord);
		const blob = new Blob([zoneContent], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		a.href = url;
		a.download = `${$.get(domain)}-sshfp-record.zone`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		clipboard.copy('downloaded', 'export-sshfp');
	}

	// Simulate fingerprint generation from public key
	async function generateFingerprintFromKey() {
		if ($.get(inputType) === 'public-key' && $.get(publicKeyInput).trim()) {
			// This is a placeholder - in a real implementation you would:
			// 1. Parse the OpenSSH public key format
			// 2. Extract the key material
			// 3. Hash it with the chosen algorithm
			const demoFingerprint = $.get(fingerprintType) === 1
				? 'abcd1234567890abcdef1234567890abcdef1234'
				: 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab';

			$.set(fingerprintInput, demoFingerprint, true);
			$.set(inputType, 'fingerprint');
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
		$.set(domain, example.domain, true);
		$.set(algorithm, example.algorithm, true);
		$.set(fingerprintType, example.fingerprintType, true);
		$.set(fingerprintInput, example.fingerprint, true);
		$.set(inputType, 'fingerprint');
		$.set(publicKeyInput, '');
		$.set(selectedExample, example.name, true);
	}

	const securityTips = [
		'Use Ed25519 (algorithm 4) for new SSH key deployments',
		'Prefer SHA-256 (type 2) over SHA-1 (type 1) for fingerprints',
		'Deploy SSHFP records for all SSH host keys on your servers',
		'Update SSHFP records when rotating SSH host keys',
		'Configure SSH clients to verify SSHFP records for enhanced security'
	];

	var div = root_9();
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var div_4 = $.child(div_3);
	var h3 = $.child(div_4);
	var node = $.child(h3);

	Icon(node, { name: 'globe', size: 'sm' });
	$.next();
	$.reset(h3);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var label = $.child(div_5);

	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Domain name for the SSHFP record');

	var input = $.sibling(label, 2);

	$.remove_input_defaults(input);
	$.reset(div_5);
	$.reset(div_3);

	var div_6 = $.sibling(div_3, 2);
	var div_7 = $.child(div_6);
	var h3_1 = $.child(div_7);
	var node_1 = $.child(h3_1);

	Icon(node_1, { name: 'settings', size: 'sm' });
	$.next();
	$.reset(h3_1);
	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var div_9 = $.child(div_8);
	var label_1 = $.child(div_9);

	$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'SSH key algorithm used by the server');

	var select = $.sibling(label_1, 2);
	var option = $.child(select);

	option.value = option.__value = 1;

	var option_1 = $.sibling(option);

	option_1.value = option_1.__value = 2;

	var option_2 = $.sibling(option_1);

	option_2.value = option_2.__value = 3;

	var option_3 = $.sibling(option_2);

	option_3.value = option_3.__value = 4;
	$.reset(select);
	$.init_select(select);

	var div_10 = $.sibling(select, 2);
	var text_1 = $.only_child(div_10, true);

	$.reset(div_9);

	var div_11 = $.sibling(div_9, 2);
	var label_2 = $.child(div_11);

	$.action(label_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Hash algorithm used to generate the fingerprint');

	var select_1 = $.sibling(label_2, 2);
	var option_4 = $.child(select_1);

	option_4.value = option_4.__value = 1;

	var option_5 = $.sibling(option_4);

	option_5.value = option_5.__value = 2;
	$.reset(select_1);
	$.init_select(select_1);

	var div_12 = $.sibling(select_1, 2);
	var text_2 = $.only_child(div_12, true);

	$.reset(div_11);
	$.reset(div_8);
	$.reset(div_6);

	var div_13 = $.sibling(div_6, 2);
	var div_14 = $.child(div_13);
	var h3_2 = $.child(div_14);
	var node_2 = $.child(h3_2);

	Icon(node_2, { name: 'key', size: 'sm' });
	$.next();
	$.reset(h3_2);
	$.reset(div_14);

	var div_15 = $.sibling(div_14, 2);
	var label_3 = $.child(div_15);
	var input_1 = $.child(label_3);

	$.remove_input_defaults(input_1);
	input_1.value = input_1.__value = 'public-key';
	$.next(2);
	$.reset(label_3);

	var label_4 = $.sibling(label_3, 2);
	var input_2 = $.child(label_4);

	$.remove_input_defaults(input_2);
	input_2.value = input_2.__value = 'fingerprint';
	$.next(2);
	$.reset(label_4);
	$.reset(div_15);

	var node_3 = $.sibling(div_15, 2);

	{
		var consequent = ($$anchor) => {
			var div_16 = root();
			var label_5 = $.child(div_16);

			$.action(label_5, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Paste the SSH public key from ~/.ssh/id_rsa.pub or similar');

			var textarea = $.sibling(label_5, 2);

			$.remove_textarea_child(textarea);

			var button = $.sibling(textarea, 2);
			var node_4 = $.child(button);

			Icon(node_4, { name: 'arrow-right', size: 'sm' });
			$.next();
			$.reset(button);
			$.action(button, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Generate fingerprint from public key (demo mode)');
			$.reset(div_16);
			$.template_effect(($0) => button.disabled = $0, [() => !$.get(publicKeyInput).trim()]);
			$.bind_value(textarea, () => $.get(publicKeyInput), ($$value) => $.set(publicKeyInput, $$value));
			$.delegated('click', button, generateFingerprintFromKey);
			$.append($$anchor, div_16);
		};

		var alternate = ($$anchor) => {
			var div_17 = root_1();
			var label_6 = $.child(div_17);

			$.action(label_6, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => `Enter the ${$.get(fingerprintType) === 1 ? 'SHA-1' : 'SHA-256'} fingerprint value`);

			var textarea_1 = $.sibling(label_6, 2);

			$.remove_textarea_child(textarea_1);
			$.reset(div_17);

			$.template_effect(() => $.set_attribute(textarea_1, 'placeholder', $.get(fingerprintType) === 1
				? 'abcd1234567890abcdef1234567890abcdef1234'
				: 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab'));

			$.bind_value(textarea_1, () => $.get(fingerprintInput), ($$value) => $.set(fingerprintInput, $$value));
			$.append($$anchor, div_17);
		};

		$.if(node_3, ($$render) => {
			if ($.get(inputType) === 'public-key') $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div_13);
	$.reset(div_2);

	var div_18 = $.sibling(div_2, 2);
	var node_5 = $.child(div_18);

	{
		var consequent_1 = ($$anchor) => {
			var div_19 = root_2();
			var div_20 = $.child(div_19);
			var div_21 = $.sibling($.child(div_20), 2);
			var button_1 = $.child(div_21);
			let classes;
			var node_6 = $.child(button_1);

			{
				let $0 = $.derived(() => clipboard.isCopied('copy-sshfp') ? 'check' : 'copy');

				Icon(node_6, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			var text_3 = $.sibling(node_6);

			$.reset(button_1);
			$.action(button_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Copy SSHFP record to clipboard');

			var button_2 = $.sibling(button_1, 2);
			let classes_1;
			var node_7 = $.child(button_2);

			{
				let $0 = $.derived(() => clipboard.isCopied('export-sshfp') ? 'check' : 'download');

				Icon(node_7, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			var text_4 = $.sibling(node_7);

			$.reset(button_2);
			$.action(button_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Download as zone file');
			$.reset(div_21);
			$.reset(div_20);

			var div_22 = $.sibling(div_20, 2);
			var div_23 = $.child(div_22);
			var code = $.child(div_23);
			var text_5 = $.only_child(code, true);

			$.reset(div_23);
			$.reset(div_22);

			var div_24 = $.sibling(div_22, 2);
			var div_25 = $.sibling($.child(div_24), 2);
			var div_26 = $.child(div_25);
			var text_6 = $.sibling($.child(div_26));

			$.reset(div_26);

			var div_27 = $.sibling(div_26, 2);
			var text_7 = $.sibling($.child(div_27));

			$.reset(div_27);

			var div_28 = $.sibling(div_27, 2);
			var text_8 = $.sibling($.child(div_28));

			$.reset(div_28);
			$.reset(div_25);
			$.reset(div_24);
			$.reset(div_19);

			$.template_effect(
				($0, $1, $2, $3, $4, $5) => {
					classes = $.set_class(button_1, 1, 'copy-btn svelte-2novif', null, classes, { success: $0 });
					$.set_text(text_3, ` ${$1 ?? ''}`);
					classes_1 = $.set_class(button_2, 1, 'export-btn svelte-2novif', null, classes_1, { success: $2 });
					$.set_text(text_4, ` ${$3 ?? ''}`);
					$.set_text(text_5, $.get(dnsRecord));
					$.set_text(text_6, ` ${$.get(algorithm) ?? ''} (${$4 ?? ''})`);
					$.set_text(text_7, ` ${$.get(fingerprintType) ?? ''} (${$5 ?? ''})`);
					$.set_text(text_8, ` ${$.get(sshfpRecord).fingerprint.length ?? ''} chars`);
				},
				[
					() => clipboard.isCopied('copy-sshfp'),
					() => clipboard.isCopied('copy-sshfp') ? 'Copied!' : 'Copy',
					() => clipboard.isCopied('export-sshfp'),
					() => clipboard.isCopied('export-sshfp') ? 'Downloaded!' : 'Export',
					() => Object.values(algorithmDescriptions)[$.get(algorithm) - 1].split(' - ')[1].split(' (')[0],
					() => Object.values(fingerprintTypeDescriptions)[$.get(fingerprintType) - 1].split(' - ')[1].split(' (')[0]
				]
			);

			$.delegated('click', button_1, () => copyToClipboard($.get(dnsRecord), 'copy-sshfp'));
			$.delegated('click', button_2, exportAsZoneFile);
			$.append($$anchor, div_19);
		};

		$.if(node_5, ($$render) => {
			if ($.get(sshfpRecord)) $$render(consequent_1);
		});
	}

	var div_29 = $.sibling(node_5, 2);
	var div_30 = $.child(div_29);
	var h3_3 = $.child(div_30);
	var node_8 = $.child(h3_3);

	Icon(node_8, { name: 'bar-chart', size: 'sm' });
	$.next();
	$.reset(h3_3);
	$.reset(div_30);

	var div_31 = $.sibling(div_30, 2);
	var div_32 = $.child(div_31);
	var span = $.sibling($.child(div_32), 2);
	let classes_2;
	var text_9 = $.only_child(span, true);

	$.reset(div_32);
	$.reset(div_31);

	var node_9 = $.sibling(div_31, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_33 = root_4();
			var node_10 = $.child(div_33);

			Icon(node_10, { name: 'x-circle', size: 'sm' });

			var div_34 = $.sibling(node_10, 2);

			$.each(div_34, 21, () => $.get(validation).errors, $.index, ($$anchor, error) => {
				var div_35 = root_3();
				var text_10 = $.only_child(div_35, true);

				$.template_effect(() => $.set_text(text_10, $.get(error)));
				$.append($$anchor, div_35);
			});

			$.reset(div_34);
			$.reset(div_33);
			$.append($$anchor, div_33);
		};

		$.if(node_9, ($$render) => {
			if ($.get(validation).errors.length > 0) $$render(consequent_2);
		});
	}

	var node_11 = $.sibling(node_9, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_36 = root_5();
			var node_12 = $.child(div_36);

			Icon(node_12, { name: 'alert-triangle', size: 'sm' });

			var div_37 = $.sibling(node_12, 2);

			$.each(div_37, 21, () => $.get(validation).warnings, $.index, ($$anchor, warning) => {
				var div_38 = root_3();
				var text_11 = $.only_child(div_38, true);

				$.template_effect(() => $.set_text(text_11, $.get(warning)));
				$.append($$anchor, div_38);
			});

			$.reset(div_37);
			$.reset(div_36);
			$.append($$anchor, div_36);
		};

		$.if(node_11, ($$render) => {
			if ($.get(validation).warnings.length > 0) $$render(consequent_3);
		});
	}

	var node_13 = $.sibling(node_11, 2);

	{
		var consequent_4 = ($$anchor) => {
			var div_39 = root_6();
			var node_14 = $.child(div_39);

			Icon(node_14, { name: 'check-circle', size: 'sm' });
			$.next(2);
			$.reset(div_39);
			$.append($$anchor, div_39);
		};

		$.if(node_13, ($$render) => {
			if ($.get(validation).isValid && $.get(validation).errors.length === 0 && $.get(validation).warnings.length === 0) $$render(consequent_4);
		});
	}

	$.reset(div_29);

	var div_40 = $.sibling(div_29, 2);
	var div_41 = $.child(div_40);
	var h3_4 = $.child(div_41);
	var node_15 = $.child(h3_4);

	Icon(node_15, { name: 'info', size: 'sm' });
	$.next();
	$.reset(h3_4);
	$.reset(div_41);

	var div_42 = $.sibling(div_41, 2);
	var div_43 = $.sibling($.child(div_42), 2);
	var code_1 = $.child(div_43);
	var text_12 = $.only_child(code_1);

	$.reset(div_43);

	var div_44 = $.sibling(div_43, 4);
	var code_2 = $.child(div_44);
	var text_13 = $.child(code_2);

	$.next(2);
	$.reset(code_2);
	$.reset(div_44);
	$.reset(div_42);
	$.reset(div_40);

	var div_45 = $.sibling(div_40, 2);
	var div_46 = $.child(div_45);
	var h3_5 = $.child(div_46);
	var node_16 = $.child(h3_5);

	Icon(node_16, { name: 'shield', size: 'sm' });
	$.next();
	$.reset(h3_5);
	$.reset(div_46);

	var div_47 = $.sibling(div_46, 2);
	var ul = $.child(div_47);

	$.each(ul, 23, () => securityTips, (tip, tipIdx) => `tip-${tipIdx}`, ($$anchor, tip) => {
		var li = root_7();
		var text_14 = $.only_child(li, true);

		$.template_effect(() => $.set_text(text_14, $.get(tip)));
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(div_47);
	$.reset(div_45);
	$.reset(div_18);
	$.reset(div_1);

	var div_48 = $.sibling(div_1, 2);
	var details = $.child(div_48);
	var summary = $.child(details);
	var node_17 = $.child(summary);

	Icon(node_17, { name: 'lightbulb', size: 'sm' });
	$.next();
	$.reset(summary);

	var div_49 = $.sibling(summary, 2);

	$.each(div_49, 23, () => exampleConfigurations, (example, exampleIdx) => `${example.name}-${exampleIdx}`, ($$anchor, example) => {
		var button_3 = root_8();
		let classes_3;
		var div_50 = $.child(button_3);
		var strong = $.child(div_50);
		var text_15 = $.only_child(strong, true);

		$.reset(div_50);

		var p = $.sibling(div_50, 2);
		var text_16 = $.only_child(p, true);
		var div_51 = $.sibling(p, 2);
		var div_52 = $.child(div_51);
		var code_3 = $.sibling($.child(div_52));
		var text_17 = $.only_child(code_3, true);
		var code_4 = $.sibling(code_3, 2);
		var text_18 = $.only_child(code_4, true);

		$.reset(div_52);

		var div_53 = $.sibling(div_52, 2);
		var code_5 = $.sibling($.child(div_53));
		var text_19 = $.only_child(code_5);

		$.reset(div_53);
		$.reset(div_51);
		$.reset(button_3);

		$.template_effect(
			($0) => {
				classes_3 = $.set_class(button_3, 1, 'example-card svelte-2novif', null, classes_3, { selected: $.get(selectedExample) === $.get(example).name });
				$.set_text(text_15, $.get(example).name);
				$.set_text(text_16, $.get(example).description);
				$.set_text(text_17, $.get(example).algorithm);
				$.set_text(text_18, $.get(example).fingerprintType);
				$.set_text(text_19, `${$0 ?? ''}...`);
			},
			[() => $.get(example).fingerprint.substring(0, 16)]
		);

		$.delegated('click', button_3, () => loadExample($.get(example)));
		$.append($$anchor, button_3);
	});

	$.reset(div_49);
	$.reset(details);
	$.reset(div_48);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text_1, algorithmDescriptions[$.get(algorithm)]);
		$.set_text(text_2, fingerprintTypeDescriptions[$.get(fingerprintType)]);

		classes_2 = $.set_class(span, 1, 'status-value svelte-2novif', null, classes_2, {
			success: $.get(validation).isValid,
			error: !$.get(validation).isValid
		});

		$.set_text(text_9, $.get(validation).isValid ? 'Valid' : 'Invalid');
		$.set_text(text_12, `ssh -o "VerifyHostKeyDNS=yes" user@${$.get(domain) ?? ''}`);
		$.set_text(text_13, `Host ${$.get(domain) ?? ''}`);
	});

	$.bind_value(input, () => $.get(domain), ($$value) => $.set(domain, $$value));
	$.bind_select_value(select, () => $.get(algorithm), ($$value) => $.set(algorithm, $$value));
	$.bind_select_value(select_1, () => $.get(fingerprintType), ($$value) => $.set(fingerprintType, $$value));
	$.bind_group(binding_group, [], input_1, () => $.get(inputType), ($$value) => $.set(inputType, $$value));
	$.bind_group(binding_group, [], input_2, () => $.get(inputType), ($$value) => $.set(inputType, $$value));
	$.bind_property('open', 'toggle', details, ($$value) => $.set(showExamples, $$value), () => $.get(showExamples));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);