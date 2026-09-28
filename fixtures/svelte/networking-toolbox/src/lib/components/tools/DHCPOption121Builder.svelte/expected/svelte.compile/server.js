import * as $ from 'svelte/internal/server';
import { untrack } from 'svelte';
import Icon from '$lib/components/global/Icon.svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import { useClipboard } from '$lib/composables';
import { buildOption121, parseOption121, getDefaultOption121Config } from '$lib/utils/dhcp-option121.js';

export default function DHCPOption121Builder($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const modeOptions = [
			{ value: 'encode', label: 'Encode', icon: 'wrench' },
			{ value: 'decode', label: 'Decode', icon: 'search' }
		];

		let mode = 'encode';

		let config = {
			...getDefaultOption121Config(),
			network: { subnet: '', netmask: '', rangeStart: '', rangeEnd: '' }
		};

		let result = null;
		let decodeInput = '';
		let decodeResult = null;
		let validationErrors = [];
		let networkValidationErrors = [];
		let selectedExampleIndex = null;
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
		// Track config and all its nested properties
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		// Clear selected example when switching modes
		function validateAndEncode(cfg = config) {
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

			validationErrors = routeErrors;
			networkValidationErrors = netErrors;

			if (routeErrors.length === 0) {
				try {
					result = buildOption121(cfg);
				} catch(error) {
					validationErrors = [error instanceof Error ? error.message : 'Encoding failed'];
					result = null;
				}
			} else {
				result = null;
			}
		}

		function decode() {
			if (!decodeInput.trim()) {
				decodeResult = null;
				validationErrors = [];

				return;
			}

			if (!(/^[0-9a-fA-F\s:]+$/).test(decodeInput)) {
				validationErrors = ['Invalid hex input: only hexadecimal characters allowed'];
				decodeResult = null;

				return;
			}

			try {
				validationErrors = [];
				decodeResult = parseOption121(decodeInput);
			} catch(error) {
				validationErrors = [error instanceof Error ? error.message : 'Decoding failed'];
				decodeResult = null;
			}
		}

		function addRoute() {
			config.routes = [...config.routes, { destination: '', gateway: '' }];
		}

		function removeRoute(index) {
			if (config.routes.length > 1) {
				config.routes = config.routes.filter((_, i) => i !== index);
			}
		}

		function loadEncodeExample(example, index) {
			config = {
				routes: example.routes.map((r) => ({ ...r })),
				network: { subnet: '', netmask: '', rangeStart: '', rangeEnd: '' }
			};

			selectedExampleIndex = index;
		}

		function loadDecodeExample(example, index) {
			decodeInput = example.hexInput;
			selectedExampleIndex = index;
			decode();
		}

		function checkIfExampleStillMatches() {
			if (selectedExampleIndex === null) return;

			if (mode === 'encode') {
				const example = encodeExamples[selectedExampleIndex];

				if (!example) {
					selectedExampleIndex = null;

					return;
				}

				// Check if current config matches the selected example
				const matches = config.routes.length === example.routes.length && config.routes.every((route, i) => route.destination === example.routes[i].destination && route.gateway === example.routes[i].gateway);

				if (!matches) {
					selectedExampleIndex = null;
				}
			} else {
				const example = decodeExamples[selectedExampleIndex];

				if (!example) {
					selectedExampleIndex = null;

					return;
				}

				if (decodeInput !== example.hexInput) {
					selectedExampleIndex = null;
				}
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ToolContentContainer($$renderer, {
				title: 'DHCP Option 121/249 - Classless Static Routes',
				description: 'Encode and decode Classless Static Routes (RFC 3442 / MSFT 249) with bit-packed network prefixes. Generate configurations for ISC dhcpd and Kea DHCP.',
				navOptions: modeOptions,
				get selectedNav() {
					return mode;
				},

				set selectedNav($$value) {
					mode = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (mode === 'encode') {
						$$renderer.push('<!--[0-->');

						ExamplesCard($$renderer, {
							examples: encodeExamples,
							onSelect: loadEncodeExample,
							getLabel: (ex) => ex.label,
							getDescription: (ex) => ex.description,
							selectedIndex: selectedExampleIndex
						});
					} else {
						$$renderer.push('<!--[-1-->');

						ExamplesCard($$renderer, {
							examples: decodeExamples,
							onSelect: loadDecodeExample,
							getLabel: (ex) => ex.label,
							getDescription: (ex) => ex.description,
							selectedIndex: selectedExampleIndex
						});
					}

					$$renderer.push(`<!--]--> `);

					if (mode === 'encode') {
						$$renderer.push(`<!--[0--><div class="card input-card svelte-tmsj25"><div class="card-header svelte-tmsj25"><h3 class="svelte-tmsj25">Static Routes</h3></div> <div class="card-content svelte-tmsj25"><!--[-->`);

						const each_array = $.ensure_array_like(config.routes);

						for (let i = 0, $$length = each_array.length; i < $$length; i++) {
							let _ = each_array[i];

							$$renderer.push(`<div class="route-group svelte-tmsj25"><div class="route-header svelte-tmsj25"><h4 class="svelte-tmsj25">`);
							Icon($$renderer, { name: 'compass', size: 'sm' });
							$$renderer.push(`<!---->Route ${$.escape(i + 1)}</h4> `);

							if (config.routes.length > 1) {
								$$renderer.push(`<!--[0--><button type="button" class="btn-icon svelte-tmsj25">`);
								Icon($$renderer, { name: 'x', size: 'sm' });
								$$renderer.push(`<!----></button>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div> <div class="input-row svelte-tmsj25"><div class="input-group svelte-tmsj25"><label${$.attr('for', `destination-${$.stringify(i)}`)} class="svelte-tmsj25">`);
							Icon($$renderer, { name: 'target', size: 'sm' });
							$$renderer.push(`<!----> Destination (CIDR)</label> <input${$.attr('id', `destination-${$.stringify(i)}`)} type="text"${$.attr('value', config.routes[i].destination)} placeholder="10.0.0.0/8" class="svelte-tmsj25"/></div> <div class="input-group svelte-tmsj25"><label${$.attr('for', `gateway-${$.stringify(i)}`)} class="svelte-tmsj25">`);
							Icon($$renderer, { name: 'arrow-right', size: 'sm' });
							$$renderer.push(`<!----> Gateway</label> <input${$.attr('id', `gateway-${$.stringify(i)}`)} type="text"${$.attr('value', config.routes[i].gateway)} placeholder="192.168.1.1" class="svelte-tmsj25"/></div></div></div>`);
						}

						$$renderer.push(`<!--]--> <button type="button" class="btn-add svelte-tmsj25">`);
						Icon($$renderer, { name: 'plus', size: 'sm' });
						$$renderer.push(`<!----> Add Route</button></div></div> `);

						if (validationErrors.length > 0) {
							$$renderer.push(`<!--[0--><div class="card errors-card svelte-tmsj25"><h3 class="svelte-tmsj25">Validation Errors</h3> <!--[-->`);

							const each_array_1 = $.ensure_array_like(validationErrors);

							for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
								let error = each_array_1[i];

								$$renderer.push(`<div class="error-message svelte-tmsj25">`);
								Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
								$$renderer.push(`<!----> ${$.escape(error)}</div>`);
							}

							$$renderer.push(`<!--]--></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (result && validationErrors.length === 0) {
							$$renderer.push(`<!--[0--><div class="card results svelte-tmsj25"><h3 class="svelte-tmsj25">Encoded Option 121/249</h3> <div class="output-group svelte-tmsj25"><div class="output-header svelte-tmsj25"><h4 class="svelte-tmsj25">Hex-Encoded (Compact)</h4> <button type="button"${$.attr_class('copy-btn svelte-tmsj25', void 0, { 'copied': clipboard.isCopied('hex') })}>`);

							Icon($$renderer, {
								name: clipboard.isCopied('hex') ? 'check' : 'copy',
								size: 'xs'
							});

							$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('hex') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-tmsj25">${$.escape(result.hexEncoded)}</pre></div> <div class="output-group svelte-tmsj25"><div class="output-header svelte-tmsj25"><h4 class="svelte-tmsj25">Wire Format (Spaced)</h4> <button type="button"${$.attr_class('copy-btn svelte-tmsj25', void 0, { 'copied': clipboard.isCopied('wire') })}>`);

							Icon($$renderer, {
								name: clipboard.isCopied('wire') ? 'check' : 'copy',
								size: 'xs'
							});

							$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('wire') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-tmsj25">${$.escape(result.wireFormat)}</pre></div> <div class="summary-card svelte-tmsj25"><div class="svelte-tmsj25"><strong class="svelte-tmsj25">Total Length:</strong> ${$.escape(result.totalLength)} bytes</div> <div class="svelte-tmsj25"><strong class="svelte-tmsj25">Routes:</strong> ${$.escape(result.routes.length)}</div></div></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> <hr/> `);

						if (result) {
							$$renderer.push(`<!--[0--><div class="card input-card svelte-tmsj25"><div class="card-header svelte-tmsj25"><h3 class="svelte-tmsj25">Network Settings (Optional)</h3> <p class="help-text svelte-tmsj25">Customize network values for configuration examples below</p></div> <div class="card-content svelte-tmsj25"><div class="input-row svelte-tmsj25"><div class="input-group svelte-tmsj25"><label for="subnet" class="svelte-tmsj25">`);
							Icon($$renderer, { name: 'network', size: 'sm' });
							$$renderer.push(`<!----> Subnet</label> <input id="subnet" type="text"${$.attr('value', config.network.subnet)} placeholder="192.168.1.0" class="svelte-tmsj25"/></div> <div class="input-group svelte-tmsj25"><label for="netmask" class="svelte-tmsj25">`);
							Icon($$renderer, { name: 'network', size: 'sm' });
							$$renderer.push(`<!----> Netmask</label> <input id="netmask" type="text"${$.attr('value', config.network.netmask)} placeholder="255.255.255.0" class="svelte-tmsj25"/></div></div> <div class="input-row svelte-tmsj25"><div class="input-group svelte-tmsj25"><label for="range-start" class="svelte-tmsj25">`);
							Icon($$renderer, { name: 'arrow-right', size: 'sm' });
							$$renderer.push(`<!----> Range Start</label> <input id="range-start" type="text"${$.attr('value', config.network.rangeStart)} placeholder="192.168.1.100" class="svelte-tmsj25"/></div> <div class="input-group svelte-tmsj25"><label for="range-end" class="svelte-tmsj25">`);
							Icon($$renderer, { name: 'arrow-right', size: 'sm' });
							$$renderer.push(`<!----> Range End</label> <input id="range-end" type="text"${$.attr('value', config.network.rangeEnd)} placeholder="192.168.1.200" class="svelte-tmsj25"/></div></div></div> `);

							if (networkValidationErrors.length > 0) {
								$$renderer.push(`<!--[0--><div class="network-errors svelte-tmsj25"><h4 class="svelte-tmsj25">Network Settings Errors</h4> <!--[-->`);

								const each_array_2 = $.ensure_array_like(networkValidationErrors);

								for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
									let error = each_array_2[i];

									$$renderer.push(`<div class="network-error-item svelte-tmsj25">`);
									Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
									$$renderer.push(`<!----> ${$.escape(error)}</div>`);
								}

								$$renderer.push(`<!--]--></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (result && networkValidationErrors.length === 0) {
							$$renderer.push(`<!--[0--><div class="card results svelte-tmsj25"><h3 class="svelte-tmsj25">Configuration Examples</h3> `);

							if (result.examples.iscDhcpd) {
								$$renderer.push(`<!--[0--><div class="output-group svelte-tmsj25"><div class="output-header svelte-tmsj25"><h4 class="svelte-tmsj25">ISC dhcpd Configuration (Option 121)</h4> <button type="button"${$.attr_class('copy-btn svelte-tmsj25', void 0, { 'copied': clipboard.isCopied('isc') })}>`);

								Icon($$renderer, {
									name: clipboard.isCopied('isc') ? 'check' : 'copy',
									size: 'xs'
								});

								$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('isc') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-tmsj25">${$.escape(result.examples.iscDhcpd)}</pre></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (result.examples.keaDhcp4) {
								$$renderer.push(`<!--[0--><div class="output-group svelte-tmsj25"><div class="output-header svelte-tmsj25"><h4 class="svelte-tmsj25">Kea DHCPv4 Configuration</h4> <button type="button"${$.attr_class('copy-btn svelte-tmsj25', void 0, { 'copied': clipboard.isCopied('kea') })}>`);

								Icon($$renderer, {
									name: clipboard.isCopied('kea') ? 'check' : 'copy',
									size: 'xs'
								});

								$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('kea') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-tmsj25">${$.escape(result.examples.keaDhcp4)}</pre></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (result.examples.msftOption249) {
								$$renderer.push(`<!--[0--><div class="output-group svelte-tmsj25"><div class="output-header svelte-tmsj25"><h4 class="svelte-tmsj25">Microsoft Option 249 Configuration</h4> <button type="button"${$.attr_class('copy-btn svelte-tmsj25', void 0, { 'copied': clipboard.isCopied('msft') })}>`);

								Icon($$renderer, {
									name: clipboard.isCopied('msft') ? 'check' : 'copy',
									size: 'xs'
								});

								$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('msft') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-tmsj25">${$.escape(result.examples.msftOption249)}</pre></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push(`<!--[-1--><div class="card input-card svelte-tmsj25"><div class="card-header svelte-tmsj25"><h3 class="svelte-tmsj25">Decode Option 121/249 Hex</h3></div> <div class="card-content svelte-tmsj25"><div class="input-group svelte-tmsj25"><label for="decode-input" class="svelte-tmsj25">`);
						Icon($$renderer, { name: 'code', size: 'sm' });
						$$renderer.push(`<!----> Hex-Encoded Option 121/249</label> <textarea id="decode-input" placeholder="Enter hex string (e.g., 080ac0a80101acc01000c0a80101)" rows="4" class="svelte-tmsj25">`);

						const $$body = $.escape(decodeInput);

						if ($$body) {
							$$renderer.push(`${$$body}`);
						} else {}

						$$renderer.push(`</textarea></div> <button type="button" class="btn-primary svelte-tmsj25">`);
						Icon($$renderer, { name: 'search', size: 'sm' });
						$$renderer.push(`<!----> Decode</button></div></div> `);

						if (validationErrors.length > 0) {
							$$renderer.push(`<!--[0--><div class="card errors-card svelte-tmsj25"><h3 class="svelte-tmsj25">Validation Errors</h3> <!--[-->`);

							const each_array_3 = $.ensure_array_like(validationErrors);

							for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
								let error = each_array_3[i];

								$$renderer.push(`<div class="error-message svelte-tmsj25">`);
								Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
								$$renderer.push(`<!----> ${$.escape(error)}</div>`);
							}

							$$renderer.push(`<!--]--></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (decodeResult && validationErrors.length === 0) {
							$$renderer.push(`<!--[0--><div class="card results svelte-tmsj25"><h3 class="svelte-tmsj25">Decoded Classless Static Routes</h3> <div class="summary-card svelte-tmsj25"><div class="svelte-tmsj25"><strong class="svelte-tmsj25">Total Length:</strong> ${$.escape(decodeResult.totalLength)} bytes</div> <div class="svelte-tmsj25"><strong class="svelte-tmsj25">Routes Found:</strong> ${$.escape(decodeResult.routes.length)}</div></div> <div class="routes-section svelte-tmsj25"><h4 class="svelte-tmsj25">Route List</h4> <!--[-->`);

							const each_array_4 = $.ensure_array_like(decodeResult.routes);

							for (let i = 0, $$length = each_array_4.length; i < $$length; i++) {
								let route = each_array_4[i];

								$$renderer.push(`<div class="route-item svelte-tmsj25"><div class="route-field svelte-tmsj25">`);
								Icon($$renderer, { name: 'target', size: 'sm' });
								$$renderer.push(`<!----> <span class="field-label svelte-tmsj25">Destination:</span> <span class="field-value svelte-tmsj25">${$.escape(route.destination)}</span></div> <div class="route-field svelte-tmsj25">`);
								Icon($$renderer, { name: 'arrow-right', size: 'sm' });
								$$renderer.push(`<!----> <span class="field-label svelte-tmsj25">Gateway:</span> <span class="field-value svelte-tmsj25">${$.escape(route.gateway)}</span></div></div>`);
							}

							$$renderer.push(`<!--]--></div></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}