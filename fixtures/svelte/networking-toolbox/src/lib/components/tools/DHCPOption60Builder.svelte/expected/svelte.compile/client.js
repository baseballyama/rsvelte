import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';

import {
	generateOption60,
	isValidVendorClass,
	VENDOR_PRESETS,
	getDefaultNetworkConfig
} from '$lib/utils/dhcp-option60.js';

import { useClipboard, useExamples } from '$lib/composables';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<div class="input-group svelte-11wcy3f"><label for="custom" class="svelte-11wcy3f"><!> Custom Vendor Class</label> <input id="custom" type="text" placeholder="MyCustomVendorClass" maxlength="255" class="svelte-11wcy3f"/> <span class="help-text svelte-11wcy3f">1-255 printable ASCII characters</span></div>`);
var root_2 = $.from_html(`<div class="input-group svelte-11wcy3f"><label class="svelte-11wcy3f"><!> </label> <input type="text" class="svelte-11wcy3f"/> <span class="help-text svelte-11wcy3f"> </span></div>`);
var root_3 = $.from_html(`<div class="input-row svelte-11wcy3f"></div>`);
var root_4 = $.from_html(`<div class="input-group svelte-11wcy3f"><label for="serverIp" class="svelte-11wcy3f"><!> </label> <input id="serverIp" type="text" placeholder="192.168.10.5" class="svelte-11wcy3f"/> <span class="help-text svelte-11wcy3f">IP address of the provisioning server</span></div>`);
var root_5 = $.from_html(`<div class="input-group svelte-11wcy3f"><label for="bootFilename" class="svelte-11wcy3f"><!> </label> <input id="bootFilename" type="text" class="svelte-11wcy3f"/> <span class="help-text svelte-11wcy3f">Name of the configuration or boot file</span></div>`);
var root_6 = $.from_html(`<div class="error-message svelte-11wcy3f"><!> </div>`);
var root_7 = $.from_html(`<div class="errors svelte-11wcy3f"></div>`);
var root_8 = $.from_html(`<div class="output-group svelte-11wcy3f"><div class="output-header svelte-11wcy3f"><h4 class="svelte-11wcy3f"> </h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-11wcy3f"> </pre> <p class="format-hint svelte-11wcy3f"> </p></div>`);
var root_9 = $.from_html(`<li class="svelte-11wcy3f"></li>`);
var root_10 = $.from_html(`<div class="card results svelte-11wcy3f"><h3 class="svelte-11wcy3f">Generated Configurations</h3> <div class="vci-section svelte-11wcy3f"><div class="vci-header svelte-11wcy3f"><h4 class="svelte-11wcy3f"><!> Vendor Class Identifier (Option 60)</h4> <button type="button"><!> </button></div> <code class="vci-value svelte-11wcy3f"> </code> <div class="use-case svelte-11wcy3f"><!> <p class="svelte-11wcy3f"><strong class="svelte-11wcy3f">Use Case:</strong> </p></div></div> <div class="output-formats svelte-11wcy3f"></div></div> <div class="card info svelte-11wcy3f"><h3 class="svelte-11wcy3f">Important Notes</h3> <ul class="notes-list svelte-11wcy3f"></ul></div>`, 1);
var root_11 = $.from_html(`<!> <div class="card input-card svelte-11wcy3f"><div class="card-header svelte-11wcy3f"><h3 class="svelte-11wcy3f">Vendor Class Configuration</h3></div> <div class="card-content"><section class="inputs svelte-11wcy3f"><div class="input-group svelte-11wcy3f"><label for="preset" class="svelte-11wcy3f"><!> Vendor Preset</label> <select id="preset" class="svelte-11wcy3f"></select> <span class="help-text svelte-11wcy3f"> </span></div> <!> <div class="advanced-section svelte-11wcy3f"><details open="" class="svelte-11wcy3f"><summary class="svelte-11wcy3f"><h3 class="svelte-11wcy3f">Advanced Options</h3></summary> <div class="input-group svelte-11wcy3f"><label for="subnet" class="svelte-11wcy3f"><!> Subnet (CIDR)</label> <input id="subnet" type="text" placeholder="192.168.10.0/24" class="svelte-11wcy3f"/> <span class="help-text svelte-11wcy3f">Network address in CIDR notation</span></div> <div class="input-row svelte-11wcy3f"></div> <!> <!> <!> <div class="input-group svelte-11wcy3f"><label for="mikrotikServerName" class="svelte-11wcy3f"><!> MikroTik DHCP Server Name</label> <input id="mikrotikServerName" type="text" placeholder="dhcp1" class="svelte-11wcy3f"/> <span class="help-text svelte-11wcy3f">Name of DHCP server in MikroTik config</span></div> <div class="input-group svelte-11wcy3f"><label for="leaseTime" class="svelte-11wcy3f"><!> Lease Time (dnsmasq)</label> <input id="leaseTime" type="text" placeholder="24h" class="svelte-11wcy3f"/> <span class="help-text svelte-11wcy3f">DHCP lease time (e.g., 24h, 1h, 30m)</span></div></details></div> <!></section></div></div> <!>`, 1);

