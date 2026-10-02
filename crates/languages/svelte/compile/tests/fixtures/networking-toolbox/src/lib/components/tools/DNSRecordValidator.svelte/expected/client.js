import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';

import {
	validateARecord,
	validateAAAARecord,
	validateCNAMERecord,
	validateMXRecord,
	validateTXTRecord,
	validateSRVRecord,
	validateCAARecord
} from '$lib/utils/dns-validation.js';

import { useClipboard } from '$lib/composables';

var root = $.from_html(`<button class="example-card svelte-nopgro"><div class="example-header svelte-nopgro"><span class="record-type-badge svelte-nopgro"> </span> <span class="example-name svelte-nopgro"> </span></div> <code class="example-value svelte-nopgro"> </code> <div class="example-description svelte-nopgro"> </div></button>`);
var root_1 = $.from_html(`<option> </option>`);
var root_2 = $.from_html(`<textarea id="record-value" placeholder="Enter TXT record content..." class="record-value-textarea svelte-nopgro" rows="3" spellcheck="false"></textarea>`);
var root_3 = $.from_html(`<input id="record-value" type="text" spellcheck="false"/>`);
var root_4 = $.from_html(`<div class="additional-fields svelte-nopgro"><div class="field-group svelte-nopgro"><label for="priority" class="svelte-nopgro">Priority</label> <input id="priority" type="number" min="0" max="65535" class="priority-input svelte-nopgro"/></div></div>`);
var root_5 = $.from_html(`<div class="additional-fields svelte-nopgro"><div class="field-group svelte-nopgro"><label for="service" class="svelte-nopgro">Service</label> <input id="service" type="text" placeholder="_http" class="service-input svelte-nopgro"/></div> <div class="field-group svelte-nopgro"><label for="protocol" class="svelte-nopgro">Protocol</label> <select id="protocol" class="protocol-select svelte-nopgro"><option>_tcp</option><option>_udp</option></select></div> <div class="field-group svelte-nopgro"><label for="srv-priority" class="svelte-nopgro">Priority</label> <input id="srv-priority" type="number" min="0" max="65535" class="priority-input svelte-nopgro"/></div> <div class="field-group svelte-nopgro"><label for="weight" class="svelte-nopgro">Weight</label> <input id="weight" type="number" min="0" max="65535" class="weight-input svelte-nopgro"/></div> <div class="field-group svelte-nopgro"><label for="port" class="svelte-nopgro">Port</label> <input id="port" type="number" min="0" max="65535" class="port-input svelte-nopgro"/></div></div>`);
var root_6 = $.from_html(`<div class="additional-fields svelte-nopgro"><div class="field-group svelte-nopgro"><label for="flags" class="svelte-nopgro">Flags</label> <input id="flags" type="number" min="0" max="255" class="flags-input svelte-nopgro"/></div> <div class="field-group svelte-nopgro"><label for="tag" class="svelte-nopgro">Tag</label> <select id="tag" class="tag-select svelte-nopgro"><option>issue</option><option>issuewild</option><option>iodef</option></select></div></div>`);
var root_7 = $.from_html(`<li class="error-item svelte-nopgro"> </li>`);
var root_8 = $.from_html(`<div class="validation-section errors svelte-nopgro"><h4 class="svelte-nopgro"><!> </h4> <ul class="validation-list svelte-nopgro"></ul></div>`);
var root_9 = $.from_html(`<li class="warning-item svelte-nopgro"> </li>`);
var root_10 = $.from_html(`<div class="validation-section warnings svelte-nopgro"><h4 class="svelte-nopgro"><!> </h4> <ul class="validation-list svelte-nopgro"></ul></div>`);
var root_11 = $.from_html(`<div class="validation-section normalized svelte-nopgro"><h4 class="svelte-nopgro"><!> Normalized Value</h4> <code class="normalized-value svelte-nopgro"> </code></div>`);
var root_12 = $.from_html(`<div class="card results-card svelte-nopgro"><div class="results-header svelte-nopgro"><div><!> <span> </span></div> <button><!> Copy Zone Line</button></div> <div class="formatted-record svelte-nopgro"><h4 class="svelte-nopgro">Zone File Format:</h4> <pre class="svelte-nopgro"><code class="svelte-nopgro"> </code></pre></div> <!> <!> <!></div>`);

