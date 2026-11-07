import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';
import { tooltip } from '$lib/actions/tooltip';
import { useClipboard } from '$lib/composables';

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<button class="service-item svelte-dvsla4"><strong class="svelte-dvsla4"> </strong> </button>`);
var root_2 = $.from_html(`<code class="svelte-dvsla4"> </code>`);
var root_3 = $.from_html(`<p class="placeholder svelte-dvsla4">Fill in the required fields to generate the NAPTR record</p>`);
var root_4 = $.from_html(`<li class="svelte-dvsla4"> </li>`);
var root_5 = $.from_html(`<div class="message warning svelte-dvsla4"><!> <div><h4 class="svelte-dvsla4">Configuration Warnings</h4> <ul class="svelte-dvsla4"></ul></div></div>`);
var root_6 = $.from_html(`<div class="actions svelte-dvsla4"><button><!> </button> <button><!> </button></div>`);

var root_7 = $.from_html(`<div class="container svelte-dvsla4"><div class="card svelte-dvsla4"><div class="card-header svelte-dvsla4"><h1 class="svelte-dvsla4">NAPTR Record Builder</h1> <p class="svelte-dvsla4">Construct NAPTR (Naming Authority Pointer) records for dynamic delegation and service mapping</p></div> <div class="content svelte-dvsla4"><div class="card examples-card svelte-dvsla4"><details class="svelte-dvsla4"><summary class="examples-summary svelte-dvsla4"><!> Quick Examples <span class="chevron svelte-dvsla4"><!></span></summary> <div class="examples-grid svelte-dvsla4"><button class="example-btn svelte-dvsla4">SIP Service</button> <button class="example-btn svelte-dvsla4">Email Service</button> <button class="example-btn svelte-dvsla4">Web Service</button> <button class="example-btn svelte-dvsla4">SRV Delegation</button></div></details></div> <div class="main-grid svelte-dvsla4"><div class="input-section svelte-dvsla4"><div class="input-group svelte-dvsla4"><label for="domain" class="svelte-dvsla4">Domain Name *</label> <input id="domain" type="text" placeholder="example.com" class="svelte-dvsla4"/> <p class="description svelte-dvsla4">The domain name for this NAPTR record</p></div> <div class="order-grid svelte-dvsla4"><div class="input-group svelte-dvsla4"><label for="order" class="svelte-dvsla4">Order *</label> <input id="order" type="number" min="0" max="65535" class="svelte-dvsla4"/> <p class="description svelte-dvsla4">Processing order (0-65535)</p></div> <div class="input-group svelte-dvsla4"><label for="preference" class="svelte-dvsla4">Preference *</label> <input id="preference" type="number" min="0" max="65535" class="svelte-dvsla4"/> <p class="description svelte-dvsla4">Preference within order (0-65535)</p></div></div> <div class="input-group svelte-dvsla4"><label for="flags" class="svelte-dvsla4">Flags</label> <select id="flags" class="svelte-dvsla4"></select> <p class="description svelte-dvsla4"> </p></div> <div class="input-group svelte-dvsla4"><label for="service" class="svelte-dvsla4">Service</label> <input id="service" type="text" placeholder="E2U+sip" class="svelte-dvsla4"/> <details class="service-examples svelte-dvsla4"><summary class="svelte-dvsla4">Show service examples</summary> <div class="service-list svelte-dvsla4"></div></details></div> <div class="input-group svelte-dvsla4"><label for="regexp" class="svelte-dvsla4">Regular Expression</label> <input id="regexp" type="text" placeholder="!^.*$!sip:info@example.com!" class="mono svelte-dvsla4"/> <p class="description svelte-dvsla4">Substitution expression (format: !pattern!replacement!)</p></div> <div class="input-group svelte-dvsla4"><label for="replacement" class="svelte-dvsla4">Replacement</label> <input id="replacement" type="text" placeholder="." class="svelte-dvsla4"/> <p class="description svelte-dvsla4">Domain name for next lookup, or "." for terminal rules</p></div></div> <div class="output-section svelte-dvsla4"><div class="card svelte-dvsla4"><h3 class="section-title svelte-dvsla4">Generated NAPTR Record</h3> <div class="code-block svelte-dvsla4"><!></div></div> <!> <!></div></div> <div class="info-section svelte-dvsla4"><div class="card info-card svelte-dvsla4"><h3 class="section-title svelte-dvsla4">About NAPTR Records</h3> <p class="svelte-dvsla4">NAPTR (Naming Authority Pointer) records provide a way to map domain names to URIs or other domain names
            through regular expression-based rewriting. They're commonly used in telecommunications for ENUM (E.164
            Number Mapping) and SIP services, allowing dynamic delegation and service discovery.</p></div> <div class="info-grid svelte-dvsla4"><div class="card info-card svelte-dvsla4"><h4 class="svelte-dvsla4">Field Descriptions</h4> <dl class="field-list svelte-dvsla4"><dt class="svelte-dvsla4">Order:</dt> <dd class="svelte-dvsla4">Processing order (lower values first)</dd> <dt class="svelte-dvsla4">Preference:</dt> <dd class="svelte-dvsla4">Preference within same order</dd> <dt class="svelte-dvsla4">Flags:</dt> <dd class="svelte-dvsla4">Control processing behavior</dd> <dt class="svelte-dvsla4">Service:</dt> <dd class="svelte-dvsla4">Service identifier or protocol</dd> <dt class="svelte-dvsla4">RegExp:</dt> <dd class="svelte-dvsla4">Pattern matching and substitution</dd> <dt class="svelte-dvsla4">Replacement:</dt> <dd class="svelte-dvsla4">Next domain to query</dd></dl></div> <div class="card info-card svelte-dvsla4"><h4 class="svelte-dvsla4">Common Use Cases</h4> <ul class="use-case-list svelte-dvsla4"><li class="svelte-dvsla4">ENUM telephone number mapping</li> <li class="svelte-dvsla4">SIP service discovery</li> <li class="svelte-dvsla4">Dynamic delegation</li> <li class="svelte-dvsla4">Protocol mapping</li> <li class="svelte-dvsla4">Service location</li></ul></div></div></div></div></div></div>`);

export default function NAPTRBuilder($$anchor, $$props) {
	$.push($$props, true);

	let domain = $.state('');
	let order = $.state('100');
	let preference = $.state('10');
	let flags = $.state('U');
	let service = $.state('E2U+sip');
	let regexp = $.state('!^.*$!sip:info@example.com!');
	let replacement = $.state('.');
	const clipboard = useClipboard();
	let showExamples = $.state(false);

	const flagOptions = [
		{
			value: 'U',
			label: 'U - Terminal rule (URI)',
			description: 'The Rule is terminal and the result is a URI'
		},

		{
			value: 'S',
			label: 'S - Terminal rule (SRV)',
			description: 'The Rule is terminal and the result is for SRV lookup'
		},

		{
			value: 'A',
			label: 'A - Terminal rule (Address)',
			description: 'The Rule is terminal and the result is an address record'
		},

		{
			value: 'P',
			label: 'P - Protocol specific',
			description: 'Protocol-specific flags'
		},

		{
			value: '',
			label: 'Empty - Non-terminal',
			description: 'The Rule is not terminal (continue processing)'
		}
	];

	const serviceExamples = [
		{
			value: 'E2U+sip',
			label: 'SIP Service',
			description: 'Session Initiation Protocol'
		},

		{
			value: 'E2U+email',
			label: 'Email Service',
			description: 'Electronic mail service'
		},

		{
			value: 'E2U+web+http',
			label: 'HTTP Web Service',
			description: 'Web service over HTTP'
		},

		{
			value: 'E2U+web+https',
			label: 'HTTPS Web Service',
			description: 'Secure web service over HTTPS'
		},

		{
			value: 'E2U+tel',
			label: 'Telephone Service',
			description: 'Telephone number mapping'
		},

		{
			value: 'E2U+fax',
			label: 'Fax Service',
			description: 'Facsimile service'
		},

		{
			value: 'E2U+h323',
			label: 'H.323 Service',
			description: 'H.323 multimedia protocol'
		},

		{
			value: 'E2U+im',
			label: 'Instant Messaging',
			description: 'Instant messaging service'
		}
	];

	let naptrRecord = $.derived(() => {
		if (!$.get(domain).trim()) return '';

		const cleanDomain = $.get(domain).trim().replace(/\.$/, '');

		return `${cleanDomain}. IN NAPTR ${$.get(order)} ${$.get(preference)} "${$.get(flags)}" "${$.get(service)}" "${$.get(regexp)}" ${$.get(replacement)}`;
	});

	let isValid = $.derived(() => {
		return $.get(domain).trim() !== '' && $.get(order) !== '' && $.get(preference) !== '' && parseInt($.get(order)) >= 0 && parseInt($.get(order)) <= 65535 && parseInt($.get(preference)) >= 0 && parseInt($.get(preference)) <= 65535;
	});

	let warnings = $.derived(() => {
		const warns = [];

		if ($.get(flags) === 'U' && !$.get(regexp).includes('!')) {
			warns.push('URI flag requires a valid substitution expression with delimiters');
		}

		if ($.get(flags) === 'S' && $.get(replacement) === '.') {
			warns.push('SRV flag typically requires a replacement domain, not "."');
		}

		if ($.get(flags) === '' && $.get(replacement) === '.') {
			warns.push('Non-terminal rules should have a replacement domain for continued processing');
		}

		if ($.get(regexp) && !$.get(regexp).match(/^!.*!.*!$/)) {
			warns.push('Regular expressions should follow the format: !pattern!replacement!');
		}

		if (parseInt($.get(order)) === parseInt($.get(preference))) {
			warns.push('Order and Preference should typically be different values');
		}

		return warns;
	});

	function copyToClipboard() {
		clipboard.copy($.get(naptrRecord), 'copy');
	}

	function downloadRecord() {
		const blob = new Blob([$.get(naptrRecord)], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		a.href = url;
		a.download = `${$.get(domain).replace(/\.$/, '') || 'naptr'}-record.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		clipboard.copy('', 'download');
	}

	function loadExample(exampleType) {
		switch (exampleType) {
			case 'sip':
				$.set(domain, 'example.com');
				$.set(order, '100');
				$.set(preference, '10');
				$.set(flags, 'U');
				$.set(service, 'E2U+sip');
				$.set(regexp, '!^.*$!sip:info@example.com!');
				$.set(replacement, '.');
				break;

			case 'email':
				$.set(domain, 'example.com');
				$.set(order, '100');
				$.set(preference, '10');
				$.set(flags, 'U');
				$.set(service, 'E2U+email');
				$.set(regexp, '!^.*$!mailto:admin@example.com!');
				$.set(replacement, '.');
				break;

			case 'web':
				$.set(domain, 'example.com');
				$.set(order, '100');
				$.set(preference, '10');
				$.set(flags, 'U');
				$.set(service, 'E2U+web+https');
				$.set(regexp, '!^.*$!https://www.example.com/!');
				$.set(replacement, '.');
				break;

			case 'srv':
				$.set(domain, 'example.com');
				$.set(order, '100');
				$.set(preference, '10');
				$.set(flags, 'S');
				$.set(service, 'SIP+D2T');
				$.set(regexp, '');
				$.set(replacement, '_sip._tcp.example.com.');
				break;
		}
	}

	var div = root_7();
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var div_3 = $.child(div_2);
	var details = $.child(div_3);
	var summary = $.child(details);
	var node = $.child(summary);

	Icon(node, { name: 'lightbulb', size: 'sm' });

	var span = $.sibling(node, 2);
	var node_1 = $.child(span);

	Icon(node_1, { name: 'chevron-down', size: 'sm' });
	$.reset(span);
	$.reset(summary);

	var div_4 = $.sibling(summary, 2);
	var button = $.child(div_4);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);

	$.reset(div_4);
	$.reset(details);
	$.reset(div_3);

	var div_5 = $.sibling(div_3, 2);
	var div_6 = $.child(div_5);
	var div_7 = $.child(div_6);
	var label = $.child(div_7);

	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'The domain name for this NAPTR record');

	var input = $.sibling(label, 2);

	$.remove_input_defaults(input);
	$.next(2);
	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var div_9 = $.child(div_8);
	var label_1 = $.child(div_9);

	$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Processing order - lower values are processed first (0-65535)');

	var input_1 = $.sibling(label_1, 2);

	$.remove_input_defaults(input_1);
	$.next(2);
	$.reset(div_9);

	var div_10 = $.sibling(div_9, 2);
	var label_2 = $.child(div_10);

	$.action(label_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Preference within the same order value (0-65535)');

	var input_2 = $.sibling(label_2, 2);

	$.remove_input_defaults(input_2);
	$.next(2);
	$.reset(div_10);
	$.reset(div_8);

	var div_11 = $.sibling(div_8, 2);
	var label_3 = $.child(div_11);

	$.action(label_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Control processing behavior - affects how the result is interpreted');

	var select = $.sibling(label_3, 2);

	$.each(select, 21, () => flagOptions, (option) => option.value, ($$anchor, option) => {
		var option_1 = root();
		var text = $.only_child(option_1, true);
		var option_1_value = {};

		$.template_effect(() => {
			$.set_text(text, $.get(option).label);

			if (option_1_value !== (option_1_value = $.get(option).value)) {
				option_1.value = (option_1.__value = option_1_value) ?? '';
			}
		});

		$.append($$anchor, option_1);
	});

	$.reset(select);
	$.init_select(select);

	var p = $.sibling(select, 2);
	var text_1 = $.only_child(p, true);

	$.reset(div_11);

	var div_12 = $.sibling(div_11, 2);
	var label_4 = $.child(div_12);

	$.action(label_4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Service identifier or protocol (e.g., E2U+sip for SIP services)');

	var input_3 = $.sibling(label_4, 2);

	$.remove_input_defaults(input_3);

	var details_1 = $.sibling(input_3, 2);
	var div_13 = $.sibling($.child(details_1), 2);

	$.each(div_13, 21, () => serviceExamples, (example) => example.value, ($$anchor, example) => {
		var button_4 = root_1();
		var strong = $.child(button_4);
		var text_2 = $.only_child(strong, true);
		var text_3 = $.sibling(strong);

		$.reset(button_4);

		$.template_effect(() => {
			$.set_text(text_2, $.get(example).value);
			$.set_text(text_3, ` - ${$.get(example).description ?? ''}`);
		});

		$.delegated('click', button_4, () => $.set(service, $.get(example).value, true));
		$.append($$anchor, button_4);
	});

	$.reset(div_13);
	$.reset(details_1);
	$.reset(div_12);

	var div_14 = $.sibling(div_12, 2);
	var label_5 = $.child(div_14);

	$.action(label_5, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Regular expression for pattern matching and substitution (format: !pattern!replacement!)');

	var input_4 = $.sibling(label_5, 2);

	$.remove_input_defaults(input_4);
	$.next(2);
	$.reset(div_14);

	var div_15 = $.sibling(div_14, 2);
	var label_6 = $.child(div_15);

	$.action(label_6, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => "Next domain to query, or '.' for terminal rules");

	var input_5 = $.sibling(label_6, 2);

	$.remove_input_defaults(input_5);
	$.next(2);
	$.reset(div_15);
	$.reset(div_6);

	var div_16 = $.sibling(div_6, 2);
	var div_17 = $.child(div_16);
	var div_18 = $.sibling($.child(div_17), 2);
	var node_2 = $.child(div_18);

	{
		var consequent = ($$anchor) => {
			var code = root_2();
			var text_4 = $.only_child(code, true);

			$.template_effect(() => $.set_text(text_4, $.get(naptrRecord)));
			$.append($$anchor, code);
		};

		var alternate = ($$anchor) => {
			var p_1 = root_3();

			$.append($$anchor, p_1);
		};

		$.if(node_2, ($$render) => {
			if ($.get(isValid)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div_18);
	$.reset(div_17);

	var node_3 = $.sibling(div_17, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_19 = root_5();
			var node_4 = $.child(div_19);

			Icon(node_4, { name: 'alert-triangle', size: 'sm' });

			var div_20 = $.sibling(node_4, 2);
			var ul = $.sibling($.child(div_20), 2);

			$.each(ul, 21, () => $.get(warnings), $.index, ($$anchor, warning) => {
				var li = root_4();
				var text_5 = $.only_child(li, true);

				$.template_effect(() => $.set_text(text_5, $.get(warning)));
				$.append($$anchor, li);
			});

			$.reset(ul);
			$.reset(div_20);
			$.reset(div_19);
			$.append($$anchor, div_19);
		};

		$.if(node_3, ($$render) => {
			if ($.get(warnings).length > 0) $$render(consequent_1);
		});
	}

	var node_5 = $.sibling(node_3, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_21 = root_6();
			var button_5 = $.child(div_21);
			let classes;
			var node_6 = $.child(button_5);

			{
				let $0 = $.derived(() => clipboard.isCopied('copy') ? 'check' : 'copy');

				Icon(node_6, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			var text_6 = $.sibling(node_6);

			$.reset(button_5);

			var button_6 = $.sibling(button_5, 2);
			let classes_1;
			var node_7 = $.child(button_6);

			{
				let $0 = $.derived(() => clipboard.isCopied('download') ? 'check' : 'download');

				Icon(node_7, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			var text_7 = $.sibling(node_7);

			$.reset(button_6);
			$.reset(div_21);

			$.template_effect(
				($0, $1, $2, $3) => {
					classes = $.set_class(button_5, 1, 'btn btn-primary svelte-dvsla4', null, classes, { success: $0 });
					$.set_text(text_6, ` ${$1 ?? ''}`);
					classes_1 = $.set_class(button_6, 1, 'btn btn-success svelte-dvsla4', null, classes_1, { success: $2 });
					$.set_text(text_7, ` ${$3 ?? ''}`);
				},
				[
					() => clipboard.isCopied('copy'),
					() => clipboard.isCopied('copy') ? 'Copied!' : 'Copy Record',
					() => clipboard.isCopied('download'),
					() => clipboard.isCopied('download') ? 'Downloaded!' : 'Download'
				]
			);

			$.delegated('click', button_5, copyToClipboard);
			$.delegated('click', button_6, downloadRecord);
			$.append($$anchor, div_21);
		};

		$.if(node_5, ($$render) => {
			if ($.get(isValid)) $$render(consequent_2);
		});
	}

	$.reset(div_16);
	$.reset(div_5);
	$.next(2);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(($0) => $.set_text(text_1, $0), [
		() => flagOptions.find((opt) => opt.value === $.get(flags))?.description || 'Select flag type'
	]);

	$.delegated('click', button, () => loadExample('sip'));
	$.delegated('click', button_1, () => loadExample('email'));
	$.delegated('click', button_2, () => loadExample('web'));
	$.delegated('click', button_3, () => loadExample('srv'));
	$.bind_property('open', 'toggle', details, ($$value) => $.set(showExamples, $$value), () => $.get(showExamples));
	$.bind_value(input, () => $.get(domain), ($$value) => $.set(domain, $$value));
	$.bind_value(input_1, () => $.get(order), ($$value) => $.set(order, $$value));
	$.bind_value(input_2, () => $.get(preference), ($$value) => $.set(preference, $$value));
	$.bind_select_value(select, () => $.get(flags), ($$value) => $.set(flags, $$value));
	$.bind_value(input_3, () => $.get(service), ($$value) => $.set(service, $$value));
	$.bind_value(input_4, () => $.get(regexp), ($$value) => $.set(regexp, $$value));
	$.bind_value(input_5, () => $.get(replacement), ($$value) => $.set(replacement, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);