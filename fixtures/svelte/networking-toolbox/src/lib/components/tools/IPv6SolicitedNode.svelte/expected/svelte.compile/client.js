import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { useClipboard } from '$lib/composables';

var root = $.from_html(`<button><div class="example-label svelte-8grk9x"> </div> <code class="example-address svelte-8grk9x"> </code> <div class="example-description svelte-8grk9x"> </div></button>`);
var root_1 = $.from_html(`<div class="step-item svelte-8grk9x"><div class="step-number svelte-8grk9x"> </div> <div class="step-content svelte-8grk9x"> </div></div>`);
var root_2 = $.from_html(`<div class="results-header svelte-8grk9x"><h3 class="svelte-8grk9x"><!> Solicited-Node Calculation</h3></div> <div class="result-main svelte-8grk9x"><div class="result-item svelte-8grk9x"><div class="result-label svelte-8grk9x"><!> Unicast Address</div> <div class="result-content svelte-8grk9x"><code class="result-value unicast svelte-8grk9x"> </code> <button><!></button></div></div> <div class="arrow-down svelte-8grk9x"><!></div> <div class="result-item highlight svelte-8grk9x"><div class="result-label svelte-8grk9x"><!> Solicited-Node Multicast</div> <div class="result-content svelte-8grk9x"><code class="result-value multicast svelte-8grk9x"> </code> <button><!></button></div></div></div> <div class="calculation-steps svelte-8grk9x"><h4 class="svelte-8grk9x"><!> Calculation Steps</h4> <div class="steps-list svelte-8grk9x"></div></div> <div class="technical-details svelte-8grk9x"><h4 class="svelte-8grk9x"><!> Technical Details</h4> <div class="details-grid svelte-8grk9x"><div class="detail-item svelte-8grk9x"><span class="detail-label svelte-8grk9x">Last 24 bits:</span> <code class="detail-value svelte-8grk9x"> </code></div> <div class="detail-item svelte-8grk9x"><span class="detail-label svelte-8grk9x">Multicast prefix:</span> <code class="detail-value svelte-8grk9x"> </code></div> <div class="detail-item svelte-8grk9x"><span class="detail-label svelte-8grk9x">Address scope:</span> <span class="detail-value svelte-8grk9x">Link-local multicast (ff02)</span></div> <div class="detail-item svelte-8grk9x"><span class="detail-label svelte-8grk9x">Multicast flag:</span> <span class="detail-value svelte-8grk9x">Well-known (0)</span></div></div></div>`, 1);
var root_3 = $.from_html(`<div class="error-result svelte-8grk9x"><!> <h4 class="svelte-8grk9x">Invalid IPv6 Address</h4> <p class="svelte-8grk9x"> </p> <div class="error-help svelte-8grk9x"><strong class="svelte-8grk9x">Valid formats include:</strong> <ul class="svelte-8grk9x"><li class="svelte-8grk9x">Full form: 2001:0db8:0000:0000:0000:0000:1234:5678</li> <li class="svelte-8grk9x">Compressed: 2001:db8::1234:5678</li> <li class="svelte-8grk9x">Link-local: fe80::1234:5678:9abc:def0</li></ul></div></div>`);
var root_4 = $.from_html(`<section class="results-section svelte-8grk9x"><!></section>`);

var root_5 = $.from_html(`<div class="card svelte-8grk9x"><header class="card-header svelte-8grk9x"><h1 class="svelte-8grk9x">IPv6 Solicited-Node Multicast</h1> <p class="svelte-8grk9x">Compute solicited-node multicast addresses from IPv6 unicast for Neighbor Discovery Protocol</p></header> <section class="overview-section svelte-8grk9x"><div class="overview-content svelte-8grk9x"><div class="overview-item svelte-8grk9x"><!> <div class="svelte-8grk9x"><strong class="svelte-8grk9x">Purpose:</strong> Solicited-node multicast addresses enable efficient IPv6 Neighbor Discovery by targeting
          specific network nodes instead of all nodes.</div></div> <div class="overview-item svelte-8grk9x"><!> <div class="svelte-8grk9x"><strong class="svelte-8grk9x">Format:</strong> <code class="svelte-8grk9x">ff02::1:ffXX:XXXX</code> where XX:XXXX are the last 24 bits of the unicast address.</div></div> <div class="overview-item svelte-8grk9x"><!> <div class="svelte-8grk9x"><strong class="svelte-8grk9x">Usage:</strong> Used in NDP Neighbor Solicitation messages for address resolution and duplicate address
          detection.</div></div></div></section> <section class="examples-section svelte-8grk9x"><details class="examples-details svelte-8grk9x"><summary class="examples-summary svelte-8grk9x"><!> <h3 class="svelte-8grk9x">Quick Examples</h3></summary> <div class="examples-grid svelte-8grk9x"></div></details></section> <section class="input-section svelte-8grk9x"><div class="input-group svelte-8grk9x"><label for="ipv6-input" class="svelte-8grk9x"><!> IPv6 Unicast Address</label> <input id="ipv6-input" type="text" placeholder="2001:db8::1234:5678" spellcheck="false"/> <div class="input-hint svelte-8grk9x">Enter any valid IPv6 unicast address in any format (compressed or full)</div></div></section> <!> <section class="education-section svelte-8grk9x"><div class="education-grid svelte-8grk9x"><div class="education-card svelte-8grk9x"><h4 class="svelte-8grk9x"><!> What is NDP?</h4> <p class="svelte-8grk9x">Neighbor Discovery Protocol (NDP) is IPv6's equivalent to IPv4's ARP. It's used for address resolution, router
          discovery, and duplicate address detection on local network segments.</p></div> <div class="education-card svelte-8grk9x"><h4 class="svelte-8grk9x"><!> Why Solicited-Node?</h4> <p class="svelte-8grk9x">Instead of broadcasting to all nodes (like ARP), IPv6 uses solicited-node multicast to efficiently target only
          nodes that might have the specific address, reducing network traffic.</p></div> <div class="education-card svelte-8grk9x"><h4 class="svelte-8grk9x"><!> Address Collision</h4> <p class="svelte-8grk9x">Multiple unicast addresses can map to the same solicited-node multicast address. This is acceptable since
          nodes will ignore solicitations for addresses they don't own.</p></div> <div class="education-card svelte-8grk9x"><h4 class="svelte-8grk9x"><!> Multicast Membership</h4> <p class="svelte-8grk9x">Every IPv6 node automatically joins the solicited-node multicast group for each of its unicast addresses,
          enabling it to receive neighbor solicitations.</p></div></div></section></div>`);

