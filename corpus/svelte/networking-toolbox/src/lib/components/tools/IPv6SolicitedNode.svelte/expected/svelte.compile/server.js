import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { useClipboard } from '$lib/composables';

export default function IPv6SolicitedNode($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let input = '2001:db8::1234:5678';
		let result = null;
		const clipboard = useClipboard();
		let selectedExample = null;
		let _userModified = false;

		const examples = [
			{
				label: 'Standard Unicast',
				address: '2001:db8::1234:5678',
				description: 'Regular IPv6 unicast address'
			},

			{
				label: 'Link-Local',
				address: 'fe80::1234:5678:9abc:def0',
				description: 'Link-local unicast address'
			},

			{
				label: 'Compressed Form',
				address: '2001:db8::1',
				description: 'Heavily compressed address'
			},

			{
				label: 'Full Form',
				address: '2001:0db8:0000:0000:0000:0000:1234:5678',
				description: 'Uncompressed IPv6 address'
			},

			{
				label: 'Interface ID Only',
				address: '::1234:5678:9abc:def0',
				description: 'Only interface identifier specified'
			}
		];

		function loadExample(example) {
			input = example.address;
			selectedExample = example.label;
			_userModified = false;
			calculateSolicitedNode();
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

		function calculateSolicitedNodeMulticast(unicastAddress) {
			const expanded = expandIPv6(unicastAddress);
			const groups = expanded.split(':');

			// Get the last 24 bits (last 3 hex digits of the last two groups)
			const secondLastGroup = groups[6]; // e.g., "1234"

			const lastGroup = groups[7]; // e.g., "5678"

			// Take last digit of second-last group and all digits of last group
			const last24Bits = secondLastGroup.slice(-2) + lastGroup; // "45678"

			// Solicited-node multicast prefix is ff02::1:ff00:0/104
			const solicitedNodePrefix = 'ff02:0000:0000:0000:0000:0001:ff';

			// Insert the 24 bits into the last group
			const lastTwoHex = last24Bits.slice(0, 2); // "45"

			const lastFourHex = last24Bits.slice(1); // "5678"

			return `${solicitedNodePrefix}${lastTwoHex}:${lastFourHex}`;
		}

		function calculateSolicitedNode() {
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

				// Check if it's already a multicast address
				const expanded = expandIPv6(trimmed);

				const firstGroup = expanded.split(':')[0];

				if (firstGroup.toLowerCase().startsWith('ff')) {
					throw new Error('Input is already a multicast address. Please provide a unicast IPv6 address.');
				}

				const normalizedUnicast = expandIPv6(trimmed);
				const solicitedNodeAddress = calculateSolicitedNodeMulticast(trimmed);
				const groups = normalizedUnicast.split(':');
				const last24Bits = groups[6].slice(-2) + groups[7];

				const explanation = [
					`1. Take the last 24 bits of the unicast address: ${groups[6]}:${groups[7]} → ${last24Bits}`,
					`2. Prepend the solicited-node multicast prefix: ff02::1:ff`,
					`3. Insert the 24 bits: ff02::1:ff${last24Bits.slice(0, 2)}:${last24Bits.slice(1)}`,
					`4. Result: ${solicitedNodeAddress.toLowerCase()}`
				];

				result = {
					success: true,
					unicastAddress: trimmed,
					solicitedNodeAddress: solicitedNodeAddress.toLowerCase(),
					details: {
						normalizedUnicast,
						last24Bits,
						multicastPrefix: 'ff02::1:ff',
						explanation
					}
				};
			} catch(error) {
				result = {
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error occurred',
					unicastAddress: input,
					solicitedNodeAddress: '',
					details: {
						normalizedUnicast: '',
						last24Bits: '',
						multicastPrefix: '',
						explanation: []
					}
				};
			}
		}

		function handleInputChange() {
			_userModified = true;
			selectedExample = null;
			calculateSolicitedNode();
		}

		// Calculate on component load
		calculateSolicitedNode();

		$$renderer.push(`<div class="card svelte-8grk9x"><header class="card-header svelte-8grk9x"><h1 class="svelte-8grk9x">IPv6 Solicited-Node Multicast</h1> <p class="svelte-8grk9x">Compute solicited-node multicast addresses from IPv6 unicast for Neighbor Discovery Protocol</p></header> <section class="overview-section svelte-8grk9x"><div class="overview-content svelte-8grk9x"><div class="overview-item svelte-8grk9x">`);
		Icon($$renderer, { name: 'info', size: 'sm' });

		$$renderer.push(`<!----> <div class="svelte-8grk9x"><strong class="svelte-8grk9x">Purpose:</strong> Solicited-node multicast addresses enable efficient IPv6 Neighbor Discovery by targeting
          specific network nodes instead of all nodes.</div></div> <div class="overview-item svelte-8grk9x">`);

		Icon($$renderer, { name: 'target', size: 'sm' });
		$$renderer.push(`<!----> <div class="svelte-8grk9x"><strong class="svelte-8grk9x">Format:</strong> <code class="svelte-8grk9x">ff02::1:ffXX:XXXX</code> where XX:XXXX are the last 24 bits of the unicast address.</div></div> <div class="overview-item svelte-8grk9x">`);
		Icon($$renderer, { name: 'network', size: 'sm' });

		$$renderer.push(`<!----> <div class="svelte-8grk9x"><strong class="svelte-8grk9x">Usage:</strong> Used in NDP Neighbor Solicitation messages for address resolution and duplicate address
          detection.</div></div></div></section> <section class="examples-section svelte-8grk9x"><details class="examples-details svelte-8grk9x"><summary class="examples-summary svelte-8grk9x">`);

		Icon($$renderer, { name: 'chevron-right', size: 'sm' });
		$$renderer.push(`<!----> <h3 class="svelte-8grk9x">Quick Examples</h3></summary> <div class="examples-grid svelte-8grk9x"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let example = each_array[$$index];

			$$renderer.push(`<button${$.attr_class(`example-card ${selectedExample === example.label ? 'active' : ''}`, 'svelte-8grk9x')}><div class="example-label svelte-8grk9x">${$.escape(example.label)}</div> <code class="example-address svelte-8grk9x">${$.escape(example.address)}</code> <div class="example-description svelte-8grk9x">${$.escape(example.description)}</div></button>`);
		}

		$$renderer.push(`<!--]--></div></details></section> <section class="input-section svelte-8grk9x"><div class="input-group svelte-8grk9x"><label for="ipv6-input" class="svelte-8grk9x">`);
		Icon($$renderer, { name: 'globe', size: 'sm' });
		$$renderer.push(`<!----> IPv6 Unicast Address</label> <input id="ipv6-input" type="text"${$.attr('value', input)} placeholder="2001:db8::1234:5678"${$.attr_class(`ipv6-input ${result?.success === true ? 'valid' : result?.success === false ? 'invalid' : ''}`, 'svelte-8grk9x')} spellcheck="false"/> <div class="input-hint svelte-8grk9x">Enter any valid IPv6 unicast address in any format (compressed or full)</div></div></section> `);

		if (result && input.trim()) {
			$$renderer.push(`<!--[0--><section class="results-section svelte-8grk9x">`);

			if (result.success) {
				$$renderer.push(`<!--[0--><div class="results-header svelte-8grk9x"><h3 class="svelte-8grk9x">`);
				Icon($$renderer, { name: 'check-circle', size: 'sm' });
				$$renderer.push(`<!----> Solicited-Node Calculation</h3></div> <div class="result-main svelte-8grk9x"><div class="result-item svelte-8grk9x"><div class="result-label svelte-8grk9x">`);
				Icon($$renderer, { name: 'globe', size: 'sm' });
				$$renderer.push(`<!----> Unicast Address</div> <div class="result-content svelte-8grk9x"><code class="result-value unicast svelte-8grk9x">${$.escape(result.details.normalizedUnicast)}</code> <button${$.attr_class(`copy-button ${clipboard.isCopied('unicast') ? 'copied' : ''}`, 'svelte-8grk9x')}>`);

				Icon($$renderer, {
					name: clipboard.isCopied('unicast') ? 'check' : 'copy',
					size: 'sm'
				});

				$$renderer.push(`<!----></button></div></div> <div class="arrow-down svelte-8grk9x">`);
				Icon($$renderer, { name: 'arrow-down', size: 'lg' });
				$$renderer.push(`<!----></div> <div class="result-item highlight svelte-8grk9x"><div class="result-label svelte-8grk9x">`);
				Icon($$renderer, { name: 'users', size: 'sm' });
				$$renderer.push(`<!----> Solicited-Node Multicast</div> <div class="result-content svelte-8grk9x"><code class="result-value multicast svelte-8grk9x">${$.escape(result.solicitedNodeAddress)}</code> <button${$.attr_class(`copy-button ${clipboard.isCopied('multicast') ? 'copied' : ''}`, 'svelte-8grk9x')}>`);

				Icon($$renderer, {
					name: clipboard.isCopied('multicast') ? 'check' : 'copy',
					size: 'sm'
				});

				$$renderer.push(`<!----></button></div></div></div> <div class="calculation-steps svelte-8grk9x"><h4 class="svelte-8grk9x">`);
				Icon($$renderer, { name: 'list-ordered', size: 'sm' });
				$$renderer.push(`<!----> Calculation Steps</h4> <div class="steps-list svelte-8grk9x"><!--[-->`);

				const each_array_1 = $.ensure_array_like(result.details.explanation);

				for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
					let step = each_array_1[index];

					$$renderer.push(`<div class="step-item svelte-8grk9x"><div class="step-number svelte-8grk9x">${$.escape(index + 1)}</div> <div class="step-content svelte-8grk9x">${$.escape(step)}</div></div>`);
				}

				$$renderer.push(`<!--]--></div></div> <div class="technical-details svelte-8grk9x"><h4 class="svelte-8grk9x">`);
				Icon($$renderer, { name: 'settings', size: 'sm' });
				$$renderer.push(`<!----> Technical Details</h4> <div class="details-grid svelte-8grk9x"><div class="detail-item svelte-8grk9x"><span class="detail-label svelte-8grk9x">Last 24 bits:</span> <code class="detail-value svelte-8grk9x">${$.escape(result.details.last24Bits)}</code></div> <div class="detail-item svelte-8grk9x"><span class="detail-label svelte-8grk9x">Multicast prefix:</span> <code class="detail-value svelte-8grk9x">${$.escape(result.details.multicastPrefix)}</code></div> <div class="detail-item svelte-8grk9x"><span class="detail-label svelte-8grk9x">Address scope:</span> <span class="detail-value svelte-8grk9x">Link-local multicast (ff02)</span></div> <div class="detail-item svelte-8grk9x"><span class="detail-label svelte-8grk9x">Multicast flag:</span> <span class="detail-value svelte-8grk9x">Well-known (0)</span></div></div></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="error-result svelte-8grk9x">`);
				Icon($$renderer, { name: 'alert-triangle', size: 'lg' });
				$$renderer.push(`<!----> <h4 class="svelte-8grk9x">Invalid IPv6 Address</h4> <p class="svelte-8grk9x">${$.escape(result.error)}</p> <div class="error-help svelte-8grk9x"><strong class="svelte-8grk9x">Valid formats include:</strong> <ul class="svelte-8grk9x"><li class="svelte-8grk9x">Full form: 2001:0db8:0000:0000:0000:0000:1234:5678</li> <li class="svelte-8grk9x">Compressed: 2001:db8::1234:5678</li> <li class="svelte-8grk9x">Link-local: fe80::1234:5678:9abc:def0</li></ul></div></div>`);
			}

			$$renderer.push(`<!--]--></section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <section class="education-section svelte-8grk9x"><div class="education-grid svelte-8grk9x"><div class="education-card svelte-8grk9x"><h4 class="svelte-8grk9x">`);
		Icon($$renderer, { name: 'info', size: 'sm' });

		$$renderer.push(`<!----> What is NDP?</h4> <p class="svelte-8grk9x">Neighbor Discovery Protocol (NDP) is IPv6's equivalent to IPv4's ARP. It's used for address resolution, router
          discovery, and duplicate address detection on local network segments.</p></div> <div class="education-card svelte-8grk9x"><h4 class="svelte-8grk9x">`);

		Icon($$renderer, { name: 'zap', size: 'sm' });

		$$renderer.push(`<!----> Why Solicited-Node?</h4> <p class="svelte-8grk9x">Instead of broadcasting to all nodes (like ARP), IPv6 uses solicited-node multicast to efficiently target only
          nodes that might have the specific address, reducing network traffic.</p></div> <div class="education-card svelte-8grk9x"><h4 class="svelte-8grk9x">`);

		Icon($$renderer, { name: 'shield', size: 'sm' });

		$$renderer.push(`<!----> Address Collision</h4> <p class="svelte-8grk9x">Multiple unicast addresses can map to the same solicited-node multicast address. This is acceptable since
          nodes will ignore solicitations for addresses they don't own.</p></div> <div class="education-card svelte-8grk9x"><h4 class="svelte-8grk9x">`);

		Icon($$renderer, { name: 'layers', size: 'sm' });

		$$renderer.push(`<!----> Multicast Membership</h4> <p class="svelte-8grk9x">Every IPv6 node automatically joins the solicited-node multicast group for each of its unicast addresses,
          enabling it to receive neighbor solicitations.</p></div></div></section></div>`);
	});
}