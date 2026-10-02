import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	convertIPFormats,
	decimalToIP,
	binaryToIP,
	hexToIP,
	getIPClass
} from '$lib/utils/ip-conversions.js';

import { validateIPv4 } from '$lib/utils/ip-validation.js';
import IPInput from './IPInput.svelte';
import Tooltip from '$lib/components/global/Tooltip.svelte';
import Icon from '../global/Icon.svelte';
import { useClipboard } from '$lib/composables';

var root = $.from_html(`<button type="button" aria-label="Copy binary format to clipboard"><!></button>`);
var root_1 = $.from_html(`<div class="error-message svelte-jmo3rv"> </div>`);
var root_2 = $.from_html(`<button type="button" aria-label="Copy decimal format to clipboard"><!></button>`);
var root_3 = $.from_html(`<button type="button" aria-label="Copy hexadecimal format to clipboard"><!></button>`);
var root_4 = $.from_html(`<button type="button" aria-label="Copy octal format to clipboard"><!></button>`);
var root_5 = $.from_html(`<div class="results-section fade-in svelte-jmo3rv"><section class="info-panel info"><h3 class="svelte-jmo3rv">IP Class Information</h3> <div class="grid grid-3"><div class="class-info svelte-jmo3rv"><span class="info-label">Class</span> <span class="class-value svelte-jmo3rv"> </span></div> <div class="class-info svelte-jmo3rv"><span class="info-label">Type</span> <span class="class-value type svelte-jmo3rv"> </span></div> <div class="class-info svelte-jmo3rv"><span class="info-label">Usage</span> <span class="class-description svelte-jmo3rv"> </span></div></div></section> <div class="grid grid-2 conversions-grid svelte-jmo3rv"><div class="format-group svelte-jmo3rv"><label for="binary-input">Binary Format</label> <div class="format-input svelte-jmo3rv"><input id="binary-input" type="text" placeholder="11000000.10101000.00000001.00000001"/> <!></div> <!></div> <div class="format-group svelte-jmo3rv"><label for="decimal-input">Decimal Format</label> <div class="format-input svelte-jmo3rv"><input id="decimal-input" type="text" placeholder="3232235777"/> <!></div> <!></div> <div class="format-group svelte-jmo3rv"><label for="hex-input">Hexadecimal Format</label> <div class="format-input svelte-jmo3rv"><input id="hex-input" type="text" placeholder="0xC0.0xA8.0x01.0x01"/> <!></div> <!></div> <div class="format-group svelte-jmo3rv"><label for="octal-input">Octal Format</label> <div class="format-input svelte-jmo3rv"><input id="octal-input" type="text" placeholder="0300.0250.001.001" class="format-field octal svelte-jmo3rv" readonly=""/> <!></div></div></div></div>`);
var root_6 = $.from_html(`<div class="card"><header class="card-header"><h2>IP Address Converter</h2> <p>Convert IP addresses between different number formats.</p></header> <div class="form-group"><!></div> <!></div> <div class="ip-explanation-docs svelte-jmo3rv"><div class="card svelte-jmo3rv"><h3 class="svelte-jmo3rv"><!> Number Format Explanations</h3> <div class="explainer-content svelte-jmo3rv"><div class="format-explanations svelte-jmo3rv"><div class="format-explanation svelte-jmo3rv"><h4 class="svelte-jmo3rv"><span class="format-badge binary svelte-jmo3rv">Binary (Base-2)</span></h4> <p class="svelte-jmo3rv"><strong>What it is:</strong> Uses only digits 0 and 1, representing how computers internally store IP addresses.</p> <p class="svelte-jmo3rv"><strong>Example:</strong> <code class="svelte-jmo3rv">192.168.1.1 = 11000000.10101000.00000001.00000001</code></p> <p class="svelte-jmo3rv"><strong>Usage:</strong> Low-level networking, subnet calculations, understanding network/host boundaries.</p> <p class="svelte-jmo3rv"><strong>How to read:</strong> Each octet is 8 bits. Binary 11000000 = 128+64 = 192 in decimal.</p></div> <div class="format-explanation svelte-jmo3rv"><h4 class="svelte-jmo3rv"><span class="format-badge decimal svelte-jmo3rv">Decimal (Base-10)</span></h4> <p class="svelte-jmo3rv"><strong>What it is:</strong> The entire IP as a single large number (0-4,294,967,295).</p> <p class="svelte-jmo3rv"><strong>Example:</strong> <code class="svelte-jmo3rv">192.168.1.1 = 3,232,235,777</code></p> <p class="svelte-jmo3rv"><strong>Usage:</strong> Database storage, mathematical operations, IP range calculations.</p> <p class="svelte-jmo3rv"><strong>Calculation:</strong> (192×256³) + (168×256²) + (1×256) + 1 = 3,232,235,777</p></div> <div class="format-explanation svelte-jmo3rv"><h4 class="svelte-jmo3rv"><span class="format-badge hex svelte-jmo3rv">Hexadecimal (Base-16)</span></h4> <p class="svelte-jmo3rv"><strong>What it is:</strong> Uses digits 0-9 and letters A-F, common in programming and system administration.</p> <p class="svelte-jmo3rv"><strong>Example:</strong> <code class="svelte-jmo3rv">192.168.1.1 = 0xC0.0xA8.0x01.0x01</code></p> <p class="svelte-jmo3rv"><strong>Usage:</strong> Programming, system logs, network debugging, firmware configuration.</p> <p class="svelte-jmo3rv"><strong>Conversion:</strong> 192 = C0 hex, 168 = A8 hex. Each hex digit represents 4 bits.</p></div> <div class="format-explanation svelte-jmo3rv"><h4 class="svelte-jmo3rv"><span class="format-badge octal svelte-jmo3rv">Octal (Base-8)</span></h4> <p class="svelte-jmo3rv"><strong>What it is:</strong> Uses digits 0-7, less common but still found in some Unix systems.</p> <p class="svelte-jmo3rv"><strong>Example:</strong> <code class="svelte-jmo3rv">192.168.1.1 = 0300.0250.001.001</code></p> <p class="svelte-jmo3rv"><strong>Usage:</strong> Legacy Unix configurations, file permissions, some network tools.</p> <p class="svelte-jmo3rv"><strong>Note:</strong> Leading zeros indicate octal format. 0300 octal = 192 decimal.</p></div></div></div></div> <div class="card svelte-jmo3rv"><h3 class="svelte-jmo3rv"><!> IP Address Classes</h3> <div class="explainer-content svelte-jmo3rv"><p class="svelte-jmo3rv">IP address classes are historical categories that determine network size and usage patterns:</p> <div class="class-explanations svelte-jmo3rv"><div class="class-explanation svelte-jmo3rv"><h4 class="svelte-jmo3rv"><span class="class-badge class-a svelte-jmo3rv">Class A</span></h4> <p class="svelte-jmo3rv"><strong>Range:</strong> 1.0.0.0 to 126.255.255.255</p> <p class="svelte-jmo3rv"><strong>Default Mask:</strong> 255.0.0.0 (/8)</p> <p class="svelte-jmo3rv"><strong>Networks:</strong> 126 networks, 16.7 million hosts each</p> <p class="svelte-jmo3rv"><strong>Usage:</strong> Large organizations, ISPs, government networks</p></div> <div class="class-explanation svelte-jmo3rv"><h4 class="svelte-jmo3rv"><span class="class-badge class-b svelte-jmo3rv">Class B</span></h4> <p class="svelte-jmo3rv"><strong>Range:</strong> 128.0.0.0 to 191.255.255.255</p> <p class="svelte-jmo3rv"><strong>Default Mask:</strong> 255.255.0.0 (/16)</p> <p class="svelte-jmo3rv"><strong>Networks:</strong> 16,384 networks, 65,534 hosts each</p> <p class="svelte-jmo3rv"><strong>Usage:</strong> Universities, medium-large organizations</p></div> <div class="class-explanation svelte-jmo3rv"><h4 class="svelte-jmo3rv"><span class="class-badge class-c svelte-jmo3rv">Class C</span></h4> <p class="svelte-jmo3rv"><strong>Range:</strong> 192.0.0.0 to 223.255.255.255</p> <p class="svelte-jmo3rv"><strong>Default Mask:</strong> 255.255.255.0 (/24)</p> <p class="svelte-jmo3rv"><strong>Networks:</strong> 2.1 million networks, 254 hosts each</p> <p class="svelte-jmo3rv"><strong>Usage:</strong> Small businesses, home networks</p></div></div> <div class="class-notes svelte-jmo3rv"><h4 class="svelte-jmo3rv">Special Ranges</h4> <ul class="svelte-jmo3rv"><li class="svelte-jmo3rv"><strong>Class D (224-239):</strong> Multicast addresses for group communication</li> <li class="svelte-jmo3rv"><strong>Class E (240-255):</strong> Reserved for experimental use</li> <li class="svelte-jmo3rv"><strong>Private Networks:</strong> 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16</li> <li class="svelte-jmo3rv"><strong>Loopback:</strong> 127.0.0.0/8 (localhost addresses)</li></ul></div></div></div> <div class="card svelte-jmo3rv"><h3 class="svelte-jmo3rv"><!> When to Use Each Format</h3> <div class="explainer-content svelte-jmo3rv"><div class="usage-scenarios svelte-jmo3rv"><div class="usage-scenario svelte-jmo3rv"><h4 class="svelte-jmo3rv">Network Administration</h4> <ul class="svelte-jmo3rv"><li class="svelte-jmo3rv"><strong>Dotted Decimal:</strong> Daily configuration and documentation</li> <li class="svelte-jmo3rv"><strong>Binary:</strong> Subnet calculations and VLSM planning</li> <li class="svelte-jmo3rv"><strong>Hexadecimal:</strong> Debugging network captures and logs</li></ul></div> <div class="usage-scenario svelte-jmo3rv"><h4 class="svelte-jmo3rv">Programming & Development</h4> <ul class="svelte-jmo3rv"><li class="svelte-jmo3rv"><strong>Decimal:</strong> Database storage and IP range operations</li> <li class="svelte-jmo3rv"><strong>Hexadecimal:</strong> Low-level socket programming</li> <li class="svelte-jmo3rv"><strong>Binary:</strong> Bitwise operations and subnet masking</li></ul></div> <div class="usage-scenario svelte-jmo3rv"><h4 class="svelte-jmo3rv">Troubleshooting & Analysis</h4> <ul class="svelte-jmo3rv"><li class="svelte-jmo3rv"><strong>Binary:</strong> Understanding subnet boundaries</li> <li class="svelte-jmo3rv"><strong>Hexadecimal:</strong> Reading network packet captures</li> <li class="svelte-jmo3rv"><strong>Decimal:</strong> Quick IP range calculations</li></ul></div></div></div></div></div>`, 1);

