import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { icmpContent } from '$lib/content/icmp.js';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<li> </li>`);
var root_1 = $.from_html(`<div><strong>Common Codes:</strong></div> <ul></ul>`, 1);
var root_2 = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><div><strong>Description:</strong> </div> <div><strong>Common Use:</strong> </div> <div><strong>Example:</strong> </div> <div><strong>Troubleshooting:</strong> </div> <!></div></div>`);
var root_3 = $.from_html(`<div class="ref-warning"><div class="warning-title"><!> </div> <div class="warning-content"><p><strong>ICMP Types Involved:</strong> </p> <p><strong>What to Check:</strong></p> <ul></ul> <p><strong>Common Causes:</strong> </p></div></div>`);
var root_4 = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><div><strong>Problem:</strong> </div> <div><strong>Solution:</strong> </div> <div><strong>Recommendation:</strong> </div></div></div>`);
var root_5 = $.from_html(`<tr><td><code> </code></td><td> </td><td> </td></tr>`);
var root_6 = $.from_html(`<div class="item-code"> </div>`);
var root_7 = $.from_html(`<div class="example-item"><div class="example-description"> </div></div>`);

var root_8 = $.from_html(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1> </h1> <p class="subtitle"> </p></div> <div class="ref-section"><h2> </h2> <p> </p></div> <div class="ref-section"><h2>Common ICMPv4 Types</h2> <!></div> <div class="ref-section"><h2>Common ICMPv6 Types</h2> <!></div> <div class="ref-section"><h2>Practical Troubleshooting Scenarios</h2> <!></div> <div class="ref-section"><h2>Common ICMP Filtering Issues</h2> <!></div> <div class="ref-section"><h2>Troubleshooting Commands</h2> <table class="ref-table"><thead><tr><th>Command</th><th>Purpose</th><th>ICMP Type Used</th></tr></thead><tbody></tbody></table></div> <div class="ref-section"><h2>Best Practices for ICMP</h2> <ul></ul></div> <div class="ref-section"><h2>ICMP Quick Reference</h2> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title">Always Allow These</div> <!></div> <div class="grid-item"><div class="item-title">Never Filter These</div> <!> <div class="item-description">Critical for proper network operation</div></div></div></div> <div class="ref-section"><h2>Common Mistakes to Avoid</h2> <div class="ref-examples"><div class="examples-title">Don't Do These</div> <!></div> <div class="ref-highlight"><div class="highlight-title"><!> Security vs Functionality</div> <div class="highlight-content">Don't block all ICMP for security. Instead, use rate limiting and allow essential types. Blocking ICMP
          completely breaks critical network functions like Path MTU Discovery and IPv6 Neighbor Discovery.</div></div></div></div></div>`);

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

	$.each(node, 19, () => icmpContent.icmpv4Types, (type, index) => `${type.type}-${index}`, ($$anchor, type) => {
		var div_5 = root_2();
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

		var div_11 = $.sibling(div_10, 2);
		var text_8 = $.sibling($.child(div_11));

		$.reset(div_11);

		var node_1 = $.sibling(div_11, 2);

		{
			var consequent = ($$anchor) => {
				var fragment = root_1();
				var ul = $.sibling($.first_child(fragment), 2);

				$.each(ul, 23, () => $.get(type).codes, (code, index) => `code-${code.code}-${index}`, ($$anchor, code, index, $$array) => {
					var li = root();
					var text_9 = $.only_child(li);

					$.template_effect(() => $.set_text(text_9, `Code ${$.get(code).code ?? ''}: ${$.get(code).meaning ?? ''}`));
					$.append($$anchor, li);
				});

				$.reset(ul);
				$.append($$anchor, fragment);
			};

			$.if(node_1, ($$render) => {
				if ($.get(type).codes) $$render(consequent);
			});
		}

		$.reset(div_7);
		$.reset(div_5);

		$.template_effect(() => {
			$.set_text(text_4, `Type ${$.get(type).type ?? ''}: ${$.get(type).name ?? ''}`);
			$.set_text(text_5, ` ${$.get(type).description ?? ''}`);
			$.set_text(text_6, ` ${$.get(type).commonUse ?? ''}`);
			$.set_text(text_7, ` ${$.get(type).example ?? ''}`);
			$.set_text(text_8, ` ${$.get(type).troubleshooting ?? ''}`);
		});

		$.append($$anchor, div_5);
	});

	$.reset(div_4);

	var div_12 = $.sibling(div_4, 2);
	var node_2 = $.sibling($.child(div_12), 2);

	$.each(node_2, 19, () => icmpContent.icmpv6Types, (type, index) => `${type.type}-${index}`, ($$anchor, type) => {
		var div_13 = root_2();
		var div_14 = $.child(div_13);
		var text_10 = $.only_child(div_14);
		var div_15 = $.sibling(div_14, 2);
		var div_16 = $.child(div_15);
		var text_11 = $.sibling($.child(div_16));

		$.reset(div_16);

		var div_17 = $.sibling(div_16, 2);
		var text_12 = $.sibling($.child(div_17));

		$.reset(div_17);

		var div_18 = $.sibling(div_17, 2);
		var text_13 = $.sibling($.child(div_18));

		$.reset(div_18);

		var div_19 = $.sibling(div_18, 2);
		var text_14 = $.sibling($.child(div_19));

		$.reset(div_19);

		var node_3 = $.sibling(div_19, 2);

		{
			var consequent_1 = ($$anchor) => {
				var fragment_1 = root_1();
				var ul_1 = $.sibling($.first_child(fragment_1), 2);

				$.each(ul_1, 23, () => $.get(type).codes, (code, index) => `code-${code.code}-${index}`, ($$anchor, code, index, $$array_1) => {
					var li_1 = root();
					var text_15 = $.only_child(li_1);

					$.template_effect(() => $.set_text(text_15, `Code ${$.get(code).code ?? ''}: ${$.get(code).meaning ?? ''}`));
					$.append($$anchor, li_1);
				});

				$.reset(ul_1);
				$.append($$anchor, fragment_1);
			};

			$.if(node_3, ($$render) => {
				if ($.get(type).codes) $$render(consequent_1);
			});
		}

		$.reset(div_15);
		$.reset(div_13);

		$.template_effect(() => {
			$.set_text(text_10, `Type ${$.get(type).type ?? ''}: ${$.get(type).name ?? ''}`);
			$.set_text(text_11, ` ${$.get(type).description ?? ''}`);
			$.set_text(text_12, ` ${$.get(type).commonUse ?? ''}`);
			$.set_text(text_13, ` ${$.get(type).example ?? ''}`);
			$.set_text(text_14, ` ${$.get(type).troubleshooting ?? ''}`);
		});

		$.append($$anchor, div_13);
	});

	$.reset(div_12);

	var div_20 = $.sibling(div_12, 2);
	var node_4 = $.sibling($.child(div_20), 2);

	$.each(node_4, 19, () => icmpContent.practicalExamples, (scenario, index) => `${scenario.scenario}-${index}`, ($$anchor, scenario) => {
		var div_21 = root_3();
		var div_22 = $.child(div_21);
		var node_5 = $.child(div_22);

		Icon(node_5, { name: 'search', size: 'sm' });

		var text_16 = $.sibling(node_5);

		$.reset(div_22);

		var div_23 = $.sibling(div_22, 2);
		var p_2 = $.child(div_23);
		var text_17 = $.sibling($.child(p_2));

		$.reset(p_2);

		var ul_2 = $.sibling(p_2, 4);

		$.each(ul_2, 23, () => $.get(scenario).whatToCheck, (check, index) => `check-${index}`, ($$anchor, check, index, $$array_2) => {
			var li_2 = root();
			var text_18 = $.only_child(li_2, true);

			$.template_effect(() => $.set_text(text_18, $.get(check)));
			$.append($$anchor, li_2);
		});

		$.reset(ul_2);

		var p_3 = $.sibling(ul_2, 2);
		var text_19 = $.sibling($.child(p_3));

		$.reset(p_3);
		$.reset(div_23);
		$.reset(div_21);

		$.template_effect(
			($0, $1) => {
				$.set_text(text_16, ` ${$.get(scenario).scenario ?? ''}`);
				$.set_text(text_17, ` ${$0 ?? ''}`);
				$.set_text(text_19, ` ${$1 ?? ''}`);
			},
			[
				() => $.get(scenario).icmpTypes.join(', '),
				() => $.get(scenario).commonCauses.join(', ')
			]
		);

		$.append($$anchor, div_21);
	});

	$.reset(div_20);

	var div_24 = $.sibling(div_20, 2);
	var node_6 = $.sibling($.child(div_24), 2);

	$.each(node_6, 19, () => icmpContent.filteringIssues, (issue, index) => `${issue.issue}-${index}`, ($$anchor, issue) => {
		var div_25 = root_4();
		var div_26 = $.child(div_25);
		var text_20 = $.only_child(div_26, true);
		var div_27 = $.sibling(div_26, 2);
		var div_28 = $.child(div_27);
		var text_21 = $.sibling($.child(div_28));

		$.reset(div_28);

		var div_29 = $.sibling(div_28, 2);
		var text_22 = $.sibling($.child(div_29));

		$.reset(div_29);

		var div_30 = $.sibling(div_29, 2);
		var text_23 = $.sibling($.child(div_30));

		$.reset(div_30);
		$.reset(div_27);
		$.reset(div_25);

		$.template_effect(() => {
			$.set_text(text_20, $.get(issue).issue);
			$.set_text(text_21, ` ${$.get(issue).problem ?? ''}`);
			$.set_text(text_22, ` ${$.get(issue).solution ?? ''}`);
			$.set_text(text_23, ` ${$.get(issue).recommendation ?? ''}`);
		});

		$.append($$anchor, div_25);
	});

	$.reset(div_24);

	var div_31 = $.sibling(div_24, 2);
	var table = $.sibling($.child(div_31), 2);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 23, () => icmpContent.troubleshootingCommands, (cmd, index) => `${cmd.purpose}-${index}`, ($$anchor, cmd) => {
		var tr = root_5();
		var td = $.child(tr);
		var code_1 = $.child(td);
		var text_24 = $.only_child(code_1, true);

		$.reset(td);

		var td_1 = $.sibling(td);
		var text_25 = $.only_child(td_1, true);
		var td_2 = $.sibling(td_1);
		var text_26 = $.only_child(td_2, true);

		$.reset(tr);

		$.template_effect(() => {
			$.set_text(text_24, $.get(cmd).command);
			$.set_text(text_25, $.get(cmd).purpose);
			$.set_text(text_26, $.get(cmd).icmpType);
		});

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(div_31);

	var div_32 = $.sibling(div_31, 2);
	var ul_3 = $.sibling($.child(div_32), 2);

	$.each(ul_3, 23, () => icmpContent.bestPractices, (practice, index) => `practice-${index}`, ($$anchor, practice) => {
		var li_3 = root();
		var text_27 = $.only_child(li_3, true);

		$.template_effect(() => $.set_text(text_27, $.get(practice)));
		$.append($$anchor, li_3);
	});

	$.reset(ul_3);
	$.reset(div_32);

	var div_33 = $.sibling(div_32, 2);
	var div_34 = $.sibling($.child(div_33), 2);
	var div_35 = $.child(div_34);
	var node_7 = $.sibling($.child(div_35), 2);

	$.each(node_7, 19, () => icmpContent.quickReference.mustAllow, (type, index) => `must-${index}`, ($$anchor, type) => {
		var div_36 = root_6();
		var text_28 = $.only_child(div_36, true);

		$.template_effect(() => $.set_text(text_28, $.get(type)));
		$.append($$anchor, div_36);
	});

	$.reset(div_35);

	var div_37 = $.sibling(div_35, 2);
	var node_8 = $.sibling($.child(div_37), 2);

	$.each(node_8, 19, () => icmpContent.quickReference.neverFilter, (type, index) => `never-${index}`, ($$anchor, type) => {
		var div_38 = root_6();
		var text_29 = $.only_child(div_38, true);

		$.template_effect(() => $.set_text(text_29, $.get(type)));
		$.append($$anchor, div_38);
	});

	$.next(2);
	$.reset(div_37);
	$.reset(div_34);
	$.reset(div_33);

	var div_39 = $.sibling(div_33, 2);
	var div_40 = $.sibling($.child(div_39), 2);
	var node_9 = $.sibling($.child(div_40), 2);

	$.each(node_9, 19, () => icmpContent.commonMistakes, (mistake, index) => `mistake-${index}`, ($$anchor, mistake) => {
		var div_41 = root_7();
		var div_42 = $.child(div_41);
		var text_30 = $.only_child(div_42, true);

		$.reset(div_41);
		$.template_effect(() => $.set_text(text_30, $.get(mistake)));
		$.append($$anchor, div_41);
	});

	$.reset(div_40);

	var div_43 = $.sibling(div_40, 2);
	var div_44 = $.child(div_43);
	var node_10 = $.child(div_44);

	Icon(node_10, { name: 'shield-check', size: 'sm' });
	$.next();
	$.reset(div_44);
	$.next(2);
	$.reset(div_43);
	$.reset(div_39);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, icmpContent.title);
		$.set_text(text_1, icmpContent.description);
		$.set_text(text_2, icmpContent.sections.overview.title);
		$.set_text(text_3, icmpContent.sections.overview.content);
	});

	$.append($$anchor, div);
	$.pop();
}