import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { calculateSubnet } from '$lib/utils/ip-calculations.js';
import { validateCIDR } from '$lib/utils/ip-validation.js';
import { formatNumber } from '$lib/utils/formatters.js';
import CIDRInput from '$lib/components/tools/CIDRInput.svelte';
import NetworkVisualizer from '$lib/components/tools/NetworkVisualizer.svelte';
import Tooltip from '$lib/components/global/Tooltip.svelte';
import SvgIcon from '$lib/components/global/SvgIcon.svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import { tooltip } from '$lib/actions/tooltip.js';
import { useClipboard } from '$lib/composables';
import { goto } from '$app/navigation';

var root = $.from_html(`<button type="button" aria-label="Copy network address"><!></button>`);
var root_1 = $.from_html(`<button type="button" aria-label="Copy broadcast address"><!></button>`);
var root_2 = $.from_html(`<div class="grid grid-2"><section><h3 style="margin-bottom: var(--spacing-md); border-bottom: 1px solid var(--border-primary); padding-bottom: var(--spacing-xs);">Network Information</h3> <div class="info-cards"><div class="info-card"><span class="info-label">Network Address</span> <div class="value-copy svelte-1ln6sgn"><code class="ip-value success"> </code> <!></div></div> <div class="info-card"><span class="info-label">Broadcast Address</span> <div class="value-copy svelte-1ln6sgn"><code class="ip-value error"> </code> <!></div></div> <div class="info-card"><span class="info-label">Subnet Mask</span> <div class="value-copy svelte-1ln6sgn"><code class="ip-value info"> </code> <span class="cidr"> </span></div></div> <div class="info-card"><span class="info-label">Wildcard Mask</span> <code class="ip-value warning"> </code></div></div></section> <section><h3 style="margin-bottom: var(--spacing-md); border-bottom: 1px solid var(--border-primary); padding-bottom: var(--spacing-xs);">Host Information</h3> <div class="info-cards"><div class="info-card"><span class="info-label">Total Hosts</span> <span class="metric-value info"> </span></div> <div class="info-card"><span class="info-label">Usable Hosts</span> <span class="metric-value success"> </span></div> <div class="info-card"><span class="info-label">First Host</span> <code class="ip-value success"> </code></div> <div class="info-card"><span class="info-label">Last Host</span> <code class="ip-value success"> </code></div></div></section></div> <section class="info-panel" style="margin-top: var(--spacing-lg);"><h3>Binary Representation</h3> <div class="binary-display"><div class="binary-row"><span class="info-label">Network:</span> <code class="binary-value success"> </code></div> <div class="binary-row"><span class="info-label">Mask:</span> <code class="binary-value info"> </code></div> <div class="binary-row"><span class="info-label">Broadcast:</span> <code class="binary-value error"> </code></div></div></section> <section style="margin-top: var(--spacing-lg);"><!></section>`, 1);
var root_3 = $.from_html(`<div class="loading" style="justify-content: center; padding: var(--spacing-xl);"><div class="spinner"></div> Calculating subnet...</div>`);

