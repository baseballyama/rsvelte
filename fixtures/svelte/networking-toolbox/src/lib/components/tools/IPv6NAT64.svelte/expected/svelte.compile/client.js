import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { useClipboard } from '$lib/composables';

var root = $.from_html(`<button><div class="example-header svelte-19zaegq"><div class="example-label svelte-19zaegq"> </div> <div> </div></div> <code class="example-address svelte-19zaegq"> </code> <code class="example-prefix svelte-19zaegq"> </code> <div class="example-description svelte-19zaegq"> </div></button>`);
var root_1 = $.from_html(`<div class="step-item svelte-19zaegq"><div class="step-number svelte-19zaegq"> </div> <div class="step-content svelte-19zaegq"> </div></div>`);
var root_2 = $.from_html(`<div class="results-header svelte-19zaegq"><h3 class="svelte-19zaegq"><!> Translation Result</h3></div> <div class="translation-summary svelte-19zaegq"><div class="translation-flow svelte-19zaegq"><div class="translation-step input svelte-19zaegq"><div class="step-label svelte-19zaegq"> </div> <code class="step-value svelte-19zaegq"> </code></div> <div class="translation-arrow svelte-19zaegq"><!></div> <div class="translation-step output svelte-19zaegq"><div class="step-label svelte-19zaegq"> </div> <div class="step-content svelte-19zaegq"><code class="step-value svelte-19zaegq"> </code> <button><!></button></div></div></div> <div class="prefix-info svelte-19zaegq"><span class="prefix-label svelte-19zaegq">Using prefix:</span> <code class="prefix-value svelte-19zaegq"> </code></div></div> <div class="technical-details svelte-19zaegq"><h4 class="svelte-19zaegq"><!> Technical Details</h4> <div class="details-grid svelte-19zaegq"><div class="detail-item svelte-19zaegq"><span class="detail-label svelte-19zaegq">IPv4 Hex Representation:</span> <code class="detail-value svelte-19zaegq"> </code></div> <div class="detail-item svelte-19zaegq"><span class="detail-label svelte-19zaegq">Prefix Length:</span> <span class="detail-value svelte-19zaegq"> </span></div> <div class="detail-item svelte-19zaegq"><span class="detail-label svelte-19zaegq">Translation Method:</span> <span class="detail-value svelte-19zaegq">NAT64 (RFC 6052)</span></div> <div class="detail-item svelte-19zaegq"><span class="detail-label svelte-19zaegq">Address Family:</span> <span class="detail-value svelte-19zaegq"> </span></div></div></div> <div class="explanation-steps svelte-19zaegq"><h4 class="svelte-19zaegq"><!> Translation Steps</h4> <div class="steps-list svelte-19zaegq"></div></div>`, 1);
var root_3 = $.from_html(`<div class="error-result svelte-19zaegq"><!> <h4 class="svelte-19zaegq">Translation Error</h4> <p class="svelte-19zaegq"> </p> <div class="error-help svelte-19zaegq"><strong>Requirements:</strong> <ul class="svelte-19zaegq"><li class="svelte-19zaegq">For IPv4→IPv6: Valid IPv4 address (e.g., 192.168.1.1)</li> <li class="svelte-19zaegq">For IPv6→IPv4: Valid NAT64 IPv6 address matching the prefix</li> <li class="svelte-19zaegq">NAT64 prefix must be /96 (e.g., 64:ff9b::/96)</li> <li class="svelte-19zaegq">IPv6 address must contain the embedded IPv4 in last 32 bits</li></ul></div></div>`);
var root_4 = $.from_html(`<div class="card results-card svelte-19zaegq"><!></div>`);

