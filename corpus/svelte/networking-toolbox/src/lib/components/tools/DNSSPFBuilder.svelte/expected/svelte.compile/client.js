import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';
import { tooltip } from '$lib/actions/tooltip';

var root = $.from_html(`<button type="button" class="remove-btn svelte-jtzall"><!></button>`);
var root_1 = $.from_html(`<input type="text" class="mechanism-input svelte-jtzall"/>`);
var root_2 = $.from_html(`<div><div class="mechanism-header svelte-jtzall"><label class="mechanism-toggle svelte-jtzall"><input type="checkbox" class="svelte-jtzall"/> <span class="mechanism-type svelte-jtzall"> </span> <span class="mechanism-description svelte-jtzall"> </span></label> <div class="mechanism-controls svelte-jtzall"><div class="qualifier-select svelte-jtzall"><select class="svelte-jtzall"><option>+ Pass</option><option>- Fail</option><option>~ SoftFail</option><option>? Neutral</option></select></div> <!></div></div> <!></div>`);
var root_3 = $.from_html(`<div><label class="modifier-toggle svelte-jtzall"><input type="checkbox" class="svelte-jtzall"/> <span class="modifier-type svelte-jtzall"> </span></label> <input type="text" class="modifier-input svelte-jtzall"/></div>`);
var root_4 = $.from_html(`<div class="message svelte-jtzall"> </div>`);
var root_5 = $.from_html(`<div class="validation-messages error svelte-jtzall"><!> <div class="messages svelte-jtzall"></div></div>`);
var root_6 = $.from_html(`<div class="validation-messages warning svelte-jtzall"><!> <div class="messages svelte-jtzall"></div></div>`);
var root_7 = $.from_html(`<div class="validation-messages success svelte-jtzall"><!> <div class="message svelte-jtzall">SPF policy is valid and ready to use!</div></div>`);
var root_8 = $.from_html(`<button type="button"><div class="example-header svelte-jtzall"><strong class="svelte-jtzall"> </strong></div> <p class="example-description svelte-jtzall"> </p> <div class="example-preview svelte-jtzall"> </div></button>`);
var root_9 = $.from_html(`<div class="card"><div class="card-header"><h1>SPF Policy Builder</h1> <p class="card-subtitle">Craft SPF (Sender Policy Framework) policies with mechanisms, qualifiers, and validation.</p></div> <div class="grid-layout"><div class="input-section"><div class="mechanisms-section svelte-jtzall"><div class="section-header svelte-jtzall"><h3 class="svelte-jtzall"><!> SPF Mechanisms</h3> <button type="button" class="add-btn svelte-jtzall"><!> Add Custom</button></div> <div class="mechanisms-list svelte-jtzall"></div></div> <div class="modifiers-section svelte-jtzall"><div class="section-header svelte-jtzall"><h3 class="svelte-jtzall"><!> SPF Modifiers</h3></div> <div class="modifiers-list svelte-jtzall"></div></div></div> <div class="results-section"><div class="spf-record-section svelte-jtzall"><div class="section-header svelte-jtzall"><h3 class="svelte-jtzall">Generated SPF Record</h3> <div class="actions svelte-jtzall"><button type="button"><!> </button> <button type="button"><!> </button></div></div> <div class="record-output svelte-jtzall"><div class="code-block svelte-jtzall"><code class="svelte-jtzall"> </code></div></div> <div class="zone-file-output svelte-jtzall"><h4 class="svelte-jtzall">Zone File Format:</h4> <div class="code-block svelte-jtzall"><code class="svelte-jtzall"> </code></div></div></div> <div class="validation-section svelte-jtzall"><div class="section-header svelte-jtzall"><h3 class="svelte-jtzall"><!> Policy Validation</h3></div> <div class="stats-grid svelte-jtzall"><div class="stat-item svelte-jtzall"><span class="stat-label svelte-jtzall">DNS Lookups:</span> <span> </span></div> <div class="stat-item svelte-jtzall"><span class="stat-label svelte-jtzall">Record Length:</span> <span> </span></div> <div class="stat-item svelte-jtzall"><span class="stat-label svelte-jtzall">Status:</span> <span> </span></div></div> <!> <!> <!></div></div></div> <div class="examples-section svelte-jtzall"><details class="examples-toggle svelte-jtzall"><summary class="svelte-jtzall"><!> Example Policies</summary> <div class="examples-grid svelte-jtzall"></div></details></div></div>`);

