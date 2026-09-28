import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<div class="item-card svelte-1n8t563"><div class="item-header svelte-1n8t563"><h4 class="svelte-1n8t563"> </h4> <button type="button" class="btn-icon btn-remove svelte-1n8t563" aria-label="Remove item"><!></button></div> <div class="input-group svelte-1n8t563"><label class="svelte-1n8t563"><!> Data Type</label> <select class="svelte-1n8t563"></select> <span class="help-text svelte-1n8t563"> </span></div> <div class="input-group svelte-1n8t563"><label class="svelte-1n8t563"><!> Value</label> <input type="text" class="svelte-1n8t563"/></div></div>`);
var root_2 = $.from_html(`<div class="error-message svelte-1n8t563"><!> </div>`);
var root_3 = $.from_html(`<div class="card errors-card svelte-1n8t563"><h3 class="svelte-1n8t563">Validation Errors</h3> <!></div>`);
var root_4 = $.from_html(`<div class="breakdown-item svelte-1n8t563"><div class="breakdown-label svelte-1n8t563"> </div> <div class="breakdown-hex svelte-1n8t563"> </div> <div class="breakdown-desc svelte-1n8t563"> </div></div>`);
var root_5 = $.from_html(`<div class="breakdown-section svelte-1n8t563"><h4 class="svelte-1n8t563">Byte Breakdown</h4> <!></div>`);
var root_6 = $.from_html(`<div class="output-group svelte-1n8t563"><div class="output-header svelte-1n8t563"><h4 class="svelte-1n8t563">ISC dhcpd Configuration</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-1n8t563"> </pre></div>`);
var root_7 = $.from_html(`<div class="output-group svelte-1n8t563"><div class="output-header svelte-1n8t563"><h4 class="svelte-1n8t563">Kea DHCPv4 Configuration</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-1n8t563"> </pre></div>`);

var root_8 = $.from_html(
	`<div class="card results svelte-1n8t563"><h3 class="svelte-1n8t563">Encoded Option</h3> <div class="summary-card svelte-1n8t563"><div class="svelte-1n8t563"><strong class="svelte-1n8t563">Option Code:</strong> </div> <div class="svelte-1n8t563"><strong class="svelte-1n8t563">Option Name:</strong> </div> <div class="svelte-1n8t563"><strong class="svelte-1n8t563">Data Length:</strong> </div> <div class="svelte-1n8t563"><strong class="svelte-1n8t563">Items:</strong> </div></div> <div class="output-group svelte-1n8t563"><div class="output-header svelte-1n8t563"><h4 class="svelte-1n8t563">Hex-Encoded (Compact)</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-1n8t563"> </pre></div> <div class="output-group svelte-1n8t563"><div class="output-header svelte-1n8t563"><h4 class="svelte-1n8t563">Wire Format (Spaced)</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-1n8t563"> </pre></div> <!></div> <div class="card results svelte-1n8t563"><h3 class="svelte-1n8t563">Configuration Examples</h3> <!> <!></div> <div class="card results info-card svelte-1n8t563"><h3 class="svelte-1n8t563">About TLV Encoding</h3> <p class="svelte-1n8t563">Type-Length-Value (TLV) is a common encoding scheme used in DHCP options. This tool allows you to compose custom
        DHCP options by combining multiple data items of different types.</p> <ul class="svelte-1n8t563"><li class="svelte-1n8t563"><strong class="svelte-1n8t563">IPv4/IPv6:</strong> Network addresses encoded as raw bytes</li> <li class="svelte-1n8t563"><strong class="svelte-1n8t563">FQDN:</strong> Domain names in DNS wire format (length-prefixed labels)</li> <li class="svelte-1n8t563"><strong class="svelte-1n8t563">String:</strong> UTF-8 encoded text</li> <li class="svelte-1n8t563"><strong class="svelte-1n8t563">UInt8/16/32:</strong> Unsigned integers of various sizes</li> <li class="svelte-1n8t563"><strong class="svelte-1n8t563">Boolean:</strong> Single byte (0x00 or 0x01)</li> <li class="svelte-1n8t563"><strong class="svelte-1n8t563">Hex:</strong> Raw hexadecimal bytes for custom data</li></ul> <p class="svelte-1n8t563">The generated hex output represents the option data only. DHCP servers will automatically add the option code
        and length fields when sending the option to clients.</p></div>`,
	1
);

