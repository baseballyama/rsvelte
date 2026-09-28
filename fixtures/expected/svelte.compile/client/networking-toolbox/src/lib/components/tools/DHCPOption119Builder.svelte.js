import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { untrack } from 'svelte';
import Icon from '$lib/components/global/Icon.svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import { useClipboard } from '$lib/composables';
import { buildOption119, parseOption119, getDefaultOption119Config } from '$lib/utils/dhcp-option119.js';

var root = $.from_html(`<button type="button" class="btn-icon svelte-1j5wk32"><!></button>`);
var root_1 = $.from_html(`<div class="domain-group svelte-1j5wk32"><div class="domain-header svelte-1j5wk32"><h4 class="svelte-1j5wk32"><!> </h4> <!></div> <div class="input-group svelte-1j5wk32"><input type="text" placeholder="example.com" class="svelte-1j5wk32"/></div></div>`);
var root_2 = $.from_html(`<div class="error-message svelte-1j5wk32"><!> </div>`);
var root_3 = $.from_html(`<div class="card errors-card svelte-1j5wk32"><h3 class="svelte-1j5wk32">Validation Errors</h3> <!></div>`);
var root_4 = $.from_html(`<div class="card results svelte-1j5wk32"><h3 class="svelte-1j5wk32">Encoded Option 119</h3> <div class="output-group svelte-1j5wk32"><div class="output-header svelte-1j5wk32"><h4 class="svelte-1j5wk32">Hex-Encoded (Compact)</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-1j5wk32"> </pre></div> <div class="output-group svelte-1j5wk32"><div class="output-header svelte-1j5wk32"><h4 class="svelte-1j5wk32">Wire Format (Spaced)</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-1j5wk32"> </pre></div> <div class="summary-card svelte-1j5wk32"><div class="svelte-1j5wk32"><strong class="svelte-1j5wk32">Total Length:</strong> </div> <div class="svelte-1j5wk32"><strong class="svelte-1j5wk32">Domains:</strong> </div></div></div>`);
var root_5 = $.from_html(`<div class="network-error-item svelte-1j5wk32"><!> </div>`);
var root_6 = $.from_html(`<div class="network-errors svelte-1j5wk32"><h4 class="svelte-1j5wk32">Network Settings Errors</h4> <!></div>`);
var root_7 = $.from_html(`<div class="card input-card svelte-1j5wk32"><div class="card-header svelte-1j5wk32"><h3 class="svelte-1j5wk32">Network Settings (Optional)</h3> <p class="help-text svelte-1j5wk32">Customize network values for configuration examples below</p></div> <div class="card-content svelte-1j5wk32"><div class="input-row svelte-1j5wk32"><div class="input-group svelte-1j5wk32"><label for="subnet" class="svelte-1j5wk32"><!> Subnet</label> <input id="subnet" type="text" placeholder="192.168.1.0" class="svelte-1j5wk32"/></div> <div class="input-group svelte-1j5wk32"><label for="netmask" class="svelte-1j5wk32"><!> Netmask</label> <input id="netmask" type="text" placeholder="255.255.255.0" class="svelte-1j5wk32"/></div></div> <div class="input-row svelte-1j5wk32"><div class="input-group svelte-1j5wk32"><label for="range-start" class="svelte-1j5wk32"><!> Range Start</label> <input id="range-start" type="text" placeholder="192.168.1.100" class="svelte-1j5wk32"/></div> <div class="input-group svelte-1j5wk32"><label for="range-end" class="svelte-1j5wk32"><!> Range End</label> <input id="range-end" type="text" placeholder="192.168.1.200" class="svelte-1j5wk32"/></div></div></div> <!></div>`);
var root_8 = $.from_html(`<div class="output-group svelte-1j5wk32"><div class="output-header svelte-1j5wk32"><h4 class="svelte-1j5wk32">ISC dhcpd Configuration</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-1j5wk32"> </pre></div>`);
var root_9 = $.from_html(`<div class="output-group svelte-1j5wk32"><div class="output-header svelte-1j5wk32"><h4 class="svelte-1j5wk32">Kea DHCPv4 Configuration</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-1j5wk32"> </pre></div>`);
var root_10 = $.from_html(`<div class="card results svelte-1j5wk32"><h3 class="svelte-1j5wk32">Configuration Examples</h3> <!> <!></div>`);
var root_11 = $.from_html(`<div class="card input-card svelte-1j5wk32"><div class="card-header svelte-1j5wk32"><h3 class="svelte-1j5wk32">Domain List</h3></div> <div class="card-content svelte-1j5wk32"><!> <button type="button" class="btn-add svelte-1j5wk32"><!> Add Domain</button></div></div> <!> <!> <hr/> <!> <!>`, 1);
var root_12 = $.from_html(`<div class="domain-item svelte-1j5wk32"><!> <span> </span></div>`);
var root_13 = $.from_html(`<div class="card results svelte-1j5wk32"><h3 class="svelte-1j5wk32">Decoded Domain Search List</h3> <div class="summary-card svelte-1j5wk32"><div class="svelte-1j5wk32"><strong class="svelte-1j5wk32">Total Length:</strong> </div> <div class="svelte-1j5wk32"><strong class="svelte-1j5wk32">Domains Found:</strong> </div></div> <div class="domains-section svelte-1j5wk32"><h4 class="svelte-1j5wk32">Domain List</h4> <!></div></div>`);
var root_14 = $.from_html(`<div class="card input-card svelte-1j5wk32"><div class="card-header svelte-1j5wk32"><h3 class="svelte-1j5wk32">Decode Option 119 Hex</h3></div> <div class="card-content svelte-1j5wk32"><div class="input-group svelte-1j5wk32"><label for="decode-input" class="svelte-1j5wk32"><!> Hex-Encoded Option 119</label> <textarea id="decode-input" placeholder="Enter hex string (e.g., 0765786d706c6503636f6d00)" rows="4" class="svelte-1j5wk32"></textarea></div> <button type="button" class="btn-primary svelte-1j5wk32"><!> Decode</button></div></div> <!> <!>`, 1);
var root_15 = $.from_html(`<!> <!>`, 1);

