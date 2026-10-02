import * as $ from 'svelte/internal/server';
import { untrack } from 'svelte';
import Icon from '$lib/components/global/Icon.svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import { useClipboard } from '$lib/composables';

import {
	buildFQDNOption,
	getDefaultFQDNConfig,
	validateFQDNConfig,
	FQDN_EXAMPLES
} from '$lib/utils/dhcpv6-fqdn-rfc4704';

export default function DHCPv6FQDN($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let config = getDefaultFQDNConfig();
		let result = null;
		let validationErrors = [];
		let selectedExampleIndex = null;
		const clipboard = useClipboard();

		function loadExample(example, index) {
			config = {
				fqdn: example.fqdn,
				serverShouldUpdate: example.serverShouldUpdate,
				serverOverride: example.serverOverride,
				clientShouldUpdate: example.clientShouldUpdate
			};

			selectedExampleIndex = index;
		}

		function checkIfExampleStillMatches() {
			if (selectedExampleIndex === null) return;

			const example = FQDN_EXAMPLES[selectedExampleIndex];

			if (!example) {
				selectedExampleIndex = null;

				return;
			}

			const matches = config.fqdn === example.fqdn && config.serverShouldUpdate === example.serverShouldUpdate && config.serverOverride === example.serverOverride && config.clientShouldUpdate === example.clientShouldUpdate;

			if (!matches) {
				selectedExampleIndex = null;
			}
		}

		ToolContentContainer($$renderer, {
			title: 'DHCPv6 Client FQDN Option (RFC 4704)',
			description: 'Configure the Client FQDN Option (Option 39) for DHCPv6, enabling dynamic DNS updates and hostname management for IPv6 clients.',
			children: ($$renderer) => {
				ExamplesCard($$renderer, {
					examples: FQDN_EXAMPLES,
					onSelect: loadExample,
					getLabel: (ex) => ex.label,
					getDescription: (ex) => ex.description,
					selectedIndex: selectedExampleIndex
				});

				$$renderer.push(`<!----> <div class="card input-card svelte-s55tf4"><div class="card-header svelte-s55tf4"><h3 class="svelte-s55tf4">FQDN Configuration</h3> <p class="help-text svelte-s55tf4">Fully Qualified Domain Name for the DHCPv6 client</p></div> <div class="card-content svelte-s55tf4"><div class="input-group svelte-s55tf4"><label for="fqdn" class="svelte-s55tf4">`);
				Icon($$renderer, { name: 'globe', size: 'sm' });
				$$renderer.push(`<!----> Fully Qualified Domain Name (FQDN)</label> <input id="fqdn" type="text"${$.attr('value', config.fqdn)} placeholder="client.example.com" class="svelte-s55tf4"/></div></div></div> <div class="card input-card svelte-s55tf4"><div class="card-header svelte-s55tf4"><h3 class="svelte-s55tf4">DNS Update Flags</h3> <p class="help-text svelte-s55tf4">Control how DNS updates are performed</p></div> <div class="card-content flags-content svelte-s55tf4"><div class="checkbox-group svelte-s55tf4"><input id="server-update" type="checkbox"${$.attr('checked', config.serverShouldUpdate, true)} class="svelte-s55tf4"/> <label for="server-update" class="svelte-s55tf4">`);
				Icon($$renderer, { name: 'server', size: 'sm' });
				$$renderer.push(`<!----> <div class="checkbox-text svelte-s55tf4"><strong class="svelte-s55tf4">Server Should Update DNS (S Flag)</strong> <span class="help-text svelte-s55tf4">Server will perform AAAA and PTR record updates</span></div></label></div> <div class="checkbox-group svelte-s55tf4"><input id="server-override" type="checkbox"${$.attr('checked', config.serverOverride, true)} class="svelte-s55tf4"/> <label for="server-override" class="svelte-s55tf4">`);
				Icon($$renderer, { name: 'shield', size: 'sm' });
				$$renderer.push(`<!----> <div class="checkbox-text svelte-s55tf4"><strong class="svelte-s55tf4">Server Override (O Flag)</strong> <span class="help-text svelte-s55tf4">Server can override client's preferences</span></div></label></div> <div class="checkbox-group svelte-s55tf4"><input id="client-update" type="checkbox"${$.attr('checked', config.clientShouldUpdate, true)} class="svelte-s55tf4"/> <label for="client-update" class="svelte-s55tf4">`);
				Icon($$renderer, { name: 'user', size: 'sm' });
				$$renderer.push(`<!----> <div class="checkbox-text svelte-s55tf4"><strong class="svelte-s55tf4">Client Should Update DNS (N Flag = 0)</strong> <span class="help-text svelte-s55tf4">Client will perform its own DNS updates</span></div></label></div></div></div> `);

				if (validationErrors.length > 0) {
					$$renderer.push(`<!--[0--><div class="card errors-card svelte-s55tf4"><h3 class="svelte-s55tf4">Validation Errors</h3> <!--[-->`);

					const each_array = $.ensure_array_like(validationErrors);

					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						let error = each_array[i];

						$$renderer.push(`<div class="error-message svelte-s55tf4">`);
						Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
						$$renderer.push(`<!----> ${$.escape(error)}</div>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (result && validationErrors.length === 0) {
					$$renderer.push(`<!--[0--><div class="card results svelte-s55tf4"><h3 class="svelte-s55tf4">Option 39: Client FQDN</h3> <div class="summary-card svelte-s55tf4"><div class="svelte-s55tf4"><strong class="svelte-s55tf4">FQDN:</strong> ${$.escape(result.fqdn)}</div> <div class="svelte-s55tf4"><strong class="svelte-s55tf4">Total Length:</strong> ${$.escape(result.totalLength)} bytes</div></div> <div class="flags-section svelte-s55tf4"><h4 class="svelte-s55tf4">Flags Breakdown</h4> <div class="flags-grid svelte-s55tf4"><div${$.attr_class('flag-item svelte-s55tf4', void 0, { 'active': result.flags.S })}>`);
					Icon($$renderer, { name: 'server', size: 'sm' });
					$$renderer.push(`<!----> <div class="flag-content svelte-s55tf4"><strong class="svelte-s55tf4">S Flag</strong> <span class="svelte-s55tf4">${$.escape(result.flags.S ? 'Set' : 'Not Set')}</span></div></div> <div${$.attr_class('flag-item svelte-s55tf4', void 0, { 'active': result.flags.O })}>`);
					Icon($$renderer, { name: 'shield', size: 'sm' });
					$$renderer.push(`<!----> <div class="flag-content svelte-s55tf4"><strong class="svelte-s55tf4">O Flag</strong> <span class="svelte-s55tf4">${$.escape(result.flags.O ? 'Set' : 'Not Set')}</span></div></div> <div${$.attr_class('flag-item svelte-s55tf4', void 0, { 'active': result.flags.N })}>`);
					Icon($$renderer, { name: 'user', size: 'sm' });
					$$renderer.push(`<!----> <div class="flag-content svelte-s55tf4"><strong class="svelte-s55tf4">N Flag</strong> <span class="svelte-s55tf4">${$.escape(result.flags.N ? 'Set' : 'Not Set')}</span></div></div></div> <div class="flag-descriptions svelte-s55tf4"><!--[-->`);

					const each_array_1 = $.ensure_array_like(result.flags.description);

					for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
						let desc = each_array_1[i];

						$$renderer.push(`<div class="flag-desc-item svelte-s55tf4">`);
						Icon($$renderer, { name: 'info', size: 'xs' });
						$$renderer.push(`<!----> ${$.escape(desc)}</div>`);
					}

					$$renderer.push(`<!--]--></div> <div class="output-group svelte-s55tf4"><div class="output-header svelte-s55tf4"><h4 class="svelte-s55tf4">Flags Byte</h4> <button type="button"${$.attr_class('copy-btn svelte-s55tf4', void 0, { 'copied': clipboard.isCopied('flags') })}>`);

					Icon($$renderer, {
						name: clipboard.isCopied('flags') ? 'check' : 'copy',
						size: 'xs'
					});

					$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('flags') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-s55tf4">${$.escape(result.flags.flagsByte)}</pre></div></div> <div class="output-group svelte-s55tf4"><div class="output-header svelte-s55tf4"><h4 class="svelte-s55tf4">Hex-Encoded (Compact)</h4> <button type="button"${$.attr_class('copy-btn svelte-s55tf4', void 0, { 'copied': clipboard.isCopied('hex') })}>`);

					Icon($$renderer, {
						name: clipboard.isCopied('hex') ? 'check' : 'copy',
						size: 'xs'
					});

					$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('hex') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-s55tf4">${$.escape(result.hexEncoded)}</pre></div> <div class="output-group svelte-s55tf4"><div class="output-header svelte-s55tf4"><h4 class="svelte-s55tf4">Wire Format (Spaced)</h4> <button type="button"${$.attr_class('copy-btn svelte-s55tf4', void 0, { 'copied': clipboard.isCopied('wire') })}>`);

					Icon($$renderer, {
						name: clipboard.isCopied('wire') ? 'check' : 'copy',
						size: 'xs'
					});

					$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('wire') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-s55tf4">${$.escape(result.wireFormat)}</pre></div> <div class="breakdown-section svelte-s55tf4"><h4 class="svelte-s55tf4">Encoding Breakdown</h4> <div class="breakdown-grid svelte-s55tf4"><div class="breakdown-item svelte-s55tf4"><span class="breakdown-label svelte-s55tf4">Flags:</span> <span class="breakdown-value svelte-s55tf4">${$.escape(result.breakdown.flags)}</span></div> <div class="breakdown-item svelte-s55tf4"><span class="breakdown-label svelte-s55tf4">FQDN:</span> <span class="breakdown-value svelte-s55tf4">${$.escape(result.breakdown.fqdn)}</span></div></div></div></div> `);

					if (result.examples.keaDhcp6) {
						$$renderer.push(`<!--[0--><div class="card results svelte-s55tf4"><h3 class="svelte-s55tf4">Configuration Example</h3> <div class="output-group svelte-s55tf4"><div class="output-header svelte-s55tf4"><h4 class="svelte-s55tf4">Kea DHCPv6 Configuration</h4> <button type="button"${$.attr_class('copy-btn svelte-s55tf4', void 0, { 'copied': clipboard.isCopied('kea') })}>`);

						Icon($$renderer, {
							name: clipboard.isCopied('kea') ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('kea') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-s55tf4">${$.escape(result.examples.keaDhcp6)}</pre></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <div class="card results info-card svelte-s55tf4"><h3 class="svelte-s55tf4">About RFC 4704</h3> <p class="svelte-s55tf4">RFC 4704 defines the Client FQDN Option for DHCPv6, enabling clients and servers to negotiate dynamic DNS
        updates for IPv6 addresses.</p> <ul class="svelte-s55tf4"><li class="svelte-s55tf4"><strong class="svelte-s55tf4">S Flag (Bit 0):</strong> Server should perform DNS updates</li> <li class="svelte-s55tf4"><strong class="svelte-s55tf4">O Flag (Bit 1):</strong> Server can override client preferences</li> <li class="svelte-s55tf4"><strong class="svelte-s55tf4">N Flag (Bit 2):</strong> Client requests server to perform updates (client will NOT update)</li></ul> <p class="svelte-s55tf4">The FQDN is encoded using DNS wire format with length-prefixed labels, enabling automated hostname registration
        in DNS for IPv6 networks.</p></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});
	});
}