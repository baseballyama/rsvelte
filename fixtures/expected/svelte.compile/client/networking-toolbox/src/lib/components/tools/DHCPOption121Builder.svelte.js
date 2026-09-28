import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { untrack } from 'svelte';
import Icon from '$lib/components/global/Icon.svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import { useClipboard } from '$lib/composables';
import { buildOption121, parseOption121, getDefaultOption121Config } from '$lib/utils/dhcp-option121.js';

var root = $.from_html(`<button type="button" class="btn-icon svelte-tmsj25"><!></button>`);
var root_1 = $.from_html(`<div class="route-group svelte-tmsj25"><div class="route-header svelte-tmsj25"><h4 class="svelte-tmsj25"><!> </h4> <!></div> <div class="input-row svelte-tmsj25"><div class="input-group svelte-tmsj25"><label class="svelte-tmsj25"><!> Destination (CIDR)</label> <input type="text" placeholder="10.0.0.0/8" class="svelte-tmsj25"/></div> <div class="input-group svelte-tmsj25"><label class="svelte-tmsj25"><!> Gateway</label> <input type="text" placeholder="192.168.1.1" class="svelte-tmsj25"/></div></div></div>`);
var root_2 = $.from_html(`<div class="error-message svelte-tmsj25"><!> </div>`);
var root_3 = $.from_html(`<div class="card errors-card svelte-tmsj25"><h3 class="svelte-tmsj25">Validation Errors</h3> <!></div>`);
var root_4 = $.from_html(`<div class="card results svelte-tmsj25"><h3 class="svelte-tmsj25">Encoded Option 121/249</h3> <div class="output-group svelte-tmsj25"><div class="output-header svelte-tmsj25"><h4 class="svelte-tmsj25">Hex-Encoded (Compact)</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-tmsj25"> </pre></div> <div class="output-group svelte-tmsj25"><div class="output-header svelte-tmsj25"><h4 class="svelte-tmsj25">Wire Format (Spaced)</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-tmsj25"> </pre></div> <div class="summary-card svelte-tmsj25"><div class="svelte-tmsj25"><strong class="svelte-tmsj25">Total Length:</strong> </div> <div class="svelte-tmsj25"><strong class="svelte-tmsj25">Routes:</strong> </div></div></div>`);
var root_5 = $.from_html(`<div class="network-error-item svelte-tmsj25"><!> </div>`);
var root_6 = $.from_html(`<div class="network-errors svelte-tmsj25"><h4 class="svelte-tmsj25">Network Settings Errors</h4> <!></div>`);
var root_7 = $.from_html(`<div class="card input-card svelte-tmsj25"><div class="card-header svelte-tmsj25"><h3 class="svelte-tmsj25">Network Settings (Optional)</h3> <p class="help-text svelte-tmsj25">Customize network values for configuration examples below</p></div> <div class="card-content svelte-tmsj25"><div class="input-row svelte-tmsj25"><div class="input-group svelte-tmsj25"><label for="subnet" class="svelte-tmsj25"><!> Subnet</label> <input id="subnet" type="text" placeholder="192.168.1.0" class="svelte-tmsj25"/></div> <div class="input-group svelte-tmsj25"><label for="netmask" class="svelte-tmsj25"><!> Netmask</label> <input id="netmask" type="text" placeholder="255.255.255.0" class="svelte-tmsj25"/></div></div> <div class="input-row svelte-tmsj25"><div class="input-group svelte-tmsj25"><label for="range-start" class="svelte-tmsj25"><!> Range Start</label> <input id="range-start" type="text" placeholder="192.168.1.100" class="svelte-tmsj25"/></div> <div class="input-group svelte-tmsj25"><label for="range-end" class="svelte-tmsj25"><!> Range End</label> <input id="range-end" type="text" placeholder="192.168.1.200" class="svelte-tmsj25"/></div></div></div> <!></div>`);
var root_8 = $.from_html(`<div class="output-group svelte-tmsj25"><div class="output-header svelte-tmsj25"><h4 class="svelte-tmsj25">ISC dhcpd Configuration (Option 121)</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-tmsj25"> </pre></div>`);
var root_9 = $.from_html(`<div class="output-group svelte-tmsj25"><div class="output-header svelte-tmsj25"><h4 class="svelte-tmsj25">Kea DHCPv4 Configuration</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-tmsj25"> </pre></div>`);
var root_10 = $.from_html(`<div class="output-group svelte-tmsj25"><div class="output-header svelte-tmsj25"><h4 class="svelte-tmsj25">Microsoft Option 249 Configuration</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-tmsj25"> </pre></div>`);
var root_11 = $.from_html(`<div class="card results svelte-tmsj25"><h3 class="svelte-tmsj25">Configuration Examples</h3> <!> <!> <!></div>`);
var root_12 = $.from_html(`<div class="card input-card svelte-tmsj25"><div class="card-header svelte-tmsj25"><h3 class="svelte-tmsj25">Static Routes</h3></div> <div class="card-content svelte-tmsj25"><!> <button type="button" class="btn-add svelte-tmsj25"><!> Add Route</button></div></div> <!> <!> <hr/> <!> <!>`, 1);
var root_13 = $.from_html(`<div class="route-item svelte-tmsj25"><div class="route-field svelte-tmsj25"><!> <span class="field-label svelte-tmsj25">Destination:</span> <span class="field-value svelte-tmsj25"> </span></div> <div class="route-field svelte-tmsj25"><!> <span class="field-label svelte-tmsj25">Gateway:</span> <span class="field-value svelte-tmsj25"> </span></div></div>`);
var root_14 = $.from_html(`<div class="card results svelte-tmsj25"><h3 class="svelte-tmsj25">Decoded Classless Static Routes</h3> <div class="summary-card svelte-tmsj25"><div class="svelte-tmsj25"><strong class="svelte-tmsj25">Total Length:</strong> </div> <div class="svelte-tmsj25"><strong class="svelte-tmsj25">Routes Found:</strong> </div></div> <div class="routes-section svelte-tmsj25"><h4 class="svelte-tmsj25">Route List</h4> <!></div></div>`);
var root_15 = $.from_html(`<div class="card input-card svelte-tmsj25"><div class="card-header svelte-tmsj25"><h3 class="svelte-tmsj25">Decode Option 121/249 Hex</h3></div> <div class="card-content svelte-tmsj25"><div class="input-group svelte-tmsj25"><label for="decode-input" class="svelte-tmsj25"><!> Hex-Encoded Option 121/249</label> <textarea id="decode-input" placeholder="Enter hex string (e.g., 080ac0a80101acc01000c0a80101)" rows="4" class="svelte-tmsj25"></textarea></div> <button type="button" class="btn-primary svelte-tmsj25"><!> Decode</button></div></div> <!> <!>`, 1);
var root_16 = $.from_html(`<!> <!>`, 1);