var root_13 = $.from_html(`<div class="card"><header class="card-header"><h1>DNS Record Validator</h1> <p>Validate individual DNS resource record syntax for proper formatting and common issues</p></header> <div class="card info-card svelte-nopgro"><div class="overview-content svelte-nopgro"><div class="overview-item svelte-nopgro"><!> <div><strong class="svelte-nopgro">Syntax Validation:</strong> Verify record values match RFC specifications for format and constraints.</div></div> <div class="overview-item svelte-nopgro"><!> <div><strong class="svelte-nopgro">Error Detection:</strong> Identify format errors, range violations, and protocol mismatches.</div></div> <div class="overview-item svelte-nopgro"><!> <div><strong class="svelte-nopgro">Best Practices:</strong> Get warnings about potential issues and optimization suggestions.</div></div></div></div> <div class="card examples-card svelte-nopgro"><details class="examples-details svelte-nopgro"><summary class="examples-summary svelte-nopgro"><!> <h3 class="svelte-nopgro">Quick Examples</h3></summary> <div class="examples-grid svelte-nopgro"></div></details></div> <div class="card input-card svelte-nopgro"><div class="input-group svelte-nopgro"><label for="record-type" class="svelte-nopgro"><!> Record Type</label> <select id="record-type" class="record-type-select svelte-nopgro"></select> <div class="record-type-description svelte-nopgro"> </div></div> <div class="input-group svelte-nopgro"><label for="record-name" class="svelte-nopgro"><!> Record Name</label> <input id="record-name" type="text" placeholder="example.com" class="record-name-input svelte-nopgro" spellcheck="false"/></div> <div class="input-group svelte-nopgro"><label for="record-value" class="svelte-nopgro"><!> Record Value</label> <!></div> <!> <!> <!> <div class="input-group svelte-nopgro"><label for="ttl" class="svelte-nopgro"><!> TTL (seconds)</label> <input id="ttl" type="number" min="0" max="2147483647" placeholder="3600" class="ttl-input svelte-nopgro"/></div></div> <!> <div class="education-card svelte-nopgro"><div class="education-grid svelte-nopgro"><div class="education-item info-panel svelte-nopgro"><h4 class="svelte-nopgro">Common Record Types</h4> <p class="svelte-nopgro">A/AAAA records map domains to IP addresses. CNAME creates aliases. MX directs email. TXT stores arbitrary data
          like SPF policies. SRV specifies service locations.</p></div> <div class="education-item info-panel svelte-nopgro"><h4 class="svelte-nopgro">Validation Scope</h4> <p class="svelte-nopgro">This validator checks syntax, format, and common configuration issues. It doesn't verify that targets exist or
          are reachable - use DNS lookup tools for connectivity testing.</p></div> <div class="education-item info-panel svelte-nopgro"><h4 class="svelte-nopgro">TTL Guidelines</h4> <p class="svelte-nopgro">Use shorter TTLs (300-3600s) for records that change frequently. Longer TTLs (3600-86400s) reduce DNS queries
          but slow propagation of changes. Balance based on your needs.</p></div> <div class="education-item info-panel svelte-nopgro"><h4 class="svelte-nopgro">Best Practices</h4> <p class="svelte-nopgro">Always use fully qualified domain names (ending with .) in record values. Validate SPF/DMARC policies
          carefully. Keep MX priorities consistent. Use descriptive TXT record formatting.</p></div></div></div></div>`);

