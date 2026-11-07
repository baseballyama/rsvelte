import * as $ from 'svelte/internal/server';

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

export default function IPConverter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let ipAddress = '192.168.1.1';
		let formats = { binary: '', decimal: '', hex: '', octal: '' };
		let ipClass = { class: '', type: '', description: '' };
		const clipboard = useClipboard();
		let formatErrors = {};

		/**
		 * Updates all format conversions when IP changes
		 */
		// Clear any format errors when a valid IP is set from the main input
		/**
		 * Converts from decimal to IP
		 */
		function handleDecimalInput(event) {
			const target = event.target;
			const value = target.value.trim();

			if (!value) {
				formatErrors = { ...formatErrors, decimal: '' };

				return;
			}

			const decimal = parseInt(value);

			if (isNaN(decimal)) {
				formatErrors = { ...formatErrors, decimal: 'Must be a valid number' };

				return;
			}

			if (decimal < 0 || decimal > 4294967295) {
				formatErrors = {
					...formatErrors,
					decimal: 'Must be between 0 and 4,294,967,295'
				};

				return;
			}

			try {
				ipAddress = decimalToIP(decimal);
				formatErrors = { ...formatErrors, decimal: '' };
			} catch(err) {
				formatErrors = { ...formatErrors, decimal: 'Invalid decimal value' };
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
				formatErrors = { ...formatErrors, binary: '' };

				return;
			}

			// Remove invalid characters and check format
			const cleanBinary = value.replace(/[^01.\s]/g, '');

			const binaryDigits = cleanBinary.replace(/[.\s]/g, '');

			if (cleanBinary !== value) {
				formatErrors = {
					...formatErrors,
					binary: 'Only 0, 1, dots, and spaces allowed'
				};

				return;
			}

			if (binaryDigits.length !== 32) {
				formatErrors = {
					...formatErrors,
					binary: 'Must be exactly 32 binary digits (8 digits per octet)'
				};

				return;
			}

			// Validate octet structure (should be 8.8.8.8 format)
			const parts = cleanBinary.split('.');

			if (parts.length !== 4) {
				formatErrors = {
					...formatErrors,
					binary: 'Must use dotted format: 8bits.8bits.8bits.8bits'
				};

				return;
			}

			for (let i = 0; i < parts.length; i++) {
				const part = parts[i].replace(/\s/g, '');

				if (part.length !== 8) {
					formatErrors = {
						...formatErrors,
						binary: `Octet ${i + 1} must be exactly 8 bits`
					};

					return;
				}
			}

			try {
				ipAddress = binaryToIP(cleanBinary);
				formatErrors = { ...formatErrors, binary: '' };
			} catch(err) {
				formatErrors = { ...formatErrors, binary: 'Invalid binary format' };
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
				formatErrors = { ...formatErrors, hex: '' };

				return;
			}

			// Remove invalid characters and check format
			const cleanHex = value.replace(/[^0-9a-fA-F.x]/g, '');

			const hexDigits = cleanHex.replace(/[.x]/g, '');

			if (cleanHex !== value) {
				formatErrors = {
					...formatErrors,
					hex: 'Only hex digits (0-9, A-F), dots, and x allowed'
				};

				return;
			}

			if (hexDigits.length !== 8) {
				formatErrors = {
					...formatErrors,
					hex: 'Must be exactly 8 hex digits (2 digits per octet)'
				};

				return;
			}

			// Validate format (should be 0xXX.0xXX.0xXX.0xXX or XX.XX.XX.XX)
			const parts = cleanHex.split('.');

			if (parts.length !== 4) {
				formatErrors = {
					...formatErrors,
					hex: 'Must use dotted format: 0xXX.0xXX.0xXX.0xXX'
				};

				return;
			}

			for (let i = 0; i < parts.length; i++) {
				const part = parts[i];
				let hexPart = part;

				if (part.startsWith('0x') || part.startsWith('0X')) {
					hexPart = part.slice(2);
				}

				if (hexPart.length !== 2) {
					formatErrors = {
						...formatErrors,
						hex: `Octet ${i + 1} must be exactly 2 hex digits`
					};

					return;
				}

				if (!(/^[0-9a-fA-F]{2}$/).test(hexPart)) {
					formatErrors = {
						...formatErrors,
						hex: `Octet ${i + 1} contains invalid hex digits`
					};

					return;
				}
			}

			try {
				ipAddress = hexToIP(cleanHex);
				formatErrors = { ...formatErrors, hex: '' };
			} catch(err) {
				formatErrors = { ...formatErrors, hex: 'Invalid hexadecimal format' };
				console.error('Invalid hex conversion:', err);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="card"><header class="card-header"><h2>IP Address Converter</h2> <p>Convert IP addresses between different number formats.</p></header> <div class="form-group">`);

			IPInput($$renderer, {
				label: 'IP Address',
				placeholder: '192.168.1.1',
				get value() {
					return ipAddress;
				},

				set value($$value) {
					ipAddress = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> `);

			if (validateIPv4(ipAddress).valid) {
				$$renderer.push(`<!--[0--><div class="results-section fade-in svelte-jmo3rv"><section class="info-panel info"><h3 class="svelte-jmo3rv">IP Class Information</h3> <div class="grid grid-3"><div class="class-info svelte-jmo3rv"><span class="info-label">Class</span> <span class="class-value svelte-jmo3rv">${$.escape(ipClass.class)}</span></div> <div class="class-info svelte-jmo3rv"><span class="info-label">Type</span> <span class="class-value type svelte-jmo3rv">${$.escape(ipClass.type)}</span></div> <div class="class-info svelte-jmo3rv"><span class="info-label">Usage</span> <span class="class-description svelte-jmo3rv">${$.escape(ipClass.description)}</span></div></div></section> <div class="grid grid-2 conversions-grid svelte-jmo3rv"><div class="format-group svelte-jmo3rv"><label for="binary-input">Binary Format</label> <div class="format-input svelte-jmo3rv"><input id="binary-input" type="text"${$.attr('value', formats.binary)} placeholder="11000000.10101000.00000001.00000001"${$.attr_class(`format-field binary ${formatErrors.binary ? 'error' : ''}`, 'svelte-jmo3rv')}/> `);

				Tooltip($$renderer, {
					text: clipboard.isCopied('binary') ? 'Copied!' : 'Copy binary format to clipboard',
					position: 'left',
					children: ($$renderer) => {
						$$renderer.push(`<button type="button"${$.attr_class(`copy-btn ${clipboard.isCopied('binary') ? 'copied' : ''}`, 'svelte-jmo3rv')} aria-label="Copy binary format to clipboard">`);

						Icon($$renderer, {
							name: clipboard.isCopied('binary') ? 'check' : 'copy',
							size: 'sm'
						});

						$$renderer.push(`<!----></button>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> `);

				if (formatErrors.binary) {
					$$renderer.push(`<!--[0--><div class="error-message svelte-jmo3rv">${$.escape(formatErrors.binary)}</div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> <div class="format-group svelte-jmo3rv"><label for="decimal-input">Decimal Format</label> <div class="format-input svelte-jmo3rv"><input id="decimal-input" type="text"${$.attr('value', formats.decimal)} placeholder="3232235777"${$.attr_class(`format-field decimal ${formatErrors.decimal ? 'error' : ''}`, 'svelte-jmo3rv')}/> `);

				Tooltip($$renderer, {
					text: clipboard.isCopied('decimal') ? 'Copied!' : 'Copy decimal format to clipboard',
					position: 'left',
					children: ($$renderer) => {
						$$renderer.push(`<button type="button"${$.attr_class(`copy-btn ${clipboard.isCopied('decimal') ? 'copied' : ''}`, 'svelte-jmo3rv')} aria-label="Copy decimal format to clipboard">`);

						Icon($$renderer, {
							name: clipboard.isCopied('decimal') ? 'check' : 'copy',
							size: 'sm'
						});

						$$renderer.push(`<!----></button>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> `);

				if (formatErrors.decimal) {
					$$renderer.push(`<!--[0--><div class="error-message svelte-jmo3rv">${$.escape(formatErrors.decimal)}</div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> <div class="format-group svelte-jmo3rv"><label for="hex-input">Hexadecimal Format</label> <div class="format-input svelte-jmo3rv"><input id="hex-input" type="text"${$.attr('value', formats.hex)} placeholder="0xC0.0xA8.0x01.0x01"${$.attr_class(`format-field hex ${formatErrors.hex ? 'error' : ''}`, 'svelte-jmo3rv')}/> `);

				Tooltip($$renderer, {
					text: clipboard.isCopied('hex') ? 'Copied!' : 'Copy hexadecimal format to clipboard',
					position: 'left',
					children: ($$renderer) => {
						$$renderer.push(`<button type="button"${$.attr_class(`copy-btn ${clipboard.isCopied('hex') ? 'copied' : ''}`, 'svelte-jmo3rv')} aria-label="Copy hexadecimal format to clipboard">`);

						Icon($$renderer, {
							name: clipboard.isCopied('hex') ? 'check' : 'copy',
							size: 'sm'
						});

						$$renderer.push(`<!----></button>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> `);

				if (formatErrors.hex) {
					$$renderer.push(`<!--[0--><div class="error-message svelte-jmo3rv">${$.escape(formatErrors.hex)}</div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> <div class="format-group svelte-jmo3rv"><label for="octal-input">Octal Format</label> <div class="format-input svelte-jmo3rv"><input id="octal-input" type="text"${$.attr('value', formats.octal)} placeholder="0300.0250.001.001" class="format-field octal svelte-jmo3rv" readonly=""/> `);

				Tooltip($$renderer, {
					text: clipboard.isCopied('octal') ? 'Copied!' : 'Copy octal format to clipboard',
					position: 'left',
					children: ($$renderer) => {
						$$renderer.push(`<button type="button"${$.attr_class(`copy-btn ${clipboard.isCopied('octal') ? 'copied' : ''}`, 'svelte-jmo3rv')} aria-label="Copy octal format to clipboard">`);

						Icon($$renderer, {
							name: clipboard.isCopied('octal') ? 'check' : 'copy',
							size: 'sm'
						});

						$$renderer.push(`<!----></button>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div></div></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <div class="ip-explanation-docs svelte-jmo3rv"><div class="card svelte-jmo3rv"><h3 class="svelte-jmo3rv">`);
			Icon($$renderer, { name: 'info', size: 'md' });
			$$renderer.push(`<!----> Number Format Explanations</h3> <div class="explainer-content svelte-jmo3rv"><div class="format-explanations svelte-jmo3rv"><div class="format-explanation svelte-jmo3rv"><h4 class="svelte-jmo3rv"><span class="format-badge binary svelte-jmo3rv">Binary (Base-2)</span></h4> <p class="svelte-jmo3rv"><strong>What it is:</strong> Uses only digits 0 and 1, representing how computers internally store IP addresses.</p> <p class="svelte-jmo3rv"><strong>Example:</strong> <code class="svelte-jmo3rv">192.168.1.1 = 11000000.10101000.00000001.00000001</code></p> <p class="svelte-jmo3rv"><strong>Usage:</strong> Low-level networking, subnet calculations, understanding network/host boundaries.</p> <p class="svelte-jmo3rv"><strong>How to read:</strong> Each octet is 8 bits. Binary 11000000 = 128+64 = 192 in decimal.</p></div> <div class="format-explanation svelte-jmo3rv"><h4 class="svelte-jmo3rv"><span class="format-badge decimal svelte-jmo3rv">Decimal (Base-10)</span></h4> <p class="svelte-jmo3rv"><strong>What it is:</strong> The entire IP as a single large number (0-4,294,967,295).</p> <p class="svelte-jmo3rv"><strong>Example:</strong> <code class="svelte-jmo3rv">192.168.1.1 = 3,232,235,777</code></p> <p class="svelte-jmo3rv"><strong>Usage:</strong> Database storage, mathematical operations, IP range calculations.</p> <p class="svelte-jmo3rv"><strong>Calculation:</strong> (192×256³) + (168×256²) + (1×256) + 1 = 3,232,235,777</p></div> <div class="format-explanation svelte-jmo3rv"><h4 class="svelte-jmo3rv"><span class="format-badge hex svelte-jmo3rv">Hexadecimal (Base-16)</span></h4> <p class="svelte-jmo3rv"><strong>What it is:</strong> Uses digits 0-9 and letters A-F, common in programming and system administration.</p> <p class="svelte-jmo3rv"><strong>Example:</strong> <code class="svelte-jmo3rv">192.168.1.1 = 0xC0.0xA8.0x01.0x01</code></p> <p class="svelte-jmo3rv"><strong>Usage:</strong> Programming, system logs, network debugging, firmware configuration.</p> <p class="svelte-jmo3rv"><strong>Conversion:</strong> 192 = C0 hex, 168 = A8 hex. Each hex digit represents 4 bits.</p></div> <div class="format-explanation svelte-jmo3rv"><h4 class="svelte-jmo3rv"><span class="format-badge octal svelte-jmo3rv">Octal (Base-8)</span></h4> <p class="svelte-jmo3rv"><strong>What it is:</strong> Uses digits 0-7, less common but still found in some Unix systems.</p> <p class="svelte-jmo3rv"><strong>Example:</strong> <code class="svelte-jmo3rv">192.168.1.1 = 0300.0250.001.001</code></p> <p class="svelte-jmo3rv"><strong>Usage:</strong> Legacy Unix configurations, file permissions, some network tools.</p> <p class="svelte-jmo3rv"><strong>Note:</strong> Leading zeros indicate octal format. 0300 octal = 192 decimal.</p></div></div></div></div> <div class="card svelte-jmo3rv"><h3 class="svelte-jmo3rv">`);
			Icon($$renderer, { name: 'info', size: 'md' });
			$$renderer.push(`<!----> IP Address Classes</h3> <div class="explainer-content svelte-jmo3rv"><p class="svelte-jmo3rv">IP address classes are historical categories that determine network size and usage patterns:</p> <div class="class-explanations svelte-jmo3rv"><div class="class-explanation svelte-jmo3rv"><h4 class="svelte-jmo3rv"><span class="class-badge class-a svelte-jmo3rv">Class A</span></h4> <p class="svelte-jmo3rv"><strong>Range:</strong> 1.0.0.0 to 126.255.255.255</p> <p class="svelte-jmo3rv"><strong>Default Mask:</strong> 255.0.0.0 (/8)</p> <p class="svelte-jmo3rv"><strong>Networks:</strong> 126 networks, 16.7 million hosts each</p> <p class="svelte-jmo3rv"><strong>Usage:</strong> Large organizations, ISPs, government networks</p></div> <div class="class-explanation svelte-jmo3rv"><h4 class="svelte-jmo3rv"><span class="class-badge class-b svelte-jmo3rv">Class B</span></h4> <p class="svelte-jmo3rv"><strong>Range:</strong> 128.0.0.0 to 191.255.255.255</p> <p class="svelte-jmo3rv"><strong>Default Mask:</strong> 255.255.0.0 (/16)</p> <p class="svelte-jmo3rv"><strong>Networks:</strong> 16,384 networks, 65,534 hosts each</p> <p class="svelte-jmo3rv"><strong>Usage:</strong> Universities, medium-large organizations</p></div> <div class="class-explanation svelte-jmo3rv"><h4 class="svelte-jmo3rv"><span class="class-badge class-c svelte-jmo3rv">Class C</span></h4> <p class="svelte-jmo3rv"><strong>Range:</strong> 192.0.0.0 to 223.255.255.255</p> <p class="svelte-jmo3rv"><strong>Default Mask:</strong> 255.255.255.0 (/24)</p> <p class="svelte-jmo3rv"><strong>Networks:</strong> 2.1 million networks, 254 hosts each</p> <p class="svelte-jmo3rv"><strong>Usage:</strong> Small businesses, home networks</p></div></div> <div class="class-notes svelte-jmo3rv"><h4 class="svelte-jmo3rv">Special Ranges</h4> <ul class="svelte-jmo3rv"><li class="svelte-jmo3rv"><strong>Class D (224-239):</strong> Multicast addresses for group communication</li> <li class="svelte-jmo3rv"><strong>Class E (240-255):</strong> Reserved for experimental use</li> <li class="svelte-jmo3rv"><strong>Private Networks:</strong> 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16</li> <li class="svelte-jmo3rv"><strong>Loopback:</strong> 127.0.0.0/8 (localhost addresses)</li></ul></div></div></div> <div class="card svelte-jmo3rv"><h3 class="svelte-jmo3rv">`);
			Icon($$renderer, { name: 'lightbulb', size: 'md' });
			$$renderer.push(`<!----> When to Use Each Format</h3> <div class="explainer-content svelte-jmo3rv"><div class="usage-scenarios svelte-jmo3rv"><div class="usage-scenario svelte-jmo3rv"><h4 class="svelte-jmo3rv">Network Administration</h4> <ul class="svelte-jmo3rv"><li class="svelte-jmo3rv"><strong>Dotted Decimal:</strong> Daily configuration and documentation</li> <li class="svelte-jmo3rv"><strong>Binary:</strong> Subnet calculations and VLSM planning</li> <li class="svelte-jmo3rv"><strong>Hexadecimal:</strong> Debugging network captures and logs</li></ul></div> <div class="usage-scenario svelte-jmo3rv"><h4 class="svelte-jmo3rv">Programming &amp; Development</h4> <ul class="svelte-jmo3rv"><li class="svelte-jmo3rv"><strong>Decimal:</strong> Database storage and IP range operations</li> <li class="svelte-jmo3rv"><strong>Hexadecimal:</strong> Low-level socket programming</li> <li class="svelte-jmo3rv"><strong>Binary:</strong> Bitwise operations and subnet masking</li></ul></div> <div class="usage-scenario svelte-jmo3rv"><h4 class="svelte-jmo3rv">Troubleshooting &amp; Analysis</h4> <ul class="svelte-jmo3rv"><li class="svelte-jmo3rv"><strong>Binary:</strong> Understanding subnet boundaries</li> <li class="svelte-jmo3rv"><strong>Hexadecimal:</strong> Reading network packet captures</li> <li class="svelte-jmo3rv"><strong>Decimal:</strong> Quick IP range calculations</li></ul></div></div></div></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}