import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';
import { tooltip } from '$lib/actions/tooltip';
import { useClipboard } from '$lib/composables';

var root = $.from_html(`<div class="input-group svelte-1s2atb9"><label for="certificate" class="svelte-1s2atb9">Certificate/Public Key:</label> <textarea id="certificate" placeholder="-----BEGIN CERTIFICATE-----
MIIFXzCCA0egAwIBAgIJAKZ5QeHxw...
-----END CERTIFICATE-----" rows="8" class="svelte-1s2atb9"></textarea> <button type="button" class="btn btn-secondary svelte-1s2atb9"><!> Generate Hash</button></div>`);

var root_1 = $.from_html(`<div class="input-group svelte-1s2atb9"><label for="hash" class="svelte-1s2atb9">Hash Value:</label> <textarea id="hash" rows="3" class="svelte-1s2atb9"></textarea></div>`);
var root_2 = $.from_html(`<div class="card svelte-1s2atb9"><div class="card-header-with-actions svelte-1s2atb9"><h3 class="svelte-1s2atb9">Generated TLSA Record</h3> <div class="actions svelte-1s2atb9"><button type="button"><!> </button> <button type="button"><!> </button></div></div> <div class="code-block svelte-1s2atb9"><code class="svelte-1s2atb9"> </code></div> <div class="breakdown svelte-1s2atb9"><h4 class="svelte-1s2atb9">Record Breakdown:</h4> <div class="breakdown-grid svelte-1s2atb9"><div class="breakdown-item svelte-1s2atb9"><strong class="svelte-1s2atb9">Service:</strong> </div> <div class="breakdown-item svelte-1s2atb9"><strong class="svelte-1s2atb9">Usage:</strong> </div> <div class="breakdown-item svelte-1s2atb9"><strong class="svelte-1s2atb9">Selector:</strong> </div> <div class="breakdown-item svelte-1s2atb9"><strong class="svelte-1s2atb9">Matching:</strong> </div></div></div></div>`);
var root_3 = $.from_html(`<div class="svelte-1s2atb9"> </div>`);
var root_4 = $.from_html(`<div class="message error svelte-1s2atb9"><!> <div class="svelte-1s2atb9"></div></div>`);
var root_5 = $.from_html(`<div class="message warning svelte-1s2atb9"><!> <div class="svelte-1s2atb9"></div></div>`);
var root_6 = $.from_html(`<div class="message success svelte-1s2atb9"><!> <div class="svelte-1s2atb9">TLSA record is valid and ready to deploy!</div></div>`);
var root_7 = $.from_html(`<li class="svelte-1s2atb9"> </li>`);
var root_8 = $.from_html(`<button type="button"><div class="example-name svelte-1s2atb9"> </div> <p class="example-description svelte-1s2atb9"> </p> <div class="example-config svelte-1s2atb9"><div>Port: <code class="svelte-1s2atb9"> </code></div> <div>Usage: <code class="svelte-1s2atb9"> </code>, Selector: <code class="svelte-1s2atb9"> </code>, Type: <code class="svelte-1s2atb9"> </code></div></div></button>`);