export default function IPv6SolicitedNode($$anchor, $$props) {
	$.push($$props, true);

	let input = $.state('2001:db8::1234:5678');
	let result = $.state(null);
	const clipboard = useClipboard();
	let selectedExample = $.state(null);
	let _userModified = $.state(false);

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
		$.set(input, example.address, true);
		$.set(selectedExample, example.label, true);
		$.set(_userModified, false);
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

			$.set(
				result,
				{
					success: true,
					unicastAddress: trimmed,
					solicitedNodeAddress: solicitedNodeAddress.toLowerCase(),
					details: {
						normalizedUnicast,
						last24Bits,
						multicastPrefix: 'ff02::1:ff',
						explanation
					}
				},
				true
			);
		} catch(error) {
			$.set(
				result,
				{
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error occurred',
					unicastAddress: $.get(input),
					solicitedNodeAddress: '',
					details: {
						normalizedUnicast: '',
						last24Bits: '',
						multicastPrefix: '',
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
		calculateSolicitedNode();
	}

	// Calculate on component load
	calculateSolicitedNode();

	var div = root_5();
	var section = $.sibling($.child(div), 2);
	var div_1 = $.child(section);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	Icon(node, { name: 'info', size: 'sm' });
	$.next(2);
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_1 = $.child(div_3);

	Icon(node_1, { name: 'target', size: 'sm' });
	$.next(2);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_2 = $.child(div_4);

	Icon(node_2, { name: 'network', size: 'sm' });
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
			$.set_class(button, 1, `example-card ${$.get(selectedExample) === $.get(example).label ? 'active' : ''}`, 'svelte-8grk9x');
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

	Icon(node_4, { name: 'globe', size: 'sm' });
	$.next();
	$.reset(label);
	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter a valid IPv6 unicast address (not multicast) to calculate its solicited-node multicast address');

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
					var div_12 = $.child(div_11);
					var node_8 = $.child(div_12);

					Icon(node_8, { name: 'globe', size: 'sm' });
					$.next();
					$.reset(div_12);

					var div_13 = $.sibling(div_12, 2);
					var code_1 = $.child(div_13);
					var text_3 = $.only_child(code_1, true);
					var button_1 = $.sibling(code_1, 2);
					var node_9 = $.child(button_1);

					{
						let $0 = $.derived(() => clipboard.isCopied('unicast') ? 'check' : 'copy');

						Icon(node_9, {
							get name() {
								return $.get($0);
							},
							size: 'sm'
						});
					}

					$.reset(button_1);
					$.reset(div_13);
					$.reset(div_11);

					var div_14 = $.sibling(div_11, 2);
					var node_10 = $.child(div_14);

					Icon(node_10, { name: 'arrow-down', size: 'lg' });
					$.reset(div_14);

					var div_15 = $.sibling(div_14, 2);
					var div_16 = $.child(div_15);
					var node_11 = $.child(div_16);

					Icon(node_11, { name: 'users', size: 'sm' });
					$.next();
					$.reset(div_16);

					var div_17 = $.sibling(div_16, 2);
					var code_2 = $.child(div_17);
					var text_4 = $.only_child(code_2, true);
					var button_2 = $.sibling(code_2, 2);
					var node_12 = $.child(button_2);

					{
						let $0 = $.derived(() => clipboard.isCopied('multicast') ? 'check' : 'copy');

						Icon(node_12, {
							get name() {
								return $.get($0);
							},
							size: 'sm'
						});
					}

					$.reset(button_2);
					$.reset(div_17);
					$.reset(div_15);
					$.reset(div_10);

					var div_18 = $.sibling(div_10, 2);
					var h4 = $.child(div_18);
					var node_13 = $.child(h4);

					Icon(node_13, { name: 'list-ordered', size: 'sm' });
					$.next();
					$.reset(h4);

					var div_19 = $.sibling(h4, 2);

					$.each(div_19, 23, () => $.get(result).details.explanation, (step, index) => `explanation-${index}`, ($$anchor, step, index) => {
						var div_20 = root_1();
						var div_21 = $.child(div_20);
						var text_5 = $.only_child(div_21, true);
						var div_22 = $.sibling(div_21, 2);
						var text_6 = $.only_child(div_22, true);

						$.reset(div_20);

						$.template_effect(() => {
							$.set_text(text_5, $.get(index) + 1);
							$.set_text(text_6, $.get(step));
						});

						$.append($$anchor, div_20);
					});

					$.reset(div_19);
					$.reset(div_18);

					var div_23 = $.sibling(div_18, 2);
					var h4_1 = $.child(div_23);
					var node_14 = $.child(h4_1);

					Icon(node_14, { name: 'settings', size: 'sm' });
					$.next();
					$.reset(h4_1);

					var div_24 = $.sibling(h4_1, 2);
					var div_25 = $.child(div_24);
					var code_3 = $.sibling($.child(div_25), 2);
					var text_7 = $.only_child(code_3, true);

					$.reset(div_25);

					var div_26 = $.sibling(div_25, 2);
					var code_4 = $.sibling($.child(div_26), 2);
					var text_8 = $.only_child(code_4, true);

					$.reset(div_26);
					$.next(4);
					$.reset(div_24);
					$.reset(div_23);

					$.template_effect(
						($0, $1) => {
							$.set_text(text_3, $.get(result).details.normalizedUnicast);
							$.set_class(button_1, 1, `copy-button ${$0 ?? ''}`, 'svelte-8grk9x');
							$.set_text(text_4, $.get(result).solicitedNodeAddress);
							$.set_class(button_2, 1, `copy-button ${$1 ?? ''}`, 'svelte-8grk9x');
							$.set_text(text_7, $.get(result).details.last24Bits);
							$.set_text(text_8, $.get(result).details.multicastPrefix);
						},
						[
							() => clipboard.isCopied('unicast') ? 'copied' : '',
							() => clipboard.isCopied('multicast') ? 'copied' : ''
						]
					);

					$.delegated('click', button_1, () => $.get(result) && clipboard.copy($.get(result).details.normalizedUnicast, 'unicast'));
					$.delegated('click', button_2, () => $.get(result) && clipboard.copy($.get(result).solicitedNodeAddress, 'multicast'));
					$.append($$anchor, fragment);
				};

				var alternate = ($$anchor) => {
					var div_27 = root_3();
					var node_15 = $.child(div_27);

					Icon(node_15, { name: 'alert-triangle', size: 'lg' });

					var p = $.sibling(node_15, 4);
					var text_9 = $.only_child(p, true);

					$.next(2);
					$.reset(div_27);
					$.template_effect(() => $.set_text(text_9, $.get(result).error));
					$.append($$anchor, div_27);
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
	var div_28 = $.child(section_4);
	var div_29 = $.child(div_28);
	var h4_2 = $.child(div_29);
	var node_16 = $.child(h4_2);

	Icon(node_16, { name: 'info', size: 'sm' });
	$.next();
	$.reset(h4_2);
	$.next(2);
	$.reset(div_29);

	var div_30 = $.sibling(div_29, 2);
	var h4_3 = $.child(div_30);
	var node_17 = $.child(h4_3);

	Icon(node_17, { name: 'zap', size: 'sm' });
	$.next();
	$.reset(h4_3);
	$.next(2);
	$.reset(div_30);

	var div_31 = $.sibling(div_30, 2);
	var h4_4 = $.child(div_31);
	var node_18 = $.child(h4_4);

	Icon(node_18, { name: 'shield', size: 'sm' });
	$.next();
	$.reset(h4_4);
	$.next(2);
	$.reset(div_31);

	var div_32 = $.sibling(div_31, 2);
	var h4_5 = $.child(div_32);
	var node_19 = $.child(h4_5);

	Icon(node_19, { name: 'layers', size: 'sm' });
	$.next();
	$.reset(h4_5);
	$.next(2);
	$.reset(div_32);
	$.reset(div_28);
	$.reset(section_4);
	$.reset(div);

	$.template_effect(() => $.set_class(
		input_1,
		1,
		`ipv6-input ${$.get(result)?.success === true
			? 'valid'
			: $.get(result)?.success === false ? 'invalid' : ''}`,
		'svelte-8grk9x'
	));

	$.delegated('input', input_1, handleInputChange);
	$.bind_value(input_1, () => $.get(input), ($$value) => $.set(input, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'input']);