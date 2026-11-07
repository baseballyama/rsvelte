import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { untrack } from 'svelte';
import Icon from '$lib/components/global/Icon.svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import { useClipboard } from '$lib/composables';

import {
	generatePXEProfile,
	getDefaultPXEProfile,
	validatePXEProfile,
	validateNetworkSettings,
	PXE_PRESETS
} from '$lib/utils/dhcp-pxe-profile';

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<span class="recommended svelte-1cp97x3">(recommended)</span>`);
var root_2 = $.from_html(`<div class="input-group svelte-1cp97x3"><label for="bios-bootfile" class="svelte-1cp97x3"><!> BIOS Bootfile <!></label> <input id="bios-bootfile" type="text" placeholder="e.g., pxelinux.0 or undionly.kpxe" class="svelte-1cp97x3"/> <span class="help-text svelte-1cp97x3">For legacy BIOS systems (Arch Type 0x0000)</span></div>`);
var root_3 = $.from_html(`<div class="input-group svelte-1cp97x3"><label for="uefi-x64-bootfile" class="svelte-1cp97x3"><!> UEFI x64 Bootfile <!></label> <input id="uefi-x64-bootfile" type="text" placeholder="e.g., bootx64.efi or ipxe-x64.efi" class="svelte-1cp97x3"/> <span class="help-text svelte-1cp97x3">For UEFI x86-64 systems (Arch Type 0x0007)</span></div>`);
var root_4 = $.from_html(`<div class="input-group svelte-1cp97x3"><label for="uefi-x86-bootfile" class="svelte-1cp97x3"><!> UEFI x86 Bootfile</label> <input id="uefi-x86-bootfile" type="text" placeholder="e.g., bootia32.efi" class="svelte-1cp97x3"/> <span class="help-text svelte-1cp97x3">For UEFI IA32 systems (Arch Type 0x0006)</span></div>`);
var root_5 = $.from_html(`<div class="input-group svelte-1cp97x3"><label for="uefi-arm64-bootfile" class="svelte-1cp97x3"><!> UEFI ARM64 Bootfile</label> <input id="uefi-arm64-bootfile" type="text" placeholder="e.g., bootaa64.efi" class="svelte-1cp97x3"/> <span class="help-text svelte-1cp97x3">For UEFI ARM 64-bit systems (Arch Type 0x000b)</span></div>`);
var root_6 = $.from_html(`<div class="input-group svelte-1cp97x3"><label for="uefi-arm32-bootfile" class="svelte-1cp97x3"><!> UEFI ARM32 Bootfile</label> <input id="uefi-arm32-bootfile" type="text" placeholder="e.g., bootarm.efi" class="svelte-1cp97x3"/> <span class="help-text svelte-1cp97x3">For UEFI ARM 32-bit systems (Arch Type 0x000a)</span></div>`);
var root_7 = $.from_html(`<div class="error-message svelte-1cp97x3"><!> </div>`);
var root_8 = $.from_html(`<div class="card errors-card svelte-1cp97x3"><h3 class="svelte-1cp97x3">Validation Errors</h3> <!></div>`);
var root_9 = $.from_html(`<div class="network-error-item svelte-1cp97x3"><!> </div>`);
var root_10 = $.from_html(`<div class="network-errors svelte-1cp97x3"><h4 class="svelte-1cp97x3">Network Settings Errors</h4> <!></div>`);
var root_11 = $.from_html(`<hr/> <div class="card input-card svelte-1cp97x3"><div class="card-header svelte-1cp97x3"><h3 class="svelte-1cp97x3">Network Settings (Optional)</h3> <p class="help-text svelte-1cp97x3">Customize network values for configuration examples below</p></div> <div class="card-content svelte-1cp97x3"><div class="input-row svelte-1cp97x3"><div class="input-group svelte-1cp97x3"><label for="subnet" class="svelte-1cp97x3"><!> Subnet</label> <input id="subnet" type="text" placeholder="192.168.1.0" class="svelte-1cp97x3"/></div> <div class="input-group svelte-1cp97x3"><label for="netmask" class="svelte-1cp97x3"><!> Netmask</label> <input id="netmask" type="text" placeholder="255.255.255.0" class="svelte-1cp97x3"/></div></div> <div class="input-row svelte-1cp97x3"><div class="input-group svelte-1cp97x3"><label for="range-start" class="svelte-1cp97x3"><!> Range Start</label> <input id="range-start" type="text" placeholder="192.168.1.100" class="svelte-1cp97x3"/></div> <div class="input-group svelte-1cp97x3"><label for="range-end" class="svelte-1cp97x3"><!> Range End</label> <input id="range-end" type="text" placeholder="192.168.1.200" class="svelte-1cp97x3"/></div></div> <div class="input-row svelte-1cp97x3"><div class="input-group svelte-1cp97x3"><label for="gateway" class="svelte-1cp97x3"><!> Gateway</label> <input id="gateway" type="text" placeholder="192.168.1.1" class="svelte-1cp97x3"/></div> <div class="input-group svelte-1cp97x3"><label for="dns" class="svelte-1cp97x3"><!> DNS Server</label> <input id="dns" type="text" placeholder="8.8.8.8" class="svelte-1cp97x3"/></div></div></div> <!></div>`, 1);
var root_12 = $.from_html(`<div class="svelte-1cp97x3"><strong class="svelte-1cp97x3">BIOS Bootfile:</strong> </div>`);
var root_13 = $.from_html(`<div class="svelte-1cp97x3"><strong class="svelte-1cp97x3">UEFI x64 Bootfile:</strong> </div>`);
var root_14 = $.from_html(`<div class="svelte-1cp97x3"><strong class="svelte-1cp97x3">UEFI x86 Bootfile:</strong> </div>`);
var root_15 = $.from_html(`<div class="svelte-1cp97x3"><strong class="svelte-1cp97x3">UEFI ARM64 Bootfile:</strong> </div>`);
var root_16 = $.from_html(`<div class="svelte-1cp97x3"><strong class="svelte-1cp97x3">UEFI ARM32 Bootfile:</strong> </div>`);
var root_17 = $.from_html(`<div class="output-group svelte-1cp97x3"><div class="output-header svelte-1cp97x3"><h4 class="svelte-1cp97x3">ISC dhcpd Configuration</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-1cp97x3"> </pre></div>`);
var root_18 = $.from_html(`<div class="output-group svelte-1cp97x3"><div class="output-header svelte-1cp97x3"><h4 class="svelte-1cp97x3">Kea DHCPv4 Configuration</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-1cp97x3"> </pre></div>`);

