import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteSet } from 'svelte/reactivity';
import Icon from '$lib/components/global/Icon.svelte';
import { isValidDomainName, formatDNSError } from '$lib/utils/dns-validation.js';
import { axfrContent } from '$lib/content/axfr.js';
import '../../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<button><span class="example-domain"> </span> <span class="example-description"> </span></button>`);
var root_1 = $.from_html(`<!> Testing...`, 1);
var root_2 = $.from_html(`<!> Test AXFR`, 1);
var root_3 = $.from_html(`<div class="alert alert-error svelte-71af8j" role="alert"><!> <div class="svelte-71af8j"><strong class="svelte-71af8j">Error</strong> <p class="svelte-71af8j"> </p></div></div>`);
var root_4 = $.from_html(`<div class="alert alert-warning svelte-71af8j" role="alert"><!> <div class="svelte-71af8j"><strong class="svelte-71af8j">Limited Testing Mode</strong> <p class="svelte-71af8j"> </p></div></div>`);
var root_5 = $.from_html(`<div class="alert alert-error svelte-71af8j" role="alert"><!> <div class="svelte-71af8j"><strong class="svelte-71af8j">Critical Security Vulnerability Detected!</strong> <p class="svelte-71af8j"> <strong class="svelte-71af8j">Immediate action required!</strong></p></div></div>`);
var root_6 = $.from_html(`<div class="alert alert-success svelte-71af8j"><!> <div class="svelte-71af8j"><strong class="svelte-71af8j">All Nameservers Secure</strong> <p class="svelte-71af8j">Zone transfers are properly restricted. No AXFR vulnerabilities detected.</p></div></div>`);
var root_7 = $.from_html(`<p class="truncated-note svelte-71af8j"> </p>`);
var root_8 = $.from_html(`<div class="exposed-records svelte-71af8j"><pre class="svelte-71af8j"> </pre> <!></div>`);
var root_9 = $.from_html(`<button><!> </button> <!>`, 1);
var root_10 = $.from_html(`<div class="vulnerability-details svelte-71af8j"><div class="vulnerability-warning svelte-71af8j"><!> <strong class="svelte-71af8j">Zone transfer succeeded!</strong> </div> <!></div>`);
var root_11 = $.from_html(`<div class="error-details svelte-71af8j"><!> <span> </span></div>`);
var root_12 = $.from_html(`<div class="secure-details svelte-71af8j"><!> <span>Zone transfer properly refused</span></div>`);
var root_13 = $.from_html(`<div><div class="nameserver-header svelte-71af8j"><div class="nameserver-info svelte-71af8j"><!> <div class="svelte-71af8j"><h4 class="svelte-71af8j"> </h4> <span class="nameserver-ip svelte-71af8j"> </span></div></div> <div class="nameserver-status svelte-71af8j"><span class="response-time svelte-71af8j"> </span> <span> </span></div></div> <!></div>`);
var root_14 = $.from_html(`<!> <!> <div class="stats-summary svelte-71af8j"><div class="stat-card svelte-71af8j"><!> <div class="stat-content svelte-71af8j"><span class="stat-label svelte-71af8j">Total Nameservers</span> <span class="stat-value svelte-71af8j"> </span></div></div> <div class="stat-card stat-error svelte-71af8j"><!> <div class="stat-content svelte-71af8j"><span class="stat-label svelte-71af8j">Vulnerable</span> <span class="stat-value svelte-71af8j"> </span></div></div> <div class="stat-card stat-success svelte-71af8j"><!> <div class="stat-content svelte-71af8j"><span class="stat-label svelte-71af8j">Secure</span> <span class="stat-value svelte-71af8j"> </span></div></div> <div class="stat-card stat-warning svelte-71af8j"><!> <div class="stat-content svelte-71af8j"><span class="stat-label svelte-71af8j">Errors</span> <span class="stat-value svelte-71af8j"> </span></div></div></div> <div class="results-section"><h3>Nameserver Test Results</h3> <div class="nameserver-results svelte-71af8j"></div></div> <div class="test-metadata svelte-71af8j"><p class="svelte-71af8j"><strong class="svelte-71af8j">Domain:</strong> <strong class="svelte-71af8j">Tested:</strong> </p></div>`, 1);
var root_15 = $.from_html(`<div><div class="risk-header svelte-71af8j"><h4 class="svelte-71af8j"> </h4> <span> </span></div> <p class="risk-description svelte-71af8j"> </p> <div class="risk-impact svelte-71af8j"><!> <em> </em></div></div>`);
var root_16 = $.from_html(`<div><div class="status-header svelte-71af8j"><!> <h4 class="svelte-71af8j"> </h4></div> <p class="svelte-71af8j"> </p> <div class="status-action svelte-71af8j"><!> <strong class="svelte-71af8j">Action:</strong> </div></div>`);
var root_17 = $.from_html(`<div class="config-section svelte-71af8j"><h4 class="svelte-71af8j"> </h4> <p class="svelte-71af8j"> </p> <pre class="svelte-71af8j"><code class="svelte-71af8j"> </code></pre></div>`);
var root_18 = $.from_html(`<pre class="svelte-71af8j"><code class="svelte-71af8j"> </code></pre>`);
var root_19 = $.from_html(`<div class="remediation-step svelte-71af8j"><div class="step-number svelte-71af8j"> </div> <div class="step-content svelte-71af8j"><h4 class="svelte-71af8j"> </h4> <p class="svelte-71af8j"> </p> <!></div></div>`);
var root_20 = $.from_html(`<div><div class="practice-header svelte-71af8j"><!> <h4 class="svelte-71af8j"> </h4> <span> </span></div> <p class="svelte-71af8j"> </p></div>`);
var root_21 = $.from_html(`<div class="card"><header class="card-header"><h1>DNS Zone Transfer (AXFR) Security Tester</h1> <p>Test if zone transfers are improperly exposed - a critical DNS security vulnerability</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary"><!> <h4>Quick Examples</h4></summary> <div class="examples-grid"></div></details></div> <form class="inline-form svelte-71af8j"><div class="form-group flex-grow svelte-71af8j"><label for="domain" class="svelte-71af8j">Domain Name</label> <input id="domain" type="text" placeholder="example.com" class="svelte-71af8j"/></div> <button type="submit" class="submit-btn svelte-71af8j"><!></button></form> <!> <!></div> <section class="card educational-part svelte-71af8j"><div class="card info-card svelte-71af8j"><h2> </h2> <p> </p></div> <div class="card info-card svelte-71af8j"><h2> </h2> <div class="risks-grid svelte-71af8j"></div></div> <div class="card info-card svelte-71af8j"><h2> </h2> <div class="statuses-list svelte-71af8j"></div></div> <div class="card info-card svelte-71af8j"><h2> </h2> <!></div> <div class="card info-card svelte-71af8j"><h2> </h2> <div class="remediation-steps svelte-71af8j"></div></div> <div class="card info-card svelte-71af8j"><h2> </h2> <div class="practices-list svelte-71af8j"></div></div></section>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let domain = $.state('example.com');
	let loading = $.state(false);
	let results = $.state(null);
	let error = $.state(null);
	let selectedExampleIndex = $.state(null);
	let expandedRecords = new SvelteSet();

	const isInputValid = $.derived(() => () => {
		const trimmed = $.get(domain).trim();

		return trimmed.length > 0 && isValidDomainName(trimmed);
	});

	const examples = [
		{ domain: 'bbc.co.uk', description: '' },
		{ domain: 'zonetransfer.me', description: '' },
		{ domain: 'networkingtoolbox.net', description: '' },
		{ domain: 'amazon.com', description: '' },
		{ domain: 'wikipedia.org', description: '' },
		{ domain: 'github.com', description: '' },
		{ domain: 'gov.uk', description: '' },
		{ domain: 'proton.me', description: '' },
		{ domain: 'loveholidays.com', description: '' }
	];

	async function testAXFR() {
		$.set(loading, true);
		$.set(error, null);
		$.set(results, null);

		const trimmed = $.get(domain).trim();

		if (!trimmed) {
			$.set(error, 'Domain name is required');
			$.set(loading, false);

			return;
		}

		if (!isValidDomainName(trimmed)) {
			$.set(error, 'Invalid domain name format');
			$.set(loading, false);

			return;
		}

		try {
			const response = await fetch('/api/internal/diagnostics/axfr', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ domain: trimmed })
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));

				throw new Error(errorData.message || `AXFR test failed (${response.status})`);
			}

			$.set(results, await response.json(), true);
		} catch(err) {
			$.set(error, formatDNSError(err), true);
		} finally {
			$.set(loading, false);
		}
	}

	function loadExample(example, index) {
		$.set(domain, example.domain, true);
		$.set(selectedExampleIndex, index, true);
		testAXFR();
	}

	function toggleRecords(nameserver) {
		if (expandedRecords.has(nameserver)) {
			expandedRecords.delete(nameserver);
		} else {
			expandedRecords.add(nameserver);
		}
	}

	function getStatusColor(ns) {
		if (ns.vulnerable) return 'error';
		if (ns.error) return 'warning';

		return 'success';
	}

	function getStatusIcon(ns) {
		if (ns.vulnerable) return 'alert-circle';
		if (ns.error) return 'alert-triangle';

		return 'shield-check';
	}

	function getStatusText(ns) {
		if (ns.vulnerable) return 'Vulnerable';
		if (ns.error) return 'Error';

		return 'Secure';
	}

	var fragment = root_21();
	var div = $.first_child(fragment);
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
		var span = $.child(button);
		var text = $.only_child(span, true);
		var span_1 = $.sibling(span, 2);
		var text_1 = $.only_child(span_1, true);

		$.reset(button);

		$.template_effect(() => {
			classes = $.set_class(button, 1, 'example-card', null, classes, { selected: $.get(selectedExampleIndex) === i });
			button.disabled = $.get(loading);
			$.set_text(text, $.get(example).domain);
			$.set_text(text_1, $.get(example).description);
		});

		$.delegated('click', button, () => loadExample($.get(example), i));
		$.append($$anchor, button);
	});

	$.reset(div_2);
	$.reset(details);
	$.reset(div_1);

	var form = $.sibling(div_1, 2);
	var div_3 = $.child(form);
	var input = $.sibling($.child(div_3), 2);

	$.remove_input_defaults(input);
	$.reset(div_3);

	var button_1 = $.sibling(div_3, 2);
	var node_1 = $.child(button_1);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root_1();
			var node_2 = $.first_child(fragment_1);

			Icon(node_2, { name: 'loader', size: 'sm' });
			$.next();
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = root_2();
			var node_3 = $.first_child(fragment_2);

			Icon(node_3, { name: 'search', size: 'sm' });
			$.next();
			$.append($$anchor, fragment_2);
		};

		$.if(node_1, ($$render) => {
			if ($.get(loading)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button_1);
	$.reset(form);

	var node_4 = $.sibling(form, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_4 = root_3();
			var node_5 = $.child(div_4);

			Icon(node_5, { name: 'alert-circle', size: 'sm' });

			var div_5 = $.sibling(node_5, 2);
			var p = $.sibling($.child(div_5), 2);
			var text_2 = $.only_child(p, true);

			$.reset(div_5);
			$.reset(div_4);
			$.template_effect(() => $.set_text(text_2, $.get(error)));
			$.append($$anchor, div_4);
		};

		$.if(node_4, ($$render) => {
			if ($.get(error)) $$render(consequent_1);
		});
	}

	var node_6 = $.sibling(node_4, 2);

	{
		var consequent_10 = ($$anchor) => {
			var fragment_3 = root_14();
			var node_7 = $.first_child(fragment_3);

			{
				var consequent_2 = ($$anchor) => {
					var div_6 = root_4();
					var node_8 = $.child(div_6);

					Icon(node_8, { name: 'alert-triangle', size: 'md' });

					var div_7 = $.sibling(node_8, 2);
					var p_1 = $.sibling($.child(div_7), 2);
					var text_3 = $.only_child(p_1, true);

					$.reset(div_7);
					$.reset(div_6);
					$.template_effect(() => $.set_text(text_3, $.get(results).limitedModeReason));
					$.append($$anchor, div_6);
				};

				$.if(node_7, ($$render) => {
					if ($.get(results).limitedMode) $$render(consequent_2);
				});
			}

			var node_9 = $.sibling(node_7, 2);

			{
				var consequent_3 = ($$anchor) => {
					var div_8 = root_5();
					var node_10 = $.child(div_8);

					Icon(node_10, { name: 'alert-circle', size: 'md' });

					var div_9 = $.sibling(node_10, 2);
					var p_2 = $.sibling($.child(div_9), 2);
					var text_4 = $.child(p_2);

					$.next();
					$.reset(p_2);
					$.reset(div_9);
					$.reset(div_8);

					$.template_effect(() => $.set_text(text_4, `${$.get(results).summary.vulnerable ?? ''} nameserver${$.get(results).summary.vulnerable > 1 ? 's' : ''} allowed unrestricted zone
            transfer. Your entire DNS zone is exposed to anyone. `));

					$.append($$anchor, div_8);
				};

				var consequent_4 = ($$anchor) => {
					var div_10 = root_6();
					var node_11 = $.child(div_10);

					Icon(node_11, { name: 'shield-check', size: 'md' });
					$.next(2);
					$.reset(div_10);
					$.append($$anchor, div_10);
				};

				$.if(node_9, ($$render) => {
					if ($.get(results).summary.vulnerable > 0) $$render(consequent_3); else if ($.get(results).summary.secure > 0) $$render(consequent_4, 1);
				});
			}

			var div_11 = $.sibling(node_9, 2);
			var div_12 = $.child(div_11);
			var node_12 = $.child(div_12);

			Icon(node_12, { name: 'server', size: 'md' });

			var div_13 = $.sibling(node_12, 2);
			var span_2 = $.sibling($.child(div_13), 2);
			var text_5 = $.only_child(span_2, true);

			$.reset(div_13);
			$.reset(div_12);

			var div_14 = $.sibling(div_12, 2);
			var node_13 = $.child(div_14);

			Icon(node_13, { name: 'alert-circle', size: 'md' });

			var div_15 = $.sibling(node_13, 2);
			var span_3 = $.sibling($.child(div_15), 2);
			var text_6 = $.only_child(span_3, true);

			$.reset(div_15);
			$.reset(div_14);

			var div_16 = $.sibling(div_14, 2);
			var node_14 = $.child(div_16);

			Icon(node_14, { name: 'shield-check', size: 'md' });

			var div_17 = $.sibling(node_14, 2);
			var span_4 = $.sibling($.child(div_17), 2);
			var text_7 = $.only_child(span_4, true);

			$.reset(div_17);
			$.reset(div_16);

			var div_18 = $.sibling(div_16, 2);
			var node_15 = $.child(div_18);

			Icon(node_15, { name: 'alert-triangle', size: 'md' });

			var div_19 = $.sibling(node_15, 2);
			var span_5 = $.sibling($.child(div_19), 2);
			var text_8 = $.only_child(span_5, true);

			$.reset(div_19);
			$.reset(div_18);
			$.reset(div_11);

			var div_20 = $.sibling(div_11, 2);
			var div_21 = $.sibling($.child(div_20), 2);

			$.each(div_21, 21, () => $.get(results).nameservers, (ns) => ns.nameserver, ($$anchor, ns) => {
				var div_22 = root_13();
				var div_23 = $.child(div_22);
				var div_24 = $.child(div_23);
				var node_16 = $.child(div_24);

				{
					let $0 = $.derived(() => getStatusIcon($.get(ns)));

					Icon(node_16, {
						get name() {
							return $.get($0);
						},
						size: 'md'
					});
				}

				var div_25 = $.sibling(node_16, 2);
				var h4 = $.child(div_25);
				var text_9 = $.only_child(h4, true);
				var span_6 = $.sibling(h4, 2);
				var text_10 = $.only_child(span_6, true);

				$.reset(div_25);
				$.reset(div_24);

				var div_26 = $.sibling(div_24, 2);
				var span_7 = $.child(div_26);
				var text_11 = $.only_child(span_7);
				var span_8 = $.sibling(span_7, 2);
				var text_12 = $.only_child(span_8, true);

				$.reset(div_26);
				$.reset(div_23);

				var node_17 = $.sibling(div_23, 2);

				{
					var consequent_8 = ($$anchor) => {
						var div_27 = root_10();
						var div_28 = $.child(div_27);
						var node_18 = $.child(div_28);

						Icon(node_18, { name: 'alert-circle', size: 'sm' });

						var text_13 = $.sibling(node_18, 3);

						$.reset(div_28);

						var node_19 = $.sibling(div_28, 2);

						{
							var consequent_7 = ($$anchor) => {
								var fragment_4 = root_9();
								var button_2 = $.first_child(fragment_4);
								let classes_1;
								var node_20 = $.child(button_2);

								Icon(node_20, { name: 'chevron-right', size: 'xs' });

								var text_14 = $.sibling(node_20);

								$.reset(button_2);

								var node_21 = $.sibling(button_2, 2);

								{
									var consequent_6 = ($$anchor) => {
										var div_29 = root_8();
										var pre = $.child(div_29);
										var text_15 = $.only_child(pre, true);
										var node_22 = $.sibling(pre, 2);

										{
											var consequent_5 = ($$anchor) => {
												var p_3 = root_7();
												var text_16 = $.only_child(p_3);

												$.template_effect(() => $.set_text(text_16, `Showing first ${$.get(ns).records.length ?? ''} of ${$.get(ns).recordCount ?? ''} total records`));
												$.append($$anchor, p_3);
											};

											$.if(node_22, ($$render) => {
												if ($.get(ns).recordCount > $.get(ns).records.length) $$render(consequent_5);
											});
										}

										$.reset(div_29);
										$.template_effect(($0) => $.set_text(text_15, $0), [() => $.get(ns).records.join('\n')]);
										$.append($$anchor, div_29);
									};

									var d = $.derived(() => expandedRecords.has($.get(ns).nameserver));

									$.if(node_21, ($$render) => {
										if ($.get(d)) $$render(consequent_6);
									});
								}

								$.template_effect(
									($0, $1) => {
										classes_1 = $.set_class(button_2, 1, 'toggle-records-btn svelte-71af8j', null, classes_1, { expanded: $0 });
										$.set_text(text_14, ` ${$1 ?? ''} exposed records (${$.get(ns).records.length ?? ''} of ${$.get(ns).recordCount ?? ''})`);
									},
									[
										() => expandedRecords.has($.get(ns).nameserver),
										() => expandedRecords.has($.get(ns).nameserver) ? 'Hide' : 'Show'
									]
								);

								$.delegated('click', button_2, () => toggleRecords($.get(ns).nameserver));
								$.append($$anchor, fragment_4);
							};

							$.if(node_19, ($$render) => {
								if ($.get(ns).records && $.get(ns).records.length > 0) $$render(consequent_7);
							});
						}

						$.reset(div_27);
						$.template_effect(() => $.set_text(text_13, ` Exposed ${$.get(ns).recordCount ?? ''} DNS records`));
						$.append($$anchor, div_27);
					};

					var consequent_9 = ($$anchor) => {
						var div_30 = root_11();
						var node_23 = $.child(div_30);

						Icon(node_23, { name: 'info-circle', size: 'xs' });

						var span_9 = $.sibling(node_23, 2);
						var text_17 = $.only_child(span_9, true);

						$.reset(div_30);
						$.template_effect(() => $.set_text(text_17, $.get(ns).error));
						$.append($$anchor, div_30);
					};

					var alternate_1 = ($$anchor) => {
						var div_31 = root_12();
						var node_24 = $.child(div_31);

						Icon(node_24, { name: 'check-circle', size: 'xs' });
						$.next(2);
						$.reset(div_31);
						$.append($$anchor, div_31);
					};

					$.if(node_17, ($$render) => {
						if ($.get(ns).vulnerable && $.get(ns).recordCount) $$render(consequent_8); else if ($.get(ns).error) $$render(consequent_9, 1); else $$render(alternate_1, -1);
					});
				}

				$.reset(div_22);

				$.template_effect(
					($0, $1, $2) => {
						$.set_class(div_22, 1, `nameserver-card status-${$0 ?? ''}`, 'svelte-71af8j');
						$.set_text(text_9, $.get(ns).nameserver);
						$.set_text(text_10, $.get(ns).ip);
						$.set_text(text_11, `${$.get(ns).responseTime ?? ''}ms`);
						$.set_class(span_8, 1, `status-badge status-${$1 ?? ''}`, 'svelte-71af8j');
						$.set_text(text_12, $2);
					},
					[
						() => getStatusColor($.get(ns)),
						() => getStatusColor($.get(ns)),
						() => getStatusText($.get(ns))
					]
				);

				$.append($$anchor, div_22);
			});

			$.reset(div_21);
			$.reset(div_20);

			var div_32 = $.sibling(div_20, 2);
			var p_4 = $.child(div_32);
			var text_18 = $.sibling($.child(p_4));
			var text_19 = $.sibling(text_18, 2);

			$.reset(p_4);
			$.reset(div_32);

			$.template_effect(
				($0) => {
					$.set_text(text_5, $.get(results).summary.total);
					$.set_text(text_6, $.get(results).summary.vulnerable);
					$.set_text(text_7, $.get(results).summary.secure);
					$.set_text(text_8, $.get(results).summary.errors);
					$.set_text(text_18, ` ${$.get(results).domain ?? ''} • `);
					$.set_text(text_19, ` ${$0 ?? ''}`);
				},
				[() => new Date($.get(results).timestamp).toLocaleString()]
			);

			$.append($$anchor, fragment_3);
		};

		$.if(node_6, ($$render) => {
			if ($.get(results)) $$render(consequent_10);
		});
	}

	$.reset(div);

	var section = $.sibling(div, 2);
	var div_33 = $.child(section);
	var h2 = $.child(div_33);
	var text_20 = $.only_child(h2, true);
	var p_5 = $.sibling(h2, 2);
	var text_21 = $.only_child(p_5, true);

	$.reset(div_33);

	var div_34 = $.sibling(div_33, 2);
	var h2_1 = $.child(div_34);
	var text_22 = $.only_child(h2_1, true);
	var div_35 = $.sibling(h2_1, 2);

	$.each(div_35, 21, () => axfrContent.sections.security.risks, (risk) => risk.risk, ($$anchor, risk) => {
		var div_36 = root_15();
		var div_37 = $.child(div_36);
		var h4_1 = $.child(div_37);
		var text_23 = $.only_child(h4_1, true);
		var span_10 = $.sibling(h4_1, 2);
		var text_24 = $.only_child(span_10, true);

		$.reset(div_37);

		var p_6 = $.sibling(div_37, 2);
		var text_25 = $.only_child(p_6, true);
		var div_38 = $.sibling(p_6, 2);
		var node_25 = $.child(div_38);

		Icon(node_25, { name: 'info-circle', size: 'xs' });

		var em = $.sibling(node_25, 2);
		var text_26 = $.only_child(em, true);

		$.reset(div_38);
		$.reset(div_36);

		$.template_effect(
			($0, $1) => {
				$.set_class(div_36, 1, `risk-card severity-${$0 ?? ''}`, 'svelte-71af8j');
				$.set_text(text_23, $.get(risk).risk);
				$.set_class(span_10, 1, `severity-badge severity-${$1 ?? ''}`, 'svelte-71af8j');
				$.set_text(text_24, $.get(risk).severity);
				$.set_text(text_25, $.get(risk).description);
				$.set_text(text_26, $.get(risk).impact);
			},
			[
				() => $.get(risk).severity.toLowerCase(),
				() => $.get(risk).severity.toLowerCase()
			]
		);

		$.append($$anchor, div_36);
	});

	$.reset(div_35);
	$.reset(div_34);

	var div_39 = $.sibling(div_34, 2);
	var h2_2 = $.child(div_39);
	var text_27 = $.only_child(h2_2, true);
	var div_40 = $.sibling(h2_2, 2);

	$.each(div_40, 21, () => axfrContent.sections.interpretation.statuses, (status) => status.status, ($$anchor, status) => {
		var div_41 = root_16();
		var div_42 = $.child(div_41);
		var node_26 = $.child(div_42);

		{
			let $0 = $.derived(() => $.get(status).status === 'Vulnerable'
				? 'alert-circle'
				: $.get(status).status === 'Secure' ? 'shield-check' : 'alert-triangle');

			Icon(node_26, {
				get name() {
					return $.get($0);
				},
				size: 'sm'
			});
		}

		var h4_2 = $.sibling(node_26, 2);
		var text_28 = $.only_child(h4_2);

		$.reset(div_42);

		var p_7 = $.sibling(div_42, 2);
		var text_29 = $.only_child(p_7, true);
		var div_43 = $.sibling(p_7, 2);
		var node_27 = $.child(div_43);

		Icon(node_27, { name: 'arrow-right', size: 'xs' });

		var text_30 = $.sibling(node_27, 3);

		$.reset(div_43);
		$.reset(div_41);

		$.template_effect(() => {
			$.set_class(div_41, 1, `status-explanation status-${$.get(status).color ?? ''}`, 'svelte-71af8j');
			$.set_text(text_28, `${$.get(status).status ?? ''}: ${$.get(status).meaning ?? ''}`);
			$.set_text(text_29, $.get(status).description);
			$.set_text(text_30, ` ${$.get(status).action ?? ''}`);
		});

		$.append($$anchor, div_41);
	});

	$.reset(div_40);
	$.reset(div_39);

	var div_44 = $.sibling(div_39, 2);
	var h2_3 = $.child(div_44);
	var text_31 = $.only_child(h2_3, true);
	var node_28 = $.sibling(h2_3, 2);

	$.each(node_28, 17, () => axfrContent.sections.properConfiguration.configurations, (config) => config.server, ($$anchor, config) => {
		var div_45 = root_17();
		var h4_3 = $.child(div_45);
		var text_32 = $.only_child(h4_3, true);
		var p_8 = $.sibling(h4_3, 2);
		var text_33 = $.only_child(p_8, true);
		var pre_1 = $.sibling(p_8, 2);
		var code = $.child(pre_1);
		var text_34 = $.only_child(code, true);

		$.reset(pre_1);
		$.reset(div_45);

		$.template_effect(() => {
			$.set_text(text_32, $.get(config).server);
			$.set_text(text_33, $.get(config).description);
			$.set_text(text_34, $.get(config).syntax);
		});

		$.append($$anchor, div_45);
	});

	$.reset(div_44);

	var div_46 = $.sibling(div_44, 2);
	var h2_4 = $.child(div_46);
	var text_35 = $.only_child(h2_4, true);
	var div_47 = $.sibling(h2_4, 2);

	$.each(div_47, 23, () => axfrContent.sections.remediation.steps, (step) => step.step, ($$anchor, step, i) => {
		var div_48 = root_19();
		var div_49 = $.child(div_48);
		var text_36 = $.only_child(div_49, true);
		var div_50 = $.sibling(div_49, 2);
		var h4_4 = $.child(div_50);
		var text_37 = $.only_child(h4_4, true);
		var p_9 = $.sibling(h4_4, 2);
		var text_38 = $.only_child(p_9, true);
		var node_29 = $.sibling(p_9, 2);

		{
			var consequent_11 = ($$anchor) => {
				var pre_2 = root_18();
				var code_1 = $.child(pre_2);
				var text_39 = $.only_child(code_1, true);

				$.reset(pre_2);
				$.template_effect(() => $.set_text(text_39, $.get(step).command));
				$.append($$anchor, pre_2);
			};

			$.if(node_29, ($$render) => {
				if ($.get(step).command) $$render(consequent_11);
			});
		}

		$.reset(div_50);
		$.reset(div_48);

		$.template_effect(() => {
			$.set_text(text_36, $.get(i) + 1);
			$.set_text(text_37, $.get(step).step);
			$.set_text(text_38, $.get(step).details);
		});

		$.append($$anchor, div_48);
	});

	$.reset(div_47);
	$.reset(div_46);

	var div_51 = $.sibling(div_46, 2);
	var h2_5 = $.child(div_51);
	var text_40 = $.only_child(h2_5, true);
	var div_52 = $.sibling(h2_5, 2);

	$.each(div_52, 21, () => axfrContent.sections.bestPractices.practices, (practice) => practice.practice, ($$anchor, practice) => {
		var div_53 = root_20();
		var div_54 = $.child(div_53);
		var node_30 = $.child(div_54);

		Icon(node_30, { name: 'check-circle', size: 'sm' });

		var h4_5 = $.sibling(node_30, 2);
		var text_41 = $.only_child(h4_5, true);
		var span_11 = $.sibling(h4_5, 2);
		var text_42 = $.only_child(span_11, true);

		$.reset(div_54);

		var p_10 = $.sibling(div_54, 2);
		var text_43 = $.only_child(p_10, true);

		$.reset(div_53);

		$.template_effect(
			($0, $1) => {
				$.set_class(div_53, 1, `practice-item priority-${$0 ?? ''}`, 'svelte-71af8j');
				$.set_text(text_41, $.get(practice).practice);
				$.set_class(span_11, 1, `priority-badge priority-${$1 ?? ''}`, 'svelte-71af8j');
				$.set_text(text_42, $.get(practice).priority);
				$.set_text(text_43, $.get(practice).description);
			},
			[
				() => $.get(practice).priority.toLowerCase(),
				() => $.get(practice).priority.toLowerCase()
			]
		);

		$.append($$anchor, div_53);
	});

	$.reset(div_52);
	$.reset(div_51);
	$.reset(section);

	$.template_effect(() => {
		input.disabled = $.get(loading);
		$.set_attribute(input, 'aria-invalid', !$.get(isInputValid));
		button_1.disabled = $.get(loading) || !$.get(isInputValid);
		$.set_text(text_20, axfrContent.sections.whatIsAXFR.title);
		$.set_text(text_21, axfrContent.sections.whatIsAXFR.content);
		$.set_text(text_22, axfrContent.sections.security.title);
		$.set_text(text_27, axfrContent.sections.interpretation.title);
		$.set_text(text_31, axfrContent.sections.properConfiguration.title);
		$.set_text(text_35, axfrContent.sections.remediation.title);
		$.set_text(text_40, axfrContent.sections.bestPractices.title);
	});

	$.event('submit', form, (e) => {
		e.preventDefault();
		testAXFR();
	});

	$.delegated('input', input, () => {
		$.set(selectedExampleIndex, null);
	});

	$.bind_value(input, () => $.get(domain), ($$value) => $.set(domain, $$value));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'input']);