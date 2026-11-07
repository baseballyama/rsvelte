import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';
import { tooltip } from '$lib/actions/tooltip';
import { SvelteSet } from 'svelte/reactivity';

var root = $.from_html(`<button type="button" class="ca-btn svelte-1dy6vo6"> </button>`);
var root_1 = $.from_html(`<div class="ca-shortcuts svelte-1dy6vo6"><span class="shortcuts-label svelte-1dy6vo6">Common CAs:</span> <div class="ca-buttons svelte-1dy6vo6"><!> <button type="button" class="ca-btn deny-all svelte-1dy6vo6">Deny All</button></div></div>`);
var root_2 = $.from_html(`<div><div class="record-header svelte-1dy6vo6"><label class="record-toggle svelte-1dy6vo6"><input type="checkbox" class="svelte-1dy6vo6"/> <span class="record-tag svelte-1dy6vo6"> </span> <span class="record-description svelte-1dy6vo6"> </span></label> <div class="record-controls svelte-1dy6vo6"><div class="flag-select svelte-1dy6vo6"><select class="svelte-1dy6vo6"><option>Flag 0 (Non-critical)</option><option>Flag 128 (Critical)</option></select></div> <button type="button" class="remove-btn svelte-1dy6vo6"><!></button></div></div> <div class="record-value-section svelte-1dy6vo6"><input type="text" class="record-input svelte-1dy6vo6"/> <!></div></div>`);
var root_3 = $.from_html(`<div class="code-block svelte-1dy6vo6"><code class="svelte-1dy6vo6"> </code></div>`);
var root_4 = $.from_html(`<div class="records-output"></div>`);
var root_5 = $.from_html(`<div class="no-records svelte-1dy6vo6"><!> <span>Enable and configure CAA records to see output</span></div>`);
var root_6 = $.from_html(`<div class="message svelte-1dy6vo6"> </div>`);
var root_7 = $.from_html(`<div class="validation-messages error svelte-1dy6vo6"><!> <div class="messages svelte-1dy6vo6"></div></div>`);
var root_8 = $.from_html(`<div class="validation-messages warning svelte-1dy6vo6"><!> <div class="messages svelte-1dy6vo6"></div></div>`);
var root_9 = $.from_html(`<div class="validation-messages success svelte-1dy6vo6"><!> <div class="message svelte-1dy6vo6">CAA configuration is valid and ready to deploy!</div></div>`);
var root_10 = $.from_html(`<li class="svelte-1dy6vo6"> </li>`);
var root_11 = $.from_html(`<div class="example-record svelte-1dy6vo6"><code class="svelte-1dy6vo6"> </code></div>`);
var root_12 = $.from_html(`<button type="button"><div class="example-header svelte-1dy6vo6"><strong class="svelte-1dy6vo6"> </strong></div> <p class="example-description svelte-1dy6vo6"> </p> <div class="example-records svelte-1dy6vo6"></div></button>`);

