import * as $ from 'svelte/internal/server';

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

export default function IAIDCalculator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let method = 'interface-index';
		let interfaceIndex = undefined;
		let interfaceName = '';
		let macAddress = '';
		let customValue = undefined;
		let validationErrors = [];
		let result = null;
		let selectedExampleIndex = null;
		const clipboard = useClipboard();
		const examples = IAID_EXAMPLES.map((ex) => ({ label: ex.name, config: ex, description: ex.description }));

		function loadExample(example, index) {
			const cfg = example.config;

			method = cfg.method;
			interfaceIndex = cfg.interfaceIndex;
			interfaceName = cfg.interfaceName || '';
			macAddress = cfg.macAddress || '';
			customValue = cfg.customValue;
			selectedExampleIndex = index;
		}

		function checkIfExampleStillMatches() {
			if (selectedExampleIndex === null) return;

			const example = examples[selectedExampleIndex];

			if (!example) {
				selectedExampleIndex = null;

				return;
			}

			const cfg = example.config;
			const matches = method === cfg.method && interfaceIndex === cfg.interfaceIndex && interfaceName === (cfg.interfaceName || '') && macAddress === (cfg.macAddress || '') && customValue === cfg.customValue;

			if (!matches) {
				selectedExampleIndex = null;
			}
		}

		ToolContentContainer($$renderer, {
			title: 'IAID Calculator',
			description: 'Calculate Identity Association Identifier (IAID) for DHCPv6 interfaces. Generate IAIDs from interface index, name, MAC address, or custom values with OS-specific conventions.',
			children: ($$renderer) => {
				ExamplesCard($$renderer, {
					examples,
					onSelect: loadExample,
					getLabel: (ex) => ex.label,
					getDescription: (ex) => ex.description,
					selectedIndex: selectedExampleIndex
				});

				$$renderer.push(`<!----> <div class="card input-card svelte-1htabut"><div class="card-header svelte-1htabut"><h3 class="svelte-1htabut">IAID Configuration</h3> <p class="help-text svelte-1htabut">Select method to generate Identity Association Identifier</p></div> <div class="card-content svelte-1htabut"><div class="input-group svelte-1htabut"><label for="method" class="svelte-1htabut">`);
				Icon($$renderer, { name: 'settings', size: 'sm' });
				$$renderer.push(`<!----> Generation Method</label> `);

				$$renderer.select(
					{ id: 'method', value: method, class: '' },
					($$renderer) => {
						$$renderer.option({ value: 'interface-index' }, ($$renderer) => {
							$$renderer.push(`Interface Index`);
						});

						$$renderer.option({ value: 'interface-name' }, ($$renderer) => {
							$$renderer.push(`Interface Name (hash)`);
						});

						$$renderer.option({ value: 'mac-address' }, ($$renderer) => {
							$$renderer.push(`MAC Address (hash)`);
						});

						$$renderer.option({ value: 'custom' }, ($$renderer) => {
							$$renderer.push(`Custom Value`);
						});
					},
					'svelte-1htabut'
				);

				$$renderer.push(`</div> `);

				if (method === 'interface-index') {
					$$renderer.push(`<!--[0--><div class="input-group svelte-1htabut"><label for="interface-index" class="svelte-1htabut">`);
					Icon($$renderer, { name: 'hash', size: 'sm' });
					$$renderer.push(`<!----> Interface Index</label> <input id="interface-index" type="number"${$.attr('value', interfaceIndex)} placeholder="e.g., 2 for eth0, 3 for wlan0" min="0" max="4294967295" class="svelte-1htabut"/> <small class="svelte-1htabut">Network interface index (0-4294967295)</small></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (method === 'interface-name') {
					$$renderer.push(`<!--[0--><div class="input-group svelte-1htabut"><label for="interface-name" class="svelte-1htabut">`);
					Icon($$renderer, { name: 'network', size: 'sm' });
					$$renderer.push(`<!----> Interface Name</label> <input id="interface-name" type="text"${$.attr('value', interfaceName)} placeholder="e.g., eth0, wlan0, enp3s0" class="svelte-1htabut"/> <small class="svelte-1htabut">Network interface name (will be hashed to generate IAID)</small></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (method === 'mac-address') {
					$$renderer.push(`<!--[0--><div class="input-group svelte-1htabut"><label for="mac-address" class="svelte-1htabut">`);
					Icon($$renderer, { name: 'cpu', size: 'sm' });
					$$renderer.push(`<!----> MAC Address</label> <input id="mac-address" type="text"${$.attr('value', macAddress)} placeholder="00:0c:29:4f:a3:d2" class="svelte-1htabut"/> <small class="svelte-1htabut">Hardware address (last 4 bytes used for IAID)</small></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (method === 'custom') {
					$$renderer.push(`<!--[0--><div class="input-group svelte-1htabut"><label for="custom-value" class="svelte-1htabut">`);
					Icon($$renderer, { name: 'edit', size: 'sm' });
					$$renderer.push(`<!----> Custom IAID Value</label> <input id="custom-value" type="number"${$.attr('value', customValue)} placeholder="Enter value between 0 and 4294967295" min="0" max="4294967295" class="svelte-1htabut"/> <small class="svelte-1htabut">32-bit unsigned integer (0-4294967295)</small></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div> `);

				if (validationErrors.length > 0) {
					$$renderer.push(`<!--[0--><div class="card errors-card svelte-1htabut"><h3 class="svelte-1htabut">Validation Errors</h3> <!--[-->`);

					const each_array = $.ensure_array_like(validationErrors);

					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						let error = each_array[i];

						$$renderer.push(`<div class="error-message svelte-1htabut">`);
						Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
						$$renderer.push(`<!----> ${$.escape(error)}</div>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (result && validationErrors.length === 0) {
					$$renderer.push(`<!--[0--><div class="card results svelte-1htabut"><h3 class="svelte-1htabut">Calculated IAID</h3> <div class="summary-card svelte-1htabut"><div class="svelte-1htabut"><strong class="svelte-1htabut">Method:</strong> ${$.escape(result.method)}</div> <div class="svelte-1htabut"><strong class="svelte-1htabut">IAID:</strong> ${$.escape(result.iaid)}</div></div> `);

					if (result.collisionWarning) {
						$$renderer.push(`<!--[0--><div class="warning-card svelte-1htabut">`);
						Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
						$$renderer.push(`<!----> ${$.escape(result.collisionWarning)}</div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <div class="output-group svelte-1htabut"><div class="output-header svelte-1htabut"><h4 class="svelte-1htabut">Hexadecimal</h4> <button type="button"${$.attr_class('copy-btn svelte-1htabut', void 0, { 'copied': clipboard.isCopied('hex') })}>`);

					Icon($$renderer, {
						name: clipboard.isCopied('hex') ? 'check' : 'copy',
						size: 'xs'
					});

					$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('hex') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-1htabut">${$.escape(result.hex)}</pre></div> <div class="output-group svelte-1htabut"><div class="output-header svelte-1htabut"><h4 class="svelte-1htabut">Decimal</h4> <button type="button"${$.attr_class('copy-btn svelte-1htabut', void 0, { 'copied': clipboard.isCopied('decimal') })}>`);

					Icon($$renderer, {
						name: clipboard.isCopied('decimal') ? 'check' : 'copy',
						size: 'xs'
					});

					$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('decimal') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-1htabut">${$.escape(result.decimal)}</pre></div> <div class="output-group svelte-1htabut"><div class="output-header svelte-1htabut"><h4 class="svelte-1htabut">Binary</h4> <button type="button"${$.attr_class('copy-btn svelte-1htabut', void 0, { 'copied': clipboard.isCopied('binary') })}>`);

					Icon($$renderer, {
						name: clipboard.isCopied('binary') ? 'check' : 'copy',
						size: 'xs'
					});

					$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('binary') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-1htabut">${$.escape(result.binary)}</pre></div></div> <div class="card results svelte-1htabut"><h3 class="svelte-1htabut">OS-Specific Conventions</h3> <p class="help-text">How different operating systems typically generate IAIDs</p> <div class="os-conventions svelte-1htabut"><!--[-->`);

					const each_array_1 = $.ensure_array_like([
						{
							icon: 'linux',
							name: 'Linux',
							text: result.osConventions.linux
						},

						{
							icon: 'windows',
							name: 'Windows',
							text: result.osConventions.windows
						},
						{ icon: 'mac', name: 'macOS', text: result.osConventions.macos },
						{
							icon: 'bsd',
							name: 'FreeBSD',
							text: result.osConventions.freebsd
						}
					]);

					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let os = each_array_1[$$index_1];

						if (os.text) {
							$$renderer.push(`<!--[0--><div class="os-item svelte-1htabut"><div class="os-label svelte-1htabut">`);
							Icon($$renderer, { name: os.icon, size: 'sm' });
							$$renderer.push(`<!----> <strong class="svelte-1htabut">${$.escape(os.name)}</strong></div> <div class="os-description svelte-1htabut">${$.escape(os.text)}</div></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					}

					$$renderer.push(`<!--]--></div></div> <!--[-->`);

					const each_array_2 = $.ensure_array_like([
						{
							title: 'Kea DHCPv6 Configuration',
							content: result?.configExamples?.keaDhcp6,
							key: 'kea'
						},

						{
							title: 'ISC DHCPd Configuration',
							content: result?.configExamples?.iscDhcpd,
							key: 'isc'
						}
					]);

					for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
						let config = each_array_2[$$index_2];

						if (config.content) {
							$$renderer.push(`<!--[0--><div class="card results svelte-1htabut"><div class="card-header-with-action svelte-1htabut"><h3 class="svelte-1htabut">${$.escape(config.title)}</h3> <button type="button"${$.attr_class('copy-btn svelte-1htabut', void 0, { 'copied': clipboard.isCopied(config.key) })}>`);

							Icon($$renderer, {
								name: clipboard.isCopied(config.key) ? 'check' : 'copy',
								size: 'xs'
							});

							$$renderer.push(`<!----> ${$.escape(clipboard.isCopied(config.key) ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-1htabut">${$.escape(config.content)}</pre></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <div class="card naming-guide-wrap svelte-1htabut"><h3 class="svelte-1htabut">Network Interface Naming Guide</h3> <p class="help-text">Common interface naming conventions across different operating systems</p> <div class="naming-guide svelte-1htabut"><!--[-->`);

				const each_array_3 = $.ensure_array_like([
					{ icon: 'linux', data: INTERFACE_NAMING_GUIDE.linux },
					{ icon: 'windows', data: INTERFACE_NAMING_GUIDE.windows },
					{ icon: 'mac', data: INTERFACE_NAMING_GUIDE.macos },
					{ icon: 'bsd', data: INTERFACE_NAMING_GUIDE.freebsd }
				]);

				for (let $$index_4 = 0, $$length = each_array_3.length; $$index_4 < $$length; $$index_4++) {
					let osGuide = each_array_3[$$index_4];

					$$renderer.push(`<div class="naming-os svelte-1htabut"><div class="naming-os-header svelte-1htabut">`);
					Icon($$renderer, { name: osGuide.icon, size: 'sm' });
					$$renderer.push(`<!----> <strong class="svelte-1htabut">${$.escape(osGuide.data.title)}</strong></div> <div class="naming-conventions svelte-1htabut"><!--[-->`);

					const each_array_4 = $.ensure_array_like(osGuide.data.conventions);

					for (let $$index_3 = 0, $$length = each_array_4.length; $$index_3 < $$length; $$index_3++) {
						let convention = each_array_4[$$index_3];

						$$renderer.push(`<div class="naming-item svelte-1htabut"><code class="naming-pattern svelte-1htabut">${$.escape(convention.pattern)}</code> <span class="naming-description svelte-1htabut">${$.escape(convention.description)}</span></div>`);
					}

					$$renderer.push(`<!--]--></div></div>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			},
			$$slots: { default: true }
		});
	});
}