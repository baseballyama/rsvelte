import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip as _tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import '../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<button><div class="test-case-label svelte-gtgubt"><!> <h5 class="svelte-gtgubt"> </h5></div> <code class="test-case-value svelte-gtgubt"> </code></button>`);
var root_1 = $.from_html(`<span class="ip-type svelte-gtgubt"> </span>`);
var root_2 = $.from_html(`<div class="normalized-form svelte-gtgubt"><span class="normalized-label svelte-gtgubt">Normalized:</span> <code class="normalized-value svelte-gtgubt"> </code></div>`);
var root_3 = $.from_html(`<li class="error-item svelte-gtgubt"><!> </li>`);
var root_4 = $.from_html(`<div class="errors-section svelte-gtgubt"><h4 class="svelte-gtgubt"><!> </h4> <ul class="error-list svelte-gtgubt"></ul></div>`);
var root_5 = $.from_html(`<li class="warning-item svelte-gtgubt"><!> </li>`);
var root_6 = $.from_html(`<div class="warnings-section svelte-gtgubt"><h4 class="svelte-gtgubt"><!> </h4> <ul class="warning-list svelte-gtgubt"></ul></div>`);
var root_7 = $.from_html(`<div class="detail-item svelte-gtgubt"><span class="detail-label svelte-gtgubt">Type:</span> <span class="detail-value svelte-gtgubt"> </span></div>`);
var root_8 = $.from_html(`<div class="detail-item svelte-gtgubt"><span class="detail-label svelte-gtgubt">Scope:</span> <span class="detail-value svelte-gtgubt"> </span></div>`);
var root_9 = $.from_html(`<div class="detail-item svelte-gtgubt"><span class="detail-label svelte-gtgubt">Routing:</span> <span> </span></div>`);
var root_10 = $.from_html(`<div class="detail-item svelte-gtgubt"><span class="detail-label svelte-gtgubt">Compressed:</span> <code class="detail-value compressed svelte-gtgubt"> </code></div>`);
var root_11 = $.from_html(`<div class="detail-item svelte-gtgubt"><span class="detail-label svelte-gtgubt">Embedded IPv4:</span> <code class="detail-value embedded svelte-gtgubt"> </code></div>`);
var root_12 = $.from_html(`<div class="detail-item svelte-gtgubt"><span class="detail-label svelte-gtgubt">Zone ID:</span> <code class="detail-value zone svelte-gtgubt"> </code></div>`);
var root_13 = $.from_html(`<li class="info-item svelte-gtgubt"><!> </li>`);
var root_14 = $.from_html(`<div class="info-section svelte-gtgubt"><h5 class="svelte-gtgubt">Additional Information</h5> <ul class="info-list svelte-gtgubt"></ul></div>`);
var root_15 = $.from_html(`<div class="details-section svelte-gtgubt"><h4 class="svelte-gtgubt"><!> Address Details</h4> <div class="details-grid svelte-gtgubt"><!> <!> <!> <!> <!> <!></div> <!></div>`);
var root_16 = $.from_html(`<section class="results-section svelte-gtgubt"><div><div class="result-header svelte-gtgubt"><div class="result-status svelte-gtgubt"><!> <div class="status-text svelte-gtgubt"><h2 class="svelte-gtgubt"> </h2> <!></div></div> <!></div> <!> <!> <!></div></section>`);

