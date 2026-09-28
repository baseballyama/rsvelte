import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cgnatContent } from '$lib/content/cgnat.js';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<tr><td><code> </code></td><td> </td><td> </td></tr>`);
var root_1 = $.from_html(`<tr><td><strong> </strong></td><td> </td><td><code> </code></td><td><code> </code></td><td> </td></tr>`);
var root_2 = $.from_html(`<li> </li>`);
var root_3 = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><div><strong>Description:</strong> </div> <div><strong>CGNAT Indicator:</strong> <span style="color: var(--color-error)"> </span></div> <div><strong>Normal Indicator:</strong> <span style="color: var(--color-success)"> </span></div></div></div>`);
var root_4 = $.from_html(`<div class="ref-warning"><div class="warning-title"><!> </div> <div class="warning-content"><p><strong>Description:</strong> </p> <p><strong>Affected Services:</strong> </p> <p><strong>Workaround:</strong> </p></div></div>`);
var root_5 = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><div><strong>Description:</strong> </div> <div><strong>Effectiveness:</strong> </div> <div><strong>Cost:</strong> </div></div></div>`);
var root_6 = $.from_html(`<div class="ref-warning"><div class="warning-title"><!> </div> <div class="warning-content"><p><strong>Cause:</strong> </p> <p><strong>Diagnosis:</strong> </p> <p><strong>Solution:</strong> </p></div></div>`);
var root_7 = $.from_html(`<div class="example-item"><div class="example-description"> </div></div>`);

var root_8 = $.from_html(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1> </h1> <p class="subtitle"> </p></div> <div class="ref-section"><h2> </h2> <p> </p></div> <div class="ref-section"><h2> </h2> <p> </p></div> <div class="ref-section"><h2>CGNAT Address Range</h2> <div class="ref-highlight"><div class="highlight-title"><!> Shared Address Space</div> <div class="highlight-content"><p><strong>Range:</strong> <code> </code></p> <p><strong>Full Range:</strong> <code> </code></p> <p><strong>Total Addresses:</strong> </p> <p><strong>RFC:</strong> </p></div></div> <h3>Address Breakdown</h3> <table class="ref-table"><thead><tr><th>Network Block</th><th>Available Addresses</th><th>Typical Use</th></tr></thead><tbody></tbody></table></div> <div class="ref-section"><h2> </h2> <p> </p> <h3>Two-Layer NAT System</h3> <table class="ref-table"><thead><tr><th>Layer</th><th>Location</th><th>Inside Address</th><th>Outside Address</th><th>Purpose</th></tr></thead><tbody></tbody></table> <h3>Traffic Flow</h3> <ol></ol></div> <div class="ref-section"><h2> </h2> <!></div> <div class="ref-section"><h2>Impact on Services</h2> <h3>Negative Impacts</h3> <!> <h3>Positive Aspects</h3> <ul></ul></div> <div class="ref-section"><h2>Workarounds and Solutions</h2> <!></div> <div class="ref-section"><h2>Troubleshooting Common Issues</h2> <!></div> <div class="ref-section"><h2>Quick CGNAT Check</h2> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title">Steps to Check</div> <ol></ol></div> <div class="grid-item"><div class="item-title">What to Do Next</div> <ul></ul></div></div></div> <div class="ref-section"><h2>Best Practices</h2> <ul></ul></div> <div class="ref-section"><h2>ISP Perspective</h2> <div class="ref-examples"><div class="examples-title">Why ISPs Use CGNAT</div> <!></div> <div class="ref-highlight"><div class="highlight-title"><!> Understanding the Trade-off</div> <div class="highlight-content">CGNAT is a necessary compromise. It allows ISPs to provide affordable internet service during IPv4 exhaustion,
          but at the cost of some functionality. The long-term solution is IPv6 adoption.</div></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var div = root_8();
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
	var div_6 = $.sibling($.child(div_5), 2);
	var div_7 = $.child(div_6);
	var node = $.child(div_7);

	Icon(node, { name: 'globe', size: 'sm' });
	$.next();
	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var p_3 = $.child(div_8);
	var code = $.sibling($.child(p_3), 2);
	var text_6 = $.only_child(code, true);

	$.reset(p_3);

	var p_4 = $.sibling(p_3, 2);
	var code_1 = $.sibling($.child(p_4), 2);
	var text_7 = $.only_child(code_1, true);

	$.reset(p_4);

	var p_5 = $.sibling(p_4, 2);
	var text_8 = $.sibling($.child(p_5));

	$.reset(p_5);

	var p_6 = $.sibling(p_5, 2);
	var text_9 = $.sibling($.child(p_6));

	$.reset(p_6);
	$.reset(div_8);
	$.reset(div_6);

	var table = $.sibling(div_6, 4);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 23, () => cgnatContent.addressRange.breakdown, (block, index) => `${block.network}-${index}`, ($$anchor, block) => {
		var tr = root();
		var td = $.child(tr);
		var code_2 = $.child(td);
		var text_10 = $.only_child(code_2, true);

		$.reset(td);

		var td_1 = $.sibling(td);
		var text_11 = $.only_child(td_1, true);
		var td_2 = $.sibling(td_1);
		var text_12 = $.only_child(td_2, true);

		$.reset(tr);

		$.template_effect(() => {
			$.set_text(text_10, $.get(block).network);
			$.set_text(text_11, $.get(block).addresses);
			$.set_text(text_12, $.get(block).use);
		});

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(div_5);

	var div_9 = $.sibling(div_5, 2);
	var h2_2 = $.child(div_9);
	var text_13 = $.only_child(h2_2, true);
	var p_7 = $.sibling(h2_2, 2);
	var text_14 = $.only_child(p_7, true);
	var table_1 = $.sibling(p_7, 4);
	var tbody_1 = $.sibling($.child(table_1));

	$.each(tbody_1, 23, () => cgnatContent.howItWorks.layers, (layer, index) => `${layer.layer}-${index}`, ($$anchor, layer) => {
		var tr_1 = root_1();
		var td_3 = $.child(tr_1);
		var strong = $.child(td_3);
		var text_15 = $.only_child(strong, true);

		$.reset(td_3);

		var td_4 = $.sibling(td_3);
		var text_16 = $.only_child(td_4, true);
		var td_5 = $.sibling(td_4);
		var code_3 = $.child(td_5);
		var text_17 = $.only_child(code_3, true);

		$.reset(td_5);

		var td_6 = $.sibling(td_5);
		var code_4 = $.child(td_6);
		var text_18 = $.only_child(code_4, true);

		$.reset(td_6);

		var td_7 = $.sibling(td_6);
		var text_19 = $.only_child(td_7, true);

		$.reset(tr_1);

		$.template_effect(() => {
			$.set_text(text_15, $.get(layer).layer);
			$.set_text(text_16, $.get(layer).location);
			$.set_text(text_17, $.get(layer).inside);
			$.set_text(text_18, $.get(layer).outside);
			$.set_text(text_19, $.get(layer).purpose);
		});

		$.append($$anchor, tr_1);
	});

	$.reset(tbody_1);
	$.reset(table_1);

	var ol = $.sibling(table_1, 4);

	$.each(ol, 23, () => cgnatContent.howItWorks.flow, (step, index) => `flow-step-${index}`, ($$anchor, step) => {
		var li = root_2();
		var text_20 = $.only_child(li, true);

		$.template_effect(() => $.set_text(text_20, $.get(step)));
		$.append($$anchor, li);
	});

	$.reset(ol);
	$.reset(div_9);

	var div_10 = $.sibling(div_9, 2);
	var h2_3 = $.child(div_10);
	var text_21 = $.only_child(h2_3, true);
	var node_1 = $.sibling(h2_3, 2);

	$.each(node_1, 19, () => cgnatContent.identification.methods, (method, index) => `${method.method}-${index}`, ($$anchor, method) => {
		var div_11 = root_3();
		var div_12 = $.child(div_11);
		var text_22 = $.only_child(div_12, true);
		var div_13 = $.sibling(div_12, 2);
		var div_14 = $.child(div_13);
		var text_23 = $.sibling($.child(div_14));

		$.reset(div_14);

		var div_15 = $.sibling(div_14, 2);
		var span = $.sibling($.child(div_15), 2);
		var text_24 = $.only_child(span, true);

		$.reset(div_15);

		var div_16 = $.sibling(div_15, 2);
		var span_1 = $.sibling($.child(div_16), 2);
		var text_25 = $.only_child(span_1, true);

		$.reset(div_16);
		$.reset(div_13);
		$.reset(div_11);

		$.template_effect(() => {
			$.set_text(text_22, $.get(method).method);
			$.set_text(text_23, ` ${$.get(method).description ?? ''}`);
			$.set_text(text_24, $.get(method).cgnatIndicator);
			$.set_text(text_25, $.get(method).normalIndicator);
		});

		$.append($$anchor, div_11);
	});

	$.reset(div_10);

	var div_17 = $.sibling(div_10, 2);
	var node_2 = $.sibling($.child(div_17), 4);

	$.each(node_2, 19, () => cgnatContent.impacts.negative, (impact, index) => `${impact.impact}-${index}`, ($$anchor, impact) => {
		var div_18 = root_4();
		var div_19 = $.child(div_18);
		var node_3 = $.child(div_19);

		Icon(node_3, { name: 'x-circle', size: 'sm' });

		var text_26 = $.sibling(node_3);

		$.reset(div_19);

		var div_20 = $.sibling(div_19, 2);
		var p_8 = $.child(div_20);
		var text_27 = $.sibling($.child(p_8));

		$.reset(p_8);

		var p_9 = $.sibling(p_8, 2);
		var text_28 = $.sibling($.child(p_9));

		$.reset(p_9);

		var p_10 = $.sibling(p_9, 2);
		var text_29 = $.sibling($.child(p_10));

		$.reset(p_10);
		$.reset(div_20);
		$.reset(div_18);

		$.template_effect(
			($0) => {
				$.set_text(text_26, ` ${$.get(impact).impact ?? ''}`);
				$.set_text(text_27, ` ${$.get(impact).description ?? ''}`);
				$.set_text(text_28, ` ${$0 ?? ''}`);
				$.set_text(text_29, ` ${$.get(impact).workaround ?? ''}`);
			},
			[() => $.get(impact).affectedServices.join(', ')]
		);

		$.append($$anchor, div_18);
	});

	var ul = $.sibling(node_2, 4);

	$.each(ul, 23, () => cgnatContent.impacts.positive, (positive, index) => `positive-${index}`, ($$anchor, positive) => {
		var li_1 = root_2();
		var text_30 = $.only_child(li_1, true);

		$.template_effect(() => $.set_text(text_30, $.get(positive)));
		$.append($$anchor, li_1);
	});

	$.reset(ul);
	$.reset(div_17);

	var div_21 = $.sibling(div_17, 2);
	var node_4 = $.sibling($.child(div_21), 2);

	$.each(node_4, 19, () => cgnatContent.workarounds, (solution, index) => `${solution.solution}-${index}`, ($$anchor, solution) => {
		var div_22 = root_5();
		var div_23 = $.child(div_22);
		var text_31 = $.only_child(div_23, true);
		var div_24 = $.sibling(div_23, 2);
		var div_25 = $.child(div_24);
		var text_32 = $.sibling($.child(div_25));

		$.reset(div_25);

		var div_26 = $.sibling(div_25, 2);
		var text_33 = $.sibling($.child(div_26));

		$.reset(div_26);

		var div_27 = $.sibling(div_26, 2);
		var text_34 = $.sibling($.child(div_27));

		$.reset(div_27);
		$.reset(div_24);
		$.reset(div_22);

		$.template_effect(() => {
			$.set_text(text_31, $.get(solution).solution);
			$.set_text(text_32, ` ${$.get(solution).description ?? ''}`);
			$.set_text(text_33, ` ${$.get(solution).effectiveness ?? ''}`);
			$.set_text(text_34, ` ${$.get(solution).cost ?? ''}`);
		});

		$.append($$anchor, div_22);
	});

	$.reset(div_21);

	var div_28 = $.sibling(div_21, 2);
	var node_5 = $.sibling($.child(div_28), 2);

	$.each(node_5, 19, () => cgnatContent.troubleshooting, (issue, index) => `${issue.issue}-${index}`, ($$anchor, issue) => {
		var div_29 = root_6();
		var div_30 = $.child(div_29);
		var node_6 = $.child(div_30);

		Icon(node_6, { name: 'help-circle', size: 'sm' });

		var text_35 = $.sibling(node_6);

		$.reset(div_30);

		var div_31 = $.sibling(div_30, 2);
		var p_11 = $.child(div_31);
		var text_36 = $.sibling($.child(p_11));

		$.reset(p_11);

		var p_12 = $.sibling(p_11, 2);
		var text_37 = $.sibling($.child(p_12));

		$.reset(p_12);

		var p_13 = $.sibling(p_12, 2);
		var text_38 = $.sibling($.child(p_13));

		$.reset(p_13);
		$.reset(div_31);
		$.reset(div_29);

		$.template_effect(() => {
			$.set_text(text_35, ` ${$.get(issue).issue ?? ''}`);
			$.set_text(text_36, ` ${$.get(issue).cause ?? ''}`);
			$.set_text(text_37, ` ${$.get(issue).diagnosis ?? ''}`);
			$.set_text(text_38, ` ${$.get(issue).solution ?? ''}`);
		});

		$.append($$anchor, div_29);
	});

	$.reset(div_28);

	var div_32 = $.sibling(div_28, 2);
	var div_33 = $.sibling($.child(div_32), 2);
	var div_34 = $.child(div_33);
	var ol_1 = $.sibling($.child(div_34), 2);

	$.each(ol_1, 23, () => cgnatContent.quickCheck.steps, (step, index) => `quickcheck-step-${index}`, ($$anchor, step) => {
		var li_2 = root_2();
		var text_39 = $.only_child(li_2, true);

		$.template_effect(() => $.set_text(text_39, $.get(step)));
		$.append($$anchor, li_2);
	});

	$.reset(ol_1);
	$.reset(div_34);

	var div_35 = $.sibling(div_34, 2);
	var ul_1 = $.sibling($.child(div_35), 2);

	$.each(ul_1, 23, () => cgnatContent.quickCheck.whatToDo, (action, index) => `whatToDo-${index}`, ($$anchor, action) => {
		var li_3 = root_2();
		var text_40 = $.only_child(li_3, true);

		$.template_effect(() => $.set_text(text_40, $.get(action)));
		$.append($$anchor, li_3);
	});

	$.reset(ul_1);
	$.reset(div_35);
	$.reset(div_33);
	$.reset(div_32);

	var div_36 = $.sibling(div_32, 2);
	var ul_2 = $.sibling($.child(div_36), 2);

	$.each(ul_2, 23, () => cgnatContent.bestPractices, (practice, index) => `practice-${index}`, ($$anchor, practice) => {
		var li_4 = root_2();
		var text_41 = $.only_child(li_4, true);

		$.template_effect(() => $.set_text(text_41, $.get(practice)));
		$.append($$anchor, li_4);
	});

	$.reset(ul_2);
	$.reset(div_36);

	var div_37 = $.sibling(div_36, 2);
	var div_38 = $.sibling($.child(div_37), 2);
	var node_7 = $.sibling($.child(div_38), 2);

	$.each(node_7, 19, () => cgnatContent.ispPerspective, (reason, index) => `isp-reason-${index}`, ($$anchor, reason) => {
		var div_39 = root_7();
		var div_40 = $.child(div_39);
		var text_42 = $.only_child(div_40, true);

		$.reset(div_39);
		$.template_effect(() => $.set_text(text_42, $.get(reason)));
		$.append($$anchor, div_39);
	});

	$.reset(div_38);

	var div_41 = $.sibling(div_38, 2);
	var div_42 = $.child(div_41);
	var node_8 = $.child(div_42);

	Icon(node_8, { name: 'info', size: 'sm' });
	$.next();
	$.reset(div_42);
	$.next(2);
	$.reset(div_41);
	$.reset(div_37);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, cgnatContent.title);
		$.set_text(text_1, cgnatContent.description);
		$.set_text(text_2, cgnatContent.sections.overview.title);
		$.set_text(text_3, cgnatContent.sections.overview.content);
		$.set_text(text_4, cgnatContent.sections.why.title);
		$.set_text(text_5, cgnatContent.sections.why.content);
		$.set_text(text_6, cgnatContent.addressRange.range);
		$.set_text(text_7, cgnatContent.addressRange.fullRange);
		$.set_text(text_8, ` ${cgnatContent.addressRange.totalAddresses ?? ''}`);
		$.set_text(text_9, ` ${cgnatContent.addressRange.rfc ?? ''}`);
		$.set_text(text_13, cgnatContent.howItWorks.title);
		$.set_text(text_14, cgnatContent.howItWorks.description);
		$.set_text(text_21, cgnatContent.identification.title);
	});

	$.append($$anchor, div);
	$.pop();
}