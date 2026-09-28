import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';
import { tooltip } from '$lib/actions/tooltip';
import { useClipboard } from '$lib/composables';

var root = $.from_html(`<div class="parameter-value svelte-xt4xlo"><input type="text" class="parameter-input svelte-xt4xlo"/></div>`);
var root_1 = $.from_html(`<div><div class="parameter-header svelte-xt4xlo"><label class="parameter-toggle svelte-xt4xlo"><input type="checkbox" class="svelte-xt4xlo"/> <span class="parameter-name svelte-xt4xlo"> </span> <span class="parameter-description svelte-xt4xlo"> </span></label></div> <!></div>`);
var root_2 = $.from_html(`<div class="message svelte-xt4xlo"> </div>`);
var root_3 = $.from_html(`<div class="validation-messages error svelte-xt4xlo"><!> <div class="messages svelte-xt4xlo"></div></div>`);
var root_4 = $.from_html(`<div class="validation-messages warning svelte-xt4xlo"><!> <div class="messages svelte-xt4xlo"></div></div>`);
var root_5 = $.from_html(`<div class="validation-messages success svelte-xt4xlo"><!> <div class="message svelte-xt4xlo"> </div></div>`);
var root_6 = $.from_html(`<li class="svelte-xt4xlo"> </li>`);
var root_7 = $.from_html(`<button type="button"><div class="example-header svelte-xt4xlo"><strong class="svelte-xt4xlo"> </strong></div> <p class="example-description svelte-xt4xlo"> </p> <div class="example-config svelte-xt4xlo"><div>Type: <code class="svelte-xt4xlo"> </code>, Priority: <code class="svelte-xt4xlo"> </code></div> <div>Target: <code class="svelte-xt4xlo"> </code></div> <div class="example-params svelte-xt4xlo"> </div></div></button>`);

var root_8 = $.from_html(`<div class="card"><div class="card-header"><h1>SVCB/HTTPS Builder</h1> <p class="card-subtitle">Build SVCB and HTTPS resource records with service parameters for enhanced service discovery and connection
      optimization.</p></div> <div class="grid-layout"><div class="input-section"><div class="service-config-section svelte-xt4xlo"><div class="section-header svelte-xt4xlo"><h3 class="svelte-xt4xlo"><!> Service Configuration</h3></div> <div class="service-config-grid svelte-xt4xlo"><div class="input-group svelte-xt4xlo"><label for="domain" class="svelte-xt4xlo">Domain:</label> <input id="domain" type="text" placeholder="example.com" class="svelte-xt4xlo"/></div> <div class="input-group svelte-xt4xlo"><label for="recordType" class="svelte-xt4xlo">Record Type:</label> <select id="recordType" class="svelte-xt4xlo"><option>HTTPS</option><option>SVCB</option></select></div> <div class="input-group svelte-xt4xlo"><label for="priority" class="svelte-xt4xlo">Priority:</label> <input id="priority" type="number" min="0" max="65535" placeholder="1" class="svelte-xt4xlo"/></div> <div class="input-group svelte-xt4xlo"><label for="targetName" class="svelte-xt4xlo">Target Name:</label> <input id="targetName" type="text" placeholder=". (same domain)" class="svelte-xt4xlo"/></div></div></div> <div class="parameters-section svelte-xt4xlo"><div class="section-header svelte-xt4xlo"><h3 class="svelte-xt4xlo"><!> Service Parameters</h3></div> <div class="parameters-list svelte-xt4xlo"></div></div></div> <div class="results-section"><div class="record-section"><div class="section-header svelte-xt4xlo"><h3 class="svelte-xt4xlo"> </h3> <div class="actions svelte-xt4xlo"><button type="button"><!> </button> <button type="button"><!> </button></div></div> <div class="record-output"><div class="code-block svelte-xt4xlo"><code class="svelte-xt4xlo"> </code></div></div> <div class="record-breakdown svelte-xt4xlo"><h4 class="svelte-xt4xlo">Record Breakdown:</h4> <div class="breakdown-grid svelte-xt4xlo"><div class="breakdown-item svelte-xt4xlo"><strong class="svelte-xt4xlo">Type:</strong> </div> <div class="breakdown-item svelte-xt4xlo"><strong class="svelte-xt4xlo">Priority:</strong> </div> <div class="breakdown-item svelte-xt4xlo"><strong class="svelte-xt4xlo">Target:</strong> </div> <div class="breakdown-item svelte-xt4xlo"><strong class="svelte-xt4xlo">Parameters:</strong> </div></div></div></div> <div class="validation-section"><div class="section-header svelte-xt4xlo"><h3 class="svelte-xt4xlo"><!> Validation</h3></div> <div class="validation-status svelte-xt4xlo"><div class="status-item svelte-xt4xlo"><span class="status-label svelte-xt4xlo">Status:</span> <span> </span></div></div> <!> <!> <!></div> <div class="usage-guide"><div class="section-header svelte-xt4xlo"><h3 class="svelte-xt4xlo"><!> Usage Notes</h3></div> <div class="usage-tips svelte-xt4xlo"><ul class="svelte-xt4xlo"></ul></div></div></div></div> <div class="examples-section svelte-xt4xlo"><details class="examples-toggle svelte-xt4xlo"><summary class="svelte-xt4xlo"><!> Example Configurations</summary> <div class="examples-grid svelte-xt4xlo"></div></details></div></div>`);

