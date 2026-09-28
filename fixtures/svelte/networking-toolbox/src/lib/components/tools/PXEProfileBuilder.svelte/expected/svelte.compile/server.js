import * as $ from 'svelte/internal/server';
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

export default function PXEProfileBuilder($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let profile = {
			...getDefaultPXEProfile(),
			network: {
				subnet: '',
				netmask: '',
				rangeStart: '',
				rangeEnd: '',
				gateway: '',
				dns: ''
			}
		};

		let result = null;
		let validationErrors = [];
		let networkValidationErrors = [];
		let selectedExampleIndex = null;
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
			validationErrors = validatePXEProfile(currentProfile);
			networkValidationErrors = validateNetworkSettings(currentProfile.network);

			if (validationErrors.length === 0 && networkValidationErrors.length === 0) {
				try {
					result = generatePXEProfile(currentProfile);
				} catch(e) {
					validationErrors = [e instanceof Error ? e.message : String(e)];
					result = null;
				}
			} else {
				result = null;
			}
		}

		function loadPresetExample(example, index) {
			profile = { ...example.profile, network: profile.network };
			selectedExampleIndex = index;
		}

		function checkIfExampleStillMatches() {
			if (selectedExampleIndex === null) return;

			const example = presetExamples[selectedExampleIndex];

			if (!example) {
				selectedExampleIndex = null;

				return;
			}

			const matches = profile.name === example.profile.name && profile.architecture === example.profile.architecture && profile.tftpServer === example.profile.tftpServer && profile.biosBootfile === example.profile.biosBootfile && profile.uefiX64Bootfile === example.profile.uefiX64Bootfile && profile.uefiX86Bootfile === example.profile.uefiX86Bootfile && profile.uefiArm64Bootfile === example.profile.uefiArm64Bootfile && profile.uefiArm32Bootfile === example.profile.uefiArm32Bootfile;

			if (!matches) {
				selectedExampleIndex = null;
			}
		}

		ToolContentContainer($$renderer, {
			title: 'PXE Profile Generator',
			description: 'Generate PXE boot profiles with automatic UEFI/BIOS detection using DHCP Options 93/94. Configure bootfiles for different architectures and generate dhcpd/Kea configuration snippets.',
			children: ($$renderer) => {
				ExamplesCard($$renderer, {
					examples: presetExamples,
					onSelect: loadPresetExample,
					getLabel: (ex) => ex.label,
					getDescription: (ex) => ex.description,
					selectedIndex: selectedExampleIndex
				});

				$$renderer.push(`<!----> <div class="card input-card svelte-1cp97x3"><div class="card-header svelte-1cp97x3"><h3 class="svelte-1cp97x3">Profile Configuration</h3></div> <div class="card-content svelte-1cp97x3"><div class="input-group svelte-1cp97x3"><label for="profile-name" class="svelte-1cp97x3">`);
				Icon($$renderer, { name: 'tag', size: 'sm' });
				$$renderer.push(`<!----> Profile Name <span class="required svelte-1cp97x3">*</span></label> <input id="profile-name" type="text"${$.attr('value', profile.name)} placeholder="e.g., Production PXE" class="svelte-1cp97x3"/></div> <div class="input-group svelte-1cp97x3"><label for="tftp-server" class="svelte-1cp97x3">`);
				Icon($$renderer, { name: 'server', size: 'sm' });
				$$renderer.push(`<!----> TFTP Server (Option 66) <span class="required svelte-1cp97x3">*</span></label> <input id="tftp-server" type="text"${$.attr('value', profile.tftpServer)} placeholder="e.g., pxe.example.com or 192.168.1.10" class="svelte-1cp97x3"/> <span class="help-text svelte-1cp97x3">Hostname or IP address of the TFTP server</span></div> <div class="input-group svelte-1cp97x3"><label for="architecture" class="svelte-1cp97x3">`);
				Icon($$renderer, { name: 'cpu', size: 'sm' });
				$$renderer.push(`<!----> Architecture Mode</label> `);

				$$renderer.select(
					{ id: 'architecture', value: profile.architecture, class: '' },
					($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(architectureOptions);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let option = each_array[$$index];

							$$renderer.option({ value: option.value }, ($$renderer) => {
								$$renderer.push(`${$.escape(option.label)}`);
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					'svelte-1cp97x3'
				);

				$$renderer.push(` <span class="help-text svelte-1cp97x3">Auto-detect uses Option 93 to serve different bootfiles based on client firmware</span></div></div></div> <div class="card input-card svelte-1cp97x3"><div class="card-header svelte-1cp97x3"><h3 class="svelte-1cp97x3">Bootfiles (Option 67)</h3> <p class="help-text svelte-1cp97x3">Configure bootfile names for different client architectures. At least one bootfile is required.</p></div> <div class="card-content svelte-1cp97x3">`);

				if (profile.architecture === 'bios' || profile.architecture === 'auto') {
					$$renderer.push(`<!--[0--><div class="input-group svelte-1cp97x3"><label for="bios-bootfile" class="svelte-1cp97x3">`);
					Icon($$renderer, { name: 'hard-drive', size: 'sm' });
					$$renderer.push(`<!----> BIOS Bootfile `);

					if (profile.architecture === 'bios' || profile.architecture === 'auto') {
						$$renderer.push(`<!--[0--><span class="recommended svelte-1cp97x3">(recommended)</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></label> <input id="bios-bootfile" type="text"${$.attr('value', profile.biosBootfile)} placeholder="e.g., pxelinux.0 or undionly.kpxe" class="svelte-1cp97x3"/> <span class="help-text svelte-1cp97x3">For legacy BIOS systems (Arch Type 0x0000)</span></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (profile.architecture === 'uefi-x64' || profile.architecture === 'auto') {
					$$renderer.push(`<!--[0--><div class="input-group svelte-1cp97x3"><label for="uefi-x64-bootfile" class="svelte-1cp97x3">`);
					Icon($$renderer, { name: 'hard-drive', size: 'sm' });
					$$renderer.push(`<!----> UEFI x64 Bootfile `);

					if (profile.architecture === 'uefi-x64' || profile.architecture === 'auto') {
						$$renderer.push(`<!--[0--><span class="recommended svelte-1cp97x3">(recommended)</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></label> <input id="uefi-x64-bootfile" type="text"${$.attr('value', profile.uefiX64Bootfile)} placeholder="e.g., bootx64.efi or ipxe-x64.efi" class="svelte-1cp97x3"/> <span class="help-text svelte-1cp97x3">For UEFI x86-64 systems (Arch Type 0x0007)</span></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (profile.architecture === 'uefi-x86' || profile.architecture === 'auto') {
					$$renderer.push(`<!--[0--><div class="input-group svelte-1cp97x3"><label for="uefi-x86-bootfile" class="svelte-1cp97x3">`);
					Icon($$renderer, { name: 'hard-drive', size: 'sm' });
					$$renderer.push(`<!----> UEFI x86 Bootfile</label> <input id="uefi-x86-bootfile" type="text"${$.attr('value', profile.uefiX86Bootfile)} placeholder="e.g., bootia32.efi" class="svelte-1cp97x3"/> <span class="help-text svelte-1cp97x3">For UEFI IA32 systems (Arch Type 0x0006)</span></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (profile.architecture === 'uefi-arm64' || profile.architecture === 'auto') {
					$$renderer.push(`<!--[0--><div class="input-group svelte-1cp97x3"><label for="uefi-arm64-bootfile" class="svelte-1cp97x3">`);
					Icon($$renderer, { name: 'hard-drive', size: 'sm' });
					$$renderer.push(`<!----> UEFI ARM64 Bootfile</label> <input id="uefi-arm64-bootfile" type="text"${$.attr('value', profile.uefiArm64Bootfile)} placeholder="e.g., bootaa64.efi" class="svelte-1cp97x3"/> <span class="help-text svelte-1cp97x3">For UEFI ARM 64-bit systems (Arch Type 0x000b)</span></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (profile.architecture === 'uefi-arm32' || profile.architecture === 'auto') {
					$$renderer.push(`<!--[0--><div class="input-group svelte-1cp97x3"><label for="uefi-arm32-bootfile" class="svelte-1cp97x3">`);
					Icon($$renderer, { name: 'hard-drive', size: 'sm' });
					$$renderer.push(`<!----> UEFI ARM32 Bootfile</label> <input id="uefi-arm32-bootfile" type="text"${$.attr('value', profile.uefiArm32Bootfile)} placeholder="e.g., bootarm.efi" class="svelte-1cp97x3"/> <span class="help-text svelte-1cp97x3">For UEFI ARM 32-bit systems (Arch Type 0x000a)</span></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div> `);

				if (validationErrors.length > 0) {
					$$renderer.push(`<!--[0--><div class="card errors-card svelte-1cp97x3"><h3 class="svelte-1cp97x3">Validation Errors</h3> <!--[-->`);

					const each_array_1 = $.ensure_array_like(validationErrors);

					for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
						let error = each_array_1[i];

						$$renderer.push(`<div class="error-message svelte-1cp97x3">`);
						Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
						$$renderer.push(`<!----> ${$.escape(error)}</div>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (result) {
					$$renderer.push(`<!--[0--><hr/> <div class="card input-card svelte-1cp97x3"><div class="card-header svelte-1cp97x3"><h3 class="svelte-1cp97x3">Network Settings (Optional)</h3> <p class="help-text svelte-1cp97x3">Customize network values for configuration examples below</p></div> <div class="card-content svelte-1cp97x3"><div class="input-row svelte-1cp97x3"><div class="input-group svelte-1cp97x3"><label for="subnet" class="svelte-1cp97x3">`);
					Icon($$renderer, { name: 'network', size: 'sm' });
					$$renderer.push(`<!----> Subnet</label> <input id="subnet" type="text"${$.attr('value', profile.network.subnet)} placeholder="192.168.1.0" class="svelte-1cp97x3"/></div> <div class="input-group svelte-1cp97x3"><label for="netmask" class="svelte-1cp97x3">`);
					Icon($$renderer, { name: 'network', size: 'sm' });
					$$renderer.push(`<!----> Netmask</label> <input id="netmask" type="text"${$.attr('value', profile.network.netmask)} placeholder="255.255.255.0" class="svelte-1cp97x3"/></div></div> <div class="input-row svelte-1cp97x3"><div class="input-group svelte-1cp97x3"><label for="range-start" class="svelte-1cp97x3">`);
					Icon($$renderer, { name: 'arrow-right', size: 'sm' });
					$$renderer.push(`<!----> Range Start</label> <input id="range-start" type="text"${$.attr('value', profile.network.rangeStart)} placeholder="192.168.1.100" class="svelte-1cp97x3"/></div> <div class="input-group svelte-1cp97x3"><label for="range-end" class="svelte-1cp97x3">`);
					Icon($$renderer, { name: 'arrow-right', size: 'sm' });
					$$renderer.push(`<!----> Range End</label> <input id="range-end" type="text"${$.attr('value', profile.network.rangeEnd)} placeholder="192.168.1.200" class="svelte-1cp97x3"/></div></div> <div class="input-row svelte-1cp97x3"><div class="input-group svelte-1cp97x3"><label for="gateway" class="svelte-1cp97x3">`);
					Icon($$renderer, { name: 'arrow-right', size: 'sm' });
					$$renderer.push(`<!----> Gateway</label> <input id="gateway" type="text"${$.attr('value', profile.network.gateway)} placeholder="192.168.1.1" class="svelte-1cp97x3"/></div> <div class="input-group svelte-1cp97x3"><label for="dns" class="svelte-1cp97x3">`);
					Icon($$renderer, { name: 'globe', size: 'sm' });
					$$renderer.push(`<!----> DNS Server</label> <input id="dns" type="text"${$.attr('value', profile.network.dns)} placeholder="8.8.8.8" class="svelte-1cp97x3"/></div></div></div> `);

					if (networkValidationErrors.length > 0) {
						$$renderer.push(`<!--[0--><div class="network-errors svelte-1cp97x3"><h4 class="svelte-1cp97x3">Network Settings Errors</h4> <!--[-->`);

						const each_array_2 = $.ensure_array_like(networkValidationErrors);

						for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
							let error = each_array_2[i];

							$$renderer.push(`<div class="network-error-item svelte-1cp97x3">`);
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
					$$renderer.push(`<!--[0--><div class="card results svelte-1cp97x3"><h3 class="svelte-1cp97x3">Profile Summary</h3> <div class="summary-card svelte-1cp97x3"><div class="svelte-1cp97x3"><strong class="svelte-1cp97x3">Profile Name:</strong> ${$.escape(result.profile.name)}</div> <div class="svelte-1cp97x3"><strong class="svelte-1cp97x3">Architecture Mode:</strong> ${$.escape(result.profile.architecture)}</div> <div class="svelte-1cp97x3"><strong class="svelte-1cp97x3">TFTP Server:</strong> ${$.escape(result.profile.tftpServer)}</div> `);

					if (result.profile.biosBootfile) {
						$$renderer.push(`<!--[0--><div class="svelte-1cp97x3"><strong class="svelte-1cp97x3">BIOS Bootfile:</strong> ${$.escape(result.profile.biosBootfile)}</div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (result.profile.uefiX64Bootfile) {
						$$renderer.push(`<!--[0--><div class="svelte-1cp97x3"><strong class="svelte-1cp97x3">UEFI x64 Bootfile:</strong> ${$.escape(result.profile.uefiX64Bootfile)}</div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (result.profile.uefiX86Bootfile) {
						$$renderer.push(`<!--[0--><div class="svelte-1cp97x3"><strong class="svelte-1cp97x3">UEFI x86 Bootfile:</strong> ${$.escape(result.profile.uefiX86Bootfile)}</div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (result.profile.uefiArm64Bootfile) {
						$$renderer.push(`<!--[0--><div class="svelte-1cp97x3"><strong class="svelte-1cp97x3">UEFI ARM64 Bootfile:</strong> ${$.escape(result.profile.uefiArm64Bootfile)}</div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (result.profile.uefiArm32Bootfile) {
						$$renderer.push(`<!--[0--><div class="svelte-1cp97x3"><strong class="svelte-1cp97x3">UEFI ARM32 Bootfile:</strong> ${$.escape(result.profile.uefiArm32Bootfile)}</div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></div> <div class="card results svelte-1cp97x3"><h3 class="svelte-1cp97x3">DHCP Server Configuration</h3> `);

					if (result.examples.iscDhcpd) {
						$$renderer.push(`<!--[0--><div class="output-group svelte-1cp97x3"><div class="output-header svelte-1cp97x3"><h4 class="svelte-1cp97x3">ISC dhcpd Configuration</h4> <button type="button"${$.attr_class('copy-btn svelte-1cp97x3', void 0, { 'copied': clipboard.isCopied('isc') })}>`);

						Icon($$renderer, {
							name: clipboard.isCopied('isc') ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('isc') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-1cp97x3">${$.escape(result.examples.iscDhcpd)}</pre></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (result.examples.keaDhcp4) {
						$$renderer.push(`<!--[0--><div class="output-group svelte-1cp97x3"><div class="output-header svelte-1cp97x3"><h4 class="svelte-1cp97x3">Kea DHCPv4 Configuration</h4> <button type="button"${$.attr_class('copy-btn svelte-1cp97x3', void 0, { 'copied': clipboard.isCopied('kea') })}>`);

						Icon($$renderer, {
							name: clipboard.isCopied('kea') ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('kea') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-1cp97x3">${$.escape(result.examples.keaDhcp4)}</pre></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div> <div class="card results svelte-1cp97x3"><h3 class="svelte-1cp97x3">PXE Boot Architecture Detection</h3> <p class="svelte-1cp97x3">DHCP Option 93 (Client System Architecture Type) allows the DHCP server to detect the client's firmware type and
        serve the appropriate bootfile. Common architecture types:</p> <ul class="svelte-1cp97x3"><li class="svelte-1cp97x3"><strong class="svelte-1cp97x3">0x0000</strong> - Intel x86PC (Legacy BIOS)</li> <li class="svelte-1cp97x3"><strong class="svelte-1cp97x3">0x0006</strong> - EFI IA32 (32-bit UEFI)</li> <li class="svelte-1cp97x3"><strong class="svelte-1cp97x3">0x0007</strong> - EFI BC (64-bit UEFI, most common)</li> <li class="svelte-1cp97x3"><strong class="svelte-1cp97x3">0x000a</strong> - EFI ARM 32-bit</li> <li class="svelte-1cp97x3"><strong class="svelte-1cp97x3">0x000b</strong> - EFI ARM 64-bit</li></ul> <p class="svelte-1cp97x3">When using auto-detect mode, the DHCP server will examine Option 93 in the client's DHCPDISCOVER message and
        respond with the appropriate bootfile for that architecture.</p></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});
	});
}