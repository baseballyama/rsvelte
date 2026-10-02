import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import '../../../../styles/diagnostics-pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let domain = 'example.com';
		let resolver = 'cloudflare';
		let loading = false;
		let results = null;
		let error = null;
		let copiedState = false;
		let selectedExampleIndex = null;

		const resolvers = [
			{ value: 'cloudflare', label: 'Cloudflare (1.1.1.1)' },
			{ value: 'google', label: 'Google (8.8.8.8)' },
			{ value: 'quad9', label: 'Quad9 (9.9.9.9)' },
			{ value: 'opendns', label: 'OpenDNS (208.67.222.222)' }
		];

		const examples = [
			{
				domain: 'google.com',
				description: 'High-traffic domain with frequent updates'
			},

			{
				domain: 'github.com',
				description: 'Tech company with modern DNS management'
			},

			{
				domain: 'cloudflare.com',
				description: 'DNS provider with optimal configurations'
			},

			{
				domain: 'iana.org',
				description: 'Internet standards organization'
			},

			{
				domain: 'rfc-editor.org',
				description: 'Official RFC publication site'
			},

			{
				domain: 'example.com',
				description: 'Reserved example domain (RFC 2606)'
			}
		];

		async function analyzeSOA() {
			loading = true;
			error = null;
			results = null;

			try {
				const response = await fetch('/api/internal/diagnostics/dns', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						action: 'soa-serial',
						name: domain.trim(),
						resolverOpts: { doh: resolver }
					})
				});

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));

					throw new Error(errorData.message || `SOA analysis failed: ${response.status}`);
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
			analyzeSOA();
		}

		function clearExampleSelection() {
			selectedExampleIndex = null;
		}

		async function copyResults() {
			const res = results;

			if (!res?.raw) return;

			try {
				await navigator.clipboard.writeText(JSON.stringify(res.raw, null, 2));
				copiedState = true;
				setTimeout(() => copiedState = false, 1500);
			} catch(err) {
				console.error('Failed to copy:', err);
			}
		}

		function formatDuration(seconds) {
			if (seconds < 60) return `${seconds}s`;
			if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
			if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor(seconds % 3600 / 60)}m`;

			return `${Math.floor(seconds / 86400)}d ${Math.floor(seconds % 86400 / 3600)}h`;
		}

		function formatDate(timestamp) {
			try {
				return new Date(timestamp * 1000).toLocaleString('en-US', {
					year: 'numeric',
					month: 'short',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit',
					timeZoneName: 'short'
				});
			} catch {
				return 'Invalid date';
			}
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h1>SOA Serial Analyzer</h1> <p>Analyze Start of Authority (SOA) records to interpret serial number formats and examine DNS zone timing
      parameters. SOA records contain critical zone metadata including serial numbers for change tracking and timing
      values for zone transfers.</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary">`);

		Icon($$renderer, { name: 'chevron-right', size: 'xs' });
		$$renderer.push(`<!----> <h4>Domain Examples</h4></summary> <div class="examples-grid"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let example = each_array[i];

			$$renderer.push(`<button${$.attr_class('example-card', void 0, { 'selected': selectedExampleIndex === i })}><h5>${$.escape(example.domain)}</h5> <p>${$.escape(example.description)}</p></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="card input-card"><div class="card-header"><h3>SOA Analysis Configuration</h3></div> <div class="card-content"><div class="form-grid svelte-pe9bo2"><div class="form-group svelte-pe9bo2"><label for="domain" class="svelte-pe9bo2">Domain Name <input id="domain" type="text"${$.attr('value', domain)} placeholder="example.com"/></label></div> <div class="form-group svelte-pe9bo2"><label for="resolver" class="svelte-pe9bo2">DoH Resolver `);

		$$renderer.select(
			{
				id: 'resolver',
				value: resolver,
				onchange: () => {
					if (domain.trim()) analyzeSOA();
				}
			},
			($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array_1 = $.ensure_array_like(resolvers);

				for (let resIndex = 0, $$length = each_array_1.length; resIndex < $$length; resIndex++) {
					let res = each_array_1[resIndex];

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
			$$renderer.push(`<!----> Analyzing SOA Record...`);
		} else {
			$$renderer.push('<!--[-1-->');
			Icon($$renderer, { name: 'search', size: 'sm' });
			$$renderer.push(`<!----> Analyze SOA`);
		}

		$$renderer.push(`<!--]--></button></div></div></div> `);

		if (results) {
			$$renderer.push('<!--[0-->');

			const res = results;
			const serialInfo = results.serialAnalysis;
			const serialAnalysis = results.serialAnalysis;
			const soaData = results.soa;
			const timingData = results.soa;

			$$renderer.push(`<div class="card results-card"><div class="card-header row"><h3>SOA Analysis for ${$.escape(results.name)}</h3> <button class="copy-btn"${$.attr('disabled', copiedState, true)}><span${$.attr_class($.clsx(copiedState ? 'text-green-500' : ''))}>`);
			Icon($$renderer, { name: copiedState ? 'check' : 'copy', size: 'xs' });
			$$renderer.push(`<!----></span> ${$.escape(copiedState ? 'Copied!' : 'Copy Raw JSON')}</button></div> <div class="card-content"><div class="lookup-info"><div class="info-item"><span class="info-label">Domain:</span> <span class="info-value mono">${$.escape(results.name)}</span></div> <div class="info-item"><span class="info-label">DoH Resolver:</span> <span class="info-value">${$.escape(results.resolver)}</span></div></div> <div class="results-grid"><div class="result-section"><h4>Serial Number Analysis</h4> <div class="serial-analysis svelte-pe9bo2"><div class="serial-display svelte-pe9bo2"><span class="serial-number svelte-pe9bo2">${$.escape(res.soa?.serial || 'Not available')}</span> <span${$.attr_class(`serial-format ${$.stringify(res.serialAnalysis?.format)}`, 'svelte-pe9bo2')}>${$.escape(res.serialAnalysis?.format || 'Unknown')}</span></div> <dl class="definition-list"><dt>Format:</dt> <dd><strong>${$.escape(serialInfo?.formatDescription || 'Unknown')}</strong> <p class="format-explanation svelte-pe9bo2">${$.escape(serialInfo?.explanation || 'No analysis available')}</p></dd> `);

			if (serialAnalysis?.parsed) {
				$$renderer.push(`<!--[0--><dt>Parsed Date:</dt> <dd>`);

				if (serialAnalysis.format === 'YYYYMMDDNN') {
					$$renderer.push(`<!--[0--><div class="parsed-date svelte-pe9bo2"><span class="date-part svelte-pe9bo2">Year: ${$.escape(serialAnalysis.parsed.year)}</span> <span class="date-part svelte-pe9bo2">Month: ${$.escape(serialAnalysis.parsed.month)}</span> <span class="date-part svelte-pe9bo2">Day: ${$.escape(serialAnalysis.parsed.day)}</span> <span class="date-part svelte-pe9bo2">Revision: ${$.escape(serialAnalysis.parsed.revision)}</span></div>`);
				} else if (serialAnalysis.format === 'Unix Timestamp') {
					$$renderer.push(`<!--[1--><span class="unix-date svelte-pe9bo2">${$.escape(formatDate(serialAnalysis.parsed.timestamp))}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></dd>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <dt>Validity:</dt> <dd${$.attr_class(`validity ${serialAnalysis?.valid ? 'valid' : 'invalid'}`, 'svelte-pe9bo2')}>`);

			Icon($$renderer, {
				name: serialAnalysis?.valid ? 'check-circle' : 'x-circle',
				size: 'sm'
			});

			$$renderer.push(`<!----> ${$.escape(serialAnalysis?.valid ? 'Valid format' : 'Invalid or unusual format')}</dd></dl></div></div> <div class="result-section"><h4>SOA Record Details</h4> <dl class="definition-list"><dt>Primary Server:</dt> <dd class="mono">${$.escape(soaData?.mname || 'Not available')}</dd> <dt>Contact Email:</dt> <dd class="mono">${$.escape(soaData?.rname || 'Not available')}</dd> <dt>TTL:</dt> <dd>`);

			if (soaData?.ttl) {
				$$renderer.push(`<!--[0--><span class="ttl-value svelte-pe9bo2">${$.escape(soaData.ttl)}s</span> <small>(${$.escape(formatDuration(soaData.ttl))})</small>`);
			} else {
				$$renderer.push(`<!--[-1-->Not available`);
			}

			$$renderer.push(`<!--]--></dd></dl></div> <div class="result-section full-width"><h4>Zone Timing Parameters</h4> <div class="timing-grid svelte-pe9bo2"><div class="timing-param svelte-pe9bo2"><h5 class="svelte-pe9bo2">Refresh</h5> <div class="param-value svelte-pe9bo2">${$.escape(timingData?.refresh || 0)}s</div> <div class="param-description svelte-pe9bo2"><small class="svelte-pe9bo2">${$.escape(formatDuration(timingData?.refresh || 0))}</small> <p class="svelte-pe9bo2">How often secondary servers check for updates</p></div></div> <div class="timing-param svelte-pe9bo2"><h5 class="svelte-pe9bo2">Retry</h5> <div class="param-value svelte-pe9bo2">${$.escape(timingData?.retry || 0)}s</div> <div class="param-description svelte-pe9bo2"><small class="svelte-pe9bo2">${$.escape(formatDuration(timingData?.retry || 0))}</small> <p class="svelte-pe9bo2">Retry interval after failed refresh attempts</p></div></div> <div class="timing-param svelte-pe9bo2"><h5 class="svelte-pe9bo2">Expire</h5> <div class="param-value svelte-pe9bo2">${$.escape(timingData?.expire || 0)}s</div> <div class="param-description svelte-pe9bo2"><small class="svelte-pe9bo2">${$.escape(formatDuration(timingData?.expire || 0))}</small> <p class="svelte-pe9bo2">When secondary servers stop serving the zone</p></div></div> <div class="timing-param svelte-pe9bo2"><h5 class="svelte-pe9bo2">Minimum</h5> <div class="param-value svelte-pe9bo2">${$.escape(timingData?.minimum || 0)}s</div> <div class="param-description svelte-pe9bo2"><small class="svelte-pe9bo2">${$.escape(formatDuration(timingData?.minimum || 0))}</small> <p class="svelte-pe9bo2">Minimum TTL for negative responses</p></div></div></div></div> `);

			if (results.assessment?.length) {
				$$renderer.push('<!--[0-->');

				const assessmentData = results.assessment;

				$$renderer.push(`<div class="result-section full-width"><h4>Configuration Assessment</h4> <div class="assessment-grid svelte-pe9bo2"><!--[-->`);

				const each_array_2 = $.ensure_array_like(assessmentData || []);

				for (let itemIndex = 0, $$length = each_array_2.length; itemIndex < $$length; itemIndex++) {
					let item = each_array_2[itemIndex];

					$$renderer.push(`<div${$.attr_class(`assessment-item ${$.stringify(item.severity)}`, 'svelte-pe9bo2')}>`);

					Icon($$renderer, {
						name: item.severity === 'good'
							? 'check-circle'
							: item.severity === 'warning' ? 'alert-triangle' : 'info',
						size: 'md'
					});

					$$renderer.push(`<!----> <div><strong class="svelte-pe9bo2">${$.escape(item.aspect)}</strong> <p class="svelte-pe9bo2">${$.escape(item.message)}</p> `);

					if (item.recommendation) {
						$$renderer.push(`<!--[0--><small class="recommendation svelte-pe9bo2">${$.escape(item.recommendation)}</small>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></div>`);
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
			$$renderer.push(`<!----> <div><strong>SOA Analysis Failed</strong> <p>${$.escape(error)}</p> <div class="troubleshooting"><p><strong>Troubleshooting Tips:</strong></p> <ul><li>Ensure the domain name is valid and has a SOA record</li> <li>Try a different DoH resolver if the current one fails</li> <li>Some domains may not respond to certain resolvers</li> <li>Check if the domain exists and is properly configured</li></ul></div></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="card info-card"><div class="card-header"><h3>About SOA Records and Serial Numbers</h3></div> <div class="card-content"><div class="info-grid"><div class="info-section"><h4>What is a SOA Record?</h4> <p>Start of Authority records contain administrative information about a DNS zone, including the primary
            server, contact email, and timing parameters that control zone transfers and caching behavior.</p></div> <div class="info-section"><h4>Serial Number Formats</h4> <ul><li><strong>YYYYMMDDNN:</strong> Date-based format (e.g., 2024031501 = March 15, 2024, revision 01)</li> <li><strong>Unix Timestamp:</strong> Seconds since epoch (e.g., 1710518400)</li> <li><strong>Sequential:</strong> Simple incrementing numbers (e.g., 1, 2, 3...)</li></ul></div> <div class="info-section"><h4>Timing Parameters</h4> <ul><li><strong>Refresh:</strong> How often secondaries check for updates</li> <li><strong>Retry:</strong> Retry interval after failed transfers</li> <li><strong>Expire:</strong> When to stop serving if updates fail</li> <li><strong>Minimum:</strong> TTL for negative (NXDOMAIN) responses</li></ul></div> <div class="info-section"><h4>Best Practices</h4> <ul><li>Use YYYYMMDDNN format for predictable versioning</li> <li>Set refresh to 3600-7200s for most zones</li> <li>Retry should be shorter than refresh (1800-3600s)</li> <li>Expire should be much longer (604800-1209600s)</li></ul></div></div></div></div></div>`);
	});
}