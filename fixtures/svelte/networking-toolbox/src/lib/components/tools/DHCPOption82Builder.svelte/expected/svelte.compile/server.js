import * as $ from 'svelte/internal/server';
import { untrack } from 'svelte';
import Icon from '$lib/components/global/Icon.svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import { useClipboard } from '$lib/composables';
import { buildOption82, parseOption82, getDefaultOption82Config } from '$lib/utils/dhcp-option82.js';

export default function DHCPOption82Builder($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const modeOptions = [
			{ value: 'build', label: 'Build', icon: 'wrench' },
			{ value: 'parse', label: 'Parse', icon: 'search' }
		];

		let mode = 'build';
		let config = getDefaultOption82Config();
		let result = null;
		let parseInput = '';
		let parseResult = null;
		let validationErrors = [];
		let selectedExampleIndex = null;
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
		// Read config to track it
		// Untrack writes to prevent infinite loop
		// Track parseInput changes in parse mode
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		// Clear selected example when switching modes
		// Track mode to trigger effect
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

			validationErrors = errors;

			if (errors.length === 0) {
				result = buildOption82(cfg);
			} else {
				result = null;
			}
		}

		function parse() {
			if (!parseInput.trim()) {
				parseResult = null;
				validationErrors = [];

				return;
			}

			if (!(/^[0-9a-fA-F\s:]+$/).test(parseInput)) {
				validationErrors = ['Invalid hex input: only hexadecimal characters allowed'];
				parseResult = null;

				return;
			}

			validationErrors = [];
			parseResult = parseOption82(parseInput);
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

			selectedExampleIndex = index;
		}

		function loadParseExample(example, index) {
			parseInput = example.hexInput;
			selectedExampleIndex = index;
			parse();
		}

		function checkIfExampleStillMatches() {
			if (selectedExampleIndex === null) return;

			if (mode === 'build') {
				const example = buildExamples[selectedExampleIndex];

				if (!example) {
					selectedExampleIndex = null;

					return;
				}

				// Check if current config matches the selected example
				const matches = config.suboptions.length === 1 && config.suboptions[0].type === example.type && config.suboptions[0].format === example.format && config.suboptions[0].value === example.value;

				if (!matches) {
					selectedExampleIndex = null;
				}
			} else {
				const example = parseExamples[selectedExampleIndex];

				if (!example) {
					selectedExampleIndex = null;

					return;
				}

				// Check if parse input matches the selected example
				if (parseInput !== example.hexInput) {
					selectedExampleIndex = null;
				}
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ToolContentContainer($$renderer, {
				title: 'DHCP Option 82 Builder',
				description: 'Construct and parse DHCP Relay Agent Information (Option 82) with Circuit-ID, Remote-ID, and VLAN formats. Includes examples for relay ACLs and policies.',
				navOptions: modeOptions,
				get selectedNav() {
					return mode;
				},

				set selectedNav($$value) {
					mode = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (mode === 'build') {
						$$renderer.push('<!--[0-->');

						ExamplesCard($$renderer, {
							examples: buildExamples,
							onSelect: loadBuildExample,
							getLabel: (ex) => ex.label,
							getDescription: (ex) => ex.description,
							selectedIndex: selectedExampleIndex
						});
					} else {
						$$renderer.push('<!--[-1-->');

						ExamplesCard($$renderer, {
							examples: parseExamples,
							onSelect: loadParseExample,
							getLabel: (ex) => ex.label,
							getDescription: (ex) => ex.description,
							selectedIndex: selectedExampleIndex
						});
					}

					$$renderer.push(`<!--]--> `);

					if (mode === 'build') {
						$$renderer.push(`<!--[0--><div class="card input-card svelte-18sbsfb"><div class="card-header svelte-18sbsfb"><h3 class="svelte-18sbsfb">Configuration</h3></div> <div class="card-content svelte-18sbsfb"><!--[-->`);

						const each_array = $.ensure_array_like(config.suboptions);

						for (let i = 0, $$length = each_array.length; i < $$length; i++) {
							let suboption = each_array[i];

							$$renderer.push(`<div class="suboption-group svelte-18sbsfb"><div class="suboption-header svelte-18sbsfb"><h4 class="svelte-18sbsfb">Suboption ${$.escape(i + 1)}</h4> `);

							if (config.suboptions.length > 1) {
								$$renderer.push(`<!--[0--><button type="button" class="btn-icon svelte-18sbsfb">`);
								Icon($$renderer, { name: 'x', size: 'sm' });
								$$renderer.push(`<!----></button>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div> <div class="input-row svelte-18sbsfb"><div class="input-group svelte-18sbsfb"><label${$.attr('for', `type-${$.stringify(i)}`)} class="svelte-18sbsfb">`);
							Icon($$renderer, { name: 'tag', size: 'sm' });
							$$renderer.push(`<!----> Suboption Type</label> `);

							$$renderer.select(
								{
									id: `type-${$.stringify(i)}`,
									value: suboption.type,
									class: ''
								},
								($$renderer) => {
									$$renderer.option({ value: 'circuit-id' }, ($$renderer) => {
										$$renderer.push(`Circuit-ID (Suboption 1)`);
									});

									$$renderer.option({ value: 'remote-id' }, ($$renderer) => {
										$$renderer.push(`Remote-ID (Suboption 2)`);
									});
								},
								'svelte-18sbsfb'
							);

							$$renderer.push(`</div> <div class="input-group svelte-18sbsfb"><label${$.attr('for', `format-${$.stringify(i)}`)} class="svelte-18sbsfb">`);
							Icon($$renderer, { name: 'code', size: 'sm' });
							$$renderer.push(`<!----> Encoding Format</label> `);

							$$renderer.select(
								{
									id: `format-${$.stringify(i)}`,
									value: suboption.format,
									class: ''
								},
								($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_1 = $.ensure_array_like(formatOptions);

									for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
										let option = each_array_1[$$index];

										$$renderer.option({ value: option.value }, ($$renderer) => {
											$$renderer.push(`${$.escape(option.label)}`);
										});
									}

									$$renderer.push(`<!--]-->`);
								},
								'svelte-18sbsfb'
							);

							$$renderer.push(`</div></div> <div class="input-group svelte-18sbsfb"><label${$.attr('for', `value-${$.stringify(i)}`)} class="svelte-18sbsfb">`);
							Icon($$renderer, { name: 'edit', size: 'sm' });

							$$renderer.push(`<!----> Value</label> <input${$.attr('id', `value-${$.stringify(i)}`)} type="text"${$.attr('value', suboption.value)}${$.attr('placeholder', suboption.format === 'vlan-id'
								? '100'
								: suboption.format === 'hex' ? '001122334455' : 'Enter value')} class="svelte-18sbsfb"/></div></div>`);
						}

						$$renderer.push(`<!--]--> <button type="button" class="btn-add svelte-18sbsfb">`);
						Icon($$renderer, { name: 'plus', size: 'sm' });
						$$renderer.push(`<!----> Add Suboption</button></div></div> `);

						if (validationErrors.length > 0) {
							$$renderer.push(`<!--[0--><div class="card errors-card svelte-18sbsfb"><h3 class="svelte-18sbsfb">Validation Errors</h3> <!--[-->`);

							const each_array_2 = $.ensure_array_like(validationErrors);

							for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
								let error = each_array_2[i];

								$$renderer.push(`<div class="error-message svelte-18sbsfb">`);
								Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
								$$renderer.push(`<!----> ${$.escape(error)}</div>`);
							}

							$$renderer.push(`<!--]--></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (result && validationErrors.length === 0) {
							$$renderer.push(`<!--[0--><div class="card results svelte-18sbsfb"><h3 class="svelte-18sbsfb">Generated Option 82</h3> <div class="output-group svelte-18sbsfb"><div class="output-header svelte-18sbsfb"><h4 class="svelte-18sbsfb">Hex-Encoded Value</h4> <button type="button"${$.attr_class('copy-btn svelte-18sbsfb', void 0, { 'copied': clipboard.isCopied('hex') })}>`);

							Icon($$renderer, {
								name: clipboard.isCopied('hex') ? 'check' : 'copy',
								size: 'xs'
							});

							$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('hex') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-18sbsfb">${$.escape(result.hexEncoded)}</pre></div> <div class="breakdown-section svelte-18sbsfb"><h4 class="svelte-18sbsfb">Breakdown</h4> <!--[-->`);

							const each_array_3 = $.ensure_array_like(result.breakdown);

							for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
								let breakdown = each_array_3[i];

								$$renderer.push(`<div class="breakdown-item svelte-18sbsfb"><div class="breakdown-header svelte-18sbsfb"><strong class="svelte-18sbsfb">${$.escape(breakdown.type)} (Code ${$.escape(breakdown.typeCode)})</strong> <span class="breakdown-length svelte-18sbsfb">Length: ${$.escape(breakdown.length)} bytes</span></div> <p class="breakdown-desc svelte-18sbsfb">${$.escape(breakdown.description)}</p> <div class="breakdown-values svelte-18sbsfb"><div class="svelte-18sbsfb"><strong class="svelte-18sbsfb">Value:</strong> ${$.escape(breakdown.value)}</div> <div class="svelte-18sbsfb"><strong class="svelte-18sbsfb">Hex:</strong> ${$.escape(breakdown.hexValue)}</div></div></div>`);
							}

							$$renderer.push(`<!--]--></div> `);

							if (result.examples.iscDhcpd) {
								$$renderer.push(`<!--[0--><div class="output-group svelte-18sbsfb"><div class="output-header svelte-18sbsfb"><h4 class="svelte-18sbsfb">ISC dhcpd Configuration Example</h4> <button type="button"${$.attr_class('copy-btn svelte-18sbsfb', void 0, { 'copied': clipboard.isCopied('isc') })}>`);

								Icon($$renderer, {
									name: clipboard.isCopied('isc') ? 'check' : 'copy',
									size: 'xs'
								});

								$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('isc') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-18sbsfb">${$.escape(result.examples.iscDhcpd)}</pre></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (result.examples.keaDhcp4) {
								$$renderer.push(`<!--[0--><div class="output-group svelte-18sbsfb"><div class="output-header svelte-18sbsfb"><h4 class="svelte-18sbsfb">Kea DHCPv4 Configuration Example</h4> <button type="button"${$.attr_class('copy-btn svelte-18sbsfb', void 0, { 'copied': clipboard.isCopied('kea') })}>`);

								Icon($$renderer, {
									name: clipboard.isCopied('kea') ? 'check' : 'copy',
									size: 'xs'
								});

								$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('kea') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-18sbsfb">${$.escape(result.examples.keaDhcp4)}</pre></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (result.examples.ciscoRelay) {
								$$renderer.push(`<!--[0--><div class="output-group svelte-18sbsfb"><div class="output-header svelte-18sbsfb"><h4 class="svelte-18sbsfb">Cisco Relay Agent Example</h4> <button type="button"${$.attr_class('copy-btn svelte-18sbsfb', void 0, { 'copied': clipboard.isCopied('cisco') })}>`);

								Icon($$renderer, {
									name: clipboard.isCopied('cisco') ? 'check' : 'copy',
									size: 'xs'
								});

								$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('cisco') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-18sbsfb">${$.escape(result.examples.ciscoRelay)}</pre></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push(`<!--[-1--><div class="card input-card svelte-18sbsfb"><div class="card-header svelte-18sbsfb"><h3 class="svelte-18sbsfb">Parse Option 82 Hex</h3></div> <div class="card-content svelte-18sbsfb"><div class="input-group svelte-18sbsfb"><label for="parse-input" class="svelte-18sbsfb">`);
						Icon($$renderer, { name: 'code', size: 'sm' });
						$$renderer.push(`<!----> Hex-Encoded Option 82</label> <textarea id="parse-input" placeholder="Enter hex string (e.g., 01064769302f31020b7377312e6578616d706c65)" rows="4" class="svelte-18sbsfb">`);

						const $$body = $.escape(parseInput);

						if ($$body) {
							$$renderer.push(`${$$body}`);
						} else {}

						$$renderer.push(`</textarea></div> <button type="button" class="btn-primary svelte-18sbsfb">`);
						Icon($$renderer, { name: 'search', size: 'sm' });
						$$renderer.push(`<!----> Parse</button></div></div> `);

						if (validationErrors.length > 0) {
							$$renderer.push(`<!--[0--><div class="card errors-card svelte-18sbsfb"><h3 class="svelte-18sbsfb">Validation Errors</h3> <!--[-->`);

							const each_array_4 = $.ensure_array_like(validationErrors);

							for (let i = 0, $$length = each_array_4.length; i < $$length; i++) {
								let error = each_array_4[i];

								$$renderer.push(`<div class="error-message svelte-18sbsfb">`);
								Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
								$$renderer.push(`<!----> ${$.escape(error)}</div>`);
							}

							$$renderer.push(`<!--]--></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (parseResult && validationErrors.length === 0) {
							$$renderer.push(`<!--[0--><div class="card results svelte-18sbsfb"><h3 class="svelte-18sbsfb">Parsed Option 82</h3> <div class="parse-summary svelte-18sbsfb"><div class="svelte-18sbsfb"><strong class="svelte-18sbsfb">Total Length:</strong> ${$.escape(parseResult.totalLength)} bytes</div> <div class="svelte-18sbsfb"><strong class="svelte-18sbsfb">Suboptions Found:</strong> ${$.escape(parseResult.suboptions.length)}</div></div> <div class="breakdown-section svelte-18sbsfb"><h4 class="svelte-18sbsfb">Suboptions</h4> <!--[-->`);

							const each_array_5 = $.ensure_array_like(parseResult.suboptions);

							for (let i = 0, $$length = each_array_5.length; i < $$length; i++) {
								let suboption = each_array_5[i];

								$$renderer.push(`<div class="breakdown-item svelte-18sbsfb"><div class="breakdown-header svelte-18sbsfb"><strong class="svelte-18sbsfb">${$.escape(suboption.type)} (Code ${$.escape(suboption.typeCode)})</strong> <span class="breakdown-length svelte-18sbsfb">Length: ${$.escape(suboption.length)} bytes</span></div> <p class="breakdown-desc svelte-18sbsfb">${$.escape(suboption.description)}</p> <div class="breakdown-values svelte-18sbsfb"><div class="svelte-18sbsfb"><strong class="svelte-18sbsfb">Decoded Value:</strong> ${$.escape(suboption.value)}</div> <div class="svelte-18sbsfb"><strong class="svelte-18sbsfb">Hex Value:</strong> ${$.escape(suboption.hexValue)}</div></div></div>`);
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