import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';
import { tooltip } from '$lib/actions/tooltip';

var root = $.from_html(`<label class="failure-option svelte-1o3uqd0"><input type="checkbox" class="svelte-1o3uqd0"/> <span class="option-code svelte-1o3uqd0"> </span> <span class="option-description svelte-1o3uqd0"> </span></label>`);
var root_1 = $.from_html(`<div class="message svelte-1o3uqd0"> </div>`);
var root_2 = $.from_html(`<div class="validation-messages error svelte-1o3uqd0"><!> <div class="messages svelte-1o3uqd0"></div></div>`);
var root_3 = $.from_html(`<div class="validation-messages warning svelte-1o3uqd0"><!> <div class="messages svelte-1o3uqd0"></div></div>`);
var root_4 = $.from_html(`<div class="validation-messages success svelte-1o3uqd0"><!> <div class="message svelte-1o3uqd0">DMARC policy is valid and ready to deploy!</div></div>`);
var root_5 = $.from_html(`<li> </li>`);
var root_6 = $.from_html(`<div>Reports: <code class="svelte-1o3uqd0"> </code></div>`);
var root_7 = $.from_html(`<button type="button"><div class="example-header svelte-1o3uqd0"><strong class="svelte-1o3uqd0"> </strong></div> <p class="example-description svelte-1o3uqd0"> </p> <div class="example-config svelte-1o3uqd0"><div>Policy: <code class="svelte-1o3uqd0"> </code></div> <div>Percentage: <code class="svelte-1o3uqd0"> </code></div> <!></div></button>`);
var root_8 = $.from_html(`<div class="card"><div class="card-header"><h1>DMARC Policy Builder</h1> <p class="card-subtitle">Create DMARC policies with alignment options, reporting addresses, and failure handling configuration.</p></div> <div class="grid-layout"><div class="input-section"><div class="domain-section svelte-1o3uqd0"><div class="section-header svelte-1o3uqd0"><h3 class="svelte-1o3uqd0"><!> Domain Configuration</h3></div> <div class="input-group svelte-1o3uqd0"><label for="domain" class="svelte-1o3uqd0">Domain:</label> <input id="domain" type="text" placeholder="example.com" class="svelte-1o3uqd0"/></div></div> <div class="policy-section svelte-1o3uqd0"><div class="section-header svelte-1o3uqd0"><h3 class="svelte-1o3uqd0"><!> Policy Configuration</h3></div> <div class="policy-grid svelte-1o3uqd0"><div class="input-group svelte-1o3uqd0"><label for="policy" class="svelte-1o3uqd0">Policy (p):</label> <select id="policy" class="svelte-1o3uqd0"><option>none - Monitor only</option><option>quarantine - Send to spam</option><option>reject - Block email</option></select> <div class="policy-description svelte-1o3uqd0"> </div></div> <div class="input-group svelte-1o3uqd0"><label for="percentage" class="svelte-1o3uqd0">Percentage (pct):</label> <div class="percentage-input svelte-1o3uqd0"><input id="percentage" type="range" min="0" max="100" step="5" class="svelte-1o3uqd0"/> <span class="percentage-value svelte-1o3uqd0"> </span></div></div></div> <details class="advanced-toggle svelte-1o3uqd0"><summary class="svelte-1o3uqd0"><!> Advanced Options</summary> <div class="advanced-grid svelte-1o3uqd0"><div class="input-group svelte-1o3uqd0"><label for="subdomainPolicy" class="svelte-1o3uqd0">Subdomain Policy (sp):</label> <select id="subdomainPolicy" class="svelte-1o3uqd0"><option>Inherit from main policy</option><option>none - Monitor only</option><option>quarantine - Send to spam</option><option>reject - Block email</option></select></div> <div class="alignment-section svelte-1o3uqd0"><h4 class="svelte-1o3uqd0">Authentication Alignment</h4> <div class="alignment-grid svelte-1o3uqd0"><div class="input-group svelte-1o3uqd0"><label for="dkimAlignment" class="svelte-1o3uqd0">DKIM Alignment (adkim):</label> <select id="dkimAlignment" class="svelte-1o3uqd0"><option>r - Relaxed</option><option>s - Strict</option></select> <div class="alignment-description svelte-1o3uqd0"> </div></div> <div class="input-group svelte-1o3uqd0"><label for="spfAlignment" class="svelte-1o3uqd0">SPF Alignment (aspf):</label> <select id="spfAlignment" class="svelte-1o3uqd0"><option>r - Relaxed</option><option>s - Strict</option></select> <div class="alignment-description svelte-1o3uqd0"> </div></div></div></div> <div class="reporting-section svelte-1o3uqd0"><h4 class="svelte-1o3uqd0">Reporting Configuration</h4> <div class="reporting-grid svelte-1o3uqd0"><div class="input-group svelte-1o3uqd0"><label for="reportingURI" class="svelte-1o3uqd0">Reporting Email (rua):</label> <input id="reportingURI" type="email" placeholder="dmarc@example.com" class="svelte-1o3uqd0"/></div> <div class="input-group svelte-1o3uqd0"><label for="forensicURI" class="svelte-1o3uqd0">Forensic Email (ruf):</label> <input id="forensicURI" type="email" placeholder="forensic@example.com" class="svelte-1o3uqd0"/></div> <div class="input-group svelte-1o3uqd0"><label for="reportInterval" class="svelte-1o3uqd0">Report Interval (ri):</label> <select id="reportInterval" class="svelte-1o3uqd0"><option>1 hour</option><option>24 hours (daily)</option><option>7 days (weekly)</option></select></div></div></div> <div class="failure-options-section svelte-1o3uqd0"><h4 class="svelte-1o3uqd0">Failure Reporting Options (fo):</h4> <div class="failure-options svelte-1o3uqd0"></div></div></div></details></div></div> <div class="results-section"><div class="record-section"><div class="section-header svelte-1o3uqd0"><h3 class="svelte-1o3uqd0">Generated DMARC Record</h3> <div class="actions svelte-1o3uqd0"><button type="button"><!> </button> <button type="button"><!> </button></div></div> <div class="record-output"><div class="code-block svelte-1o3uqd0"><code class="svelte-1o3uqd0"> </code></div></div> <div class="zone-file-output svelte-1o3uqd0"><h4 class="svelte-1o3uqd0">DNS TXT Record:</h4> <div class="code-block svelte-1o3uqd0"><code class="svelte-1o3uqd0"> </code></div></div></div> <div class="validation-section"><div class="section-header svelte-1o3uqd0"><h3 class="svelte-1o3uqd0"><!> Policy Validation</h3></div> <div class="validation-stats svelte-1o3uqd0"><div class="stat-item svelte-1o3uqd0"><span class="stat-label svelte-1o3uqd0">Record Length:</span> <span> </span></div> <div class="stat-item svelte-1o3uqd0"><span class="stat-label svelte-1o3uqd0">Status:</span> <span> </span></div></div> <!> <!> <!></div> <div class="deployment-guide svelte-1o3uqd0"><div class="section-header svelte-1o3uqd0"><h3 class="svelte-1o3uqd0"><!> Deployment Guide</h3></div> <div class="deployment-steps svelte-1o3uqd0"><ol class="svelte-1o3uqd0"></ol></div></div></div></div> <div class="examples-section svelte-1o3uqd0"><details class="examples-toggle svelte-1o3uqd0"><summary class="svelte-1o3uqd0"><!> Example Policies</summary> <div class="examples-grid svelte-1o3uqd0"></div></details></div></div>`);