export default function SVCBHTTPSBuilder($$anchor, $$props) {
	$.push($$props, true);

	let domain = $.state('example.com');
	let recordType = $.state('HTTPS');
	let priority = $.state(1);
	let targetName = $.state('.');

	let parameters = $.state($.proxy([
		{ key: 'mandatory', value: '', enabled: false },
		{ key: 'alpn', value: '', enabled: false },
		{ key: 'no-default-alpn', value: '', enabled: false },
		{ key: 'port', value: '', enabled: false },
		{ key: 'ipv4hint', value: '', enabled: false },
		{ key: 'ech', value: '', enabled: false },
		{ key: 'ipv6hint', value: '', enabled: false }
	]));

	let showExamples = $.state(false);
	let selectedExample = $.state(null);

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
		const enabledParams = $.get(parameters).filter((p) => p.enabled && (p.value.trim() || p.key === 'no-default-alpn'));

		return {
			recordType: $.get(recordType),
			priority: $.get(priority),
			targetName: $.get(targetName).trim() || '.',
			parameters: enabledParams
		};
	});

	const dnsRecord = $.derived(() => {
		const record = $.get(serviceRecord);
		const target = record.targetName === '.' ? '.' : record.targetName;
		let recordString = `${$.get(domain)}. IN ${record.recordType} ${record.priority} ${target}`;

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
		if (!$.get(domain).trim()) {
			errors.push('Domain is required');
		} else if (!$.get(domain).includes('.')) {
			warnings.push('Domain should include TLD (e.g., .com, .org)');
		}

		// Check priority
		if ($.get(priority) < 0 || $.get(priority) > 65535) {
			errors.push('Priority must be between 0 and 65535');
		}

		if ($.get(priority) === 0 && $.get(targetName) !== '.') {
			warnings.push('Priority 0 should typically use "." as target (alias mode)');
		}

		// Check target name
		if ($.get(targetName) && $.get(targetName) !== '.' && !$.get(targetName).includes('.')) {
			warnings.push('Target name should be a FQDN or "." for same domain');
		}

		// Validate parameters
		const enabledParams = $.get(parameters).filter((p) => p.enabled);

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
		if ($.get(recordType) === 'HTTPS' && $.get(priority) > 0) {
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
		if (!$.get(dnsRecord)) return;

		const zoneContent = $.get(dnsRecord);
		const blob = new Blob([zoneContent], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		a.href = url;
		a.download = `${$.get(domain)}-${$.get(recordType).toLowerCase()}-record.zone`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		clipboard.copy('downloaded', 'export-svcb');
	}

	function _addParameter(key) {
		const param = $.get(parameters).find((p) => p.key === key);

		if (param) {
			param.enabled = true;
			$.set(parameters, $.get(parameters), true);
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
		$.set(domain, example.domain, true);
		$.set(recordType, example.recordType, true);
		$.set(priority, example.priority, true);
		$.set(targetName, example.targetName, true);

		// Reset all parameters
		$.set(parameters, $.get(parameters).map((p) => ({ ...p, enabled: false, value: '' })), true);

		// Set example parameters
		for (const exampleParam of example.parameters) {
			const param = $.get(parameters).find((p) => p.key === exampleParam.key);

			if (param) {
				param.enabled = exampleParam.enabled;
				param.value = exampleParam.value;
			}
		}

		$.set(parameters, $.get(parameters), true);
		$.set(selectedExample, example.name, true);
	}

	const usageNotes = [
		'Priority 0 creates an alias record (AliasMode), priority >0 creates a service record (ServiceMode)',
		'Use "." as target name to indicate the same domain as the owner name',
		'ALPN values should match the protocols actually supported by the service',
		'IP hints can improve connection performance by avoiding additional DNS lookups',
		'ECH parameter enables Encrypted Client Hello for enhanced privacy'
	];

	var div = root_8();
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
	var div_6 = $.child(div_5);
	var label = $.child(div_6);

	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Domain name for the SVCB/HTTPS record');

	var input = $.sibling(label, 2);

	$.remove_input_defaults(input);
	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var label_1 = $.child(div_7);

	$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Record type: HTTPS for HTTP services, SVCB for general services');

	var select = $.sibling(label_1, 2);
	var option = $.child(select);

	option.value = option.__value = 'HTTPS';

	var option_1 = $.sibling(option);

	option_1.value = option_1.__value = 'SVCB';
	$.reset(select);
	$.init_select(select);
	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var label_2 = $.child(div_8);

	$.action(label_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Priority: 0 for alias mode, >0 for service mode');

	var input_1 = $.sibling(label_2, 2);

	$.remove_input_defaults(input_1);
	$.reset(div_8);

	var div_9 = $.sibling(div_8, 2);
	var label_3 = $.child(div_9);

	$.action(label_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => "Target domain name or '.' for same domain");

	var input_2 = $.sibling(label_3, 2);

	$.remove_input_defaults(input_2);
	$.reset(div_9);
	$.reset(div_5);
	$.reset(div_3);

	var div_10 = $.sibling(div_3, 2);
	var div_11 = $.child(div_10);
	var h3_1 = $.child(div_11);
	var node_1 = $.child(h3_1);

	Icon(node_1, { name: 'settings', size: 'sm' });
	$.next();
	$.reset(h3_1);
	$.reset(div_11);

	var div_12 = $.sibling(div_11, 2);

	$.each(div_12, 21, () => $.get(parameters), (parameter) => parameter.key, ($$anchor, parameter, $$index) => {
		var div_13 = root_1();
		let classes;
		var div_14 = $.child(div_13);
		var label_4 = $.child(div_14);
		var input_3 = $.child(label_4);

		$.remove_input_defaults(input_3);

		var span = $.sibling(input_3, 2);
		var text = $.only_child(span, true);
		var span_1 = $.sibling(span, 2);
		var text_1 = $.only_child(span_1, true);

		$.action(span_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => parameterDescriptions[$.get(parameter).key]);
		$.reset(label_4);
		$.reset(div_14);

		var node_2 = $.sibling(div_14, 2);

		{
			var consequent = ($$anchor) => {
				var div_15 = root();
				var input_4 = $.child(div_15);

				$.remove_input_defaults(input_4);
				$.reset(div_15);

				$.template_effect(() => {
					input_4.disabled = !$.get(parameter).enabled;

					$.set_attribute(input_4, 'placeholder', $.get(parameter).key === 'alpn'
						? 'h2,h3'
						: $.get(parameter).key === 'port'
							? '443'
							: $.get(parameter).key === 'ipv4hint'
								? '203.0.113.1,203.0.113.2'
								: $.get(parameter).key === 'ipv6hint'
									? '2001:db8::1,2001:db8::2'
									: $.get(parameter).key === 'ech'
										? 'base64-encoded-config'
										: $.get(parameter).key === 'mandatory' ? '1,3' : 'value');
				});

				$.bind_value(input_4, () => $.get(parameter).value, ($$value) => ($.get(parameter).value = $$value));
				$.append($$anchor, div_15);
			};

			$.if(node_2, ($$render) => {
				if ($.get(parameter).key !== 'no-default-alpn') $$render(consequent);
			});
		}

		$.reset(div_13);

		$.template_effect(() => {
			classes = $.set_class(div_13, 1, 'parameter-item svelte-xt4xlo', null, classes, { enabled: $.get(parameter).enabled });
			$.set_text(text, $.get(parameter).key);
			$.set_text(text_1, parameterDescriptions[$.get(parameter).key]);
		});

		$.bind_checked(input_3, () => $.get(parameter).enabled, ($$value) => ($.get(parameter).enabled = $$value));
		$.append($$anchor, div_13);
	});

	$.reset(div_12);
	$.reset(div_10);
	$.reset(div_2);

	var div_16 = $.sibling(div_2, 2);
	var div_17 = $.child(div_16);
	var div_18 = $.child(div_17);
	var h3_2 = $.child(div_18);
	var text_2 = $.only_child(h3_2);
	var div_19 = $.sibling(h3_2, 2);
	var button = $.child(div_19);
	let classes_1;
	var node_3 = $.child(button);

	{
		let $0 = $.derived(() => clipboard.isCopied('copy-svcb') ? 'check' : 'copy');

		Icon(node_3, {
			get name() {
				return $.get($0);
			},
			size: 'sm'
		});
	}

	var text_3 = $.sibling(node_3);

	$.reset(button);
	$.action(button, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Copy record to clipboard');

	var button_1 = $.sibling(button, 2);
	let classes_2;
	var node_4 = $.child(button_1);

	{
		let $0 = $.derived(() => clipboard.isCopied('export-svcb') ? 'check' : 'download');

		Icon(node_4, {
			get name() {
				return $.get($0);
			},
			size: 'sm'
		});
	}

	var text_4 = $.sibling(node_4);

	$.reset(button_1);
	$.action(button_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Download as zone file');
	$.reset(div_19);
	$.reset(div_18);

	var div_20 = $.sibling(div_18, 2);
	var div_21 = $.child(div_20);
	var code = $.child(div_21);
	var text_5 = $.only_child(code, true);

	$.reset(div_21);
	$.reset(div_20);

	var div_22 = $.sibling(div_20, 2);
	var div_23 = $.sibling($.child(div_22), 2);
	var div_24 = $.child(div_23);
	var text_6 = $.sibling($.child(div_24));

	$.reset(div_24);

	var div_25 = $.sibling(div_24, 2);
	var text_7 = $.sibling($.child(div_25));

	$.reset(div_25);

	var div_26 = $.sibling(div_25, 2);
	var text_8 = $.sibling($.child(div_26));

	$.reset(div_26);

	var div_27 = $.sibling(div_26, 2);
	var text_9 = $.sibling($.child(div_27));

	$.reset(div_27);
	$.reset(div_23);
	$.reset(div_22);
	$.reset(div_17);

	var div_28 = $.sibling(div_17, 2);
	var div_29 = $.child(div_28);
	var h3_3 = $.child(div_29);
	var node_5 = $.child(h3_3);

	Icon(node_5, { name: 'bar-chart', size: 'sm' });
	$.next();
	$.reset(h3_3);
	$.reset(div_29);

	var div_30 = $.sibling(div_29, 2);
	var div_31 = $.child(div_30);
	var span_2 = $.sibling($.child(div_31), 2);
	let classes_3;
	var text_10 = $.only_child(span_2, true);

	$.reset(div_31);
	$.reset(div_30);

	var node_6 = $.sibling(div_30, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_32 = root_3();
			var node_7 = $.child(div_32);

			Icon(node_7, { name: 'x-circle', size: 'sm' });

			var div_33 = $.sibling(node_7, 2);

			$.each(div_33, 21, () => $.get(validation).errors, $.index, ($$anchor, error) => {
				var div_34 = root_2();
				var text_11 = $.only_child(div_34, true);

				$.template_effect(() => $.set_text(text_11, $.get(error)));
				$.append($$anchor, div_34);
			});

			$.reset(div_33);
			$.reset(div_32);
			$.append($$anchor, div_32);
		};

		$.if(node_6, ($$render) => {
			if ($.get(validation).errors.length > 0) $$render(consequent_1);
		});
	}

	var node_8 = $.sibling(node_6, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_35 = root_4();
			var node_9 = $.child(div_35);

			Icon(node_9, { name: 'alert-triangle', size: 'sm' });

			var div_36 = $.sibling(node_9, 2);

			$.each(div_36, 21, () => $.get(validation).warnings, $.index, ($$anchor, warning) => {
				var div_37 = root_2();
				var text_12 = $.only_child(div_37, true);

				$.template_effect(() => $.set_text(text_12, $.get(warning)));
				$.append($$anchor, div_37);
			});

			$.reset(div_36);
			$.reset(div_35);
			$.append($$anchor, div_35);
		};

		$.if(node_8, ($$render) => {
			if ($.get(validation).warnings.length > 0) $$render(consequent_2);
		});
	}

	var node_10 = $.sibling(node_8, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_38 = root_5();
			var node_11 = $.child(div_38);

			Icon(node_11, { name: 'check-circle', size: 'sm' });

			var div_39 = $.sibling(node_11, 2);
			var text_13 = $.only_child(div_39);

			$.reset(div_38);
			$.template_effect(() => $.set_text(text_13, `${$.get(recordType) ?? ''} record is valid and ready to deploy!`));
			$.append($$anchor, div_38);
		};

		$.if(node_10, ($$render) => {
			if ($.get(validation).isValid && $.get(validation).errors.length === 0 && $.get(validation).warnings.length === 0) $$render(consequent_3);
		});
	}

	$.reset(div_28);

	var div_40 = $.sibling(div_28, 2);
	var div_41 = $.child(div_40);
	var h3_4 = $.child(div_41);
	var node_12 = $.child(h3_4);

	Icon(node_12, { name: 'info', size: 'sm' });
	$.next();
	$.reset(h3_4);
	$.reset(div_41);

	var div_42 = $.sibling(div_41, 2);
	var ul = $.child(div_42);

	$.each(ul, 21, () => usageNotes, $.index, ($$anchor, note) => {
		var li = root_6();
		var text_14 = $.only_child(li, true);

		$.template_effect(() => $.set_text(text_14, $.get(note)));
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(div_42);
	$.reset(div_40);
	$.reset(div_16);
	$.reset(div_1);

	var div_43 = $.sibling(div_1, 2);
	var details = $.child(div_43);
	var summary = $.child(details);
	var node_13 = $.child(summary);

	Icon(node_13, { name: 'lightbulb', size: 'sm' });
	$.next();
	$.reset(summary);

	var div_44 = $.sibling(summary, 2);

	$.each(div_44, 21, () => exampleConfigurations, (example) => example.name, ($$anchor, example) => {
		var button_2 = root_7();
		let classes_4;
		var div_45 = $.child(button_2);
		var strong = $.child(div_45);
		var text_15 = $.only_child(strong, true);

		$.reset(div_45);

		var p_1 = $.sibling(div_45, 2);
		var text_16 = $.only_child(p_1, true);
		var div_46 = $.sibling(p_1, 2);
		var div_47 = $.child(div_46);
		var code_1 = $.sibling($.child(div_47));
		var text_17 = $.only_child(code_1, true);
		var code_2 = $.sibling(code_1, 2);
		var text_18 = $.only_child(code_2, true);

		$.reset(div_47);

		var div_48 = $.sibling(div_47, 2);
		var code_3 = $.sibling($.child(div_48));
		var text_19 = $.only_child(code_3, true);

		$.reset(div_48);

		var div_49 = $.sibling(div_48, 2);
		var text_20 = $.only_child(div_49);

		$.reset(div_46);
		$.reset(button_2);

		$.template_effect(
			($0) => {
				classes_4 = $.set_class(button_2, 1, 'example-card svelte-xt4xlo', null, classes_4, { selected: $.get(selectedExample) === $.get(example).name });
				$.set_text(text_15, $.get(example).name);
				$.set_text(text_16, $.get(example).description);
				$.set_text(text_17, $.get(example).recordType);
				$.set_text(text_18, $.get(example).priority);
				$.set_text(text_19, $.get(example).targetName);
				$.set_text(text_20, `Params: ${$0 ?? ''}`);
			},
			[
				() => $.get(example).parameters.map((p) => `${p.key}=${p.value}`).join(', ')
			]
		);

		$.delegated('click', button_2, () => loadExample($.get(example)));
		$.append($$anchor, button_2);
	});

	$.reset(div_44);
	$.reset(details);
	$.reset(div_43);
	$.reset(div);

	$.template_effect(
		($0, $1, $2, $3) => {
			$.set_text(text_2, `Generated ${$.get(recordType) ?? ''} Record`);
			classes_1 = $.set_class(button, 1, 'copy-btn svelte-xt4xlo', null, classes_1, { success: $0 });
			$.set_text(text_3, ` ${$1 ?? ''}`);
			classes_2 = $.set_class(button_1, 1, 'export-btn svelte-xt4xlo', null, classes_2, { success: $2 });
			$.set_text(text_4, ` ${$3 ?? ''}`);
			$.set_text(text_5, $.get(dnsRecord));
			$.set_text(text_6, ` ${$.get(recordType) ?? ''}`);
			$.set_text(text_7, ` ${$.get(priority) ?? ''} (${$.get(priority) === 0 ? 'Alias Mode' : 'Service Mode'})`);
			$.set_text(text_8, ` ${$.get(serviceRecord).targetName ?? ''}`);
			$.set_text(text_9, ` ${$.get(validation).parameterCount ?? ''}`);

			classes_3 = $.set_class(span_2, 1, 'status-value svelte-xt4xlo', null, classes_3, {
				success: $.get(validation).isValid,
				error: !$.get(validation).isValid
			});

			$.set_text(text_10, $.get(validation).isValid ? 'Valid' : 'Invalid');
		},
		[
			() => clipboard.isCopied('copy-svcb'),
			() => clipboard.isCopied('copy-svcb') ? 'Copied!' : 'Copy',
			() => clipboard.isCopied('export-svcb'),
			() => clipboard.isCopied('export-svcb') ? 'Downloaded!' : 'Export'
		]
	);

	$.bind_value(input, () => $.get(domain), ($$value) => $.set(domain, $$value));
	$.bind_select_value(select, () => $.get(recordType), ($$value) => $.set(recordType, $$value));
	$.bind_value(input_1, () => $.get(priority), ($$value) => $.set(priority, $$value));
	$.bind_value(input_2, () => $.get(targetName), ($$value) => $.set(targetName, $$value));
	$.delegated('click', button, () => clipboard.copy($.get(dnsRecord), 'copy-svcb'));
	$.delegated('click', button_1, exportAsZoneFile);
	$.bind_property('open', 'toggle', details, ($$value) => $.set(showExamples, $$value), () => $.get(showExamples));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);