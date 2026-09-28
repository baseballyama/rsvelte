import * as $ from 'svelte/internal/server';

import {
	buildGatewayOption,
	decodeGatewayOption,
	validateGatewayConfig,
	GATEWAY_EXAMPLES
} from '$lib/utils/dhcp-option3-gateway';

import { untrack } from 'svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import { useClipboard } from '$lib/composables/useClipboard.svelte';

export default function GatewayOption3($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const clipboard = useClipboard();
		let activeTab = 'build';

		// Build mode state
		let gateways = [''];

		let subnet = '';
		let buildResult = null;
		let buildErrors = [];

		// Decode mode state
		let hexInput = '';

		let decodeResult = null;
		let decodeError = '';

		const navOptions = [
			{ value: 'build', label: 'Build Option' },
			{ value: 'decode', label: 'Decode Option' }
		];

		const decodeExamples = [
			{
				label: 'Single Gateway',
				hexValue: 'c0a80101',
				description: '192.168.1.1'
			},

			{
				label: 'Dual Gateways',
				hexValue: 'c0a80101c0a80102',
				description: '192.168.1.1, 192.168.1.2'
			},

			{
				label: 'Google DNS Primary',
				hexValue: '08080808',
				description: '8.8.8.8'
			},

			{
				label: 'Common Home Router',
				hexValue: 'c0a8000a',
				description: '192.168.0.10'
			}
		];

		function loadExample(example) {
			activeTab = 'build';
			gateways = [...example.gateways];
			subnet = example.subnet || '';
		}

		function loadDecodeExample(example) {
			activeTab = 'decode';
			hexInput = example.hexValue;
		}

		function addGateway() {
			gateways = [...gateways, ''];
		}

		function removeGateway(index) {
			gateways = gateways.filter((_, i) => i !== index);

			if (gateways.length === 0) {
				gateways = [''];
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ToolContentContainer($$renderer, {
				title: 'DHCP Option 3 - Router/Default Gateway',
				description: 'Build and decode default gateway configuration. Multiple gateways can be specified for redundancy or load balancing, listed in order of preference.',
				navOptions,
				get selectedNav() {
					return activeTab;
				},

				set selectedNav($$value) {
					activeTab = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (activeTab === 'build') {
						$$renderer.push('<!--[0-->');

						ExamplesCard($$renderer, {
							examples: GATEWAY_EXAMPLES,
							onSelect: loadExample,
							getLabel: (ex) => ex.label,
							getDescription: (ex) => ex.description
						});

						$$renderer.push(`<!----> <div class="card input-card svelte-uliagc"><h3 class="svelte-uliagc">Gateway Configuration</h3> <div class="form-group svelte-uliagc"><label for="subnet" class="svelte-uliagc">Subnet (Optional - for validation)</label> <input id="subnet" type="text"${$.attr('value', subnet)} placeholder="e.g., 192.168.1.0/24" class="input svelte-uliagc"/> <span class="hint svelte-uliagc">If provided, gateways will be validated against this subnet</span></div> <div class="form-group svelte-uliagc"><label for="gateway-0" class="svelte-uliagc">Gateway Addresses (in order of preference)</label> <!--[-->`);

						const each_array = $.ensure_array_like(gateways);

						for (let i = 0, $$length = each_array.length; i < $$length; i++) {
							let _gateway = each_array[i];

							$$renderer.push(`<div class="gateway-row svelte-uliagc"><input${$.attr('id', i === 0 ? 'gateway-0' : undefined)} type="text"${$.attr('value', gateways[i])} placeholder="e.g., 192.168.1.1" class="input svelte-uliagc"${$.attr('aria-label', i > 0 ? `Gateway ${i + 1}` : undefined)}/> `);

							if (gateways.length > 1) {
								$$renderer.push(`<!--[0--><button class="btn btn-danger btn-sm svelte-uliagc">Remove</button>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div>`);
						}

						$$renderer.push(`<!--]--> <button class="btn btn-secondary btn-sm svelte-uliagc">Add Gateway</button></div> `);

						if (buildErrors.length > 0) {
							$$renderer.push(`<!--[0--><div class="error-card svelte-uliagc"><strong class="svelte-uliagc">Validation Errors:</strong> <ul class="svelte-uliagc"><!--[-->`);

							const each_array_1 = $.ensure_array_like(buildErrors);

							for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
								let error = each_array_1[i];

								$$renderer.push(`<li>${$.escape(error)}</li>`);
							}

							$$renderer.push(`<!--]--></ul></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> `);

						if (buildResult) {
							$$renderer.push(`<!--[0--><div class="card result-card svelte-uliagc"><h3 class="svelte-uliagc">Option 3 - Router</h3> <div class="result-grid svelte-uliagc"><div class="result-item svelte-uliagc"><span class="label svelte-uliagc">Gateways:</span> <div class="gateway-list svelte-uliagc"><!--[-->`);

							const each_array_2 = $.ensure_array_like(buildResult.gateways);

							for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
								let gw = each_array_2[i];

								$$renderer.push(`<span class="gateway-badge svelte-uliagc">${$.escape(i + 1)}. ${$.escape(gw)}</span>`);
							}

							$$renderer.push(`<!--]--></div></div> <div class="result-item svelte-uliagc"><span class="label svelte-uliagc">Hex Encoded:</span> <code class="code-value svelte-uliagc">${$.escape(buildResult.hexEncoded)}</code> <button${$.attr_class('btn-copy svelte-uliagc', void 0, { 'copied': clipboard.isCopied('hex') })} aria-label="Copy hex">${$.escape(clipboard.isCopied('hex') ? 'Copied' : 'Copy')}</button></div> <div class="result-item svelte-uliagc"><span class="label svelte-uliagc">Wire Format:</span> <code class="code-value svelte-uliagc">${$.escape(buildResult.wireFormat)}</code> <button${$.attr_class('btn-copy svelte-uliagc', void 0, { 'copied': clipboard.isCopied('wire') })} aria-label="Copy wire format">${$.escape(clipboard.isCopied('wire') ? 'Copied' : 'Copy')}</button></div> <div class="result-item svelte-uliagc"><span class="label svelte-uliagc">Total Length:</span> <span class="value svelte-uliagc">${$.escape(buildResult.totalLength)} bytes</span></div></div> <div class="config-section svelte-uliagc"><h4 class="svelte-uliagc">Configuration Examples</h4> <div class="output-group svelte-uliagc"><div class="output-header svelte-uliagc"><h5 class="svelte-uliagc">ISC DHCPd</h5> <button${$.attr_class('btn-copy svelte-uliagc', void 0, { 'copied': clipboard.isCopied('isc') })}>${$.escape(clipboard.isCopied('isc') ? 'Copied' : 'Copy')}</button></div> <pre class="code-block svelte-uliagc"><code class="svelte-uliagc">${$.escape(buildResult.configExamples.iscDhcpd)}</code></pre></div> <div class="output-group svelte-uliagc"><div class="output-header svelte-uliagc"><h5 class="svelte-uliagc">Kea DHCPv4</h5> <button${$.attr_class('btn-copy svelte-uliagc', void 0, { 'copied': clipboard.isCopied('kea') })}>${$.escape(clipboard.isCopied('kea') ? 'Copied' : 'Copy')}</button></div> <pre class="code-block svelte-uliagc"><code class="svelte-uliagc">${$.escape(buildResult.configExamples.keaDhcp4)}</code></pre></div> <div class="output-group svelte-uliagc"><div class="output-header svelte-uliagc"><h5 class="svelte-uliagc">dnsmasq</h5> <button${$.attr_class('btn-copy svelte-uliagc', void 0, { 'copied': clipboard.isCopied('dnsmasq') })}>${$.escape(clipboard.isCopied('dnsmasq') ? 'Copied' : 'Copy')}</button></div> <pre class="code-block svelte-uliagc"><code class="svelte-uliagc">${$.escape(buildResult.configExamples.dnsmasq)}</code></pre></div></div></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push('<!--[-1-->');

						ExamplesCard($$renderer, {
							examples: decodeExamples,
							onSelect: loadDecodeExample,
							getLabel: (ex) => ex.label,
							getDescription: (ex) => ex.description
						});

						$$renderer.push(`<!----> <div class="card input-card svelte-uliagc"><h3 class="svelte-uliagc">Decode Option 3</h3> <div class="form-group svelte-uliagc"><label for="hex-input" class="svelte-uliagc">Hex String</label> <textarea id="hex-input" placeholder="e.g., c0a80101 or c0 a8 01 01" rows="3" class="input svelte-uliagc">`);

						const $$body = $.escape(hexInput);

						if ($$body) {
							$$renderer.push(`${$$body}`);
						} else {}

						$$renderer.push(`</textarea> <span class="hint svelte-uliagc">Enter hex bytes (spaces optional)</span></div> `);

						if (decodeError) {
							$$renderer.push(`<!--[0--><div class="error-card svelte-uliagc"><strong class="svelte-uliagc">Decode Error:</strong> <p class="svelte-uliagc">${$.escape(decodeError)}</p></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> `);

						if (decodeResult) {
							$$renderer.push(`<!--[0--><div class="card result-card svelte-uliagc"><h3 class="svelte-uliagc">Decoded Option 3</h3> <div class="result-grid svelte-uliagc"><div class="result-item svelte-uliagc"><span class="label svelte-uliagc">Gateways:</span> <div class="gateway-list svelte-uliagc"><!--[-->`);

							const each_array_3 = $.ensure_array_like(decodeResult.gateways);

							for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
								let gw = each_array_3[i];

								$$renderer.push(`<span class="gateway-badge svelte-uliagc">${$.escape(i + 1)}. ${$.escape(gw)}</span>`);
							}

							$$renderer.push(`<!--]--></div></div> <div class="result-item svelte-uliagc"><span class="label svelte-uliagc">Total Length:</span> <span class="value svelte-uliagc">${$.escape(decodeResult.totalLength)} bytes</span></div> <div class="result-item svelte-uliagc"><span class="label svelte-uliagc">Gateway Count:</span> <span class="value svelte-uliagc">${$.escape(decodeResult.gateways.length)}</span></div></div> <div class="config-section svelte-uliagc"><h4 class="svelte-uliagc">Configuration Examples</h4> <div class="output-group svelte-uliagc"><div class="output-header svelte-uliagc"><h5 class="svelte-uliagc">ISC DHCPd</h5> <button${$.attr_class('btn-copy svelte-uliagc', void 0, { 'copied': clipboard.isCopied('decode-isc') })}>${$.escape(clipboard.isCopied('decode-isc') ? 'Copied' : 'Copy')}</button></div> <pre class="code-block svelte-uliagc"><code class="svelte-uliagc">${$.escape(decodeResult.configExamples.iscDhcpd)}</code></pre></div> <div class="output-group svelte-uliagc"><div class="output-header svelte-uliagc"><h5 class="svelte-uliagc">Kea DHCPv4</h5> <button${$.attr_class('btn-copy svelte-uliagc', void 0, { 'copied': clipboard.isCopied('decode-kea') })}>${$.escape(clipboard.isCopied('decode-kea') ? 'Copied' : 'Copy')}</button></div> <pre class="code-block svelte-uliagc"><code class="svelte-uliagc">${$.escape(decodeResult.configExamples.keaDhcp4)}</code></pre></div> <div class="output-group svelte-uliagc"><div class="output-header svelte-uliagc"><h5 class="svelte-uliagc">dnsmasq</h5> <button${$.attr_class('btn-copy svelte-uliagc', void 0, { 'copied': clipboard.isCopied('decode-dnsmasq') })}>${$.escape(clipboard.isCopied('decode-dnsmasq') ? 'Copied' : 'Copy')}</button></div> <pre class="code-block svelte-uliagc"><code class="svelte-uliagc">${$.escape(decodeResult.configExamples.dnsmasq)}</code></pre></div></div></div>`);
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