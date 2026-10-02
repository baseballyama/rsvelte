import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { useClipboard } from '$lib/composables';

var root = $.from_html(`<button><div class="example-label svelte-wfg8ca"> </div> <code class="example-address svelte-wfg8ca"> </code> <div class="example-description svelte-wfg8ca"> </div></button>`);
var root_1 = $.from_html(`<div class="step-item svelte-wfg8ca"><div class="step-number svelte-wfg8ca"> </div> <div class="step-content svelte-wfg8ca"> </div></div>`);
var root_2 = $.from_html(`<div class="results-header svelte-wfg8ca"><h3 class="svelte-wfg8ca"><!> Teredo Components</h3></div> <div class="address-breakdown svelte-wfg8ca"><div class="breakdown-header svelte-wfg8ca"><h4 class="svelte-wfg8ca">Address Structure</h4> <code class="full-address svelte-wfg8ca"> </code></div> <div class="breakdown-grid svelte-wfg8ca"><div class="breakdown-section prefix svelte-wfg8ca"><div class="section-label svelte-wfg8ca">Prefix</div> <code class="section-value svelte-wfg8ca"> </code> <div class="section-description svelte-wfg8ca">Teredo identifier</div></div> <div class="breakdown-section server svelte-wfg8ca"><div class="section-label svelte-wfg8ca">Server</div> <code class="section-value svelte-wfg8ca"> </code> <div class="section-description svelte-wfg8ca"> </div></div> <div class="breakdown-section flags svelte-wfg8ca"><div class="section-label svelte-wfg8ca">Flags</div> <code class="section-value svelte-wfg8ca"> </code> <div class="section-description svelte-wfg8ca"> </div></div> <div class="breakdown-section port svelte-wfg8ca"><div class="section-label svelte-wfg8ca">Port</div> <code class="section-value svelte-wfg8ca"> </code> <div class="section-description svelte-wfg8ca"> </div></div> <div class="breakdown-section client svelte-wfg8ca"><div class="section-label svelte-wfg8ca">Client</div> <code class="section-value svelte-wfg8ca"> </code> <div class="section-description svelte-wfg8ca"> </div></div></div></div> <div class="components-section svelte-wfg8ca"><h4 class="svelte-wfg8ca"><!> Extracted Components</h4> <div class="components-grid svelte-wfg8ca"><div class="component-card server svelte-wfg8ca"><div class="component-header svelte-wfg8ca"><!> <span class="component-title svelte-wfg8ca">Teredo Server</span></div> <div class="component-content svelte-wfg8ca"><code class="component-value svelte-wfg8ca"> </code> <button><!></button></div> <div class="component-description svelte-wfg8ca">The Teredo relay server handling this tunnel</div></div> <div class="component-card client svelte-wfg8ca"><div class="component-header svelte-wfg8ca"><!> <span class="component-title svelte-wfg8ca">Client IPv4</span></div> <div class="component-content svelte-wfg8ca"><code class="component-value svelte-wfg8ca"> </code> <button><!></button></div> <div class="component-description svelte-wfg8ca">The client's external IPv4 address (XOR decoded)</div></div> <div class="component-card port svelte-wfg8ca"><div class="component-header svelte-wfg8ca"><!> <span class="component-title svelte-wfg8ca">Client Port</span></div> <div class="component-content svelte-wfg8ca"><code class="component-value svelte-wfg8ca"> </code> <button><!></button></div> <div class="component-description svelte-wfg8ca">The client's external port (XOR decoded with FFFF)</div></div> <div class="component-card flags svelte-wfg8ca"><div class="component-header svelte-wfg8ca"><!> <span class="component-title svelte-wfg8ca">NAT Type</span></div> <div class="component-content svelte-wfg8ca"><span> </span></div> <div class="component-description svelte-wfg8ca">Indicates the type of NAT the client is behind</div></div></div></div> <div class="technical-details svelte-wfg8ca"><h4 class="svelte-wfg8ca"><!> Technical Details</h4> <div class="details-grid svelte-wfg8ca"><div class="detail-item svelte-wfg8ca"><span class="detail-label svelte-wfg8ca">Obfuscated Port:</span> <code class="detail-value svelte-wfg8ca"> </code></div> <div class="detail-item svelte-wfg8ca"><span class="detail-label svelte-wfg8ca">Obfuscated Client:</span> <code class="detail-value svelte-wfg8ca"> </code></div> <div class="detail-item svelte-wfg8ca"><span class="detail-label svelte-wfg8ca">Port Calculation:</span> <span class="detail-value svelte-wfg8ca"> </span></div> <div class="detail-item svelte-wfg8ca"><span class="detail-label svelte-wfg8ca">Tunnel Protocol:</span> <span class="detail-value svelte-wfg8ca">IPv6-in-IPv4 via UDP port 3544</span></div></div></div> <div class="card calculation-steps svelte-wfg8ca"><h4 class="svelte-wfg8ca"><!> Parsing Steps</h4> <div class="steps-list svelte-wfg8ca"></div></div>`, 1);
var root_3 = $.from_html(`<div class="error-result svelte-wfg8ca"><!> <h4 class="svelte-wfg8ca">Invalid Teredo Address</h4> <p class="svelte-wfg8ca"> </p> <div class="error-help svelte-wfg8ca"><strong>Valid Teredo addresses:</strong> <ul class="svelte-wfg8ca"><li class="svelte-wfg8ca">Must start with 2001:0000:: (or 2001:: compressed)</li> <li class="svelte-wfg8ca">Example: 2001:0000:4136:e378:8000:63bf:3fff:fdd2</li> <li class="svelte-wfg8ca">Example: 2001::4136:e378:8000:63bf:3fff:fdd2</li></ul></div></div>`);
var root_4 = $.from_html(`<section class="results-section svelte-wfg8ca"><!></section>`);