var root_19 = $.from_html(
	`<div class="card results svelte-1cp97x3"><h3 class="svelte-1cp97x3">Profile Summary</h3> <div class="summary-card svelte-1cp97x3"><div class="svelte-1cp97x3"><strong class="svelte-1cp97x3">Profile Name:</strong> </div> <div class="svelte-1cp97x3"><strong class="svelte-1cp97x3">Architecture Mode:</strong> </div> <div class="svelte-1cp97x3"><strong class="svelte-1cp97x3">TFTP Server:</strong> </div> <!> <!> <!> <!> <!></div></div> <div class="card results svelte-1cp97x3"><h3 class="svelte-1cp97x3">DHCP Server Configuration</h3> <!> <!></div> <div class="card results svelte-1cp97x3"><h3 class="svelte-1cp97x3">PXE Boot Architecture Detection</h3> <p class="svelte-1cp97x3">DHCP Option 93 (Client System Architecture Type) allows the DHCP server to detect the client's firmware type and
        serve the appropriate bootfile. Common architecture types:</p> <ul class="svelte-1cp97x3"><li class="svelte-1cp97x3"><strong class="svelte-1cp97x3">0x0000</strong> - Intel x86PC (Legacy BIOS)</li> <li class="svelte-1cp97x3"><strong class="svelte-1cp97x3">0x0006</strong> - EFI IA32 (32-bit UEFI)</li> <li class="svelte-1cp97x3"><strong class="svelte-1cp97x3">0x0007</strong> - EFI BC (64-bit UEFI, most common)</li> <li class="svelte-1cp97x3"><strong class="svelte-1cp97x3">0x000a</strong> - EFI ARM 32-bit</li> <li class="svelte-1cp97x3"><strong class="svelte-1cp97x3">0x000b</strong> - EFI ARM 64-bit</li></ul> <p class="svelte-1cp97x3">When using auto-detect mode, the DHCP server will examine Option 93 in the client's DHCPDISCOVER message and
        respond with the appropriate bootfile for that architecture.</p></div>`,
	1
);

