import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';

import {
	generateOption60,
	isValidVendorClass,
	VENDOR_PRESETS,
	getDefaultNetworkConfig
} from '$lib/utils/dhcp-option60.js';

import { useClipboard, useExamples } from '$lib/composables';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';

export default function DHCPOption60Builder($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let selectedPreset = 'cisco-phone';
		let customValue = '';
		let result = null;
		let errors = [];

		// Network configuration state - derived from preset
		let networkConfig = getDefaultNetworkConfig('cisco-phone');

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
				bind: () => networkConfig.poolStart,
				set: (v) => networkConfig.poolStart = v
			},

			{
				id: 'poolEnd',
				icon: 'arrow-left',
				label: 'Pool End',
				help: 'Last IP in matching pool',
				placeholder: '192.168.10.200',
				bind: () => networkConfig.poolEnd,
				set: (v) => networkConfig.poolEnd = v
			}
		]);

		const nonMatchingPoolFields = $.derived(() => [
			{
				id: 'nonMatchingPoolStart',
				icon: 'arrow-right',
				label: 'Non-Matching Pool Start',
				help: 'First IP for non-matching clients',
				placeholder: '192.168.10.50',
				bind: () => networkConfig.nonMatchingPoolStart,
				set: (v) => networkConfig.nonMatchingPoolStart = v
			},

			{
				id: 'nonMatchingPoolEnd',
				icon: 'arrow-left',
				label: 'Non-Matching Pool End',
				help: 'Last IP for non-matching clients',
				placeholder: '192.168.10.99',
				bind: () => networkConfig.nonMatchingPoolEnd,
				set: (v) => networkConfig.nonMatchingPoolEnd = v
			}
		]);

		// Track previous preset to detect changes
		let prevPreset = 'cisco-phone';

		// Reactive: generate when inputs change
		// Reset network config when preset changes
		// Determine which fields to show based on preset
		const needsServerIp = $.derived(() => ['cisco-phone', 'pxe-client', 'docsis'].includes(selectedPreset));

		const needsBootFilename = $.derived(() => ['cisco-phone', 'pxe-client', 'docsis'].includes(selectedPreset));

		const needsNonMatchingPool = $.derived(() => [
			'cisco-phone',
			'cisco-ap',
			'aruba-ap',
			'ruckus-ap',
			'unifi-ap',
			'meraki-ap',
			'pxe-client',
			'custom'
		].includes(selectedPreset));

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
			if (!isValidCIDR(networkConfig.subnet)) {
				validationErrors.push('Invalid subnet CIDR notation (e.g., 192.168.10.0/24)');
			}

			// Validate pool IPs
			if (!isValidIPv4(networkConfig.poolStart)) {
				validationErrors.push('Invalid pool start IP address');
			}

			if (!isValidIPv4(networkConfig.poolEnd)) {
				validationErrors.push('Invalid pool end IP address');
			}

			// Validate non-matching pool if provided
			if (networkConfig.nonMatchingPoolStart && !isValidIPv4(networkConfig.nonMatchingPoolStart)) {
				validationErrors.push('Invalid non-matching pool start IP address');
			}

			if (networkConfig.nonMatchingPoolEnd && !isValidIPv4(networkConfig.nonMatchingPoolEnd)) {
				validationErrors.push('Invalid non-matching pool end IP address');
			}

			// Validate server IP if needed and provided
			if (needsServerIp() && networkConfig.serverIp && !isValidIPv4(networkConfig.serverIp)) {
				validationErrors.push('Invalid server IP address');
			}

			// Validate boot filename if needed and provided
			if (needsBootFilename() && networkConfig.bootFilename && !isValidFilename(networkConfig.bootFilename)) {
				validationErrors.push('Invalid boot filename');
			}

			// Validate MikroTik server name
			if (networkConfig.mikrotikServerName && networkConfig.mikrotikServerName.trim().length === 0) {
				validationErrors.push('MikroTik server name cannot be empty');
			}

			// Validate lease time format (basic check)
			if (networkConfig.leaseTime && !(/^\d+[smhd]$/).test(networkConfig.leaseTime.trim())) {
				validationErrors.push('Invalid lease time format (e.g., 24h, 1h, 30m)');
			}

			return validationErrors;
		}

		function generate() {
			errors = [];
			result = null;

			try {
				// Validate custom input if custom preset
				if (selectedPreset === 'custom') {
					if (!customValue.trim()) {
						errors = ['Custom vendor class identifier is required'];

						return;
					}

					if (!isValidVendorClass(customValue)) {
						errors = [
							'Invalid vendor class identifier. Must be 1-255 printable ASCII characters.'
						];

						return;
					}
				}

				// Validate network configuration
				const validationErrors = validateNetworkConfig();

				if (validationErrors.length > 0) {
					errors = validationErrors;

					return;
				}

				result = generateOption60(selectedPreset, customValue || undefined, networkConfig);
			} catch(err) {
				errors = [
					err instanceof Error ? err.message : 'Failed to generate configuration'
				];
			}
		}

		function loadExample(example, index) {
			selectedPreset = example.preset;

			if (example.preset === 'custom') {
				customValue = '';
			}

			examples.select(index);
		}

		ExamplesCard($$renderer, {
			examples: examplesList,
			selectedIndex: examples.selectedIndex,
			onSelect: loadExample,
			getLabel: (ex) => VENDOR_PRESETS[ex.preset].name,
			getDescription: (ex) => ex.description,
			getTooltip: (ex) => `Generate config for ${VENDOR_PRESETS[ex.preset].name}`
		});

		$$renderer.push(`<!----> <div class="card input-card svelte-11wcy3f"><div class="card-header svelte-11wcy3f"><h3 class="svelte-11wcy3f">Vendor Class Configuration</h3></div> <div class="card-content"><section class="inputs svelte-11wcy3f"><div class="input-group svelte-11wcy3f"><label for="preset" class="svelte-11wcy3f">`);
		Icon($$renderer, { name: 'tag', size: 'sm' });
		$$renderer.push(`<!----> Vendor Preset</label> `);

		$$renderer.select(
			{
				id: 'preset',
				value: selectedPreset,
				onchange: () => {
					examples.clear();
					customValue = '';
				},
				class: ''
			},
			($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(Object.entries(VENDOR_PRESETS));

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let [value, info] = each_array[$$index];

					$$renderer.option({ value }, ($$renderer) => {
						$$renderer.push(`${$.escape(info.name)}`);
					});
				}

				$$renderer.push(`<!--]-->`);
			},
			'svelte-11wcy3f'
		);

		$$renderer.push(` <span class="help-text svelte-11wcy3f">${$.escape(VENDOR_PRESETS[selectedPreset].description)}</span></div> `);

		if (selectedPreset === 'custom') {
			$$renderer.push(`<!--[0--><div class="input-group svelte-11wcy3f"><label for="custom" class="svelte-11wcy3f">`);
			Icon($$renderer, { name: 'edit', size: 'sm' });
			$$renderer.push(`<!----> Custom Vendor Class</label> <input id="custom" type="text"${$.attr('value', customValue)} placeholder="MyCustomVendorClass" maxlength="255" class="svelte-11wcy3f"/> <span class="help-text svelte-11wcy3f">1-255 printable ASCII characters</span></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="advanced-section svelte-11wcy3f"><details open="" class="svelte-11wcy3f"><summary class="svelte-11wcy3f"><h3 class="svelte-11wcy3f">Advanced Options</h3></summary> <div class="input-group svelte-11wcy3f"><label for="subnet" class="svelte-11wcy3f">`);
		Icon($$renderer, { name: 'network', size: 'sm' });
		$$renderer.push(`<!----> Subnet (CIDR)</label> <input id="subnet" type="text"${$.attr('value', networkConfig.subnet)} placeholder="192.168.10.0/24" class="svelte-11wcy3f"/> <span class="help-text svelte-11wcy3f">Network address in CIDR notation</span></div> <div class="input-row svelte-11wcy3f"><!--[-->`);

		const each_array_1 = $.ensure_array_like(poolFields());

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let field = each_array_1[$$index_1];

			$$renderer.push(`<div class="input-group svelte-11wcy3f"><label${$.attr('for', field.id)} class="svelte-11wcy3f">`);
			Icon($$renderer, { name: field.icon, size: 'sm' });
			$$renderer.push(`<!----> ${$.escape(field.label)}</label> <input${$.attr('id', field.id)} type="text"${$.attr('value', field.bind())}${$.attr('placeholder', field.placeholder)} class="svelte-11wcy3f"/> <span class="help-text svelte-11wcy3f">${$.escape(field.help)}</span></div>`);
		}

		$$renderer.push(`<!--]--></div> `);

		if (needsNonMatchingPool()) {
			$$renderer.push(`<!--[0--><div class="input-row svelte-11wcy3f"><!--[-->`);

			const each_array_2 = $.ensure_array_like(nonMatchingPoolFields());

			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let field = each_array_2[$$index_2];

				$$renderer.push(`<div class="input-group svelte-11wcy3f"><label${$.attr('for', field.id)} class="svelte-11wcy3f">`);
				Icon($$renderer, { name: field.icon, size: 'sm' });
				$$renderer.push(`<!----> ${$.escape(field.label)}</label> <input${$.attr('id', field.id)} type="text"${$.attr('value', field.bind() || '')}${$.attr('placeholder', field.placeholder)} class="svelte-11wcy3f"/> <span class="help-text svelte-11wcy3f">${$.escape(field.help)}</span></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (needsServerIp()) {
			$$renderer.push(`<!--[0--><div class="input-group svelte-11wcy3f"><label for="serverIp" class="svelte-11wcy3f">`);
			Icon($$renderer, { name: 'server', size: 'sm' });

			$$renderer.push(`<!----> ${$.escape(selectedPreset === 'pxe-client'
				? 'TFTP Server IP'
				: selectedPreset === 'docsis' ? 'Config File Server IP' : 'TFTP Server IP')}</label> <input id="serverIp" type="text"${$.attr('value', networkConfig.serverIp)} placeholder="192.168.10.5" class="svelte-11wcy3f"/> <span class="help-text svelte-11wcy3f">IP address of the provisioning server</span></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (needsBootFilename()) {
			$$renderer.push(`<!--[0--><div class="input-group svelte-11wcy3f"><label for="bootFilename" class="svelte-11wcy3f">`);
			Icon($$renderer, { name: 'file', size: 'sm' });

			$$renderer.push(`<!----> ${$.escape(selectedPreset === 'docsis' ? 'Config Filename' : 'Boot Filename')}</label> <input id="bootFilename" type="text"${$.attr('value', networkConfig.bootFilename)}${$.attr('placeholder', selectedPreset === 'pxe-client'
				? 'pxelinux.0'
				: selectedPreset === 'docsis' ? 'modem.cfg' : 'SEPDefault.cnf.xml')} class="svelte-11wcy3f"/> <span class="help-text svelte-11wcy3f">Name of the configuration or boot file</span></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="input-group svelte-11wcy3f"><label for="mikrotikServerName" class="svelte-11wcy3f">`);
		Icon($$renderer, { name: 'server', size: 'sm' });
		$$renderer.push(`<!----> MikroTik DHCP Server Name</label> <input id="mikrotikServerName" type="text"${$.attr('value', networkConfig.mikrotikServerName)} placeholder="dhcp1" class="svelte-11wcy3f"/> <span class="help-text svelte-11wcy3f">Name of DHCP server in MikroTik config</span></div> <div class="input-group svelte-11wcy3f"><label for="leaseTime" class="svelte-11wcy3f">`);
		Icon($$renderer, { name: 'clock', size: 'sm' });
		$$renderer.push(`<!----> Lease Time (dnsmasq)</label> <input id="leaseTime" type="text"${$.attr('value', networkConfig.leaseTime)} placeholder="24h" class="svelte-11wcy3f"/> <span class="help-text svelte-11wcy3f">DHCP lease time (e.g., 24h, 1h, 30m)</span></div></details></div> `);

		if (errors.length > 0) {
			$$renderer.push(`<!--[0--><div class="errors svelte-11wcy3f"><!--[-->`);

			const each_array_3 = $.ensure_array_like(errors);

			for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
				let error = each_array_3[i];

				$$renderer.push(`<div class="error-message svelte-11wcy3f">`);
				Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
				$$renderer.push(`<!----> ${$.escape(error)}</div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></section></div></div> `);

		if (result) {
			$$renderer.push(`<!--[0--><div class="card results svelte-11wcy3f"><h3 class="svelte-11wcy3f">Generated Configurations</h3> <div class="vci-section svelte-11wcy3f"><div class="vci-header svelte-11wcy3f"><h4 class="svelte-11wcy3f">`);
			Icon($$renderer, { name: 'tag', size: 'sm' });
			$$renderer.push(`<!----> Vendor Class Identifier (Option 60)</h4> <button type="button"${$.attr_class('copy-btn svelte-11wcy3f', void 0, { 'copied': clipboard.isCopied('vci') })}>`);

			Icon($$renderer, {
				name: clipboard.isCopied('vci') ? 'check' : 'copy',
				size: 'xs'
			});

			$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('vci') ? 'Copied' : 'Copy')}</button></div> <code class="vci-value svelte-11wcy3f">${$.escape(result.vendorClass)}</code> <div class="use-case svelte-11wcy3f">`);
			Icon($$renderer, { name: 'info', size: 'sm' });
			$$renderer.push(`<!----> <p class="svelte-11wcy3f"><strong class="svelte-11wcy3f">Use Case:</strong> ${$.escape(result.useCase)}</p></div></div> <div class="output-formats svelte-11wcy3f"><!--[-->`);

			const each_array_4 = $.ensure_array_like([
				{
					id: 'isc',
					title: 'ISC DHCP Server',
					content: result.iscDhcpConfig,
					hint: 'Add to /etc/dhcp/dhcpd.conf'
				},

				{
					id: 'kea',
					title: 'Kea DHCP Server',
					content: result.keaConfig,
					hint: 'Add to Kea configuration JSON'
				},

				{
					id: 'windows',
					title: 'Windows DHCP Server',
					content: result.windowsConfig,
					hint: 'Run PowerShell commands as Administrator'
				},

				{
					id: 'dnsmasq',
					title: 'dnsmasq',
					content: result.dnsmasqConfig,
					hint: 'Add to /etc/dnsmasq.conf'
				},

				{
					id: 'mikrotik',
					title: 'MikroTik RouterOS',
					content: result.mikrotikConfig,
					hint: 'RouterOS CLI commands'
				}
			]);

			for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
				let config = each_array_4[$$index_4];

				$$renderer.push(`<div class="output-group svelte-11wcy3f"><div class="output-header svelte-11wcy3f"><h4 class="svelte-11wcy3f">${$.escape(config.title)}</h4> <button type="button"${$.attr_class('copy-btn svelte-11wcy3f', void 0, { 'copied': clipboard.isCopied(config.id) })}>`);

				Icon($$renderer, {
					name: clipboard.isCopied(config.id) ? 'check' : 'copy',
					size: 'xs'
				});

				$$renderer.push(`<!----> ${$.escape(clipboard.isCopied(config.id) ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-11wcy3f">${$.escape(config.content)}</pre> <p class="format-hint svelte-11wcy3f">${$.escape(config.hint)}</p></div>`);
			}

			$$renderer.push(`<!--]--></div></div> <div class="card info svelte-11wcy3f"><h3 class="svelte-11wcy3f">Important Notes</h3> <ul class="notes-list svelte-11wcy3f"><!--[-->`);

			const each_array_5 = $.ensure_array_like(importantNotes);

			for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
				let note = each_array_5[$$index_5];

				$$renderer.push(`<li class="svelte-11wcy3f">${$.html(note)}</li>`);
			}

			$$renderer.push(`<!--]--></ul></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}