import * as $ from 'svelte/internal/server';
import { convertEUI64Addresses } from '$lib/utils/eui64.js';
import { tooltip } from '$lib/actions/tooltip.js';
import { useClipboard } from '$lib/composables';
import Icon from '$lib/components/global/Icon.svelte';

export default function EUI64($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let inputText = '00:1A:2B:3C:4D:5E\n02:1A:2B:FF:FE:3C:4D:5F\n08:00:27:12:34:56\n0A:00:27:FF:FE:12:34:57';
		let globalPrefix = '2001:db8::/64';
		let result = null;
		let isLoading = false;
		const clipboard = useClipboard();

		function convertAddresses() {
			if (!inputText.trim()) {
				result = null;

				return;
			}

			isLoading = true;

			try {
				const inputs = inputText.split('\n').filter((line) => line.trim());
				const prefix = globalPrefix.trim() || undefined;

				result = convertEUI64Addresses(inputs, prefix);
			} catch(error) {
				result = {
					conversions: [],
					summary: {
						totalInputs: 0,
						validInputs: 0,
						invalidInputs: 0,
						macToEUI64: 0,
						eui64ToMAC: 0
					},
					errors: [error instanceof Error ? error.message : 'Unknown error']
				};
			} finally {
				isLoading = false;
			}
		}

		function exportResults(format) {
			if (!result) return;

			const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
			let content = '';
			let filename = '';

			if (format === 'csv') {
				const headers = 'Input,Type,MAC Address,EUI-64,IPv6 Link-Local,IPv6 Global,Universal/Local,Unicast/Multicast,Valid,Error';
				const rows = result.conversions.map((conv) => `"${conv.input}","${conv.inputType.toUpperCase()}","${conv.macAddress}","${conv.eui64Address}","${conv.ipv6LinkLocal}","${conv.ipv6Global}","${conv.details.universalLocal}","${conv.details.unicastMulticast}","${conv.isValid}","${conv.error || ''}"`);

				content = [headers, ...rows].join('\n');
				filename = `eui64-conversions-${timestamp}.csv`;
			} else {
				content = JSON.stringify(result, null, 2);
				filename = `eui64-conversions-${timestamp}.json`;
			}

			const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');

			a.href = url;
			a.download = filename;
			a.click();
			URL.revokeObjectURL(url);
		}

		$$renderer.push(`<div class="card"><header class="card-header svelte-e4iyfj"><h2>EUI-64 Converter</h2> <p>Convert between MAC addresses and IPv6 EUI-64 interface identifiers with automatic IPv6 address generation</p></header> <div class="input-section svelte-e4iyfj"><div class="inputs-section svelte-e4iyfj"><h3 class="svelte-e4iyfj">Address Conversion</h3> <div class="input-group svelte-e4iyfj"><label for="inputs" class="svelte-e4iyfj">MAC Addresses or EUI-64 Identifiers</label> <textarea id="inputs" placeholder="00:1A:2B:3C:4D:5E
02:1A:2B:FF:FE:3C:4D:5F
08:00:27:12:34:56" rows="6" class="svelte-e4iyfj">`);

		const $$body = $.escape(
			// Auto-convert when inputs change
			inputText
		);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea> <div class="input-help svelte-e4iyfj">Enter MAC addresses (48-bit) or EUI-64 identifiers (64-bit) one per line. Various formats supported:
          xx:xx:xx:xx:xx:xx or xx-xx-xx-xx-xx-xx</div></div> <div class="input-group svelte-e4iyfj"><label for="prefix" class="svelte-e4iyfj">IPv6 Global Prefix (Optional)</label> <input id="prefix" type="text"${$.attr('value', globalPrefix)} placeholder="2001:db8::/64" class="svelte-e4iyfj"/> <div class="input-help svelte-e4iyfj">IPv6 prefix for generating global unicast addresses. Leave empty to use example prefix.</div></div></div> <div class="info-section svelte-e4iyfj"><h3 class="svelte-e4iyfj">EUI-64 Information</h3> <div class="info-content svelte-e4iyfj"><p class="svelte-e4iyfj"><strong>EUI-64</strong> (Extended Unique Identifier 64-bit) is used to generate IPv6 interface identifiers from
          MAC addresses:</p> <ul class="svelte-e4iyfj"><li class="svelte-e4iyfj">Split MAC address: OUI (24 bits) + Device ID (24 bits)</li> <li class="svelte-e4iyfj">Insert FFFE between OUI and Device ID</li> <li class="svelte-e4iyfj">Flip the Universal/Local bit (bit 1) in the first octet</li> <li class="svelte-e4iyfj">Result: 64-bit interface identifier for IPv6</li></ul></div></div></div> `);

		if (isLoading) {
			$$renderer.push(`<!--[0--><div class="loading svelte-e4iyfj">`);
			Icon($$renderer, { name: 'loader' });
			$$renderer.push(`<!----> Converting addresses...</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (result) {
			$$renderer.push(`<!--[0--><div class="results svelte-e4iyfj">`);

			if (result.errors.length > 0) {
				$$renderer.push(`<!--[0--><div class="errors svelte-e4iyfj"><h3 class="svelte-e4iyfj">`);
				Icon($$renderer, { name: 'alert-triangle' });
				$$renderer.push(`<!----> Errors</h3> <!--[-->`);

				const each_array = $.ensure_array_like(result.errors);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let error = each_array[$$index];

					$$renderer.push(`<div class="error-item svelte-e4iyfj">${$.escape(error)}</div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (result.conversions.length > 0) {
				$$renderer.push(`<!--[0--><div class="summary svelte-e4iyfj"><h3 class="svelte-e4iyfj">Conversion Summary</h3> <div class="summary-stats svelte-e4iyfj"><div class="stat svelte-e4iyfj"><span class="stat-value svelte-e4iyfj">${$.escape(result.summary.totalInputs)}</span> <span class="stat-label svelte-e4iyfj">Total Inputs</span></div> <div class="stat valid svelte-e4iyfj"><span class="stat-value svelte-e4iyfj">${$.escape(result.summary.validInputs)}</span> <span class="stat-label svelte-e4iyfj">Valid</span></div> <div class="stat invalid svelte-e4iyfj"><span class="stat-value svelte-e4iyfj">${$.escape(result.summary.invalidInputs)}</span> <span class="stat-label svelte-e4iyfj">Invalid</span></div> <div class="stat mac-to-eui svelte-e4iyfj"><span class="stat-value svelte-e4iyfj">${$.escape(result.summary.macToEUI64)}</span> <span class="stat-label svelte-e4iyfj">MAC → EUI-64</span></div> <div class="stat eui-to-mac svelte-e4iyfj"><span class="stat-value svelte-e4iyfj">${$.escape(result.summary.eui64ToMAC)}</span> <span class="stat-label svelte-e4iyfj">EUI-64 → MAC</span></div></div></div> <div class="conversions"><div class="conversions-header svelte-e4iyfj"><h3 class="svelte-e4iyfj">Address Conversions</h3> <div class="export-buttons svelte-e4iyfj"><button class="svelte-e4iyfj">`);
				Icon($$renderer, { name: 'download' });
				$$renderer.push(`<!----> Export CSV</button> <button class="svelte-e4iyfj">`);
				Icon($$renderer, { name: 'download' });
				$$renderer.push(`<!----> Export JSON</button></div></div> <div class="conversions-list svelte-e4iyfj"><!--[-->`);

				const each_array_1 = $.ensure_array_like(result.conversions);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let conversion = each_array_1[$$index_1];

					$$renderer.push(`<div${$.attr_class('conversion-card svelte-e4iyfj', void 0, { 'valid': conversion.isValid, 'invalid': !conversion.isValid })}><div class="card-header svelte-e4iyfj"><div class="input-info svelte-e4iyfj"><span class="input-text svelte-e4iyfj">${$.escape(conversion.input)}</span> <div class="input-meta svelte-e4iyfj"><span class="input-type svelte-e4iyfj">${$.escape(conversion.inputType.toUpperCase())}</span> <span class="conversion-direction svelte-e4iyfj">${$.escape(conversion.inputType === 'mac' ? 'MAC → EUI-64' : 'EUI-64 → MAC')}</span></div></div> <div class="status svelte-e4iyfj">`);

					if (conversion.isValid) {
						$$renderer.push('<!--[0-->');
						Icon($$renderer, { name: 'check-circle' });
					} else {
						$$renderer.push('<!--[-1-->');
						Icon($$renderer, { name: 'x-circle' });
					}

					$$renderer.push(`<!--]--></div></div> `);

					if (conversion.isValid) {
						$$renderer.push(`<!--[0--><div class="conversion-details svelte-e4iyfj"><div class="addresses-section svelte-e4iyfj"><div class="address-item svelte-e4iyfj"><span class="address-label svelte-e4iyfj">MAC Address:</span> <div class="code-container svelte-e4iyfj"><code class="svelte-e4iyfj">${$.escape(conversion.macAddress)}</code> <button type="button"${$.attr_class('btn btn-icon btn-xs svelte-e4iyfj', void 0, { 'copied': clipboard.isCopied(conversion.macAddress) })}>`);

						Icon($$renderer, {
							name: clipboard.isCopied(conversion.macAddress) ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----></button></div></div> <div class="address-item svelte-e4iyfj"><span class="address-label svelte-e4iyfj">EUI-64:</span> <div class="code-container svelte-e4iyfj"><code class="svelte-e4iyfj">${$.escape(conversion.eui64Address)}</code> <button type="button"${$.attr_class('btn btn-icon btn-xs svelte-e4iyfj', void 0, { 'copied': clipboard.isCopied(conversion.eui64Address) })}>`);

						Icon($$renderer, {
							name: clipboard.isCopied(conversion.eui64Address) ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----></button></div></div></div> <div class="ipv6-section svelte-e4iyfj"><h4 class="svelte-e4iyfj">Generated IPv6 Addresses</h4> <div class="ipv6-item svelte-e4iyfj"><span class="ipv6-label svelte-e4iyfj">Link-Local:</span> <div class="code-container svelte-e4iyfj"><code class="svelte-e4iyfj">${$.escape(conversion.ipv6LinkLocal)}</code> <button type="button"${$.attr_class('btn btn-icon btn-xs svelte-e4iyfj', void 0, { 'copied': clipboard.isCopied(conversion.ipv6LinkLocal) })}>`);

						Icon($$renderer, {
							name: clipboard.isCopied(conversion.ipv6LinkLocal) ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----></button></div></div> <div class="ipv6-item svelte-e4iyfj"><span class="ipv6-label svelte-e4iyfj">Global:</span> <div class="code-container svelte-e4iyfj"><code class="svelte-e4iyfj">${$.escape(conversion.ipv6Global)}</code> <button type="button"${$.attr_class('btn btn-icon btn-xs svelte-e4iyfj', void 0, { 'copied': clipboard.isCopied(conversion.ipv6Global) })}>`);

						Icon($$renderer, {
							name: clipboard.isCopied(conversion.ipv6Global) ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----></button></div></div></div> <div class="properties-section svelte-e4iyfj"><h4 class="svelte-e4iyfj">Address Properties</h4> <div class="properties-grid svelte-e4iyfj"><div class="property-item svelte-e4iyfj"><span class="property-label svelte-e4iyfj">OUI Part:</span> <code class="svelte-e4iyfj">${$.escape(conversion.details.ouiPart)}</code></div> <div class="property-item svelte-e4iyfj"><span class="property-label svelte-e4iyfj">Device Part:</span> <code class="svelte-e4iyfj">${$.escape(conversion.details.devicePart)}</code></div> <div class="property-item svelte-e4iyfj"><span class="property-label svelte-e4iyfj">Modified OUI:</span> <code class="svelte-e4iyfj">${$.escape(conversion.details.modifiedOUI)}</code></div> <div class="property-item svelte-e4iyfj"><span class="property-label svelte-e4iyfj">Scope:</span> <span${$.attr_class('property-value svelte-e4iyfj', void 0, {
							'universal': conversion.details.universalLocal === 'universal',
							'local': conversion.details.universalLocal === 'local'
						})}>${$.escape(conversion.details.universalLocal.toUpperCase())}</span></div> <div class="property-item svelte-e4iyfj"><span class="property-label svelte-e4iyfj">Type:</span> <span${$.attr_class('property-value svelte-e4iyfj', void 0, {
							'unicast': conversion.details.unicastMulticast === 'unicast',
							'multicast': conversion.details.unicastMulticast === 'multicast'
						})}>${$.escape(conversion.details.unicastMulticast.toUpperCase())}</span></div></div></div></div>`);
					} else {
						$$renderer.push(`<!--[-1--><div class="error-message svelte-e4iyfj">`);
						Icon($$renderer, { name: 'alert-triangle' });
						$$renderer.push(`<!----> ${$.escape(conversion.error)}</div>`);
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}