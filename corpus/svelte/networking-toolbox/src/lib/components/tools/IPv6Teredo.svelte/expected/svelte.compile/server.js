import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { useClipboard } from '$lib/composables';

export default function IPv6Teredo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let input = '2001:0000:4136:e378:8000:63bf:3fff:fdd2';
		let result = null;
		const clipboard = useClipboard();
		let selectedExample = null;
		let _userModified = false;

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
			input = example.address;
			selectedExample = example.label;
			_userModified = false;
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
			if (!input.trim()) {
				result = null;

				return;
			}

			try {
				const trimmed = input.trim();

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

				result = {
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
				};
			} catch(error) {
				result = {
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error occurred',
					originalAddress: input,
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
				};
			}
		}

		function handleInputChange() {
			_userModified = true;
			selectedExample = null;
			parseTeredo();
		}

		// Parse on component load
		parseTeredo();

		$$renderer.push(`<div class="card"><header class="card-header"><h1>IPv6 Teredo Parser</h1> <p>Parse Teredo IPv6 addresses to extract server IPv4, flags, mapped port, and client IPv4</p></header> <section class="overview-section svelte-wfg8ca"><div class="overview-content svelte-wfg8ca"><div class="overview-item svelte-wfg8ca">`);
		Icon($$renderer, { name: 'tunnel', size: 'sm' });

		$$renderer.push(`<!----> <div><strong class="svelte-wfg8ca">Teredo Tunneling:</strong> Allows IPv6 connectivity for hosts behind IPv4 NATs by encapsulating IPv6 packets
          in IPv4 UDP.</div></div> <div class="overview-item svelte-wfg8ca">`);

		Icon($$renderer, { name: 'globe', size: 'sm' });

		$$renderer.push(`<!----> <div><strong class="svelte-wfg8ca">Address Format:</strong> <code class="svelte-wfg8ca">2001:0000:SSSS:SSSS:FFFF:PPPP:CCCC:CCCC</code> where components are encoded
          and obfuscated.</div></div> <div class="overview-item svelte-wfg8ca">`);

		Icon($$renderer, { name: 'shield', size: 'sm' });
		$$renderer.push(`<!----> <div><strong class="svelte-wfg8ca">Obfuscation:</strong> Client IP and port are XOR'ed to prevent some NATs from interfering with the tunnel.</div></div></div></section> <section class="examples-section svelte-wfg8ca"><details class="examples-details svelte-wfg8ca"><summary class="examples-summary svelte-wfg8ca">`);
		Icon($$renderer, { name: 'chevron-right', size: 'sm' });
		$$renderer.push(`<!----> <h3 class="svelte-wfg8ca">Quick Examples</h3></summary> <div class="examples-grid svelte-wfg8ca"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let example = each_array[$$index];

			$$renderer.push(`<button${$.attr_class(`example-card ${selectedExample === example.label ? 'active' : ''}`, 'svelte-wfg8ca')}><div class="example-label svelte-wfg8ca">${$.escape(example.label)}</div> <code class="example-address svelte-wfg8ca">${$.escape(example.address)}</code> <div class="example-description svelte-wfg8ca">${$.escape(example.description)}</div></button>`);
		}

		$$renderer.push(`<!--]--></div></details></section> <section class="input-section svelte-wfg8ca"><div class="input-group svelte-wfg8ca"><label for="teredo-input" class="svelte-wfg8ca">`);
		Icon($$renderer, { name: 'tunnel', size: 'sm' });
		$$renderer.push(`<!----> Teredo IPv6 Address</label> <input id="teredo-input" type="text"${$.attr('value', input)} placeholder="2001:0000:4136:e378:8000:63bf:3fff:fdd2"${$.attr_class(`teredo-input ${result?.success === true ? 'valid' : result?.success === false ? 'invalid' : ''}`, 'svelte-wfg8ca')} spellcheck="false"/> <div class="input-hint svelte-wfg8ca">Enter any Teredo IPv6 address in compressed or full format</div></div></section> `);

		if (result && input.trim()) {
			$$renderer.push(`<!--[0--><section class="results-section svelte-wfg8ca">`);

			if (result.success) {
				$$renderer.push(`<!--[0--><div class="results-header svelte-wfg8ca"><h3 class="svelte-wfg8ca">`);
				Icon($$renderer, { name: 'check-circle', size: 'sm' });
				$$renderer.push(`<!----> Teredo Components</h3></div> <div class="address-breakdown svelte-wfg8ca"><div class="breakdown-header svelte-wfg8ca"><h4 class="svelte-wfg8ca">Address Structure</h4> <code class="full-address svelte-wfg8ca">${$.escape(result.details.fullAddress)}</code></div> <div class="breakdown-grid svelte-wfg8ca"><div class="breakdown-section prefix svelte-wfg8ca"><div class="section-label svelte-wfg8ca">Prefix</div> <code class="section-value svelte-wfg8ca">${$.escape(result.components.prefix)}</code> <div class="section-description svelte-wfg8ca">Teredo identifier</div></div> <div class="breakdown-section server svelte-wfg8ca"><div class="section-label svelte-wfg8ca">Server</div> <code class="section-value svelte-wfg8ca">${$.escape(result.details.addressGroups[2])}:${$.escape(result.details.addressGroups[3])}</code> <div class="section-description svelte-wfg8ca">IPv4: ${$.escape(result.components.serverIPv4)}</div></div> <div class="breakdown-section flags svelte-wfg8ca"><div class="section-label svelte-wfg8ca">Flags</div> <code class="section-value svelte-wfg8ca">${$.escape(result.details.addressGroups[4])}</code> <div class="section-description svelte-wfg8ca">${$.escape(result.components.flags)}</div></div> <div class="breakdown-section port svelte-wfg8ca"><div class="section-label svelte-wfg8ca">Port</div> <code class="section-value svelte-wfg8ca">${$.escape(result.details.addressGroups[5])}</code> <div class="section-description svelte-wfg8ca">Actual: ${$.escape(result.components.clientPort)}</div></div> <div class="breakdown-section client svelte-wfg8ca"><div class="section-label svelte-wfg8ca">Client</div> <code class="section-value svelte-wfg8ca">${$.escape(result.details.addressGroups[6])}:${$.escape(result.details.addressGroups[7])}</code> <div class="section-description svelte-wfg8ca">IPv4: ${$.escape(result.components.clientIPv4)}</div></div></div></div> <div class="components-section svelte-wfg8ca"><h4 class="svelte-wfg8ca">`);
				Icon($$renderer, { name: 'layers', size: 'sm' });
				$$renderer.push(`<!----> Extracted Components</h4> <div class="components-grid svelte-wfg8ca"><div class="component-card server svelte-wfg8ca"><div class="component-header svelte-wfg8ca">`);
				Icon($$renderer, { name: 'server', size: 'sm' });
				$$renderer.push(`<!----> <span class="component-title svelte-wfg8ca">Teredo Server</span></div> <div class="component-content svelte-wfg8ca"><code class="component-value svelte-wfg8ca">${$.escape(result.components.serverIPv4)}</code> <button${$.attr_class(`copy-button ${clipboard.isCopied('server') ? 'copied' : ''}`, 'svelte-wfg8ca')}>`);

				Icon($$renderer, {
					name: clipboard.isCopied('server') ? 'check' : 'copy',
					size: 'sm'
				});

				$$renderer.push(`<!----></button></div> <div class="component-description svelte-wfg8ca">The Teredo relay server handling this tunnel</div></div> <div class="component-card client svelte-wfg8ca"><div class="component-header svelte-wfg8ca">`);
				Icon($$renderer, { name: 'user', size: 'sm' });
				$$renderer.push(`<!----> <span class="component-title svelte-wfg8ca">Client IPv4</span></div> <div class="component-content svelte-wfg8ca"><code class="component-value svelte-wfg8ca">${$.escape(result.components.clientIPv4)}</code> <button${$.attr_class(`copy-button ${clipboard.isCopied('client') ? 'copied' : ''}`, 'svelte-wfg8ca')}>`);

				Icon($$renderer, {
					name: clipboard.isCopied('client') ? 'check' : 'copy',
					size: 'sm'
				});

				$$renderer.push(`<!----></button></div> <div class="component-description svelte-wfg8ca">The client's external IPv4 address (XOR decoded)</div></div> <div class="component-card port svelte-wfg8ca"><div class="component-header svelte-wfg8ca">`);
				Icon($$renderer, { name: 'hash', size: 'sm' });
				$$renderer.push(`<!----> <span class="component-title svelte-wfg8ca">Client Port</span></div> <div class="component-content svelte-wfg8ca"><code class="component-value svelte-wfg8ca">${$.escape(result.components.clientPort)}</code> <button${$.attr_class(`copy-button ${clipboard.isCopied('port') ? 'copied' : ''}`, 'svelte-wfg8ca')}>`);

				Icon($$renderer, {
					name: clipboard.isCopied('port') ? 'check' : 'copy',
					size: 'sm'
				});

				$$renderer.push(`<!----></button></div> <div class="component-description svelte-wfg8ca">The client's external port (XOR decoded with FFFF)</div></div> <div class="component-card flags svelte-wfg8ca"><div class="component-header svelte-wfg8ca">`);
				Icon($$renderer, { name: 'flag', size: 'sm' });
				$$renderer.push(`<!----> <span class="component-title svelte-wfg8ca">NAT Type</span></div> <div class="component-content svelte-wfg8ca"><span${$.attr_class(`component-value ${result.components.cone ? 'cone' : 'restricted'}`, 'svelte-wfg8ca')}>${$.escape(result.components.cone ? 'Cone NAT' : 'Restricted NAT')}</span></div> <div class="component-description svelte-wfg8ca">Indicates the type of NAT the client is behind</div></div></div></div> <div class="technical-details svelte-wfg8ca"><h4 class="svelte-wfg8ca">`);
				Icon($$renderer, { name: 'settings', size: 'sm' });
				$$renderer.push(`<!----> Technical Details</h4> <div class="details-grid svelte-wfg8ca"><div class="detail-item svelte-wfg8ca"><span class="detail-label svelte-wfg8ca">Obfuscated Port:</span> <code class="detail-value svelte-wfg8ca">${$.escape(result.components.clientPortObfuscated)}</code></div> <div class="detail-item svelte-wfg8ca"><span class="detail-label svelte-wfg8ca">Obfuscated Client:</span> <code class="detail-value svelte-wfg8ca">${$.escape(result.components.clientIPv4Obfuscated)}</code></div> <div class="detail-item svelte-wfg8ca"><span class="detail-label svelte-wfg8ca">Port Calculation:</span> <span class="detail-value svelte-wfg8ca">${$.escape(result.components.clientPortObfuscated)} XOR FFFF = ${$.escape(result.components.clientPort)}</span></div> <div class="detail-item svelte-wfg8ca"><span class="detail-label svelte-wfg8ca">Tunnel Protocol:</span> <span class="detail-value svelte-wfg8ca">IPv6-in-IPv4 via UDP port 3544</span></div></div></div> <div class="card calculation-steps svelte-wfg8ca"><h4 class="svelte-wfg8ca">`);
				Icon($$renderer, { name: 'list-ordered', size: 'sm' });
				$$renderer.push(`<!----> Parsing Steps</h4> <div class="steps-list svelte-wfg8ca"><!--[-->`);

				const each_array_1 = $.ensure_array_like(result.details.explanation);

				for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
					let step = each_array_1[index];

					$$renderer.push(`<div class="step-item svelte-wfg8ca"><div class="step-number svelte-wfg8ca">${$.escape(index + 1)}</div> <div class="step-content svelte-wfg8ca">${$.escape(step)}</div></div>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="error-result svelte-wfg8ca">`);
				Icon($$renderer, { name: 'alert-triangle', size: 'lg' });
				$$renderer.push(`<!----> <h4 class="svelte-wfg8ca">Invalid Teredo Address</h4> <p class="svelte-wfg8ca">${$.escape(result.error)}</p> <div class="error-help svelte-wfg8ca"><strong>Valid Teredo addresses:</strong> <ul class="svelte-wfg8ca"><li class="svelte-wfg8ca">Must start with 2001:0000:: (or 2001:: compressed)</li> <li class="svelte-wfg8ca">Example: 2001:0000:4136:e378:8000:63bf:3fff:fdd2</li> <li class="svelte-wfg8ca">Example: 2001::4136:e378:8000:63bf:3fff:fdd2</li></ul></div></div>`);
			}

			$$renderer.push(`<!--]--></section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <section class="education-section svelte-wfg8ca"><div class="education-grid svelte-wfg8ca"><div class="education-card svelte-wfg8ca"><h4 class="svelte-wfg8ca">`);
		Icon($$renderer, { name: 'book-open', size: 'sm' });

		$$renderer.push(`<!----> What is Teredo?</h4> <p class="svelte-wfg8ca">Teredo is an IPv6 transition technology that allows IPv6 connectivity for hosts located behind IPv4 NATs. It
          tunnels IPv6 packets inside IPv4 UDP datagrams, enabling communication with the IPv6 Internet.</p></div> <div class="education-card svelte-wfg8ca"><h4 class="svelte-wfg8ca">`);

		Icon($$renderer, { name: 'lock', size: 'sm' });

		$$renderer.push(`<!----> Why Obfuscation?</h4> <p class="svelte-wfg8ca">The client IP and port are XOR'ed with known values to prevent some NAT devices from automatically translating
          these embedded addresses, which would break the Teredo mechanism.</p></div> <div class="education-card svelte-wfg8ca"><h4 class="svelte-wfg8ca">`);

		Icon($$renderer, { name: 'network', size: 'sm' });

		$$renderer.push(`<!----> NAT Detection</h4> <p class="svelte-wfg8ca">The flags field indicates whether the client is behind a cone NAT (more permissive) or restricted NAT (more
          restrictive), which affects how the tunnel operates and performs.</p></div> <div class="education-card svelte-wfg8ca"><h4 class="svelte-wfg8ca">`);

		Icon($$renderer, { name: 'clock', size: 'sm' });

		$$renderer.push(`<!----> Legacy Technology</h4> <p class="svelte-wfg8ca">Teredo was important during IPv6 transition but is less common today. Modern systems prefer native IPv6 or
          other transition mechanisms like 6to4 or NAT64.</p></div></div></section></div>`);
	});
}