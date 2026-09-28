import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { useClipboard } from '$lib/composables';

import {
	generateCIDRPTRs,
	generateReverseZoneFile,
	calculateReverseZones
} from '$lib/utils/reverse-dns';

export default function ReverseZoneGenerator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let cidrInput = '192.168.1.0/24';
		let hostnameTemplate = 'host-{ip-dashes}.example.com.';
		let nameServers = 'ns1.example.com.\nns2.example.com.';
		let contactEmail = 'hostmaster.example.com.';
		let ttl = 86400;
		let results = null;
		const clipboard = useClipboard();
		let selectedExample = null;
		let _userModified = false;

		const examples = [
			{
				label: 'IPv4 /24 Network',
				cidr: '192.168.1.0/24',
				template: 'host-{ip-dashes}.example.com.',
				description: 'Generate zone for full /24 subnet'
			},

			{
				label: 'IPv4 /28 Block',
				cidr: '10.0.0.16/28',
				template: 'server{ip}.lan.example.com.',
				description: 'Small block with custom naming'
			},

			{
				label: 'IPv6 /64 Network',
				cidr: '2001:db8:1000::/64',
				template: 'host-{ip-dashes}.ipv6.example.com.',
				description: 'IPv6 reverse zone generation'
			},

			{
				label: 'Corporate Network',
				cidr: '172.16.100.0/24',
				template: 'workstation-{ip-dashes}.corp.example.com.',
				description: 'Corporate naming convention'
			}
		];

		const templateHelp = [
			{
				placeholder: '{ip}',
				description: 'Original IP address (192.168.1.100)'
			},

			{
				placeholder: '{ip-dashes}',
				description: 'IP with dashes (192-168-1-100)'
			},

			{
				placeholder: '{domain}',
				description: 'Base domain from settings'
			}
		];

		function loadExample(example) {
			cidrInput = example.cidr;
			hostnameTemplate = example.template;
			selectedExample = example.label;
			_userModified = false;
			generateZones();
		}

		function generateZones() {
			if (!cidrInput.trim()) {
				results = null;

				return;
			}

			try {
				const trimmed = cidrInput.trim();

				// Generate PTR records for the CIDR
				const ptrRecords = generateCIDRPTRs(trimmed, 5000);

				if (ptrRecords.length === 0) {
					throw new Error('No valid PTR records could be generated from this CIDR');
				}

				// Get the zones that need to be created
				const zoneInfos = calculateReverseZones(trimmed);

				// Parse name servers
				const nsArray = nameServers.split('\n').map((ns) => ns.trim()).filter((ns) => ns.length > 0).map((ns) => ns.endsWith('.') ? ns : ns + '.');

				const domainSuffix = contactEmail.split('@')[1] || 'example.com';

				const options = {
					nameServers: nsArray,
					contactEmail: contactEmail.endsWith('.') ? contactEmail : contactEmail + '.',
					domainSuffix: domainSuffix.endsWith('.') ? domainSuffix : domainSuffix + '.',
					ttl
				};

				const zones = zoneInfos.map((zoneInfo) => {
					const zoneRecords = ptrRecords.filter((record) => record.zone === zoneInfo.zone);
					const content = generateReverseZoneFile(zoneInfo.zone, zoneRecords, hostnameTemplate, options);

					return {
						zone: zoneInfo.zone,
						type: zoneInfo.type,
						content,
						recordCount: zoneRecords.length
					};
				});

				const summary = { totalZones: zones.length, totalRecords: ptrRecords.length };

				results = { success: true, zones, summary };
			} catch(error) {
				results = {
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error occurred',
					zones: [],
					summary: { totalZones: 0, totalRecords: 0 }
				};
			}
		}

		function handleInputChange() {
			_userModified = true;
			selectedExample = null;
			generateZones();
		}

		// Generate on component load
		generateZones();

		$$renderer.push(`<div class="card"><header class="card-header"><h1>Reverse Zone Generator</h1> <p>Generate complete reverse DNS zone files from CIDR blocks with customizable hostname templates</p></header> <div class="card info-card svelte-n9rls7"><div class="overview-content svelte-n9rls7"><div class="overview-item svelte-n9rls7">`);
		Icon($$renderer, { name: 'file', size: 'sm' });
		$$renderer.push(`<!----> <div><strong class="svelte-n9rls7">Full Zone Files:</strong> Complete DNS zone files with SOA, NS, and PTR records ready for deployment.</div></div> <div class="overview-item svelte-n9rls7">`);
		Icon($$renderer, { name: 'template', size: 'sm' });
		$$renderer.push(`<!----> <div><strong class="svelte-n9rls7">Hostname Templates:</strong> Customize hostname patterns using placeholders like <code class="svelte-n9rls7">{ip}</code> and <code class="svelte-n9rls7">{ip-dashes}</code>.</div></div> <div class="overview-item svelte-n9rls7">`);
		Icon($$renderer, { name: 'settings', size: 'sm' });
		$$renderer.push(`<!----> <div><strong class="svelte-n9rls7">Zone Configuration:</strong> Configure name servers, contact email, TTL values, and domain settings.</div></div></div></div> <div class="card examples-card svelte-n9rls7"><details class="examples-details svelte-n9rls7"><summary class="examples-summary svelte-n9rls7">`);
		Icon($$renderer, { name: 'chevron-right', size: 'sm' });
		$$renderer.push(`<!----> <h3 class="svelte-n9rls7">Quick Examples</h3></summary> <div class="examples-grid svelte-n9rls7"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let example = each_array[$$index];

			$$renderer.push(`<button${$.attr_class(`example-card ${selectedExample === example.label ? 'active' : ''}`, 'svelte-n9rls7')}><div class="example-header"><div class="example-label svelte-n9rls7">${$.escape(example.label)}</div></div> <code class="example-input svelte-n9rls7">${$.escape(example.cidr)}</code> <div class="example-template svelte-n9rls7">Template: <code class="svelte-n9rls7">${$.escape(example.template)}</code></div> <div class="example-description svelte-n9rls7">${$.escape(example.description)}</div></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="card input-card svelte-n9rls7"><div class="input-group svelte-n9rls7"><label for="cidr-input" class="svelte-n9rls7">`);
		Icon($$renderer, { name: 'network', size: 'sm' });
		$$renderer.push(`<!----> CIDR Block</label> <input id="cidr-input" type="text"${$.attr('value', cidrInput)} placeholder="192.168.1.0/24 or 2001:db8::/64"${$.attr_class(`cidr-input ${results?.success === true ? 'valid' : results?.success === false ? 'invalid' : ''}`, 'svelte-n9rls7')} spellcheck="false"/></div> <div class="input-group svelte-n9rls7"><label for="template-input" class="svelte-n9rls7">`);
		Icon($$renderer, { name: 'tag', size: 'sm' });
		$$renderer.push(`<!----> Hostname Template</label> <input id="template-input" type="text"${$.attr('value', hostnameTemplate)} placeholder="host-[ip-dashes].example.com." class="template-input svelte-n9rls7" spellcheck="false"/> <div class="template-help svelte-n9rls7"><h4 class="svelte-n9rls7">Available Placeholders:</h4> <div class="placeholder-grid svelte-n9rls7"><!--[-->`);

		const each_array_1 = $.ensure_array_like(templateHelp);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let item = each_array_1[$$index_1];

			$$renderer.push(`<div class="placeholder-item svelte-n9rls7"><code class="placeholder svelte-n9rls7">${$.escape(item.placeholder)}</code> <span class="placeholder-desc svelte-n9rls7">${$.escape(item.description)}</span></div>`);
		}

		$$renderer.push(`<!--]--></div></div></div> <div class="config-section svelte-n9rls7"><h3 class="svelte-n9rls7">Zone Configuration</h3> <div class="config-grid svelte-n9rls7"><div class="config-group svelte-n9rls7"><label for="nameservers-input" class="svelte-n9rls7">`);
		Icon($$renderer, { name: 'server', size: 'sm' });

		$$renderer.push(`<!----> Name Servers</label> <textarea id="nameservers-input" placeholder="ns1.example.com
ns2.example.com" class="nameservers-input svelte-n9rls7" rows="3" spellcheck="false">`);

		const $$body = $.escape(nameServers);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea></div> <div class="config-group svelte-n9rls7"><label for="contact-input" class="svelte-n9rls7">`);
		Icon($$renderer, { name: 'mail', size: 'sm' });
		$$renderer.push(`<!----> Contact Email</label> <input id="contact-input" type="email"${$.attr('value', contactEmail)} placeholder="hostmaster.example.com." class="contact-input svelte-n9rls7" spellcheck="false"/></div> <div class="config-group svelte-n9rls7"><label for="ttl-input" class="svelte-n9rls7">`);
		Icon($$renderer, { name: 'clock', size: 'sm' });
		$$renderer.push(`<!----> Default TTL (seconds)</label> <input id="ttl-input" type="number"${$.attr('value', ttl)} placeholder="86400" class="ttl-input svelte-n9rls7" min="60" max="2147483647"/></div></div></div></div> `);

		if (results && cidrInput.trim()) {
			$$renderer.push(`<!--[0--><div class="card results-card svelte-n9rls7">`);

			if (results.success) {
				$$renderer.push(`<!--[0--><div class="results-header svelte-n9rls7"><h3 class="svelte-n9rls7">Generated Zone Files</h3> <div class="summary-stats svelte-n9rls7"><div class="stat-item svelte-n9rls7"><span class="stat-value svelte-n9rls7">${$.escape(results.summary.totalZones)}</span> <span class="stat-label svelte-n9rls7">Zone Files</span></div> <div class="stat-item svelte-n9rls7"><span class="stat-value svelte-n9rls7">${$.escape(results.summary.totalRecords)}</span> <span class="stat-label svelte-n9rls7">PTR Records</span></div></div></div> <div class="zone-files svelte-n9rls7"><!--[-->`);

				const each_array_2 = $.ensure_array_like(results.zones);

				for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
					let zone = each_array_2[index];

					$$renderer.push(`<div class="zone-file svelte-n9rls7"><div class="zone-file-header svelte-n9rls7"><div class="zone-info svelte-n9rls7"><h4 class="svelte-n9rls7">${$.escape(zone.zone)}</h4> <div class="zone-meta svelte-n9rls7"><span${$.attr_class(`zone-type ${$.stringify(zone.type.toLowerCase())}`, 'svelte-n9rls7')}>${$.escape(zone.type)}</span> <span class="record-count svelte-n9rls7">${$.escape(zone.recordCount)} records</span></div></div> <button${$.attr_class(`copy-button ${clipboard.isCopied(`zone-${index}`) ? 'copied' : ''}`, 'svelte-n9rls7')}>`);

					Icon($$renderer, {
						name: clipboard.isCopied(`zone-${index}`) ? 'check' : 'copy',
						size: 'sm'
					});

					$$renderer.push(`<!----> Copy Zone File</button></div> <div class="zone-content-container svelte-n9rls7"><pre class="zone-content svelte-n9rls7"><code class="svelte-n9rls7">${$.escape(zone.content)}</code></pre></div></div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="error-result svelte-n9rls7">`);
				Icon($$renderer, { name: 'alert-triangle', size: 'lg' });
				$$renderer.push(`<!----> <h4 class="svelte-n9rls7">Generation Error</h4> <p class="svelte-n9rls7">${$.escape(results.error)}</p> <div class="error-help svelte-n9rls7"><strong>Valid formats:</strong> <ul class="svelte-n9rls7"><li class="svelte-n9rls7">IPv4 CIDR: 192.168.1.0/24, 10.0.0.0/16</li> <li class="svelte-n9rls7">IPv6 CIDR: 2001:db8::/64, fe80::/10</li></ul></div></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="education-card svelte-n9rls7"><div class="education-grid svelte-n9rls7"><div class="education-item info-panel svelte-n9rls7"><h4 class="svelte-n9rls7">Zone File Structure</h4> <p class="svelte-n9rls7">Generated zone files include proper SOA records with serial numbers, refresh/retry/expire timers, and NS
          records for delegation. All PTR records are automatically generated based on your template.</p></div> <div class="education-item info-panel svelte-n9rls7"><h4 class="svelte-n9rls7">Hostname Templates</h4> <p class="svelte-n9rls7">Use placeholders to create consistent naming patterns. <code class="svelte-n9rls7">[ip-dashes]</code> is popular for creating
          hostnames like <code class="svelte-n9rls7">host-192-168-1-100.example.com</code> from IP addresses.</p></div> <div class="education-item info-panel svelte-n9rls7"><h4 class="svelte-n9rls7">Zone Delegation</h4> <p class="svelte-n9rls7">The generated zones need to be properly delegated by your ISP or DNS provider. Ensure your name servers are
          configured to serve these zones and are reachable from the internet.</p></div> <div class="education-item info-panel svelte-n9rls7"><h4 class="svelte-n9rls7">Best Practices</h4> <p class="svelte-n9rls7">Keep TTL values reasonable (3600-86400 seconds). Use descriptive hostnames that help with network
          troubleshooting. Ensure forward DNS (A/AAAA) records exist for consistency.</p></div></div></div></div>`);
	});
}