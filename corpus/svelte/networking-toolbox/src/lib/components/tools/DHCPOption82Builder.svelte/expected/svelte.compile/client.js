import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { untrack } from 'svelte';
import Icon from '$lib/components/global/Icon.svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import { useClipboard } from '$lib/composables';
import { buildOption82, parseOption82, getDefaultOption82Config } from '$lib/utils/dhcp-option82.js';

var root = $.from_html(`<button type="button" class="btn-icon svelte-18sbsfb"><!></button>`);
var root_1 = $.from_html(`<option> </option>`);
var root_2 = $.from_html(`<div class="suboption-group svelte-18sbsfb"><div class="suboption-header svelte-18sbsfb"><h4 class="svelte-18sbsfb"> </h4> <!></div> <div class="input-row svelte-18sbsfb"><div class="input-group svelte-18sbsfb"><label class="svelte-18sbsfb"><!> Suboption Type</label> <select class="svelte-18sbsfb"><option>Circuit-ID (Suboption 1)</option><option>Remote-ID (Suboption 2)</option></select></div> <div class="input-group svelte-18sbsfb"><label class="svelte-18sbsfb"><!> Encoding Format</label> <select class="svelte-18sbsfb"></select></div></div> <div class="input-group svelte-18sbsfb"><label class="svelte-18sbsfb"><!> Value</label> <input type="text" class="svelte-18sbsfb"/></div></div>`);
var root_3 = $.from_html(`<div class="error-message svelte-18sbsfb"><!> </div>`);
var root_4 = $.from_html(`<div class="card errors-card svelte-18sbsfb"><h3 class="svelte-18sbsfb">Validation Errors</h3> <!></div>`);
var root_5 = $.from_html(`<div class="breakdown-item svelte-18sbsfb"><div class="breakdown-header svelte-18sbsfb"><strong class="svelte-18sbsfb"> </strong> <span class="breakdown-length svelte-18sbsfb"> </span></div> <p class="breakdown-desc svelte-18sbsfb"> </p> <div class="breakdown-values svelte-18sbsfb"><div class="svelte-18sbsfb"><strong class="svelte-18sbsfb">Value:</strong> </div> <div class="svelte-18sbsfb"><strong class="svelte-18sbsfb">Hex:</strong> </div></div></div>`);
var root_6 = $.from_html(`<div class="output-group svelte-18sbsfb"><div class="output-header svelte-18sbsfb"><h4 class="svelte-18sbsfb">ISC dhcpd Configuration Example</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-18sbsfb"> </pre></div>`);
var root_7 = $.from_html(`<div class="output-group svelte-18sbsfb"><div class="output-header svelte-18sbsfb"><h4 class="svelte-18sbsfb">Kea DHCPv4 Configuration Example</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-18sbsfb"> </pre></div>`);
var root_8 = $.from_html(`<div class="output-group svelte-18sbsfb"><div class="output-header svelte-18sbsfb"><h4 class="svelte-18sbsfb">Cisco Relay Agent Example</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-18sbsfb"> </pre></div>`);
var root_9 = $.from_html(`<div class="card results svelte-18sbsfb"><h3 class="svelte-18sbsfb">Generated Option 82</h3> <div class="output-group svelte-18sbsfb"><div class="output-header svelte-18sbsfb"><h4 class="svelte-18sbsfb">Hex-Encoded Value</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-18sbsfb"> </pre></div> <div class="breakdown-section svelte-18sbsfb"><h4 class="svelte-18sbsfb">Breakdown</h4> <!></div> <!> <!> <!></div>`);
var root_10 = $.from_html(`<div class="card input-card svelte-18sbsfb"><div class="card-header svelte-18sbsfb"><h3 class="svelte-18sbsfb">Configuration</h3></div> <div class="card-content svelte-18sbsfb"><!> <button type="button" class="btn-add svelte-18sbsfb"><!> Add Suboption</button></div></div> <!> <!>`, 1);
var root_11 = $.from_html(`<div class="breakdown-item svelte-18sbsfb"><div class="breakdown-header svelte-18sbsfb"><strong class="svelte-18sbsfb"> </strong> <span class="breakdown-length svelte-18sbsfb"> </span></div> <p class="breakdown-desc svelte-18sbsfb"> </p> <div class="breakdown-values svelte-18sbsfb"><div class="svelte-18sbsfb"><strong class="svelte-18sbsfb">Decoded Value:</strong> </div> <div class="svelte-18sbsfb"><strong class="svelte-18sbsfb">Hex Value:</strong> </div></div></div>`);
var root_12 = $.from_html(`<div class="card results svelte-18sbsfb"><h3 class="svelte-18sbsfb">Parsed Option 82</h3> <div class="parse-summary svelte-18sbsfb"><div class="svelte-18sbsfb"><strong class="svelte-18sbsfb">Total Length:</strong> </div> <div class="svelte-18sbsfb"><strong class="svelte-18sbsfb">Suboptions Found:</strong> </div></div> <div class="breakdown-section svelte-18sbsfb"><h4 class="svelte-18sbsfb">Suboptions</h4> <!></div></div>`);
var root_13 = $.from_html(`<div class="card input-card svelte-18sbsfb"><div class="card-header svelte-18sbsfb"><h3 class="svelte-18sbsfb">Parse Option 82 Hex</h3></div> <div class="card-content svelte-18sbsfb"><div class="input-group svelte-18sbsfb"><label for="parse-input" class="svelte-18sbsfb"><!> Hex-Encoded Option 82</label> <textarea id="parse-input" placeholder="Enter hex string (e.g., 01064769302f31020b7377312e6578616d706c65)" rows="4" class="svelte-18sbsfb"></textarea></div> <button type="button" class="btn-primary svelte-18sbsfb"><!> Parse</button></div></div> <!> <!>`, 1);
var root_14 = $.from_html(`<!> <!>`, 1);