var root_17 = $.from_html(`<div class="card"><header class="card-header"><h1>IP Address Validator</h1> <p>Validate IPv4 and IPv6 addresses with detailed error analysis and format checking</p></header> <section class="input-section svelte-gtgubt"><div class="input-group svelte-gtgubt"><label for="ip-input" class="svelte-gtgubt"><!> Enter IP Address</label> <input id="ip-input" type="text" placeholder="e.g., 192.168.1.1 or 2001:db8::1" autocomplete="off" spellcheck="false"/> <div class="input-hint svelte-gtgubt">Supports IPv4 (192.168.1.1), IPv6 (2001:db8::1), and various formats</div></div></section> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary"><!> <h4>Quick Test Cases</h4></summary> <div class="examples-grid"></div></details></div> <!> <section class="about-content svelte-gtgubt"><div class="about-grid svelte-gtgubt"><div class="about-section"><h3 class="svelte-gtgubt">How to Tell if an IP Address is Valid</h3> <p class="svelte-gtgubt">Valid IP addresses follow specific rules. For IPv4, you need exactly four numbers (0-255) separated by dots,
          like 192.168.1.1. For IPv6, you need eight groups of hex digits separated by colons, though you can compress
          consecutive zeros with :: (like 2001:db8::1). The validator checks these rules and tells you exactly what's
          wrong when something doesn't match.</p></div> <div class="about-section"><h3 class="svelte-gtgubt">What Happens When Addresses Are Invalid</h3> <p class="svelte-gtgubt">Invalid IP addresses cause real problems. Your router might reject them, network connections fail, or software
          crashes. Common mistakes include typos like "192.168.1.256" (256 is too big), missing parts like "192.168.1",
          or extra zeros like "192.168.01.01". This tool catches these errors before they break your network setup.</p></div> <div class="about-section"><h3 class="svelte-gtgubt">Why Some Addresses Have Warnings</h3> <p class="svelte-gtgubt">Some valid addresses come with warnings because they have special meanings. For example, addresses ending in
          .0 are usually network addresses, and ones ending in .255 are broadcast addresses. Private addresses like
          192.168.x.x won't work on the internet. The tool explains what each address type means so you know if it's
          right for your use case.</p></div></div></section></div>`);

