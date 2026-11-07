import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';
import { useClipboard } from '$lib/composables';
import { generateSnippets, getDefaultSnippetConfig } from '$lib/utils/dhcp-snippets.js';

export default function DHCPSnippetsGenerator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let config = getDefaultSnippetConfig();
		let result = null;
		const clipboard = useClipboard();

		const targetOptions = [
			{ value: 'isc-dhcpd', label: 'ISC dhcpd' },
			{ value: 'kea-dhcp4', label: 'Kea DHCPv4' },
			{ value: 'kea-dhcp6', label: 'Kea DHCPv6' }
		];

		// Reactive generation
		function generate() {
			result = generateSnippets(config);
		}

		function addPool() {
			const lastPool = config.pools[config.pools.length - 1];
			const newPool = { start: lastPool.end, end: lastPool.end };

			config.pools = [...config.pools, newPool];
		}

		function removePool(index) {
			if (config.pools.length > 1) {
				config.pools = config.pools.filter((_, i) => i !== index);
			}
		}

		function toggleTarget(target) {
			if (config.targets.includes(target)) {
				config.targets = config.targets.filter((t) => t !== target);
			} else {
				config.targets = [...config.targets, target];
			}
		}

		$$renderer.push(`<div class="card input-card svelte-1hp7r6i"><div class="card-header svelte-1hp7r6i"><h3 class="svelte-1hp7r6i">Configuration</h3></div> <div class="card-content svelte-1hp7r6i"><div class="input-group svelte-1hp7r6i"><label class="svelte-1hp7r6i">`);
		Icon($$renderer, { name: 'server', size: 'sm' });
		$$renderer.push(`<!----> Target Servers</label> <div class="checkbox-group svelte-1hp7r6i"><!--[-->`);

		const each_array = $.ensure_array_like(targetOptions);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let option = each_array[$$index];

			$$renderer.push(`<label class="checkbox-label svelte-1hp7r6i"><input type="checkbox"${$.attr('checked', config.targets.includes(option.value), true)} class="svelte-1hp7r6i"/> ${$.escape(option.label)}</label>`);
		}

		$$renderer.push(`<!--]--></div></div> <div class="input-group svelte-1hp7r6i"><label for="mode" class="svelte-1hp7r6i">`);
		Icon($$renderer, { name: 'network', size: 'sm' });
		$$renderer.push(`<!----> IP Mode</label> `);

		$$renderer.select(
			{ id: 'mode', value: config.mode, class: '' },
			($$renderer) => {
				$$renderer.option({ value: 'dhcp4' }, ($$renderer) => {
					$$renderer.push(`DHCPv4 (IPv4)`);
				});

				$$renderer.option({ value: 'dhcp6' }, ($$renderer) => {
					$$renderer.push(`DHCPv6 (IPv6)`);
				});
			},
			'svelte-1hp7r6i'
		);

		$$renderer.push(`</div> <div class="input-group svelte-1hp7r6i"><label for="subnet" class="svelte-1hp7r6i">`);
		Icon($$renderer, { name: 'network', size: 'sm' });
		$$renderer.push(`<!----> Subnet (CIDR)</label> <input id="subnet" type="text"${$.attr('value', config.subnet)}${$.attr('placeholder', config.mode === 'dhcp6' ? '2001:db8::/64' : '192.168.1.0/24')} class="svelte-1hp7r6i"/></div> <div class="input-group svelte-1hp7r6i"><label class="svelte-1hp7r6i">`);
		Icon($$renderer, { name: 'layers', size: 'sm' });
		$$renderer.push(`<!----> Address Pools</label> <!--[-->`);

		const each_array_1 = $.ensure_array_like(config.pools);

		for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
			let pool = each_array_1[i];

			$$renderer.push(`<div class="pool-row svelte-1hp7r6i"><input type="text"${$.attr('value', pool.start)} placeholder="Start IP" class="svelte-1hp7r6i"/> <span class="svelte-1hp7r6i">-</span> <input type="text"${$.attr('value', pool.end)} placeholder="End IP" class="svelte-1hp7r6i"/> `);

			if (config.pools.length > 1) {
				$$renderer.push(`<!--[0--><button type="button" class="btn-icon svelte-1hp7r6i">`);
				Icon($$renderer, { name: 'x', size: 'sm' });
				$$renderer.push(`<!----></button>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--> <button type="button" class="btn-add svelte-1hp7r6i">`);
		Icon($$renderer, { name: 'plus', size: 'sm' });
		$$renderer.push(`<!----> Add Pool</button></div> <div class="input-group svelte-1hp7r6i"><label for="gateway" class="svelte-1hp7r6i">`);
		Icon($$renderer, { name: 'arrow-right', size: 'sm' });
		$$renderer.push(`<!----> Gateway (Router)</label> <input id="gateway" type="text"${$.attr('value', config.gateway)}${$.attr('placeholder', config.mode === 'dhcp6' ? 'fe80::1' : '192.168.1.1')} class="svelte-1hp7r6i"/></div> <div class="input-group svelte-1hp7r6i"><label for="dns" class="svelte-1hp7r6i">`);
		Icon($$renderer, { name: 'globe', size: 'sm' });
		$$renderer.push(`<!----> DNS Servers (comma-separated)</label> <input id="dns" type="text"${$.attr('value', config.dnsServers?.join(', ') || '')} placeholder="8.8.8.8, 8.8.4.4" class="svelte-1hp7r6i"/></div> <div class="input-group svelte-1hp7r6i"><label for="domain" class="svelte-1hp7r6i">`);
		Icon($$renderer, { name: 'globe', size: 'sm' });
		$$renderer.push(`<!----> Domain Name</label> <input id="domain" type="text"${$.attr('value', config.domainName)} placeholder="example.com" class="svelte-1hp7r6i"/></div> <div class="input-row svelte-1hp7r6i"><div class="input-group svelte-1hp7r6i"><label for="defaultLease" class="svelte-1hp7r6i">`);
		Icon($$renderer, { name: 'clock', size: 'sm' });
		$$renderer.push(`<!----> Default Lease (seconds)</label> <input id="defaultLease" type="number"${$.attr('value', config.defaultLeaseTime)} placeholder="86400" class="svelte-1hp7r6i"/></div> <div class="input-group svelte-1hp7r6i"><label for="maxLease" class="svelte-1hp7r6i">`);
		Icon($$renderer, { name: 'clock', size: 'sm' });
		$$renderer.push(`<!----> Max Lease (seconds)</label> <input id="maxLease" type="number"${$.attr('value', config.maxLeaseTime)} placeholder="604800" class="svelte-1hp7r6i"/></div></div> <div class="input-row svelte-1hp7r6i"><label class="checkbox-label"><input type="checkbox"${$.attr('checked', config.emitOptionNames, true)}/> Use option names (ISC)</label> <label class="checkbox-label"><input type="checkbox"${$.attr('checked', config.prettyJson, true)}/> Pretty JSON (Kea)</label></div></div></div> `);

		if (result) {
			$$renderer.push('<!--[0-->');

			if (result.validations.length > 0) {
				$$renderer.push(`<!--[0--><div class="card errors-card svelte-1hp7r6i"><h3 class="svelte-1hp7r6i">Validation Errors</h3> <!--[-->`);

				const each_array_2 = $.ensure_array_like(result.validations);

				for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
					let error = each_array_2[$$index_2];

					$$renderer.push(`<div class="error-message svelte-1hp7r6i">`);
					Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
					$$renderer.push(`<!----> <strong>${$.escape(error.field)}:</strong> ${$.escape(error.message)}</div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="card summary-card svelte-1hp7r6i">`);
				Icon($$renderer, { name: 'info', size: 'sm' });
				$$renderer.push(`<!----> <p class="svelte-1hp7r6i">${$.escape(result.summary)}</p></div> <div class="card results svelte-1hp7r6i"><h3 class="svelte-1hp7r6i">Generated Snippets</h3> `);

				if (result.iscDhcpdSnippet) {
					$$renderer.push(`<!--[0--><div class="output-group svelte-1hp7r6i"><div class="output-header svelte-1hp7r6i"><h4 class="svelte-1hp7r6i">ISC dhcpd.conf</h4> <button type="button"${$.attr_class('copy-btn svelte-1hp7r6i', void 0, { 'copied': clipboard.isCopied('isc') })}>`);

					Icon($$renderer, {
						name: clipboard.isCopied('isc') ? 'check' : 'copy',
						size: 'xs'
					});

					$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('isc') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-1hp7r6i">${$.escape(result.iscDhcpdSnippet)}</pre></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (result.keaDhcp4Snippet) {
					$$renderer.push(`<!--[0--><div class="output-group svelte-1hp7r6i"><div class="output-header svelte-1hp7r6i"><h4 class="svelte-1hp7r6i">Kea DHCPv4 JSON</h4> <button type="button"${$.attr_class('copy-btn svelte-1hp7r6i', void 0, { 'copied': clipboard.isCopied('kea4') })}>`);

					Icon($$renderer, {
						name: clipboard.isCopied('kea4') ? 'check' : 'copy',
						size: 'xs'
					});

					$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('kea4') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-1hp7r6i">${$.escape(result.keaDhcp4Snippet)}</pre></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (result.keaDhcp6Snippet) {
					$$renderer.push(`<!--[0--><div class="output-group svelte-1hp7r6i"><div class="output-header svelte-1hp7r6i"><h4 class="svelte-1hp7r6i">Kea DHCPv6 JSON</h4> <button type="button"${$.attr_class('copy-btn svelte-1hp7r6i', void 0, { 'copied': clipboard.isCopied('kea6') })}>`);

					Icon($$renderer, {
						name: clipboard.isCopied('kea6') ? 'check' : 'copy',
						size: 'xs'
					});

					$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('kea6') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-1hp7r6i">${$.escape(result.keaDhcp6Snippet)}</pre></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}