export default function DHCPOption82Builder($$anchor, $$props) {
	$.push($$props, true);

	const modeOptions = [
		{ value: 'build', label: 'Build', icon: 'wrench' },
		{ value: 'parse', label: 'Parse', icon: 'search' }
	];

	let mode = $.state('build');
	let config = $.proxy(getDefaultOption82Config());
	let result = $.state(null);
	let parseInput = $.state('');
	let parseResult = $.state(null);
	let validationErrors = $.state($.proxy([]));
	let selectedExampleIndex = $.state(null);
	const clipboard = useClipboard();

	const formatOptions = [
		{ value: 'ascii', label: 'ASCII Text' },
		{ value: 'hex', label: 'Hexadecimal' },
		{ value: 'vlan-id', label: 'VLAN ID' },
		{ value: 'hostname-port', label: 'Hostname:Port' }
	];

	const buildExamples = [
		{
			label: 'VLAN 100',
			type: 'circuit-id',
			format: 'vlan-id',
			value: '100',
			description: 'Circuit-ID as VLAN ID 100'
		},

		{
			label: 'Switch Port',
			type: 'circuit-id',
			format: 'hostname-port',
			value: 'sw1:Gi0/1',
			description: 'Circuit-ID as hostname:port'
		},

		{
			label: 'Custom Circuit',
			type: 'circuit-id',
			format: 'ascii',
			value: 'building-a-floor-3',
			description: 'Circuit-ID as custom ASCII text'
		},

		{
			label: 'Switch Hostname',
			type: 'remote-id',
			format: 'ascii',
			value: 'relay-sw1.example.com',
			description: 'Remote-ID as hostname'
		},

		{
			label: 'MAC Address',
			type: 'remote-id',
			format: 'hex',
			value: '001122334455',
			description: 'Remote-ID as MAC address'
		},

		{
			label: 'Agent ID',
			type: 'remote-id',
			format: 'ascii',
			value: 'DHCP-RELAY-01',
			description: 'Remote-ID as relay agent identifier'
		}
	];

	const parseExamples = [
		{
			label: 'VLAN + Hostname',
			hexInput: '01020064020c7377312e6578616d706c65',
			description: 'Circuit-ID (VLAN 100) + Remote-ID (sw1.example)'
		},

		{
			label: 'Switch Port',
			hexInput: '01094769302f31020c7377312e6578616d706c65',
			description: 'Circuit-ID (Gi0/1) + Remote-ID (sw1.example)'
		},

		{
			label: 'MAC Address',
			hexInput: '0206001122334455',
			description: 'Remote-ID as MAC address (00:11:22:33:44:55)'
		}
	];

	// Reactive generation - use untrack to prevent infinite loop
	$.user_effect(() => {
		if ($.get(mode) === 'build') {
			// Read config to track it
			const currentConfig = config;

			// Untrack writes to prevent infinite loop
			untrack(() => {
				validateAndGenerate(currentConfig);
				checkIfExampleStillMatches();
			});
		} else {
			// Track parseInput changes in parse mode
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			$.get(parseInput);

			untrack(() => {
				checkIfExampleStillMatches();
			});
		}
	});

	// Clear selected example when switching modes
	$.user_effect(() => {
		// Track mode to trigger effect
		void $.get(mode);

		untrack(() => {
			$.set(selectedExampleIndex, null);
		});
	});

	function validateAndGenerate(cfg = config) {
		const errors = [];

		// Validate suboptions
		for (let i = 0; i < cfg.suboptions.length; i++) {
			const sub = cfg.suboptions[i];

			if (!sub.value.trim()) {
				errors.push(`Suboption ${i + 1}: Value is required`);

				continue;
			}

			if (sub.format === 'vlan-id') {
				const vlan = parseInt(sub.value, 10);

				if (isNaN(vlan) || vlan < 0 || vlan > 4095) {
					errors.push(`Suboption ${i + 1}: VLAN ID must be between 0 and 4095`);
				}
			}

			if (sub.format === 'hex') {
				if (!(/^[0-9a-fA-F:]+$/).test(sub.value.replace(/\s/g, ''))) {
					errors.push(`Suboption ${i + 1}: Invalid hex format`);
				}
			}
		}

		$.set(validationErrors, errors, true);

		if (errors.length === 0) {
			$.set(result, buildOption82(cfg), true);
		} else {
			$.set(result, null);
		}
	}

	function parse() {
		if (!$.get(parseInput).trim()) {
			$.set(parseResult, null);
			$.set(validationErrors, [], true);

			return;
		}

		if (!(/^[0-9a-fA-F\s:]+$/).test($.get(parseInput))) {
			$.set(validationErrors, ['Invalid hex input: only hexadecimal characters allowed'], true);
			$.set(parseResult, null);

			return;
		}

		$.set(validationErrors, [], true);
		$.set(parseResult, parseOption82($.get(parseInput)), true);
	}

	function addSuboption() {
		config.suboptions = [
			...config.suboptions,
			{ type: 'circuit-id', format: 'ascii', value: '' }
		];
	}

	function removeSuboption(index) {
		if (config.suboptions.length > 1) {
			config.suboptions = config.suboptions.filter((_, i) => i !== index);
		}
	}

	function loadBuildExample(example, index) {
		config.suboptions = [
			{
				type: example.type,
				format: example.format,
				value: example.value
			}
		];

		$.set(selectedExampleIndex, index, true);
	}

	function loadParseExample(example, index) {
		$.set(parseInput, example.hexInput, true);
		$.set(selectedExampleIndex, index, true);
		parse();
	}

	function checkIfExampleStillMatches() {
		if ($.get(selectedExampleIndex) === null) return;

		if ($.get(mode) === 'build') {
			const example = buildExamples[$.get(selectedExampleIndex)];

			if (!example) {
				$.set(selectedExampleIndex, null);

				return;
			}

			// Check if current config matches the selected example
			const matches = config.suboptions.length === 1 && config.suboptions[0].type === example.type && config.suboptions[0].format === example.format && config.suboptions[0].value === example.value;

			if (!matches) {
				$.set(selectedExampleIndex, null);
			}
		} else {
			const example = parseExamples[$.get(selectedExampleIndex)];

			if (!example) {
				$.set(selectedExampleIndex, null);

				return;
			}

			// Check if parse input matches the selected example
			if ($.get(parseInput) !== example.hexInput) {
				$.set(selectedExampleIndex, null);
			}
		}
	}

	ToolContentContainer($$anchor, {
		title: 'DHCP Option 82 Builder',
		description: 'Construct and parse DHCP Relay Agent Information (Option 82) with Circuit-ID, Remote-ID, and VLAN formats. Includes examples for relay ACLs and policies.',
		get navOptions() {
			return modeOptions;
		},

		get selectedNav() {
			return $.get(mode);
		},

		set selectedNav($$value) {
			$.set(mode, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_14();
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
							return parseExamples;
						},
						onSelect: loadParseExample,
						getLabel: (ex) => ex.label,
						getDescription: (ex) => ex.description,
						get selectedIndex() {
							return $.get(selectedExampleIndex);
						}
					});
				};

				$.if(node, ($$render) => {
					if ($.get(mode) === 'build') $$render(consequent); else $$render(alternate, -1);
				});
			}

			var node_1 = $.sibling(node, 2);

			{
				var consequent_7 = ($$anchor) => {
					var fragment_4 = root_10();
					var div = $.first_child(fragment_4);
					var div_1 = $.sibling($.child(div), 2);
					var node_2 = $.child(div_1);

					$.each(node_2, 19, () => config.suboptions, (suboption, i) => `sub-${i}-${suboption.type}`, ($$anchor, suboption, i) => {
						var div_2 = root_2();
						var div_3 = $.child(div_2);
						var h4 = $.child(div_3);
						var text = $.only_child(h4);
						var node_3 = $.sibling(h4, 2);

						{
							var consequent_1 = ($$anchor) => {
								var button = root();
								var node_4 = $.child(button);

								Icon(node_4, { name: 'x', size: 'sm' });
								$.reset(button);
								$.delegated('click', button, () => removeSuboption($.get(i)));
								$.append($$anchor, button);
							};

							$.if(node_3, ($$render) => {
								if (config.suboptions.length > 1) $$render(consequent_1);
							});
						}

						$.reset(div_3);

						var div_4 = $.sibling(div_3, 2);
						var div_5 = $.child(div_4);
						var label = $.child(div_5);
						var node_5 = $.child(label);

						Icon(node_5, { name: 'tag', size: 'sm' });
						$.next();
						$.reset(label);

						var select = $.sibling(label, 2);
						var option_1 = $.child(select);

						option_1.value = option_1.__value = 'circuit-id';

						var option_2 = $.sibling(option_1);

						option_2.value = option_2.__value = 'remote-id';
						$.reset(select);
						$.init_select(select);
						$.reset(div_5);

						var div_6 = $.sibling(div_5, 2);
						var label_1 = $.child(div_6);
						var node_6 = $.child(label_1);

						Icon(node_6, { name: 'code', size: 'sm' });
						$.next();
						$.reset(label_1);

						var select_1 = $.sibling(label_1, 2);

						$.each(select_1, 21, () => formatOptions, (option) => option.value, ($$anchor, option) => {
							var option_3 = root_1();
							var text_1 = $.only_child(option_3, true);
							var option_3_value = {};

							$.template_effect(() => {
								$.set_text(text_1, $.get(option).label);

								if (option_3_value !== (option_3_value = $.get(option).value)) {
									option_3.value = (option_3.__value = option_3_value) ?? '';
								}
							});

							$.append($$anchor, option_3);
						});

						$.reset(select_1);
						$.init_select(select_1);
						$.reset(div_6);
						$.reset(div_4);

						var div_7 = $.sibling(div_4, 2);
						var label_2 = $.child(div_7);
						var node_7 = $.child(label_2);

						Icon(node_7, { name: 'edit', size: 'sm' });
						$.next();
						$.reset(label_2);

						var input = $.sibling(label_2, 2);

						$.remove_input_defaults(input);
						$.reset(div_7);
						$.reset(div_2);

						$.template_effect(() => {
							$.set_text(text, `Suboption ${$.get(i) + 1}`);
							$.set_attribute(label, 'for', `type-${$.get(i) ?? ''}`);
							$.set_attribute(select, 'id', `type-${$.get(i) ?? ''}`);
							$.set_attribute(label_1, 'for', `format-${$.get(i) ?? ''}`);
							$.set_attribute(select_1, 'id', `format-${$.get(i) ?? ''}`);
							$.set_attribute(label_2, 'for', `value-${$.get(i) ?? ''}`);
							$.set_attribute(input, 'id', `value-${$.get(i) ?? ''}`);

							$.set_attribute(input, 'placeholder', $.get(suboption).format === 'vlan-id'
								? '100'
								: $.get(suboption).format === 'hex' ? '001122334455' : 'Enter value');
						});

						$.bind_select_value(select, () => $.get(suboption).type, ($$value) => ($.get(suboption).type = $$value));
						$.bind_select_value(select_1, () => $.get(suboption).format, ($$value) => ($.get(suboption).format = $$value));
						$.bind_value(input, () => $.get(suboption).value, ($$value) => ($.get(suboption).value = $$value));
						$.append($$anchor, div_2);
					});

					var button_1 = $.sibling(node_2, 2);
					var node_8 = $.child(button_1);

					Icon(node_8, { name: 'plus', size: 'sm' });
					$.next();
					$.reset(button_1);
					$.reset(div_1);
					$.reset(div);

					var node_9 = $.sibling(div, 2);

					{
						var consequent_2 = ($$anchor) => {
							var div_8 = root_4();
							var node_10 = $.sibling($.child(div_8), 2);

							$.each(node_10, 17, () => $.get(validationErrors), $.index, ($$anchor, error) => {
								var div_9 = root_3();
								var node_11 = $.child(div_9);

								Icon(node_11, { name: 'alert-triangle', size: 'sm' });

								var text_2 = $.sibling(node_11);

								$.reset(div_9);
								$.template_effect(() => $.set_text(text_2, ` ${$.get(error) ?? ''}`));
								$.append($$anchor, div_9);
							});

							$.reset(div_8);
							$.append($$anchor, div_8);
						};

						$.if(node_9, ($$render) => {
							if ($.get(validationErrors).length > 0) $$render(consequent_2);
						});
					}

					var node_12 = $.sibling(node_9, 2);

					{
						var consequent_6 = ($$anchor) => {
							var div_10 = root_9();
							var div_11 = $.sibling($.child(div_10), 2);
							var div_12 = $.child(div_11);
							var button_2 = $.sibling($.child(div_12), 2);
							let classes;
							var node_13 = $.child(button_2);

							{
								let $0 = $.derived(() => clipboard.isCopied('hex') ? 'check' : 'copy');

								Icon(node_13, {
									get name() {
										return $.get($0);
									},
									size: 'xs'
								});
							}

							var text_3 = $.sibling(node_13);

							$.reset(button_2);
							$.reset(div_12);

							var pre = $.sibling(div_12, 2);
							var text_4 = $.only_child(pre, true);

							$.reset(div_11);

							var div_13 = $.sibling(div_11, 2);
							var node_14 = $.sibling($.child(div_13), 2);

							$.each(node_14, 17, () => $.get(result).breakdown, $.index, ($$anchor, breakdown) => {
								var div_14 = root_5();
								var div_15 = $.child(div_14);
								var strong = $.child(div_15);
								var text_5 = $.only_child(strong);
								var span = $.sibling(strong, 2);
								var text_6 = $.only_child(span);

								$.reset(div_15);

								var p = $.sibling(div_15, 2);
								var text_7 = $.only_child(p, true);
								var div_16 = $.sibling(p, 2);
								var div_17 = $.child(div_16);
								var text_8 = $.sibling($.child(div_17));

								$.reset(div_17);

								var div_18 = $.sibling(div_17, 2);
								var text_9 = $.sibling($.child(div_18));

								$.reset(div_18);
								$.reset(div_16);
								$.reset(div_14);

								$.template_effect(() => {
									$.set_text(text_5, `${$.get(breakdown).type ?? ''} (Code ${$.get(breakdown).typeCode ?? ''})`);
									$.set_text(text_6, `Length: ${$.get(breakdown).length ?? ''} bytes`);
									$.set_text(text_7, $.get(breakdown).description);
									$.set_text(text_8, ` ${$.get(breakdown).value ?? ''}`);
									$.set_text(text_9, ` ${$.get(breakdown).hexValue ?? ''}`);
								});

								$.append($$anchor, div_14);
							});

							$.reset(div_13);

							var node_15 = $.sibling(div_13, 2);

							{
								var consequent_3 = ($$anchor) => {
									var div_19 = root_6();
									var div_20 = $.child(div_19);
									var button_3 = $.sibling($.child(div_20), 2);
									let classes_1;
									var node_16 = $.child(button_3);

									{
										let $0 = $.derived(() => clipboard.isCopied('isc') ? 'check' : 'copy');

										Icon(node_16, {
											get name() {
												return $.get($0);
											},
											size: 'xs'
										});
									}

									var text_10 = $.sibling(node_16);

									$.reset(button_3);
									$.reset(div_20);

									var pre_1 = $.sibling(div_20, 2);
									var text_11 = $.only_child(pre_1, true);

									$.reset(div_19);

									$.template_effect(
										($0, $1) => {
											classes_1 = $.set_class(button_3, 1, 'copy-btn svelte-18sbsfb', null, classes_1, { copied: $0 });
											$.set_text(text_10, ` ${$1 ?? ''}`);
											$.set_text(text_11, $.get(result).examples.iscDhcpd);
										},
										[
											() => clipboard.isCopied('isc'),
											() => clipboard.isCopied('isc') ? 'Copied' : 'Copy'
										]
									);

									$.delegated('click', button_3, () => clipboard.copy($.get(result).examples.iscDhcpd, 'isc'));
									$.append($$anchor, div_19);
								};

								$.if(node_15, ($$render) => {
									if ($.get(result).examples.iscDhcpd) $$render(consequent_3);
								});
							}

							var node_17 = $.sibling(node_15, 2);

							{
								var consequent_4 = ($$anchor) => {
									var div_21 = root_7();
									var div_22 = $.child(div_21);
									var button_4 = $.sibling($.child(div_22), 2);
									let classes_2;
									var node_18 = $.child(button_4);

									{
										let $0 = $.derived(() => clipboard.isCopied('kea') ? 'check' : 'copy');

										Icon(node_18, {
											get name() {
												return $.get($0);
											},
											size: 'xs'
										});
									}

									var text_12 = $.sibling(node_18);

									$.reset(button_4);
									$.reset(div_22);

									var pre_2 = $.sibling(div_22, 2);
									var text_13 = $.only_child(pre_2, true);

									$.reset(div_21);

									$.template_effect(
										($0, $1) => {
											classes_2 = $.set_class(button_4, 1, 'copy-btn svelte-18sbsfb', null, classes_2, { copied: $0 });
											$.set_text(text_12, ` ${$1 ?? ''}`);
											$.set_text(text_13, $.get(result).examples.keaDhcp4);
										},
										[
											() => clipboard.isCopied('kea'),
											() => clipboard.isCopied('kea') ? 'Copied' : 'Copy'
										]
									);

									$.delegated('click', button_4, () => clipboard.copy($.get(result).examples.keaDhcp4, 'kea'));
									$.append($$anchor, div_21);
								};

								$.if(node_17, ($$render) => {
									if ($.get(result).examples.keaDhcp4) $$render(consequent_4);
								});
							}

							var node_19 = $.sibling(node_17, 2);

							{
								var consequent_5 = ($$anchor) => {
									var div_23 = root_8();
									var div_24 = $.child(div_23);
									var button_5 = $.sibling($.child(div_24), 2);
									let classes_3;
									var node_20 = $.child(button_5);

									{
										let $0 = $.derived(() => clipboard.isCopied('cisco') ? 'check' : 'copy');

										Icon(node_20, {
											get name() {
												return $.get($0);
											},
											size: 'xs'
										});
									}

									var text_14 = $.sibling(node_20);

									$.reset(button_5);
									$.reset(div_24);

									var pre_3 = $.sibling(div_24, 2);
									var text_15 = $.only_child(pre_3, true);

									$.reset(div_23);

									$.template_effect(
										($0, $1) => {
											classes_3 = $.set_class(button_5, 1, 'copy-btn svelte-18sbsfb', null, classes_3, { copied: $0 });
											$.set_text(text_14, ` ${$1 ?? ''}`);
											$.set_text(text_15, $.get(result).examples.ciscoRelay);
										},
										[
											() => clipboard.isCopied('cisco'),
											() => clipboard.isCopied('cisco') ? 'Copied' : 'Copy'
										]
									);

									$.delegated('click', button_5, () => clipboard.copy($.get(result).examples.ciscoRelay, 'cisco'));
									$.append($$anchor, div_23);
								};

								$.if(node_19, ($$render) => {
									if ($.get(result).examples.ciscoRelay) $$render(consequent_5);
								});
							}

							$.reset(div_10);

							$.template_effect(
								($0, $1) => {
									classes = $.set_class(button_2, 1, 'copy-btn svelte-18sbsfb', null, classes, { copied: $0 });
									$.set_text(text_3, ` ${$1 ?? ''}`);
									$.set_text(text_4, $.get(result).hexEncoded);
								},
								[
									() => clipboard.isCopied('hex'),
									() => clipboard.isCopied('hex') ? 'Copied' : 'Copy'
								]
							);

							$.delegated('click', button_2, () => clipboard.copy($.get(result).hexEncoded, 'hex'));
							$.append($$anchor, div_10);
						};

						$.if(node_12, ($$render) => {
							if ($.get(result) && $.get(validationErrors).length === 0) $$render(consequent_6);
						});
					}

					$.delegated('click', button_1, addSuboption);
					$.append($$anchor, fragment_4);
				};

				var alternate_1 = ($$anchor) => {
					var fragment_5 = root_13();
					var div_25 = $.first_child(fragment_5);
					var div_26 = $.sibling($.child(div_25), 2);
					var div_27 = $.child(div_26);
					var label_3 = $.child(div_27);
					var node_21 = $.child(label_3);

					Icon(node_21, { name: 'code', size: 'sm' });
					$.next();
					$.reset(label_3);

					var textarea = $.sibling(label_3, 2);

					$.remove_textarea_child(textarea);
					$.reset(div_27);

					var button_6 = $.sibling(div_27, 2);
					var node_22 = $.child(button_6);

					Icon(node_22, { name: 'search', size: 'sm' });
					$.next();
					$.reset(button_6);
					$.reset(div_26);
					$.reset(div_25);

					var node_23 = $.sibling(div_25, 2);

					{
						var consequent_8 = ($$anchor) => {
							var div_28 = root_4();
							var node_24 = $.sibling($.child(div_28), 2);

							$.each(node_24, 17, () => $.get(validationErrors), $.index, ($$anchor, error) => {
								var div_29 = root_3();
								var node_25 = $.child(div_29);

								Icon(node_25, { name: 'alert-triangle', size: 'sm' });

								var text_16 = $.sibling(node_25);

								$.reset(div_29);
								$.template_effect(() => $.set_text(text_16, ` ${$.get(error) ?? ''}`));
								$.append($$anchor, div_29);
							});

							$.reset(div_28);
							$.append($$anchor, div_28);
						};

						$.if(node_23, ($$render) => {
							if ($.get(validationErrors).length > 0) $$render(consequent_8);
						});
					}

					var node_26 = $.sibling(node_23, 2);

					{
						var consequent_9 = ($$anchor) => {
							var div_30 = root_12();
							var div_31 = $.sibling($.child(div_30), 2);
							var div_32 = $.child(div_31);
							var text_17 = $.sibling($.child(div_32));

							$.reset(div_32);

							var div_33 = $.sibling(div_32, 2);
							var text_18 = $.sibling($.child(div_33));

							$.reset(div_33);
							$.reset(div_31);

							var div_34 = $.sibling(div_31, 2);
							var node_27 = $.sibling($.child(div_34), 2);

							$.each(node_27, 17, () => $.get(parseResult).suboptions, $.index, ($$anchor, suboption) => {
								var div_35 = root_11();
								var div_36 = $.child(div_35);
								var strong_1 = $.child(div_36);
								var text_19 = $.only_child(strong_1);
								var span_1 = $.sibling(strong_1, 2);
								var text_20 = $.only_child(span_1);

								$.reset(div_36);

								var p_1 = $.sibling(div_36, 2);
								var text_21 = $.only_child(p_1, true);
								var div_37 = $.sibling(p_1, 2);
								var div_38 = $.child(div_37);
								var text_22 = $.sibling($.child(div_38));

								$.reset(div_38);

								var div_39 = $.sibling(div_38, 2);
								var text_23 = $.sibling($.child(div_39));

								$.reset(div_39);
								$.reset(div_37);
								$.reset(div_35);

								$.template_effect(() => {
									$.set_text(text_19, `${$.get(suboption).type ?? ''} (Code ${$.get(suboption).typeCode ?? ''})`);
									$.set_text(text_20, `Length: ${$.get(suboption).length ?? ''} bytes`);
									$.set_text(text_21, $.get(suboption).description);
									$.set_text(text_22, ` ${$.get(suboption).value ?? ''}`);
									$.set_text(text_23, ` ${$.get(suboption).hexValue ?? ''}`);
								});

								$.append($$anchor, div_35);
							});

							$.reset(div_34);
							$.reset(div_30);

							$.template_effect(() => {
								$.set_text(text_17, ` ${$.get(parseResult).totalLength ?? ''} bytes`);
								$.set_text(text_18, ` ${$.get(parseResult).suboptions.length ?? ''}`);
							});

							$.append($$anchor, div_30);
						};

						$.if(node_26, ($$render) => {
							if ($.get(parseResult) && $.get(validationErrors).length === 0) $$render(consequent_9);
						});
					}

					$.bind_value(textarea, () => $.get(parseInput), ($$value) => $.set(parseInput, $$value));
					$.delegated('click', button_6, parse);
					$.append($$anchor, fragment_5);
				};

				$.if(node_1, ($$render) => {
					if ($.get(mode) === 'build') $$render(consequent_7); else $$render(alternate_1, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);