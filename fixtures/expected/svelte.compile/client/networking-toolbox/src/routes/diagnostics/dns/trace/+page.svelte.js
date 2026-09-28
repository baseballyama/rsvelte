import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import '../../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<button><h5> </h5> <p> </p></button>`);
var root_1 = $.from_html(`<!> Tracing...`, 1);
var root_2 = $.from_html(`<!> Trace`, 1);
var root_3 = $.from_html(`<div class="card error-card"><div class="card-content"><div class="error-content"><!> <div><strong>Trace Failed</strong> <p> </p></div></div></div></div>`);
var root_4 = $.from_html(`<div class="card"><div class="card-content"><div class="loading-state svelte-123bgah"><!> <div class="loading-text svelte-123bgah"><h3 class="svelte-123bgah">Performing DNS Trace</h3> <p class="svelte-123bgah">Following the DNS resolution path from root servers to authoritative nameservers...</p></div></div></div></div>`);
var root_5 = $.from_html(`<span class="record-type svelte-123bgah"> </span>`);
var root_6 = $.from_html(`<span class="server-name svelte-123bgah"> </span>`);
var root_7 = $.from_html(`<span class="referral svelte-123bgah"> </span>`);
var root_8 = $.from_html(`<span class="answer svelte-123bgah"><!></span>`);
var root_9 = $.from_html(`<span class="nodata svelte-123bgah">No data for this record type</span>`);
var root_10 = $.from_html(`<span class="nxdomain svelte-123bgah">Domain does not exist</span>`);
var root_11 = $.from_html(`<div class="step-response svelte-123bgah"><strong class="svelte-123bgah">Response:</strong> <!></div>`);
var root_12 = $.from_html(`<span class="flag authoritative svelte-123bgah">AA</span>`);
var root_13 = $.from_html(`<span class="flag dnssec svelte-123bgah">AD</span>`);
var root_14 = $.from_html(`<span class="flag svelte-123bgah">RD</span>`);
var root_15 = $.from_html(`<span class="flag svelte-123bgah">RA</span>`);
var root_16 = $.from_html(`<div class="step-flags svelte-123bgah"><!> <!> <!> <!></div>`);
var root_17 = $.from_html(`<div class="trace-step svelte-123bgah"><div class="step-marker svelte-123bgah"><span class="step-number svelte-123bgah"></span></div> <div class="step-content svelte-123bgah"><div class="step-header svelte-123bgah"><span class="step-type svelte-123bgah"> </span> <span class="step-timing svelte-123bgah"> </span></div> <div class="step-query svelte-123bgah"><strong class="svelte-123bgah">Query:</strong> <!></div> <div class="step-server svelte-123bgah"><strong class="svelte-123bgah">Server:</strong> <!></div> <!> <!></div></div>`);
var root_18 = $.from_html(`<div class="stat-card svelte-123bgah"><div class="stat-label">Final Server</div> <div class="stat-value mono svelte-123bgah"> </div></div>`);
var root_19 = $.from_html(`<div class="stat-card svelte-123bgah"><div class="stat-label">Record Type</div> <div class="stat-value svelte-123bgah"> </div></div>`);
var root_20 = $.from_html(`<div class="stat-card svelte-123bgah"><div class="stat-label">Total Hops</div> <div class="stat-value svelte-123bgah"> </div></div>`);
var root_21 = $.from_html(`<div class="stat-card svelte-123bgah"><div class="stat-label">Avg Latency</div> <div class="stat-value svelte-123bgah"> </div></div>`);
var root_22 = $.from_html(`<div class="stat-card svelte-123bgah"><div class="stat-label">DNSSEC Status</div> <div><!> </div></div>`);
var root_23 = $.from_html(`<div class="stat-card svelte-123bgah"><div class="stat-label">Authoritative</div> <div><!> </div></div>`);
var root_24 = $.from_html(`<div class="stat-card double-width svelte-123bgah"><div class="stat-label">Resolution Path</div> <div class="stat-value mono resolver-path svelte-123bgah"> </div></div>`);
var root_25 = $.from_html(`<div class="stat-card double-width svelte-123bgah"><div class="stat-label">Final Answer</div> <div class="stat-value mono svelte-123bgah"> </div></div>`);
var root_26 = $.from_html(`<div class="card"><div class="card-header"><h3>Trace Summary</h3></div> <div class="card-content"><div class="stats-grid"><div class="stat-card svelte-123bgah"><div class="stat-label">Total Time</div> <div class="stat-value svelte-123bgah"><!> </div></div> <div class="stat-card svelte-123bgah"><div class="stat-label">DNS Queries</div> <div class="stat-value svelte-123bgah"> </div></div> <!> <!> <!> <!> <!> <!> <!> <!></div></div></div>`);
var root_27 = $.from_html(`<div class="card results-card"><div class="card-header"><h3>Trace Path</h3></div> <div class="card-content"><div class="trace-timeline svelte-123bgah"></div></div></div> <!>`, 1);
var root_28 = $.from_html(`<div class="card"><header class="card-header"><h1>DNS Trace Tool</h1> <p>Iterative trace from root to authoritative nameservers via DNS over HTTPS</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary"><!> <h4>Quick Examples</h4></summary> <div class="examples-grid"></div></details></div> <div class="card input-card"><div class="card-header"><h3>Trace Configuration</h3></div> <div class="card-content"><div class="form-group"><label for="domain">Domain Name</label> <div class="input-flex-container"><input id="domain" type="text" placeholder="example.com"/> <button class="primary"><!></button></div></div></div></div> <!> <!> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let domainName = $.state('example.com');
	let loading = $.state(false);
	let results = $.state(null);
	let error = $.state(null);
	let selectedExampleIndex = $.state(null);

	const examples = [
		{
			domain: 'www.cloudflare.com',
			description: 'Cloudflare edge network'
		},

		{
			domain: 'www.google.com',
			description: 'Popular service with CDN'
		},
		{ domain: 'github.com', description: 'GitHub platform trace' },
		{ domain: 'bbc.co.uk', description: 'Multi-level TLD (.co.uk)' },
		{
			domain: 'aws.amazon.com',
			description: 'AWS subdomain delegation'
		},

		{
			domain: 'aliciasykes.com',
			description: 'Homepage hosted on Vercel'
		}
	];

	async function performTrace() {
		if (!$.get(domainName)?.trim()) {
			$.set(error, 'Please enter a domain name');

			return;
		}

		$.set(loading, true);
		$.set(error, null);
		$.set(results, null);

		try {
			const response = await fetch('/api/internal/diagnostics/dns', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'trace',
					domain: $.get(domainName).trim().toLowerCase()
				})
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Failed to trace domain');
			}

			$.set(results, data, true);
		} catch(err) {
			$.set(error, err instanceof Error ? err.message : 'An error occurred', true);
		} finally {
			$.set(loading, false);
		}
	}

	function loadExample(example, index) {
		$.set(domainName, example.domain, true);
		$.set(selectedExampleIndex, index, true);
		performTrace();
	}

	function clearExampleSelection() {
		$.set(selectedExampleIndex, null);
	}

	function formatTiming(ms) {
		if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`;
		if (ms < 1000) return `${ms.toFixed(1)}ms`;

		return `${(ms / 1000).toFixed(2)}s`;
	}

	var div = root_28();
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
		$.action(button, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => `Trace DNS resolution path for ${$.get(example).domain}`);

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
	var div_6 = $.sibling($.child(div_5), 2);
	var input = $.child(div_6);

	$.remove_input_defaults(input);

	var button_1 = $.sibling(input, 2);
	var node_1 = $.child(button_1);

	{
		var consequent = ($$anchor) => {
			var fragment = root_1();
			var node_2 = $.first_child(fragment);

			Icon(node_2, { name: 'loader', size: 'sm', animate: 'spin' });
			$.next();
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_2();
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
	$.reset(div_6);
	$.reset(div_5);
	$.reset(div_4);
	$.reset(div_3);

	var node_4 = $.sibling(div_3, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_7 = root_3();
			var div_8 = $.child(div_7);
			var div_9 = $.child(div_8);
			var node_5 = $.child(div_9);

			Icon(node_5, { name: 'alert-triangle', size: 'md' });

			var div_10 = $.sibling(node_5, 2);
			var p_1 = $.sibling($.child(div_10), 2);
			var text_2 = $.only_child(p_1, true);

			$.reset(div_10);
			$.reset(div_9);
			$.reset(div_8);
			$.reset(div_7);
			$.template_effect(() => $.set_text(text_2, $.get(error)));
			$.append($$anchor, div_7);
		};

		$.if(node_4, ($$render) => {
			if ($.get(error)) $$render(consequent_1);
		});
	}

	var node_6 = $.sibling(node_4, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_11 = root_4();
			var div_12 = $.child(div_11);
			var div_13 = $.child(div_12);
			var node_7 = $.child(div_13);

			Icon(node_7, { name: 'loader', size: 'lg', animate: 'spin' });
			$.next(2);
			$.reset(div_13);
			$.reset(div_12);
			$.reset(div_11);
			$.append($$anchor, div_11);
		};

		$.if(node_6, ($$render) => {
			if ($.get(loading)) $$render(consequent_2);
		});
	}

	var node_8 = $.sibling(node_6, 2);

	{
		var consequent_25 = ($$anchor) => {
			var fragment_2 = root_27();
			var div_14 = $.first_child(fragment_2);
			var div_15 = $.sibling($.child(div_14), 2);
			var div_16 = $.child(div_15);

			$.each(div_16, 21, () => $.get(results).path, $.index, ($$anchor, step, i) => {
				var div_17 = root_17();
				var div_18 = $.child(div_17);
				var span = $.child(div_18);

				span.textContent = i + 1;
				$.reset(div_18);

				var div_19 = $.sibling(div_18, 2);
				var div_20 = $.child(div_19);
				var span_1 = $.child(div_20);
				var text_3 = $.only_child(span_1, true);

				$.action(span_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Type of DNS query operation');

				var span_2 = $.sibling(span_1, 2);
				var text_4 = $.only_child(span_2, true);

				$.action(span_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Time taken for this query');
				$.reset(div_20);

				var div_21 = $.sibling(div_20, 2);
				var strong = $.child(div_21);

				$.action(strong, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Domain name being queried');

				var text_5 = $.sibling(strong);
				var node_9 = $.sibling(text_5);

				{
					var consequent_3 = ($$anchor) => {
						var span_3 = root_5();
						var text_6 = $.only_child(span_3, true);

						$.action(span_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'DNS record type requested');
						$.template_effect(() => $.set_text(text_6, $.get(step).qtype));
						$.append($$anchor, span_3);
					};

					$.if(node_9, ($$render) => {
						if ($.get(step).qtype) $$render(consequent_3);
					});
				}

				$.reset(div_21);

				var div_22 = $.sibling(div_21, 2);
				var strong_1 = $.child(div_22);

				$.action(strong_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'DNS server that responded to this query');

				var text_7 = $.sibling(strong_1);
				var node_10 = $.sibling(text_7);

				{
					var consequent_4 = ($$anchor) => {
						var span_4 = root_6();
						var text_8 = $.only_child(span_4);

						$.template_effect(() => $.set_text(text_8, `(${$.get(step).serverName ?? ''})`));
						$.append($$anchor, span_4);
					};

					$.if(node_10, ($$render) => {
						if ($.get(step).serverName) $$render(consequent_4);
					});
				}

				$.reset(div_22);

				var node_11 = $.sibling(div_22, 2);

				{
					var consequent_10 = ($$anchor) => {
						var div_23 = root_11();
						var strong_2 = $.child(div_23);

						$.action(strong_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Response received from the DNS server');

						var node_12 = $.sibling(strong_2, 2);

						{
							var consequent_5 = ($$anchor) => {
								var span_5 = root_7();
								var text_9 = $.only_child(span_5);

								$.template_effect(($0) => $.set_text(text_9, `Referral to ${$0 ?? ''}`), [() => $.get(step).response.nameservers.join(', ')]);
								$.append($$anchor, span_5);
							};

							var consequent_7 = ($$anchor) => {
								var span_6 = root_8();
								var node_13 = $.child(span_6);

								{
									var consequent_6 = ($$anchor) => {
										var text_10 = $.text();

										$.template_effect(($0) => $.set_text(text_10, $0), [() => $.get(step).response.data.join(', ')]);
										$.append($$anchor, text_10);
									};

									var d = $.derived(() => Array.isArray($.get(step).response.data));

									var alternate_1 = ($$anchor) => {
										var text_11 = $.text();

										$.template_effect(() => $.set_text(text_11, $.get(step).response.data));
										$.append($$anchor, text_11);
									};

									$.if(node_13, ($$render) => {
										if ($.get(d)) $$render(consequent_6); else $$render(alternate_1, -1);
									});
								}

								$.reset(span_6);
								$.append($$anchor, span_6);
							};

							var consequent_8 = ($$anchor) => {
								var span_7 = root_9();

								$.append($$anchor, span_7);
							};

							var consequent_9 = ($$anchor) => {
								var span_8 = root_10();

								$.append($$anchor, span_8);
							};

							$.if(node_12, ($$render) => {
								if ($.get(step).response.type === 'referral') $$render(consequent_5); else if ($.get(step).response.type === 'answer') $$render(consequent_7, 1); else if ($.get(step).response.type === 'nodata') $$render(consequent_8, 2); else if ($.get(step).response.type === 'nxdomain') $$render(consequent_9, 3);
							});
						}

						$.reset(div_23);
						$.append($$anchor, div_23);
					};

					$.if(node_11, ($$render) => {
						if ($.get(step).response) $$render(consequent_10);
					});
				}

				var node_14 = $.sibling(node_11, 2);

				{
					var consequent_15 = ($$anchor) => {
						var div_24 = root_16();
						var node_15 = $.child(div_24);

						{
							var consequent_11 = ($$anchor) => {
								var span_9 = root_12();

								$.action(span_9, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Authoritative Answer');
								$.append($$anchor, span_9);
							};

							$.if(node_15, ($$render) => {
								if ($.get(step).flags.aa) $$render(consequent_11);
							});
						}

						var node_16 = $.sibling(node_15, 2);

						{
							var consequent_12 = ($$anchor) => {
								var span_10 = root_13();

								$.action(span_10, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Authenticated Data (DNSSEC)');
								$.append($$anchor, span_10);
							};

							$.if(node_16, ($$render) => {
								if ($.get(step).flags.ad) $$render(consequent_12);
							});
						}

						var node_17 = $.sibling(node_16, 2);

						{
							var consequent_13 = ($$anchor) => {
								var span_11 = root_14();

								$.action(span_11, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Recursion Desired');
								$.append($$anchor, span_11);
							};

							$.if(node_17, ($$render) => {
								if ($.get(step).flags.rd) $$render(consequent_13);
							});
						}

						var node_18 = $.sibling(node_17, 2);

						{
							var consequent_14 = ($$anchor) => {
								var span_12 = root_15();

								$.action(span_12, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Recursion Available');
								$.append($$anchor, span_12);
							};

							$.if(node_18, ($$render) => {
								if ($.get(step).flags.ra) $$render(consequent_14);
							});
						}

						$.reset(div_24);
						$.append($$anchor, div_24);
					};

					$.if(node_14, ($$render) => {
						if ($.get(step).flags) $$render(consequent_15);
					});
				}

				$.reset(div_19);
				$.reset(div_17);

				$.template_effect(
					($0) => {
						$.set_text(text_3, $.get(step).type);
						$.set_text(text_4, $0);
						$.set_text(text_5, ` ${$.get(step).query ?? ''} `);
						$.set_text(text_7, ` ${$.get(step).server ?? ''} `);
					},
					[() => formatTiming($.get(step).timing)]
				);

				$.append($$anchor, div_17);
			});

			$.reset(div_16);
			$.reset(div_15);
			$.reset(div_14);

			var node_19 = $.sibling(div_14, 2);

			{
				var consequent_24 = ($$anchor) => {
					var div_25 = root_26();
					var div_26 = $.sibling($.child(div_25), 2);
					var div_27 = $.child(div_26);
					var div_28 = $.child(div_27);
					var div_29 = $.child(div_28);

					$.action(div_29, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Total time for the complete DNS trace');

					var div_30 = $.sibling(div_29, 2);
					var node_20 = $.child(div_30);

					Icon(node_20, { name: 'timer', size: 'sm' });

					var text_12 = $.sibling(node_20);

					$.reset(div_30);
					$.reset(div_28);

					var div_31 = $.sibling(div_28, 2);
					var div_32 = $.child(div_31);

					$.action(div_32, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Number of DNS queries performed during trace');

					var div_33 = $.sibling(div_32, 2);
					var text_13 = $.only_child(div_33, true);

					$.reset(div_31);

					var node_21 = $.sibling(div_31, 2);

					{
						var consequent_16 = ($$anchor) => {
							var div_34 = root_18();
							var div_35 = $.child(div_34);

							$.action(div_35, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Final authoritative server that provided the answer');

							var div_36 = $.sibling(div_35, 2);
							var text_14 = $.only_child(div_36, true);

							$.reset(div_34);
							$.template_effect(() => $.set_text(text_14, $.get(results).summary.finalServer));
							$.append($$anchor, div_34);
						};

						$.if(node_21, ($$render) => {
							if ($.get(results).summary.finalServer) $$render(consequent_16);
						});
					}

					var node_22 = $.sibling(node_21, 2);

					{
						var consequent_17 = ($$anchor) => {
							var div_37 = root_19();
							var div_38 = $.child(div_37);

							$.action(div_38, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Type of DNS record that was traced');

							var div_39 = $.sibling(div_38, 2);
							var text_15 = $.only_child(div_39, true);

							$.reset(div_37);
							$.template_effect(() => $.set_text(text_15, $.get(results).summary.recordType));
							$.append($$anchor, div_37);
						};

						$.if(node_22, ($$render) => {
							if ($.get(results).summary.recordType) $$render(consequent_17);
						});
					}

					var node_23 = $.sibling(node_22, 2);

					{
						var consequent_18 = ($$anchor) => {
							var div_40 = root_20();
							var div_41 = $.child(div_40);

							$.action(div_41, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Number of DNS resolution hops from root to authoritative');

							var div_42 = $.sibling(div_41, 2);
							var text_16 = $.only_child(div_42, true);

							$.reset(div_40);
							$.template_effect(() => $.set_text(text_16, $.get(results).summary.totalHops));
							$.append($$anchor, div_40);
						};

						$.if(node_23, ($$render) => {
							if ($.get(results).summary.totalHops) $$render(consequent_18);
						});
					}

					var node_24 = $.sibling(node_23, 2);

					{
						var consequent_19 = ($$anchor) => {
							var div_43 = root_21();
							var div_44 = $.child(div_43);

							$.action(div_44, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Average response time per DNS query');

							var div_45 = $.sibling(div_44, 2);
							var text_17 = $.only_child(div_45);

							$.reset(div_43);
							$.template_effect(() => $.set_text(text_17, `${$.get(results).summary.averageLatency ?? ''}ms`));
							$.append($$anchor, div_43);
						};

						$.if(node_24, ($$render) => {
							if ($.get(results).summary.averageLatency) $$render(consequent_19);
						});
					}

					var node_25 = $.sibling(node_24, 2);

					{
						var consequent_20 = ($$anchor) => {
							var div_46 = root_22();
							var div_47 = $.child(div_46);

							$.action(div_47, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'DNSSEC validation status for the final response');

							var div_48 = $.sibling(div_47, 2);
							let classes_1;
							var node_26 = $.child(div_48);

							{
								let $0 = $.derived(() => $.get(results).summary.dnssecValid ? 'shield-check' : 'shield-x');

								Icon(node_26, {
									get name() {
										return $.get($0);
									},
									size: 'sm'
								});
							}

							var text_18 = $.sibling(node_26);

							$.reset(div_48);
							$.reset(div_46);

							$.template_effect(() => {
								classes_1 = $.set_class(div_48, 1, 'stat-value svelte-123bgah', null, classes_1, {
									valid: $.get(results).summary.dnssecValid,
									invalid: !$.get(results).summary.dnssecValid
								});

								$.set_text(text_18, ` ${$.get(results).summary.dnssecValid ? 'Valid' : 'Not Validated'}`);
							});

							$.append($$anchor, div_46);
						};

						$.if(node_25, ($$render) => {
							if ($.get(results).summary.dnssecValid !== undefined) $$render(consequent_20);
						});
					}

					var node_27 = $.sibling(node_25, 2);

					{
						var consequent_21 = ($$anchor) => {
							var div_49 = root_23();
							var div_50 = $.child(div_49);

							$.action(div_50, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Whether the final answer came from an authoritative server');

							var div_51 = $.sibling(div_50, 2);
							let classes_2;
							var node_28 = $.child(div_51);

							{
								let $0 = $.derived(() => $.get(results).summary.authoritativeAnswer ? 'check-circle' : 'x-circle');

								Icon(node_28, {
									get name() {
										return $.get($0);
									},
									size: 'sm'
								});
							}

							var text_19 = $.sibling(node_28);

							$.reset(div_51);
							$.reset(div_49);

							$.template_effect(() => {
								classes_2 = $.set_class(div_51, 1, 'stat-value svelte-123bgah', null, classes_2, {
									valid: $.get(results).summary.authoritativeAnswer,
									invalid: !$.get(results).summary.authoritativeAnswer
								});

								$.set_text(text_19, ` ${$.get(results).summary.authoritativeAnswer ? 'Yes' : 'No'}`);
							});

							$.append($$anchor, div_49);
						};

						$.if(node_27, ($$render) => {
							if ($.get(results).summary.authoritativeAnswer !== undefined) $$render(consequent_21);
						});
					}

					var node_29 = $.sibling(node_27, 2);

					{
						var consequent_22 = ($$anchor) => {
							var div_52 = root_24();
							var div_53 = $.child(div_52);

							$.action(div_53, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'The path taken through different DNS servers');

							var div_54 = $.sibling(div_53, 2);
							var text_20 = $.only_child(div_54, true);

							$.reset(div_52);
							$.template_effect(() => $.set_text(text_20, $.get(results).summary.resolverPath));
							$.append($$anchor, div_52);
						};

						$.if(node_29, ($$render) => {
							if ($.get(results).summary.resolverPath) $$render(consequent_22);
						});
					}

					var node_30 = $.sibling(node_29, 2);

					{
						var consequent_23 = ($$anchor) => {
							var div_55 = root_25();
							var div_56 = $.child(div_55);

							$.action(div_56, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'The final answer received from the authoritative server');

							var div_57 = $.sibling(div_56, 2);
							var text_21 = $.only_child(div_57, true);

							$.reset(div_55);

							$.template_effect(($0) => $.set_text(text_21, $0), [
								() => Array.isArray($.get(results).summary.finalAnswer)
									? $.get(results).summary.finalAnswer.join(', ')
									: $.get(results).summary.finalAnswer
							]);

							$.append($$anchor, div_55);
						};

						$.if(node_30, ($$render) => {
							if ($.get(results).summary.finalAnswer) $$render(consequent_23);
						});
					}

					$.reset(div_27);
					$.reset(div_26);
					$.reset(div_25);

					$.template_effect(
						($0) => {
							$.set_text(text_12, ` ${$0 ?? ''}`);
							$.set_text(text_13, $.get(results).summary.queryCount);
						},
						[() => formatTiming($.get(results).summary.totalTime)]
					);

					$.append($$anchor, div_25);
				};

				$.if(node_19, ($$render) => {
					if ($.get(results).summary) $$render(consequent_24);
				});
			}

			$.append($$anchor, fragment_2);
		};

		$.if(node_8, ($$render) => {
			if ($.get(results)) $$render(consequent_25);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		input.disabled = $.get(loading);
		button_1.disabled = $.get(loading);
	});

	$.delegated('change', input, () => clearExampleSelection());
	$.delegated('keydown', input, (e) => e.key === 'Enter' && performTrace());
	$.bind_value(input, () => $.get(domainName), ($$value) => $.set(domainName, $$value));
	$.delegated('click', button_1, performTrace);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'change', 'keydown']);