import * as $ from 'svelte/internal/server';
import { convertMACAddresses } from '$lib/utils/mac-address.js';
import { macAddressContent } from '$lib/content/mac-address.js';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let inputText = '00:1A:2B:3C:4D:5E';
		let result = null;
		let copiedStates = {};
		let isLoading = false;
		let isBulkMode = false;
		let selectedExampleIndex = null;

		const examples = [
			{
				mac: '00:1A:79:00:00:01',
				vendor: 'Telecomunication Technologies',
				description: 'Ukrainian telecom equipment (Odessa)'
			},

			{
				mac: '3C:22:FB:A1:B2:C3',
				vendor: 'Apple',
				description: 'Apple device (Cupertino, CA)'
			},

			{
				mac: 'DC:A6:32:A1:B2:C3',
				vendor: 'Raspberry Pi Trading',
				description: 'Raspberry Pi (Cambridge, UK)'
			},

			{
				mac: '00:16:3E:1F:4A:B1',
				vendor: 'Xensource',
				description: 'Xen virtual machine (Palo Alto, CA)'
			},

			{
				mac: '00:00:5E:00:01:01',
				vendor: 'ICANN IANA',
				description: 'IANA reserved addresses (special use)'
			},

			{
				mac: '00:0D:B9:A1:B2:C3',
				vendor: 'PC Engines',
				description: 'PC Engines embedded systems (Switzerland)'
			},

			{
				mac: 'FF:FF:FF:FF:FF:FF',
				vendor: '',
				description: 'Multicast/Broadcast'
			}
		];

		const ouiFields = [
			{
				key: 'oui',
				label: 'OUI',
				icon: 'hash',
				render: (c) => c.oui.oui,
				code: true
			},

			{
				key: 'manufacturer',
				label: 'Manufacturer',
				icon: (c) => c.oui.found ? 'building' : 'help-circle',
				render: (c) => c.oui.found ? c.oui.manufacturer : 'Unknown',
				class: 'manufacturer-item',
				valueClass: (c) => !c.oui.found ? 'unknown' : ''
			},

			{
				key: 'country',
				label: 'Country',
				icon: 'globe',
				render: (c) => c.oui.country || 'N/A',
				condition: (c) => !!c.oui.country
			},

			{
				key: 'blockType',
				label: 'Block Type',
				icon: 'layers',
				render: (c) => c.oui.blockType || 'N/A',
				tooltip: (c) => c.oui.blockType ? getBlockTypeTooltip(c.oui.blockType) : '',
				condition: (c) => !!c.oui.blockType
			},

			{
				key: 'blockSize',
				label: 'Block Size',
				icon: 'database',
				render: (c) => c.oui.blockSize
					? `${c.oui.blockSize.toLocaleString()} addresses`
					: 'N/A',
				condition: (c) => c.oui.blockSize != null
			},

			{
				key: 'blockRange',
				label: 'Address Range',
				icon: 'server',
				render: (c) => `${c.oui.blockStart}-${c.oui.blockEnd}`,
				valueClass: () => 'range',
				condition: (c) => !!(c.oui.blockStart && c.oui.blockEnd)
			},

			{
				key: 'isPrivate',
				label: 'Registry Status',
				icon: 'shield',
				render: (c) => c.oui.isPrivate ? 'Private' : 'Public',
				condition: (c) => c.oui.isPrivate != null
			},

			{
				key: 'updated',
				label: 'Last Updated',
				icon: 'clock',
				render: (c) => c.oui.updated ? new Date(c.oui.updated).toLocaleDateString() : 'N/A',
				condition: (c) => !!c.oui.updated
			},

			{
				key: 'address',
				label: 'Address',
				icon: 'map-pin',
				render: (c) => c.oui.address || 'N/A',
				class: 'address-item',
				condition: (c) => !!c.oui.address
			}
		];

		const detailFields = [
			{ label: 'Universal Address', key: 'isUniversal' },
			{
				label: 'Locally Administered',
				key: 'isUniversal',
				invert: true
			},
			{ label: 'Unicast', key: 'isUnicast' },
			{ label: 'Multicast/Broadcast', key: 'isUnicast', invert: true }
		];

		const formatFields = [
			{
				key: 'colon',
				label: 'Colon Notation',
				tooltip: 'Standard IEEE notation; most Linux, BSD, macOS use this'
			},

			{
				key: 'hyphen',
				label: 'Hyphen Notation',
				tooltip: 'Common on Windows systems'
			},

			{
				key: 'cisco',
				label: 'Cisco (Dot) Notation',
				tooltip: 'Cisco IOS / NX-OS style'
			},

			{
				key: 'bareUppercase',
				label: 'Bare (Uppercase)',
				tooltip: 'Common in databases, APIs'
			},

			{
				key: 'bareLowercase',
				label: 'Bare (Lowercase)',
				tooltip: 'Common in scripts, JSON, etc.'
			},

			{
				key: 'eui64',
				label: 'EUI-64 (expanded form)',
				tooltip: 'Used when converting MAC → IPv6 Interface ID (adds FFFE in the middle, flips the U/L bit)'
			},

			{
				key: 'ipv6Style',
				label: 'Dot-separated 2-byte groups',
				tooltip: 'Occasionally seen in debugging or tools that mimic IPv6 notation'
			},

			{
				key: 'spaceSeparated',
				label: 'Space-separated pairs',
				tooltip: 'Sometimes seen in hex dumps or firmware logs'
			},

			{
				key: 'decimalOctets',
				label: 'Decimal octets',
				tooltip: 'Rare, but some diagnostic tools display MACs in decimal'
			},

			{
				key: 'prefixedMac',
				label: 'Prefixed (MAC=)',
				tooltip: 'Seen in configuration files or CLI outputs'
			},

			{
				key: 'slashSeparated',
				label: 'Slash-separated',
				tooltip: 'Seen in some telecom equipment or SNMP exports'
			},

			{
				key: 'prefixedBare',
				label: 'Prefixed bare (MAC)',
				tooltip: 'Appears in certain JSON/CSV exports or proprietary APIs'
			},

			{
				key: 'prefixedAddr',
				label: 'Prefixed bare (addr)',
				tooltip: 'Appears in certain JSON/CSV exports or proprietary APIs'
			},

			{
				key: 'binary',
				label: 'Binary (8-bit groups)',
				tooltip: 'Rare, but useful for bit-level inspection',
				binary: true,
				class: 'binary-item'
			}
		];

		const blockTypeTooltips = {
			'MA-L': 'Large block: 16.7 million addresses (24-bit prefix)',
			'MA-M': 'Medium block: 1 million addresses (28-bit prefix)',
			'MA-S': 'Small block: 4,096 addresses (36-bit prefix)',
			CID: 'Company ID'
		};

		async function convertAddresses() {
			if (!inputText.trim()) return result = null;

			isLoading = true;

			try {
				result = await convertMACAddresses(inputText.split('\n').filter((line) => line.trim()));
			} finally {
				isLoading = false;
			}
		}

		function toggleMode() {
			isBulkMode = !isBulkMode;
			result = null;
			selectedExampleIndex = null;

			inputText = isBulkMode
				? '00:1A:2B:3C:4D:5E\n00-50-56-C0-00-08\n001A.2B3C.4D5E\n001b632b4567'
				: '00:1A:2B:3C:4D:5E';
		}

		async function copyToClipboard(text, id = text) {
			try {
				await navigator.clipboard.writeText(text);
				copiedStates[id] = true;
				setTimeout(() => copiedStates[id] = false, 2000);
			} catch(err) {
				console.error('Failed to copy:', err);
			}
		}

		function exportResults(format) {
			if (!result) return;

			const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');

			if (format === 'csv') {
				const headers = 'Input,Valid,Colon Format,Hyphen Format,Cisco Format,Bare,OUI,Manufacturer,Universal,Unicast';
				const rows = result.conversions.map((c) => `"${c.input}","${c.isValid}","${c.formats.colon}","${c.formats.hyphen}","${c.formats.cisco}","${c.formats.bare}","${c.oui.oui}","${c.oui.manufacturer || 'Unknown'}","${c.details.isUniversal}","${c.details.isUnicast}"`);

				downloadFile([headers, ...rows].join('\n'), `mac-addresses-${timestamp}.csv`, 'text/csv');
			} else {
				downloadFile(JSON.stringify(result, null, 2), `mac-addresses-${timestamp}.json`, 'application/json');
			}
		}

		function downloadFile(content, filename, type) {
			const blob = new Blob([content], { type });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');

			a.href = url;
			a.download = filename;
			a.click();
			URL.revokeObjectURL(url);
		}

		const getBlockTypeTooltip = (blockType) => blockTypeTooltips[blockType] || blockType;
		const handleSubmit = (e) => (e?.preventDefault(), convertAddresses());

		const loadExample = (example, index) => (
			inputText = example.mac,
			selectedExampleIndex = index,
			isBulkMode = false,
			handleSubmit()
		);

		const clearExampleSelection = () => selectedExampleIndex = null;

		$$renderer.push(`<div class="card"><header class="card-header svelte-1g3qxzr"><h2 class="svelte-1g3qxzr">MAC Address Converter &amp; OUI Lookup</h2> <p class="svelte-1g3qxzr">Convert MAC addresses between different formats and identify the manufacturer using the Organizationally Unique
      Identifier (OUI)</p></header> <div class="input-section svelte-1g3qxzr"><div class="inputs-section svelte-1g3qxzr"><div class="mode-toggle-row svelte-1g3qxzr"><h3 class="svelte-1g3qxzr">MAC Address${$.escape(isBulkMode ? 'es' : '')}</h3> <button class="mode-toggle svelte-1g3qxzr">`);

		Icon($$renderer, { name: isBulkMode ? 'layers' : 'file', size: 'sm' });
		$$renderer.push(`<!----> ${$.escape(isBulkMode ? 'Switch to Single' : 'Switch to Bulk')}</button></div> <div class="input-group svelte-1g3qxzr">`);

		if (isBulkMode) {
			$$renderer.push(`<!--[0--><label for="inputs" class="svelte-1g3qxzr">Enter MAC Addresses</label> <textarea id="inputs" placeholder="00:1A:2B:3C:4D:5E
00-50-56-C0-00-08
001A.2B3C.4D5E
001b632b4567" rows="6" class="svelte-1g3qxzr">`);

			const $$body = $.escape(inputText);

			if ($$body) {
				$$renderer.push(`${$$body}`);
			} else {}

			$$renderer.push(`</textarea> <div class="input-help svelte-1g3qxzr">Enter MAC addresses one per line. Supported formats: <code class="svelte-1g3qxzr">00:1A:2B:3C:4D:5E</code>, <code class="svelte-1g3qxzr">00-1A-2B-3C-4D-5E</code>, <code class="svelte-1g3qxzr">001A.2B3C.4D5E</code> (Cisco), <code class="svelte-1g3qxzr">001A2B3C4D5E</code></div> <button class="lookup-btn bulk svelte-1g3qxzr"${$.attr('disabled', isLoading || !inputText.trim(), true)}>`);
			Icon($$renderer, { name: isLoading ? 'loader' : 'search', size: 'sm' });
			$$renderer.push(`<!----> ${$.escape(isLoading ? 'Looking up...' : 'Lookup')}</button>`);
		} else {
			$$renderer.push(`<!--[-1--><label for="inputs" class="svelte-1g3qxzr">Enter MAC Address</label> <div class="input-row svelte-1g3qxzr"><input type="text" id="inputs"${$.attr('value', inputText)} placeholder="00:1A:2B:3C:4D:5E" class="mac-input svelte-1g3qxzr"/> <button class="lookup-btn inline svelte-1g3qxzr"${$.attr('disabled', isLoading || !inputText.trim(), true)}>`);
			Icon($$renderer, { name: isLoading ? 'loader' : 'search', size: 'sm' });
			$$renderer.push(`<!----> ${$.escape(isLoading ? 'Looking up...' : 'Lookup')}</button></div> <div class="input-help svelte-1g3qxzr">Supported formats: <code class="svelte-1g3qxzr">00:1A:2B:3C:4D:5E</code>, <code class="svelte-1g3qxzr">00-1A-2B-3C-4D-5E</code>, <code class="svelte-1g3qxzr">001A.2B3C.4D5E</code> (Cisco), <code class="svelte-1g3qxzr">001A2B3C4D5E</code></div>`);
		}

		$$renderer.push(`<!--]--></div></div></div> <div class="card examples-card svelte-1g3qxzr"><details class="examples-details svelte-1g3qxzr"><summary class="examples-summary svelte-1g3qxzr">`);
		Icon($$renderer, { name: 'chevron-right', size: 'xs' });
		$$renderer.push(`<!----> <h4 class="svelte-1g3qxzr">Quick Examples</h4></summary> <div class="examples-grid svelte-1g3qxzr"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let example = each_array[i];

			$$renderer.push(`<button${$.attr_class('example-card svelte-1g3qxzr', void 0, { 'selected': selectedExampleIndex === i })}><h5 class="svelte-1g3qxzr">${$.escape(example.mac)}</h5> <p class="svelte-1g3qxzr">${$.escape(example.vendor)}</p></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> `);

		if (result) {
			$$renderer.push(`<!--[0--><div class="results svelte-1g3qxzr">`);

			if (result.conversions.length > 0) {
				$$renderer.push(`<!--[0--><div class="conversions svelte-1g3qxzr"><div class="conversions-header svelte-1g3qxzr"><h3 class="svelte-1g3qxzr">${$.escape(result.conversions.length === 1 ? 'Address Conversion' : 'Address Conversions')}</h3> `);

				if (result.conversions.length > 1) {
					$$renderer.push(`<!--[0--><div class="export-buttons svelte-1g3qxzr"><button class="svelte-1g3qxzr">`);
					Icon($$renderer, { name: 'download' });
					$$renderer.push(`<!----> Export CSV</button> <button class="svelte-1g3qxzr">`);
					Icon($$renderer, { name: 'download' });
					$$renderer.push(`<!----> Export JSON</button></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> <!--[-->`);

				const each_array_1 = $.ensure_array_like(result.conversions);

				for (let $$index_4 = 0, $$length = each_array_1.length; $$index_4 < $$length; $$index_4++) {
					let conversion = each_array_1[$$index_4];

					$$renderer.push(`<div${$.attr_class('conversion-item svelte-1g3qxzr', void 0, { 'invalid': !conversion.isValid })}>`);

					if (result.conversions.length > 1) {
						$$renderer.push(`<!--[0--><div class="conversion-header svelte-1g3qxzr"><div class="input-display svelte-1g3qxzr">`);
						Icon($$renderer, { name: conversion.isValid ? 'check-circle' : 'x-circle' });
						$$renderer.push(`<!----> <code class="svelte-1g3qxzr">${$.escape(conversion.input)}</code></div> `);

						if (conversion.error) {
							$$renderer.push(`<!--[0--><div class="error-message svelte-1g3qxzr">${$.escape(conversion.error)}</div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
					} else if (!conversion.isValid) {
						$$renderer.push(`<!--[1--><div class="conversion-header svelte-1g3qxzr"><div class="input-display error svelte-1g3qxzr">`);
						Icon($$renderer, { name: 'x-circle' });
						$$renderer.push(`<!----> <span>Invalid MAC Address</span></div> `);

						if (conversion.error) {
							$$renderer.push(`<!--[0--><div class="error-message svelte-1g3qxzr">${$.escape(conversion.error)}</div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (conversion.isValid) {
						$$renderer.push(`<!--[0--><div class="conversion-section svelte-1g3qxzr"><h4 class="svelte-1g3qxzr">OUI Information</h4> <div class="oui-info svelte-1g3qxzr"><!--[-->`);

						const each_array_2 = $.ensure_array_like(ouiFields);

						for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
							let field = each_array_2[$$index_1];
							const value = field.render(conversion);

							if (!field.condition || field.condition(conversion)) {
								$$renderer.push('<!--[0-->');

								if (value !== undefined && value !== null && value !== '') {
									$$renderer.push(`<!--[0--><div${$.attr_class(`oui-item ${$.stringify(field.class || '')}`, 'svelte-1g3qxzr')}>`);

									Icon($$renderer, {
										name: typeof field.icon === 'function' ? field.icon(conversion) : field.icon,
										size: 'md'
									});

									$$renderer.push(`<!----> <div class="oui-content svelte-1g3qxzr"><span class="oui-label svelte-1g3qxzr">${$.escape(field.label)}</span> `);

									if (field.code) {
										$$renderer.push('<!--[0-->');

										if (field.tooltip) {
											$$renderer.push(`<!--[0--><code${$.attr_class(`oui-value ${$.stringify(field.valueClass?.(conversion) || '')}`, 'svelte-1g3qxzr')}>${$.escape(value)}</code>`);
										} else {
											$$renderer.push(`<!--[-1--><code${$.attr_class(`oui-value ${$.stringify(field.valueClass?.(conversion) || '')}`, 'svelte-1g3qxzr')}>${$.escape(value)}</code>`);
										}

										$$renderer.push(`<!--]-->`);
									} else if (field.tooltip) {
										$$renderer.push(`<!--[1--><span${$.attr_class(`oui-value ${$.stringify(field.valueClass?.(conversion) || '')}`, 'svelte-1g3qxzr')}>${$.escape(value)}</span>`);
									} else {
										$$renderer.push(`<!--[-1--><span${$.attr_class(`oui-value ${$.stringify(field.valueClass?.(conversion) || '')}`, 'svelte-1g3qxzr')}>${$.escape(value)}</span>`);
									}

									$$renderer.push(`<!--]--></div></div>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}

						$$renderer.push(`<!--]--></div></div> <div class="conversion-section svelte-1g3qxzr"><h4 class="svelte-1g3qxzr">Address Details</h4> <div class="details-grid svelte-1g3qxzr"><!--[-->`);

						const each_array_3 = $.ensure_array_like(detailFields);

						for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
							let field = each_array_3[$$index_2];

							const active = field.invert
								? !conversion.details[field.key]
								: conversion.details[field.key];

							$$renderer.push(`<div${$.attr_class('detail-item svelte-1g3qxzr', void 0, { 'active': active })}>`);
							Icon($$renderer, { name: active ? 'check-circle' : 'circle' });
							$$renderer.push(`<!----> <span>${$.escape(field.label)}</span></div>`);
						}

						$$renderer.push(`<!--]--></div></div> <div class="conversion-section svelte-1g3qxzr"><h4 class="svelte-1g3qxzr">Formats</h4> <div class="format-grid svelte-1g3qxzr"><!--[-->`);

						const each_array_4 = $.ensure_array_like(formatFields);

						for (let $$index_3 = 0, $$length = each_array_4.length; $$index_3 < $$length; $$index_3++) {
							let field = each_array_4[$$index_3];

							const value = field.binary
								? conversion.details.binary
								: conversion.formats[field.key];

							const copyId = `${field.key}-${conversion.input}`;

							$$renderer.push(`<div${$.attr_class(`format-item ${$.stringify(field.class || '')}`, 'svelte-1g3qxzr')}><span class="format-label svelte-1g3qxzr">${$.escape(field.label)}</span> <div${$.attr_class('format-value svelte-1g3qxzr', void 0, { 'binary': field.binary })}><code${$.attr_class('svelte-1g3qxzr', void 0, { 'binary-display': field.binary })}>${$.escape(field.binary ? value.match(/.{1,8}/g)?.join(' ') : value)}</code> <button class="copy-btn svelte-1g3qxzr">`);
							Icon($$renderer, { name: copiedStates[copyId] ? 'check' : 'copy' });
							$$renderer.push(`<!----></button></div></div>`);
						}

						$$renderer.push(`<!--]--></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]--></div> `);

				if (result.conversions.length > 1) {
					$$renderer.push(`<!--[0--><div class="summary svelte-1g3qxzr"><h3 class="svelte-1g3qxzr">Conversion Summary</h3> <div class="summary-stats svelte-1g3qxzr"><div class="stat svelte-1g3qxzr"><span class="stat-value svelte-1g3qxzr">${$.escape(result.summary.total)}</span> <span class="stat-label svelte-1g3qxzr">Total</span></div> <div class="stat valid svelte-1g3qxzr"><span class="stat-value svelte-1g3qxzr">${$.escape(result.summary.valid)}</span> <span class="stat-label svelte-1g3qxzr">Valid</span></div> <div class="stat invalid svelte-1g3qxzr"><span class="stat-value svelte-1g3qxzr">${$.escape(result.summary.invalid)}</span> <span class="stat-label svelte-1g3qxzr">Invalid</span></div> <div class="stat with-oui svelte-1g3qxzr"><span class="stat-value svelte-1g3qxzr">${$.escape(result.summary.withOUI)}</span> <span class="stat-label svelte-1g3qxzr">With OUI</span></div></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="card info-card svelte-1g3qxzr"><div class="card-header svelte-1g3qxzr"><h3>Understanding MAC Addresses</h3></div> <div class="card-content"><details class="info-accordion svelte-1g3qxzr"><summary class="accordion-summary svelte-1g3qxzr">`);
		Icon($$renderer, { name: 'chevron-right', size: 'sm' });
		$$renderer.push(`<!----> <h4 class="svelte-1g3qxzr">${$.escape(macAddressContent.sections.whatIsMAC.title)}</h4></summary> <div class="accordion-content svelte-1g3qxzr"><p class="svelte-1g3qxzr">${$.escape(macAddressContent.sections.whatIsMAC.content)}</p></div></details> <details class="info-accordion svelte-1g3qxzr"><summary class="accordion-summary svelte-1g3qxzr">`);
		Icon($$renderer, { name: 'chevron-right', size: 'sm' });
		$$renderer.push(`<!----> <h4 class="svelte-1g3qxzr">${$.escape(macAddressContent.sections.structure.title)}</h4></summary> <div class="accordion-content svelte-1g3qxzr"><ul class="svelte-1g3qxzr"><!--[-->`);

		const each_array_5 = $.ensure_array_like(macAddressContent.sections.structure.components);

		for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
			let comp = each_array_5[$$index_5];

			$$renderer.push(`<li class="svelte-1g3qxzr"><strong class="svelte-1g3qxzr">${$.escape(comp.component)}:</strong> ${$.escape(comp.description)}</li>`);
		}

		$$renderer.push(`<!--]--></ul> <p class="structure-example svelte-1g3qxzr"><strong>Example:</strong> <code class="svelte-1g3qxzr">${$.escape(macAddressContent.sections.structure.example.address)}</code><br/> <span class="structure-breakdown svelte-1g3qxzr"><!--[-->`);

		const each_array_6 = $.ensure_array_like(macAddressContent.sections.structure.example.breakdown);

		for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
			let line = each_array_6[$$index_6];

			$$renderer.push(`<!---->• ${$.escape(line)}<br/>`);
		}

		$$renderer.push(`<!--]--></span></p></div></details> <details class="info-accordion svelte-1g3qxzr"><summary class="accordion-summary svelte-1g3qxzr">`);
		Icon($$renderer, { name: 'chevron-right', size: 'sm' });
		$$renderer.push(`<!----> <h4 class="svelte-1g3qxzr">${$.escape(macAddressContent.sections.addressTypes.title)}</h4></summary> <div class="accordion-content svelte-1g3qxzr"><ul class="svelte-1g3qxzr"><!--[-->`);

		const each_array_7 = $.ensure_array_like(macAddressContent.sections.addressTypes.types);

		for (let $$index_7 = 0, $$length = each_array_7.length; $$index_7 < $$length; $$index_7++) {
			let type = each_array_7[$$index_7];

			$$renderer.push(`<li class="svelte-1g3qxzr"><strong class="svelte-1g3qxzr">${$.escape(type.type)}:</strong> ${$.escape(type.description)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div></details> <details class="info-accordion svelte-1g3qxzr"><summary class="accordion-summary svelte-1g3qxzr">`);
		Icon($$renderer, { name: 'chevron-right', size: 'sm' });
		$$renderer.push(`<!----> <h4 class="svelte-1g3qxzr">${$.escape(macAddressContent.sections.formats.title)}</h4></summary> <div class="accordion-content svelte-1g3qxzr"><ul class="svelte-1g3qxzr"><!--[-->`);

		const each_array_8 = $.ensure_array_like(macAddressContent.sections.formats.formats);

		for (let $$index_8 = 0, $$length = each_array_8.length; $$index_8 < $$length; $$index_8++) {
			let fmt = each_array_8[$$index_8];

			$$renderer.push(`<li class="svelte-1g3qxzr"><strong class="svelte-1g3qxzr">${$.escape(fmt.format)}:</strong> <code class="svelte-1g3qxzr">${$.escape(fmt.example)}</code> - ${$.escape(fmt.usage)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div></details> <details class="info-accordion svelte-1g3qxzr"><summary class="accordion-summary svelte-1g3qxzr">`);
		Icon($$renderer, { name: 'chevron-right', size: 'sm' });
		$$renderer.push(`<!----> <h4 class="svelte-1g3qxzr">${$.escape(macAddressContent.sections.ouiLookup.title)}</h4></summary> <div class="accordion-content svelte-1g3qxzr"><p class="svelte-1g3qxzr">${$.escape(macAddressContent.sections.ouiLookup.content)}</p> <ul class="svelte-1g3qxzr"><!--[-->`);

		const each_array_9 = $.ensure_array_like(macAddressContent.sections.ouiLookup.blockTypes);

		for (let $$index_9 = 0, $$length = each_array_9.length; $$index_9 < $$length; $$index_9++) {
			let block = each_array_9[$$index_9];

			$$renderer.push(`<li class="svelte-1g3qxzr"><strong class="svelte-1g3qxzr">${$.escape(block.type)}:</strong> ${$.escape(block.description)}</li>`);
		}

		$$renderer.push(`<!--]--></ul> <p class="svelte-1g3qxzr">${$.escape(macAddressContent.sections.ouiLookup.lookupInfo)}</p></div></details> <details class="info-accordion svelte-1g3qxzr"><summary class="accordion-summary svelte-1g3qxzr">`);
		Icon($$renderer, { name: 'chevron-right', size: 'sm' });
		$$renderer.push(`<!----> <h4 class="svelte-1g3qxzr">${$.escape(macAddressContent.sections.specialAddresses.title)}</h4></summary> <div class="accordion-content svelte-1g3qxzr"><ul class="svelte-1g3qxzr"><!--[-->`);

		const each_array_10 = $.ensure_array_like(macAddressContent.sections.specialAddresses.addresses);

		for (let $$index_10 = 0,
			$$length = each_array_10.length; $$index_10 < $$length; $$index_10++) {
			let addr = each_array_10[$$index_10];

			$$renderer.push(`<li class="svelte-1g3qxzr"><strong class="svelte-1g3qxzr">${$.escape(addr.type)}:</strong> <code class="svelte-1g3qxzr">${$.escape(addr.address)}</code> - ${$.escape(addr.description)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div></details> <details class="info-accordion svelte-1g3qxzr"><summary class="accordion-summary svelte-1g3qxzr">`);
		Icon($$renderer, { name: 'chevron-right', size: 'sm' });
		$$renderer.push(`<!----> <h4 class="svelte-1g3qxzr">${$.escape(macAddressContent.sections.useCases.title)}</h4></summary> <div class="accordion-content svelte-1g3qxzr"><ul class="svelte-1g3qxzr"><!--[-->`);

		const each_array_11 = $.ensure_array_like(macAddressContent.sections.useCases.cases);

		for (let $$index_11 = 0,
			$$length = each_array_11.length; $$index_11 < $$length; $$index_11++) {
			let useCase = each_array_11[$$index_11];

			$$renderer.push(`<li class="svelte-1g3qxzr"><strong class="svelte-1g3qxzr">${$.escape(useCase.useCase)}:</strong> ${$.escape(useCase.description)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div></details> <details class="info-accordion svelte-1g3qxzr"><summary class="accordion-summary svelte-1g3qxzr">`);
		Icon($$renderer, { name: 'chevron-right', size: 'sm' });
		$$renderer.push(`<!----> <h4 class="svelte-1g3qxzr">Quick Tips</h4></summary> <div class="accordion-content svelte-1g3qxzr"><ul class="svelte-1g3qxzr"><!--[-->`);

		const each_array_12 = $.ensure_array_like(macAddressContent.quickTips);

		for (let $$index_12 = 0,
			$$length = each_array_12.length; $$index_12 < $$length; $$index_12++) {
			let tip = each_array_12[$$index_12];

			$$renderer.push(`<li class="svelte-1g3qxzr">${$.escape(tip)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div></details></div></div>`);
	});
}