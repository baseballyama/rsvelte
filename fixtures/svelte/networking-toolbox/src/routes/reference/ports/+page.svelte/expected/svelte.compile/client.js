import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { commonPortsContent } from '$lib/content/common-ports.js';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<tr><td><code> </code></td><td> </td><td> </td></tr>`);
var root_1 = $.from_html(`<tr><td><code> </code></td><td> </td><td><strong> </strong></td><td> </td></tr>`);
var root_2 = $.from_html(`<div class="item-code"> </div> <div class="item-description"> </div>`, 1);
var root_3 = $.from_html(`<div class="example-item"><div class="example-description"> </div></div>`);

var root_4 = $.from_html(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1> </h1> <p class="subtitle"> </p></div> <div class="ref-section"><h2>Port Ranges</h2> <table class="ref-table"><thead><tr><th>Range</th><th>Name</th><th>Description</th></tr></thead><tbody></tbody></table></div> <div class="ref-section"><h2>Well-Known Ports (0-1023)</h2> <table class="ref-table"><thead><tr><th>Port</th><th>Protocol</th><th>Service</th><th>Description</th></tr></thead><tbody></tbody></table></div> <div class="ref-section"><h2>Registered Ports (1024-49151)</h2> <table class="ref-table"><thead><tr><th>Port</th><th>Protocol</th><th>Service</th><th>Description</th></tr></thead><tbody></tbody></table></div> <div class="ref-section"><h2>Common Service Categories</h2> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title">Web Services</div> <!></div> <div class="grid-item"><div class="item-title">Email Services</div> <!></div> <div class="grid-item"><div class="item-title">Remote Access</div> <!></div> <div class="grid-item"><div class="item-title">Database Services</div> <!></div></div></div> <div class="ref-section"><h2>Important Security Tips</h2> <div class="ref-examples"><div class="examples-title">Remember These</div> <!></div> <div class="ref-warning"><div class="warning-title"><!> Security Note</div> <div class="warning-content">Many services have both secure and insecure versions. Always use the secure versions (HTTPS, SSH, FTPS, etc.)
          when possible, especially over untrusted networks.</div></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var div = root_4();
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

	$.each(tbody, 21, () => commonPortsContent.ranges, $.index, ($$anchor, range) => {
		var tr = root();
		var td = $.child(tr);
		var code = $.child(td);
		var text_2 = $.only_child(code, true);

		$.reset(td);

		var td_1 = $.sibling(td);
		var text_3 = $.only_child(td_1, true);
		var td_2 = $.sibling(td_1);
		var text_4 = $.only_child(td_2, true);

		$.reset(tr);

		$.template_effect(() => {
			$.set_text(text_2, $.get(range).range);
			$.set_text(text_3, $.get(range).name);
			$.set_text(text_4, $.get(range).description);
		});

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var table_1 = $.sibling($.child(div_4), 2);
	var tbody_1 = $.sibling($.child(table_1));

	$.each(tbody_1, 21, () => commonPortsContent.wellKnown, (port) => port.port, ($$anchor, port) => {
		var tr_1 = root_1();
		var td_3 = $.child(tr_1);
		var code_1 = $.child(td_3);
		var text_5 = $.only_child(code_1, true);

		$.reset(td_3);

		var td_4 = $.sibling(td_3);
		var text_6 = $.only_child(td_4, true);
		var td_5 = $.sibling(td_4);
		var strong = $.child(td_5);
		var text_7 = $.only_child(strong, true);

		$.reset(td_5);

		var td_6 = $.sibling(td_5);
		var text_8 = $.only_child(td_6, true);

		$.reset(tr_1);

		$.template_effect(() => {
			$.set_text(text_5, $.get(port).port);
			$.set_text(text_6, $.get(port).protocol);
			$.set_text(text_7, $.get(port).service);
			$.set_text(text_8, $.get(port).description);
		});

		$.append($$anchor, tr_1);
	});

	$.reset(tbody_1);
	$.reset(table_1);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var table_2 = $.sibling($.child(div_5), 2);
	var tbody_2 = $.sibling($.child(table_2));

	$.each(tbody_2, 21, () => commonPortsContent.registered, (port) => port.port, ($$anchor, port) => {
		var tr_2 = root_1();
		var td_7 = $.child(tr_2);
		var code_2 = $.child(td_7);
		var text_9 = $.only_child(code_2, true);

		$.reset(td_7);

		var td_8 = $.sibling(td_7);
		var text_10 = $.only_child(td_8, true);
		var td_9 = $.sibling(td_8);
		var strong_1 = $.child(td_9);
		var text_11 = $.only_child(strong_1, true);

		$.reset(td_9);

		var td_10 = $.sibling(td_9);
		var text_12 = $.only_child(td_10, true);

		$.reset(tr_2);

		$.template_effect(() => {
			$.set_text(text_9, $.get(port).port);
			$.set_text(text_10, $.get(port).protocol);
			$.set_text(text_11, $.get(port).service);
			$.set_text(text_12, $.get(port).description);
		});

		$.append($$anchor, tr_2);
	});

	$.reset(tbody_2);
	$.reset(table_2);
	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var div_7 = $.sibling($.child(div_6), 2);
	var div_8 = $.child(div_7);
	var node = $.sibling($.child(div_8), 2);

	$.each(node, 17, () => commonPortsContent.categories.web, $.index, ($$anchor, service) => {
		var fragment = root_2();
		var div_9 = $.first_child(fragment);
		var text_13 = $.only_child(div_9);
		var div_10 = $.sibling(div_9, 2);
		var text_14 = $.only_child(div_10, true);

		$.template_effect(() => {
			$.set_text(text_13, `${$.get(service).ports ?? ''} - ${$.get(service).service ?? ''}`);
			$.set_style(div_10, `color: ${$.get(service).secure ? 'var(--color-success)' : 'var(--color-error)'}`);
			$.set_text(text_14, $.get(service).secure ? 'Secure' : 'Not secure');
		});

		$.append($$anchor, fragment);
	});

	$.reset(div_8);

	var div_11 = $.sibling(div_8, 2);
	var node_1 = $.sibling($.child(div_11), 2);

	$.each(node_1, 17, () => commonPortsContent.categories.email, $.index, ($$anchor, service) => {
		var fragment_1 = root_2();
		var div_12 = $.first_child(fragment_1);
		var text_15 = $.only_child(div_12);
		var div_13 = $.sibling(div_12, 2);
		var text_16 = $.only_child(div_13, true);

		$.template_effect(() => {
			$.set_text(text_15, `${$.get(service).ports ?? ''} - ${$.get(service).service ?? ''}`);
			$.set_style(div_13, `color: ${$.get(service).secure ? 'var(--color-success)' : 'var(--color-error)'}`);
			$.set_text(text_16, $.get(service).secure ? 'Secure' : 'Not secure');
		});

		$.append($$anchor, fragment_1);
	});

	$.reset(div_11);

	var div_14 = $.sibling(div_11, 2);
	var node_2 = $.sibling($.child(div_14), 2);

	$.each(node_2, 17, () => commonPortsContent.categories.remote, $.index, ($$anchor, service) => {
		var fragment_2 = root_2();
		var div_15 = $.first_child(fragment_2);
		var text_17 = $.only_child(div_15);
		var div_16 = $.sibling(div_15, 2);
		var text_18 = $.only_child(div_16, true);

		$.template_effect(() => {
			$.set_text(text_17, `${$.get(service).ports ?? ''} - ${$.get(service).service ?? ''}`);
			$.set_style(div_16, `color: ${$.get(service).secure ? 'var(--color-success)' : 'var(--color-error)'}`);
			$.set_text(text_18, $.get(service).secure ? 'Secure' : 'Not secure');
		});

		$.append($$anchor, fragment_2);
	});

	$.reset(div_14);

	var div_17 = $.sibling(div_14, 2);
	var node_3 = $.sibling($.child(div_17), 2);

	$.each(node_3, 17, () => commonPortsContent.categories.database, $.index, ($$anchor, service) => {
		var fragment_3 = root_2();
		var div_18 = $.first_child(fragment_3);
		var text_19 = $.only_child(div_18);
		var div_19 = $.sibling(div_18, 2);
		var text_20 = $.only_child(div_19, true);

		$.template_effect(() => {
			$.set_text(text_19, `${$.get(service).ports ?? ''} - ${$.get(service).service ?? ''}`);
			$.set_style(div_19, `color: ${$.get(service).secure ? 'var(--color-success)' : 'var(--color-error)'}`);
			$.set_text(text_20, $.get(service).secure ? 'Secure' : 'Not secure');
		});

		$.append($$anchor, fragment_3);
	});

	$.reset(div_17);
	$.reset(div_7);
	$.reset(div_6);

	var div_20 = $.sibling(div_6, 2);
	var div_21 = $.sibling($.child(div_20), 2);
	var node_4 = $.sibling($.child(div_21), 2);

	$.each(node_4, 17, () => commonPortsContent.tips, $.index, ($$anchor, tip) => {
		var div_22 = root_3();
		var div_23 = $.child(div_22);
		var text_21 = $.only_child(div_23, true);

		$.reset(div_22);
		$.template_effect(() => $.set_text(text_21, $.get(tip)));
		$.append($$anchor, div_22);
	});

	$.reset(div_21);

	var div_24 = $.sibling(div_21, 2);
	var div_25 = $.child(div_24);
	var node_5 = $.child(div_25);

	Icon(node_5, { name: 'shield', size: 'sm' });
	$.next();
	$.reset(div_25);
	$.next(2);
	$.reset(div_24);
	$.reset(div_20);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, commonPortsContent.title);
		$.set_text(text_1, commonPortsContent.description);
	});

	$.append($$anchor, div);
	$.pop();
}