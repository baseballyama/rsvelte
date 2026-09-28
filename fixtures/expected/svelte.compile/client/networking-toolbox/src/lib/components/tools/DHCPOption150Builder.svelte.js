import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="server-row svelte-854nep"><div class="input-group flex-grow svelte-854nep"><label class="svelte-854nep"><!> </label> <input type="text" placeholder="192.168.1.10" class="svelte-854nep"/></div> <button type="button" class="btn-icon svelte-854nep"><!></button></div>`);
var root_1 = $.from_html(`<div class="error-message svelte-854nep"><!> </div>`);
var root_2 = $.from_html(`<div class="card errors-card svelte-854nep"><h3 class="svelte-854nep">Validation Errors</h3> <!></div>`);
var root_3 = $.from_html(`<div class="card results svelte-854nep"><h3 class="svelte-854nep">Option 150: TFTP Server List</h3> <div class="output-group svelte-854nep"><div class="output-header svelte-854nep"><h4 class="svelte-854nep">Hex-Encoded (Compact)</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-854nep"> </pre></div> <div class="output-group svelte-854nep"><div class="output-header svelte-854nep"><h4 class="svelte-854nep">Wire Format (Spaced)</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-854nep"> </pre></div> <div class="summary-card svelte-854nep"><div class="svelte-854nep"><strong class="svelte-854nep">Total Length:</strong> </div> <div class="svelte-854nep"><strong class="svelte-854nep">Servers:</strong> </div></div></div>`);
var root_4 = $.from_html(`<div class="card results svelte-854nep"><h3 class="svelte-854nep">Option 66: TFTP Server Name</h3> <div class="output-group svelte-854nep"><div class="output-header svelte-854nep"><h4 class="svelte-854nep">Value</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-854nep"> </pre></div> <div class="output-group svelte-854nep"><div class="output-header svelte-854nep"><h4 class="svelte-854nep">Hex-Encoded</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-854nep"> </pre></div> <div class="summary-card svelte-854nep"><div class="svelte-854nep"><strong class="svelte-854nep">Total Length:</strong> </div></div></div>`);
var root_5 = $.from_html(`<div class="card results svelte-854nep"><h3 class="svelte-854nep">Option 67: Bootfile Name</h3> <div class="output-group svelte-854nep"><div class="output-header svelte-854nep"><h4 class="svelte-854nep">Value</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-854nep"> </pre></div> <div class="output-group svelte-854nep"><div class="output-header svelte-854nep"><h4 class="svelte-854nep">Hex-Encoded</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-854nep"> </pre></div> <div class="summary-card svelte-854nep"><div class="svelte-854nep"><strong class="svelte-854nep">Total Length:</strong> </div></div></div>`);
var root_6 = $.from_html(`<!> <!> <!>`, 1);
var root_7 = $.from_html(`<div class="network-error-item svelte-854nep"><!> </div>`);
var root_8 = $.from_html(`<div class="network-errors svelte-854nep"><h4 class="svelte-854nep">Network Settings Errors</h4> <!></div>`);
var root_9 = $.from_html(`<div class="card input-card svelte-854nep"><div class="card-header svelte-854nep"><h3 class="svelte-854nep">Network Settings (Optional)</h3> <p class="help-text svelte-854nep">Customize network values for configuration examples below</p></div> <div class="card-content svelte-854nep"><div class="input-row svelte-854nep"><div class="input-group svelte-854nep"><label for="subnet" class="svelte-854nep"><!> Subnet</label> <input id="subnet" type="text" placeholder="192.168.1.0" class="svelte-854nep"/></div> <div class="input-group svelte-854nep"><label for="netmask" class="svelte-854nep"><!> Netmask</label> <input id="netmask" type="text" placeholder="255.255.255.0" class="svelte-854nep"/></div></div> <div class="input-row svelte-854nep"><div class="input-group svelte-854nep"><label for="range-start" class="svelte-854nep"><!> Range Start</label> <input id="range-start" type="text" placeholder="192.168.1.100" class="svelte-854nep"/></div> <div class="input-group svelte-854nep"><label for="range-end" class="svelte-854nep"><!> Range End</label> <input id="range-end" type="text" placeholder="192.168.1.200" class="svelte-854nep"/></div></div></div> <!></div>`);
var root_10 = $.from_html(`<div class="output-group svelte-854nep"><div class="output-header svelte-854nep"><h4 class="svelte-854nep">ISC dhcpd Configuration</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-854nep"> </pre></div>`);
var root_11 = $.from_html(`<div class="output-group svelte-854nep"><div class="output-header svelte-854nep"><h4 class="svelte-854nep">Kea DHCPv4 Configuration</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-854nep"> </pre></div>`);
var root_12 = $.from_html(`<div class="output-group svelte-854nep"><div class="output-header svelte-854nep"><h4 class="svelte-854nep">Cisco IOS Configuration</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-854nep"> </pre></div>`);
var root_13 = $.from_html(`<div class="card results svelte-854nep"><h3 class="svelte-854nep">Configuration Examples</h3> <!> <!> <!></div>`);
var root_14 = $.from_html(`<div class="card input-card svelte-854nep"><div class="card-header svelte-854nep"><h3 class="svelte-854nep">Option 150: Cisco TFTP Server List</h3> <p class="help-text svelte-854nep">Multiple IPv4 addresses for redundant TFTP servers (Cisco IP phones)</p></div> <div class="card-content svelte-854nep"><!> <button type="button" class="btn-add svelte-854nep"><!> Add TFTP Server</button></div></div> <div class="card input-card svelte-854nep"><div class="card-header svelte-854nep"><h3 class="svelte-854nep">Option 66: TFTP Server Name (Standard)</h3> <p class="help-text svelte-854nep">Single hostname or IP address for standard PXE boot</p></div> <div class="card-content svelte-854nep"><div class="input-group svelte-854nep"><label for="opt66-server" class="svelte-854nep"><!> TFTP Server Hostname/IP</label> <input id="opt66-server" type="text" placeholder="tftp.example.com or 192.168.1.10" class="svelte-854nep"/></div></div></div> <div class="card input-card svelte-854nep"><div class="card-header svelte-854nep"><h3 class="svelte-854nep">Option 67: Bootfile Name</h3> <p class="help-text svelte-854nep">Filename to boot from TFTP server (e.g., pxelinux.0 for BIOS, bootx64.efi for UEFI)</p></div> <div class="card-content svelte-854nep"><div class="input-group svelte-854nep"><label for="opt67-bootfile" class="svelte-854nep"><!> Bootfile Name</label> <input id="opt67-bootfile" type="text" placeholder="pxelinux.0" class="svelte-854nep"/></div></div></div> <!> <!> <hr/> <!> <!>`, 1);
var root_15 = $.from_html(`<div class="server-item svelte-854nep"><!> <span class="field-label svelte-854nep"></span> <span class="field-value svelte-854nep"> </span></div>`);
var root_16 = $.from_html(`<div class="card results svelte-854nep"><h3 class="svelte-854nep">Decoded Option 150: TFTP Server List</h3> <div class="summary-card svelte-854nep"><div class="svelte-854nep"><strong class="svelte-854nep">Total Length:</strong> </div> <div class="svelte-854nep"><strong class="svelte-854nep">Servers Found:</strong> </div></div> <div class="servers-section svelte-854nep"><h4 class="svelte-854nep">TFTP Servers</h4> <!></div></div>`);
var root_17 = $.from_html(`<div class="card results svelte-854nep"><h3 class="svelte-854nep">Decoded Option 66: TFTP Server Name</h3> <div class="summary-card svelte-854nep"><div class="svelte-854nep"><strong class="svelte-854nep">Total Length:</strong> </div></div> <div class="decoded-value svelte-854nep"><h4 class="svelte-854nep">TFTP Server</h4> <div class="value-display svelte-854nep"><!> <span> </span></div></div></div>`);
var root_18 = $.from_html(`<div class="card results svelte-854nep"><h3 class="svelte-854nep">Decoded Option 67: Bootfile Name</h3> <div class="summary-card svelte-854nep"><div class="svelte-854nep"><strong class="svelte-854nep">Total Length:</strong> </div></div> <div class="decoded-value svelte-854nep"><h4 class="svelte-854nep">Bootfile</h4> <div class="value-display svelte-854nep"><!> <span> </span></div></div></div>`);
var root_19 = $.from_html(`<div class="card input-card svelte-854nep"><div class="card-header svelte-854nep"><h3 class="svelte-854nep">Decode TFTP Option</h3></div> <div class="card-content svelte-854nep"><div class="input-group svelte-854nep"><label for="decode-mode" class="svelte-854nep"><!> Option Type</label> <select id="decode-mode" class="svelte-854nep"><option>Option 150: TFTP Server List</option><option>Option 66: TFTP Server Name</option><option>Option 67: Bootfile Name</option></select></div> <div class="input-group svelte-854nep"><label for="decode-input" class="svelte-854nep"><!> Hex-Encoded Option Data</label> <textarea id="decode-input" placeholder="Enter hex string (e.g., c0a8010ac0a8010b for Option 150)" rows="4" class="svelte-854nep"></textarea></div> <button type="button" class="btn-primary svelte-854nep"><!> Decode</button></div></div> <!> <!> <!> <!>`, 1);
var root_20 = $.from_html(`<!> <!>`, 1);