var root_4 = $.from_html(
	`<div class="form-group"><!></div> <!> <!> <section class="explainer-section svelte-1ln6sgn"><h3 class="svelte-1ln6sgn">Understanding Subnet Calculations</h3> <div class="explainer-grid svelte-1ln6sgn"><div class="explainer-card no-hover svelte-1ln6sgn"><h4>Network Address</h4> <p>The first IP address in a subnet, used to identify the network itself. Hosts cannot be assigned this address
          as it represents the entire network segment.</p></div> <div class="explainer-card no-hover svelte-1ln6sgn"><h4>Broadcast Address</h4> <p>The last IP address in a subnet, used to send messages to all devices on the network. When a packet is sent to
          this address, it reaches every host in the subnet.</p></div> <div class="explainer-card no-hover svelte-1ln6sgn"><h4>Subnet Mask</h4> <p>Defines which portion of an IP address represents the network and which represents the host. A mask of /24
          means the first 24 bits identify the network.</p></div> <div class="explainer-card no-hover svelte-1ln6sgn"><h4>Wildcard Mask</h4> <p>The inverse of a subnet mask, used in access control lists. Where the subnet mask has 1s, the wildcard has 0s,
          and vice versa.</p></div> <div class="explainer-card no-hover svelte-1ln6sgn"><h4>Usable Hosts</h4> <p>The number of IP addresses available for devices. Always 2 less than total addresses because network and
          broadcast addresses are reserved.</p></div> <div class="explainer-card no-hover svelte-1ln6sgn"><h4>CIDR Notation</h4> <p>Classless Inter-Domain Routing notation (e.g., /24) indicates how many bits are used for the network portion.
          Higher numbers mean smaller subnets with fewer hosts.</p></div></div> <div class="tips-box svelte-1ln6sgn"><h4 class="svelte-1ln6sgn">💡 Pro Tips</h4> <ul class="svelte-1ln6sgn"><li class="svelte-1ln6sgn"><strong>Plan for Growth:</strong> Choose subnet sizes that accommodate future expansion</li> <li class="svelte-1ln6sgn"><strong>Binary Understanding:</strong> Learning binary helps understand how subnetting works</li> <li class="svelte-1ln6sgn"><strong>Common Sizes:</strong> /24 (254 hosts), /25 (126 hosts), /26 (62 hosts), /30 (2 hosts for point-to-point)</li> <li class="svelte-1ln6sgn"><strong>Private Networks:</strong> Use RFC 1918 addresses (10.x.x.x, 172.16-31.x.x, 192.168.x.x) for internal networks</li></ul></div></section>`,
	1
);

