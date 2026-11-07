import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import '../../../../styles/diagnostics-pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let ip = '8.8.8.8';
		let loading = false;
		let results = null;
		let error = null;
		let copiedState = false;
		let selectedExampleIndex = null;

		const examples = [
			{
				ip: '8.8.8.8',
				description: 'Google DNS - Public DNS service'
			},

			{
				ip: '1.1.1.1',
				description: 'Cloudflare DNS - Fast public resolver'
			},

			{
				ip: '208.67.222.222',
				description: 'OpenDNS - Cisco public DNS'
			},

			{
				ip: '192.0.2.1',
				description: 'RFC 5737 - Documentation IP range'
			},
			{ ip: '2001:4860:4860::8888', description: 'Google IPv6 DNS' },
			{
				ip: '2606:4700:4700::1111',
				description: 'Cloudflare IPv6 DNS'
			}
		];

		async function lookupIP() {
			loading = true;
			error = null;
			results = null;

			try {
				const response = await fetch('/api/internal/diagnostics/rdap', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ action: 'ip-lookup', ip: ip.trim() })
				});

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));

					throw new Error(errorData.message || `IP RDAP lookup failed: ${response.status}`);
				}

				results = await response.json();
			} catch(err) {
				error = err instanceof Error ? err.message : 'Unknown error occurred';
			} finally {
				loading = false;
			}
		}

		function loadExample(example, index) {
			ip = example.ip;
			selectedExampleIndex = index;
			lookupIP();
		}

		function clearExampleSelection() {
			selectedExampleIndex = null;
		}

		async function copyResults() {
			if (!results?.raw) return;

			try {
				await navigator.clipboard.writeText(JSON.stringify(results.raw, null, 2));
				copiedState = true;
				setTimeout(() => copiedState = false, 1500);
			} catch(err) {
				console.error('Failed to copy:', err);
			}
		}

		function formatDate(dateString) {
			if (!dateString) return 'Not available';

			try {
				return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
			} catch {
				return dateString;
			}
		}

		function formatContact(contact) {
			const vcard = contact.vcardArray;

			if (!vcard || !vcard[1]) return contact.handle || 'Unknown';

			const properties = vcard[1];
			const name = properties.find((p) => p[0] === 'fn')?.[3] || contact.handle;
			const org = properties.find((p) => p[0] === 'org')?.[3]?.[0];

			return org ? `${name} (${org})` : name;
		}

		function getIPVersion(ipAddress) {
			return ipAddress.includes(':') ? 'IPv6' : 'IPv4';
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h1>IP Address RDAP Lookup</h1> <p>Look up IP address allocation and registration data using RDAP through Regional Internet Registry (RIR) services.
      Automatically routes queries to the appropriate RIR based on IP address prefix.</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary">`);

		Icon($$renderer, { name: 'chevron-right', size: 'xs' });
		$$renderer.push(`<!----> <h4>Common IP Examples</h4></summary> <div class="examples-grid"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let example = each_array[i];

			$$renderer.push(`<button${$.attr_class('example-card svelte-37s01p', void 0, { 'selected': selectedExampleIndex === i })}><h5>${$.escape(example.ip)}</h5> <p>${$.escape(example.description)}</p> <small class="svelte-37s01p">${$.escape(getIPVersion(example.ip))}</small></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="card input-card"><div class="card-header"><h3>RDAP Lookup Configuration</h3></div> <div class="card-content"><div class="form-grid svelte-37s01p"><div class="form-group svelte-37s01p"><label for="ip" class="svelte-37s01p">IP Address <input id="ip" type="text"${$.attr('value', ip)} placeholder="8.8.8.8 or 2001:4860:4860::8888"/> <small class="svelte-37s01p">Supports both IPv4 (e.g., 8.8.8.8) and IPv6 (e.g., 2001:4860:4860::8888) addresses</small></label></div></div> <div class="action-section"><button class="lookup-btn"${$.attr('disabled', loading || !ip.trim(), true)}>`);

		if (loading) {
			$$renderer.push('<!--[0-->');
			Icon($$renderer, { name: 'loader', size: 'sm', animate: 'spin' });
			$$renderer.push(`<!----> Performing RDAP Lookup...`);
		} else {
			$$renderer.push('<!--[-1-->');
			Icon($$renderer, { name: 'search', size: 'sm' });
			$$renderer.push(`<!----> Lookup IP Address`);
		}

		$$renderer.push(`<!--]--></button></div></div></div> `);

		if (results) {
			$$renderer.push(`<!--[0--><div class="card results-card"><div class="card-header row"><h3>RDAP Data for ${$.escape(results.ip)}</h3> <button class="copy-btn"${$.attr('disabled', copiedState, true)}><span${$.attr_class($.clsx(copiedState ? 'text-green-500' : ''))}>`);
			Icon($$renderer, { name: copiedState ? 'check' : 'copy', size: 'xs' });
			$$renderer.push(`<!----></span> ${$.escape(copiedState ? 'Copied!' : 'Copy Raw JSON')}</button></div> <div class="card-content"><div class="lookup-info"><div class="info-item"><span class="info-label">IP Address:</span> <span class="info-value"><span class="mono">${$.escape(results.ip)}</span> <span class="ip-version">${$.escape(getIPVersion(results.ip))}</span></span></div> <div class="info-item"><span class="info-label">RDAP Service:</span> <span class="info-value mono">${$.escape(results.serviceUrl)}</span></div></div> <div class="results-grid"><div class="result-section"><h4>Network Information</h4> <dl class="definition-list"><dt>Network Block:</dt> <dd><code>${$.escape(results.data.network || 'Not available')}</code></dd> <dt>Network Name:</dt> <dd>${$.escape(results.data.name || 'Not available')}</dd> <dt>Type:</dt> <dd>${$.escape(results.data.type || 'Not available')}</dd> <dt>Country:</dt> <dd>`);

			if (results.data.country) {
				$$renderer.push(`<!--[0--><span class="country-code">${$.escape(results.data.country)}</span>`);
			} else {
				$$renderer.push(`<!--[-1-->Not available`);
			}

			$$renderer.push(`<!--]--></dd> <dt>Registry:</dt> <dd>${$.escape(results.data.registry || 'Not available')}</dd></dl></div> <div class="result-section"><h4>Allocation Details</h4> <dl class="definition-list"><dt>Status:</dt> <dd>`);

			if (results.data.status?.length) {
				$$renderer.push(`<!--[0--><div class="status-list"><!--[-->`);

				const each_array_1 = $.ensure_array_like(results.data.status);

				for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
					let status = each_array_1[index];

					$$renderer.push(`<span class="status-badge">${$.escape(status)}</span>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push(`<!--[-1-->Not available`);
			}

			$$renderer.push(`<!--]--></dd> <dt>Allocation Date:</dt> <dd>${$.escape(formatDate(results.data.allocation))}</dd> <dt>Last Changed:</dt> <dd>${$.escape(formatDate(results.data.lastChanged))}</dd></dl></div> `);

			if (results.data.contacts?.length) {
				$$renderer.push(`<!--[0--><div class="result-section full-width"><h4>Contact Information</h4> <div class="contacts-grid"><!--[-->`);

				const each_array_2 = $.ensure_array_like(results.data.contacts);

				for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
					let contact = each_array_2[index];

					$$renderer.push(`<div class="contact-card"><h5>`);

					if (contact.roles?.includes('registrant')) {
						$$renderer.push(`<!--[0-->Registrant`);
					} else if (contact.roles?.includes('administrative')) {
						$$renderer.push(`<!--[1-->Administrative`);
					} else if (contact.roles?.includes('technical')) {
						$$renderer.push(`<!--[2-->Technical`);
					} else if (contact.roles?.includes('abuse')) {
						$$renderer.push(`<!--[3-->Abuse`);
					} else {
						$$renderer.push(`<!--[-1-->Contact`);
					}

					$$renderer.push(`<!--]--></h5> <p><strong>${$.escape(formatContact(contact))}</strong></p> `);

					if (contact.handle) {
						$$renderer.push(`<!--[0--><p><small>Handle: ${$.escape(contact.handle)}</small></p>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (contact.roles) {
						$$renderer.push(`<!--[0--><div class="roles-list"><!--[-->`);

						const each_array_3 = $.ensure_array_like(contact.roles);

						for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
							let role = each_array_3[index];

							$$renderer.push(`<span class="role-badge">${$.escape(role)}</span>`);
						}

						$$renderer.push(`<!--]--></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (error) {
			$$renderer.push(`<!--[0--><div class="card error-card"><div class="card-content"><div class="error-content">`);
			Icon($$renderer, { name: 'alert-triangle', size: 'md' });
			$$renderer.push(`<!----> <div><strong>RDAP Lookup Failed</strong> <p>${$.escape(error)}</p> <div class="troubleshooting"><p><strong>Troubleshooting Tips:</strong></p> <ul><li>Ensure the IP address is valid and properly formatted</li> <li>Private IP addresses (RFC 1918) may not have RDAP data</li> <li>Some RIRs may have rate limiting or access restrictions</li> <li>Reserved or special-use addresses may not be publicly queryable</li> <li>Try again in a few moments if the service is temporarily unavailable</li></ul></div></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="card info-card"><div class="card-header"><h3>About IP Address RDAP Lookups</h3></div> <div class="card-content"><div class="info-grid"><div class="info-section"><h4>How it Works</h4> <p>IP RDAP provides detailed allocation information from Regional Internet Registries (RIRs). The tool
            automatically routes queries to the appropriate RIR using IANA bootstrap registries.</p></div> <div class="info-section"><h4>Regional Internet Registries</h4> <ul><li><strong>ARIN:</strong> North America, parts of Caribbean</li> <li><strong>RIPE NCC:</strong> Europe, Central Asia, Middle East</li> <li><strong>APNIC:</strong> Asia Pacific region</li> <li><strong>LACNIC:</strong> Latin America, parts of Caribbean</li> <li><strong>AFRINIC:</strong> Africa</li></ul></div> <div class="info-section"><h4>What You'll Get</h4> <ul><li>Network block and CIDR prefix</li> <li>Allocation type and country</li> <li>Organization responsible for the block</li> <li>Contact information (registrant, admin, technical, abuse)</li></ul></div></div></div></div></div>`);
	});
}