var root_5 = $.from_html(`<div class="card"><header class="card-header"><h1>IPv6 Teredo Parser</h1> <p>Parse Teredo IPv6 addresses to extract server IPv4, flags, mapped port, and client IPv4</p></header> <section class="overview-section svelte-wfg8ca"><div class="overview-content svelte-wfg8ca"><div class="overview-item svelte-wfg8ca"><!> <div><strong class="svelte-wfg8ca">Teredo Tunneling:</strong> Allows IPv6 connectivity for hosts behind IPv4 NATs by encapsulating IPv6 packets
          in IPv4 UDP.</div></div> <div class="overview-item svelte-wfg8ca"><!> <div><strong class="svelte-wfg8ca">Address Format:</strong> <code class="svelte-wfg8ca">2001:0000:SSSS:SSSS:FFFF:PPPP:CCCC:CCCC</code> where components are encoded
          and obfuscated.</div></div> <div class="overview-item svelte-wfg8ca"><!> <div><strong class="svelte-wfg8ca">Obfuscation:</strong> Client IP and port are XOR'ed to prevent some NATs from interfering with the tunnel.</div></div></div></section> <section class="examples-section svelte-wfg8ca"><details class="examples-details svelte-wfg8ca"><summary class="examples-summary svelte-wfg8ca"><!> <h3 class="svelte-wfg8ca">Quick Examples</h3></summary> <div class="examples-grid svelte-wfg8ca"></div></details></section> <section class="input-section svelte-wfg8ca"><div class="input-group svelte-wfg8ca"><label for="teredo-input" class="svelte-wfg8ca"><!> Teredo IPv6 Address</label> <input id="teredo-input" type="text" placeholder="2001:0000:4136:e378:8000:63bf:3fff:fdd2" spellcheck="false"/> <div class="input-hint svelte-wfg8ca">Enter any Teredo IPv6 address in compressed or full format</div></div></section> <!> <section class="education-section svelte-wfg8ca"><div class="education-grid svelte-wfg8ca"><div class="education-card svelte-wfg8ca"><h4 class="svelte-wfg8ca"><!> What is Teredo?</h4> <p class="svelte-wfg8ca">Teredo is an IPv6 transition technology that allows IPv6 connectivity for hosts located behind IPv4 NATs. It
          tunnels IPv6 packets inside IPv4 UDP datagrams, enabling communication with the IPv6 Internet.</p></div> <div class="education-card svelte-wfg8ca"><h4 class="svelte-wfg8ca"><!> Why Obfuscation?</h4> <p class="svelte-wfg8ca">The client IP and port are XOR'ed with known values to prevent some NAT devices from automatically translating
          these embedded addresses, which would break the Teredo mechanism.</p></div> <div class="education-card svelte-wfg8ca"><h4 class="svelte-wfg8ca"><!> NAT Detection</h4> <p class="svelte-wfg8ca">The flags field indicates whether the client is behind a cone NAT (more permissive) or restricted NAT (more
          restrictive), which affects how the tunnel operates and performs.</p></div> <div class="education-card svelte-wfg8ca"><h4 class="svelte-wfg8ca"><!> Legacy Technology</h4> <p class="svelte-wfg8ca">Teredo was important during IPv6 transition but is less common today. Modern systems prefer native IPv6 or
          other transition mechanisms like 6to4 or NAT64.</p></div></div></section></div>`);

