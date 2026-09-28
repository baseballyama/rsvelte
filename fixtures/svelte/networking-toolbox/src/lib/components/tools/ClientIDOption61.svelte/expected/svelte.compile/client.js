import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<div class="input-group svelte-1mudz6i"><label for="hardware-type" class="svelte-1mudz6i"><!> Hardware Type</label> <select id="hardware-type" class="svelte-1mudz6i"><option>Ethernet (1)</option><option>Experimental Ethernet (2)</option><option>IEEE 802 (6)</option><option>ARCNET (7)</option><option>Frame Relay (15)</option><option>ATM (16)</option><option>HDLC (17)</option><option>Fibre Channel (18)</option><option>IEEE 1394 (24)</option><option>InfiniBand (32)</option></select></div> <div class="input-group svelte-1mudz6i"><label for="mac-address" class="svelte-1mudz6i"><!> MAC Address</label> <input id="mac-address" type="text" placeholder="00:0c:29:4f:a3:d2" class="svelte-1mudz6i"/> <small class="svelte-1mudz6i">Hardware address in any common format</small></div>`, 1);
var root_1 = $.from_html(`<div class="input-group svelte-1mudz6i"><label for="opaque-format" class="svelte-1mudz6i"><!> Data Format</label> <select id="opaque-format" class="svelte-1mudz6i"><option>Text (ASCII)</option><option>Hexadecimal</option></select></div> <div class="input-group svelte-1mudz6i"><label for="opaque-data" class="svelte-1mudz6i"><!> </label> <input id="opaque-data" type="text" class="svelte-1mudz6i"/> <small class="svelte-1mudz6i"> </small></div>`, 1);
var root_2 = $.from_html(`<div class="card input-card svelte-1mudz6i"><div class="card-header svelte-1mudz6i"><h3 class="svelte-1mudz6i">Build Client Identifier</h3> <p class="help-text svelte-1mudz6i">Configure DHCPv4 Client Identifier for device identification</p></div> <div class="card-content svelte-1mudz6i"><div class="input-group svelte-1mudz6i"><label for="mode" class="svelte-1mudz6i"><!> Mode</label> <select id="mode" class="svelte-1mudz6i"><option>Hardware Type + MAC Address</option><option>Opaque Data (Text or Hex)</option></select></div> <!> <!></div></div>`);
var root_3 = $.from_html(`<div class="card input-card svelte-1mudz6i"><div class="card-header svelte-1mudz6i"><h3 class="svelte-1mudz6i">Decode Client Identifier</h3> <p class="help-text svelte-1mudz6i">Decode hex-encoded Client Identifier back to fields</p></div> <div class="card-content svelte-1mudz6i"><div class="input-group svelte-1mudz6i"><label for="decode-hex" class="svelte-1mudz6i"><!> Hex Data</label> <input id="decode-hex" type="text" placeholder="01000c294fa3d2" class="svelte-1mudz6i"/> <small class="svelte-1mudz6i">Paste hex-encoded Client Identifier to decode</small></div></div></div>`);
var root_4 = $.from_html(`<div class="error-message svelte-1mudz6i"><!> </div>`);
var root_5 = $.from_html(`<div class="card errors-card svelte-1mudz6i"><h3 class="svelte-1mudz6i">Validation Errors</h3> <!></div>`);
var root_6 = $.from_html(`<div class="output-group svelte-1mudz6i"><div class="output-header svelte-1mudz6i"><h4 class="svelte-1mudz6i"> </h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-1mudz6i"> </pre></div>`);
var root_7 = $.from_html(`<small class="svelte-1mudz6i"> </small>`);
var root_8 = $.from_html(`<div class="breakdown-item svelte-1mudz6i"><div class="breakdown-label svelte-1mudz6i"> </div> <div class="breakdown-value svelte-1mudz6i"><code class="svelte-1mudz6i"> </code> <!></div></div>`);
var root_9 = $.from_html(`<div class="breakdown-section svelte-1mudz6i"><h4 class="svelte-1mudz6i">Breakdown</h4> <!></div>`);
var root_10 = $.from_html(`<div class="card results svelte-1mudz6i"><div class="card-header-with-action svelte-1mudz6i"><h3 class="svelte-1mudz6i"> </h3> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-1mudz6i"> </pre></div>`);
var root_11 = $.from_html(`<div class="card results svelte-1mudz6i"><h3 class="svelte-1mudz6i">Generated Client Identifier</h3> <div class="summary-card svelte-1mudz6i"><div class="svelte-1mudz6i"><strong class="svelte-1mudz6i">Mode:</strong> </div> <div class="svelte-1mudz6i"><strong class="svelte-1mudz6i">Length:</strong> </div></div> <!> <!></div> <!>`, 1);
var root_12 = $.from_html(`<div class="decoded-field svelte-1mudz6i"><div class="field-label svelte-1mudz6i">Hardware Type</div> <div class="field-value svelte-1mudz6i"> </div></div>`);
var root_13 = $.from_html(`<div class="decoded-field svelte-1mudz6i"><div class="field-label svelte-1mudz6i">MAC Address</div> <div class="field-value svelte-1mudz6i"><code class="svelte-1mudz6i"> </code> <button type="button" class="copy-btn-small svelte-1mudz6i"><!></button></div></div>`);
var root_14 = $.from_html(`<div class="decoded-field svelte-1mudz6i"><div class="field-label svelte-1mudz6i">Opaque Data</div> <div class="field-value svelte-1mudz6i"><code class="svelte-1mudz6i"> </code> <button type="button" class="copy-btn-small svelte-1mudz6i"><!></button></div></div>`);
var root_15 = $.from_html(`<div class="decoded-fields svelte-1mudz6i"><!> <!> <!></div>`);
var root_16 = $.from_html(`<div class="card results svelte-1mudz6i"><h3 class="svelte-1mudz6i">Decoded Client Identifier</h3> <div class="summary-card svelte-1mudz6i"><div class="svelte-1mudz6i"><strong class="svelte-1mudz6i">Detected Mode:</strong> </div> <div class="svelte-1mudz6i"><strong class="svelte-1mudz6i">Length:</strong> </div></div> <!> <!></div>`);
var root_17 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function ClientIDOption61($$anchor, $$props) {
	$.push($$props, true);

	let activeTab = $.state('build');

	const navOptions = [
		{ value: 'build', label: 'Build', icon: 'settings' },
		{ value: 'decode', label: 'Decode', icon: 'code' }
	];

	let mode = $.state('hardware');
	let hardwareType = $.state($.proxy(HARDWARE_TYPES.ETHERNET));
	let macAddress = $.state('');
	let opaqueData = $.state('');
	let opaqueFormat = $.state('text');
	let decodeHex = $.state('');
	let validationErrors = $.state($.proxy([]));
	let buildResult = $.state(null);
	let decodeResult = $.state(null);
	let selectedExampleIndex = $.state(null);
	const clipboard = useClipboard();
	const buildExamples = CLIENTID_BUILD_EXAMPLES.map((ex) => ({ label: ex.name, config: ex, description: ex.description }));

	const decodeExamples = CLIENTID_DECODE_EXAMPLES.map((ex) => ({
		label: ex.name,
		hexData: ex.hexData,
		description: ex.description
	}));

	function loadBuildExample(example, index) {
		const cfg = example.config;

		$.set(mode, cfg.mode, true);
		$.set(hardwareType, cfg.hardwareType ?? HARDWARE_TYPES.ETHERNET, true);
		$.set(macAddress, cfg.macAddress || '', true);
		$.set(opaqueData, cfg.opaqueData || '', true);
		$.set(opaqueFormat, cfg.opaqueFormat || 'text', true);
		$.set(selectedExampleIndex, index, true);
	}

	function loadDecodeExample(example, index) {
		$.set(decodeHex, example.hexData, true);
		$.set(selectedExampleIndex, index, true);
	}

	function checkIfExampleStillMatches() {
		if ($.get(selectedExampleIndex) === null) return;

		if ($.get(activeTab) === 'build') {
			const example = buildExamples[$.get(selectedExampleIndex)];

			if (!example) {
				$.set(selectedExampleIndex, null);

				return;
			}

			const cfg = example.config;
			const matches = $.get(mode) === cfg.mode && $.get(hardwareType) === (cfg.hardwareType ?? HARDWARE_TYPES.ETHERNET) && $.get(macAddress) === (cfg.macAddress || '') && $.get(opaqueData) === (cfg.opaqueData || '') && $.get(opaqueFormat) === (cfg.opaqueFormat || 'text');

			if (!matches) $.set(selectedExampleIndex, null);
		} else {
			const example = decodeExamples[$.get(selectedExampleIndex)];

			if (!example || $.get(decodeHex) !== example.hexData) {
				$.set(selectedExampleIndex, null);
			}
		}
	}

	$.user_effect(() => {
		const currentTab = $.get(activeTab);

		$.set(selectedExampleIndex, null // Reset selection on tab change
		);

		if (currentTab === 'build') {
			const currentMode = $.get(mode);
			const currentHWType = $.get(hardwareType);
			const currentMAC = $.get(macAddress);
			const currentOpaque = $.get(opaqueData);
			const currentFormat = $.get(opaqueFormat);

			untrack(() => {
				const config = {
					mode: currentMode,
					hardwareType: currentHWType,
					macAddress: currentMAC,
					opaqueData: currentOpaque,
					opaqueFormat: currentFormat
				};

				const isInitialState = currentMode === 'hardware' && !currentMAC.trim() || currentMode === 'opaque' && !currentOpaque.trim();

				if (isInitialState) {
					$.set(validationErrors, [], true);
					$.set(buildResult, null);
				} else {
					$.set(validationErrors, validateClientIDConfig(config), true);

					if ($.get(validationErrors).length === 0) {
						try {
							$.set(buildResult, buildClientID(config), true);
						} catch(e) {
							$.set(validationErrors, [e instanceof Error ? e.message : String(e)], true);
							$.set(buildResult, null);
						}
					} else {
						$.set(buildResult, null);
					}
				}

				checkIfExampleStillMatches();
			});
		} else {
			const currentDecodeHex = $.get(decodeHex);

			untrack(() => {
				if (!currentDecodeHex.trim()) {
					$.set(validationErrors, [], true);
					$.set(decodeResult, null);
				} else {
					try {
						const config = { hexData: currentDecodeHex };

						$.set(decodeResult, decodeClientID(config), true);
						$.set(validationErrors, [], true);
					} catch(e) {
						$.set(validationErrors, [e instanceof Error ? e.message : String(e)], true);
						$.set(decodeResult, null);
					}
				}

				$.set(selectedExampleIndex, null);
			});
		}
	});

	ToolContentContainer($$anchor, {
		title: 'DHCPv4 Client Identifier (Option 61)',
		description: 'Build and decode DHCPv4 Client Identifier (Option 61) with hardware type + MAC address or arbitrary opaque data per RFC 2132.',
		get navOptions() {
			return navOptions;
		},

		get selectedNav() {
			return $.get(activeTab);
		},

		set selectedNav($$value) {
			$.set(activeTab, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_17();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					ExamplesCard($$anchor, {
						get examples() {
							return buildExamples;
						},
						onSelect: loadBuildExample,
						getLabel: (ex) => ex.label,
						getDescription: (ex) => ex.description,
						get selectedIndex() {
							return $.get(selectedExampleIndex);
						}
					});
				};

				var alternate = ($$anchor) => {
					ExamplesCard($$anchor, {
						get examples() {
							return decodeExamples;
						},
						onSelect: loadDecodeExample,
						getLabel: (ex) => ex.label,
						getDescription: (ex) => ex.description,
						get selectedIndex() {
							return $.get(selectedExampleIndex);
						}
					});
				};

				$.if(node, ($$render) => {
					if ($.get(activeTab) === 'build') $$render(consequent); else $$render(alternate, -1);
				});
			}

			var node_1 = $.sibling(node, 2);

			{
				var consequent_3 = ($$anchor) => {
					var div = root_2();
					var div_1 = $.sibling($.child(div), 2);
					var div_2 = $.child(div_1);
					var label = $.child(div_2);
					var node_2 = $.child(label);

					Icon(node_2, { name: 'settings', size: 'sm' });
					$.next();
					$.reset(label);

					var select = $.sibling(label, 2);
					var option = $.child(select);

					option.value = option.__value = 'hardware';

					var option_1 = $.sibling(option);

					option_1.value = option_1.__value = 'opaque';
					$.reset(select);
					$.init_select(select);
					$.reset(div_2);

					var node_3 = $.sibling(div_2, 2);

					{
						var consequent_1 = ($$anchor) => {
							var fragment_4 = root();
							var div_3 = $.first_child(fragment_4);
							var label_1 = $.child(div_3);
							var node_4 = $.child(label_1);

							Icon(node_4, { name: 'cpu', size: 'sm' });
							$.next();
							$.reset(label_1);

							var select_1 = $.sibling(label_1, 2);
							var option_2 = $.child(select_1);
							var option_2_value = {};
							var option_3 = $.sibling(option_2);
							var option_3_value = {};
							var option_4 = $.sibling(option_3);
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

							$.reset(select_1);
							$.init_select(select_1);
							$.reset(div_3);

							var div_4 = $.sibling(div_3, 2);
							var label_2 = $.child(div_4);
							var node_5 = $.child(label_2);

							Icon(node_5, { name: 'hash', size: 'sm' });
							$.next();
							$.reset(label_2);

							var input = $.sibling(label_2, 2);

							$.remove_input_defaults(input);
							$.next(2);
							$.reset(div_4);

							$.template_effect(() => {
								if (option_2_value !== (option_2_value = HARDWARE_TYPES.ETHERNET)) {
									option_2.value = (option_2.__value = option_2_value) ?? '';
								}

								if (option_3_value !== (option_3_value = HARDWARE_TYPES.EXPERIMENTAL_ETHERNET)) {
									option_3.value = (option_3.__value = option_3_value) ?? '';
								}

								if (option_4_value !== (option_4_value = HARDWARE_TYPES.IEEE_802)) {
									option_4.value = (option_4.__value = option_4_value) ?? '';
								}

								if (option_5_value !== (option_5_value = HARDWARE_TYPES.ARCNET)) {
									option_5.value = (option_5.__value = option_5_value) ?? '';
								}

								if (option_6_value !== (option_6_value = HARDWARE_TYPES.FRAME_RELAY)) {
									option_6.value = (option_6.__value = option_6_value) ?? '';
								}

								if (option_7_value !== (option_7_value = HARDWARE_TYPES.ATM)) {
									option_7.value = (option_7.__value = option_7_value) ?? '';
								}

								if (option_8_value !== (option_8_value = HARDWARE_TYPES.HDLC)) {
									option_8.value = (option_8.__value = option_8_value) ?? '';
								}

								if (option_9_value !== (option_9_value = HARDWARE_TYPES.FIBRE_CHANNEL)) {
									option_9.value = (option_9.__value = option_9_value) ?? '';
								}

								if (option_10_value !== (option_10_value = HARDWARE_TYPES.IEEE_1394)) {
									option_10.value = (option_10.__value = option_10_value) ?? '';
								}

								if (option_11_value !== (option_11_value = HARDWARE_TYPES.INFINIBAND)) {
									option_11.value = (option_11.__value = option_11_value) ?? '';
								}
							});

							$.bind_select_value(select_1, () => $.get(hardwareType), ($$value) => $.set(hardwareType, $$value));
							$.bind_value(input, () => $.get(macAddress), ($$value) => $.set(macAddress, $$value));
							$.append($$anchor, fragment_4);
						};

						$.if(node_3, ($$render) => {
							if ($.get(mode) === 'hardware') $$render(consequent_1);
						});
					}

					var node_6 = $.sibling(node_3, 2);

					{
						var consequent_2 = ($$anchor) => {
							var fragment_5 = root_1();
							var div_5 = $.first_child(fragment_5);
							var label_3 = $.child(div_5);
							var node_7 = $.child(label_3);

							Icon(node_7, { name: 'code', size: 'sm' });
							$.next();
							$.reset(label_3);

							var select_2 = $.sibling(label_3, 2);
							var option_12 = $.child(select_2);

							option_12.value = option_12.__value = 'text';

							var option_13 = $.sibling(option_12);

							option_13.value = option_13.__value = 'hex';
							$.reset(select_2);
							$.init_select(select_2);
							$.reset(div_5);

							var div_6 = $.sibling(div_5, 2);
							var label_4 = $.child(div_6);
							var node_8 = $.child(label_4);

							Icon(node_8, { name: 'edit', size: 'sm' });

							var text = $.sibling(node_8);

							$.reset(label_4);

							var input_1 = $.sibling(label_4, 2);

							$.remove_input_defaults(input_1);

							var small = $.sibling(input_1, 2);
							var text_1 = $.only_child(small, true);

							$.reset(div_6);

							$.template_effect(() => {
								$.set_text(text, ` ${$.get(opaqueFormat) === 'hex' ? 'Hex Data' : 'Text Data'}`);
								$.set_attribute(input_1, 'placeholder', $.get(opaqueFormat) === 'hex' ? '0123456789abcdef' : 'client-device-001');

								$.set_text(text_1, $.get(opaqueFormat) === 'hex'
									? 'Hexadecimal string (even length)'
									: 'Plain text identifier');
							});

							$.bind_select_value(select_2, () => $.get(opaqueFormat), ($$value) => $.set(opaqueFormat, $$value));
							$.bind_value(input_1, () => $.get(opaqueData), ($$value) => $.set(opaqueData, $$value));
							$.append($$anchor, fragment_5);
						};

						$.if(node_6, ($$render) => {
							if ($.get(mode) === 'opaque') $$render(consequent_2);
						});
					}

					$.reset(div_1);
					$.reset(div);
					$.bind_select_value(select, () => $.get(mode), ($$value) => $.set(mode, $$value));
					$.append($$anchor, div);
				};

				var alternate_1 = ($$anchor) => {
					var div_7 = root_3();
					var div_8 = $.sibling($.child(div_7), 2);
					var div_9 = $.child(div_8);
					var label_5 = $.child(div_9);
					var node_9 = $.child(label_5);

					Icon(node_9, { name: 'code', size: 'sm' });
					$.next();
					$.reset(label_5);

					var input_2 = $.sibling(label_5, 2);

					$.remove_input_defaults(input_2);
					$.next(2);
					$.reset(div_9);
					$.reset(div_8);
					$.reset(div_7);
					$.bind_value(input_2, () => $.get(decodeHex), ($$value) => $.set(decodeHex, $$value));
					$.append($$anchor, div_7);
				};

				$.if(node_1, ($$render) => {
					if ($.get(activeTab) === 'build') $$render(consequent_3); else $$render(alternate_1, -1);
				});
			}

			var node_10 = $.sibling(node_1, 2);

			{
				var consequent_4 = ($$anchor) => {
					var div_10 = root_5();
					var node_11 = $.sibling($.child(div_10), 2);

					$.each(node_11, 17, () => $.get(validationErrors), $.index, ($$anchor, error) => {
						var div_11 = root_4();
						var node_12 = $.child(div_11);

						Icon(node_12, { name: 'alert-triangle', size: 'sm' });

						var text_2 = $.sibling(node_12);

						$.reset(div_11);
						$.template_effect(() => $.set_text(text_2, ` ${$.get(error) ?? ''}`));
						$.append($$anchor, div_11);
					});

					$.reset(div_10);
					$.append($$anchor, div_10);
				};

				$.if(node_10, ($$render) => {
					if ($.get(validationErrors).length > 0) $$render(consequent_4);
				});
			}

			var node_13 = $.sibling(node_10, 2);

			{
				var consequent_8 = ($$anchor) => {
					var fragment_6 = root_11();
					var div_12 = $.first_child(fragment_6);
					var div_13 = $.sibling($.child(div_12), 2);
					var div_14 = $.child(div_13);
					var text_3 = $.sibling($.child(div_14));

					$.reset(div_14);

					var div_15 = $.sibling(div_14, 2);
					var text_4 = $.sibling($.child(div_15));

					$.reset(div_15);
					$.reset(div_13);

					var node_14 = $.sibling(div_13, 2);

					$.each(
						node_14,
						17,
						() => [
							{
								title: 'Hexadecimal',
								content: $.get(buildResult).hex,
								key: 'hex'
							},

							{
								title: 'Wire Format (Spaced)',
								content: $.get(buildResult).wireFormat,
								key: 'wire'
							}
						],
						(output) => output.key,
						($$anchor, output) => {
							var div_16 = root_6();
							var div_17 = $.child(div_16);
							var h4 = $.child(div_17);
							var text_5 = $.only_child(h4, true);
							var button = $.sibling(h4, 2);
							let classes;
							var node_15 = $.child(button);

							{
								let $0 = $.derived(() => clipboard.isCopied($.get(output).key) ? 'check' : 'copy');

								Icon(node_15, {
									get name() {
										return $.get($0);
									},
									size: 'xs'
								});
							}

							var text_6 = $.sibling(node_15);

							$.reset(button);
							$.reset(div_17);

							var pre = $.sibling(div_17, 2);
							var text_7 = $.only_child(pre, true);

							$.reset(div_16);

							$.template_effect(
								($0, $1) => {
									$.set_text(text_5, $.get(output).title);
									classes = $.set_class(button, 1, 'copy-btn svelte-1mudz6i', null, classes, { copied: $0 });
									$.set_text(text_6, ` ${$1 ?? ''}`);
									$.set_text(text_7, $.get(output).content);
								},
								[
									() => clipboard.isCopied($.get(output).key),
									() => clipboard.isCopied($.get(output).key) ? 'Copied' : 'Copy'
								]
							);

							$.delegated('click', button, () => clipboard.copy($.get(output).content, $.get(output).key));
							$.append($$anchor, div_16);
						}
					);

					var node_16 = $.sibling(node_14, 2);

					{
						var consequent_6 = ($$anchor) => {
							var div_18 = root_9();
							var node_17 = $.sibling($.child(div_18), 2);

							$.each(node_17, 17, () => $.get(buildResult).breakdown, $.index, ($$anchor, item) => {
								var div_19 = root_8();
								var div_20 = $.child(div_19);
								var text_8 = $.only_child(div_20, true);
								var div_21 = $.sibling(div_20, 2);
								var code = $.child(div_21);
								var text_9 = $.only_child(code, true);
								var node_18 = $.sibling(code, 2);

								{
									var consequent_5 = ($$anchor) => {
										var small_1 = root_7();
										var text_10 = $.only_child(small_1, true);

										$.template_effect(() => $.set_text(text_10, $.get(item).description));
										$.append($$anchor, small_1);
									};

									$.if(node_18, ($$render) => {
										if ($.get(item).description) $$render(consequent_5);
									});
								}

								$.reset(div_21);
								$.reset(div_19);

								$.template_effect(() => {
									$.set_text(text_8, $.get(item).field);
									$.set_text(text_9, $.get(item).hex);
								});

								$.append($$anchor, div_19);
							});

							$.reset(div_18);
							$.append($$anchor, div_18);
						};

						$.if(node_16, ($$render) => {
							if ($.get(buildResult).breakdown && $.get(buildResult).breakdown.length > 0) $$render(consequent_6);
						});
					}

					$.reset(div_12);

					var node_19 = $.sibling(div_12, 2);

					$.each(
						node_19,
						17,
						() => [
							{
								title: 'ISC DHCPd Configuration',
								content: $.get(buildResult).configExamples?.iscDhcpd,
								key: 'isc'
							},

							{
								title: 'Kea DHCPv4 Configuration',
								content: $.get(buildResult).configExamples?.keaDhcp4,
								key: 'kea'
							}
						],
						(config) => config.key,
						($$anchor, config) => {
							var fragment_7 = $.comment();
							var node_20 = $.first_child(fragment_7);

							{
								var consequent_7 = ($$anchor) => {
									var div_22 = root_10();
									var div_23 = $.child(div_22);
									var h3 = $.child(div_23);
									var text_11 = $.only_child(h3, true);
									var button_1 = $.sibling(h3, 2);
									let classes_1;
									var node_21 = $.child(button_1);

									{
										let $0 = $.derived(() => clipboard.isCopied($.get(config).key) ? 'check' : 'copy');

										Icon(node_21, {
											get name() {
												return $.get($0);
											},
											size: 'xs'
										});
									}

									var text_12 = $.sibling(node_21);

									$.reset(button_1);
									$.reset(div_23);

									var pre_1 = $.sibling(div_23, 2);
									var text_13 = $.only_child(pre_1, true);

									$.reset(div_22);

									$.template_effect(
										($0, $1) => {
											$.set_text(text_11, $.get(config).title);
											classes_1 = $.set_class(button_1, 1, 'copy-btn svelte-1mudz6i', null, classes_1, { copied: $0 });
											$.set_text(text_12, ` ${$1 ?? ''}`);
											$.set_text(text_13, $.get(config).content);
										},
										[
											() => clipboard.isCopied($.get(config).key),
											() => clipboard.isCopied($.get(config).key) ? 'Copied' : 'Copy'
										]
									);

									$.delegated('click', button_1, () => clipboard.copy($.get(config).content, $.get(config).key));
									$.append($$anchor, div_22);
								};

								$.if(node_20, ($$render) => {
									if ($.get(config).content) $$render(consequent_7);
								});
							}

							$.append($$anchor, fragment_7);
						}
					);

					$.template_effect(() => {
						$.set_text(text_3, ` ${$.get(buildResult).mode === 'hardware' ? 'Hardware Type + MAC' : 'Opaque Data'}`);
						$.set_text(text_4, ` ${$.get(buildResult).length ?? ''} bytes`);
					});

					$.append($$anchor, fragment_6);
				};

				$.if(node_13, ($$render) => {
					if ($.get(activeTab) === 'build' && $.get(buildResult) && $.get(validationErrors).length === 0) $$render(consequent_8);
				});
			}

			var node_22 = $.sibling(node_13, 2);

			{
				var consequent_15 = ($$anchor) => {
					var div_24 = root_16();
					var div_25 = $.sibling($.child(div_24), 2);
					var div_26 = $.child(div_25);
					var text_14 = $.sibling($.child(div_26));

					$.reset(div_26);

					var div_27 = $.sibling(div_26, 2);
					var text_15 = $.sibling($.child(div_27));

					$.reset(div_27);
					$.reset(div_25);

					var node_23 = $.sibling(div_25, 2);

					{
						var consequent_12 = ($$anchor) => {
							var div_28 = root_15();
							var node_24 = $.child(div_28);

							{
								var consequent_9 = ($$anchor) => {
									var div_29 = root_12();
									var div_30 = $.sibling($.child(div_29), 2);
									var text_16 = $.only_child(div_30);

									$.reset(div_29);
									$.template_effect(() => $.set_text(text_16, `${$.get(decodeResult).decoded.hardwareType ?? ''} (${($.get(decodeResult).decoded.hardwareTypeName || 'Unknown') ?? ''})`));
									$.append($$anchor, div_29);
								};

								$.if(node_24, ($$render) => {
									if ($.get(decodeResult).decoded.hardwareType !== undefined) $$render(consequent_9);
								});
							}

							var node_25 = $.sibling(node_24, 2);

							{
								var consequent_10 = ($$anchor) => {
									var div_31 = root_13();
									var div_32 = $.sibling($.child(div_31), 2);
									var code_1 = $.child(div_32);
									var text_17 = $.only_child(code_1, true);
									var button_2 = $.sibling(code_1, 2);
									var node_26 = $.child(button_2);

									{
										let $0 = $.derived(() => clipboard.isCopied('mac') ? 'check' : 'copy');

										Icon(node_26, {
											get name() {
												return $.get($0);
											},
											size: 'xs'
										});
									}

									$.reset(button_2);
									$.reset(div_32);
									$.reset(div_31);
									$.template_effect(() => $.set_text(text_17, $.get(decodeResult).decoded.macAddress));
									$.delegated('click', button_2, () => clipboard.copy($.get(decodeResult).decoded.macAddress, 'mac'));
									$.append($$anchor, div_31);
								};

								$.if(node_25, ($$render) => {
									if ($.get(decodeResult).decoded.macAddress) $$render(consequent_10);
								});
							}

							var node_27 = $.sibling(node_25, 2);

							{
								var consequent_11 = ($$anchor) => {
									var div_33 = root_14();
									var div_34 = $.sibling($.child(div_33), 2);
									var code_2 = $.child(div_34);
									var text_18 = $.only_child(code_2, true);
									var button_3 = $.sibling(code_2, 2);
									var node_28 = $.child(button_3);

									{
										let $0 = $.derived(() => clipboard.isCopied('opaque') ? 'check' : 'copy');

										Icon(node_28, {
											get name() {
												return $.get($0);
											},
											size: 'xs'
										});
									}

									$.reset(button_3);
									$.reset(div_34);
									$.reset(div_33);
									$.template_effect(() => $.set_text(text_18, $.get(decodeResult).decoded.opaqueData));
									$.delegated('click', button_3, () => clipboard.copy($.get(decodeResult).decoded.opaqueData, 'opaque'));
									$.append($$anchor, div_33);
								};

								$.if(node_27, ($$render) => {
									if ($.get(decodeResult).decoded.opaqueData) $$render(consequent_11);
								});
							}

							$.reset(div_28);
							$.append($$anchor, div_28);
						};

						$.if(node_23, ($$render) => {
							if ($.get(decodeResult).decoded) $$render(consequent_12);
						});
					}

					var node_29 = $.sibling(node_23, 2);

					{
						var consequent_14 = ($$anchor) => {
							var div_35 = root_9();
							var node_30 = $.sibling($.child(div_35), 2);

							$.each(node_30, 17, () => $.get(decodeResult).breakdown, $.index, ($$anchor, item) => {
								var div_36 = root_8();
								var div_37 = $.child(div_36);
								var text_19 = $.only_child(div_37, true);
								var div_38 = $.sibling(div_37, 2);
								var code_3 = $.child(div_38);
								var text_20 = $.only_child(code_3, true);
								var node_31 = $.sibling(code_3, 2);

								{
									var consequent_13 = ($$anchor) => {
										var small_2 = root_7();
										var text_21 = $.only_child(small_2, true);

										$.template_effect(() => $.set_text(text_21, $.get(item).description));
										$.append($$anchor, small_2);
									};

									$.if(node_31, ($$render) => {
										if ($.get(item).description) $$render(consequent_13);
									});
								}

								$.reset(div_38);
								$.reset(div_36);

								$.template_effect(() => {
									$.set_text(text_19, $.get(item).field);
									$.set_text(text_20, $.get(item).hex);
								});

								$.append($$anchor, div_36);
							});

							$.reset(div_35);
							$.append($$anchor, div_35);
						};

						$.if(node_29, ($$render) => {
							if ($.get(decodeResult).breakdown && $.get(decodeResult).breakdown.length > 0) $$render(consequent_14);
						});
					}

					$.reset(div_24);

					$.template_effect(() => {
						$.set_text(text_14, ` ${$.get(decodeResult).mode === 'hardware' ? 'Hardware Type + MAC' : 'Opaque Data'}`);
						$.set_text(text_15, ` ${$.get(decodeResult).length ?? ''} bytes`);
					});

					$.append($$anchor, div_24);
				};

				$.if(node_22, ($$render) => {
					if ($.get(activeTab) === 'decode' && $.get(decodeResult) && $.get(validationErrors).length === 0) $$render(consequent_15);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);