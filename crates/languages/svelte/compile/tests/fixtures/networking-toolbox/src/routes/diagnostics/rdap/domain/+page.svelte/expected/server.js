import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import '../../../../styles/diagnostics-pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let domain = 'example.com';
		let loading = false;
		let results = null;
		let error = null;
		let copiedState = false;
		let selectedExampleIndex = null;

		const examples = [
			{
				domain: 'example.com',
				description: 'Example domain for testing'
			},

			{
				domain: 'google.com',
				description: 'Popular domain with comprehensive records'
			},
			{ domain: 'github.com', description: 'Tech company domain' },
			{
				domain: 'stackoverflow.com',
				description: 'Community platform domain'
			},
			{ domain: 'cloudflare.com', description: 'CDN provider domain' },
			{ domain: 'iana.org', description: 'Internet registry domain' }
		];

		async function lookupDomain() {
			loading = true;
			error = null;
			results = null;

			try {
				const response = await fetch('/api/internal/diagnostics/rdap', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ action: 'domain-lookup', domain: domain.trim().toLowerCase() })
				});

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));

					throw new Error(errorData.message || `Domain RDAP lookup failed: ${response.status}`);
				}

				results = await response.json();
			} catch(err) {
				error = err instanceof Error ? err.message : 'Unknown error occurred';
			} finally {
				loading = false;
			}
		}

		function loadExample(example, index) {
			domain = example.domain;
			selectedExampleIndex = index;
			lookupDomain();
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

		$$renderer.push(`<div class="card"><header class="card-header"><h1>Domain RDAP Lookup</h1> <p>Query domain registration data using RDAP (Registration Data Access Protocol). RDAP is the modern successor to
      WHOIS, providing structured JSON responses through IANA bootstrap registry routing.</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary">`);

		Icon($$renderer, { name: 'chevron-right', size: 'xs' });
		$$renderer.push(`<!----> <h4>Common Domain Examples</h4></summary> <div class="examples-grid"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let example = each_array[i];

			$$renderer.push(`<button${$.attr_class('example-card', void 0, { 'selected': selectedExampleIndex === i })}><h5>${$.escape(example.domain)}</h5> <p>${$.escape(example.description)}</p></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="card input-card"><div class="card-header"><h3>RDAP Lookup Configuration</h3></div> <div class="card-content"><div class="form-grid svelte-1clo6a0"><div class="form-group svelte-1clo6a0"><label for="domain" class="svelte-1clo6a0">Domain Name <input id="domain" type="text"${$.attr('value', domain)} placeholder="example.com"/></label></div></div> <div class="action-section"><button class="lookup-btn"${$.attr('disabled', loading || !domain.trim(), true)}>`);

		if (loading) {
			$$renderer.push('<!--[0-->');
			Icon($$renderer, { name: 'loader', size: 'sm', animate: 'spin' });
			$$renderer.push(`<!----> Performing RDAP Lookup...`);
		} else {
			$$renderer.push('<!--[-1-->');
			Icon($$renderer, { name: 'search', size: 'sm' });
			$$renderer.push(`<!----> Lookup Domain`);
		}

		$$renderer.push(`<!--]--></button></div></div></div> `);

		if (results) {
			$$renderer.push(`<!--[0--><div class="card results-card"><div class="card-header row"><h3>RDAP Data for ${$.escape(results.domain)}</h3> <button class="copy-btn"${$.attr('disabled', copiedState, true)}><span${$.attr_class($.clsx(copiedState ? 'text-green-500' : ''))}>`);
			Icon($$renderer, { name: copiedState ? 'check' : 'copy', size: 'xs' });
			$$renderer.push(`<!----></span> ${$.escape(copiedState ? 'Copied!' : 'Copy Raw JSON')}</button></div> <div class="card-content"><div class="lookup-info"><div class="info-item"><span class="info-label">Domain:</span> <span class="info-value mono">${$.escape(results.data.domain || results.domain)}</span></div> <div class="info-item"><span class="info-label">RDAP Service:</span> <span class="info-value mono">${$.escape(results.serviceUrl)}</span></div></div> <div class="results-grid"><div class="result-section"><h4>Domain Information</h4> <dl class="definition-list"><dt>Domain Name:</dt> <dd><code>${$.escape(results.data.domain || results.domain)}</code></dd> <dt>Status:</dt> <dd>`);

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

			$$renderer.push(`<!--]--></dd> <dt>Registrar:</dt> <dd>${$.escape(results.data.registrar || 'Not available')}</dd></dl></div> <div class="result-section"><h4>Important Dates</h4> <dl class="definition-list"><dt>Registration Date:</dt> <dd>${$.escape(formatDate(results.data.created))}</dd> <dt>Last Updated:</dt> <dd>${$.escape(formatDate(results.data.updated))}</dd> <dt>Expiration Date:</dt> <dd${$.attr_class('', void 0, {
				'expires-soon': results.data.expires && new Date(results.data.expires) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
			})}>${$.escape(formatDate(results.data.expires))} `);

			if (results.data.expires && new Date(results.data.expires) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
				$$renderer.push(`<!--[0--><span class="warning-badge">Expires Soon!</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></dd></dl></div> `);

			if (results.data.nameservers?.length) {
				$$renderer.push(`<!--[0--><div class="result-section"><h4>Nameservers (${$.escape(results.data.nameservers.length)})</h4> <ul class="nameserver-list"><!--[-->`);

				const each_array_2 = $.ensure_array_like(results.data.nameservers);

				for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
					let ns = each_array_2[index];

					$$renderer.push(`<li><code>${$.escape(ns)}</code></li>`);
				}

				$$renderer.push(`<!--]--></ul></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (results.data.contacts?.length) {
				$$renderer.push(`<!--[0--><div class="result-section full-width"><h4>Contact Information</h4> <div class="contacts-grid"><!--[-->`);

				const each_array_3 = $.ensure_array_like(results.data.contacts);

				for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
					let contact = each_array_3[index];

					$$renderer.push(`<div class="contact-card"><h5>`);

					if (contact.roles?.includes('registrant')) {
						$$renderer.push(`<!--[0-->Registrant`);
					} else if (contact.roles?.includes('administrative')) {
						$$renderer.push(`<!--[1-->Administrative`);
					} else if (contact.roles?.includes('technical')) {
						$$renderer.push(`<!--[2-->Technical`);
					} else {
						$$renderer.push(`<!--[-1-->Contact`);
					}

					$$renderer.push(`<!--]--></h5> <p><strong>${$.escape(formatContact(contact))}</strong></p> `);

					if (contact.handle) {
						$$renderer.push(`<!--[0--><p><small>Handle: ${$.escape(contact.handle)}</small></p>`);
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
			$$renderer.push(`<!----> <div><strong>RDAP Lookup Failed</strong> <p>${$.escape(error)}</p> <div class="troubleshooting"><p><strong>Troubleshooting Tips:</strong></p> <ul><li>Ensure the domain name is valid and properly formatted</li> <li>Check if the domain actually exists and is registered</li> <li>Some registries may have rate limiting or access restrictions</li> <li>Try again in a few moments if the service is temporarily unavailable</li></ul></div></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="card info-card"><div class="card-header"><h3>About RDAP Domain Lookups</h3></div> <div class="card-content"><div class="info-grid"><div class="info-section"><h4>What is RDAP?</h4> <p>RDAP (Registration Data Access Protocol) is the modern successor to WHOIS, providing structured JSON
            responses for domain registration information through IANA bootstrap registry routing.</p></div> <div class="info-section"><h4>What You'll Get</h4> <ul><li>Registration status and dates</li> <li>Nameserver information</li> <li>Registrar details</li> <li>Contact information (if available)</li></ul></div> <div class="info-section"><h4>RDAP vs WHOIS</h4> <ul><li>Structured JSON instead of free text</li> <li>Unicode support for internationalized domains</li> <li>Built-in rate limiting and privacy controls</li> <li>RESTful API with standard HTTP methods</li></ul></div></div></div></div></div>`);
	});
}