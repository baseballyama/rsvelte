import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { linkLocalApipaContent } from '$lib/content/link-local-apipa.js';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<li> </li>`);
var root_1 = $.from_html(`<div class="ref-warning"><div class="warning-title"><!> </div> <div class="warning-content"><p><strong>Meaning:</strong> </p> <p><strong>Solution:</strong> </p></div></div>`);
var root_2 = $.from_html(`<div class="grid-item"><div class="item-title"> </div> <div class="item-description"> </div> <div><strong>Example:</strong> <code> </code></div> <div><strong>Privacy:</strong> </div></div>`);
var root_3 = $.from_html(`<tr><td><strong> </strong></td><td> </td><td> </td></tr>`);
var root_4 = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><div><strong>IPv4 Behavior:</strong> </div> <div><strong>IPv6 Behavior:</strong> </div> <div><strong>Impact:</strong> </div></div></div>`);
var root_5 = $.from_html(`<tr><td><strong> </strong></td><td><code> </code></td><td><code> </code></td><td><code> </code></td></tr>`);
var root_6 = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><div><strong>Concern Level:</strong> </div> <div><strong>Action:</strong> </div></div></div>`);
var root_7 = $.from_html(`<div class="item-description"> </div>`);

var root_8 = $.from_html(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1> </h1> <p class="subtitle"> </p></div> <div class="ref-section"><h2> </h2> <p> </p></div> <div class="ref-section"><h2> </h2> <div class="ref-examples"><div class="examples-title">Address Range</div> <div class="example-item"><div><strong>Network:</strong> <code> </code></div> <div><strong>Full Range:</strong> <code> </code></div> <div><strong>Usable Range:</strong> <code> </code></div> <div><strong>Reserved:</strong> </div></div></div> <p> </p> <h3>When APIPA is Used</h3> <ul></ul> <h3>How APIPA Works</h3> <ol></ol> <h3>APIPA Characteristics</h3> <ul></ul> <h3>Troubleshooting APIPA Issues</h3> <!></div> <div class="ref-section"><h2> </h2> <div class="ref-examples"><div class="examples-title">Address Range</div> <div class="example-item"><div><strong>Network:</strong> <code> </code></div> <div><strong>Full Range:</strong> <code> </code></div> <div><strong>Common Format:</strong> <code> </code></div></div></div> <p> </p> <h3>Address Formation</h3> <ol></ol> <h3>When IPv6 Link-Local is Used</h3> <ul></ul> <h3>IPv6 Link-Local Characteristics</h3> <ul></ul> <h3>Types of IPv6 Link-Local Addresses</h3> <div class="ref-grid two-col"></div></div> <div class="ref-section"><h2>IPv4 APIPA vs IPv6 Link-Local Comparison</h2> <table class="ref-table"><thead><tr><th>Aspect</th><th>IPv4 APIPA</th><th>IPv6 Link-Local</th></tr></thead><tbody></tbody></table></div> <div class="ref-section"><h2>Practical Examples</h2> <!></div> <div class="ref-section"><h2>Troubleshooting Commands</h2> <table class="ref-table"><thead><tr><th>Purpose</th><th>Windows</th><th>Linux</th><th>macOS</th></tr></thead><tbody></tbody></table></div> <div class="ref-section"><h2>When to Worry</h2> <!></div> <div class="ref-section"><h2>Best Practices</h2> <ul></ul></div> <div class="ref-section"><h2>Common Mistakes</h2> <ul></ul></div> <div class="ref-section"><h2>Quick Reference</h2> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title">Recognition</div> <!></div> <div class="grid-item"><div class="item-title">Troubleshooting</div> <!></div></div> <div class="ref-highlight"><div class="highlight-title"><!> Key Difference</div> <div class="highlight-content">IPv4 APIPA (169.254.x.x) indicates a problem - DHCP failed. IPv6 link-local (fe80::) is normal and required -
          every IPv6 interface has one.</div></div></div></div></div>`);

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
	var div_5 = $.sibling(h2_1, 2);
	var div_6 = $.sibling($.child(div_5), 2);
	var div_7 = $.child(div_6);
	var code = $.sibling($.child(div_7), 2);
	var text_5 = $.only_child(code, true);

	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var code_1 = $.sibling($.child(div_8), 2);
	var text_6 = $.only_child(code_1, true);

	$.reset(div_8);

	var div_9 = $.sibling(div_8, 2);
	var code_2 = $.sibling($.child(div_9), 2);
	var text_7 = $.only_child(code_2, true);

	$.reset(div_9);

	var div_10 = $.sibling(div_9, 2);
	var text_8 = $.sibling($.child(div_10));

	$.reset(div_10);
	$.reset(div_6);
	$.reset(div_5);

	var p_2 = $.sibling(div_5, 2);
	var text_9 = $.only_child(p_2, true);
	var ul = $.sibling(p_2, 4);

	$.each(ul, 23, () => linkLocalApipaContent.apipa.whenUsed, (reason, index) => `apipa-reason-${index}`, ($$anchor, reason) => {
		var li = root();
		var text_10 = $.only_child(li, true);

		$.template_effect(() => $.set_text(text_10, $.get(reason)));
		$.append($$anchor, li);
	});

	$.reset(ul);

	var ol = $.sibling(ul, 4);

	$.each(ol, 23, () => linkLocalApipaContent.apipa.howItWorks, (step, index) => `apipa-step-${index}`, ($$anchor, step) => {
		var li_1 = root();
		var text_11 = $.only_child(li_1, true);

		$.template_effect(() => $.set_text(text_11, $.get(step)));
		$.append($$anchor, li_1);
	});

	$.reset(ol);

	var ul_1 = $.sibling(ol, 4);

	$.each(ul_1, 23, () => linkLocalApipaContent.apipa.characteristics, (characteristic, index) => `apipa-char-${index}`, ($$anchor, characteristic) => {
		var li_2 = root();
		var text_12 = $.only_child(li_2, true);

		$.template_effect(() => $.set_text(text_12, $.get(characteristic)));
		$.append($$anchor, li_2);
	});

	$.reset(ul_1);

	var node = $.sibling(ul_1, 4);

	$.each(node, 19, () => linkLocalApipaContent.apipa.troubleshooting, (issue, index) => `${issue.symptom}-${index}`, ($$anchor, issue) => {
		var div_11 = root_1();
		var div_12 = $.child(div_11);
		var node_1 = $.child(div_12);

		Icon(node_1, { name: 'alert-triangle', size: 'sm' });

		var text_13 = $.sibling(node_1);

		$.reset(div_12);

		var div_13 = $.sibling(div_12, 2);
		var p_3 = $.child(div_13);
		var text_14 = $.sibling($.child(p_3));

		$.reset(p_3);

		var p_4 = $.sibling(p_3, 2);
		var text_15 = $.sibling($.child(p_4));

		$.reset(p_4);
		$.reset(div_13);
		$.reset(div_11);

		$.template_effect(() => {
			$.set_text(text_13, ` ${$.get(issue).symptom ?? ''}`);
			$.set_text(text_14, ` ${$.get(issue).meaning ?? ''}`);
			$.set_text(text_15, ` ${$.get(issue).solution ?? ''}`);
		});

		$.append($$anchor, div_11);
	});

	$.reset(div_4);

	var div_14 = $.sibling(div_4, 2);
	var h2_2 = $.child(div_14);
	var text_16 = $.only_child(h2_2, true);
	var div_15 = $.sibling(h2_2, 2);
	var div_16 = $.sibling($.child(div_15), 2);
	var div_17 = $.child(div_16);
	var code_3 = $.sibling($.child(div_17), 2);
	var text_17 = $.only_child(code_3, true);

	$.reset(div_17);

	var div_18 = $.sibling(div_17, 2);
	var code_4 = $.sibling($.child(div_18), 2);
	var text_18 = $.only_child(code_4, true);

	$.reset(div_18);

	var div_19 = $.sibling(div_18, 2);
	var code_5 = $.sibling($.child(div_19), 2);
	var text_19 = $.only_child(code_5, true);

	$.reset(div_19);
	$.reset(div_16);
	$.reset(div_15);

	var p_5 = $.sibling(div_15, 2);
	var text_20 = $.only_child(p_5, true);
	var ol_1 = $.sibling(p_5, 4);

	$.each(ol_1, 23, () => linkLocalApipaContent.ipv6LinkLocal.formation, (step, index) => `ipv6-formation-${index}`, ($$anchor, step) => {
		var li_3 = root();
		var text_21 = $.only_child(li_3, true);

		$.template_effect(() => $.set_text(text_21, $.get(step)));
		$.append($$anchor, li_3);
	});

	$.reset(ol_1);

	var ul_2 = $.sibling(ol_1, 4);

	$.each(ul_2, 23, () => linkLocalApipaContent.ipv6LinkLocal.whenUsed, (use, index) => `ipv6-use-${index}`, ($$anchor, use) => {
		var li_4 = root();
		var text_22 = $.only_child(li_4, true);

		$.template_effect(() => $.set_text(text_22, $.get(use)));
		$.append($$anchor, li_4);
	});

	$.reset(ul_2);

	var ul_3 = $.sibling(ul_2, 4);

	$.each(ul_3, 23, () => linkLocalApipaContent.ipv6LinkLocal.characteristics, (characteristic, index) => `ipv6-char-${index}`, ($$anchor, characteristic) => {
		var li_5 = root();
		var text_23 = $.only_child(li_5, true);

		$.template_effect(() => $.set_text(text_23, $.get(characteristic)));
		$.append($$anchor, li_5);
	});

	$.reset(ul_3);

	var div_20 = $.sibling(ul_3, 4);

	$.each(div_20, 23, () => linkLocalApipaContent.ipv6LinkLocal.types, (type, index) => `${type.type}-${index}`, ($$anchor, type) => {
		var div_21 = root_2();
		var div_22 = $.child(div_21);
		var text_24 = $.only_child(div_22, true);
		var div_23 = $.sibling(div_22, 2);
		var text_25 = $.only_child(div_23, true);
		var div_24 = $.sibling(div_23, 2);
		var code_6 = $.sibling($.child(div_24), 2);
		var text_26 = $.only_child(code_6, true);

		$.reset(div_24);

		var div_25 = $.sibling(div_24, 2);
		var text_27 = $.sibling($.child(div_25));

		$.reset(div_25);
		$.reset(div_21);

		$.template_effect(() => {
			$.set_text(text_24, $.get(type).type);
			$.set_text(text_25, $.get(type).description);
			$.set_text(text_26, $.get(type).example);
			$.set_text(text_27, ` ${$.get(type).privacy ?? ''}`);
		});

		$.append($$anchor, div_21);
	});

	$.reset(div_20);
	$.reset(div_14);

	var div_26 = $.sibling(div_14, 2);
	var table = $.sibling($.child(div_26), 2);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 23, () => linkLocalApipaContent.comparison, (row, index) => `${row.aspect}-${index}`, ($$anchor, row) => {
		var tr = root_3();
		var td = $.child(tr);
		var strong = $.child(td);
		var text_28 = $.only_child(strong, true);

		$.reset(td);

		var td_1 = $.sibling(td);
		var text_29 = $.only_child(td_1, true);
		var td_2 = $.sibling(td_1);
		var text_30 = $.only_child(td_2, true);

		$.reset(tr);

		$.template_effect(() => {
			$.set_text(text_28, $.get(row).aspect);
			$.set_text(text_29, $.get(row).ipv4);
			$.set_text(text_30, $.get(row).ipv6);
		});

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(div_26);

	var div_27 = $.sibling(div_26, 2);
	var node_2 = $.sibling($.child(div_27), 2);

	$.each(node_2, 19, () => linkLocalApipaContent.practicalExamples, (example, index) => `${example.scenario}-${index}`, ($$anchor, example) => {
		var div_28 = root_4();
		var div_29 = $.child(div_28);
		var text_31 = $.only_child(div_29, true);
		var div_30 = $.sibling(div_29, 2);
		var div_31 = $.child(div_30);
		var text_32 = $.sibling($.child(div_31));

		$.reset(div_31);

		var div_32 = $.sibling(div_31, 2);
		var text_33 = $.sibling($.child(div_32));

		$.reset(div_32);

		var div_33 = $.sibling(div_32, 2);
		var text_34 = $.sibling($.child(div_33));

		$.reset(div_33);
		$.reset(div_30);
		$.reset(div_28);

		$.template_effect(() => {
			$.set_text(text_31, $.get(example).scenario);
			$.set_text(text_32, ` ${$.get(example).ipv4Behavior ?? ''}`);
			$.set_text(text_33, ` ${$.get(example).ipv6Behavior ?? ''}`);
			$.set_text(text_34, ` ${$.get(example).impact ?? ''}`);
		});

		$.append($$anchor, div_28);
	});

	$.reset(div_27);

	var div_34 = $.sibling(div_27, 2);
	var table_1 = $.sibling($.child(div_34), 2);
	var tbody_1 = $.sibling($.child(table_1));

	$.each(tbody_1, 23, () => linkLocalApipaContent.troubleshootingCommands, (cmd, index) => `${cmd.purpose}-${index}`, ($$anchor, cmd) => {
		var tr_1 = root_5();
		var td_3 = $.child(tr_1);
		var strong_1 = $.child(td_3);
		var text_35 = $.only_child(strong_1, true);

		$.reset(td_3);

		var td_4 = $.sibling(td_3);
		var code_7 = $.child(td_4);
		var text_36 = $.only_child(code_7, true);

		$.reset(td_4);

		var td_5 = $.sibling(td_4);
		var code_8 = $.child(td_5);
		var text_37 = $.only_child(code_8, true);

		$.reset(td_5);

		var td_6 = $.sibling(td_5);
		var code_9 = $.child(td_6);
		var text_38 = $.only_child(code_9, true);

		$.reset(td_6);
		$.reset(tr_1);

		$.template_effect(() => {
			$.set_text(text_35, $.get(cmd).purpose);
			$.set_text(text_36, $.get(cmd).windows);
			$.set_text(text_37, $.get(cmd).linux);
			$.set_text(text_38, $.get(cmd).macOS);
		});

		$.append($$anchor, tr_1);
	});

	$.reset(tbody_1);
	$.reset(table_1);
	$.reset(div_34);

	var div_35 = $.sibling(div_34, 2);
	var node_3 = $.sibling($.child(div_35), 2);

	$.each(node_3, 19, () => linkLocalApipaContent.whenToWorry, (situation, index) => `${situation.situation}-${index}`, ($$anchor, situation) => {
		var div_36 = root_6();
		var div_37 = $.child(div_36);
		var text_39 = $.only_child(div_37, true);
		var div_38 = $.sibling(div_37, 2);
		var div_39 = $.child(div_38);
		var text_40 = $.sibling($.child(div_39));

		$.reset(div_39);

		var div_40 = $.sibling(div_39, 2);
		var text_41 = $.sibling($.child(div_40));

		$.reset(div_40);
		$.reset(div_38);
		$.reset(div_36);

		$.template_effect(() => {
			$.set_text(text_39, $.get(situation).situation);
			$.set_text(text_40, ` ${$.get(situation).concern ?? ''}`);
			$.set_text(text_41, ` ${$.get(situation).action ?? ''}`);
		});

		$.append($$anchor, div_36);
	});

	$.reset(div_35);

	var div_41 = $.sibling(div_35, 2);
	var ul_4 = $.sibling($.child(div_41), 2);

	$.each(ul_4, 23, () => linkLocalApipaContent.bestPractices, (practice, index) => `practice-${index}`, ($$anchor, practice) => {
		var li_6 = root();
		var text_42 = $.only_child(li_6, true);

		$.template_effect(() => $.set_text(text_42, $.get(practice)));
		$.append($$anchor, li_6);
	});

	$.reset(ul_4);
	$.reset(div_41);

	var div_42 = $.sibling(div_41, 2);
	var ul_5 = $.sibling($.child(div_42), 2);

	$.each(ul_5, 23, () => linkLocalApipaContent.commonMistakes, (mistake, index) => `mistake-${index}`, ($$anchor, mistake) => {
		var li_7 = root();
		var text_43 = $.only_child(li_7, true);

		$.template_effect(() => $.set_text(text_43, $.get(mistake)));
		$.append($$anchor, li_7);
	});

	$.reset(ul_5);
	$.reset(div_42);

	var div_43 = $.sibling(div_42, 2);
	var div_44 = $.sibling($.child(div_43), 2);
	var div_45 = $.child(div_44);
	var node_4 = $.sibling($.child(div_45), 2);

	$.each(node_4, 19, () => linkLocalApipaContent.quickReference.recognition, (item, index) => `recognition-${index}`, ($$anchor, item) => {
		var div_46 = root_7();
		var text_44 = $.only_child(div_46, true);

		$.template_effect(() => $.set_text(text_44, $.get(item)));
		$.append($$anchor, div_46);
	});

	$.reset(div_45);

	var div_47 = $.sibling(div_45, 2);
	var node_5 = $.sibling($.child(div_47), 2);

	$.each(node_5, 19, () => linkLocalApipaContent.quickReference.troubleshooting, (item, index) => `qr-trouble-${index}`, ($$anchor, item) => {
		var div_48 = root_7();
		var text_45 = $.only_child(div_48, true);

		$.template_effect(() => $.set_text(text_45, $.get(item)));
		$.append($$anchor, div_48);
	});

	$.reset(div_47);
	$.reset(div_44);

	var div_49 = $.sibling(div_44, 2);
	var div_50 = $.child(div_49);
	var node_6 = $.child(div_50);

	Icon(node_6, { name: 'key', size: 'sm' });
	$.next();
	$.reset(div_50);
	$.next(2);
	$.reset(div_49);
	$.reset(div_43);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_text(text, linkLocalApipaContent.title);
			$.set_text(text_1, linkLocalApipaContent.description);
			$.set_text(text_2, linkLocalApipaContent.sections.overview.title);
			$.set_text(text_3, linkLocalApipaContent.sections.overview.content);
			$.set_text(text_4, linkLocalApipaContent.apipa.title);
			$.set_text(text_5, linkLocalApipaContent.apipa.range);
			$.set_text(text_6, linkLocalApipaContent.apipa.fullRange);
			$.set_text(text_7, linkLocalApipaContent.apipa.usableRange);
			$.set_text(text_8, ` ${$0 ?? ''}`);
			$.set_text(text_9, linkLocalApipaContent.apipa.description);
			$.set_text(text_16, linkLocalApipaContent.ipv6LinkLocal.title);
			$.set_text(text_17, linkLocalApipaContent.ipv6LinkLocal.range);
			$.set_text(text_18, linkLocalApipaContent.ipv6LinkLocal.fullRange);
			$.set_text(text_19, linkLocalApipaContent.ipv6LinkLocal.commonFormat);
			$.set_text(text_20, linkLocalApipaContent.ipv6LinkLocal.description);
		},
		[
			() => linkLocalApipaContent.apipa.reservedAddresses.join(', ')
		]
	);

	$.append($$anchor, div);
	$.pop();
}