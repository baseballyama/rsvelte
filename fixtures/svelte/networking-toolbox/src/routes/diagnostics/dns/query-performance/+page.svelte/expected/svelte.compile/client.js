import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip';
import Icon from '$lib/components/global/Icon.svelte';
import { dnsPerformanceContent } from '$lib/content/dns-performance';
import '$lib/../styles/diagnostics-pages.scss';

var root = $.from_html(`<meta name="description" content="Compare DNS resolver speeds across Google, Cloudflare, Quad9, and more. Find the fastest DNS server for your location to improve browsing speed."/> <meta name="keywords" content="DNS performance, DNS speed test, DNS resolver comparison, fastest DNS, DNS latency, Cloudflare DNS, Google DNS, Quad9"/>`, 1);
var root_1 = $.from_html(`<button><h5> </h5> <p> </p></button>`);
var root_2 = $.from_html(`<option> </option>`);
var root_3 = $.from_html(`<!> Testing...`, 1);
var root_4 = $.from_html(`<!> Test Performance`, 1);
var root_5 = $.from_html(`<span id="customResolvers-error" class="error-text svelte-168o2iv" role="alert">Invalid IP address format. Enter valid IPv4 or IPv6 addresses.</span>`);
var root_6 = $.from_html(`<div class="card error-card"><!> <div><h4>Error</h4> <p> </p></div></div>`);
var root_7 = $.from_html(`<div class="card" role="status" aria-live="polite"><div class="card-content"><div class="loading-state"><!> <div class="loading-text"><h3>Testing DNS Resolvers</h3> <p> </p></div></div></div></div>`);
var root_8 = $.from_html(`<div><span class="time svelte-168o2iv"> </span> <span class="label svelte-168o2iv"> </span></div>`);
var root_9 = $.from_html(`<div class="error-badge svelte-168o2iv"><!> Failed</div>`);
var root_10 = $.from_html(`<code class="record-item svelte-168o2iv"> </code>`);
var root_11 = $.from_html(`<details class="records-details svelte-168o2iv"><summary class="svelte-168o2iv"><!> </summary> <div class="records-list svelte-168o2iv"></div></details>`);
var root_12 = $.from_html(`<div class="error-message svelte-168o2iv"><!> <span> </span></div>`);
var root_13 = $.from_html(`<div><div class="resolver-header svelte-168o2iv"><div class="resolver-info svelte-168o2iv"><strong class="svelte-168o2iv"> </strong> <span class="resolver-ip svelte-168o2iv"> </span></div> <!></div> <!> <!></div>`);
var root_14 = $.from_html(`<div class="card results-card"><div class="card-header"><h2>Performance Results</h2></div> <div class="stats-summary svelte-168o2iv"><div class="stat-card fastest svelte-168o2iv"><!> <div class="stat-content svelte-168o2iv"><span class="stat-label svelte-168o2iv">Fastest</span> <span class="stat-value svelte-168o2iv"> </span> <span class="stat-detail svelte-168o2iv"> </span></div></div> <div class="stat-card average svelte-168o2iv"><!> <div class="stat-content svelte-168o2iv"><span class="stat-label svelte-168o2iv">Average</span> <span class="stat-value svelte-168o2iv"> </span> <span class="stat-detail svelte-168o2iv"> </span></div></div> <div class="stat-card slowest svelte-168o2iv"><!> <div class="stat-content svelte-168o2iv"><span class="stat-label svelte-168o2iv">Slowest</span> <span class="stat-value svelte-168o2iv"> </span> <span class="stat-detail svelte-168o2iv"> </span></div></div> <div class="stat-card success svelte-168o2iv"><!> <div class="stat-content svelte-168o2iv"><span class="stat-label svelte-168o2iv">Success Rate</span> <span class="stat-value svelte-168o2iv"> </span> <span class="stat-detail svelte-168o2iv"> </span></div></div></div> <div class="resolvers-section svelte-168o2iv"><h3 class="svelte-168o2iv">Resolver Comparison</h3> <div class="resolvers-list svelte-168o2iv"></div></div> <div class="query-info svelte-168o2iv"><div class="info-item svelte-168o2iv"><span class="label svelte-168o2iv">Domain</span> <span class="value svelte-168o2iv"> </span></div> <div class="info-item svelte-168o2iv"><span class="label svelte-168o2iv">Record Type</span> <span class="value svelte-168o2iv"> </span></div> <div class="info-item svelte-168o2iv"><span class="label svelte-168o2iv">Total Records</span> <span class="value svelte-168o2iv"> </span></div> <div class="info-item svelte-168o2iv"><span class="label svelte-168o2iv">Resolvers Tested</span> <span class="value svelte-168o2iv"> </span></div> <div class="info-item svelte-168o2iv"><span class="label svelte-168o2iv">Performance Spread</span> <span class="value svelte-168o2iv"> </span></div> <div class="info-item svelte-168o2iv"><span class="label svelte-168o2iv">Fastest</span> <span class="value svelte-168o2iv"> </span></div> <div class="info-item svelte-168o2iv"><span class="label svelte-168o2iv">Tested</span> <span class="value svelte-168o2iv"> </span></div></div></div>`);
var root_15 = $.from_html(`<div><div class="range-header svelte-168o2iv"><span class="range-time svelte-168o2iv"> </span> <span class="range-perf svelte-168o2iv"> </span></div> <p class="svelte-168o2iv"> </p></div>`);
var root_16 = $.from_html(`<li class="svelte-168o2iv"> </li>`);
var root_17 = $.from_html(`<div class="resolver-info-card svelte-168o2iv"><div class="resolver-info-header svelte-168o2iv"><h4 class="svelte-168o2iv"> <a target="_blank" rel="nofollow" class="svelte-168o2iv"> </a>)</h4></div> <p class="resolver-desc svelte-168o2iv"> </p> <div class="pros-cons svelte-168o2iv"><div class="pros svelte-168o2iv"><h5 class="svelte-168o2iv"><!> Pros</h5> <ul class="svelte-168o2iv"></ul></div> <div class="cons svelte-168o2iv"><h5 class="svelte-168o2iv"><!> Cons</h5> <ul class="svelte-168o2iv"></ul></div> <div class="best-for svelte-168o2iv"><h5 class="svelte-168o2iv"><!> Best for</h5> <p class="svelte-168o2iv"> </p></div></div></div>`);
var root_18 = $.from_html(`<div class="tip-item svelte-168o2iv"><h4 class="svelte-168o2iv"> </h4> <p class="svelte-168o2iv"> </p></div>`);

