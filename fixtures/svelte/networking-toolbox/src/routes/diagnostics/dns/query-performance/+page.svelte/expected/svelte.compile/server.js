import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip';
import Icon from '$lib/components/global/Icon.svelte';
import { dnsPerformanceContent } from '$lib/content/dns-performance';
import '$lib/../styles/diagnostics-pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const API_ENDPOINT = '/api/internal/diagnostics/dns-performance';
		const RECORD_TYPES = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME', 'SOA'];

		const EXAMPLES = [
			{
				domain: 'example.com',
				type: 'NS',
				description: 'Example nameservers'
			},
			{ domain: 'adobe.com', type: 'TXT', description: 'Adobe TXT' },
			{ domain: 'bbc.co.uk', type: 'A', description: 'BBC UK' },
			{
				domain: 'slack.com',
				type: 'MX',
				description: 'Slack mail servers'
			},

			{
				domain: 'facebook.com',
				type: 'AAAA',
				description: 'Facebook IPv6'
			},
			{ domain: 'ibm.com', type: 'SOA', description: 'IBM SOA' }
		];

		const PERF_RANGES = [
			{ max: 20, class: 'excellent', label: 'Excellent' },
			{ max: 50, class: 'good', label: 'Good' },
			{ max: 100, class: 'acceptable', label: 'Acceptable' },
			{ max: 200, class: 'slow', label: 'Slow' },
			{ max: Infinity, class: 'very-slow', label: 'Very Slow' }
		];

		let domain = '';
		let recordType = 'A';
		let loading = false;
		let results = null;
		let error = null;
		let selectedExampleIndex = null;
		let abortController = null;
		let requestId = 0;
		let showAdvanced = false;
		let customResolvers = '';
		let includeDefaultResolvers = true;
		let timeoutMs = 5000;

		const isInputValid = $.derived(() => {
			const trimmed = domain.trim();

			if (!trimmed) return false;

			// Support underscores for _acme-challenge and similar
			const domainPattern = /^([a-zA-Z0-9_]([a-zA-Z0-9_-]{0,61}[a-zA-Z0-9_])?\.)+[a-zA-Z]{2,}$/;

			return domainPattern.test(trimmed);
		});

		const customResolversValid = $.derived(() => {
			if (!customResolvers.trim()) return true;

			const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
			const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
			const resolvers = customResolvers.split(/[\n,;]/).map((r) => r.trim()).filter((r) => r);

			return resolvers.every((ip) => ipv4Pattern.test(ip) || ipv6Pattern.test(ip));
		});

		const sortedResults = $.derived(() => {
			if (!results?.results) return [];

			return [...results.results].sort((a, b) => a.success && b.success ? a.responseTime - b.responseTime : a.success ? -1 : 1);
		});

		const successCount = $.derived(() => results?.results.filter((r) => r.success).length ?? 0);
		const totalCount = $.derived(() => results?.results.length ?? 0);
		const formattedTimestamp = $.derived(() => results?.timestamp ? new Date(results.timestamp).toLocaleString() : '');
		const totalRecords = $.derived(() => sortedResults().reduce((sum, r) => sum + (r.records?.length ?? 0), 0));
		const fastestResolver = $.derived(() => results?.statistics.fastest.resolver ?? '');

		const performanceSpread = $.derived(() => results
			? Math.round((results.statistics.slowest.time - results.statistics.fastest.time) * 100) / 100
			: 0);

		function getPerformance(time) {
			const range = PERF_RANGES.find((r) => time < r.max);

			return { class: range.class, label: range.label };
		}

		async function testPerformance() {
			if (!isInputValid()) return;

			// Cancel previous request
			abortController?.abort();

			const controller = new AbortController();

			abortController = controller;

			const currentRequestId = ++requestId;

			loading = true;
			error = null;
			results = null;

			try {
				const body = { domain: domain.trim(), recordType };

				// Add custom resolvers if provided
				if (customResolvers.trim()) {
					const resolvers = customResolvers.split(/[\n,;]/).map((r) => r.trim()).filter((r) => r);

					body.customResolvers = resolvers;
					body.includeDefaultResolvers = includeDefaultResolvers;
				}

				// Add custom timeout if different from default
				if (timeoutMs !== 5000) {
					body.timeoutMs = timeoutMs;
				}

				const response = await fetch(API_ENDPOINT, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
					signal: controller.signal
				});

				// Ignore stale responses
				if (currentRequestId !== requestId) return;

				if (!response.ok) {
					let errorMsg = 'Failed to test DNS performance';

					try {
						const data = await response.json();

						errorMsg = data.message || errorMsg;
					} catch {
						errorMsg = await response.text();
					}

					throw new Error(errorMsg);
				}

				results = await response.json();
			} catch(err) {
				if (currentRequestId !== requestId) return;
				if (err instanceof Error && err.name === 'AbortError') return;

				error = err instanceof Error ? err.message : 'An unexpected error occurred';
			} finally {
				if (currentRequestId === requestId) {
					loading = false;
				}
			}
		}

		function loadExample(index) {
			const example = EXAMPLES[index];

			domain = example.domain;
			recordType = example.type;
			selectedExampleIndex = index;
			testPerformance();
		}

		$.head('168o2iv', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>DNS Query Performance Comparison | IP Calc</title>`);
			});

			$$renderer.push(`<meta name="description" content="Compare DNS resolver speeds across Google, Cloudflare, Quad9, and more. Find the fastest DNS server for your location to improve browsing speed."/> <meta name="keywords" content="DNS performance, DNS speed test, DNS resolver comparison, fastest DNS, DNS latency, Cloudflare DNS, Google DNS, Quad9"/>`);
		});

		$$renderer.push(`<div class="card"><header class="card-header"><h1>DNS Query Performance Comparison</h1> <p>Compare response times across multiple DNS resolvers to find the fastest for your location</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary">`);
		Icon($$renderer, { name: 'chevron-right', size: 'xs' });
		$$renderer.push(`<!----> <h4>Quick Examples</h4></summary> <div class="examples-grid"><!--[-->`);

		const each_array = $.ensure_array_like(EXAMPLES);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let example = each_array[i];

			$$renderer.push(`<button${$.attr_class('example-card', void 0, { 'selected': selectedExampleIndex === i })}><h5>${$.escape(example.description)}</h5> <p>${$.escape(example.domain)} (${$.escape(example.type)})</p></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="card input-card"><form class="inline-form svelte-168o2iv"${$.attr('aria-busy', loading)}><div class="form-group flex-grow svelte-168o2iv"><label for="domain" class="svelte-168o2iv">Domain Name</label> <input id="domain" type="text"${$.attr('value', domain)} placeholder="e.g., google.com"${$.attr('disabled', loading, true)} autocomplete="off" inputmode="url"${$.attr('aria-invalid', !!(domain && !isInputValid()))}/></div> <div class="form-group svelte-168o2iv"><label for="recordType" class="svelte-168o2iv">Record Type</label> `);

		$$renderer.select(
			{
				id: 'recordType',
				value: recordType,
				disabled: loading,
				class: ''
			},
			($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array_1 = $.ensure_array_like(RECORD_TYPES);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let type = each_array_1[$$index_1];

					$$renderer.option({ value: type }, ($$renderer) => {
						$$renderer.push(`${$.escape(type)}`);
					});
				}

				$$renderer.push(`<!--]-->`);
			},
			'svelte-168o2iv'
		);

		$$renderer.push(`</div> <button type="submit"${$.attr('disabled', loading || !isInputValid(), true)} class="primary submit-btn svelte-168o2iv"${$.attr('aria-busy', loading)}>`);

		if (loading) {
			$$renderer.push('<!--[0-->');
			Icon($$renderer, { name: 'loader', size: 'sm', animate: 'spin' });
			$$renderer.push(`<!----> Testing...`);
		} else {
			$$renderer.push('<!--[-1-->');
			Icon($$renderer, { name: 'zap', size: 'sm' });
			$$renderer.push(`<!----> Test Performance`);
		}

		$$renderer.push(`<!--]--></button></form> <details class="advanced-options svelte-168o2iv"${$.attr('open', showAdvanced, true)}><summary class="svelte-168o2iv">`);
		Icon($$renderer, { name: 'chevron-right', size: 'xs' });

		$$renderer.push(`<!----> Advanced Options</summary> <div class="advanced-content svelte-168o2iv"><div class="form-group svelte-168o2iv"><label for="customResolvers" class="svelte-168o2iv">Custom DNS Servers <span class="help-text svelte-168o2iv">One per line, or comma/semicolon separated</span></label> <textarea id="customResolvers" placeholder="1.0.0.1
8.26.56.26
or 1.0.0.1, 8.26.56.26" rows="3"${$.attr('disabled', loading, true)}${$.attr('aria-invalid', !customResolversValid())}${$.attr('aria-describedby', !customResolversValid() ? 'customResolvers-error' : undefined)} class="svelte-168o2iv">`);

		const $$body = $.escape(customResolvers);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea> `);

		if (!customResolversValid()) {
			$$renderer.push(`<!--[0--><span id="customResolvers-error" class="error-text svelte-168o2iv" role="alert">Invalid IP address format. Enter valid IPv4 or IPv6 addresses.</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="checkbox-group svelte-168o2iv"><label for="includeDefaults" class="svelte-168o2iv"><input id="includeDefaults" type="checkbox"${$.attr('checked', includeDefaultResolvers, true)}${$.attr('disabled', loading || !customResolvers.trim(), true)} class="svelte-168o2iv"/> <span class="svelte-168o2iv">Include default resolvers with custom servers</span></label></div></div> <div class="form-group svelte-168o2iv"><label for="timeout" class="svelte-168o2iv">Query Timeout (ms) <span class="help-text svelte-168o2iv">Max time to wait per resolver (1000-30000ms)</span></label> <input id="timeout" type="number"${$.attr('value', timeoutMs)} min="1000" max="30000" step="500"${$.attr('disabled', loading, true)} aria-describedby="timeout-help" class="svelte-168o2iv"/> <span id="timeout-help" class="help-text">Default: 5000ms</span></div> <div class="advanced-info svelte-168o2iv">`);
		Icon($$renderer, { name: 'info', size: 'xs' });
		$$renderer.push(`<!----> <p class="svelte-168o2iv">Custom DNS servers must be valid IPv4 or IPv6 addresses. Duplicates will be removed automatically.</p></div></div></details></div> `);

		if (error) {
			$$renderer.push(`<!--[0--><div class="card error-card">`);
			Icon($$renderer, { name: 'alert-triangle', size: 'md' });
			$$renderer.push(`<!----> <div><h4>Error</h4> <p>${$.escape(error)}</p></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (loading) {
			$$renderer.push(`<!--[0--><div class="card" role="status" aria-live="polite"><div class="card-content"><div class="loading-state">`);
			Icon($$renderer, { name: 'loader', size: 'lg', animate: 'spin' });
			$$renderer.push(`<!----> <div class="loading-text"><h3>Testing DNS Resolvers</h3> <p>Querying ${$.escape(recordType)} records for ${$.escape(domain)}...</p></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (results) {
			$$renderer.push(`<!--[0--><div class="card results-card"><div class="card-header"><h2>Performance Results</h2></div> <div class="stats-summary svelte-168o2iv"><div class="stat-card fastest svelte-168o2iv">`);
			Icon($$renderer, { name: 'zap', size: 'md' });
			$$renderer.push(`<!----> <div class="stat-content svelte-168o2iv"><span class="stat-label svelte-168o2iv">Fastest</span> <span class="stat-value svelte-168o2iv">${$.escape(results.statistics.fastest.resolver)}</span> <span class="stat-detail svelte-168o2iv">${$.escape(results.statistics.fastest.time)}ms</span></div></div> <div class="stat-card average svelte-168o2iv">`);
			Icon($$renderer, { name: 'activity', size: 'md' });
			$$renderer.push(`<!----> <div class="stat-content svelte-168o2iv"><span class="stat-label svelte-168o2iv">Average</span> <span class="stat-value svelte-168o2iv">${$.escape(results.statistics.average)}ms</span> <span class="stat-detail svelte-168o2iv">Median: ${$.escape(results.statistics.median)}ms</span></div></div> <div class="stat-card slowest svelte-168o2iv">`);
			Icon($$renderer, { name: 'clock', size: 'md' });
			$$renderer.push(`<!----> <div class="stat-content svelte-168o2iv"><span class="stat-label svelte-168o2iv">Slowest</span> <span class="stat-value svelte-168o2iv">${$.escape(results.statistics.slowest.resolver)}</span> <span class="stat-detail svelte-168o2iv">${$.escape(results.statistics.slowest.time)}ms</span></div></div> <div class="stat-card success svelte-168o2iv">`);
			Icon($$renderer, { name: 'check-circle', size: 'md' });
			$$renderer.push(`<!----> <div class="stat-content svelte-168o2iv"><span class="stat-label svelte-168o2iv">Success Rate</span> <span class="stat-value svelte-168o2iv">${$.escape(results.statistics.successRate)}%</span> <span class="stat-detail svelte-168o2iv">${$.escape(successCount())}/${$.escape(totalCount())}</span></div></div></div> <div class="resolvers-section svelte-168o2iv"><h3 class="svelte-168o2iv">Resolver Comparison</h3> <div class="resolvers-list svelte-168o2iv"><!--[-->`);

			const each_array_2 = $.ensure_array_like(sortedResults());

			for (let $$index_3 = 0, $$length = each_array_2.length; $$index_3 < $$length; $$index_3++) {
				let result = each_array_2[$$index_3];
				const perf = result.success ? getPerformance(result.responseTime) : null;

				$$renderer.push(`<div${$.attr_class('resolver-card svelte-168o2iv', void 0, { 'failed': !result.success })}><div class="resolver-header svelte-168o2iv"><div class="resolver-info svelte-168o2iv"><strong class="svelte-168o2iv">${$.escape(result.resolverName)}</strong> <span class="resolver-ip svelte-168o2iv">${$.escape(result.resolver)}</span></div> `);

				if (perf) {
					$$renderer.push(`<!--[0--><div${$.attr_class(`performance-badge ${$.stringify(perf.class)}`, 'svelte-168o2iv')}><span class="time svelte-168o2iv">${$.escape(result.responseTime)}ms</span> <span class="label svelte-168o2iv">${$.escape(perf.label)}</span></div>`);
				} else {
					$$renderer.push(`<!--[-1--><div class="error-badge svelte-168o2iv">`);
					Icon($$renderer, { name: 'x-circle', size: 'xs' });
					$$renderer.push(`<!----> Failed</div>`);
				}

				$$renderer.push(`<!--]--></div> `);

				if (result.records?.length) {
					$$renderer.push(`<!--[0--><details class="records-details svelte-168o2iv"><summary class="svelte-168o2iv">`);
					Icon($$renderer, { name: 'chevron-right', size: 'xs' });
					$$renderer.push(`<!----> View ${$.escape(result.records.length)} record${$.escape(result.records.length === 1 ? '' : 's')}</summary> <div class="records-list svelte-168o2iv"><!--[-->`);

					const each_array_3 = $.ensure_array_like(result.records);

					for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
						let record = each_array_3[$$index_2];

						$$renderer.push(`<code class="record-item svelte-168o2iv">${$.escape(record)}</code>`);
					}

					$$renderer.push(`<!--]--></div></details>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (result.error) {
					$$renderer.push(`<!--[0--><div class="error-message svelte-168o2iv">`);
					Icon($$renderer, { name: 'alert-circle', size: 'xs' });
					$$renderer.push(`<!----> <span>${$.escape(result.error)}</span></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			}

			$$renderer.push(`<!--]--></div></div> <div class="query-info svelte-168o2iv"><div class="info-item svelte-168o2iv"><span class="label svelte-168o2iv">Domain</span> <span class="value svelte-168o2iv">${$.escape(results.domain)}</span></div> <div class="info-item svelte-168o2iv"><span class="label svelte-168o2iv">Record Type</span> <span class="value svelte-168o2iv">${$.escape(results.recordType)}</span></div> <div class="info-item svelte-168o2iv"><span class="label svelte-168o2iv">Total Records</span> <span class="value svelte-168o2iv">${$.escape(totalRecords())}</span></div> <div class="info-item svelte-168o2iv"><span class="label svelte-168o2iv">Resolvers Tested</span> <span class="value svelte-168o2iv">${$.escape(successCount())} of ${$.escape(totalCount())} successful</span></div> <div class="info-item svelte-168o2iv"><span class="label svelte-168o2iv">Performance Spread</span> <span class="value svelte-168o2iv">${$.escape(performanceSpread())}ms</span></div> <div class="info-item svelte-168o2iv"><span class="label svelte-168o2iv">Fastest</span> <span class="value svelte-168o2iv">${$.escape(fastestResolver())}</span></div> <div class="info-item svelte-168o2iv"><span class="label svelte-168o2iv">Tested</span> <span class="value svelte-168o2iv">${$.escape(formattedTimestamp())}</span></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="info-sections svelte-168o2iv"><div class="card svelte-168o2iv"><div class="card-header svelte-168o2iv"><h2 class="svelte-168o2iv">${$.escape(dnsPerformanceContent.sections.whatIsDnsPerformance.title)}</h2></div> <div class="card-content svelte-168o2iv"><p class="svelte-168o2iv">${$.escape(dnsPerformanceContent.sections.whatIsDnsPerformance.content)}</p></div></div> <div class="card svelte-168o2iv"><div class="card-header svelte-168o2iv"><h2 class="svelte-168o2iv">${$.escape(dnsPerformanceContent.sections.interpretingResults.title)}</h2></div> <div class="card-content svelte-168o2iv"><p class="svelte-168o2iv">${$.escape(dnsPerformanceContent.sections.interpretingResults.content)}</p> <div class="performance-ranges svelte-168o2iv"><!--[-->`);

		const each_array_4 = $.ensure_array_like(dnsPerformanceContent.sections.interpretingResults.ranges);

		for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
			let range = each_array_4[$$index_4];

			$$renderer.push(`<div${$.attr_class(`range-item ${$.stringify(range.color)}`, 'svelte-168o2iv')}><div class="range-header svelte-168o2iv"><span class="range-time svelte-168o2iv">${$.escape(range.range)}</span> <span class="range-perf svelte-168o2iv">${$.escape(range.performance)}</span></div> <p class="svelte-168o2iv">${$.escape(range.description)}</p></div>`);
		}

		$$renderer.push(`<!--]--></div></div></div> <div class="card svelte-168o2iv"><div class="card-header svelte-168o2iv"><h2 class="svelte-168o2iv">${$.escape(dnsPerformanceContent.sections.publicResolvers.title)}</h2></div> <div class="card-content svelte-168o2iv"><div class="resolvers-grid svelte-168o2iv"><!--[-->`);

		const each_array_5 = $.ensure_array_like(dnsPerformanceContent.sections.publicResolvers.resolvers);

		for (let $$index_7 = 0, $$length = each_array_5.length; $$index_7 < $$length; $$index_7++) {
			let resolver = each_array_5[$$index_7];

			$$renderer.push(`<div class="resolver-info-card svelte-168o2iv"><div class="resolver-info-header svelte-168o2iv"><h4 class="svelte-168o2iv">${$.escape(resolver.name)} (<a${$.attr('href', `https://${resolver.ip}`)} target="_blank" rel="nofollow" class="svelte-168o2iv">${$.escape(resolver.ip)}</a>)</h4></div> <p class="resolver-desc svelte-168o2iv">${$.escape(resolver.description)}</p> <div class="pros-cons svelte-168o2iv"><div class="pros svelte-168o2iv"><h5 class="svelte-168o2iv">`);
			Icon($$renderer, { name: 'check-circle', size: 'xs' });
			$$renderer.push(`<!----> Pros</h5> <ul class="svelte-168o2iv"><!--[-->`);

			const each_array_6 = $.ensure_array_like(resolver.pros);

			for (let $$index_5 = 0, $$length = each_array_6.length; $$index_5 < $$length; $$index_5++) {
				let pro = each_array_6[$$index_5];

				$$renderer.push(`<li class="svelte-168o2iv">${$.escape(pro)}</li>`);
			}

			$$renderer.push(`<!--]--></ul></div> <div class="cons svelte-168o2iv"><h5 class="svelte-168o2iv">`);
			Icon($$renderer, { name: 'x-circle', size: 'xs' });
			$$renderer.push(`<!----> Cons</h5> <ul class="svelte-168o2iv"><!--[-->`);

			const each_array_7 = $.ensure_array_like(resolver.cons);

			for (let $$index_6 = 0, $$length = each_array_7.length; $$index_6 < $$length; $$index_6++) {
				let con = each_array_7[$$index_6];

				$$renderer.push(`<li class="svelte-168o2iv">${$.escape(con)}</li>`);
			}

			$$renderer.push(`<!--]--></ul></div> <div class="best-for svelte-168o2iv"><h5 class="svelte-168o2iv">`);
			Icon($$renderer, { name: 'info-circle', size: 'xs' });
			$$renderer.push(`<!----> Best for</h5> <p class="svelte-168o2iv">${$.escape(resolver.bestFor)}</p></div></div></div>`);
		}

		$$renderer.push(`<!--]--></div></div></div> <div class="card svelte-168o2iv"><div class="card-header svelte-168o2iv"><h2 class="svelte-168o2iv">${$.escape(dnsPerformanceContent.sections.optimization.title)}</h2></div> <div class="card-content svelte-168o2iv"><div class="tips-list svelte-168o2iv"><!--[-->`);

		const each_array_8 = $.ensure_array_like(dnsPerformanceContent.sections.optimization.tips);

		for (let $$index_8 = 0, $$length = each_array_8.length; $$index_8 < $$length; $$index_8++) {
			let tip = each_array_8[$$index_8];

			$$renderer.push(`<div class="tip-item svelte-168o2iv"><h4 class="svelte-168o2iv">${$.escape(tip.tip)}</h4> <p class="svelte-168o2iv">${$.escape(tip.description)}</p></div>`);
		}

		$$renderer.push(`<!--]--></div></div></div></div>`);
	});
}