export default function DNSSPFBuilder($$anchor, $$props) {
	$.push($$props, true);

	let showExamples = $.state(false);
	let selectedExample = $.state(null);

	// Button success states
	let buttonStates = $.proxy({});

	let mechanisms = $.state($.proxy([
		{ type: 'ip4', qualifier: '+', value: '', enabled: false },
		{ type: 'ip6', qualifier: '+', value: '', enabled: false },
		{ type: 'a', qualifier: '+', value: '', enabled: false },
		{ type: 'mx', qualifier: '+', value: '', enabled: false },
		{ type: 'include', qualifier: '+', value: '', enabled: false },
		{ type: 'ptr', qualifier: '~', value: '', enabled: false },
		{ type: 'exists', qualifier: '+', value: '', enabled: false },
		{ type: 'all', qualifier: '~', value: '', enabled: true }
	]));

	let modifiers = $.proxy([
		{ type: 'redirect', value: '', enabled: false },
		{ type: 'exp', value: '', enabled: false }
	]);

	const _qualifierLabels = { '+': 'Pass', '-': 'Fail', '~': 'SoftFail', '?': 'Neutral' };

	const mechanismDescriptions = {
		all: 'Matches all IPs (should be last)',
		include: 'Include another domains SPF record',
		a: 'Match A/AAAA records of domain',
		mx: 'Match MX records of domain',
		ptr: 'Match PTR records (discouraged)',
		ip4: 'Match specific IPv4 address/range',
		ip6: 'Match specific IPv6 address/range',
		exists: 'Check if domain exists'
	};

	const spfRecord = $.derived(() => {
		const enabledMechanisms = $.get(mechanisms).filter((m) => m.enabled);
		const enabledModifiers = modifiers.filter((m) => m.enabled);
		let record = 'v=spf1';

		// Add mechanisms
		for (const mech of enabledMechanisms) {
			let mechString = '';

			if (mech.type === 'all') {
				mechString = `${mech.qualifier}all`;
			} else if (mech.type === 'a' || mech.type === 'mx' || mech.type === 'ptr') {
				mechString = `${mech.qualifier}${mech.type}`;

				if (mech.value.trim()) {
					mechString += `:${mech.value.trim()}`;
				}
			} else {
				if (mech.value.trim()) {
					mechString = `${mech.qualifier}${mech.type}:${mech.value.trim()}`;
				}
			}

			if (mechString) {
				record += ` ${mechString}`;
			}
		}

		// Add modifiers
		for (const mod of enabledModifiers) {
			if (mod.value.trim()) {
				record += ` ${mod.type}=${mod.value.trim()}`;
			}
		}

		return record;
	});

	const validation = $.derived(() => {
		const enabledMechanisms = $.get(mechanisms).filter((m) => m.enabled);
		const _enabledModifiers = modifiers.filter((m) => m.enabled);
		const messages = [];
		const warnings = [];
		let dnsLookups = 0;

		// Check for required elements
		if (enabledMechanisms.length === 0) {
			messages.push('At least one mechanism must be enabled');
		}

		// Count DNS lookups
		for (const mech of enabledMechanisms) {
			if (['include', 'a', 'mx', 'exists'].includes(mech.type)) {
				dnsLookups++;
			}

			if (mech.type === 'ptr') {
				dnsLookups += 2; // PTR requires reverse and forward lookup
			}
		}

		// Check DNS lookup limit
		if (dnsLookups > 10) {
			messages.push(`Too many DNS lookups (${dnsLookups}). SPF limit is 10.`);
		} else if (dnsLookups > 8) {
			warnings.push(`High DNS lookup count (${dnsLookups}). Consider consolidating.`);
		}

		// Validate mechanism values
		for (const mech of enabledMechanisms) {
			if ((mech.type === 'include' || mech.type === 'exists') && !mech.value.trim()) {
				messages.push(`${mech.type} mechanism requires a domain value`);
			}

			if ((mech.type === 'ip4' || mech.type === 'ip6') && !mech.value.trim()) {
				messages.push(`${mech.type} mechanism requires an IP address`);
			}

			// Basic IP validation
			if (mech.type === 'ip4' && mech.value.trim()) {
				const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;

				if (!ipv4Regex.test(mech.value.trim())) {
					messages.push(`Invalid IPv4 address/range: ${mech.value}`);
				}
			}

			if (mech.type === 'ip6' && mech.value.trim()) {
				// Basic IPv6 validation (simplified)
				if (!mech.value.includes(':')) {
					messages.push(`Invalid IPv6 address: ${mech.value}`);
				}
			}
		}

		// Check for 'all' mechanism position
		const allIndex = enabledMechanisms.findIndex((m) => m.type === 'all');

		if (allIndex >= 0 && allIndex < enabledMechanisms.length - 1) {
			warnings.push("'all' mechanism should typically be last");
		}

		// Check for PTR usage
		if (enabledMechanisms.some((m) => m.type === 'ptr')) {
			warnings.push('PTR mechanism is discouraged (slow and unreliable)');
		}

		// Check record length
		const recordLength = $.get(spfRecord).length;

		if (recordLength > 255) {
			messages.push(`SPF record too long (${recordLength} chars). DNS TXT limit is 255.`);
		} else if (recordLength > 200) {
			warnings.push(`SPF record is long (${recordLength} chars). Consider shortening.`);
		}

		// Check for conflicting modifiers
		const redirectEnabled = modifiers.find((m) => m.type === 'redirect' && m.enabled);

		if (redirectEnabled && enabledMechanisms.length > 0) {
			warnings.push('redirect modifier should not be used with mechanisms');
		}

		return {
			isValid: messages.length === 0,
			messages,
			warnings,
			dnsLookups,
			recordLength
		};
	});

	function addCustomMechanism() {
		$.get(mechanisms).unshift({ type: 'include', qualifier: '+', value: '', enabled: true });
		$.set(mechanisms, $.get(mechanisms), true);
	}

	function removeMechanism(index) {
		$.get(mechanisms).splice(index, 1);
		$.set(mechanisms, $.get(mechanisms), true);
	}

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

	function exportAsZoneFile() {
		const zoneContent = `example.com. IN TXT "${$.get(spfRecord)}"`;
		const blob = new Blob([zoneContent], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		a.href = url;
		a.download = 'spf-record.zone';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		showButtonSuccess('export-spf');
	}

	function loadExample(example) {
		$.set(mechanisms, $.get(mechanisms).map((m) => ({ ...m, enabled: false })), true);

		for (const exampleMech of example.mechanisms) {
			const existing = $.get(mechanisms).find((m) => m.type === exampleMech.type && !m.enabled);

			if (existing) {
				existing.enabled = exampleMech.enabled;
				existing.qualifier = exampleMech.qualifier;
				existing.value = exampleMech.value;
			}
		}

		$.set(mechanisms, $.get(mechanisms), true);
		$.set(selectedExample, example.name, true);
	}

	const examplePolicies = [
		{
			name: 'Basic Email Provider',
			description: 'Simple SPF policy for Google Workspace',
			mechanisms: [
				{
					type: 'include',
					qualifier: '+',
					value: '_spf.google.com',
					enabled: true
				},
				{ type: 'all', qualifier: '~', value: '', enabled: true }
			]
		},

		{
			name: 'Multiple Providers',
			description: 'SPF policy for multiple email services',
			mechanisms: [
				{
					type: 'include',
					qualifier: '+',
					value: '_spf.google.com',
					enabled: true
				},

				{
					type: 'include',
					qualifier: '+',
					value: 'mailgun.org',
					enabled: true
				},

				{
					type: 'include',
					qualifier: '+',
					value: 'servers.mcsv.net',
					enabled: true
				},
				{ type: 'all', qualifier: '~', value: '', enabled: true }
			]
		},

		{
			name: 'Server + Provider',
			description: 'Dedicated server with email provider fallback',
			mechanisms: [
				{
					type: 'ip4',
					qualifier: '+',
					value: '203.0.113.1',
					enabled: true
				},
				{ type: 'mx', qualifier: '+', value: '', enabled: true },
				{
					type: 'include',
					qualifier: '+',
					value: '_spf.google.com',
					enabled: true
				},
				{ type: 'all', qualifier: '-', value: '', enabled: true }
			]
		},

		{
			name: 'Strict Policy',
			description: 'Restrictive SPF policy with hard fail',
			mechanisms: [
				{
					type: 'ip4',
					qualifier: '+',
					value: '203.0.113.0/24',
					enabled: true
				},

				{
					type: 'include',
					qualifier: '+',
					value: '_spf.google.com',
					enabled: true
				},
				{ type: 'all', qualifier: '-', value: '', enabled: true }
			]
		}
	];

	var div = root_9();
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var div_4 = $.child(div_3);
	var h3 = $.child(div_4);
	var node = $.child(h3);

	Icon(node, { name: 'settings', size: 'sm' });
	$.next();
	$.reset(h3);
	$.action(h3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Configure SPF mechanisms that define which servers can send email');

	var button = $.sibling(h3, 2);
	var node_1 = $.child(button);

	Icon(node_1, { name: 'plus', size: 'sm' });
	$.next();
	$.reset(button);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);

	$.each(div_5, 21, () => $.get(mechanisms), $.index, ($$anchor, mechanism, index) => {
		var div_6 = root_2();
		let classes;
		var div_7 = $.child(div_6);
		var label = $.child(div_7);
		var input = $.child(label);

		$.remove_input_defaults(input);

		var span = $.sibling(input, 2);
		var text_1 = $.only_child(span, true);
		var span_1 = $.sibling(span, 2);
		var text_2 = $.only_child(span_1, true);

		$.action(span_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => mechanismDescriptions[$.get(mechanism).type]);
		$.reset(label);

		var div_8 = $.sibling(label, 2);
		var div_9 = $.child(div_8);
		var select = $.child(div_9);
		var option = $.child(select);

		option.value = option.__value = '+';

		var option_1 = $.sibling(option);

		option_1.value = option_1.__value = '-';

		var option_2 = $.sibling(option_1);

		option_2.value = option_2.__value = '~';

		var option_3 = $.sibling(option_2);

		option_3.value = option_3.__value = '?';
		$.reset(select);
		$.init_select(select);
		$.reset(div_9);

		var node_2 = $.sibling(div_9, 2);

		{
			var consequent = ($$anchor) => {
				var button_1 = root();
				var node_3 = $.child(button_1);

				Icon(node_3, { name: 'x', size: 'sm' });
				$.reset(button_1);
				$.action(button_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Remove this mechanism');
				$.delegated('click', button_1, () => removeMechanism(index));
				$.append($$anchor, button_1);
			};

			var d = $.derived(() => !['all', 'a', 'mx', 'ptr', 'ip4', 'ip6', 'include', 'exists'].includes($.get(mechanism).type) || index < 3);

			$.if(node_2, ($$render) => {
				if ($.get(d)) $$render(consequent);
			});
		}

		$.reset(div_8);
		$.reset(div_7);

		var node_4 = $.sibling(div_7, 2);

		{
			var consequent_1 = ($$anchor) => {
				var input_1 = root_1();

				$.remove_input_defaults(input_1);

				$.template_effect(() => {
					input_1.disabled = !$.get(mechanism).enabled;

					$.set_attribute(input_1, 'placeholder', $.get(mechanism).type === 'ip4'
						? '203.0.113.1 or 203.0.113.0/24'
						: $.get(mechanism).type === 'ip6'
							? '2001:db8::1 or 2001:db8::/32'
							: $.get(mechanism).type === 'include'
								? '_spf.google.com'
								: $.get(mechanism).type === 'exists' ? 'check.example.com' : 'domain.com (optional)');
				});

				$.bind_value(input_1, () => $.get(mechanism).value, ($$value) => ($.get(mechanism).value = $$value));
				$.append($$anchor, input_1);
			};

			var d_1 = $.derived(() => !['all'].includes($.get(mechanism).type));

			$.if(node_4, ($$render) => {
				if ($.get(d_1)) $$render(consequent_1);
			});
		}

		$.reset(div_6);

		$.template_effect(
			($0) => {
				classes = $.set_class(div_6, 1, 'mechanism-item svelte-jtzall', null, classes, { enabled: $.get(mechanism).enabled });
				$.set_text(text_1, $0);
				$.set_text(text_2, mechanismDescriptions[$.get(mechanism).type]);
				select.disabled = !$.get(mechanism).enabled;
			},
			[() => $.get(mechanism).type.toUpperCase()]
		);

		$.bind_checked(input, () => $.get(mechanism).enabled, ($$value) => ($.get(mechanism).enabled = $$value));
		$.bind_select_value(select, () => $.get(mechanism).qualifier, ($$value) => ($.get(mechanism).qualifier = $$value));
		$.append($$anchor, div_6);
	});

	$.reset(div_5);
	$.reset(div_3);

	var div_10 = $.sibling(div_3, 2);
	var div_11 = $.child(div_10);
	var h3_1 = $.child(div_11);
	var node_5 = $.child(h3_1);

	Icon(node_5, { name: 'wrench', size: 'sm' });
	$.next();
	$.reset(h3_1);
	$.action(h3_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Optional SPF modifiers for advanced configuration');
	$.reset(div_11);

	var div_12 = $.sibling(div_11, 2);

	$.each(div_12, 21, () => modifiers, (modifier) => modifier.type, ($$anchor, modifier, $$index_1) => {
		var div_13 = root_3();
		let classes_1;
		var label_1 = $.child(div_13);
		var input_2 = $.child(label_1);

		$.remove_input_defaults(input_2);

		var span_2 = $.sibling(input_2, 2);
		var text_3 = $.only_child(span_2);

		$.reset(label_1);

		var input_3 = $.sibling(label_1, 2);

		$.remove_input_defaults(input_3);
		$.reset(div_13);

		$.template_effect(() => {
			classes_1 = $.set_class(div_13, 1, 'modifier-item svelte-jtzall', null, classes_1, { enabled: $.get(modifier).enabled });
			$.set_text(text_3, `${$.get(modifier).type ?? ''}=`);
			input_3.disabled = !$.get(modifier).enabled;
			$.set_attribute(input_3, 'placeholder', $.get(modifier).type === 'redirect' ? 'fallback.example.com' : 'explain.example.com');
		});

		$.bind_checked(input_2, () => $.get(modifier).enabled, ($$value) => ($.get(modifier).enabled = $$value));
		$.bind_value(input_3, () => $.get(modifier).value, ($$value) => ($.get(modifier).value = $$value));
		$.append($$anchor, div_13);
	});

	$.reset(div_12);
	$.reset(div_10);
	$.reset(div_2);

	var div_14 = $.sibling(div_2, 2);
	var div_15 = $.child(div_14);
	var div_16 = $.child(div_15);
	var div_17 = $.sibling($.child(div_16), 2);
	var button_2 = $.child(div_17);
	let classes_2;
	var node_6 = $.child(button_2);

	{
		let $0 = $.derived(() => buttonStates['copy-spf'] ? 'check' : 'copy');

		Icon(node_6, {
			get name() {
				return $.get($0);
			},
			size: 'sm'
		});
	}

	var text_4 = $.sibling(node_6);

	$.reset(button_2);
	$.action(button_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Copy SPF record to clipboard');

	var button_3 = $.sibling(button_2, 2);
	let classes_3;
	var node_7 = $.child(button_3);

	{
		let $0 = $.derived(() => buttonStates['export-spf'] ? 'check' : 'download');

		Icon(node_7, {
			get name() {
				return $.get($0);
			},
			size: 'sm'
		});
	}

	var text_5 = $.sibling(node_7);

	$.reset(button_3);
	$.action(button_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Download as zone file');
	$.reset(div_17);
	$.reset(div_16);

	var div_18 = $.sibling(div_16, 2);
	var div_19 = $.child(div_18);
	var code = $.child(div_19);
	var text_6 = $.only_child(code, true);

	$.reset(div_19);
	$.reset(div_18);

	var div_20 = $.sibling(div_18, 2);
	var div_21 = $.sibling($.child(div_20), 2);
	var code_1 = $.child(div_21);
	var text_7 = $.only_child(code_1);

	$.reset(div_21);
	$.reset(div_20);
	$.reset(div_15);

	var div_22 = $.sibling(div_15, 2);
	var div_23 = $.child(div_22);
	var h3_2 = $.child(div_23);
	var node_8 = $.child(h3_2);

	Icon(node_8, { name: 'certified', size: 'sm' });
	$.next();
	$.reset(h3_2);
	$.reset(div_23);

	var div_24 = $.sibling(div_23, 2);
	var div_25 = $.child(div_24);
	var span_3 = $.sibling($.child(div_25), 2);
	let classes_4;
	var text_8 = $.only_child(span_3);

	$.reset(div_25);

	var div_26 = $.sibling(div_25, 2);
	var span_4 = $.sibling($.child(div_26), 2);
	let classes_5;
	var text_9 = $.only_child(span_4);

	$.reset(div_26);

	var div_27 = $.sibling(div_26, 2);
	var span_5 = $.sibling($.child(div_27), 2);
	let classes_6;
	var text_10 = $.only_child(span_5, true);

	$.reset(div_27);
	$.reset(div_24);

	var node_9 = $.sibling(div_24, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_28 = root_5();
			var node_10 = $.child(div_28);

			Icon(node_10, { name: 'x-circle', size: 'sm' });

			var div_29 = $.sibling(node_10, 2);

			$.each(div_29, 21, () => $.get(validation).messages, $.index, ($$anchor, message) => {
				var div_30 = root_4();
				var text_11 = $.only_child(div_30, true);

				$.template_effect(() => $.set_text(text_11, $.get(message)));
				$.append($$anchor, div_30);
			});

			$.reset(div_29);
			$.reset(div_28);
			$.append($$anchor, div_28);
		};

		$.if(node_9, ($$render) => {
			if ($.get(validation).messages.length > 0) $$render(consequent_2);
		});
	}

	var node_11 = $.sibling(node_9, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_31 = root_6();
			var node_12 = $.child(div_31);

			Icon(node_12, { name: 'alert-triangle', size: 'sm' });

			var div_32 = $.sibling(node_12, 2);

			$.each(div_32, 21, () => $.get(validation).warnings, $.index, ($$anchor, warning) => {
				var div_33 = root_4();
				var text_12 = $.only_child(div_33, true);

				$.template_effect(() => $.set_text(text_12, $.get(warning)));
				$.append($$anchor, div_33);
			});

			$.reset(div_32);
			$.reset(div_31);
			$.append($$anchor, div_31);
		};

		$.if(node_11, ($$render) => {
			if ($.get(validation).warnings.length > 0) $$render(consequent_3);
		});
	}

	var node_13 = $.sibling(node_11, 2);

	{
		var consequent_4 = ($$anchor) => {
			var div_34 = root_7();
			var node_14 = $.child(div_34);

			Icon(node_14, { name: 'check-circle', size: 'sm' });
			$.next(2);
			$.reset(div_34);
			$.append($$anchor, div_34);
		};

		$.if(node_13, ($$render) => {
			if ($.get(validation).isValid && $.get(validation).messages.length === 0 && $.get(validation).warnings.length === 0) $$render(consequent_4);
		});
	}

	$.reset(div_22);
	$.reset(div_14);
	$.reset(div_1);

	var div_35 = $.sibling(div_1, 2);
	var details = $.child(div_35);
	var summary = $.child(details);
	var node_15 = $.child(summary);

	Icon(node_15, { name: 'lightbulb', size: 'sm' });
	$.next();
	$.reset(summary);

	var div_36 = $.sibling(summary, 2);

	$.each(div_36, 21, () => examplePolicies, (example) => example.name, ($$anchor, example) => {
		var button_4 = root_8();
		let classes_7;
		var div_37 = $.child(button_4);
		var strong = $.child(div_37);
		var text_13 = $.only_child(strong, true);

		$.reset(div_37);

		var p = $.sibling(div_37, 2);
		var text_14 = $.only_child(p, true);
		var div_38 = $.sibling(p, 2);
		var text_15 = $.only_child(div_38, true);

		$.reset(button_4);

		$.template_effect(
			($0) => {
				classes_7 = $.set_class(button_4, 1, 'example-card svelte-jtzall', null, classes_7, { selected: $.get(selectedExample) === $.get(example).name });
				$.set_text(text_13, $.get(example).name);
				$.set_text(text_14, $.get(example).description);
				$.set_text(text_15, $0);
			},
			[
				() => $.get(example).mechanisms.map((m) => `${m.qualifier}${m.type}${m.value ? `:${m.value}` : ''}`).join(' ')
			]
		);

		$.delegated('click', button_4, () => loadExample($.get(example)));
		$.append($$anchor, button_4);
	});

	$.reset(div_36);
	$.reset(details);
	$.reset(div_35);
	$.reset(div);

	$.template_effect(() => {
		classes_2 = $.set_class(button_2, 1, 'copy-btn svelte-jtzall', null, classes_2, { success: buttonStates['copy-spf'] });
		$.set_text(text_4, ` ${buttonStates['copy-spf'] ? 'Copied!' : 'Copy'}`);
		classes_3 = $.set_class(button_3, 1, 'export-btn svelte-jtzall', null, classes_3, { success: buttonStates['export-spf'] });
		$.set_text(text_5, ` ${buttonStates['export-spf'] ? 'Downloaded!' : 'Export'}`);
		$.set_text(text_6, $.get(spfRecord));
		$.set_text(text_7, `example.com. IN TXT "${$.get(spfRecord) ?? ''}"`);

		classes_4 = $.set_class(span_3, 1, 'stat-value svelte-jtzall', null, classes_4, {
			warning: $.get(validation).dnsLookups > 8,
			error: $.get(validation).dnsLookups > 10
		});

		$.set_text(text_8, `${$.get(validation).dnsLookups ?? ''}/10`);

		classes_5 = $.set_class(span_4, 1, 'stat-value svelte-jtzall', null, classes_5, {
			warning: $.get(validation).recordLength > 200,
			error: $.get(validation).recordLength > 255
		});

		$.set_text(text_9, `${$.get(validation).recordLength ?? ''}/255 chars`);

		classes_6 = $.set_class(span_5, 1, 'stat-value svelte-jtzall', null, classes_6, {
			success: $.get(validation).isValid,
			error: !$.get(validation).isValid
		});

		$.set_text(text_10, $.get(validation).isValid ? 'Valid' : 'Invalid');
	});

	$.delegated('click', button, addCustomMechanism);
	$.delegated('click', button_2, () => copyToClipboard($.get(spfRecord), 'copy-spf'));
	$.delegated('click', button_3, exportAsZoneFile);
	$.bind_property('open', 'toggle', details, ($$value) => $.set(showExamples, $$value), () => $.get(showExamples));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);