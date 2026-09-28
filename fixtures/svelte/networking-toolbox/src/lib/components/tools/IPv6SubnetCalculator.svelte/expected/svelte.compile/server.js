import * as $ from 'svelte/internal/server';

import {
	calculateIPv6Subnet,
	getCommonIPv6Prefixes,
	parseIPv6WithPrefix
} from '$lib/utils/ipv6-subnet-calculations.js';

import Tooltip from '$lib/components/global/Tooltip.svelte';
import Icon from '$lib/components/global/Icon.svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import { useClipboard } from '$lib/composables';
import { goto } from '$app/navigation';

export default function IPv6SubnetCalculator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const versionOptions = [
			{ value: 'ipv4', label: 'IPv4' },
			{ value: 'ipv6', label: 'IPv6' }
		];

		let selectedVersion = 'ipv6';

		function handleVersionChange(version) {
			if (version === 'ipv4') {
				goto('/subnetting/ipv4-subnet-calculator');
			}
		}

		let networkAddress = '2001:db8::/64';
		let prefixLength = 64;
		let subnetResult = null;
		const clipboard = useClipboard();
		let showBinaryView = false;
		const commonPrefixes = getCommonIPv6Prefixes();

		// Define preset configurations for matching
		const presetConfigs = [
			{ address: '2001:db8::', prefix: 48, id: 'doc-48' },
			{ address: '2001:db8::', prefix: 64, id: 'doc-64' },
			{ address: 'fe80::', prefix: 64, id: 'link-local' },
			{ address: '::1', prefix: 128, id: 'loopback' },
			{ address: '2001:4860:4860::', prefix: 48, id: 'google-dns' },
			{ address: 'ff02::1', prefix: 128, id: 'multicast' }
		];

		/**
		 * Check if current input matches a preset
		 */
		function getActivePreset() {
			const currentAddress = networkAddress.split('/')[0];

			for (const preset of presetConfigs) {
				if (currentAddress === preset.address && prefixLength === preset.prefix) {
					return preset.id;
				}
			}

			return null;
		}

		// Derived value for active preset - must be after presetConfigs definition
		let activePreset = $.derived(getActivePreset);

		/* Handle input change for combined address/prefix */
		function handleAddressInput(value) {
			const parsed = parseIPv6WithPrefix(value);

			if (parsed) {
				networkAddress = `${parsed.address}/${parsed.prefix}`;
				prefixLength = parsed.prefix;
			} else {
				networkAddress = value;
			}
		}

		/* Set preset example */
		function setPreset(address, prefix) {
			networkAddress = `${address}/${prefix}`;
			prefixLength = prefix;
		}

		/* Get prefix description */
		function getPrefixDescription(prefix) {
			const common = commonPrefixes.find((p) => p.prefix === prefix);

			return common?.description || `/${prefix} - Custom prefix length`;
		}

		/* Format large numbers */
		function formatLargeNumber(num) {
			if (num.includes('≈')) return num;

			const cleaned = num.replace(/[,\s]/g, '');

			if (cleaned.length > 15) {
				return `${cleaned.slice(0, 6)}... (${cleaned.length} digits)`;
			}

			return num;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ToolContentContainer($$renderer, {
				title: 'IPv6 Subnet Calculator',
				description: 'Calculate IPv6 subnet information with 128-bit addressing and modern network prefix notation.',
				navOptions: versionOptions,
				onNavChange: handleVersionChange,
				contentClass: 'ipv6-calc-card',
				get selectedNav() {
					return selectedVersion;
				},

				set selectedNav($$value) {
					selectedVersion = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<div class="input-section svelte-13utf9w"><h3 class="svelte-13utf9w">Network Configuration</h3> <div class="input-grid svelte-13utf9w"><div class="form-group svelte-13utf9w"><label for="ipv6-input" class="svelte-13utf9w">IPv6 Network Address</label> <div class="input-wrapper svelte-13utf9w"><input id="ipv6-input" type="text"${$.attr('value', networkAddress)} placeholder="2001:db8::/64" class="ipv6-input svelte-13utf9w"/> `);

					Tooltip($$renderer, {
						text: 'Enter IPv6 address with prefix (e.g., 2001:db8::/64) or address only',
						children: ($$renderer) => {
							Icon($$renderer, { name: 'help', size: 'sm' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div></div> <div class="form-group svelte-13utf9w"><label for="prefix-input" class="svelte-13utf9w">Prefix Length</label> <div class="prefix-controls svelte-13utf9w"><span class="prefix-display svelte-13utf9w">/${$.escape(prefixLength)}</span> <input id="prefix-slider" type="range" min="1" max="128"${$.attr('value', prefixLength)} class="prefix-slider svelte-13utf9w"/> <input id="prefix-input" type="number" min="1" max="128"${$.attr('value', prefixLength)} class="prefix-number svelte-13utf9w"/></div> <p class="prefix-description svelte-13utf9w">${$.escape(getPrefixDescription(prefixLength))}</p></div></div></div> <div class="presets-section svelte-13utf9w"><h3 class="svelte-13utf9w">Common IPv6 Networks</h3> <div class="presets-grid svelte-13utf9w"><button type="button"${$.attr_class(`preset-btn ${activePreset() === 'doc-48' ? 'active' : ''}`, 'svelte-13utf9w')}>Documentation /48</button> <button type="button"${$.attr_class(`preset-btn ${activePreset() === 'doc-64' ? 'active' : ''}`, 'svelte-13utf9w')}>Standard Subnet /64</button> <button type="button"${$.attr_class(`preset-btn ${activePreset() === 'link-local' ? 'active' : ''}`, 'svelte-13utf9w')}>Link-Local /64</button> <button type="button"${$.attr_class(`preset-btn ${activePreset() === 'loopback' ? 'active' : ''}`, 'svelte-13utf9w')}>Loopback /128</button> <button type="button"${$.attr_class(`preset-btn ${activePreset() === 'google-dns' ? 'active' : ''}`, 'svelte-13utf9w')}>Google DNS /48</button> <button type="button"${$.attr_class(`preset-btn ${activePreset() === 'multicast' ? 'active' : ''}`, 'svelte-13utf9w')}>Multicast All Nodes</button></div></div> `);

					if (subnetResult && subnetResult.success && subnetResult.subnet) {
						$$renderer.push(`<!--[0--><div class="results-section svelte-13utf9w"><div class="info-panel svelte-13utf9w"><h3 class="svelte-13utf9w">IPv6 Subnet Information</h3> <div class="info-grid svelte-13utf9w"><div class="info-item svelte-13utf9w"><span class="info-label svelte-13utf9w">Network</span> <div class="value-copy svelte-13utf9w"><span class="info-value svelte-13utf9w">${$.escape(subnetResult.subnet.networkCompressed)}/${$.escape(subnetResult.subnet.prefixLength)}</span> <button${$.attr_class('btn btn-icon copy-btn svelte-13utf9w', void 0, { 'copied': clipboard.isCopied('network') })}>`);

						Icon($$renderer, {
							name: clipboard.isCopied('network') ? 'check' : 'copy',
							size: 'sm'
						});

						$$renderer.push(`<!----></button></div></div> <div class="info-item svelte-13utf9w"><span class="info-label svelte-13utf9w">Total Addresses</span> <span class="info-value large-number svelte-13utf9w">${$.escape(formatLargeNumber(subnetResult.subnet.totalAddresses))}</span></div></div></div> <div class="details-section svelte-13utf9w"><div class="details-header svelte-13utf9w"><h3 class="svelte-13utf9w">Network Details</h3> <div class="header-actions svelte-13utf9w"><button type="button" class="btn btn-secondary btn-sm svelte-13utf9w">`);
						Icon($$renderer, { name: 'binary', size: 'sm' });
						$$renderer.push(`<!----> ${$.escape(showBinaryView ? 'Hide' : 'Show')} Binary</button></div></div> <div class="details-grid svelte-13utf9w"><div class="detail-item svelte-13utf9w"><div class="detail-label-wrapper svelte-13utf9w"><span class="detail-label svelte-13utf9w">Network Address (Compressed)</span> `);

						Tooltip($$renderer, {
							text: 'Compressed IPv6 notation using :: for consecutive zero groups',
							children: ($$renderer) => {
								Icon($$renderer, { name: 'help', size: 'sm' });
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> <div class="value-copy svelte-13utf9w"><code class="detail-value svelte-13utf9w">${$.escape(subnetResult.subnet.networkCompressed)}</code> <button${$.attr_class('btn btn-icon copy-btn svelte-13utf9w', void 0, { 'copied': clipboard.isCopied('compressed') })}>`);

						Icon($$renderer, {
							name: clipboard.isCopied('compressed') ? 'check' : 'copy',
							size: 'sm'
						});

						$$renderer.push(`<!----></button></div></div> <div class="detail-item svelte-13utf9w"><div class="detail-label-wrapper svelte-13utf9w"><span class="detail-label svelte-13utf9w">Network Address (Expanded)</span> `);

						Tooltip($$renderer, {
							text: 'Full 128-bit IPv6 representation with all zero groups shown',
							children: ($$renderer) => {
								Icon($$renderer, { name: 'help', size: 'sm' });
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> <div class="value-copy svelte-13utf9w"><code class="detail-value expanded svelte-13utf9w">${$.escape(subnetResult.subnet.networkExpanded)}</code> <button${$.attr_class('btn btn-icon copy-btn svelte-13utf9w', void 0, { 'copied': clipboard.isCopied('expanded') })}>`);

						Icon($$renderer, {
							name: clipboard.isCopied('expanded') ? 'check' : 'copy',
							size: 'sm'
						});

						$$renderer.push(`<!----></button></div></div> <div class="detail-item svelte-13utf9w"><div class="detail-label-wrapper svelte-13utf9w"><span class="detail-label svelte-13utf9w">Subnet Mask</span> `);

						Tooltip($$renderer, {
							text: 'IPv6 subnet mask showing network portion (compressed format)',
							children: ($$renderer) => {
								Icon($$renderer, { name: 'help', size: 'sm' });
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> <div class="value-copy svelte-13utf9w"><code class="detail-value svelte-13utf9w">${$.escape(subnetResult.subnet.subnetMask)}</code> <button${$.attr_class('btn btn-icon copy-btn svelte-13utf9w', void 0, { 'copied': clipboard.isCopied('mask') })}>`);

						Icon($$renderer, {
							name: clipboard.isCopied('mask') ? 'check' : 'copy',
							size: 'sm'
						});

						$$renderer.push(`<!----></button></div></div> <div class="detail-item svelte-13utf9w"><div class="detail-label-wrapper svelte-13utf9w"><span class="detail-label svelte-13utf9w">Address Range</span> `);

						Tooltip($$renderer, {
							text: 'First and last assignable addresses in the subnet',
							children: ($$renderer) => {
								Icon($$renderer, { name: 'help', size: 'sm' });
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> <div class="value-copy svelte-13utf9w"><code class="detail-value range svelte-13utf9w">${$.escape(subnetResult.subnet.firstAddress)} - ${$.escape(subnetResult.subnet.lastAddress)}</code> <button${$.attr_class('btn btn-icon copy-btn svelte-13utf9w', void 0, { 'copied': clipboard.isCopied('range') })}>`);

						Icon($$renderer, {
							name: clipboard.isCopied('range') ? 'check' : 'copy',
							size: 'sm'
						});

						$$renderer.push(`<!----></button></div></div> <div class="detail-item svelte-13utf9w"><div class="detail-label-wrapper svelte-13utf9w"><span class="detail-label svelte-13utf9w">Assignable Addresses</span> `);

						Tooltip($$renderer, {
							text: 'Number of addresses available for host assignment (excluding network/broadcast concepts)',
							children: ($$renderer) => {
								Icon($$renderer, { name: 'help', size: 'sm' });
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> <div class="value-copy svelte-13utf9w"><code class="detail-value svelte-13utf9w">${$.escape(formatLargeNumber(subnetResult.subnet.assignableAddresses))}</code> <button${$.attr_class('btn btn-icon copy-btn svelte-13utf9w', void 0, { 'copied': clipboard.isCopied('assignable') })}>`);

						Icon($$renderer, {
							name: clipboard.isCopied('assignable') ? 'check' : 'copy',
							size: 'sm'
						});

						$$renderer.push(`<!----></button></div></div> <div class="detail-item svelte-13utf9w"><div class="detail-label-wrapper svelte-13utf9w"><span class="detail-label svelte-13utf9w">Reverse DNS Zone</span> `);

						Tooltip($$renderer, {
							text: 'PTR record zone for reverse DNS lookups',
							children: ($$renderer) => {
								Icon($$renderer, { name: 'help', size: 'sm' });
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> <div class="value-copy svelte-13utf9w"><code class="detail-value reverse svelte-13utf9w">${$.escape(subnetResult.subnet.reverseZone)}</code> <button${$.attr_class('btn btn-icon copy-btn svelte-13utf9w', void 0, { 'copied': clipboard.isCopied('reverse') })}>`);

						Icon($$renderer, {
							name: clipboard.isCopied('reverse') ? 'check' : 'copy',
							size: 'sm'
						});

						$$renderer.push(`<!----></button></div></div> `);

						if (showBinaryView) {
							$$renderer.push(`<!--[0--><div class="detail-item full-width svelte-13utf9w"><div class="detail-label-wrapper svelte-13utf9w"><span class="detail-label svelte-13utf9w">Binary Prefix Representation</span> `);

							Tooltip($$renderer, {
								text: '128-bit binary representation showing network (1) and host (0) bits',
								children: ($$renderer) => {
									Icon($$renderer, { name: 'help', size: 'sm' });
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div> <div class="value-copy svelte-13utf9w"><code class="detail-value binary-display svelte-13utf9w">${$.escape(subnetResult.subnet.binaryPrefix)}</code> <button${$.attr_class('btn btn-icon copy-btn svelte-13utf9w', void 0, { 'copied': clipboard.isCopied('binary') })}>`);

							Icon($$renderer, {
								name: clipboard.isCopied('binary') ? 'check' : 'copy',
								size: 'sm'
							});

							$$renderer.push(`<!----></button></div></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div></div> <div class="visualization-section svelte-13utf9w"><h3 class="svelte-13utf9w">IPv6 Address Structure</h3> <div class="address-structure svelte-13utf9w"><div class="structure-header svelte-13utf9w"><h4 class="svelte-13utf9w">128-bit Address Breakdown</h4> <p class="svelte-13utf9w">Showing network and host portions for ${$.escape(subnetResult.subnet.networkCompressed)}/${$.escape(prefixLength)}</p></div> <div class="bit-visualization svelte-13utf9w"><div class="bit-section network-bits svelte-13utf9w"><div class="bit-header svelte-13utf9w"><span class="bit-label svelte-13utf9w">Network Portion</span> <span class="bit-count svelte-13utf9w">${$.escape(prefixLength)} bits</span></div> <div class="bit-bar svelte-13utf9w"${$.attr_style(`width: ${$.stringify(prefixLength / 128 * 100)}%`)}></div></div> <div class="bit-section host-bits svelte-13utf9w"><div class="bit-header svelte-13utf9w"><span class="bit-label svelte-13utf9w">Host Portion</span> <span class="bit-count svelte-13utf9w">${$.escape(128 - prefixLength)} bits</span></div> <div class="bit-bar svelte-13utf9w"${$.attr_style(`width: ${$.stringify((128 - prefixLength) / 128 * 100)}%`)}></div></div></div> <div class="bit-scale svelte-13utf9w"><div class="scale-markers svelte-13utf9w"><span class="svelte-13utf9w">0</span> <span class="svelte-13utf9w">32</span> <span class="svelte-13utf9w">64</span> <span class="svelte-13utf9w">96</span> <span class="svelte-13utf9w">128</span></div></div></div></div></div>`);
					} else if (subnetResult && !subnetResult.success) {
						$$renderer.push(`<!--[1--><div class="results-section svelte-13utf9w"><div class="info-panel error svelte-13utf9w"><h3 class="svelte-13utf9w">Calculation Error</h3> <p class="error-message svelte-13utf9w">${$.escape(subnetResult.error)}</p></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
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