export default function SubnetCalculator($$anchor, $$props) {
	$.push($$props, true);

	const versionOptions = [
		{ value: 'ipv4', label: 'IPv4' },
		{ value: 'ipv6', label: 'IPv6' }
	];

	let selectedVersion = $.state('ipv4');

	function handleVersionChange(version) {
		if (version === 'ipv6') {
			goto('/subnetting/ipv6-subnet-calculator');
		}
	}

	let cidrInput = $.state('192.168.1.0/24');
	let subnetInfo = $.state(null);
	let isCalculating = false;
	let hasEverShownResults = $.state(false);

	/**
	 * Calculate subnet info when input changes
	 */
	$.user_effect(() => {
		if ($.get(cidrInput) && validateCIDR($.get(cidrInput)).valid) {
			const [ip, cidr] = $.get(cidrInput).split('/');

			try {
				$.set(subnetInfo, calculateSubnet(ip, parseInt(cidr, 10)), true);

				if (!$.get(hasEverShownResults)) {
					$.set(hasEverShownResults, true);
				}
			} catch(error) {
				console.error('Calculation error:', error);
				$.set(subnetInfo, null);
			}
		} else {
			$.set(subnetInfo, null);
		}
	});

	const clipboard = useClipboard();

	ToolContentContainer($$anchor, {
		title: 'Subnet Calculator',
		description: 'Calculate network, broadcast, and host information for any subnet.',
		get navOptions() {
			return versionOptions;
		},
		onNavChange: handleVersionChange,
		get selectedNav() {
			return $.get(selectedVersion);
		},

		set selectedNav($$value) {
			$.set(selectedVersion, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_4();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			CIDRInput(node, {
				label: 'Network Address (CIDR)',
				placeholder: '192.168.1.0/24',
				get value() {
					return $.get(cidrInput);
				},

				set value($$value) {
					$.set(cidrInput, $$value, true);
				}
			});

			$.reset(div);

			var node_1 = $.sibling(div, 2);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = root_2();
					var div_1 = $.first_child(fragment_2);
					var section = $.child(div_1);
					var div_2 = $.sibling($.child(section), 2);
					var div_3 = $.child(div_2);
					var span = $.child(div_3);

					$.action(span, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'First IP in subnet - identifies the network');

					var div_4 = $.sibling(span, 2);
					var code = $.child(div_4);
					var text = $.only_child(code, true);
					var node_2 = $.sibling(code, 2);

					{
						let $0 = $.derived(() => clipboard.isCopied('network') ? 'Copied!' : 'Copy network address to clipboard');

						Tooltip(node_2, {
							get text() {
								return $.get($0);
							},
							position: 'top',
							children: ($$anchor, $$slotProps) => {
								var button = root();
								var node_3 = $.child(button);

								{
									let $0 = $.derived(() => clipboard.isCopied('network') ? 'check' : 'clipboard');

									SvgIcon(node_3, {
										get icon() {
											return $.get($0);
										},
										size: 'md'
									});
								}

								$.reset(button);
								$.template_effect(($0) => $.set_class(button, 1, `btn-icon copy-btn ${$0 ?? ''}`), [() => clipboard.isCopied('network') ? 'copied' : '']);
								$.delegated('click', button, () => clipboard.copy($.get(subnetInfo).network.octets.join('.'), 'network'));
								$.append($$anchor, button);
							},
							$$slots: { default: true }
						});
					}

					$.reset(div_4);
					$.reset(div_3);

					var div_5 = $.sibling(div_3, 2);
					var span_1 = $.child(div_5);

					$.action(span_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Last IP in subnet - sends to all hosts');

					var div_6 = $.sibling(span_1, 2);
					var code_1 = $.child(div_6);
					var text_1 = $.only_child(code_1, true);
					var node_4 = $.sibling(code_1, 2);

					{
						let $0 = $.derived(() => clipboard.isCopied('broadcast') ? 'Copied!' : 'Copy broadcast address to clipboard');

						Tooltip(node_4, {
							get text() {
								return $.get($0);
							},
							position: 'top',
							children: ($$anchor, $$slotProps) => {
								var button_1 = root_1();
								var node_5 = $.child(button_1);

								{
									let $0 = $.derived(() => clipboard.isCopied('broadcast') ? 'check' : 'clipboard');

									SvgIcon(node_5, {
										get icon() {
											return $.get($0);
										},
										size: 'md'
									});
								}

								$.reset(button_1);
								$.template_effect(($0) => $.set_class(button_1, 1, `btn-icon copy-btn ${$0 ?? ''}`), [() => clipboard.isCopied('broadcast') ? 'copied' : '']);
								$.delegated('click', button_1, () => clipboard.copy($.get(subnetInfo).broadcast.octets.join('.'), 'broadcast'));
								$.append($$anchor, button_1);
							},
							$$slots: { default: true }
						});
					}

					$.reset(div_6);
					$.reset(div_5);

					var div_7 = $.sibling(div_5, 2);
					var span_2 = $.child(div_7);

					$.action(span_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Defines network vs host portion of IP');

					var div_8 = $.sibling(span_2, 2);
					var code_2 = $.child(div_8);
					var text_2 = $.only_child(code_2, true);
					var span_3 = $.sibling(code_2, 2);
					var text_3 = $.only_child(span_3);

					$.reset(div_8);
					$.reset(div_7);

					var div_9 = $.sibling(div_7, 2);
					var span_4 = $.child(div_9);

					$.action(span_4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Inverse of subnet mask - used in ACLs');

					var code_3 = $.sibling(span_4, 2);
					var text_4 = $.only_child(code_3, true);

					$.reset(div_9);
					$.reset(div_2);
					$.reset(section);

					var section_1 = $.sibling(section, 2);
					var div_10 = $.sibling($.child(section_1), 2);
					var div_11 = $.child(div_10);
					var span_5 = $.child(div_11);

					$.action(span_5, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'All IP addresses in this subnet');

					var span_6 = $.sibling(span_5, 2);
					var text_5 = $.only_child(span_6, true);

					$.reset(div_11);

					var div_12 = $.sibling(div_11, 2);
					var span_7 = $.child(div_12);

					$.action(span_7, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'IPs available for devices (excludes network/broadcast)');

					var span_8 = $.sibling(span_7, 2);
					var text_6 = $.only_child(span_8, true);

					$.reset(div_12);

					var div_13 = $.sibling(div_12, 2);
					var span_9 = $.child(div_13);

					$.action(span_9, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'First IP address available for devices');

					var code_4 = $.sibling(span_9, 2);
					var text_7 = $.only_child(code_4, true);

					$.reset(div_13);

					var div_14 = $.sibling(div_13, 2);
					var span_10 = $.child(div_14);

					$.action(span_10, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Last IP address available for devices');

					var code_5 = $.sibling(span_10, 2);
					var text_8 = $.only_child(code_5, true);

					$.reset(div_14);
					$.reset(div_10);
					$.reset(section_1);
					$.reset(div_1);

					var section_2 = $.sibling(div_1, 2);
					var div_15 = $.sibling($.child(section_2), 2);
					var div_16 = $.child(div_15);
					var span_11 = $.child(div_16);

					$.action(span_11, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Network address in binary format');

					var code_6 = $.sibling(span_11, 2);
					var text_9 = $.only_child(code_6, true);

					$.reset(div_16);

					var div_17 = $.sibling(div_16, 2);
					var span_12 = $.child(div_17);

					$.action(span_12, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Subnet mask in binary format');

					var code_7 = $.sibling(span_12, 2);
					var text_10 = $.only_child(code_7, true);

					$.reset(div_17);

					var div_18 = $.sibling(div_17, 2);
					var span_13 = $.child(div_18);

					$.action(span_13, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Broadcast address in binary format');

					var code_8 = $.sibling(span_13, 2);
					var text_11 = $.only_child(code_8, true);

					$.reset(div_18);
					$.reset(div_15);
					$.reset(section_2);

					var section_3 = $.sibling(section_2, 2);
					var node_6 = $.child(section_3);

					NetworkVisualizer(node_6, {
						get subnetInfo() {
							return $.get(subnetInfo);
						}
					});

					$.reset(section_3);

					$.template_effect(
						($0, $1, $2, $3, $4, $5, $6, $7) => {
							$.set_text(text, $0);
							$.set_text(text_1, $1);
							$.set_text(text_2, $2);
							$.set_text(text_3, `/${$.get(subnetInfo).cidr ?? ''}`);
							$.set_text(text_4, $3);
							$.set_text(text_5, $4);
							$.set_text(text_6, $5);
							$.set_text(text_7, $6);
							$.set_text(text_8, $7);
							$.set_text(text_9, $.get(subnetInfo).network.binary);
							$.set_text(text_10, $.get(subnetInfo).subnet.binary);
							$.set_text(text_11, $.get(subnetInfo).broadcast.binary);
						},
						[
							() => $.get(subnetInfo).network.octets.join('.'),
							() => $.get(subnetInfo).broadcast.octets.join('.'),
							() => $.get(subnetInfo).subnet.octets.join('.'),
							() => $.get(subnetInfo).wildcardMask.octets.join('.'),
							() => formatNumber($.get(subnetInfo).hostCount),
							() => formatNumber($.get(subnetInfo).usableHosts),
							() => $.get(subnetInfo).firstHost.octets.join('.'),
							() => $.get(subnetInfo).lastHost.octets.join('.')
						]
					);

					$.append($$anchor, fragment_2);
				};

				$.if(node_1, ($$render) => {
					if ($.get(subnetInfo)) $$render(consequent);
				});
			}

			var node_7 = $.sibling(node_1, 2);

			{
				var consequent_1 = ($$anchor) => {
					var div_19 = root_3();

					$.append($$anchor, div_19);
				};

				$.if(node_7, ($$render) => {
					if (isCalculating) $$render(consequent_1);
				});
			}

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);