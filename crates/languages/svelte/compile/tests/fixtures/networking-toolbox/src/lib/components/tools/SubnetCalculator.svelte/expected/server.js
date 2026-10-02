import * as $ from 'svelte/internal/server';
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

export default function SubnetCalculator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const versionOptions = [
			{ value: 'ipv4', label: 'IPv4' },
			{ value: 'ipv6', label: 'IPv6' }
		];

		let selectedVersion = 'ipv4';

		function handleVersionChange(version) {
			if (version === 'ipv6') {
				goto('/subnetting/ipv6-subnet-calculator');
			}
		}

		let cidrInput = '192.168.1.0/24';
		let subnetInfo = null;
		let isCalculating = false;
		let hasEverShownResults = false;

		/**
		 * Calculate subnet info when input changes
		 */
		const clipboard = useClipboard();

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ToolContentContainer($$renderer, {
				title: 'Subnet Calculator',
				description: 'Calculate network, broadcast, and host information for any subnet.',
				navOptions: versionOptions,
				onNavChange: handleVersionChange,
				get selectedNav() {
					return selectedVersion;
				},

				set selectedNav($$value) {
					selectedVersion = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<div class="form-group">`);

					CIDRInput($$renderer, {
						label: 'Network Address (CIDR)',
						placeholder: '192.168.1.0/24',
						get value() {
							return cidrInput;
						},

						set value($$value) {
							cidrInput = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----></div> `);

					if (subnetInfo) {
						$$renderer.push(`<!--[0--><div class="grid grid-2"><section><h3 style="margin-bottom: var(--spacing-md); border-bottom: 1px solid var(--border-primary); padding-bottom: var(--spacing-xs);">Network Information</h3> <div class="info-cards"><div class="info-card"><span class="info-label">Network Address</span> <div class="value-copy svelte-1ln6sgn"><code class="ip-value success">${$.escape(subnetInfo.network.octets.join('.'))}</code> `);

						Tooltip($$renderer, {
							text: clipboard.isCopied('network') ? 'Copied!' : 'Copy network address to clipboard',
							position: 'top',
							children: ($$renderer) => {
								$$renderer.push(`<button type="button"${$.attr_class(`btn-icon copy-btn ${clipboard.isCopied('network') ? 'copied' : ''}`)} aria-label="Copy network address">`);

								SvgIcon($$renderer, {
									icon: clipboard.isCopied('network') ? 'check' : 'clipboard',
									size: 'md'
								});

								$$renderer.push(`<!----></button>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div></div> <div class="info-card"><span class="info-label">Broadcast Address</span> <div class="value-copy svelte-1ln6sgn"><code class="ip-value error">${$.escape(subnetInfo.broadcast.octets.join('.'))}</code> `);

						Tooltip($$renderer, {
							text: clipboard.isCopied('broadcast') ? 'Copied!' : 'Copy broadcast address to clipboard',
							position: 'top',
							children: ($$renderer) => {
								$$renderer.push(`<button type="button"${$.attr_class(`btn-icon copy-btn ${clipboard.isCopied('broadcast') ? 'copied' : ''}`)} aria-label="Copy broadcast address">`);

								SvgIcon($$renderer, {
									icon: clipboard.isCopied('broadcast') ? 'check' : 'clipboard',
									size: 'md'
								});

								$$renderer.push(`<!----></button>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div></div> <div class="info-card"><span class="info-label">Subnet Mask</span> <div class="value-copy svelte-1ln6sgn"><code class="ip-value info">${$.escape(subnetInfo.subnet.octets.join('.'))}</code> <span class="cidr">/${$.escape(subnetInfo.cidr)}</span></div></div> <div class="info-card"><span class="info-label">Wildcard Mask</span> <code class="ip-value warning">${$.escape(subnetInfo.wildcardMask.octets.join('.'))}</code></div></div></section> <section><h3 style="margin-bottom: var(--spacing-md); border-bottom: 1px solid var(--border-primary); padding-bottom: var(--spacing-xs);">Host Information</h3> <div class="info-cards"><div class="info-card"><span class="info-label">Total Hosts</span> <span class="metric-value info">${$.escape(formatNumber(subnetInfo.hostCount))}</span></div> <div class="info-card"><span class="info-label">Usable Hosts</span> <span class="metric-value success">${$.escape(formatNumber(subnetInfo.usableHosts))}</span></div> <div class="info-card"><span class="info-label">First Host</span> <code class="ip-value success">${$.escape(subnetInfo.firstHost.octets.join('.'))}</code></div> <div class="info-card"><span class="info-label">Last Host</span> <code class="ip-value success">${$.escape(subnetInfo.lastHost.octets.join('.'))}</code></div></div></section></div> <section class="info-panel" style="margin-top: var(--spacing-lg);"><h3>Binary Representation</h3> <div class="binary-display"><div class="binary-row"><span class="info-label">Network:</span> <code class="binary-value success">${$.escape(subnetInfo.network.binary)}</code></div> <div class="binary-row"><span class="info-label">Mask:</span> <code class="binary-value info">${$.escape(subnetInfo.subnet.binary)}</code></div> <div class="binary-row"><span class="info-label">Broadcast:</span> <code class="binary-value error">${$.escape(subnetInfo.broadcast.binary)}</code></div></div></section> <section style="margin-top: var(--spacing-lg);">`);
						NetworkVisualizer($$renderer, { subnetInfo });
						$$renderer.push(`<!----></section>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (isCalculating) {
						$$renderer.push(`<!--[0--><div class="loading" style="justify-content: center; padding: var(--spacing-xl);"><div class="spinner"></div> Calculating subnet...</div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <section class="explainer-section svelte-1ln6sgn"><h3 class="svelte-1ln6sgn">Understanding Subnet Calculations</h3> <div class="explainer-grid svelte-1ln6sgn"><div class="explainer-card no-hover svelte-1ln6sgn"><h4>Network Address</h4> <p>The first IP address in a subnet, used to identify the network itself. Hosts cannot be assigned this address
          as it represents the entire network segment.</p></div> <div class="explainer-card no-hover svelte-1ln6sgn"><h4>Broadcast Address</h4> <p>The last IP address in a subnet, used to send messages to all devices on the network. When a packet is sent to
          this address, it reaches every host in the subnet.</p></div> <div class="explainer-card no-hover svelte-1ln6sgn"><h4>Subnet Mask</h4> <p>Defines which portion of an IP address represents the network and which represents the host. A mask of /24
          means the first 24 bits identify the network.</p></div> <div class="explainer-card no-hover svelte-1ln6sgn"><h4>Wildcard Mask</h4> <p>The inverse of a subnet mask, used in access control lists. Where the subnet mask has 1s, the wildcard has 0s,
          and vice versa.</p></div> <div class="explainer-card no-hover svelte-1ln6sgn"><h4>Usable Hosts</h4> <p>The number of IP addresses available for devices. Always 2 less than total addresses because network and
          broadcast addresses are reserved.</p></div> <div class="explainer-card no-hover svelte-1ln6sgn"><h4>CIDR Notation</h4> <p>Classless Inter-Domain Routing notation (e.g., /24) indicates how many bits are used for the network portion.
          Higher numbers mean smaller subnets with fewer hosts.</p></div></div> <div class="tips-box svelte-1ln6sgn"><h4 class="svelte-1ln6sgn">💡 Pro Tips</h4> <ul class="svelte-1ln6sgn"><li class="svelte-1ln6sgn"><strong>Plan for Growth:</strong> Choose subnet sizes that accommodate future expansion</li> <li class="svelte-1ln6sgn"><strong>Binary Understanding:</strong> Learning binary helps understand how subnetting works</li> <li class="svelte-1ln6sgn"><strong>Common Sizes:</strong> /24 (254 hosts), /25 (126 hosts), /26 (62 hosts), /30 (2 hosts for point-to-point)</li> <li class="svelte-1ln6sgn"><strong>Private Networks:</strong> Use RFC 1918 addresses (10.x.x.x, 172.16-31.x.x, 192.168.x.x) for internal networks</li></ul></div></section>`);
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}