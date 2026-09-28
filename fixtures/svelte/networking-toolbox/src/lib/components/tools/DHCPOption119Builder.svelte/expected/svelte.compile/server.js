import * as $ from 'svelte/internal/server';
import { untrack } from 'svelte';
import Icon from '$lib/components/global/Icon.svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import { useClipboard } from '$lib/composables';
import { buildOption119, parseOption119, getDefaultOption119Config } from '$lib/utils/dhcp-option119.js';

export default function DHCPOption119Builder($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const modeOptions = [
			{ value: 'encode', label: 'Encode', icon: 'wrench' },
			{ value: 'decode', label: 'Decode', icon: 'search' }
		];

		let mode = 'encode';

		let config = {
			...getDefaultOption119Config(),
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
		// Track config and all its nested properties
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		// Clear selected example when switching modes
		function validateAndEncode(cfg = config) {
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

			validationErrors = domainErrors;
			networkValidationErrors = netErrors;

			if (domainErrors.length === 0) {
				try {
					result = buildOption119(cfg);
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
				decodeResult = parseOption119(decodeInput);
			} catch(error) {
				validationErrors = [error instanceof Error ? error.message : 'Decoding failed'];
				decodeResult = null;
			}
		}

		function addDomain() {
			config.domains = [...config.domains, ''];
		}

		function removeDomain(index) {
			if (config.domains.length > 1) {
				config.domains = config.domains.filter((_, i) => i !== index);
			}
		}

		function loadEncodeExample(example, index) {
			config = {
				domains: [...example.domains],
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
				const matches = config.domains.length === example.domains.length && config.domains.every((_domain, i) => _domain === example.domains[i]);

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
				title: 'DHCP Option 119 - Domain Search List',
				description: 'Encode and decode Domain Search List (RFC 3397/6731) to/from RFC 1035 wire format with domain compression. Generate configurations for ISC dhcpd and Kea DHCP.',
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
						$$renderer.push(`<!--[0--><div class="card input-card svelte-1j5wk32"><div class="card-header svelte-1j5wk32"><h3 class="svelte-1j5wk32">Domain List</h3></div> <div class="card-content svelte-1j5wk32"><!--[-->`);

						const each_array = $.ensure_array_like(config.domains);

						for (let i = 0, $$length = each_array.length; i < $$length; i++) {
							let _ = each_array[i];

							$$renderer.push(`<div class="domain-group svelte-1j5wk32"><div class="domain-header svelte-1j5wk32"><h4 class="svelte-1j5wk32">`);
							Icon($$renderer, { name: 'globe', size: 'sm' });
							$$renderer.push(`<!---->Domain ${$.escape(i + 1)}</h4> `);

							if (config.domains.length > 1) {
								$$renderer.push(`<!--[0--><button type="button" class="btn-icon svelte-1j5wk32">`);
								Icon($$renderer, { name: 'x', size: 'sm' });
								$$renderer.push(`<!----></button>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div> <div class="input-group svelte-1j5wk32"><input${$.attr('id', `domain-${$.stringify(i)}`)} type="text"${$.attr('value', config.domains[i])} placeholder="example.com" class="svelte-1j5wk32"/></div></div>`);
						}

						$$renderer.push(`<!--]--> <button type="button" class="btn-add svelte-1j5wk32">`);
						Icon($$renderer, { name: 'plus', size: 'sm' });
						$$renderer.push(`<!----> Add Domain</button></div></div> `);

						if (validationErrors.length > 0) {
							$$renderer.push(`<!--[0--><div class="card errors-card svelte-1j5wk32"><h3 class="svelte-1j5wk32">Validation Errors</h3> <!--[-->`);

							const each_array_1 = $.ensure_array_like(validationErrors);

							for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
								let error = each_array_1[i];

								$$renderer.push(`<div class="error-message svelte-1j5wk32">`);
								Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
								$$renderer.push(`<!----> ${$.escape(error)}</div>`);
							}

							$$renderer.push(`<!--]--></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (result && validationErrors.length === 0) {
							$$renderer.push(`<!--[0--><div class="card results svelte-1j5wk32"><h3 class="svelte-1j5wk32">Encoded Option 119</h3> <div class="output-group svelte-1j5wk32"><div class="output-header svelte-1j5wk32"><h4 class="svelte-1j5wk32">Hex-Encoded (Compact)</h4> <button type="button"${$.attr_class('copy-btn svelte-1j5wk32', void 0, { 'copied': clipboard.isCopied('hex') })}>`);

							Icon($$renderer, {
								name: clipboard.isCopied('hex') ? 'check' : 'copy',
								size: 'xs'
							});

							$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('hex') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-1j5wk32">${$.escape(result.hexEncoded)}</pre></div> <div class="output-group svelte-1j5wk32"><div class="output-header svelte-1j5wk32"><h4 class="svelte-1j5wk32">Wire Format (Spaced)</h4> <button type="button"${$.attr_class('copy-btn svelte-1j5wk32', void 0, { 'copied': clipboard.isCopied('wire') })}>`);

							Icon($$renderer, {
								name: clipboard.isCopied('wire') ? 'check' : 'copy',
								size: 'xs'
							});

							$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('wire') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-1j5wk32">${$.escape(result.wireFormat)}</pre></div> <div class="summary-card svelte-1j5wk32"><div class="svelte-1j5wk32"><strong class="svelte-1j5wk32">Total Length:</strong> ${$.escape(result.totalLength)} bytes</div> <div class="svelte-1j5wk32"><strong class="svelte-1j5wk32">Domains:</strong> ${$.escape(result.domainList.length)}</div></div></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> <hr/> `);

						if (result) {
							$$renderer.push(`<!--[0--><div class="card input-card svelte-1j5wk32"><div class="card-header svelte-1j5wk32"><h3 class="svelte-1j5wk32">Network Settings (Optional)</h3> <p class="help-text svelte-1j5wk32">Customize network values for configuration examples below</p></div> <div class="card-content svelte-1j5wk32"><div class="input-row svelte-1j5wk32"><div class="input-group svelte-1j5wk32"><label for="subnet" class="svelte-1j5wk32">`);
							Icon($$renderer, { name: 'network', size: 'sm' });
							$$renderer.push(`<!----> Subnet</label> <input id="subnet" type="text"${$.attr('value', config.network.subnet)} placeholder="192.168.1.0" class="svelte-1j5wk32"/></div> <div class="input-group svelte-1j5wk32"><label for="netmask" class="svelte-1j5wk32">`);
							Icon($$renderer, { name: 'network', size: 'sm' });
							$$renderer.push(`<!----> Netmask</label> <input id="netmask" type="text"${$.attr('value', config.network.netmask)} placeholder="255.255.255.0" class="svelte-1j5wk32"/></div></div> <div class="input-row svelte-1j5wk32"><div class="input-group svelte-1j5wk32"><label for="range-start" class="svelte-1j5wk32">`);
							Icon($$renderer, { name: 'arrow-right', size: 'sm' });
							$$renderer.push(`<!----> Range Start</label> <input id="range-start" type="text"${$.attr('value', config.network.rangeStart)} placeholder="192.168.1.100" class="svelte-1j5wk32"/></div> <div class="input-group svelte-1j5wk32"><label for="range-end" class="svelte-1j5wk32">`);
							Icon($$renderer, { name: 'arrow-right', size: 'sm' });
							$$renderer.push(`<!----> Range End</label> <input id="range-end" type="text"${$.attr('value', config.network.rangeEnd)} placeholder="192.168.1.200" class="svelte-1j5wk32"/></div></div></div> `);

							if (networkValidationErrors.length > 0) {
								$$renderer.push(`<!--[0--><div class="network-errors svelte-1j5wk32"><h4 class="svelte-1j5wk32">Network Settings Errors</h4> <!--[-->`);

								const each_array_2 = $.ensure_array_like(networkValidationErrors);

								for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
									let error = each_array_2[i];

									$$renderer.push(`<div class="network-error-item svelte-1j5wk32">`);
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
							$$renderer.push(`<!--[0--><div class="card results svelte-1j5wk32"><h3 class="svelte-1j5wk32">Configuration Examples</h3> `);

							if (result.examples.iscDhcpd) {
								$$renderer.push(`<!--[0--><div class="output-group svelte-1j5wk32"><div class="output-header svelte-1j5wk32"><h4 class="svelte-1j5wk32">ISC dhcpd Configuration</h4> <button type="button"${$.attr_class('copy-btn svelte-1j5wk32', void 0, { 'copied': clipboard.isCopied('isc') })}>`);

								Icon($$renderer, {
									name: clipboard.isCopied('isc') ? 'check' : 'copy',
									size: 'xs'
								});

								$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('isc') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-1j5wk32">${$.escape(result.examples.iscDhcpd)}</pre></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (result.examples.keaDhcp4) {
								$$renderer.push(`<!--[0--><div class="output-group svelte-1j5wk32"><div class="output-header svelte-1j5wk32"><h4 class="svelte-1j5wk32">Kea DHCPv4 Configuration</h4> <button type="button"${$.attr_class('copy-btn svelte-1j5wk32', void 0, { 'copied': clipboard.isCopied('kea') })}>`);

								Icon($$renderer, {
									name: clipboard.isCopied('kea') ? 'check' : 'copy',
									size: 'xs'
								});

								$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('kea') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-1j5wk32">${$.escape(result.examples.keaDhcp4)}</pre></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push(`<!--[-1--><div class="card input-card svelte-1j5wk32"><div class="card-header svelte-1j5wk32"><h3 class="svelte-1j5wk32">Decode Option 119 Hex</h3></div> <div class="card-content svelte-1j5wk32"><div class="input-group svelte-1j5wk32"><label for="decode-input" class="svelte-1j5wk32">`);
						Icon($$renderer, { name: 'code', size: 'sm' });
						$$renderer.push(`<!----> Hex-Encoded Option 119</label> <textarea id="decode-input" placeholder="Enter hex string (e.g., 0765786d706c6503636f6d00)" rows="4" class="svelte-1j5wk32">`);

						const $$body = $.escape(decodeInput);

						if ($$body) {
							$$renderer.push(`${$$body}`);
						} else {}

						$$renderer.push(`</textarea></div> <button type="button" class="btn-primary svelte-1j5wk32">`);
						Icon($$renderer, { name: 'search', size: 'sm' });
						$$renderer.push(`<!----> Decode</button></div></div> `);

						if (validationErrors.length > 0) {
							$$renderer.push(`<!--[0--><div class="card errors-card svelte-1j5wk32"><h3 class="svelte-1j5wk32">Validation Errors</h3> <!--[-->`);

							const each_array_3 = $.ensure_array_like(validationErrors);

							for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
								let error = each_array_3[i];

								$$renderer.push(`<div class="error-message svelte-1j5wk32">`);
								Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
								$$renderer.push(`<!----> ${$.escape(error)}</div>`);
							}

							$$renderer.push(`<!--]--></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (decodeResult && validationErrors.length === 0) {
							$$renderer.push(`<!--[0--><div class="card results svelte-1j5wk32"><h3 class="svelte-1j5wk32">Decoded Domain Search List</h3> <div class="summary-card svelte-1j5wk32"><div class="svelte-1j5wk32"><strong class="svelte-1j5wk32">Total Length:</strong> ${$.escape(decodeResult.totalLength)} bytes</div> <div class="svelte-1j5wk32"><strong class="svelte-1j5wk32">Domains Found:</strong> ${$.escape(decodeResult.domains.length)}</div></div> <div class="domains-section svelte-1j5wk32"><h4 class="svelte-1j5wk32">Domain List</h4> <!--[-->`);

							const each_array_4 = $.ensure_array_like(decodeResult.domains);

							for (let i = 0, $$length = each_array_4.length; i < $$length; i++) {
								let domain = each_array_4[i];

								$$renderer.push(`<div class="domain-item svelte-1j5wk32">`);
								Icon($$renderer, { name: 'globe', size: 'sm' });
								$$renderer.push(`<!----> <span>${$.escape(domain)}</span></div>`);
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