var root_9 = $.from_html(`<!> <div class="card input-card svelte-1n8t563"><div class="card-header svelte-1n8t563"><h3 class="svelte-1n8t563">Option Configuration</h3></div> <div class="card-content svelte-1n8t563"><div class="input-row svelte-1n8t563"><div class="input-group svelte-1n8t563"><label for="option-code" class="svelte-1n8t563"><!> Option Code <span class="required svelte-1n8t563">*</span></label> <input id="option-code" type="number" min="0" max="255" placeholder="224" class="svelte-1n8t563"/> <span class="help-text svelte-1n8t563">DHCP option number (0-255, recommend 224-254 for custom)</span></div> <div class="input-group svelte-1n8t563"><label for="option-name" class="svelte-1n8t563"><!> Option Name <span class="required svelte-1n8t563">*</span></label> <input id="option-name" type="text" placeholder="e.g., Custom Server Option" class="svelte-1n8t563"/> <span class="help-text svelte-1n8t563">Descriptive name for this option</span></div></div></div></div> <div class="card input-card svelte-1n8t563"><div class="card-header svelte-1n8t563"><h3 class="svelte-1n8t563">Data Items</h3> <p class="help-text svelte-1n8t563">Add multiple data items to build the option payload. Each item will be encoded sequentially.</p></div> <div class="card-content items-container svelte-1n8t563"><!> <button type="button" class="btn-add svelte-1n8t563"><!> Add Data Item</button></div></div> <!> <!>`, 1);

