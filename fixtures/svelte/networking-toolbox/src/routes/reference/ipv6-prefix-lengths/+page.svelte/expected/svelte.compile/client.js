import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ipv6PrefixLengthsContent } from '$lib/content/ipv6-prefix-lengths.js';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<div class="example-input"> </div>`);
var root_1 = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><div><strong>Capacity:</strong> </div> <div><strong>Typical Use:</strong> </div> <div><strong>Description:</strong> </div> <div><strong>Examples:</strong></div> <!></div></div>`);
var root_2 = $.from_html(`<div class="item-code"> </div> <div class="item-description"> </div>`, 1);
var root_3 = $.from_html(`<tr><td><code> </code></td><td><code> </code></td><td> </td></tr>`);
var root_4 = $.from_html(`<tr><td><code> </code></td><td> </td><td> </td></tr>`);
var root_5 = $.from_html(`<li> </li>`);
var root_6 = $.from_html(`<div class="example-item"><div class="example-description"> </div></div>`);

var root_7 = $.from_html(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1> </h1> <p class="subtitle"> </p></div> <div class="ref-section"><h2> </h2> <p> </p></div> <div class="ref-section"><h2>Common IPv6 Prefix Lengths</h2> <!></div> <div class="ref-section"><h2>Usage Guidelines</h2> <div class="ref-grid three-col"><div class="grid-item"><div class="item-title"> </div> <!></div> <div class="grid-item"><div class="item-title"> </div> <!></div> <div class="grid-item"><div class="item-title"> </div> <!></div></div></div> <div class="ref-section"><h2>IPv4 vs IPv6 Comparison</h2> <table class="ref-table"><thead><tr><th>IPv4 Equivalent</th><th>IPv6 Usage</th><th>Note</th></tr></thead><tbody></tbody></table></div> <div class="ref-section"><h2>Quick Reference Table</h2> <table class="ref-table"><thead><tr><th>Prefix</th><th>Available /64 Subnets</th><th>Typical Use</th></tr></thead><tbody></tbody></table></div> <div class="ref-section"><h2>Best Practices</h2> <ul></ul> <div class="ref-highlight"><div class="highlight-title"><!> Key Rule</div> <div class="highlight-content">Always use /64 for end-user networks. This is required for SLAAC (Stateless Address Autoconfiguration) and
          many IPv6 features.</div></div></div> <div class="ref-section"><h2>Planning Tips</h2> <div class="ref-examples"><div class="examples-title">Remember These</div> <!></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var div = root_7();
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
	var node = $.sibling($.child(div_4), 2);

	$.each(node, 19, () => ipv6PrefixLengthsContent.commonPrefixes, (prefix, index) => `${prefix.prefix}-${index}`, ($$anchor, prefix) => {
		var div_5 = root_1();
		var div_6 = $.child(div_5);
		var text_4 = $.only_child(div_6);
		var div_7 = $.sibling(div_6, 2);
		var div_8 = $.child(div_7);
		var text_5 = $.sibling($.child(div_8));

		$.reset(div_8);

		var div_9 = $.sibling(div_8, 2);
		var text_6 = $.sibling($.child(div_9));

		$.reset(div_9);

		var div_10 = $.sibling(div_9, 2);
		var text_7 = $.sibling($.child(div_10));

		$.reset(div_10);

		var node_1 = $.sibling(div_10, 4);

		$.each(node_1, 19, () => $.get(prefix).examples, (example, index) => `prefix-example-${index}`, ($$anchor, example, index, $$array) => {
			var div_11 = root();
			var text_8 = $.only_child(div_11, true);

			$.template_effect(() => $.set_text(text_8, $.get(example)));
			$.append($$anchor, div_11);
		});

		$.reset(div_7);
		$.reset(div_5);

		$.template_effect(() => {
			$.set_text(text_4, `${$.get(prefix).prefix ?? ''} - ${$.get(prefix).name ?? ''}`);
			$.set_text(text_5, ` ${$.get(prefix).hosts ?? ''}`);
			$.set_text(text_6, ` ${$.get(prefix).typical ?? ''}`);
			$.set_text(text_7, ` ${$.get(prefix).description ?? ''}`);
		});

		$.append($$anchor, div_5);
	});

	$.reset(div_4);

	var div_12 = $.sibling(div_4, 2);
	var div_13 = $.sibling($.child(div_12), 2);
	var div_14 = $.child(div_13);
	var div_15 = $.child(div_14);
	var text_9 = $.only_child(div_15, true);
	var node_2 = $.sibling(div_15, 2);

	$.each(node_2, 19, () => ipv6PrefixLengthsContent.usageGuidelines.residential.allocations, (alloc, index) => `residential-${index}`, ($$anchor, alloc) => {
		var fragment = root_2();
		var div_16 = $.first_child(fragment);
		var text_10 = $.only_child(div_16, true);
		var div_17 = $.sibling(div_16, 2);
		var text_11 = $.only_child(div_17, true);

		$.template_effect(() => {
			$.set_text(text_10, $.get(alloc).size);
			$.set_text(text_11, $.get(alloc).description);
		});

		$.append($$anchor, fragment);
	});

	$.reset(div_14);

	var div_18 = $.sibling(div_14, 2);
	var div_19 = $.child(div_18);
	var text_12 = $.only_child(div_19, true);
	var node_3 = $.sibling(div_19, 2);

	$.each(node_3, 19, () => ipv6PrefixLengthsContent.usageGuidelines.enterprise.allocations, (alloc, index) => `enterprise-${index}`, ($$anchor, alloc) => {
		var fragment_1 = root_2();
		var div_20 = $.first_child(fragment_1);
		var text_13 = $.only_child(div_20, true);
		var div_21 = $.sibling(div_20, 2);
		var text_14 = $.only_child(div_21, true);

		$.template_effect(() => {
			$.set_text(text_13, $.get(alloc).size);
			$.set_text(text_14, $.get(alloc).description);
		});

		$.append($$anchor, fragment_1);
	});

	$.reset(div_18);

	var div_22 = $.sibling(div_18, 2);
	var div_23 = $.child(div_22);
	var text_15 = $.only_child(div_23, true);
	var node_4 = $.sibling(div_23, 2);

	$.each(node_4, 19, () => ipv6PrefixLengthsContent.usageGuidelines.subnets.allocations, (alloc, index) => `subnets-${index}`, ($$anchor, alloc) => {
		var fragment_2 = root_2();
		var div_24 = $.first_child(fragment_2);
		var text_16 = $.only_child(div_24, true);
		var div_25 = $.sibling(div_24, 2);
		var text_17 = $.only_child(div_25, true);

		$.template_effect(() => {
			$.set_text(text_16, $.get(alloc).size);
			$.set_text(text_17, $.get(alloc).description);
		});

		$.append($$anchor, fragment_2);
	});

	$.reset(div_22);
	$.reset(div_13);
	$.reset(div_12);

	var div_26 = $.sibling(div_12, 2);
	var table = $.sibling($.child(div_26), 2);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 23, () => ipv6PrefixLengthsContent.comparison.mappings, (mapping, index) => `${mapping.ipv4}-${index}`, ($$anchor, mapping) => {
		var tr = root_3();
		var td = $.child(tr);
		var code = $.child(td);
		var text_18 = $.only_child(code, true);

		$.reset(td);

		var td_1 = $.sibling(td);
		var code_1 = $.child(td_1);
		var text_19 = $.only_child(code_1, true);

		$.reset(td_1);

		var td_2 = $.sibling(td_1);
		var text_20 = $.only_child(td_2, true);

		$.reset(tr);

		$.template_effect(() => {
			$.set_text(text_18, $.get(mapping).ipv4);
			$.set_text(text_19, $.get(mapping).ipv6);
			$.set_text(text_20, $.get(mapping).note);
		});

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(div_26);

	var div_27 = $.sibling(div_26, 2);
	var table_1 = $.sibling($.child(div_27), 2);
	var tbody_1 = $.sibling($.child(table_1));

	$.each(tbody_1, 23, () => ipv6PrefixLengthsContent.quickReference, (row, index) => `${row.prefix}-${index}`, ($$anchor, row) => {
		var tr_1 = root_4();
		var td_3 = $.child(tr_1);
		var code_2 = $.child(td_3);
		var text_21 = $.only_child(code_2, true);

		$.reset(td_3);

		var td_4 = $.sibling(td_3);
		var text_22 = $.only_child(td_4, true);
		var td_5 = $.sibling(td_4);
		var text_23 = $.only_child(td_5, true);

		$.reset(tr_1);

		$.template_effect(() => {
			$.set_text(text_21, $.get(row).prefix);
			$.set_text(text_22, $.get(row).subnets);
			$.set_text(text_23, $.get(row).note);
		});

		$.append($$anchor, tr_1);
	});

	$.reset(tbody_1);
	$.reset(table_1);
	$.reset(div_27);

	var div_28 = $.sibling(div_27, 2);
	var ul = $.sibling($.child(div_28), 2);

	$.each(ul, 23, () => ipv6PrefixLengthsContent.bestPractices, (practice, index) => `practice-${index}`, ($$anchor, practice) => {
		var li = root_5();
		var text_24 = $.only_child(li, true);

		$.template_effect(() => $.set_text(text_24, $.get(practice)));
		$.append($$anchor, li);
	});

	$.reset(ul);

	var div_29 = $.sibling(ul, 2);
	var div_30 = $.child(div_29);
	var node_5 = $.child(div_30);

	Icon(node_5, { name: 'star', size: 'sm' });
	$.next();
	$.reset(div_30);
	$.next(2);
	$.reset(div_29);
	$.reset(div_28);

	var div_31 = $.sibling(div_28, 2);
	var div_32 = $.sibling($.child(div_31), 2);
	var node_6 = $.sibling($.child(div_32), 2);

	$.each(node_6, 19, () => ipv6PrefixLengthsContent.tips, (tip, index) => `tip-${index}`, ($$anchor, tip) => {
		var div_33 = root_6();
		var div_34 = $.child(div_33);
		var text_25 = $.only_child(div_34, true);

		$.reset(div_33);
		$.template_effect(() => $.set_text(text_25, $.get(tip)));
		$.append($$anchor, div_33);
	});

	$.reset(div_32);
	$.reset(div_31);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, ipv6PrefixLengthsContent.title);
		$.set_text(text_1, ipv6PrefixLengthsContent.description);
		$.set_text(text_2, ipv6PrefixLengthsContent.sections.overview.title);
		$.set_text(text_3, ipv6PrefixLengthsContent.sections.overview.content);
		$.set_text(text_9, ipv6PrefixLengthsContent.usageGuidelines.residential.title);
		$.set_text(text_12, ipv6PrefixLengthsContent.usageGuidelines.enterprise.title);
		$.set_text(text_15, ipv6PrefixLengthsContent.usageGuidelines.subnets.title);
	});

	$.append($$anchor, div);
	$.pop();
}