import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { useDiagnosticState, useClipboard, useExamples } from '$lib/composables';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import ErrorCard from '$lib/components/common/ErrorCard.svelte';
import '../../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<span class="error-text">Must be a valid HTTP or HTTPS URL</span>`);
var root_1 = $.from_html(`<button type="button"> </button>`);
var root_2 = $.from_html(`<!> Pinging...`, 1);
var root_3 = $.from_html(`<!> Start HTTP Ping`, 1);
var root_4 = $.from_html(`<div><!> <div><span class="status-title svelte-agdf2"> </span> <p class="status-desc svelte-agdf2"> </p></div></div>`);
var root_5 = $.from_html(`<div class="status-item error"><!> <div><span class="status-title svelte-agdf2"> </span> <p class="status-desc svelte-agdf2">Failed requests</p></div></div>`);
var root_6 = $.from_html(`<div><span class="request-number svelte-agdf2"></span> <span class="request-latency svelte-agdf2"> </span> <span class="request-status svelte-agdf2"> </span></div>`);
var root_7 = $.from_html(`<div class="results-section svelte-agdf2"><h4 class="svelte-agdf2">Individual Request Results</h4> <div class="requests-list svelte-agdf2"></div></div>`);
var root_8 = $.from_html(`<div class="stats-section svelte-agdf2"><h4 class="svelte-agdf2">Latency Statistics</h4> <div class="stats-grid svelte-agdf2"><div class="stat-item svelte-agdf2"><span class="stat-label svelte-agdf2">Minimum:</span> <span class="stat-value svelte-agdf2"> </span></div> <div class="stat-item svelte-agdf2"><span class="stat-label svelte-agdf2">Maximum:</span> <span class="stat-value svelte-agdf2"> </span></div> <div class="stat-item svelte-agdf2"><span class="stat-label svelte-agdf2">Average:</span> <span class="stat-value svelte-agdf2"> </span></div> <div class="stat-item svelte-agdf2"><span class="stat-label svelte-agdf2">Median:</span> <span class="stat-value svelte-agdf2"> </span></div> <div class="stat-item svelte-agdf2"><span class="stat-label svelte-agdf2">95th Percentile:</span> <span class="stat-value svelte-agdf2"> </span></div> <div class="stat-item svelte-agdf2"><span class="stat-label svelte-agdf2">Range:</span> <span class="stat-value svelte-agdf2"> </span></div></div></div> <!>`, 1);
var root_9 = $.from_html(`<div class="error-item svelte-agdf2"><span class="error-number svelte-agdf2"> </span> <span class="error-message svelte-agdf2"> </span></div>`);
var root_10 = $.from_html(`<div class="errors-section svelte-agdf2"><h4 class="svelte-agdf2"> </h4> <div class="errors-list svelte-agdf2"></div></div>`);
var root_11 = $.from_html(`<div class="card results-card"><div class="card-header row"><h3>HTTP Ping Results</h3> <button class="copy-btn"><!> </button></div> <div class="card-content"><div class="status-overview"><div class="status-item success"><!> <div><span class="status-title svelte-agdf2"> </span> <p class="status-desc svelte-agdf2">Successful requests</p></div></div> <!> <!></div> <!> <!> <div class="info-section svelte-agdf2"><h4 class="svelte-agdf2">Request Information</h4> <div class="detail-grid svelte-agdf2"><div class="detail-item svelte-agdf2"><span class="detail-label svelte-agdf2">URL:</span> <span class="detail-value mono svelte-agdf2"> </span></div> <div class="detail-item svelte-agdf2"><span class="detail-label svelte-agdf2">Method:</span> <span class="detail-value svelte-agdf2"> </span></div> <div class="detail-item svelte-agdf2"><span class="detail-label svelte-agdf2">Success Rate:</span> <span class="detail-value svelte-agdf2"> </span></div></div></div></div></div>`);

