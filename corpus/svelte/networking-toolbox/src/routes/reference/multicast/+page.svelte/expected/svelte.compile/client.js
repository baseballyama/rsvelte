import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { multicastContent } from '$lib/content/multicast.js';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<div class="example-input"> </div>`);
var root_1 = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><div><strong>Range:</strong> <code> </code></div> <div><strong>Description:</strong> </div> <div><strong>Scope:</strong> </div> <div><strong>Examples:</strong></div> <!></div></div>`);
var root_2 = $.from_html(`<div class="item-code"> </div>`);
var root_3 = $.from_html(`<tr><td><code> </code></td><td> </td><td> </td></tr>`);
var root_4 = $.from_html(`<tr><td><strong> </strong></td><td><code> </code></td><td><code> </code></td><td> </td></tr>`);
var root_5 = $.from_html(`<li> </li>`);
var root_6 = $.from_html(`<div class="ref-warning"><div class="warning-title"><!> </div> <div class="warning-content"><p> </p> <ul></ul></div></div>`);
var root_7 = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><div><strong>Common Causes:</strong></div> <ul></ul> <div><strong>Solutions:</strong></div> <ul></ul></div></div>`);

var root_8 = $.from_html(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1> </h1> <p class="subtitle"> </p></div> <div class="ref-section"><h2> </h2> <p> </p></div> <div class="ref-section"><h2> </h2> <p><strong>Range:</strong> <code> </code></p> <!></div> <div class="ref-section"><h2> </h2> <p><strong>Range:</strong> <code> </code></p> <h3>Address Structure</h3> <p><strong>Format:</strong> <code> </code></p> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title">Flag Bits</div> <!></div> <div class="grid-item"><div class="item-title">Scope Values</div> <!></div></div> <h3>Well-Known IPv6 Multicast Addresses</h3> <table class="ref-table"><thead><tr><th>Address</th><th>Name</th><th>Description</th></tr></thead><tbody></tbody></table></div> <div class="ref-section"><h2>Common Protocol Multicast Addresses</h2> <table class="ref-table"><thead><tr><th>Protocol</th><th>IPv4</th><th>IPv6</th><th>Purpose</th></tr></thead><tbody></tbody></table></div> <div class="ref-section"><h2>Important Limitations</h2> <!></div> <div class="ref-section"><h2>Troubleshooting Common Issues</h2> <!></div> <div class="ref-section"><h2>Best Practices</h2> <ul></ul></div> <div class="ref-section"><h2>Quick Reference</h2> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title">IPv4 Quick List</div> <!></div> <div class="grid-item"><div class="item-title">IPv6 Quick List</div> <!></div></div> <div class="ref-highlight"><div class="highlight-title"><!> Key Remember</div> <div class="highlight-content">Most multicast addresses are designed for local subnet use only. Without proper multicast routing
          configuration, traffic won't cross router boundaries.</div></div></div></div></div>`);

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
	var code = $.sibling($.child(p_2), 2);
	var text_5 = $.only_child(code, true);

	$.reset(p_2);

	var node = $.sibling(p_2, 2);

	$.each(node, 19, () => multicastContent.ipv4Multicast.classes, (multicastClass, index) => `${multicastClass.name}-${index}`, ($$anchor, multicastClass) => {
		var div_5 = root_1();
		var div_6 = $.child(div_5);
		var text_6 = $.only_child(div_6, true);
		var div_7 = $.sibling(div_6, 2);
		var div_8 = $.child(div_7);
		var code_1 = $.sibling($.child(div_8), 2);
		var text_7 = $.only_child(code_1, true);

		$.reset(div_8);

		var div_9 = $.sibling(div_8, 2);
		var text_8 = $.sibling($.child(div_9));

		$.reset(div_9);

		var div_10 = $.sibling(div_9, 2);
		var text_9 = $.sibling($.child(div_10));

		$.reset(div_10);

		var node_1 = $.sibling(div_10, 4);

		$.each(node_1, 19, () => $.get(multicastClass).examples, (example, index) => `example-${index}`, ($$anchor, example, index, $$array) => {
			var div_11 = root();
			var text_10 = $.only_child(div_11, true);

			$.template_effect(() => $.set_text(text_10, $.get(example)));
			$.append($$anchor, div_11);
		});

		$.reset(div_7);
		$.reset(div_5);

		$.template_effect(() => {
			$.set_text(text_6, $.get(multicastClass).name);
			$.set_text(text_7, $.get(multicastClass).range);
			$.set_text(text_8, ` ${$.get(multicastClass).description ?? ''}`);
			$.set_text(text_9, ` ${$.get(multicastClass).scope ?? ''}`);
		});

		$.append($$anchor, div_5);
	});

	$.reset(div_4);

	var div_12 = $.sibling(div_4, 2);
	var h2_2 = $.child(div_12);
	var text_11 = $.only_child(h2_2, true);
	var p_3 = $.sibling(h2_2, 2);
	var code_2 = $.sibling($.child(p_3), 2);
	var text_12 = $.only_child(code_2, true);

	$.reset(p_3);

	var p_4 = $.sibling(p_3, 4);
	var code_3 = $.sibling($.child(p_4), 2);
	var text_13 = $.only_child(code_3, true);

	$.reset(p_4);

	var div_13 = $.sibling(p_4, 2);
	var div_14 = $.child(div_13);
	var node_2 = $.sibling($.child(div_14), 2);

	$.each(node_2, 19, () => multicastContent.ipv6Multicast.structure.flags, (flag, index) => `flag-${index}`, ($$anchor, flag) => {
		var div_15 = root_2();
		var text_14 = $.only_child(div_15);

		$.template_effect(() => $.set_text(text_14, `${$.get(flag).bit ?? ''} - ${$.get(flag).meaning ?? ''}`));
		$.append($$anchor, div_15);
	});

	$.reset(div_14);

	var div_16 = $.sibling(div_14, 2);
	var node_3 = $.sibling($.child(div_16), 2);

	$.each(node_3, 19, () => multicastContent.ipv6Multicast.structure.scopes, (scope, index) => `scope-${index}`, ($$anchor, scope) => {
		var div_17 = root_2();
		var text_15 = $.only_child(div_17);

		$.template_effect(() => $.set_text(text_15, `${$.get(scope).code ?? ''} - ${$.get(scope).name ?? ''}`));
		$.append($$anchor, div_17);
	});

	$.reset(div_16);
	$.reset(div_13);

	var table = $.sibling(div_13, 4);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 23, () => multicastContent.ipv6Multicast.wellKnown, (addr, index) => `${addr.address}-${index}`, ($$anchor, addr) => {
		var tr = root_3();
		var td = $.child(tr);
		var code_4 = $.child(td);
		var text_16 = $.only_child(code_4, true);

		$.reset(td);

		var td_1 = $.sibling(td);
		var text_17 = $.only_child(td_1, true);
		var td_2 = $.sibling(td_1);
		var text_18 = $.only_child(td_2, true);

		$.reset(tr);

		$.template_effect(() => {
			$.set_text(text_16, $.get(addr).address);
			$.set_text(text_17, $.get(addr).name);
			$.set_text(text_18, $.get(addr).description);
		});

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(div_12);

	var div_18 = $.sibling(div_12, 2);
	var table_1 = $.sibling($.child(div_18), 2);
	var tbody_1 = $.sibling($.child(table_1));

	$.each(tbody_1, 23, () => multicastContent.commonProtocols, (protocol, index) => `${protocol.protocol}-${index}`, ($$anchor, protocol) => {
		var tr_1 = root_4();
		var td_3 = $.child(tr_1);
		var strong = $.child(td_3);
		var text_19 = $.only_child(strong, true);

		$.reset(td_3);

		var td_4 = $.sibling(td_3);
		var code_5 = $.child(td_4);
		var text_20 = $.only_child(code_5, true);

		$.reset(td_4);

		var td_5 = $.sibling(td_4);
		var code_6 = $.child(td_5);
		var text_21 = $.only_child(code_6, true);

		$.reset(td_5);

		var td_6 = $.sibling(td_5);
		var text_22 = $.only_child(td_6, true);

		$.reset(tr_1);

		$.template_effect(() => {
			$.set_text(text_19, $.get(protocol).protocol);
			$.set_text(text_20, $.get(protocol).ipv4);
			$.set_text(text_21, $.get(protocol).ipv6);
			$.set_text(text_22, $.get(protocol).purpose);
		});

		$.append($$anchor, tr_1);
	});

	$.reset(tbody_1);
	$.reset(table_1);
	$.reset(div_18);

	var div_19 = $.sibling(div_18, 2);
	var node_4 = $.sibling($.child(div_19), 2);

	$.each(node_4, 19, () => multicastContent.limitations, (limitation, index) => `${limitation.title}-${index}`, ($$anchor, limitation) => {
		var div_20 = root_6();
		var div_21 = $.child(div_20);
		var node_5 = $.child(div_21);

		Icon(node_5, { name: 'alert-triangle', size: 'sm' });

		var text_23 = $.sibling(node_5);

		$.reset(div_21);

		var div_22 = $.sibling(div_21, 2);
		var p_5 = $.child(div_22);
		var text_24 = $.only_child(p_5, true);
		var ul = $.sibling(p_5, 2);

		$.each(ul, 23, () => $.get(limitation).details, (detail, index) => `detail-${index}`, ($$anchor, detail, index, $$array_1) => {
			var li = root_5();
			var text_25 = $.only_child(li, true);

			$.template_effect(() => $.set_text(text_25, $.get(detail)));
			$.append($$anchor, li);
		});

		$.reset(ul);
		$.reset(div_22);
		$.reset(div_20);

		$.template_effect(() => {
			$.set_text(text_23, ` ${$.get(limitation).title ?? ''}`);
			$.set_text(text_24, $.get(limitation).description);
		});

		$.append($$anchor, div_20);
	});

	$.reset(div_19);

	var div_23 = $.sibling(div_19, 2);
	var node_6 = $.sibling($.child(div_23), 2);

	$.each(node_6, 19, () => multicastContent.troubleshooting, (issue, index) => `${issue.issue}-${index}`, ($$anchor, issue) => {
		var div_24 = root_7();
		var div_25 = $.child(div_24);
		var text_26 = $.only_child(div_25, true);
		var div_26 = $.sibling(div_25, 2);
		var ul_1 = $.sibling($.child(div_26), 2);

		$.each(ul_1, 23, () => $.get(issue).causes, (cause, index) => `cause-${index}`, ($$anchor, cause, index, $$array_2) => {
			var li_1 = root_5();
			var text_27 = $.only_child(li_1, true);

			$.template_effect(() => $.set_text(text_27, $.get(cause)));
			$.append($$anchor, li_1);
		});

		$.reset(ul_1);

		var ul_2 = $.sibling(ul_1, 4);

		$.each(ul_2, 23, () => $.get(issue).solutions, (solution, index) => `solution-${index}`, ($$anchor, solution, index, $$array_3) => {
			var li_2 = root_5();
			var text_28 = $.only_child(li_2, true);

			$.template_effect(() => $.set_text(text_28, $.get(solution)));
			$.append($$anchor, li_2);
		});

		$.reset(ul_2);
		$.reset(div_26);
		$.reset(div_24);
		$.template_effect(() => $.set_text(text_26, $.get(issue).issue));
		$.append($$anchor, div_24);
	});

	$.reset(div_23);

	var div_27 = $.sibling(div_23, 2);
	var ul_3 = $.sibling($.child(div_27), 2);

	$.each(ul_3, 23, () => multicastContent.bestPractices, (practice, index) => `practice-${index}`, ($$anchor, practice) => {
		var li_3 = root_5();
		var text_29 = $.only_child(li_3, true);

		$.template_effect(() => $.set_text(text_29, $.get(practice)));
		$.append($$anchor, li_3);
	});

	$.reset(ul_3);
	$.reset(div_27);

	var div_28 = $.sibling(div_27, 2);
	var div_29 = $.sibling($.child(div_28), 2);
	var div_30 = $.child(div_29);
	var node_7 = $.sibling($.child(div_30), 2);

	$.each(node_7, 19, () => multicastContent.quickReference.ipv4, (addr, index) => `ipv4-${index}`, ($$anchor, addr) => {
		var div_31 = root_2();
		var text_30 = $.only_child(div_31, true);

		$.template_effect(() => $.set_text(text_30, $.get(addr)));
		$.append($$anchor, div_31);
	});

	$.reset(div_30);

	var div_32 = $.sibling(div_30, 2);
	var node_8 = $.sibling($.child(div_32), 2);

	$.each(node_8, 19, () => multicastContent.quickReference.ipv6, (addr, index) => `ipv6-${index}`, ($$anchor, addr) => {
		var div_33 = root_2();
		var text_31 = $.only_child(div_33, true);

		$.template_effect(() => $.set_text(text_31, $.get(addr)));
		$.append($$anchor, div_33);
	});

	$.reset(div_32);
	$.reset(div_29);

	var div_34 = $.sibling(div_29, 2);
	var div_35 = $.child(div_34);
	var node_9 = $.child(div_35);

	Icon(node_9, { name: 'wifi', size: 'sm' });
	$.next();
	$.reset(div_35);
	$.next(2);
	$.reset(div_34);
	$.reset(div_28);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, multicastContent.title);
		$.set_text(text_1, multicastContent.description);
		$.set_text(text_2, multicastContent.sections.overview.title);
		$.set_text(text_3, multicastContent.sections.overview.content);
		$.set_text(text_4, multicastContent.ipv4Multicast.title);
		$.set_text(text_5, multicastContent.ipv4Multicast.range);
		$.set_text(text_11, multicastContent.ipv6Multicast.title);
		$.set_text(text_12, multicastContent.ipv6Multicast.range);
		$.set_text(text_13, multicastContent.ipv6Multicast.structure.format);
	});

	$.append($$anchor, div);
	$.pop();
}