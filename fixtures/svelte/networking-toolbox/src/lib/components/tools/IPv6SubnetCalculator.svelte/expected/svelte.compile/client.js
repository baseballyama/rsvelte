import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<div class="detail-item full-width svelte-13utf9w"><div class="detail-label-wrapper svelte-13utf9w"><span class="detail-label svelte-13utf9w">Binary Prefix Representation</span> <!></div> <div class="value-copy svelte-13utf9w"><code class="detail-value binary-display svelte-13utf9w"> </code> <button><!></button></div></div>`);
var root_1 = $.from_html(`<div class="results-section svelte-13utf9w"><div class="info-panel svelte-13utf9w"><h3 class="svelte-13utf9w">IPv6 Subnet Information</h3> <div class="info-grid svelte-13utf9w"><div class="info-item svelte-13utf9w"><span class="info-label svelte-13utf9w">Network</span> <div class="value-copy svelte-13utf9w"><span class="info-value svelte-13utf9w"> </span> <button><!></button></div></div> <div class="info-item svelte-13utf9w"><span class="info-label svelte-13utf9w">Total Addresses</span> <span class="info-value large-number svelte-13utf9w"> </span></div></div></div> <div class="details-section svelte-13utf9w"><div class="details-header svelte-13utf9w"><h3 class="svelte-13utf9w">Network Details</h3> <div class="header-actions svelte-13utf9w"><button type="button" class="btn btn-secondary btn-sm svelte-13utf9w"><!> </button></div></div> <div class="details-grid svelte-13utf9w"><div class="detail-item svelte-13utf9w"><div class="detail-label-wrapper svelte-13utf9w"><span class="detail-label svelte-13utf9w">Network Address (Compressed)</span> <!></div> <div class="value-copy svelte-13utf9w"><code class="detail-value svelte-13utf9w"> </code> <button><!></button></div></div> <div class="detail-item svelte-13utf9w"><div class="detail-label-wrapper svelte-13utf9w"><span class="detail-label svelte-13utf9w">Network Address (Expanded)</span> <!></div> <div class="value-copy svelte-13utf9w"><code class="detail-value expanded svelte-13utf9w"> </code> <button><!></button></div></div> <div class="detail-item svelte-13utf9w"><div class="detail-label-wrapper svelte-13utf9w"><span class="detail-label svelte-13utf9w">Subnet Mask</span> <!></div> <div class="value-copy svelte-13utf9w"><code class="detail-value svelte-13utf9w"> </code> <button><!></button></div></div> <div class="detail-item svelte-13utf9w"><div class="detail-label-wrapper svelte-13utf9w"><span class="detail-label svelte-13utf9w">Address Range</span> <!></div> <div class="value-copy svelte-13utf9w"><code class="detail-value range svelte-13utf9w"> </code> <button><!></button></div></div> <div class="detail-item svelte-13utf9w"><div class="detail-label-wrapper svelte-13utf9w"><span class="detail-label svelte-13utf9w">Assignable Addresses</span> <!></div> <div class="value-copy svelte-13utf9w"><code class="detail-value svelte-13utf9w"> </code> <button><!></button></div></div> <div class="detail-item svelte-13utf9w"><div class="detail-label-wrapper svelte-13utf9w"><span class="detail-label svelte-13utf9w">Reverse DNS Zone</span> <!></div> <div class="value-copy svelte-13utf9w"><code class="detail-value reverse svelte-13utf9w"> </code> <button><!></button></div></div> <!></div></div> <div class="visualization-section svelte-13utf9w"><h3 class="svelte-13utf9w">IPv6 Address Structure</h3> <div class="address-structure svelte-13utf9w"><div class="structure-header svelte-13utf9w"><h4 class="svelte-13utf9w">128-bit Address Breakdown</h4> <p class="svelte-13utf9w"> </p></div> <div class="bit-visualization svelte-13utf9w"><div class="bit-section network-bits svelte-13utf9w"><div class="bit-header svelte-13utf9w"><span class="bit-label svelte-13utf9w">Network Portion</span> <span class="bit-count svelte-13utf9w"> </span></div> <div class="bit-bar svelte-13utf9w"></div></div> <div class="bit-section host-bits svelte-13utf9w"><div class="bit-header svelte-13utf9w"><span class="bit-label svelte-13utf9w">Host Portion</span> <span class="bit-count svelte-13utf9w"> </span></div> <div class="bit-bar svelte-13utf9w"></div></div></div> <div class="bit-scale svelte-13utf9w"><div class="scale-markers svelte-13utf9w"><span class="svelte-13utf9w">0</span> <span class="svelte-13utf9w">32</span> <span class="svelte-13utf9w">64</span> <span class="svelte-13utf9w">96</span> <span class="svelte-13utf9w">128</span></div></div></div></div></div>`);
var root_2 = $.from_html(`<div class="results-section svelte-13utf9w"><div class="info-panel error svelte-13utf9w"><h3 class="svelte-13utf9w">Calculation Error</h3> <p class="error-message svelte-13utf9w"> </p></div></div>`);
var root_3 = $.from_html(`<div class="input-section svelte-13utf9w"><h3 class="svelte-13utf9w">Network Configuration</h3> <div class="input-grid svelte-13utf9w"><div class="form-group svelte-13utf9w"><label for="ipv6-input" class="svelte-13utf9w">IPv6 Network Address</label> <div class="input-wrapper svelte-13utf9w"><input id="ipv6-input" type="text" placeholder="2001:db8::/64" class="ipv6-input svelte-13utf9w"/> <!></div></div> <div class="form-group svelte-13utf9w"><label for="prefix-input" class="svelte-13utf9w">Prefix Length</label> <div class="prefix-controls svelte-13utf9w"><span class="prefix-display svelte-13utf9w"> </span> <input id="prefix-slider" type="range" min="1" max="128" class="prefix-slider svelte-13utf9w"/> <input id="prefix-input" type="number" min="1" max="128" class="prefix-number svelte-13utf9w"/></div> <p class="prefix-description svelte-13utf9w"> </p></div></div></div> <div class="presets-section svelte-13utf9w"><h3 class="svelte-13utf9w">Common IPv6 Networks</h3> <div class="presets-grid svelte-13utf9w"><button type="button">Documentation /48</button> <button type="button">Standard Subnet /64</button> <button type="button">Link-Local /64</button> <button type="button">Loopback /128</button> <button type="button">Google DNS /48</button> <button type="button">Multicast All Nodes</button></div></div> <!>`, 1);

export default function IPv6SubnetCalculator($$anchor, $$props) {
	$.push($$props, true);

	const versionOptions = [
		{ value: 'ipv4', label: 'IPv4' },
		{ value: 'ipv6', label: 'IPv6' }
	];

	let selectedVersion = $.state('ipv6');

	function handleVersionChange(version) {
		if (version === 'ipv4') {
			goto('/subnetting/ipv4-subnet-calculator');
		}
	}

	let networkAddress = $.state('2001:db8::/64');
	let prefixLength = $.state(64);
	let subnetResult = $.state(null);
	const clipboard = useClipboard();
	let showBinaryView = $.state(false);
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
		const currentAddress = $.get(networkAddress).split('/')[0];

		for (const preset of presetConfigs) {
			if (currentAddress === preset.address && $.get(prefixLength) === preset.prefix) {
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
			$.set(networkAddress, `${parsed.address}/${parsed.prefix}`);
			$.set(prefixLength, parsed.prefix, true);
		} else {
			$.set(networkAddress, value, true);
		}
	}

	/* Set preset example */
	function setPreset(address, prefix) {
		$.set(networkAddress, `${address}/${prefix}`);
		$.set(prefixLength, prefix, true);
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

	// Reactive calculation
	$.user_effect(() => {
		const addressPart = $.get(networkAddress).split('/')[0];

		if (addressPart && $.get(prefixLength)) {
			$.set(subnetResult, calculateIPv6Subnet(addressPart, $.get(prefixLength)), true);
		}
	});

	// activePreset is now derived automatically
	ToolContentContainer($$anchor, {
		title: 'IPv6 Subnet Calculator',
		description: 'Calculate IPv6 subnet information with 128-bit addressing and modern network prefix notation.',
		get navOptions() {
			return versionOptions;
		},
		onNavChange: handleVersionChange,
		contentClass: 'ipv6-calc-card',
		get selectedNav() {
			return $.get(selectedVersion);
		},

		set selectedNav($$value) {
			$.set(selectedVersion, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var div = $.first_child(fragment_1);
			var div_1 = $.sibling($.child(div), 2);
			var div_2 = $.child(div_1);
			var div_3 = $.sibling($.child(div_2), 2);
			var input = $.child(div_3);

			$.remove_input_defaults(input);

			var node = $.sibling(input, 2);

			Tooltip(node, {
				text: 'Enter IPv6 address with prefix (e.g., 2001:db8::/64) or address only',
				children: ($$anchor, $$slotProps) => {
					Icon($$anchor, { name: 'help', size: 'sm' });
				},
				$$slots: { default: true }
			});

			$.reset(div_3);
			$.reset(div_2);

			var div_4 = $.sibling(div_2, 2);
			var div_5 = $.sibling($.child(div_4), 2);
			var span = $.child(div_5);
			var text = $.only_child(span);
			var input_1 = $.sibling(span, 2);

			$.remove_input_defaults(input_1);

			var input_2 = $.sibling(input_1, 2);

			$.remove_input_defaults(input_2);
			$.reset(div_5);

			var p_1 = $.sibling(div_5, 2);
			var text_1 = $.only_child(p_1, true);

			$.reset(div_4);
			$.reset(div_1);
			$.reset(div);

			var div_6 = $.sibling(div, 2);
			var div_7 = $.sibling($.child(div_6), 2);
			var button = $.child(div_7);
			var button_1 = $.sibling(button, 2);
			var button_2 = $.sibling(button_1, 2);
			var button_3 = $.sibling(button_2, 2);
			var button_4 = $.sibling(button_3, 2);
			var button_5 = $.sibling(button_4, 2);

			$.reset(div_7);
			$.reset(div_6);

			var node_1 = $.sibling(div_6, 2);

			{
				var consequent_1 = ($$anchor) => {
					var div_8 = root_1();
					var div_9 = $.child(div_8);
					var div_10 = $.sibling($.child(div_9), 2);
					var div_11 = $.child(div_10);
					var div_12 = $.sibling($.child(div_11), 2);
					var span_1 = $.child(div_12);
					var text_2 = $.only_child(span_1);
					var button_6 = $.sibling(span_1, 2);
					let classes;
					var node_2 = $.child(button_6);

					{
						let $0 = $.derived(() => clipboard.isCopied('network') ? 'check' : 'copy');

						Icon(node_2, {
							get name() {
								return $.get($0);
							},
							size: 'sm'
						});
					}

					$.reset(button_6);
					$.reset(div_12);
					$.reset(div_11);

					var div_13 = $.sibling(div_11, 2);
					var span_2 = $.sibling($.child(div_13), 2);
					var text_3 = $.only_child(span_2, true);

					$.reset(div_13);
					$.reset(div_10);
					$.reset(div_9);

					var div_14 = $.sibling(div_9, 2);
					var div_15 = $.child(div_14);
					var div_16 = $.sibling($.child(div_15), 2);
					var button_7 = $.child(div_16);
					var node_3 = $.child(button_7);

					Icon(node_3, { name: 'binary', size: 'sm' });

					var text_4 = $.sibling(node_3);

					$.reset(button_7);
					$.reset(div_16);
					$.reset(div_15);

					var div_17 = $.sibling(div_15, 2);
					var div_18 = $.child(div_17);
					var div_19 = $.child(div_18);
					var node_4 = $.sibling($.child(div_19), 2);

					Tooltip(node_4, {
						text: 'Compressed IPv6 notation using :: for consecutive zero groups',
						children: ($$anchor, $$slotProps) => {
							Icon($$anchor, { name: 'help', size: 'sm' });
						},
						$$slots: { default: true }
					});

					$.reset(div_19);

					var div_20 = $.sibling(div_19, 2);
					var code = $.child(div_20);
					var text_5 = $.only_child(code, true);
					var button_8 = $.sibling(code, 2);
					let classes_1;
					var node_5 = $.child(button_8);

					{
						let $0 = $.derived(() => clipboard.isCopied('compressed') ? 'check' : 'copy');

						Icon(node_5, {
							get name() {
								return $.get($0);
							},
							size: 'sm'
						});
					}

					$.reset(button_8);
					$.reset(div_20);
					$.reset(div_18);

					var div_21 = $.sibling(div_18, 2);
					var div_22 = $.child(div_21);
					var node_6 = $.sibling($.child(div_22), 2);

					Tooltip(node_6, {
						text: 'Full 128-bit IPv6 representation with all zero groups shown',
						children: ($$anchor, $$slotProps) => {
							Icon($$anchor, { name: 'help', size: 'sm' });
						},
						$$slots: { default: true }
					});

					$.reset(div_22);

					var div_23 = $.sibling(div_22, 2);
					var code_1 = $.child(div_23);
					var text_6 = $.only_child(code_1, true);
					var button_9 = $.sibling(code_1, 2);
					let classes_2;
					var node_7 = $.child(button_9);

					{
						let $0 = $.derived(() => clipboard.isCopied('expanded') ? 'check' : 'copy');

						Icon(node_7, {
							get name() {
								return $.get($0);
							},
							size: 'sm'
						});
					}

					$.reset(button_9);
					$.reset(div_23);
					$.reset(div_21);

					var div_24 = $.sibling(div_21, 2);
					var div_25 = $.child(div_24);
					var node_8 = $.sibling($.child(div_25), 2);

					Tooltip(node_8, {
						text: 'IPv6 subnet mask showing network portion (compressed format)',
						children: ($$anchor, $$slotProps) => {
							Icon($$anchor, { name: 'help', size: 'sm' });
						},
						$$slots: { default: true }
					});

					$.reset(div_25);

					var div_26 = $.sibling(div_25, 2);
					var code_2 = $.child(div_26);
					var text_7 = $.only_child(code_2, true);
					var button_10 = $.sibling(code_2, 2);
					let classes_3;
					var node_9 = $.child(button_10);

					{
						let $0 = $.derived(() => clipboard.isCopied('mask') ? 'check' : 'copy');

						Icon(node_9, {
							get name() {
								return $.get($0);
							},
							size: 'sm'
						});
					}

					$.reset(button_10);
					$.reset(div_26);
					$.reset(div_24);

					var div_27 = $.sibling(div_24, 2);
					var div_28 = $.child(div_27);
					var node_10 = $.sibling($.child(div_28), 2);

					Tooltip(node_10, {
						text: 'First and last assignable addresses in the subnet',
						children: ($$anchor, $$slotProps) => {
							Icon($$anchor, { name: 'help', size: 'sm' });
						},
						$$slots: { default: true }
					});

					$.reset(div_28);

					var div_29 = $.sibling(div_28, 2);
					var code_3 = $.child(div_29);
					var text_8 = $.only_child(code_3);
					var button_11 = $.sibling(code_3, 2);
					let classes_4;
					var node_11 = $.child(button_11);

					{
						let $0 = $.derived(() => clipboard.isCopied('range') ? 'check' : 'copy');

						Icon(node_11, {
							get name() {
								return $.get($0);
							},
							size: 'sm'
						});
					}

					$.reset(button_11);
					$.reset(div_29);
					$.reset(div_27);

					var div_30 = $.sibling(div_27, 2);
					var div_31 = $.child(div_30);
					var node_12 = $.sibling($.child(div_31), 2);

					Tooltip(node_12, {
						text: 'Number of addresses available for host assignment (excluding network/broadcast concepts)',
						children: ($$anchor, $$slotProps) => {
							Icon($$anchor, { name: 'help', size: 'sm' });
						},
						$$slots: { default: true }
					});

					$.reset(div_31);

					var div_32 = $.sibling(div_31, 2);
					var code_4 = $.child(div_32);
					var text_9 = $.only_child(code_4, true);
					var button_12 = $.sibling(code_4, 2);
					let classes_5;
					var node_13 = $.child(button_12);

					{
						let $0 = $.derived(() => clipboard.isCopied('assignable') ? 'check' : 'copy');

						Icon(node_13, {
							get name() {
								return $.get($0);
							},
							size: 'sm'
						});
					}

					$.reset(button_12);
					$.reset(div_32);
					$.reset(div_30);

					var div_33 = $.sibling(div_30, 2);
					var div_34 = $.child(div_33);
					var node_14 = $.sibling($.child(div_34), 2);

					Tooltip(node_14, {
						text: 'PTR record zone for reverse DNS lookups',
						children: ($$anchor, $$slotProps) => {
							Icon($$anchor, { name: 'help', size: 'sm' });
						},
						$$slots: { default: true }
					});

					$.reset(div_34);

					var div_35 = $.sibling(div_34, 2);
					var code_5 = $.child(div_35);
					var text_10 = $.only_child(code_5, true);
					var button_13 = $.sibling(code_5, 2);
					let classes_6;
					var node_15 = $.child(button_13);

					{
						let $0 = $.derived(() => clipboard.isCopied('reverse') ? 'check' : 'copy');

						Icon(node_15, {
							get name() {
								return $.get($0);
							},
							size: 'sm'
						});
					}

					$.reset(button_13);
					$.reset(div_35);
					$.reset(div_33);

					var node_16 = $.sibling(div_33, 2);

					{
						var consequent = ($$anchor) => {
							var div_36 = root();
							var div_37 = $.child(div_36);
							var node_17 = $.sibling($.child(div_37), 2);

							Tooltip(node_17, {
								text: '128-bit binary representation showing network (1) and host (0) bits',
								children: ($$anchor, $$slotProps) => {
									Icon($$anchor, { name: 'help', size: 'sm' });
								},
								$$slots: { default: true }
							});

							$.reset(div_37);

							var div_38 = $.sibling(div_37, 2);
							var code_6 = $.child(div_38);
							var text_11 = $.only_child(code_6, true);
							var button_14 = $.sibling(code_6, 2);
							let classes_7;
							var node_18 = $.child(button_14);

							{
								let $0 = $.derived(() => clipboard.isCopied('binary') ? 'check' : 'copy');

								Icon(node_18, {
									get name() {
										return $.get($0);
									},
									size: 'sm'
								});
							}

							$.reset(button_14);
							$.reset(div_38);
							$.reset(div_36);

							$.template_effect(
								($0) => {
									$.set_text(text_11, $.get(subnetResult).subnet.binaryPrefix);
									classes_7 = $.set_class(button_14, 1, 'btn btn-icon copy-btn svelte-13utf9w', null, classes_7, { copied: $0 });
								},
								[() => clipboard.isCopied('binary')]
							);

							$.delegated('click', button_14, () => $.get(subnetResult)?.subnet && clipboard.copy($.get(subnetResult).subnet.binaryPrefix, 'binary'));
							$.append($$anchor, div_36);
						};

						$.if(node_16, ($$render) => {
							if ($.get(showBinaryView)) $$render(consequent);
						});
					}

					$.reset(div_17);
					$.reset(div_14);

					var div_39 = $.sibling(div_14, 2);
					var div_40 = $.sibling($.child(div_39), 2);
					var div_41 = $.child(div_40);
					var p_2 = $.sibling($.child(div_41), 2);
					var text_12 = $.only_child(p_2);

					$.reset(div_41);

					var div_42 = $.sibling(div_41, 2);
					var div_43 = $.child(div_42);
					var div_44 = $.child(div_43);
					var span_3 = $.sibling($.child(div_44), 2);
					var text_13 = $.only_child(span_3);

					$.reset(div_44);

					var div_45 = $.sibling(div_44, 2);

					$.reset(div_43);

					var div_46 = $.sibling(div_43, 2);
					var div_47 = $.child(div_46);
					var span_4 = $.sibling($.child(div_47), 2);
					var text_14 = $.only_child(span_4);

					$.reset(div_47);

					var div_48 = $.sibling(div_47, 2);

					$.reset(div_46);
					$.reset(div_42);
					$.next(2);
					$.reset(div_40);
					$.reset(div_39);
					$.reset(div_8);

					$.template_effect(
						($0, $1, $2, $3, $4, $5, $6, $7, $8) => {
							$.set_text(text_2, `${$.get(subnetResult).subnet.networkCompressed ?? ''}/${$.get(subnetResult).subnet.prefixLength ?? ''}`);
							classes = $.set_class(button_6, 1, 'btn btn-icon copy-btn svelte-13utf9w', null, classes, { copied: $0 });
							$.set_text(text_3, $1);
							$.set_text(text_4, ` ${$.get(showBinaryView) ? 'Hide' : 'Show'} Binary`);
							$.set_text(text_5, $.get(subnetResult).subnet.networkCompressed);
							classes_1 = $.set_class(button_8, 1, 'btn btn-icon copy-btn svelte-13utf9w', null, classes_1, { copied: $2 });
							$.set_text(text_6, $.get(subnetResult).subnet.networkExpanded);
							classes_2 = $.set_class(button_9, 1, 'btn btn-icon copy-btn svelte-13utf9w', null, classes_2, { copied: $3 });
							$.set_text(text_7, $.get(subnetResult).subnet.subnetMask);
							classes_3 = $.set_class(button_10, 1, 'btn btn-icon copy-btn svelte-13utf9w', null, classes_3, { copied: $4 });
							$.set_text(text_8, `${$.get(subnetResult).subnet.firstAddress ?? ''} - ${$.get(subnetResult).subnet.lastAddress ?? ''}`);
							classes_4 = $.set_class(button_11, 1, 'btn btn-icon copy-btn svelte-13utf9w', null, classes_4, { copied: $5 });
							$.set_text(text_9, $6);
							classes_5 = $.set_class(button_12, 1, 'btn btn-icon copy-btn svelte-13utf9w', null, classes_5, { copied: $7 });
							$.set_text(text_10, $.get(subnetResult).subnet.reverseZone);
							classes_6 = $.set_class(button_13, 1, 'btn btn-icon copy-btn svelte-13utf9w', null, classes_6, { copied: $8 });
							$.set_text(text_12, `Showing network and host portions for ${$.get(subnetResult).subnet.networkCompressed ?? ''}/${$.get(prefixLength) ?? ''}`);
							$.set_text(text_13, `${$.get(prefixLength) ?? ''} bits`);
							$.set_style(div_45, `width: ${$.get(prefixLength) / 128 * 100}%`);
							$.set_text(text_14, `${128 - $.get(prefixLength)} bits`);
							$.set_style(div_48, `width: ${(128 - $.get(prefixLength)) / 128 * 100}%`);
						},
						[
							() => clipboard.isCopied('network'),
							() => formatLargeNumber($.get(subnetResult).subnet.totalAddresses),
							() => clipboard.isCopied('compressed'),
							() => clipboard.isCopied('expanded'),
							() => clipboard.isCopied('mask'),
							() => clipboard.isCopied('range'),
							() => formatLargeNumber($.get(subnetResult).subnet.assignableAddresses),
							() => clipboard.isCopied('assignable'),
							() => clipboard.isCopied('reverse')
						]
					);

					$.delegated('click', button_6, () => $.get(subnetResult)?.subnet && clipboard.copy(`${$.get(subnetResult).subnet.networkCompressed}/${$.get(subnetResult).subnet.prefixLength}`, 'network'));
					$.delegated('click', button_7, () => $.set(showBinaryView, !$.get(showBinaryView)));
					$.delegated('click', button_8, () => $.get(subnetResult)?.subnet && clipboard.copy($.get(subnetResult).subnet.networkCompressed, 'compressed'));
					$.delegated('click', button_9, () => $.get(subnetResult)?.subnet && clipboard.copy($.get(subnetResult).subnet.networkExpanded, 'expanded'));
					$.delegated('click', button_10, () => $.get(subnetResult)?.subnet && clipboard.copy($.get(subnetResult).subnet.subnetMask, 'mask'));
					$.delegated('click', button_11, () => $.get(subnetResult)?.subnet && clipboard.copy(`${$.get(subnetResult).subnet.firstAddress} - ${$.get(subnetResult).subnet.lastAddress}`, 'range'));
					$.delegated('click', button_12, () => $.get(subnetResult)?.subnet && clipboard.copy($.get(subnetResult).subnet.assignableAddresses, 'assignable'));
					$.delegated('click', button_13, () => $.get(subnetResult)?.subnet && clipboard.copy($.get(subnetResult).subnet.reverseZone, 'reverse'));
					$.append($$anchor, div_8);
				};

				var consequent_2 = ($$anchor) => {
					var div_49 = root_2();
					var div_50 = $.child(div_49);
					var p_3 = $.sibling($.child(div_50), 2);
					var text_15 = $.only_child(p_3, true);

					$.reset(div_50);
					$.reset(div_49);
					$.template_effect(() => $.set_text(text_15, $.get(subnetResult).error));
					$.append($$anchor, div_49);
				};

				$.if(node_1, ($$render) => {
					if ($.get(subnetResult) && $.get(subnetResult).success && $.get(subnetResult).subnet) $$render(consequent_1); else if ($.get(subnetResult) && !$.get(subnetResult).success) $$render(consequent_2, 1);
				});
			}

			$.template_effect(
				($0) => {
					$.set_text(text, `/${$.get(prefixLength) ?? ''}`);
					$.set_text(text_1, $0);
					$.set_class(button, 1, `preset-btn ${$.get(activePreset) === 'doc-48' ? 'active' : ''}`, 'svelte-13utf9w');
					$.set_class(button_1, 1, `preset-btn ${$.get(activePreset) === 'doc-64' ? 'active' : ''}`, 'svelte-13utf9w');
					$.set_class(button_2, 1, `preset-btn ${$.get(activePreset) === 'link-local' ? 'active' : ''}`, 'svelte-13utf9w');
					$.set_class(button_3, 1, `preset-btn ${$.get(activePreset) === 'loopback' ? 'active' : ''}`, 'svelte-13utf9w');
					$.set_class(button_4, 1, `preset-btn ${$.get(activePreset) === 'google-dns' ? 'active' : ''}`, 'svelte-13utf9w');
					$.set_class(button_5, 1, `preset-btn ${$.get(activePreset) === 'multicast' ? 'active' : ''}`, 'svelte-13utf9w');
				},
				[() => getPrefixDescription($.get(prefixLength))]
			);

			$.delegated('input', input, (e) => handleAddressInput(e.target?.value || ''));
			$.bind_value(input, () => $.get(networkAddress), ($$value) => $.set(networkAddress, $$value));
			$.bind_value(input_1, () => $.get(prefixLength), ($$value) => $.set(prefixLength, $$value));
			$.bind_value(input_2, () => $.get(prefixLength), ($$value) => $.set(prefixLength, $$value));
			$.delegated('click', button, () => setPreset('2001:db8::', 48));
			$.delegated('click', button_1, () => setPreset('2001:db8::', 64));
			$.delegated('click', button_2, () => setPreset('fe80::', 64));
			$.delegated('click', button_3, () => setPreset('::1', 128));
			$.delegated('click', button_4, () => setPreset('2001:4860:4860::', 48));
			$.delegated('click', button_5, () => setPreset('ff02::1', 128));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['input', 'click']);