export default function IPConverter($$anchor, $$props) {
	$.push($$props, true);

	let ipAddress = $.state('192.168.1.1');
	let formats = $.state($.proxy({ binary: '', decimal: '', hex: '', octal: '' }));
	let ipClass = $.state($.proxy({ class: '', type: '', description: '' }));
	const clipboard = useClipboard();
	let formatErrors = $.state($.proxy({}));

	/**
	 * Updates all format conversions when IP changes
	 */
	$.user_effect(() => {
		if ($.get(ipAddress) && validateIPv4($.get(ipAddress)).valid) {
			$.set(formats, convertIPFormats($.get(ipAddress)), true);
			$.set(ipClass, getIPClass($.get(ipAddress)), true);

			// Clear any format errors when a valid IP is set from the main input
			$.set(formatErrors, {}, true);
		}
	});

	/**
	 * Converts from decimal to IP
	 */
	function handleDecimalInput(event) {
		const target = event.target;
		const value = target.value.trim();

		if (!value) {
			$.set(formatErrors, { ...$.get(formatErrors), decimal: '' }, true);

			return;
		}

		const decimal = parseInt(value);

		if (isNaN(decimal)) {
			$.set(formatErrors, { ...$.get(formatErrors), decimal: 'Must be a valid number' }, true);

			return;
		}

		if (decimal < 0 || decimal > 4294967295) {
			$.set(
				formatErrors,
				{
					...$.get(formatErrors),
					decimal: 'Must be between 0 and 4,294,967,295'
				},
				true
			);

			return;
		}

		try {
			$.set(ipAddress, decimalToIP(decimal), true);
			$.set(formatErrors, { ...$.get(formatErrors), decimal: '' }, true);
		} catch(err) {
			$.set(formatErrors, { ...$.get(formatErrors), decimal: 'Invalid decimal value' }, true);
			console.error('Invalid decimal conversion:', err);
		}
	}

	/**
	 * Converts from binary to IP
	 */
	function handleBinaryInput(event) {
		const target = event.target;
		const value = target.value.trim();

		if (!value) {
			$.set(formatErrors, { ...$.get(formatErrors), binary: '' }, true);

			return;
		}

		// Remove invalid characters and check format
		const cleanBinary = value.replace(/[^01.\s]/g, '');

		const binaryDigits = cleanBinary.replace(/[.\s]/g, '');

		if (cleanBinary !== value) {
			$.set(
				formatErrors,
				{
					...$.get(formatErrors),
					binary: 'Only 0, 1, dots, and spaces allowed'
				},
				true
			);

			return;
		}

		if (binaryDigits.length !== 32) {
			$.set(
				formatErrors,
				{
					...$.get(formatErrors),
					binary: 'Must be exactly 32 binary digits (8 digits per octet)'
				},
				true
			);

			return;
		}

		// Validate octet structure (should be 8.8.8.8 format)
		const parts = cleanBinary.split('.');

		if (parts.length !== 4) {
			$.set(
				formatErrors,
				{
					...$.get(formatErrors),
					binary: 'Must use dotted format: 8bits.8bits.8bits.8bits'
				},
				true
			);

			return;
		}

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i].replace(/\s/g, '');

			if (part.length !== 8) {
				$.set(
					formatErrors,
					{
						...$.get(formatErrors),
						binary: `Octet ${i + 1} must be exactly 8 bits`
					},
					true
				);

				return;
			}
		}

		try {
			$.set(ipAddress, binaryToIP(cleanBinary), true);
			$.set(formatErrors, { ...$.get(formatErrors), binary: '' }, true);
		} catch(err) {
			$.set(formatErrors, { ...$.get(formatErrors), binary: 'Invalid binary format' }, true);
			console.error('Invalid binary conversion:', err);
		}
	}

	/**
	 * Converts from hex to IP
	 */
	function handleHexInput(event) {
		const target = event.target;
		const value = target.value.trim();

		if (!value) {
			$.set(formatErrors, { ...$.get(formatErrors), hex: '' }, true);

			return;
		}

		// Remove invalid characters and check format
		const cleanHex = value.replace(/[^0-9a-fA-F.x]/g, '');

		const hexDigits = cleanHex.replace(/[.x]/g, '');

		if (cleanHex !== value) {
			$.set(
				formatErrors,
				{
					...$.get(formatErrors),
					hex: 'Only hex digits (0-9, A-F), dots, and x allowed'
				},
				true
			);

			return;
		}

		if (hexDigits.length !== 8) {
			$.set(
				formatErrors,
				{
					...$.get(formatErrors),
					hex: 'Must be exactly 8 hex digits (2 digits per octet)'
				},
				true
			);

			return;
		}

		// Validate format (should be 0xXX.0xXX.0xXX.0xXX or XX.XX.XX.XX)
		const parts = cleanHex.split('.');

		if (parts.length !== 4) {
			$.set(
				formatErrors,
				{
					...$.get(formatErrors),
					hex: 'Must use dotted format: 0xXX.0xXX.0xXX.0xXX'
				},
				true
			);

			return;
		}

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			let hexPart = part;

			if (part.startsWith('0x') || part.startsWith('0X')) {
				hexPart = part.slice(2);
			}

			if (hexPart.length !== 2) {
				$.set(
					formatErrors,
					{
						...$.get(formatErrors),
						hex: `Octet ${i + 1} must be exactly 2 hex digits`
					},
					true
				);

				return;
			}

			if (!(/^[0-9a-fA-F]{2}$/).test(hexPart)) {
				$.set(
					formatErrors,
					{
						...$.get(formatErrors),
						hex: `Octet ${i + 1} contains invalid hex digits`
					},
					true
				);

				return;
			}
		}

		try {
			$.set(ipAddress, hexToIP(cleanHex), true);
			$.set(formatErrors, { ...$.get(formatErrors), hex: '' }, true);
		} catch(err) {
			$.set(formatErrors, { ...$.get(formatErrors), hex: 'Invalid hexadecimal format' }, true);
			console.error('Invalid hex conversion:', err);
		}
	}

	var fragment = root_6();
	var div = $.first_child(fragment);
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	IPInput(node, {
		label: 'IP Address',
		placeholder: '192.168.1.1',
		get value() {
			return $.get(ipAddress);
		},

		set value($$value) {
			$.set(ipAddress, $$value, true);
		}
	});

	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_2 = root_5();
			var section = $.child(div_2);
			var div_3 = $.sibling($.child(section), 2);
			var div_4 = $.child(div_3);
			var span = $.sibling($.child(div_4), 2);
			var text = $.only_child(span, true);

			$.reset(div_4);

			var div_5 = $.sibling(div_4, 2);
			var span_1 = $.sibling($.child(div_5), 2);
			var text_1 = $.only_child(span_1, true);

			$.reset(div_5);

			var div_6 = $.sibling(div_5, 2);
			var span_2 = $.sibling($.child(div_6), 2);
			var text_2 = $.only_child(span_2, true);

			$.reset(div_6);
			$.reset(div_3);
			$.reset(section);

			var div_7 = $.sibling(section, 2);
			var div_8 = $.child(div_7);
			var div_9 = $.sibling($.child(div_8), 2);
			var input = $.child(div_9);

			$.remove_input_defaults(input);

			var node_2 = $.sibling(input, 2);

			{
				let $0 = $.derived(() => clipboard.isCopied('binary') ? 'Copied!' : 'Copy binary format to clipboard');

				Tooltip(node_2, {
					get text() {
						return $.get($0);
					},
					position: 'left',
					children: ($$anchor, $$slotProps) => {
						var button = root();
						var node_3 = $.child(button);

						{
							let $0 = $.derived(() => clipboard.isCopied('binary') ? 'check' : 'copy');

							Icon(node_3, {
								get name() {
									return $.get($0);
								},
								size: 'sm'
							});
						}

						$.reset(button);
						$.template_effect(($0) => $.set_class(button, 1, `copy-btn ${$0 ?? ''}`, 'svelte-jmo3rv'), [() => clipboard.isCopied('binary') ? 'copied' : '']);
						$.delegated('click', button, () => clipboard.copy($.get(formats).binary, 'binary'));
						$.append($$anchor, button);
					},
					$$slots: { default: true }
				});
			}

			$.reset(div_9);

			var node_4 = $.sibling(div_9, 2);

			{
				var consequent = ($$anchor) => {
					var div_10 = root_1();
					var text_3 = $.only_child(div_10, true);

					$.template_effect(() => $.set_text(text_3, $.get(formatErrors).binary));
					$.append($$anchor, div_10);
				};

				$.if(node_4, ($$render) => {
					if ($.get(formatErrors).binary) $$render(consequent);
				});
			}

			$.reset(div_8);

			var div_11 = $.sibling(div_8, 2);
			var div_12 = $.sibling($.child(div_11), 2);
			var input_1 = $.child(div_12);

			$.remove_input_defaults(input_1);

			var node_5 = $.sibling(input_1, 2);

			{
				let $0 = $.derived(() => clipboard.isCopied('decimal') ? 'Copied!' : 'Copy decimal format to clipboard');

				Tooltip(node_5, {
					get text() {
						return $.get($0);
					},
					position: 'left',
					children: ($$anchor, $$slotProps) => {
						var button_1 = root_2();
						var node_6 = $.child(button_1);

						{
							let $0 = $.derived(() => clipboard.isCopied('decimal') ? 'check' : 'copy');

							Icon(node_6, {
								get name() {
									return $.get($0);
								},
								size: 'sm'
							});
						}

						$.reset(button_1);
						$.template_effect(($0) => $.set_class(button_1, 1, `copy-btn ${$0 ?? ''}`, 'svelte-jmo3rv'), [() => clipboard.isCopied('decimal') ? 'copied' : '']);
						$.delegated('click', button_1, () => clipboard.copy($.get(formats).decimal, 'decimal'));
						$.append($$anchor, button_1);
					},
					$$slots: { default: true }
				});
			}

			$.reset(div_12);

			var node_7 = $.sibling(div_12, 2);

			{
				var consequent_1 = ($$anchor) => {
					var div_13 = root_1();
					var text_4 = $.only_child(div_13, true);

					$.template_effect(() => $.set_text(text_4, $.get(formatErrors).decimal));
					$.append($$anchor, div_13);
				};

				$.if(node_7, ($$render) => {
					if ($.get(formatErrors).decimal) $$render(consequent_1);
				});
			}

			$.reset(div_11);

			var div_14 = $.sibling(div_11, 2);
			var div_15 = $.sibling($.child(div_14), 2);
			var input_2 = $.child(div_15);

			$.remove_input_defaults(input_2);

			var node_8 = $.sibling(input_2, 2);

			{
				let $0 = $.derived(() => clipboard.isCopied('hex') ? 'Copied!' : 'Copy hexadecimal format to clipboard');

				Tooltip(node_8, {
					get text() {
						return $.get($0);
					},
					position: 'left',
					children: ($$anchor, $$slotProps) => {
						var button_2 = root_3();
						var node_9 = $.child(button_2);

						{
							let $0 = $.derived(() => clipboard.isCopied('hex') ? 'check' : 'copy');

							Icon(node_9, {
								get name() {
									return $.get($0);
								},
								size: 'sm'
							});
						}

						$.reset(button_2);
						$.template_effect(($0) => $.set_class(button_2, 1, `copy-btn ${$0 ?? ''}`, 'svelte-jmo3rv'), [() => clipboard.isCopied('hex') ? 'copied' : '']);
						$.delegated('click', button_2, () => clipboard.copy($.get(formats).hex, 'hex'));
						$.append($$anchor, button_2);
					},
					$$slots: { default: true }
				});
			}

			$.reset(div_15);

			var node_10 = $.sibling(div_15, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_16 = root_1();
					var text_5 = $.only_child(div_16, true);

					$.template_effect(() => $.set_text(text_5, $.get(formatErrors).hex));
					$.append($$anchor, div_16);
				};

				$.if(node_10, ($$render) => {
					if ($.get(formatErrors).hex) $$render(consequent_2);
				});
			}

			$.reset(div_14);

			var div_17 = $.sibling(div_14, 2);
			var div_18 = $.sibling($.child(div_17), 2);
			var input_3 = $.child(div_18);

			$.remove_input_defaults(input_3);

			var node_11 = $.sibling(input_3, 2);

			{
				let $0 = $.derived(() => clipboard.isCopied('octal') ? 'Copied!' : 'Copy octal format to clipboard');

				Tooltip(node_11, {
					get text() {
						return $.get($0);
					},
					position: 'left',
					children: ($$anchor, $$slotProps) => {
						var button_3 = root_4();
						var node_12 = $.child(button_3);

						{
							let $0 = $.derived(() => clipboard.isCopied('octal') ? 'check' : 'copy');

							Icon(node_12, {
								get name() {
									return $.get($0);
								},
								size: 'sm'
							});
						}

						$.reset(button_3);
						$.template_effect(($0) => $.set_class(button_3, 1, `copy-btn ${$0 ?? ''}`, 'svelte-jmo3rv'), [() => clipboard.isCopied('octal') ? 'copied' : '']);
						$.delegated('click', button_3, () => clipboard.copy($.get(formats).octal, 'octal'));
						$.append($$anchor, button_3);
					},
					$$slots: { default: true }
				});
			}

			$.reset(div_18);
			$.reset(div_17);
			$.reset(div_7);
			$.reset(div_2);

			$.template_effect(() => {
				$.set_text(text, $.get(ipClass).class);
				$.set_text(text_1, $.get(ipClass).type);
				$.set_text(text_2, $.get(ipClass).description);
				$.set_value(input, $.get(formats).binary);
				$.set_class(input, 1, `format-field binary ${$.get(formatErrors).binary ? 'error' : ''}`, 'svelte-jmo3rv');
				$.set_value(input_1, $.get(formats).decimal);
				$.set_class(input_1, 1, `format-field decimal ${$.get(formatErrors).decimal ? 'error' : ''}`, 'svelte-jmo3rv');
				$.set_value(input_2, $.get(formats).hex);
				$.set_class(input_2, 1, `format-field hex ${$.get(formatErrors).hex ? 'error' : ''}`, 'svelte-jmo3rv');
				$.set_value(input_3, $.get(formats).octal);
			});

			$.delegated('input', input, handleBinaryInput);
			$.delegated('input', input_1, handleDecimalInput);
			$.delegated('input', input_2, handleHexInput);
			$.append($$anchor, div_2);
		};

		var d = $.derived(() => validateIPv4($.get(ipAddress)).valid);

		$.if(node_1, ($$render) => {
			if ($.get(d)) $$render(consequent_3);
		});
	}

	$.reset(div);

	var div_19 = $.sibling(div, 2);
	var div_20 = $.child(div_19);
	var h3 = $.child(div_20);
	var node_13 = $.child(h3);

	Icon(node_13, { name: 'info', size: 'md' });
	$.next();
	$.reset(h3);
	$.next(2);
	$.reset(div_20);

	var div_21 = $.sibling(div_20, 2);
	var h3_1 = $.child(div_21);
	var node_14 = $.child(h3_1);

	Icon(node_14, { name: 'info', size: 'md' });
	$.next();
	$.reset(h3_1);
	$.next(2);
	$.reset(div_21);

	var div_22 = $.sibling(div_21, 2);
	var h3_2 = $.child(div_22);
	var node_15 = $.child(h3_2);

	Icon(node_15, { name: 'lightbulb', size: 'md' });
	$.next();
	$.reset(h3_2);
	$.next(2);
	$.reset(div_22);
	$.reset(div_19);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['input', 'click']);