var root_20 = $.from_html(`<!> <div class="card input-card svelte-1cp97x3"><div class="card-header svelte-1cp97x3"><h3 class="svelte-1cp97x3">Profile Configuration</h3></div> <div class="card-content svelte-1cp97x3"><div class="input-group svelte-1cp97x3"><label for="profile-name" class="svelte-1cp97x3"><!> Profile Name <span class="required svelte-1cp97x3">*</span></label> <input id="profile-name" type="text" placeholder="e.g., Production PXE" class="svelte-1cp97x3"/></div> <div class="input-group svelte-1cp97x3"><label for="tftp-server" class="svelte-1cp97x3"><!> TFTP Server (Option 66) <span class="required svelte-1cp97x3">*</span></label> <input id="tftp-server" type="text" placeholder="e.g., pxe.example.com or 192.168.1.10" class="svelte-1cp97x3"/> <span class="help-text svelte-1cp97x3">Hostname or IP address of the TFTP server</span></div> <div class="input-group svelte-1cp97x3"><label for="architecture" class="svelte-1cp97x3"><!> Architecture Mode</label> <select id="architecture" class="svelte-1cp97x3"></select> <span class="help-text svelte-1cp97x3">Auto-detect uses Option 93 to serve different bootfiles based on client firmware</span></div></div></div> <div class="card input-card svelte-1cp97x3"><div class="card-header svelte-1cp97x3"><h3 class="svelte-1cp97x3">Bootfiles (Option 67)</h3> <p class="help-text svelte-1cp97x3">Configure bootfile names for different client architectures. At least one bootfile is required.</p></div> <div class="card-content svelte-1cp97x3"><!> <!> <!> <!> <!></div></div> <!> <!> <!>`, 1);

