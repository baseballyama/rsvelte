import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { useClipboard } from '$lib/composables';

export default function IPv6NAT64($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let inputAddress = '192.168.1.100';
		let customPrefix = '64:ff9b::/96';
		let conversionMode = 'ipv4-to-ipv6';
		let result = null;
		const clipboard = useClipboard();
		let selectedExample = null;
		let _userModified = false;

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
			inputAddress = example.address;
			customPrefix = example.prefix;
			conversionMode = example.mode;
			selectedExample = example.label;
			_userModified = false;
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
			if (!inputAddress.trim()) {
				result = null;

				return;
			}

			try {
				const trimmedInput = inputAddress.trim();
				const trimmedPrefix = customPrefix.trim();

				// Auto-detect input type if not manually set
				const detectedType = autoDetectInputType(trimmedInput);

				if (detectedType === 'unknown') {
					throw new Error('Invalid IP address format. Please enter a valid IPv4 or IPv6 address.');
				}

				let translationResult;
				let inputType;

				if (conversionMode === 'ipv4-to-ipv6') {
					if (detectedType !== 'ipv4') {
						throw new Error('IPv4 to IPv6 mode requires an IPv4 address as input.');
					}

					translationResult = ipv4ToNAT64(trimmedInput, trimmedPrefix);
					inputType = 'ipv4';

					result = {
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
					};
				} else {
					if (detectedType !== 'ipv6') {
						throw new Error('IPv6 to IPv4 mode requires an IPv6 address as input.');
					}

					translationResult = nat64ToIPv4(trimmedInput, trimmedPrefix);
					inputType = 'ipv6';

					result = {
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
					};
				}
			} catch(error) {
				result = {
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error occurred',
					originalAddress: inputAddress,
					translatedAddress: '',
					prefix: customPrefix,
					details: {
						inputType: autoDetectInputType(inputAddress),
						prefixUsed: '',
						prefixLength: 0,
						ipv4Hex: '',
						explanation: []
					}
				};
			}
		}

		function handleInputChange() {
			_userModified = true;
			selectedExample = null;
			translateAddress();
		}

		function handleModeChange() {
			_userModified = true;
			selectedExample = null;
			translateAddress();
		}

		// Translate on component load
		translateAddress();

		$$renderer.push(`<div class="card"><header class="card-header"><h1>IPv6 NAT64 Translator</h1> <p>Translate between IPv4 and IPv6 addresses using NAT64 prefix mechanism</p></header> <div class="card info-card svelte-19zaegq"><div class="overview-content svelte-19zaegq"><div class="overview-item svelte-19zaegq">`);
		Icon($$renderer, { name: 'shuffle', size: 'sm' });
		$$renderer.push(`<!----> <div><strong class="svelte-19zaegq">NAT64 Translation:</strong> Stateless mechanism to embed IPv4 addresses within IPv6 using a /96 prefix.</div></div> <div class="overview-item svelte-19zaegq">`);
		Icon($$renderer, { name: 'globe', size: 'sm' });

		$$renderer.push(`<!----> <div><strong class="svelte-19zaegq">Well-Known Prefix:</strong> <code class="svelte-19zaegq">64:ff9b::/96</code> is the standard prefix defined in RFC 6052 for NAT64
          translation.</div></div> <div class="overview-item svelte-19zaegq">`);

		Icon($$renderer, { name: 'network', size: 'sm' });
		$$renderer.push(`<!----> <div><strong class="svelte-19zaegq">Bidirectional:</strong> Convert IPv4→IPv6 for dual-stack communication or extract IPv4 from NAT64 addresses.</div></div></div></div> <div class="card examples-card svelte-19zaegq"><details class="examples-details svelte-19zaegq"><summary class="examples-summary svelte-19zaegq">`);
		Icon($$renderer, { name: 'chevron-right', size: 'sm' });
		$$renderer.push(`<!----> <h3 class="svelte-19zaegq">Quick Examples</h3></summary> <div class="examples-grid svelte-19zaegq"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let example = each_array[$$index];

			$$renderer.push(`<button${$.attr_class(`example-card ${selectedExample === example.label ? 'active' : ''}`, 'svelte-19zaegq')}><div class="example-header svelte-19zaegq"><div class="example-label svelte-19zaegq">${$.escape(example.label)}</div> <div${$.attr_class(`example-mode ${$.stringify(example.mode)}`, 'svelte-19zaegq')}>${$.escape(example.mode === 'ipv4-to-ipv6' ? '→ IPv6' : '→ IPv4')}</div></div> <code class="example-address svelte-19zaegq">${$.escape(example.address)}</code> <code class="example-prefix svelte-19zaegq">${$.escape(example.prefix)}</code> <div class="example-description svelte-19zaegq">${$.escape(example.description)}</div></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="card input-card svelte-19zaegq"><div class="mode-section svelte-19zaegq"><h3 class="mode-label svelte-19zaegq">Conversion Direction</h3> <div class="mode-options svelte-19zaegq"><label class="mode-option svelte-19zaegq"><input type="radio"${$.attr('checked', conversionMode === 'ipv4-to-ipv6', true)} value="ipv4-to-ipv6" class="svelte-19zaegq"/> <div class="mode-content svelte-19zaegq">`);
		Icon($$renderer, { name: 'arrow-right', size: 'sm' });
		$$renderer.push(`<!----> <span>IPv4 → IPv6</span></div></label> <label class="mode-option svelte-19zaegq"><input type="radio"${$.attr('checked', conversionMode === 'ipv6-to-ipv4', true)} value="ipv6-to-ipv4" class="svelte-19zaegq"/> <div class="mode-content svelte-19zaegq">`);
		Icon($$renderer, { name: 'arrow-left', size: 'sm' });
		$$renderer.push(`<!----> <span>IPv6 → IPv4</span></div></label></div></div> <div class="input-group svelte-19zaegq"><label for="address-input" class="svelte-19zaegq">`);

		Icon($$renderer, {
			name: conversionMode === 'ipv4-to-ipv6' ? 'globe' : 'globe',
			size: 'sm'
		});

		$$renderer.push(`<!----> ${$.escape(conversionMode === 'ipv4-to-ipv6' ? 'IPv4 Address' : 'NAT64 IPv6 Address')}</label> <input id="address-input" type="text"${$.attr('value', inputAddress)}${$.attr('placeholder', conversionMode === 'ipv4-to-ipv6' ? '192.168.1.100' : '64:ff9b::c0a8:164')}${$.attr_class(`address-input ${result?.success === true ? 'valid' : result?.success === false ? 'invalid' : ''}`, 'svelte-19zaegq')} spellcheck="false"/></div> <div class="input-group svelte-19zaegq"><label for="prefix-input" class="svelte-19zaegq">`);
		Icon($$renderer, { name: 'hash', size: 'sm' });
		$$renderer.push(`<!----> NAT64 Prefix</label> <input id="prefix-input" type="text"${$.attr('value', customPrefix)} placeholder="64:ff9b::/96" class="prefix-input svelte-19zaegq" spellcheck="false"/> <div class="input-hint svelte-19zaegq">Must be a /96 prefix for proper IPv4 embedding</div></div></div> `);

		if (result && inputAddress.trim()) {
			$$renderer.push(`<!--[0--><div class="card results-card svelte-19zaegq">`);

			if (result.success) {
				$$renderer.push(`<!--[0--><div class="results-header svelte-19zaegq"><h3 class="svelte-19zaegq">`);
				Icon($$renderer, { name: 'check-circle', size: 'sm' });
				$$renderer.push(`<!----> Translation Result</h3></div> <div class="translation-summary svelte-19zaegq"><div class="translation-flow svelte-19zaegq"><div class="translation-step input svelte-19zaegq"><div class="step-label svelte-19zaegq">Input (${$.escape(result.details.inputType.toUpperCase())})</div> <code class="step-value svelte-19zaegq">${$.escape(result.originalAddress)}</code></div> <div class="translation-arrow svelte-19zaegq">`);
				Icon($$renderer, { name: 'arrow-right', size: 'lg' });
				$$renderer.push(`<!----></div> <div class="translation-step output svelte-19zaegq"><div class="step-label svelte-19zaegq">Output (${$.escape(result.details.inputType === 'ipv4' ? 'IPv6' : 'IPv4')})</div> <div class="step-content svelte-19zaegq"><code class="step-value svelte-19zaegq">${$.escape(result.translatedAddress)}</code> <button${$.attr_class(`copy-button ${clipboard.isCopied('result') ? 'copied' : ''}`, 'svelte-19zaegq')}>`);

				Icon($$renderer, {
					name: clipboard.isCopied('result') ? 'check' : 'copy',
					size: 'sm'
				});

				$$renderer.push(`<!----></button></div></div></div> <div class="prefix-info svelte-19zaegq"><span class="prefix-label svelte-19zaegq">Using prefix:</span> <code class="prefix-value svelte-19zaegq">${$.escape(result.details.prefixUsed)}</code></div></div> <div class="technical-details svelte-19zaegq"><h4 class="svelte-19zaegq">`);
				Icon($$renderer, { name: 'settings', size: 'sm' });
				$$renderer.push(`<!----> Technical Details</h4> <div class="details-grid svelte-19zaegq"><div class="detail-item svelte-19zaegq"><span class="detail-label svelte-19zaegq">IPv4 Hex Representation:</span> <code class="detail-value svelte-19zaegq">${$.escape(result.details.ipv4Hex)}</code></div> <div class="detail-item svelte-19zaegq"><span class="detail-label svelte-19zaegq">Prefix Length:</span> <span class="detail-value svelte-19zaegq">/${$.escape(result.details.prefixLength)}</span></div> <div class="detail-item svelte-19zaegq"><span class="detail-label svelte-19zaegq">Translation Method:</span> <span class="detail-value svelte-19zaegq">NAT64 (RFC 6052)</span></div> <div class="detail-item svelte-19zaegq"><span class="detail-label svelte-19zaegq">Address Family:</span> <span class="detail-value svelte-19zaegq">${$.escape(result.details.inputType === 'ipv4' ? 'IPv4 → IPv6' : 'IPv6 → IPv4')}</span></div></div></div> <div class="explanation-steps svelte-19zaegq"><h4 class="svelte-19zaegq">`);
				Icon($$renderer, { name: 'list-ordered', size: 'sm' });
				$$renderer.push(`<!----> Translation Steps</h4> <div class="steps-list svelte-19zaegq"><!--[-->`);

				const each_array_1 = $.ensure_array_like(result.details.explanation);

				for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
					let step = each_array_1[index];

					$$renderer.push(`<div class="step-item svelte-19zaegq"><div class="step-number svelte-19zaegq">${$.escape(index + 1)}</div> <div class="step-content svelte-19zaegq">${$.escape(step)}</div></div>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="error-result svelte-19zaegq">`);
				Icon($$renderer, { name: 'alert-triangle', size: 'lg' });
				$$renderer.push(`<!----> <h4 class="svelte-19zaegq">Translation Error</h4> <p class="svelte-19zaegq">${$.escape(result.error)}</p> <div class="error-help svelte-19zaegq"><strong>Requirements:</strong> <ul class="svelte-19zaegq"><li class="svelte-19zaegq">For IPv4→IPv6: Valid IPv4 address (e.g., 192.168.1.1)</li> <li class="svelte-19zaegq">For IPv6→IPv4: Valid NAT64 IPv6 address matching the prefix</li> <li class="svelte-19zaegq">NAT64 prefix must be /96 (e.g., 64:ff9b::/96)</li> <li class="svelte-19zaegq">IPv6 address must contain the embedded IPv4 in last 32 bits</li></ul></div></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="card education-card svelte-19zaegq"><div class="education-grid svelte-19zaegq"><div class="education-item svelte-19zaegq"><h4 class="svelte-19zaegq">`);
		Icon($$renderer, { name: 'book-open', size: 'sm' });

		$$renderer.push(`<!----> What is NAT64?</h4> <p class="svelte-19zaegq">NAT64 is a stateless IP/ICMP translation mechanism that allows IPv6-only clients to communicate with IPv4-only
          servers. It embeds IPv4 addresses within IPv6 addresses using a /96 prefix.</p></div> <div class="education-item svelte-19zaegq"><h4 class="svelte-19zaegq">`);

		Icon($$renderer, { name: 'shield', size: 'sm' });

		$$renderer.push(`<!----> Well-Known Prefix</h4> <p class="svelte-19zaegq">RFC 6052 defines <code class="svelte-19zaegq">64:ff9b::/96</code> as the well-known prefix for NAT64 translation. This prefix is reserved
          for this purpose and should not be routed on the global Internet.</p></div> <div class="education-item svelte-19zaegq"><h4 class="svelte-19zaegq">`);

		Icon($$renderer, { name: 'layers', size: 'sm' });
		$$renderer.push(`<!----> Address Structure</h4> <p class="svelte-19zaegq">NAT64 addresses use 96 bits for the prefix and embed the 32-bit IPv4 address in the remaining bits: <code class="svelte-19zaegq">Prefix::/96 + IPv4(32 bits)</code></p></div> <div class="education-item svelte-19zaegq"><h4 class="svelte-19zaegq">`);
		Icon($$renderer, { name: 'network', size: 'sm' });

		$$renderer.push(`<!----> Use Cases</h4> <p class="svelte-19zaegq">Common in IPv6 transition scenarios, dual-stack networks, and environments where IPv6-only clients need to
          access legacy IPv4 services through translation gateways.</p></div></div></div></div>`);
	});
}