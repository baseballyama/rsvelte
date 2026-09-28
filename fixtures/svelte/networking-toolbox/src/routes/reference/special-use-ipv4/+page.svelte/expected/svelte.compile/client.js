import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { specialIPv4Content } from '$lib/content/special-use-ipv4.js';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<span style="color: var(--color-success)">Yes</span>`);
var root_1 = $.from_html(`<span style="color: var(--color-error)">No</span>`);
var root_2 = $.from_html(`<tr><td><code> </code></td><td> </td><td> </td><td><!></td><td> </td></tr>`);
var root_3 = $.from_html(`<div class="item-code"> </div>`);
var root_4 = $.from_html(`<div class="example-item"><div class="example-description"> </div></div>`);

var root_5 = $.from_html(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1> </h1> <p class="subtitle"> </p></div> <div class="ref-section"><h2>Complete Special-Use IPv4 Ranges</h2> <table class="ref-table"><thead><tr><th>Network</th><th>Purpose</th><th>RFC</th><th>Routable</th><th>Description</th></tr></thead><tbody></tbody></table></div> <div class="ref-section"><h2>Common Address Categories</h2> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title">Private Networks (RFC 1918)</div> <!> <div class="item-description">Never routed on the public internet</div></div> <div class="grid-item"><div class="item-title">Test Networks (RFC 5737)</div> <!> <div class="item-description">Safe for documentation and examples</div></div> <div class="grid-item"><div class="item-title">Carrier-Grade NAT</div> <!> <div class="item-description">ISP shared addressing space</div></div> <div class="grid-item"><div class="item-title">Special Purpose</div> <!> <div class="item-description">Loopback, link-local, multicast</div></div></div></div> <div class="ref-section"><h2>Quick Recognition Tips</h2> <div class="ref-examples"><div class="examples-title">What Each Range Means</div> <!></div> <div class="ref-warning"><div class="warning-title"><!> Important Note</div> <div class="warning-content">If you see 100.64.x.x addresses, your ISP is using Carrier-Grade NAT (CGNAT). This can cause issues with port
          forwarding, gaming, and some applications that require direct connectivity.</div></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var div = root_5();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var h1 = $.child(div_2);
	var text = $.only_child(h1, true);
	var p = $.sibling(h1, 2);
	var text_1 = $.only_child(p, true);

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var table = $.sibling($.child(div_3), 2);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 23, () => specialIPv4Content.ranges, (range, rangeIdx) => `${range.network}-${rangeIdx}`, ($$anchor, range) => {
		var tr = root_2();
		var td = $.child(tr);
		var code = $.child(td);
		var text_2 = $.only_child(code, true);

		$.reset(td);

		var td_1 = $.sibling(td);
		var text_3 = $.only_child(td_1, true);
		var td_2 = $.sibling(td_1);
		var text_4 = $.only_child(td_2, true);
		var td_3 = $.sibling(td_2);
		var node = $.child(td_3);

		{
			var consequent = ($$anchor) => {
				var span = root();

				$.append($$anchor, span);
			};

			var alternate = ($$anchor) => {
				var span_1 = root_1();

				$.append($$anchor, span_1);
			};

			$.if(node, ($$render) => {
				if ($.get(range).routable) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.reset(td_3);

		var td_4 = $.sibling(td_3);
		var text_5 = $.only_child(td_4, true);

		$.reset(tr);

		$.template_effect(() => {
			$.set_text(text_2, $.get(range).network);
			$.set_text(text_3, $.get(range).purpose);
			$.set_text(text_4, $.get(range).rfc);
			$.set_text(text_5, $.get(range).description);
		});

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var div_5 = $.sibling($.child(div_4), 2);
	var div_6 = $.child(div_5);
	var node_1 = $.sibling($.child(div_6), 2);

	$.each(node_1, 19, () => specialIPv4Content.categories.private, (network, privIdx) => `${network}-${privIdx}`, ($$anchor, network) => {
		var div_7 = root_3();
		var text_6 = $.only_child(div_7, true);

		$.template_effect(() => $.set_text(text_6, $.get(network)));
		$.append($$anchor, div_7);
	});

	$.next(2);
	$.reset(div_6);

	var div_8 = $.sibling(div_6, 2);
	var node_2 = $.sibling($.child(div_8), 2);

	$.each(node_2, 19, () => specialIPv4Content.categories.testing, (network, testIdx) => `${network}-${testIdx}`, ($$anchor, network) => {
		var div_9 = root_3();
		var text_7 = $.only_child(div_9, true);

		$.template_effect(() => $.set_text(text_7, $.get(network)));
		$.append($$anchor, div_9);
	});

	$.next(2);
	$.reset(div_8);

	var div_10 = $.sibling(div_8, 2);
	var node_3 = $.sibling($.child(div_10), 2);

	$.each(node_3, 19, () => specialIPv4Content.categories.cgnat, (network, cgnatIdx) => `${network}-${cgnatIdx}`, ($$anchor, network) => {
		var div_11 = root_3();
		var text_8 = $.only_child(div_11, true);

		$.template_effect(() => $.set_text(text_8, $.get(network)));
		$.append($$anchor, div_11);
	});

	$.next(2);
	$.reset(div_10);

	var div_12 = $.sibling(div_10, 2);
	var node_4 = $.sibling($.child(div_12), 2);

	$.each(node_4, 19, () => specialIPv4Content.categories.special, (network, specIdx) => `${network}-${specIdx}`, ($$anchor, network) => {
		var div_13 = root_3();
		var text_9 = $.only_child(div_13, true);

		$.template_effect(() => $.set_text(text_9, $.get(network)));
		$.append($$anchor, div_13);
	});

	$.next(2);
	$.reset(div_12);
	$.reset(div_5);
	$.reset(div_4);

	var div_14 = $.sibling(div_4, 2);
	var div_15 = $.sibling($.child(div_14), 2);
	var node_5 = $.sibling($.child(div_15), 2);

	$.each(node_5, 19, () => specialIPv4Content.quickTips, (tip, tipIdx) => `${tip}-${tipIdx}`, ($$anchor, tip) => {
		var div_16 = root_4();
		var div_17 = $.child(div_16);
		var text_10 = $.only_child(div_17, true);

		$.reset(div_16);
		$.template_effect(() => $.set_text(text_10, $.get(tip)));
		$.append($$anchor, div_16);
	});

	$.reset(div_15);

	var div_18 = $.sibling(div_15, 2);
	var div_19 = $.child(div_18);
	var node_6 = $.child(div_19);

	Icon(node_6, { name: 'alert-triangle', size: 'sm' });
	$.next();
	$.reset(div_19);
	$.next(2);
	$.reset(div_18);
	$.reset(div_14);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, specialIPv4Content.title);
		$.set_text(text_1, specialIPv4Content.description);
	});

	$.append($$anchor, div);
	$.pop();
}