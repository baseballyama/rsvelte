import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import '../../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<button><h5> </h5> <p> </p></button>`);
var root_1 = $.from_html(`<option> </option>`);
var root_2 = $.from_html(`<!> Analyzing SOA Record...`, 1);
var root_3 = $.from_html(`<!> Analyze SOA`, 1);
var root_4 = $.from_html(`<div class="parsed-date svelte-pe9bo2"><span class="date-part svelte-pe9bo2"> </span> <span class="date-part svelte-pe9bo2"> </span> <span class="date-part svelte-pe9bo2"> </span> <span class="date-part svelte-pe9bo2"> </span></div>`);
var root_5 = $.from_html(`<span class="unix-date svelte-pe9bo2"> </span>`);
var root_6 = $.from_html(`<dt>Parsed Date:</dt> <dd><!></dd>`, 1);
var root_7 = $.from_html(`<span class="ttl-value svelte-pe9bo2"> </span> <small> </small>`, 1);
var root_8 = $.from_html(`<small class="recommendation svelte-pe9bo2"> </small>`);
var root_9 = $.from_html(`<div><!> <div><strong class="svelte-pe9bo2"> </strong> <p class="svelte-pe9bo2"> </p> <!></div></div>`);
var root_10 = $.from_html(`<div class="result-section full-width"><h4>Configuration Assessment</h4> <div class="assessment-grid svelte-pe9bo2"></div></div>`);
var root_11 = $.from_html(`<div class="card results-card"><div class="card-header row"><h3> </h3> <button class="copy-btn"><span><!></span> </button></div> <div class="card-content"><div class="lookup-info"><div class="info-item"><span class="info-label">Domain:</span> <span class="info-value mono"> </span></div> <div class="info-item"><span class="info-label">DoH Resolver:</span> <span class="info-value"> </span></div></div> <div class="results-grid"><div class="result-section"><h4>Serial Number Analysis</h4> <div class="serial-analysis svelte-pe9bo2"><div class="serial-display svelte-pe9bo2"><span class="serial-number svelte-pe9bo2"> </span> <span> </span></div> <dl class="definition-list"><dt>Format:</dt> <dd><strong> </strong> <p class="format-explanation svelte-pe9bo2"> </p></dd> <!> <dt>Validity:</dt> <dd><!> </dd></dl></div></div> <div class="result-section"><h4>SOA Record Details</h4> <dl class="definition-list"><dt>Primary Server:</dt> <dd class="mono"> </dd> <dt>Contact Email:</dt> <dd class="mono"> </dd> <dt>TTL:</dt> <dd><!></dd></dl></div> <div class="result-section full-width"><h4>Zone Timing Parameters</h4> <div class="timing-grid svelte-pe9bo2"><div class="timing-param svelte-pe9bo2"><h5 class="svelte-pe9bo2">Refresh</h5> <div class="param-value svelte-pe9bo2"> </div> <div class="param-description svelte-pe9bo2"><small class="svelte-pe9bo2"> </small> <p class="svelte-pe9bo2">How often secondary servers check for updates</p></div></div> <div class="timing-param svelte-pe9bo2"><h5 class="svelte-pe9bo2">Retry</h5> <div class="param-value svelte-pe9bo2"> </div> <div class="param-description svelte-pe9bo2"><small class="svelte-pe9bo2"> </small> <p class="svelte-pe9bo2">Retry interval after failed refresh attempts</p></div></div> <div class="timing-param svelte-pe9bo2"><h5 class="svelte-pe9bo2">Expire</h5> <div class="param-value svelte-pe9bo2"> </div> <div class="param-description svelte-pe9bo2"><small class="svelte-pe9bo2"> </small> <p class="svelte-pe9bo2">When secondary servers stop serving the zone</p></div></div> <div class="timing-param svelte-pe9bo2"><h5 class="svelte-pe9bo2">Minimum</h5> <div class="param-value svelte-pe9bo2"> </div> <div class="param-description svelte-pe9bo2"><small class="svelte-pe9bo2"> </small> <p class="svelte-pe9bo2">Minimum TTL for negative responses</p></div></div></div></div> <!></div></div></div>`);
var root_12 = $.from_html(`<div class="card error-card"><div class="card-content"><div class="error-content"><!> <div><strong>SOA Analysis Failed</strong> <p> </p> <div class="troubleshooting"><p><strong>Troubleshooting Tips:</strong></p> <ul><li>Ensure the domain name is valid and has a SOA record</li> <li>Try a different DoH resolver if the current one fails</li> <li>Some domains may not respond to certain resolvers</li> <li>Check if the domain exists and is properly configured</li></ul></div></div></div></div></div>`);