export default function DMARCBuilder($$anchor, $$props) {
	$.push($$props, true);

	let domain = $.state('example.com');

	let policy = $.state($.proxy({
		version: 'DMARC1',
		policy: 'none',
		subdomainPolicy: undefined,
		dkimAlignment: 'r',
		spfAlignment: 'r',
		percentage: 100,
		reportingURI: undefined,
		forensicURI: undefined,
		failureOptions: ['0'],
		reportInterval: 86400
	}));

	let showAdvanced = $.state(false);
	let selectedExample = $.state(null);

	// Button success states
	let buttonStates = $.proxy({});

	const policyDescriptions = {
		none: 'Monitor only - no action taken on failed emails',
		quarantine: 'Failed emails sent to spam/junk folder',
		reject: 'Failed emails rejected at SMTP level'
	};

	const alignmentDescriptions = {
		r: 'Relaxed - domain and subdomains match',
		s: 'Strict - exact domain match only'
	};

	const failureOptionDescriptions = {
		'0': 'Generate reports if both SPF and DKIM fail',
		'1': 'Generate reports if either SPF or DKIM fail',
		d: 'Generate reports if DKIM fails',
		s: 'Generate reports if SPF fails'
	};

	const dmarcRecord = $.derived(() => {
		let record = `v=${$.get(policy).version}; p=${$.get(policy).policy}`;

		if ($.get(policy).subdomainPolicy && $.get(policy).subdomainPolicy !== $.get(policy).policy) {
			record += `; sp=${$.get(policy).subdomainPolicy}`;
		}

		if ($.get(policy).dkimAlignment !== 'r') {
			record += `; adkim=${$.get(policy).dkimAlignment}`;
		}

		if ($.get(policy).spfAlignment !== 'r') {
			record += `; aspf=${$.get(policy).spfAlignment}`;
		}

		if ($.get(policy).percentage !== 100) {
			record += `; pct=${$.get(policy).percentage}`;
		}

		if ($.get(policy).reportingURI?.trim()) {
			record += `; rua=mailto:${$.get(policy).reportingURI.trim()}`;
		}

		if ($.get(policy).forensicURI?.trim()) {
			record += `; ruf=mailto:${$.get(policy).forensicURI.trim()}`;
		}

		if ($.get(policy).failureOptions.length > 0) {
			record += `; fo=${$.get(policy).failureOptions.join(':')}`;
		}

		if ($.get(policy).reportInterval !== 86400) {
			record += `; ri=${$.get(policy).reportInterval}`;
		}

		return record;
	});

	const txtRecord = $.derived(() => {
		return `_dmarc.${$.get(domain)}. IN TXT "${$.get(dmarcRecord)}"`;
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

		// Policy progression warnings
		if ($.get(policy).policy === 'reject' && !$.get(policy).reportingURI) {
			warnings.push('Consider adding reporting URI before using reject policy');
		}

		if ($.get(policy).policy === 'none' && $.get(policy).percentage < 100) {
			warnings.push('Percentage should be 100% for monitoring-only policy');
		}

		// Alignment warnings
		if ($.get(policy).dkimAlignment === 's' && $.get(policy).spfAlignment === 's') {
			warnings.push('Strict alignment for both SPF and DKIM may cause legitimate emails to fail');
		}

		// Reporting warnings
		if ($.get(policy).reportingURI && !$.get(policy).reportingURI.includes('@')) {
			errors.push('Reporting URI must be a valid email address');
		}

		if ($.get(policy).forensicURI && !$.get(policy).forensicURI.includes('@')) {
			errors.push('Forensic URI must be a valid email address');
		}

		// Record length check
		const recordLength = $.get(dmarcRecord).length;

		if (recordLength > 255) {
			errors.push(`DMARC record too long (${recordLength} chars). DNS TXT limit is 255.`);
		} else if (recordLength > 200) {
			warnings.push(`DMARC record is long (${recordLength} chars). Consider shortening.`);
		}

		return { isValid: errors.length === 0, errors, warnings, recordLength };
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

	function exportAsZoneFile() {
		const zoneContent = $.get(txtRecord);
		const blob = new Blob([zoneContent], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		a.href = url;
		a.download = `${$.get(domain)}-dmarc-record.zone`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		showButtonSuccess('export-zone');
	}

	function toggleFailureOption(option) {
		if ($.get(policy).failureOptions.includes(option)) {
			$.get(policy).failureOptions = $.get(policy).failureOptions.filter((o) => o !== option);
		} else {
			$.get(policy).failureOptions = [...$.get(policy).failureOptions, option];
		}
	}

	const examplePolicies = [
		{
			name: 'Monitor Only',
			description: 'Start monitoring without affecting email delivery',
			domain: 'example.com',
			config: {
				policy: 'none',
				percentage: 100,
				reportingURI: 'dmarc@example.com',
				dkimAlignment: 'r',
				spfAlignment: 'r',
				failureOptions: ['0']
			}
		},

		{
			name: 'Quarantine Phase',
			description: 'Move suspicious emails to spam folder',
			domain: 'mycompany.com',
			config: {
				policy: 'quarantine',
				percentage: 25,
				reportingURI: 'dmarc-reports@mycompany.com',
				dkimAlignment: 'r',
				spfAlignment: 'r',
				failureOptions: ['1']
			}
		},

		{
			name: 'Full Protection',
			description: 'Reject all failing emails with forensics',
			domain: 'secure.example.com',
			config: {
				policy: 'reject',
				subdomainPolicy: 'reject',
				percentage: 100,
				reportingURI: 'dmarc@secure.example.com',
				forensicURI: 'forensics@secure.example.com',
				dkimAlignment: 's',
				spfAlignment: 's',
				failureOptions: ['1']
			}
		}
	];

	function loadExample(example) {
		$.set(domain, example.domain, true);
		$.set(policy, { version: 'DMARC1', reportInterval: 86400, ...example.config }, true);
		$.set(selectedExample, example.name, true);
	}

	const deploymentSteps = [
		'Start with p=none to monitor current email authentication status',
		'Analyze DMARC reports to identify legitimate vs malicious sources',
		'Configure SPF and DKIM for all legitimate sending sources',
		'Gradually increase to p=quarantine with low percentage (pct=25)',
		'Monitor for false positives and adjust alignment if needed',
		'Increase percentage gradually (50%, 75%, 100%)',
		'Finally move to p=reject when confident in configuration'
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
	var label = $.child(div_5);

	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Domain that this DMARC policy will protect');

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
	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var div_9 = $.child(div_8);
	var label_1 = $.child(div_9);

	$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Action to take for emails that fail DMARC authentication');

	var select = $.sibling(label_1, 2);
	var option_1 = $.child(select);

	option_1.value = option_1.__value = 'none';

	var option_2 = $.sibling(option_1);

	option_2.value = option_2.__value = 'quarantine';

	var option_3 = $.sibling(option_2);

	option_3.value = option_3.__value = 'reject';
	$.reset(select);
	$.init_select(select);

	var div_10 = $.sibling(select, 2);
	var text_1 = $.only_child(div_10, true);

	$.reset(div_9);

	var div_11 = $.sibling(div_9, 2);
	var label_2 = $.child(div_11);

	$.action(label_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Percentage of failing emails to apply policy to (useful for gradual deployment)');

	var div_12 = $.sibling(label_2, 2);
	var input_1 = $.child(div_12);

	$.remove_input_defaults(input_1);

	var span = $.sibling(input_1, 2);
	var text_2 = $.only_child(span);

	$.reset(div_12);
	$.reset(div_11);
	$.reset(div_8);

	var details = $.sibling(div_8, 2);
	var summary = $.child(details);
	var node_2 = $.child(summary);

	Icon(node_2, { name: 'settings', size: 'sm' });
	$.next();
	$.reset(summary);

	var div_13 = $.sibling(summary, 2);
	var div_14 = $.child(div_13);
	var label_3 = $.child(div_14);

	$.action(label_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Policy for subdomains (inherits main policy if not set)');

	var select_1 = $.sibling(label_3, 2);
	var option_4 = $.child(select_1);

	option_4.value = (option_4.__value = undefined) ?? '';

	var option_5 = $.sibling(option_4);

	option_5.value = option_5.__value = 'none';

	var option_6 = $.sibling(option_5);

	option_6.value = option_6.__value = 'quarantine';

	var option_7 = $.sibling(option_6);

	option_7.value = option_7.__value = 'reject';
	$.reset(select_1);
	$.init_select(select_1);
	$.reset(div_14);

	var div_15 = $.sibling(div_14, 2);
	var div_16 = $.sibling($.child(div_15), 2);
	var div_17 = $.child(div_16);
	var label_4 = $.child(div_17);

	$.action(label_4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'How strictly DKIM signature domain must match From domain');

	var select_2 = $.sibling(label_4, 2);
	var option_8 = $.child(select_2);

	option_8.value = option_8.__value = 'r';

	var option_9 = $.sibling(option_8);

	option_9.value = option_9.__value = 's';
	$.reset(select_2);
	$.init_select(select_2);

	var div_18 = $.sibling(select_2, 2);
	var text_3 = $.only_child(div_18, true);

	$.reset(div_17);

	var div_19 = $.sibling(div_17, 2);
	var label_5 = $.child(div_19);

	$.action(label_5, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'How strictly SPF domain must match From domain');

	var select_3 = $.sibling(label_5, 2);
	var option_10 = $.child(select_3);

	option_10.value = option_10.__value = 'r';

	var option_11 = $.sibling(option_10);

	option_11.value = option_11.__value = 's';
	$.reset(select_3);
	$.init_select(select_3);

	var div_20 = $.sibling(select_3, 2);
	var text_4 = $.only_child(div_20, true);

	$.reset(div_19);
	$.reset(div_16);
	$.reset(div_15);

	var div_21 = $.sibling(div_15, 2);
	var div_22 = $.sibling($.child(div_21), 2);
	var div_23 = $.child(div_22);
	var label_6 = $.child(div_23);

	$.action(label_6, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Email address to receive aggregate DMARC reports');

	var input_2 = $.sibling(label_6, 2);

	$.remove_input_defaults(input_2);
	$.reset(div_23);

	var div_24 = $.sibling(div_23, 2);
	var label_7 = $.child(div_24);

	$.action(label_7, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Email address to receive forensic failure reports (detailed samples)');

	var input_3 = $.sibling(label_7, 2);

	$.remove_input_defaults(input_3);
	$.reset(div_24);

	var div_25 = $.sibling(div_24, 2);
	var label_8 = $.child(div_25);

	$.action(label_8, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'How often aggregate reports are sent (in seconds)');

	var select_4 = $.sibling(label_8, 2);
	var option_12 = $.child(select_4);

	option_12.value = option_12.__value = 3600;

	var option_13 = $.sibling(option_12);

	option_13.value = option_13.__value = 86400;

	var option_14 = $.sibling(option_13);

	option_14.value = option_14.__value = 604800;
	$.reset(select_4);
	$.init_select(select_4);
	$.reset(div_25);
	$.reset(div_22);
	$.reset(div_21);

	var div_26 = $.sibling(div_21, 2);
	var h4 = $.child(div_26);

	$.action(h4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'When to generate forensic failure reports');

	var div_27 = $.sibling(h4, 2);

	$.each(div_27, 21, () => Object.entries(failureOptionDescriptions), ([option, description]) => option, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let option = () => $.get($$array)[0];
		let description = () => $.get($$array)[1];
		var label_9 = root();
		var input_4 = $.child(label_9);

		$.remove_input_defaults(input_4);

		var span_1 = $.sibling(input_4, 2);
		var text_5 = $.only_child(span_1);
		var span_2 = $.sibling(span_1, 2);
		var text_6 = $.only_child(span_2, true);

		$.reset(label_9);

		$.template_effect(
			($0) => {
				$.set_checked(input_4, $0);
				$.set_text(text_5, `${option() ?? ''}:`);
				$.set_text(text_6, description());
			},
			[() => $.get(policy).failureOptions.includes(option())]
		);

		$.delegated('change', input_4, () => toggleFailureOption(option()));
		$.append($$anchor, label_9);
	});

	$.reset(div_27);
	$.reset(div_26);
	$.reset(div_13);
	$.reset(details);
	$.reset(div_6);
	$.reset(div_2);

	var div_28 = $.sibling(div_2, 2);
	var div_29 = $.child(div_28);
	var div_30 = $.child(div_29);
	var div_31 = $.sibling($.child(div_30), 2);
	var button = $.child(div_31);
	let classes;
	var node_3 = $.child(button);

	{
		let $0 = $.derived(() => buttonStates['copy-dmarc'] ? 'check' : 'copy');

		Icon(node_3, {
			get name() {
				return $.get($0);
			},
			size: 'sm'
		});
	}

	var text_7 = $.sibling(node_3);

	$.reset(button);
	$.action(button, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Copy DMARC record to clipboard');

	var button_1 = $.sibling(button, 2);
	let classes_1;
	var node_4 = $.child(button_1);

	{
		let $0 = $.derived(() => buttonStates['export-zone'] ? 'check' : 'download');

		Icon(node_4, {
			get name() {
				return $.get($0);
			},
			size: 'sm'
		});
	}

	var text_8 = $.sibling(node_4);

	$.reset(button_1);
	$.action(button_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Download as zone file');
	$.reset(div_31);
	$.reset(div_30);

	var div_32 = $.sibling(div_30, 2);
	var div_33 = $.child(div_32);
	var code = $.child(div_33);
	var text_9 = $.only_child(code, true);

	$.reset(div_33);
	$.reset(div_32);

	var div_34 = $.sibling(div_32, 2);
	var div_35 = $.sibling($.child(div_34), 2);
	var code_1 = $.child(div_35);
	var text_10 = $.only_child(code_1, true);

	$.reset(div_35);
	$.reset(div_34);
	$.reset(div_29);

	var div_36 = $.sibling(div_29, 2);
	var div_37 = $.child(div_36);
	var h3_2 = $.child(div_37);
	var node_5 = $.child(h3_2);

	Icon(node_5, { name: 'bar-chart', size: 'sm' });
	$.next();
	$.reset(h3_2);
	$.reset(div_37);

	var div_38 = $.sibling(div_37, 2);
	var div_39 = $.child(div_38);
	var span_3 = $.sibling($.child(div_39), 2);
	let classes_2;
	var text_11 = $.only_child(span_3);

	$.reset(div_39);

	var div_40 = $.sibling(div_39, 2);
	var span_4 = $.sibling($.child(div_40), 2);
	let classes_3;
	var text_12 = $.only_child(span_4, true);

	$.reset(div_40);
	$.reset(div_38);

	var node_6 = $.sibling(div_38, 2);

	{
		var consequent = ($$anchor) => {
			var div_41 = root_2();
			var node_7 = $.child(div_41);

			Icon(node_7, { name: 'x-circle', size: 'sm' });

			var div_42 = $.sibling(node_7, 2);

			$.each(div_42, 21, () => $.get(validation).errors, $.index, ($$anchor, error) => {
				var div_43 = root_1();
				var text_13 = $.only_child(div_43, true);

				$.template_effect(() => $.set_text(text_13, $.get(error)));
				$.append($$anchor, div_43);
			});

			$.reset(div_42);
			$.reset(div_41);
			$.append($$anchor, div_41);
		};

		$.if(node_6, ($$render) => {
			if ($.get(validation).errors.length > 0) $$render(consequent);
		});
	}

	var node_8 = $.sibling(node_6, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_44 = root_3();
			var node_9 = $.child(div_44);

			Icon(node_9, { name: 'alert-triangle', size: 'sm' });

			var div_45 = $.sibling(node_9, 2);

			$.each(div_45, 21, () => $.get(validation).warnings, $.index, ($$anchor, warning) => {
				var div_46 = root_1();
				var text_14 = $.only_child(div_46, true);

				$.template_effect(() => $.set_text(text_14, $.get(warning)));
				$.append($$anchor, div_46);
			});

			$.reset(div_45);
			$.reset(div_44);
			$.append($$anchor, div_44);
		};

		$.if(node_8, ($$render) => {
			if ($.get(validation).warnings.length > 0) $$render(consequent_1);
		});
	}

	var node_10 = $.sibling(node_8, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_47 = root_4();
			var node_11 = $.child(div_47);

			Icon(node_11, { name: 'check-circle', size: 'sm' });
			$.next(2);
			$.reset(div_47);
			$.append($$anchor, div_47);
		};

		$.if(node_10, ($$render) => {
			if ($.get(validation).isValid && $.get(validation).errors.length === 0 && $.get(validation).warnings.length === 0) $$render(consequent_2);
		});
	}

	$.reset(div_36);

	var div_48 = $.sibling(div_36, 2);
	var div_49 = $.child(div_48);
	var h3_3 = $.child(div_49);
	var node_12 = $.child(h3_3);

	Icon(node_12, { name: 'info', size: 'sm' });
	$.next();
	$.reset(h3_3);
	$.reset(div_49);

	var div_50 = $.sibling(div_49, 2);
	var ol = $.child(div_50);

	$.each(ol, 21, () => deploymentSteps, $.index, ($$anchor, step, index) => {
		var li = root_5();
		let classes_4;
		var text_15 = $.only_child(li, true);

		$.template_effect(() => {
			classes_4 = $.set_class(li, 1, 'svelte-1o3uqd0', null, classes_4, {
				current: $.get(policy).policy === 'none' && index === 0 || $.get(policy).policy === 'quarantine' && index >= 2 && index <= 5 || $.get(policy).policy === 'reject' && index === 6
			});

			$.set_text(text_15, $.get(step));
		});

		$.append($$anchor, li);
	});

	$.reset(ol);
	$.reset(div_50);
	$.reset(div_48);
	$.reset(div_28);
	$.reset(div_1);

	var div_51 = $.sibling(div_1, 2);
	var details_1 = $.child(div_51);
	var summary_1 = $.child(details_1);
	var node_13 = $.child(summary_1);

	Icon(node_13, { name: 'lightbulb', size: 'sm' });
	$.next();
	$.reset(summary_1);

	var div_52 = $.sibling(summary_1, 2);

	$.each(div_52, 21, () => examplePolicies, (example) => example.name, ($$anchor, example) => {
		var button_2 = root_7();
		let classes_5;
		var div_53 = $.child(button_2);
		var strong = $.child(div_53);
		var text_16 = $.only_child(strong, true);

		$.reset(div_53);

		var p = $.sibling(div_53, 2);
		var text_17 = $.only_child(p, true);
		var div_54 = $.sibling(p, 2);
		var div_55 = $.child(div_54);
		var code_2 = $.sibling($.child(div_55));
		var text_18 = $.only_child(code_2, true);

		$.reset(div_55);

		var div_56 = $.sibling(div_55, 2);
		var code_3 = $.sibling($.child(div_56));
		var text_19 = $.only_child(code_3);

		$.reset(div_56);

		var node_14 = $.sibling(div_56, 2);

		{
			var consequent_3 = ($$anchor) => {
				var div_57 = root_6();
				var code_4 = $.sibling($.child(div_57));
				var text_20 = $.only_child(code_4, true);

				$.reset(div_57);
				$.template_effect(() => $.set_text(text_20, $.get(example).config.reportingURI));
				$.append($$anchor, div_57);
			};

			$.if(node_14, ($$render) => {
				if ($.get(example).config.reportingURI) $$render(consequent_3);
			});
		}

		$.reset(div_54);
		$.reset(button_2);

		$.template_effect(() => {
			classes_5 = $.set_class(button_2, 1, 'example-card svelte-1o3uqd0', null, classes_5, { selected: $.get(selectedExample) === $.get(example).name });
			$.set_text(text_16, $.get(example).name);
			$.set_text(text_17, $.get(example).description);
			$.set_text(text_18, $.get(example).config.policy);
			$.set_text(text_19, `${$.get(example).config.percentage ?? ''}%`);
		});

		$.delegated('click', button_2, () => loadExample($.get(example)));
		$.append($$anchor, button_2);
	});

	$.reset(div_52);
	$.reset(details_1);
	$.reset(div_51);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text_1, policyDescriptions[$.get(policy).policy]);
		$.set_text(text_2, `${$.get(policy).percentage ?? ''}%`);
		$.set_text(text_3, alignmentDescriptions[$.get(policy).dkimAlignment]);
		$.set_text(text_4, alignmentDescriptions[$.get(policy).spfAlignment]);
		classes = $.set_class(button, 1, 'copy-btn svelte-1o3uqd0', null, classes, { success: buttonStates['copy-dmarc'] });
		$.set_text(text_7, ` ${buttonStates['copy-dmarc'] ? 'Copied!' : 'Copy'}`);
		classes_1 = $.set_class(button_1, 1, 'export-btn svelte-1o3uqd0', null, classes_1, { success: buttonStates['export-zone'] });
		$.set_text(text_8, ` ${buttonStates['export-zone'] ? 'Downloaded!' : 'Export'}`);
		$.set_text(text_9, $.get(dmarcRecord));
		$.set_text(text_10, $.get(txtRecord));

		classes_2 = $.set_class(span_3, 1, 'stat-value svelte-1o3uqd0', null, classes_2, {
			warning: $.get(validation).recordLength > 200,
			error: $.get(validation).recordLength > 255
		});

		$.set_text(text_11, `${$.get(validation).recordLength ?? ''}/255 chars`);

		classes_3 = $.set_class(span_4, 1, 'stat-value svelte-1o3uqd0', null, classes_3, {
			success: $.get(validation).isValid,
			error: !$.get(validation).isValid
		});

		$.set_text(text_12, $.get(validation).isValid ? 'Valid' : 'Invalid');
	});

	$.bind_value(input, () => $.get(domain), ($$value) => $.set(domain, $$value));
	$.bind_select_value(select, () => $.get(policy).policy, ($$value) => $.get(policy).policy = $$value);
	$.bind_value(input_1, () => $.get(policy).percentage, ($$value) => $.get(policy).percentage = $$value);
	$.bind_select_value(select_1, () => $.get(policy).subdomainPolicy, ($$value) => $.get(policy).subdomainPolicy = $$value);
	$.bind_select_value(select_2, () => $.get(policy).dkimAlignment, ($$value) => $.get(policy).dkimAlignment = $$value);
	$.bind_select_value(select_3, () => $.get(policy).spfAlignment, ($$value) => $.get(policy).spfAlignment = $$value);
	$.bind_value(input_2, () => $.get(policy).reportingURI, ($$value) => $.get(policy).reportingURI = $$value);
	$.bind_value(input_3, () => $.get(policy).forensicURI, ($$value) => $.get(policy).forensicURI = $$value);
	$.bind_select_value(select_4, () => $.get(policy).reportInterval, ($$value) => $.get(policy).reportInterval = $$value);
	$.bind_property('open', 'toggle', details, ($$value) => $.set(showAdvanced, $$value), () => $.get(showAdvanced));
	$.delegated('click', button, () => copyToClipboard($.get(dmarcRecord), 'copy-dmarc'));
	$.delegated('click', button_1, exportAsZoneFile);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['change', 'click']);