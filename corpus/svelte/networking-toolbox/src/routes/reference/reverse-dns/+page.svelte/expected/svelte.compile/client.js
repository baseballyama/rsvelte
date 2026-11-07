import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { reverseDnsContent } from '$lib/content/reverse-dns.js';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<li> </li>`);
var root_1 = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><div><strong>Reverse Name:</strong> <code> </code></div> <div><strong>PTR Record:</strong> <code> </code></div> <div><strong>Explanation:</strong> </div></div></div>`);
var root_2 = $.from_html(`<tr><td><code> </code></td><td><code> </code></td><td> </td></tr>`);
var root_3 = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><div><strong>Expanded:</strong> <code> </code></div> <div><strong>Reverse Name:</strong> <code style="font-size: 0.8em; word-break: break-all;"> </code></div> <div><strong>PTR Record:</strong> <code> </code></div> <div><strong>Note:</strong> </div></div></div>`);
var root_4 = $.from_html(`<tr><td><code> </code></td><td> </td><td><code> </code></td></tr>`);
var root_5 = $.from_html(`<div class="ref-warning"><div class="warning-title"><!> </div> <div class="warning-content"><p><strong>Causes:</strong> </p> <p><strong>Solutions:</strong> </p></div></div>`);
var root_6 = $.from_html(`<div class="item-code"> </div>`);
var root_7 = $.from_html(`<div class="grid-item"><div class="item-title"> </div> <div class="item-description"> </div></div>`);

var root_8 = $.from_html(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1> </h1> <p class="subtitle"> </p></div> <div class="ref-section"><h2> </h2> <p> </p></div> <div class="ref-section"><h2> </h2> <p> </p></div> <div class="ref-section"><h2> </h2> <h3>Process Steps</h3> <ol></ol> <h3>IPv4 Examples</h3> <!> <h3>Network Delegation</h3> <p> </p> <table class="ref-table"><thead><tr><th>Network</th><th>Reverse Zone</th><th>Description</th></tr></thead><tbody></tbody></table></div> <div class="ref-section"><h2> </h2> <h3>Process Steps</h3> <ol></ol> <h3>IPv6 Examples</h3> <!> <div class="ref-warning"><div class="warning-title"><!> IPv6 Complexity</div> <div class="warning-content">IPv6 reverse DNS names are much longer than IPv4 because each hex digit becomes a separate label. A single
          IPv6 address creates a 72-character reverse DNS name!</div></div></div> <div class="ref-section"><h2> </h2> <h3>Command Examples</h3> <table class="ref-table"><thead><tr><th>Command</th><th>Description</th><th>Expected Result</th></tr></thead><tbody></tbody></table> <h3>Common Use Cases</h3> <ul></ul></div> <div class="ref-section"><h2>Troubleshooting Common Issues</h2> <!></div> <div class="ref-section"><h2>Best Practices</h2> <ul></ul></div> <div class="ref-section"><h2>Quick Reference & Tools</h2> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title">IPv4 Quick Examples</div> <!></div> <div class="grid-item"><div class="item-title">IPv6 Quick Examples</div> <!></div></div> <h3>Useful Tools</h3> <div class="ref-grid two-col"></div></div></div></div>`);

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
	var h2_2 = $.child(div_5);
	var text_6 = $.only_child(h2_2, true);
	var ol = $.sibling(h2_2, 4);

	$.each(ol, 23, () => reverseDnsContent.ipv4Reverse.process, (step, index) => `ipv4-process-${index}`, ($$anchor, step) => {
		var li = root();
		var text_7 = $.only_child(li, true);

		$.template_effect(() => $.set_text(text_7, $.get(step)));
		$.append($$anchor, li);
	});

	$.reset(ol);

	var node = $.sibling(ol, 4);

	$.each(node, 19, () => reverseDnsContent.ipv4Reverse.examples, (example, index) => `${example.ip}-${index}`, ($$anchor, example) => {
		var div_6 = root_1();
		var div_7 = $.child(div_6);
		var text_8 = $.only_child(div_7);
		var div_8 = $.sibling(div_7, 2);
		var div_9 = $.child(div_8);
		var code = $.sibling($.child(div_9), 2);
		var text_9 = $.only_child(code, true);

		$.reset(div_9);

		var div_10 = $.sibling(div_9, 2);
		var code_1 = $.sibling($.child(div_10), 2);
		var text_10 = $.only_child(code_1, true);

		$.reset(div_10);

		var div_11 = $.sibling(div_10, 2);
		var text_11 = $.sibling($.child(div_11));

		$.reset(div_11);
		$.reset(div_8);
		$.reset(div_6);

		$.template_effect(() => {
			$.set_text(text_8, `IP Address: ${$.get(example).ip ?? ''}`);
			$.set_text(text_9, $.get(example).reversed);
			$.set_text(text_10, $.get(example).ptrRecord);
			$.set_text(text_11, ` ${$.get(example).explanation ?? ''}`);
		});

		$.append($$anchor, div_6);
	});

	var p_3 = $.sibling(node, 4);
	var text_12 = $.only_child(p_3, true);
	var table = $.sibling(p_3, 2);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 23, () => reverseDnsContent.ipv4Reverse.delegation.examples, (example, index) => `delegation-${index}`, ($$anchor, example) => {
		var tr = root_2();
		var td = $.child(tr);
		var code_2 = $.child(td);
		var text_13 = $.only_child(code_2, true);

		$.reset(td);

		var td_1 = $.sibling(td);
		var code_3 = $.child(td_1);
		var text_14 = $.only_child(code_3, true);

		$.reset(td_1);

		var td_2 = $.sibling(td_1);
		var text_15 = $.only_child(td_2, true);

		$.reset(tr);

		$.template_effect(() => {
			$.set_text(text_13, $.get(example).network);
			$.set_text(text_14, $.get(example).zone);
			$.set_text(text_15, $.get(example).description);
		});

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(div_5);

	var div_12 = $.sibling(div_5, 2);
	var h2_3 = $.child(div_12);
	var text_16 = $.only_child(h2_3, true);
	var ol_1 = $.sibling(h2_3, 4);

	$.each(ol_1, 23, () => reverseDnsContent.ipv6Reverse.process, (step, index) => `ipv6-process-${index}`, ($$anchor, step) => {
		var li_1 = root();
		var text_17 = $.only_child(li_1, true);

		$.template_effect(() => $.set_text(text_17, $.get(step)));
		$.append($$anchor, li_1);
	});

	$.reset(ol_1);

	var node_1 = $.sibling(ol_1, 4);

	$.each(node_1, 19, () => reverseDnsContent.ipv6Reverse.examples, (example, index) => `${example.ip}-${index}`, ($$anchor, example) => {
		var div_13 = root_3();
		var div_14 = $.child(div_13);
		var text_18 = $.only_child(div_14);
		var div_15 = $.sibling(div_14, 2);
		var div_16 = $.child(div_15);
		var code_4 = $.sibling($.child(div_16), 2);
		var text_19 = $.only_child(code_4, true);

		$.reset(div_16);

		var div_17 = $.sibling(div_16, 2);
		var code_5 = $.sibling($.child(div_17), 2);
		var text_20 = $.only_child(code_5, true);

		$.reset(div_17);

		var div_18 = $.sibling(div_17, 2);
		var code_6 = $.sibling($.child(div_18), 2);
		var text_21 = $.only_child(code_6, true);

		$.reset(div_18);

		var div_19 = $.sibling(div_18, 2);
		var text_22 = $.sibling($.child(div_19));

		$.reset(div_19);
		$.reset(div_15);
		$.reset(div_13);

		$.template_effect(() => {
			$.set_text(text_18, `IP Address: ${$.get(example).ip ?? ''}`);
			$.set_text(text_19, $.get(example).expanded);
			$.set_text(text_20, $.get(example).nibbles);
			$.set_text(text_21, $.get(example).ptrRecord);
			$.set_text(text_22, ` ${$.get(example).explanation ?? ''}`);
		});

		$.append($$anchor, div_13);
	});

	var div_20 = $.sibling(node_1, 2);
	var div_21 = $.child(div_20);
	var node_2 = $.child(div_21);

	Icon(node_2, { name: 'info', size: 'sm' });
	$.next();
	$.reset(div_21);
	$.next(2);
	$.reset(div_20);
	$.reset(div_12);

	var div_22 = $.sibling(div_12, 2);
	var h2_4 = $.child(div_22);
	var text_23 = $.only_child(h2_4, true);
	var table_1 = $.sibling(h2_4, 4);
	var tbody_1 = $.sibling($.child(table_1));

	$.each(tbody_1, 23, () => reverseDnsContent.practicalExamples.digExamples, (example, index) => `dig-${index}`, ($$anchor, example) => {
		var tr_1 = root_4();
		var td_3 = $.child(tr_1);
		var code_7 = $.child(td_3);
		var text_24 = $.only_child(code_7, true);

		$.reset(td_3);

		var td_4 = $.sibling(td_3);
		var text_25 = $.only_child(td_4, true);
		var td_5 = $.sibling(td_4);
		var code_8 = $.child(td_5);
		var text_26 = $.only_child(code_8, true);

		$.reset(td_5);
		$.reset(tr_1);

		$.template_effect(() => {
			$.set_text(text_24, $.get(example).command);
			$.set_text(text_25, $.get(example).description);
			$.set_text(text_26, $.get(example).expectedResult);
		});

		$.append($$anchor, tr_1);
	});

	$.reset(tbody_1);
	$.reset(table_1);

	var ul = $.sibling(table_1, 4);

	$.each(ul, 23, () => reverseDnsContent.practicalExamples.commonChecks, (check, index) => `check-${index}`, ($$anchor, check) => {
		var li_2 = root();
		var text_27 = $.only_child(li_2, true);

		$.template_effect(() => $.set_text(text_27, $.get(check)));
		$.append($$anchor, li_2);
	});

	$.reset(ul);
	$.reset(div_22);

	var div_23 = $.sibling(div_22, 2);
	var node_3 = $.sibling($.child(div_23), 2);

	$.each(node_3, 19, () => reverseDnsContent.troubleshooting, (issue, index) => `${issue.issue}-${index}`, ($$anchor, issue) => {
		var div_24 = root_5();
		var div_25 = $.child(div_24);
		var node_4 = $.child(div_25);

		Icon(node_4, { name: 'help-circle', size: 'sm' });

		var text_28 = $.sibling(node_4);

		$.reset(div_25);

		var div_26 = $.sibling(div_25, 2);
		var p_4 = $.child(div_26);
		var text_29 = $.sibling($.child(p_4));

		$.reset(p_4);

		var p_5 = $.sibling(p_4, 2);
		var text_30 = $.sibling($.child(p_5));

		$.reset(p_5);
		$.reset(div_26);
		$.reset(div_24);

		$.template_effect(
			($0, $1) => {
				$.set_text(text_28, ` ${$.get(issue).issue ?? ''}`);
				$.set_text(text_29, ` ${$0 ?? ''}`);
				$.set_text(text_30, ` ${$1 ?? ''}`);
			},
			[
				() => $.get(issue).causes.join(', '),
				() => $.get(issue).solutions.join(', ')
			]
		);

		$.append($$anchor, div_24);
	});

	$.reset(div_23);

	var div_27 = $.sibling(div_23, 2);
	var ul_1 = $.sibling($.child(div_27), 2);

	$.each(ul_1, 23, () => reverseDnsContent.bestPractices, (practice, index) => `practice-${index}`, ($$anchor, practice) => {
		var li_3 = root();
		var text_31 = $.only_child(li_3, true);

		$.template_effect(() => $.set_text(text_31, $.get(practice)));
		$.append($$anchor, li_3);
	});

	$.reset(ul_1);
	$.reset(div_27);

	var div_28 = $.sibling(div_27, 2);
	var div_29 = $.sibling($.child(div_28), 2);
	var div_30 = $.child(div_29);
	var node_5 = $.sibling($.child(div_30), 2);

	$.each(node_5, 19, () => reverseDnsContent.quickReference.ipv4, (example, index) => `qr-ipv4-${index}`, ($$anchor, example) => {
		var div_31 = root_6();
		var text_32 = $.only_child(div_31, true);

		$.template_effect(() => $.set_text(text_32, $.get(example)));
		$.append($$anchor, div_31);
	});

	$.reset(div_30);

	var div_32 = $.sibling(div_30, 2);
	var node_6 = $.sibling($.child(div_32), 2);

	$.each(node_6, 19, () => reverseDnsContent.quickReference.ipv6, (example, index) => `qr-ipv6-${index}`, ($$anchor, example) => {
		var div_33 = root_6();
		var text_33 = $.only_child(div_33, true);

		$.template_effect(() => $.set_text(text_33, $.get(example)));
		$.append($$anchor, div_33);
	});

	$.reset(div_32);
	$.reset(div_29);

	var div_34 = $.sibling(div_29, 4);

	$.each(div_34, 23, () => reverseDnsContent.tools, (tool, index) => `${tool.name}-${index}`, ($$anchor, tool) => {
		var div_35 = root_7();
		var div_36 = $.child(div_35);
		var text_34 = $.only_child(div_36, true);
		var div_37 = $.sibling(div_36, 2);
		var text_35 = $.only_child(div_37, true);

		$.reset(div_35);

		$.template_effect(() => {
			$.set_text(text_34, $.get(tool).name);
			$.set_text(text_35, $.get(tool).description);
		});

		$.append($$anchor, div_35);
	});

	$.reset(div_34);
	$.reset(div_28);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, reverseDnsContent.title);
		$.set_text(text_1, reverseDnsContent.description);
		$.set_text(text_2, reverseDnsContent.sections.overview.title);
		$.set_text(text_3, reverseDnsContent.sections.overview.content);
		$.set_text(text_4, reverseDnsContent.sections.howWorks.title);
		$.set_text(text_5, reverseDnsContent.sections.howWorks.content);
		$.set_text(text_6, reverseDnsContent.ipv4Reverse.title);
		$.set_text(text_12, reverseDnsContent.ipv4Reverse.delegation.explanation);
		$.set_text(text_16, reverseDnsContent.ipv6Reverse.title);
		$.set_text(text_23, reverseDnsContent.practicalExamples.title);
	});

	$.append($$anchor, div);
	$.pop();
}