var root_13 = $.from_html(`<div class="card"><header class="card-header"><h1>SOA Serial Analyzer</h1> <p>Analyze Start of Authority (SOA) records to interpret serial number formats and examine DNS zone timing
      parameters. SOA records contain critical zone metadata including serial numbers for change tracking and timing
      values for zone transfers.</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary"><!> <h4>Domain Examples</h4></summary> <div class="examples-grid"></div></details></div> <div class="card input-card"><div class="card-header"><h3>SOA Analysis Configuration</h3></div> <div class="card-content"><div class="form-grid svelte-pe9bo2"><div class="form-group svelte-pe9bo2"><label for="domain" class="svelte-pe9bo2">Domain Name <input id="domain" type="text" placeholder="example.com"/></label></div> <div class="form-group svelte-pe9bo2"><label for="resolver" class="svelte-pe9bo2">DoH Resolver <select id="resolver"></select></label></div></div> <div class="action-section"><button class="lookup-btn"><!></button></div></div></div> <!> <!> <div class="card info-card"><div class="card-header"><h3>About SOA Records and Serial Numbers</h3></div> <div class="card-content"><div class="info-grid"><div class="info-section"><h4>What is a SOA Record?</h4> <p>Start of Authority records contain administrative information about a DNS zone, including the primary
            server, contact email, and timing parameters that control zone transfers and caching behavior.</p></div> <div class="info-section"><h4>Serial Number Formats</h4> <ul><li><strong>YYYYMMDDNN:</strong> Date-based format (e.g., 2024031501 = March 15, 2024, revision 01)</li> <li><strong>Unix Timestamp:</strong> Seconds since epoch (e.g., 1710518400)</li> <li><strong>Sequential:</strong> Simple incrementing numbers (e.g., 1, 2, 3...)</li></ul></div> <div class="info-section"><h4>Timing Parameters</h4> <ul><li><strong>Refresh:</strong> How often secondaries check for updates</li> <li><strong>Retry:</strong> Retry interval after failed transfers</li> <li><strong>Expire:</strong> When to stop serving if updates fail</li> <li><strong>Minimum:</strong> TTL for negative (NXDOMAIN) responses</li></ul></div> <div class="info-section"><h4>Best Practices</h4> <ul><li>Use YYYYMMDDNN format for predictable versioning</li> <li>Set refresh to 3600-7200s for most zones</li> <li>Retry should be shorter than refresh (1800-3600s)</li> <li>Expire should be much longer (604800-1209600s)</li></ul></div></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let domain = $.state('example.com');
	let resolver = $.state('cloudflare');
	let loading = $.state(false);
	let results = $.state(null);
	let error = $.state(null);
	let copiedState = $.state(false);
	let selectedExampleIndex = $.state(null);

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
		$.set(loading, true);
		$.set(error, null);
		$.set(results, null);

		try {
			const response = await fetch('/api/internal/diagnostics/dns', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'soa-serial',
					name: $.get(domain).trim(),
					resolverOpts: { doh: $.get(resolver) }
				})
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));

				throw new Error(errorData.message || `SOA analysis failed: ${response.status}`);
			}

			$.set(results, await response.json(), true);
		} catch(err) {
			$.set(error, err instanceof Error ? err.message : 'Unknown error occurred', true);
		} finally {
			$.set(loading, false);
		}
	}

	function loadExample(example, index) {
		$.set(domain, example.domain, true);
		$.set(selectedExampleIndex, index, true);
		analyzeSOA();
	}

	function clearExampleSelection() {
		$.set(selectedExampleIndex, null);
	}

	async function copyResults() {
		const res = $.get(results);

		if (!res?.raw) return;

		try {
			await navigator.clipboard.writeText(JSON.stringify(res.raw, null, 2));
			$.set(copiedState, true);
			setTimeout(() => $.set(copiedState, false), 1500);
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

	var div = root_13();
	var div_1 = $.sibling($.child(div), 2);
	var details = $.child(div_1);
	var summary = $.child(details);
	var node = $.child(summary);

	Icon(node, { name: 'chevron-right', size: 'xs' });
	$.next(2);
	$.reset(summary);

	var div_2 = $.sibling(summary, 2);

	$.each(div_2, 21, () => examples, $.index, ($$anchor, example, i) => {
		var button = root();
		let classes;
		var h5 = $.child(button);
		var text = $.only_child(h5, true);
		var p = $.sibling(h5, 2);
		var text_1 = $.only_child(p, true);

		$.reset(button);
		$.action(button, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => `Analyze SOA record for ${$.get(example).domain} (${$.get(example).description})`);

		$.template_effect(() => {
			classes = $.set_class(button, 1, 'example-card', null, classes, { selected: $.get(selectedExampleIndex) === i });
			$.set_text(text, $.get(example).domain);
			$.set_text(text_1, $.get(example).description);
		});

		$.delegated('click', button, () => loadExample($.get(example), i));
		$.append($$anchor, button);
	});

	$.reset(div_2);
	$.reset(details);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var div_4 = $.sibling($.child(div_3), 2);
	var div_5 = $.child(div_4);
	var div_6 = $.child(div_5);
	var label = $.child(div_6);
	var input = $.sibling($.child(label));

	$.remove_input_defaults(input);
	$.reset(label);
	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter a domain name to analyze its SOA record');
	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var label_1 = $.child(div_7);
	var select = $.sibling($.child(label_1));

	$.each(select, 21, () => resolvers, $.index, ($$anchor, res) => {
		var option = root_1();
		var text_2 = $.only_child(option, true);
		var option_value = {};

		$.template_effect(() => {
			$.set_text(text_2, $.get(res).label);

			if (option_value !== (option_value = $.get(res).value)) {
				option.value = (option.__value = option_value) ?? '';
			}
		});

		$.append($$anchor, option);
	});

	$.reset(select);
	$.init_select(select);
	$.reset(label_1);
	$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Choose a DNS-over-HTTPS resolver for the query');
	$.reset(div_7);
	$.reset(div_5);

	var div_8 = $.sibling(div_5, 2);
	var button_1 = $.child(div_8);
	var node_1 = $.child(button_1);

	{
		var consequent = ($$anchor) => {
			var fragment = root_2();
			var node_2 = $.first_child(fragment);

			Icon(node_2, { name: 'loader', size: 'sm', animate: 'spin' });
			$.next();
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_3();
			var node_3 = $.first_child(fragment_1);

			Icon(node_3, { name: 'search', size: 'sm' });
			$.next();
			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(loading)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button_1);
	$.reset(div_8);
	$.reset(div_4);
	$.reset(div_3);

	var node_4 = $.sibling(div_3, 2);

	{
		var consequent_7 = ($$anchor) => {
			const res = $.derived(() => $.get(results));
			const serialInfo = $.derived(() => $.get(results).serialAnalysis);
			const serialAnalysis = $.derived(() => $.get(results).serialAnalysis);
			const soaData = $.derived(() => $.get(results).soa);
			const timingData = $.derived(() => $.get(results).soa);
			var div_9 = root_11();
			var div_10 = $.child(div_9);
			var h3 = $.child(div_10);
			var text_3 = $.only_child(h3);
			var button_2 = $.sibling(h3, 2);
			var span = $.child(button_2);
			var node_5 = $.child(span);

			{
				let $0 = $.derived(() => $.get(copiedState) ? 'check' : 'copy');

				Icon(node_5, {
					get name() {
						return $.get($0);
					},
					size: 'xs'
				});
			}

			$.reset(span);

			var text_4 = $.sibling(span);

			$.reset(button_2);
			$.reset(div_10);

			var div_11 = $.sibling(div_10, 2);
			var div_12 = $.child(div_11);
			var div_13 = $.child(div_12);
			var span_1 = $.child(div_13);

			$.action(span_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'The domain that was queried');

			var span_2 = $.sibling(span_1, 2);
			var text_5 = $.only_child(span_2, true);

			$.reset(div_13);

			var div_14 = $.sibling(div_13, 2);
			var span_3 = $.child(div_14);

			$.action(span_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'DNS-over-HTTPS resolver used for the query');

			var span_4 = $.sibling(span_3, 2);
			var text_6 = $.only_child(span_4, true);

			$.reset(div_14);
			$.reset(div_12);

			var div_15 = $.sibling(div_12, 2);
			var div_16 = $.child(div_15);
			var div_17 = $.sibling($.child(div_16), 2);
			var div_18 = $.child(div_17);
			var span_5 = $.child(div_18);
			var text_7 = $.only_child(span_5, true);
			var span_6 = $.sibling(span_5, 2);
			var text_8 = $.only_child(span_6, true);

			$.reset(div_18);

			var dl = $.sibling(div_18, 2);
			var dd = $.sibling($.child(dl), 2);
			var strong = $.child(dd);
			var text_9 = $.only_child(strong, true);
			var p_1 = $.sibling(strong, 2);
			var text_10 = $.only_child(p_1, true);

			$.reset(dd);

			var node_6 = $.sibling(dd, 2);

			{
				var consequent_3 = ($$anchor) => {
					var fragment_2 = root_6();
					var dd_1 = $.sibling($.first_child(fragment_2), 2);
					var node_7 = $.child(dd_1);

					{
						var consequent_1 = ($$anchor) => {
							var div_19 = root_4();
							var span_7 = $.child(div_19);
							var text_11 = $.only_child(span_7);
							var span_8 = $.sibling(span_7, 2);
							var text_12 = $.only_child(span_8);
							var span_9 = $.sibling(span_8, 2);
							var text_13 = $.only_child(span_9);
							var span_10 = $.sibling(span_9, 2);
							var text_14 = $.only_child(span_10);

							$.reset(div_19);

							$.template_effect(() => {
								$.set_text(text_11, `Year: ${$.get(serialAnalysis).parsed.year ?? ''}`);
								$.set_text(text_12, `Month: ${$.get(serialAnalysis).parsed.month ?? ''}`);
								$.set_text(text_13, `Day: ${$.get(serialAnalysis).parsed.day ?? ''}`);
								$.set_text(text_14, `Revision: ${$.get(serialAnalysis).parsed.revision ?? ''}`);
							});

							$.append($$anchor, div_19);
						};

						var consequent_2 = ($$anchor) => {
							var span_11 = root_5();
							var text_15 = $.only_child(span_11, true);

							$.template_effect(($0) => $.set_text(text_15, $0), [() => formatDate($.get(serialAnalysis).parsed.timestamp)]);
							$.append($$anchor, span_11);
						};

						$.if(node_7, ($$render) => {
							if ($.get(serialAnalysis).format === 'YYYYMMDDNN') $$render(consequent_1); else if ($.get(serialAnalysis).format === 'Unix Timestamp') $$render(consequent_2, 1);
						});
					}

					$.reset(dd_1);
					$.append($$anchor, fragment_2);
				};

				$.if(node_6, ($$render) => {
					if ($.get(serialAnalysis)?.parsed) $$render(consequent_3);
				});
			}

			var dd_2 = $.sibling(node_6, 4);
			var node_8 = $.child(dd_2);

			{
				let $0 = $.derived(() => $.get(serialAnalysis)?.valid ? 'check-circle' : 'x-circle');

				Icon(node_8, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			var text_16 = $.sibling(node_8);

			$.reset(dd_2);
			$.reset(dl);
			$.reset(div_17);
			$.reset(div_16);

			var div_20 = $.sibling(div_16, 2);
			var dl_1 = $.sibling($.child(div_20), 2);
			var dd_3 = $.sibling($.child(dl_1), 2);
			var text_17 = $.only_child(dd_3, true);
			var dd_4 = $.sibling(dd_3, 4);
			var text_18 = $.only_child(dd_4, true);
			var dd_5 = $.sibling(dd_4, 4);
			var node_9 = $.child(dd_5);

			{
				var consequent_4 = ($$anchor) => {
					var fragment_3 = root_7();
					var span_12 = $.first_child(fragment_3);
					var text_19 = $.only_child(span_12);
					var small = $.sibling(span_12, 2);
					var text_20 = $.only_child(small);

					$.template_effect(
						($0) => {
							$.set_text(text_19, `${$.get(soaData).ttl ?? ''}s`);
							$.set_text(text_20, `(${$0 ?? ''})`);
						},
						[() => formatDuration($.get(soaData).ttl)]
					);

					$.append($$anchor, fragment_3);
				};

				var alternate_1 = ($$anchor) => {
					var text_21 = $.text('Not available');

					$.append($$anchor, text_21);
				};

				$.if(node_9, ($$render) => {
					if ($.get(soaData)?.ttl) $$render(consequent_4); else $$render(alternate_1, -1);
				});
			}

			$.reset(dd_5);
			$.reset(dl_1);
			$.reset(div_20);

			var div_21 = $.sibling(div_20, 2);
			var div_22 = $.sibling($.child(div_21), 2);
			var div_23 = $.child(div_22);
			var div_24 = $.sibling($.child(div_23), 2);
			var text_22 = $.only_child(div_24);
			var div_25 = $.sibling(div_24, 2);
			var small_1 = $.child(div_25);
			var text_23 = $.only_child(small_1, true);

			$.next(2);
			$.reset(div_25);
			$.reset(div_23);

			var div_26 = $.sibling(div_23, 2);
			var div_27 = $.sibling($.child(div_26), 2);
			var text_24 = $.only_child(div_27);
			var div_28 = $.sibling(div_27, 2);
			var small_2 = $.child(div_28);
			var text_25 = $.only_child(small_2, true);

			$.next(2);
			$.reset(div_28);
			$.reset(div_26);

			var div_29 = $.sibling(div_26, 2);
			var div_30 = $.sibling($.child(div_29), 2);
			var text_26 = $.only_child(div_30);
			var div_31 = $.sibling(div_30, 2);
			var small_3 = $.child(div_31);
			var text_27 = $.only_child(small_3, true);

			$.next(2);
			$.reset(div_31);
			$.reset(div_29);

			var div_32 = $.sibling(div_29, 2);
			var div_33 = $.sibling($.child(div_32), 2);
			var text_28 = $.only_child(div_33);
			var div_34 = $.sibling(div_33, 2);
			var small_4 = $.child(div_34);
			var text_29 = $.only_child(small_4, true);

			$.next(2);
			$.reset(div_34);
			$.reset(div_32);
			$.reset(div_22);
			$.reset(div_21);

			var node_10 = $.sibling(div_21, 2);

			{
				var consequent_6 = ($$anchor) => {
					const assessmentData = $.derived(() => $.get(results).assessment);
					var div_35 = root_10();
					var div_36 = $.sibling($.child(div_35), 2);

					$.each(div_36, 21, () => $.get(assessmentData) || [], $.index, ($$anchor, item) => {
						var div_37 = root_9();
						var node_11 = $.child(div_37);

						{
							let $0 = $.derived(() => $.get(item).severity === 'good'
								? 'check-circle'
								: $.get(item).severity === 'warning' ? 'alert-triangle' : 'info');

							Icon(node_11, {
								get name() {
									return $.get($0);
								},
								size: 'md'
							});
						}

						var div_38 = $.sibling(node_11, 2);
						var strong_1 = $.child(div_38);
						var text_30 = $.only_child(strong_1, true);
						var p_2 = $.sibling(strong_1, 2);
						var text_31 = $.only_child(p_2, true);
						var node_12 = $.sibling(p_2, 2);

						{
							var consequent_5 = ($$anchor) => {
								var small_5 = root_8();
								var text_32 = $.only_child(small_5, true);

								$.template_effect(() => $.set_text(text_32, $.get(item).recommendation));
								$.append($$anchor, small_5);
							};

							$.if(node_12, ($$render) => {
								if ($.get(item).recommendation) $$render(consequent_5);
							});
						}

						$.reset(div_38);
						$.reset(div_37);

						$.template_effect(() => {
							$.set_class(div_37, 1, `assessment-item ${$.get(item).severity ?? ''}`, 'svelte-pe9bo2');
							$.set_text(text_30, $.get(item).aspect);
							$.set_text(text_31, $.get(item).message);
						});

						$.append($$anchor, div_37);
					});

					$.reset(div_36);
					$.reset(div_35);
					$.append($$anchor, div_35);
				};

				$.if(node_10, ($$render) => {
					if ($.get(results).assessment?.length) $$render(consequent_6);
				});
			}

			$.reset(div_15);
			$.reset(div_11);
			$.reset(div_9);

			$.template_effect(
				($0, $1, $2, $3) => {
					$.set_text(text_3, `SOA Analysis for ${$.get(results).name ?? ''}`);
					button_2.disabled = $.get(copiedState);
					$.set_class(span, 1, $.clsx($.get(copiedState) ? 'text-green-500' : ''));
					$.set_text(text_4, ` ${$.get(copiedState) ? 'Copied!' : 'Copy Raw JSON'}`);
					$.set_text(text_5, $.get(results).name);
					$.set_text(text_6, $.get(results).resolver);
					$.set_text(text_7, $.get(res).soa?.serial || 'Not available');
					$.set_class(span_6, 1, `serial-format ${$.get(res).serialAnalysis?.format ?? ''}`, 'svelte-pe9bo2');
					$.set_text(text_8, $.get(res).serialAnalysis?.format || 'Unknown');
					$.set_text(text_9, $.get(serialInfo)?.formatDescription || 'Unknown');
					$.set_text(text_10, $.get(serialInfo)?.explanation || 'No analysis available');
					$.set_class(dd_2, 1, `validity ${$.get(serialAnalysis)?.valid ? 'valid' : 'invalid'}`, 'svelte-pe9bo2');
					$.set_text(text_16, ` ${$.get(serialAnalysis)?.valid ? 'Valid format' : 'Invalid or unusual format'}`);
					$.set_text(text_17, $.get(soaData)?.mname || 'Not available');
					$.set_text(text_18, $.get(soaData)?.rname || 'Not available');
					$.set_text(text_22, `${($.get(timingData)?.refresh || 0) ?? ''}s`);
					$.set_text(text_23, $0);
					$.set_text(text_24, `${($.get(timingData)?.retry || 0) ?? ''}s`);
					$.set_text(text_25, $1);
					$.set_text(text_26, `${($.get(timingData)?.expire || 0) ?? ''}s`);
					$.set_text(text_27, $2);
					$.set_text(text_28, `${($.get(timingData)?.minimum || 0) ?? ''}s`);
					$.set_text(text_29, $3);
				},
				[
					() => formatDuration($.get(timingData)?.refresh || 0),
					() => formatDuration($.get(timingData)?.retry || 0),
					() => formatDuration($.get(timingData)?.expire || 0),
					() => formatDuration($.get(timingData)?.minimum || 0)
				]
			);

			$.delegated('click', button_2, copyResults);
			$.append($$anchor, div_9);
		};

		$.if(node_4, ($$render) => {
			if ($.get(results)) $$render(consequent_7);
		});
	}

	var node_13 = $.sibling(node_4, 2);

	{
		var consequent_8 = ($$anchor) => {
			var div_39 = root_12();
			var div_40 = $.child(div_39);
			var div_41 = $.child(div_40);
			var node_14 = $.child(div_41);

			Icon(node_14, { name: 'alert-triangle', size: 'md' });

			var div_42 = $.sibling(node_14, 2);
			var p_3 = $.sibling($.child(div_42), 2);
			var text_33 = $.only_child(p_3, true);

			$.next(2);
			$.reset(div_42);
			$.reset(div_41);
			$.reset(div_40);
			$.reset(div_39);
			$.template_effect(() => $.set_text(text_33, $.get(error)));
			$.append($$anchor, div_39);
		};

		$.if(node_13, ($$render) => {
			if ($.get(error)) $$render(consequent_8);
		});
	}

	$.next(2);
	$.reset(div);
	$.template_effect(($0) => button_1.disabled = $0, [() => $.get(loading) || !$.get(domain).trim()]);

	$.delegated('change', input, () => {
		clearExampleSelection();

		if ($.get(domain).trim()) analyzeSOA();
	});

	$.bind_value(input, () => $.get(domain), ($$value) => $.set(domain, $$value));

	$.delegated('change', select, () => {
		if ($.get(domain).trim()) analyzeSOA();
	});

	$.bind_select_value(select, () => $.get(resolver), ($$value) => $.set(resolver, $$value));
	$.delegated('click', button_1, analyzeSOA);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'change']);