export default function IPValidator($$anchor, $$props) {
	$.push($$props, true);

	let inputValue = $.state('');
	let selectedExampleIndex = $.state(null);
	let result = $.state(null);

	// Common test cases for quick validation
	const testCases = [
		{ label: 'Valid IPv4', value: '192.168.1.1', valid: true },
		{ label: 'Valid IPv6', value: '2001:db8::1', valid: true },
		{
			label: 'IPv4 with leading zeros',
			value: '192.168.001.001',
			valid: false
		},

		{
			label: 'IPv4 octet too large',
			value: '192.168.1.256',
			valid: false
		},

		{
			label: 'IPv6 with multiple ::',
			value: '2001::db8::1',
			valid: false
		},

		{
			label: 'IPv6 too many groups',
			value: '2001:db8:85a3:0000:0000:8a2e:0370:7334:extra',
			valid: false
		}
	];

	function validateIPv4(ip) {
		const errors = [];
		const warnings = [];
		const details = { info: [] };

		// Check basic format
		if (!ip.includes('.')) {
			errors.push('IPv4 addresses must contain dots (.) to separate octets');

			return { isValid: false, errors, warnings, details };
		}

		const parts = ip.split('.');

		// Check number of octets
		if (parts.length !== 4) {
			errors.push(`IPv4 addresses must have exactly 4 octets, found ${parts.length}`);

			return { isValid: false, errors, warnings, details };
		}

		const octets = [];

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			const octetNum = i + 1;

			// Check if empty
			if (part === '') {
				errors.push(`Octet ${octetNum} is empty`);

				continue;
			}

			// Check for non-numeric characters
			if (!(/^\d+$/).test(part)) {
				errors.push(`Octet ${octetNum} contains non-numeric characters: "${part}"`);

				continue;
			}

			// Check for leading zeros (except for single zero)
			if (part.length > 1 && part[0] === '0') {
				errors.push(`Octet ${octetNum} has leading zeros: "${part}" (should be "${parseInt(part)})")`);

				continue;
			}

			// Parse and validate range
			const value = parseInt(part, 10);

			if (isNaN(value)) {
				errors.push(`Octet ${octetNum} is not a valid number: "${part}"`);

				continue;
			}

			if (value < 0 || value > 255) {
				errors.push(`Octet ${octetNum} out of range: ${value} (must be 0-255)`);

				continue;
			}

			octets.push(value);
		}

		if (errors.length > 0) {
			return { isValid: false, errors, warnings, details };
		}

		// Additional analysis for valid IPs
		const [a, b, c, d] = octets;

		details.normalizedForm = `${a}.${b}.${c}.${d}`;

		// Determine address type and scope
		if (a === 127) {
			details.addressType = 'Loopback';
			details.scope = 'Host';
			details.info.push('Used for local loopback communications');
		} else if (a === 10) {
			details.addressType = 'Private';
			details.scope = 'Private Network';
			details.isPrivate = true;
			details.info.push('RFC 1918 private address space (10.0.0.0/8)');
		} else if (a === 172 && b >= 16 && b <= 31) {
			details.addressType = 'Private';
			details.scope = 'Private Network';
			details.isPrivate = true;
			details.info.push('RFC 1918 private address space (172.16.0.0/12)');
		} else if (a === 192 && b === 168) {
			details.addressType = 'Private';
			details.scope = 'Private Network';
			details.isPrivate = true;
			details.info.push('RFC 1918 private address space (192.168.0.0/16)');
		} else if (a === 169 && b === 254) {
			details.addressType = 'Link-Local (APIPA)';
			details.scope = 'Link-Local';
			details.isReserved = true;
			details.info.push('Automatic Private IP Addressing');
		} else if (a >= 224 && a <= 239) {
			details.addressType = 'Multicast';
			details.scope = 'Multicast';
			details.isReserved = true;
			details.info.push('Used for multicast communications (224.0.0.0/4)');
		} else if (a >= 240) {
			details.addressType = 'Reserved';
			details.scope = 'Reserved';
			details.isReserved = true;
			details.info.push('Reserved for future use');
		} else if (a === 0) {
			details.addressType = 'Network Address';
			details.scope = 'Special Use';
			details.isReserved = true;
			details.info.push('"This network" address');
		} else if (d === 0) {
			details.addressType = 'Network Address';
			details.scope = 'Network';
			warnings.push('This appears to be a network address (host portion is 0)');
		} else if (d === 255) {
			details.addressType = 'Broadcast Address';
			details.scope = 'Network';
			warnings.push('This appears to be a broadcast address (host portion is all 1s)');
		} else {
			details.addressType = 'Public';
			details.scope = 'Internet';
			details.isPrivate = false;
			details.info.push('Publicly routable address');
		}

		return { isValid: true, errors: [], warnings, details };
	}

	function validateIPv6(ip) {
		const errors = [];
		const warnings = [];
		const details = { info: [] };

		// Check for zone ID (remove it for validation but note it)
		let cleanIP = ip;

		let zoneId = '';

		if (ip.includes('%')) {
			const parts = ip.split('%');

			if (parts.length > 2) {
				errors.push('Multiple % symbols found - invalid zone ID format');

				return { isValid: false, errors, warnings, details };
			}

			cleanIP = parts[0];
			zoneId = parts[1];
			details.zoneId = zoneId;
			details.info.push(`Zone ID specified: %${zoneId}`);
		}

		// Check for :: (compression)
		const doubleColonCount = (cleanIP.match(/::/g) || []).length;

		if (doubleColonCount > 1) {
			errors.push('Multiple :: sequences found - only one :: allowed per address');

			return { isValid: false, errors, warnings, details };
		}

		// Handle :: expansion
		let expandedIP = cleanIP;

		if (cleanIP.includes('::')) {
			const parts = cleanIP.split('::');

			if (parts.length > 2) {
				errors.push('Invalid :: usage - malformed compression');

				return { isValid: false, errors, warnings, details };
			}

			const leftParts = parts[0] ? parts[0].split(':') : [];
			const rightParts = parts[1] ? parts[1].split(':') : [];

			// Calculate how many groups to insert
			const totalParts = leftParts.length + rightParts.length;

			const missingGroups = 8 - totalParts;

			if (missingGroups < 0) {
				errors.push('Too many groups in compressed IPv6 address');

				return { isValid: false, errors, warnings, details };
			}

			const middleParts = Array(missingGroups).fill('0000');
			const allParts = [...leftParts, ...middleParts, ...rightParts];

			expandedIP = allParts.join(':');
		}

		// Check for embedded IPv4
		const ipv4Pattern = /(\d+)\.(\d+)\.(\d+)\.(\d+)$/;

		const ipv4Match = expandedIP.match(ipv4Pattern);

		if (ipv4Match) {
			// Validate the IPv4 part
			const ipv4Part = ipv4Match[0];

			const ipv4Result = validateIPv4(ipv4Part);

			if (!ipv4Result.isValid) {
				errors.push(`Invalid embedded IPv4 address: ${ipv4Result.errors.join(', ')}`);

				return { isValid: false, errors, warnings, details };
			}

			// Convert IPv4 to two IPv6 groups
			const [, a, b, c, d] = ipv4Match;

			const group1 = ((parseInt(a) << 8) + parseInt(b)).toString(16).padStart(4, '0');
			const group2 = ((parseInt(c) << 8) + parseInt(d)).toString(16).padStart(4, '0');

			expandedIP = expandedIP.replace(ipv4Pattern, `${group1}:${group2}`);
			details.hasEmbeddedIPv4 = true;
			details.embeddedIPv4 = ipv4Part;
			details.info.push(`Contains embedded IPv4 address: ${ipv4Part}`);
		}

		// Split into groups and validate
		const groups = expandedIP.split(':');

		if (groups.length !== 8) {
			if (!cleanIP.includes('::')) {
				errors.push(`IPv6 addresses must have 8 groups, found ${groups.length} (use :: for compression)`);
			} else {
				errors.push(`Invalid IPv6 compression - results in ${groups.length} groups instead of 8`);
			}

			return { isValid: false, errors, warnings, details };
		}

		// Validate each group
		for (let i = 0; i < groups.length; i++) {
			const group = groups[i];
			const groupNum = i + 1;

			if (group === '') {
				errors.push(`Group ${groupNum} is empty`);

				continue;
			}

			if (group.length > 4) {
				errors.push(`Group ${groupNum} too long: "${group}" (max 4 hex digits)`);

				continue;
			}

			if (!(/^[0-9a-fA-F]+$/).test(group)) {
				errors.push(`Group ${groupNum} contains invalid characters: "${group}" (only 0-9, a-f, A-F allowed)`);

				continue;
			}
		}

		if (errors.length > 0) {
			return { isValid: false, errors, warnings, details };
		}

		// Normalize the address
		const normalizedGroups = groups.map((group) => group.toLowerCase().padStart(4, '0'));

		const fullForm = normalizedGroups.join(':');

		details.normalizedForm = fullForm;

		// Analyze address type
		const firstGroup = normalizedGroups[0];

		const firstTwoGroups = normalizedGroups.slice(0, 2).join(':');

		if (fullForm === '0000:0000:0000:0000:0000:0000:0000:0001') {
			details.addressType = 'Loopback';
			details.scope = 'Host';
			details.info.push('IPv6 loopback address (::1)');
		} else if (fullForm === '0000:0000:0000:0000:0000:0000:0000:0000') {
			details.addressType = 'Unspecified';
			details.scope = 'Special Use';
			details.info.push('IPv6 unspecified address (::)');
		} else if (firstGroup === 'fe80') {
			details.addressType = 'Link-Local';
			details.scope = 'Link-Local';
			details.info.push('IPv6 link-local address');
		} else if (firstGroup === 'fec0') {
			details.addressType = 'Site-Local (Deprecated)';
			details.scope = 'Site-Local';
			details.info.push('Deprecated site-local address');
			warnings.push('Site-local addresses are deprecated (RFC 3879)');
		} else if (firstTwoGroups === 'fc00' || firstTwoGroups === 'fd00') {
			details.addressType = 'Unique Local';
			details.scope = 'Private Network';
			details.isPrivate = true;
			details.info.push('RFC 4193 Unique Local Address');
		} else if (firstGroup.startsWith('ff')) {
			details.addressType = 'Multicast';
			details.scope = 'Multicast';
			details.info.push('IPv6 multicast address');
		} else if (firstTwoGroups === '2001' && normalizedGroups[1] === '0db8') {
			details.addressType = 'Documentation';
			details.scope = 'Documentation';
			details.isReserved = true;
			details.info.push('RFC 3849 documentation address');
			warnings.push('This is a documentation address (not for production use)');
		} else if (firstGroup >= '2000' && firstGroup <= '3fff') {
			details.addressType = 'Global Unicast';
			details.scope = 'Internet';
			details.isPrivate = false;
			details.info.push('Globally routable IPv6 address');
		} else {
			details.addressType = 'Reserved';
			details.scope = 'Reserved';
			details.isReserved = true;
			details.info.push('Reserved address space');
		}

		// Check for compressed form
		if (cleanIP.includes('::')) {
			const compressedForm = compressIPv6(fullForm);

			details.compressedForm = compressedForm;

			if (cleanIP !== compressedForm) {
				details.info.push(`Standard compressed form: ${compressedForm}`);
			}
		}

		return { isValid: true, errors: [], warnings, details };
	}

	function compressIPv6(fullForm) {
		// Find the longest sequence of consecutive zero groups
		const groups = fullForm.split(':');

		let bestStart = -1;
		let bestLength = 0;
		let currentStart = -1;
		let currentLength = 0;

		for (let i = 0; i < groups.length; i++) {
			if (groups[i] === '0000') {
				if (currentStart === -1) {
					currentStart = i;
					currentLength = 1;
				} else {
					currentLength++;
				}
			} else {
				if (currentLength > bestLength && currentLength > 1) {
					bestStart = currentStart;
					bestLength = currentLength;
				}

				currentStart = -1;
				currentLength = 0;
			}
		}

		// Check final sequence
		if (currentLength > bestLength && currentLength > 1) {
			bestStart = currentStart;
			bestLength = currentLength;
		}

		// Apply compression
		let result = groups.map((group) => group.replace(/^0+/, '') || '0').join(':');

		if (bestStart !== -1) {
			const beforeZeros = groups.slice(0, bestStart).map((group) => group.replace(/^0+/, '') || '0');
			const afterZeros = groups.slice(bestStart + bestLength).map((group) => group.replace(/^0+/, '') || '0');

			if (beforeZeros.length === 0) {
				result = '::' + afterZeros.join(':');
			} else if (afterZeros.length === 0) {
				result = beforeZeros.join(':') + '::';
			} else {
				result = beforeZeros.join(':') + '::' + afterZeros.join(':');
			}
		}

		return result;
	}

	function validateIP(input) {
		if (!input.trim()) {
			$.set(result, null);

			return;
		}

		const trimmed = input.trim();

		// Determine if this looks like IPv4 or IPv6
		const hasColons = trimmed.includes(':');

		const hasDots = trimmed.includes('.');

		if (hasColons && hasDots) {
			// Could be IPv6 with embedded IPv4
			const ipv6Result = validateIPv6(trimmed);

			$.set(
				result,
				{
					isValid: ipv6Result.isValid,
					type: 'ipv6',
					errors: ipv6Result.errors,
					warnings: ipv6Result.warnings,
					details: ipv6Result.details
				},
				true
			);
		} else if (hasColons) {
			// IPv6
			const ipv6Result = validateIPv6(trimmed);

			$.set(
				result,
				{
					isValid: ipv6Result.isValid,
					type: 'ipv6',
					errors: ipv6Result.errors,
					warnings: ipv6Result.warnings,
					details: ipv6Result.details
				},
				true
			);
		} else if (hasDots) {
			// IPv4
			const ipv4Result = validateIPv4(trimmed);

			$.set(
				result,
				{
					isValid: ipv4Result.isValid,
					type: 'ipv4',
					errors: ipv4Result.errors,
					warnings: ipv4Result.warnings,
					details: ipv4Result.details
				},
				true
			);
		} else {
			// Neither format detected
			$.set(
				result,
				{
					isValid: false,
					type: null,
					errors: [
						'Input does not appear to be an IP address (no dots or colons found)'
					],
					warnings: [],
					details: {}
				},
				true
			);
		}
	}

	function setTestCase(testCase, index) {
		$.set(inputValue, testCase.value, true);
		$.set(selectedExampleIndex, index, true);
		validateIP($.get(inputValue));
	}

	function clearExampleSelection() {
		$.set(selectedExampleIndex, null);
	}

	function handleInput() {
		clearExampleSelection();
		validateIP($.get(inputValue));
	}

	// Validate on component load if there's initial input
	$.user_effect(() => {
		if ($.get(inputValue)) {
			validateIP($.get(inputValue));
		}
	});

	var div = root_17();
	var section = $.sibling($.child(div), 2);
	var div_1 = $.child(section);
	var label = $.child(div_1);
	var node = $.child(label);

	Icon(node, { name: 'globe', size: 'sm' });
	$.next();
	$.reset(label);

	var input_1 = $.sibling(label, 2);

	$.remove_input_defaults(input_1);
	$.next(2);
	$.reset(div_1);
	$.reset(section);

	var div_2 = $.sibling(section, 2);
	var details_1 = $.child(div_2);
	var summary = $.child(details_1);
	var node_1 = $.child(summary);

	Icon(node_1, { name: 'chevron-right', size: 'xs' });
	$.next(2);
	$.reset(summary);

	var div_3 = $.sibling(summary, 2);

	$.each(div_3, 23, () => testCases, (testCase, index) => `test-case-${index}`, ($$anchor, testCase, index) => {
		var button = root();
		let classes;
		var div_4 = $.child(button);
		var node_2 = $.child(div_4);

		{
			let $0 = $.derived(() => $.get(testCase).valid ? 'check-circle' : 'x-circle');

			Icon(node_2, {
				get name() {
					return $.get($0);
				},
				size: 'sm'
			});
		}

		var h5 = $.sibling(node_2, 2);
		var text = $.only_child(h5, true);

		$.reset(div_4);

		var code = $.sibling(div_4, 2);
		var text_1 = $.only_child(code, true);

		$.reset(button);

		$.template_effect(() => {
			classes = $.set_class(button, 1, `example-card ${$.get(testCase).valid ? 'valid-example' : 'invalid-example'}`, 'svelte-gtgubt', classes, { selected: $.get(selectedExampleIndex) === $.get(index) });
			$.set_text(text, $.get(testCase).label);
			$.set_text(text_1, $.get(testCase).value);
		});

		$.delegated('click', button, () => setTestCase($.get(testCase), $.get(index)));
		$.append($$anchor, button);
	});

	$.reset(div_3);
	$.reset(details_1);
	$.reset(div_2);

	var node_3 = $.sibling(div_2, 2);

	{
		var consequent_12 = ($$anchor) => {
			var section_1 = root_16();
			var div_5 = $.child(section_1);
			var div_6 = $.child(div_5);
			var div_7 = $.child(div_6);
			var node_4 = $.child(div_7);

			{
				let $0 = $.derived(() => $.get(result).isValid ? 'check-circle' : 'x-circle');

				Icon(node_4, {
					get name() {
						return $.get($0);
					},
					size: 'lg'
				});
			}

			var div_8 = $.sibling(node_4, 2);
			var h2 = $.child(div_8);
			var text_2 = $.only_child(h2);
			var node_5 = $.sibling(h2, 2);

			{
				var consequent = ($$anchor) => {
					var span = root_1();
					var text_3 = $.only_child(span);

					$.template_effect(($0) => $.set_text(text_3, `${$0 ?? ''} Format`), [() => $.get(result).type.toUpperCase()]);
					$.append($$anchor, span);
				};

				$.if(node_5, ($$render) => {
					if ($.get(result).type) $$render(consequent);
				});
			}

			$.reset(div_8);
			$.reset(div_7);

			var node_6 = $.sibling(div_7, 2);

			{
				var consequent_1 = ($$anchor) => {
					var div_9 = root_2();
					var code_1 = $.sibling($.child(div_9), 2);
					var text_4 = $.only_child(code_1, true);

					$.reset(div_9);
					$.template_effect(() => $.set_text(text_4, $.get(result).details.normalizedForm));
					$.append($$anchor, div_9);
				};

				$.if(node_6, ($$render) => {
					if ($.get(result).isValid && $.get(result).details.normalizedForm) $$render(consequent_1);
				});
			}

			$.reset(div_6);

			var node_7 = $.sibling(div_6, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_10 = root_4();
					var h4 = $.child(div_10);
					var node_8 = $.child(h4);

					Icon(node_8, { name: 'alert-circle', size: 'sm' });

					var text_5 = $.sibling(node_8);

					$.reset(h4);

					var ul = $.sibling(h4, 2);

					$.each(ul, 20, () => $.get(result).errors, (error) => error, ($$anchor, error) => {
						var li = root_3();
						var node_9 = $.child(li);

						Icon(node_9, { name: 'x', size: 'xs' });

						var text_6 = $.sibling(node_9);

						$.reset(li);
						$.template_effect(() => $.set_text(text_6, ` ${error ?? ''}`));
						$.append($$anchor, li);
					});

					$.reset(ul);
					$.reset(div_10);
					$.template_effect(() => $.set_text(text_5, ` Issues Found (${$.get(result).errors.length ?? ''})`));
					$.append($$anchor, div_10);
				};

				$.if(node_7, ($$render) => {
					if ($.get(result).errors.length > 0) $$render(consequent_2);
				});
			}

			var node_10 = $.sibling(node_7, 2);

			{
				var consequent_3 = ($$anchor) => {
					var div_11 = root_6();
					var h4_1 = $.child(div_11);
					var node_11 = $.child(h4_1);

					Icon(node_11, { name: 'alert-triangle', size: 'sm' });

					var text_7 = $.sibling(node_11);

					$.reset(h4_1);

					var ul_1 = $.sibling(h4_1, 2);

					$.each(ul_1, 20, () => $.get(result).warnings, (warning) => warning, ($$anchor, warning) => {
						var li_1 = root_5();
						var node_12 = $.child(li_1);

						Icon(node_12, { name: 'alert-triangle', size: 'xs' });

						var text_8 = $.sibling(node_12);

						$.reset(li_1);
						$.template_effect(() => $.set_text(text_8, ` ${warning ?? ''}`));
						$.append($$anchor, li_1);
					});

					$.reset(ul_1);
					$.reset(div_11);
					$.template_effect(() => $.set_text(text_7, ` Warnings (${$.get(result).warnings.length ?? ''})`));
					$.append($$anchor, div_11);
				};

				$.if(node_10, ($$render) => {
					if ($.get(result).warnings.length > 0) $$render(consequent_3);
				});
			}

			var node_13 = $.sibling(node_10, 2);

			{
				var consequent_11 = ($$anchor) => {
					var div_12 = root_15();
					var h4_2 = $.child(div_12);
					var node_14 = $.child(h4_2);

					Icon(node_14, { name: 'info', size: 'sm' });
					$.next();
					$.reset(h4_2);

					var div_13 = $.sibling(h4_2, 2);
					var node_15 = $.child(div_13);

					{
						var consequent_4 = ($$anchor) => {
							var div_14 = root_7();
							var span_1 = $.sibling($.child(div_14), 2);
							var text_9 = $.only_child(span_1, true);

							$.reset(div_14);
							$.template_effect(() => $.set_text(text_9, $.get(result).details.addressType));
							$.append($$anchor, div_14);
						};

						$.if(node_15, ($$render) => {
							if ($.get(result).details.addressType) $$render(consequent_4);
						});
					}

					var node_16 = $.sibling(node_15, 2);

					{
						var consequent_5 = ($$anchor) => {
							var div_15 = root_8();
							var span_2 = $.sibling($.child(div_15), 2);
							var text_10 = $.only_child(span_2, true);

							$.reset(div_15);
							$.template_effect(() => $.set_text(text_10, $.get(result).details.scope));
							$.append($$anchor, div_15);
						};

						$.if(node_16, ($$render) => {
							if ($.get(result).details.scope) $$render(consequent_5);
						});
					}

					var node_17 = $.sibling(node_16, 2);

					{
						var consequent_6 = ($$anchor) => {
							var div_16 = root_9();
							var span_3 = $.sibling($.child(div_16), 2);
							var text_11 = $.only_child(span_3, true);

							$.reset(div_16);

							$.template_effect(() => {
								$.set_class(span_3, 1, `detail-value ${$.get(result).details.isPrivate ? 'private' : 'public'}`, 'svelte-gtgubt');
								$.set_text(text_11, $.get(result).details.isPrivate ? 'Private' : 'Public');
							});

							$.append($$anchor, div_16);
						};

						$.if(node_17, ($$render) => {
							if ($.get(result).details.isPrivate !== undefined) $$render(consequent_6);
						});
					}

					var node_18 = $.sibling(node_17, 2);

					{
						var consequent_7 = ($$anchor) => {
							var div_17 = root_10();
							var code_2 = $.sibling($.child(div_17), 2);
							var text_12 = $.only_child(code_2, true);

							$.reset(div_17);
							$.template_effect(() => $.set_text(text_12, $.get(result).details.compressedForm));
							$.append($$anchor, div_17);
						};

						$.if(node_18, ($$render) => {
							if ($.get(result).details.compressedForm) $$render(consequent_7);
						});
					}

					var node_19 = $.sibling(node_18, 2);

					{
						var consequent_8 = ($$anchor) => {
							var div_18 = root_11();
							var code_3 = $.sibling($.child(div_18), 2);
							var text_13 = $.only_child(code_3, true);

							$.reset(div_18);
							$.template_effect(() => $.set_text(text_13, $.get(result).details.embeddedIPv4));
							$.append($$anchor, div_18);
						};

						$.if(node_19, ($$render) => {
							if ($.get(result).details.embeddedIPv4) $$render(consequent_8);
						});
					}

					var node_20 = $.sibling(node_19, 2);

					{
						var consequent_9 = ($$anchor) => {
							var div_19 = root_12();
							var code_4 = $.sibling($.child(div_19), 2);
							var text_14 = $.only_child(code_4);

							$.reset(div_19);
							$.template_effect(() => $.set_text(text_14, `%${$.get(result).details.zoneId ?? ''}`));
							$.append($$anchor, div_19);
						};

						$.if(node_20, ($$render) => {
							if ($.get(result).details.zoneId) $$render(consequent_9);
						});
					}

					$.reset(div_13);

					var node_21 = $.sibling(div_13, 2);

					{
						var consequent_10 = ($$anchor) => {
							var div_20 = root_14();
							var ul_2 = $.sibling($.child(div_20), 2);

							$.each(ul_2, 20, () => $.get(result).details.info, (info) => info, ($$anchor, info) => {
								var li_2 = root_13();
								var node_22 = $.child(li_2);

								Icon(node_22, { name: 'info', size: 'xs' });

								var text_15 = $.sibling(node_22);

								$.reset(li_2);
								$.template_effect(() => $.set_text(text_15, ` ${info ?? ''}`));
								$.append($$anchor, li_2);
							});

							$.reset(ul_2);
							$.reset(div_20);
							$.append($$anchor, div_20);
						};

						$.if(node_21, ($$render) => {
							if ($.get(result).details.info && $.get(result).details.info.length > 0) $$render(consequent_10);
						});
					}

					$.reset(div_12);
					$.append($$anchor, div_12);
				};

				var d_1 = $.derived(() => $.get(result).isValid && Object.keys($.get(result).details).length > 0);

				$.if(node_13, ($$render) => {
					if ($.get(d_1)) $$render(consequent_11);
				});
			}

			$.reset(div_5);
			$.reset(section_1);

			$.template_effect(() => {
				$.set_class(div_5, 1, `validation-result ${$.get(result).isValid ? 'valid' : 'invalid'}`, 'svelte-gtgubt');
				$.set_text(text_2, `${$.get(result).isValid ? 'Valid' : 'Invalid'} IP Address`);
			});

			$.append($$anchor, section_1);
		};

		var d_2 = $.derived(() => $.get(result) && $.get(inputValue).trim());

		$.if(node_3, ($$render) => {
			if ($.get(d_2)) $$render(consequent_12);
		});
	}

	$.next(2);
	$.reset(div);

	$.template_effect(() => $.set_class(
		input_1,
		1,
		`ip-input ${$.get(result)?.isValid === true
			? 'valid'
			: $.get(result)?.isValid === false ? 'invalid' : ''}`,
		'svelte-gtgubt'
	));

	$.delegated('input', input_1, handleInput);
	$.bind_value(input_1, () => $.get(inputValue), ($$value) => $.set(inputValue, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['input', 'click']);