var root_9 = $.from_html(`<div class="container svelte-1s2atb9"><div class="card svelte-1s2atb9"><div class="card-header svelte-1s2atb9"><h1 class="svelte-1s2atb9">TLSA Generator</h1> <p class="svelte-1s2atb9">Create TLSA (DNS-based Authentication of Named Entities) records for certificate pinning and DANE
        implementation.</p></div> <div class="main-grid svelte-1s2atb9"><div class="input-section svelte-1s2atb9"><div class="card sub-card svelte-1s2atb9"><h3 class="section-title svelte-1s2atb9"><!> Service Configuration</h3> <div class="service-grid svelte-1s2atb9"><div class="input-group svelte-1s2atb9"><label for="domain" class="svelte-1s2atb9">Domain:</label> <input id="domain" type="text" placeholder="example.com" class="svelte-1s2atb9"/></div> <div class="input-group svelte-1s2atb9"><label for="port" class="svelte-1s2atb9">Port:</label> <input id="port" type="number" min="1" max="65535" placeholder="443" class="svelte-1s2atb9"/></div> <div class="input-group svelte-1s2atb9"><label for="protocol" class="svelte-1s2atb9">Protocol:</label> <select id="protocol" class="svelte-1s2atb9"><option>TCP</option><option>UDP</option></select></div></div></div> <div class="card sub-card svelte-1s2atb9"><h3 class="section-title svelte-1s2atb9"><!> TLSA Parameters</h3> <div class="input-group svelte-1s2atb9"><label for="usage" class="svelte-1s2atb9">Certificate Usage:</label> <select id="usage" class="svelte-1s2atb9"><option>0 - CA Constraint</option><option>1 - Service Certificate Constraint</option><option>2 - Trust Anchor Assertion</option><option>3 - Domain-Issued Certificate</option></select> <p class="description svelte-1s2atb9"> </p></div> <div class="input-group svelte-1s2atb9"><label for="selector" class="svelte-1s2atb9">Selector:</label> <select id="selector" class="svelte-1s2atb9"><option>0 - Full Certificate</option><option>1 - Subject Public Key Info</option></select> <p class="description svelte-1s2atb9"> </p></div> <div class="input-group svelte-1s2atb9"><label for="matchingType" class="svelte-1s2atb9">Matching Type:</label> <select id="matchingType" class="svelte-1s2atb9"><option>0 - Exact Match</option><option>1 - SHA-256 Hash</option><option>2 - SHA-512 Hash</option></select> <p class="description svelte-1s2atb9"> </p></div></div> <div class="card sub-card svelte-1s2atb9"><h3 class="section-title svelte-1s2atb9"><!> Certificate Data</h3> <div class="radio-group svelte-1s2atb9"><label class="radio-option svelte-1s2atb9"><input type="radio" class="svelte-1s2atb9"/> <span class="svelte-1s2atb9">Certificate/Public Key (PEM)</span></label> <label class="radio-option svelte-1s2atb9"><input type="radio" class="svelte-1s2atb9"/> <span class="svelte-1s2atb9">Hash Value</span></label></div> <!></div></div> <div class="output-section svelte-1s2atb9"><!> <div class="card svelte-1s2atb9"><h3 class="section-title svelte-1s2atb9"><!> Validation</h3> <div class="status-center svelte-1s2atb9"><div class="status-item svelte-1s2atb9"><span class="svelte-1s2atb9">Status:</span> <span> </span></div></div> <!> <!> <!></div> <div class="card svelte-1s2atb9"><h3 class="section-title svelte-1s2atb9"><!> Security Best Practices</h3> <ul class="tips-list svelte-1s2atb9"></ul></div></div></div> <div class="card examples-card svelte-1s2atb9"><details class="svelte-1s2atb9"><summary class="examples-summary svelte-1s2atb9"><!> Example Configurations <span class="chevron svelte-1s2atb9"><!></span></summary> <div class="examples-grid svelte-1s2atb9"></div></details></div></div></div>`);

