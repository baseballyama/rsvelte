import * as $ from 'svelte/internal/server';
import { generateOption43, parseIPList, isValidIPv4, VENDOR_INFO } from '$lib/utils/dhcp-option43';
import { useClipboard, useExamples } from '$lib/composables';
import Icon from '$lib/components/global/Icon.svelte';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';

export default function DHCPOption43Generator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let vendorType = 'cisco-catalyst';
		let ipInput = '';
		let result = null;
		let errors = [];
		const clipboard = useClipboard();
		const vendorInfo = $.derived(() => VENDOR_INFO[vendorType]);

		const examplesList = [
			{
				vendor: 'cisco-catalyst',
				ips: '192.168.1.10\n192.168.1.11',
				description: 'Cisco Catalyst with dual controllers'
			},

			{
				vendor: 'cisco-meraki',
				ips: '192.168.10.5',
				description: 'Single Meraki cloud controller'
			},

			{
				vendor: 'ruckus-smartzone',
				ips: '10.0.0.100',
				description: 'Ruckus SmartZone controller'
			},

			{
				vendor: 'aruba',
				ips: '172.16.1.50',
				description: 'Aruba wireless controller'
			},

			{
				vendor: 'unifi',
				ips: '192.168.1.20',
				description: 'UniFi Network Controller'
			},

			{
				vendor: 'ruckus-zonedirector',
				ips: '10.50.100.200',
				description: 'Ruckus ZoneDirector (legacy)'
			}
		];

		const examples = useExamples(examplesList);

		function generate() {
			errors = [];
			result = null;

			const ips = parseIPList(ipInput);

			if (ips.length === 0) {
				errors = ['Please enter at least one IP address'];

				return;
			}

			// Validate each IP
			const invalidIPs = ips.filter((ip) => !isValidIPv4(ip));

			if (invalidIPs.length > 0) {
				errors = [`Invalid IP address format: ${invalidIPs.join(', ')}`];

				return;
			}

			// Check max IPs for vendor
			if (ips.length > vendorInfo().maxIPs) {
				errors = [
					`${vendorInfo().name} supports maximum ${vendorInfo().maxIPs} controller${vendorInfo().maxIPs > 1 ? 's' : ''}. You entered ${ips.length}.`
				];

				return;
			}

			try {
				result = generateOption43(vendorType, ips);
			} catch(error) {
				errors = [
					error instanceof Error ? error.message : 'Unknown error occurred'
				];
			}
		}

		function loadExample(example, index) {
			vendorType = example.vendor;
			ipInput = example.ips;
			examples.select(index);
			generate();
		}

		ExamplesCard($$renderer, {
			examples: examplesList,
			selectedIndex: examples.selectedIndex,
			onSelect: loadExample,
			getLabel: (ex) => VENDOR_INFO[ex.vendor].name,
			getDescription: (ex) => ex.description,
			getTooltip: (ex) => `Generate Option 43 for ${VENDOR_INFO[ex.vendor].name}`
		});

		$$renderer.push(`<!----> <div class="card input-card svelte-16rb1ok"><div class="card-header"><h3 class="svelte-16rb1ok">Generator Configuration</h3></div> <div class="card-content"><section class="inputs svelte-16rb1ok"><div class="input-group svelte-16rb1ok"><label for="vendor" class="svelte-16rb1ok">`);
		Icon($$renderer, { name: 'wifi', size: 'sm' });
		$$renderer.push(`<!----> Wireless Controller Vendor</label> `);

		$$renderer.select(
			{
				id: 'vendor',
				value: vendorType,
				onchange: () => {
					result = null;
					examples.clear();
				},
				class: ''
			},
			($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(Object.entries(VENDOR_INFO));

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let [value, info] = each_array[$$index];

					$$renderer.option({ value }, ($$renderer) => {
						$$renderer.push(`${$.escape(info.name)}`);
					});
				}

				$$renderer.push(`<!--]-->`);
			},
			'svelte-16rb1ok'
		);

		$$renderer.push(` <span class="help-text svelte-16rb1ok">${$.escape(vendorInfo().description)}</span></div> <div class="input-group svelte-16rb1ok"><label for="ip-input" class="svelte-16rb1ok">`);
		Icon($$renderer, { name: 'network', size: 'sm' });
		$$renderer.push(`<!----> Controller IP Address${$.escape(vendorInfo().maxIPs > 1 ? 'es' : '')} <span class="label-hint svelte-16rb1ok">(max ${$.escape(vendorInfo().maxIPs)})</span></label> <textarea id="ip-input"${$.attr('placeholder', `Enter IP address${vendorInfo().maxIPs > 1 ? 'es' : ''} (one per line or comma-separated)\ne.g., 192.168.1.10, 192.168.1.11`)} rows="3" class="svelte-16rb1ok">`);

		const $$body = $.escape(ipInput);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea> <div class="input-actions svelte-16rb1ok"><button type="button" class="btn-primary svelte-16rb1ok">`);
		Icon($$renderer, { name: 'zap', size: 'sm' });
		$$renderer.push(`<!----> Generate</button></div></div> `);

		if (errors.length > 0) {
			$$renderer.push(`<!--[0--><div class="errors svelte-16rb1ok"><!--[-->`);

			const each_array_1 = $.ensure_array_like(errors);

			for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
				let error = each_array_1[i];

				$$renderer.push(`<div class="error-message svelte-16rb1ok">`);
				Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
				$$renderer.push(`<!----> ${$.escape(error)}</div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></section></div></div> `);

		if (result) {
			$$renderer.push(`<!--[0--><div class="card results svelte-16rb1ok"><h3 class="svelte-16rb1ok">Generated Option 43 Values</h3> `);

			if (result.iosCommand && result.workings) {
				$$renderer.push(`<!--[0--><div class="ios-command-section svelte-16rb1ok"><div class="ios-header svelte-16rb1ok"><h4 class="svelte-16rb1ok">`);
				Icon($$renderer, { name: 'terminal', size: 'sm' });
				$$renderer.push(`<!----> ${$.escape(result.commandLabel || 'DHCP Server Command')}</h4> <button type="button"${$.attr_class('copy-btn svelte-16rb1ok', void 0, { 'copied': clipboard.isCopied('ios') })}>`);

				Icon($$renderer, {
					name: clipboard.isCopied('ios') ? 'check' : 'copy',
					size: 'xs'
				});

				$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('ios') ? 'Copied' : 'Copy')}</button></div> <pre class="ios-command svelte-16rb1ok">${$.escape(result.iosCommand)}</pre> <div class="workings svelte-16rb1ok"><h5 class="svelte-16rb1ok">How this value is calculated:</h5> <ul class="svelte-16rb1ok"><!--[-->`);

				const each_array_2 = $.ensure_array_like(result.workings);

				for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
					let working = each_array_2[i];

					$$renderer.push(`<li class="svelte-16rb1ok">${$.escape(working)}</li>`);
				}

				$$renderer.push(`<!--]--></ul></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="explanation svelte-16rb1ok">`);
			Icon($$renderer, { name: 'info', size: 'sm' });
			$$renderer.push(`<!----> <p class="svelte-16rb1ok">${$.escape(result.explanation)}</p></div> <div class="output-formats svelte-16rb1ok"><div class="output-group svelte-16rb1ok"><div class="output-header svelte-16rb1ok"><h4 class="svelte-16rb1ok">Hexadecimal String</h4> <button type="button"${$.attr_class('copy-btn svelte-16rb1ok', void 0, { 'copied': clipboard.isCopied('hex') })}>`);

			Icon($$renderer, {
				name: clipboard.isCopied('hex') ? 'check' : 'copy',
				size: 'xs'
			});

			$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('hex') ? 'Copied' : 'Copy')}</button></div> <code class="output-value svelte-16rb1ok">${$.escape(result.hex)}</code> <p class="format-hint svelte-16rb1ok">Raw hexadecimal - used in most DHCP server configurations</p></div> <div class="output-group svelte-16rb1ok"><div class="output-header svelte-16rb1ok"><h4 class="svelte-16rb1ok">Colon-Separated Hex</h4> <button type="button"${$.attr_class('copy-btn svelte-16rb1ok', void 0, { 'copied': clipboard.isCopied('colonHex') })}>`);

			Icon($$renderer, {
				name: clipboard.isCopied('colonHex') ? 'check' : 'copy',
				size: 'xs'
			});

			$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('colonHex') ? 'Copied' : 'Copy')}</button></div> <code class="output-value svelte-16rb1ok">${$.escape(result.colonHex)}</code> <p class="format-hint svelte-16rb1ok">Used by Infoblox and some network appliances</p></div> <div class="output-group svelte-16rb1ok"><div class="output-header svelte-16rb1ok"><h4 class="svelte-16rb1ok">Windows DHCP Binary</h4> <button type="button"${$.attr_class('copy-btn svelte-16rb1ok', void 0, { 'copied': clipboard.isCopied('windows') })}>`);

			Icon($$renderer, {
				name: clipboard.isCopied('windows') ? 'check' : 'copy',
				size: 'xs'
			});

			$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('windows') ? 'Copied' : 'Copy')}</button></div> <code class="output-value svelte-16rb1ok">${$.escape(result.windowsBinary)}</code> <p class="format-hint svelte-16rb1ok">Enter in Windows DHCP Server's Binary field for Option 43</p></div> <div class="output-group svelte-16rb1ok"><div class="output-header svelte-16rb1ok"><h4 class="svelte-16rb1ok">ISC DHCP Configuration</h4> <button type="button"${$.attr_class('copy-btn svelte-16rb1ok', void 0, { 'copied': clipboard.isCopied('isc') })}>`);

			Icon($$renderer, {
				name: clipboard.isCopied('isc') ? 'check' : 'copy',
				size: 'xs'
			});

			$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('isc') ? 'Copied' : 'Copy')}</button></div> <pre class="output-value code-block svelte-16rb1ok">${$.escape(result.iscDhcp)}</pre> <p class="format-hint svelte-16rb1ok">Add to dhcpd.conf for ISC DHCP server</p></div> <div class="output-group svelte-16rb1ok"><div class="output-header svelte-16rb1ok"><h4 class="svelte-16rb1ok">Mikrotik Configuration</h4> <button type="button"${$.attr_class('copy-btn svelte-16rb1ok', void 0, { 'copied': clipboard.isCopied('mikrotik') })}>`);

			Icon($$renderer, {
				name: clipboard.isCopied('mikrotik') ? 'check' : 'copy',
				size: 'xs'
			});

			$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('mikrotik') ? 'Copied' : 'Copy')}</button></div> <code class="output-value svelte-16rb1ok">${$.escape(result.mikrotik)}</code> <p class="format-hint svelte-16rb1ok">RouterOS DHCP option configuration command</p></div></div></div> <div class="card info svelte-16rb1ok"><h3 class="svelte-16rb1ok">Important Notes</h3> <ul class="notes-list svelte-16rb1ok"><li class="svelte-16rb1ok"><strong class="svelte-16rb1ok">DHCP Option 43</strong> is vendor-specific and must match the AP manufacturer's expected format</li> <li class="svelte-16rb1ok">Some vendors require <strong class="svelte-16rb1ok">Option 60</strong> (Vendor Class Identifier) to be set in addition to Option 43</li> <li class="svelte-16rb1ok">Ensure controller IPs are reachable from the AP management network</li> <li class="svelte-16rb1ok">For high availability, configure <strong class="svelte-16rb1ok">multiple controller IPs</strong> when supported</li> <li class="svelte-16rb1ok">Changes to DHCP options require AP to renew lease or reboot to take effect</li> <li class="svelte-16rb1ok">Always test in a controlled environment before deploying to production networks</li></ul></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}