export default function IPv6Teredo($$anchor, $$props) {
	$.push($$props, true);

	let input = $.state('2001:0000:4136:e378:8000:63bf:3fff:fdd2');
	let result = $.state(null);
	const clipboard = useClipboard();
	let selectedExample = $.state(null);
	let _userModified = $.state(false);

	const examples = [
		{
			label: 'Microsoft Teredo',
			address: '2001:0000:4136:e378:8000:63bf:3fff:fdd2',
			description: 'Microsoft Teredo server example'
		},

		{
			label: 'Compressed Form',
			address: '2001::4136:e378:8000:63bf:3fff:fdd2',
			description: 'Same address in compressed format'
		},

		{
			label: 'Behind NAT (Cone)',
			address: '2001:0000:5ef5:79fb:0000:5efe:c0a8:0101',
			description: 'Client behind cone NAT'
		},

		{
			label: 'Direct Connection',
			address: '2001:0000:4136:e378:ffff:ffff:ffff:ffff',
			description: 'Direct connection without NAT'
		}
	];

	function loadExample(example) {
		$.set(input, example.address, true);
		$.set(selectedExample, example.label, true);
		$.set(_userModified, false);
		parseTeredo();
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

	function isValidIPv6(address) {
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

	function isTeredo(address) {
		const expanded = expandIPv6(address);
		const groups = expanded.split(':');

		// Teredo prefix is 2001:0000::/32
		return groups[0].toLowerCase() === '2001' && groups[1] === '0000';
	}

	function hexToIPv4(hex) {
		// Convert 4-character hex groups to IPv4
		const group1 = hex.substring(0, 4);

		const group2 = hex.substring(4, 8);
		const byte1 = parseInt(group1.substring(0, 2), 16);
		const byte2 = parseInt(group1.substring(2, 4), 16);
		const byte3 = parseInt(group2.substring(0, 2), 16);
		const byte4 = parseInt(group2.substring(2, 4), 16);

		return `${byte1}.${byte2}.${byte3}.${byte4}`;
	}

	function parseFlags(flagsHex) {
		const flags = parseInt(flagsHex, 16);
		const cone = (flags & 0x8000) === 0x8000; // Check if bit 15 is set
		const flagBits = [];

		if (cone) flagBits.push('Cone NAT');
		if (flags & 0x4000) flagBits.push('Reserved bit 14');
		if (flags & 0x2000) flagBits.push('Reserved bit 13');
		if (flags & 0x1000) flagBits.push('Reserved bit 12');

		const flagsString = flagBits.length > 0 ? flagBits.join(', ') : 'No flags set';

		return { cone, flagsString };
	}

	function parsePort(portHex) {
		const obfuscatedPort = parseInt(portHex, 16);

		// XOR with 0xFFFF to get the actual port
		return obfuscatedPort ^ 0xffff;
	}

	function parseClientIPv4(ipHex) {
		// Client IPv4 is XOR'd with 0xFFFFFFFF
		const obfuscated = parseInt(ipHex, 16);

		const actual = (obfuscated ^ 0xffffffff) >>> 0; // Unsigned 32-bit

		return [
			actual >>> 24 & 0xff,
			actual >>> 16 & 0xff,
			actual >>> 8 & 0xff,
			actual & 0xff
		].join('.');
	}

	function parseTeredo() {
		if (!$.get(input).trim()) {
			$.set(result, null);

			return;
		}

		try {
			const trimmed = $.get(input).trim();

			// Basic format validation
			if (!trimmed.includes(':')) {
				throw new Error('IPv6 addresses must contain colons (:)');
			}

			// Validate IPv6 format
			if (!isValidIPv6(trimmed)) {
				throw new Error('Invalid IPv6 address format');
			}

			// Check if it's a Teredo address
			if (!isTeredo(trimmed)) {
				throw new Error('This is not a Teredo address. Teredo addresses must start with 2001:0000::/32 (2001::)');
			}

			const fullAddress = expandIPv6(trimmed);
			const groups = fullAddress.split(':');

			// Parse Teredo components according to RFC 4380
			// Format: 2001:0000:SSSS:SSSS:FFFF:PPPP:CCCC:CCCC
			// Where:
			// - 2001:0000 = Teredo prefix
			// - SSSS:SSSS = Teredo server IPv4 address
			// - FFFF = Flags
			// - PPPP = Obfuscated client port
			// - CCCC:CCCC = Obfuscated client IPv4 address
			const prefix = `${groups[0]}:${groups[1]}`;

			const serverHex = groups[2] + groups[3];
			const serverIPv4 = hexToIPv4(serverHex);
			const flagsHex = groups[4];
			const { cone, flagsString } = parseFlags(flagsHex);
			const portHex = groups[5];
			const clientPort = parsePort(portHex);
			const clientHex = groups[6] + groups[7];
			const clientIPv4 = parseClientIPv4(clientHex);

			const explanation = [
				`1. Teredo prefix: ${prefix} (identifies this as a Teredo tunnel)`,
				`2. Server IPv4: ${groups[2]}:${groups[3]} → ${serverIPv4}`,
				`3. Flags: ${flagsHex} → ${flagsString}`,
				`4. Client port: ${portHex} XOR FFFF → ${clientPort}`,
				`5. Client IPv4: ${groups[6]}:${groups[7]} XOR FFFFFFFF → ${clientIPv4}`
			];

			$.set(
				result,
				{
					success: true,
					originalAddress: trimmed,
					components: {
						prefix,
						serverIPv4,
						flags: flagsString,
						clientPort,
						clientIPv4,
						cone,
						clientPortObfuscated: portHex,
						clientIPv4Obfuscated: groups[6] + ':' + groups[7]
					},
					details: { fullAddress, addressGroups: groups, explanation }
				},
				true
			);
		} catch(error) {
			$.set(
				result,
				{
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error occurred',
					originalAddress: $.get(input),
					components: {
						prefix: '',
						serverIPv4: '',
						flags: '',
						clientPort: 0,
						clientIPv4: '',
						cone: false,
						clientPortObfuscated: '',
						clientIPv4Obfuscated: ''
					},
					details: { fullAddress: '', addressGroups: [], explanation: [] }
				},
				true
			);
		}
	}

	function handleInputChange() {
		$.set(_userModified, true);
		$.set(selectedExample, null);
		parseTeredo();
	}

	// Parse on component load
	parseTeredo();

	var div = root_5();
	var section = $.sibling($.child(div), 2);
	var div_1 = $.child(section);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	Icon(node, { name: 'tunnel', size: 'sm' });
	$.next(2);
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_1 = $.child(div_3);

	Icon(node_1, { name: 'globe', size: 'sm' });
	$.next(2);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_2 = $.child(div_4);

	Icon(node_2, { name: 'shield', size: 'sm' });
	$.next(2);
	$.reset(div_4);
	$.reset(div_1);
	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var details = $.child(section_1);
	var summary = $.child(details);
	var node_3 = $.child(summary);

	Icon(node_3, { name: 'chevron-right', size: 'sm' });
	$.next(2);
	$.reset(summary);

	var div_5 = $.sibling(summary, 2);

	$.each(div_5, 21, () => examples, (example) => example.label, ($$anchor, example) => {
		var button = root();
		var div_6 = $.child(button);
		var text = $.only_child(div_6, true);
		var code = $.sibling(div_6, 2);
		var text_1 = $.only_child(code, true);
		var div_7 = $.sibling(code, 2);
		var text_2 = $.only_child(div_7, true);

		$.reset(button);

		$.template_effect(() => {
			$.set_class(button, 1, `example-card ${$.get(selectedExample) === $.get(example).label ? 'active' : ''}`, 'svelte-wfg8ca');
			$.set_text(text, $.get(example).label);
			$.set_text(text_1, $.get(example).address);
			$.set_text(text_2, $.get(example).description);
		});

		$.delegated('click', button, () => loadExample($.get(example)));
		$.append($$anchor, button);
	});

	$.reset(div_5);
	$.reset(details);
	$.reset(section_1);

	var section_2 = $.sibling(section_1, 2);
	var div_8 = $.child(section_2);
	var label = $.child(div_8);
	var node_4 = $.child(label);

	Icon(node_4, { name: 'tunnel', size: 'sm' });
	$.next();
	$.reset(label);
	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter a Teredo IPv6 address starting with 2001:0000:: (or 2001::) to parse its components');

	var input_1 = $.sibling(label, 2);

	$.remove_input_defaults(input_1);
	$.next(2);
	$.reset(div_8);
	$.reset(section_2);

	var node_5 = $.sibling(section_2, 2);

	{
		var consequent_1 = ($$anchor) => {
			var section_3 = root_4();
			var node_6 = $.child(section_3);

			{
				var consequent = ($$anchor) => {
					var fragment = root_2();
					var div_9 = $.first_child(fragment);
					var h3 = $.child(div_9);
					var node_7 = $.child(h3);

					Icon(node_7, { name: 'check-circle', size: 'sm' });
					$.next();
					$.reset(h3);
					$.reset(div_9);

					var div_10 = $.sibling(div_9, 2);
					var div_11 = $.child(div_10);
					var code_1 = $.sibling($.child(div_11), 2);
					var text_3 = $.only_child(code_1, true);

					$.reset(div_11);

					var div_12 = $.sibling(div_11, 2);
					var div_13 = $.child(div_12);
					var code_2 = $.sibling($.child(div_13), 2);
					var text_4 = $.only_child(code_2, true);

					$.next(2);
					$.reset(div_13);

					var div_14 = $.sibling(div_13, 2);
					var code_3 = $.sibling($.child(div_14), 2);
					var text_5 = $.only_child(code_3);
					var div_15 = $.sibling(code_3, 2);
					var text_6 = $.only_child(div_15);

					$.reset(div_14);

					var div_16 = $.sibling(div_14, 2);
					var code_4 = $.sibling($.child(div_16), 2);
					var text_7 = $.only_child(code_4, true);
					var div_17 = $.sibling(code_4, 2);
					var text_8 = $.only_child(div_17, true);

					$.reset(div_16);

					var div_18 = $.sibling(div_16, 2);
					var code_5 = $.sibling($.child(div_18), 2);
					var text_9 = $.only_child(code_5, true);
					var div_19 = $.sibling(code_5, 2);
					var text_10 = $.only_child(div_19);

					$.reset(div_18);

					var div_20 = $.sibling(div_18, 2);
					var code_6 = $.sibling($.child(div_20), 2);
					var text_11 = $.only_child(code_6);
					var div_21 = $.sibling(code_6, 2);
					var text_12 = $.only_child(div_21);

					$.reset(div_20);
					$.reset(div_12);
					$.reset(div_10);

					var div_22 = $.sibling(div_10, 2);
					var h4 = $.child(div_22);
					var node_8 = $.child(h4);

					Icon(node_8, { name: 'layers', size: 'sm' });
					$.next();
					$.reset(h4);

					var div_23 = $.sibling(h4, 2);
					var div_24 = $.child(div_23);
					var div_25 = $.child(div_24);
					var node_9 = $.child(div_25);

					Icon(node_9, { name: 'server', size: 'sm' });
					$.next(2);
					$.reset(div_25);

					var div_26 = $.sibling(div_25, 2);
					var code_7 = $.child(div_26);
					var text_13 = $.only_child(code_7, true);
					var button_1 = $.sibling(code_7, 2);
					var node_10 = $.child(button_1);

					{
						let $0 = $.derived(() => clipboard.isCopied('server') ? 'check' : 'copy');

						Icon(node_10, {
							get name() {
								return $.get($0);
							},
							size: 'sm'
						});
					}

					$.reset(button_1);
					$.reset(div_26);
					$.next(2);
					$.reset(div_24);

					var div_27 = $.sibling(div_24, 2);
					var div_28 = $.child(div_27);
					var node_11 = $.child(div_28);

					Icon(node_11, { name: 'user', size: 'sm' });
					$.next(2);
					$.reset(div_28);

					var div_29 = $.sibling(div_28, 2);
					var code_8 = $.child(div_29);
					var text_14 = $.only_child(code_8, true);
					var button_2 = $.sibling(code_8, 2);
					var node_12 = $.child(button_2);

					{
						let $0 = $.derived(() => clipboard.isCopied('client') ? 'check' : 'copy');

						Icon(node_12, {
							get name() {
								return $.get($0);
							},
							size: 'sm'
						});
					}

					$.reset(button_2);
					$.reset(div_29);
					$.next(2);
					$.reset(div_27);

					var div_30 = $.sibling(div_27, 2);
					var div_31 = $.child(div_30);
					var node_13 = $.child(div_31);

					Icon(node_13, { name: 'hash', size: 'sm' });
					$.next(2);
					$.reset(div_31);

					var div_32 = $.sibling(div_31, 2);
					var code_9 = $.child(div_32);
					var text_15 = $.only_child(code_9, true);
					var button_3 = $.sibling(code_9, 2);
					var node_14 = $.child(button_3);

					{
						let $0 = $.derived(() => clipboard.isCopied('port') ? 'check' : 'copy');

						Icon(node_14, {
							get name() {
								return $.get($0);
							},
							size: 'sm'
						});
					}

					$.reset(button_3);
					$.reset(div_32);
					$.next(2);
					$.reset(div_30);

					var div_33 = $.sibling(div_30, 2);
					var div_34 = $.child(div_33);
					var node_15 = $.child(div_34);

					Icon(node_15, { name: 'flag', size: 'sm' });
					$.next(2);
					$.reset(div_34);

					var div_35 = $.sibling(div_34, 2);
					var span = $.child(div_35);
					var text_16 = $.only_child(span, true);

					$.reset(div_35);
					$.next(2);
					$.reset(div_33);
					$.reset(div_23);
					$.reset(div_22);

					var div_36 = $.sibling(div_22, 2);
					var h4_1 = $.child(div_36);
					var node_16 = $.child(h4_1);

					Icon(node_16, { name: 'settings', size: 'sm' });
					$.next();
					$.reset(h4_1);

					var div_37 = $.sibling(h4_1, 2);
					var div_38 = $.child(div_37);
					var code_10 = $.sibling($.child(div_38), 2);
					var text_17 = $.only_child(code_10, true);

					$.reset(div_38);

					var div_39 = $.sibling(div_38, 2);
					var code_11 = $.sibling($.child(div_39), 2);
					var text_18 = $.only_child(code_11, true);

					$.reset(div_39);

					var div_40 = $.sibling(div_39, 2);
					var span_1 = $.sibling($.child(div_40), 2);
					var text_19 = $.only_child(span_1);

					$.reset(div_40);
					$.next(2);
					$.reset(div_37);
					$.reset(div_36);

					var div_41 = $.sibling(div_36, 2);
					var h4_2 = $.child(div_41);
					var node_17 = $.child(h4_2);

					Icon(node_17, { name: 'list-ordered', size: 'sm' });
					$.next();
					$.reset(h4_2);

					var div_42 = $.sibling(h4_2, 2);

					$.each(div_42, 23, () => $.get(result).details.explanation, (step, index) => `step-${index}`, ($$anchor, step, index) => {
						var div_43 = root_1();
						var div_44 = $.child(div_43);
						var text_20 = $.only_child(div_44, true);
						var div_45 = $.sibling(div_44, 2);
						var text_21 = $.only_child(div_45, true);

						$.reset(div_43);

						$.template_effect(() => {
							$.set_text(text_20, $.get(index) + 1);
							$.set_text(text_21, $.get(step));
						});

						$.append($$anchor, div_43);
					});

					$.reset(div_42);
					$.reset(div_41);

					$.template_effect(
						($0, $1, $2) => {
							$.set_text(text_3, $.get(result).details.fullAddress);
							$.set_text(text_4, $.get(result).components.prefix);
							$.set_text(text_5, `${$.get(result).details.addressGroups[2] ?? ''}:${$.get(result).details.addressGroups[3] ?? ''}`);
							$.set_text(text_6, `IPv4: ${$.get(result).components.serverIPv4 ?? ''}`);
							$.set_text(text_7, $.get(result).details.addressGroups[4]);
							$.set_text(text_8, $.get(result).components.flags);
							$.set_text(text_9, $.get(result).details.addressGroups[5]);
							$.set_text(text_10, `Actual: ${$.get(result).components.clientPort ?? ''}`);
							$.set_text(text_11, `${$.get(result).details.addressGroups[6] ?? ''}:${$.get(result).details.addressGroups[7] ?? ''}`);
							$.set_text(text_12, `IPv4: ${$.get(result).components.clientIPv4 ?? ''}`);
							$.set_text(text_13, $.get(result).components.serverIPv4);
							$.set_class(button_1, 1, `copy-button ${$0 ?? ''}`, 'svelte-wfg8ca');
							$.set_text(text_14, $.get(result).components.clientIPv4);
							$.set_class(button_2, 1, `copy-button ${$1 ?? ''}`, 'svelte-wfg8ca');
							$.set_text(text_15, $.get(result).components.clientPort);
							$.set_class(button_3, 1, `copy-button ${$2 ?? ''}`, 'svelte-wfg8ca');
							$.set_class(span, 1, `component-value ${$.get(result).components.cone ? 'cone' : 'restricted'}`, 'svelte-wfg8ca');
							$.set_text(text_16, $.get(result).components.cone ? 'Cone NAT' : 'Restricted NAT');
							$.set_text(text_17, $.get(result).components.clientPortObfuscated);
							$.set_text(text_18, $.get(result).components.clientIPv4Obfuscated);
							$.set_text(text_19, `${$.get(result).components.clientPortObfuscated ?? ''} XOR FFFF = ${$.get(result).components.clientPort ?? ''}`);
						},
						[
							() => clipboard.isCopied('server') ? 'copied' : '',
							() => clipboard.isCopied('client') ? 'copied' : '',
							() => clipboard.isCopied('port') ? 'copied' : ''
						]
					);

					$.delegated('click', button_1, () => $.get(result) && clipboard.copy($.get(result).components.serverIPv4, 'server'));
					$.delegated('click', button_2, () => $.get(result) && clipboard.copy($.get(result).components.clientIPv4, 'client'));
					$.delegated('click', button_3, () => $.get(result) && clipboard.copy($.get(result).components.clientPort.toString(), 'port'));
					$.append($$anchor, fragment);
				};

				var alternate = ($$anchor) => {
					var div_46 = root_3();
					var node_18 = $.child(div_46);

					Icon(node_18, { name: 'alert-triangle', size: 'lg' });

					var p = $.sibling(node_18, 4);
					var text_22 = $.only_child(p, true);

					$.next(2);
					$.reset(div_46);
					$.template_effect(() => $.set_text(text_22, $.get(result).error));
					$.append($$anchor, div_46);
				};

				$.if(node_6, ($$render) => {
					if ($.get(result).success) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(section_3);
			$.append($$anchor, section_3);
		};

		var d = $.derived(() => $.get(result) && $.get(input).trim());

		$.if(node_5, ($$render) => {
			if ($.get(d)) $$render(consequent_1);
		});
	}

	var section_4 = $.sibling(node_5, 2);
	var div_47 = $.child(section_4);
	var div_48 = $.child(div_47);
	var h4_3 = $.child(div_48);
	var node_19 = $.child(h4_3);

	Icon(node_19, { name: 'book-open', size: 'sm' });
	$.next();
	$.reset(h4_3);
	$.next(2);
	$.reset(div_48);

	var div_49 = $.sibling(div_48, 2);
	var h4_4 = $.child(div_49);
	var node_20 = $.child(h4_4);

	Icon(node_20, { name: 'lock', size: 'sm' });
	$.next();
	$.reset(h4_4);
	$.next(2);
	$.reset(div_49);

	var div_50 = $.sibling(div_49, 2);
	var h4_5 = $.child(div_50);
	var node_21 = $.child(h4_5);

	Icon(node_21, { name: 'network', size: 'sm' });
	$.next();
	$.reset(h4_5);
	$.next(2);
	$.reset(div_50);

	var div_51 = $.sibling(div_50, 2);
	var h4_6 = $.child(div_51);
	var node_22 = $.child(h4_6);

	Icon(node_22, { name: 'clock', size: 'sm' });
	$.next();
	$.reset(h4_6);
	$.next(2);
	$.reset(div_51);
	$.reset(div_47);
	$.reset(section_4);
	$.reset(div);

	$.template_effect(() => $.set_class(
		input_1,
		1,
		`teredo-input ${$.get(result)?.success === true
			? 'valid'
			: $.get(result)?.success === false ? 'invalid' : ''}`,
		'svelte-wfg8ca'
	));

	$.delegated('input', input_1, handleInputChange);
	$.bind_value(input_1, () => $.get(input), ($$value) => $.set(input, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'input']);