export default function DHCPOption60Builder($$anchor, $$props) {
	$.push($$props, true);

	let selectedPreset = $.state('cisco-phone');
	let customValue = $.state('');
	let result = $.state(null);
	let errors = $.state($.proxy([]));

	// Network configuration state - derived from preset
	let networkConfig = $.state($.proxy(getDefaultNetworkConfig('cisco-phone')));

	const clipboard = useClipboard();

	const examplesList = [
		{
			preset: 'cisco-phone',
			description: 'Cisco IP Phones with TFTP'
		},
		{ preset: 'cisco-ap', description: 'Cisco APs with Option 43' },
		{ preset: 'pxe-client', description: 'PXE network boot' },
		{ preset: 'aruba-ap', description: 'Aruba wireless APs' }
	];

	const examples = useExamples(examplesList);

	const importantNotes = [
		'<strong>Option 60</strong> (Vendor Class Identifier) allows DHCP servers to provide different configurations based on client type',
		'Class-based policies enable <strong>separate IP pools</strong> and options for different device types',
		'Wireless APs typically require both <strong>Option 60 and Option 43</strong> for controller discovery',
		'Test configurations in a lab environment before deploying to production networks',
		'Adjust subnet addresses, pool ranges, and option values to match your network design'
	];

	const poolFields = $.derived(() => [
		{
			id: 'poolStart',
			icon: 'arrow-right',
			label: 'Pool Start',
			help: 'First IP in matching pool',
			placeholder: '192.168.10.100',
			bind: () => $.get(networkConfig).poolStart,
			set: (v) => $.get(networkConfig).poolStart = v
		},

		{
			id: 'poolEnd',
			icon: 'arrow-left',
			label: 'Pool End',
			help: 'Last IP in matching pool',
			placeholder: '192.168.10.200',
			bind: () => $.get(networkConfig).poolEnd,
			set: (v) => $.get(networkConfig).poolEnd = v
		}
	]);

	const nonMatchingPoolFields = $.derived(() => [
		{
			id: 'nonMatchingPoolStart',
			icon: 'arrow-right',
			label: 'Non-Matching Pool Start',
			help: 'First IP for non-matching clients',
			placeholder: '192.168.10.50',
			bind: () => $.get(networkConfig).nonMatchingPoolStart,
			set: (v) => $.get(networkConfig).nonMatchingPoolStart = v
		},

		{
			id: 'nonMatchingPoolEnd',
			icon: 'arrow-left',
			label: 'Non-Matching Pool End',
			help: 'Last IP for non-matching clients',
			placeholder: '192.168.10.99',
			bind: () => $.get(networkConfig).nonMatchingPoolEnd,
			set: (v) => $.get(networkConfig).nonMatchingPoolEnd = v
		}
	]);

	// Track previous preset to detect changes
	let prevPreset = $.state('cisco-phone');

	// Reactive: generate when inputs change
	$.user_effect(() => {
		// Reset network config when preset changes
		if ($.get(selectedPreset) !== $.get(prevPreset)) {
			$.set(networkConfig, getDefaultNetworkConfig($.get(selectedPreset)), true);
			$.set(prevPreset, $.get(selectedPreset), true);
		}

		generate();
	});

	// Determine which fields to show based on preset
	const needsServerIp = $.derived(() => ['cisco-phone', 'pxe-client', 'docsis'].includes($.get(selectedPreset)));

	const needsBootFilename = $.derived(() => ['cisco-phone', 'pxe-client', 'docsis'].includes($.get(selectedPreset)));

	const needsNonMatchingPool = $.derived(() => [
		'cisco-phone',
		'cisco-ap',
		'aruba-ap',
		'ruckus-ap',
		'unifi-ap',
		'meraki-ap',
		'pxe-client',
		'custom'
	].includes($.get(selectedPreset)));

	// Validation functions
	function isValidIPv4(ip) {
		const parts = ip.split('.');

		if (parts.length !== 4) return false;

		return parts.every((part) => {
			const num = parseInt(part, 10);

			return !isNaN(num) && num >= 0 && num <= 255 && part === num.toString();
		});
	}

	function isValidCIDR(cidr) {
		const parts = cidr.split('/');

		if (parts.length !== 2) return false;

		const prefix = parseInt(parts[1], 10);

		return isValidIPv4(parts[0]) && !isNaN(prefix) && prefix >= 0 && prefix <= 32;
	}

	function isValidFilename(filename) {
		// Basic filename validation - no empty, no path separators
		return filename.trim().length > 0 && !(/[/\\]/).test(filename);
	}

	function validateNetworkConfig() {
		const validationErrors = [];

		// Validate subnet
		if (!isValidCIDR($.get(networkConfig).subnet)) {
			validationErrors.push('Invalid subnet CIDR notation (e.g., 192.168.10.0/24)');
		}

		// Validate pool IPs
		if (!isValidIPv4($.get(networkConfig).poolStart)) {
			validationErrors.push('Invalid pool start IP address');
		}

		if (!isValidIPv4($.get(networkConfig).poolEnd)) {
			validationErrors.push('Invalid pool end IP address');
		}

		// Validate non-matching pool if provided
		if ($.get(networkConfig).nonMatchingPoolStart && !isValidIPv4($.get(networkConfig).nonMatchingPoolStart)) {
			validationErrors.push('Invalid non-matching pool start IP address');
		}

		if ($.get(networkConfig).nonMatchingPoolEnd && !isValidIPv4($.get(networkConfig).nonMatchingPoolEnd)) {
			validationErrors.push('Invalid non-matching pool end IP address');
		}

		// Validate server IP if needed and provided
		if ($.get(needsServerIp) && $.get(networkConfig).serverIp && !isValidIPv4($.get(networkConfig).serverIp)) {
			validationErrors.push('Invalid server IP address');
		}

		// Validate boot filename if needed and provided
		if ($.get(needsBootFilename) && $.get(networkConfig).bootFilename && !isValidFilename($.get(networkConfig).bootFilename)) {
			validationErrors.push('Invalid boot filename');
		}

		// Validate MikroTik server name
		if ($.get(networkConfig).mikrotikServerName && $.get(networkConfig).mikrotikServerName.trim().length === 0) {
			validationErrors.push('MikroTik server name cannot be empty');
		}

		// Validate lease time format (basic check)
		if ($.get(networkConfig).leaseTime && !(/^\d+[smhd]$/).test($.get(networkConfig).leaseTime.trim())) {
			validationErrors.push('Invalid lease time format (e.g., 24h, 1h, 30m)');
		}

		return validationErrors;
	}

	function generate() {
		$.set(errors, [], true);
		$.set(result, null);

		try {
			// Validate custom input if custom preset
			if ($.get(selectedPreset) === 'custom') {
				if (!$.get(customValue).trim()) {
					$.set(errors, ['Custom vendor class identifier is required'], true);

					return;
				}

				if (!isValidVendorClass($.get(customValue))) {
					$.set(
						errors,
						[
							'Invalid vendor class identifier. Must be 1-255 printable ASCII characters.'
						],
						true
					);

					return;
				}
			}

			// Validate network configuration
			const validationErrors = validateNetworkConfig();

			if (validationErrors.length > 0) {
				$.set(errors, validationErrors, true);

				return;
			}

			$.set(result, generateOption60($.get(selectedPreset), $.get(customValue) || undefined, $.get(networkConfig)), true);
		} catch(err) {
			$.set(
				errors,
				[
					err instanceof Error ? err.message : 'Failed to generate configuration'
				],
				true
			);
		}
	}

	function loadExample(example, index) {
		$.set(selectedPreset, example.preset, true);

		if (example.preset === 'custom') {
			$.set(customValue, '');
		}

		examples.select(index);
	}

	var fragment = root_11();
	var node = $.first_child(fragment);

	ExamplesCard(node, {
		get examples() {
			return examplesList;
		},

		get selectedIndex() {
			return examples.selectedIndex;
		},
		onSelect: loadExample,
		getLabel: (ex) => VENDOR_PRESETS[ex.preset].name,
		getDescription: (ex) => ex.description,
		getTooltip: (ex) => `Generate config for ${VENDOR_PRESETS[ex.preset].name}`
	});

	var div = $.sibling(node, 2);
	var div_1 = $.sibling($.child(div), 2);
	var section = $.child(div_1);
	var div_2 = $.child(section);
	var label = $.child(div_2);
	var node_1 = $.child(label);

	Icon(node_1, { name: 'tag', size: 'sm' });
	$.next();
	$.reset(label);

	var select = $.sibling(label, 2);

	$.each(select, 21, () => Object.entries(VENDOR_PRESETS), ([value, info]) => value, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let value = () => $.get($$array)[0];
		let info = () => $.get($$array)[1];
		var option = root();
		var text = $.only_child(option, true);
		var option_value = {};

		$.template_effect(() => {
			$.set_text(text, info().name);

			if (option_value !== (option_value = value())) {
				option.value = (option.__value = option_value) ?? '';
			}
		});

		$.append($$anchor, option);
	});

	$.reset(select);
	$.init_select(select);

	var span = $.sibling(select, 2);
	var text_1 = $.only_child(span, true);

	$.reset(div_2);

	var node_2 = $.sibling(div_2, 2);

	{
		var consequent = ($$anchor) => {
			var div_3 = root_1();
			var label_1 = $.child(div_3);
			var node_3 = $.child(label_1);

			Icon(node_3, { name: 'edit', size: 'sm' });
			$.next();
			$.reset(label_1);

			var input = $.sibling(label_1, 2);

			$.remove_input_defaults(input);
			$.next(2);
			$.reset(div_3);
			$.bind_value(input, () => $.get(customValue), ($$value) => $.set(customValue, $$value));
			$.append($$anchor, div_3);
		};

		$.if(node_2, ($$render) => {
			if ($.get(selectedPreset) === 'custom') $$render(consequent);
		});
	}

	var div_4 = $.sibling(node_2, 2);
	var details = $.child(div_4);
	var div_5 = $.sibling($.child(details), 2);
	var label_2 = $.child(div_5);
	var node_4 = $.child(label_2);

	Icon(node_4, { name: 'network', size: 'sm' });
	$.next();
	$.reset(label_2);

	var input_1 = $.sibling(label_2, 2);

	$.remove_input_defaults(input_1);
	$.next(2);
	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);

	$.each(div_6, 21, () => $.get(poolFields), (field) => field.id, ($$anchor, field) => {
		var div_7 = root_2();
		var label_3 = $.child(div_7);
		var node_5 = $.child(label_3);

		Icon(node_5, {
			get name() {
				return $.get(field).icon;
			},
			size: 'sm'
		});

		var text_2 = $.sibling(node_5);

		$.reset(label_3);

		var input_2 = $.sibling(label_3, 2);

		$.remove_input_defaults(input_2);

		var span_1 = $.sibling(input_2, 2);
		var text_3 = $.only_child(span_1, true);

		$.reset(div_7);

		$.template_effect(
			($0) => {
				$.set_attribute(label_3, 'for', $.get(field).id);
				$.set_text(text_2, ` ${$.get(field).label ?? ''}`);
				$.set_attribute(input_2, 'id', $.get(field).id);
				$.set_value(input_2, $0);
				$.set_attribute(input_2, 'placeholder', $.get(field).placeholder);
				$.set_text(text_3, $.get(field).help);
			},
			[() => $.get(field).bind()]
		);

		$.delegated('input', input_2, (e) => $.get(field).set(e.currentTarget.value));
		$.append($$anchor, div_7);
	});

	$.reset(div_6);

	var node_6 = $.sibling(div_6, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_8 = root_3();

			$.each(div_8, 21, () => $.get(nonMatchingPoolFields), (field) => field.id, ($$anchor, field) => {
				var div_9 = root_2();
				var label_4 = $.child(div_9);
				var node_7 = $.child(label_4);

				Icon(node_7, {
					get name() {
						return $.get(field).icon;
					},
					size: 'sm'
				});

				var text_4 = $.sibling(node_7);

				$.reset(label_4);

				var input_3 = $.sibling(label_4, 2);

				$.remove_input_defaults(input_3);

				var span_2 = $.sibling(input_3, 2);
				var text_5 = $.only_child(span_2, true);

				$.reset(div_9);

				$.template_effect(
					($0) => {
						$.set_attribute(label_4, 'for', $.get(field).id);
						$.set_text(text_4, ` ${$.get(field).label ?? ''}`);
						$.set_attribute(input_3, 'id', $.get(field).id);
						$.set_value(input_3, $0);
						$.set_attribute(input_3, 'placeholder', $.get(field).placeholder);
						$.set_text(text_5, $.get(field).help);
					},
					[() => $.get(field).bind() || '']
				);

				$.delegated('input', input_3, (e) => $.get(field).set(e.currentTarget.value));
				$.append($$anchor, div_9);
			});

			$.reset(div_8);
			$.append($$anchor, div_8);
		};

		$.if(node_6, ($$render) => {
			if ($.get(needsNonMatchingPool)) $$render(consequent_1);
		});
	}

	var node_8 = $.sibling(node_6, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_10 = root_4();
			var label_5 = $.child(div_10);
			var node_9 = $.child(label_5);

			Icon(node_9, { name: 'server', size: 'sm' });

			var text_6 = $.sibling(node_9);

			$.reset(label_5);

			var input_4 = $.sibling(label_5, 2);

			$.remove_input_defaults(input_4);
			$.next(2);
			$.reset(div_10);

			$.template_effect(() => $.set_text(text_6, ` ${$.get(selectedPreset) === 'pxe-client'
				? 'TFTP Server IP'
				: $.get(selectedPreset) === 'docsis' ? 'Config File Server IP' : 'TFTP Server IP'}`));

			$.bind_value(input_4, () => $.get(networkConfig).serverIp, ($$value) => $.get(networkConfig).serverIp = $$value);
			$.append($$anchor, div_10);
		};

		$.if(node_8, ($$render) => {
			if ($.get(needsServerIp)) $$render(consequent_2);
		});
	}

	var node_10 = $.sibling(node_8, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_11 = root_5();
			var label_6 = $.child(div_11);
			var node_11 = $.child(label_6);

			Icon(node_11, { name: 'file', size: 'sm' });

			var text_7 = $.sibling(node_11);

			$.reset(label_6);

			var input_5 = $.sibling(label_6, 2);

			$.remove_input_defaults(input_5);
			$.next(2);
			$.reset(div_11);

			$.template_effect(() => {
				$.set_text(text_7, ` ${$.get(selectedPreset) === 'docsis' ? 'Config Filename' : 'Boot Filename'}`);

				$.set_attribute(input_5, 'placeholder', $.get(selectedPreset) === 'pxe-client'
					? 'pxelinux.0'
					: $.get(selectedPreset) === 'docsis' ? 'modem.cfg' : 'SEPDefault.cnf.xml');
			});

			$.bind_value(input_5, () => $.get(networkConfig).bootFilename, ($$value) => $.get(networkConfig).bootFilename = $$value);
			$.append($$anchor, div_11);
		};

		$.if(node_10, ($$render) => {
			if ($.get(needsBootFilename)) $$render(consequent_3);
		});
	}

	var div_12 = $.sibling(node_10, 2);
	var label_7 = $.child(div_12);
	var node_12 = $.child(label_7);

	Icon(node_12, { name: 'server', size: 'sm' });
	$.next();
	$.reset(label_7);

	var input_6 = $.sibling(label_7, 2);

	$.remove_input_defaults(input_6);
	$.next(2);
	$.reset(div_12);

	var div_13 = $.sibling(div_12, 2);
	var label_8 = $.child(div_13);
	var node_13 = $.child(label_8);

	Icon(node_13, { name: 'clock', size: 'sm' });
	$.next();
	$.reset(label_8);

	var input_7 = $.sibling(label_8, 2);

	$.remove_input_defaults(input_7);
	$.next(2);
	$.reset(div_13);
	$.reset(details);
	$.reset(div_4);

	var node_14 = $.sibling(div_4, 2);

	{
		var consequent_4 = ($$anchor) => {
			var div_14 = root_7();

			$.each(div_14, 21, () => $.get(errors), $.index, ($$anchor, error) => {
				var div_15 = root_6();
				var node_15 = $.child(div_15);

				Icon(node_15, { name: 'alert-triangle', size: 'sm' });

				var text_8 = $.sibling(node_15);

				$.reset(div_15);
				$.template_effect(() => $.set_text(text_8, ` ${$.get(error) ?? ''}`));
				$.append($$anchor, div_15);
			});

			$.reset(div_14);
			$.append($$anchor, div_14);
		};

		$.if(node_14, ($$render) => {
			if ($.get(errors).length > 0) $$render(consequent_4);
		});
	}

	$.reset(section);
	$.reset(div_1);
	$.reset(div);

	var node_16 = $.sibling(div, 2);

	{
		var consequent_5 = ($$anchor) => {
			var fragment_1 = root_10();
			var div_16 = $.first_child(fragment_1);
			var div_17 = $.sibling($.child(div_16), 2);
			var div_18 = $.child(div_17);
			var h4 = $.child(div_18);
			var node_17 = $.child(h4);

			Icon(node_17, { name: 'tag', size: 'sm' });
			$.next();
			$.reset(h4);

			var button = $.sibling(h4, 2);
			let classes;
			var node_18 = $.child(button);

			{
				let $0 = $.derived(() => clipboard.isCopied('vci') ? 'check' : 'copy');

				Icon(node_18, {
					get name() {
						return $.get($0);
					},
					size: 'xs'
				});
			}

			var text_9 = $.sibling(node_18);

			$.reset(button);
			$.reset(div_18);

			var code = $.sibling(div_18, 2);
			var text_10 = $.only_child(code, true);
			var div_19 = $.sibling(code, 2);
			var node_19 = $.child(div_19);

			Icon(node_19, { name: 'info', size: 'sm' });

			var p = $.sibling(node_19, 2);
			var text_11 = $.sibling($.child(p));

			$.reset(p);
			$.reset(div_19);
			$.reset(div_17);

			var div_20 = $.sibling(div_17, 2);

			$.each(
				div_20,
				21,
				() => [
					{
						id: 'isc',
						title: 'ISC DHCP Server',
						content: $.get(result).iscDhcpConfig,
						hint: 'Add to /etc/dhcp/dhcpd.conf'
					},

					{
						id: 'kea',
						title: 'Kea DHCP Server',
						content: $.get(result).keaConfig,
						hint: 'Add to Kea configuration JSON'
					},

					{
						id: 'windows',
						title: 'Windows DHCP Server',
						content: $.get(result).windowsConfig,
						hint: 'Run PowerShell commands as Administrator'
					},

					{
						id: 'dnsmasq',
						title: 'dnsmasq',
						content: $.get(result).dnsmasqConfig,
						hint: 'Add to /etc/dnsmasq.conf'
					},

					{
						id: 'mikrotik',
						title: 'MikroTik RouterOS',
						content: $.get(result).mikrotikConfig,
						hint: 'RouterOS CLI commands'
					}
				],
				(config) => config.id,
				($$anchor, config) => {
					var div_21 = root_8();
					var div_22 = $.child(div_21);
					var h4_1 = $.child(div_22);
					var text_12 = $.only_child(h4_1, true);
					var button_1 = $.sibling(h4_1, 2);
					let classes_1;
					var node_20 = $.child(button_1);

					{
						let $0 = $.derived(() => clipboard.isCopied($.get(config).id) ? 'check' : 'copy');

						Icon(node_20, {
							get name() {
								return $.get($0);
							},
							size: 'xs'
						});
					}

					var text_13 = $.sibling(node_20);

					$.reset(button_1);
					$.reset(div_22);

					var pre = $.sibling(div_22, 2);
					var text_14 = $.only_child(pre, true);
					var p_1 = $.sibling(pre, 2);
					var text_15 = $.only_child(p_1, true);

					$.reset(div_21);

					$.template_effect(
						($0, $1) => {
							$.set_text(text_12, $.get(config).title);
							classes_1 = $.set_class(button_1, 1, 'copy-btn svelte-11wcy3f', null, classes_1, { copied: $0 });
							$.set_text(text_13, ` ${$1 ?? ''}`);
							$.set_text(text_14, $.get(config).content);
							$.set_text(text_15, $.get(config).hint);
						},
						[
							() => clipboard.isCopied($.get(config).id),
							() => clipboard.isCopied($.get(config).id) ? 'Copied' : 'Copy'
						]
					);

					$.delegated('click', button_1, () => clipboard.copy($.get(config).content, $.get(config).id));
					$.append($$anchor, div_21);
				}
			);

			$.reset(div_20);
			$.reset(div_16);

			var div_23 = $.sibling(div_16, 2);
			var ul = $.sibling($.child(div_23), 2);

			$.each(ul, 20, () => importantNotes, (note) => note, ($$anchor, note) => {
				var li = root_9();

				$.html(li, () => note, true);
				$.reset(li);
				$.append($$anchor, li);
			});

			$.reset(ul);
			$.reset(div_23);

			$.template_effect(
				($0, $1) => {
					classes = $.set_class(button, 1, 'copy-btn svelte-11wcy3f', null, classes, { copied: $0 });
					$.set_text(text_9, ` ${$1 ?? ''}`);
					$.set_text(text_10, $.get(result).vendorClass);
					$.set_text(text_11, ` ${$.get(result).useCase ?? ''}`);
				},
				[
					() => clipboard.isCopied('vci'),
					() => clipboard.isCopied('vci') ? 'Copied' : 'Copy'
				]
			);

			$.delegated('click', button, () => clipboard.copy($.get(result).vendorClass, 'vci'));
			$.append($$anchor, fragment_1);
		};

		$.if(node_16, ($$render) => {
			if ($.get(result)) $$render(consequent_5);
		});
	}

	$.template_effect(() => $.set_text(text_1, VENDOR_PRESETS[$.get(selectedPreset)].description));

	$.delegated('change', select, () => {
		examples.clear();
		$.set(customValue, '');
	});

	$.bind_select_value(select, () => $.get(selectedPreset), ($$value) => $.set(selectedPreset, $$value));
	$.bind_value(input_1, () => $.get(networkConfig).subnet, ($$value) => $.get(networkConfig).subnet = $$value);
	$.bind_value(input_6, () => $.get(networkConfig).mikrotikServerName, ($$value) => $.get(networkConfig).mikrotikServerName = $$value);
	$.bind_value(input_7, () => $.get(networkConfig).leaseTime, ($$value) => $.get(networkConfig).leaseTime = $$value);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['change', 'input', 'click']);