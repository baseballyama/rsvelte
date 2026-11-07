import * as $ from 'svelte/internal/server';

import {
	validateDUIDConfig,
	buildDUID,
	DUID_EXAMPLES,
	HARDWARE_TYPES,
	calculateDUIDTimestamp
} from '$lib/utils/dhcp-duid-generator';

import { untrack } from 'svelte';
import Icon from '$lib/components/global/Icon.svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import { useClipboard } from '$lib/composables';
import { tooltip } from '$lib/actions/tooltip';

export default function DUIDGenerator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let duidType = 'DUID-LLT';
		let macAddress = '';
		let hardwareType = HARDWARE_TYPES.ETHERNET;
		let timestamp = undefined;
		let enterpriseNumber = undefined;
		let enterpriseIdentifier = '';
		let uuid = '';
		let validationErrors = [];
		let result = null;
		let selectedExampleIndex = null;
		const clipboard = useClipboard();

		const examples = DUID_EXAMPLES.map((ex) => ({
			label: ex.name,
			config: ex,
			description: `${ex.type} configuration example`
		}));

		function loadExample(example, index) {
			const cfg = example.config;

			duidType = cfg.type;
			macAddress = cfg.macAddress || '';
			hardwareType = cfg.hardwareType ?? HARDWARE_TYPES.ETHERNET;
			timestamp = cfg.timestamp;
			enterpriseNumber = cfg.enterpriseNumber;
			enterpriseIdentifier = cfg.enterpriseIdentifier || '';
			uuid = cfg.uuid || '';
			selectedExampleIndex = index;
		}

		function checkIfExampleStillMatches() {
			if (selectedExampleIndex === null) return;

			const example = examples[selectedExampleIndex];

			if (!example) {
				selectedExampleIndex = null;

				return;
			}

			const cfg = example.config;
			const matches = duidType === cfg.type && macAddress === (cfg.macAddress || '') && hardwareType === (cfg.hardwareType ?? HARDWARE_TYPES.ETHERNET) && timestamp === cfg.timestamp && enterpriseNumber === cfg.enterpriseNumber && enterpriseIdentifier === (cfg.enterpriseIdentifier || '') && uuid === (cfg.uuid || '');

			if (!matches) {
				selectedExampleIndex = null;
			}
		}

		function useCurrentTimestamp() {
			timestamp = calculateDUIDTimestamp();
		}

		function clearTimestamp() {
			timestamp = undefined;
		}

		ToolContentContainer($$renderer, {
			title: 'DUID Generator',
			description: 'Generate DHCP Unique Identifier (DUID) for DHCPv6 clients per RFC 8415. Supports DUID-LLT, DUID-EN, DUID-LL, and DUID-UUID types with configuration export.',
			children: ($$renderer) => {
				ExamplesCard($$renderer, {
					examples,
					onSelect: loadExample,
					getLabel: (ex) => ex.label,
					getDescription: (ex) => ex.description,
					selectedIndex: selectedExampleIndex
				});

				$$renderer.push(`<!----> <div class="card input-card svelte-1ybr557"><div class="card-header svelte-1ybr557"><h3 class="svelte-1ybr557">DUID Configuration</h3> <p class="help-text svelte-1ybr557">Configure DHCP Unique Identifier for DHCPv6 client identification</p></div> <div class="card-content svelte-1ybr557"><div class="input-group svelte-1ybr557"><label for="duid-type" class="svelte-1ybr557">`);
				Icon($$renderer, { name: 'settings', size: 'sm' });
				$$renderer.push(`<!----> DUID Type</label> `);

				$$renderer.select(
					{ id: 'duid-type', value: duidType, class: '' },
					($$renderer) => {
						$$renderer.option({ value: 'DUID-LLT' }, ($$renderer) => {
							$$renderer.push(`DUID-LLT (Type 1) - Link-layer address + time`);
						});

						$$renderer.option({ value: 'DUID-EN' }, ($$renderer) => {
							$$renderer.push(`DUID-EN (Type 2) - Enterprise number`);
						});

						$$renderer.option({ value: 'DUID-LL' }, ($$renderer) => {
							$$renderer.push(`DUID-LL (Type 3) - Link-layer address`);
						});

						$$renderer.option({ value: 'DUID-UUID' }, ($$renderer) => {
							$$renderer.push(`DUID-UUID (Type 4) - UUID`);
						});
					},
					'svelte-1ybr557'
				);

				$$renderer.push(`</div> `);

				if (duidType === 'DUID-LLT' || duidType === 'DUID-LL') {
					$$renderer.push(`<!--[0--><div class="input-group svelte-1ybr557"><label for="mac-address" class="svelte-1ybr557">`);
					Icon($$renderer, { name: 'hash', size: 'sm' });
					$$renderer.push(`<!----> MAC Address</label> <input id="mac-address" type="text"${$.attr('value', macAddress)} placeholder="00:1A:2B:3C:4D:5E or 001A2B3C4D5E" class="svelte-1ybr557"/> <small class="svelte-1ybr557">Enter MAC address in any common format</small></div> <div class="input-group svelte-1ybr557"><label for="hardware-type" class="svelte-1ybr557">`);
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
						'svelte-1ybr557'
					);

					$$renderer.push(`</div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (duidType === 'DUID-LLT') {
					$$renderer.push(`<!--[0--><div class="input-group svelte-1ybr557"><label for="timestamp" class="svelte-1ybr557">`);
					Icon($$renderer, { name: 'clock', size: 'sm' });
					$$renderer.push(`<!----> Timestamp (seconds since Jan 1, 2000 UTC)</label> <div class="timestamp-controls svelte-1ybr557"><input id="timestamp" type="number"${$.attr('value', timestamp)} placeholder="Leave empty for current time" class="svelte-1ybr557"/> <button type="button" class="btn-icon svelte-1ybr557">`);
					Icon($$renderer, { name: 'clock', size: 'sm' });
					$$renderer.push(`<!----></button> <button type="button" class="btn-icon svelte-1ybr557">`);
					Icon($$renderer, { name: 'x', size: 'sm' });
					$$renderer.push(`<!----></button></div> <small class="svelte-1ybr557">Current: ${$.escape(calculateDUIDTimestamp())} seconds since epoch</small></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (duidType === 'DUID-EN') {
					$$renderer.push(`<!--[0--><div class="input-group svelte-1ybr557"><label for="enterprise-number" class="svelte-1ybr557">`);
					Icon($$renderer, { name: 'building', size: 'sm' });
					$$renderer.push(`<!----> Enterprise Number (IANA)</label> <input id="enterprise-number" type="number"${$.attr('value', enterpriseNumber)} placeholder="e.g., 9 for Cisco, 311 for Microsoft" class="svelte-1ybr557"/> <small class="svelte-1ybr557">IANA Private Enterprise Number</small></div> <div class="input-group svelte-1ybr557"><label for="enterprise-identifier" class="svelte-1ybr557">`);
					Icon($$renderer, { name: 'key', size: 'sm' });
					$$renderer.push(`<!----> Enterprise Identifier (hex)</label> <input id="enterprise-identifier" type="text"${$.attr('value', enterpriseIdentifier)} placeholder="e.g., 0123456789abcdef" class="svelte-1ybr557"/> <small class="svelte-1ybr557">Custom identifier in hexadecimal format</small></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (duidType === 'DUID-UUID') {
					$$renderer.push(`<!--[0--><div class="input-group svelte-1ybr557"><label for="uuid" class="svelte-1ybr557">`);
					Icon($$renderer, { name: 'fingerprint', size: 'sm' });
					$$renderer.push(`<!----> UUID</label> <input id="uuid" type="text"${$.attr('value', uuid)} placeholder="e.g., 550e8400-e29b-41d4-a716-446655440000" class="svelte-1ybr557"/> <small class="svelte-1ybr557">Standard UUID format (with or without hyphens)</small></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div> `);

				if (validationErrors.length > 0) {
					$$renderer.push(`<!--[0--><div class="card errors-card svelte-1ybr557"><h3 class="svelte-1ybr557">Validation Errors</h3> <!--[-->`);

					const each_array = $.ensure_array_like(validationErrors);

					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						let error = each_array[i];

						$$renderer.push(`<div class="error-message svelte-1ybr557">`);
						Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
						$$renderer.push(`<!----> ${$.escape(error)}</div>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (result && validationErrors.length === 0) {
					$$renderer.push(`<!--[0--><div class="card results svelte-1ybr557"><h3 class="svelte-1ybr557">Generated DUID</h3> <div class="summary-card svelte-1ybr557"><div class="svelte-1ybr557"><strong class="svelte-1ybr557">Type:</strong> ${$.escape(result.type)} (Type ${$.escape(result.typeCode)})</div> <div class="svelte-1ybr557"><strong class="svelte-1ybr557">Total Length:</strong> ${$.escape(result.totalLength)} bytes</div></div> <div class="output-group svelte-1ybr557"><div class="output-header svelte-1ybr557"><h4 class="svelte-1ybr557">Hex Encoded DUID</h4> <button type="button"${$.attr_class('copy-btn svelte-1ybr557', void 0, { 'copied': clipboard.isCopied('hex') })}>`);

					Icon($$renderer, {
						name: clipboard.isCopied('hex') ? 'check' : 'copy',
						size: 'xs'
					});

					$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('hex') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-1ybr557">${$.escape(result.hexEncoded)}</pre></div> <div class="output-group svelte-1ybr557"><div class="output-header svelte-1ybr557"><h4 class="svelte-1ybr557">Wire Format (Spaced)</h4> <button type="button"${$.attr_class('copy-btn svelte-1ybr557', void 0, { 'copied': clipboard.isCopied('wire') })}>`);

					Icon($$renderer, {
						name: clipboard.isCopied('wire') ? 'check' : 'copy',
						size: 'xs'
					});

					$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('wire') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-1ybr557">${$.escape(result.wireFormat)}</pre></div> `);

					if (result.breakdown && result.breakdown.length > 0) {
						$$renderer.push(`<!--[0--><div class="breakdown-section svelte-1ybr557"><h4 class="svelte-1ybr557">DUID Breakdown</h4> <!--[-->`);

						const each_array_1 = $.ensure_array_like(result.breakdown);

						for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
							let item = each_array_1[i];

							$$renderer.push(`<div class="breakdown-item svelte-1ybr557"><div class="breakdown-label svelte-1ybr557">${$.escape(item.field)}</div> <div class="breakdown-value svelte-1ybr557"><code class="svelte-1ybr557">${$.escape(item.hex)}</code> `);

							if (item.description) {
								$$renderer.push(`<!--[0--><small class="svelte-1ybr557">${$.escape(item.description)}</small>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div></div>`);
						}

						$$renderer.push(`<!--]--></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div> `);

					if (result.examples.keaDhcp6) {
						$$renderer.push(`<!--[0--><div class="card results svelte-1ybr557"><h3 class="svelte-1ybr557">Kea DHCPv6 Configuration</h3> <div class="output-group svelte-1ybr557"><div class="output-header svelte-1ybr557"><button type="button"${$.attr_class('copy-btn svelte-1ybr557', void 0, { 'copied': clipboard.isCopied('kea') })}>`);

						Icon($$renderer, {
							name: clipboard.isCopied('kea') ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('kea') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-1ybr557">${$.escape(result.examples.keaDhcp6)}</pre></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (result.examples.iscDhcpd) {
						$$renderer.push(`<!--[0--><div class="card results svelte-1ybr557"><h3 class="svelte-1ybr557">ISC DHCPd Configuration</h3> <div class="output-group svelte-1ybr557"><div class="output-header svelte-1ybr557"><button type="button"${$.attr_class('copy-btn svelte-1ybr557', void 0, { 'copied': clipboard.isCopied('isc') })}>`);

						Icon($$renderer, {
							name: clipboard.isCopied('isc') ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('isc') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-1ybr557">${$.escape(result.examples.iscDhcpd)}</pre></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});
	});
}