export default function TLSAGenerator($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	let domain = $.state('example.com');
	let port = $.state(443);
	let protocol = $.state('tcp');
	let inputType = $.state('certificate');
	let certificateInput = $.state('');
	let hashInput = $.state('');
	let usage = $.state(3);
	let selector = $.state(1);
	let matchingType = $.state(1);
	let showExamples = $.state(false);
	let selectedExample = $.state(null);
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

		if ($.get(inputType) === 'hash') {
			associationData = $.get(hashInput).trim().replace(/[^a-fA-F0-9]/g, '').toLowerCase();
		} else if ($.get(inputType) === 'certificate') {
			if ($.get(certificateInput).trim()) {
				associationData = 'Generated hash would appear here (requires certificate parsing)';
			}
		}

		if (!associationData) return null;

		return {
			usage: $.get(usage),
			selector: $.get(selector),
			matchingType: $.get(matchingType),
			certificateAssociation: associationData
		};
	});

	const dnsRecord = $.derived(() => {
		if (!$.get(tlsaRecord)) return '';

		return `_${$.get(port)}._${$.get(protocol)}.${$.get(domain)}. IN TLSA ${$.get(tlsaRecord).usage} ${$.get(tlsaRecord).selector} ${$.get(tlsaRecord).matchingType} ${$.get(tlsaRecord).certificateAssociation}`;
	});

	const validation = $.derived(() => {
		const warnings = [];
		const errors = [];

		if (!$.get(domain).trim()) {
			errors.push('Domain is required');
		} else if (!$.get(domain).includes('.')) {
			warnings.push('Domain should include TLD (e.g., .com, .org)');
		}

		if ($.get(port) < 1 || $.get(port) > 65535) {
			errors.push('Port must be between 1 and 65535');
		}

		if ($.get(inputType) === 'certificate') {
			if (!$.get(certificateInput).trim()) {
				errors.push('Certificate data is required');
			} else if (!$.get(certificateInput).includes('BEGIN CERTIFICATE') && !$.get(certificateInput).includes('BEGIN PUBLIC KEY')) {
				warnings.push('Certificate should be in PEM format');
			}
		} else if ($.get(inputType) === 'hash') {
			if (!$.get(hashInput).trim()) {
				errors.push('Hash value is required');
			} else {
				const cleanHash = $.get(hashInput).trim().replace(/[^a-fA-F0-9]/g, '');

				if ($.get(matchingType) === 1 && cleanHash.length !== 64) {
					warnings.push('SHA-256 hash should be exactly 64 hexadecimal characters');
				} else if ($.get(matchingType) === 2 && cleanHash.length !== 128) {
					warnings.push('SHA-512 hash should be exactly 128 hexadecimal characters');
				} else if (!(/^[a-fA-F0-9]+$/).test(cleanHash)) {
					errors.push('Hash must contain only hexadecimal characters');
				}
			}
		}

		if ($.get(usage) === 0 || $.get(usage) === 2) {
			warnings.push('Usage types 0 and 2 require careful CA certificate management');
		}

		if ($.get(selector) === 0) {
			warnings.push('Full certificate selector (0) is less flexible than SPKI selector (1)');
		}

		if ($.get(matchingType) === 0) {
			warnings.push('Exact match (0) is not recommended - use SHA-256 (1) or SHA-512 (2)');
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
		a.download = `${$.get(domain)}-tlsa-record.zone`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		clipboard.copy('downloaded', 'export-tlsa');
	}

	async function generateHashFromInput() {
		if ($.get(inputType) === 'certificate' && $.get(certificateInput).trim()) {
			const demoHash = $.get(matchingType) === 1
				? 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab'
				: 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

			$.set(hashInput, demoHash, true);
			$.set(inputType, 'hash');
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
		$.set(domain, example.domain, true);
		$.set(port, example.port, true);
		$.set(protocol, example.protocol, true);
		$.set(usage, example.usage, true);
		$.set(selector, example.selector, true);
		$.set(matchingType, example.matchingType, true);
		$.set(hashInput, example.hash, true);
		$.set(inputType, 'hash');
		$.set(certificateInput, '');
		$.set(selectedExample, example.name, true);
	}

	const securityTips = [
		'Use usage type 3 (Domain-Issued Certificate) for most scenarios',
		'Prefer selector 1 (SPKI) over selector 0 (full certificate) for flexibility',
		'Use SHA-256 (1) or SHA-512 (2) matching types, avoid exact match (0)',
		'Pin multiple certificates to avoid service disruption during certificate rotation',
		'Test TLSA records with DANE validation tools before deployment'
	];

	var div = root_9();
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var div_3 = $.child(div_2);
	var div_4 = $.child(div_3);
	var h3 = $.child(div_4);
	var node = $.child(h3);

	Icon(node, { name: 'globe', size: 'sm' });
	$.next();
	$.reset(h3);

	var div_5 = $.sibling(h3, 2);
	var div_6 = $.child(div_5);
	var label = $.child(div_6);

	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Domain name for the TLSA record');

	var input = $.sibling(label, 2);

	$.remove_input_defaults(input);
	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var label_1 = $.child(div_7);

	$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Port number for the service (e.g., 443 for HTTPS, 25 for SMTP)');

	var input_1 = $.sibling(label_1, 2);

	$.remove_input_defaults(input_1);
	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var label_2 = $.child(div_8);

	$.action(label_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Protocol type (tcp or udp)');

	var select = $.sibling(label_2, 2);
	var option = $.child(select);

	option.value = option.__value = 'tcp';

	var option_1 = $.sibling(option);

	option_1.value = option_1.__value = 'udp';
	$.reset(select);
	$.init_select(select);
	$.reset(div_8);
	$.reset(div_5);
	$.reset(div_4);

	var div_9 = $.sibling(div_4, 2);
	var h3_1 = $.child(div_9);
	var node_1 = $.child(h3_1);

	Icon(node_1, { name: 'settings', size: 'sm' });
	$.next();
	$.reset(h3_1);

	var div_10 = $.sibling(h3_1, 2);
	var label_3 = $.child(div_10);

	$.action(label_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Certificate usage - how the certificate should be used for authentication');

	var select_1 = $.sibling(label_3, 2);
	var option_2 = $.child(select_1);

	option_2.value = option_2.__value = 0;

	var option_3 = $.sibling(option_2);

	option_3.value = option_3.__value = 1;

	var option_4 = $.sibling(option_3);

	option_4.value = option_4.__value = 2;

	var option_5 = $.sibling(option_4);

	option_5.value = option_5.__value = 3;
	$.reset(select_1);
	$.init_select(select_1);

	var p = $.sibling(select_1, 2);
	var text_1 = $.only_child(p, true);

	$.reset(div_10);

	var div_11 = $.sibling(div_10, 2);
	var label_4 = $.child(div_11);

	$.action(label_4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Which part of the certificate to use');

	var select_2 = $.sibling(label_4, 2);
	var option_6 = $.child(select_2);

	option_6.value = option_6.__value = 0;

	var option_7 = $.sibling(option_6);

	option_7.value = option_7.__value = 1;
	$.reset(select_2);
	$.init_select(select_2);

	var p_1 = $.sibling(select_2, 2);
	var text_2 = $.only_child(p_1, true);

	$.reset(div_11);

	var div_12 = $.sibling(div_11, 2);
	var label_5 = $.child(div_12);

	$.action(label_5, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'How to process the certificate data');

	var select_3 = $.sibling(label_5, 2);
	var option_8 = $.child(select_3);

	option_8.value = option_8.__value = 0;

	var option_9 = $.sibling(option_8);

	option_9.value = option_9.__value = 1;

	var option_10 = $.sibling(option_9);

	option_10.value = option_10.__value = 2;
	$.reset(select_3);
	$.init_select(select_3);

	var p_2 = $.sibling(select_3, 2);
	var text_3 = $.only_child(p_2, true);

	$.reset(div_12);
	$.reset(div_9);

	var div_13 = $.sibling(div_9, 2);
	var h3_2 = $.child(div_13);
	var node_2 = $.child(h3_2);

	Icon(node_2, { name: 'key', size: 'sm' });
	$.next();
	$.reset(h3_2);

	var div_14 = $.sibling(h3_2, 2);
	var label_6 = $.child(div_14);
	var input_2 = $.child(label_6);

	$.remove_input_defaults(input_2);
	input_2.value = input_2.__value = 'certificate';
	$.next(2);
	$.reset(label_6);

	var label_7 = $.sibling(label_6, 2);
	var input_3 = $.child(label_7);

	$.remove_input_defaults(input_3);
	input_3.value = input_3.__value = 'hash';
	$.next(2);
	$.reset(label_7);
	$.reset(div_14);

	var node_3 = $.sibling(div_14, 2);

	{
		var consequent = ($$anchor) => {
			var div_15 = root();
			var label_8 = $.child(div_15);

			$.action(label_8, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Paste the PEM-encoded certificate or public key');

			var textarea = $.sibling(label_8, 2);

			$.remove_textarea_child(textarea);

			var button = $.sibling(textarea, 2);
			var node_4 = $.child(button);

			Icon(node_4, { name: 'arrow-right', size: 'sm' });
			$.next();
			$.reset(button);
			$.action(button, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Generate hash from certificate (demo mode)');
			$.reset(div_15);
			$.template_effect(($0) => button.disabled = $0, [() => !$.get(certificateInput).trim()]);
			$.bind_value(textarea, () => $.get(certificateInput), ($$value) => $.set(certificateInput, $$value));
			$.delegated('click', button, generateHashFromInput);
			$.append($$anchor, div_15);
		};

		var alternate = ($$anchor) => {
			var div_16 = root_1();
			var label_9 = $.child(div_16);

			$.action(label_9, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => `Enter the ${$.get(matchingType) === 1
				? 'SHA-256'
				: $.get(matchingType) === 2 ? 'SHA-512' : 'exact'} hash value`);

			var textarea_1 = $.sibling(label_9, 2);

			$.remove_textarea_child(textarea_1);
			$.reset(div_16);

			$.template_effect(() => $.set_attribute(textarea_1, 'placeholder', $.get(matchingType) === 1
				? 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab'
				: $.get(matchingType) === 2
					? 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
					: 'Certificate or key data'));

			$.bind_value(textarea_1, () => $.get(hashInput), ($$value) => $.set(hashInput, $$value));
			$.append($$anchor, div_16);
		};

		$.if(node_3, ($$render) => {
			if ($.get(inputType) === 'certificate') $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div_13);
	$.reset(div_3);

	var div_17 = $.sibling(div_3, 2);
	var node_5 = $.child(div_17);

	{
		var consequent_1 = ($$anchor) => {
			var div_18 = root_2();
			var div_19 = $.child(div_18);
			var div_20 = $.sibling($.child(div_19), 2);
			var button_1 = $.child(div_20);
			let classes;
			var node_6 = $.child(button_1);

			{
				let $0 = $.derived(() => clipboard.isCopied('copy-tlsa') ? 'check' : 'copy');

				Icon(node_6, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			var text_4 = $.sibling(node_6);

			$.reset(button_1);
			$.action(button_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Copy TLSA record to clipboard');

			var button_2 = $.sibling(button_1, 2);
			let classes_1;
			var node_7 = $.child(button_2);

			{
				let $0 = $.derived(() => clipboard.isCopied('export-tlsa') ? 'check' : 'download');

				Icon(node_7, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			var text_5 = $.sibling(node_7);

			$.reset(button_2);
			$.action(button_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Download as zone file');
			$.reset(div_20);
			$.reset(div_19);

			var div_21 = $.sibling(div_19, 2);
			var code = $.child(div_21);
			var text_6 = $.only_child(code, true);

			$.reset(div_21);

			var div_22 = $.sibling(div_21, 2);
			var div_23 = $.sibling($.child(div_22), 2);
			var div_24 = $.child(div_23);
			var text_7 = $.sibling($.child(div_24));

			$.reset(div_24);

			var div_25 = $.sibling(div_24, 2);
			var text_8 = $.sibling($.child(div_25));

			$.reset(div_25);

			var div_26 = $.sibling(div_25, 2);
			var text_9 = $.sibling($.child(div_26));

			$.reset(div_26);

			var div_27 = $.sibling(div_26, 2);
			var text_10 = $.sibling($.child(div_27));

			$.reset(div_27);
			$.reset(div_23);
			$.reset(div_22);
			$.reset(div_18);

			$.template_effect(
				($0, $1, $2, $3, $4, $5, $6) => {
					classes = $.set_class(button_1, 1, 'btn btn-primary svelte-1s2atb9', null, classes, { success: $0 });
					$.set_text(text_4, ` ${$1 ?? ''}`);
					classes_1 = $.set_class(button_2, 1, 'btn btn-success svelte-1s2atb9', null, classes_1, { success: $2 });
					$.set_text(text_5, ` ${$3 ?? ''}`);
					$.set_text(text_6, $.get(dnsRecord));
					$.set_text(text_7, ` _${$.get(port) ?? ''}._${$.get(protocol) ?? ''}`);
					$.set_text(text_8, ` ${$.get(usage) ?? ''} (${$4 ?? ''})`);
					$.set_text(text_9, ` ${$.get(selector) ?? ''} (${$5 ?? ''})`);
					$.set_text(text_10, ` ${$.get(matchingType) ?? ''} (${$6 ?? ''})`);
				},
				[
					() => clipboard.isCopied('copy-tlsa'),
					() => clipboard.isCopied('copy-tlsa') ? 'Copied!' : 'Copy',
					() => clipboard.isCopied('export-tlsa'),
					() => clipboard.isCopied('export-tlsa') ? 'Downloaded!' : 'Export',
					() => Object.values(usageDescriptions)[$.get(usage)].split(' - ')[0],
					() => Object.values(selectorDescriptions)[$.get(selector)].split(' - ')[0],
					() => Object.values(matchingTypeDescriptions)[$.get(matchingType)].split(' - ')[0]
				]
			);

			$.delegated('click', button_1, () => copyToClipboard($.get(dnsRecord), 'copy-tlsa'));
			$.delegated('click', button_2, exportAsZoneFile);
			$.append($$anchor, div_18);
		};

		$.if(node_5, ($$render) => {
			if ($.get(tlsaRecord)) $$render(consequent_1);
		});
	}

	var div_28 = $.sibling(node_5, 2);
	var h3_3 = $.child(div_28);
	var node_8 = $.child(h3_3);

	Icon(node_8, { name: 'bar-chart', size: 'sm' });
	$.next();
	$.reset(h3_3);

	var div_29 = $.sibling(h3_3, 2);
	var div_30 = $.child(div_29);
	var span = $.sibling($.child(div_30), 2);
	let classes_2;
	var text_11 = $.only_child(span, true);

	$.reset(div_30);
	$.reset(div_29);

	var node_9 = $.sibling(div_29, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_31 = root_4();
			var node_10 = $.child(div_31);

			Icon(node_10, { name: 'x-circle', size: 'sm' });

			var div_32 = $.sibling(node_10, 2);

			$.each(div_32, 21, () => $.get(validation).errors, $.index, ($$anchor, error) => {
				var div_33 = root_3();
				var text_12 = $.only_child(div_33, true);

				$.template_effect(() => $.set_text(text_12, $.get(error)));
				$.append($$anchor, div_33);
			});

			$.reset(div_32);
			$.reset(div_31);
			$.append($$anchor, div_31);
		};

		$.if(node_9, ($$render) => {
			if ($.get(validation).errors.length > 0) $$render(consequent_2);
		});
	}

	var node_11 = $.sibling(node_9, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_34 = root_5();
			var node_12 = $.child(div_34);

			Icon(node_12, { name: 'alert-triangle', size: 'sm' });

			var div_35 = $.sibling(node_12, 2);

			$.each(div_35, 21, () => $.get(validation).warnings, $.index, ($$anchor, warning) => {
				var div_36 = root_3();
				var text_13 = $.only_child(div_36, true);

				$.template_effect(() => $.set_text(text_13, $.get(warning)));
				$.append($$anchor, div_36);
			});

			$.reset(div_35);
			$.reset(div_34);
			$.append($$anchor, div_34);
		};

		$.if(node_11, ($$render) => {
			if ($.get(validation).warnings.length > 0) $$render(consequent_3);
		});
	}

	var node_13 = $.sibling(node_11, 2);

	{
		var consequent_4 = ($$anchor) => {
			var div_37 = root_6();
			var node_14 = $.child(div_37);

			Icon(node_14, { name: 'check-circle', size: 'sm' });
			$.next(2);
			$.reset(div_37);
			$.append($$anchor, div_37);
		};

		$.if(node_13, ($$render) => {
			if ($.get(validation).isValid && $.get(validation).errors.length === 0 && $.get(validation).warnings.length === 0) $$render(consequent_4);
		});
	}

	$.reset(div_28);

	var div_38 = $.sibling(div_28, 2);
	var h3_4 = $.child(div_38);
	var node_15 = $.child(h3_4);

	Icon(node_15, { name: 'shield', size: 'sm' });
	$.next();
	$.reset(h3_4);

	var ul = $.sibling(h3_4, 2);

	$.each(ul, 21, () => securityTips, $.index, ($$anchor, tip) => {
		var li = root_7();
		var text_14 = $.only_child(li, true);

		$.template_effect(() => $.set_text(text_14, $.get(tip)));
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(div_38);
	$.reset(div_17);
	$.reset(div_2);

	var div_39 = $.sibling(div_2, 2);
	var details = $.child(div_39);
	var summary = $.child(details);
	var node_16 = $.child(summary);

	Icon(node_16, { name: 'lightbulb', size: 'sm' });

	var span_1 = $.sibling(node_16, 2);
	var node_17 = $.child(span_1);

	Icon(node_17, { name: 'chevron-down', size: 'sm' });
	$.reset(span_1);
	$.reset(summary);

	var div_40 = $.sibling(summary, 2);

	$.each(div_40, 21, () => exampleConfigurations, (example) => example.name, ($$anchor, example) => {
		var button_3 = root_8();
		let classes_3;
		var div_41 = $.child(button_3);
		var text_15 = $.only_child(div_41, true);
		var p_3 = $.sibling(div_41, 2);
		var text_16 = $.only_child(p_3, true);
		var div_42 = $.sibling(p_3, 2);
		var div_43 = $.child(div_42);
		var code_1 = $.sibling($.child(div_43));
		var text_17 = $.only_child(code_1);

		$.reset(div_43);

		var div_44 = $.sibling(div_43, 2);
		var code_2 = $.sibling($.child(div_44));
		var text_18 = $.only_child(code_2, true);
		var code_3 = $.sibling(code_2, 2);
		var text_19 = $.only_child(code_3, true);
		var code_4 = $.sibling(code_3, 2);
		var text_20 = $.only_child(code_4, true);

		$.reset(div_44);
		$.reset(div_42);
		$.reset(button_3);

		$.template_effect(() => {
			classes_3 = $.set_class(button_3, 1, 'example-card svelte-1s2atb9', null, classes_3, { selected: $.get(selectedExample) === $.get(example).name });
			$.set_text(text_15, $.get(example).name);
			$.set_text(text_16, $.get(example).description);
			$.set_text(text_17, `${$.get(example).port ?? ''}/${$.get(example).protocol ?? ''}`);
			$.set_text(text_18, $.get(example).usage);
			$.set_text(text_19, $.get(example).selector);
			$.set_text(text_20, $.get(example).matchingType);
		});

		$.delegated('click', button_3, () => loadExample($.get(example)));
		$.append($$anchor, button_3);
	});

	$.reset(div_40);
	$.reset(details);
	$.reset(div_39);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text_1, usageDescriptions[$.get(usage)]);
		$.set_text(text_2, selectorDescriptions[$.get(selector)]);
		$.set_text(text_3, matchingTypeDescriptions[$.get(matchingType)]);

		classes_2 = $.set_class(span, 1, 'status svelte-1s2atb9', null, classes_2, {
			valid: $.get(validation).isValid,
			invalid: !$.get(validation).isValid
		});

		$.set_text(text_11, $.get(validation).isValid ? 'Valid' : 'Invalid');
	});

	$.bind_value(input, () => $.get(domain), ($$value) => $.set(domain, $$value));
	$.bind_value(input_1, () => $.get(port), ($$value) => $.set(port, $$value));
	$.bind_select_value(select, () => $.get(protocol), ($$value) => $.set(protocol, $$value));
	$.bind_select_value(select_1, () => $.get(usage), ($$value) => $.set(usage, $$value));
	$.bind_select_value(select_2, () => $.get(selector), ($$value) => $.set(selector, $$value));
	$.bind_select_value(select_3, () => $.get(matchingType), ($$value) => $.set(matchingType, $$value));
	$.bind_group(binding_group, [], input_2, () => $.get(inputType), ($$value) => $.set(inputType, $$value));
	$.bind_group(binding_group, [], input_3, () => $.get(inputType), ($$value) => $.set(inputType, $$value));
	$.bind_property('open', 'toggle', details, ($$value) => $.set(showExamples, $$value), () => $.get(showExamples));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);