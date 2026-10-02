import * as $ from 'svelte/internal/server';
import { untrack } from 'svelte';
import Icon from '$lib/components/global/Icon.svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import { useClipboard } from '$lib/composables';

import {
	buildTLVOption,
	getDefaultTLVOption,
	validateTLVOption,
	createTLVItem,
	TLV_EXAMPLES
} from '$lib/utils/dhcp-freeform-tlv';

export default function FreeformTLVBuilder($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let option = { ...getDefaultTLVOption(), items: [createTLVItem('string')] };
		let result = null;
		let validationErrors = [];
		let selectedExampleIndex = null;
		const clipboard = useClipboard();

		const examples = TLV_EXAMPLES.map((ex) => ({
			label: ex.optionName,
			option: ex,
			description: `Option ${ex.optionCode}: ${ex.items.length} item${ex.items.length > 1 ? 's' : ''} - ${ex.items.map((i) => i.dataType).join(', ')}`
		}));

		const dataTypeOptions = [
			{
				value: 'ipv4',
				label: 'IPv4 Address',
				description: '4 bytes, e.g., 192.168.1.1'
			},

			{
				value: 'ipv6',
				label: 'IPv6 Address',
				description: '16 bytes, e.g., 2001:db8::1'
			},

			{
				value: 'fqdn',
				label: 'Domain Name (FQDN)',
				description: 'DNS wire format with length prefixes'
			},

			{
				value: 'string',
				label: 'String (UTF-8)',
				description: 'Text encoded as UTF-8 bytes'
			},

			{
				value: 'hex',
				label: 'Raw Hex',
				description: 'Direct hex bytes'
			},

			{
				value: 'uint8',
				label: 'UInt8',
				description: '1 byte unsigned integer (0-255)'
			},

			{
				value: 'uint16',
				label: 'UInt16',
				description: '2 byte unsigned integer (0-65535)'
			},

			{
				value: 'uint32',
				label: 'UInt32',
				description: '4 byte unsigned integer (0-4294967295)'
			},

			{
				value: 'boolean',
				label: 'Boolean',
				description: '1 byte (0 or 1)'
			}
		];

		function loadExample(example, index) {
			// Deep copy the option to avoid reference issues
			option = {
				...example.option,
				items: example.option.items.map((item) => ({ ...item, id: crypto.randomUUID() }))
			};

			selectedExampleIndex = index;
		}

		function checkIfExampleStillMatches() {
			if (selectedExampleIndex === null) return;

			const example = examples[selectedExampleIndex];

			if (!example) {
				selectedExampleIndex = null;

				return;
			}

			const matches = option.optionCode === example.option.optionCode && option.optionName === example.option.optionName && option.items.length === example.option.items.length && option.items.every((item, i) => item.dataType === example.option.items[i].dataType && item.value === example.option.items[i].value);

			if (!matches) {
				selectedExampleIndex = null;
			}
		}

		function addItem() {
			option.items = [...option.items, createTLVItem('string')];
		}

		function removeItem(id) {
			if (option.items.length > 1) {
				option.items = option.items.filter((item) => item.id !== id);
			}
		}

		function getPlaceholder(dataType) {
			switch (dataType) {
				case 'ipv4':
					return '192.168.1.1';

				case 'ipv6':
					return '2001:db8::1';

				case 'fqdn':
					return 'example.com';

				case 'string':
					return 'Enter text';

				case 'hex':
					return 'deadbeef or DE AD BE EF';

				case 'uint8':
					return '0-255';

				case 'uint16':
					return '0-65535';

				case 'uint32':
					return '0-4294967295';

				case 'boolean':
					return '0, 1, true, or false';

				default:
					return '';
			}
		}

		ToolContentContainer($$renderer, {
			title: 'Freeform TLV Composer',
			description: 'Build custom DHCP options using Type-Length-Value encoding. Support for IPv4, IPv6, FQDN, strings, hex data, and numeric types with live hex preview.',
			children: ($$renderer) => {
				ExamplesCard($$renderer, {
					examples,
					onSelect: loadExample,
					getLabel: (ex) => ex.label,
					getDescription: (ex) => ex.description,
					selectedIndex: selectedExampleIndex
				});

				$$renderer.push(`<!----> <div class="card input-card svelte-1n8t563"><div class="card-header svelte-1n8t563"><h3 class="svelte-1n8t563">Option Configuration</h3></div> <div class="card-content svelte-1n8t563"><div class="input-row svelte-1n8t563"><div class="input-group svelte-1n8t563"><label for="option-code" class="svelte-1n8t563">`);
				Icon($$renderer, { name: 'hash', size: 'sm' });
				$$renderer.push(`<!----> Option Code <span class="required svelte-1n8t563">*</span></label> <input id="option-code" type="number"${$.attr('value', option.optionCode)} min="0" max="255" placeholder="224" class="svelte-1n8t563"/> <span class="help-text svelte-1n8t563">DHCP option number (0-255, recommend 224-254 for custom)</span></div> <div class="input-group svelte-1n8t563"><label for="option-name" class="svelte-1n8t563">`);
				Icon($$renderer, { name: 'tag', size: 'sm' });
				$$renderer.push(`<!----> Option Name <span class="required svelte-1n8t563">*</span></label> <input id="option-name" type="text"${$.attr('value', option.optionName)} placeholder="e.g., Custom Server Option" class="svelte-1n8t563"/> <span class="help-text svelte-1n8t563">Descriptive name for this option</span></div></div></div></div> <div class="card input-card svelte-1n8t563"><div class="card-header svelte-1n8t563"><h3 class="svelte-1n8t563">Data Items</h3> <p class="help-text svelte-1n8t563">Add multiple data items to build the option payload. Each item will be encoded sequentially.</p></div> <div class="card-content items-container svelte-1n8t563"><!--[-->`);

				const each_array = $.ensure_array_like(option.items);

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let item = each_array[i];

					$$renderer.push(`<div class="item-card svelte-1n8t563"><div class="item-header svelte-1n8t563"><h4 class="svelte-1n8t563">Item ${$.escape(i + 1)}</h4> <button type="button" class="btn-icon btn-remove svelte-1n8t563"${$.attr('disabled', option.items.length === 1, true)} aria-label="Remove item">`);
					Icon($$renderer, { name: 'x', size: 'sm' });
					$$renderer.push(`<!----></button></div> <div class="input-group svelte-1n8t563"><label${$.attr('for', `datatype-${$.stringify(item.id)}`)} class="svelte-1n8t563">`);
					Icon($$renderer, { name: 'binary', size: 'sm' });
					$$renderer.push(`<!----> Data Type</label> `);

					$$renderer.select(
						{
							id: `datatype-${$.stringify(item.id)}`,
							value: item.dataType,
							class: ''
						},
						($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array_1 = $.ensure_array_like(dataTypeOptions);

							for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
								let typeOption = each_array_1[$$index];

								$$renderer.option({ value: typeOption.value }, ($$renderer) => {
									$$renderer.push(`${$.escape(typeOption.label)}`);
								});
							}

							$$renderer.push(`<!--]-->`);
						},
						'svelte-1n8t563'
					);

					$$renderer.push(` <span class="help-text svelte-1n8t563">${$.escape(dataTypeOptions.find((t) => t.value === item.dataType)?.description)}</span></div> <div class="input-group svelte-1n8t563"><label${$.attr('for', `value-${$.stringify(item.id)}`)} class="svelte-1n8t563">`);
					Icon($$renderer, { name: 'edit', size: 'sm' });
					$$renderer.push(`<!----> Value</label> <input${$.attr('id', `value-${$.stringify(item.id)}`)} type="text"${$.attr('value', item.value)}${$.attr('placeholder', getPlaceholder(item.dataType))} class="svelte-1n8t563"/></div></div>`);
				}

				$$renderer.push(`<!--]--> <button type="button" class="btn-add svelte-1n8t563">`);
				Icon($$renderer, { name: 'plus', size: 'sm' });
				$$renderer.push(`<!----> Add Data Item</button></div></div> `);

				if (validationErrors.length > 0) {
					$$renderer.push(`<!--[0--><div class="card errors-card svelte-1n8t563"><h3 class="svelte-1n8t563">Validation Errors</h3> <!--[-->`);

					const each_array_2 = $.ensure_array_like(validationErrors);

					for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
						let error = each_array_2[i];

						$$renderer.push(`<div class="error-message svelte-1n8t563">`);
						Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
						$$renderer.push(`<!----> ${$.escape(error)}</div>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (result && validationErrors.length === 0) {
					$$renderer.push(`<!--[0--><div class="card results svelte-1n8t563"><h3 class="svelte-1n8t563">Encoded Option</h3> <div class="summary-card svelte-1n8t563"><div class="svelte-1n8t563"><strong class="svelte-1n8t563">Option Code:</strong> ${$.escape(result.option.optionCode)}</div> <div class="svelte-1n8t563"><strong class="svelte-1n8t563">Option Name:</strong> ${$.escape(result.option.optionName)}</div> <div class="svelte-1n8t563"><strong class="svelte-1n8t563">Data Length:</strong> ${$.escape(result.dataLength)} bytes</div> <div class="svelte-1n8t563"><strong class="svelte-1n8t563">Items:</strong> ${$.escape(result.option.items.length)}</div></div> <div class="output-group svelte-1n8t563"><div class="output-header svelte-1n8t563"><h4 class="svelte-1n8t563">Hex-Encoded (Compact)</h4> <button type="button"${$.attr_class('copy-btn svelte-1n8t563', void 0, { 'copied': clipboard.isCopied('hex') })}>`);

					Icon($$renderer, {
						name: clipboard.isCopied('hex') ? 'check' : 'copy',
						size: 'xs'
					});

					$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('hex') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-1n8t563">${$.escape(result.hexEncoded)}</pre></div> <div class="output-group svelte-1n8t563"><div class="output-header svelte-1n8t563"><h4 class="svelte-1n8t563">Wire Format (Spaced)</h4> <button type="button"${$.attr_class('copy-btn svelte-1n8t563', void 0, { 'copied': clipboard.isCopied('wire') })}>`);

					Icon($$renderer, {
						name: clipboard.isCopied('wire') ? 'check' : 'copy',
						size: 'xs'
					});

					$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('wire') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-1n8t563">${$.escape(result.wireFormat)}</pre></div> `);

					if (result.breakdown.length > 0) {
						$$renderer.push(`<!--[0--><div class="breakdown-section svelte-1n8t563"><h4 class="svelte-1n8t563">Byte Breakdown</h4> <!--[-->`);

						const each_array_3 = $.ensure_array_like(result.breakdown);

						for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
							let item = each_array_3[i];

							$$renderer.push(`<div class="breakdown-item svelte-1n8t563"><div class="breakdown-label svelte-1n8t563">${$.escape(item.label)}</div> <div class="breakdown-hex svelte-1n8t563">${$.escape(item.hex)}</div> <div class="breakdown-desc svelte-1n8t563">${$.escape(item.description)}</div></div>`);
						}

						$$renderer.push(`<!--]--></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div> <div class="card results svelte-1n8t563"><h3 class="svelte-1n8t563">Configuration Examples</h3> `);

					if (result.examples.iscDhcpd) {
						$$renderer.push(`<!--[0--><div class="output-group svelte-1n8t563"><div class="output-header svelte-1n8t563"><h4 class="svelte-1n8t563">ISC dhcpd Configuration</h4> <button type="button"${$.attr_class('copy-btn svelte-1n8t563', void 0, { 'copied': clipboard.isCopied('isc') })}>`);

						Icon($$renderer, {
							name: clipboard.isCopied('isc') ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('isc') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-1n8t563">${$.escape(result.examples.iscDhcpd)}</pre></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (result.examples.keaDhcp4) {
						$$renderer.push(`<!--[0--><div class="output-group svelte-1n8t563"><div class="output-header svelte-1n8t563"><h4 class="svelte-1n8t563">Kea DHCPv4 Configuration</h4> <button type="button"${$.attr_class('copy-btn svelte-1n8t563', void 0, { 'copied': clipboard.isCopied('kea') })}>`);

						Icon($$renderer, {
							name: clipboard.isCopied('kea') ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('kea') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-1n8t563">${$.escape(result.examples.keaDhcp4)}</pre></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div> <div class="card results info-card svelte-1n8t563"><h3 class="svelte-1n8t563">About TLV Encoding</h3> <p class="svelte-1n8t563">Type-Length-Value (TLV) is a common encoding scheme used in DHCP options. This tool allows you to compose custom
        DHCP options by combining multiple data items of different types.</p> <ul class="svelte-1n8t563"><li class="svelte-1n8t563"><strong class="svelte-1n8t563">IPv4/IPv6:</strong> Network addresses encoded as raw bytes</li> <li class="svelte-1n8t563"><strong class="svelte-1n8t563">FQDN:</strong> Domain names in DNS wire format (length-prefixed labels)</li> <li class="svelte-1n8t563"><strong class="svelte-1n8t563">String:</strong> UTF-8 encoded text</li> <li class="svelte-1n8t563"><strong class="svelte-1n8t563">UInt8/16/32:</strong> Unsigned integers of various sizes</li> <li class="svelte-1n8t563"><strong class="svelte-1n8t563">Boolean:</strong> Single byte (0x00 or 0x01)</li> <li class="svelte-1n8t563"><strong class="svelte-1n8t563">Hex:</strong> Raw hexadecimal bytes for custom data</li></ul> <p class="svelte-1n8t563">The generated hex output represents the option data only. DHCP servers will automatically add the option code
        and length fields when sending the option to clients.</p></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});
	});
}