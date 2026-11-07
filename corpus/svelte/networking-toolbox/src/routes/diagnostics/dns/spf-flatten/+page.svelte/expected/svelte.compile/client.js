import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import '../../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<button><h5> </h5> <p> </p></button>`);
var root_1 = $.from_html(`<!> Flattening...`, 1);
var root_2 = $.from_html(`<!> Flatten SPF`, 1);
var root_3 = $.from_html(`<div class="card error-card"><div class="card-content"><div class="error-content"><!> <div><strong>SPF Flatten Failed</strong> <p> </p></div></div></div></div>`);
var root_4 = $.from_html(`<div class="card"><div class="card-content"><div class="loading-state"><!> <div class="loading-text"><h3>Flattening SPF Record</h3> <p>Resolving SPF includes and redirects to create a flattened record...</p></div></div></div></div>`);
var root_5 = $.from_html(`<span class="resolved-item svelte-bvqwjc"> </span>`);
var root_6 = $.from_html(`<div class="resolved-items svelte-bvqwjc"></div>`);
var root_7 = $.from_html(`<div class="expansion-item svelte-bvqwjc"><div class="expansion-header svelte-bvqwjc"><span class="expansion-type svelte-bvqwjc"> </span> <span class="expansion-value svelte-bvqwjc"> </span> <span class="lookup-count svelte-bvqwjc"> </span></div> <!></div>`);
var root_8 = $.from_html(`<div class="card expansion-section svelte-bvqwjc"><div class="card-header"><h3>Expansion Tree</h3></div> <div class="card-content"><div class="tree-container svelte-bvqwjc"></div></div></div>`);
var root_9 = $.from_html(`<div class="stat-warning svelte-bvqwjc">Exceeds RFC limit!</div>`);
var root_10 = $.from_html(`<div class="stat-warning svelte-bvqwjc">Close to limit</div>`);
var root_11 = $.from_html(`<div class="stat-warning svelte-bvqwjc">May need splitting</div>`);
var root_12 = $.from_html(`<div class="warning-item svelte-bvqwjc"><!> <span class="svelte-bvqwjc"> </span></div>`);
var root_13 = $.from_html(`<div class="card warnings-section svelte-bvqwjc"><div class="card-header"><h3>Warnings</h3></div> <div class="card-content"><div class="warnings-list svelte-bvqwjc"></div></div></div>`);
var root_14 = $.from_html(`<div class="card results-card"><div class="card-header"><h3>SPF Flatten Results</h3></div> <div class="card-content"><div class="results-section svelte-bvqwjc"><div class="card original-section svelte-bvqwjc"><div class="card-header"><h3>Original SPF Record</h3></div> <div class="card-content"><div class="spf-record original svelte-bvqwjc"><code class="svelte-bvqwjc"> </code></div></div></div> <div class="card flattened-section svelte-bvqwjc"><div class="card-header"><div class="section-header svelte-bvqwjc"><h3 class="svelte-bvqwjc">Flattened SPF Record</h3> <button><!> </button></div></div> <div class="card-content"><div class="spf-record flattened svelte-bvqwjc"><code class="svelte-bvqwjc"> </code></div></div></div> <!> <div class="card stats-section svelte-bvqwjc"><div class="card-header"><h3>Statistics</h3></div> <div class="card-content"><div class="stats-grid"><div class="stat-card"><div class="stat-label">DNS Lookups</div> <div><!> </div> <!></div> <div class="stat-card"><div class="stat-label">IPv4 Addresses</div> <div class="stat-value svelte-bvqwjc"> </div></div> <div class="stat-card"><div class="stat-label">IPv6 Addresses</div> <div class="stat-value svelte-bvqwjc"> </div></div> <div class="stat-card"><div class="stat-label">Max Include Depth</div> <div class="stat-value svelte-bvqwjc"> </div></div> <div class="stat-card"><div class="stat-label">Record Length</div> <div><!> </div> <!></div> <div class="stat-card"><div class="stat-label">Total Mechanisms</div> <div class="stat-value svelte-bvqwjc"> </div></div></div></div></div> <!></div></div></div>`);
var root_15 = $.from_html(`<div class="card"><header class="card-header"><h1>SPF Flatten</h1> <p>Resolve include:/redirect= and output a flattened SPF with lookup counts</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary"><!> <h4>Quick Examples</h4></summary> <div class="examples-grid"></div></details></div> <div class="card input-card"><div class="card-header"><h3>SPF Flatten Configuration</h3></div> <div class="card-content"><div class="form-group"><label for="domain">Domain Name</label> <div class="input-flex-container"><input id="domain" type="text" placeholder="example.com"/> <button class="primary"><!></button></div></div></div></div> <!> <!> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let domainName = $.state('example.com');
	let loading = $.state(false);
	let results = $.state(null);
	let error = $.state(null);
	let selectedExampleIndex = $.state(null);
	let copySuccess = $.state(false);

	const examples = [
		{ domain: 'github.com', description: 'GitHub SPF' },
		{ domain: 'google.com', description: 'Google SPF' },
		{ domain: 'microsoft.com', description: 'Microsoft SPF' }
	];

	async function flattenSPF() {
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
					action: 'spf-flatten',
					domain: $.get(domainName).trim().toLowerCase()
				})
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Failed to flatten SPF');
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
		flattenSPF();
	}

	function clearExampleSelection() {
		$.set(selectedExampleIndex, null);
	}

	async function copyFlattened() {
		if ($.get(results)?.flattened) {
			await navigator.clipboard.writeText($.get(results).flattened);
			$.set(copySuccess, true);

			setTimeout(
				() => {
					$.set(copySuccess, false);
				},
				500
			);
		}
	}

	var div = root_15();
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
		$.action(button, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => `Flatten SPF record for ${$.get(example).domain}`);

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
		var consequent_9 = ($$anchor) => {
			var div_14 = root_14();
			var div_15 = $.sibling($.child(div_14), 2);
			var div_16 = $.child(div_15);
			var div_17 = $.child(div_16);
			var div_18 = $.sibling($.child(div_17), 2);
			var div_19 = $.child(div_18);
			var code = $.child(div_19);
			var text_3 = $.only_child(code, true);

			$.reset(div_19);
			$.reset(div_18);
			$.reset(div_17);

			var div_20 = $.sibling(div_17, 2);
			var div_21 = $.child(div_20);
			var div_22 = $.child(div_21);
			var button_2 = $.sibling($.child(div_22), 2);
			let classes_1;
			var node_9 = $.child(button_2);

			{
				let $0 = $.derived(() => $.get(copySuccess) ? 'check' : 'copy');

				Icon(node_9, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			var text_4 = $.sibling(node_9);

			$.reset(button_2);
			$.action(button_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Copy flattened SPF record to clipboard');
			$.reset(div_22);
			$.reset(div_21);

			var div_23 = $.sibling(div_21, 2);
			var div_24 = $.child(div_23);
			var code_1 = $.child(div_24);
			var text_5 = $.only_child(code_1, true);

			$.reset(div_24);
			$.reset(div_23);
			$.reset(div_20);

			var node_10 = $.sibling(div_20, 2);

			{
				var consequent_4 = ($$anchor) => {
					var div_25 = root_8();
					var div_26 = $.sibling($.child(div_25), 2);
					var div_27 = $.child(div_26);

					$.each(div_27, 23, () => $.get(results).expansions, (expansion) => expansion.value, ($$anchor, expansion) => {
						var div_28 = root_7();
						var div_29 = $.child(div_28);
						var span = $.child(div_29);
						var text_6 = $.only_child(span, true);
						var span_1 = $.sibling(span, 2);
						var text_7 = $.only_child(span_1, true);
						var span_2 = $.sibling(span_1, 2);
						var text_8 = $.only_child(span_2, true);

						$.action(span_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => `${$.get(expansion).lookups} DNS lookup${$.get(expansion).lookups !== 1 ? 's' : ''}`);
						$.reset(div_29);

						var node_11 = $.sibling(div_29, 2);

						{
							var consequent_3 = ($$anchor) => {
								var div_30 = root_6();

								$.each(div_30, 20, () => $.get(expansion).resolved, (item) => item, ($$anchor, item) => {
									var span_3 = root_5();
									var text_9 = $.only_child(span_3, true);

									$.template_effect(() => $.set_text(text_9, item));
									$.append($$anchor, span_3);
								});

								$.reset(div_30);
								$.append($$anchor, div_30);
							};

							$.if(node_11, ($$render) => {
								if ($.get(expansion).resolved) $$render(consequent_3);
							});
						}

						$.reset(div_28);

						$.template_effect(() => {
							$.set_style(div_28, `margin-left: ${$.get(expansion).depth * 1.5}rem`);
							$.set_text(text_6, $.get(expansion).type);
							$.set_text(text_7, $.get(expansion).value);
							$.set_text(text_8, $.get(expansion).lookups);
						});

						$.append($$anchor, div_28);
					});

					$.reset(div_27);
					$.reset(div_26);
					$.reset(div_25);
					$.append($$anchor, div_25);
				};

				$.if(node_10, ($$render) => {
					if ($.get(results).expansions && $.get(results).expansions.length > 0) $$render(consequent_4);
				});
			}

			var div_31 = $.sibling(node_10, 2);
			var div_32 = $.sibling($.child(div_31), 2);
			var div_33 = $.child(div_32);
			var div_34 = $.child(div_33);
			var div_35 = $.child(div_34);

			$.action(div_35, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Number of DNS lookups required. RFC 7208 limits this to 10.');

			var div_36 = $.sibling(div_35, 2);
			let classes_2;
			var node_12 = $.child(div_36);

			{
				let $0 = $.derived(() => $.get(results).stats.dnsLookups > 10
					? 'alert-circle'
					: $.get(results).stats.dnsLookups > 7 ? 'alert-triangle' : 'check-circle');

				Icon(node_12, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			var text_10 = $.sibling(node_12);

			$.reset(div_36);

			var node_13 = $.sibling(div_36, 2);

			{
				var consequent_5 = ($$anchor) => {
					var div_37 = root_9();

					$.append($$anchor, div_37);
				};

				var consequent_6 = ($$anchor) => {
					var div_38 = root_10();

					$.append($$anchor, div_38);
				};

				$.if(node_13, ($$render) => {
					if ($.get(results).stats.dnsLookups > 10) $$render(consequent_5); else if ($.get(results).stats.dnsLookups > 7) $$render(consequent_6, 1);
				});
			}

			$.reset(div_34);

			var div_39 = $.sibling(div_34, 2);
			var div_40 = $.child(div_39);

			$.action(div_40, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Number of IPv4 addresses in the flattened SPF record');

			var div_41 = $.sibling(div_40, 2);
			var text_11 = $.only_child(div_41, true);

			$.reset(div_39);

			var div_42 = $.sibling(div_39, 2);
			var div_43 = $.child(div_42);

			$.action(div_43, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Number of IPv6 addresses in the flattened SPF record');

			var div_44 = $.sibling(div_43, 2);
			var text_12 = $.only_child(div_44, true);

			$.reset(div_42);

			var div_45 = $.sibling(div_42, 2);
			var div_46 = $.child(div_45);

			$.action(div_46, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Maximum depth of nested include statements');

			var div_47 = $.sibling(div_46, 2);
			var text_13 = $.only_child(div_47, true);

			$.reset(div_45);

			var div_48 = $.sibling(div_45, 2);
			var div_49 = $.child(div_48);

			$.action(div_49, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Total character length of the flattened SPF record');

			var div_50 = $.sibling(div_49, 2);
			let classes_3;
			var node_14 = $.child(div_50);

			{
				let $0 = $.derived(() => $.get(results).stats.recordLength > 450 ? 'alert-triangle' : 'check-circle');

				Icon(node_14, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			var text_14 = $.sibling(node_14);

			$.reset(div_50);

			var node_15 = $.sibling(div_50, 2);

			{
				var consequent_7 = ($$anchor) => {
					var div_51 = root_11();

					$.append($$anchor, div_51);
				};

				$.if(node_15, ($$render) => {
					if ($.get(results).stats.recordLength > 450) $$render(consequent_7);
				});
			}

			$.reset(div_48);

			var div_52 = $.sibling(div_48, 2);
			var div_53 = $.child(div_52);

			$.action(div_53, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Total number of SPF mechanisms in the flattened record');

			var div_54 = $.sibling(div_53, 2);
			var text_15 = $.only_child(div_54, true);

			$.reset(div_52);
			$.reset(div_33);
			$.reset(div_32);
			$.reset(div_31);

			var node_16 = $.sibling(div_31, 2);

			{
				var consequent_8 = ($$anchor) => {
					var div_55 = root_13();
					var div_56 = $.sibling($.child(div_55), 2);
					var div_57 = $.child(div_56);

					$.each(div_57, 20, () => $.get(results).warnings, (warning) => warning, ($$anchor, warning) => {
						var div_58 = root_12();
						var node_17 = $.child(div_58);

						Icon(node_17, { name: 'alert-triangle', size: 'sm' });

						var span_4 = $.sibling(node_17, 2);
						var text_16 = $.only_child(span_4, true);

						$.reset(div_58);
						$.template_effect(() => $.set_text(text_16, warning));
						$.append($$anchor, div_58);
					});

					$.reset(div_57);
					$.reset(div_56);
					$.reset(div_55);
					$.append($$anchor, div_55);
				};

				$.if(node_16, ($$render) => {
					if ($.get(results).warnings && $.get(results).warnings.length > 0) $$render(consequent_8);
				});
			}

			$.reset(div_16);
			$.reset(div_15);
			$.reset(div_14);

			$.template_effect(() => {
				$.set_text(text_3, $.get(results).original);
				classes_1 = $.set_class(button_2, 1, 'copy-button svelte-bvqwjc', null, classes_1, { success: $.get(copySuccess) });
				$.set_text(text_4, ` ${$.get(copySuccess) ? 'Copied!' : 'Copy'}`);
				$.set_text(text_5, $.get(results).flattened);

				classes_2 = $.set_class(div_36, 1, 'stat-value svelte-bvqwjc', null, classes_2, {
					warning: $.get(results).stats.dnsLookups > 7,
					error: $.get(results).stats.dnsLookups > 10
				});

				$.set_text(text_10, ` ${$.get(results).stats.dnsLookups ?? ''}/10`);
				$.set_text(text_11, $.get(results).stats.ipv4Count);
				$.set_text(text_12, $.get(results).stats.ipv6Count);
				$.set_text(text_13, $.get(results).stats.includeDepth);
				classes_3 = $.set_class(div_50, 1, 'stat-value svelte-bvqwjc', null, classes_3, { warning: $.get(results).stats.recordLength > 400 });
				$.set_text(text_14, ` ${$.get(results).stats.recordLength ?? ''}`);
				$.set_text(text_15, $.get(results).stats.mechanisms);
			});

			$.delegated('click', button_2, copyFlattened);
			$.append($$anchor, div_14);
		};

		$.if(node_8, ($$render) => {
			if ($.get(results)) $$render(consequent_9);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		input.disabled = $.get(loading);
		button_1.disabled = $.get(loading);
	});

	$.delegated('change', input, () => clearExampleSelection());
	$.delegated('keydown', input, (e) => e.key === 'Enter' && flattenSPF());
	$.bind_value(input, () => $.get(domainName), ($$value) => $.set(domainName, $$value));
	$.delegated('click', button_1, flattenSPF);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'change', 'keydown']);