export default function DHCPOption150Builder($$anchor, $$props) {
	$.push($$props, true);

	const modeOptions = [
		{ value: 'encode', label: 'Encode', icon: 'wrench' },
		{ value: 'decode', label: 'Decode', icon: 'search' }
	];

	let mode = $.state('encode');

	let config = $.state($.proxy({
		...getDefaultTFTPConfig(),
		network: { subnet: '', netmask: '', rangeStart: '', rangeEnd: '' }
	}));

	let result = $.state(null);
	let decodeMode = $.state('option150');
	let decodeInput = $.state('');
	let decodeResult150 = $.state(null);
	let decodeResult66 = $.state(null);
	let decodeResult67 = $.state(null);
	let validationErrors = $.state($.proxy([]));
	let networkValidationErrors = $.state($.proxy([]));
	let selectedExampleIndex = $.state(null);
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
	$.user_effect(() => {
		if ($.get(mode) === 'encode') {
			const currentOption150 = $.get(config).option150Servers ? [...$.get(config).option150Servers] : undefined;
			const currentOption66 = $.get(config).option66Server;
			const currentOption67 = $.get(config).option67Bootfile;
			const currentNetwork = $.get(config).network ? { ...$.get(config).network } : undefined;

			untrack(() => {
				validateAndEncode({
					option150Servers: currentOption150,
					option66Server: currentOption66,
					option67Bootfile: currentOption67,
					network: currentNetwork
				});

				checkIfExampleStillMatches();
			});
		} else {
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			$.get(decodeInput);

			untrack(() => {
				checkIfExampleStillMatches();
			});
		}
	});

	// Clear selected example when switching modes
	$.user_effect(() => {
		void $.get(mode);

		untrack(() => {
			$.set(selectedExampleIndex, null);
		});
	});

	function validateAndEncode(cfg = $.get(config)) {
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

		$.set(validationErrors, errors, true);
		$.set(networkValidationErrors, netErrors, true);

		if (errors.length === 0) {
			try {
				$.set(result, buildTFTPOptions(cfg), true);
			} catch(error) {
				$.set(validationErrors, [error instanceof Error ? error.message : 'Encoding failed'], true);
				$.set(result, null);
			}
		} else {
			$.set(result, null);
		}
	}

	function decode() {
		if (!$.get(decodeInput).trim()) {
			$.set(decodeResult150, null);
			$.set(decodeResult66, null);
			$.set(decodeResult67, null);
			$.set(validationErrors, [], true);

			return;
		}

		if (!(/^[0-9a-fA-F\s:]+$/).test($.get(decodeInput))) {
			$.set(validationErrors, ['Invalid hex input: only hexadecimal characters allowed'], true);
			$.set(decodeResult150, null);
			$.set(decodeResult66, null);
			$.set(decodeResult67, null);

			return;
		}

		try {
			$.set(validationErrors, [], true);

			if ($.get(decodeMode) === 'option150') {
				$.set(decodeResult150, parseOption150($.get(decodeInput)), true);
				$.set(decodeResult66, null);
				$.set(decodeResult67, null);
			} else if ($.get(decodeMode) === 'option66') {
				$.set(decodeResult66, parseOption66($.get(decodeInput)), true);
				$.set(decodeResult150, null);
				$.set(decodeResult67, null);
			} else {
				$.set(decodeResult67, parseOption67($.get(decodeInput)), true);
				$.set(decodeResult150, null);
				$.set(decodeResult66, null);
			}
		} catch(error) {
			$.set(validationErrors, [error instanceof Error ? error.message : 'Decoding failed'], true);
			$.set(decodeResult150, null);
			$.set(decodeResult66, null);
			$.set(decodeResult67, null);
		}
	}

	function addOption150Server() {
		if (!$.get(config).option150Servers) {
			$.get(config).option150Servers = [''];
		} else {
			$.get(config).option150Servers = [...$.get(config).option150Servers, ''];
		}
	}

	function removeOption150Server(index) {
		if ($.get(config).option150Servers && $.get(config).option150Servers.length > 1) {
			$.get(config).option150Servers = $.get(config).option150Servers.filter((_, i) => i !== index);
		} else if ($.get(config).option150Servers) {
			$.get(config).option150Servers = [];
		}
	}

	function loadEncodeExample(example, index) {
		$.set(
			config,
			{
				option150Servers: example.option150Servers ? [...example.option150Servers] : [],
				option66Server: example.option66Server || '',
				option67Bootfile: example.option67Bootfile || '',
				network: { subnet: '', netmask: '', rangeStart: '', rangeEnd: '' }
			},
			true
		);

		$.set(selectedExampleIndex, index, true);
	}

	function loadDecodeExample(example, index) {
		$.set(decodeMode, example.mode, true);
		$.set(decodeInput, example.hexInput, true);
		$.set(selectedExampleIndex, index, true);
		decode();
	}

	function checkIfExampleStillMatches() {
		if ($.get(selectedExampleIndex) === null) return;

		if ($.get(mode) === 'encode') {
			const example = encodeExamples[$.get(selectedExampleIndex)];

			if (!example) {
				$.set(selectedExampleIndex, null);

				return;
			}

			const option150Match = (!example.option150Servers || example.option150Servers.length === 0) && (!$.get(config).option150Servers || $.get(config).option150Servers.length === 0) || example.option150Servers && $.get(config).option150Servers && example.option150Servers.length === $.get(config).option150Servers.length && example.option150Servers.every((s, i) => s === $.get(config).option150Servers[i]);
			const option66Match = (example.option66Server || '') === ($.get(config).option66Server || '');
			const option67Match = (example.option67Bootfile || '') === ($.get(config).option67Bootfile || '');

			if (!option150Match || !option66Match || !option67Match) {
				$.set(selectedExampleIndex, null);
			}
		} else {
			const example = decodeExamples[$.get(selectedExampleIndex)];

			if (!example) {
				$.set(selectedExampleIndex, null);

				return;
			}

			if ($.get(decodeInput) !== example.hexInput || $.get(decodeMode) !== example.mode) {
				$.set(selectedExampleIndex, null);
			}
		}
	}

	ToolContentContainer($$anchor, {
		title: 'DHCP Options 150/66/67 - TFTP Server Configuration',
		description: 'Configure TFTP servers for PXE boot and Cisco IP phones. Option 150 (Cisco TFTP list), Option 66 (TFTP server name), and Option 67 (bootfile name).',
		get navOptions() {
			return modeOptions;
		},

		get selectedNav() {
			return $.get(mode);
		},

		set selectedNav($$value) {
			$.set(mode, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_20();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					ExamplesCard($$anchor, {
						get examples() {
							return encodeExamples;
						},
						onSelect: loadEncodeExample,
						getLabel: (ex) => ex.label,
						getDescription: (ex) => ex.description,
						get selectedIndex() {
							return $.get(selectedExampleIndex);
						}
					});
				};

				var alternate = ($$anchor) => {
					ExamplesCard($$anchor, {
						get examples() {
							return decodeExamples;
						},
						onSelect: loadDecodeExample,
						getLabel: (ex) => ex.label,
						getDescription: (ex) => ex.description,
						get selectedIndex() {
							return $.get(selectedExampleIndex);
						}
					});
				};

				$.if(node, ($$render) => {
					if ($.get(mode) === 'encode') $$render(consequent); else $$render(alternate, -1);
				});
			}

			var node_1 = $.sibling(node, 2);

			{
				var consequent_13 = ($$anchor) => {
					var fragment_4 = root_14();
					var div = $.first_child(fragment_4);
					var div_1 = $.sibling($.child(div), 2);
					var node_2 = $.child(div_1);

					{
						var consequent_1 = ($$anchor) => {
							var fragment_5 = $.comment();
							var node_3 = $.first_child(fragment_5);

							$.each(node_3, 19, () => $.get(config).option150Servers, (_, i) => `opt150-${i}`, ($$anchor, _, i) => {
								var div_2 = root();
								var div_3 = $.child(div_2);
								var label = $.child(div_3);
								var node_4 = $.child(label);

								Icon(node_4, { name: 'server', size: 'sm' });

								var text = $.sibling(node_4);

								$.reset(label);

								var input = $.sibling(label, 2);

								$.remove_input_defaults(input);
								$.reset(div_3);

								var button = $.sibling(div_3, 2);
								var node_5 = $.child(button);

								Icon(node_5, { name: 'x', size: 'sm' });
								$.reset(button);
								$.reset(div_2);

								$.template_effect(() => {
									$.set_attribute(label, 'for', `opt150-server-${$.get(i) ?? ''}`);
									$.set_text(text, ` Server ${$.get(i) + 1}`);
									$.set_attribute(input, 'id', `opt150-server-${$.get(i) ?? ''}`);
								});

								$.bind_value(input, () => $.get(config).option150Servers[$.get(i)], ($$value) => $.get(config).option150Servers[$.get(i)] = $$value);
								$.delegated('click', button, () => removeOption150Server($.get(i)));
								$.append($$anchor, div_2);
							});

							$.append($$anchor, fragment_5);
						};

						$.if(node_2, ($$render) => {
							if ($.get(config).option150Servers && $.get(config).option150Servers.length > 0) $$render(consequent_1);
						});
					}

					var button_1 = $.sibling(node_2, 2);
					var node_6 = $.child(button_1);

					Icon(node_6, { name: 'plus', size: 'sm' });
					$.next();
					$.reset(button_1);
					$.reset(div_1);
					$.reset(div);

					var div_4 = $.sibling(div, 2);
					var div_5 = $.sibling($.child(div_4), 2);
					var div_6 = $.child(div_5);
					var label_1 = $.child(div_6);
					var node_7 = $.child(label_1);

					Icon(node_7, { name: 'globe', size: 'sm' });
					$.next();
					$.reset(label_1);

					var input_1 = $.sibling(label_1, 2);

					$.remove_input_defaults(input_1);
					$.reset(div_6);
					$.reset(div_5);
					$.reset(div_4);

					var div_7 = $.sibling(div_4, 2);
					var div_8 = $.sibling($.child(div_7), 2);
					var div_9 = $.child(div_8);
					var label_2 = $.child(div_9);
					var node_8 = $.child(label_2);

					Icon(node_8, { name: 'file', size: 'sm' });
					$.next();
					$.reset(label_2);

					var input_2 = $.sibling(label_2, 2);

					$.remove_input_defaults(input_2);
					$.reset(div_9);
					$.reset(div_8);
					$.reset(div_7);

					var node_9 = $.sibling(div_7, 2);

					{
						var consequent_2 = ($$anchor) => {
							var div_10 = root_2();
							var node_10 = $.sibling($.child(div_10), 2);

							$.each(node_10, 17, () => $.get(validationErrors), $.index, ($$anchor, error) => {
								var div_11 = root_1();
								var node_11 = $.child(div_11);

								Icon(node_11, { name: 'alert-triangle', size: 'sm' });

								var text_1 = $.sibling(node_11);

								$.reset(div_11);
								$.template_effect(() => $.set_text(text_1, ` ${$.get(error) ?? ''}`));
								$.append($$anchor, div_11);
							});

							$.reset(div_10);
							$.append($$anchor, div_10);
						};

						$.if(node_9, ($$render) => {
							if ($.get(validationErrors).length > 0) $$render(consequent_2);
						});
					}

					var node_12 = $.sibling(node_9, 2);

					{
						var consequent_6 = ($$anchor) => {
							var fragment_6 = root_6();
							var node_13 = $.first_child(fragment_6);

							{
								var consequent_3 = ($$anchor) => {
									var div_12 = root_3();
									var div_13 = $.sibling($.child(div_12), 2);
									var div_14 = $.child(div_13);
									var button_2 = $.sibling($.child(div_14), 2);
									let classes;
									var node_14 = $.child(button_2);

									{
										let $0 = $.derived(() => clipboard.isCopied('opt150-hex') ? 'check' : 'copy');

										Icon(node_14, {
											get name() {
												return $.get($0);
											},
											size: 'xs'
										});
									}

									var text_2 = $.sibling(node_14);

									$.reset(button_2);
									$.reset(div_14);

									var pre = $.sibling(div_14, 2);
									var text_3 = $.only_child(pre, true);

									$.reset(div_13);

									var div_15 = $.sibling(div_13, 2);
									var div_16 = $.child(div_15);
									var button_3 = $.sibling($.child(div_16), 2);
									let classes_1;
									var node_15 = $.child(button_3);

									{
										let $0 = $.derived(() => clipboard.isCopied('opt150-wire') ? 'check' : 'copy');

										Icon(node_15, {
											get name() {
												return $.get($0);
											},
											size: 'xs'
										});
									}

									var text_4 = $.sibling(node_15);

									$.reset(button_3);
									$.reset(div_16);

									var pre_1 = $.sibling(div_16, 2);
									var text_5 = $.only_child(pre_1, true);

									$.reset(div_15);

									var div_17 = $.sibling(div_15, 2);
									var div_18 = $.child(div_17);
									var text_6 = $.sibling($.child(div_18));

									$.reset(div_18);

									var div_19 = $.sibling(div_18, 2);
									var text_7 = $.sibling($.child(div_19));

									$.reset(div_19);
									$.reset(div_17);
									$.reset(div_12);

									$.template_effect(
										($0, $1, $2, $3) => {
											classes = $.set_class(button_2, 1, 'copy-btn svelte-854nep', null, classes, { copied: $0 });
											$.set_text(text_2, ` ${$1 ?? ''}`);
											$.set_text(text_3, $.get(result).option150.hexEncoded);
											classes_1 = $.set_class(button_3, 1, 'copy-btn svelte-854nep', null, classes_1, { copied: $2 });
											$.set_text(text_4, ` ${$3 ?? ''}`);
											$.set_text(text_5, $.get(result).option150.wireFormat);
											$.set_text(text_6, ` ${$.get(result).option150.totalLength ?? ''} bytes`);
											$.set_text(text_7, ` ${$.get(result).option150.servers.length ?? ''}`);
										},
										[
											() => clipboard.isCopied('opt150-hex'),
											() => clipboard.isCopied('opt150-hex') ? 'Copied' : 'Copy',
											() => clipboard.isCopied('opt150-wire'),
											() => clipboard.isCopied('opt150-wire') ? 'Copied' : 'Copy'
										]
									);

									$.delegated('click', button_2, () => clipboard.copy($.get(result).option150.hexEncoded, 'opt150-hex'));
									$.delegated('click', button_3, () => clipboard.copy($.get(result).option150.wireFormat, 'opt150-wire'));
									$.append($$anchor, div_12);
								};

								$.if(node_13, ($$render) => {
									if ($.get(result).option150) $$render(consequent_3);
								});
							}

							var node_16 = $.sibling(node_13, 2);

							{
								var consequent_4 = ($$anchor) => {
									var div_20 = root_4();
									var div_21 = $.sibling($.child(div_20), 2);
									var div_22 = $.child(div_21);
									var button_4 = $.sibling($.child(div_22), 2);
									let classes_2;
									var node_17 = $.child(button_4);

									{
										let $0 = $.derived(() => clipboard.isCopied('opt66-value') ? 'check' : 'copy');

										Icon(node_17, {
											get name() {
												return $.get($0);
											},
											size: 'xs'
										});
									}

									var text_8 = $.sibling(node_17);

									$.reset(button_4);
									$.reset(div_22);

									var pre_2 = $.sibling(div_22, 2);
									var text_9 = $.only_child(pre_2, true);

									$.reset(div_21);

									var div_23 = $.sibling(div_21, 2);
									var div_24 = $.child(div_23);
									var button_5 = $.sibling($.child(div_24), 2);
									let classes_3;
									var node_18 = $.child(button_5);

									{
										let $0 = $.derived(() => clipboard.isCopied('opt66-hex') ? 'check' : 'copy');

										Icon(node_18, {
											get name() {
												return $.get($0);
											},
											size: 'xs'
										});
									}

									var text_10 = $.sibling(node_18);

									$.reset(button_5);
									$.reset(div_24);

									var pre_3 = $.sibling(div_24, 2);
									var text_11 = $.only_child(pre_3, true);

									$.reset(div_23);

									var div_25 = $.sibling(div_23, 2);
									var div_26 = $.child(div_25);
									var text_12 = $.sibling($.child(div_26));

									$.reset(div_26);
									$.reset(div_25);
									$.reset(div_20);

									$.template_effect(
										($0, $1, $2, $3) => {
											classes_2 = $.set_class(button_4, 1, 'copy-btn svelte-854nep', null, classes_2, { copied: $0 });
											$.set_text(text_8, ` ${$1 ?? ''}`);
											$.set_text(text_9, $.get(result).option66.value);
											classes_3 = $.set_class(button_5, 1, 'copy-btn svelte-854nep', null, classes_3, { copied: $2 });
											$.set_text(text_10, ` ${$3 ?? ''}`);
											$.set_text(text_11, $.get(result).option66.hexEncoded);
											$.set_text(text_12, ` ${$.get(result).option66.totalLength ?? ''} bytes`);
										},
										[
											() => clipboard.isCopied('opt66-value'),
											() => clipboard.isCopied('opt66-value') ? 'Copied' : 'Copy',
											() => clipboard.isCopied('opt66-hex'),
											() => clipboard.isCopied('opt66-hex') ? 'Copied' : 'Copy'
										]
									);

									$.delegated('click', button_4, () => clipboard.copy($.get(result).option66.value, 'opt66-value'));
									$.delegated('click', button_5, () => clipboard.copy($.get(result).option66.hexEncoded, 'opt66-hex'));
									$.append($$anchor, div_20);
								};

								$.if(node_16, ($$render) => {
									if ($.get(result).option66) $$render(consequent_4);
								});
							}

							var node_19 = $.sibling(node_16, 2);

							{
								var consequent_5 = ($$anchor) => {
									var div_27 = root_5();
									var div_28 = $.sibling($.child(div_27), 2);
									var div_29 = $.child(div_28);
									var button_6 = $.sibling($.child(div_29), 2);
									let classes_4;
									var node_20 = $.child(button_6);

									{
										let $0 = $.derived(() => clipboard.isCopied('opt67-value') ? 'check' : 'copy');

										Icon(node_20, {
											get name() {
												return $.get($0);
											},
											size: 'xs'
										});
									}

									var text_13 = $.sibling(node_20);

									$.reset(button_6);
									$.reset(div_29);

									var pre_4 = $.sibling(div_29, 2);
									var text_14 = $.only_child(pre_4, true);

									$.reset(div_28);

									var div_30 = $.sibling(div_28, 2);
									var div_31 = $.child(div_30);
									var button_7 = $.sibling($.child(div_31), 2);
									let classes_5;
									var node_21 = $.child(button_7);

									{
										let $0 = $.derived(() => clipboard.isCopied('opt67-hex') ? 'check' : 'copy');

										Icon(node_21, {
											get name() {
												return $.get($0);
											},
											size: 'xs'
										});
									}

									var text_15 = $.sibling(node_21);

									$.reset(button_7);
									$.reset(div_31);

									var pre_5 = $.sibling(div_31, 2);
									var text_16 = $.only_child(pre_5, true);

									$.reset(div_30);

									var div_32 = $.sibling(div_30, 2);
									var div_33 = $.child(div_32);
									var text_17 = $.sibling($.child(div_33));

									$.reset(div_33);
									$.reset(div_32);
									$.reset(div_27);

									$.template_effect(
										($0, $1, $2, $3) => {
											classes_4 = $.set_class(button_6, 1, 'copy-btn svelte-854nep', null, classes_4, { copied: $0 });
											$.set_text(text_13, ` ${$1 ?? ''}`);
											$.set_text(text_14, $.get(result).option67.value);
											classes_5 = $.set_class(button_7, 1, 'copy-btn svelte-854nep', null, classes_5, { copied: $2 });
											$.set_text(text_15, ` ${$3 ?? ''}`);
											$.set_text(text_16, $.get(result).option67.hexEncoded);
											$.set_text(text_17, ` ${$.get(result).option67.totalLength ?? ''} bytes`);
										},
										[
											() => clipboard.isCopied('opt67-value'),
											() => clipboard.isCopied('opt67-value') ? 'Copied' : 'Copy',
											() => clipboard.isCopied('opt67-hex'),
											() => clipboard.isCopied('opt67-hex') ? 'Copied' : 'Copy'
										]
									);

									$.delegated('click', button_6, () => clipboard.copy($.get(result).option67.value, 'opt67-value'));
									$.delegated('click', button_7, () => clipboard.copy($.get(result).option67.hexEncoded, 'opt67-hex'));
									$.append($$anchor, div_27);
								};

								$.if(node_19, ($$render) => {
									if ($.get(result).option67) $$render(consequent_5);
								});
							}

							$.append($$anchor, fragment_6);
						};

						$.if(node_12, ($$render) => {
							if ($.get(result) && $.get(validationErrors).length === 0) $$render(consequent_6);
						});
					}

					var node_22 = $.sibling(node_12, 4);

					{
						var consequent_8 = ($$anchor) => {
							var div_34 = root_9();
							var div_35 = $.sibling($.child(div_34), 2);
							var div_36 = $.child(div_35);
							var div_37 = $.child(div_36);
							var label_3 = $.child(div_37);
							var node_23 = $.child(label_3);

							Icon(node_23, { name: 'network', size: 'sm' });
							$.next();
							$.reset(label_3);

							var input_3 = $.sibling(label_3, 2);

							$.remove_input_defaults(input_3);
							$.reset(div_37);

							var div_38 = $.sibling(div_37, 2);
							var label_4 = $.child(div_38);
							var node_24 = $.child(label_4);

							Icon(node_24, { name: 'network', size: 'sm' });
							$.next();
							$.reset(label_4);

							var input_4 = $.sibling(label_4, 2);

							$.remove_input_defaults(input_4);
							$.reset(div_38);
							$.reset(div_36);

							var div_39 = $.sibling(div_36, 2);
							var div_40 = $.child(div_39);
							var label_5 = $.child(div_40);
							var node_25 = $.child(label_5);

							Icon(node_25, { name: 'arrow-right', size: 'sm' });
							$.next();
							$.reset(label_5);

							var input_5 = $.sibling(label_5, 2);

							$.remove_input_defaults(input_5);
							$.reset(div_40);

							var div_41 = $.sibling(div_40, 2);
							var label_6 = $.child(div_41);
							var node_26 = $.child(label_6);

							Icon(node_26, { name: 'arrow-right', size: 'sm' });
							$.next();
							$.reset(label_6);

							var input_6 = $.sibling(label_6, 2);

							$.remove_input_defaults(input_6);
							$.reset(div_41);
							$.reset(div_39);
							$.reset(div_35);

							var node_27 = $.sibling(div_35, 2);

							{
								var consequent_7 = ($$anchor) => {
									var div_42 = root_8();
									var node_28 = $.sibling($.child(div_42), 2);

									$.each(node_28, 17, () => $.get(networkValidationErrors), $.index, ($$anchor, error) => {
										var div_43 = root_7();
										var node_29 = $.child(div_43);

										Icon(node_29, { name: 'alert-triangle', size: 'sm' });

										var text_18 = $.sibling(node_29);

										$.reset(div_43);
										$.template_effect(() => $.set_text(text_18, ` ${$.get(error) ?? ''}`));
										$.append($$anchor, div_43);
									});

									$.reset(div_42);
									$.append($$anchor, div_42);
								};

								$.if(node_27, ($$render) => {
									if ($.get(networkValidationErrors).length > 0) $$render(consequent_7);
								});
							}

							$.reset(div_34);
							$.bind_value(input_3, () => $.get(config).network.subnet, ($$value) => $.get(config).network.subnet = $$value);
							$.bind_value(input_4, () => $.get(config).network.netmask, ($$value) => $.get(config).network.netmask = $$value);
							$.bind_value(input_5, () => $.get(config).network.rangeStart, ($$value) => $.get(config).network.rangeStart = $$value);
							$.bind_value(input_6, () => $.get(config).network.rangeEnd, ($$value) => $.get(config).network.rangeEnd = $$value);
							$.append($$anchor, div_34);
						};

						$.if(node_22, ($$render) => {
							if ($.get(result)) $$render(consequent_8);
						});
					}

					var node_30 = $.sibling(node_22, 2);

					{
						var consequent_12 = ($$anchor) => {
							var div_44 = root_13();
							var node_31 = $.sibling($.child(div_44), 2);

							{
								var consequent_9 = ($$anchor) => {
									var div_45 = root_10();
									var div_46 = $.child(div_45);
									var button_8 = $.sibling($.child(div_46), 2);
									let classes_6;
									var node_32 = $.child(button_8);

									{
										let $0 = $.derived(() => clipboard.isCopied('isc') ? 'check' : 'copy');

										Icon(node_32, {
											get name() {
												return $.get($0);
											},
											size: 'xs'
										});
									}

									var text_19 = $.sibling(node_32);

									$.reset(button_8);
									$.reset(div_46);

									var pre_6 = $.sibling(div_46, 2);
									var text_20 = $.only_child(pre_6, true);

									$.reset(div_45);

									$.template_effect(
										($0, $1) => {
											classes_6 = $.set_class(button_8, 1, 'copy-btn svelte-854nep', null, classes_6, { copied: $0 });
											$.set_text(text_19, ` ${$1 ?? ''}`);
											$.set_text(text_20, $.get(result).examples.iscDhcpd);
										},
										[
											() => clipboard.isCopied('isc'),
											() => clipboard.isCopied('isc') ? 'Copied' : 'Copy'
										]
									);

									$.delegated('click', button_8, () => clipboard.copy($.get(result).examples.iscDhcpd, 'isc'));
									$.append($$anchor, div_45);
								};

								$.if(node_31, ($$render) => {
									if ($.get(result).examples.iscDhcpd) $$render(consequent_9);
								});
							}

							var node_33 = $.sibling(node_31, 2);

							{
								var consequent_10 = ($$anchor) => {
									var div_47 = root_11();
									var div_48 = $.child(div_47);
									var button_9 = $.sibling($.child(div_48), 2);
									let classes_7;
									var node_34 = $.child(button_9);

									{
										let $0 = $.derived(() => clipboard.isCopied('kea') ? 'check' : 'copy');

										Icon(node_34, {
											get name() {
												return $.get($0);
											},
											size: 'xs'
										});
									}

									var text_21 = $.sibling(node_34);

									$.reset(button_9);
									$.reset(div_48);

									var pre_7 = $.sibling(div_48, 2);
									var text_22 = $.only_child(pre_7, true);

									$.reset(div_47);

									$.template_effect(
										($0, $1) => {
											classes_7 = $.set_class(button_9, 1, 'copy-btn svelte-854nep', null, classes_7, { copied: $0 });
											$.set_text(text_21, ` ${$1 ?? ''}`);
											$.set_text(text_22, $.get(result).examples.keaDhcp4);
										},
										[
											() => clipboard.isCopied('kea'),
											() => clipboard.isCopied('kea') ? 'Copied' : 'Copy'
										]
									);

									$.delegated('click', button_9, () => clipboard.copy($.get(result).examples.keaDhcp4, 'kea'));
									$.append($$anchor, div_47);
								};

								$.if(node_33, ($$render) => {
									if ($.get(result).examples.keaDhcp4) $$render(consequent_10);
								});
							}

							var node_35 = $.sibling(node_33, 2);

							{
								var consequent_11 = ($$anchor) => {
									var div_49 = root_12();
									var div_50 = $.child(div_49);
									var button_10 = $.sibling($.child(div_50), 2);
									let classes_8;
									var node_36 = $.child(button_10);

									{
										let $0 = $.derived(() => clipboard.isCopied('cisco') ? 'check' : 'copy');

										Icon(node_36, {
											get name() {
												return $.get($0);
											},
											size: 'xs'
										});
									}

									var text_23 = $.sibling(node_36);

									$.reset(button_10);
									$.reset(div_50);

									var pre_8 = $.sibling(div_50, 2);
									var text_24 = $.only_child(pre_8, true);

									$.reset(div_49);

									$.template_effect(
										($0, $1) => {
											classes_8 = $.set_class(button_10, 1, 'copy-btn svelte-854nep', null, classes_8, { copied: $0 });
											$.set_text(text_23, ` ${$1 ?? ''}`);
											$.set_text(text_24, $.get(result).examples.ciscoIos);
										},
										[
											() => clipboard.isCopied('cisco'),
											() => clipboard.isCopied('cisco') ? 'Copied' : 'Copy'
										]
									);

									$.delegated('click', button_10, () => clipboard.copy($.get(result).examples.ciscoIos, 'cisco'));
									$.append($$anchor, div_49);
								};

								$.if(node_35, ($$render) => {
									if ($.get(result).examples.ciscoIos) $$render(consequent_11);
								});
							}

							$.reset(div_44);
							$.append($$anchor, div_44);
						};

						$.if(node_30, ($$render) => {
							if ($.get(result) && $.get(networkValidationErrors).length === 0) $$render(consequent_12);
						});
					}

					$.delegated('click', button_1, addOption150Server);
					$.bind_value(input_1, () => $.get(config).option66Server, ($$value) => $.get(config).option66Server = $$value);
					$.bind_value(input_2, () => $.get(config).option67Bootfile, ($$value) => $.get(config).option67Bootfile = $$value);
					$.append($$anchor, fragment_4);
				};

				var alternate_1 = ($$anchor) => {
					var fragment_7 = root_19();
					var div_51 = $.first_child(fragment_7);
					var div_52 = $.sibling($.child(div_51), 2);
					var div_53 = $.child(div_52);
					var label_7 = $.child(div_53);
					var node_37 = $.child(label_7);

					Icon(node_37, { name: 'settings', size: 'sm' });
					$.next();
					$.reset(label_7);

					var select = $.sibling(label_7, 2);
					var option = $.child(select);

					option.value = option.__value = 'option150';

					var option_1 = $.sibling(option);

					option_1.value = option_1.__value = 'option66';

					var option_2 = $.sibling(option_1);

					option_2.value = option_2.__value = 'option67';
					$.reset(select);
					$.init_select(select);
					$.reset(div_53);

					var div_54 = $.sibling(div_53, 2);
					var label_8 = $.child(div_54);
					var node_38 = $.child(label_8);

					Icon(node_38, { name: 'code', size: 'sm' });
					$.next();
					$.reset(label_8);

					var textarea = $.sibling(label_8, 2);

					$.remove_textarea_child(textarea);
					$.reset(div_54);

					var button_11 = $.sibling(div_54, 2);
					var node_39 = $.child(button_11);

					Icon(node_39, { name: 'search', size: 'sm' });
					$.next();
					$.reset(button_11);
					$.reset(div_52);
					$.reset(div_51);

					var node_40 = $.sibling(div_51, 2);

					{
						var consequent_14 = ($$anchor) => {
							var div_55 = root_2();
							var node_41 = $.sibling($.child(div_55), 2);

							$.each(node_41, 17, () => $.get(validationErrors), $.index, ($$anchor, error) => {
								var div_56 = root_1();
								var node_42 = $.child(div_56);

								Icon(node_42, { name: 'alert-triangle', size: 'sm' });

								var text_25 = $.sibling(node_42);

								$.reset(div_56);
								$.template_effect(() => $.set_text(text_25, ` ${$.get(error) ?? ''}`));
								$.append($$anchor, div_56);
							});

							$.reset(div_55);
							$.append($$anchor, div_55);
						};

						$.if(node_40, ($$render) => {
							if ($.get(validationErrors).length > 0) $$render(consequent_14);
						});
					}

					var node_43 = $.sibling(node_40, 2);

					{
						var consequent_15 = ($$anchor) => {
							var div_57 = root_16();
							var div_58 = $.sibling($.child(div_57), 2);
							var div_59 = $.child(div_58);
							var text_26 = $.sibling($.child(div_59));

							$.reset(div_59);

							var div_60 = $.sibling(div_59, 2);
							var text_27 = $.sibling($.child(div_60));

							$.reset(div_60);
							$.reset(div_58);

							var div_61 = $.sibling(div_58, 2);
							var node_44 = $.sibling($.child(div_61), 2);

							$.each(node_44, 17, () => $.get(decodeResult150).servers, $.index, ($$anchor, server, i) => {
								var div_62 = root_15();
								var node_45 = $.child(div_62);

								Icon(node_45, { name: 'server', size: 'sm' });

								var span = $.sibling(node_45, 2);

								span.textContent = `Server ${i + 1}:`;

								var span_1 = $.sibling(span, 2);
								var text_28 = $.only_child(span_1, true);

								$.reset(div_62);
								$.template_effect(() => $.set_text(text_28, $.get(server)));
								$.append($$anchor, div_62);
							});

							$.reset(div_61);
							$.reset(div_57);

							$.template_effect(() => {
								$.set_text(text_26, ` ${$.get(decodeResult150).totalLength ?? ''} bytes`);
								$.set_text(text_27, ` ${$.get(decodeResult150).servers.length ?? ''}`);
							});

							$.append($$anchor, div_57);
						};

						$.if(node_43, ($$render) => {
							if ($.get(decodeResult150) && $.get(validationErrors).length === 0) $$render(consequent_15);
						});
					}

					var node_46 = $.sibling(node_43, 2);

					{
						var consequent_16 = ($$anchor) => {
							var div_63 = root_17();
							var div_64 = $.sibling($.child(div_63), 2);
							var div_65 = $.child(div_64);
							var text_29 = $.sibling($.child(div_65));

							$.reset(div_65);
							$.reset(div_64);

							var div_66 = $.sibling(div_64, 2);
							var div_67 = $.sibling($.child(div_66), 2);
							var node_47 = $.child(div_67);

							Icon(node_47, { name: 'globe', size: 'sm' });

							var span_2 = $.sibling(node_47, 2);
							var text_30 = $.only_child(span_2, true);

							$.reset(div_67);
							$.reset(div_66);
							$.reset(div_63);

							$.template_effect(() => {
								$.set_text(text_29, ` ${$.get(decodeResult66).totalLength ?? ''} bytes`);
								$.set_text(text_30, $.get(decodeResult66).value);
							});

							$.append($$anchor, div_63);
						};

						$.if(node_46, ($$render) => {
							if ($.get(decodeResult66) && $.get(validationErrors).length === 0) $$render(consequent_16);
						});
					}

					var node_48 = $.sibling(node_46, 2);

					{
						var consequent_17 = ($$anchor) => {
							var div_68 = root_18();
							var div_69 = $.sibling($.child(div_68), 2);
							var div_70 = $.child(div_69);
							var text_31 = $.sibling($.child(div_70));

							$.reset(div_70);
							$.reset(div_69);

							var div_71 = $.sibling(div_69, 2);
							var div_72 = $.sibling($.child(div_71), 2);
							var node_49 = $.child(div_72);

							Icon(node_49, { name: 'file', size: 'sm' });

							var span_3 = $.sibling(node_49, 2);
							var text_32 = $.only_child(span_3, true);

							$.reset(div_72);
							$.reset(div_71);
							$.reset(div_68);

							$.template_effect(() => {
								$.set_text(text_31, ` ${$.get(decodeResult67).totalLength ?? ''} bytes`);
								$.set_text(text_32, $.get(decodeResult67).value);
							});

							$.append($$anchor, div_68);
						};

						$.if(node_48, ($$render) => {
							if ($.get(decodeResult67) && $.get(validationErrors).length === 0) $$render(consequent_17);
						});
					}

					$.bind_select_value(select, () => $.get(decodeMode), ($$value) => $.set(decodeMode, $$value));
					$.bind_value(textarea, () => $.get(decodeInput), ($$value) => $.set(decodeInput, $$value));
					$.delegated('click', button_11, decode);
					$.append($$anchor, fragment_7);
				};

				$.if(node_1, ($$render) => {
					if ($.get(mode) === 'encode') $$render(consequent_13); else $$render(alternate_1, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);