export default function DNSRecordValidator($$anchor, $$props) {
	$.push($$props, true);

	let recordType = $.state('A');
	let recordName = $.state('example.com');
	let recordValue = $.state('192.168.1.1');
	let ttl = $.state(3600);

	// Additional fields for specific record types
	let priority = $.state(10);

	let weight = $.state(0);
	let port = $.state(443);
	let service = $.state('_http');
	let protocol = $.state('_tcp');
	let flags = $.state(0);
	let tag = $.state('issue');
	let results = $.state(null);
	const clipboard = useClipboard();

	const recordTypes = [
		{
			value: 'A',
			label: 'A (IPv4 Address)',
			description: 'Maps domain to IPv4 address'
		},

		{
			value: 'AAAA',
			label: 'AAAA (IPv6 Address)',
			description: 'Maps domain to IPv6 address'
		},

		{
			value: 'CNAME',
			label: 'CNAME (Canonical Name)',
			description: 'Alias to another domain'
		},

		{
			value: 'MX',
			label: 'MX (Mail Exchange)',
			description: 'Mail server for domain'
		},

		{
			value: 'TXT',
			label: 'TXT (Text)',
			description: 'Arbitrary text data'
		},

		{
			value: 'SRV',
			label: 'SRV (Service)',
			description: 'Service location and port'
		},

		{
			value: 'CAA',
			label: 'CAA (Certificate Authority)',
			description: 'Certificate authority authorization'
		}
	];

	const examples = [
		{
			type: 'A',
			name: 'www.example.com',
			value: '192.0.2.1',
			description: 'Basic web server A record'
		},

		{
			type: 'AAAA',
			name: 'www.example.com',
			value: '2001:db8::1',
			description: 'IPv6 web server record'
		},

		{
			type: 'CNAME',
			name: 'blog.example.com',
			value: 'www.example.com.',
			description: 'Blog subdomain alias'
		},

		{
			type: 'MX',
			name: 'example.com',
			value: 'mail.example.com.',
			priority: 10,
			description: 'Primary mail server'
		},

		{
			type: 'TXT',
			name: 'example.com',
			value: 'v=spf1 include:_spf.google.com ~all',
			description: 'SPF policy record'
		},

		{
			type: 'SRV',
			name: '_https._tcp.example.com',
			value: 'server.example.com.',
			priority: 0,
			weight: 5,
			port: 443,
			description: 'HTTPS service record'
		}
	];

	function loadExample(example) {
		$.set(recordType, example.type, true);
		$.set(recordName, example.name, true);
		$.set(recordValue, example.value, true);

		if ('priority' in example && example.priority !== undefined) {
			$.set(priority, example.priority, true);
		}

		if ('weight' in example && example.weight !== undefined) {
			$.set(weight, example.weight, true);
		}

		if ('port' in example && example.port !== undefined) {
			$.set(port, example.port, true);
		}

		validateRecord();
	}

	function validateRecord() {
		if (!$.get(recordValue).trim()) {
			$.set(results, null);

			return;
		}

		try {
			switch ($.get(recordType)) {
				case 'A':
					$.set(results, validateARecord($.get(recordValue)), true);
					break;

				case 'AAAA':
					$.set(results, validateAAAARecord($.get(recordValue)), true);
					break;

				case 'CNAME':
					$.set(results, validateCNAMERecord($.get(recordValue)), true);
					break;

				case 'MX':
					$.set(results, validateMXRecord($.get(recordValue), $.get(priority)), true);
					break;

				case 'TXT':
					$.set(results, validateTXTRecord($.get(recordValue)), true);
					break;

				case 'SRV':
					$.set(results, validateSRVRecord($.get(service), $.get(protocol), $.get(priority), $.get(weight), $.get(port), $.get(recordValue)), true);
					break;

				case 'CAA':
					$.set(results, validateCAARecord($.get(flags), $.get(tag), $.get(recordValue)), true);
					break;

				default:
					$.set(
						results,
						{
							valid: false,
							errors: [`Unsupported record type: ${$.get(recordType)}`],
							warnings: []
						},
						true
					);
			}
		} catch(error) {
			$.set(
				results,
				{
					valid: false,
					errors: [error instanceof Error ? error.message : 'Validation error'],
					warnings: []
				},
				true
			);
		}
	}

	function formatRecord() {
		switch ($.get(recordType)) {
			case 'A':

			case 'AAAA':

			case 'CNAME':
				return `${$.get(recordName)} ${$.get(ttl)} IN ${$.get(recordType)} ${$.get(recordValue)}`;

			case 'MX':
				return `${$.get(recordName)} ${$.get(ttl)} IN MX ${$.get(priority)} ${$.get(recordValue)}`;

			case 'TXT':
				return `${$.get(recordName)} ${$.get(ttl)} IN TXT "${$.get(recordValue)}"`;

			case 'SRV':
				return `${$.get(service)}.${$.get(protocol)}.${$.get(recordName)} ${$.get(ttl)} IN SRV ${$.get(priority)} ${$.get(weight)} ${$.get(port)} ${$.get(recordValue)}`;

			case 'CAA':
				return `${$.get(recordName)} ${$.get(ttl)} IN CAA ${$.get(flags)} ${$.get(tag)} "${$.get(recordValue)}"`;

			default:
				return `${$.get(recordName)} ${$.get(ttl)} IN ${$.get(recordType)} ${$.get(recordValue)}`;
		}
	}

	// Validate on component load and when inputs change
	function handleInputChange() {
		validateRecord();
	}

	validateRecord();

	var div = root_13();
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	Icon(node, { name: 'check-circle', size: 'sm' });
	$.next(2);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_1 = $.child(div_4);

	Icon(node_1, { name: 'alert-triangle', size: 'sm' });
	$.next(2);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_2 = $.child(div_5);

	Icon(node_2, { name: 'lightbulb', size: 'sm' });
	$.next(2);
	$.reset(div_5);
	$.reset(div_2);
	$.reset(div_1);

	var div_6 = $.sibling(div_1, 2);
	var details = $.child(div_6);
	var summary = $.child(details);
	var node_3 = $.child(summary);

	Icon(node_3, { name: 'chevron-right', size: 'sm' });
	$.next(2);
	$.reset(summary);

	var div_7 = $.sibling(summary, 2);

	$.each(div_7, 21, () => examples, (example) => example.type + example.name, ($$anchor, example) => {
		var button = root();
		var div_8 = $.child(button);
		var span = $.child(div_8);
		var text = $.only_child(span, true);
		var span_1 = $.sibling(span, 2);
		var text_1 = $.only_child(span_1, true);

		$.reset(div_8);

		var code = $.sibling(div_8, 2);
		var text_2 = $.only_child(code, true);
		var div_9 = $.sibling(code, 2);
		var text_3 = $.only_child(div_9, true);

		$.reset(button);

		$.template_effect(() => {
			$.set_text(text, $.get(example).type);
			$.set_text(text_1, $.get(example).name);
			$.set_text(text_2, $.get(example).value);
			$.set_text(text_3, $.get(example).description);
		});

		$.delegated('click', button, () => loadExample($.get(example)));
		$.append($$anchor, button);
	});

	$.reset(div_7);
	$.reset(details);
	$.reset(div_6);

	var div_10 = $.sibling(div_6, 2);
	var div_11 = $.child(div_10);
	var label = $.child(div_11);
	var node_4 = $.child(label);

	Icon(node_4, { name: 'tag', size: 'sm' });
	$.next();
	$.reset(label);
	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Select the DNS record type to validate');

	var select = $.sibling(label, 2);

	$.each(select, 21, () => recordTypes, (type) => type.value, ($$anchor, type) => {
		var option = root_1();
		var text_4 = $.only_child(option, true);
		var option_value = {};

		$.template_effect(() => {
			$.set_text(text_4, $.get(type).label);

			if (option_value !== (option_value = $.get(type).value)) {
				option.value = (option.__value = option_value) ?? '';
			}
		});

		$.append($$anchor, option);
	});

	$.reset(select);
	$.init_select(select);

	var div_12 = $.sibling(select, 2);
	var text_5 = $.only_child(div_12, true);

	$.reset(div_11);

	var div_13 = $.sibling(div_11, 2);
	var label_1 = $.child(div_13);
	var node_5 = $.child(label_1);

	Icon(node_5, { name: 'globe', size: 'sm' });
	$.next();
	$.reset(label_1);
	$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'The domain name for this DNS record');

	var input = $.sibling(label_1, 2);

	$.remove_input_defaults(input);
	$.reset(div_13);

	var div_14 = $.sibling(div_13, 2);
	var label_2 = $.child(div_14);
	var node_6 = $.child(label_2);

	Icon(node_6, { name: 'edit', size: 'sm' });
	$.next();
	$.reset(label_2);
	$.action(label_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'The value/data for this DNS record');

	var node_7 = $.sibling(label_2, 2);

	{
		var consequent = ($$anchor) => {
			var textarea = root_2();

			$.remove_textarea_child(textarea);
			$.delegated('input', textarea, handleInputChange);
			$.bind_value(textarea, () => $.get(recordValue), ($$value) => $.set(recordValue, $$value));
			$.append($$anchor, textarea);
		};

		var alternate = ($$anchor) => {
			var input_1 = root_3();

			$.remove_input_defaults(input_1);

			$.template_effect(() => {
				$.set_attribute(input_1, 'placeholder', $.get(recordType) === 'A'
					? '192.0.2.1'
					: $.get(recordType) === 'AAAA' ? '2001:db8::1' : 'Record value...');

				$.set_class(
					input_1,
					1,
					`record-value-input ${$.get(results)?.valid === true
						? 'valid'
						: $.get(results)?.valid === false ? 'invalid' : ''}`,
					'svelte-nopgro'
				);
			});

			$.delegated('input', input_1, handleInputChange);
			$.bind_value(input_1, () => $.get(recordValue), ($$value) => $.set(recordValue, $$value));
			$.append($$anchor, input_1);
		};

		$.if(node_7, ($$render) => {
			if ($.get(recordType) === 'TXT') $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div_14);

	var node_8 = $.sibling(div_14, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_15 = root_4();
			var div_16 = $.child(div_15);
			var input_2 = $.sibling($.child(div_16), 2);

			$.remove_input_defaults(input_2);
			$.reset(div_16);
			$.reset(div_15);
			$.delegated('input', input_2, handleInputChange);
			$.bind_value(input_2, () => $.get(priority), ($$value) => $.set(priority, $$value));
			$.append($$anchor, div_15);
		};

		$.if(node_8, ($$render) => {
			if ($.get(recordType) === 'MX') $$render(consequent_1);
		});
	}

	var node_9 = $.sibling(node_8, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_17 = root_5();
			var div_18 = $.child(div_17);
			var input_3 = $.sibling($.child(div_18), 2);

			$.remove_input_defaults(input_3);
			$.reset(div_18);

			var div_19 = $.sibling(div_18, 2);
			var select_1 = $.sibling($.child(div_19), 2);
			var option_1 = $.child(select_1);

			option_1.value = option_1.__value = '_tcp';

			var option_2 = $.sibling(option_1);

			option_2.value = option_2.__value = '_udp';
			$.reset(select_1);
			$.init_select(select_1);
			$.reset(div_19);

			var div_20 = $.sibling(div_19, 2);
			var input_4 = $.sibling($.child(div_20), 2);

			$.remove_input_defaults(input_4);
			$.reset(div_20);

			var div_21 = $.sibling(div_20, 2);
			var input_5 = $.sibling($.child(div_21), 2);

			$.remove_input_defaults(input_5);
			$.reset(div_21);

			var div_22 = $.sibling(div_21, 2);
			var input_6 = $.sibling($.child(div_22), 2);

			$.remove_input_defaults(input_6);
			$.reset(div_22);
			$.reset(div_17);
			$.delegated('input', input_3, handleInputChange);
			$.bind_value(input_3, () => $.get(service), ($$value) => $.set(service, $$value));
			$.delegated('change', select_1, handleInputChange);
			$.bind_select_value(select_1, () => $.get(protocol), ($$value) => $.set(protocol, $$value));
			$.delegated('input', input_4, handleInputChange);
			$.bind_value(input_4, () => $.get(priority), ($$value) => $.set(priority, $$value));
			$.delegated('input', input_5, handleInputChange);
			$.bind_value(input_5, () => $.get(weight), ($$value) => $.set(weight, $$value));
			$.delegated('input', input_6, handleInputChange);
			$.bind_value(input_6, () => $.get(port), ($$value) => $.set(port, $$value));
			$.append($$anchor, div_17);
		};

		$.if(node_9, ($$render) => {
			if ($.get(recordType) === 'SRV') $$render(consequent_2);
		});
	}

	var node_10 = $.sibling(node_9, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_23 = root_6();
			var div_24 = $.child(div_23);
			var input_7 = $.sibling($.child(div_24), 2);

			$.remove_input_defaults(input_7);
			$.reset(div_24);

			var div_25 = $.sibling(div_24, 2);
			var select_2 = $.sibling($.child(div_25), 2);
			var option_3 = $.child(select_2);

			option_3.value = option_3.__value = 'issue';

			var option_4 = $.sibling(option_3);

			option_4.value = option_4.__value = 'issuewild';

			var option_5 = $.sibling(option_4);

			option_5.value = option_5.__value = 'iodef';
			$.reset(select_2);
			$.init_select(select_2);
			$.reset(div_25);
			$.reset(div_23);
			$.delegated('input', input_7, handleInputChange);
			$.bind_value(input_7, () => $.get(flags), ($$value) => $.set(flags, $$value));
			$.delegated('change', select_2, handleInputChange);
			$.bind_select_value(select_2, () => $.get(tag), ($$value) => $.set(tag, $$value));
			$.append($$anchor, div_23);
		};

		$.if(node_10, ($$render) => {
			if ($.get(recordType) === 'CAA') $$render(consequent_3);
		});
	}

	var div_26 = $.sibling(node_10, 2);
	var label_3 = $.child(div_26);
	var node_11 = $.child(label_3);

	Icon(node_11, { name: 'clock', size: 'sm' });
	$.next();
	$.reset(label_3);
	$.action(label_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Time To Live in seconds (how long record should be cached)');

	var input_8 = $.sibling(label_3, 2);

	$.remove_input_defaults(input_8);
	$.reset(div_26);
	$.reset(div_10);

	var node_12 = $.sibling(div_10, 2);

	{
		var consequent_7 = ($$anchor) => {
			var div_27 = root_12();
			var div_28 = $.child(div_27);
			var div_29 = $.child(div_28);
			var node_13 = $.child(div_29);

			{
				let $0 = $.derived(() => $.get(results).valid ? 'check-circle' : 'x-circle');

				Icon(node_13, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			var span_2 = $.sibling(node_13, 2);
			var text_6 = $.only_child(span_2);

			$.reset(div_29);

			var button_1 = $.sibling(div_29, 2);
			var node_14 = $.child(button_1);

			{
				let $0 = $.derived(() => clipboard.isCopied() ? 'check' : 'copy');

				Icon(node_14, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			$.next();
			$.reset(button_1);
			$.reset(div_28);

			var div_30 = $.sibling(div_28, 2);
			var pre = $.sibling($.child(div_30), 2);
			var code_1 = $.child(pre);
			var text_7 = $.only_child(code_1, true);

			$.reset(pre);
			$.reset(div_30);

			var node_15 = $.sibling(div_30, 2);

			{
				var consequent_4 = ($$anchor) => {
					var div_31 = root_8();
					var h4 = $.child(div_31);
					var node_16 = $.child(h4);

					Icon(node_16, { name: 'x-circle', size: 'sm' });

					var text_8 = $.sibling(node_16);

					$.reset(h4);

					var ul = $.sibling(h4, 2);

					$.each(ul, 21, () => $.get(results).errors, $.index, ($$anchor, error) => {
						var li = root_7();
						var text_9 = $.only_child(li, true);

						$.template_effect(() => $.set_text(text_9, $.get(error)));
						$.append($$anchor, li);
					});

					$.reset(ul);
					$.reset(div_31);
					$.template_effect(() => $.set_text(text_8, ` Errors (${$.get(results).errors.length ?? ''})`));
					$.append($$anchor, div_31);
				};

				$.if(node_15, ($$render) => {
					if ($.get(results).errors.length > 0) $$render(consequent_4);
				});
			}

			var node_17 = $.sibling(node_15, 2);

			{
				var consequent_5 = ($$anchor) => {
					var div_32 = root_10();
					var h4_1 = $.child(div_32);
					var node_18 = $.child(h4_1);

					Icon(node_18, { name: 'alert-triangle', size: 'sm' });

					var text_10 = $.sibling(node_18);

					$.reset(h4_1);

					var ul_1 = $.sibling(h4_1, 2);

					$.each(ul_1, 21, () => $.get(results).warnings, $.index, ($$anchor, warning) => {
						var li_1 = root_9();
						var text_11 = $.only_child(li_1, true);

						$.template_effect(() => $.set_text(text_11, $.get(warning)));
						$.append($$anchor, li_1);
					});

					$.reset(ul_1);
					$.reset(div_32);
					$.template_effect(() => $.set_text(text_10, ` Warnings (${$.get(results).warnings.length ?? ''})`));
					$.append($$anchor, div_32);
				};

				$.if(node_17, ($$render) => {
					if ($.get(results).warnings.length > 0) $$render(consequent_5);
				});
			}

			var node_19 = $.sibling(node_17, 2);

			{
				var consequent_6 = ($$anchor) => {
					var div_33 = root_11();
					var h4_2 = $.child(div_33);
					var node_20 = $.child(h4_2);

					Icon(node_20, { name: 'check', size: 'sm' });
					$.next();
					$.reset(h4_2);

					var code_2 = $.sibling(h4_2, 2);
					var text_12 = $.only_child(code_2, true);

					$.reset(div_33);
					$.template_effect(() => $.set_text(text_12, $.get(results).normalized));
					$.append($$anchor, div_33);
				};

				$.if(node_19, ($$render) => {
					if ($.get(results).normalized && $.get(results).normalized !== $.get(recordValue)) $$render(consequent_6);
				});
			}

			$.reset(div_27);

			$.template_effect(
				($0, $1) => {
					$.set_class(div_29, 1, `validation-status ${$.get(results).valid ? 'valid' : 'invalid'}`, 'svelte-nopgro');
					$.set_text(text_6, `${$.get(results).valid ? 'Valid' : 'Invalid'} DNS Record`);
					$.set_class(button_1, 1, `copy-button ${$0 ?? ''}`, 'svelte-nopgro');
					$.set_text(text_7, $1);
				},
				[
					() => clipboard.isCopied() ? 'copied' : '',
					() => formatRecord()
				]
			);

			$.delegated('click', button_1, () => clipboard.copy(formatRecord()));
			$.append($$anchor, div_27);
		};

		$.if(node_12, ($$render) => {
			if ($.get(results)) $$render(consequent_7);
		});
	}

	$.next(2);
	$.reset(div);

	$.template_effect(($0) => $.set_text(text_5, $0), [
		() => recordTypes.find((t) => t.value === $.get(recordType))?.description || ''
	]);

	$.delegated('change', select, handleInputChange);
	$.bind_select_value(select, () => $.get(recordType), ($$value) => $.set(recordType, $$value));
	$.delegated('input', input, handleInputChange);
	$.bind_value(input, () => $.get(recordName), ($$value) => $.set(recordName, $$value));
	$.delegated('input', input_8, handleInputChange);
	$.bind_value(input_8, () => $.get(ttl), ($$value) => $.set(ttl, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'change', 'input']);