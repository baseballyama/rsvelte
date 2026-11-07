import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cidrContent } from '$lib/content/cidr.js';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<div class="example-item"><span class="example-input"> </span> <span class="example-arrow">→</span> <span class="example-output"> </span> <div class="example-description"> </div></div>`);
var root_1 = $.from_html(`<tr><td><code> </code></td><td><code> </code></td><td> </td><td> </td></tr>`);
var root_2 = $.from_html(`<li> </li>`);

var root_3 = $.from_html(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1> </h1> <p class="subtitle"> </p></div> <div class="ref-section"><h2> </h2> <p> </p> <div class="ref-highlight"><div class="highlight-title"><!> Quick Example</div> <div class="highlight-content">In <code>192.168.1.0/24</code>, the network is 192.168.1.0 and there are 254 usable host addresses
          (192.168.1.1 through 192.168.1.254).</div></div></div> <div class="ref-section"><h2> </h2> <p> </p></div> <div class="ref-section"><h2> </h2> <p> </p></div> <div class="ref-section"><h2>Common Examples</h2> <div class="ref-examples"><div class="examples-title">Network Examples</div> <!></div></div> <div class="ref-section"><h2>Prefix Length Reference Table</h2> <table class="ref-table"><thead><tr><th>Prefix</th><th>Subnet Mask</th><th>Usable Hosts</th><th>Typical Use</th></tr></thead><tbody></tbody></table></div> <div class="ref-section"><h2>Key Points to Remember</h2> <ul></ul> <div class="ref-warning"><div class="warning-title"><!> Remember</div> <div class="warning-content">The first and last addresses in any network are reserved (network address and broadcast address), so the
          usable host count is always 2 less than the total addresses.</div></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var div = root_3();
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
	var div_4 = $.sibling(p_1, 2);
	var div_5 = $.child(div_4);
	var node = $.child(div_5);

	Icon(node, { name: 'info', size: 'sm' });
	$.next();
	$.reset(div_5);
	$.next(2);
	$.reset(div_4);
	$.reset(div_3);

	var div_6 = $.sibling(div_3, 2);
	var h2_1 = $.child(div_6);
	var text_4 = $.only_child(h2_1, true);
	var p_2 = $.sibling(h2_1, 2);
	var text_5 = $.only_child(p_2, true);

	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var h2_2 = $.child(div_7);
	var text_6 = $.only_child(h2_2, true);
	var p_3 = $.sibling(h2_2, 2);
	var text_7 = $.only_child(p_3, true);

	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var div_9 = $.sibling($.child(div_8), 2);
	var node_1 = $.sibling($.child(div_9), 2);

	$.each(node_1, 19, () => cidrContent.examples, (example, index) => `${example.cidr}-${index}`, ($$anchor, example) => {
		var div_10 = root();
		var span = $.child(div_10);
		var text_8 = $.only_child(span, true);
		var span_1 = $.sibling(span, 4);
		var text_9 = $.only_child(span_1, true);
		var div_11 = $.sibling(span_1, 2);
		var text_10 = $.only_child(div_11, true);

		$.reset(div_10);

		$.template_effect(() => {
			$.set_text(text_8, $.get(example).cidr);
			$.set_text(text_9, $.get(example).hosts);
			$.set_text(text_10, $.get(example).description);
		});

		$.append($$anchor, div_10);
	});

	$.reset(div_9);
	$.reset(div_8);

	var div_12 = $.sibling(div_8, 2);
	var table = $.sibling($.child(div_12), 2);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 23, () => cidrContent.prefixTable, (row, index) => `${row.prefix}-${index}`, ($$anchor, row) => {
		var tr = root_1();
		var td = $.child(tr);
		var code = $.child(td);
		var text_11 = $.only_child(code, true);

		$.reset(td);

		var td_1 = $.sibling(td);
		var code_1 = $.child(td_1);
		var text_12 = $.only_child(code_1, true);

		$.reset(td_1);

		var td_2 = $.sibling(td_1);
		var text_13 = $.only_child(td_2, true);
		var td_3 = $.sibling(td_2);
		var text_14 = $.only_child(td_3, true);

		$.reset(tr);

		$.template_effect(() => {
			$.set_text(text_11, $.get(row).prefix);
			$.set_text(text_12, $.get(row).mask);
			$.set_text(text_13, $.get(row).hosts);
			$.set_text(text_14, $.get(row).typical);
		});

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(div_12);

	var div_13 = $.sibling(div_12, 2);
	var ul = $.sibling($.child(div_13), 2);

	$.each(ul, 23, () => cidrContent.keyPoints, (point, index) => `point-${index}`, ($$anchor, point) => {
		var li = root_2();
		var text_15 = $.only_child(li, true);

		$.template_effect(() => $.set_text(text_15, $.get(point)));
		$.append($$anchor, li);
	});

	$.reset(ul);

	var div_14 = $.sibling(ul, 2);
	var div_15 = $.child(div_14);
	var node_2 = $.child(div_15);

	Icon(node_2, { name: 'alert-triangle', size: 'sm' });
	$.next();
	$.reset(div_15);
	$.next(2);
	$.reset(div_14);
	$.reset(div_13);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, cidrContent.title);
		$.set_text(text_1, cidrContent.description);
		$.set_text(text_2, cidrContent.sections.whatIs.title);
		$.set_text(text_3, cidrContent.sections.whatIs.content);
		$.set_text(text_4, cidrContent.sections.whyReplaced.title);
		$.set_text(text_5, cidrContent.sections.whyReplaced.content);
		$.set_text(text_6, cidrContent.sections.howToRead.title);
		$.set_text(text_7, cidrContent.sections.howToRead.content);
	});

	$.append($$anchor, div);
	$.pop();
}