var root_13 = $.from_html(`<div class="card"><div class="card-header"><h1>CAA Record Builder</h1> <p class="card-subtitle">Build CAA (Certificate Authority Authorization) records to control which CAs can issue certificates for your
      domain.</p></div> <div class="grid-layout"><div class="input-section"><div class="domain-section svelte-1dy6vo6"><div class="section-header svelte-1dy6vo6"><h3 class="svelte-1dy6vo6"><!> Domain Configuration</h3></div> <div class="input-group svelte-1dy6vo6"><label for="domain" class="svelte-1dy6vo6">Domain:</label> <input id="domain" type="text" placeholder="example.com" class="svelte-1dy6vo6"/></div></div> <div class="records-section svelte-1dy6vo6"><div class="section-header svelte-1dy6vo6"><h3 class="svelte-1dy6vo6"><!> CAA Records</h3> <div class="add-buttons svelte-1dy6vo6"><button type="button" class="add-btn svelte-1dy6vo6"><!> Issue</button> <button type="button" class="add-btn svelte-1dy6vo6"><!> Wildcard</button> <button type="button" class="add-btn svelte-1dy6vo6"><!> Contact</button></div></div> <div class="records-list svelte-1dy6vo6"></div></div></div> <div class="results-section"><div class="records-output-section"><div class="section-header svelte-1dy6vo6"><h3 class="svelte-1dy6vo6">Generated CAA Records</h3> <div class="actions svelte-1dy6vo6"><button type="button"><!> </button> <button type="button"><!> </button></div></div> <!></div> <div class="validation-section"><div class="section-header svelte-1dy6vo6"><h3 class="svelte-1dy6vo6"><!> Policy Validation</h3></div> <div class="validation-stats svelte-1dy6vo6"><div class="stat-item svelte-1dy6vo6"><span class="stat-label svelte-1dy6vo6">Active Records:</span> <span class="stat-value svelte-1dy6vo6"> </span></div> <div class="stat-item svelte-1dy6vo6"><span class="stat-label svelte-1dy6vo6">Status:</span> <span> </span></div></div> <!> <!> <!></div> <div class="security-guide"><div class="section-header svelte-1dy6vo6"><h3 class="svelte-1dy6vo6"><!> Security Tips</h3></div> <div class="security-tips svelte-1dy6vo6"><ul class="svelte-1dy6vo6"></ul></div></div></div></div> <div class="examples-section svelte-1dy6vo6"><details class="examples-toggle svelte-1dy6vo6"><summary class="svelte-1dy6vo6"><!> Example Configurations</summary> <div class="examples-grid svelte-1dy6vo6"></div></details></div></div>`);

