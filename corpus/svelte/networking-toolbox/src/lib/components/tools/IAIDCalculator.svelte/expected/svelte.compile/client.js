import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	validateIAIDConfig,
	calculateIAID,
	IAID_EXAMPLES,
	INTERFACE_NAMING_GUIDE
} from '$lib/utils/dhcp-iaid-calculator';

import { untrack } from 'svelte';
import Icon from '$lib/components/global/Icon.svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import { useClipboard } from '$lib/composables';

var root = $.from_html(`<div class="input-group svelte-1htabut"><label for="interface-index" class="svelte-1htabut"><!> Interface Index</label> <input id="interface-index" type="number" placeholder="e.g., 2 for eth0, 3 for wlan0" min="0" max="4294967295" class="svelte-1htabut"/> <small class="svelte-1htabut">Network interface index (0-4294967295)</small></div>`);
var root_1 = $.from_html(`<div class="input-group svelte-1htabut"><label for="interface-name" class="svelte-1htabut"><!> Interface Name</label> <input id="interface-name" type="text" placeholder="e.g., eth0, wlan0, enp3s0" class="svelte-1htabut"/> <small class="svelte-1htabut">Network interface name (will be hashed to generate IAID)</small></div>`);
var root_2 = $.from_html(`<div class="input-group svelte-1htabut"><label for="mac-address" class="svelte-1htabut"><!> MAC Address</label> <input id="mac-address" type="text" placeholder="00:0c:29:4f:a3:d2" class="svelte-1htabut"/> <small class="svelte-1htabut">Hardware address (last 4 bytes used for IAID)</small></div>`);
var root_3 = $.from_html(`<div class="input-group svelte-1htabut"><label for="custom-value" class="svelte-1htabut"><!> Custom IAID Value</label> <input id="custom-value" type="number" placeholder="Enter value between 0 and 4294967295" min="0" max="4294967295" class="svelte-1htabut"/> <small class="svelte-1htabut">32-bit unsigned integer (0-4294967295)</small></div>`);
var root_4 = $.from_html(`<div class="error-message svelte-1htabut"><!> </div>`);
var root_5 = $.from_html(`<div class="card errors-card svelte-1htabut"><h3 class="svelte-1htabut">Validation Errors</h3> <!></div>`);
var root_6 = $.from_html(`<div class="warning-card svelte-1htabut"><!> </div>`);
var root_7 = $.from_html(`<div class="os-item svelte-1htabut"><div class="os-label svelte-1htabut"><!> <strong class="svelte-1htabut"> </strong></div> <div class="os-description svelte-1htabut"> </div></div>`);
var root_8 = $.from_html(`<div class="card results svelte-1htabut"><div class="card-header-with-action svelte-1htabut"><h3 class="svelte-1htabut"> </h3> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-1htabut"> </pre></div>`);
var root_9 = $.from_html(`<div class="card results svelte-1htabut"><h3 class="svelte-1htabut">Calculated IAID</h3> <div class="summary-card svelte-1htabut"><div class="svelte-1htabut"><strong class="svelte-1htabut">Method:</strong> </div> <div class="svelte-1htabut"><strong class="svelte-1htabut">IAID:</strong> </div></div> <!> <div class="output-group svelte-1htabut"><div class="output-header svelte-1htabut"><h4 class="svelte-1htabut">Hexadecimal</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-1htabut"> </pre></div> <div class="output-group svelte-1htabut"><div class="output-header svelte-1htabut"><h4 class="svelte-1htabut">Decimal</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-1htabut"> </pre></div> <div class="output-group svelte-1htabut"><div class="output-header svelte-1htabut"><h4 class="svelte-1htabut">Binary</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-1htabut"> </pre></div></div> <div class="card results svelte-1htabut"><h3 class="svelte-1htabut">OS-Specific Conventions</h3> <p class="help-text">How different operating systems typically generate IAIDs</p> <div class="os-conventions svelte-1htabut"></div></div> <!>`, 1);
var root_10 = $.from_html(`<div class="naming-item svelte-1htabut"><code class="naming-pattern svelte-1htabut"> </code> <span class="naming-description svelte-1htabut"> </span></div>`);
var root_11 = $.from_html(`<div class="naming-os svelte-1htabut"><div class="naming-os-header svelte-1htabut"><!> <strong class="svelte-1htabut"> </strong></div> <div class="naming-conventions svelte-1htabut"></div></div>`);
var root_12 = $.from_html(`<!> <div class="card input-card svelte-1htabut"><div class="card-header svelte-1htabut"><h3 class="svelte-1htabut">IAID Configuration</h3> <p class="help-text svelte-1htabut">Select method to generate Identity Association Identifier</p></div> <div class="card-content svelte-1htabut"><div class="input-group svelte-1htabut"><label for="method" class="svelte-1htabut"><!> Generation Method</label> <select id="method" class="svelte-1htabut"><option>Interface Index</option><option>Interface Name (hash)</option><option>MAC Address (hash)</option><option>Custom Value</option></select></div> <!> <!> <!> <!></div></div> <!> <!> <div class="card naming-guide-wrap svelte-1htabut"><h3 class="svelte-1htabut">Network Interface Naming Guide</h3> <p class="help-text">Common interface naming conventions across different operating systems</p> <div class="naming-guide svelte-1htabut"></div></div>`, 1);