var root_5 = $.from_html(`<div class="card"><header class="card-header"><h1>IPv6 NAT64 Translator</h1> <p>Translate between IPv4 and IPv6 addresses using NAT64 prefix mechanism</p></header> <div class="card info-card svelte-19zaegq"><div class="overview-content svelte-19zaegq"><div class="overview-item svelte-19zaegq"><!> <div><strong class="svelte-19zaegq">NAT64 Translation:</strong> Stateless mechanism to embed IPv4 addresses within IPv6 using a /96 prefix.</div></div> <div class="overview-item svelte-19zaegq"><!> <div><strong class="svelte-19zaegq">Well-Known Prefix:</strong> <code class="svelte-19zaegq">64:ff9b::/96</code> is the standard prefix defined in RFC 6052 for NAT64
          translation.</div></div> <div class="overview-item svelte-19zaegq"><!> <div><strong class="svelte-19zaegq">Bidirectional:</strong> Convert IPv4→IPv6 for dual-stack communication or extract IPv4 from NAT64 addresses.</div></div></div></div> <div class="card examples-card svelte-19zaegq"><details class="examples-details svelte-19zaegq"><summary class="examples-summary svelte-19zaegq"><!> <h3 class="svelte-19zaegq">Quick Examples</h3></summary> <div class="examples-grid svelte-19zaegq"></div></details></div> <div class="card input-card svelte-19zaegq"><div class="mode-section svelte-19zaegq"><h3 class="mode-label svelte-19zaegq">Conversion Direction</h3> <div class="mode-options svelte-19zaegq"><label class="mode-option svelte-19zaegq"><input type="radio" class="svelte-19zaegq"/> <div class="mode-content svelte-19zaegq"><!> <span>IPv4 → IPv6</span></div></label> <label class="mode-option svelte-19zaegq"><input type="radio" class="svelte-19zaegq"/> <div class="mode-content svelte-19zaegq"><!> <span>IPv6 → IPv4</span></div></label></div></div> <div class="input-group svelte-19zaegq"><label for="address-input" class="svelte-19zaegq"><!> </label> <input id="address-input" type="text" spellcheck="false"/></div> <div class="input-group svelte-19zaegq"><label for="prefix-input" class="svelte-19zaegq"><!> NAT64 Prefix</label> <input id="prefix-input" type="text" placeholder="64:ff9b::/96" class="prefix-input svelte-19zaegq" spellcheck="false"/> <div class="input-hint svelte-19zaegq">Must be a /96 prefix for proper IPv4 embedding</div></div></div> <!> <div class="card education-card svelte-19zaegq"><div class="education-grid svelte-19zaegq"><div class="education-item svelte-19zaegq"><h4 class="svelte-19zaegq"><!> What is NAT64?</h4> <p class="svelte-19zaegq">NAT64 is a stateless IP/ICMP translation mechanism that allows IPv6-only clients to communicate with IPv4-only
          servers. It embeds IPv4 addresses within IPv6 addresses using a /96 prefix.</p></div> <div class="education-item svelte-19zaegq"><h4 class="svelte-19zaegq"><!> Well-Known Prefix</h4> <p class="svelte-19zaegq">RFC 6052 defines <code class="svelte-19zaegq">64:ff9b::/96</code> as the well-known prefix for NAT64 translation. This prefix is reserved
          for this purpose and should not be routed on the global Internet.</p></div> <div class="education-item svelte-19zaegq"><h4 class="svelte-19zaegq"><!> Address Structure</h4> <p class="svelte-19zaegq">NAT64 addresses use 96 bits for the prefix and embed the 32-bit IPv4 address in the remaining bits: <code class="svelte-19zaegq">Prefix::/96 + IPv4(32 bits)</code></p></div> <div class="education-item svelte-19zaegq"><h4 class="svelte-19zaegq"><!> Use Cases</h4> <p class="svelte-19zaegq">Common in IPv6 transition scenarios, dual-stack networks, and environments where IPv6-only clients need to
          access legacy IPv4 services through translation gateways.</p></div></div></div></div>`);