export default function CAABuilder($$anchor, $$props) {
	$.push($$props, true);

	let domain = $.state('example.com');

	let records = $.state($.proxy([
		{ flag: 0, tag: 'issue', value: '', enabled: false },
		{ flag: 0, tag: 'issuewild', value: '', enabled: false },
		{ flag: 0, tag: 'iodef', value: '', enabled: false }
	]));

	let showExamples = $.state(false);
	let selectedExample = $.state(null);

	// Button success states
	let buttonStates = $.proxy({});

	const commonCAs = [
		{ name: "Let's Encrypt", value: 'letsencrypt.org' },
		{ name: 'DigiCert', value: 'digicert.com' },
		{ name: 'Sectigo', value: 'sectigo.com' },
		{ name: 'GlobalSign', value: 'globalsign.com' },
		{ name: 'GoDaddy', value: 'godaddy.com' },
		{ name: 'Amazon (ACM)', value: 'amazon.com' },
		{ name: 'Google Trust Services', value: 'pki.goog' },
		{ name: 'Cloudflare', value: 'comodoca.com' }
	];

	const tagDescriptions = {
		issue: 'Authorize certificate issuance for this domain',
		issuewild: 'Authorize wildcard certificate issuance for this domain',
		iodef: 'Contact information for certificate abuse reports'
	};

	const _flagDescriptions = {
		0: 'Non-critical flag - unknown tags can be ignored',
		128: 'Critical flag - unknown tags must cause rejection'
	};

	const caaRecords = $.derived(() => {
		return $.get(records).filter((record) => record.enabled && record.value.trim()).map((record) => {
			let value = record.value.trim();

			// Format iodef values properly
			if (record.tag === 'iodef') {
				if (value.includes('@') && !value.startsWith('mailto:')) {
					value = `mailto:${value}`;
				} else if (value.startsWith('http') && !value.startsWith('http://') && !value.startsWith('https://')) {
					value = `https://${value}`;
				}
			}

			return `${$.get(domain)}. IN CAA ${record.flag} ${record.tag} "${value}"`;
		});
	});

	const validation = $.derived(() => {
		const warnings = [];
		const errors = [];
		const enabledRecords = $.get(records).filter((r) => r.enabled);

		// Check domain format
		if (!$.get(domain).trim()) {
			errors.push('Domain is required');
		} else if (!$.get(domain).includes('.')) {
			warnings.push('Domain should include TLD (e.g., .com, .org)');
		}

		// Check if any records are enabled
		if (enabledRecords.length === 0) {
			warnings.push('No CAA records enabled - this will not provide any protection');
		}

		// Check for issue records
		const issueRecords = enabledRecords.filter((r) => r.tag === 'issue');

		const issuewildRecords = enabledRecords.filter((r) => r.tag === 'issuewild');

		if (issueRecords.length === 0 && issuewildRecords.length === 0) {
			warnings.push('No issue or issuewild records - certificates can be issued by any CA');
		}

		// Check for wildcard without base issue
		if (issuewildRecords.length > 0 && issueRecords.length === 0) {
			warnings.push('Wildcard authorization without base domain authorization may cause issues');
		}

		// Check for deny-all configuration
		const hasIssueNone = issueRecords.some((r) => r.value.trim() === ';');

		const hasIssuewildNone = issuewildRecords.some((r) => r.value.trim() === ';');

		if (hasIssueNone && hasIssuewildNone) {
			warnings.push('Both issue and issuewild set to ";" - this will block ALL certificate issuance');
		}

		// Validate iodef records
		const iodefRecords = enabledRecords.filter((r) => r.tag === 'iodef');

		for (const record of iodefRecords) {
			const value = record.value.trim();

			if (value) {
				if (value.includes('@')) {
					// Email format
					if (!value.includes('@') || !value.startsWith('mailto:') && value.indexOf('@') === -1) {
						errors.push('Invalid iodef email format - use "mailto:user@domain.com" or "user@domain.com"');
					}
				} else if (!value.startsWith('http://') && !value.startsWith('https://')) {
					warnings.push('iodef URL should start with http:// or https://');
				}
			}
		}

		// Check for conflicting records
		const duplicateValues = new SvelteSet();

		const seen = new SvelteSet();

		for (const record of enabledRecords) {
			const key = `${record.tag}:${record.value.trim()}`;

			if (seen.has(key)) {
				duplicateValues.add(record.value.trim());
			}

			seen.add(key);
		}

		if (duplicateValues.size > 0) {
			warnings.push(`Duplicate CAA records found: ${Array.from(duplicateValues).join(', ')}`);
		}

		return {
			isValid: errors.length === 0,
			errors,
			warnings,
			recordCount: enabledRecords.length
		};
	});

	function addRecord(tag) {
		$.get(records).push({ flag: 0, tag, value: '', enabled: true });
		$.set(records, $.get(records), true);
	}

	function removeRecord(index) {
		$.get(records).splice(index, 1);
		$.set(records, $.get(records), true);
	}

	function addCA(recordIndex, ca) {
		$.get(records)[recordIndex].value = ca;
		$.get(records)[recordIndex].enabled = true;
		$.set(records, $.get(records), true);
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
		const zoneContent = $.get(caaRecords).join('\n');
		const blob = new Blob([zoneContent], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		a.href = url;
		a.download = `${$.get(domain)}-caa-records.zone`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		showButtonSuccess('export-caa');
	}

	const exampleConfigurations = [
		{
			name: "Let's Encrypt Only",
			description: "Allow only Let's Encrypt certificates",
			domain: 'example.com',
			records: [
				{
					flag: 0,
					tag: 'issue',
					value: 'letsencrypt.org',
					enabled: true
				},

				{
					flag: 0,
					tag: 'iodef',
					value: 'security@example.com',
					enabled: true
				}
			]
		},

		{
			name: 'Multiple CAs',
			description: 'Allow certificates from multiple providers',
			domain: 'mycompany.com',
			records: [
				{
					flag: 0,
					tag: 'issue',
					value: 'letsencrypt.org',
					enabled: true
				},
				{ flag: 0, tag: 'issue', value: 'digicert.com', enabled: true },
				{
					flag: 0,
					tag: 'issuewild',
					value: 'letsencrypt.org',
					enabled: true
				},

				{
					flag: 0,
					tag: 'iodef',
					value: 'certificates@mycompany.com',
					enabled: true
				}
			]
		},

		{
			name: 'No Certificates',
			description: 'Block all certificate issuance',
			domain: 'secure.example.com',
			records: [
				{ flag: 0, tag: 'issue', value: ';', enabled: true },
				{ flag: 0, tag: 'issuewild', value: ';', enabled: true },
				{
					flag: 0,
					tag: 'iodef',
					value: 'security@example.com',
					enabled: true
				}
			]
		}
	];

	function loadExample(example) {
		$.set(domain, example.domain, true);

		// Reset all records
		$.set(records, $.get(records).map((r) => ({ ...r, enabled: false, value: '' })), true);

		// Add example records
		for (const exampleRecord of example.records) {
			const existingIndex = $.get(records).findIndex((r) => r.tag === exampleRecord.tag && !r.enabled);

			if (existingIndex >= 0) {
				$.get(records)[existingIndex] = { ...exampleRecord };
			} else {
				$.get(records).push({ ...exampleRecord });
			}
		}

		$.set(records, $.get(records), true);
		$.set(selectedExample, example.name, true);
		$.set(showExamples, false);
	}

	const securityTips = [
		'Start with monitoring: Add iodef records first to receive notifications',
		'Use specific CAs: Only authorize certificate authorities you actually use',
		'Include wildcards: Add issuewild records if you use wildcard certificates',
		'Monitor regularly: Check iodef notifications for unauthorized issuance attempts',
		'Test thoroughly: Verify legitimate certificate renewals still work after deployment'
	];

	var div = root_13();
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

	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Domain to create CAA records for');

	var input = $.sibling(label, 2);

	$.remove_input_defaults(input);
	$.reset(div_5);
	$.reset(div_3);

	var div_6 = $.sibling(div_3, 2);
	var div_7 = $.child(div_6);
	var h3_1 = $.child(div_7);
	var node_1 = $.child(h3_1);

	Icon(node_1, { name: 'shield', size: 'sm' });
	$.next();
	$.reset(h3_1);

	var div_8 = $.sibling(h3_1, 2);
	var button = $.child(div_8);
	var node_2 = $.child(button);

	Icon(node_2, { name: 'plus', size: 'sm' });
	$.next();
	$.reset(button);
	$.action(button, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Add certificate issuance authorization');

	var button_1 = $.sibling(button, 2);
	var node_3 = $.child(button_1);

	Icon(node_3, { name: 'plus', size: 'sm' });
	$.next();
	$.reset(button_1);
	$.action(button_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Add wildcard certificate issuance authorization');

	var button_2 = $.sibling(button_1, 2);
	var node_4 = $.child(button_2);

	Icon(node_4, { name: 'plus', size: 'sm' });
	$.next();
	$.reset(button_2);
	$.action(button_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Add incident reporting contact');
	$.reset(div_8);
	$.reset(div_7);

	var div_9 = $.sibling(div_7, 2);

	$.each(div_9, 23, () => $.get(records), (record, index) => record.tag + index, ($$anchor, record, index) => {
		var div_10 = root_2();
		let classes;
		var div_11 = $.child(div_10);
		var label_1 = $.child(div_11);
		var input_1 = $.child(label_1);

		$.remove_input_defaults(input_1);

		var span = $.sibling(input_1, 2);
		var text_1 = $.only_child(span, true);
		var span_1 = $.sibling(span, 2);
		var text_2 = $.only_child(span_1, true);

		$.action(span_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => tagDescriptions[$.get(record).tag]);
		$.reset(label_1);

		var div_12 = $.sibling(label_1, 2);
		var div_13 = $.child(div_12);
		var select = $.child(div_13);
		var option = $.child(select);

		option.value = option.__value = 0;

		var option_1 = $.sibling(option);

		option_1.value = option_1.__value = 128;
		$.reset(select);
		$.init_select(select);
		$.reset(div_13);

		var button_3 = $.sibling(div_13, 2);
		var node_5 = $.child(button_3);

		Icon(node_5, { name: 'x', size: 'sm' });
		$.reset(button_3);
		$.action(button_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Remove this record');
		$.reset(div_12);
		$.reset(div_11);

		var div_14 = $.sibling(div_11, 2);
		var input_2 = $.child(div_14);

		$.remove_input_defaults(input_2);

		var node_6 = $.sibling(input_2, 2);

		{
			var consequent = ($$anchor) => {
				var div_15 = root_1();
				var div_16 = $.sibling($.child(div_15), 2);
				var node_7 = $.child(div_16);

				$.each(node_7, 17, () => commonCAs.slice(0, 4), (ca) => ca.name, ($$anchor, ca) => {
					var button_4 = root();
					var text_3 = $.only_child(button_4, true);

					$.action(button_4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => $.get(ca).name);
					$.template_effect(() => $.set_text(text_3, $.get(ca).name));
					$.delegated('click', button_4, () => addCA($.get(index), $.get(ca).value));
					$.append($$anchor, button_4);
				});

				var button_5 = $.sibling(node_7, 2);

				$.action(button_5, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Deny all certificate issuance');
				$.reset(div_16);
				$.reset(div_15);
				$.delegated('click', button_5, () => addCA($.get(index), ';'));
				$.append($$anchor, div_15);
			};

			$.if(node_6, ($$render) => {
				if (($.get(record).tag === 'issue' || $.get(record).tag === 'issuewild') && $.get(record).enabled) $$render(consequent);
			});
		}

		$.reset(div_14);
		$.reset(div_10);

		$.template_effect(
			($0) => {
				classes = $.set_class(div_10, 1, 'record-item svelte-1dy6vo6', null, classes, { enabled: $.get(record).enabled });
				$.set_text(text_1, $0);
				$.set_text(text_2, tagDescriptions[$.get(record).tag]);
				select.disabled = !$.get(record).enabled;
				input_2.disabled = !$.get(record).enabled;

				$.set_attribute(input_2, 'placeholder', $.get(record).tag === 'issue'
					? 'letsencrypt.org or ; (to deny all)'
					: $.get(record).tag === 'issuewild'
						? 'letsencrypt.org or ; (to deny all)'
						: 'security@example.com or https://example.com/security');
			},
			[() => $.get(record).tag.toUpperCase()]
		);

		$.bind_checked(input_1, () => $.get(record).enabled, ($$value) => ($.get(record).enabled = $$value));
		$.bind_select_value(select, () => $.get(record).flag, ($$value) => ($.get(record).flag = $$value));
		$.delegated('click', button_3, () => removeRecord($.get(index)));
		$.bind_value(input_2, () => $.get(record).value, ($$value) => ($.get(record).value = $$value));
		$.append($$anchor, div_10);
	});

	$.reset(div_9);
	$.reset(div_6);
	$.reset(div_2);

	var div_17 = $.sibling(div_2, 2);
	var div_18 = $.child(div_17);
	var div_19 = $.child(div_18);
	var div_20 = $.sibling($.child(div_19), 2);
	var button_6 = $.child(div_20);
	let classes_1;
	var node_8 = $.child(button_6);

	{
		let $0 = $.derived(() => buttonStates['copy-caa'] ? 'check' : 'copy');

		Icon(node_8, {
			get name() {
				return $.get($0);
			},
			size: 'sm'
		});
	}

	var text_4 = $.sibling(node_8);

	$.reset(button_6);
	$.action(button_6, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Copy all CAA records to clipboard');

	var button_7 = $.sibling(button_6, 2);
	let classes_2;
	var node_9 = $.child(button_7);

	{
		let $0 = $.derived(() => buttonStates['export-caa'] ? 'check' : 'download');

		Icon(node_9, {
			get name() {
				return $.get($0);
			},
			size: 'sm'
		});
	}

	var text_5 = $.sibling(node_9);

	$.reset(button_7);
	$.action(button_7, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Download as zone file');
	$.reset(div_20);
	$.reset(div_19);

	var node_10 = $.sibling(div_19, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_21 = root_4();

			$.each(div_21, 20, () => $.get(caaRecords), (record) => record, ($$anchor, record) => {
				var div_22 = root_3();
				var code = $.child(div_22);
				var text_6 = $.only_child(code, true);

				$.reset(div_22);
				$.template_effect(() => $.set_text(text_6, record));
				$.append($$anchor, div_22);
			});

			$.reset(div_21);
			$.append($$anchor, div_21);
		};

		var alternate = ($$anchor) => {
			var div_23 = root_5();
			var node_11 = $.child(div_23);

			Icon(node_11, { name: 'info', size: 'sm' });
			$.next(2);
			$.reset(div_23);
			$.append($$anchor, div_23);
		};

		$.if(node_10, ($$render) => {
			if ($.get(caaRecords).length > 0) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.reset(div_18);

	var div_24 = $.sibling(div_18, 2);
	var div_25 = $.child(div_24);
	var h3_2 = $.child(div_25);
	var node_12 = $.child(h3_2);

	Icon(node_12, { name: 'bar-chart', size: 'sm' });
	$.next();
	$.reset(h3_2);
	$.reset(div_25);

	var div_26 = $.sibling(div_25, 2);
	var div_27 = $.child(div_26);
	var span_2 = $.sibling($.child(div_27), 2);
	var text_7 = $.only_child(span_2, true);

	$.reset(div_27);

	var div_28 = $.sibling(div_27, 2);
	var span_3 = $.sibling($.child(div_28), 2);
	let classes_3;
	var text_8 = $.only_child(span_3, true);

	$.reset(div_28);
	$.reset(div_26);

	var node_13 = $.sibling(div_26, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_29 = root_7();
			var node_14 = $.child(div_29);

			Icon(node_14, { name: 'x-circle', size: 'sm' });

			var div_30 = $.sibling(node_14, 2);

			$.each(div_30, 20, () => $.get(validation).errors, (error) => error, ($$anchor, error) => {
				var div_31 = root_6();
				var text_9 = $.only_child(div_31, true);

				$.template_effect(() => $.set_text(text_9, error));
				$.append($$anchor, div_31);
			});

			$.reset(div_30);
			$.reset(div_29);
			$.append($$anchor, div_29);
		};

		$.if(node_13, ($$render) => {
			if ($.get(validation).errors.length > 0) $$render(consequent_2);
		});
	}

	var node_15 = $.sibling(node_13, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_32 = root_8();
			var node_16 = $.child(div_32);

			Icon(node_16, { name: 'alert-triangle', size: 'sm' });

			var div_33 = $.sibling(node_16, 2);

			$.each(div_33, 20, () => $.get(validation).warnings, (warning) => warning, ($$anchor, warning) => {
				var div_34 = root_6();
				var text_10 = $.only_child(div_34, true);

				$.template_effect(() => $.set_text(text_10, warning));
				$.append($$anchor, div_34);
			});

			$.reset(div_33);
			$.reset(div_32);
			$.append($$anchor, div_32);
		};

		$.if(node_15, ($$render) => {
			if ($.get(validation).warnings.length > 0) $$render(consequent_3);
		});
	}

	var node_17 = $.sibling(node_15, 2);

	{
		var consequent_4 = ($$anchor) => {
			var div_35 = root_9();
			var node_18 = $.child(div_35);

			Icon(node_18, { name: 'check-circle', size: 'sm' });
			$.next(2);
			$.reset(div_35);
			$.append($$anchor, div_35);
		};

		$.if(node_17, ($$render) => {
			if ($.get(validation).isValid && $.get(validation).errors.length === 0 && $.get(validation).warnings.length === 0) $$render(consequent_4);
		});
	}

	$.reset(div_24);

	var div_36 = $.sibling(div_24, 2);
	var div_37 = $.child(div_36);
	var h3_3 = $.child(div_37);
	var node_19 = $.child(h3_3);

	Icon(node_19, { name: 'info', size: 'sm' });
	$.next();
	$.reset(h3_3);
	$.reset(div_37);

	var div_38 = $.sibling(div_37, 2);
	var ul = $.child(div_38);

	$.each(ul, 20, () => securityTips, (tip) => tip, ($$anchor, tip) => {
		var li = root_10();
		var text_11 = $.only_child(li, true);

		$.template_effect(() => $.set_text(text_11, tip));
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(div_38);
	$.reset(div_36);
	$.reset(div_17);
	$.reset(div_1);

	var div_39 = $.sibling(div_1, 2);
	var details = $.child(div_39);
	var summary = $.child(details);
	var node_20 = $.child(summary);

	Icon(node_20, { name: 'lightbulb', size: 'sm' });
	$.next();
	$.reset(summary);

	var div_40 = $.sibling(summary, 2);

	$.each(div_40, 21, () => exampleConfigurations, (example) => example.name, ($$anchor, example) => {
		var button_8 = root_12();
		let classes_4;
		var div_41 = $.child(button_8);
		var strong = $.child(div_41);
		var text_12 = $.only_child(strong, true);

		$.reset(div_41);

		var p = $.sibling(div_41, 2);
		var text_13 = $.only_child(p, true);
		var div_42 = $.sibling(p, 2);

		$.each(div_42, 21, () => $.get(example).records, (record) => record.tag + record.value, ($$anchor, record) => {
			var div_43 = root_11();
			var code_1 = $.child(div_43);
			var text_14 = $.only_child(code_1);

			$.reset(div_43);
			$.template_effect(() => $.set_text(text_14, `${$.get(record).tag ?? ''}: ${$.get(record).value ?? ''}`));
			$.append($$anchor, div_43);
		});

		$.reset(div_42);
		$.reset(button_8);

		$.template_effect(() => {
			classes_4 = $.set_class(button_8, 1, 'example-card svelte-1dy6vo6', null, classes_4, { selected: $.get(selectedExample) === $.get(example).name });
			$.set_text(text_12, $.get(example).name);
			$.set_text(text_13, $.get(example).description);
		});

		$.delegated('click', button_8, () => loadExample($.get(example)));
		$.append($$anchor, button_8);
	});

	$.reset(div_40);
	$.reset(details);
	$.reset(div_39);
	$.reset(div);

	$.template_effect(() => {
		classes_1 = $.set_class(button_6, 1, 'copy-btn svelte-1dy6vo6', null, classes_1, { success: buttonStates['copy-caa'] });
		button_6.disabled = $.get(caaRecords).length === 0;
		$.set_text(text_4, ` ${buttonStates['copy-caa'] ? 'Copied!' : 'Copy'}`);
		classes_2 = $.set_class(button_7, 1, 'export-btn svelte-1dy6vo6', null, classes_2, { success: buttonStates['export-caa'] });
		button_7.disabled = $.get(caaRecords).length === 0;
		$.set_text(text_5, ` ${buttonStates['export-caa'] ? 'Downloaded!' : 'Export'}`);
		$.set_text(text_7, $.get(validation).recordCount);

		classes_3 = $.set_class(span_3, 1, 'stat-value svelte-1dy6vo6', null, classes_3, {
			success: $.get(validation).isValid,
			error: !$.get(validation).isValid
		});

		$.set_text(text_8, $.get(validation).isValid ? 'Valid' : 'Invalid');
	});

	$.bind_value(input, () => $.get(domain), ($$value) => $.set(domain, $$value));
	$.delegated('click', button, () => addRecord('issue'));
	$.delegated('click', button_1, () => addRecord('issuewild'));
	$.delegated('click', button_2, () => addRecord('iodef'));
	$.delegated('click', button_6, () => copyToClipboard($.get(caaRecords).join('\n'), 'copy-caa'));
	$.delegated('click', button_7, exportAsZoneFile);
	$.bind_property('open', 'toggle', details, ($$value) => $.set(showExamples, $$value), () => $.get(showExamples));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);