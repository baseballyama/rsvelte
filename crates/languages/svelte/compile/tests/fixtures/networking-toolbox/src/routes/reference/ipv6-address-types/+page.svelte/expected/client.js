import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ipv6AddressTypesContent } from '$lib/content/ipv6-address-types.js';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><div><strong>Prefix:</strong> <code> </code></div> <div><strong>Range:</strong> <code> </code></div> <div><strong>Description:</strong> </div> <div><strong>Usage:</strong> </div> <div><strong>Example:</strong> <code> </code></div></div></div>`);
var root_1 = $.from_html(`<tr><td><code> </code></td><td> </td><td> </td><td> </td></tr>`);
var root_2 = $.from_html(`<div class="example-input"> </div>`);
var root_3 = $.from_html(`<div><strong>Common Addresses:</strong></div> <!>`, 1);
var root_4 = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><div><strong>Prefix:</strong> <code> </code></div> <div><strong>Description:</strong> </div> <!></div></div>`);
var root_5 = $.from_html(`<li> </li>`);
var root_6 = $.from_html(`<tr><td><code> </code></td><td> </td></tr>`);
var root_7 = $.from_html(`<div class="example-item"><div class="example-description"> </div></div>`);
var root_8 = $.from_html(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1> </h1> <p class="subtitle"> </p></div> <div class="ref-section"><h2> </h2> <p> </p></div> <div class="ref-section"><h2>Unicast Address Types</h2> <!></div> <div class="ref-section"><h2>Special Addresses</h2> <table class="ref-table"><thead><tr><th>Address</th><th>Name</th><th>Description</th><th>Usage</th></tr></thead><tbody></tbody></table></div> <div class="ref-section"><h2>Multicast Address Scopes</h2> <p>All multicast addresses start with <code>ff</code>. The second byte indicates scope:</p> <!></div> <div class="ref-section"><h2> </h2> <p> </p> <div class="ref-highlight"><div class="highlight-title"><!> Example</div> <div class="highlight-content"> </div></div> <h3>Common Anycast Uses</h3> <ul></ul></div> <div class="ref-section"><h2>Reserved Address Ranges</h2> <table class="ref-table"><thead><tr><th>Prefix</th><th>Purpose</th></tr></thead><tbody></tbody></table></div> <div class="ref-section"><h2>Quick Recognition Tips</h2> <div class="ref-examples"><div class="examples-title">Remember These Patterns</div> <!></div></div></div></div>`);

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
	var node = $.sibling($.child(div_4), 2);

	$.each(node, 19, () => ipv6AddressTypesContent.unicastTypes, (type, index) => `${type.type}-${index}`, ($$anchor, type) => {
		var div_5 = root();
		var div_6 = $.child(div_5);
		var text_4 = $.only_child(div_6, true);
		var div_7 = $.sibling(div_6, 2);
		var div_8 = $.child(div_7);
		var code = $.sibling($.child(div_8), 2);
		var text_5 = $.only_child(code, true);

		$.reset(div_8);

		var div_9 = $.sibling(div_8, 2);
		var code_1 = $.sibling($.child(div_9), 2);
		var text_6 = $.only_child(code_1, true);

		$.reset(div_9);

		var div_10 = $.sibling(div_9, 2);
		var text_7 = $.sibling($.child(div_10));

		$.reset(div_10);

		var div_11 = $.sibling(div_10, 2);
		var text_8 = $.sibling($.child(div_11));

		$.reset(div_11);

		var div_12 = $.sibling(div_11, 2);
		var code_2 = $.sibling($.child(div_12), 2);
		var text_9 = $.only_child(code_2, true);

		$.reset(div_12);
		$.reset(div_7);
		$.reset(div_5);

		$.template_effect(() => {
			$.set_text(text_4, $.get(type).type);
			$.set_text(text_5, $.get(type).prefix);
			$.set_text(text_6, $.get(type).range);
			$.set_text(text_7, ` ${$.get(type).description ?? ''}`);
			$.set_text(text_8, ` ${$.get(type).usage ?? ''}`);
			$.set_text(text_9, $.get(type).example);
		});

		$.append($$anchor, div_5);
	});

	$.reset(div_4);

	var div_13 = $.sibling(div_4, 2);
	var table = $.sibling($.child(div_13), 2);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 23, () => ipv6AddressTypesContent.specialAddresses, (addr, index) => `${addr.address}-${index}`, ($$anchor, addr) => {
		var tr = root_1();
		var td = $.child(tr);
		var code_3 = $.child(td);
		var text_10 = $.only_child(code_3, true);

		$.reset(td);

		var td_1 = $.sibling(td);
		var text_11 = $.only_child(td_1, true);
		var td_2 = $.sibling(td_1);
		var text_12 = $.only_child(td_2, true);
		var td_3 = $.sibling(td_2);
		var text_13 = $.only_child(td_3, true);

		$.reset(tr);

		$.template_effect(() => {
			$.set_text(text_10, $.get(addr).address);
			$.set_text(text_11, $.get(addr).name);
			$.set_text(text_12, $.get(addr).description);
			$.set_text(text_13, $.get(addr).usage);
		});

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(div_13);

	var div_14 = $.sibling(div_13, 2);
	var node_1 = $.sibling($.child(div_14), 4);

	$.each(node_1, 19, () => ipv6AddressTypesContent.multicastTypes, (scope, index) => `${scope.scope}-${index}`, ($$anchor, scope) => {
		var div_15 = root_4();
		var div_16 = $.child(div_15);
		var text_14 = $.only_child(div_16);
		var div_17 = $.sibling(div_16, 2);
		var div_18 = $.child(div_17);
		var code_4 = $.sibling($.child(div_18), 2);
		var text_15 = $.only_child(code_4, true);

		$.reset(div_18);

		var div_19 = $.sibling(div_18, 2);
		var text_16 = $.sibling($.child(div_19));

		$.reset(div_19);

		var node_2 = $.sibling(div_19, 2);

		{
			var consequent = ($$anchor) => {
				var fragment = root_3();
				var node_3 = $.sibling($.first_child(fragment), 2);

				$.each(node_3, 19, () => $.get(scope).examples, (example, index) => `example-${index}`, ($$anchor, example, index, $$array) => {
					var div_20 = root_2();
					var text_17 = $.only_child(div_20, true);

					$.template_effect(() => $.set_text(text_17, $.get(example)));
					$.append($$anchor, div_20);
				});

				$.append($$anchor, fragment);
			};

			$.if(node_2, ($$render) => {
				if ($.get(scope).examples.length > 0) $$render(consequent);
			});
		}

		$.reset(div_17);
		$.reset(div_15);

		$.template_effect(() => {
			$.set_text(text_14, `${$.get(scope).scope ?? ''} Scope`);
			$.set_text(text_15, $.get(scope).prefix);
			$.set_text(text_16, ` ${$.get(scope).description ?? ''}`);
		});

		$.append($$anchor, div_15);
	});

	$.reset(div_14);

	var div_21 = $.sibling(div_14, 2);
	var h2_1 = $.child(div_21);
	var text_18 = $.only_child(h2_1, true);
	var p_2 = $.sibling(h2_1, 2);
	var text_19 = $.only_child(p_2, true);
	var div_22 = $.sibling(p_2, 2);
	var div_23 = $.child(div_22);
	var node_4 = $.child(div_23);

	Icon(node_4, { name: 'share', size: 'sm' });
	$.next();
	$.reset(div_23);

	var div_24 = $.sibling(div_23, 2);
	var text_20 = $.only_child(div_24, true);

	$.reset(div_22);

	var ul = $.sibling(div_22, 4);

	$.each(ul, 23, () => ipv6AddressTypesContent.anycast.commonUses, (use, index) => `use-${index}`, ($$anchor, use) => {
		var li = root_5();
		var text_21 = $.only_child(li, true);

		$.template_effect(() => $.set_text(text_21, $.get(use)));
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(div_21);

	var div_25 = $.sibling(div_21, 2);
	var table_1 = $.sibling($.child(div_25), 2);
	var tbody_1 = $.sibling($.child(table_1));

	$.each(tbody_1, 23, () => ipv6AddressTypesContent.reservedRanges, (range, index) => `${range.prefix}-${index}`, ($$anchor, range) => {
		var tr_1 = root_6();
		var td_4 = $.child(tr_1);
		var code_5 = $.child(td_4);
		var text_22 = $.only_child(code_5, true);

		$.reset(td_4);

		var td_5 = $.sibling(td_4);
		var text_23 = $.only_child(td_5, true);

		$.reset(tr_1);

		$.template_effect(() => {
			$.set_text(text_22, $.get(range).prefix);
			$.set_text(text_23, $.get(range).purpose);
		});

		$.append($$anchor, tr_1);
	});

	$.reset(tbody_1);
	$.reset(table_1);
	$.reset(div_25);

	var div_26 = $.sibling(div_25, 2);
	var div_27 = $.sibling($.child(div_26), 2);
	var node_5 = $.sibling($.child(div_27), 2);

	$.each(node_5, 19, () => ipv6AddressTypesContent.quickTips, (tip, index) => `tip-${index}`, ($$anchor, tip) => {
		var div_28 = root_7();
		var div_29 = $.child(div_28);
		var text_24 = $.only_child(div_29, true);

		$.reset(div_28);
		$.template_effect(() => $.set_text(text_24, $.get(tip)));
		$.append($$anchor, div_28);
	});

	$.reset(div_27);
	$.reset(div_26);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, ipv6AddressTypesContent.title);
		$.set_text(text_1, ipv6AddressTypesContent.description);
		$.set_text(text_2, ipv6AddressTypesContent.sections.overview.title);
		$.set_text(text_3, ipv6AddressTypesContent.sections.overview.content);
		$.set_text(text_18, ipv6AddressTypesContent.anycast.title);
		$.set_text(text_19, ipv6AddressTypesContent.anycast.description);
		$.set_text(text_20, ipv6AddressTypesContent.anycast.example);
	});

	$.append($$anchor, div);
	$.pop();
}