export default function PXEProfileBuilder($$anchor, $$props) {
	$.push($$props, true);

	let profile = $.state($.proxy({
		...getDefaultPXEProfile(),
		network: {
			subnet: '',
			netmask: '',
			rangeStart: '',
			rangeEnd: '',
			gateway: '',
			dns: ''
		}
	}));

	let result = $.state(null);
	let validationErrors = $.state($.proxy([]));
	let networkValidationErrors = $.state($.proxy([]));
	let selectedExampleIndex = $.state(null);
	const clipboard = useClipboard();

	const presetExamples = PXE_PRESETS.map((preset) => ({
		label: preset.name,
		profile: preset,
		description: `${preset.architecture === 'auto'
			? 'Auto-detect UEFI/BIOS'
			: preset.architecture.toUpperCase()} - ${preset.tftpServer}`
	}));

	const architectureOptions = [
		{ value: 'auto', label: 'Auto-detect' },
		{ value: 'bios', label: 'BIOS only' },
		{ value: 'uefi-x64', label: 'UEFI x64' },
		{ value: 'uefi-x86', label: 'UEFI x86' },
		{ value: 'uefi-arm64', label: 'UEFI ARM64' },
		{ value: 'uefi-arm32', label: 'UEFI ARM32' }
	];

	function validateAndGenerate(currentProfile) {
		$.set(validationErrors, validatePXEProfile(currentProfile), true);
		$.set(networkValidationErrors, validateNetworkSettings(currentProfile.network), true);

		if ($.get(validationErrors).length === 0 && $.get(networkValidationErrors).length === 0) {
			try {
				$.set(result, generatePXEProfile(currentProfile), true);
			} catch(e) {
				$.set(validationErrors, [e instanceof Error ? e.message : String(e)], true);
				$.set(result, null);
			}
		} else {
			$.set(result, null);
		}
	}

	function loadPresetExample(example, index) {
		$.set(profile, { ...example.profile, network: $.get(profile).network }, true);
		$.set(selectedExampleIndex, index, true);
	}

	function checkIfExampleStillMatches() {
		if ($.get(selectedExampleIndex) === null) return;

		const example = presetExamples[$.get(selectedExampleIndex)];

		if (!example) {
			$.set(selectedExampleIndex, null);

			return;
		}

		const matches = $.get(profile).name === example.profile.name && $.get(profile).architecture === example.profile.architecture && $.get(profile).tftpServer === example.profile.tftpServer && $.get(profile).biosBootfile === example.profile.biosBootfile && $.get(profile).uefiX64Bootfile === example.profile.uefiX64Bootfile && $.get(profile).uefiX86Bootfile === example.profile.uefiX86Bootfile && $.get(profile).uefiArm64Bootfile === example.profile.uefiArm64Bootfile && $.get(profile).uefiArm32Bootfile === example.profile.uefiArm32Bootfile;

		if (!matches) {
			$.set(selectedExampleIndex, null);
		}
	}

	$.user_effect(() => {
		const currentProfile = {
			...$.get(profile),
			network: $.get(profile).network ? { ...$.get(profile).network } : undefined
		};

		untrack(() => {
			validateAndGenerate(currentProfile);
			checkIfExampleStillMatches();
		});
	});

	ToolContentContainer($$anchor, {
		title: 'PXE Profile Generator',
		description: 'Generate PXE boot profiles with automatic UEFI/BIOS detection using DHCP Options 93/94. Configure bootfiles for different architectures and generate dhcpd/Kea configuration snippets.',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_20();
			var node = $.first_child(fragment_1);

			ExamplesCard(node, {
				get examples() {
					return presetExamples;
				},
				onSelect: loadPresetExample,
				getLabel: (ex) => ex.label,
				getDescription: (ex) => ex.description,
				get selectedIndex() {
					return $.get(selectedExampleIndex);
				}
			});

			var div = $.sibling(node, 2);
			var div_1 = $.sibling($.child(div), 2);
			var div_2 = $.child(div_1);
			var label = $.child(div_2);
			var node_1 = $.child(label);

			Icon(node_1, { name: 'tag', size: 'sm' });
			$.next(2);
			$.reset(label);

			var input = $.sibling(label, 2);

			$.remove_input_defaults(input);
			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);
			var label_1 = $.child(div_3);
			var node_2 = $.child(label_1);

			Icon(node_2, { name: 'server', size: 'sm' });
			$.next(2);
			$.reset(label_1);

			var input_1 = $.sibling(label_1, 2);

			$.remove_input_defaults(input_1);
			$.next(2);
			$.reset(div_3);

			var div_4 = $.sibling(div_3, 2);
			var label_2 = $.child(div_4);
			var node_3 = $.child(label_2);

			Icon(node_3, { name: 'cpu', size: 'sm' });
			$.next();
			$.reset(label_2);

			var select = $.sibling(label_2, 2);

			$.each(select, 21, () => architectureOptions, (option) => option.value, ($$anchor, option) => {
				var option_1 = root();
				var text = $.only_child(option_1, true);
				var option_1_value = {};

				$.template_effect(() => {
					$.set_text(text, $.get(option).label);

					if (option_1_value !== (option_1_value = $.get(option).value)) {
						option_1.value = (option_1.__value = option_1_value) ?? '';
					}
				});

				$.append($$anchor, option_1);
			});

			$.reset(select);
			$.init_select(select);
			$.next(2);
			$.reset(div_4);
			$.reset(div_1);
			$.reset(div);

			var div_5 = $.sibling(div, 2);
			var div_6 = $.sibling($.child(div_5), 2);
			var node_4 = $.child(div_6);

			{
				var consequent_1 = ($$anchor) => {
					var div_7 = root_2();
					var label_3 = $.child(div_7);
					var node_5 = $.child(label_3);

					Icon(node_5, { name: 'hard-drive', size: 'sm' });

					var node_6 = $.sibling(node_5, 2);

					{
						var consequent = ($$anchor) => {
							var span = root_1();

							$.append($$anchor, span);
						};

						$.if(node_6, ($$render) => {
							if ($.get(profile).architecture === 'bios' || $.get(profile).architecture === 'auto') $$render(consequent);
						});
					}

					$.reset(label_3);

					var input_2 = $.sibling(label_3, 2);

					$.remove_input_defaults(input_2);
					$.next(2);
					$.reset(div_7);
					$.bind_value(input_2, () => $.get(profile).biosBootfile, ($$value) => $.get(profile).biosBootfile = $$value);
					$.append($$anchor, div_7);
				};

				$.if(node_4, ($$render) => {
					if ($.get(profile).architecture === 'bios' || $.get(profile).architecture === 'auto') $$render(consequent_1);
				});
			}

			var node_7 = $.sibling(node_4, 2);

			{
				var consequent_3 = ($$anchor) => {
					var div_8 = root_3();
					var label_4 = $.child(div_8);
					var node_8 = $.child(label_4);

					Icon(node_8, { name: 'hard-drive', size: 'sm' });

					var node_9 = $.sibling(node_8, 2);

					{
						var consequent_2 = ($$anchor) => {
							var span_1 = root_1();

							$.append($$anchor, span_1);
						};

						$.if(node_9, ($$render) => {
							if ($.get(profile).architecture === 'uefi-x64' || $.get(profile).architecture === 'auto') $$render(consequent_2);
						});
					}

					$.reset(label_4);

					var input_3 = $.sibling(label_4, 2);

					$.remove_input_defaults(input_3);
					$.next(2);
					$.reset(div_8);
					$.bind_value(input_3, () => $.get(profile).uefiX64Bootfile, ($$value) => $.get(profile).uefiX64Bootfile = $$value);
					$.append($$anchor, div_8);
				};

				$.if(node_7, ($$render) => {
					if ($.get(profile).architecture === 'uefi-x64' || $.get(profile).architecture === 'auto') $$render(consequent_3);
				});
			}

			var node_10 = $.sibling(node_7, 2);

			{
				var consequent_4 = ($$anchor) => {
					var div_9 = root_4();
					var label_5 = $.child(div_9);
					var node_11 = $.child(label_5);

					Icon(node_11, { name: 'hard-drive', size: 'sm' });
					$.next();
					$.reset(label_5);

					var input_4 = $.sibling(label_5, 2);

					$.remove_input_defaults(input_4);
					$.next(2);
					$.reset(div_9);
					$.bind_value(input_4, () => $.get(profile).uefiX86Bootfile, ($$value) => $.get(profile).uefiX86Bootfile = $$value);
					$.append($$anchor, div_9);
				};

				$.if(node_10, ($$render) => {
					if ($.get(profile).architecture === 'uefi-x86' || $.get(profile).architecture === 'auto') $$render(consequent_4);
				});
			}

			var node_12 = $.sibling(node_10, 2);

			{
				var consequent_5 = ($$anchor) => {
					var div_10 = root_5();
					var label_6 = $.child(div_10);
					var node_13 = $.child(label_6);

					Icon(node_13, { name: 'hard-drive', size: 'sm' });
					$.next();
					$.reset(label_6);

					var input_5 = $.sibling(label_6, 2);

					$.remove_input_defaults(input_5);
					$.next(2);
					$.reset(div_10);
					$.bind_value(input_5, () => $.get(profile).uefiArm64Bootfile, ($$value) => $.get(profile).uefiArm64Bootfile = $$value);
					$.append($$anchor, div_10);
				};

				$.if(node_12, ($$render) => {
					if ($.get(profile).architecture === 'uefi-arm64' || $.get(profile).architecture === 'auto') $$render(consequent_5);
				});
			}

			var node_14 = $.sibling(node_12, 2);

			{
				var consequent_6 = ($$anchor) => {
					var div_11 = root_6();
					var label_7 = $.child(div_11);
					var node_15 = $.child(label_7);

					Icon(node_15, { name: 'hard-drive', size: 'sm' });
					$.next();
					$.reset(label_7);

					var input_6 = $.sibling(label_7, 2);

					$.remove_input_defaults(input_6);
					$.next(2);
					$.reset(div_11);
					$.bind_value(input_6, () => $.get(profile).uefiArm32Bootfile, ($$value) => $.get(profile).uefiArm32Bootfile = $$value);
					$.append($$anchor, div_11);
				};

				$.if(node_14, ($$render) => {
					if ($.get(profile).architecture === 'uefi-arm32' || $.get(profile).architecture === 'auto') $$render(consequent_6);
				});
			}

			$.reset(div_6);
			$.reset(div_5);

			var node_16 = $.sibling(div_5, 2);

			{
				var consequent_7 = ($$anchor) => {
					var div_12 = root_8();
					var node_17 = $.sibling($.child(div_12), 2);

					$.each(node_17, 17, () => $.get(validationErrors), $.index, ($$anchor, error) => {
						var div_13 = root_7();
						var node_18 = $.child(div_13);

						Icon(node_18, { name: 'alert-triangle', size: 'sm' });

						var text_1 = $.sibling(node_18);

						$.reset(div_13);
						$.template_effect(() => $.set_text(text_1, ` ${$.get(error) ?? ''}`));
						$.append($$anchor, div_13);
					});

					$.reset(div_12);
					$.append($$anchor, div_12);
				};

				$.if(node_16, ($$render) => {
					if ($.get(validationErrors).length > 0) $$render(consequent_7);
				});
			}

			var node_19 = $.sibling(node_16, 2);

			{
				var consequent_9 = ($$anchor) => {
					var fragment_2 = root_11();
					var div_14 = $.sibling($.first_child(fragment_2), 2);
					var div_15 = $.sibling($.child(div_14), 2);
					var div_16 = $.child(div_15);
					var div_17 = $.child(div_16);
					var label_8 = $.child(div_17);
					var node_20 = $.child(label_8);

					Icon(node_20, { name: 'network', size: 'sm' });
					$.next();
					$.reset(label_8);

					var input_7 = $.sibling(label_8, 2);

					$.remove_input_defaults(input_7);
					$.reset(div_17);

					var div_18 = $.sibling(div_17, 2);
					var label_9 = $.child(div_18);
					var node_21 = $.child(label_9);

					Icon(node_21, { name: 'network', size: 'sm' });
					$.next();
					$.reset(label_9);

					var input_8 = $.sibling(label_9, 2);

					$.remove_input_defaults(input_8);
					$.reset(div_18);
					$.reset(div_16);

					var div_19 = $.sibling(div_16, 2);
					var div_20 = $.child(div_19);
					var label_10 = $.child(div_20);
					var node_22 = $.child(label_10);

					Icon(node_22, { name: 'arrow-right', size: 'sm' });
					$.next();
					$.reset(label_10);

					var input_9 = $.sibling(label_10, 2);

					$.remove_input_defaults(input_9);
					$.reset(div_20);

					var div_21 = $.sibling(div_20, 2);
					var label_11 = $.child(div_21);
					var node_23 = $.child(label_11);

					Icon(node_23, { name: 'arrow-right', size: 'sm' });
					$.next();
					$.reset(label_11);

					var input_10 = $.sibling(label_11, 2);

					$.remove_input_defaults(input_10);
					$.reset(div_21);
					$.reset(div_19);

					var div_22 = $.sibling(div_19, 2);
					var div_23 = $.child(div_22);
					var label_12 = $.child(div_23);
					var node_24 = $.child(label_12);

					Icon(node_24, { name: 'arrow-right', size: 'sm' });
					$.next();
					$.reset(label_12);

					var input_11 = $.sibling(label_12, 2);

					$.remove_input_defaults(input_11);
					$.reset(div_23);

					var div_24 = $.sibling(div_23, 2);
					var label_13 = $.child(div_24);
					var node_25 = $.child(label_13);

					Icon(node_25, { name: 'globe', size: 'sm' });
					$.next();
					$.reset(label_13);

					var input_12 = $.sibling(label_13, 2);

					$.remove_input_defaults(input_12);
					$.reset(div_24);
					$.reset(div_22);
					$.reset(div_15);

					var node_26 = $.sibling(div_15, 2);

					{
						var consequent_8 = ($$anchor) => {
							var div_25 = root_10();
							var node_27 = $.sibling($.child(div_25), 2);

							$.each(node_27, 17, () => $.get(networkValidationErrors), $.index, ($$anchor, error) => {
								var div_26 = root_9();
								var node_28 = $.child(div_26);

								Icon(node_28, { name: 'alert-triangle', size: 'sm' });

								var text_2 = $.sibling(node_28);

								$.reset(div_26);
								$.template_effect(() => $.set_text(text_2, ` ${$.get(error) ?? ''}`));
								$.append($$anchor, div_26);
							});

							$.reset(div_25);
							$.append($$anchor, div_25);
						};

						$.if(node_26, ($$render) => {
							if ($.get(networkValidationErrors).length > 0) $$render(consequent_8);
						});
					}

					$.reset(div_14);
					$.bind_value(input_7, () => $.get(profile).network.subnet, ($$value) => $.get(profile).network.subnet = $$value);
					$.bind_value(input_8, () => $.get(profile).network.netmask, ($$value) => $.get(profile).network.netmask = $$value);
					$.bind_value(input_9, () => $.get(profile).network.rangeStart, ($$value) => $.get(profile).network.rangeStart = $$value);
					$.bind_value(input_10, () => $.get(profile).network.rangeEnd, ($$value) => $.get(profile).network.rangeEnd = $$value);
					$.bind_value(input_11, () => $.get(profile).network.gateway, ($$value) => $.get(profile).network.gateway = $$value);
					$.bind_value(input_12, () => $.get(profile).network.dns, ($$value) => $.get(profile).network.dns = $$value);
					$.append($$anchor, fragment_2);
				};

				$.if(node_19, ($$render) => {
					if ($.get(result)) $$render(consequent_9);
				});
			}

			var node_29 = $.sibling(node_19, 2);

			{
				var consequent_17 = ($$anchor) => {
					var fragment_3 = root_19();
					var div_27 = $.first_child(fragment_3);
					var div_28 = $.sibling($.child(div_27), 2);
					var div_29 = $.child(div_28);
					var text_3 = $.sibling($.child(div_29));

					$.reset(div_29);

					var div_30 = $.sibling(div_29, 2);
					var text_4 = $.sibling($.child(div_30));

					$.reset(div_30);

					var div_31 = $.sibling(div_30, 2);
					var text_5 = $.sibling($.child(div_31));

					$.reset(div_31);

					var node_30 = $.sibling(div_31, 2);

					{
						var consequent_10 = ($$anchor) => {
							var div_32 = root_12();
							var text_6 = $.sibling($.child(div_32));

							$.reset(div_32);
							$.template_effect(() => $.set_text(text_6, ` ${$.get(result).profile.biosBootfile ?? ''}`));
							$.append($$anchor, div_32);
						};

						$.if(node_30, ($$render) => {
							if ($.get(result).profile.biosBootfile) $$render(consequent_10);
						});
					}

					var node_31 = $.sibling(node_30, 2);

					{
						var consequent_11 = ($$anchor) => {
							var div_33 = root_13();
							var text_7 = $.sibling($.child(div_33));

							$.reset(div_33);
							$.template_effect(() => $.set_text(text_7, ` ${$.get(result).profile.uefiX64Bootfile ?? ''}`));
							$.append($$anchor, div_33);
						};

						$.if(node_31, ($$render) => {
							if ($.get(result).profile.uefiX64Bootfile) $$render(consequent_11);
						});
					}

					var node_32 = $.sibling(node_31, 2);

					{
						var consequent_12 = ($$anchor) => {
							var div_34 = root_14();
							var text_8 = $.sibling($.child(div_34));

							$.reset(div_34);
							$.template_effect(() => $.set_text(text_8, ` ${$.get(result).profile.uefiX86Bootfile ?? ''}`));
							$.append($$anchor, div_34);
						};

						$.if(node_32, ($$render) => {
							if ($.get(result).profile.uefiX86Bootfile) $$render(consequent_12);
						});
					}

					var node_33 = $.sibling(node_32, 2);

					{
						var consequent_13 = ($$anchor) => {
							var div_35 = root_15();
							var text_9 = $.sibling($.child(div_35));

							$.reset(div_35);
							$.template_effect(() => $.set_text(text_9, ` ${$.get(result).profile.uefiArm64Bootfile ?? ''}`));
							$.append($$anchor, div_35);
						};

						$.if(node_33, ($$render) => {
							if ($.get(result).profile.uefiArm64Bootfile) $$render(consequent_13);
						});
					}

					var node_34 = $.sibling(node_33, 2);

					{
						var consequent_14 = ($$anchor) => {
							var div_36 = root_16();
							var text_10 = $.sibling($.child(div_36));

							$.reset(div_36);
							$.template_effect(() => $.set_text(text_10, ` ${$.get(result).profile.uefiArm32Bootfile ?? ''}`));
							$.append($$anchor, div_36);
						};

						$.if(node_34, ($$render) => {
							if ($.get(result).profile.uefiArm32Bootfile) $$render(consequent_14);
						});
					}

					$.reset(div_28);
					$.reset(div_27);

					var div_37 = $.sibling(div_27, 2);
					var node_35 = $.sibling($.child(div_37), 2);

					{
						var consequent_15 = ($$anchor) => {
							var div_38 = root_17();
							var div_39 = $.child(div_38);
							var button = $.sibling($.child(div_39), 2);
							let classes;
							var node_36 = $.child(button);

							{
								let $0 = $.derived(() => clipboard.isCopied('isc') ? 'check' : 'copy');

								Icon(node_36, {
									get name() {
										return $.get($0);
									},
									size: 'xs'
								});
							}

							var text_11 = $.sibling(node_36);

							$.reset(button);
							$.reset(div_39);

							var pre = $.sibling(div_39, 2);
							var text_12 = $.only_child(pre, true);

							$.reset(div_38);

							$.template_effect(
								($0, $1) => {
									classes = $.set_class(button, 1, 'copy-btn svelte-1cp97x3', null, classes, { copied: $0 });
									$.set_text(text_11, ` ${$1 ?? ''}`);
									$.set_text(text_12, $.get(result).examples.iscDhcpd);
								},
								[
									() => clipboard.isCopied('isc'),
									() => clipboard.isCopied('isc') ? 'Copied' : 'Copy'
								]
							);

							$.delegated('click', button, () => clipboard.copy($.get(result).examples.iscDhcpd, 'isc'));
							$.append($$anchor, div_38);
						};

						$.if(node_35, ($$render) => {
							if ($.get(result).examples.iscDhcpd) $$render(consequent_15);
						});
					}

					var node_37 = $.sibling(node_35, 2);

					{
						var consequent_16 = ($$anchor) => {
							var div_40 = root_18();
							var div_41 = $.child(div_40);
							var button_1 = $.sibling($.child(div_41), 2);
							let classes_1;
							var node_38 = $.child(button_1);

							{
								let $0 = $.derived(() => clipboard.isCopied('kea') ? 'check' : 'copy');

								Icon(node_38, {
									get name() {
										return $.get($0);
									},
									size: 'xs'
								});
							}

							var text_13 = $.sibling(node_38);

							$.reset(button_1);
							$.reset(div_41);

							var pre_1 = $.sibling(div_41, 2);
							var text_14 = $.only_child(pre_1, true);

							$.reset(div_40);

							$.template_effect(
								($0, $1) => {
									classes_1 = $.set_class(button_1, 1, 'copy-btn svelte-1cp97x3', null, classes_1, { copied: $0 });
									$.set_text(text_13, ` ${$1 ?? ''}`);
									$.set_text(text_14, $.get(result).examples.keaDhcp4);
								},
								[
									() => clipboard.isCopied('kea'),
									() => clipboard.isCopied('kea') ? 'Copied' : 'Copy'
								]
							);

							$.delegated('click', button_1, () => clipboard.copy($.get(result).examples.keaDhcp4, 'kea'));
							$.append($$anchor, div_40);
						};

						$.if(node_37, ($$render) => {
							if ($.get(result).examples.keaDhcp4) $$render(consequent_16);
						});
					}

					$.reset(div_37);
					$.next(2);

					$.template_effect(() => {
						$.set_text(text_3, ` ${$.get(result).profile.name ?? ''}`);
						$.set_text(text_4, ` ${$.get(result).profile.architecture ?? ''}`);
						$.set_text(text_5, ` ${$.get(result).profile.tftpServer ?? ''}`);
					});

					$.append($$anchor, fragment_3);
				};

				$.if(node_29, ($$render) => {
					if ($.get(result) && $.get(networkValidationErrors).length === 0) $$render(consequent_17);
				});
			}

			$.bind_value(input, () => $.get(profile).name, ($$value) => $.get(profile).name = $$value);
			$.bind_value(input_1, () => $.get(profile).tftpServer, ($$value) => $.get(profile).tftpServer = $$value);
			$.bind_select_value(select, () => $.get(profile).architecture, ($$value) => $.get(profile).architecture = $$value);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);