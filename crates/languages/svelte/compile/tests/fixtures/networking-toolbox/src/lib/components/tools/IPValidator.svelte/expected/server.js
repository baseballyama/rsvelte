import * as $ from 'svelte/internal/server';
import { tooltip as _tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import '../../../styles/diagnostics-pages.scss';

export default function IPValidator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let inputValue = '';
		let selectedExampleIndex = null;
		let result = null;

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
				result = null;

				return;
			}

			const trimmed = input.trim();

			// Determine if this looks like IPv4 or IPv6
			const hasColons = trimmed.includes(':');

			const hasDots = trimmed.includes('.');

			if (hasColons && hasDots) {
				// Could be IPv6 with embedded IPv4
				const ipv6Result = validateIPv6(trimmed);

				result = {
					isValid: ipv6Result.isValid,
					type: 'ipv6',
					errors: ipv6Result.errors,
					warnings: ipv6Result.warnings,
					details: ipv6Result.details
				};
			} else if (hasColons) {
				// IPv6
				const ipv6Result = validateIPv6(trimmed);

				result = {
					isValid: ipv6Result.isValid,
					type: 'ipv6',
					errors: ipv6Result.errors,
					warnings: ipv6Result.warnings,
					details: ipv6Result.details
				};
			} else if (hasDots) {
				// IPv4
				const ipv4Result = validateIPv4(trimmed);

				result = {
					isValid: ipv4Result.isValid,
					type: 'ipv4',
					errors: ipv4Result.errors,
					warnings: ipv4Result.warnings,
					details: ipv4Result.details
				};
			} else {
				// Neither format detected
				result = {
					isValid: false,
					type: null,
					errors: [
						'Input does not appear to be an IP address (no dots or colons found)'
					],
					warnings: [],
					details: {}
				};
			}
		}

		function setTestCase(testCase, index) {
			inputValue = testCase.value;
			selectedExampleIndex = index;
			validateIP(inputValue);
		}

		function clearExampleSelection() {
			selectedExampleIndex = null;
		}

		function handleInput() {
			clearExampleSelection();
			validateIP(inputValue);
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h1>IP Address Validator</h1> <p>Validate IPv4 and IPv6 addresses with detailed error analysis and format checking</p></header> <section class="input-section svelte-gtgubt"><div class="input-group svelte-gtgubt"><label for="ip-input" class="svelte-gtgubt">`);
		Icon($$renderer, { name: 'globe', size: 'sm' });

		$$renderer.push(`<!----> Enter IP Address</label> <input id="ip-input" type="text"${$.attr(
			'value',
			// Validate on component load if there's initial input
			inputValue
		)} placeholder="e.g., 192.168.1.1 or 2001:db8::1"${$.attr_class(`ip-input ${result?.isValid === true ? 'valid' : result?.isValid === false ? 'invalid' : ''}`, 'svelte-gtgubt')} autocomplete="off" spellcheck="false"/> <div class="input-hint svelte-gtgubt">Supports IPv4 (192.168.1.1), IPv6 (2001:db8::1), and various formats</div></div></section> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary">`);

		Icon($$renderer, { name: 'chevron-right', size: 'xs' });
		$$renderer.push(`<!----> <h4>Quick Test Cases</h4></summary> <div class="examples-grid"><!--[-->`);

		const each_array = $.ensure_array_like(testCases);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let testCase = each_array[index];

			$$renderer.push(`<button${$.attr_class(`example-card ${testCase.valid ? 'valid-example' : 'invalid-example'}`, 'svelte-gtgubt', { 'selected': selectedExampleIndex === index })}><div class="test-case-label svelte-gtgubt">`);

			Icon($$renderer, {
				name: testCase.valid ? 'check-circle' : 'x-circle',
				size: 'sm'
			});

			$$renderer.push(`<!----> <h5 class="svelte-gtgubt">${$.escape(testCase.label)}</h5></div> <code class="test-case-value svelte-gtgubt">${$.escape(testCase.value)}</code></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> `);

		if (result && inputValue.trim()) {
			$$renderer.push(`<!--[0--><section class="results-section svelte-gtgubt"><div${$.attr_class(`validation-result ${result.isValid ? 'valid' : 'invalid'}`, 'svelte-gtgubt')}><div class="result-header svelte-gtgubt"><div class="result-status svelte-gtgubt">`);

			Icon($$renderer, {
				name: result.isValid ? 'check-circle' : 'x-circle',
				size: 'lg'
			});

			$$renderer.push(`<!----> <div class="status-text svelte-gtgubt"><h2 class="svelte-gtgubt">${$.escape(result.isValid ? 'Valid' : 'Invalid')} IP Address</h2> `);

			if (result.type) {
				$$renderer.push(`<!--[0--><span class="ip-type svelte-gtgubt">${$.escape(result.type.toUpperCase())} Format</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div> `);

			if (result.isValid && result.details.normalizedForm) {
				$$renderer.push(`<!--[0--><div class="normalized-form svelte-gtgubt"><span class="normalized-label svelte-gtgubt">Normalized:</span> <code class="normalized-value svelte-gtgubt">${$.escape(result.details.normalizedForm)}</code></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			if (result.errors.length > 0) {
				$$renderer.push(`<!--[0--><div class="errors-section svelte-gtgubt"><h4 class="svelte-gtgubt">`);
				Icon($$renderer, { name: 'alert-circle', size: 'sm' });
				$$renderer.push(`<!----> Issues Found (${$.escape(result.errors.length)})</h4> <ul class="error-list svelte-gtgubt"><!--[-->`);

				const each_array_1 = $.ensure_array_like(result.errors);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let error = each_array_1[$$index_1];

					$$renderer.push(`<li class="error-item svelte-gtgubt">`);
					Icon($$renderer, { name: 'x', size: 'xs' });
					$$renderer.push(`<!----> ${$.escape(error)}</li>`);
				}

				$$renderer.push(`<!--]--></ul></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (result.warnings.length > 0) {
				$$renderer.push(`<!--[0--><div class="warnings-section svelte-gtgubt"><h4 class="svelte-gtgubt">`);
				Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
				$$renderer.push(`<!----> Warnings (${$.escape(result.warnings.length)})</h4> <ul class="warning-list svelte-gtgubt"><!--[-->`);

				const each_array_2 = $.ensure_array_like(result.warnings);

				for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
					let warning = each_array_2[$$index_2];

					$$renderer.push(`<li class="warning-item svelte-gtgubt">`);
					Icon($$renderer, { name: 'alert-triangle', size: 'xs' });
					$$renderer.push(`<!----> ${$.escape(warning)}</li>`);
				}

				$$renderer.push(`<!--]--></ul></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (result.isValid && Object.keys(result.details).length > 0) {
				$$renderer.push(`<!--[0--><div class="details-section svelte-gtgubt"><h4 class="svelte-gtgubt">`);
				Icon($$renderer, { name: 'info', size: 'sm' });
				$$renderer.push(`<!----> Address Details</h4> <div class="details-grid svelte-gtgubt">`);

				if (result.details.addressType) {
					$$renderer.push(`<!--[0--><div class="detail-item svelte-gtgubt"><span class="detail-label svelte-gtgubt">Type:</span> <span class="detail-value svelte-gtgubt">${$.escape(result.details.addressType)}</span></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (result.details.scope) {
					$$renderer.push(`<!--[0--><div class="detail-item svelte-gtgubt"><span class="detail-label svelte-gtgubt">Scope:</span> <span class="detail-value svelte-gtgubt">${$.escape(result.details.scope)}</span></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (result.details.isPrivate !== undefined) {
					$$renderer.push(`<!--[0--><div class="detail-item svelte-gtgubt"><span class="detail-label svelte-gtgubt">Routing:</span> <span${$.attr_class(`detail-value ${result.details.isPrivate ? 'private' : 'public'}`, 'svelte-gtgubt')}>${$.escape(result.details.isPrivate ? 'Private' : 'Public')}</span></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (result.details.compressedForm) {
					$$renderer.push(`<!--[0--><div class="detail-item svelte-gtgubt"><span class="detail-label svelte-gtgubt">Compressed:</span> <code class="detail-value compressed svelte-gtgubt">${$.escape(result.details.compressedForm)}</code></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (result.details.embeddedIPv4) {
					$$renderer.push(`<!--[0--><div class="detail-item svelte-gtgubt"><span class="detail-label svelte-gtgubt">Embedded IPv4:</span> <code class="detail-value embedded svelte-gtgubt">${$.escape(result.details.embeddedIPv4)}</code></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (result.details.zoneId) {
					$$renderer.push(`<!--[0--><div class="detail-item svelte-gtgubt"><span class="detail-label svelte-gtgubt">Zone ID:</span> <code class="detail-value zone svelte-gtgubt">%${$.escape(result.details.zoneId)}</code></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> `);

				if (result.details.info && result.details.info.length > 0) {
					$$renderer.push(`<!--[0--><div class="info-section svelte-gtgubt"><h5 class="svelte-gtgubt">Additional Information</h5> <ul class="info-list svelte-gtgubt"><!--[-->`);

					const each_array_3 = $.ensure_array_like(result.details.info);

					for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
						let info = each_array_3[$$index_3];

						$$renderer.push(`<li class="info-item svelte-gtgubt">`);
						Icon($$renderer, { name: 'info', size: 'xs' });
						$$renderer.push(`<!----> ${$.escape(info)}</li>`);
					}

					$$renderer.push(`<!--]--></ul></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <section class="about-content svelte-gtgubt"><div class="about-grid svelte-gtgubt"><div class="about-section"><h3 class="svelte-gtgubt">How to Tell if an IP Address is Valid</h3> <p class="svelte-gtgubt">Valid IP addresses follow specific rules. For IPv4, you need exactly four numbers (0-255) separated by dots,
          like 192.168.1.1. For IPv6, you need eight groups of hex digits separated by colons, though you can compress
          consecutive zeros with :: (like 2001:db8::1). The validator checks these rules and tells you exactly what's
          wrong when something doesn't match.</p></div> <div class="about-section"><h3 class="svelte-gtgubt">What Happens When Addresses Are Invalid</h3> <p class="svelte-gtgubt">Invalid IP addresses cause real problems. Your router might reject them, network connections fail, or software
          crashes. Common mistakes include typos like "192.168.1.256" (256 is too big), missing parts like "192.168.1",
          or extra zeros like "192.168.01.01". This tool catches these errors before they break your network setup.</p></div> <div class="about-section"><h3 class="svelte-gtgubt">Why Some Addresses Have Warnings</h3> <p class="svelte-gtgubt">Some valid addresses come with warnings because they have special meanings. For example, addresses ending in
          .0 are usually network addresses, and ones ending in .255 are broadcast addresses. Private addresses like
          192.168.x.x won't work on the internet. The tool explains what each address type means so you know if it's
          right for your use case.</p></div></div></section></div>`);
	});
}