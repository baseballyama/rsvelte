import * as $ from 'svelte/internal/server';

import {
	validateClientIDConfig,
	buildClientID,
	decodeClientID,
	CLIENTID_BUILD_EXAMPLES,
	CLIENTID_DECODE_EXAMPLES,
	HARDWARE_TYPES
} from '$lib/utils/dhcp-clientid-option61';

import { untrack } from 'svelte';
import Icon from '$lib/components/global/Icon.svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import { useClipboard } from '$lib/composables';

export default function ClientIDOption61($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let activeTab = 'build';

		const navOptions = [
			{ value: 'build', label: 'Build', icon: 'settings' },
			{ value: 'decode', label: 'Decode', icon: 'code' }
		];

		let mode = 'hardware';
		let hardwareType = HARDWARE_TYPES.ETHERNET;
		let macAddress = '';
		let opaqueData = '';
		let opaqueFormat = 'text';
		let decodeHex = '';
		let validationErrors = [];
		let buildResult = null;
		let decodeResult = null;
		let selectedExampleIndex = null;
		const clipboard = useClipboard();
		const buildExamples = CLIENTID_BUILD_EXAMPLES.map((ex) => ({ label: ex.name, config: ex, description: ex.description }));

		const decodeExamples = CLIENTID_DECODE_EXAMPLES.map((ex) => ({
			label: ex.name,
			hexData: ex.hexData,
			description: ex.description
		}));

		function loadBuildExample(example, index) {
			const cfg = example.config;

			mode = cfg.mode;
			hardwareType = cfg.hardwareType ?? HARDWARE_TYPES.ETHERNET;
			macAddress = cfg.macAddress || '';
			opaqueData = cfg.opaqueData || '';
			opaqueFormat = cfg.opaqueFormat || 'text';
			selectedExampleIndex = index;
		}

		function loadDecodeExample(example, index) {
			decodeHex = example.hexData;
			selectedExampleIndex = index;
		}

		function checkIfExampleStillMatches() {
			if (selectedExampleIndex === null) return;

			if (activeTab === 'build') {
				const example = buildExamples[selectedExampleIndex];

				if (!example) {
					selectedExampleIndex = null;

					return;
				}

				const cfg = example.config;
				const matches = mode === cfg.mode && hardwareType === (cfg.hardwareType ?? HARDWARE_TYPES.ETHERNET) && macAddress === (cfg.macAddress || '') && opaqueData === (cfg.opaqueData || '') && opaqueFormat === (cfg.opaqueFormat || 'text');

				if (!matches) selectedExampleIndex = null;
			} else {
				const example = decodeExamples[selectedExampleIndex];

				if (!example || decodeHex !== example.hexData) {
					selectedExampleIndex = null;
				}
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ToolContentContainer($$renderer, {
				title: 'DHCPv4 Client Identifier (Option 61)',
				description: 'Build and decode DHCPv4 Client Identifier (Option 61) with hardware type + MAC address or arbitrary opaque data per RFC 2132.',
				navOptions,
				get selectedNav() {
					return activeTab;
				},

				set selectedNav($$value) {
					activeTab = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (activeTab === 'build') {
						$$renderer.push('<!--[0-->');

						ExamplesCard($$renderer, {
							examples: buildExamples,
							onSelect: loadBuildExample,
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

					if (activeTab === 'build') {
						$$renderer.push(`<!--[0--><div class="card input-card svelte-1mudz6i"><div class="card-header svelte-1mudz6i"><h3 class="svelte-1mudz6i">Build Client Identifier</h3> <p class="help-text svelte-1mudz6i">Configure DHCPv4 Client Identifier for device identification</p></div> <div class="card-content svelte-1mudz6i"><div class="input-group svelte-1mudz6i"><label for="mode" class="svelte-1mudz6i">`);
						Icon($$renderer, { name: 'settings', size: 'sm' });
						$$renderer.push(`<!----> Mode</label> `);

						$$renderer.select(
							{ id: 'mode', value: mode, class: '' },
							($$renderer) => {
								$$renderer.option({ value: 'hardware' }, ($$renderer) => {
									$$renderer.push(`Hardware Type + MAC Address`);
								});

								$$renderer.option({ value: 'opaque' }, ($$renderer) => {
									$$renderer.push(`Opaque Data (Text or Hex)`);
								});
							},
							'svelte-1mudz6i'
						);

						$$renderer.push(`</div> `);

						if (mode === 'hardware') {
							$$renderer.push(`<!--[0--><div class="input-group svelte-1mudz6i"><label for="hardware-type" class="svelte-1mudz6i">`);
							Icon($$renderer, { name: 'cpu', size: 'sm' });
							$$renderer.push(`<!----> Hardware Type</label> `);

							$$renderer.select(
								{ id: 'hardware-type', value: hardwareType, class: '' },
								($$renderer) => {
									$$renderer.option({ value: HARDWARE_TYPES.ETHERNET }, ($$renderer) => {
										$$renderer.push(`Ethernet (1)`);
									});

									$$renderer.option({ value: HARDWARE_TYPES.EXPERIMENTAL_ETHERNET }, ($$renderer) => {
										$$renderer.push(`Experimental Ethernet (2)`);
									});

									$$renderer.option({ value: HARDWARE_TYPES.IEEE_802 }, ($$renderer) => {
										$$renderer.push(`IEEE 802 (6)`);
									});

									$$renderer.option({ value: HARDWARE_TYPES.ARCNET }, ($$renderer) => {
										$$renderer.push(`ARCNET (7)`);
									});

									$$renderer.option({ value: HARDWARE_TYPES.FRAME_RELAY }, ($$renderer) => {
										$$renderer.push(`Frame Relay (15)`);
									});

									$$renderer.option({ value: HARDWARE_TYPES.ATM }, ($$renderer) => {
										$$renderer.push(`ATM (16)`);
									});

									$$renderer.option({ value: HARDWARE_TYPES.HDLC }, ($$renderer) => {
										$$renderer.push(`HDLC (17)`);
									});

									$$renderer.option({ value: HARDWARE_TYPES.FIBRE_CHANNEL }, ($$renderer) => {
										$$renderer.push(`Fibre Channel (18)`);
									});

									$$renderer.option({ value: HARDWARE_TYPES.IEEE_1394 }, ($$renderer) => {
										$$renderer.push(`IEEE 1394 (24)`);
									});

									$$renderer.option({ value: HARDWARE_TYPES.INFINIBAND }, ($$renderer) => {
										$$renderer.push(`InfiniBand (32)`);
									});
								},
								'svelte-1mudz6i'
							);

							$$renderer.push(`</div> <div class="input-group svelte-1mudz6i"><label for="mac-address" class="svelte-1mudz6i">`);
							Icon($$renderer, { name: 'hash', size: 'sm' });
							$$renderer.push(`<!----> MAC Address</label> <input id="mac-address" type="text"${$.attr('value', macAddress)} placeholder="00:0c:29:4f:a3:d2" class="svelte-1mudz6i"/> <small class="svelte-1mudz6i">Hardware address in any common format</small></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (mode === 'opaque') {
							$$renderer.push(`<!--[0--><div class="input-group svelte-1mudz6i"><label for="opaque-format" class="svelte-1mudz6i">`);
							Icon($$renderer, { name: 'code', size: 'sm' });
							$$renderer.push(`<!----> Data Format</label> `);

							$$renderer.select(
								{ id: 'opaque-format', value: opaqueFormat, class: '' },
								($$renderer) => {
									$$renderer.option({ value: 'text' }, ($$renderer) => {
										$$renderer.push(`Text (ASCII)`);
									});

									$$renderer.option({ value: 'hex' }, ($$renderer) => {
										$$renderer.push(`Hexadecimal`);
									});
								},
								'svelte-1mudz6i'
							);

							$$renderer.push(`</div> <div class="input-group svelte-1mudz6i"><label for="opaque-data" class="svelte-1mudz6i">`);
							Icon($$renderer, { name: 'edit', size: 'sm' });

							$$renderer.push(`<!----> ${$.escape(opaqueFormat === 'hex' ? 'Hex Data' : 'Text Data')}</label> <input id="opaque-data" type="text"${$.attr('value', opaqueData)}${$.attr('placeholder', opaqueFormat === 'hex' ? '0123456789abcdef' : 'client-device-001')} class="svelte-1mudz6i"/> <small class="svelte-1mudz6i">${$.escape(opaqueFormat === 'hex'
								? 'Hexadecimal string (even length)'
								: 'Plain text identifier')}</small></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div></div>`);
					} else {
						$$renderer.push(`<!--[-1--><div class="card input-card svelte-1mudz6i"><div class="card-header svelte-1mudz6i"><h3 class="svelte-1mudz6i">Decode Client Identifier</h3> <p class="help-text svelte-1mudz6i">Decode hex-encoded Client Identifier back to fields</p></div> <div class="card-content svelte-1mudz6i"><div class="input-group svelte-1mudz6i"><label for="decode-hex" class="svelte-1mudz6i">`);
						Icon($$renderer, { name: 'code', size: 'sm' });
						$$renderer.push(`<!----> Hex Data</label> <input id="decode-hex" type="text"${$.attr('value', decodeHex)} placeholder="01000c294fa3d2" class="svelte-1mudz6i"/> <small class="svelte-1mudz6i">Paste hex-encoded Client Identifier to decode</small></div></div></div>`);
					}

					$$renderer.push(`<!--]--> `);

					if (validationErrors.length > 0) {
						$$renderer.push(`<!--[0--><div class="card errors-card svelte-1mudz6i"><h3 class="svelte-1mudz6i">Validation Errors</h3> <!--[-->`);

						const each_array = $.ensure_array_like(validationErrors);

						for (let i = 0, $$length = each_array.length; i < $$length; i++) {
							let error = each_array[i];

							$$renderer.push(`<div class="error-message svelte-1mudz6i">`);
							Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
							$$renderer.push(`<!----> ${$.escape(error)}</div>`);
						}

						$$renderer.push(`<!--]--></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (activeTab === 'build' && buildResult && validationErrors.length === 0) {
						$$renderer.push(`<!--[0--><div class="card results svelte-1mudz6i"><h3 class="svelte-1mudz6i">Generated Client Identifier</h3> <div class="summary-card svelte-1mudz6i"><div class="svelte-1mudz6i"><strong class="svelte-1mudz6i">Mode:</strong> ${$.escape(buildResult.mode === 'hardware' ? 'Hardware Type + MAC' : 'Opaque Data')}</div> <div class="svelte-1mudz6i"><strong class="svelte-1mudz6i">Length:</strong> ${$.escape(buildResult.length)} bytes</div></div> <!--[-->`);

						const each_array_1 = $.ensure_array_like([
							{ title: 'Hexadecimal', content: buildResult.hex, key: 'hex' },
							{
								title: 'Wire Format (Spaced)',
								content: buildResult.wireFormat,
								key: 'wire'
							}
						]);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let output = each_array_1[$$index_1];

							$$renderer.push(`<div class="output-group svelte-1mudz6i"><div class="output-header svelte-1mudz6i"><h4 class="svelte-1mudz6i">${$.escape(output.title)}</h4> <button type="button"${$.attr_class('copy-btn svelte-1mudz6i', void 0, { 'copied': clipboard.isCopied(output.key) })}>`);

							Icon($$renderer, {
								name: clipboard.isCopied(output.key) ? 'check' : 'copy',
								size: 'xs'
							});

							$$renderer.push(`<!----> ${$.escape(clipboard.isCopied(output.key) ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-1mudz6i">${$.escape(output.content)}</pre></div>`);
						}

						$$renderer.push(`<!--]--> `);

						if (buildResult.breakdown && buildResult.breakdown.length > 0) {
							$$renderer.push(`<!--[0--><div class="breakdown-section svelte-1mudz6i"><h4 class="svelte-1mudz6i">Breakdown</h4> <!--[-->`);

							const each_array_2 = $.ensure_array_like(buildResult.breakdown);

							for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
								let item = each_array_2[i];

								$$renderer.push(`<div class="breakdown-item svelte-1mudz6i"><div class="breakdown-label svelte-1mudz6i">${$.escape(item.field)}</div> <div class="breakdown-value svelte-1mudz6i"><code class="svelte-1mudz6i">${$.escape(item.hex)}</code> `);

								if (item.description) {
									$$renderer.push(`<!--[0--><small class="svelte-1mudz6i">${$.escape(item.description)}</small>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--></div></div>`);
							}

							$$renderer.push(`<!--]--></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> <!--[-->`);

						const each_array_3 = $.ensure_array_like([
							{
								title: 'ISC DHCPd Configuration',
								content: buildResult.configExamples?.iscDhcpd,
								key: 'isc'
							},

							{
								title: 'Kea DHCPv4 Configuration',
								content: buildResult.configExamples?.keaDhcp4,
								key: 'kea'
							}
						]);

						for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
							let config = each_array_3[$$index_3];

							if (config.content) {
								$$renderer.push(`<!--[0--><div class="card results svelte-1mudz6i"><div class="card-header-with-action svelte-1mudz6i"><h3 class="svelte-1mudz6i">${$.escape(config.title)}</h3> <button type="button"${$.attr_class('copy-btn svelte-1mudz6i', void 0, { 'copied': clipboard.isCopied(config.key) })}>`);

								Icon($$renderer, {
									name: clipboard.isCopied(config.key) ? 'check' : 'copy',
									size: 'xs'
								});

								$$renderer.push(`<!----> ${$.escape(clipboard.isCopied(config.key) ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-1mudz6i">${$.escape(config.content)}</pre></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (activeTab === 'decode' && decodeResult && validationErrors.length === 0) {
						$$renderer.push(`<!--[0--><div class="card results svelte-1mudz6i"><h3 class="svelte-1mudz6i">Decoded Client Identifier</h3> <div class="summary-card svelte-1mudz6i"><div class="svelte-1mudz6i"><strong class="svelte-1mudz6i">Detected Mode:</strong> ${$.escape(decodeResult.mode === 'hardware' ? 'Hardware Type + MAC' : 'Opaque Data')}</div> <div class="svelte-1mudz6i"><strong class="svelte-1mudz6i">Length:</strong> ${$.escape(decodeResult.length)} bytes</div></div> `);

						if (decodeResult.decoded) {
							$$renderer.push(`<!--[0--><div class="decoded-fields svelte-1mudz6i">`);

							if (decodeResult.decoded.hardwareType !== undefined) {
								$$renderer.push(`<!--[0--><div class="decoded-field svelte-1mudz6i"><div class="field-label svelte-1mudz6i">Hardware Type</div> <div class="field-value svelte-1mudz6i">${$.escape(decodeResult.decoded.hardwareType)} (${$.escape(decodeResult.decoded.hardwareTypeName || 'Unknown')})</div></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (decodeResult.decoded.macAddress) {
								$$renderer.push(`<!--[0--><div class="decoded-field svelte-1mudz6i"><div class="field-label svelte-1mudz6i">MAC Address</div> <div class="field-value svelte-1mudz6i"><code class="svelte-1mudz6i">${$.escape(decodeResult.decoded.macAddress)}</code> <button type="button" class="copy-btn-small svelte-1mudz6i">`);

								Icon($$renderer, {
									name: clipboard.isCopied('mac') ? 'check' : 'copy',
									size: 'xs'
								});

								$$renderer.push(`<!----></button></div></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (decodeResult.decoded.opaqueData) {
								$$renderer.push(`<!--[0--><div class="decoded-field svelte-1mudz6i"><div class="field-label svelte-1mudz6i">Opaque Data</div> <div class="field-value svelte-1mudz6i"><code class="svelte-1mudz6i">${$.escape(decodeResult.decoded.opaqueData)}</code> <button type="button" class="copy-btn-small svelte-1mudz6i">`);

								Icon($$renderer, {
									name: clipboard.isCopied('opaque') ? 'check' : 'copy',
									size: 'xs'
								});

								$$renderer.push(`<!----></button></div></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (decodeResult.breakdown && decodeResult.breakdown.length > 0) {
							$$renderer.push(`<!--[0--><div class="breakdown-section svelte-1mudz6i"><h4 class="svelte-1mudz6i">Breakdown</h4> <!--[-->`);

							const each_array_4 = $.ensure_array_like(decodeResult.breakdown);

							for (let i = 0, $$length = each_array_4.length; i < $$length; i++) {
								let item = each_array_4[i];

								$$renderer.push(`<div class="breakdown-item svelte-1mudz6i"><div class="breakdown-label svelte-1mudz6i">${$.escape(item.field)}</div> <div class="breakdown-value svelte-1mudz6i"><code class="svelte-1mudz6i">${$.escape(item.hex)}</code> `);

								if (item.description) {
									$$renderer.push(`<!--[0--><small class="svelte-1mudz6i">${$.escape(item.description)}</small>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--></div></div>`);
							}

							$$renderer.push(`<!--]--></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
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