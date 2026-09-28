import * as $ from 'svelte/internal/server';
import { processIPv6ZoneIdentifiers } from '$lib/utils/ipv6-zone-id.js';
import Icon from '$lib/components/global/Icon.svelte';
import { useClipboard } from '$lib/composables';

export default function IPv6ZoneID($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let inputText = 'fe80::1\nfe80::1%eth0\nfe80::1234:5678:90ab:cdef%wlan0\n::1\n2001:db8::1\nff02::1%eth0';
		let result = null;
		let isLoading = false;
		const clipboard = useClipboard();

		function processAddresses() {
			if (!inputText.trim()) {
				result = null;

				return;
			}

			isLoading = true;

			try {
				const inputs = inputText.split('\n').filter((line) => line.trim());

				result = processIPv6ZoneIdentifiers(inputs);
			} catch(error) {
				result = {
					processings: [],
					summary: {
						totalInputs: 0,
						validInputs: 0,
						invalidInputs: 0,
						addressesWithZones: 0,
						addressesRequiringZones: 0
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
				const headers = 'Input,Has Zone ID,Address,Zone ID,Address Type,Requires Zone ID,With Zone,Without Zone,Valid,Error';
				const rows = result.processings.map((proc) => `"${proc.input}","${proc.hasZoneId}","${proc.address}","${proc.zoneId}","${proc.addressType}","${proc.requiresZoneId}","${proc.processing.withZone}","${proc.processing.withoutZone}","${proc.isValid}","${proc.error || ''}"`);

				content = [headers, ...rows].join('\n');
				filename = `ipv6-zones-${timestamp}.csv`;
			} else {
				content = JSON.stringify(result, null, 2);
				filename = `ipv6-zones-${timestamp}.json`;
			}

			const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');

			a.href = url;
			a.download = filename;
			a.click();
			URL.revokeObjectURL(url);
		}

		function getAddressTypeColor(type) {
			switch (type) {
				case 'link-local':
					return 'var(--color-warning)';

				case 'unique-local':
					return 'var(--color-purple)';

				case 'multicast':
					return 'var(--color-error)';

				case 'global':
					return 'var(--color-success)';

				case 'loopback':
					return 'var(--color-info)';

				case 'unspecified':
					return 'var(--text-secondary)';

				default:
					return 'var(--text-primary)';
			}
		}

		function getAddressTypeDescription(type) {
			switch (type) {
				case 'link-local':
					return 'Link-local address (fe80::/10)';

				case 'unique-local':
					return 'Unique local address (fc00::/7)';

				case 'multicast':
					return 'Multicast address (ff00::/8)';

				case 'global':
					return 'Global unicast address';

				case 'loopback':
					return 'Loopback address (::1)';

				case 'unspecified':
					return 'Unspecified address (::)';

				default:
					return 'Unknown address type';
			}
		}

		$$renderer.push(`<div class="card svelte-14hmdqi"><header class="card-header svelte-14hmdqi"><h2 class="svelte-14hmdqi">IPv6 Zone ID Handler</h2> <p class="svelte-14hmdqi">Process IPv6 addresses with zone identifiers for link-local and multicast addresses</p></header> <div class="input-section svelte-14hmdqi"><div class="input-group svelte-14hmdqi"><label for="inputs" class="svelte-14hmdqi">IPv6 Addresses</label> <textarea id="inputs" placeholder="fe80::1
fe80::1%eth0
fe80::1234:5678:90ab:cdef%wlan0
::1
2001:db8::1" rows="6" class="svelte-14hmdqi">`);

		const $$body = $.escape(
			// Auto-process when inputs change
			inputText
		);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea> <div class="input-help svelte-14hmdqi">Enter IPv6 addresses with or without zone identifiers (%). Zone IDs are interface names like eth0, wlan0, or
        numeric IDs.</div></div> <div class="zone-info svelte-14hmdqi"><h3 class="svelte-14hmdqi">Zone Identifier Information</h3> <div class="info-section svelte-14hmdqi"><h4 class="svelte-14hmdqi">When Zone IDs are Required:</h4> <ul class="svelte-14hmdqi"><li class="svelte-14hmdqi"><strong>Link-local addresses</strong> (fe80::/10) - Almost always require zone IDs</li> <li class="svelte-14hmdqi"><strong>Multicast addresses</strong> (ff00::/8) - May require zone IDs depending on scope</li></ul></div> <div class="info-section svelte-14hmdqi"><h4 class="svelte-14hmdqi">Common Zone Identifiers:</h4> <div class="zone-examples svelte-14hmdqi"><code class="svelte-14hmdqi">eth0</code> <code class="svelte-14hmdqi">wlan0</code> <code class="svelte-14hmdqi">en0</code> <code class="svelte-14hmdqi">lo</code> <code class="svelte-14hmdqi">%1</code> <code class="svelte-14hmdqi">%2</code></div></div></div></div> `);

		if (isLoading) {
			$$renderer.push(`<!--[0--><div class="loading svelte-14hmdqi">`);
			Icon($$renderer, { name: 'loader' });
			$$renderer.push(`<!----> Processing addresses...</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (result) {
			$$renderer.push(`<!--[0--><div class="results svelte-14hmdqi">`);

			if (result.errors.length > 0) {
				$$renderer.push(`<!--[0--><div class="errors svelte-14hmdqi"><h3 class="svelte-14hmdqi">`);
				Icon($$renderer, { name: 'alert-triangle' });
				$$renderer.push(`<!----> Errors</h3> <!--[-->`);

				const each_array = $.ensure_array_like(result.errors);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let error = each_array[$$index];

					$$renderer.push(`<div class="error-item svelte-14hmdqi">${$.escape(error)}</div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (result.processings.length > 0) {
				$$renderer.push(`<!--[0--><div class="summary svelte-14hmdqi"><h3 class="svelte-14hmdqi">Processing Summary</h3> <div class="summary-stats svelte-14hmdqi"><div class="stat svelte-14hmdqi"><span class="stat-value svelte-14hmdqi">${$.escape(result.summary.totalInputs)}</span> <span class="stat-label svelte-14hmdqi">Total Inputs</span></div> <div class="stat valid svelte-14hmdqi"><span class="stat-value svelte-14hmdqi">${$.escape(result.summary.validInputs)}</span> <span class="stat-label svelte-14hmdqi">Valid</span></div> <div class="stat invalid svelte-14hmdqi"><span class="stat-value svelte-14hmdqi">${$.escape(result.summary.invalidInputs)}</span> <span class="stat-label svelte-14hmdqi">Invalid</span></div> <div class="stat with-zone svelte-14hmdqi"><span class="stat-value svelte-14hmdqi">${$.escape(result.summary.addressesWithZones)}</span> <span class="stat-label svelte-14hmdqi">With Zones</span></div> <div class="stat require-zone svelte-14hmdqi"><span class="stat-value svelte-14hmdqi">${$.escape(result.summary.addressesRequiringZones)}</span> <span class="stat-label svelte-14hmdqi">Require Zones</span></div></div></div> <div class="processings"><div class="processings-header svelte-14hmdqi"><h3 class="svelte-14hmdqi">Zone ID Processing</h3> <div class="export-buttons svelte-14hmdqi"><button class="svelte-14hmdqi">`);
				Icon($$renderer, { name: 'csv-file' });
				$$renderer.push(`<!----> Export CSV</button> <button class="svelte-14hmdqi">`);
				Icon($$renderer, { name: 'json-file' });
				$$renderer.push(`<!----> Export JSON</button></div></div> <div class="processings-list svelte-14hmdqi"><!--[-->`);

				const each_array_1 = $.ensure_array_like(result?.processings || []);

				for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
					let processing = each_array_1[$$index_2];

					$$renderer.push(`<div${$.attr_class('processing-card svelte-14hmdqi', void 0, { 'valid': processing.isValid, 'invalid': !processing.isValid })}><div class="card-header row svelte-14hmdqi"><div class="address-info svelte-14hmdqi"><div class="original-input svelte-14hmdqi"><span class="input-label svelte-14hmdqi">Input:</span> <div class="input-with-copy svelte-14hmdqi"><code class="svelte-14hmdqi">${$.escape(processing.input)}</code> <button type="button" title="Copy input"${$.attr_class('svelte-14hmdqi', void 0, { 'copied': clipboard.isCopied(`input-${processing.input}`) })}>`);

					Icon($$renderer, {
						name: clipboard.isCopied(`input-${processing.input}`) ? 'check' : 'copy',
						size: 'xs'
					});

					$$renderer.push(`<!----></button></div></div></div> <div class="status svelte-14hmdqi">`);

					if (processing.isValid) {
						$$renderer.push('<!--[0-->');
						Icon($$renderer, { name: 'check-circle' });
					} else {
						$$renderer.push('<!--[-1-->');
						Icon($$renderer, { name: 'x-circle' });
					}

					$$renderer.push(`<!--]--></div></div> `);

					if (processing.isValid) {
						$$renderer.push(`<!--[0--><div class="processing-details svelte-14hmdqi"><div class="address-breakdown svelte-14hmdqi"><div class="breakdown-item svelte-14hmdqi"><span class="breakdown-label svelte-14hmdqi">Address:</span> <div class="input-with-copy svelte-14hmdqi"><code class="svelte-14hmdqi">${$.escape(processing.address)}</code> <button type="button" title="Copy address"${$.attr_class('svelte-14hmdqi', void 0, {
							'copied': clipboard.isCopied(`address-${processing.address}`)
						})}>`);

						Icon($$renderer, {
							name: clipboard.isCopied(`address-${processing.address}`) ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----></button></div></div> `);

						if (processing.hasZoneId) {
							$$renderer.push(`<!--[0--><div class="breakdown-item svelte-14hmdqi"><span class="breakdown-label svelte-14hmdqi">Zone ID:</span> <div class="input-with-copy svelte-14hmdqi"><code class="svelte-14hmdqi">${$.escape(processing.zoneId)}</code> <button type="button" title="Copy zone ID"${$.attr_class('svelte-14hmdqi', void 0, { 'copied': clipboard.isCopied(`zone-${processing.zoneId}`) })}>`);

							Icon($$renderer, {
								name: clipboard.isCopied(`zone-${processing.zoneId}`) ? 'check' : 'copy',
								size: 'xs'
							});

							$$renderer.push(`<!----></button></div> `);

							if (processing.processing.zoneIdValid) {
								$$renderer.push(`<!--[0--><span class="zone-status valid svelte-14hmdqi">`);
								Icon($$renderer, { name: 'check' });
								$$renderer.push(`<!----> Valid</span>`);
							} else {
								$$renderer.push(`<!--[-1--><span class="zone-status invalid svelte-14hmdqi">`);
								Icon($$renderer, { name: 'x' });
								$$renderer.push(`<!----> Invalid</span>`);
							}

							$$renderer.push(`<!--]--></div>`);
						} else {
							$$renderer.push(`<!--[-1--><div class="breakdown-item svelte-14hmdqi"><span class="breakdown-label svelte-14hmdqi">Zone ID:</span> <span class="no-zone svelte-14hmdqi">None</span></div>`);
						}

						$$renderer.push(`<!--]--></div> <div class="address-classification svelte-14hmdqi"><div class="classification-item svelte-14hmdqi"><span class="classification-label svelte-14hmdqi">Address Type:</span> <span class="address-type svelte-14hmdqi"${$.attr_style(`color: ${$.stringify(getAddressTypeColor(processing.addressType))}`)}${$.attr('title', getAddressTypeDescription(processing.addressType))}>`);
						Icon($$renderer, { name: 'info' });

						$$renderer.push(`<!----> ${$.escape(processing.addressType.replace('-', ' ').toUpperCase())}</span></div> <div class="classification-item svelte-14hmdqi"><span class="classification-label svelte-14hmdqi">Requires Zone ID:</span> <span${$.attr_class('zone-requirement svelte-14hmdqi', void 0, {
							'required': processing.requiresZoneId,
							'optional': !processing.requiresZoneId
						})}>${$.escape(processing.requiresZoneId ? 'Yes' : 'No')}</span></div></div> <div class="processing-results svelte-14hmdqi"><div class="result-item svelte-14hmdqi"><span class="result-label svelte-14hmdqi">With Zone:</span> <div class="input-with-copy svelte-14hmdqi"><code class="svelte-14hmdqi">${$.escape(processing.processing.withZone)}</code> <button type="button" title="Copy with zone"${$.attr_class('svelte-14hmdqi', void 0, {
							'copied': clipboard.isCopied(`with-zone-${processing.processing.withZone}`)
						})}>`);

						Icon($$renderer, {
							name: clipboard.isCopied(`with-zone-${processing.processing.withZone}`) ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----></button></div></div> <div class="result-item svelte-14hmdqi"><span class="result-label svelte-14hmdqi">Without Zone:</span> <div class="input-with-copy svelte-14hmdqi"><code class="svelte-14hmdqi">${$.escape(processing.processing.withoutZone)}</code> <button type="button" title="Copy without zone"${$.attr_class('svelte-14hmdqi', void 0, {
							'copied': clipboard.isCopied(`without-zone-${processing.processing.withoutZone}`)
						})}>`);

						Icon($$renderer, {
							name: clipboard.isCopied(`without-zone-${processing.processing.withoutZone}`) ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----></button></div></div></div> `);

						if (processing.processing.suggestedZones.length > 0) {
							$$renderer.push(`<!--[0--><div class="suggested-zones svelte-14hmdqi"><h4 class="svelte-14hmdqi">Suggested Zone Identifiers:</h4> <div class="zones-list svelte-14hmdqi"><!--[-->`);

							const each_array_2 = $.ensure_array_like(processing.processing.suggestedZones);

							for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
								let zone = each_array_2[$$index_1];

								$$renderer.push(`<button type="button"${$.attr_class('zone-button svelte-14hmdqi', void 0, { 'copied': clipboard.isCopied(`suggested-${zone}`) })} title="Copy full address"><code class="svelte-14hmdqi">${$.escape(zone)}</code> `);

								Icon($$renderer, {
									name: clipboard.isCopied(`suggested-${zone}`) ? 'check' : 'copy',
									size: 'xs'
								});

								$$renderer.push(`<!----></button>`);
							}

							$$renderer.push(`<!--]--></div></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (processing.requiresZoneId && !processing.hasZoneId) {
							$$renderer.push(`<!--[0--><div class="zone-warning svelte-14hmdqi">`);
							Icon($$renderer, { name: 'alert-triangle' });
							$$renderer.push(`<!----> This address type typically requires a zone identifier for proper routing</div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
					} else {
						$$renderer.push(`<!--[-1--><div class="error-message svelte-14hmdqi">`);
						Icon($$renderer, { name: 'alert-triangle' });
						$$renderer.push(`<!----> ${$.escape(processing.error)}</div>`);
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