var root_19 = $.from_html(
	`<div class="card"><header class="card-header"><h1>DNS Query Performance Comparison</h1> <p>Compare response times across multiple DNS resolvers to find the fastest for your location</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary"><!> <h4>Quick Examples</h4></summary> <div class="examples-grid"></div></details></div> <div class="card input-card"><form class="inline-form svelte-168o2iv"><div class="form-group flex-grow svelte-168o2iv"><label for="domain" class="svelte-168o2iv">Domain Name</label> <input id="domain" type="text" placeholder="e.g., google.com" autocomplete="off" inputmode="url"/></div> <div class="form-group svelte-168o2iv"><label for="recordType" class="svelte-168o2iv">Record Type</label> <select id="recordType" class="svelte-168o2iv"></select></div> <button type="submit" class="primary submit-btn svelte-168o2iv"><!></button></form> <details class="advanced-options svelte-168o2iv"><summary class="svelte-168o2iv"><!> Advanced Options</summary> <div class="advanced-content svelte-168o2iv"><div class="form-group svelte-168o2iv"><label for="customResolvers" class="svelte-168o2iv">Custom DNS Servers <span class="help-text svelte-168o2iv">One per line, or comma/semicolon separated</span></label> <textarea id="customResolvers" placeholder="1.0.0.1
8.26.56.26
or 1.0.0.1, 8.26.56.26" rows="3" class="svelte-168o2iv"></textarea> <!> <div class="checkbox-group svelte-168o2iv"><label for="includeDefaults" class="svelte-168o2iv"><input id="includeDefaults" type="checkbox" class="svelte-168o2iv"/> <span class="svelte-168o2iv">Include default resolvers with custom servers</span></label></div></div> <div class="form-group svelte-168o2iv"><label for="timeout" class="svelte-168o2iv">Query Timeout (ms) <span class="help-text svelte-168o2iv">Max time to wait per resolver (1000-30000ms)</span></label> <input id="timeout" type="number" min="1000" max="30000" step="500" aria-describedby="timeout-help" class="svelte-168o2iv"/> <span id="timeout-help" class="help-text">Default: 5000ms</span></div> <div class="advanced-info svelte-168o2iv"><!> <p class="svelte-168o2iv">Custom DNS servers must be valid IPv4 or IPv6 addresses. Duplicates will be removed automatically.</p></div></div></details></div> <!> <!> <!></div> <div class="info-sections svelte-168o2iv"><div class="card svelte-168o2iv"><div class="card-header svelte-168o2iv"><h2 class="svelte-168o2iv"> </h2></div> <div class="card-content svelte-168o2iv"><p class="svelte-168o2iv"> </p></div></div> <div class="card svelte-168o2iv"><div class="card-header svelte-168o2iv"><h2 class="svelte-168o2iv"> </h2></div> <div class="card-content svelte-168o2iv"><p class="svelte-168o2iv"> </p> <div class="performance-ranges svelte-168o2iv"></div></div></div> <div class="card svelte-168o2iv"><div class="card-header svelte-168o2iv"><h2 class="svelte-168o2iv"> </h2></div> <div class="card-content svelte-168o2iv"><div class="resolvers-grid svelte-168o2iv"></div></div></div> <div class="card svelte-168o2iv"><div class="card-header svelte-168o2iv"><h2 class="svelte-168o2iv"> </h2></div> <div class="card-content svelte-168o2iv"><div class="tips-list svelte-168o2iv"></div></div></div></div>`,
	1
);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

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

	let domain = $.state('');
	let recordType = $.state('A');
	let loading = $.state(false);
	let results = $.state(null);
	let error = $.state(null);
	let selectedExampleIndex = $.state(null);
	let abortController = $.state(null);
	let requestId = $.state(0);
	let showAdvanced = $.state(false);
	let customResolvers = $.state('');
	let includeDefaultResolvers = $.state(true);
	let timeoutMs = $.state(5000);

	const isInputValid = $.derived(() => {
		const trimmed = $.get(domain).trim();

		if (!trimmed) return false;

		// Support underscores for _acme-challenge and similar
		const domainPattern = /^([a-zA-Z0-9_]([a-zA-Z0-9_-]{0,61}[a-zA-Z0-9_])?\.)+[a-zA-Z]{2,}$/;

		return domainPattern.test(trimmed);
	});

	const customResolversValid = $.derived(() => {
		if (!$.get(customResolvers).trim()) return true;

		const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
		const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
		const resolvers = $.get(customResolvers).split(/[\n,;]/).map((r) => r.trim()).filter((r) => r);

		return resolvers.every((ip) => ipv4Pattern.test(ip) || ipv6Pattern.test(ip));
	});

	const sortedResults = $.derived(() => {
		if (!$.get(results)?.results) return [];

		return [...$.get(results).results].sort((a, b) => a.success && b.success ? a.responseTime - b.responseTime : a.success ? -1 : 1);
	});

	const successCount = $.derived(() => $.get(results)?.results.filter((r) => r.success).length ?? 0);
	const totalCount = $.derived(() => $.get(results)?.results.length ?? 0);

	const formattedTimestamp = $.derived(() => $.get(results)?.timestamp
		? new Date($.get(results).timestamp).toLocaleString()
		: '');

	const totalRecords = $.derived(() => $.get(sortedResults).reduce((sum, r) => sum + (r.records?.length ?? 0), 0));
	const fastestResolver = $.derived(() => $.get(results)?.statistics.fastest.resolver ?? '');

	const performanceSpread = $.derived(() => $.get(results)
		? Math.round(($.get(results).statistics.slowest.time - $.get(results).statistics.fastest.time) * 100) / 100
		: 0);

	function getPerformance(time) {
		const range = PERF_RANGES.find((r) => time < r.max);

		return { class: range.class, label: range.label };
	}

	async function testPerformance() {
		if (!$.get(isInputValid)) return;

		// Cancel previous request
		$.get(abortController)?.abort();

		const controller = new AbortController();

		$.set(abortController, controller, true);

		const currentRequestId = $.update_pre(requestId);

		$.set(loading, true);
		$.set(error, null);
		$.set(results, null);

		try {
			const body = { domain: $.get(domain).trim(), recordType: $.get(recordType) };

			// Add custom resolvers if provided
			if ($.get(customResolvers).trim()) {
				const resolvers = $.get(customResolvers).split(/[\n,;]/).map((r) => r.trim()).filter((r) => r);

				body.customResolvers = resolvers;
				body.includeDefaultResolvers = $.get(includeDefaultResolvers);
			}

			// Add custom timeout if different from default
			if ($.get(timeoutMs) !== 5000) {
				body.timeoutMs = $.get(timeoutMs);
			}

			const response = await fetch(API_ENDPOINT, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
				signal: controller.signal
			});

			// Ignore stale responses
			if (currentRequestId !== $.get(requestId)) return;

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

			$.set(results, await response.json(), true);
		} catch(err) {
			if (currentRequestId !== $.get(requestId)) return;
			if (err instanceof Error && err.name === 'AbortError') return;

			$.set(error, err instanceof Error ? err.message : 'An unexpected error occurred', true);
		} finally {
			if (currentRequestId === $.get(requestId)) {
				$.set(loading, false);
			}
		}
	}

	function loadExample(index) {
		const example = EXAMPLES[index];

		$.set(domain, example.domain, true);
		$.set(recordType, example.type, true);
		$.set(selectedExampleIndex, index, true);
		testPerformance();
	}

	var fragment_1 = root_19();

	$.head('168o2iv', ($$anchor) => {
		var fragment = root();

		$.next(2);

		$.effect(() => {
			$.document.title = 'DNS Query Performance Comparison | IP Calc';
		});

		$.append($$anchor, fragment);
	});

	var div = $.first_child(fragment_1);
	var div_1 = $.sibling($.child(div), 2);
	var details = $.child(div_1);
	var summary = $.child(details);
	var node = $.child(summary);

	Icon(node, { name: 'chevron-right', size: 'xs' });
	$.next(2);
	$.reset(summary);

	var div_2 = $.sibling(summary, 2);

	$.each(div_2, 21, () => EXAMPLES, $.index, ($$anchor, example, i) => {
		var button = root_1();
		let classes;
		var h5 = $.child(button);
		var text = $.only_child(h5, true);
		var p = $.sibling(h5, 2);
		var text_1 = $.only_child(p);

		$.reset(button);
		$.action(button, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => `Test ${$.get(example).domain} ${$.get(example).type} records`);

		$.template_effect(() => {
			classes = $.set_class(button, 1, 'example-card', null, classes, { selected: $.get(selectedExampleIndex) === i });
			$.set_text(text, $.get(example).description);
			$.set_text(text_1, `${$.get(example).domain ?? ''} (${$.get(example).type ?? ''})`);
		});

		$.delegated('click', button, () => loadExample(i));
		$.append($$anchor, button);
	});

	$.reset(div_2);
	$.reset(details);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var form = $.child(div_3);
	var div_4 = $.child(form);
	var input = $.sibling($.child(div_4), 2);

	$.remove_input_defaults(input);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var select = $.sibling($.child(div_5), 2);

	$.each(select, 20, () => RECORD_TYPES, (type) => type, ($$anchor, type) => {
		var option = root_2();
		var text_2 = $.only_child(option, true);
		var option_value = {};

		$.template_effect(() => {
			$.set_text(text_2, type);

			if (option_value !== (option_value = type)) {
				option.value = (option.__value = option_value) ?? '';
			}
		});

		$.append($$anchor, option);
	});

	$.reset(select);
	$.init_select(select);
	$.reset(div_5);

	var button_1 = $.sibling(div_5, 2);
	var node_1 = $.child(button_1);

	{
		var consequent = ($$anchor) => {
			var fragment_2 = root_3();
			var node_2 = $.first_child(fragment_2);

			Icon(node_2, { name: 'loader', size: 'sm', animate: 'spin' });
			$.next();
			$.append($$anchor, fragment_2);
		};

		var alternate = ($$anchor) => {
			var fragment_3 = root_4();
			var node_3 = $.first_child(fragment_3);

			Icon(node_3, { name: 'zap', size: 'sm' });
			$.next();
			$.append($$anchor, fragment_3);
		};

		$.if(node_1, ($$render) => {
			if ($.get(loading)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button_1);
	$.reset(form);

	var details_1 = $.sibling(form, 2);
	var summary_1 = $.child(details_1);
	var node_4 = $.child(summary_1);

	Icon(node_4, { name: 'chevron-right', size: 'xs' });
	$.next();
	$.reset(summary_1);

	var div_6 = $.sibling(summary_1, 2);
	var div_7 = $.child(div_6);
	var textarea = $.sibling($.child(div_7), 2);

	$.remove_textarea_child(textarea);

	var node_5 = $.sibling(textarea, 2);

	{
		var consequent_1 = ($$anchor) => {
			var span = root_5();

			$.append($$anchor, span);
		};

		$.if(node_5, ($$render) => {
			if (!$.get(customResolversValid)) $$render(consequent_1);
		});
	}

	var div_8 = $.sibling(node_5, 2);
	var label = $.child(div_8);
	var input_1 = $.child(label);

	$.remove_input_defaults(input_1);
	$.next(2);
	$.reset(label);
	$.reset(div_8);
	$.reset(div_7);

	var div_9 = $.sibling(div_7, 2);
	var input_2 = $.sibling($.child(div_9), 2);

	$.remove_input_defaults(input_2);
	$.next(2);
	$.reset(div_9);

	var div_10 = $.sibling(div_9, 2);
	var node_6 = $.child(div_10);

	Icon(node_6, { name: 'info', size: 'xs' });
	$.next(2);
	$.reset(div_10);
	$.reset(div_6);
	$.reset(details_1);
	$.reset(div_3);

	var node_7 = $.sibling(div_3, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_11 = root_6();
			var node_8 = $.child(div_11);

			Icon(node_8, { name: 'alert-triangle', size: 'md' });

			var div_12 = $.sibling(node_8, 2);
			var p_1 = $.sibling($.child(div_12), 2);
			var text_3 = $.only_child(p_1, true);

			$.reset(div_12);
			$.reset(div_11);
			$.template_effect(() => $.set_text(text_3, $.get(error)));
			$.append($$anchor, div_11);
		};

		$.if(node_7, ($$render) => {
			if ($.get(error)) $$render(consequent_2);
		});
	}

	var node_9 = $.sibling(node_7, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_13 = root_7();
			var div_14 = $.child(div_13);
			var div_15 = $.child(div_14);
			var node_10 = $.child(div_15);

			Icon(node_10, { name: 'loader', size: 'lg', animate: 'spin' });

			var div_16 = $.sibling(node_10, 2);
			var p_2 = $.sibling($.child(div_16), 2);
			var text_4 = $.only_child(p_2);

			$.reset(div_16);
			$.reset(div_15);
			$.reset(div_14);
			$.reset(div_13);
			$.template_effect(() => $.set_text(text_4, `Querying ${$.get(recordType) ?? ''} records for ${$.get(domain) ?? ''}...`));
			$.append($$anchor, div_13);
		};

		$.if(node_9, ($$render) => {
			if ($.get(loading)) $$render(consequent_3);
		});
	}

	var node_11 = $.sibling(node_9, 2);

	{
		var consequent_7 = ($$anchor) => {
			var div_17 = root_14();
			var div_18 = $.sibling($.child(div_17), 2);
			var div_19 = $.child(div_18);
			var node_12 = $.child(div_19);

			Icon(node_12, { name: 'zap', size: 'md' });

			var div_20 = $.sibling(node_12, 2);
			var span_1 = $.sibling($.child(div_20), 2);
			var text_5 = $.only_child(span_1, true);
			var span_2 = $.sibling(span_1, 2);
			var text_6 = $.only_child(span_2);

			$.reset(div_20);
			$.reset(div_19);

			var div_21 = $.sibling(div_19, 2);
			var node_13 = $.child(div_21);

			Icon(node_13, { name: 'activity', size: 'md' });

			var div_22 = $.sibling(node_13, 2);
			var span_3 = $.sibling($.child(div_22), 2);
			var text_7 = $.only_child(span_3);
			var span_4 = $.sibling(span_3, 2);
			var text_8 = $.only_child(span_4);

			$.reset(div_22);
			$.reset(div_21);

			var div_23 = $.sibling(div_21, 2);
			var node_14 = $.child(div_23);

			Icon(node_14, { name: 'clock', size: 'md' });

			var div_24 = $.sibling(node_14, 2);
			var span_5 = $.sibling($.child(div_24), 2);
			var text_9 = $.only_child(span_5, true);
			var span_6 = $.sibling(span_5, 2);
			var text_10 = $.only_child(span_6);

			$.reset(div_24);
			$.reset(div_23);

			var div_25 = $.sibling(div_23, 2);
			var node_15 = $.child(div_25);

			Icon(node_15, { name: 'check-circle', size: 'md' });

			var div_26 = $.sibling(node_15, 2);
			var span_7 = $.sibling($.child(div_26), 2);
			var text_11 = $.only_child(span_7);
			var span_8 = $.sibling(span_7, 2);
			var text_12 = $.only_child(span_8);

			$.reset(div_26);
			$.reset(div_25);
			$.reset(div_18);

			var div_27 = $.sibling(div_18, 2);
			var div_28 = $.sibling($.child(div_27), 2);

			$.each(div_28, 21, () => $.get(sortedResults), (result) => result.resolver, ($$anchor, result) => {
				const perf = $.derived(() => $.get(result).success ? getPerformance($.get(result).responseTime) : null);
				var div_29 = root_13();
				let classes_1;
				var div_30 = $.child(div_29);
				var div_31 = $.child(div_30);
				var strong = $.child(div_31);
				var text_13 = $.only_child(strong, true);
				var span_9 = $.sibling(strong, 2);
				var text_14 = $.only_child(span_9, true);

				$.reset(div_31);

				var node_16 = $.sibling(div_31, 2);

				{
					var consequent_4 = ($$anchor) => {
						var div_32 = root_8();
						var span_10 = $.child(div_32);
						var text_15 = $.only_child(span_10);
						var span_11 = $.sibling(span_10, 2);
						var text_16 = $.only_child(span_11, true);

						$.reset(div_32);

						$.template_effect(() => {
							$.set_class(div_32, 1, `performance-badge ${$.get(perf).class ?? ''}`, 'svelte-168o2iv');
							$.set_text(text_15, `${$.get(result).responseTime ?? ''}ms`);
							$.set_text(text_16, $.get(perf).label);
						});

						$.append($$anchor, div_32);
					};

					var alternate_1 = ($$anchor) => {
						var div_33 = root_9();
						var node_17 = $.child(div_33);

						Icon(node_17, { name: 'x-circle', size: 'xs' });
						$.next();
						$.reset(div_33);
						$.append($$anchor, div_33);
					};

					$.if(node_16, ($$render) => {
						if ($.get(perf)) $$render(consequent_4); else $$render(alternate_1, -1);
					});
				}

				$.reset(div_30);

				var node_18 = $.sibling(div_30, 2);

				{
					var consequent_5 = ($$anchor) => {
						var details_2 = root_11();
						var summary_2 = $.child(details_2);
						var node_19 = $.child(summary_2);

						Icon(node_19, { name: 'chevron-right', size: 'xs' });

						var text_17 = $.sibling(node_19);

						$.reset(summary_2);

						var div_34 = $.sibling(summary_2, 2);

						$.each(div_34, 20, () => $.get(result).records, (record) => record, ($$anchor, record) => {
							var code = root_10();
							var text_18 = $.only_child(code, true);

							$.template_effect(() => $.set_text(text_18, record));
							$.append($$anchor, code);
						});

						$.reset(div_34);
						$.reset(details_2);
						$.template_effect(() => $.set_text(text_17, ` View ${$.get(result).records.length ?? ''} record${$.get(result).records.length === 1 ? '' : 's'}`));
						$.append($$anchor, details_2);
					};

					$.if(node_18, ($$render) => {
						if ($.get(result).records?.length) $$render(consequent_5);
					});
				}

				var node_20 = $.sibling(node_18, 2);

				{
					var consequent_6 = ($$anchor) => {
						var div_35 = root_12();
						var node_21 = $.child(div_35);

						Icon(node_21, { name: 'alert-circle', size: 'xs' });

						var span_12 = $.sibling(node_21, 2);
						var text_19 = $.only_child(span_12, true);

						$.reset(div_35);
						$.template_effect(() => $.set_text(text_19, $.get(result).error));
						$.append($$anchor, div_35);
					};

					$.if(node_20, ($$render) => {
						if ($.get(result).error) $$render(consequent_6);
					});
				}

				$.reset(div_29);

				$.template_effect(() => {
					classes_1 = $.set_class(div_29, 1, 'resolver-card svelte-168o2iv', null, classes_1, { failed: !$.get(result).success });
					$.set_text(text_13, $.get(result).resolverName);
					$.set_text(text_14, $.get(result).resolver);
				});

				$.append($$anchor, div_29);
			});

			$.reset(div_28);
			$.reset(div_27);

			var div_36 = $.sibling(div_27, 2);
			var div_37 = $.child(div_36);
			var span_13 = $.sibling($.child(div_37), 2);
			var text_20 = $.only_child(span_13, true);

			$.reset(div_37);

			var div_38 = $.sibling(div_37, 2);
			var span_14 = $.sibling($.child(div_38), 2);
			var text_21 = $.only_child(span_14, true);

			$.reset(div_38);

			var div_39 = $.sibling(div_38, 2);
			var span_15 = $.sibling($.child(div_39), 2);
			var text_22 = $.only_child(span_15, true);

			$.reset(div_39);

			var div_40 = $.sibling(div_39, 2);
			var span_16 = $.sibling($.child(div_40), 2);
			var text_23 = $.only_child(span_16);

			$.reset(div_40);

			var div_41 = $.sibling(div_40, 2);
			var span_17 = $.sibling($.child(div_41), 2);
			var text_24 = $.only_child(span_17);

			$.reset(div_41);

			var div_42 = $.sibling(div_41, 2);
			var span_18 = $.sibling($.child(div_42), 2);
			var text_25 = $.only_child(span_18, true);

			$.reset(div_42);

			var div_43 = $.sibling(div_42, 2);
			var span_19 = $.sibling($.child(div_43), 2);
			var text_26 = $.only_child(span_19, true);

			$.reset(div_43);
			$.reset(div_36);
			$.reset(div_17);

			$.template_effect(() => {
				$.set_text(text_5, $.get(results).statistics.fastest.resolver);
				$.set_text(text_6, `${$.get(results).statistics.fastest.time ?? ''}ms`);
				$.set_text(text_7, `${$.get(results).statistics.average ?? ''}ms`);
				$.set_text(text_8, `Median: ${$.get(results).statistics.median ?? ''}ms`);
				$.set_text(text_9, $.get(results).statistics.slowest.resolver);
				$.set_text(text_10, `${$.get(results).statistics.slowest.time ?? ''}ms`);
				$.set_text(text_11, `${$.get(results).statistics.successRate ?? ''}%`);
				$.set_text(text_12, `${$.get(successCount) ?? ''}/${$.get(totalCount) ?? ''}`);
				$.set_text(text_20, $.get(results).domain);
				$.set_text(text_21, $.get(results).recordType);
				$.set_text(text_22, $.get(totalRecords));
				$.set_text(text_23, `${$.get(successCount) ?? ''} of ${$.get(totalCount) ?? ''} successful`);
				$.set_text(text_24, `${$.get(performanceSpread) ?? ''}ms`);
				$.set_text(text_25, $.get(fastestResolver));
				$.set_text(text_26, $.get(formattedTimestamp));
			});

			$.append($$anchor, div_17);
		};

		$.if(node_11, ($$render) => {
			if ($.get(results)) $$render(consequent_7);
		});
	}

	$.reset(div);

	var div_44 = $.sibling(div, 2);
	var div_45 = $.child(div_44);
	var div_46 = $.child(div_45);
	var h2 = $.child(div_46);
	var text_27 = $.only_child(h2, true);

	$.reset(div_46);

	var div_47 = $.sibling(div_46, 2);
	var p_3 = $.child(div_47);
	var text_28 = $.only_child(p_3, true);

	$.reset(div_47);
	$.reset(div_45);

	var div_48 = $.sibling(div_45, 2);
	var div_49 = $.child(div_48);
	var h2_1 = $.child(div_49);
	var text_29 = $.only_child(h2_1, true);

	$.reset(div_49);

	var div_50 = $.sibling(div_49, 2);
	var p_4 = $.child(div_50);
	var text_30 = $.only_child(p_4, true);
	var div_51 = $.sibling(p_4, 2);

	$.each(div_51, 21, () => dnsPerformanceContent.sections.interpretingResults.ranges, (range) => range.range, ($$anchor, range) => {
		var div_52 = root_15();
		var div_53 = $.child(div_52);
		var span_20 = $.child(div_53);
		var text_31 = $.only_child(span_20, true);
		var span_21 = $.sibling(span_20, 2);
		var text_32 = $.only_child(span_21, true);

		$.reset(div_53);

		var p_5 = $.sibling(div_53, 2);
		var text_33 = $.only_child(p_5, true);

		$.reset(div_52);

		$.template_effect(() => {
			$.set_class(div_52, 1, `range-item ${$.get(range).color ?? ''}`, 'svelte-168o2iv');
			$.set_text(text_31, $.get(range).range);
			$.set_text(text_32, $.get(range).performance);
			$.set_text(text_33, $.get(range).description);
		});

		$.append($$anchor, div_52);
	});

	$.reset(div_51);
	$.reset(div_50);
	$.reset(div_48);

	var div_54 = $.sibling(div_48, 2);
	var div_55 = $.child(div_54);
	var h2_2 = $.child(div_55);
	var text_34 = $.only_child(h2_2, true);

	$.reset(div_55);

	var div_56 = $.sibling(div_55, 2);
	var div_57 = $.child(div_56);

	$.each(div_57, 21, () => dnsPerformanceContent.sections.publicResolvers.resolvers, (resolver) => resolver.name, ($$anchor, resolver) => {
		var div_58 = root_17();
		var div_59 = $.child(div_58);
		var h4 = $.child(div_59);
		var text_35 = $.child(h4);
		var a_1 = $.sibling(text_35);
		var text_36 = $.only_child(a_1, true);

		$.next();
		$.reset(h4);
		$.reset(div_59);

		var p_6 = $.sibling(div_59, 2);
		var text_37 = $.only_child(p_6, true);
		var div_60 = $.sibling(p_6, 2);
		var div_61 = $.child(div_60);
		var h5_1 = $.child(div_61);
		var node_22 = $.child(h5_1);

		Icon(node_22, { name: 'check-circle', size: 'xs' });
		$.next();
		$.reset(h5_1);

		var ul = $.sibling(h5_1, 2);

		$.each(ul, 20, () => $.get(resolver).pros, (pro) => pro, ($$anchor, pro) => {
			var li = root_16();
			var text_38 = $.only_child(li, true);

			$.template_effect(() => $.set_text(text_38, pro));
			$.append($$anchor, li);
		});

		$.reset(ul);
		$.reset(div_61);

		var div_62 = $.sibling(div_61, 2);
		var h5_2 = $.child(div_62);
		var node_23 = $.child(h5_2);

		Icon(node_23, { name: 'x-circle', size: 'xs' });
		$.next();
		$.reset(h5_2);

		var ul_1 = $.sibling(h5_2, 2);

		$.each(ul_1, 20, () => $.get(resolver).cons, (con) => con, ($$anchor, con) => {
			var li_1 = root_16();
			var text_39 = $.only_child(li_1, true);

			$.template_effect(() => $.set_text(text_39, con));
			$.append($$anchor, li_1);
		});

		$.reset(ul_1);
		$.reset(div_62);

		var div_63 = $.sibling(div_62, 2);
		var h5_3 = $.child(div_63);
		var node_24 = $.child(h5_3);

		Icon(node_24, { name: 'info-circle', size: 'xs' });
		$.next();
		$.reset(h5_3);

		var p_7 = $.sibling(h5_3, 2);
		var text_40 = $.only_child(p_7, true);

		$.reset(div_63);
		$.reset(div_60);
		$.reset(div_58);

		$.template_effect(() => {
			$.set_text(text_35, `${$.get(resolver).name ?? ''} (`);
			$.set_attribute(a_1, 'href', `https://${$.get(resolver).ip}`);
			$.set_text(text_36, $.get(resolver).ip);
			$.set_text(text_37, $.get(resolver).description);
			$.set_text(text_40, $.get(resolver).bestFor);
		});

		$.append($$anchor, div_58);
	});

	$.reset(div_57);
	$.reset(div_56);
	$.reset(div_54);

	var div_64 = $.sibling(div_54, 2);
	var div_65 = $.child(div_64);
	var h2_3 = $.child(div_65);
	var text_41 = $.only_child(h2_3, true);

	$.reset(div_65);

	var div_66 = $.sibling(div_65, 2);
	var div_67 = $.child(div_66);

	$.each(div_67, 21, () => dnsPerformanceContent.sections.optimization.tips, (tip) => tip.tip, ($$anchor, tip) => {
		var div_68 = root_18();
		var h4_1 = $.child(div_68);
		var text_42 = $.only_child(h4_1, true);
		var p_8 = $.sibling(h4_1, 2);
		var text_43 = $.only_child(p_8, true);

		$.reset(div_68);

		$.template_effect(() => {
			$.set_text(text_42, $.get(tip).tip);
			$.set_text(text_43, $.get(tip).description);
		});

		$.append($$anchor, div_68);
	});

	$.reset(div_67);
	$.reset(div_66);
	$.reset(div_64);
	$.reset(div_44);

	$.template_effect(
		($0) => {
			$.set_attribute(form, 'aria-busy', $.get(loading));
			input.disabled = $.get(loading);
			$.set_attribute(input, 'aria-invalid', !!($.get(domain) && !$.get(isInputValid)));
			select.disabled = $.get(loading);
			button_1.disabled = $.get(loading) || !$.get(isInputValid);
			$.set_attribute(button_1, 'aria-busy', $.get(loading));
			textarea.disabled = $.get(loading);
			$.set_attribute(textarea, 'aria-invalid', !$.get(customResolversValid));
			$.set_attribute(textarea, 'aria-describedby', !$.get(customResolversValid) ? 'customResolvers-error' : undefined);
			input_1.disabled = $0;
			input_2.disabled = $.get(loading);
			$.set_text(text_27, dnsPerformanceContent.sections.whatIsDnsPerformance.title);
			$.set_text(text_28, dnsPerformanceContent.sections.whatIsDnsPerformance.content);
			$.set_text(text_29, dnsPerformanceContent.sections.interpretingResults.title);
			$.set_text(text_30, dnsPerformanceContent.sections.interpretingResults.content);
			$.set_text(text_34, dnsPerformanceContent.sections.publicResolvers.title);
			$.set_text(text_41, dnsPerformanceContent.sections.optimization.title);
		},
		[() => $.get(loading) || !$.get(customResolvers).trim()]
	);

	$.event('submit', form, (e) => {
		e.preventDefault();
		testPerformance();
	});

	$.delegated('input', input, () => {
		$.set(selectedExampleIndex, null);
	});

	$.bind_value(input, () => $.get(domain), ($$value) => $.set(domain, $$value));
	$.bind_select_value(select, () => $.get(recordType), ($$value) => $.set(recordType, $$value));
	$.bind_value(textarea, () => $.get(customResolvers), ($$value) => $.set(customResolvers, $$value));
	$.bind_checked(input_1, () => $.get(includeDefaultResolvers), ($$value) => $.set(includeDefaultResolvers, $$value));
	$.bind_value(input_2, () => $.get(timeoutMs), ($$value) => $.set(timeoutMs, $$value));
	$.bind_property('open', 'toggle', details_1, ($$value) => $.set(showAdvanced, $$value), () => $.get(showAdvanced));
	$.append($$anchor, fragment_1);
	$.pop();
}

$.delegate(['click', 'input']);