var root_12 = $.from_html(`<div class="card"><header class="card-header"><h1>HTTP Ping</h1> <p>Measure HTTP/HTTPS response latency by sending repeated requests and analyzing timing statistics. Alternative to
      ICMP ping for web services and APIs.</p></header> <!> <div class="card input-card"><div class="card-header"><h3>HTTP Ping Configuration</h3></div> <div class="card-content"><div class="form-row"><div class="form-group"><label for="url">Target URL <input id="url" type="url" placeholder="https://example.com"/> <!></label></div></div> <div class="form-row"><div class="form-group"><h3>HTTP Method</h3> <div class="method-options svelte-agdf2"></div></div></div> <div class="form-row two-columns"><div class="form-group"><label for="count">Request Count <input id="count" type="number" min="1" max="20"/></label></div> <div class="form-group"><label for="timeout">Timeout (ms) <input id="timeout" type="number" min="1000" max="30000" step="1000"/></label></div></div> <div class="action-section"><button class="lookup-btn"><!></button></div></div></div> <!> <!> <div class="card info-card"><div class="card-header"><h3>Understanding HTTP Ping</h3></div> <div class="card-content"><div class="info-grid"><div class="info-section svelte-agdf2"><h4 class="svelte-agdf2">HTTP vs ICMP Ping</h4> <ul><li><strong>HTTP:</strong> Tests application layer connectivity</li> <li><strong>ICMP:</strong> Tests network layer connectivity</li> <li>HTTP ping better reflects real user experience</li> <li>Works through firewalls that block ICMP</li></ul></div> <div class="info-section svelte-agdf2"><h4 class="svelte-agdf2">Request Methods</h4> <ul><li><strong>HEAD:</strong> Headers only, fastest and most efficient</li> <li><strong>GET:</strong> Full response, more realistic timing</li> <li><strong>OPTIONS:</strong> Check allowed methods and CORS</li></ul></div> <div class="info-section svelte-agdf2"><h4 class="svelte-agdf2">Latency Guidelines</h4> <ul><li><strong>&lt; 100ms:</strong> Excellent response time</li> <li><strong>100-300ms:</strong> Good for most applications</li> <li><strong>300-1000ms:</strong> Acceptable but noticeable</li> <li><strong>&gt; 1000ms:</strong> Poor, may impact user experience</li></ul></div></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let url = $.state('https://google.com');
	let method = $.state('HEAD');
	let count = $.state(5);
	let timeout = $.state(10000);
	const diagnosticState = useDiagnosticState();
	const clipboard = useClipboard();

	const examplesList = [
		{
			url: 'https://google.com',
			method: 'HEAD',
			description: 'Google homepage'
		},

		{
			url: 'https://github.com',
			method: 'HEAD',
			description: 'GitHub homepage'
		},

		{
			url: 'https://api.github.com',
			method: 'GET',
			description: 'GitHub API'
		},

		{
			url: 'https://httpbin.org/delay/1',
			method: 'GET',
			description: 'Simulated 1s delay'
		},

		{
			url: 'https://www.cloudflare.com',
			method: 'HEAD',
			description: 'Cloudflare CDN'
		},

		{
			url: 'https://stackoverflow.com',
			method: 'HEAD',
			description: 'Stack Overflow'
		}
	];

	const examples = useExamples(examplesList);

	const httpMethods = [
		{
			value: 'HEAD',
			label: 'HEAD',
			description: 'Headers only, fastest'
		},

		{
			value: 'GET',
			label: 'GET',
			description: 'Full response, more realistic'
		},

		{
			value: 'OPTIONS',
			label: 'OPTIONS',
			description: 'Preflight requests'
		}
	];

	// Reactive validation
	const isUrlValid = $.derived(() => () => {
		try {
			const parsed = new URL($.get(url));

			return parsed.protocol === 'http:' || parsed.protocol === 'https:';
		} catch {
			return false;
		}
	});

	const isInputValid = $.derived(() => () => {
		return $.get(isUrlValid)() && $.get(count) >= 1 && $.get(count) <= 20;
	});

	async function httpPing() {
		diagnosticState.startOperation();

		try {
			const response = await fetch('/api/internal/diagnostics/network', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'http-ping',
					url: $.get(url).trim(),
					method: $.get(method),
					count: $.get(count),
					timeout: $.get(timeout)
				})
			});

			if (!response.ok) {
				const errorText = await response.text();

				try {
					const errorData = JSON.parse(errorText);

					throw new Error(errorData.message || `HTTP ping failed (${response.status})`);
				} catch {
					throw new Error(`HTTP ping failed (${response.status})`);
				}
			}

			const data = await response.json();

			diagnosticState.setResults(data);
		} catch(err) {
			diagnosticState.setError(err.message);
		}
	}

	function loadExample(example, index) {
		$.set(url, example.url, true);
		$.set(method, example.method, true);
		$.set(count, 5);
		$.set(timeout, 10000);
		examples.select(index);
		httpPing();
	}

	function setMethod(newMethod) {
		$.set(method, newMethod, true);
		examples.clear();

		if ($.get(isInputValid)()) httpPing();
	}

	function getLatencyClass(latency) {
		if (latency < 100) return 'excellent';
		if (latency < 300) return 'good';
		if (latency < 1000) return 'fair';

		return 'poor';
	}

	function getLatencyDescription(latency) {
		if (latency < 100) return 'Excellent';
		if (latency < 300) return 'Good';
		if (latency < 1000) return 'Fair';

		return 'Poor';
	}

	async function copyResults() {
		if (!diagnosticState.results) return;

		let text = `HTTP Ping Results for ${diagnosticState.results.url}\n`;

		text += `Generated at: ${new Date().toISOString()}\n\n`;
		text += `Configuration:\n`;
		text += `  Method: ${diagnosticState.results.method}\n`;
		text += `  Count: ${diagnosticState.results.count}\n`;
		text += `  Timeout: ${$.get(timeout)}ms\n\n`;
		text += `Summary:\n`;
		text += `  Successful: ${diagnosticState.results.successful}\n`;
		text += `  Failed: ${diagnosticState.results.failed}\n`;
		text += `  Success Rate: ${(diagnosticState.results.successful / diagnosticState.results.count * 100).toFixed(1)}%\n\n`;

		if (diagnosticState.results.statistics && diagnosticState.results.successful > 0) {
			text += `Latency Statistics:\n`;
			text += `  Min: ${diagnosticState.results.statistics.min}ms\n`;
			text += `  Max: ${diagnosticState.results.statistics.max}ms\n`;
			text += `  Average: ${diagnosticState.results.statistics.avg}ms\n`;
			text += `  Median: ${diagnosticState.results.statistics.median}ms\n`;
			text += `  95th Percentile: ${diagnosticState.results.statistics.p95}ms\n\n`;
		}

		if (diagnosticState.results.latencies?.length > 0) {
			text += `Individual Results:\n`;

			diagnosticState.results.latencies.forEach((latency, i) => {
				text += `  Request ${i + 1}: ${latency}ms\n`;
			});
		}

		if (diagnosticState.results.errors?.length > 0) {
			text += `\nErrors:\n`;

			diagnosticState.results.errors.forEach((err, i) => {
				text += `  ${i + 1}: ${err}\n`;
			});
		}

		await clipboard.copy(text);
	}

	var div = root_12();
	var node = $.sibling($.child(div), 2);

	ExamplesCard(node, {
		get examples() {
			return examplesList;
		},

		get selectedIndex() {
			return examples.selectedIndex;
		},
		onSelect: loadExample,
		title: 'HTTP Ping Examples',
		getLabel: (ex) => ex.description,
		getDescription: (ex) => `${ex.url} (${ex.method})`,
		getTooltip: (ex) => `Ping ${ex.url} using ${ex.method} method`
	});

	var div_1 = $.sibling(node, 2);
	var div_2 = $.sibling($.child(div_1), 2);
	var div_3 = $.child(div_2);
	var div_4 = $.child(div_3);
	var label = $.child(div_4);
	var input = $.sibling($.child(label));

	$.remove_input_defaults(input);

	let classes;
	var node_1 = $.sibling(input, 2);

	{
		var consequent = ($$anchor) => {
			var span = root();

			$.append($$anchor, span);
		};

		var d = $.derived(() => $.get(url) && !$.get(isUrlValid)());

		$.if(node_1, ($$render) => {
			if ($.get(d)) $$render(consequent);
		});
	}

	$.reset(label);
	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter a complete HTTP or HTTPS URL');
	$.reset(div_4);
	$.reset(div_3);

	var div_5 = $.sibling(div_3, 2);
	var div_6 = $.child(div_5);
	var div_7 = $.sibling($.child(div_6), 2);

	$.each(div_7, 21, () => httpMethods, $.index, ($$anchor, methodOption) => {
		var button = root_1();
		let classes_1;
		var text_1 = $.only_child(button, true);

		$.action(button, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => $.get(methodOption).description);

		$.template_effect(() => {
			classes_1 = $.set_class(button, 1, 'method-btn svelte-agdf2', null, classes_1, { active: $.get(method) === $.get(methodOption).value });
			$.set_text(text_1, $.get(methodOption).label);
		});

		$.delegated('click', button, () => setMethod($.get(methodOption).value));
		$.append($$anchor, button);
	});

	$.reset(div_7);
	$.reset(div_6);
	$.reset(div_5);

	var div_8 = $.sibling(div_5, 2);
	var div_9 = $.child(div_8);
	var label_1 = $.child(div_9);
	var input_1 = $.sibling($.child(label_1));

	$.remove_input_defaults(input_1);
	$.reset(label_1);
	$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Number of requests to send (1-20)');
	$.reset(div_9);

	var div_10 = $.sibling(div_9, 2);
	var label_2 = $.child(div_10);
	var input_2 = $.sibling($.child(label_2));

	$.remove_input_defaults(input_2);
	$.reset(label_2);
	$.action(label_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Timeout per request in milliseconds');
	$.reset(div_10);
	$.reset(div_8);

	var div_11 = $.sibling(div_8, 2);
	var button_1 = $.child(div_11);
	var node_2 = $.child(button_1);

	{
		var consequent_1 = ($$anchor) => {
			var fragment = root_2();
			var node_3 = $.first_child(fragment);

			Icon(node_3, { name: 'loader-2', size: 'sm', animate: 'spin' });
			$.next();
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_3();
			var node_4 = $.first_child(fragment_1);

			Icon(node_4, { name: 'activity', size: 'sm' });
			$.next();
			$.append($$anchor, fragment_1);
		};

		$.if(node_2, ($$render) => {
			if (diagnosticState.loading) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.reset(button_1);
	$.reset(div_11);
	$.reset(div_2);
	$.reset(div_1);

	var node_5 = $.sibling(div_1, 2);

	{
		var consequent_7 = ($$anchor) => {
			var div_12 = root_11();
			var div_13 = $.child(div_12);
			var button_2 = $.sibling($.child(div_13), 2);
			var node_6 = $.child(button_2);

			{
				let $0 = $.derived(() => clipboard.isCopied() ? 'check' : 'copy');

				Icon(node_6, {
					get name() {
						return $.get($0);
					},
					size: 'xs'
				});
			}

			var text_2 = $.sibling(node_6);

			$.reset(button_2);
			$.reset(div_13);

			var div_14 = $.sibling(div_13, 2);
			var div_15 = $.child(div_14);
			var div_16 = $.child(div_15);
			var node_7 = $.child(div_16);

			Icon(node_7, { name: 'check-circle', size: 'sm' });

			var div_17 = $.sibling(node_7, 2);
			var span_1 = $.child(div_17);
			var text_3 = $.only_child(span_1);

			$.next(2);
			$.reset(div_17);
			$.reset(div_16);

			var node_8 = $.sibling(div_16, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_18 = root_4();
					var node_9 = $.child(div_18);

					Icon(node_9, { name: 'zap', size: 'sm' });

					var div_19 = $.sibling(node_9, 2);
					var span_2 = $.child(div_19);
					var text_4 = $.only_child(span_2);
					var p = $.sibling(span_2, 2);
					var text_5 = $.only_child(p);

					$.reset(div_19);
					$.reset(div_18);

					$.template_effect(
						($0, $1) => {
							$.set_class(div_18, 1, `status-item ${$0 ?? ''}`, 'svelte-agdf2');
							$.set_text(text_4, `${diagnosticState.results.statistics.avg ?? ''}ms`);
							$.set_text(text_5, `Average latency (${$1 ?? ''})`);
						},
						[
							() => getLatencyClass(diagnosticState.results.statistics.avg),
							() => getLatencyDescription(diagnosticState.results.statistics.avg)
						]
					);

					$.append($$anchor, div_18);
				};

				$.if(node_8, ($$render) => {
					if (diagnosticState.results.statistics?.avg) $$render(consequent_2);
				});
			}

			var node_10 = $.sibling(node_8, 2);

			{
				var consequent_3 = ($$anchor) => {
					var div_20 = root_5();
					var node_11 = $.child(div_20);

					Icon(node_11, { name: 'x-circle', size: 'sm' });

					var div_21 = $.sibling(node_11, 2);
					var span_3 = $.child(div_21);
					var text_6 = $.only_child(span_3, true);

					$.next(2);
					$.reset(div_21);
					$.reset(div_20);
					$.template_effect(() => $.set_text(text_6, diagnosticState.results.failed));
					$.append($$anchor, div_20);
				};

				$.if(node_10, ($$render) => {
					if (diagnosticState.results.failed > 0) $$render(consequent_3);
				});
			}

			$.reset(div_15);

			var node_12 = $.sibling(div_15, 2);

			{
				var consequent_5 = ($$anchor) => {
					var fragment_2 = root_8();
					var div_22 = $.first_child(fragment_2);
					var div_23 = $.sibling($.child(div_22), 2);
					var div_24 = $.child(div_23);
					var span_4 = $.sibling($.child(div_24), 2);
					var text_7 = $.only_child(span_4);

					$.reset(div_24);

					var div_25 = $.sibling(div_24, 2);
					var span_5 = $.sibling($.child(div_25), 2);
					var text_8 = $.only_child(span_5);

					$.reset(div_25);

					var div_26 = $.sibling(div_25, 2);
					var span_6 = $.sibling($.child(div_26), 2);
					var text_9 = $.only_child(span_6);

					$.reset(div_26);

					var div_27 = $.sibling(div_26, 2);
					var span_7 = $.sibling($.child(div_27), 2);
					var text_10 = $.only_child(span_7);

					$.reset(div_27);

					var div_28 = $.sibling(div_27, 2);
					var span_8 = $.sibling($.child(div_28), 2);
					var text_11 = $.only_child(span_8);

					$.reset(div_28);

					var div_29 = $.sibling(div_28, 2);
					var span_9 = $.sibling($.child(div_29), 2);
					var text_12 = $.only_child(span_9);

					$.reset(div_29);
					$.reset(div_23);
					$.reset(div_22);

					var node_13 = $.sibling(div_22, 2);

					{
						var consequent_4 = ($$anchor) => {
							var div_30 = root_7();
							var div_31 = $.sibling($.child(div_30), 2);

							$.each(div_31, 21, () => diagnosticState.results.latencies, $.index, ($$anchor, latency, i) => {
								var div_32 = root_6();
								var span_10 = $.child(div_32);

								span_10.textContent = `#${i + 1}`;

								var span_11 = $.sibling(span_10, 2);
								var text_13 = $.only_child(span_11);
								var span_12 = $.sibling(span_11, 2);
								var text_14 = $.only_child(span_12, true);

								$.reset(div_32);

								$.template_effect(
									($0, $1) => {
										$.set_class(div_32, 1, `request-item ${$0 ?? ''}`, 'svelte-agdf2');
										$.set_text(text_13, `${$.get(latency) ?? ''}ms`);
										$.set_text(text_14, $1);
									},
									[
										() => getLatencyClass($.get(latency)),
										() => getLatencyDescription($.get(latency))
									]
								);

								$.append($$anchor, div_32);
							});

							$.reset(div_31);
							$.reset(div_30);
							$.append($$anchor, div_30);
						};

						$.if(node_13, ($$render) => {
							if (diagnosticState.results.latencies?.length > 0) $$render(consequent_4);
						});
					}

					$.template_effect(() => {
						$.set_text(text_7, `${diagnosticState.results.statistics.min ?? ''}ms`);
						$.set_text(text_8, `${diagnosticState.results.statistics.max ?? ''}ms`);
						$.set_text(text_9, `${diagnosticState.results.statistics.avg ?? ''}ms`);
						$.set_text(text_10, `${diagnosticState.results.statistics.median ?? ''}ms`);
						$.set_text(text_11, `${diagnosticState.results.statistics.p95 ?? ''}ms`);
						$.set_text(text_12, `${diagnosticState.results.statistics.max - diagnosticState.results.statistics.min}ms`);
					});

					$.append($$anchor, fragment_2);
				};

				$.if(node_12, ($$render) => {
					if (diagnosticState.results.statistics && diagnosticState.results.successful > 0) $$render(consequent_5);
				});
			}

			var node_14 = $.sibling(node_12, 2);

			{
				var consequent_6 = ($$anchor) => {
					var div_33 = root_10();
					var h4 = $.child(div_33);
					var text_15 = $.only_child(h4);
					var div_34 = $.sibling(h4, 2);

					$.each(div_34, 21, () => diagnosticState.results.errors, $.index, ($$anchor, error, i) => {
						var div_35 = root_9();
						var span_13 = $.child(div_35);
						var text_16 = $.only_child(span_13);
						var span_14 = $.sibling(span_13, 2);
						var text_17 = $.only_child(span_14, true);

						$.reset(div_35);

						$.template_effect(() => {
							$.set_text(text_16, `#${i + diagnosticState.results.successful + 1}`);
							$.set_text(text_17, $.get(error));
						});

						$.append($$anchor, div_35);
					});

					$.reset(div_34);
					$.reset(div_33);
					$.template_effect(() => $.set_text(text_15, `Request Errors (${diagnosticState.results.errors.length ?? ''})`));
					$.append($$anchor, div_33);
				};

				$.if(node_14, ($$render) => {
					if (diagnosticState.results.errors?.length > 0) $$render(consequent_6);
				});
			}

			var div_36 = $.sibling(node_14, 2);
			var div_37 = $.sibling($.child(div_36), 2);
			var div_38 = $.child(div_37);
			var span_15 = $.sibling($.child(div_38), 2);
			var text_18 = $.only_child(span_15, true);

			$.reset(div_38);

			var div_39 = $.sibling(div_38, 2);
			var span_16 = $.sibling($.child(div_39), 2);
			var text_19 = $.only_child(span_16, true);

			$.reset(div_39);

			var div_40 = $.sibling(div_39, 2);
			var span_17 = $.sibling($.child(div_40), 2);
			var text_20 = $.only_child(span_17);

			$.reset(div_40);
			$.reset(div_37);
			$.reset(div_36);
			$.reset(div_14);
			$.reset(div_12);

			$.template_effect(
				($0, $1, $2) => {
					button_2.disabled = $0;
					$.set_text(text_2, ` ${$1 ?? ''}`);
					$.set_text(text_3, `${diagnosticState.results.successful ?? ''}/${diagnosticState.results.count ?? ''}`);
					$.set_text(text_18, diagnosticState.results.url);
					$.set_text(text_19, diagnosticState.results.method);
					$.set_text(text_20, `${$2 ?? ''}%`);
				},
				[
					() => clipboard.isCopied(),
					() => clipboard.isCopied() ? 'Copied!' : 'Copy Results',
					() => (diagnosticState.results.successful / diagnosticState.results.count * 100).toFixed(1)
				]
			);

			$.delegated('click', button_2, copyResults);
			$.append($$anchor, div_12);
		};

		$.if(node_5, ($$render) => {
			if (diagnosticState.results) $$render(consequent_7);
		});
	}

	var node_15 = $.sibling(node_5, 2);

	ErrorCard(node_15, {
		title: 'HTTP Ping Failed',
		get error() {
			return diagnosticState.error;
		}
	});

	$.next(2);
	$.reset(div);

	$.template_effect(
		($0, $1) => {
			classes = $.set_class(input, 1, '', null, classes, { invalid: $0 });
			button_1.disabled = $1;
		},
		[
			() => $.get(url) && !$.get(isUrlValid)(),
			() => diagnosticState.loading || !$.get(isInputValid)()
		]
	);

	$.delegated('change', input, () => {
		examples.clear();

		if ($.get(isInputValid)()) httpPing();
	});

	$.bind_value(input, () => $.get(url), ($$value) => $.set(url, $$value));

	$.delegated('change', input_1, () => {
		examples.clear();

		if ($.get(isInputValid)()) httpPing();
	});

	$.bind_value(input_1, () => $.get(count), ($$value) => $.set(count, $$value));

	$.delegated('change', input_2, () => {
		examples.clear();

		if ($.get(isInputValid)()) httpPing();
	});

	$.bind_value(input_2, () => $.get(timeout), ($$value) => $.set(timeout, $$value));
	$.delegated('click', button_1, httpPing);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['change', 'click']);