import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { reverseZonesContent } from '$lib/content/reverse-zones.js';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<tr><td><code> </code></td><td><code> </code></td><td><code> </code></td><td> </td><td> </td></tr>`);
var root_1 = $.from_html(`<code class="example-input"> </code>`);
var root_2 = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><div><strong>Addresses:</strong> </div> <div><strong>Problem:</strong> </div> <div><strong>Solution:</strong> </div> <div><strong>Zone Names:</strong></div> <!></div></div>`);
var root_3 = $.from_html(`<div><strong>Reverse Zones:</strong></div> <!> <div><strong>Description:</strong> </div>`, 1);
var root_4 = $.from_html(`<div><strong>PTR Records:</strong></div> <!>`, 1);
var root_5 = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><div><strong>Network:</strong> <code> </code></div> <div><strong>Reverse Zone:</strong> <code> </code></div> <!> <div><strong>Delegation:</strong> </div></div></div>`);
var root_6 = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><div><strong>Network:</strong> <code> </code></div> <div><strong>Master Zone:</strong> <code> </code></div> <div><strong>Sub-zones:</strong></div> <!> <div><strong>Management:</strong> </div></div></div>`);
var root_7 = $.from_html(`<li> </li>`);
var root_8 = $.from_html(`<div><strong>Customer Actions:</strong></div> <ul></ul> <div><strong>ISP Actions:</strong></div> <ul></ul>`, 1);
var root_9 = $.from_html(`<div><strong>Process:</strong></div> <ol></ol>`, 1);
var root_10 = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><div><strong>Delegation:</strong> </div> <!></div></div>`);
var root_11 = $.from_html(`<div class="ref-warning"><div class="warning-title"><!> </div> <div class="warning-content"><p><strong>Possible Causes:</strong> </p> <p><strong>Diagnosis:</strong> </p> <p><strong>Solution:</strong> </p></div></div>`);
var root_12 = $.from_html(`<div class="item-code"> </div>`);
var root_13 = $.from_html(`<div class="item-description"> </div>`);
var root_14 = $.from_html(`<div class="grid-item"><div class="item-title"> </div> <div class="item-description"> </div></div>`);

var root_15 = $.from_html(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1> </h1> <p class="subtitle"> </p></div> <div class="ref-section"><h2> </h2> <p> </p></div> <div class="ref-section"><h2> </h2> <p> </p></div> <div class="ref-section"><h2> </h2> <h3>Classful Boundaries (Octet-Aligned)</h3> <table class="ref-table"><thead><tr><th>CIDR</th><th>Example</th><th>Reverse Zone</th><th>Description</th><th>Delegation</th></tr></thead><tbody></tbody></table> <h3>Classless Delegation (CNAME Method)</h3> <!> <h3>Practical IPv4 Examples</h3> <!></div> <div class="ref-section"><h2> </h2> <h3>Nibble Boundaries (4-bit Aligned)</h3> <table class="ref-table"><thead><tr><th>CIDR</th><th>Example</th><th>Reverse Zone</th><th>Description</th><th>Delegation</th></tr></thead><tbody></tbody></table> <h3>Practical IPv6 Examples</h3> <!></div> <div class="ref-section"><h2> </h2> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title"> </div> <div><strong>Zone Name:</strong> <code> </code></div> <h4>Zone File:</h4> <pre><code> </code></pre> <h4>Explanation:</h4> <ul></ul></div> <div class="grid-item"><div class="item-title"> </div> <div><strong>Zone Name:</strong> <code> </code></div> <h4>Zone File:</h4> <pre><code> </code></pre> <h4>Explanation:</h4> <ul></ul></div></div></div> <div class="ref-section"><h2>Delegation Scenarios</h2> <!></div> <div class="ref-section"><h2>Troubleshooting</h2> <!></div> <div class="ref-section"><h2>Best Practices</h2> <ul></ul></div> <div class="ref-section"><h2>Quick Reference</h2> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title">Zone Name Formulas</div> <!></div> <div class="grid-item"><div class="item-title">Essential Records</div> <!></div></div> <div class="ref-highlight"><div class="highlight-title"><!> Key Rule</div> <div class="highlight-content">IPv4 reverse zones reverse the octets (192.0.2.0/24 → 2.0.192.in-addr.arpa). IPv6 reverse zones reverse the
          nibbles (2001:db8::/32 → 8.b.d.0.1.0.0.2.ip6.arpa).</div></div></div> <div class="ref-section"><h2>Testing Tools</h2> <div class="ref-grid two-col"></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var div = root_15();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var h1 = $.child(div_2);
	var text = $.only_child(h1, true);
	var p = $.sibling(h1, 2);
	var text_1 = $.only_child(p, true);

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var h2 = $.child(div_3);
	var text_2 = $.only_child(h2, true);
	var p_1 = $.sibling(h2, 2);
	var text_3 = $.only_child(p_1, true);

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var h2_1 = $.child(div_4);
	var text_4 = $.only_child(h2_1, true);
	var p_2 = $.sibling(h2_1, 2);
	var text_5 = $.only_child(p_2, true);

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var h2_2 = $.child(div_5);
	var text_6 = $.only_child(h2_2, true);
	var table = $.sibling(h2_2, 4);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 23, () => reverseZonesContent.ipv4Zones.classfullBoundaries, (boundary, index) => `${boundary.cidr}-${index}`, ($$anchor, boundary) => {
		var tr = root();
		var td = $.child(tr);
		var code = $.child(td);
		var text_7 = $.only_child(code, true);

		$.reset(td);

		var td_1 = $.sibling(td);
		var code_1 = $.child(td_1);
		var text_8 = $.only_child(code_1, true);

		$.reset(td_1);

		var td_2 = $.sibling(td_1);
		var code_2 = $.child(td_2);
		var text_9 = $.only_child(code_2, true);

		$.reset(td_2);

		var td_3 = $.sibling(td_2);
		var text_10 = $.only_child(td_3, true);
		var td_4 = $.sibling(td_3);
		var text_11 = $.only_child(td_4, true);

		$.reset(tr);

		$.template_effect(() => {
			$.set_text(text_7, $.get(boundary).cidr);
			$.set_text(text_8, $.get(boundary).example);
			$.set_text(text_9, $.get(boundary).reverseZone);
			$.set_text(text_10, $.get(boundary).description);
			$.set_text(text_11, $.get(boundary).delegation);
		});

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);

	var node = $.sibling(table, 4);

	$.each(node, 19, () => reverseZonesContent.ipv4Zones.classlessDelegation, (delegation, index) => `${delegation.cidr}-${index}`, ($$anchor, delegation) => {
		var div_6 = root_2();
		var div_7 = $.child(div_6);
		var text_12 = $.only_child(div_7);
		var div_8 = $.sibling(div_7, 2);
		var div_9 = $.child(div_8);
		var text_13 = $.sibling($.child(div_9));

		$.reset(div_9);

		var div_10 = $.sibling(div_9, 2);
		var text_14 = $.sibling($.child(div_10));

		$.reset(div_10);

		var div_11 = $.sibling(div_10, 2);
		var text_15 = $.sibling($.child(div_11));

		$.reset(div_11);

		var node_1 = $.sibling(div_11, 4);

		$.each(node_1, 19, () => $.get(delegation).zones, (zone, index) => `zone-${index}`, ($$anchor, zone, index, $$array) => {
			var code_3 = root_1();
			var text_16 = $.only_child(code_3, true);

			$.template_effect(() => $.set_text(text_16, $.get(zone)));
			$.append($$anchor, code_3);
		});

		$.reset(div_8);
		$.reset(div_6);

		$.template_effect(() => {
			$.set_text(text_12, `${$.get(delegation).cidr ?? ''} - ${$.get(delegation).example ?? ''}`);
			$.set_text(text_13, ` ${$.get(delegation).addresses ?? ''}`);
			$.set_text(text_14, ` ${$.get(delegation).problem ?? ''}`);
			$.set_text(text_15, ` ${$.get(delegation).solution ?? ''}`);
		});

		$.append($$anchor, div_6);
	});

	var node_2 = $.sibling(node, 4);

	$.each(node_2, 19, () => reverseZonesContent.ipv4Zones.practicalExamples, (example, index) => `${example.network}-${index}`, ($$anchor, example) => {
		var div_12 = root_5();
		var div_13 = $.child(div_12);
		var text_17 = $.only_child(div_13, true);
		var div_14 = $.sibling(div_13, 2);
		var div_15 = $.child(div_14);
		var code_4 = $.sibling($.child(div_15), 2);
		var text_18 = $.only_child(code_4, true);

		$.reset(div_15);

		var div_16 = $.sibling(div_15, 2);
		var code_5 = $.sibling($.child(div_16), 2);
		var text_19 = $.only_child(code_5, true);

		$.reset(div_16);

		var node_3 = $.sibling(div_16, 2);

		{
			var consequent = ($$anchor) => {
				var fragment = root_3();
				var node_4 = $.sibling($.first_child(fragment), 2);

				$.each(node_4, 19, () => $.get(example).reverseZones, (zone, index) => `rz-${index}`, ($$anchor, zone, index, $$array_1) => {
					var code_6 = root_1();
					var text_20 = $.only_child(code_6, true);

					$.template_effect(() => $.set_text(text_20, $.get(zone)));
					$.append($$anchor, code_6);
				});

				var div_17 = $.sibling(node_4, 2);
				var text_21 = $.sibling($.child(div_17));

				$.reset(div_17);
				$.template_effect(() => $.set_text(text_21, ` ${$.get(example).description ?? ''}`));
				$.append($$anchor, fragment);
			};

			var alternate = ($$anchor) => {
				var fragment_1 = root_4();
				var node_5 = $.sibling($.first_child(fragment_1), 2);

				$.each(node_5, 19, () => $.get(example).ptrRecords, (record, index) => `ptr-${index}`, ($$anchor, record, index, $$array_2) => {
					var code_7 = root_1();
					var text_22 = $.only_child(code_7, true);

					$.template_effect(() => $.set_text(text_22, $.get(record)));
					$.append($$anchor, code_7);
				});

				$.append($$anchor, fragment_1);
			};

			$.if(node_3, ($$render) => {
				if ($.get(example).reverseZones) $$render(consequent); else $$render(alternate, -1);
			});
		}

		var div_18 = $.sibling(node_3, 2);
		var text_23 = $.sibling($.child(div_18));

		$.reset(div_18);
		$.reset(div_14);
		$.reset(div_12);

		$.template_effect(() => {
			$.set_text(text_17, $.get(example).scenario);
			$.set_text(text_18, $.get(example).network);
			$.set_text(text_19, $.get(example).reverseZone);
			$.set_text(text_23, ` ${$.get(example).delegation ?? ''}`);
		});

		$.append($$anchor, div_12);
	});

	$.reset(div_5);

	var div_19 = $.sibling(div_5, 2);
	var h2_3 = $.child(div_19);
	var text_24 = $.only_child(h2_3, true);
	var table_1 = $.sibling(h2_3, 4);
	var tbody_1 = $.sibling($.child(table_1));

	$.each(tbody_1, 23, () => reverseZonesContent.ipv6Zones.nibbleBoundaries, (boundary, index) => `${boundary.cidr}-${index}`, ($$anchor, boundary) => {
		var tr_1 = root();
		var td_5 = $.child(tr_1);
		var code_8 = $.child(td_5);
		var text_25 = $.only_child(code_8, true);

		$.reset(td_5);

		var td_6 = $.sibling(td_5);
		var code_9 = $.child(td_6);
		var text_26 = $.only_child(code_9, true);

		$.reset(td_6);

		var td_7 = $.sibling(td_6);
		var code_10 = $.child(td_7);
		var text_27 = $.only_child(code_10, true);

		$.reset(td_7);

		var td_8 = $.sibling(td_7);
		var text_28 = $.only_child(td_8, true);
		var td_9 = $.sibling(td_8);
		var text_29 = $.only_child(td_9, true);

		$.reset(tr_1);

		$.template_effect(() => {
			$.set_text(text_25, $.get(boundary).cidr);
			$.set_text(text_26, $.get(boundary).example);
			$.set_text(text_27, $.get(boundary).reverseZone);
			$.set_text(text_28, $.get(boundary).description);
			$.set_text(text_29, $.get(boundary).delegation);
		});

		$.append($$anchor, tr_1);
	});

	$.reset(tbody_1);
	$.reset(table_1);

	var node_6 = $.sibling(table_1, 4);

	$.each(node_6, 19, () => reverseZonesContent.ipv6Zones.practicalExamples, (example, index) => `${example.network}-${index}`, ($$anchor, example) => {
		var div_20 = root_6();
		var div_21 = $.child(div_20);
		var text_30 = $.only_child(div_21, true);
		var div_22 = $.sibling(div_21, 2);
		var div_23 = $.child(div_22);
		var code_11 = $.sibling($.child(div_23), 2);
		var text_31 = $.only_child(code_11, true);

		$.reset(div_23);

		var div_24 = $.sibling(div_23, 2);
		var code_12 = $.sibling($.child(div_24), 2);
		var text_32 = $.only_child(code_12, true);

		$.reset(div_24);

		var node_7 = $.sibling(div_24, 4);

		$.each(node_7, 19, () => $.get(example).subZones, (zone, index) => `subzone-${index}`, ($$anchor, zone, index, $$array_3) => {
			var code_13 = root_1();
			var text_33 = $.only_child(code_13, true);

			$.template_effect(() => $.set_text(text_33, $.get(zone)));
			$.append($$anchor, code_13);
		});

		var div_25 = $.sibling(node_7, 2);
		var text_34 = $.sibling($.child(div_25));

		$.reset(div_25);
		$.reset(div_22);
		$.reset(div_20);

		$.template_effect(() => {
			$.set_text(text_30, $.get(example).scenario);
			$.set_text(text_31, $.get(example).network);
			$.set_text(text_32, $.get(example).reverseZone);
			$.set_text(text_34, ` ${$.get(example).management ?? ''}`);
		});

		$.append($$anchor, div_20);
	});

	$.reset(div_19);

	var div_26 = $.sibling(div_19, 2);
	var h2_4 = $.child(div_26);
	var text_35 = $.only_child(h2_4, true);
	var div_27 = $.sibling(h2_4, 2);
	var div_28 = $.child(div_27);
	var div_29 = $.child(div_28);
	var text_36 = $.only_child(div_29);
	var div_30 = $.sibling(div_29, 2);
	var code_14 = $.sibling($.child(div_30), 2);
	var text_37 = $.only_child(code_14, true);

	$.reset(div_30);

	var pre = $.sibling(div_30, 4);
	var code_15 = $.child(pre);
	var text_38 = $.only_child(code_15, true);

	$.reset(pre);

	var ul = $.sibling(pre, 4);

	$.each(ul, 23, () => reverseZonesContent.zoneCreation.ipv4Example.explanation, (point, index) => `ipv4-point-${index}`, ($$anchor, point) => {
		var li = root_7();
		var text_39 = $.only_child(li, true);

		$.template_effect(() => $.set_text(text_39, $.get(point)));
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(div_28);

	var div_31 = $.sibling(div_28, 2);
	var div_32 = $.child(div_31);
	var text_40 = $.only_child(div_32);
	var div_33 = $.sibling(div_32, 2);
	var code_16 = $.sibling($.child(div_33), 2);
	var text_41 = $.only_child(code_16, true);

	$.reset(div_33);

	var pre_1 = $.sibling(div_33, 4);
	var code_17 = $.child(pre_1);
	var text_42 = $.only_child(code_17, true);

	$.reset(pre_1);

	var ul_1 = $.sibling(pre_1, 4);

	$.each(ul_1, 23, () => reverseZonesContent.zoneCreation.ipv6Example.explanation, (point, index) => `ipv6-point-${index}`, ($$anchor, point) => {
		var li_1 = root_7();
		var text_43 = $.only_child(li_1, true);

		$.template_effect(() => $.set_text(text_43, $.get(point)));
		$.append($$anchor, li_1);
	});

	$.reset(ul_1);
	$.reset(div_31);
	$.reset(div_27);
	$.reset(div_26);

	var div_34 = $.sibling(div_26, 2);
	var node_8 = $.sibling($.child(div_34), 2);

	$.each(node_8, 19, () => reverseZonesContent.delegationScenarios, (scenario, index) => `${scenario.scenario}-${index}`, ($$anchor, scenario) => {
		var div_35 = root_10();
		var div_36 = $.child(div_35);
		var text_44 = $.only_child(div_36, true);
		var div_37 = $.sibling(div_36, 2);
		var div_38 = $.child(div_37);
		var text_45 = $.sibling($.child(div_38));

		$.reset(div_38);

		var node_9 = $.sibling(div_38, 2);

		{
			var consequent_1 = ($$anchor) => {
				var fragment_2 = root_8();
				var ul_2 = $.sibling($.first_child(fragment_2), 2);

				$.each(ul_2, 23, () => $.get(scenario).customerActions, (action, index) => `customer-${index}`, ($$anchor, action, index, $$array_4) => {
					var li_2 = root_7();
					var text_46 = $.only_child(li_2, true);

					$.template_effect(() => $.set_text(text_46, $.get(action)));
					$.append($$anchor, li_2);
				});

				$.reset(ul_2);

				var ul_3 = $.sibling(ul_2, 4);

				$.each(ul_3, 23, () => $.get(scenario).ispActions, (action, index) => `isp-${index}`, ($$anchor, action, index, $$array_5) => {
					var li_3 = root_7();
					var text_47 = $.only_child(li_3, true);

					$.template_effect(() => $.set_text(text_47, $.get(action)));
					$.append($$anchor, li_3);
				});

				$.reset(ul_3);
				$.append($$anchor, fragment_2);
			};

			var alternate_1 = ($$anchor) => {
				var fragment_3 = root_9();
				var ol = $.sibling($.first_child(fragment_3), 2);

				$.each(ol, 23, () => $.get(scenario).process, (step, index) => `process-${index}`, ($$anchor, step, index, $$array_6) => {
					var li_4 = root_7();
					var text_48 = $.only_child(li_4, true);

					$.template_effect(() => $.set_text(text_48, $.get(step)));
					$.append($$anchor, li_4);
				});

				$.reset(ol);
				$.append($$anchor, fragment_3);
			};

			$.if(node_9, ($$render) => {
				if ($.get(scenario).customerActions) $$render(consequent_1); else $$render(alternate_1, -1);
			});
		}

		$.reset(div_37);
		$.reset(div_35);

		$.template_effect(() => {
			$.set_text(text_44, $.get(scenario).scenario);
			$.set_text(text_45, ` ${$.get(scenario).delegation ?? ''}`);
		});

		$.append($$anchor, div_35);
	});

	$.reset(div_34);

	var div_39 = $.sibling(div_34, 2);
	var node_10 = $.sibling($.child(div_39), 2);

	$.each(node_10, 19, () => reverseZonesContent.troubleshooting, (issue, index) => `${issue.issue}-${index}`, ($$anchor, issue) => {
		var div_40 = root_11();
		var div_41 = $.child(div_40);
		var node_11 = $.child(div_41);

		Icon(node_11, { name: 'help-circle', size: 'sm' });

		var text_49 = $.sibling(node_11);

		$.reset(div_41);

		var div_42 = $.sibling(div_41, 2);
		var p_3 = $.child(div_42);
		var text_50 = $.sibling($.child(p_3));

		$.reset(p_3);

		var p_4 = $.sibling(p_3, 2);
		var text_51 = $.sibling($.child(p_4));

		$.reset(p_4);

		var p_5 = $.sibling(p_4, 2);
		var text_52 = $.sibling($.child(p_5));

		$.reset(p_5);
		$.reset(div_42);
		$.reset(div_40);

		$.template_effect(
			($0) => {
				$.set_text(text_49, ` ${$.get(issue).issue ?? ''}`);
				$.set_text(text_50, ` ${$0 ?? ''}`);
				$.set_text(text_51, ` ${$.get(issue).diagnosis ?? ''}`);
				$.set_text(text_52, ` ${$.get(issue).solution ?? ''}`);
			},
			[() => $.get(issue).causes.join(', ')]
		);

		$.append($$anchor, div_40);
	});

	$.reset(div_39);

	var div_43 = $.sibling(div_39, 2);
	var ul_4 = $.sibling($.child(div_43), 2);

	$.each(ul_4, 23, () => reverseZonesContent.bestPractices, (practice, index) => `practice-${index}`, ($$anchor, practice) => {
		var li_5 = root_7();
		var text_53 = $.only_child(li_5, true);

		$.template_effect(() => $.set_text(text_53, $.get(practice)));
		$.append($$anchor, li_5);
	});

	$.reset(ul_4);
	$.reset(div_43);

	var div_44 = $.sibling(div_43, 2);
	var div_45 = $.sibling($.child(div_44), 2);
	var div_46 = $.child(div_45);
	var node_12 = $.sibling($.child(div_46), 2);

	$.each(node_12, 19, () => reverseZonesContent.quickReference.zoneFormulas, (formula, index) => `formula-${index}`, ($$anchor, formula) => {
		var div_47 = root_12();
		var text_54 = $.only_child(div_47, true);

		$.template_effect(() => $.set_text(text_54, $.get(formula)));
		$.append($$anchor, div_47);
	});

	$.reset(div_46);

	var div_48 = $.sibling(div_46, 2);
	var node_13 = $.sibling($.child(div_48), 2);

	$.each(node_13, 19, () => reverseZonesContent.quickReference.essentialRecords, (record, index) => `record-${index}`, ($$anchor, record) => {
		var div_49 = root_13();
		var text_55 = $.only_child(div_49, true);

		$.template_effect(() => $.set_text(text_55, $.get(record)));
		$.append($$anchor, div_49);
	});

	$.reset(div_48);
	$.reset(div_45);

	var div_50 = $.sibling(div_45, 2);
	var div_51 = $.child(div_50);
	var node_14 = $.child(div_51);

	Icon(node_14, { name: 'key', size: 'sm' });
	$.next();
	$.reset(div_51);
	$.next(2);
	$.reset(div_50);
	$.reset(div_44);

	var div_52 = $.sibling(div_44, 2);
	var div_53 = $.sibling($.child(div_52), 2);

	$.each(div_53, 23, () => reverseZonesContent.tools, (tool, index) => `${tool.tool}-${index}`, ($$anchor, tool) => {
		var div_54 = root_14();
		var div_55 = $.child(div_54);
		var text_56 = $.only_child(div_55, true);
		var div_56 = $.sibling(div_55, 2);
		var text_57 = $.only_child(div_56, true);

		$.reset(div_54);

		$.template_effect(() => {
			$.set_text(text_56, $.get(tool).tool);
			$.set_text(text_57, $.get(tool).purpose);
		});

		$.append($$anchor, div_54);
	});

	$.reset(div_53);
	$.reset(div_52);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, reverseZonesContent.title);
		$.set_text(text_1, reverseZonesContent.description);
		$.set_text(text_2, reverseZonesContent.sections.overview.title);
		$.set_text(text_3, reverseZonesContent.sections.overview.content);
		$.set_text(text_4, reverseZonesContent.sections.delegation.title);
		$.set_text(text_5, reverseZonesContent.sections.delegation.content);
		$.set_text(text_6, reverseZonesContent.ipv4Zones.title);
		$.set_text(text_24, reverseZonesContent.ipv6Zones.title);
		$.set_text(text_35, reverseZonesContent.zoneCreation.title);
		$.set_text(text_36, `IPv4 Example (${reverseZonesContent.zoneCreation.ipv4Example.network ?? ''})`);
		$.set_text(text_37, reverseZonesContent.zoneCreation.ipv4Example.zoneName);
		$.set_text(text_38, reverseZonesContent.zoneCreation.ipv4Example.zoneFile);
		$.set_text(text_40, `IPv6 Example (${reverseZonesContent.zoneCreation.ipv6Example.network ?? ''})`);
		$.set_text(text_41, reverseZonesContent.zoneCreation.ipv6Example.zoneName);
		$.set_text(text_42, reverseZonesContent.zoneCreation.ipv6Example.zoneFile);
	});

	$.append($$anchor, div);
	$.pop();
}