export default function DHCPOption121Builder($$anchor, $$props) {
	$.push($$props, true);

	const modeOptions = [
		{ value: 'encode', label: 'Encode', icon: 'wrench' },
		{ value: 'decode', label: 'Decode', icon: 'search' }
	];

	let mode = $.state('encode');

	let config = $.state($.proxy({
		...getDefaultOption121Config(),
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
			label: 'Private Networks',
			routes: [
				{ destination: '10.0.0.0/8', gateway: '192.168.1.1' },
				{ destination: '172.16.0.0/12', gateway: '192.168.1.1' }
			],
			description: 'Routes to RFC 1918 private networks'
		},

		{
			label: 'Default + Specific',
			routes: [
				{ destination: '0.0.0.0/0', gateway: '192.168.1.1' },
				{ destination: '10.10.0.0/16', gateway: '192.168.1.254' }
			],
			description: 'Default route with specific override'
		},

		{
			label: 'Multi-site VPN',
			routes: [
				{ destination: '10.1.0.0/16', gateway: '192.168.1.10' },
				{ destination: '10.2.0.0/16', gateway: '192.168.1.20' },
				{ destination: '10.3.0.0/16', gateway: '192.168.1.30' }
			],
			description: 'Multiple VPN site routes'
		}
	];

	const decodeExamples = [
		{
			label: 'Private Networks',
			hexInput: '080ac0a801010cac10c0a80101',
			description: '10.0.0.0/8 and 172.16.0.0/12 via 192.168.1.1'
		},

		{
			label: 'Default Route',
			hexInput: '00c0a80101',
			description: '0.0.0.0/0 via 192.168.1.1'
		},

		{
			label: 'Specific /24',
			hexInput: '18c0a80ac0a80101',
			description: '192.168.10.0/24 via 192.168.1.1'
		}
	];

	// Reactive generation - use untrack to prevent infinite loop
	$.user_effect(() => {
		if ($.get(mode) === 'encode') {
			// Track config and all its nested properties
			const currentRoutes = $.get(config).routes.map((r) => ({ ...r }));

			const currentNetwork = $.get(config).network ? { ...$.get(config).network } : undefined;

			untrack(() => {
				validateAndEncode({ routes: currentRoutes, network: currentNetwork });
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
		const routeErrors = [];
		const netErrors = [];

		// Validate routes
		if (cfg.routes.length === 0) {
			routeErrors.push('At least one route is required');
		}

		for (let i = 0; i < cfg.routes.length; i++) {
			const route = cfg.routes[i];

			if (!route.destination.trim()) {
				routeErrors.push(`Route ${i + 1}: Destination is required`);

				continue;
			}

			if (!route.gateway.trim()) {
				routeErrors.push(`Route ${i + 1}: Gateway is required`);

				continue;
			}

			// Validate CIDR format
			const cidrMatch = route.destination.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/);

			if (!cidrMatch) {
				routeErrors.push(`Route ${i + 1}: Invalid CIDR notation (use format: x.x.x.x/y)`);

				continue;
			}

			const [, prefix, prefixLenStr] = cidrMatch;
			const prefixLen = parseInt(prefixLenStr, 10);

			if (prefixLen < 0 || prefixLen > 32) {
				routeErrors.push(`Route ${i + 1}: Prefix length must be 0-32`);

				continue;
			}

			// Validate IPv4 address in CIDR
			const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

			if (!ipv4Regex.test(prefix)) {
				routeErrors.push(`Route ${i + 1}: Invalid IPv4 address in destination`);

				continue;
			}

			const octets = prefix.split('.').map((o) => parseInt(o, 10));

			if (octets.some((o) => o > 255)) {
				routeErrors.push(`Route ${i + 1}: Invalid IPv4 address (octets must be 0-255)`);

				continue;
			}

			// Validate gateway
			if (!ipv4Regex.test(route.gateway)) {
				routeErrors.push(`Route ${i + 1}: Invalid gateway IPv4 address`);

				continue;
			}

			const gwOctets = route.gateway.split('.').map((o) => parseInt(o, 10));

			if (gwOctets.some((o) => o > 255)) {
				routeErrors.push(`Route ${i + 1}: Invalid gateway address (octets must be 0-255)`);

				continue;
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

		$.set(validationErrors, routeErrors, true);
		$.set(networkValidationErrors, netErrors, true);

		if (routeErrors.length === 0) {
			try {
				$.set(result, buildOption121(cfg), true);
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
			$.set(decodeResult, parseOption121($.get(decodeInput)), true);
		} catch(error) {
			$.set(validationErrors, [error instanceof Error ? error.message : 'Decoding failed'], true);
			$.set(decodeResult, null);
		}
	}

	function addRoute() {
		$.get(config).routes = [...$.get(config).routes, { destination: '', gateway: '' }];
	}

	function removeRoute(index) {
		if ($.get(config).routes.length > 1) {
			$.get(config).routes = $.get(config).routes.filter((_, i) => i !== index);
		}
	}

	function loadEncodeExample(example, index) {
		$.set(
			config,
			{
				routes: example.routes.map((r) => ({ ...r })),
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
			const matches = $.get(config).routes.length === example.routes.length && $.get(config).routes.every((route, i) => route.destination === example.routes[i].destination && route.gateway === example.routes[i].gateway);

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
		title: 'DHCP Option 121/249 - Classless Static Routes',
		description: 'Encode and decode Classless Static Routes (RFC 3442 / MSFT 249) with bit-packed network prefixes. Generate configurations for ISC dhcpd and Kea DHCP.',
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
			var fragment_1 = root_16();
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
				var consequent_10 = ($$anchor) => {
					var fragment_4 = root_12();
					var div = $.first_child(fragment_4);
					var div_1 = $.sibling($.child(div), 2);
					var node_2 = $.child(div_1);

					$.each(node_2, 19, () => $.get(config).routes, (_, i) => `route-${i}`, ($$anchor, _, i) => {
						var div_2 = root_1();
						var div_3 = $.child(div_2);
						var h4 = $.child(div_3);
						var node_3 = $.child(h4);

						Icon(node_3, { name: 'compass', size: 'sm' });

						var text = $.sibling(node_3);

						$.reset(h4);

						var node_4 = $.sibling(h4, 2);

						{
							var consequent_1 = ($$anchor) => {
								var button = root();
								var node_5 = $.child(button);

								Icon(node_5, { name: 'x', size: 'sm' });
								$.reset(button);
								$.delegated('click', button, () => removeRoute($.get(i)));
								$.append($$anchor, button);
							};

							$.if(node_4, ($$render) => {
								if ($.get(config).routes.length > 1) $$render(consequent_1);
							});
						}

						$.reset(div_3);

						var div_4 = $.sibling(div_3, 2);
						var div_5 = $.child(div_4);
						var label = $.child(div_5);
						var node_6 = $.child(label);

						Icon(node_6, { name: 'target', size: 'sm' });
						$.next();
						$.reset(label);

						var input = $.sibling(label, 2);

						$.remove_input_defaults(input);
						$.reset(div_5);

						var div_6 = $.sibling(div_5, 2);
						var label_1 = $.child(div_6);
						var node_7 = $.child(label_1);

						Icon(node_7, { name: 'arrow-right', size: 'sm' });
						$.next();
						$.reset(label_1);

						var input_1 = $.sibling(label_1, 2);

						$.remove_input_defaults(input_1);
						$.reset(div_6);
						$.reset(div_4);
						$.reset(div_2);

						$.template_effect(() => {
							$.set_text(text, `Route ${$.get(i) + 1}`);
							$.set_attribute(label, 'for', `destination-${$.get(i) ?? ''}`);
							$.set_attribute(input, 'id', `destination-${$.get(i) ?? ''}`);
							$.set_attribute(label_1, 'for', `gateway-${$.get(i) ?? ''}`);
							$.set_attribute(input_1, 'id', `gateway-${$.get(i) ?? ''}`);
						});

						$.bind_value(input, () => $.get(config).routes[$.get(i)].destination, ($$value) => $.get(config).routes[$.get(i)].destination = $$value);
						$.bind_value(input_1, () => $.get(config).routes[$.get(i)].gateway, ($$value) => $.get(config).routes[$.get(i)].gateway = $$value);
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
							var div_7 = root_3();
							var node_10 = $.sibling($.child(div_7), 2);

							$.each(node_10, 17, () => $.get(validationErrors), $.index, ($$anchor, error) => {
								var div_8 = root_2();
								var node_11 = $.child(div_8);

								Icon(node_11, { name: 'alert-triangle', size: 'sm' });

								var text_1 = $.sibling(node_11);

								$.reset(div_8);
								$.template_effect(() => $.set_text(text_1, ` ${$.get(error) ?? ''}`));
								$.append($$anchor, div_8);
							});

							$.reset(div_7);
							$.append($$anchor, div_7);
						};

						$.if(node_9, ($$render) => {
							if ($.get(validationErrors).length > 0) $$render(consequent_2);
						});
					}

					var node_12 = $.sibling(node_9, 2);

					{
						var consequent_3 = ($$anchor) => {
							var div_9 = root_4();
							var div_10 = $.sibling($.child(div_9), 2);
							var div_11 = $.child(div_10);
							var button_2 = $.sibling($.child(div_11), 2);
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

							var text_2 = $.sibling(node_13);

							$.reset(button_2);
							$.reset(div_11);

							var pre = $.sibling(div_11, 2);
							var text_3 = $.only_child(pre, true);

							$.reset(div_10);

							var div_12 = $.sibling(div_10, 2);
							var div_13 = $.child(div_12);
							var button_3 = $.sibling($.child(div_13), 2);
							let classes_1;
							var node_14 = $.child(button_3);

							{
								let $0 = $.derived(() => clipboard.isCopied('wire') ? 'check' : 'copy');

								Icon(node_14, {
									get name() {
										return $.get($0);
									},
									size: 'xs'
								});
							}

							var text_4 = $.sibling(node_14);

							$.reset(button_3);
							$.reset(div_13);

							var pre_1 = $.sibling(div_13, 2);
							var text_5 = $.only_child(pre_1, true);

							$.reset(div_12);

							var div_14 = $.sibling(div_12, 2);
							var div_15 = $.child(div_14);
							var text_6 = $.sibling($.child(div_15));

							$.reset(div_15);

							var div_16 = $.sibling(div_15, 2);
							var text_7 = $.sibling($.child(div_16));

							$.reset(div_16);
							$.reset(div_14);
							$.reset(div_9);

							$.template_effect(
								($0, $1, $2, $3) => {
									classes = $.set_class(button_2, 1, 'copy-btn svelte-tmsj25', null, classes, { copied: $0 });
									$.set_text(text_2, ` ${$1 ?? ''}`);
									$.set_text(text_3, $.get(result).hexEncoded);
									classes_1 = $.set_class(button_3, 1, 'copy-btn svelte-tmsj25', null, classes_1, { copied: $2 });
									$.set_text(text_4, ` ${$3 ?? ''}`);
									$.set_text(text_5, $.get(result).wireFormat);
									$.set_text(text_6, ` ${$.get(result).totalLength ?? ''} bytes`);
									$.set_text(text_7, ` ${$.get(result).routes.length ?? ''}`);
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
							$.append($$anchor, div_9);
						};

						$.if(node_12, ($$render) => {
							if ($.get(result) && $.get(validationErrors).length === 0) $$render(consequent_3);
						});
					}

					var node_15 = $.sibling(node_12, 4);

					{
						var consequent_5 = ($$anchor) => {
							var div_17 = root_7();
							var div_18 = $.sibling($.child(div_17), 2);
							var div_19 = $.child(div_18);
							var div_20 = $.child(div_19);
							var label_2 = $.child(div_20);
							var node_16 = $.child(label_2);

							Icon(node_16, { name: 'network', size: 'sm' });
							$.next();
							$.reset(label_2);

							var input_2 = $.sibling(label_2, 2);

							$.remove_input_defaults(input_2);
							$.reset(div_20);

							var div_21 = $.sibling(div_20, 2);
							var label_3 = $.child(div_21);
							var node_17 = $.child(label_3);

							Icon(node_17, { name: 'network', size: 'sm' });
							$.next();
							$.reset(label_3);

							var input_3 = $.sibling(label_3, 2);

							$.remove_input_defaults(input_3);
							$.reset(div_21);
							$.reset(div_19);

							var div_22 = $.sibling(div_19, 2);
							var div_23 = $.child(div_22);
							var label_4 = $.child(div_23);
							var node_18 = $.child(label_4);

							Icon(node_18, { name: 'arrow-right', size: 'sm' });
							$.next();
							$.reset(label_4);

							var input_4 = $.sibling(label_4, 2);

							$.remove_input_defaults(input_4);
							$.reset(div_23);

							var div_24 = $.sibling(div_23, 2);
							var label_5 = $.child(div_24);
							var node_19 = $.child(label_5);

							Icon(node_19, { name: 'arrow-right', size: 'sm' });
							$.next();
							$.reset(label_5);

							var input_5 = $.sibling(label_5, 2);

							$.remove_input_defaults(input_5);
							$.reset(div_24);
							$.reset(div_22);
							$.reset(div_18);

							var node_20 = $.sibling(div_18, 2);

							{
								var consequent_4 = ($$anchor) => {
									var div_25 = root_6();
									var node_21 = $.sibling($.child(div_25), 2);

									$.each(node_21, 17, () => $.get(networkValidationErrors), $.index, ($$anchor, error) => {
										var div_26 = root_5();
										var node_22 = $.child(div_26);

										Icon(node_22, { name: 'alert-triangle', size: 'sm' });

										var text_8 = $.sibling(node_22);

										$.reset(div_26);
										$.template_effect(() => $.set_text(text_8, ` ${$.get(error) ?? ''}`));
										$.append($$anchor, div_26);
									});

									$.reset(div_25);
									$.append($$anchor, div_25);
								};

								$.if(node_20, ($$render) => {
									if ($.get(networkValidationErrors).length > 0) $$render(consequent_4);
								});
							}

							$.reset(div_17);
							$.bind_value(input_2, () => $.get(config).network.subnet, ($$value) => $.get(config).network.subnet = $$value);
							$.bind_value(input_3, () => $.get(config).network.netmask, ($$value) => $.get(config).network.netmask = $$value);
							$.bind_value(input_4, () => $.get(config).network.rangeStart, ($$value) => $.get(config).network.rangeStart = $$value);
							$.bind_value(input_5, () => $.get(config).network.rangeEnd, ($$value) => $.get(config).network.rangeEnd = $$value);
							$.append($$anchor, div_17);
						};

						$.if(node_15, ($$render) => {
							if ($.get(result)) $$render(consequent_5);
						});
					}

					var node_23 = $.sibling(node_15, 2);

					{
						var consequent_9 = ($$anchor) => {
							var div_27 = root_11();
							var node_24 = $.sibling($.child(div_27), 2);

							{
								var consequent_6 = ($$anchor) => {
									var div_28 = root_8();
									var div_29 = $.child(div_28);
									var button_4 = $.sibling($.child(div_29), 2);
									let classes_2;
									var node_25 = $.child(button_4);

									{
										let $0 = $.derived(() => clipboard.isCopied('isc') ? 'check' : 'copy');

										Icon(node_25, {
											get name() {
												return $.get($0);
											},
											size: 'xs'
										});
									}

									var text_9 = $.sibling(node_25);

									$.reset(button_4);
									$.reset(div_29);

									var pre_2 = $.sibling(div_29, 2);
									var text_10 = $.only_child(pre_2, true);

									$.reset(div_28);

									$.template_effect(
										($0, $1) => {
											classes_2 = $.set_class(button_4, 1, 'copy-btn svelte-tmsj25', null, classes_2, { copied: $0 });
											$.set_text(text_9, ` ${$1 ?? ''}`);
											$.set_text(text_10, $.get(result).examples.iscDhcpd);
										},
										[
											() => clipboard.isCopied('isc'),
											() => clipboard.isCopied('isc') ? 'Copied' : 'Copy'
										]
									);

									$.delegated('click', button_4, () => clipboard.copy($.get(result).examples.iscDhcpd, 'isc'));
									$.append($$anchor, div_28);
								};

								$.if(node_24, ($$render) => {
									if ($.get(result).examples.iscDhcpd) $$render(consequent_6);
								});
							}

							var node_26 = $.sibling(node_24, 2);

							{
								var consequent_7 = ($$anchor) => {
									var div_30 = root_9();
									var div_31 = $.child(div_30);
									var button_5 = $.sibling($.child(div_31), 2);
									let classes_3;
									var node_27 = $.child(button_5);

									{
										let $0 = $.derived(() => clipboard.isCopied('kea') ? 'check' : 'copy');

										Icon(node_27, {
											get name() {
												return $.get($0);
											},
											size: 'xs'
										});
									}

									var text_11 = $.sibling(node_27);

									$.reset(button_5);
									$.reset(div_31);

									var pre_3 = $.sibling(div_31, 2);
									var text_12 = $.only_child(pre_3, true);

									$.reset(div_30);

									$.template_effect(
										($0, $1) => {
											classes_3 = $.set_class(button_5, 1, 'copy-btn svelte-tmsj25', null, classes_3, { copied: $0 });
											$.set_text(text_11, ` ${$1 ?? ''}`);
											$.set_text(text_12, $.get(result).examples.keaDhcp4);
										},
										[
											() => clipboard.isCopied('kea'),
											() => clipboard.isCopied('kea') ? 'Copied' : 'Copy'
										]
									);

									$.delegated('click', button_5, () => clipboard.copy($.get(result).examples.keaDhcp4, 'kea'));
									$.append($$anchor, div_30);
								};

								$.if(node_26, ($$render) => {
									if ($.get(result).examples.keaDhcp4) $$render(consequent_7);
								});
							}

							var node_28 = $.sibling(node_26, 2);

							{
								var consequent_8 = ($$anchor) => {
									var div_32 = root_10();
									var div_33 = $.child(div_32);
									var button_6 = $.sibling($.child(div_33), 2);
									let classes_4;
									var node_29 = $.child(button_6);

									{
										let $0 = $.derived(() => clipboard.isCopied('msft') ? 'check' : 'copy');

										Icon(node_29, {
											get name() {
												return $.get($0);
											},
											size: 'xs'
										});
									}

									var text_13 = $.sibling(node_29);

									$.reset(button_6);
									$.reset(div_33);

									var pre_4 = $.sibling(div_33, 2);
									var text_14 = $.only_child(pre_4, true);

									$.reset(div_32);

									$.template_effect(
										($0, $1) => {
											classes_4 = $.set_class(button_6, 1, 'copy-btn svelte-tmsj25', null, classes_4, { copied: $0 });
											$.set_text(text_13, ` ${$1 ?? ''}`);
											$.set_text(text_14, $.get(result).examples.msftOption249);
										},
										[
											() => clipboard.isCopied('msft'),
											() => clipboard.isCopied('msft') ? 'Copied' : 'Copy'
										]
									);

									$.delegated('click', button_6, () => clipboard.copy($.get(result).examples.msftOption249, 'msft'));
									$.append($$anchor, div_32);
								};

								$.if(node_28, ($$render) => {
									if ($.get(result).examples.msftOption249) $$render(consequent_8);
								});
							}

							$.reset(div_27);
							$.append($$anchor, div_27);
						};

						$.if(node_23, ($$render) => {
							if ($.get(result) && $.get(networkValidationErrors).length === 0) $$render(consequent_9);
						});
					}

					$.delegated('click', button_1, addRoute);
					$.append($$anchor, fragment_4);
				};

				var alternate_1 = ($$anchor) => {
					var fragment_5 = root_15();
					var div_34 = $.first_child(fragment_5);
					var div_35 = $.sibling($.child(div_34), 2);
					var div_36 = $.child(div_35);
					var label_6 = $.child(div_36);
					var node_30 = $.child(label_6);

					Icon(node_30, { name: 'code', size: 'sm' });
					$.next();
					$.reset(label_6);

					var textarea = $.sibling(label_6, 2);

					$.remove_textarea_child(textarea);
					$.reset(div_36);

					var button_7 = $.sibling(div_36, 2);
					var node_31 = $.child(button_7);

					Icon(node_31, { name: 'search', size: 'sm' });
					$.next();
					$.reset(button_7);
					$.reset(div_35);
					$.reset(div_34);

					var node_32 = $.sibling(div_34, 2);

					{
						var consequent_11 = ($$anchor) => {
							var div_37 = root_3();
							var node_33 = $.sibling($.child(div_37), 2);

							$.each(node_33, 17, () => $.get(validationErrors), $.index, ($$anchor, error) => {
								var div_38 = root_2();
								var node_34 = $.child(div_38);

								Icon(node_34, { name: 'alert-triangle', size: 'sm' });

								var text_15 = $.sibling(node_34);

								$.reset(div_38);
								$.template_effect(() => $.set_text(text_15, ` ${$.get(error) ?? ''}`));
								$.append($$anchor, div_38);
							});

							$.reset(div_37);
							$.append($$anchor, div_37);
						};

						$.if(node_32, ($$render) => {
							if ($.get(validationErrors).length > 0) $$render(consequent_11);
						});
					}

					var node_35 = $.sibling(node_32, 2);

					{
						var consequent_12 = ($$anchor) => {
							var div_39 = root_14();
							var div_40 = $.sibling($.child(div_39), 2);
							var div_41 = $.child(div_40);
							var text_16 = $.sibling($.child(div_41));

							$.reset(div_41);

							var div_42 = $.sibling(div_41, 2);
							var text_17 = $.sibling($.child(div_42));

							$.reset(div_42);
							$.reset(div_40);

							var div_43 = $.sibling(div_40, 2);
							var node_36 = $.sibling($.child(div_43), 2);

							$.each(node_36, 17, () => $.get(decodeResult).routes, $.index, ($$anchor, route) => {
								var div_44 = root_13();
								var div_45 = $.child(div_44);
								var node_37 = $.child(div_45);

								Icon(node_37, { name: 'target', size: 'sm' });

								var span = $.sibling(node_37, 4);
								var text_18 = $.only_child(span, true);

								$.reset(div_45);

								var div_46 = $.sibling(div_45, 2);
								var node_38 = $.child(div_46);

								Icon(node_38, { name: 'arrow-right', size: 'sm' });

								var span_1 = $.sibling(node_38, 4);
								var text_19 = $.only_child(span_1, true);

								$.reset(div_46);
								$.reset(div_44);

								$.template_effect(() => {
									$.set_text(text_18, $.get(route).destination);
									$.set_text(text_19, $.get(route).gateway);
								});

								$.append($$anchor, div_44);
							});

							$.reset(div_43);
							$.reset(div_39);

							$.template_effect(() => {
								$.set_text(text_16, ` ${$.get(decodeResult).totalLength ?? ''} bytes`);
								$.set_text(text_17, ` ${$.get(decodeResult).routes.length ?? ''}`);
							});

							$.append($$anchor, div_39);
						};

						$.if(node_35, ($$render) => {
							if ($.get(decodeResult) && $.get(validationErrors).length === 0) $$render(consequent_12);
						});
					}

					$.bind_value(textarea, () => $.get(decodeInput), ($$value) => $.set(decodeInput, $$value));
					$.delegated('click', button_7, decode);
					$.append($$anchor, fragment_5);
				};

				$.if(node_1, ($$render) => {
					if ($.get(mode) === 'encode') $$render(consequent_10); else $$render(alternate_1, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);