export default function IAIDCalculator($$anchor, $$props) {
	$.push($$props, true);

	let method = $.state('interface-index');
	let interfaceIndex = $.state(undefined);
	let interfaceName = $.state('');
	let macAddress = $.state('');
	let customValue = $.state(undefined);
	let validationErrors = $.state($.proxy([]));
	let result = $.state(null);
	let selectedExampleIndex = $.state(null);
	const clipboard = useClipboard();
	const examples = IAID_EXAMPLES.map((ex) => ({ label: ex.name, config: ex, description: ex.description }));

	function loadExample(example, index) {
		const cfg = example.config;

		$.set(method, cfg.method, true);
		$.set(interfaceIndex, cfg.interfaceIndex, true);
		$.set(interfaceName, cfg.interfaceName || '', true);
		$.set(macAddress, cfg.macAddress || '', true);
		$.set(customValue, cfg.customValue, true);
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
		const matches = $.get(method) === cfg.method && $.get(interfaceIndex) === cfg.interfaceIndex && $.get(interfaceName) === (cfg.interfaceName || '') && $.get(macAddress) === (cfg.macAddress || '') && $.get(customValue) === cfg.customValue;

		if (!matches) {
			$.set(selectedExampleIndex, null);
		}
	}

	$.user_effect(() => {
		const currentMethod = $.get(method);
		const currentInterfaceIndex = $.get(interfaceIndex);
		const currentInterfaceName = $.get(interfaceName);
		const currentMACAddress = $.get(macAddress);
		const currentCustomValue = $.get(customValue);

		untrack(() => {
			const config = {
				method: currentMethod,
				interfaceIndex: currentInterfaceIndex,
				interfaceName: currentInterfaceName,
				macAddress: currentMACAddress,
				customValue: currentCustomValue
			};

			const isInitialState = currentMethod === 'interface-index' && currentInterfaceIndex === undefined || currentMethod === 'interface-name' && !currentInterfaceName.trim() || currentMethod === 'mac-address' && !currentMACAddress.trim() || currentMethod === 'custom' && currentCustomValue === undefined;

			if (isInitialState) {
				$.set(validationErrors, [], true);
				$.set(result, null);
			} else {
				$.set(validationErrors, validateIAIDConfig(config), true);

				if ($.get(validationErrors).length === 0) {
					try {
						$.set(result, calculateIAID(config), true);
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
		title: 'IAID Calculator',
		description: 'Calculate Identity Association Identifier (IAID) for DHCPv6 interfaces. Generate IAIDs from interface index, name, MAC address, or custom values with OS-specific conventions.',
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

			option.value = option.__value = 'interface-index';

			var option_1 = $.sibling(option);

			option_1.value = option_1.__value = 'interface-name';

			var option_2 = $.sibling(option_1);

			option_2.value = option_2.__value = 'mac-address';

			var option_3 = $.sibling(option_2);

			option_3.value = option_3.__value = 'custom';
			$.reset(select);
			$.init_select(select);
			$.reset(div_2);

			var node_2 = $.sibling(div_2, 2);

			{
				var consequent = ($$anchor) => {
					var div_3 = root();
					var label_1 = $.child(div_3);
					var node_3 = $.child(label_1);

					Icon(node_3, { name: 'hash', size: 'sm' });
					$.next();
					$.reset(label_1);

					var input = $.sibling(label_1, 2);

					$.remove_input_defaults(input);
					$.next(2);
					$.reset(div_3);
					$.bind_value(input, () => $.get(interfaceIndex), ($$value) => $.set(interfaceIndex, $$value));
					$.append($$anchor, div_3);
				};

				$.if(node_2, ($$render) => {
					if ($.get(method) === 'interface-index') $$render(consequent);
				});
			}

			var node_4 = $.sibling(node_2, 2);

			{
				var consequent_1 = ($$anchor) => {
					var div_4 = root_1();
					var label_2 = $.child(div_4);
					var node_5 = $.child(label_2);

					Icon(node_5, { name: 'network', size: 'sm' });
					$.next();
					$.reset(label_2);

					var input_1 = $.sibling(label_2, 2);

					$.remove_input_defaults(input_1);
					$.next(2);
					$.reset(div_4);
					$.bind_value(input_1, () => $.get(interfaceName), ($$value) => $.set(interfaceName, $$value));
					$.append($$anchor, div_4);
				};

				$.if(node_4, ($$render) => {
					if ($.get(method) === 'interface-name') $$render(consequent_1);
				});
			}

			var node_6 = $.sibling(node_4, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_5 = root_2();
					var label_3 = $.child(div_5);
					var node_7 = $.child(label_3);

					Icon(node_7, { name: 'cpu', size: 'sm' });
					$.next();
					$.reset(label_3);

					var input_2 = $.sibling(label_3, 2);

					$.remove_input_defaults(input_2);
					$.next(2);
					$.reset(div_5);
					$.bind_value(input_2, () => $.get(macAddress), ($$value) => $.set(macAddress, $$value));
					$.append($$anchor, div_5);
				};

				$.if(node_6, ($$render) => {
					if ($.get(method) === 'mac-address') $$render(consequent_2);
				});
			}

			var node_8 = $.sibling(node_6, 2);

			{
				var consequent_3 = ($$anchor) => {
					var div_6 = root_3();
					var label_4 = $.child(div_6);
					var node_9 = $.child(label_4);

					Icon(node_9, { name: 'edit', size: 'sm' });
					$.next();
					$.reset(label_4);

					var input_3 = $.sibling(label_4, 2);

					$.remove_input_defaults(input_3);
					$.next(2);
					$.reset(div_6);
					$.bind_value(input_3, () => $.get(customValue), ($$value) => $.set(customValue, $$value));
					$.append($$anchor, div_6);
				};

				$.if(node_8, ($$render) => {
					if ($.get(method) === 'custom') $$render(consequent_3);
				});
			}

			$.reset(div_1);
			$.reset(div);

			var node_10 = $.sibling(div, 2);

			{
				var consequent_4 = ($$anchor) => {
					var div_7 = root_5();
					var node_11 = $.sibling($.child(div_7), 2);

					$.each(node_11, 17, () => $.get(validationErrors), $.index, ($$anchor, error) => {
						var div_8 = root_4();
						var node_12 = $.child(div_8);

						Icon(node_12, { name: 'alert-triangle', size: 'sm' });

						var text = $.sibling(node_12);

						$.reset(div_8);
						$.template_effect(() => $.set_text(text, ` ${$.get(error) ?? ''}`));
						$.append($$anchor, div_8);
					});

					$.reset(div_7);
					$.append($$anchor, div_7);
				};

				$.if(node_10, ($$render) => {
					if ($.get(validationErrors).length > 0) $$render(consequent_4);
				});
			}

			var node_13 = $.sibling(node_10, 2);

			{
				var consequent_8 = ($$anchor) => {
					var fragment_2 = root_9();
					var div_9 = $.first_child(fragment_2);
					var div_10 = $.sibling($.child(div_9), 2);
					var div_11 = $.child(div_10);
					var text_1 = $.sibling($.child(div_11));

					$.reset(div_11);

					var div_12 = $.sibling(div_11, 2);
					var text_2 = $.sibling($.child(div_12));

					$.reset(div_12);
					$.reset(div_10);

					var node_14 = $.sibling(div_10, 2);

					{
						var consequent_5 = ($$anchor) => {
							var div_13 = root_6();
							var node_15 = $.child(div_13);

							Icon(node_15, { name: 'alert-triangle', size: 'sm' });

							var text_3 = $.sibling(node_15);

							$.reset(div_13);
							$.template_effect(() => $.set_text(text_3, ` ${$.get(result).collisionWarning ?? ''}`));
							$.append($$anchor, div_13);
						};

						$.if(node_14, ($$render) => {
							if ($.get(result).collisionWarning) $$render(consequent_5);
						});
					}

					var div_14 = $.sibling(node_14, 2);
					var div_15 = $.child(div_14);
					var button = $.sibling($.child(div_15), 2);
					let classes;
					var node_16 = $.child(button);

					{
						let $0 = $.derived(() => clipboard.isCopied('hex') ? 'check' : 'copy');

						Icon(node_16, {
							get name() {
								return $.get($0);
							},
							size: 'xs'
						});
					}

					var text_4 = $.sibling(node_16);

					$.reset(button);
					$.reset(div_15);

					var pre = $.sibling(div_15, 2);
					var text_5 = $.only_child(pre, true);

					$.reset(div_14);

					var div_16 = $.sibling(div_14, 2);
					var div_17 = $.child(div_16);
					var button_1 = $.sibling($.child(div_17), 2);
					let classes_1;
					var node_17 = $.child(button_1);

					{
						let $0 = $.derived(() => clipboard.isCopied('decimal') ? 'check' : 'copy');

						Icon(node_17, {
							get name() {
								return $.get($0);
							},
							size: 'xs'
						});
					}

					var text_6 = $.sibling(node_17);

					$.reset(button_1);
					$.reset(div_17);

					var pre_1 = $.sibling(div_17, 2);
					var text_7 = $.only_child(pre_1, true);

					$.reset(div_16);

					var div_18 = $.sibling(div_16, 2);
					var div_19 = $.child(div_18);
					var button_2 = $.sibling($.child(div_19), 2);
					let classes_2;
					var node_18 = $.child(button_2);

					{
						let $0 = $.derived(() => clipboard.isCopied('binary') ? 'check' : 'copy');

						Icon(node_18, {
							get name() {
								return $.get($0);
							},
							size: 'xs'
						});
					}

					var text_8 = $.sibling(node_18);

					$.reset(button_2);
					$.reset(div_19);

					var pre_2 = $.sibling(div_19, 2);
					var text_9 = $.only_child(pre_2, true);

					$.reset(div_18);
					$.reset(div_9);

					var div_20 = $.sibling(div_9, 2);
					var div_21 = $.sibling($.child(div_20), 4);

					$.each(
						div_21,
						21,
						() => [
							{
								icon: 'linux',
								name: 'Linux',
								text: $.get(result).osConventions.linux
							},

							{
								icon: 'windows',
								name: 'Windows',
								text: $.get(result).osConventions.windows
							},

							{
								icon: 'mac',
								name: 'macOS',
								text: $.get(result).osConventions.macos
							},

							{
								icon: 'bsd',
								name: 'FreeBSD',
								text: $.get(result).osConventions.freebsd
							}
						],
						(os) => os.name,
						($$anchor, os) => {
							var fragment_3 = $.comment();
							var node_19 = $.first_child(fragment_3);

							{
								var consequent_6 = ($$anchor) => {
									var div_22 = root_7();
									var div_23 = $.child(div_22);
									var node_20 = $.child(div_23);

									Icon(node_20, {
										get name() {
											return $.get(os).icon;
										},
										size: 'sm'
									});

									var strong = $.sibling(node_20, 2);
									var text_10 = $.only_child(strong, true);

									$.reset(div_23);

									var div_24 = $.sibling(div_23, 2);
									var text_11 = $.only_child(div_24, true);

									$.reset(div_22);

									$.template_effect(() => {
										$.set_text(text_10, $.get(os).name);
										$.set_text(text_11, $.get(os).text);
									});

									$.append($$anchor, div_22);
								};

								$.if(node_19, ($$render) => {
									if ($.get(os).text) $$render(consequent_6);
								});
							}

							$.append($$anchor, fragment_3);
						}
					);

					$.reset(div_21);
					$.reset(div_20);

					var node_21 = $.sibling(div_20, 2);

					$.each(
						node_21,
						17,
						() => [
							{
								title: 'Kea DHCPv6 Configuration',
								content: $.get(result)?.configExamples?.keaDhcp6,
								key: 'kea'
							},

							{
								title: 'ISC DHCPd Configuration',
								content: $.get(result)?.configExamples?.iscDhcpd,
								key: 'isc'
							}
						],
						(config) => config.key,
						($$anchor, config) => {
							var fragment_4 = $.comment();
							var node_22 = $.first_child(fragment_4);

							{
								var consequent_7 = ($$anchor) => {
									var div_25 = root_8();
									var div_26 = $.child(div_25);
									var h3 = $.child(div_26);
									var text_12 = $.only_child(h3, true);
									var button_3 = $.sibling(h3, 2);
									let classes_3;
									var node_23 = $.child(button_3);

									{
										let $0 = $.derived(() => clipboard.isCopied($.get(config).key) ? 'check' : 'copy');

										Icon(node_23, {
											get name() {
												return $.get($0);
											},
											size: 'xs'
										});
									}

									var text_13 = $.sibling(node_23);

									$.reset(button_3);
									$.reset(div_26);

									var pre_3 = $.sibling(div_26, 2);
									var text_14 = $.only_child(pre_3, true);

									$.reset(div_25);

									$.template_effect(
										($0, $1) => {
											$.set_text(text_12, $.get(config).title);
											classes_3 = $.set_class(button_3, 1, 'copy-btn svelte-1htabut', null, classes_3, { copied: $0 });
											$.set_text(text_13, ` ${$1 ?? ''}`);
											$.set_text(text_14, $.get(config).content);
										},
										[
											() => clipboard.isCopied($.get(config).key),
											() => clipboard.isCopied($.get(config).key) ? 'Copied' : 'Copy'
										]
									);

									$.delegated('click', button_3, () => clipboard.copy($.get(config).content, $.get(config).key));
									$.append($$anchor, div_25);
								};

								$.if(node_22, ($$render) => {
									if ($.get(config).content) $$render(consequent_7);
								});
							}

							$.append($$anchor, fragment_4);
						}
					);

					$.template_effect(
						($0, $1, $2, $3, $4, $5) => {
							$.set_text(text_1, ` ${$.get(result).method ?? ''}`);
							$.set_text(text_2, ` ${$.get(result).iaid ?? ''}`);
							classes = $.set_class(button, 1, 'copy-btn svelte-1htabut', null, classes, { copied: $0 });
							$.set_text(text_4, ` ${$1 ?? ''}`);
							$.set_text(text_5, $.get(result).hex);
							classes_1 = $.set_class(button_1, 1, 'copy-btn svelte-1htabut', null, classes_1, { copied: $2 });
							$.set_text(text_6, ` ${$3 ?? ''}`);
							$.set_text(text_7, $.get(result).decimal);
							classes_2 = $.set_class(button_2, 1, 'copy-btn svelte-1htabut', null, classes_2, { copied: $4 });
							$.set_text(text_8, ` ${$5 ?? ''}`);
							$.set_text(text_9, $.get(result).binary);
						},
						[
							() => clipboard.isCopied('hex'),
							() => clipboard.isCopied('hex') ? 'Copied' : 'Copy',
							() => clipboard.isCopied('decimal'),
							() => clipboard.isCopied('decimal') ? 'Copied' : 'Copy',
							() => clipboard.isCopied('binary'),
							() => clipboard.isCopied('binary') ? 'Copied' : 'Copy'
						]
					);

					$.delegated('click', button, () => clipboard.copy($.get(result).hex, 'hex'));
					$.delegated('click', button_1, () => clipboard.copy($.get(result).decimal, 'decimal'));
					$.delegated('click', button_2, () => clipboard.copy($.get(result).binary, 'binary'));
					$.append($$anchor, fragment_2);
				};

				$.if(node_13, ($$render) => {
					if ($.get(result) && $.get(validationErrors).length === 0) $$render(consequent_8);
				});
			}

			var div_27 = $.sibling(node_13, 2);
			var div_28 = $.sibling($.child(div_27), 4);

			$.each(
				div_28,
				21,
				() => [
					{ icon: 'linux', data: INTERFACE_NAMING_GUIDE.linux },
					{ icon: 'windows', data: INTERFACE_NAMING_GUIDE.windows },
					{ icon: 'mac', data: INTERFACE_NAMING_GUIDE.macos },
					{ icon: 'bsd', data: INTERFACE_NAMING_GUIDE.freebsd }
				],
				(osGuide) => osGuide.data.title,
				($$anchor, osGuide) => {
					var div_29 = root_11();
					var div_30 = $.child(div_29);
					var node_24 = $.child(div_30);

					Icon(node_24, {
						get name() {
							return $.get(osGuide).icon;
						},
						size: 'sm'
					});

					var strong_1 = $.sibling(node_24, 2);
					var text_15 = $.only_child(strong_1, true);

					$.reset(div_30);

					var div_31 = $.sibling(div_30, 2);

					$.each(div_31, 21, () => $.get(osGuide).data.conventions, (convention) => convention.pattern, ($$anchor, convention) => {
						var div_32 = root_10();
						var code = $.child(div_32);
						var text_16 = $.only_child(code, true);
						var span = $.sibling(code, 2);
						var text_17 = $.only_child(span, true);

						$.reset(div_32);

						$.template_effect(() => {
							$.set_text(text_16, $.get(convention).pattern);
							$.set_text(text_17, $.get(convention).description);
						});

						$.append($$anchor, div_32);
					});

					$.reset(div_31);
					$.reset(div_29);
					$.template_effect(() => $.set_text(text_15, $.get(osGuide).data.title));
					$.append($$anchor, div_29);
				}
			);

			$.reset(div_28);
			$.reset(div_27);
			$.bind_select_value(select, () => $.get(method), ($$value) => $.set(method, $$value));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);