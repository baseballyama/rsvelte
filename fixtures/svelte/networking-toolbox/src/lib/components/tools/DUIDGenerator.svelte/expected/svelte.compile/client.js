import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<div class="input-group svelte-1ybr557"><label for="mac-address" class="svelte-1ybr557"><!> MAC Address</label> <input id="mac-address" type="text" placeholder="00:1A:2B:3C:4D:5E or 001A2B3C4D5E" class="svelte-1ybr557"/> <small class="svelte-1ybr557">Enter MAC address in any common format</small></div> <div class="input-group svelte-1ybr557"><label for="hardware-type" class="svelte-1ybr557"><!> Hardware Type</label> <select id="hardware-type" class="svelte-1ybr557"><option>Ethernet (1)</option><option>Experimental Ethernet (2)</option><option>IEEE 802 (6)</option><option>ARCNET (7)</option><option>Frame Relay (15)</option><option>ATM (16)</option><option>HDLC (17)</option><option>Fibre Channel (18)</option><option>IEEE 1394 (24)</option><option>InfiniBand (32)</option></select></div>`, 1);
var root_1 = $.from_html(`<div class="input-group svelte-1ybr557"><label for="timestamp" class="svelte-1ybr557"><!> Timestamp (seconds since Jan 1, 2000 UTC)</label> <div class="timestamp-controls svelte-1ybr557"><input id="timestamp" type="number" placeholder="Leave empty for current time" class="svelte-1ybr557"/> <button type="button" class="btn-icon svelte-1ybr557"><!></button> <button type="button" class="btn-icon svelte-1ybr557"><!></button></div> <small class="svelte-1ybr557"> </small></div>`);
var root_2 = $.from_html(`<div class="input-group svelte-1ybr557"><label for="enterprise-number" class="svelte-1ybr557"><!> Enterprise Number (IANA)</label> <input id="enterprise-number" type="number" placeholder="e.g., 9 for Cisco, 311 for Microsoft" class="svelte-1ybr557"/> <small class="svelte-1ybr557">IANA Private Enterprise Number</small></div> <div class="input-group svelte-1ybr557"><label for="enterprise-identifier" class="svelte-1ybr557"><!> Enterprise Identifier (hex)</label> <input id="enterprise-identifier" type="text" placeholder="e.g., 0123456789abcdef" class="svelte-1ybr557"/> <small class="svelte-1ybr557">Custom identifier in hexadecimal format</small></div>`, 1);
var root_3 = $.from_html(`<div class="input-group svelte-1ybr557"><label for="uuid" class="svelte-1ybr557"><!> UUID</label> <input id="uuid" type="text" placeholder="e.g., 550e8400-e29b-41d4-a716-446655440000" class="svelte-1ybr557"/> <small class="svelte-1ybr557">Standard UUID format (with or without hyphens)</small></div>`);
var root_4 = $.from_html(`<div class="error-message svelte-1ybr557"><!> </div>`);
var root_5 = $.from_html(`<div class="card errors-card svelte-1ybr557"><h3 class="svelte-1ybr557">Validation Errors</h3> <!></div>`);
var root_6 = $.from_html(`<small class="svelte-1ybr557"> </small>`);
var root_7 = $.from_html(`<div class="breakdown-item svelte-1ybr557"><div class="breakdown-label svelte-1ybr557"> </div> <div class="breakdown-value svelte-1ybr557"><code class="svelte-1ybr557"> </code> <!></div></div>`);
var root_8 = $.from_html(`<div class="breakdown-section svelte-1ybr557"><h4 class="svelte-1ybr557">DUID Breakdown</h4> <!></div>`);
var root_9 = $.from_html(`<div class="card results svelte-1ybr557"><h3 class="svelte-1ybr557">Kea DHCPv6 Configuration</h3> <div class="output-group svelte-1ybr557"><div class="output-header svelte-1ybr557"><button type="button"><!> </button></div> <pre class="output-value code-block svelte-1ybr557"> </pre></div></div>`);
var root_10 = $.from_html(`<div class="card results svelte-1ybr557"><h3 class="svelte-1ybr557">ISC DHCPd Configuration</h3> <div class="output-group svelte-1ybr557"><div class="output-header svelte-1ybr557"><button type="button"><!> </button></div> <pre class="output-value code-block svelte-1ybr557"> </pre></div></div>`);
var root_11 = $.from_html(`<div class="card results svelte-1ybr557"><h3 class="svelte-1ybr557">Generated DUID</h3> <div class="summary-card svelte-1ybr557"><div class="svelte-1ybr557"><strong class="svelte-1ybr557">Type:</strong> </div> <div class="svelte-1ybr557"><strong class="svelte-1ybr557">Total Length:</strong> </div></div> <div class="output-group svelte-1ybr557"><div class="output-header svelte-1ybr557"><h4 class="svelte-1ybr557">Hex Encoded DUID</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-1ybr557"> </pre></div> <div class="output-group svelte-1ybr557"><div class="output-header svelte-1ybr557"><h4 class="svelte-1ybr557">Wire Format (Spaced)</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-1ybr557"> </pre></div> <!></div> <!> <!>`, 1);
var root_12 = $.from_html(`<!> <div class="card input-card svelte-1ybr557"><div class="card-header svelte-1ybr557"><h3 class="svelte-1ybr557">DUID Configuration</h3> <p class="help-text svelte-1ybr557">Configure DHCP Unique Identifier for DHCPv6 client identification</p></div> <div class="card-content svelte-1ybr557"><div class="input-group svelte-1ybr557"><label for="duid-type" class="svelte-1ybr557"><!> DUID Type</label> <select id="duid-type" class="svelte-1ybr557"><option>DUID-LLT (Type 1) - Link-layer address + time</option><option>DUID-EN (Type 2) - Enterprise number</option><option>DUID-LL (Type 3) - Link-layer address</option><option>DUID-UUID (Type 4) - UUID</option></select></div> <!> <!> <!> <!></div></div> <!> <!>`, 1);

export default function DUIDGenerator($$anchor, $$props) {
	$.push($$props, true);

	let duidType = $.state('DUID-LLT');
	let macAddress = $.state('');
	let hardwareType = $.state($.proxy(HARDWARE_TYPES.ETHERNET));
	let timestamp = $.state(undefined);
	let enterpriseNumber = $.state(undefined);
	let enterpriseIdentifier = $.state('');
	let uuid = $.state('');
	let validationErrors = $.state($.proxy([]));
	let result = $.state(null);
	let selectedExampleIndex = $.state(null);
	const clipboard = useClipboard();

	const examples = DUID_EXAMPLES.map((ex) => ({
		label: ex.name,
		config: ex,
		description: `${ex.type} configuration example`
	}));

	function loadExample(example, index) {
		const cfg = example.config;

		$.set(duidType, cfg.type, true);
		$.set(macAddress, cfg.macAddress || '', true);
		$.set(hardwareType, cfg.hardwareType ?? HARDWARE_TYPES.ETHERNET, true);
		$.set(timestamp, cfg.timestamp, true);
		$.set(enterpriseNumber, cfg.enterpriseNumber, true);
		$.set(enterpriseIdentifier, cfg.enterpriseIdentifier || '', true);
		$.set(uuid, cfg.uuid || '', true);
		$.set(selectedExampleIndex, index, true);
	}

	function checkIfExampleStillMatches() {
		if ($.get(selectedExampleIndex) === null) return;

		const example = examples[$.get(selectedExampleIndex)];

		if (!example) {
			$.set(selectedExampleIndex, null);

			return;
		}

		const cfg = example.config;
		const matches = $.get(duidType) === cfg.type && $.get(macAddress) === (cfg.macAddress || '') && $.get(hardwareType) === (cfg.hardwareType ?? HARDWARE_TYPES.ETHERNET) && $.get(timestamp) === cfg.timestamp && $.get(enterpriseNumber) === cfg.enterpriseNumber && $.get(enterpriseIdentifier) === (cfg.enterpriseIdentifier || '') && $.get(uuid) === (cfg.uuid || '');

		if (!matches) {
			$.set(selectedExampleIndex, null);
		}
	}

	function useCurrentTimestamp() {
		$.set(timestamp, calculateDUIDTimestamp(), true);
	}

	function clearTimestamp() {
		$.set(timestamp, undefined);
	}

	$.user_effect(() => {
		// Read config properties to trigger effect when they change
		const currentType = $.get(duidType);

		const currentMAC = $.get(macAddress);
		const currentHWType = $.get(hardwareType);
		const currentTimestamp = $.get(timestamp);
		const currentEnterpriseNumber = $.get(enterpriseNumber);
		const currentEnterpriseIdentifier = $.get(enterpriseIdentifier);
		const currentUUID = $.get(uuid);

		untrack(() => {
			const config = {
				type: currentType,
				macAddress: currentMAC,
				hardwareType: currentHWType,
				timestamp: currentTimestamp,
				enterpriseNumber: currentEnterpriseNumber,
				enterpriseIdentifier: currentEnterpriseIdentifier,
				uuid: currentUUID
			};

			// Check if form is in initial empty state
			const isInitialState = currentType === 'DUID-LLT' && !currentMAC.trim() || currentType === 'DUID-LL' && !currentMAC.trim() || currentType === 'DUID-EN' && !currentEnterpriseNumber && !currentEnterpriseIdentifier.trim() || currentType === 'DUID-UUID' && !currentUUID.trim();

			if (isInitialState) {
				$.set(validationErrors, [], true);
				$.set(result, null);
			} else {
				$.set(validationErrors, validateDUIDConfig(config), true);

				if ($.get(validationErrors).length === 0) {
					try {
						$.set(result, buildDUID(config), true);
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
		title: 'DUID Generator',
		description: 'Generate DHCP Unique Identifier (DUID) for DHCPv6 clients per RFC 8415. Supports DUID-LLT, DUID-EN, DUID-LL, and DUID-UUID types with configuration export.',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_12();
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
			var label = $.child(div_2);
			var node_1 = $.child(label);

			Icon(node_1, { name: 'settings', size: 'sm' });
			$.next();
			$.reset(label);

			var select = $.sibling(label, 2);
			var option = $.child(select);

			option.value = option.__value = 'DUID-LLT';

			var option_1 = $.sibling(option);

			option_1.value = option_1.__value = 'DUID-EN';

			var option_2 = $.sibling(option_1);

			option_2.value = option_2.__value = 'DUID-LL';

			var option_3 = $.sibling(option_2);

			option_3.value = option_3.__value = 'DUID-UUID';
			$.reset(select);
			$.init_select(select);
			$.reset(div_2);

			var node_2 = $.sibling(div_2, 2);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = root();
					var div_3 = $.first_child(fragment_2);
					var label_1 = $.child(div_3);
					var node_3 = $.child(label_1);

					Icon(node_3, { name: 'hash', size: 'sm' });
					$.next();
					$.reset(label_1);

					var input = $.sibling(label_1, 2);

					$.remove_input_defaults(input);
					$.next(2);
					$.reset(div_3);

					var div_4 = $.sibling(div_3, 2);
					var label_2 = $.child(div_4);
					var node_4 = $.child(label_2);

					Icon(node_4, { name: 'cpu', size: 'sm' });
					$.next();
					$.reset(label_2);

					var select_1 = $.sibling(label_2, 2);
					var option_4 = $.child(select_1);
					var option_4_value = {};
					var option_5 = $.sibling(option_4);
					var option_5_value = {};
					var option_6 = $.sibling(option_5);
					var option_6_value = {};
					var option_7 = $.sibling(option_6);
					var option_7_value = {};
					var option_8 = $.sibling(option_7);
					var option_8_value = {};
					var option_9 = $.sibling(option_8);
					var option_9_value = {};
					var option_10 = $.sibling(option_9);
					var option_10_value = {};
					var option_11 = $.sibling(option_10);
					var option_11_value = {};
					var option_12 = $.sibling(option_11);
					var option_12_value = {};
					var option_13 = $.sibling(option_12);
					var option_13_value = {};

					$.reset(select_1);
					$.init_select(select_1);
					$.reset(div_4);

					$.template_effect(() => {
						if (option_4_value !== (option_4_value = HARDWARE_TYPES.ETHERNET)) {
							option_4.value = (option_4.__value = option_4_value) ?? '';
						}

						if (option_5_value !== (option_5_value = HARDWARE_TYPES.EXPERIMENTAL_ETHERNET)) {
							option_5.value = (option_5.__value = option_5_value) ?? '';
						}

						if (option_6_value !== (option_6_value = HARDWARE_TYPES.IEEE_802)) {
							option_6.value = (option_6.__value = option_6_value) ?? '';
						}

						if (option_7_value !== (option_7_value = HARDWARE_TYPES.ARCNET)) {
							option_7.value = (option_7.__value = option_7_value) ?? '';
						}

						if (option_8_value !== (option_8_value = HARDWARE_TYPES.FRAME_RELAY)) {
							option_8.value = (option_8.__value = option_8_value) ?? '';
						}

						if (option_9_value !== (option_9_value = HARDWARE_TYPES.ATM)) {
							option_9.value = (option_9.__value = option_9_value) ?? '';
						}

						if (option_10_value !== (option_10_value = HARDWARE_TYPES.HDLC)) {
							option_10.value = (option_10.__value = option_10_value) ?? '';
						}

						if (option_11_value !== (option_11_value = HARDWARE_TYPES.FIBRE_CHANNEL)) {
							option_11.value = (option_11.__value = option_11_value) ?? '';
						}

						if (option_12_value !== (option_12_value = HARDWARE_TYPES.IEEE_1394)) {
							option_12.value = (option_12.__value = option_12_value) ?? '';
						}

						if (option_13_value !== (option_13_value = HARDWARE_TYPES.INFINIBAND)) {
							option_13.value = (option_13.__value = option_13_value) ?? '';
						}
					});

					$.bind_value(input, () => $.get(macAddress), ($$value) => $.set(macAddress, $$value));
					$.bind_select_value(select_1, () => $.get(hardwareType), ($$value) => $.set(hardwareType, $$value));
					$.append($$anchor, fragment_2);
				};

				$.if(node_2, ($$render) => {
					if ($.get(duidType) === 'DUID-LLT' || $.get(duidType) === 'DUID-LL') $$render(consequent);
				});
			}

			var node_5 = $.sibling(node_2, 2);

			{
				var consequent_1 = ($$anchor) => {
					var div_5 = root_1();
					var label_3 = $.child(div_5);
					var node_6 = $.child(label_3);

					Icon(node_6, { name: 'clock', size: 'sm' });
					$.next();
					$.reset(label_3);

					var div_6 = $.sibling(label_3, 2);
					var input_1 = $.child(div_6);

					$.remove_input_defaults(input_1);

					var button = $.sibling(input_1, 2);
					var node_7 = $.child(button);

					Icon(node_7, { name: 'clock', size: 'sm' });
					$.reset(button);
					$.action(button, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Use current timestamp');

					var button_1 = $.sibling(button, 2);
					var node_8 = $.child(button_1);

					Icon(node_8, { name: 'x', size: 'sm' });
					$.reset(button_1);
					$.action(button_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Clear timestamp');
					$.reset(div_6);

					var small = $.sibling(div_6, 2);
					var text = $.only_child(small);

					$.reset(div_5);
					$.template_effect(($0) => $.set_text(text, `Current: ${$0 ?? ''} seconds since epoch`), [() => calculateDUIDTimestamp()]);
					$.bind_value(input_1, () => $.get(timestamp), ($$value) => $.set(timestamp, $$value));
					$.delegated('click', button, useCurrentTimestamp);
					$.delegated('click', button_1, clearTimestamp);
					$.append($$anchor, div_5);
				};

				$.if(node_5, ($$render) => {
					if ($.get(duidType) === 'DUID-LLT') $$render(consequent_1);
				});
			}

			var node_9 = $.sibling(node_5, 2);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_3 = root_2();
					var div_7 = $.first_child(fragment_3);
					var label_4 = $.child(div_7);
					var node_10 = $.child(label_4);

					Icon(node_10, { name: 'building', size: 'sm' });
					$.next();
					$.reset(label_4);

					var input_2 = $.sibling(label_4, 2);

					$.remove_input_defaults(input_2);
					$.next(2);
					$.reset(div_7);

					var div_8 = $.sibling(div_7, 2);
					var label_5 = $.child(div_8);
					var node_11 = $.child(label_5);

					Icon(node_11, { name: 'key', size: 'sm' });
					$.next();
					$.reset(label_5);

					var input_3 = $.sibling(label_5, 2);

					$.remove_input_defaults(input_3);
					$.next(2);
					$.reset(div_8);
					$.bind_value(input_2, () => $.get(enterpriseNumber), ($$value) => $.set(enterpriseNumber, $$value));
					$.bind_value(input_3, () => $.get(enterpriseIdentifier), ($$value) => $.set(enterpriseIdentifier, $$value));
					$.append($$anchor, fragment_3);
				};

				$.if(node_9, ($$render) => {
					if ($.get(duidType) === 'DUID-EN') $$render(consequent_2);
				});
			}

			var node_12 = $.sibling(node_9, 2);

			{
				var consequent_3 = ($$anchor) => {
					var div_9 = root_3();
					var label_6 = $.child(div_9);
					var node_13 = $.child(label_6);

					Icon(node_13, { name: 'fingerprint', size: 'sm' });
					$.next();
					$.reset(label_6);

					var input_4 = $.sibling(label_6, 2);

					$.remove_input_defaults(input_4);
					$.next(2);
					$.reset(div_9);
					$.bind_value(input_4, () => $.get(uuid), ($$value) => $.set(uuid, $$value));
					$.append($$anchor, div_9);
				};

				$.if(node_12, ($$render) => {
					if ($.get(duidType) === 'DUID-UUID') $$render(consequent_3);
				});
			}

			$.reset(div_1);
			$.reset(div);

			var node_14 = $.sibling(div, 2);

			{
				var consequent_4 = ($$anchor) => {
					var div_10 = root_5();
					var node_15 = $.sibling($.child(div_10), 2);

					$.each(node_15, 17, () => $.get(validationErrors), $.index, ($$anchor, error) => {
						var div_11 = root_4();
						var node_16 = $.child(div_11);

						Icon(node_16, { name: 'alert-triangle', size: 'sm' });

						var text_1 = $.sibling(node_16);

						$.reset(div_11);
						$.template_effect(() => $.set_text(text_1, ` ${$.get(error) ?? ''}`));
						$.append($$anchor, div_11);
					});

					$.reset(div_10);
					$.append($$anchor, div_10);
				};

				$.if(node_14, ($$render) => {
					if ($.get(validationErrors).length > 0) $$render(consequent_4);
				});
			}

			var node_17 = $.sibling(node_14, 2);

			{
				var consequent_9 = ($$anchor) => {
					var fragment_4 = root_11();
					var div_12 = $.first_child(fragment_4);
					var div_13 = $.sibling($.child(div_12), 2);
					var div_14 = $.child(div_13);
					var text_2 = $.sibling($.child(div_14));

					$.reset(div_14);

					var div_15 = $.sibling(div_14, 2);
					var text_3 = $.sibling($.child(div_15));

					$.reset(div_15);
					$.reset(div_13);

					var div_16 = $.sibling(div_13, 2);
					var div_17 = $.child(div_16);
					var button_2 = $.sibling($.child(div_17), 2);
					let classes;
					var node_18 = $.child(button_2);

					{
						let $0 = $.derived(() => clipboard.isCopied('hex') ? 'check' : 'copy');

						Icon(node_18, {
							get name() {
								return $.get($0);
							},
							size: 'xs'
						});
					}

					var text_4 = $.sibling(node_18);

					$.reset(button_2);
					$.reset(div_17);

					var pre = $.sibling(div_17, 2);
					var text_5 = $.only_child(pre, true);

					$.reset(div_16);

					var div_18 = $.sibling(div_16, 2);
					var div_19 = $.child(div_18);
					var button_3 = $.sibling($.child(div_19), 2);
					let classes_1;
					var node_19 = $.child(button_3);

					{
						let $0 = $.derived(() => clipboard.isCopied('wire') ? 'check' : 'copy');

						Icon(node_19, {
							get name() {
								return $.get($0);
							},
							size: 'xs'
						});
					}

					var text_6 = $.sibling(node_19);

					$.reset(button_3);
					$.reset(div_19);

					var pre_1 = $.sibling(div_19, 2);
					var text_7 = $.only_child(pre_1, true);

					$.reset(div_18);

					var node_20 = $.sibling(div_18, 2);

					{
						var consequent_6 = ($$anchor) => {
							var div_20 = root_8();
							var node_21 = $.sibling($.child(div_20), 2);

							$.each(node_21, 17, () => $.get(result).breakdown, $.index, ($$anchor, item) => {
								var div_21 = root_7();
								var div_22 = $.child(div_21);
								var text_8 = $.only_child(div_22, true);
								var div_23 = $.sibling(div_22, 2);
								var code = $.child(div_23);
								var text_9 = $.only_child(code, true);
								var node_22 = $.sibling(code, 2);

								{
									var consequent_5 = ($$anchor) => {
										var small_1 = root_6();
										var text_10 = $.only_child(small_1, true);

										$.template_effect(() => $.set_text(text_10, $.get(item).description));
										$.append($$anchor, small_1);
									};

									$.if(node_22, ($$render) => {
										if ($.get(item).description) $$render(consequent_5);
									});
								}

								$.reset(div_23);
								$.reset(div_21);

								$.template_effect(() => {
									$.set_text(text_8, $.get(item).field);
									$.set_text(text_9, $.get(item).hex);
								});

								$.append($$anchor, div_21);
							});

							$.reset(div_20);
							$.append($$anchor, div_20);
						};

						$.if(node_20, ($$render) => {
							if ($.get(result).breakdown && $.get(result).breakdown.length > 0) $$render(consequent_6);
						});
					}

					$.reset(div_12);

					var node_23 = $.sibling(div_12, 2);

					{
						var consequent_7 = ($$anchor) => {
							var div_24 = root_9();
							var div_25 = $.sibling($.child(div_24), 2);
							var div_26 = $.child(div_25);
							var button_4 = $.child(div_26);
							let classes_2;
							var node_24 = $.child(button_4);

							{
								let $0 = $.derived(() => clipboard.isCopied('kea') ? 'check' : 'copy');

								Icon(node_24, {
									get name() {
										return $.get($0);
									},
									size: 'xs'
								});
							}

							var text_11 = $.sibling(node_24);

							$.reset(button_4);
							$.reset(div_26);

							var pre_2 = $.sibling(div_26, 2);
							var text_12 = $.only_child(pre_2, true);

							$.reset(div_25);
							$.reset(div_24);

							$.template_effect(
								($0, $1) => {
									classes_2 = $.set_class(button_4, 1, 'copy-btn svelte-1ybr557', null, classes_2, { copied: $0 });
									$.set_text(text_11, ` ${$1 ?? ''}`);
									$.set_text(text_12, $.get(result).examples.keaDhcp6);
								},
								[
									() => clipboard.isCopied('kea'),
									() => clipboard.isCopied('kea') ? 'Copied' : 'Copy'
								]
							);

							$.delegated('click', button_4, () => clipboard.copy($.get(result).examples.keaDhcp6, 'kea'));
							$.append($$anchor, div_24);
						};

						$.if(node_23, ($$render) => {
							if ($.get(result).examples.keaDhcp6) $$render(consequent_7);
						});
					}

					var node_25 = $.sibling(node_23, 2);

					{
						var consequent_8 = ($$anchor) => {
							var div_27 = root_10();
							var div_28 = $.sibling($.child(div_27), 2);
							var div_29 = $.child(div_28);
							var button_5 = $.child(div_29);
							let classes_3;
							var node_26 = $.child(button_5);

							{
								let $0 = $.derived(() => clipboard.isCopied('isc') ? 'check' : 'copy');

								Icon(node_26, {
									get name() {
										return $.get($0);
									},
									size: 'xs'
								});
							}

							var text_13 = $.sibling(node_26);

							$.reset(button_5);
							$.reset(div_29);

							var pre_3 = $.sibling(div_29, 2);
							var text_14 = $.only_child(pre_3, true);

							$.reset(div_28);
							$.reset(div_27);

							$.template_effect(
								($0, $1) => {
									classes_3 = $.set_class(button_5, 1, 'copy-btn svelte-1ybr557', null, classes_3, { copied: $0 });
									$.set_text(text_13, ` ${$1 ?? ''}`);
									$.set_text(text_14, $.get(result).examples.iscDhcpd);
								},
								[
									() => clipboard.isCopied('isc'),
									() => clipboard.isCopied('isc') ? 'Copied' : 'Copy'
								]
							);

							$.delegated('click', button_5, () => clipboard.copy($.get(result).examples.iscDhcpd, 'isc'));
							$.append($$anchor, div_27);
						};

						$.if(node_25, ($$render) => {
							if ($.get(result).examples.iscDhcpd) $$render(consequent_8);
						});
					}

					$.template_effect(
						($0, $1, $2, $3) => {
							$.set_text(text_2, ` ${$.get(result).type ?? ''} (Type ${$.get(result).typeCode ?? ''})`);
							$.set_text(text_3, ` ${$.get(result).totalLength ?? ''} bytes`);
							classes = $.set_class(button_2, 1, 'copy-btn svelte-1ybr557', null, classes, { copied: $0 });
							$.set_text(text_4, ` ${$1 ?? ''}`);
							$.set_text(text_5, $.get(result).hexEncoded);
							classes_1 = $.set_class(button_3, 1, 'copy-btn svelte-1ybr557', null, classes_1, { copied: $2 });
							$.set_text(text_6, ` ${$3 ?? ''}`);
							$.set_text(text_7, $.get(result).wireFormat);
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
					$.append($$anchor, fragment_4);
				};

				$.if(node_17, ($$render) => {
					if ($.get(result) && $.get(validationErrors).length === 0) $$render(consequent_9);
				});
			}

			$.bind_select_value(select, () => $.get(duidType), ($$value) => $.set(duidType, $$value));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);