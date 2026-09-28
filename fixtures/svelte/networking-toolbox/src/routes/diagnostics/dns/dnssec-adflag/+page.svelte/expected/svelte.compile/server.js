import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import '../../../../styles/diagnostics-pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let domain = 'example.com';
		let recordType = 'A';
		let resolver = 'cloudflare';
		let loading = false;
		let results = null;
		let error = null;
		let copiedState = false;
		let selectedExampleIndex = null;

		const recordTypes = [
			{ value: 'A', label: 'A', description: 'IPv4 address records' },
			{
				value: 'AAAA',
				label: 'AAAA',
				description: 'IPv6 address records'
			},

			{
				value: 'CNAME',
				label: 'CNAME',
				description: 'Canonical name records'
			},

			{
				value: 'MX',
				label: 'MX',
				description: 'Mail exchange records'
			},
			{ value: 'TXT', label: 'TXT', description: 'Text records' },
			{ value: 'NS', label: 'NS', description: 'Name server records' },
			{
				value: 'SOA',
				label: 'SOA',
				description: 'Start of authority records'
			}
		];

		const resolvers = [
			{ value: 'cloudflare', label: 'Cloudflare (1.1.1.1)' },
			{ value: 'google', label: 'Google (8.8.8.8)' },
			{ value: 'quad9', label: 'Quad9 (9.9.9.9)' },
			{ value: 'opendns', label: 'OpenDNS (208.67.222.222)' }
		];

		const examples = [
			{
				domain: 'cloudflare.com',
				type: 'A',
				description: 'DNSSEC-signed domain'
			},

			{
				domain: 'dnssec-failed.org',
				type: 'A',
				description: 'DNSSEC validation failure test'
			},

			{
				domain: 'example.com',
				type: 'A',
				description: 'Unsigned domain example'
			},

			{
				domain: 'google.com',
				type: 'A',
				description: 'Popular signed domain'
			},

			{
				domain: 'iana.org',
				type: 'A',
				description: 'Internet registry domain'
			}
		];

		async function checkDNSSEC() {
			loading = true;
			error = null;
			results = null;

			try {
				const response = await fetch('/api/internal/diagnostics/dns', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						action: 'dnssec-adflag',
						name: domain.trim(),
						type: recordType,
						resolverOpts: { doh: resolver }
					})
				});

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));

					throw new Error(errorData.message || `DNSSEC check failed: ${response.status}`);
				}

				results = await response.json();
			} catch(err) {
				error = err.message;
			} finally {
				loading = false;
			}
		}

		function loadExample(example, index) {
			domain = example.domain;
			recordType = example.type;
			selectedExampleIndex = index;
			checkDNSSEC();
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

		$$renderer.push(`<div class="card"><header class="card-header"><h1>DNSSEC AD Flag Checker</h1> <p>Query DNS records via DoH and report if the AD (Authenticated Data) bit is set. The AD bit indicates whether the
      DNS response has been cryptographically verified through DNSSEC validation.</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary">`);

		Icon($$renderer, { name: 'chevron-right', size: 'xs' });
		$$renderer.push(`<!----> <h4>Example DNSSEC Tests</h4></summary> <div class="examples-grid"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let example = each_array[i];

			$$renderer.push(`<button${$.attr_class('example-card svelte-15x3kkc', void 0, { 'selected': selectedExampleIndex === i })}><h5>${$.escape(example.domain)}</h5> <p>${$.escape(example.description)}</p> <small class="svelte-15x3kkc">${$.escape(example.type)} record</small></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="card input-card"><div class="card-header"><h3>DNSSEC Query Configuration</h3></div> <div class="card-content"><div class="form-grid svelte-15x3kkc"><div class="form-group svelte-15x3kkc"><label for="domain" class="svelte-15x3kkc">Domain Name <input id="domain" type="text"${$.attr('value', domain)} placeholder="example.com"/></label></div> <div class="form-group svelte-15x3kkc"><label for="recordType" class="svelte-15x3kkc">Record Type `);

		$$renderer.select(
			{
				id: 'recordType',
				value: recordType,
				onchange: () => {
					clearExampleSelection();

					if (domain.trim()) checkDNSSEC();
				}
			},
			($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array_1 = $.ensure_array_like(recordTypes);

				for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
					let type = each_array_1[index];

					$$renderer.option({ value: type.value }, ($$renderer) => {
						$$renderer.push(`${$.escape(type.label)} - ${$.escape(type.description)}`);
					});
				}

				$$renderer.push(`<!--]-->`);
			}
		);

		$$renderer.push(`</label></div> <div class="form-group svelte-15x3kkc"><label for="resolver" class="svelte-15x3kkc">DoH Resolver `);

		$$renderer.select(
			{
				id: 'resolver',
				value: resolver,
				onchange: () => {
					if (domain.trim()) checkDNSSEC();
				}
			},
			($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array_2 = $.ensure_array_like(resolvers);

				for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
					let res = each_array_2[index];

					$$renderer.option({ value: res.value }, ($$renderer) => {
						$$renderer.push(`${$.escape(res.label)}`);
					});
				}

				$$renderer.push(`<!--]-->`);
			}
		);

		$$renderer.push(`</label></div></div> <div class="action-section"><button class="lookup-btn"${$.attr('disabled', loading || !domain.trim(), true)}>`);

		if (loading) {
			$$renderer.push('<!--[0-->');
			Icon($$renderer, { name: 'loader', size: 'sm', animate: 'spin' });
			$$renderer.push(`<!----> Checking DNSSEC...`);
		} else {
			$$renderer.push('<!--[-1-->');
			Icon($$renderer, { name: 'search', size: 'sm' });
			$$renderer.push(`<!----> Check DNSSEC`);
		}

		$$renderer.push(`<!--]--></button></div></div></div> `);

		if (results) {
			$$renderer.push(`<!--[0--><div class="card results-card"><div class="card-header row"><h3>DNSSEC Status for ${$.escape(results.name)}</h3> <button class="copy-btn"${$.attr('disabled', copiedState, true)}><span${$.attr_class($.clsx(copiedState ? 'text-green-500' : ''))}>`);
			Icon($$renderer, { name: copiedState ? 'check' : 'copy', size: 'xs' });
			$$renderer.push(`<!----></span> ${$.escape(copiedState ? 'Copied!' : 'Copy Raw JSON')}</button></div> <div class="card-content"><div class="lookup-info"><div class="info-item"><span class="info-label">Query:</span> <span class="info-value mono">${$.escape(results.name)} (${$.escape(results.type)})</span></div> <div class="info-item"><span class="info-label">DoH Resolver:</span> <span class="info-value">${$.escape(results.resolver)}</span></div></div> <div class="result-section"><h4>DNSSEC Validation Status</h4> <div class="dnssec-status svelte-15x3kkc"><div${$.attr_class(`status-item ${results.authenticated ? 'success' : 'warning'}`, 'svelte-15x3kkc')}>`);

			Icon($$renderer, {
				name: results.authenticated ? 'shield-check' : 'shield-alert',
				size: 'md'
			});

			$$renderer.push(`<!----> <div><strong class="svelte-15x3kkc">AD (Authenticated Data) Flag</strong> <p class="svelte-15x3kkc">${$.escape(results.authenticated
				? 'SET - Response is DNSSEC validated'
				: 'NOT SET - Response is not validated')}</p></div></div> `);

			if (results.checkingDisabled) {
				$$renderer.push(`<!--[0--><div class="status-item info svelte-15x3kkc">`);
				Icon($$renderer, { name: 'info', size: 'md' });
				$$renderer.push(`<!----> <div><strong class="svelte-15x3kkc">CD (Checking Disabled) Flag</strong> <p class="svelte-15x3kkc">SET - DNSSEC validation was disabled for this query</p></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div${$.attr_class(`status-item ${results.rcode === 0 ? 'success' : 'error'}`, 'svelte-15x3kkc')}>`);

			Icon($$renderer, {
				name: results.rcode === 0 ? 'check-circle' : 'x-circle',
				size: 'md'
			});

			$$renderer.push(`<!----> <div><strong class="svelte-15x3kkc">Response Code</strong> <p class="svelte-15x3kkc">${$.escape(results.rcodeText)}</p></div></div></div> <div class="explanation svelte-15x3kkc"><h5 class="svelte-15x3kkc">Explanation</h5> <p class="svelte-15x3kkc">${$.escape(results.explanation)}</p></div></div> `);

			if (results.records?.length) {
				$$renderer.push(`<!--[0--><div class="result-section"><h4>DNS Records (${$.escape(results.records.length)})</h4> <div class="records-list"><!--[-->`);

				const each_array_3 = $.ensure_array_like(results.records);

				for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
					let record = each_array_3[index];

					$$renderer.push(`<div class="record-item"><div class="record-data mono">${$.escape(record.data)}</div> `);

					if (record.TTL) {
						$$renderer.push(`<!--[0--><div class="record-ttl svelte-15x3kkc">TTL: ${$.escape(record.TTL)}s</div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (results.authority?.length) {
				$$renderer.push(`<!--[0--><div class="result-section"><h4>Authority Section (${$.escape(results.authority.length)})</h4> <div class="records-list"><!--[-->`);

				const each_array_4 = $.ensure_array_like(results.authority);

				for (let index = 0, $$length = each_array_4.length; index < $$length; index++) {
					let record = each_array_4[index];

					$$renderer.push(`<div class="record-item"><div class="record-data mono">${$.escape(record.name)} ${$.escape(record.type)} ${$.escape(record.data)}</div> `);

					if (record.TTL) {
						$$renderer.push(`<!--[0--><div class="record-ttl svelte-15x3kkc">TTL: ${$.escape(record.TTL)}s</div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (error) {
			$$renderer.push(`<!--[0--><div class="card error-card"><div class="card-content"><div class="error-content">`);
			Icon($$renderer, { name: 'alert-triangle', size: 'md' });
			$$renderer.push(`<!----> <div><strong>DNSSEC Check Failed</strong> <p>${$.escape(error)}</p> <div class="troubleshooting"><p><strong>Troubleshooting Tips:</strong></p> <ul><li>Ensure the domain name is valid and exists</li> <li>Try a different record type if the current one doesn't exist</li> <li>Switch to a different DoH resolver</li> <li>Some domains may not have the requested record type</li></ul></div></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="card info-card"><div class="card-header"><h3>About DNSSEC and the AD Flag</h3></div> <div class="card-content"><div class="info-grid"><div class="info-section"><h4>What is DNSSEC?</h4> <p>DNS Security Extensions (DNSSEC) adds cryptographic authentication to DNS responses, protecting against DNS
            spoofing and cache poisoning attacks by ensuring response integrity.</p></div> <div class="info-section"><h4>The AD (Authenticated Data) Flag</h4> <p>The AD bit in DNS responses indicates that the resolver has successfully validated the response using
            DNSSEC. When set, you can trust the response hasn't been tampered with.</p></div> <div class="info-section"><h4>Why Use DoH for DNSSEC?</h4> <p>DNS-over-HTTPS preserves DNSSEC validation status in the AD flag, while traditional DNS queries may not
            expose this information clearly to clients.</p></div> <div class="info-section"><h4>Interpreting Results</h4> <ul><li><strong>AD Set:</strong> Response is cryptographically verified</li> <li><strong>AD Not Set:</strong> Domain unsigned, validation failed, or resolver doesn't validate</li> <li><strong>CD Set:</strong> Validation was disabled for this query</li> <li><strong>SERVFAIL:</strong> May indicate DNSSEC validation failure</li></ul></div></div></div></div></div>`);
	});
}