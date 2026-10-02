import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import '../../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<button><h5> </h5> <p> </p></button>`);
var root_1 = $.from_html(`<!> Checking...`, 1);
var root_2 = $.from_html(`<!> Check Glue`, 1);
var root_3 = $.from_html(`<div class="card error-card"><div class="card-content"><div class="error-content"><!> <div><strong>Glue Check Failed</strong> <p> </p></div></div></div></div>`);
var root_4 = $.from_html(`<div class="card"><div class="card-content"><div class="loading-state"><!> <div class="loading-text"><h3>Checking Glue Records</h3> <p>Analyzing nameservers and checking for required glue records...</p></div></div></div></div>`);
var root_5 = $.from_html(`<p class="parent-zone svelte-1ib8npq"> </p>`);
var root_6 = $.from_html(`<span class="glue-badge glue-required svelte-1ib8npq"><!> Glue Required</span>`);
var root_7 = $.from_html(`<span class="glue-badge external svelte-1ib8npq"><!> External</span>`);
var root_8 = $.from_html(`<span class="ip-address ipv4 svelte-1ib8npq"><!> </span>`);
var root_9 = $.from_html(`<div class="record-list svelte-1ib8npq"></div>`);
var root_10 = $.from_html(`<div class="missing-records svelte-1ib8npq"><!> <span class="missing svelte-1ib8npq">No A records found</span></div>`);
var root_11 = $.from_html(`<span class="ip-address ipv6 svelte-1ib8npq"><!> </span>`);
var root_12 = $.from_html(`<div class="missing-records svelte-1ib8npq"><!> <span class="missing svelte-1ib8npq">No AAAA records found</span></div>`);
var root_13 = $.from_html(`<div class="glue-records svelte-1ib8npq"><div class="record-group svelte-1ib8npq"><div class="record-header svelte-1ib8npq"><!> <span class="record-label svelte-1ib8npq">A Records</span></div> <!></div> <div class="record-group svelte-1ib8npq"><div class="record-header svelte-1ib8npq"><!> <span class="record-label svelte-1ib8npq">AAAA Records</span></div> <!></div></div>`);
var root_14 = $.from_html(`<div class="external-ns-info svelte-1ib8npq"><!> <div><p class="external-ns svelte-1ib8npq">External nameserver</p> <span class="external-explanation svelte-1ib8npq">No glue records required as this nameserver is outside the zone</span></div></div>`);
var root_15 = $.from_html(`<!> <span>Critical: No glue records found</span>`, 1);
var root_16 = $.from_html(`<!> <span>Warning: Incomplete glue records</span>`, 1);
var root_17 = $.from_html(`<!> <span>Healthy: All glue records present</span>`, 1);
var root_18 = $.from_html(`<div class="ns-status-footer svelte-1ib8npq"><div><!></div></div>`);
var root_19 = $.from_html(`<div><div class="ns-header svelte-1ib8npq"><div class="ns-title svelte-1ib8npq"><!> <span class="ns-name svelte-1ib8npq"> </span></div> <div class="ns-badges svelte-1ib8npq"><!></div></div> <div class="ns-details svelte-1ib8npq"><!></div> <!></div>`);
var root_20 = $.from_html(`<li class="issue-item"><!> </li>`);
var root_21 = $.from_html(`<div class="card"><div class="card-header"><h3>Issues Found</h3></div> <div class="card-content"><div class="issues-section"><ul class="issues-list"></ul></div></div></div>`);
var root_22 = $.from_html(`<div class="card"><div class="card-header"><h3>Glue Check Summary</h3></div> <div class="card-content"><div class="stats-grid"><div class="stat-card"><div class="stat-label">Total Nameservers</div> <div class="stat-value"> </div></div> <div class="stat-card"><div class="stat-label">Requiring Glue</div> <div class="stat-value"> </div></div> <div class="stat-card"><div class="stat-label">With Valid Glue</div> <div><!> </div></div> <div class="stat-card"><div class="stat-label">Missing Glue</div> <div><!> </div></div></div></div></div> <!>`, 1);
var root_23 = $.from_html(`<div class="card results-card"><div class="card-header"><h3>Glue Check Results</h3></div> <div class="card-content"><div class="results-section"><div class="zone-info svelte-1ib8npq"><h2 class="svelte-1ib8npq"> </h2> <!></div> <div class="nameservers-section"><div class="section-header svelte-1ib8npq"><!> <h3 class="svelte-1ib8npq">Nameservers Analysis</h3></div> <div class="nameserver-grid svelte-1ib8npq"></div></div></div></div></div> <!>`, 1);
var root_24 = $.from_html(`<div class="card"><header class="card-header"><h1>DNS Glue Check Tool</h1> <p>Check which NS names require glue records and whether A/AAAA records exist</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary"><!> <h4>Quick Examples</h4></summary> <div class="examples-grid"></div></details></div> <div class="card input-card"><div class="card-header"><h3>Glue Check Configuration</h3></div> <div class="card-content"><div class="form-group"><label for="zone">Zone Name</label> <div class="input-flex-container"><input id="zone" type="text" placeholder="example.com"/> <button class="primary"><!></button></div></div></div></div> <!> <!> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let zoneName = $.state('example.com');
	let loading = $.state(false);
	let results = $.state(null);
	let error = $.state(null);
	let selectedExampleIndex = $.state(null);

	const examples = [
		{
			zone: 'cloudflare.com',
			description: 'Multiple NS with full IPv4+IPv6 glue records'
		},

		{
			zone: 'yahoo.com',
			description: 'Mixed glue status with warning (missing IPv6 on one NS)'
		},

		{
			zone: 'bbc.co.uk',
			description: 'Mixed delegation: internal and external nameservers'
		},

		{
			zone: 'github.com',
			description: 'All external nameservers (NSOne + AWS Route53)'
		},

		{
			zone: 'twitch.tv',
			description: 'Different TLD (.tv) with external AWS nameservers'
		},

		{
			zone: 'apple.com',
			description: 'Clean 4-nameserver setup with complete glue records'
		}
	];

	async function checkGlue() {
		if (!$.get(zoneName)?.trim()) {
			$.set(error, 'Please enter a zone name');

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
					action: 'glue-check',
					zone: $.get(zoneName).trim().toLowerCase()
				})
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Failed to check glue records');
			}

			$.set(results, data, true);
		} catch(err) {
			$.set(error, err instanceof Error ? err.message : 'An error occurred', true);
		} finally {
			$.set(loading, false);
		}
	}

	function loadExample(example, index) {
		$.set(zoneName, example.zone, true);
		$.set(selectedExampleIndex, index, true);
		checkGlue();
	}

	function clearExampleSelection() {
		$.set(selectedExampleIndex, null);
	}

	var div = root_24();
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
		$.action(button, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => `Check glue records for ${$.get(example).zone} zone`);

		$.template_effect(() => {
			classes = $.set_class(button, 1, 'example-card', null, classes, { selected: $.get(selectedExampleIndex) === i });
			$.set_text(text, $.get(example).zone);
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
		var consequent_13 = ($$anchor) => {
			var fragment_2 = root_23();
			var div_14 = $.first_child(fragment_2);
			var div_15 = $.sibling($.child(div_14), 2);
			var div_16 = $.child(div_15);
			var div_17 = $.child(div_16);
			var h2 = $.child(div_17);
			var text_3 = $.only_child(h2);
			var node_9 = $.sibling(h2, 2);

			{
				var consequent_3 = ($$anchor) => {
					var p_2 = root_5();
					var text_4 = $.only_child(p_2);

					$.template_effect(() => $.set_text(text_4, `Parent Zone: ${$.get(results).parent ?? ''}`));
					$.append($$anchor, p_2);
				};

				$.if(node_9, ($$render) => {
					if ($.get(results).parent) $$render(consequent_3);
				});
			}

			$.reset(div_17);

			var div_18 = $.sibling(div_17, 2);
			var div_19 = $.child(div_18);
			var node_10 = $.child(div_19);

			Icon(node_10, { name: 'server', size: 'md' });
			$.next(2);
			$.reset(div_19);

			var div_20 = $.sibling(div_19, 2);

			$.each(div_20, 21, () => $.get(results).nameservers, (ns) => ns.name, ($$anchor, ns) => {
				var div_21 = root_19();
				let classes_1;
				var div_22 = $.child(div_21);
				var div_23 = $.child(div_22);
				var node_11 = $.child(div_23);

				Icon(node_11, { name: 'dns', size: 'sm' });

				var span = $.sibling(node_11, 2);
				var text_5 = $.only_child(span, true);

				$.reset(div_23);

				var div_24 = $.sibling(div_23, 2);
				var node_12 = $.child(div_24);

				{
					var consequent_4 = ($$anchor) => {
						var span_1 = root_6();
						var node_13 = $.child(span_1);

						Icon(node_13, { name: 'link', size: 'xs' });
						$.next();
						$.reset(span_1);
						$.action(span_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'This nameserver requires glue records');
						$.append($$anchor, span_1);
					};

					var alternate_1 = ($$anchor) => {
						var span_2 = root_7();
						var node_14 = $.child(span_2);

						Icon(node_14, { name: 'external-link', size: 'xs' });
						$.next();
						$.reset(span_2);
						$.action(span_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'External nameserver - no glue needed');
						$.append($$anchor, span_2);
					};

					$.if(node_12, ($$render) => {
						if ($.get(ns).requiresGlue) $$render(consequent_4); else $$render(alternate_1, -1);
					});
				}

				$.reset(div_24);
				$.reset(div_22);

				var div_25 = $.sibling(div_22, 2);
				var node_15 = $.child(div_25);

				{
					var consequent_7 = ($$anchor) => {
						var div_26 = root_13();
						var div_27 = $.child(div_26);
						var div_28 = $.child(div_27);
						var node_16 = $.child(div_28);

						Icon(node_16, { name: 'globe', size: 'xs' });

						var span_3 = $.sibling(node_16, 2);

						$.action(span_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'IPv4 addresses for this nameserver');
						$.reset(div_28);

						var node_17 = $.sibling(div_28, 2);

						{
							var consequent_5 = ($$anchor) => {
								var div_29 = root_9();

								$.each(div_29, 20, () => $.get(ns).glue.a, (ip) => ip, ($$anchor, ip) => {
									var span_4 = root_8();
									var node_18 = $.child(span_4);

									Icon(node_18, { name: 'globe', size: 'xs' });

									var text_6 = $.sibling(node_18);

									$.reset(span_4);
									$.action(span_4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'IPv4 address: ' + ip);
									$.template_effect(() => $.set_text(text_6, ` ${ip ?? ''}`));
									$.append($$anchor, span_4);
								});

								$.reset(div_29);
								$.append($$anchor, div_29);
							};

							var alternate_2 = ($$anchor) => {
								var div_30 = root_10();
								var node_19 = $.child(div_30);

								Icon(node_19, { name: 'x-circle', size: 'xs' });

								var span_5 = $.sibling(node_19, 2);

								$.action(span_5, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'No IPv4 glue records found');
								$.reset(div_30);
								$.append($$anchor, div_30);
							};

							$.if(node_17, ($$render) => {
								if ($.get(ns).glue.a && $.get(ns).glue.a.length > 0) $$render(consequent_5); else $$render(alternate_2, -1);
							});
						}

						$.reset(div_27);

						var div_31 = $.sibling(div_27, 2);
						var div_32 = $.child(div_31);
						var node_20 = $.child(div_32);

						Icon(node_20, { name: 'globe', size: 'xs' });

						var span_6 = $.sibling(node_20, 2);

						$.action(span_6, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'IPv6 addresses for this nameserver');
						$.reset(div_32);

						var node_21 = $.sibling(div_32, 2);

						{
							var consequent_6 = ($$anchor) => {
								var div_33 = root_9();

								$.each(div_33, 20, () => $.get(ns).glue.aaaa, (ip) => ip, ($$anchor, ip) => {
									var span_7 = root_11();
									var node_22 = $.child(span_7);

									Icon(node_22, { name: 'globe', size: 'xs' });

									var text_7 = $.sibling(node_22);

									$.reset(span_7);
									$.action(span_7, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'IPv6 address: ' + ip);
									$.template_effect(() => $.set_text(text_7, ` ${ip ?? ''}`));
									$.append($$anchor, span_7);
								});

								$.reset(div_33);
								$.append($$anchor, div_33);
							};

							var alternate_3 = ($$anchor) => {
								var div_34 = root_12();
								var node_23 = $.child(div_34);

								Icon(node_23, { name: 'x-circle', size: 'xs' });

								var span_8 = $.sibling(node_23, 2);

								$.action(span_8, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'No IPv6 glue records found');
								$.reset(div_34);
								$.append($$anchor, div_34);
							};

							$.if(node_21, ($$render) => {
								if ($.get(ns).glue.aaaa && $.get(ns).glue.aaaa.length > 0) $$render(consequent_6); else $$render(alternate_3, -1);
							});
						}

						$.reset(div_31);
						$.reset(div_26);
						$.append($$anchor, div_26);
					};

					var alternate_4 = ($$anchor) => {
						var div_35 = root_14();
						var node_24 = $.child(div_35);

						Icon(node_24, { name: 'info', size: 'sm' });
						$.next(2);
						$.reset(div_35);
						$.append($$anchor, div_35);
					};

					$.if(node_15, ($$render) => {
						if ($.get(ns).requiresGlue) $$render(consequent_7); else $$render(alternate_4, -1);
					});
				}

				$.reset(div_25);

				var node_25 = $.sibling(div_25, 2);

				{
					var consequent_10 = ($$anchor) => {
						var div_36 = root_18();
						var div_37 = $.child(div_36);
						let classes_2;
						var node_26 = $.child(div_37);

						{
							var consequent_8 = ($$anchor) => {
								var fragment_3 = root_15();
								var node_27 = $.first_child(fragment_3);

								Icon(node_27, { name: 'alert-circle', size: 'sm' });
								$.next(2);
								$.append($$anchor, fragment_3);
							};

							var consequent_9 = ($$anchor) => {
								var fragment_4 = root_16();
								var node_28 = $.first_child(fragment_4);

								Icon(node_28, { name: 'alert-triangle', size: 'sm' });
								$.next(2);
								$.append($$anchor, fragment_4);
							};

							var alternate_5 = ($$anchor) => {
								var fragment_5 = root_17();
								var node_29 = $.first_child(fragment_5);

								Icon(node_29, { name: 'check-circle', size: 'sm' });
								$.next(2);
								$.append($$anchor, fragment_5);
							};

							$.if(node_26, ($$render) => {
								if ($.get(ns).status === 'error') $$render(consequent_8); else if ($.get(ns).status === 'warning') $$render(consequent_9, 1); else $$render(alternate_5, -1);
							});
						}

						$.reset(div_37);
						$.reset(div_36);

						$.template_effect(() => classes_2 = $.set_class(div_37, 1, 'status-indicator svelte-1ib8npq', null, classes_2, {
							error: $.get(ns).status === 'error',
							warning: $.get(ns).status === 'warning',
							success: $.get(ns).status === 'ok'
						}));

						$.append($$anchor, div_36);
					};

					$.if(node_25, ($$render) => {
						if ($.get(ns).status) $$render(consequent_10);
					});
				}

				$.reset(div_21);

				$.template_effect(() => {
					classes_1 = $.set_class(div_21, 1, 'nameserver-card svelte-1ib8npq', null, classes_1, {
						'requires-glue': $.get(ns).requiresGlue,
						'has-issues': $.get(ns).status === 'error' || $.get(ns).status === 'warning'
					});

					$.set_text(text_5, $.get(ns).name);
				});

				$.append($$anchor, div_21);
			});

			$.reset(div_20);
			$.reset(div_18);
			$.reset(div_16);
			$.reset(div_15);
			$.reset(div_14);

			var node_30 = $.sibling(div_14, 2);

			{
				var consequent_12 = ($$anchor) => {
					var fragment_6 = root_22();
					var div_38 = $.first_child(fragment_6);
					var div_39 = $.sibling($.child(div_38), 2);
					var div_40 = $.child(div_39);
					var div_41 = $.child(div_40);
					var div_42 = $.child(div_41);

					$.action(div_42, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Total number of nameservers for this zone');

					var div_43 = $.sibling(div_42, 2);
					var text_8 = $.only_child(div_43, true);

					$.reset(div_41);

					var div_44 = $.sibling(div_41, 2);
					var div_45 = $.child(div_44);

					$.action(div_45, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Nameservers that need glue records because they are in the same zone');

					var div_46 = $.sibling(div_45, 2);
					var text_9 = $.only_child(div_46, true);

					$.reset(div_44);

					var div_47 = $.sibling(div_44, 2);
					var div_48 = $.child(div_47);

					$.action(div_48, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Nameservers that have complete glue records (A and/or AAAA)');

					var div_49 = $.sibling(div_48, 2);
					let classes_3;
					var node_31 = $.child(div_49);

					{
						let $0 = $.derived(() => $.get(results).summary.withValidGlue === $.get(results).summary.requiringGlue
							? 'check-circle'
							: $.get(results).summary.withValidGlue > 0 ? 'alert-triangle' : 'x-circle');

						Icon(node_31, {
							get name() {
								return $.get($0);
							},
							size: 'sm'
						});
					}

					var text_10 = $.sibling(node_31);

					$.reset(div_49);
					$.reset(div_47);

					var div_50 = $.sibling(div_47, 2);
					var div_51 = $.child(div_50);

					$.action(div_51, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Nameservers that require glue but are missing necessary records');

					var div_52 = $.sibling(div_51, 2);
					let classes_4;
					var node_32 = $.child(div_52);

					{
						let $0 = $.derived(() => $.get(results).summary.missingGlue > 0 ? 'alert-circle' : 'check-circle');

						Icon(node_32, {
							get name() {
								return $.get($0);
							},
							size: 'sm'
						});
					}

					var text_11 = $.sibling(node_32);

					$.reset(div_52);
					$.reset(div_50);
					$.reset(div_40);
					$.reset(div_39);
					$.reset(div_38);

					var node_33 = $.sibling(div_38, 2);

					{
						var consequent_11 = ($$anchor) => {
							var div_53 = root_21();
							var div_54 = $.sibling($.child(div_53), 2);
							var div_55 = $.child(div_54);
							var ul = $.child(div_55);

							$.each(ul, 20, () => $.get(results).summary.issues, (issue) => issue, ($$anchor, issue) => {
								var li = root_20();
								var node_34 = $.child(li);

								Icon(node_34, { name: 'alert-circle' });

								var text_12 = $.sibling(node_34);

								$.reset(li);
								$.template_effect(() => $.set_text(text_12, ` ${issue ?? ''}`));
								$.append($$anchor, li);
							});

							$.reset(ul);
							$.reset(div_55);
							$.reset(div_54);
							$.reset(div_53);
							$.append($$anchor, div_53);
						};

						$.if(node_33, ($$render) => {
							if ($.get(results).summary.issues && $.get(results).summary.issues.length > 0) $$render(consequent_11);
						});
					}

					$.template_effect(() => {
						$.set_text(text_8, $.get(results).summary.total);
						$.set_text(text_9, $.get(results).summary.requiringGlue);

						classes_3 = $.set_class(div_49, 1, 'stat-value', null, classes_3, {
							success: $.get(results).summary.withValidGlue === $.get(results).summary.requiringGlue,
							warning: $.get(results).summary.withValidGlue > 0 && $.get(results).summary.withValidGlue < $.get(results).summary.requiringGlue
						});

						$.set_text(text_10, ` ${$.get(results).summary.withValidGlue ?? ''}`);
						classes_4 = $.set_class(div_52, 1, 'stat-value', null, classes_4, { error: $.get(results).summary.missingGlue > 0 });
						$.set_text(text_11, ` ${$.get(results).summary.missingGlue ?? ''}`);
					});

					$.append($$anchor, fragment_6);
				};

				$.if(node_30, ($$render) => {
					if ($.get(results).summary) $$render(consequent_12);
				});
			}

			$.template_effect(() => $.set_text(text_3, `Zone: ${$.get(results).zone ?? ''}`));
			$.append($$anchor, fragment_2);
		};

		$.if(node_8, ($$render) => {
			if ($.get(results)) $$render(consequent_13);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		input.disabled = $.get(loading);
		button_1.disabled = $.get(loading);
	});

	$.delegated('change', input, () => clearExampleSelection());
	$.delegated('keydown', input, (e) => e.key === 'Enter' && checkGlue());
	$.bind_value(input, () => $.get(zoneName), ($$value) => $.set(zoneName, $$value));
	$.delegated('click', button_1, checkGlue);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'change', 'keydown']);