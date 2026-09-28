import * as $ from 'svelte/internal/server';
import { untrack } from 'svelte';
import Icon from '$lib/components/global/Icon.svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import { useClipboard } from '$lib/composables';

import {
	buildTFTPOptions,
	parseOption150,
	parseOption66,
	parseOption67,
	getDefaultTFTPConfig
} from '$lib/utils/dhcp-option150.js';

export default function DHCPOption150Builder($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const modeOptions = [
			{ value: 'encode', label: 'Encode', icon: 'wrench' },
			{ value: 'decode', label: 'Decode', icon: 'search' }
		];

		let mode = 'encode';

		let config = {
			...getDefaultTFTPConfig(),
			network: { subnet: '', netmask: '', rangeStart: '', rangeEnd: '' }
		};

		let result = null;
		let decodeMode = 'option150';
		let decodeInput = '';
		let decodeResult150 = null;
		let decodeResult66 = null;
		let decodeResult67 = null;
		let validationErrors = [];
		let networkValidationErrors = [];
		let selectedExampleIndex = null;
		const clipboard = useClipboard();

		const encodeExamples = [
			{
				label: 'Cisco IP Phones',
				option150Servers: ['192.168.1.10', '192.168.1.11'],
				description: 'Redundant TFTP servers for Cisco IP phone configuration'
			},

			{
				label: 'PXE Boot (Standard)',
				option66Server: 'pxe.example.com',
				option67Bootfile: 'pxelinux.0',
				description: 'Standard PXE boot with single TFTP server'
			},

			{
				label: 'PXE Boot (UEFI)',
				option66Server: '192.168.1.10',
				option67Bootfile: 'bootx64.efi',
				description: 'UEFI PXE boot configuration'
			},

			{
				label: 'Combined (Option 150 + 67)',
				option150Servers: ['192.168.1.10', '192.168.1.11'],
				option67Bootfile: 'SEP{MAC}.cnf.xml',
				description: 'Cisco phones with redundant TFTP and config template'
			}
		];

		const decodeExamples = [
			{
				label: 'Option 150: Dual TFTP',
				mode: 'option150',
				hexInput: 'c0a8010ac0a8010b',
				description: '192.168.1.10 and 192.168.1.11'
			},

			{
				label: 'Option 66: Hostname',
				mode: 'option66',
				hexInput: '7078652e6578616d706c652e636f6d',
				description: 'pxe.example.com'
			},

			{
				label: 'Option 67: PXE Boot',
				mode: 'option67',
				hexInput: '7078656c696e75782e30',
				description: 'pxelinux.0'
			},

			{
				label: 'Option 67: UEFI Boot',
				mode: 'option67',
				hexInput: '626f6f747836 42e656669',
				description: 'bootx64.efi'
			}
		];

		// Reactive generation
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		// Clear selected example when switching modes
		function validateAndEncode(cfg = config) {
			const errors = [];
			const netErrors = [];

			// Validate Option 150 servers
			if (cfg.option150Servers && cfg.option150Servers.length > 0) {
				for (let i = 0; i < cfg.option150Servers.length; i++) {
					const server = cfg.option150Servers[i];

					if (!server.trim()) {
						errors.push(`Option 150 Server ${i + 1}: Address is required`);

						continue;
					}

					const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

					if (!ipv4Regex.test(server)) {
						errors.push(`Option 150 Server ${i + 1}: Invalid IPv4 address`);

						continue;
					}

					const octets = server.split('.').map((o) => parseInt(o, 10));

					if (octets.some((o) => o > 255)) {
						errors.push(`Option 150 Server ${i + 1}: Invalid IPv4 address (octets must be 0-255)`);
					}
				}
			}

			// Validate Option 66 (optional)
			if (cfg.option66Server && cfg.option66Server.trim() && cfg.option66Server.trim().length > 255) {
				errors.push('Option 66: Server name too long (max 255 characters)');
			}

			// Validate Option 67 (optional)
			if (cfg.option67Bootfile && cfg.option67Bootfile.trim() && cfg.option67Bootfile.trim().length > 128) {
				errors.push('Option 67: Bootfile name too long (max 128 characters)');
			}

			// Check at least one option is configured
			const hasOption150 = cfg.option150Servers && cfg.option150Servers.some((s) => s.trim());

			const hasOption66 = cfg.option66Server && cfg.option66Server.trim();
			const hasOption67 = cfg.option67Bootfile && cfg.option67Bootfile.trim();

			if (!hasOption150 && !hasOption66 && !hasOption67) {
				errors.push('At least one TFTP option must be configured (150, 66, or 67)');
			}

			// Validate network settings if provided
			if (cfg.network) {
				const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

				if (cfg.network.subnet && cfg.network.subnet.trim() && !ipv4Regex.test(cfg.network.subnet)) {
					netErrors.push('Invalid subnet address');
				}

				if (cfg.network.netmask && cfg.network.netmask.trim() && !ipv4Regex.test(cfg.network.netmask)) {
					netErrors.push('Invalid netmask');
				}

				if (cfg.network.rangeStart && cfg.network.rangeStart.trim() && !ipv4Regex.test(cfg.network.rangeStart)) {
					netErrors.push('Invalid range start address');
				}

				if (cfg.network.rangeEnd && cfg.network.rangeEnd.trim() && !ipv4Regex.test(cfg.network.rangeEnd)) {
					netErrors.push('Invalid range end address');
				}
			}

			validationErrors = errors;
			networkValidationErrors = netErrors;

			if (errors.length === 0) {
				try {
					result = buildTFTPOptions(cfg);
				} catch(error) {
					validationErrors = [error instanceof Error ? error.message : 'Encoding failed'];
					result = null;
				}
			} else {
				result = null;
			}
		}

		function decode() {
			if (!decodeInput.trim()) {
				decodeResult150 = null;
				decodeResult66 = null;
				decodeResult67 = null;
				validationErrors = [];

				return;
			}

			if (!(/^[0-9a-fA-F\s:]+$/).test(decodeInput)) {
				validationErrors = ['Invalid hex input: only hexadecimal characters allowed'];
				decodeResult150 = null;
				decodeResult66 = null;
				decodeResult67 = null;

				return;
			}

			try {
				validationErrors = [];

				if (decodeMode === 'option150') {
					decodeResult150 = parseOption150(decodeInput);
					decodeResult66 = null;
					decodeResult67 = null;
				} else if (decodeMode === 'option66') {
					decodeResult66 = parseOption66(decodeInput);
					decodeResult150 = null;
					decodeResult67 = null;
				} else {
					decodeResult67 = parseOption67(decodeInput);
					decodeResult150 = null;
					decodeResult66 = null;
				}
			} catch(error) {
				validationErrors = [error instanceof Error ? error.message : 'Decoding failed'];
				decodeResult150 = null;
				decodeResult66 = null;
				decodeResult67 = null;
			}
		}

		function addOption150Server() {
			if (!config.option150Servers) {
				config.option150Servers = [''];
			} else {
				config.option150Servers = [...config.option150Servers, ''];
			}
		}

		function removeOption150Server(index) {
			if (config.option150Servers && config.option150Servers.length > 1) {
				config.option150Servers = config.option150Servers.filter((_, i) => i !== index);
			} else if (config.option150Servers) {
				config.option150Servers = [];
			}
		}

		function loadEncodeExample(example, index) {
			config = {
				option150Servers: example.option150Servers ? [...example.option150Servers] : [],
				option66Server: example.option66Server || '',
				option67Bootfile: example.option67Bootfile || '',
				network: { subnet: '', netmask: '', rangeStart: '', rangeEnd: '' }
			};

			selectedExampleIndex = index;
		}

		function loadDecodeExample(example, index) {
			decodeMode = example.mode;
			decodeInput = example.hexInput;
			selectedExampleIndex = index;
			decode();
		}

		function checkIfExampleStillMatches() {
			if (selectedExampleIndex === null) return;

			if (mode === 'encode') {
				const example = encodeExamples[selectedExampleIndex];

				if (!example) {
					selectedExampleIndex = null;

					return;
				}

				const option150Match = (!example.option150Servers || example.option150Servers.length === 0) && (!config.option150Servers || config.option150Servers.length === 0) || example.option150Servers && config.option150Servers && example.option150Servers.length === config.option150Servers.length && example.option150Servers.every((s, i) => s === config.option150Servers[i]);
				const option66Match = (example.option66Server || '') === (config.option66Server || '');
				const option67Match = (example.option67Bootfile || '') === (config.option67Bootfile || '');

				if (!option150Match || !option66Match || !option67Match) {
					selectedExampleIndex = null;
				}
			} else {
				const example = decodeExamples[selectedExampleIndex];

				if (!example) {
					selectedExampleIndex = null;

					return;
				}

				if (decodeInput !== example.hexInput || decodeMode !== example.mode) {
					selectedExampleIndex = null;
				}
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ToolContentContainer($$renderer, {
				title: 'DHCP Options 150/66/67 - TFTP Server Configuration',
				description: 'Configure TFTP servers for PXE boot and Cisco IP phones. Option 150 (Cisco TFTP list), Option 66 (TFTP server name), and Option 67 (bootfile name).',
				navOptions: modeOptions,
				get selectedNav() {
					return mode;
				},

				set selectedNav($$value) {
					mode = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (mode === 'encode') {
						$$renderer.push('<!--[0-->');

						ExamplesCard($$renderer, {
							examples: encodeExamples,
							onSelect: loadEncodeExample,
							getLabel: (ex) => ex.label,
							getDescription: (ex) => ex.description,
							selectedIndex: selectedExampleIndex
						});
					} else {
						$$renderer.push('<!--[-1-->');

						ExamplesCard($$renderer, {
							examples: decodeExamples,
							onSelect: loadDecodeExample,
							getLabel: (ex) => ex.label,
							getDescription: (ex) => ex.description,
							selectedIndex: selectedExampleIndex
						});
					}

					$$renderer.push(`<!--]--> `);

					if (mode === 'encode') {
						$$renderer.push(`<!--[0--><div class="card input-card svelte-854nep"><div class="card-header svelte-854nep"><h3 class="svelte-854nep">Option 150: Cisco TFTP Server List</h3> <p class="help-text svelte-854nep">Multiple IPv4 addresses for redundant TFTP servers (Cisco IP phones)</p></div> <div class="card-content svelte-854nep">`);

						if (config.option150Servers && config.option150Servers.length > 0) {
							$$renderer.push(`<!--[0--><!--[-->`);

							const each_array = $.ensure_array_like(config.option150Servers);

							for (let i = 0, $$length = each_array.length; i < $$length; i++) {
								let _ = each_array[i];

								$$renderer.push(`<div class="server-row svelte-854nep"><div class="input-group flex-grow svelte-854nep"><label${$.attr('for', `opt150-server-${$.stringify(i)}`)} class="svelte-854nep">`);
								Icon($$renderer, { name: 'server', size: 'sm' });
								$$renderer.push(`<!----> Server ${$.escape(i + 1)}</label> <input${$.attr('id', `opt150-server-${$.stringify(i)}`)} type="text"${$.attr('value', config.option150Servers[i])} placeholder="192.168.1.10" class="svelte-854nep"/></div> <button type="button" class="btn-icon svelte-854nep">`);
								Icon($$renderer, { name: 'x', size: 'sm' });
								$$renderer.push(`<!----></button></div>`);
							}

							$$renderer.push(`<!--]-->`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> <button type="button" class="btn-add svelte-854nep">`);
						Icon($$renderer, { name: 'plus', size: 'sm' });
						$$renderer.push(`<!----> Add TFTP Server</button></div></div> <div class="card input-card svelte-854nep"><div class="card-header svelte-854nep"><h3 class="svelte-854nep">Option 66: TFTP Server Name (Standard)</h3> <p class="help-text svelte-854nep">Single hostname or IP address for standard PXE boot</p></div> <div class="card-content svelte-854nep"><div class="input-group svelte-854nep"><label for="opt66-server" class="svelte-854nep">`);
						Icon($$renderer, { name: 'globe', size: 'sm' });
						$$renderer.push(`<!----> TFTP Server Hostname/IP</label> <input id="opt66-server" type="text"${$.attr('value', config.option66Server)} placeholder="tftp.example.com or 192.168.1.10" class="svelte-854nep"/></div></div></div> <div class="card input-card svelte-854nep"><div class="card-header svelte-854nep"><h3 class="svelte-854nep">Option 67: Bootfile Name</h3> <p class="help-text svelte-854nep">Filename to boot from TFTP server (e.g., pxelinux.0 for BIOS, bootx64.efi for UEFI)</p></div> <div class="card-content svelte-854nep"><div class="input-group svelte-854nep"><label for="opt67-bootfile" class="svelte-854nep">`);
						Icon($$renderer, { name: 'file', size: 'sm' });
						$$renderer.push(`<!----> Bootfile Name</label> <input id="opt67-bootfile" type="text"${$.attr('value', config.option67Bootfile)} placeholder="pxelinux.0" class="svelte-854nep"/></div></div></div> `);

						if (validationErrors.length > 0) {
							$$renderer.push(`<!--[0--><div class="card errors-card svelte-854nep"><h3 class="svelte-854nep">Validation Errors</h3> <!--[-->`);

							const each_array_1 = $.ensure_array_like(validationErrors);

							for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
								let error = each_array_1[i];

								$$renderer.push(`<div class="error-message svelte-854nep">`);
								Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
								$$renderer.push(`<!----> ${$.escape(error)}</div>`);
							}

							$$renderer.push(`<!--]--></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (result && validationErrors.length === 0) {
							$$renderer.push('<!--[0-->');

							if (result.option150) {
								$$renderer.push(`<!--[0--><div class="card results svelte-854nep"><h3 class="svelte-854nep">Option 150: TFTP Server List</h3> <div class="output-group svelte-854nep"><div class="output-header svelte-854nep"><h4 class="svelte-854nep">Hex-Encoded (Compact)</h4> <button type="button"${$.attr_class('copy-btn svelte-854nep', void 0, { 'copied': clipboard.isCopied('opt150-hex') })}>`);

								Icon($$renderer, {
									name: clipboard.isCopied('opt150-hex') ? 'check' : 'copy',
									size: 'xs'
								});

								$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('opt150-hex') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-854nep">${$.escape(result.option150.hexEncoded)}</pre></div> <div class="output-group svelte-854nep"><div class="output-header svelte-854nep"><h4 class="svelte-854nep">Wire Format (Spaced)</h4> <button type="button"${$.attr_class('copy-btn svelte-854nep', void 0, { 'copied': clipboard.isCopied('opt150-wire') })}>`);

								Icon($$renderer, {
									name: clipboard.isCopied('opt150-wire') ? 'check' : 'copy',
									size: 'xs'
								});

								$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('opt150-wire') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-854nep">${$.escape(result.option150.wireFormat)}</pre></div> <div class="summary-card svelte-854nep"><div class="svelte-854nep"><strong class="svelte-854nep">Total Length:</strong> ${$.escape(result.option150.totalLength)} bytes</div> <div class="svelte-854nep"><strong class="svelte-854nep">Servers:</strong> ${$.escape(result.option150.servers.length)}</div></div></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (result.option66) {
								$$renderer.push(`<!--[0--><div class="card results svelte-854nep"><h3 class="svelte-854nep">Option 66: TFTP Server Name</h3> <div class="output-group svelte-854nep"><div class="output-header svelte-854nep"><h4 class="svelte-854nep">Value</h4> <button type="button"${$.attr_class('copy-btn svelte-854nep', void 0, { 'copied': clipboard.isCopied('opt66-value') })}>`);

								Icon($$renderer, {
									name: clipboard.isCopied('opt66-value') ? 'check' : 'copy',
									size: 'xs'
								});

								$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('opt66-value') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-854nep">${$.escape(result.option66.value)}</pre></div> <div class="output-group svelte-854nep"><div class="output-header svelte-854nep"><h4 class="svelte-854nep">Hex-Encoded</h4> <button type="button"${$.attr_class('copy-btn svelte-854nep', void 0, { 'copied': clipboard.isCopied('opt66-hex') })}>`);

								Icon($$renderer, {
									name: clipboard.isCopied('opt66-hex') ? 'check' : 'copy',
									size: 'xs'
								});

								$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('opt66-hex') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-854nep">${$.escape(result.option66.hexEncoded)}</pre></div> <div class="summary-card svelte-854nep"><div class="svelte-854nep"><strong class="svelte-854nep">Total Length:</strong> ${$.escape(result.option66.totalLength)} bytes</div></div></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (result.option67) {
								$$renderer.push(`<!--[0--><div class="card results svelte-854nep"><h3 class="svelte-854nep">Option 67: Bootfile Name</h3> <div class="output-group svelte-854nep"><div class="output-header svelte-854nep"><h4 class="svelte-854nep">Value</h4> <button type="button"${$.attr_class('copy-btn svelte-854nep', void 0, { 'copied': clipboard.isCopied('opt67-value') })}>`);

								Icon($$renderer, {
									name: clipboard.isCopied('opt67-value') ? 'check' : 'copy',
									size: 'xs'
								});

								$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('opt67-value') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-854nep">${$.escape(result.option67.value)}</pre></div> <div class="output-group svelte-854nep"><div class="output-header svelte-854nep"><h4 class="svelte-854nep">Hex-Encoded</h4> <button type="button"${$.attr_class('copy-btn svelte-854nep', void 0, { 'copied': clipboard.isCopied('opt67-hex') })}>`);

								Icon($$renderer, {
									name: clipboard.isCopied('opt67-hex') ? 'check' : 'copy',
									size: 'xs'
								});

								$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('opt67-hex') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-854nep">${$.escape(result.option67.hexEncoded)}</pre></div> <div class="summary-card svelte-854nep"><div class="svelte-854nep"><strong class="svelte-854nep">Total Length:</strong> ${$.escape(result.option67.totalLength)} bytes</div></div></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> <hr/> `);

						if (result) {
							$$renderer.push(`<!--[0--><div class="card input-card svelte-854nep"><div class="card-header svelte-854nep"><h3 class="svelte-854nep">Network Settings (Optional)</h3> <p class="help-text svelte-854nep">Customize network values for configuration examples below</p></div> <div class="card-content svelte-854nep"><div class="input-row svelte-854nep"><div class="input-group svelte-854nep"><label for="subnet" class="svelte-854nep">`);
							Icon($$renderer, { name: 'network', size: 'sm' });
							$$renderer.push(`<!----> Subnet</label> <input id="subnet" type="text"${$.attr('value', config.network.subnet)} placeholder="192.168.1.0" class="svelte-854nep"/></div> <div class="input-group svelte-854nep"><label for="netmask" class="svelte-854nep">`);
							Icon($$renderer, { name: 'network', size: 'sm' });
							$$renderer.push(`<!----> Netmask</label> <input id="netmask" type="text"${$.attr('value', config.network.netmask)} placeholder="255.255.255.0" class="svelte-854nep"/></div></div> <div class="input-row svelte-854nep"><div class="input-group svelte-854nep"><label for="range-start" class="svelte-854nep">`);
							Icon($$renderer, { name: 'arrow-right', size: 'sm' });
							$$renderer.push(`<!----> Range Start</label> <input id="range-start" type="text"${$.attr('value', config.network.rangeStart)} placeholder="192.168.1.100" class="svelte-854nep"/></div> <div class="input-group svelte-854nep"><label for="range-end" class="svelte-854nep">`);
							Icon($$renderer, { name: 'arrow-right', size: 'sm' });
							$$renderer.push(`<!----> Range End</label> <input id="range-end" type="text"${$.attr('value', config.network.rangeEnd)} placeholder="192.168.1.200" class="svelte-854nep"/></div></div></div> `);

							if (networkValidationErrors.length > 0) {
								$$renderer.push(`<!--[0--><div class="network-errors svelte-854nep"><h4 class="svelte-854nep">Network Settings Errors</h4> <!--[-->`);

								const each_array_2 = $.ensure_array_like(networkValidationErrors);

								for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
									let error = each_array_2[i];

									$$renderer.push(`<div class="network-error-item svelte-854nep">`);
									Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
									$$renderer.push(`<!----> ${$.escape(error)}</div>`);
								}

								$$renderer.push(`<!--]--></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (result && networkValidationErrors.length === 0) {
							$$renderer.push(`<!--[0--><div class="card results svelte-854nep"><h3 class="svelte-854nep">Configuration Examples</h3> `);

							if (result.examples.iscDhcpd) {
								$$renderer.push(`<!--[0--><div class="output-group svelte-854nep"><div class="output-header svelte-854nep"><h4 class="svelte-854nep">ISC dhcpd Configuration</h4> <button type="button"${$.attr_class('copy-btn svelte-854nep', void 0, { 'copied': clipboard.isCopied('isc') })}>`);

								Icon($$renderer, {
									name: clipboard.isCopied('isc') ? 'check' : 'copy',
									size: 'xs'
								});

								$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('isc') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-854nep">${$.escape(result.examples.iscDhcpd)}</pre></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (result.examples.keaDhcp4) {
								$$renderer.push(`<!--[0--><div class="output-group svelte-854nep"><div class="output-header svelte-854nep"><h4 class="svelte-854nep">Kea DHCPv4 Configuration</h4> <button type="button"${$.attr_class('copy-btn svelte-854nep', void 0, { 'copied': clipboard.isCopied('kea') })}>`);

								Icon($$renderer, {
									name: clipboard.isCopied('kea') ? 'check' : 'copy',
									size: 'xs'
								});

								$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('kea') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-854nep">${$.escape(result.examples.keaDhcp4)}</pre></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (result.examples.ciscoIos) {
								$$renderer.push(`<!--[0--><div class="output-group svelte-854nep"><div class="output-header svelte-854nep"><h4 class="svelte-854nep">Cisco IOS Configuration</h4> <button type="button"${$.attr_class('copy-btn svelte-854nep', void 0, { 'copied': clipboard.isCopied('cisco') })}>`);

								Icon($$renderer, {
									name: clipboard.isCopied('cisco') ? 'check' : 'copy',
									size: 'xs'
								});

								$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('cisco') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-854nep">${$.escape(result.examples.ciscoIos)}</pre></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push(`<!--[-1--><div class="card input-card svelte-854nep"><div class="card-header svelte-854nep"><h3 class="svelte-854nep">Decode TFTP Option</h3></div> <div class="card-content svelte-854nep"><div class="input-group svelte-854nep"><label for="decode-mode" class="svelte-854nep">`);
						Icon($$renderer, { name: 'settings', size: 'sm' });
						$$renderer.push(`<!----> Option Type</label> `);

						$$renderer.select(
							{ id: 'decode-mode', value: decodeMode, class: '' },
							($$renderer) => {
								$$renderer.option({ value: 'option150' }, ($$renderer) => {
									$$renderer.push(`Option 150: TFTP Server List`);
								});

								$$renderer.option({ value: 'option66' }, ($$renderer) => {
									$$renderer.push(`Option 66: TFTP Server Name`);
								});

								$$renderer.option({ value: 'option67' }, ($$renderer) => {
									$$renderer.push(`Option 67: Bootfile Name`);
								});
							},
							'svelte-854nep'
						);

						$$renderer.push(`</div> <div class="input-group svelte-854nep"><label for="decode-input" class="svelte-854nep">`);
						Icon($$renderer, { name: 'code', size: 'sm' });
						$$renderer.push(`<!----> Hex-Encoded Option Data</label> <textarea id="decode-input" placeholder="Enter hex string (e.g., c0a8010ac0a8010b for Option 150)" rows="4" class="svelte-854nep">`);

						const $$body = $.escape(decodeInput);

						if ($$body) {
							$$renderer.push(`${$$body}`);
						} else {}

						$$renderer.push(`</textarea></div> <button type="button" class="btn-primary svelte-854nep">`);
						Icon($$renderer, { name: 'search', size: 'sm' });
						$$renderer.push(`<!----> Decode</button></div></div> `);

						if (validationErrors.length > 0) {
							$$renderer.push(`<!--[0--><div class="card errors-card svelte-854nep"><h3 class="svelte-854nep">Validation Errors</h3> <!--[-->`);

							const each_array_3 = $.ensure_array_like(validationErrors);

							for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
								let error = each_array_3[i];

								$$renderer.push(`<div class="error-message svelte-854nep">`);
								Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
								$$renderer.push(`<!----> ${$.escape(error)}</div>`);
							}

							$$renderer.push(`<!--]--></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (decodeResult150 && validationErrors.length === 0) {
							$$renderer.push(`<!--[0--><div class="card results svelte-854nep"><h3 class="svelte-854nep">Decoded Option 150: TFTP Server List</h3> <div class="summary-card svelte-854nep"><div class="svelte-854nep"><strong class="svelte-854nep">Total Length:</strong> ${$.escape(decodeResult150.totalLength)} bytes</div> <div class="svelte-854nep"><strong class="svelte-854nep">Servers Found:</strong> ${$.escape(decodeResult150.servers.length)}</div></div> <div class="servers-section svelte-854nep"><h4 class="svelte-854nep">TFTP Servers</h4> <!--[-->`);

							const each_array_4 = $.ensure_array_like(decodeResult150.servers);

							for (let i = 0, $$length = each_array_4.length; i < $$length; i++) {
								let server = each_array_4[i];

								$$renderer.push(`<div class="server-item svelte-854nep">`);
								Icon($$renderer, { name: 'server', size: 'sm' });
								$$renderer.push(`<!----> <span class="field-label svelte-854nep">Server ${$.escape(i + 1)}:</span> <span class="field-value svelte-854nep">${$.escape(server)}</span></div>`);
							}

							$$renderer.push(`<!--]--></div></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (decodeResult66 && validationErrors.length === 0) {
							$$renderer.push(`<!--[0--><div class="card results svelte-854nep"><h3 class="svelte-854nep">Decoded Option 66: TFTP Server Name</h3> <div class="summary-card svelte-854nep"><div class="svelte-854nep"><strong class="svelte-854nep">Total Length:</strong> ${$.escape(decodeResult66.totalLength)} bytes</div></div> <div class="decoded-value svelte-854nep"><h4 class="svelte-854nep">TFTP Server</h4> <div class="value-display svelte-854nep">`);
							Icon($$renderer, { name: 'globe', size: 'sm' });
							$$renderer.push(`<!----> <span>${$.escape(decodeResult66.value)}</span></div></div></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (decodeResult67 && validationErrors.length === 0) {
							$$renderer.push(`<!--[0--><div class="card results svelte-854nep"><h3 class="svelte-854nep">Decoded Option 67: Bootfile Name</h3> <div class="summary-card svelte-854nep"><div class="svelte-854nep"><strong class="svelte-854nep">Total Length:</strong> ${$.escape(decodeResult67.totalLength)} bytes</div></div> <div class="decoded-value svelte-854nep"><h4 class="svelte-854nep">Bootfile</h4> <div class="value-display svelte-854nep">`);
							Icon($$renderer, { name: 'file', size: 'sm' });
							$$renderer.push(`<!----> <span>${$.escape(decodeResult67.value)}</span></div></div></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
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