export default function DHCPOption119Builder($$anchor, $$props) {
	$.push($$props, true);

	const modeOptions = [
		{ value: 'encode', label: 'Encode', icon: 'wrench' },
		{ value: 'decode', label: 'Decode', icon: 'search' }
	];

	let mode = $.state('encode');

	let config = $.state($.proxy({
		...getDefaultOption119Config(),
		network: { subnet: '', netmask: '', rangeStart: '', rangeEnd: '' }
	}));

	let result = $.state(null);
	let decodeInput = $.state('');
	let decodeResult = $.state(null);
	let validationErrors = $.state($.proxy([]));
	let networkValidationErrors = $.state($.proxy([]));
	let selectedExampleIndex = $.state(null);
	const clipboard = useClipboard();

	const encodeExamples = [
		{
			label: 'Corporate',
			domains: ['corp.example.com', 'example.com'],
			description: 'Corporate network with domain compression'
		},

		{
			label: 'Multi-site',
			domains: ['site1.example.com', 'site2.example.com', 'example.com'],
			description: 'Multiple sites sharing common suffix'
		},

		{
			label: 'Development',
			domains: ['dev.example.com', 'staging.example.com', 'example.com'],
			description: 'Development environments'
		}
	];

	const decodeExamples = [
		{
			label: 'Corporate',
			hexInput: '04636f7270076578616d706c6503636f6d00c005',
			description: 'corp.example.com, example.com (with compression)'
		},

		{
			label: 'Multi-site',
			hexInput: '057369746531076578616d706c6503636f6d00057369746532c006c006',
			description: 'site1.example.com, site2.example.com, example.com'
		},

		{
			label: 'Single Domain',
			hexInput: '076578616d706c6503636f6d00',
			description: 'example.com (no compression)'
		}
	];

	// Reactive generation - use untrack to prevent infinite loop
	$.user_effect(() => {
		if ($.get(mode) === 'encode') {
			// Track config and all its nested properties
			const currentDomains = [...$.get(config).domains];

			const currentNetwork = $.get(config).network ? { ...$.get(config).network } : undefined;

			untrack(() => {
				validateAndEncode({ domains: currentDomains, network: currentNetwork });
				checkIfExampleStillMatches();
			});
		} else {
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			$.get(decodeInput);

			untrack(() => {
				checkIfExampleStillMatches();
			});
		}
	});

	// Clear selected example when switching modes
	$.user_effect(() => {
		void $.get(mode);

		untrack(() => {
			$.set(selectedExampleIndex, null);
		});
	});

	function validateAndEncode(cfg = $.get(config)) {
		const domainErrors = [];
		const netErrors = [];

		// Validate domains
		if (cfg.domains.length === 0) {
			domainErrors.push('At least one domain is required');
		}

		for (let i = 0; i < cfg.domains.length; i++) {
			const domain = cfg.domains[i];

			if (!domain.trim()) {
				domainErrors.push(`Domain ${i + 1}: Value is required`);

				continue;
			}

			if (!(/^[a-zA-Z0-9.-]+$/).test(domain)) {
				domainErrors.push(`Domain ${i + 1}: Invalid characters (use only letters, numbers, dots, hyphens)`);

				continue;
			}

			if (domain.startsWith('.') || domain.endsWith('.')) {
				domainErrors.push(`Domain ${i + 1}: Cannot start or end with a dot`);

				continue;
			}

			if (domain.includes('..')) {
				domainErrors.push(`Domain ${i + 1}: Cannot contain consecutive dots`);

				continue;
			}

			if (domain.length > 253) {
				domainErrors.push(`Domain ${i + 1}: Exceeds maximum length of 253 characters`);

				continue;
			}

			const labels = domain.split('.');

			for (const label of labels) {
				if (label.length === 0) {
					domainErrors.push(`Domain ${i + 1}: Empty label found`);

					break;
				}

				if (label.length > 63) {
					domainErrors.push(`Domain ${i + 1}: Label "${label}" exceeds maximum length of 63 characters`);

					break;
				}

				if (label.startsWith('-') || label.endsWith('-')) {
					domainErrors.push(`Domain ${i + 1}: Label "${label}" cannot start or end with hyphen`);

					break;
				}
			}
		}

		// Validate network settings if provided
		if (cfg.network) {
			const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

			if (cfg.network.subnet && cfg.network.subnet.trim() && !ipv4Regex.test(cfg.network.subnet)) {
				netErrors.push('Invalid subnet address');
			}

			if (cfg.network.netmask && cfg.network.netmask.trim() && !ipv4Regex.test(cfg.network.netmask)) {
				netErrors.push('Invalid netmask');
			}

			if (cfg.network.rangeStart && cfg.network.rangeStart.trim() && !ipv4Regex.test(cfg.network.rangeStart)) {
				netErrors.push('Invalid range start address');
			}

			if (cfg.network.rangeEnd && cfg.network.rangeEnd.trim() && !ipv4Regex.test(cfg.network.rangeEnd)) {
				netErrors.push('Invalid range end address');
			}
		}

		$.set(validationErrors, domainErrors, true);
		$.set(networkValidationErrors, netErrors, true);

		if (domainErrors.length === 0) {
			try {
				$.set(result, buildOption119(cfg), true);
			} catch(error) {
				$.set(validationErrors, [error instanceof Error ? error.message : 'Encoding failed'], true);
				$.set(result, null);
			}
		} else {
			$.set(result, null);
		}
	}

	function decode() {
		if (!$.get(decodeInput).trim()) {
			$.set(decodeResult, null);
			$.set(validationErrors, [], true);

			return;
		}

		if (!(/^[0-9a-fA-F\s:]+$/).test($.get(decodeInput))) {
			$.set(validationErrors, ['Invalid hex input: only hexadecimal characters allowed'], true);
			$.set(decodeResult, null);

			return;
		}

		try {
			$.set(validationErrors, [], true);
			$.set(decodeResult, parseOption119($.get(decodeInput)), true);
		} catch(error) {
			$.set(validationErrors, [error instanceof Error ? error.message : 'Decoding failed'], true);
			$.set(decodeResult, null);
		}
	}

	function addDomain() {
		$.get(config).domains = [...$.get(config).domains, ''];
	}

	function removeDomain(index) {
		if ($.get(config).domains.length > 1) {
			$.get(config).domains = $.get(config).domains.filter((_, i) => i !== index);
		}
	}

	function loadEncodeExample(example, index) {
		$.set(
			config,
			{
				domains: [...example.domains],
				network: { subnet: '', netmask: '', rangeStart: '', rangeEnd: '' }
			},
			true
		);

		$.set(selectedExampleIndex, index, true);
	}

	function loadDecodeExample(example, index) {
		$.set(decodeInput, example.hexInput, true);
		$.set(selectedExampleIndex, index, true);
		decode();
	}

	function checkIfExampleStillMatches() {
		if ($.get(selectedExampleIndex) === null) return;

		if ($.get(mode) === 'encode') {
			const example = encodeExamples[$.get(selectedExampleIndex)];

			if (!example) {
				$.set(selectedExampleIndex, null);

				return;
			}

			// Check if current config matches the selected example
			const matches = $.get(config).domains.length === example.domains.length && $.get(config).domains.every((_domain, i) => _domain === example.domains[i]);

			if (!matches) {
				$.set(selectedExampleIndex, null);
			}
		} else {
			const example = decodeExamples[$.get(selectedExampleIndex)];

			if (!example) {
				$.set(selectedExampleIndex, null);

				return;
			}

			if ($.get(decodeInput) !== example.hexInput) {
				$.set(selectedExampleIndex, null);
			}
		}
	}

	ToolContentContainer($$anchor, {
		title: 'DHCP Option 119 - Domain Search List',
		description: 'Encode and decode Domain Search List (RFC 3397/6731) to/from RFC 1035 wire format with domain compression. Generate configurations for ISC dhcpd and Kea DHCP.',
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
			var fragment_1 = root_15();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					ExamplesCard($$anchor, {
						get examples() {
							return encodeExamples;
						},
						onSelect: loadEncodeExample,
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
					if ($.get(mode) === 'encode') $$render(consequent); else $$render(alternate, -1);
				});
			}

			var node_1 = $.sibling(node, 2);

			{
				var consequent_9 = ($$anchor) => {
					var fragment_4 = root_11();
					var div = $.first_child(fragment_4);
					var div_1 = $.sibling($.child(div), 2);
					var node_2 = $.child(div_1);

					$.each(node_2, 19, () => $.get(config).domains, (_, i) => `domain-${i}`, ($$anchor, _, i) => {
						var div_2 = root_1();
						var div_3 = $.child(div_2);
						var h4 = $.child(div_3);
						var node_3 = $.child(h4);

						Icon(node_3, { name: 'globe', size: 'sm' });

						var text = $.sibling(node_3);

						$.reset(h4);

						var node_4 = $.sibling(h4, 2);

						{
							var consequent_1 = ($$anchor) => {
								var button = root();
								var node_5 = $.child(button);

								Icon(node_5, { name: 'x', size: 'sm' });
								$.reset(button);
								$.delegated('click', button, () => removeDomain($.get(i)));
								$.append($$anchor, button);
							};

							$.if(node_4, ($$render) => {
								if ($.get(config).domains.length > 1) $$render(consequent_1);
							});
						}

						$.reset(div_3);

						var div_4 = $.sibling(div_3, 2);
						var input = $.child(div_4);

						$.remove_input_defaults(input);
						$.reset(div_4);
						$.reset(div_2);

						$.template_effect(() => {
							$.set_text(text, `Domain ${$.get(i) + 1}`);
							$.set_attribute(input, 'id', `domain-${$.get(i) ?? ''}`);
						});

						$.bind_value(input, () => $.get(config).domains[$.get(i)], ($$value) => $.get(config).domains[$.get(i)] = $$value);
						$.append($$anchor, div_2);
					});

					var button_1 = $.sibling(node_2, 2);
					var node_6 = $.child(button_1);

					Icon(node_6, { name: 'plus', size: 'sm' });
					$.next();
					$.reset(button_1);
					$.reset(div_1);
					$.reset(div);

					var node_7 = $.sibling(div, 2);

					{
						var consequent_2 = ($$anchor) => {
							var div_5 = root_3();
							var node_8 = $.sibling($.child(div_5), 2);

							$.each(node_8, 17, () => $.get(validationErrors), $.index, ($$anchor, error) => {
								var div_6 = root_2();
								var node_9 = $.child(div_6);

								Icon(node_9, { name: 'alert-triangle', size: 'sm' });

								var text_1 = $.sibling(node_9);

								$.reset(div_6);
								$.template_effect(() => $.set_text(text_1, ` ${$.get(error) ?? ''}`));
								$.append($$anchor, div_6);
							});

							$.reset(div_5);
							$.append($$anchor, div_5);
						};

						$.if(node_7, ($$render) => {
							if ($.get(validationErrors).length > 0) $$render(consequent_2);
						});
					}

					var node_10 = $.sibling(node_7, 2);

					{
						var consequent_3 = ($$anchor) => {
							var div_7 = root_4();
							var div_8 = $.sibling($.child(div_7), 2);
							var div_9 = $.child(div_8);
							var button_2 = $.sibling($.child(div_9), 2);
							let classes;
							var node_11 = $.child(button_2);

							{
								let $0 = $.derived(() => clipboard.isCopied('hex') ? 'check' : 'copy');

								Icon(node_11, {
									get name() {
										return $.get($0);
									},
									size: 'xs'
								});
							}

							var text_2 = $.sibling(node_11);

							$.reset(button_2);
							$.reset(div_9);

							var pre = $.sibling(div_9, 2);
							var text_3 = $.only_child(pre, true);

							$.reset(div_8);

							var div_10 = $.sibling(div_8, 2);
							var div_11 = $.child(div_10);
							var button_3 = $.sibling($.child(div_11), 2);
							let classes_1;
							var node_12 = $.child(button_3);

							{
								let $0 = $.derived(() => clipboard.isCopied('wire') ? 'check' : 'copy');

								Icon(node_12, {
									get name() {
										return $.get($0);
									},
									size: 'xs'
								});
							}

							var text_4 = $.sibling(node_12);

							$.reset(button_3);
							$.reset(div_11);

							var pre_1 = $.sibling(div_11, 2);
							var text_5 = $.only_child(pre_1, true);

							$.reset(div_10);

							var div_12 = $.sibling(div_10, 2);
							var div_13 = $.child(div_12);
							var text_6 = $.sibling($.child(div_13));

							$.reset(div_13);

							var div_14 = $.sibling(div_13, 2);
							var text_7 = $.sibling($.child(div_14));

							$.reset(div_14);
							$.reset(div_12);
							$.reset(div_7);

							$.template_effect(
								($0, $1, $2, $3) => {
									classes = $.set_class(button_2, 1, 'copy-btn svelte-1j5wk32', null, classes, { copied: $0 });
									$.set_text(text_2, ` ${$1 ?? ''}`);
									$.set_text(text_3, $.get(result).hexEncoded);
									classes_1 = $.set_class(button_3, 1, 'copy-btn svelte-1j5wk32', null, classes_1, { copied: $2 });
									$.set_text(text_4, ` ${$3 ?? ''}`);
									$.set_text(text_5, $.get(result).wireFormat);
									$.set_text(text_6, ` ${$.get(result).totalLength ?? ''} bytes`);
									$.set_text(text_7, ` ${$.get(result).domainList.length ?? ''}`);
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
							$.append($$anchor, div_7);
						};

						$.if(node_10, ($$render) => {
							if ($.get(result) && $.get(validationErrors).length === 0) $$render(consequent_3);
						});
					}

					var node_13 = $.sibling(node_10, 4);

					{
						var consequent_5 = ($$anchor) => {
							var div_15 = root_7();
							var div_16 = $.sibling($.child(div_15), 2);
							var div_17 = $.child(div_16);
							var div_18 = $.child(div_17);
							var label_1 = $.child(div_18);
							var node_14 = $.child(label_1);

							Icon(node_14, { name: 'network', size: 'sm' });
							$.next();
							$.reset(label_1);

							var input_1 = $.sibling(label_1, 2);

							$.remove_input_defaults(input_1);
							$.reset(div_18);

							var div_19 = $.sibling(div_18, 2);
							var label_2 = $.child(div_19);
							var node_15 = $.child(label_2);

							Icon(node_15, { name: 'network', size: 'sm' });
							$.next();
							$.reset(label_2);

							var input_2 = $.sibling(label_2, 2);

							$.remove_input_defaults(input_2);
							$.reset(div_19);
							$.reset(div_17);

							var div_20 = $.sibling(div_17, 2);
							var div_21 = $.child(div_20);
							var label_3 = $.child(div_21);
							var node_16 = $.child(label_3);

							Icon(node_16, { name: 'arrow-right', size: 'sm' });
							$.next();
							$.reset(label_3);

							var input_3 = $.sibling(label_3, 2);

							$.remove_input_defaults(input_3);
							$.reset(div_21);

							var div_22 = $.sibling(div_21, 2);
							var label_4 = $.child(div_22);
							var node_17 = $.child(label_4);

							Icon(node_17, { name: 'arrow-right', size: 'sm' });
							$.next();
							$.reset(label_4);

							var input_4 = $.sibling(label_4, 2);

							$.remove_input_defaults(input_4);
							$.reset(div_22);
							$.reset(div_20);
							$.reset(div_16);

							var node_18 = $.sibling(div_16, 2);

							{
								var consequent_4 = ($$anchor) => {
									var div_23 = root_6();
									var node_19 = $.sibling($.child(div_23), 2);

									$.each(node_19, 17, () => $.get(networkValidationErrors), $.index, ($$anchor, error) => {
										var div_24 = root_5();
										var node_20 = $.child(div_24);

										Icon(node_20, { name: 'alert-triangle', size: 'sm' });

										var text_8 = $.sibling(node_20);

										$.reset(div_24);
										$.template_effect(() => $.set_text(text_8, ` ${$.get(error) ?? ''}`));
										$.append($$anchor, div_24);
									});

									$.reset(div_23);
									$.append($$anchor, div_23);
								};

								$.if(node_18, ($$render) => {
									if ($.get(networkValidationErrors).length > 0) $$render(consequent_4);
								});
							}

							$.reset(div_15);
							$.bind_value(input_1, () => $.get(config).network.subnet, ($$value) => $.get(config).network.subnet = $$value);
							$.bind_value(input_2, () => $.get(config).network.netmask, ($$value) => $.get(config).network.netmask = $$value);
							$.bind_value(input_3, () => $.get(config).network.rangeStart, ($$value) => $.get(config).network.rangeStart = $$value);
							$.bind_value(input_4, () => $.get(config).network.rangeEnd, ($$value) => $.get(config).network.rangeEnd = $$value);
							$.append($$anchor, div_15);
						};

						$.if(node_13, ($$render) => {
							if ($.get(result)) $$render(consequent_5);
						});
					}

					var node_21 = $.sibling(node_13, 2);

					{
						var consequent_8 = ($$anchor) => {
							var div_25 = root_10();
							var node_22 = $.sibling($.child(div_25), 2);

							{
								var consequent_6 = ($$anchor) => {
									var div_26 = root_8();
									var div_27 = $.child(div_26);
									var button_4 = $.sibling($.child(div_27), 2);
									let classes_2;
									var node_23 = $.child(button_4);

									{
										let $0 = $.derived(() => clipboard.isCopied('isc') ? 'check' : 'copy');

										Icon(node_23, {
											get name() {
												return $.get($0);
											},
											size: 'xs'
										});
									}

									var text_9 = $.sibling(node_23);

									$.reset(button_4);
									$.reset(div_27);

									var pre_2 = $.sibling(div_27, 2);
									var text_10 = $.only_child(pre_2, true);

									$.reset(div_26);

									$.template_effect(
										($0, $1) => {
											classes_2 = $.set_class(button_4, 1, 'copy-btn svelte-1j5wk32', null, classes_2, { copied: $0 });
											$.set_text(text_9, ` ${$1 ?? ''}`);
											$.set_text(text_10, $.get(result).examples.iscDhcpd);
										},
										[
											() => clipboard.isCopied('isc'),
											() => clipboard.isCopied('isc') ? 'Copied' : 'Copy'
										]
									);

									$.delegated('click', button_4, () => clipboard.copy($.get(result).examples.iscDhcpd, 'isc'));
									$.append($$anchor, div_26);
								};

								$.if(node_22, ($$render) => {
									if ($.get(result).examples.iscDhcpd) $$render(consequent_6);
								});
							}

							var node_24 = $.sibling(node_22, 2);

							{
								var consequent_7 = ($$anchor) => {
									var div_28 = root_9();
									var div_29 = $.child(div_28);
									var button_5 = $.sibling($.child(div_29), 2);
									let classes_3;
									var node_25 = $.child(button_5);

									{
										let $0 = $.derived(() => clipboard.isCopied('kea') ? 'check' : 'copy');

										Icon(node_25, {
											get name() {
												return $.get($0);
											},
											size: 'xs'
										});
									}

									var text_11 = $.sibling(node_25);

									$.reset(button_5);
									$.reset(div_29);

									var pre_3 = $.sibling(div_29, 2);
									var text_12 = $.only_child(pre_3, true);

									$.reset(div_28);

									$.template_effect(
										($0, $1) => {
											classes_3 = $.set_class(button_5, 1, 'copy-btn svelte-1j5wk32', null, classes_3, { copied: $0 });
											$.set_text(text_11, ` ${$1 ?? ''}`);
											$.set_text(text_12, $.get(result).examples.keaDhcp4);
										},
										[
											() => clipboard.isCopied('kea'),
											() => clipboard.isCopied('kea') ? 'Copied' : 'Copy'
										]
									);

									$.delegated('click', button_5, () => clipboard.copy($.get(result).examples.keaDhcp4, 'kea'));
									$.append($$anchor, div_28);
								};

								$.if(node_24, ($$render) => {
									if ($.get(result).examples.keaDhcp4) $$render(consequent_7);
								});
							}

							$.reset(div_25);
							$.append($$anchor, div_25);
						};

						$.if(node_21, ($$render) => {
							if ($.get(result) && $.get(networkValidationErrors).length === 0) $$render(consequent_8);
						});
					}

					$.delegated('click', button_1, addDomain);
					$.append($$anchor, fragment_4);
				};

				var alternate_1 = ($$anchor) => {
					var fragment_5 = root_14();
					var div_30 = $.first_child(fragment_5);
					var div_31 = $.sibling($.child(div_30), 2);
					var div_32 = $.child(div_31);
					var label_5 = $.child(div_32);
					var node_26 = $.child(label_5);

					Icon(node_26, { name: 'code', size: 'sm' });
					$.next();
					$.reset(label_5);

					var textarea = $.sibling(label_5, 2);

					$.remove_textarea_child(textarea);
					$.reset(div_32);

					var button_6 = $.sibling(div_32, 2);
					var node_27 = $.child(button_6);

					Icon(node_27, { name: 'search', size: 'sm' });
					$.next();
					$.reset(button_6);
					$.reset(div_31);
					$.reset(div_30);

					var node_28 = $.sibling(div_30, 2);

					{
						var consequent_10 = ($$anchor) => {
							var div_33 = root_3();
							var node_29 = $.sibling($.child(div_33), 2);

							$.each(node_29, 17, () => $.get(validationErrors), $.index, ($$anchor, error) => {
								var div_34 = root_2();
								var node_30 = $.child(div_34);

								Icon(node_30, { name: 'alert-triangle', size: 'sm' });

								var text_13 = $.sibling(node_30);

								$.reset(div_34);
								$.template_effect(() => $.set_text(text_13, ` ${$.get(error) ?? ''}`));
								$.append($$anchor, div_34);
							});

							$.reset(div_33);
							$.append($$anchor, div_33);
						};

						$.if(node_28, ($$render) => {
							if ($.get(validationErrors).length > 0) $$render(consequent_10);
						});
					}

					var node_31 = $.sibling(node_28, 2);

					{
						var consequent_11 = ($$anchor) => {
							var div_35 = root_13();
							var div_36 = $.sibling($.child(div_35), 2);
							var div_37 = $.child(div_36);
							var text_14 = $.sibling($.child(div_37));

							$.reset(div_37);

							var div_38 = $.sibling(div_37, 2);
							var text_15 = $.sibling($.child(div_38));

							$.reset(div_38);
							$.reset(div_36);

							var div_39 = $.sibling(div_36, 2);
							var node_32 = $.sibling($.child(div_39), 2);

							$.each(node_32, 17, () => $.get(decodeResult).domains, $.index, ($$anchor, domain) => {
								var div_40 = root_12();
								var node_33 = $.child(div_40);

								Icon(node_33, { name: 'globe', size: 'sm' });

								var span = $.sibling(node_33, 2);
								var text_16 = $.only_child(span, true);

								$.reset(div_40);
								$.template_effect(() => $.set_text(text_16, $.get(domain)));
								$.append($$anchor, div_40);
							});

							$.reset(div_39);
							$.reset(div_35);

							$.template_effect(() => {
								$.set_text(text_14, ` ${$.get(decodeResult).totalLength ?? ''} bytes`);
								$.set_text(text_15, ` ${$.get(decodeResult).domains.length ?? ''}`);
							});

							$.append($$anchor, div_35);
						};

						$.if(node_31, ($$render) => {
							if ($.get(decodeResult) && $.get(validationErrors).length === 0) $$render(consequent_11);
						});
					}

					$.bind_value(textarea, () => $.get(decodeInput), ($$value) => $.set(decodeInput, $$value));
					$.delegated('click', button_6, decode);
					$.append($$anchor, fragment_5);
				};

				$.if(node_1, ($$render) => {
					if ($.get(mode) === 'encode') $$render(consequent_9); else $$render(alternate_1, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);