export default function IPv6NAT64($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	let inputAddress = $.state('192.168.1.100');
	let customPrefix = $.state('64:ff9b::/96');
	let conversionMode = $.state('ipv4-to-ipv6');
	let result = $.state(null);
	const clipboard = useClipboard();
	let selectedExample = $.state(null);
	let _userModified = $.state(false);

	const examples = [
		{
			label: 'Standard IPv4',
			address: '192.168.1.100',
			prefix: '64:ff9b::/96',
			mode: 'ipv4-to-ipv6',
			description: 'Private IPv4 address with default NAT64 prefix'
		},

		{
			label: 'Public IPv4',
			address: '8.8.8.8',
			prefix: '64:ff9b::/96',
			mode: 'ipv4-to-ipv6',
			description: 'Google DNS server with standard prefix'
		},

		{
			label: 'Custom Prefix',
			address: '10.0.0.1',
			prefix: '2001:db8:64::/96',
			mode: 'ipv4-to-ipv6',
			description: 'Documentation prefix for NAT64'
		},

		{
			label: 'IPv6 to IPv4',
			address: '64:ff9b::c0a8:164',
			prefix: '64:ff9b::/96',
			mode: 'ipv6-to-ipv4',
			description: 'Extract IPv4 from NAT64 address'
		}
	];

	function loadExample(example) {
		$.set(inputAddress, example.address, true);
		$.set(customPrefix, example.prefix, true);
		$.set(conversionMode, example.mode, true);
		$.set(selectedExample, example.label, true);
		$.set(_userModified, false);
		translateAddress();
	}

	function expandIPv6(address) {
		// Remove zone ID if present
		const cleanAddress = address.split('%')[0];

		// Handle :: compression
		let expanded = cleanAddress;

		if (cleanAddress.includes('::')) {
			const parts = cleanAddress.split('::');
			const leftParts = parts[0] ? parts[0].split(':') : [];
			const rightParts = parts[1] ? parts[1].split(':') : [];
			const totalParts = leftParts.length + rightParts.length;
			const missingParts = 8 - totalParts;
			const middleParts = Array(missingParts).fill('0000');
			const allParts = [...leftParts, ...middleParts, ...rightParts];

			expanded = allParts.join(':');
		}

		// Pad each group to 4 characters
		return expanded.split(':').map((group) => group.padStart(4, '0')).join(':');
	}

	function compressIPv6(address) {
		// First expand to normalize
		const expanded = expandIPv6(address);

		// Remove leading zeros from each group
		let groups = expanded.split(':').map((group) => group.replace(/^0+/, '') || '0');

		// Find the longest sequence of consecutive '0' groups
		let maxZeroStart = -1;

		let maxZeroLength = 0;
		let currentZeroStart = -1;
		let currentZeroLength = 0;

		for (let i = 0; i < groups.length; i++) {
			if (groups[i] === '0') {
				if (currentZeroStart === -1) {
					currentZeroStart = i;
					currentZeroLength = 1;
				} else {
					currentZeroLength++;
				}
			} else {
				if (currentZeroLength > maxZeroLength) {
					maxZeroStart = currentZeroStart;
					maxZeroLength = currentZeroLength;
				}

				currentZeroStart = -1;
				currentZeroLength = 0;
			}
		}

		// Check the last sequence
		if (currentZeroLength > maxZeroLength) {
			maxZeroStart = currentZeroStart;
			maxZeroLength = currentZeroLength;
		}

		// Replace the longest zero sequence with ::
		if (maxZeroLength > 1) {
			const beforeZeros = groups.slice(0, maxZeroStart);
			const afterZeros = groups.slice(maxZeroStart + maxZeroLength);

			if (beforeZeros.length === 0) {
				return '::' + afterZeros.join(':');
			} else if (afterZeros.length === 0) {
				return beforeZeros.join(':') + '::';
			} else {
				return beforeZeros.join(':') + '::' + afterZeros.join(':');
			}
		}

		return groups.join(':');
	}

	function isValidIPv4(address) {
		const parts = address.split('.');

		if (parts.length !== 4) return false;

		return parts.every((part) => {
			const num = parseInt(part, 10);

			return !isNaN(num) && num >= 0 && num <= 255 && part === num.toString();
		});
	}

	function _isValidIPv6(address) {
		try {
			const expanded = expandIPv6(address);
			const groups = expanded.split(':');

			if (groups.length !== 8) return false;

			for (const group of groups) {
				if (group.length !== 4) return false;
				if (!(/^[0-9a-fA-F]{4}$/).test(group)) return false;
			}

			return true;
		} catch {
			return false;
		}
	}

	function parsePrefix(prefix) {
		const [network, lengthStr] = prefix.split('/');
		const length = parseInt(lengthStr, 10);

		if (!_isValidIPv6(network) || isNaN(length) || length < 0 || length > 128) {
			throw new Error('Invalid IPv6 prefix format');
		}

		return { network, length };
	}

	function ipv4ToNAT64(ipv4, prefix) {
		if (!isValidIPv4(ipv4)) {
			throw new Error('Invalid IPv4 address format');
		}

		const { network, length } = parsePrefix(prefix);

		// NAT64 requires /96 prefix length for standard operation
		if (length !== 96) {
			throw new Error('NAT64 prefix must be /96 for proper IPv4 embedding');
		}

		// Convert IPv4 to hex representation
		const parts = ipv4.split('.').map((part) => parseInt(part, 10));

		const ipv4Hex = parts.map((part) => part.toString(16).padStart(2, '0')).join('');

		// Get the first 96 bits (6 groups) from the prefix
		const expandedPrefix = expandIPv6(network);

		const prefixGroups = expandedPrefix.split(':').slice(0, 6);

		// Embed IPv4 in last 32 bits (2 groups)
		const ipv4Group1 = ipv4Hex.substring(0, 4);

		const ipv4Group2 = ipv4Hex.substring(4, 8);
		const nat64Groups = [...prefixGroups, ipv4Group1, ipv4Group2];
		const nat64Address = nat64Groups.join(':');
		const compressedAddress = compressIPv6(nat64Address);

		const explanation = [
			`1. IPv4 address: ${ipv4}`,
			`2. Convert to hex: ${parts.map((p, _i) => `${p} → ${p.toString(16).padStart(2, '0')}`).join(', ')}`,
			`3. IPv4 as hex: ${ipv4Hex} (${ipv4Group1}:${ipv4Group2})`,
			`4. NAT64 prefix: ${prefix} → first 96 bits`,
			`5. Combine: ${network.split(':').slice(0, 6).join(':')}:${ipv4Group1}:${ipv4Group2}`,
			`6. Compressed: ${compressedAddress}`
		];

		return {
			ipv6: compressedAddress,
			prefixUsed: prefix,
			prefixLength: length,
			ipv4Hex,
			explanation
		};
	}

	function nat64ToIPv4(ipv6, expectedPrefix) {
		if (!_isValidIPv6(ipv6)) {
			throw new Error('Invalid IPv6 address format');
		}

		const { network, length } = parsePrefix(expectedPrefix);

		if (length !== 96) {
			throw new Error('NAT64 prefix must be /96 for proper IPv4 extraction');
		}

		const expandedIPv6 = expandIPv6(ipv6);
		const expandedPrefix = expandIPv6(network);
		const ipv6Groups = expandedIPv6.split(':');
		const prefixGroups = expandedPrefix.split(':').slice(0, 6);

		// Check if the IPv6 address matches the expected prefix
		for (let i = 0; i < 6; i++) {
			if (ipv6Groups[i] !== prefixGroups[i]) {
				throw new Error(`IPv6 address does not match the expected NAT64 prefix ${expectedPrefix}`);
			}
		}

		// Extract IPv4 from the last 32 bits
		const ipv4Group1 = ipv6Groups[6];

		const ipv4Group2 = ipv6Groups[7];
		const ipv4Hex = ipv4Group1 + ipv4Group2;

		// Convert hex back to IPv4
		const byte1 = parseInt(ipv4Hex.substring(0, 2), 16);

		const byte2 = parseInt(ipv4Hex.substring(2, 4), 16);
		const byte3 = parseInt(ipv4Hex.substring(4, 6), 16);
		const byte4 = parseInt(ipv4Hex.substring(6, 8), 16);
		const ipv4 = `${byte1}.${byte2}.${byte3}.${byte4}`;

		const explanation = [
			`1. IPv6 address: ${ipv6}`,
			`2. Expanded: ${expandedIPv6}`,
			`3. Expected prefix: ${expectedPrefix}`,
			`4. Verify prefix match: ✓ First 96 bits match`,
			`5. Extract IPv4 hex: ${ipv4Group1}:${ipv4Group2} → ${ipv4Hex}`,
			`6. Convert to IPv4: ${ipv4Hex} → ${byte1}.${byte2}.${byte3}.${byte4}`
		];

		return {
			ipv4,
			prefixUsed: expectedPrefix,
			prefixLength: length,
			ipv4Hex,
			explanation
		};
	}

	function autoDetectInputType(input) {
		if (input.includes(':')) {
			return _isValidIPv6(input) ? 'ipv6' : 'unknown';
		} else if (input.includes('.')) {
			return isValidIPv4(input) ? 'ipv4' : 'unknown';
		}

		return 'unknown';
	}

	function translateAddress() {
		if (!$.get(inputAddress).trim()) {
			$.set(result, null);

			return;
		}

		try {
			const trimmedInput = $.get(inputAddress).trim();
			const trimmedPrefix = $.get(customPrefix).trim();

			// Auto-detect input type if not manually set
			const detectedType = autoDetectInputType(trimmedInput);

			if (detectedType === 'unknown') {
				throw new Error('Invalid IP address format. Please enter a valid IPv4 or IPv6 address.');
			}

			let translationResult;
			let inputType;

			if ($.get(conversionMode) === 'ipv4-to-ipv6') {
				if (detectedType !== 'ipv4') {
					throw new Error('IPv4 to IPv6 mode requires an IPv4 address as input.');
				}

				translationResult = ipv4ToNAT64(trimmedInput, trimmedPrefix);
				inputType = 'ipv4';

				$.set(
					result,
					{
						success: true,
						originalAddress: trimmedInput,
						translatedAddress: translationResult.ipv6,
						prefix: trimmedPrefix,
						details: {
							inputType,
							prefixUsed: translationResult.prefixUsed,
							prefixLength: translationResult.prefixLength,
							ipv4Hex: translationResult.ipv4Hex,
							explanation: translationResult.explanation
						}
					},
					true
				);
			} else {
				if (detectedType !== 'ipv6') {
					throw new Error('IPv6 to IPv4 mode requires an IPv6 address as input.');
				}

				translationResult = nat64ToIPv4(trimmedInput, trimmedPrefix);
				inputType = 'ipv6';

				$.set(
					result,
					{
						success: true,
						originalAddress: trimmedInput,
						translatedAddress: translationResult.ipv4,
						prefix: trimmedPrefix,
						details: {
							inputType,
							prefixUsed: translationResult.prefixUsed,
							prefixLength: translationResult.prefixLength,
							ipv4Hex: translationResult.ipv4Hex,
							explanation: translationResult.explanation
						}
					},
					true
				);
			}
		} catch(error) {
			$.set(
				result,
				{
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error occurred',
					originalAddress: $.get(inputAddress),
					translatedAddress: '',
					prefix: $.get(customPrefix),
					details: {
						inputType: autoDetectInputType($.get(inputAddress)),
						prefixUsed: '',
						prefixLength: 0,
						ipv4Hex: '',
						explanation: []
					}
				},
				true
			);
		}
	}

	function handleInputChange() {
		$.set(_userModified, true);
		$.set(selectedExample, null);
		translateAddress();
	}

	function handleModeChange() {
		$.set(_userModified, true);
		$.set(selectedExample, null);
		translateAddress();
	}

	// Translate on component load
	translateAddress();

	var div = root_5();
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	Icon(node, { name: 'shuffle', size: 'sm' });
	$.next(2);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_1 = $.child(div_4);

	Icon(node_1, { name: 'globe', size: 'sm' });
	$.next(2);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_2 = $.child(div_5);

	Icon(node_2, { name: 'network', size: 'sm' });
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

	$.each(div_7, 21, () => examples, (example) => example.label, ($$anchor, example) => {
		var button = root();
		var div_8 = $.child(button);
		var div_9 = $.child(div_8);
		var text = $.only_child(div_9, true);
		var div_10 = $.sibling(div_9, 2);
		var text_1 = $.only_child(div_10, true);

		$.reset(div_8);

		var code = $.sibling(div_8, 2);
		var text_2 = $.only_child(code, true);
		var code_1 = $.sibling(code, 2);
		var text_3 = $.only_child(code_1, true);
		var div_11 = $.sibling(code_1, 2);
		var text_4 = $.only_child(div_11, true);

		$.reset(button);

		$.template_effect(() => {
			$.set_class(button, 1, `example-card ${$.get(selectedExample) === $.get(example).label ? 'active' : ''}`, 'svelte-19zaegq');
			$.set_text(text, $.get(example).label);
			$.set_class(div_10, 1, `example-mode ${$.get(example).mode ?? ''}`, 'svelte-19zaegq');
			$.set_text(text_1, $.get(example).mode === 'ipv4-to-ipv6' ? '→ IPv6' : '→ IPv4');
			$.set_text(text_2, $.get(example).address);
			$.set_text(text_3, $.get(example).prefix);
			$.set_text(text_4, $.get(example).description);
		});

		$.delegated('click', button, () => loadExample($.get(example)));
		$.append($$anchor, button);
	});

	$.reset(div_7);
	$.reset(details);
	$.reset(div_6);

	var div_12 = $.sibling(div_6, 2);
	var div_13 = $.child(div_12);
	var div_14 = $.sibling($.child(div_13), 2);
	var label = $.child(div_14);
	var input_1 = $.child(label);

	$.remove_input_defaults(input_1);
	input_1.value = input_1.__value = 'ipv4-to-ipv6';

	var div_15 = $.sibling(input_1, 2);
	var node_4 = $.child(div_15);

	Icon(node_4, { name: 'arrow-right', size: 'sm' });
	$.next(2);
	$.reset(div_15);
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_2 = $.child(label_1);

	$.remove_input_defaults(input_2);
	input_2.value = input_2.__value = 'ipv6-to-ipv4';

	var div_16 = $.sibling(input_2, 2);
	var node_5 = $.child(div_16);

	Icon(node_5, { name: 'arrow-left', size: 'sm' });
	$.next(2);
	$.reset(div_16);
	$.reset(label_1);
	$.reset(div_14);
	$.reset(div_13);

	var div_17 = $.sibling(div_13, 2);
	var label_2 = $.child(div_17);
	var node_6 = $.child(label_2);

	{
		let $0 = $.derived(() => $.get(conversionMode) === 'ipv4-to-ipv6' ? 'globe' : 'globe');

		Icon(node_6, {
			get name() {
				return $.get($0);
			},
			size: 'sm'
		});
	}

	var text_5 = $.sibling(node_6);

	$.reset(label_2);

	$.action(label_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => $.get(conversionMode) === 'ipv4-to-ipv6'
		? 'Enter an IPv4 address to convert to NAT64 IPv6 format'
		: 'Enter a NAT64 IPv6 address to extract the embedded IPv4');

	var input_3 = $.sibling(label_2, 2);

	$.remove_input_defaults(input_3);
	$.reset(div_17);

	var div_18 = $.sibling(div_17, 2);
	var label_3 = $.child(div_18);
	var node_7 = $.child(label_3);

	Icon(node_7, { name: 'hash', size: 'sm' });
	$.next();
	$.reset(label_3);
	$.action(label_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'NAT64 prefix must be /96. Default is 64:ff9b::/96 (RFC 6052 well-known prefix)');

	var input_4 = $.sibling(label_3, 2);

	$.remove_input_defaults(input_4);
	$.next(2);
	$.reset(div_18);
	$.reset(div_12);

	var node_8 = $.sibling(div_12, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_19 = root_4();
			var node_9 = $.child(div_19);

			{
				var consequent = ($$anchor) => {
					var fragment = root_2();
					var div_20 = $.first_child(fragment);
					var h3 = $.child(div_20);
					var node_10 = $.child(h3);

					Icon(node_10, { name: 'check-circle', size: 'sm' });
					$.next();
					$.reset(h3);
					$.reset(div_20);

					var div_21 = $.sibling(div_20, 2);
					var div_22 = $.child(div_21);
					var div_23 = $.child(div_22);
					var div_24 = $.child(div_23);
					var text_6 = $.only_child(div_24);
					var code_2 = $.sibling(div_24, 2);
					var text_7 = $.only_child(code_2, true);

					$.reset(div_23);

					var div_25 = $.sibling(div_23, 2);
					var node_11 = $.child(div_25);

					Icon(node_11, { name: 'arrow-right', size: 'lg' });
					$.reset(div_25);

					var div_26 = $.sibling(div_25, 2);
					var div_27 = $.child(div_26);
					var text_8 = $.only_child(div_27);
					var div_28 = $.sibling(div_27, 2);
					var code_3 = $.child(div_28);
					var text_9 = $.only_child(code_3, true);
					var button_1 = $.sibling(code_3, 2);
					var node_12 = $.child(button_1);

					{
						let $0 = $.derived(() => clipboard.isCopied('result') ? 'check' : 'copy');

						Icon(node_12, {
							get name() {
								return $.get($0);
							},
							size: 'sm'
						});
					}

					$.reset(button_1);
					$.reset(div_28);
					$.reset(div_26);
					$.reset(div_22);

					var div_29 = $.sibling(div_22, 2);
					var code_4 = $.sibling($.child(div_29), 2);
					var text_10 = $.only_child(code_4, true);

					$.reset(div_29);
					$.reset(div_21);

					var div_30 = $.sibling(div_21, 2);
					var h4 = $.child(div_30);
					var node_13 = $.child(h4);

					Icon(node_13, { name: 'settings', size: 'sm' });
					$.next();
					$.reset(h4);

					var div_31 = $.sibling(h4, 2);
					var div_32 = $.child(div_31);
					var code_5 = $.sibling($.child(div_32), 2);
					var text_11 = $.only_child(code_5, true);

					$.reset(div_32);

					var div_33 = $.sibling(div_32, 2);
					var span = $.sibling($.child(div_33), 2);
					var text_12 = $.only_child(span);

					$.reset(div_33);

					var div_34 = $.sibling(div_33, 4);
					var span_1 = $.sibling($.child(div_34), 2);
					var text_13 = $.only_child(span_1, true);

					$.reset(div_34);
					$.reset(div_31);
					$.reset(div_30);

					var div_35 = $.sibling(div_30, 2);
					var h4_1 = $.child(div_35);
					var node_14 = $.child(h4_1);

					Icon(node_14, { name: 'list-ordered', size: 'sm' });
					$.next();
					$.reset(h4_1);

					var div_36 = $.sibling(h4_1, 2);

					$.each(div_36, 23, () => $.get(result).details.explanation, (step, index) => `step-${index}`, ($$anchor, step, index) => {
						var div_37 = root_1();
						var div_38 = $.child(div_37);
						var text_14 = $.only_child(div_38, true);
						var div_39 = $.sibling(div_38, 2);
						var text_15 = $.only_child(div_39, true);

						$.reset(div_37);

						$.template_effect(() => {
							$.set_text(text_14, $.get(index) + 1);
							$.set_text(text_15, $.get(step));
						});

						$.append($$anchor, div_37);
					});

					$.reset(div_36);
					$.reset(div_35);

					$.template_effect(
						($0, $1) => {
							$.set_text(text_6, `Input (${$0 ?? ''})`);
							$.set_text(text_7, $.get(result).originalAddress);
							$.set_text(text_8, `Output (${$.get(result).details.inputType === 'ipv4' ? 'IPv6' : 'IPv4'})`);
							$.set_text(text_9, $.get(result).translatedAddress);
							$.set_class(button_1, 1, `copy-button ${$1 ?? ''}`, 'svelte-19zaegq');
							$.set_text(text_10, $.get(result).details.prefixUsed);
							$.set_text(text_11, $.get(result).details.ipv4Hex);
							$.set_text(text_12, `/${$.get(result).details.prefixLength ?? ''}`);
							$.set_text(text_13, $.get(result).details.inputType === 'ipv4' ? 'IPv4 → IPv6' : 'IPv6 → IPv4');
						},
						[
							() => $.get(result).details.inputType.toUpperCase(),
							() => clipboard.isCopied('result') ? 'copied' : ''
						]
					);

					$.delegated('click', button_1, () => $.get(result) && clipboard.copy($.get(result).translatedAddress, 'result'));
					$.append($$anchor, fragment);
				};

				var alternate = ($$anchor) => {
					var div_40 = root_3();
					var node_15 = $.child(div_40);

					Icon(node_15, { name: 'alert-triangle', size: 'lg' });

					var p_1 = $.sibling(node_15, 4);
					var text_16 = $.only_child(p_1, true);

					$.next(2);
					$.reset(div_40);
					$.template_effect(() => $.set_text(text_16, $.get(result).error));
					$.append($$anchor, div_40);
				};

				$.if(node_9, ($$render) => {
					if ($.get(result).success) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(div_19);
			$.append($$anchor, div_19);
		};

		var d = $.derived(() => $.get(result) && $.get(inputAddress).trim());

		$.if(node_8, ($$render) => {
			if ($.get(d)) $$render(consequent_1);
		});
	}

	var div_41 = $.sibling(node_8, 2);
	var div_42 = $.child(div_41);
	var div_43 = $.child(div_42);
	var h4_2 = $.child(div_43);
	var node_16 = $.child(h4_2);

	Icon(node_16, { name: 'book-open', size: 'sm' });
	$.next();
	$.reset(h4_2);
	$.next(2);
	$.reset(div_43);

	var div_44 = $.sibling(div_43, 2);
	var h4_3 = $.child(div_44);
	var node_17 = $.child(h4_3);

	Icon(node_17, { name: 'shield', size: 'sm' });
	$.next();
	$.reset(h4_3);
	$.next(2);
	$.reset(div_44);

	var div_45 = $.sibling(div_44, 2);
	var h4_4 = $.child(div_45);
	var node_18 = $.child(h4_4);

	Icon(node_18, { name: 'layers', size: 'sm' });
	$.next();
	$.reset(h4_4);
	$.next(2);
	$.reset(div_45);

	var div_46 = $.sibling(div_45, 2);
	var h4_5 = $.child(div_46);
	var node_19 = $.child(h4_5);

	Icon(node_19, { name: 'network', size: 'sm' });
	$.next();
	$.reset(h4_5);
	$.next(2);
	$.reset(div_46);
	$.reset(div_42);
	$.reset(div_41);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text_5, ` ${$.get(conversionMode) === 'ipv4-to-ipv6' ? 'IPv4 Address' : 'NAT64 IPv6 Address'}`);
		$.set_attribute(input_3, 'placeholder', $.get(conversionMode) === 'ipv4-to-ipv6' ? '192.168.1.100' : '64:ff9b::c0a8:164');

		$.set_class(
			input_3,
			1,
			`address-input ${$.get(result)?.success === true
				? 'valid'
				: $.get(result)?.success === false ? 'invalid' : ''}`,
			'svelte-19zaegq'
		);
	});

	$.delegated('change', input_1, handleModeChange);
	$.bind_group(binding_group, [], input_1, () => $.get(conversionMode), ($$value) => $.set(conversionMode, $$value));
	$.delegated('change', input_2, handleModeChange);
	$.bind_group(binding_group, [], input_2, () => $.get(conversionMode), ($$value) => $.set(conversionMode, $$value));
	$.delegated('input', input_3, handleInputChange);
	$.bind_value(input_3, () => $.get(inputAddress), ($$value) => $.set(inputAddress, $$value));
	$.delegated('input', input_4, handleInputChange);
	$.bind_value(input_4, () => $.get(customPrefix), ($$value) => $.set(customPrefix, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'change', 'input']);