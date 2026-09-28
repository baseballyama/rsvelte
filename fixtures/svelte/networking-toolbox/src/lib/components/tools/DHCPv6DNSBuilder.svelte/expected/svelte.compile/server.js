import * as $ from 'svelte/internal/server';
import { untrack } from 'svelte';
import Icon from '$lib/components/global/Icon.svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import { useClipboard } from '$lib/composables';

import {
	buildDNSv6Options,
	getDefaultDNSv6Config,
	validateDNSv6Config,
	DNSv6_EXAMPLES
} from '$lib/utils/dhcpv6-dns-rfc3646';

export default function DHCPv6DNSBuilder($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let config = {
			...getDefaultDNSv6Config(),
			dnsServers: [''],
			searchDomains: ['']
		};

		let result = null;
		let validationErrors = [];
		let selectedExampleIndex = null;
		const clipboard = useClipboard();

		const examples = [
			{
				label: 'Google Public DNS',
				config: DNSv6_EXAMPLES[0],
				description: 'Google Public DNS servers with example.com search domains'
			},

			{
				label: 'Cloudflare DNS',
				config: DNSv6_EXAMPLES[1],
				description: 'Cloudflare 1.1.1.1 DNS with local search domain'
			},

			{
				label: 'Quad9 DNS',
				config: DNSv6_EXAMPLES[2],
				description: 'Quad9 DNS with corporate search domains'
			},

			{
				label: 'Local Network',
				config: DNSv6_EXAMPLES[3],
				description: 'Local ULA DNS server with home.arpa domain'
			}
		];

		function loadExample(example, index) {
			config = {
				dnsServers: [...example.config.dnsServers],
				searchDomains: [...example.config.searchDomains]
			};

			selectedExampleIndex = index;
		}

		function checkIfExampleStillMatches() {
			if (selectedExampleIndex === null) return;

			const example = examples[selectedExampleIndex];

			if (!example) {
				selectedExampleIndex = null;

				return;
			}

			const dnsMatch = config.dnsServers.length === example.config.dnsServers.length && config.dnsServers.every((s, i) => s === example.config.dnsServers[i]);
			const searchMatch = config.searchDomains.length === example.config.searchDomains.length && config.searchDomains.every((d, i) => d === example.config.searchDomains[i]);

			if (!dnsMatch || !searchMatch) {
				selectedExampleIndex = null;
			}
		}

		function addDNSServer() {
			config.dnsServers = [...config.dnsServers, ''];
		}

		function removeDNSServer(index) {
			if (config.dnsServers.length > 1) {
				config.dnsServers = config.dnsServers.filter((_, i) => i !== index);
			} else {
				config.dnsServers = [''];
			}
		}

		function addSearchDomain() {
			config.searchDomains = [...config.searchDomains, ''];
		}

		function removeSearchDomain(index) {
			if (config.searchDomains.length > 1) {
				config.searchDomains = config.searchDomains.filter((_, i) => i !== index);
			} else {
				config.searchDomains = [''];
			}
		}

		ToolContentContainer($$renderer, {
			title: 'DHCPv6 DNS Options (RFC 3646)',
			description: 'Configure DNS servers (Option 23) and search domains (Option 24) for DHCPv6 clients. Supports IPv6 DNS servers and multiple search domains.',
			children: ($$renderer) => {
				ExamplesCard($$renderer, {
					examples,
					onSelect: loadExample,
					getLabel: (ex) => ex.label,
					getDescription: (ex) => ex.description,
					selectedIndex: selectedExampleIndex
				});

				$$renderer.push(`<!----> <div class="card input-card svelte-10j5m6b"><div class="card-header svelte-10j5m6b"><h3 class="svelte-10j5m6b">Option 23: DNS Recursive Name Servers</h3> <p class="help-text svelte-10j5m6b">IPv6 addresses of DNS servers for client name resolution</p></div> <div class="card-content svelte-10j5m6b"><!--[-->`);

				const each_array = $.ensure_array_like(config.dnsServers);

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let _ = each_array[i];

					$$renderer.push(`<div class="server-row svelte-10j5m6b"><div class="input-group flex-grow svelte-10j5m6b"><label${$.attr('for', `dns-server-${$.stringify(i)}`)} class="svelte-10j5m6b">`);
					Icon($$renderer, { name: 'server', size: 'sm' });
					$$renderer.push(`<!----> DNS Server ${$.escape(i + 1)}</label> <input${$.attr('id', `dns-server-${$.stringify(i)}`)} type="text"${$.attr('value', config.dnsServers[i])} placeholder="2001:4860:4860::8888" class="svelte-10j5m6b"/></div> <button type="button" class="btn-icon btn-remove svelte-10j5m6b"${$.attr('disabled', config.dnsServers.length === 1, true)} aria-label="Remove DNS server">`);
					Icon($$renderer, { name: 'x', size: 'sm' });
					$$renderer.push(`<!----></button></div>`);
				}

				$$renderer.push(`<!--]--> <button type="button" class="btn-add svelte-10j5m6b">`);
				Icon($$renderer, { name: 'plus', size: 'sm' });
				$$renderer.push(`<!----> Add DNS Server</button></div></div> <div class="card input-card svelte-10j5m6b"><div class="card-header svelte-10j5m6b"><h3 class="svelte-10j5m6b">Option 24: Domain Search List</h3> <p class="help-text svelte-10j5m6b">DNS search domains for hostname resolution</p></div> <div class="card-content svelte-10j5m6b"><!--[-->`);

				const each_array_1 = $.ensure_array_like(config.searchDomains);

				for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
					let _ = each_array_1[i];

					$$renderer.push(`<div class="server-row svelte-10j5m6b"><div class="input-group flex-grow svelte-10j5m6b"><label${$.attr('for', `search-domain-${$.stringify(i)}`)} class="svelte-10j5m6b">`);
					Icon($$renderer, { name: 'globe', size: 'sm' });
					$$renderer.push(`<!----> Search Domain ${$.escape(i + 1)}</label> <input${$.attr('id', `search-domain-${$.stringify(i)}`)} type="text"${$.attr('value', config.searchDomains[i])} placeholder="example.com" class="svelte-10j5m6b"/></div> <button type="button" class="btn-icon btn-remove svelte-10j5m6b"${$.attr('disabled', config.searchDomains.length === 1, true)} aria-label="Remove search domain">`);
					Icon($$renderer, { name: 'x', size: 'sm' });
					$$renderer.push(`<!----></button></div>`);
				}

				$$renderer.push(`<!--]--> <button type="button" class="btn-add svelte-10j5m6b">`);
				Icon($$renderer, { name: 'plus', size: 'sm' });
				$$renderer.push(`<!----> Add Search Domain</button></div></div> `);

				if (validationErrors.length > 0) {
					$$renderer.push(`<!--[0--><div class="card errors-card svelte-10j5m6b"><h3 class="svelte-10j5m6b">Validation Errors</h3> <!--[-->`);

					const each_array_2 = $.ensure_array_like(validationErrors);

					for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
						let error = each_array_2[i];

						$$renderer.push(`<div class="error-message svelte-10j5m6b">`);
						Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
						$$renderer.push(`<!----> ${$.escape(error)}</div>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (result && validationErrors.length === 0) {
					$$renderer.push('<!--[0-->');

					if (result.option23) {
						$$renderer.push(`<!--[0--><div class="card results svelte-10j5m6b"><h3 class="svelte-10j5m6b">Option 23: DNS Recursive Name Servers</h3> <div class="summary-card svelte-10j5m6b"><div class="svelte-10j5m6b"><strong class="svelte-10j5m6b">Total Length:</strong> ${$.escape(result.option23.totalLength)} bytes</div> <div class="svelte-10j5m6b"><strong class="svelte-10j5m6b">Servers:</strong> ${$.escape(result.option23.servers.length)}</div></div> <div class="servers-section svelte-10j5m6b"><h4 class="svelte-10j5m6b">DNS Servers</h4> <!--[-->`);

						const each_array_3 = $.ensure_array_like(result.option23.servers);

						for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
							let server = each_array_3[i];

							$$renderer.push(`<div class="server-item svelte-10j5m6b">`);
							Icon($$renderer, { name: 'server', size: 'sm' });
							$$renderer.push(`<!----> <span class="field-label svelte-10j5m6b">Server ${$.escape(i + 1)}:</span> <span class="field-value svelte-10j5m6b">${$.escape(server)}</span></div>`);
						}

						$$renderer.push(`<!--]--></div> <div class="output-group svelte-10j5m6b"><div class="output-header svelte-10j5m6b"><h4 class="svelte-10j5m6b">Hex-Encoded (Compact)</h4> <button type="button"${$.attr_class('copy-btn svelte-10j5m6b', void 0, { 'copied': clipboard.isCopied('opt23-hex') })}>`);

						Icon($$renderer, {
							name: clipboard.isCopied('opt23-hex') ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('opt23-hex') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-10j5m6b">${$.escape(result.option23.hexEncoded)}</pre></div> <div class="output-group svelte-10j5m6b"><div class="output-header svelte-10j5m6b"><h4 class="svelte-10j5m6b">Wire Format (Spaced)</h4> <button type="button"${$.attr_class('copy-btn svelte-10j5m6b', void 0, { 'copied': clipboard.isCopied('opt23-wire') })}>`);

						Icon($$renderer, {
							name: clipboard.isCopied('opt23-wire') ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('opt23-wire') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-10j5m6b">${$.escape(result.option23.wireFormat)}</pre></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (result.option24) {
						$$renderer.push(`<!--[0--><div class="card results svelte-10j5m6b"><h3 class="svelte-10j5m6b">Option 24: Domain Search List</h3> <div class="summary-card svelte-10j5m6b"><div class="svelte-10j5m6b"><strong class="svelte-10j5m6b">Total Length:</strong> ${$.escape(result.option24.totalLength)} bytes</div> <div class="svelte-10j5m6b"><strong class="svelte-10j5m6b">Domains:</strong> ${$.escape(result.option24.domains.length)}</div></div> <div class="servers-section svelte-10j5m6b"><h4 class="svelte-10j5m6b">Search Domains</h4> <!--[-->`);

						const each_array_4 = $.ensure_array_like(result.option24.domains);

						for (let i = 0, $$length = each_array_4.length; i < $$length; i++) {
							let domain = each_array_4[i];

							$$renderer.push(`<div class="server-item svelte-10j5m6b">`);
							Icon($$renderer, { name: 'globe', size: 'sm' });
							$$renderer.push(`<!----> <span class="field-label svelte-10j5m6b">Domain ${$.escape(i + 1)}:</span> <span class="field-value svelte-10j5m6b">${$.escape(domain)}</span></div>`);
						}

						$$renderer.push(`<!--]--></div> <div class="output-group svelte-10j5m6b"><div class="output-header svelte-10j5m6b"><h4 class="svelte-10j5m6b">Hex-Encoded (Compact)</h4> <button type="button"${$.attr_class('copy-btn svelte-10j5m6b', void 0, { 'copied': clipboard.isCopied('opt24-hex') })}>`);

						Icon($$renderer, {
							name: clipboard.isCopied('opt24-hex') ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('opt24-hex') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-10j5m6b">${$.escape(result.option24.hexEncoded)}</pre></div> <div class="output-group svelte-10j5m6b"><div class="output-header svelte-10j5m6b"><h4 class="svelte-10j5m6b">Wire Format (Spaced)</h4> <button type="button"${$.attr_class('copy-btn svelte-10j5m6b', void 0, { 'copied': clipboard.isCopied('opt24-wire') })}>`);

						Icon($$renderer, {
							name: clipboard.isCopied('opt24-wire') ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('opt24-wire') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-10j5m6b">${$.escape(result.option24.wireFormat)}</pre></div> `);

						if (result.option24.breakdown.length > 0) {
							$$renderer.push(`<!--[0--><div class="breakdown-section svelte-10j5m6b"><h4 class="svelte-10j5m6b">Domain Encoding Breakdown</h4> <!--[-->`);

							const each_array_5 = $.ensure_array_like(result.option24.breakdown);

							for (let i = 0, $$length = each_array_5.length; i < $$length; i++) {
								let item = each_array_5[i];

								$$renderer.push(`<div class="breakdown-item svelte-10j5m6b"><div class="breakdown-label svelte-10j5m6b">${$.escape(item.domain)}</div> <div class="breakdown-hex svelte-10j5m6b">${$.escape(item.wireFormat)}</div></div>`);
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

					if (result.examples.keaDhcp6) {
						$$renderer.push(`<!--[0--><div class="card results svelte-10j5m6b"><h3 class="svelte-10j5m6b">Configuration Example</h3> <div class="output-group svelte-10j5m6b"><div class="output-header svelte-10j5m6b"><h4 class="svelte-10j5m6b">Kea DHCPv6 Configuration</h4> <button type="button"${$.attr_class('copy-btn svelte-10j5m6b', void 0, { 'copied': clipboard.isCopied('kea') })}>`);

						Icon($$renderer, {
							name: clipboard.isCopied('kea') ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('kea') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-10j5m6b">${$.escape(result.examples.keaDhcp6)}</pre></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <div class="card results info-card svelte-10j5m6b"><h3 class="svelte-10j5m6b">About RFC 3646</h3> <p class="svelte-10j5m6b">RFC 3646 defines DNS configuration options for DHCPv6, allowing IPv6 clients to automatically discover DNS
        servers and search domains.</p> <ul class="svelte-10j5m6b"><li class="svelte-10j5m6b"><strong class="svelte-10j5m6b">Option 23:</strong> DNS Recursive Name Server - List of IPv6 DNS server addresses (16 bytes each)</li> <li class="svelte-10j5m6b"><strong class="svelte-10j5m6b">Option 24:</strong> Domain Search List - DNS search domains encoded in DNS wire format (length-prefixed
          labels)</li></ul> <p class="svelte-10j5m6b">These options are essential for IPv6 network autoconfiguration, enabling clients to resolve hostnames without
        manual DNS configuration.</p></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});
	});
}