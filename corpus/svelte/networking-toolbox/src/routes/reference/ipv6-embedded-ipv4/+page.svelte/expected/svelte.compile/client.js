import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ipv6EmbeddedIPv4Content } from '$lib/content/ipv6-embedded-ipv4.js';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<div class="example-input"> </div>`);
var root_1 = $.from_html(`<li> </li>`);
var root_2 = $.from_html(`<div class="ref-examples"><div class="examples-title"> <span> </span></div> <div class="example-item"><div><strong>Prefix:</strong> <code> </code></div> <div><strong>Purpose:</strong> </div> <div><strong>Format:</strong> <code> </code></div> <div><strong>Examples:</strong></div> <!> <div><strong>Usage:</strong></div> <ul></ul> <div class="example-description"><strong>Note:</strong> </div></div></div>`);
var root_3 = $.from_html(`<tr><td><code> </code></td><td> </td><td> </td></tr>`);
var root_4 = $.from_html(`<tr><td><code> </code></td><td><code> </code></td><td> </td></tr>`);
var root_5 = $.from_html(`<div class="ref-warning"><div class="warning-title"><!> </div> <div class="warning-content"><p><strong>Cause:</strong> </p> <p><strong>Solution:</strong> </p></div></div>`);
var root_6 = $.from_html(`<div class="example-item"><div class="example-description"> </div></div>`);

var root_7 = $.from_html(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1> </h1> <p class="subtitle"> </p></div> <div class="ref-section"><h2> </h2> <p> </p></div> <div class="ref-section"><h2>IPv4-in-IPv6 Mechanisms</h2> <!></div> <div class="ref-section"><h2> </h2> <table class="ref-table"><thead><tr><th>Pattern</th><th>Meaning</th><th>What to Do</th></tr></thead><tbody></tbody></table></div> <div class="ref-section"><h2> </h2> <p>To understand embedded addresses, you need to convert IPv4 addresses to hexadecimal:</p> <table class="ref-table"><thead><tr><th>IPv4 Address</th><th>Hex Equivalent</th><th>Breakdown</th></tr></thead><tbody></tbody></table> <div class="ref-highlight"><div class="highlight-title"><!> Quick Tip</div> <div class="highlight-content">Each IPv4 octet becomes 2 hex digits. For example: 192 = C0, 168 = A8, so 192.168.1.1 becomes C0A8:0101.</div></div></div> <div class="ref-section"><h2>Modern Usage Guidelines</h2> <ul></ul></div> <div class="ref-section"><h2>Common Troubleshooting Issues</h2> <!></div> <div class="ref-section"><h2>Security Considerations</h2> <div class="ref-examples"><div class="examples-title">Important Security Notes</div> <!></div> <div class="ref-warning"><div class="warning-title"><!> Security Warning</div> <div class="warning-content">Many IPv4-in-IPv6 transition mechanisms have known security vulnerabilities. Disable unused mechanisms and
          monitor for unexpected embedded address patterns in your network.</div></div></div></div></div>`);

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

	$.each(node, 19, () => ipv6EmbeddedIPv4Content.mechanisms, (mechanism, index) => `${mechanism.name}-${index}`, ($$anchor, mechanism) => {
		var div_5 = root_2();
		var div_6 = $.child(div_5);
		var text_4 = $.child(div_6);
		var span = $.sibling(text_4);
		var text_5 = $.only_child(span);

		$.reset(div_6);

		var div_7 = $.sibling(div_6, 2);
		var div_8 = $.child(div_7);
		var code = $.sibling($.child(div_8), 2);
		var text_6 = $.only_child(code, true);

		$.reset(div_8);

		var div_9 = $.sibling(div_8, 2);
		var text_7 = $.sibling($.child(div_9));

		$.reset(div_9);

		var div_10 = $.sibling(div_9, 2);
		var code_1 = $.sibling($.child(div_10), 2);
		var text_8 = $.only_child(code_1, true);

		$.reset(div_10);

		var node_1 = $.sibling(div_10, 4);

		$.each(node_1, 19, () => $.get(mechanism).examples, (example, index) => `example-${index}`, ($$anchor, example, index, $$array) => {
			var div_11 = root();
			var text_9 = $.only_child(div_11, true);

			$.template_effect(() => $.set_text(text_9, $.get(example)));
			$.append($$anchor, div_11);
		});

		var ul = $.sibling(node_1, 4);

		$.each(ul, 23, () => $.get(mechanism).usage, (use, index) => `use-${index}`, ($$anchor, use, index, $$array_1) => {
			var li = root_1();
			var text_10 = $.only_child(li, true);

			$.template_effect(() => $.set_text(text_10, $.get(use)));
			$.append($$anchor, li);
		});

		$.reset(ul);

		var div_12 = $.sibling(ul, 2);
		var text_11 = $.sibling($.child(div_12));

		$.reset(div_12);
		$.reset(div_7);
		$.reset(div_5);

		$.template_effect(() => {
			$.set_text(text_4, `${$.get(mechanism).name ?? ''} `);

			$.set_style(span, `color: ${$.get(mechanism).status === 'Active'
				? 'var(--color-success)'
				: $.get(mechanism).status === 'Deprecated' ? 'var(--color-error)' : 'var(--color-warning)'}`);

			$.set_text(text_5, `[${$.get(mechanism).status ?? ''}]`);
			$.set_text(text_6, $.get(mechanism).prefix);
			$.set_text(text_7, ` ${$.get(mechanism).purpose ?? ''}`);
			$.set_text(text_8, $.get(mechanism).format);
			$.set_text(text_11, ` ${$.get(mechanism).notes ?? ''}`);
		});

		$.append($$anchor, div_5);
	});

	$.reset(div_4);

	var div_13 = $.sibling(div_4, 2);
	var h2_1 = $.child(div_13);
	var text_12 = $.only_child(h2_1, true);
	var table = $.sibling(h2_1, 2);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 23, () => ipv6EmbeddedIPv4Content.recognition.patterns, (pattern, index) => `${pattern.pattern}-${index}`, ($$anchor, pattern) => {
		var tr = root_3();
		var td = $.child(tr);
		var code_2 = $.child(td);
		var text_13 = $.only_child(code_2, true);

		$.reset(td);

		var td_1 = $.sibling(td);
		var text_14 = $.only_child(td_1, true);
		var td_2 = $.sibling(td_1);
		var text_15 = $.only_child(td_2, true);

		$.reset(tr);

		$.template_effect(() => {
			$.set_text(text_13, $.get(pattern).pattern);
			$.set_text(text_14, $.get(pattern).meaning);
			$.set_text(text_15, $.get(pattern).action);
		});

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(div_13);

	var div_14 = $.sibling(div_13, 2);
	var h2_2 = $.child(div_14);
	var text_16 = $.only_child(h2_2, true);
	var table_1 = $.sibling(h2_2, 4);
	var tbody_1 = $.sibling($.child(table_1));

	$.each(tbody_1, 23, () => ipv6EmbeddedIPv4Content.conversion.examples, (example, index) => `${example.ipv4}-${index}`, ($$anchor, example) => {
		var tr_1 = root_4();
		var td_3 = $.child(tr_1);
		var code_3 = $.child(td_3);
		var text_17 = $.only_child(code_3, true);

		$.reset(td_3);

		var td_4 = $.sibling(td_3);
		var code_4 = $.child(td_4);
		var text_18 = $.only_child(code_4, true);

		$.reset(td_4);

		var td_5 = $.sibling(td_4);
		var text_19 = $.only_child(td_5, true);

		$.reset(tr_1);

		$.template_effect(() => {
			$.set_text(text_17, $.get(example).ipv4);
			$.set_text(text_18, $.get(example).hex);
			$.set_text(text_19, $.get(example).breakdown);
		});

		$.append($$anchor, tr_1);
	});

	$.reset(tbody_1);
	$.reset(table_1);

	var div_15 = $.sibling(table_1, 2);
	var div_16 = $.child(div_15);
	var node_2 = $.child(div_16);

	Icon(node_2, { name: 'calculator', size: 'sm' });
	$.next();
	$.reset(div_16);
	$.next(2);
	$.reset(div_15);
	$.reset(div_14);

	var div_17 = $.sibling(div_14, 2);
	var ul_1 = $.sibling($.child(div_17), 2);

	$.each(ul_1, 23, () => ipv6EmbeddedIPv4Content.modernUsage, (guideline, index) => `guideline-${index}`, ($$anchor, guideline) => {
		var li_1 = root_1();
		var text_20 = $.only_child(li_1, true);

		$.template_effect(() => $.set_text(text_20, $.get(guideline)));
		$.append($$anchor, li_1);
	});

	$.reset(ul_1);
	$.reset(div_17);

	var div_18 = $.sibling(div_17, 2);
	var node_3 = $.sibling($.child(div_18), 2);

	$.each(node_3, 19, () => ipv6EmbeddedIPv4Content.troubleshooting, (issue, index) => `${issue.issue}-${index}`, ($$anchor, issue) => {
		var div_19 = root_5();
		var div_20 = $.child(div_19);
		var node_4 = $.child(div_20);

		Icon(node_4, { name: 'help-circle', size: 'sm' });

		var text_21 = $.sibling(node_4);

		$.reset(div_20);

		var div_21 = $.sibling(div_20, 2);
		var p_2 = $.child(div_21);
		var text_22 = $.sibling($.child(p_2));

		$.reset(p_2);

		var p_3 = $.sibling(p_2, 2);
		var text_23 = $.sibling($.child(p_3));

		$.reset(p_3);
		$.reset(div_21);
		$.reset(div_19);

		$.template_effect(() => {
			$.set_text(text_21, ` ${$.get(issue).issue ?? ''}`);
			$.set_text(text_22, ` ${$.get(issue).cause ?? ''}`);
			$.set_text(text_23, ` ${$.get(issue).solution ?? ''}`);
		});

		$.append($$anchor, div_19);
	});

	$.reset(div_18);

	var div_22 = $.sibling(div_18, 2);
	var div_23 = $.sibling($.child(div_22), 2);
	var node_5 = $.sibling($.child(div_23), 2);

	$.each(node_5, 19, () => ipv6EmbeddedIPv4Content.securityNotes, (note, index) => `note-${index}`, ($$anchor, note) => {
		var div_24 = root_6();
		var div_25 = $.child(div_24);
		var text_24 = $.only_child(div_25, true);

		$.reset(div_24);
		$.template_effect(() => $.set_text(text_24, $.get(note)));
		$.append($$anchor, div_24);
	});

	$.reset(div_23);

	var div_26 = $.sibling(div_23, 2);
	var div_27 = $.child(div_26);
	var node_6 = $.child(div_27);

	Icon(node_6, { name: 'shield-alert', size: 'sm' });
	$.next();
	$.reset(div_27);
	$.next(2);
	$.reset(div_26);
	$.reset(div_22);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, ipv6EmbeddedIPv4Content.title);
		$.set_text(text_1, ipv6EmbeddedIPv4Content.description);
		$.set_text(text_2, ipv6EmbeddedIPv4Content.sections.overview.title);
		$.set_text(text_3, ipv6EmbeddedIPv4Content.sections.overview.content);
		$.set_text(text_12, ipv6EmbeddedIPv4Content.recognition.title);
		$.set_text(text_16, ipv6EmbeddedIPv4Content.conversion.title);
	});

	$.append($$anchor, div);
	$.pop();
}