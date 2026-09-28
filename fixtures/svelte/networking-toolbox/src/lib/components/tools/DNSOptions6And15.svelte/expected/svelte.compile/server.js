import * as $ from 'svelte/internal/server';

import {
	buildDNSOptions,
	decodeDNSServersOption,
	decodeDomainNameOption,
	validateDNSConfig,
	DNS_EXAMPLES
} from '$lib/utils/dhcp-options6-15-dns';

import { untrack } from 'svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import { useClipboard } from '$lib/composables/useClipboard.svelte';
import { tooltip } from '$lib/actions/tooltip';

export default function DNSOptions6And15($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const clipboard = useClipboard();
		let activeTab = 'build';

		// Build mode state
		let dnsServers = [''];

		let domainName = '';
		let buildResult = null;
		let buildErrors = [];

		// Decode mode state
		let decodeOption = 'option6';

		let hexInput = '';
		let decodeResult = null;
		let decodeError = '';

		const navOptions = [
			{ value: 'build', label: 'Build Options' },
			{ value: 'decode', label: 'Decode Options' }
		];

		const decodeExamples = [
			{
				label: 'Google DNS (Option 6)',
				hexValue: '08080808 08080404',
				description: '8.8.8.8, 8.8.4.4',
				option: 'option6'
			},

			{
				label: 'Cloudflare DNS (Option 6)',
				hexValue: '01010101 01000001',
				description: '1.1.1.1, 1.0.0.1',
				option: 'option6'
			},

			{
				label: 'example.com (Option 15)',
				hexValue: '6578616d706c6503636f6d00',
				description: 'example.com domain',
				option: 'option15'
			},

			{
				label: 'local.domain (Option 15)',
				hexValue: '056c6f63616c06646f6d61696e00',
				description: 'local.domain',
				option: 'option15'
			}
		];

		function loadExample(example) {
			activeTab = 'build';
			dnsServers = [...example.dnsServers];
			domainName = example.domainName;
		}

		function loadDecodeExample(example) {
			activeTab = 'decode';
			decodeOption = example.option;
			hexInput = example.hexValue;
		}

		function addDNSServer() {
			dnsServers = [...dnsServers, ''];
		}

		function removeDNSServer(index) {
			dnsServers = dnsServers.filter((_, i) => i !== index);

			if (dnsServers.length === 0) {
				dnsServers = [''];
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ToolContentContainer($$renderer, {
				title: 'DHCP Options 6 & 15 - DNS Servers and Domain',
				description: 'Option 6 specifies DNS servers for name resolution, while Option 15 provides the domain name for client hostname resolution. These options work together for complete DNS configuration.',
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
							examples: DNS_EXAMPLES,
							onSelect: loadExample,
							getLabel: (ex) => ex.label,
							getDescription: (ex) => ex.description
						});

						$$renderer.push(`<!----> <div class="card input-card svelte-18fg3vi"><h3 class="svelte-18fg3vi">DNS Configuration</h3> <fieldset class="form-group svelte-18fg3vi"><legend class="svelte-18fg3vi">DNS Servers (Option 6)</legend> <!--[-->`);

						const each_array = $.ensure_array_like(dnsServers);

						for (let i = 0, $$length = each_array.length; i < $$length; i++) {
							let _server = each_array[i];

							$$renderer.push(`<div class="server-row svelte-18fg3vi"><input type="text"${$.attr('value', dnsServers[i])} placeholder="e.g., 8.8.8.8" class="input svelte-18fg3vi"/> `);

							if (dnsServers.length > 1) {
								$$renderer.push(`<!--[0--><button class="btn btn-danger btn-sm svelte-18fg3vi">Remove</button>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div>`);
						}

						$$renderer.push(`<!--]--> <button class="btn btn-secondary btn-sm svelte-18fg3vi">Add DNS Server</button></fieldset> <div class="form-group svelte-18fg3vi"><label for="domain-name" class="svelte-18fg3vi">Domain Name (Option 15)</label> <input id="domain-name" type="text"${$.attr('value', domainName)} placeholder="e.g., example.com" class="input svelte-18fg3vi"/> <span class="hint svelte-18fg3vi">Domain name for client hostname resolution</span></div> `);

						if (buildErrors.length > 0) {
							$$renderer.push(`<!--[0--><div class="error-card svelte-18fg3vi"><strong class="svelte-18fg3vi">Validation Errors:</strong> <ul class="svelte-18fg3vi"><!--[-->`);

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
							$$renderer.push(`<!--[0--><div class="card result-card svelte-18fg3vi"><h3 class="svelte-18fg3vi">DHCP DNS Options</h3> `);

							if (buildResult.option6) {
								$$renderer.push(`<!--[0--><div class="option-section svelte-18fg3vi"><h4 class="svelte-18fg3vi">Option 6 - DNS Servers</h4> <div class="result-grid svelte-18fg3vi"><div class="result-item svelte-18fg3vi"><span class="label svelte-18fg3vi">DNS Servers:</span> <div class="servers-list svelte-18fg3vi"><!--[-->`);

								const each_array_2 = $.ensure_array_like(buildResult.option6.servers);

								for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
									let srv = each_array_2[i];

									$$renderer.push(`<span class="server-badge svelte-18fg3vi">${$.escape(srv)}</span>`);
								}

								$$renderer.push(`<!--]--></div></div> <div class="result-item svelte-18fg3vi"><span class="label svelte-18fg3vi">Hex Encoded:</span> <code class="code-value svelte-18fg3vi">${$.escape(buildResult.option6.hexEncoded)}</code> <button${$.attr_class('btn-copy svelte-18fg3vi', void 0, { 'copied': clipboard.isCopied('option6-hex') })} aria-label="Copy hex">${$.escape(clipboard.isCopied('option6-hex') ? 'Copied' : 'Copy')}</button></div> <div class="result-item svelte-18fg3vi"><span class="label svelte-18fg3vi">Wire Format:</span> <code class="code-value svelte-18fg3vi">${$.escape(buildResult.option6.wireFormat)}</code> <button${$.attr_class('btn-copy svelte-18fg3vi', void 0, { 'copied': clipboard.isCopied('option6-wire') })} aria-label="Copy wire format">${$.escape(clipboard.isCopied('option6-wire') ? 'Copied' : 'Copy')}</button></div> <div class="result-item svelte-18fg3vi"><span class="label svelte-18fg3vi">Total Length:</span> <span class="value svelte-18fg3vi">${$.escape(buildResult.option6.totalLength)} bytes</span></div></div></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (buildResult.option15) {
								$$renderer.push(`<!--[0--><div class="option-section svelte-18fg3vi"><h4 class="svelte-18fg3vi">Option 15 - Domain Name</h4> <div class="result-grid svelte-18fg3vi"><div class="result-item svelte-18fg3vi"><span class="label svelte-18fg3vi">Domain:</span> <span class="value svelte-18fg3vi">${$.escape(buildResult.option15.domain)}</span></div> <div class="result-item svelte-18fg3vi"><span class="label svelte-18fg3vi">Hex Encoded:</span> <code class="code-value svelte-18fg3vi">${$.escape(buildResult.option15.hexEncoded)}</code> <button${$.attr_class('btn-copy svelte-18fg3vi', void 0, { 'copied': clipboard.isCopied('option15-hex') })} aria-label="Copy hex">${$.escape(clipboard.isCopied('option15-hex') ? 'Copied' : 'Copy')}</button></div> <div class="result-item svelte-18fg3vi"><span class="label svelte-18fg3vi">Wire Format:</span> <code class="code-value svelte-18fg3vi">${$.escape(buildResult.option15.wireFormat)}</code> <button${$.attr_class('btn-copy svelte-18fg3vi', void 0, { 'copied': clipboard.isCopied('option15-wire') })} aria-label="Copy wire format">${$.escape(clipboard.isCopied('option15-wire') ? 'Copied' : 'Copy')}</button></div> <div class="result-item svelte-18fg3vi"><span class="label svelte-18fg3vi">Total Length:</span> <span class="value svelte-18fg3vi">${$.escape(buildResult.option15.totalLength)} bytes</span></div></div></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> <div class="config-section svelte-18fg3vi"><h4 class="svelte-18fg3vi">Configuration Examples</h4> <div class="output-group svelte-18fg3vi"><div class="output-header svelte-18fg3vi"><h5 class="svelte-18fg3vi">ISC DHCPd</h5> <button${$.attr_class('btn-copy svelte-18fg3vi', void 0, { 'copied': clipboard.isCopied('isc') })}>${$.escape(clipboard.isCopied('isc') ? 'Copied' : 'Copy')}</button></div> <pre class="code-block svelte-18fg3vi"><code class="svelte-18fg3vi">${$.escape(buildResult.configExamples.iscDhcpd)}</code></pre></div> <div class="output-group svelte-18fg3vi"><div class="output-header svelte-18fg3vi"><h5 class="svelte-18fg3vi">Kea DHCPv4</h5> <button${$.attr_class('btn-copy svelte-18fg3vi', void 0, { 'copied': clipboard.isCopied('kea') })}>${$.escape(clipboard.isCopied('kea') ? 'Copied' : 'Copy')}</button></div> <pre class="code-block svelte-18fg3vi"><code class="svelte-18fg3vi">${$.escape(buildResult.configExamples.keaDhcp4)}</code></pre></div> <div class="output-group svelte-18fg3vi"><div class="output-header svelte-18fg3vi"><h5 class="svelte-18fg3vi">dnsmasq</h5> <button${$.attr_class('btn-copy svelte-18fg3vi', void 0, { 'copied': clipboard.isCopied('dnsmasq') })}>${$.escape(clipboard.isCopied('dnsmasq') ? 'Copied' : 'Copy')}</button></div> <pre class="code-block svelte-18fg3vi"><code class="svelte-18fg3vi">${$.escape(buildResult.configExamples.dnsmasq)}</code></pre></div></div></div>`);
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

						$$renderer.push(`<!----> <div class="card input-card svelte-18fg3vi"><h3 class="svelte-18fg3vi">Decode DNS Options</h3> <fieldset class="form-group svelte-18fg3vi"><legend class="svelte-18fg3vi">Option to Decode</legend> <div class="option-select svelte-18fg3vi"><label${$.attr_class('radio-label svelte-18fg3vi', void 0, { 'selected': decodeOption === 'option6' })}><input type="radio"${$.attr('checked', decodeOption === 'option6', true)} value="option6" class="svelte-18fg3vi"/> <span class="radio-text svelte-18fg3vi">Option 6 - DNS Servers</span></label> <label${$.attr_class('radio-label svelte-18fg3vi', void 0, { 'selected': decodeOption === 'option15' })}><input type="radio"${$.attr('checked', decodeOption === 'option15', true)} value="option15" class="svelte-18fg3vi"/> <span class="radio-text svelte-18fg3vi">Option 15 - Domain Name</span></label></div></fieldset> <div class="form-group svelte-18fg3vi"><label for="hex-input" class="svelte-18fg3vi">Hex String</label> <textarea id="hex-input"${$.attr('placeholder', decodeOption === 'option6'
							? 'e.g., 08080808 or 08 08 08 08 08 08 04 04'
							: 'e.g., 6578616d706c6503636f6d')} rows="3" class="input svelte-18fg3vi">`);

						const $$body = $.escape(hexInput);

						if ($$body) {
							$$renderer.push(`${$$body}`);
						} else {}

						$$renderer.push(`</textarea> <span class="hint svelte-18fg3vi">Enter hex bytes (spaces optional)</span></div> `);

						if (decodeError) {
							$$renderer.push(`<!--[0--><div class="error-card svelte-18fg3vi"><strong class="svelte-18fg3vi">Decode Error:</strong> <p class="svelte-18fg3vi">${$.escape(decodeError)}</p></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> `);

						if (decodeResult) {
							$$renderer.push(`<!--[0--><div class="card result-card svelte-18fg3vi"><h3 class="svelte-18fg3vi">Decoded ${$.escape(decodeOption === 'option6' ? 'Option 6' : 'Option 15')}</h3> `);

							if (decodeOption === 'option6') {
								$$renderer.push(`<!--[0--><div class="result-grid svelte-18fg3vi"><div class="result-item svelte-18fg3vi"><span class="label svelte-18fg3vi">DNS Servers:</span> <div class="servers-list svelte-18fg3vi"><!--[-->`);

								const each_array_3 = $.ensure_array_like(decodeResult.servers);

								for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
									let srv = each_array_3[i];

									$$renderer.push(`<span class="server-badge svelte-18fg3vi">${$.escape(srv)}</span>`);
								}

								$$renderer.push(`<!--]--></div></div> <div class="result-item svelte-18fg3vi"><span class="label svelte-18fg3vi">Server Count:</span> <span class="value svelte-18fg3vi">${$.escape(decodeResult.servers.length)}</span></div> <div class="result-item svelte-18fg3vi"><span class="label svelte-18fg3vi">Total Length:</span> <span class="value svelte-18fg3vi">${$.escape(decodeResult.totalLength)} bytes</span></div></div>`);
							} else {
								$$renderer.push(`<!--[-1--><div class="result-grid svelte-18fg3vi"><div class="result-item svelte-18fg3vi"><span class="label svelte-18fg3vi">Domain Name:</span> <span class="value svelte-18fg3vi">${$.escape(decodeResult.domain)}</span></div> <div class="result-item svelte-18fg3vi"><span class="label svelte-18fg3vi">Total Length:</span> <span class="value svelte-18fg3vi">${$.escape(decodeResult.totalLength)} bytes</span></div></div>`);
							}

							$$renderer.push(`<!--]--></div>`);
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