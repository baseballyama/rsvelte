import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';
import { ipv6ConnectivityContent as content } from '$lib/content/ipv6-connectivity';
import '../../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<!> Testing...`, 1);
var root_1 = $.from_html(`<!> Test IPv6 Connectivity`, 1);
var root_2 = $.from_html(`<div class="card error-card"><div class="card-content svelte-xcuhlg"><div class="error-message svelte-xcuhlg"><!> <span> </span></div></div></div>`);
var root_3 = $.from_html(`<div class="info-list svelte-xcuhlg"><div class="info-item svelte-xcuhlg"><!> <div class="info-content svelte-xcuhlg"><span class="info-label svelte-xcuhlg">IP Address</span> <span class="info-value svelte-xcuhlg"> </span></div></div> <div class="info-item svelte-xcuhlg"><!> <div class="info-content svelte-xcuhlg"><span class="info-label svelte-xcuhlg">Latency</span> <span class="info-value svelte-xcuhlg"> </span></div></div></div>`);
var root_4 = $.from_html(`<div class="error-text svelte-xcuhlg"> </div>`);
var root_5 = $.from_html(`<div class="error-text svelte-xcuhlg">No IPv4 connectivity available</div>`);
var root_6 = $.from_html(`<div class="error-text svelte-xcuhlg">No IPv6 connectivity available</div>`);
var root_7 = $.from_html(`<div class="info-item svelte-xcuhlg"><!> <div class="info-content svelte-xcuhlg"><span class="info-label svelte-xcuhlg">Preferred Protocol</span> <span class="info-value preferred svelte-xcuhlg"> </span></div></div> <div class="info-note svelte-xcuhlg"><!> Based on latency comparison</div>`, 1);
var root_8 = $.from_html(`<div class="result-card svelte-xcuhlg"><h4><!> Connection Summary</h4> <div class="info-list svelte-xcuhlg"><div class="info-item svelte-xcuhlg"><!> <div class="info-content svelte-xcuhlg"><span class="info-label svelte-xcuhlg">Dual-Stack</span> <span class="info-value success svelte-xcuhlg">Enabled</span></div></div> <!> <div class="info-item svelte-xcuhlg"><!> <div class="info-content svelte-xcuhlg"><span class="info-label svelte-xcuhlg">Tested At</span> <span class="info-value svelte-xcuhlg"> </span></div></div></div></div>`);
var root_9 = $.from_html(`<div class="card results-card"><div class="card-header row"><h3>Connectivity Results</h3> <button class="copy-btn"><!> </button></div> <div class="card-content svelte-xcuhlg"><div class="status-overview"><div><!> <div><h4> </h4> <p> </p></div></div></div> <div class="results-grid"><div class="result-card svelte-xcuhlg"><h4><!> IPv4 Connectivity</h4> <div><!> <span> </span></div> <!></div> <div class="result-card svelte-xcuhlg"><h4><!> IPv6 Connectivity</h4> <div><!> <span> </span></div> <!></div> <!></div></div></div>`);
var root_10 = $.from_html(`<li><strong> </strong> </li>`);
var root_11 = $.from_html(`<li> </li>`);
var root_12 = $.from_html(`<div class="card"><header class="card-header"><h1> </h1> <p> </p></header> <div class="card input-card"><div class="card-header"><h3>Connectivity Test</h3></div> <div class="card-content svelte-xcuhlg"><div class="lookup-form"><button class="lookup-btn"><!></button></div></div></div> <!> <!> <div class="card info-card"><div class="card-header"><h3>About IPv6 Connectivity</h3></div> <div class="card-content svelte-xcuhlg"><section><h4> </h4> <p> </p></section> <hr/> <section><h4> </h4> <p> </p> <ul class="svelte-xcuhlg"></ul></section> <hr/> <section><h4> </h4> <ul class="svelte-xcuhlg"></ul></section> <hr/> <section><h4>Quick Tips</h4> <ul class="svelte-xcuhlg"></ul></section></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let loading = $.state(false);
	let results = $.state(null);
	let error = $.state(null);
	let copiedState = $.state(false);

	async function testConnectivity() {
		$.set(loading, true);
		$.set(error, null);
		$.set(results, null);

		try {
			const response = await fetch('/api/internal/diagnostics/ipv6-connectivity', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));

				throw new Error(errorData.message || 'Test failed');
			}

			$.set(results, await response.json(), true);
		} catch(err) {
			$.set(error, err instanceof Error ? err.message : 'Unknown error occurred', true);
		} finally {
			$.set(loading, false);
		}
	}

	async function copyResults() {
		if (!$.get(results)) return;

		let text = `IPv6 Connectivity Test\nGenerated at: ${$.get(results).timestamp}\n\n`;

		text += `IPv4: ${$.get(results).ipv4.success ? 'Connected' : 'Not Available'}\n`;

		if ($.get(results).ipv4.success) {
			text += `  IP: ${$.get(results).ipv4.ip}\n`;
			text += `  Latency: ${$.get(results).ipv4.latency}ms\n`;
		}

		text += `\nIPv6: ${$.get(results).ipv6.success ? 'Connected' : 'Not Available'}\n`;

		if ($.get(results).ipv6.success) {
			text += `  IP: ${$.get(results).ipv6.ip}\n`;
			text += `  Latency: ${$.get(results).ipv6.latency}ms\n`;
		}

		text += `\nDual-Stack: ${$.get(results).dualStack ? 'Yes' : 'No'}\n`;

		if ($.get(results).preferredProtocol) {
			text += `Preferred Protocol: ${$.get(results).preferredProtocol}\n`;
		}

		await navigator.clipboard.writeText(text);
		$.set(copiedState, true);
		setTimeout(() => $.set(copiedState, false), 1500);
	}

	var div = root_12();
	var header = $.child(div);
	var h1 = $.child(header);
	var text_1 = $.only_child(h1, true);
	var p = $.sibling(h1, 2);
	var text_2 = $.only_child(p, true);

	$.reset(header);

	var div_1 = $.sibling(header, 2);
	var div_2 = $.sibling($.child(div_1), 2);
	var div_3 = $.child(div_2);
	var button = $.child(div_3);
	var node = $.child(button);

	{
		var consequent = ($$anchor) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Icon(node_1, { name: 'loader', size: 'sm', animate: 'spin' });
			$.next();
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_1();
			var node_2 = $.first_child(fragment_1);

			Icon(node_2, { name: 'network', size: 'sm' });
			$.next();
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(loading)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button);
	$.reset(div_3);
	$.reset(div_2);
	$.reset(div_1);

	var node_3 = $.sibling(div_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_4 = root_2();
			var div_5 = $.child(div_4);
			var div_6 = $.child(div_5);
			var node_4 = $.child(div_6);

			Icon(node_4, { name: 'alert-circle', size: 'md' });

			var span = $.sibling(node_4, 2);
			var text_3 = $.only_child(span, true);

			$.reset(div_6);
			$.reset(div_5);
			$.reset(div_4);
			$.template_effect(() => $.set_text(text_3, $.get(error)));
			$.append($$anchor, div_4);
		};

		$.if(node_3, ($$render) => {
			if ($.get(error)) $$render(consequent_1);
		});
	}

	var node_5 = $.sibling(node_3, 2);

	{
		var consequent_8 = ($$anchor) => {
			var div_7 = root_9();
			var div_8 = $.child(div_7);
			var button_1 = $.sibling($.child(div_8), 2);
			var node_6 = $.child(button_1);

			{
				let $0 = $.derived(() => $.get(copiedState) ? 'check' : 'copy');

				Icon(node_6, {
					get name() {
						return $.get($0);
					},
					size: 'xs'
				});
			}

			var text_4 = $.sibling(node_6);

			$.reset(button_1);
			$.reset(div_8);

			var div_9 = $.sibling(div_8, 2);
			var div_10 = $.child(div_9);
			var div_11 = $.child(div_10);
			var node_7 = $.child(div_11);

			{
				let $0 = $.derived(() => $.get(results).dualStack ? 'check-circle' : 'alert-circle');

				Icon(node_7, {
					get name() {
						return $.get($0);
					},
					size: 'md'
				});
			}

			var div_12 = $.sibling(node_7, 2);
			var h4 = $.child(div_12);
			var text_5 = $.only_child(h4, true);
			var p_1 = $.sibling(h4, 2);
			var text_6 = $.only_child(p_1, true);

			$.reset(div_12);
			$.reset(div_11);
			$.reset(div_10);

			var div_13 = $.sibling(div_10, 2);
			var div_14 = $.child(div_13);
			var h4_1 = $.child(div_14);
			var node_8 = $.child(h4_1);

			Icon(node_8, { name: 'network', size: 'sm' });
			$.next();
			$.reset(h4_1);

			var div_15 = $.sibling(h4_1, 2);
			var node_9 = $.child(div_15);

			{
				let $0 = $.derived(() => $.get(results).ipv4.success ? 'check-circle' : 'x-circle');

				Icon(node_9, {
					get name() {
						return $.get($0);
					},
					size: 'md'
				});
			}

			var span_1 = $.sibling(node_9, 2);
			var text_7 = $.only_child(span_1, true);

			$.reset(div_15);

			var node_10 = $.sibling(div_15, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_16 = root_3();
					var div_17 = $.child(div_16);
					var node_11 = $.child(div_17);

					Icon(node_11, { name: 'globe', size: 'sm' });

					var div_18 = $.sibling(node_11, 2);
					var span_2 = $.sibling($.child(div_18), 2);
					var text_8 = $.only_child(span_2, true);

					$.reset(div_18);
					$.reset(div_17);

					var div_19 = $.sibling(div_17, 2);
					var node_12 = $.child(div_19);

					Icon(node_12, { name: 'clock', size: 'sm' });

					var div_20 = $.sibling(node_12, 2);
					var span_3 = $.sibling($.child(div_20), 2);
					var text_9 = $.only_child(span_3);

					$.reset(div_20);
					$.reset(div_19);
					$.reset(div_16);

					$.template_effect(() => {
						$.set_text(text_8, $.get(results).ipv4.ip);
						$.set_text(text_9, `${$.get(results).ipv4.latency ?? ''}ms`);
					});

					$.append($$anchor, div_16);
				};

				var consequent_3 = ($$anchor) => {
					var div_21 = root_4();
					var text_10 = $.only_child(div_21, true);

					$.template_effect(() => $.set_text(text_10, $.get(results).ipv4.error));
					$.append($$anchor, div_21);
				};

				var alternate_1 = ($$anchor) => {
					var div_22 = root_5();

					$.append($$anchor, div_22);
				};

				$.if(node_10, ($$render) => {
					if ($.get(results).ipv4.success) $$render(consequent_2); else if ($.get(results).ipv4.error && $.get(results).ipv4.error !== 'fetch failed') $$render(consequent_3, 1); else $$render(alternate_1, -1);
				});
			}

			$.reset(div_14);

			var div_23 = $.sibling(div_14, 2);
			var h4_2 = $.child(div_23);
			var node_13 = $.child(h4_2);

			Icon(node_13, { name: 'network', size: 'sm' });
			$.next();
			$.reset(h4_2);

			var div_24 = $.sibling(h4_2, 2);
			var node_14 = $.child(div_24);

			{
				let $0 = $.derived(() => $.get(results).ipv6.success ? 'check-circle' : 'x-circle');

				Icon(node_14, {
					get name() {
						return $.get($0);
					},
					size: 'md'
				});
			}

			var span_4 = $.sibling(node_14, 2);
			var text_11 = $.only_child(span_4, true);

			$.reset(div_24);

			var node_15 = $.sibling(div_24, 2);

			{
				var consequent_4 = ($$anchor) => {
					var div_25 = root_3();
					var div_26 = $.child(div_25);
					var node_16 = $.child(div_26);

					Icon(node_16, { name: 'globe', size: 'sm' });

					var div_27 = $.sibling(node_16, 2);
					var span_5 = $.sibling($.child(div_27), 2);
					var text_12 = $.only_child(span_5, true);

					$.reset(div_27);
					$.reset(div_26);

					var div_28 = $.sibling(div_26, 2);
					var node_17 = $.child(div_28);

					Icon(node_17, { name: 'clock', size: 'sm' });

					var div_29 = $.sibling(node_17, 2);
					var span_6 = $.sibling($.child(div_29), 2);
					var text_13 = $.only_child(span_6);

					$.reset(div_29);
					$.reset(div_28);
					$.reset(div_25);

					$.template_effect(() => {
						$.set_text(text_12, $.get(results).ipv6.ip);
						$.set_text(text_13, `${$.get(results).ipv6.latency ?? ''}ms`);
					});

					$.append($$anchor, div_25);
				};

				var consequent_5 = ($$anchor) => {
					var div_30 = root_4();
					var text_14 = $.only_child(div_30, true);

					$.template_effect(() => $.set_text(text_14, $.get(results).ipv6.error));
					$.append($$anchor, div_30);
				};

				var alternate_2 = ($$anchor) => {
					var div_31 = root_6();

					$.append($$anchor, div_31);
				};

				$.if(node_15, ($$render) => {
					if ($.get(results).ipv6.success) $$render(consequent_4); else if ($.get(results).ipv6.error && $.get(results).ipv6.error !== 'fetch failed') $$render(consequent_5, 1); else $$render(alternate_2, -1);
				});
			}

			$.reset(div_23);

			var node_18 = $.sibling(div_23, 2);

			{
				var consequent_7 = ($$anchor) => {
					var div_32 = root_8();
					var h4_3 = $.child(div_32);
					var node_19 = $.child(h4_3);

					Icon(node_19, { name: 'info', size: 'sm' });
					$.next();
					$.reset(h4_3);

					var div_33 = $.sibling(h4_3, 2);
					var div_34 = $.child(div_33);
					var node_20 = $.child(div_34);

					Icon(node_20, { name: 'check-circle', size: 'sm' });
					$.next(2);
					$.reset(div_34);

					var node_21 = $.sibling(div_34, 2);

					{
						var consequent_6 = ($$anchor) => {
							var fragment_2 = root_7();
							var div_35 = $.first_child(fragment_2);
							var node_22 = $.child(div_35);

							Icon(node_22, { name: 'zap', size: 'sm' });

							var div_36 = $.sibling(node_22, 2);
							var span_7 = $.sibling($.child(div_36), 2);
							var text_15 = $.only_child(span_7, true);

							$.reset(div_36);
							$.reset(div_35);

							var div_37 = $.sibling(div_35, 2);
							var node_23 = $.child(div_37);

							Icon(node_23, { name: 'info', size: 'xs' });
							$.next();
							$.reset(div_37);
							$.template_effect(() => $.set_text(text_15, $.get(results).preferredProtocol));
							$.append($$anchor, fragment_2);
						};

						$.if(node_21, ($$render) => {
							if ($.get(results).preferredProtocol) $$render(consequent_6);
						});
					}

					var div_38 = $.sibling(node_21, 2);
					var node_24 = $.child(div_38);

					Icon(node_24, { name: 'clock', size: 'sm' });

					var div_39 = $.sibling(node_24, 2);
					var span_8 = $.sibling($.child(div_39), 2);
					var text_16 = $.only_child(span_8, true);

					$.reset(div_39);
					$.reset(div_38);
					$.reset(div_33);
					$.reset(div_32);
					$.template_effect(($0) => $.set_text(text_16, $0), [() => new Date($.get(results).timestamp).toLocaleString()]);
					$.append($$anchor, div_32);
				};

				$.if(node_18, ($$render) => {
					if ($.get(results).dualStack) $$render(consequent_7);
				});
			}

			$.reset(div_13);
			$.reset(div_9);
			$.reset(div_7);

			$.template_effect(() => {
				button_1.disabled = $.get(copiedState);
				$.set_text(text_4, ` ${$.get(copiedState) ? 'Copied!' : 'Copy Results'}`);
				$.set_class(div_11, 1, `status-item ${$.get(results).dualStack ? 'success' : 'warning'}`);
				$.set_text(text_5, $.get(results).dualStack ? 'Dual-Stack Available' : 'Single Protocol Only');

				$.set_text(text_6, $.get(results).dualStack
					? 'Both IPv4 and IPv6 connectivity are available'
					: $.get(results).ipv4.success
						? 'Only IPv4 connectivity is available'
						: $.get(results).ipv6.success
							? 'Only IPv6 connectivity is available'
							: 'No connectivity detected');

				$.set_class(div_15, 1, `connectivity-status ${$.get(results).ipv4.success ? 'success' : 'error'}`, 'svelte-xcuhlg');
				$.set_text(text_7, $.get(results).ipv4.success ? 'Connected' : 'Not Available');
				$.set_class(div_24, 1, `connectivity-status ${$.get(results).ipv6.success ? 'success' : 'error'}`, 'svelte-xcuhlg');
				$.set_text(text_11, $.get(results).ipv6.success ? 'Connected' : 'Not Available');
			});

			$.delegated('click', button_1, copyResults);
			$.append($$anchor, div_7);
		};

		$.if(node_5, ($$render) => {
			if ($.get(results)) $$render(consequent_8);
		});
	}

	var div_40 = $.sibling(node_5, 2);
	var div_41 = $.sibling($.child(div_40), 2);
	var section = $.child(div_41);
	var h4_4 = $.child(section);
	var text_17 = $.only_child(h4_4, true);
	var p_2 = $.sibling(h4_4, 2);
	var text_18 = $.only_child(p_2, true);

	$.reset(section);

	var section_1 = $.sibling(section, 4);
	var h4_5 = $.child(section_1);
	var text_19 = $.only_child(h4_5, true);
	var p_3 = $.sibling(h4_5, 2);
	var text_20 = $.only_child(p_3, true);
	var ul = $.sibling(p_3, 2);

	$.each(ul, 21, () => content.sections.dualStack.benefits, ({ benefit, description }) => benefit, ($$anchor, $$item) => {
		let benefit = () => $.get($$item).benefit;
		let description = () => $.get($$item).description;
		var li = root_10();
		var strong = $.child(li);
		var text_21 = $.only_child(strong);
		var text_22 = $.sibling(strong);

		$.reset(li);

		$.template_effect(() => {
			$.set_text(text_21, `${benefit() ?? ''}:`);
			$.set_text(text_22, ` ${description() ?? ''}`);
		});

		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(section_1);

	var section_2 = $.sibling(section_1, 4);
	var h4_6 = $.child(section_2);
	var text_23 = $.only_child(h4_6, true);
	var ul_1 = $.sibling(h4_6, 2);

	$.each(ul_1, 21, () => content.sections.ipv6Advantages.advantages, ({ advantage, description }) => advantage, ($$anchor, $$item) => {
		let advantage = () => $.get($$item).advantage;
		let description = () => $.get($$item).description;
		var li_1 = root_10();
		var strong_1 = $.child(li_1);
		var text_24 = $.only_child(strong_1);
		var text_25 = $.sibling(strong_1);

		$.reset(li_1);

		$.template_effect(() => {
			$.set_text(text_24, `${advantage() ?? ''}:`);
			$.set_text(text_25, ` ${description() ?? ''}`);
		});

		$.append($$anchor, li_1);
	});

	$.reset(ul_1);
	$.reset(section_2);

	var section_3 = $.sibling(section_2, 4);
	var ul_2 = $.sibling($.child(section_3), 2);

	$.each(ul_2, 20, () => content.quickTips, (tip) => tip, ($$anchor, tip) => {
		var li_2 = root_11();
		var text_26 = $.only_child(li_2, true);

		$.template_effect(() => $.set_text(text_26, tip));
		$.append($$anchor, li_2);
	});

	$.reset(ul_2);
	$.reset(section_3);
	$.reset(div_41);
	$.reset(div_40);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text_1, content.title);
		$.set_text(text_2, content.description);
		button.disabled = $.get(loading);
		$.set_text(text_17, content.sections.whatIsIPv6.title);
		$.set_text(text_18, content.sections.whatIsIPv6.content);
		$.set_text(text_19, content.sections.dualStack.title);
		$.set_text(text_20, content.sections.dualStack.content);
		$.set_text(text_23, content.sections.ipv6Advantages.title);
	});

	$.delegated('click', button, testConnectivity);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);