import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mtuMssContent } from '$lib/content/mtu-mss.js';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<tr><td><strong> </strong></td><td><code> </code></td><td><code> </code></td><td> </td><td> </td></tr>`);
var root_1 = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><div><strong>MTU:</strong> </div> <div><strong>IP Header:</strong> </div> <div><strong>TCP Header:</strong> </div> <div><strong>Resulting MSS:</strong> <code> </code> bytes</div> <div><strong>Calculation:</strong> </div></div></div>`);
var root_2 = $.from_html(`<tr><td><strong> </strong></td><td><code> </code></td><td> </td></tr>`);
var root_3 = $.from_html(`<li> </li>`);
var root_4 = $.from_html(`<div class="ref-warning"><div class="warning-title"><!> </div> <div class="warning-content"><p><strong>Cause:</strong> </p> <p><strong>Solution:</strong> </p></div></div>`);
var root_5 = $.from_html(`<tr><td><strong> </strong></td><td><code style="font-size: 0.85em;"> </code></td><td> </td></tr>`);
var root_6 = $.from_html(`<div class="example-item"><div class="example-input"> </div></div>`);

var root_7 = $.from_html(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1> </h1> <p class="subtitle"> </p></div> <div class="ref-section"><h2> </h2> <p> </p> <div class="ref-highlight"><div class="highlight-title"><!> Key Formula</div> <div class="highlight-content">MSS = MTU - IP Header - TCP Header<br/> For IPv4: MSS = MTU - 20 - 20 = MTU - 40 bytes</div></div></div> <div class="ref-section"><h2>Common MTU/MSS Values</h2> <table class="ref-table"><thead><tr><th>Medium</th><th>MTU</th><th>MSS</th><th>Usage</th><th>Notes</th></tr></thead><tbody></tbody></table></div> <div class="ref-section"><h2> </h2> <!></div> <div class="ref-section"><h2>Protocol Overheads</h2> <table class="ref-table"><thead><tr><th>Protocol/Header</th><th>Overhead (Bytes)</th><th>Notes</th></tr></thead><tbody></tbody></table></div> <div class="ref-section"><h2> </h2> <p> </p> <h3>PMTU Discovery Process</h3> <ol></ol> <h3>Common Issues</h3> <ul></ul></div> <div class="ref-section"><h2>Troubleshooting Common Issues</h2> <!></div> <div class="ref-section"><h2>Useful Commands</h2> <h3>Checking MTU Settings</h3> <table class="ref-table"><thead><tr><th>Platform</th><th>Command</th><th>Purpose</th></tr></thead><tbody></tbody></table> <h3>Testing MTU Size</h3> <table class="ref-table"><thead><tr><th>Platform</th><th>Command</th><th>Purpose</th></tr></thead><tbody></tbody></table></div> <div class="ref-section"><h2>Best Practices</h2> <ul></ul> <div class="ref-highlight"><div class="highlight-title"><!> Performance Tip</div> <div class="highlight-content">Mismatched MTU sizes can cause significant performance issues. Always ensure consistent MTU values across your
          network path, especially for high-throughput applications.</div></div></div> <div class="ref-section"><h2>Quick Reference</h2> <div class="ref-examples"><div class="examples-title">Common Values to Remember</div> <!></div> <div class="ref-warning"><div class="warning-title"><!> Important Note</div> <div class="warning-content">When troubleshooting connectivity issues, especially with VPNs or tunnels, MTU/MSS mismatches are often the
          culprit. Test with smaller packet sizes if large transfers fail but small ones succeed.</div></div></div></div></div>`);

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
	var div_4 = $.sibling(p_1, 2);
	var div_5 = $.child(div_4);
	var node = $.child(div_5);

	Icon(node, { name: 'formula', size: 'sm' });
	$.next();
	$.reset(div_5);
	$.next(2);
	$.reset(div_4);
	$.reset(div_3);

	var div_6 = $.sibling(div_3, 2);
	var table = $.sibling($.child(div_6), 2);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 23, () => mtuMssContent.commonValues, (value, index) => `${value.medium}-${index}`, ($$anchor, value) => {
		var tr = root();
		var td = $.child(tr);
		var strong = $.child(td);
		var text_4 = $.only_child(strong, true);

		$.reset(td);

		var td_1 = $.sibling(td);
		var code = $.child(td_1);
		var text_5 = $.only_child(code, true);

		$.reset(td_1);

		var td_2 = $.sibling(td_1);
		var code_1 = $.child(td_2);
		var text_6 = $.only_child(code_1, true);

		$.reset(td_2);

		var td_3 = $.sibling(td_2);
		var text_7 = $.only_child(td_3, true);
		var td_4 = $.sibling(td_3);
		var text_8 = $.only_child(td_4, true);

		$.reset(tr);

		$.template_effect(() => {
			$.set_text(text_4, $.get(value).medium);
			$.set_text(text_5, $.get(value).mtu);
			$.set_text(text_6, $.get(value).mss);
			$.set_text(text_7, $.get(value).usage);
			$.set_text(text_8, $.get(value).notes);
		});

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var h2_1 = $.child(div_7);
	var text_9 = $.only_child(h2_1, true);
	var node_1 = $.sibling(h2_1, 2);

	$.each(node_1, 19, () => mtuMssContent.calculations.examples, (example, index) => `${example.scenario}-${index}`, ($$anchor, example) => {
		var div_8 = root_1();
		var div_9 = $.child(div_8);
		var text_10 = $.only_child(div_9, true);
		var div_10 = $.sibling(div_9, 2);
		var div_11 = $.child(div_10);
		var text_11 = $.sibling($.child(div_11));

		$.reset(div_11);

		var div_12 = $.sibling(div_11, 2);
		var text_12 = $.sibling($.child(div_12));

		$.reset(div_12);

		var div_13 = $.sibling(div_12, 2);
		var text_13 = $.sibling($.child(div_13));

		$.reset(div_13);

		var div_14 = $.sibling(div_13, 2);
		var code_2 = $.sibling($.child(div_14), 2);
		var text_14 = $.only_child(code_2, true);

		$.next();
		$.reset(div_14);

		var div_15 = $.sibling(div_14, 2);
		var text_15 = $.sibling($.child(div_15));

		$.reset(div_15);
		$.reset(div_10);
		$.reset(div_8);

		$.template_effect(() => {
			$.set_text(text_10, $.get(example).scenario);
			$.set_text(text_11, ` ${$.get(example).mtu ?? ''} bytes`);
			$.set_text(text_12, ` ${$.get(example).ipHeader ?? ''} bytes`);
			$.set_text(text_13, ` ${$.get(example).tcpHeader ?? ''} bytes`);
			$.set_text(text_14, $.get(example).mss);
			$.set_text(text_15, ` ${$.get(example).calculation ?? ''}`);
		});

		$.append($$anchor, div_8);
	});

	$.reset(div_7);

	var div_16 = $.sibling(div_7, 2);
	var table_1 = $.sibling($.child(div_16), 2);
	var tbody_1 = $.sibling($.child(table_1));

	$.each(tbody_1, 23, () => mtuMssContent.overheads, (overhead, index) => `${overhead.protocol}-${index}`, ($$anchor, overhead) => {
		var tr_1 = root_2();
		var td_5 = $.child(tr_1);
		var strong_1 = $.child(td_5);
		var text_16 = $.only_child(strong_1, true);

		$.reset(td_5);

		var td_6 = $.sibling(td_5);
		var code_3 = $.child(td_6);
		var text_17 = $.only_child(code_3, true);

		$.reset(td_6);

		var td_7 = $.sibling(td_6);
		var text_18 = $.only_child(td_7, true);

		$.reset(tr_1);

		$.template_effect(() => {
			$.set_text(text_16, $.get(overhead).protocol);
			$.set_text(text_17, $.get(overhead).overhead);
			$.set_text(text_18, $.get(overhead).notes);
		});

		$.append($$anchor, tr_1);
	});

	$.reset(tbody_1);
	$.reset(table_1);
	$.reset(div_16);

	var div_17 = $.sibling(div_16, 2);
	var h2_2 = $.child(div_17);
	var text_19 = $.only_child(h2_2, true);
	var p_2 = $.sibling(h2_2, 2);
	var text_20 = $.only_child(p_2, true);
	var ol = $.sibling(p_2, 4);

	$.each(ol, 23, () => mtuMssContent.discovery.process, (step, index) => `discovery-step-${index}`, ($$anchor, step) => {
		var li = root_3();
		var text_21 = $.only_child(li, true);

		$.template_effect(() => $.set_text(text_21, $.get(step)));
		$.append($$anchor, li);
	});

	$.reset(ol);

	var ul = $.sibling(ol, 4);

	$.each(ul, 23, () => mtuMssContent.discovery.issues, (issue, index) => `discovery-issue-${index}`, ($$anchor, issue) => {
		var li_1 = root_3();
		var text_22 = $.only_child(li_1, true);

		$.template_effect(() => $.set_text(text_22, $.get(issue)));
		$.append($$anchor, li_1);
	});

	$.reset(ul);
	$.reset(div_17);

	var div_18 = $.sibling(div_17, 2);
	var node_2 = $.sibling($.child(div_18), 2);

	$.each(node_2, 19, () => mtuMssContent.troubleshooting, (issue, index) => `${issue.issue}-${index}`, ($$anchor, issue) => {
		var div_19 = root_4();
		var div_20 = $.child(div_19);
		var node_3 = $.child(div_20);

		Icon(node_3, { name: 'help-circle', size: 'sm' });

		var text_23 = $.sibling(node_3);

		$.reset(div_20);

		var div_21 = $.sibling(div_20, 2);
		var p_3 = $.child(div_21);
		var text_24 = $.sibling($.child(p_3));

		$.reset(p_3);

		var p_4 = $.sibling(p_3, 2);
		var text_25 = $.sibling($.child(p_4));

		$.reset(p_4);
		$.reset(div_21);
		$.reset(div_19);

		$.template_effect(() => {
			$.set_text(text_23, ` ${$.get(issue).issue ?? ''}`);
			$.set_text(text_24, ` ${$.get(issue).cause ?? ''}`);
			$.set_text(text_25, ` ${$.get(issue).solution ?? ''}`);
		});

		$.append($$anchor, div_19);
	});

	$.reset(div_18);

	var div_22 = $.sibling(div_18, 2);
	var table_2 = $.sibling($.child(div_22), 4);
	var tbody_2 = $.sibling($.child(table_2));

	$.each(tbody_2, 23, () => mtuMssContent.commands, (cmd, index) => `${cmd.platform}-${index}`, ($$anchor, cmd) => {
		var tr_2 = root_2();
		var td_8 = $.child(tr_2);
		var strong_2 = $.child(td_8);
		var text_26 = $.only_child(strong_2, true);

		$.reset(td_8);

		var td_9 = $.sibling(td_8);
		var code_4 = $.child(td_9);
		var text_27 = $.only_child(code_4, true);

		$.reset(td_9);

		var td_10 = $.sibling(td_9);
		var text_28 = $.only_child(td_10, true);

		$.reset(tr_2);

		$.template_effect(() => {
			$.set_text(text_26, $.get(cmd).platform);
			$.set_text(text_27, $.get(cmd).command);
			$.set_text(text_28, $.get(cmd).purpose);
		});

		$.append($$anchor, tr_2);
	});

	$.reset(tbody_2);
	$.reset(table_2);

	var table_3 = $.sibling(table_2, 4);
	var tbody_3 = $.sibling($.child(table_3));

	$.each(tbody_3, 23, () => mtuMssContent.testCommands, (cmd, index) => `${cmd.purpose}-${index}`, ($$anchor, cmd) => {
		var tr_3 = root_5();
		var td_11 = $.child(tr_3);
		var strong_3 = $.child(td_11);
		var text_29 = $.only_child(strong_3, true);

		$.reset(td_11);

		var td_12 = $.sibling(td_11);
		var code_5 = $.child(td_12);
		var text_30 = $.only_child(code_5, true);

		$.reset(td_12);

		var td_13 = $.sibling(td_12);
		var text_31 = $.only_child(td_13, true);

		$.reset(tr_3);

		$.template_effect(() => {
			$.set_text(text_29, $.get(cmd).platform);
			$.set_text(text_30, $.get(cmd).command);
			$.set_text(text_31, $.get(cmd).purpose);
		});

		$.append($$anchor, tr_3);
	});

	$.reset(tbody_3);
	$.reset(table_3);
	$.reset(div_22);

	var div_23 = $.sibling(div_22, 2);
	var ul_1 = $.sibling($.child(div_23), 2);

	$.each(ul_1, 23, () => mtuMssContent.bestPractices, (practice, index) => `practice-${index}`, ($$anchor, practice) => {
		var li_2 = root_3();
		var text_32 = $.only_child(li_2, true);

		$.template_effect(() => $.set_text(text_32, $.get(practice)));
		$.append($$anchor, li_2);
	});

	$.reset(ul_1);

	var div_24 = $.sibling(ul_1, 2);
	var div_25 = $.child(div_24);
	var node_4 = $.child(div_25);

	Icon(node_4, { name: 'zap', size: 'sm' });
	$.next();
	$.reset(div_25);
	$.next(2);
	$.reset(div_24);
	$.reset(div_23);

	var div_26 = $.sibling(div_23, 2);
	var div_27 = $.sibling($.child(div_26), 2);
	var node_5 = $.sibling($.child(div_27), 2);

	$.each(node_5, 19, () => mtuMssContent.quickReference, (value, index) => `value-${index}`, ($$anchor, value) => {
		var div_28 = root_6();
		var div_29 = $.child(div_28);
		var text_33 = $.only_child(div_29, true);

		$.reset(div_28);
		$.template_effect(() => $.set_text(text_33, $.get(value)));
		$.append($$anchor, div_28);
	});

	$.reset(div_27);

	var div_30 = $.sibling(div_27, 2);
	var div_31 = $.child(div_30);
	var node_6 = $.child(div_31);

	Icon(node_6, { name: 'alert-circle', size: 'sm' });
	$.next();
	$.reset(div_31);
	$.next(2);
	$.reset(div_30);
	$.reset(div_26);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, mtuMssContent.title);
		$.set_text(text_1, mtuMssContent.description);
		$.set_text(text_2, mtuMssContent.sections.overview.title);
		$.set_text(text_3, mtuMssContent.sections.overview.content);
		$.set_text(text_9, mtuMssContent.calculations.title);
		$.set_text(text_19, mtuMssContent.discovery.title);
		$.set_text(text_20, mtuMssContent.discovery.description);
	});

	$.append($$anchor, div);
	$.pop();
}