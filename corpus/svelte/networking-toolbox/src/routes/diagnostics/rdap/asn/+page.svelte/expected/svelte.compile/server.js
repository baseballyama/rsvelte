import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import '../../../../styles/diagnostics-pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let asn = 'AS15169';
		let loading = false;
		let results = null;
		let error = null;
		let copiedState = false;
		let selectedExampleIndex = null;

		const examples = [
			{
				asn: 'AS15169',
				description: 'Google LLC - Major cloud provider'
			},

			{
				asn: 'AS13335',
				description: 'Cloudflare - CDN and security services'
			},

			{
				asn: 'AS16509',
				description: 'Amazon.com - AWS cloud infrastructure'
			},

			{
				asn: 'AS8075',
				description: 'Microsoft Corporation - Azure cloud'
			},

			{
				asn: 'AS32934',
				description: 'Meta Platforms - Facebook services'
			},

			{
				asn: 'AS396982',
				description: 'Google Cloud Platform - Additional ranges'
			}
		];

		async function lookupASN() {
			loading = true;
			error = null;
			results = null;

			try {
				const response = await fetch('/api/internal/diagnostics/rdap', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ action: 'asn-lookup', asn: asn.trim().toUpperCase() })
				});

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));

					throw new Error(errorData.message || `ASN RDAP lookup failed: ${response.status}`);
				}

				results = await response.json();
			} catch(err) {
				error = err.message;
			} finally {
				loading = false;
			}
		}

		function loadExample(example, index) {
			asn = example.asn;
			selectedExampleIndex = index;
			lookupASN();
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

		function formatASN(asnString) {
			return asnString.startsWith('AS') ? asnString : `AS${asnString}`;
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h1>ASN RDAP Lookup</h1> <p>Query Autonomous System Number allocation and registration data using RDAP through Regional Internet Registries.
      ASNs identify networks on the global Internet routing table and are essential for BGP routing operations.</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary">`);

		Icon($$renderer, { name: 'chevron-right', size: 'xs' });
		$$renderer.push(`<!----> <h4>Common ASN Examples</h4></summary> <div class="examples-grid"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let example = each_array[i];

			$$renderer.push(`<button${$.attr_class('example-card svelte-2918zk', void 0, { 'selected': selectedExampleIndex === i })}><h5>${$.escape(example.asn)}</h5> <p>${$.escape(example.description)}</p> <small class="svelte-2918zk">${$.escape(example.asn.replace('AS', ''))}</small></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="card input-card"><div class="card-header"><h3>RDAP Lookup Configuration</h3></div> <div class="card-content"><div class="form-grid svelte-2918zk"><div class="form-group svelte-2918zk"><label for="asn" class="svelte-2918zk">Autonomous System Number <input id="asn" type="text"${$.attr('value', asn)} placeholder="AS15169 or 15169"/> <small class="svelte-2918zk">Supports both formats: AS15169 or 15169 (AS prefix is optional)</small></label></div></div> <div class="action-section"><button class="lookup-btn"${$.attr('disabled', loading || !asn.trim(), true)}>`);

		if (loading) {
			$$renderer.push('<!--[0-->');
			Icon($$renderer, { name: 'loader', size: 'sm', animate: 'spin' });
			$$renderer.push(`<!----> Performing RDAP Lookup...`);
		} else {
			$$renderer.push('<!--[-1-->');
			Icon($$renderer, { name: 'search', size: 'sm' });
			$$renderer.push(`<!----> Lookup ASN`);
		}

		$$renderer.push(`<!--]--></button></div></div></div> `);

		if (results) {
			$$renderer.push(`<!--[0--><div class="card results-card"><div class="card-header row"><h3>RDAP Data for ${$.escape(formatASN(results.asn))}</h3> <button class="copy-btn"${$.attr('disabled', copiedState, true)}><span${$.attr_class($.clsx(copiedState ? 'text-green-500' : ''))}>`);
			Icon($$renderer, { name: copiedState ? 'check' : 'copy', size: 'xs' });
			$$renderer.push(`<!----></span> ${$.escape(copiedState ? 'Copied!' : 'Copy Raw JSON')}</button></div> <div class="card-content"><div class="lookup-info"><div class="info-item"><span class="info-label">ASN:</span> <span class="info-value"><span class="asn-number">${$.escape(formatASN(results.asn))}</span></span></div> <div class="info-item"><span class="info-label">RDAP Service:</span> <span class="info-value mono">${$.escape(results.serviceUrl)}</span></div></div> <div class="results-grid"><div class="result-section"><h4>ASN Information</h4> <dl class="definition-list"><dt>Organization Name:</dt> <dd>${$.escape(results.data.name || 'Not available')}</dd> <dt>Type:</dt> <dd>${$.escape(results.data.type || 'Not available')}</dd> <dt>Country:</dt> <dd>`);

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
			$$renderer.push(`<!----> <div><strong>RDAP Lookup Failed</strong> <p>${$.escape(error)}</p> <div class="troubleshooting"><p><strong>Troubleshooting Tips:</strong></p> <ul><li>Ensure the ASN format is valid (e.g., AS15169 or just 15169)</li> <li>Check if the ASN exists and is currently allocated</li> <li>Private ASNs (64512-65534, 4200000000-4294967294) may not have public RDAP data</li> <li>Some RIRs may have rate limiting or access restrictions</li> <li>Try again in a few moments if the service is temporarily unavailable</li></ul></div></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="card info-card"><div class="card-header"><h3>About ASN RDAP Lookups</h3></div> <div class="card-content"><div class="info-grid"><div class="info-section"><h4>What is an ASN?</h4> <p>Autonomous System Numbers identify networks on the global Internet routing table and are essential for BGP
            routing operations. Each ASN represents a collection of IP address blocks under unified administrative
            control.</p></div> <div class="info-section"><h4>ASN Ranges by Registry</h4> <ul><li><strong>ARIN:</strong> AS1 - AS23551, AS393216 - AS394239</li> <li><strong>RIPE NCC:</strong> AS24576 - AS25599, AS34816 - AS35839</li> <li><strong>APNIC:</strong> AS23552 - AS24575, AS37888 - AS38911</li> <li><strong>LACNIC:</strong> AS26592 - AS27647, AS61440 - AS61951</li> <li><strong>AFRINIC:</strong> AS36864 - AS37887, AS327680 - AS328703</li></ul></div> <div class="info-section"><h4>What You'll Get</h4> <ul><li>Organization name and type</li> <li>Country of registration</li> <li>Allocation date and status</li> <li>Contact information (admin, technical, abuse)</li></ul></div></div></div></div></div>`);
	});
}