export default function FreeformTLVBuilder($$anchor, $$props) {
	$.push($$props, true);

	let option = $.state($.proxy({ ...getDefaultTLVOption(), items: [createTLVItem('string')] }));
	let result = $.state(null);
	let validationErrors = $.state($.proxy([]));
	let selectedExampleIndex = $.state(null);
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
		$.set(
			option,
			{
				...example.option,
				items: example.option.items.map((item) => ({ ...item, id: crypto.randomUUID() }))
			},
			true
		);

		$.set(selectedExampleIndex, index, true);
	}

	function checkIfExampleStillMatches() {
		if ($.get(selectedExampleIndex) === null) return;

		const example = examples[$.get(selectedExampleIndex)];

		if (!example) {
			$.set(selectedExampleIndex, null);

			return;
		}

		const matches = $.get(option).optionCode === example.option.optionCode && $.get(option).optionName === example.option.optionName && $.get(option).items.length === example.option.items.length && $.get(option).items.every((item, i) => item.dataType === example.option.items[i].dataType && item.value === example.option.items[i].value);

		if (!matches) {
			$.set(selectedExampleIndex, null);
		}
	}

	function addItem() {
		$.get(option).items = [...$.get(option).items, createTLVItem('string')];
	}

	function removeItem(id) {
		if ($.get(option).items.length > 1) {
			$.get(option).items = $.get(option).items.filter((item) => item.id !== id);
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

	$.user_effect(() => {
		// Read option properties to trigger effect when they change
		const currentOptionCode = $.get(option).optionCode;

		const currentOptionName = $.get(option).optionName;
		const _currentItems = $.get(option).items.map((item) => ({ dataType: item.dataType, value: item.value }));

		// Update validationErrors and result without tracking them (prevents infinite loop)
		untrack(() => {
			const currentOption = {
				optionCode: currentOptionCode,
				optionName: currentOptionName,
				items: $.get(option).items
			};

			// Check if form is in initial empty state (1 item with no value)
			const isInitialState = currentOption.items.length === 1 && !currentOption.items[0].value.trim();

			if (isInitialState) {
				$.set(validationErrors, [], true);
				$.set(result, null);
			} else {
				$.set(validationErrors, validateTLVOption(currentOption), true);

				if ($.get(validationErrors).length === 0) {
					try {
						$.set(result, buildTLVOption(currentOption), true);
					} catch(e) {
						$.set(validationErrors, [e instanceof Error ? e.message : String(e)], true);
						$.set(result, null);
					}
				} else {
					$.set(result, null);
				}
			}

			checkIfExampleStillMatches();
		});
	});

	ToolContentContainer($$anchor, {
		title: 'Freeform TLV Composer',
		description: 'Build custom DHCP options using Type-Length-Value encoding. Support for IPv4, IPv6, FQDN, strings, hex data, and numeric types with live hex preview.',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_9();
			var node = $.first_child(fragment_1);

			ExamplesCard(node, {
				get examples() {
					return examples;
				},
				onSelect: loadExample,
				getLabel: (ex) => ex.label,
				getDescription: (ex) => ex.description,
				get selectedIndex() {
					return $.get(selectedExampleIndex);
				}
			});

			var div = $.sibling(node, 2);
			var div_1 = $.sibling($.child(div), 2);
			var div_2 = $.child(div_1);
			var div_3 = $.child(div_2);
			var label = $.child(div_3);
			var node_1 = $.child(label);

			Icon(node_1, { name: 'hash', size: 'sm' });
			$.next(2);
			$.reset(label);

			var input = $.sibling(label, 2);

			$.remove_input_defaults(input);
			$.next(2);
			$.reset(div_3);

			var div_4 = $.sibling(div_3, 2);
			var label_1 = $.child(div_4);
			var node_2 = $.child(label_1);

			Icon(node_2, { name: 'tag', size: 'sm' });
			$.next(2);
			$.reset(label_1);

			var input_1 = $.sibling(label_1, 2);

			$.remove_input_defaults(input_1);
			$.next(2);
			$.reset(div_4);
			$.reset(div_2);
			$.reset(div_1);
			$.reset(div);

			var div_5 = $.sibling(div, 2);
			var div_6 = $.sibling($.child(div_5), 2);
			var node_3 = $.child(div_6);

			$.each(node_3, 19, () => $.get(option).items, (item) => item.id, ($$anchor, item, i) => {
				var div_7 = root_1();
				var div_8 = $.child(div_7);
				var h4 = $.child(div_8);
				var text = $.only_child(h4);
				var button = $.sibling(h4, 2);
				var node_4 = $.child(button);

				Icon(node_4, { name: 'x', size: 'sm' });
				$.reset(button);
				$.reset(div_8);

				var div_9 = $.sibling(div_8, 2);
				var label_2 = $.child(div_9);
				var node_5 = $.child(label_2);

				Icon(node_5, { name: 'binary', size: 'sm' });
				$.next();
				$.reset(label_2);

				var select = $.sibling(label_2, 2);

				$.each(select, 21, () => dataTypeOptions, (typeOption) => typeOption.value, ($$anchor, typeOption) => {
					var option_1 = root();
					var text_1 = $.only_child(option_1, true);
					var option_1_value = {};

					$.template_effect(() => {
						$.set_text(text_1, $.get(typeOption).label);

						if (option_1_value !== (option_1_value = $.get(typeOption).value)) {
							option_1.value = (option_1.__value = option_1_value) ?? '';
						}
					});

					$.append($$anchor, option_1);
				});

				$.reset(select);
				$.init_select(select);

				var span = $.sibling(select, 2);
				var text_2 = $.only_child(span, true);

				$.reset(div_9);

				var div_10 = $.sibling(div_9, 2);
				var label_3 = $.child(div_10);
				var node_6 = $.child(label_3);

				Icon(node_6, { name: 'edit', size: 'sm' });
				$.next();
				$.reset(label_3);

				var input_2 = $.sibling(label_3, 2);

				$.remove_input_defaults(input_2);
				$.reset(div_10);
				$.reset(div_7);

				$.template_effect(
					($0, $1) => {
						$.set_text(text, `Item ${$.get(i) + 1}`);
						button.disabled = $.get(option).items.length === 1;
						$.set_attribute(label_2, 'for', `datatype-${$.get(item).id ?? ''}`);
						$.set_attribute(select, 'id', `datatype-${$.get(item).id ?? ''}`);
						$.set_text(text_2, $0);
						$.set_attribute(label_3, 'for', `value-${$.get(item).id ?? ''}`);
						$.set_attribute(input_2, 'id', `value-${$.get(item).id ?? ''}`);
						$.set_attribute(input_2, 'placeholder', $1);
					},
					[
						() => dataTypeOptions.find((t) => t.value === $.get(item).dataType)?.description,
						() => getPlaceholder($.get(item).dataType)
					]
				);

				$.delegated('click', button, () => removeItem($.get(item).id));
				$.bind_select_value(select, () => $.get(item).dataType, ($$value) => ($.get(item).dataType = $$value));
				$.bind_value(input_2, () => $.get(item).value, ($$value) => ($.get(item).value = $$value));
				$.append($$anchor, div_7);
			});

			var button_1 = $.sibling(node_3, 2);
			var node_7 = $.child(button_1);

			Icon(node_7, { name: 'plus', size: 'sm' });
			$.next();
			$.reset(button_1);
			$.reset(div_6);
			$.reset(div_5);

			var node_8 = $.sibling(div_5, 2);

			{
				var consequent = ($$anchor) => {
					var div_11 = root_3();
					var node_9 = $.sibling($.child(div_11), 2);

					$.each(node_9, 17, () => $.get(validationErrors), $.index, ($$anchor, error) => {
						var div_12 = root_2();
						var node_10 = $.child(div_12);

						Icon(node_10, { name: 'alert-triangle', size: 'sm' });

						var text_3 = $.sibling(node_10);

						$.reset(div_12);
						$.template_effect(() => $.set_text(text_3, ` ${$.get(error) ?? ''}`));
						$.append($$anchor, div_12);
					});

					$.reset(div_11);
					$.append($$anchor, div_11);
				};

				$.if(node_8, ($$render) => {
					if ($.get(validationErrors).length > 0) $$render(consequent);
				});
			}

			var node_11 = $.sibling(node_8, 2);

			{
				var consequent_4 = ($$anchor) => {
					var fragment_2 = root_8();
					var div_13 = $.first_child(fragment_2);
					var div_14 = $.sibling($.child(div_13), 2);
					var div_15 = $.child(div_14);
					var text_4 = $.sibling($.child(div_15));

					$.reset(div_15);

					var div_16 = $.sibling(div_15, 2);
					var text_5 = $.sibling($.child(div_16));

					$.reset(div_16);

					var div_17 = $.sibling(div_16, 2);
					var text_6 = $.sibling($.child(div_17));

					$.reset(div_17);

					var div_18 = $.sibling(div_17, 2);
					var text_7 = $.sibling($.child(div_18));

					$.reset(div_18);
					$.reset(div_14);

					var div_19 = $.sibling(div_14, 2);
					var div_20 = $.child(div_19);
					var button_2 = $.sibling($.child(div_20), 2);
					let classes;
					var node_12 = $.child(button_2);

					{
						let $0 = $.derived(() => clipboard.isCopied('hex') ? 'check' : 'copy');

						Icon(node_12, {
							get name() {
								return $.get($0);
							},
							size: 'xs'
						});
					}

					var text_8 = $.sibling(node_12);

					$.reset(button_2);
					$.reset(div_20);

					var pre = $.sibling(div_20, 2);
					var text_9 = $.only_child(pre, true);

					$.reset(div_19);

					var div_21 = $.sibling(div_19, 2);
					var div_22 = $.child(div_21);
					var button_3 = $.sibling($.child(div_22), 2);
					let classes_1;
					var node_13 = $.child(button_3);

					{
						let $0 = $.derived(() => clipboard.isCopied('wire') ? 'check' : 'copy');

						Icon(node_13, {
							get name() {
								return $.get($0);
							},
							size: 'xs'
						});
					}

					var text_10 = $.sibling(node_13);

					$.reset(button_3);
					$.reset(div_22);

					var pre_1 = $.sibling(div_22, 2);
					var text_11 = $.only_child(pre_1, true);

					$.reset(div_21);

					var node_14 = $.sibling(div_21, 2);

					{
						var consequent_1 = ($$anchor) => {
							var div_23 = root_5();
							var node_15 = $.sibling($.child(div_23), 2);

							$.each(node_15, 17, () => $.get(result).breakdown, $.index, ($$anchor, item) => {
								var div_24 = root_4();
								var div_25 = $.child(div_24);
								var text_12 = $.only_child(div_25, true);
								var div_26 = $.sibling(div_25, 2);
								var text_13 = $.only_child(div_26, true);
								var div_27 = $.sibling(div_26, 2);
								var text_14 = $.only_child(div_27, true);

								$.reset(div_24);

								$.template_effect(() => {
									$.set_text(text_12, $.get(item).label);
									$.set_text(text_13, $.get(item).hex);
									$.set_text(text_14, $.get(item).description);
								});

								$.append($$anchor, div_24);
							});

							$.reset(div_23);
							$.append($$anchor, div_23);
						};

						$.if(node_14, ($$render) => {
							if ($.get(result).breakdown.length > 0) $$render(consequent_1);
						});
					}

					$.reset(div_13);

					var div_28 = $.sibling(div_13, 2);
					var node_16 = $.sibling($.child(div_28), 2);

					{
						var consequent_2 = ($$anchor) => {
							var div_29 = root_6();
							var div_30 = $.child(div_29);
							var button_4 = $.sibling($.child(div_30), 2);
							let classes_2;
							var node_17 = $.child(button_4);

							{
								let $0 = $.derived(() => clipboard.isCopied('isc') ? 'check' : 'copy');

								Icon(node_17, {
									get name() {
										return $.get($0);
									},
									size: 'xs'
								});
							}

							var text_15 = $.sibling(node_17);

							$.reset(button_4);
							$.reset(div_30);

							var pre_2 = $.sibling(div_30, 2);
							var text_16 = $.only_child(pre_2, true);

							$.reset(div_29);

							$.template_effect(
								($0, $1) => {
									classes_2 = $.set_class(button_4, 1, 'copy-btn svelte-1n8t563', null, classes_2, { copied: $0 });
									$.set_text(text_15, ` ${$1 ?? ''}`);
									$.set_text(text_16, $.get(result).examples.iscDhcpd);
								},
								[
									() => clipboard.isCopied('isc'),
									() => clipboard.isCopied('isc') ? 'Copied' : 'Copy'
								]
							);

							$.delegated('click', button_4, () => clipboard.copy($.get(result).examples.iscDhcpd, 'isc'));
							$.append($$anchor, div_29);
						};

						$.if(node_16, ($$render) => {
							if ($.get(result).examples.iscDhcpd) $$render(consequent_2);
						});
					}

					var node_18 = $.sibling(node_16, 2);

					{
						var consequent_3 = ($$anchor) => {
							var div_31 = root_7();
							var div_32 = $.child(div_31);
							var button_5 = $.sibling($.child(div_32), 2);
							let classes_3;
							var node_19 = $.child(button_5);

							{
								let $0 = $.derived(() => clipboard.isCopied('kea') ? 'check' : 'copy');

								Icon(node_19, {
									get name() {
										return $.get($0);
									},
									size: 'xs'
								});
							}

							var text_17 = $.sibling(node_19);

							$.reset(button_5);
							$.reset(div_32);

							var pre_3 = $.sibling(div_32, 2);
							var text_18 = $.only_child(pre_3, true);

							$.reset(div_31);

							$.template_effect(
								($0, $1) => {
									classes_3 = $.set_class(button_5, 1, 'copy-btn svelte-1n8t563', null, classes_3, { copied: $0 });
									$.set_text(text_17, ` ${$1 ?? ''}`);
									$.set_text(text_18, $.get(result).examples.keaDhcp4);
								},
								[
									() => clipboard.isCopied('kea'),
									() => clipboard.isCopied('kea') ? 'Copied' : 'Copy'
								]
							);

							$.delegated('click', button_5, () => clipboard.copy($.get(result).examples.keaDhcp4, 'kea'));
							$.append($$anchor, div_31);
						};

						$.if(node_18, ($$render) => {
							if ($.get(result).examples.keaDhcp4) $$render(consequent_3);
						});
					}

					$.reset(div_28);
					$.next(2);

					$.template_effect(
						($0, $1, $2, $3) => {
							$.set_text(text_4, ` ${$.get(result).option.optionCode ?? ''}`);
							$.set_text(text_5, ` ${$.get(result).option.optionName ?? ''}`);
							$.set_text(text_6, ` ${$.get(result).dataLength ?? ''} bytes`);
							$.set_text(text_7, ` ${$.get(result).option.items.length ?? ''}`);
							classes = $.set_class(button_2, 1, 'copy-btn svelte-1n8t563', null, classes, { copied: $0 });
							$.set_text(text_8, ` ${$1 ?? ''}`);
							$.set_text(text_9, $.get(result).hexEncoded);
							classes_1 = $.set_class(button_3, 1, 'copy-btn svelte-1n8t563', null, classes_1, { copied: $2 });
							$.set_text(text_10, ` ${$3 ?? ''}`);
							$.set_text(text_11, $.get(result).wireFormat);
						},
						[
							() => clipboard.isCopied('hex'),
							() => clipboard.isCopied('hex') ? 'Copied' : 'Copy',
							() => clipboard.isCopied('wire'),
							() => clipboard.isCopied('wire') ? 'Copied' : 'Copy'
						]
					);

					$.delegated('click', button_2, () => clipboard.copy($.get(result).hexEncoded, 'hex'));
					$.delegated('click', button_3, () => clipboard.copy($.get(result).wireFormat, 'wire'));
					$.append($$anchor, fragment_2);
				};

				$.if(node_11, ($$render) => {
					if ($.get(result) && $.get(validationErrors).length === 0) $$render(consequent_4);
				});
			}

			$.bind_value(input, () => $.get(option).optionCode, ($$value) => $.get(option).optionCode = $$value);
			$.bind_value(input_1, () => $.get(option).optionName, ($$value) => $.get(option).optionName = $$value);
			$.delegated('click', button_1, addItem);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);