import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { privateVsPublicContent } from '$lib/content/private-vs-public-ip.js';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<code class="example-input"> </code>`);
var root_1 = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><div><strong>Full Range:</strong> <code> </code></div> <div><strong>Total Addresses:</strong> </div> <div><strong>Common Use:</strong> </div> <div><strong>Examples:</strong></div> <!></div></div>`);
var root_2 = $.from_html(`<li> </li>`);
var root_3 = $.from_html(`<tr><td><code> </code></td><td> </td></tr>`);
var root_4 = $.from_html(`<tr><td><strong> </strong></td><td> </td><td><code> </code></td><td><code> </code></td></tr>`);
var root_5 = $.from_html(`<div class="grid-item"><div class="item-title"> </div> <div class="item-description"> </div></div>`);
var root_6 = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><div><strong>Setup:</strong> </div> <div><strong>Private IPs:</strong> </div> <div><strong>Public IP:</strong> </div> <div><strong>NAT Behavior:</strong> </div></div></div>`);
var root_7 = $.from_html(`<div class="ref-warning"><div class="warning-title"><!> </div> <div class="warning-content"><p><strong>Possible Causes:</strong> </p> <p><strong>Diagnosis:</strong> </p> <p><strong>Solution:</strong> </p></div></div>`);
var root_8 = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><ul></ul></div></div>`);
var root_9 = $.from_html(`<div class="item-code"> </div>`);
var root_10 = $.from_html(`<div class="item-description"> </div>`);

var root_11 = $.from_html(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1> </h1> <p class="subtitle"> </p></div> <div class="ref-section"><h2> </h2> <p> </p></div> <div class="ref-section"><h2>Private IP Address Ranges (RFC 1918)</h2> <!></div> <div class="ref-section"><h2>Public IP Addresses</h2> <p> </p> <h3>Characteristics</h3> <ul></ul> <h3>Examples</h3> <table class="ref-table"><thead><tr><th>Public IP</th><th>Owner/Service</th></tr></thead><tbody></tbody></table></div> <div class="ref-section"><h2> </h2> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title"> </div> <div class="item-description"> </div> <h4>Process:</h4> <ol></ol> <h4>Benefits:</h4> <ul></ul></div> <div class="grid-item"><div class="item-title"> </div> <div class="item-description"> </div> <h4>Challenges:</h4> <ul></ul> <h4>Solutions:</h4> <ul></ul></div></div></div> <div class="ref-section"><h2>Quick Identification Methods</h2> <table class="ref-table"><thead><tr><th>Method</th><th>Description</th><th>Private Indicator</th><th>Public Indicator</th></tr></thead><tbody></tbody></table> <h3>Useful Tools</h3> <div class="ref-grid two-col"></div></div> <div class="ref-section"><h2>Common Network Scenarios</h2> <!></div> <div class="ref-section"><h2>Troubleshooting Common Issues</h2> <!></div> <div class="ref-section"><h2>Security Considerations</h2> <!></div> <div class="ref-section"><h2>Best Practices</h2> <ul></ul></div> <div class="ref-section"><h2>Quick Reference</h2> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title">Private IP Ranges</div> <!></div> <div class="grid-item"><div class="item-title">Identification Tips</div> <!></div></div> <div class="ref-highlight"><div class="highlight-title"><!> Key Rule</div> <div class="highlight-content">If an IP starts with 10, 172.16-31, or 192.168, it's private. Everything else (except other reserved ranges)
          is public. Private IPs need NAT to reach the internet.</div></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var div = root_11();
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

	$.each(node, 19, () => privateVsPublicContent.privateRanges, (range, index) => `${range.range}-${index}`, ($$anchor, range) => {
		var div_5 = root_1();
		var div_6 = $.child(div_5);
		var text_4 = $.only_child(div_6);
		var div_7 = $.sibling(div_6, 2);
		var div_8 = $.child(div_7);
		var code = $.sibling($.child(div_8), 2);
		var text_5 = $.only_child(code, true);

		$.reset(div_8);

		var div_9 = $.sibling(div_8, 2);
		var text_6 = $.sibling($.child(div_9));

		$.reset(div_9);

		var div_10 = $.sibling(div_9, 2);
		var text_7 = $.sibling($.child(div_10));

		$.reset(div_10);

		var node_1 = $.sibling(div_10, 4);

		$.each(node_1, 19, () => $.get(range).examples, (example, index) => `example-${index}`, ($$anchor, example, index, $$array) => {
			var code_1 = root();
			var text_8 = $.only_child(code_1, true);

			$.template_effect(() => $.set_text(text_8, $.get(example)));
			$.append($$anchor, code_1);
		});

		$.reset(div_7);
		$.reset(div_5);

		$.template_effect(() => {
			$.set_text(text_4, `${$.get(range).range ?? ''} - ${$.get(range).class ?? ''}`);
			$.set_text(text_5, $.get(range).fullRange);
			$.set_text(text_6, ` ${$.get(range).addresses ?? ''}`);
			$.set_text(text_7, ` ${$.get(range).commonUse ?? ''}`);
		});

		$.append($$anchor, div_5);
	});

	$.reset(div_4);

	var div_11 = $.sibling(div_4, 2);
	var p_2 = $.sibling($.child(div_11), 2);
	var text_9 = $.only_child(p_2, true);
	var ul = $.sibling(p_2, 4);

	$.each(ul, 23, () => privateVsPublicContent.publicRanges.characteristics, (characteristic, index) => `char-${index}`, ($$anchor, characteristic) => {
		var li = root_2();
		var text_10 = $.only_child(li, true);

		$.template_effect(() => $.set_text(text_10, $.get(characteristic)));
		$.append($$anchor, li);
	});

	$.reset(ul);

	var table = $.sibling(ul, 4);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 23, () => privateVsPublicContent.publicRanges.examples, (example, index) => `public-example-${index}`, ($$anchor, example) => {
		var tr = root_3();
		var td = $.child(tr);
		var code_2 = $.child(td);
		var text_11 = $.only_child(code_2, true);

		$.reset(td);

		var td_1 = $.sibling(td);
		var text_12 = $.only_child(td_1, true);

		$.reset(tr);

		$.template_effect(() => {
			$.set_text(text_11, $.get(example).ip);
			$.set_text(text_12, $.get(example).owner);
		});

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(div_11);

	var div_12 = $.sibling(div_11, 2);
	var h2_1 = $.child(div_12);
	var text_13 = $.only_child(h2_1, true);
	var div_13 = $.sibling(h2_1, 2);
	var div_14 = $.child(div_13);
	var div_15 = $.child(div_14);
	var text_14 = $.only_child(div_15, true);
	var div_16 = $.sibling(div_15, 2);
	var text_15 = $.only_child(div_16, true);
	var ol = $.sibling(div_16, 4);

	$.each(ol, 23, () => privateVsPublicContent.natImplications.privateToPublic.process, (step, index) => `nat-step-${index}`, ($$anchor, step) => {
		var li_1 = root_2();
		var text_16 = $.only_child(li_1, true);

		$.template_effect(() => $.set_text(text_16, $.get(step)));
		$.append($$anchor, li_1);
	});

	$.reset(ol);

	var ul_1 = $.sibling(ol, 4);

	$.each(ul_1, 23, () => privateVsPublicContent.natImplications.privateToPublic.benefits, (benefit, index) => `benefit-${index}`, ($$anchor, benefit) => {
		var li_2 = root_2();
		var text_17 = $.only_child(li_2, true);

		$.template_effect(() => $.set_text(text_17, $.get(benefit)));
		$.append($$anchor, li_2);
	});

	$.reset(ul_1);
	$.reset(div_14);

	var div_17 = $.sibling(div_14, 2);
	var div_18 = $.child(div_17);
	var text_18 = $.only_child(div_18, true);
	var div_19 = $.sibling(div_18, 2);
	var text_19 = $.only_child(div_19, true);
	var ul_2 = $.sibling(div_19, 4);

	$.each(ul_2, 23, () => privateVsPublicContent.natImplications.publicToPrivate.challenges, (challenge, index) => `challenge-${index}`, ($$anchor, challenge) => {
		var li_3 = root_2();
		var text_20 = $.only_child(li_3, true);

		$.template_effect(() => $.set_text(text_20, $.get(challenge)));
		$.append($$anchor, li_3);
	});

	$.reset(ul_2);

	var ul_3 = $.sibling(ul_2, 4);

	$.each(ul_3, 23, () => privateVsPublicContent.natImplications.publicToPrivate.solutions, (solution, index) => `solution-${index}`, ($$anchor, solution) => {
		var li_4 = root_2();
		var text_21 = $.only_child(li_4, true);

		$.template_effect(() => $.set_text(text_21, $.get(solution)));
		$.append($$anchor, li_4);
	});

	$.reset(ul_3);
	$.reset(div_17);
	$.reset(div_13);
	$.reset(div_12);

	var div_20 = $.sibling(div_12, 2);
	var table_1 = $.sibling($.child(div_20), 2);
	var tbody_1 = $.sibling($.child(table_1));

	$.each(tbody_1, 23, () => privateVsPublicContent.identification.quickCheck, (method, index) => `method-${index}`, ($$anchor, method) => {
		var tr_1 = root_4();
		var td_2 = $.child(tr_1);
		var strong = $.child(td_2);
		var text_22 = $.only_child(strong, true);

		$.reset(td_2);

		var td_3 = $.sibling(td_2);
		var text_23 = $.only_child(td_3, true);
		var td_4 = $.sibling(td_3);
		var code_3 = $.child(td_4);
		var text_24 = $.only_child(code_3, true);

		$.reset(td_4);

		var td_5 = $.sibling(td_4);
		var code_4 = $.child(td_5);
		var text_25 = $.only_child(code_4, true);

		$.reset(td_5);
		$.reset(tr_1);

		$.template_effect(() => {
			$.set_text(text_22, $.get(method).method);
			$.set_text(text_23, $.get(method).description);
			$.set_text(text_24, $.get(method).private);
			$.set_text(text_25, $.get(method).public);
		});

		$.append($$anchor, tr_1);
	});

	$.reset(tbody_1);
	$.reset(table_1);

	var div_21 = $.sibling(table_1, 4);

	$.each(div_21, 23, () => privateVsPublicContent.identification.tools, (tool, index) => `${tool.tool}-${index}`, ($$anchor, tool) => {
		var div_22 = root_5();
		var div_23 = $.child(div_22);
		var text_26 = $.only_child(div_23, true);
		var div_24 = $.sibling(div_23, 2);
		var text_27 = $.only_child(div_24, true);

		$.reset(div_22);

		$.template_effect(() => {
			$.set_text(text_26, $.get(tool).tool);
			$.set_text(text_27, $.get(tool).purpose);
		});

		$.append($$anchor, div_22);
	});

	$.reset(div_21);
	$.reset(div_20);

	var div_25 = $.sibling(div_20, 2);
	var node_2 = $.sibling($.child(div_25), 2);

	$.each(node_2, 19, () => privateVsPublicContent.commonScenarios, (scenario, index) => `${scenario.scenario}-${index}`, ($$anchor, scenario) => {
		var div_26 = root_6();
		var div_27 = $.child(div_26);
		var text_28 = $.only_child(div_27, true);
		var div_28 = $.sibling(div_27, 2);
		var div_29 = $.child(div_28);
		var text_29 = $.sibling($.child(div_29));

		$.reset(div_29);

		var div_30 = $.sibling(div_29, 2);
		var text_30 = $.sibling($.child(div_30));

		$.reset(div_30);

		var div_31 = $.sibling(div_30, 2);
		var text_31 = $.sibling($.child(div_31));

		$.reset(div_31);

		var div_32 = $.sibling(div_31, 2);
		var text_32 = $.sibling($.child(div_32));

		$.reset(div_32);
		$.reset(div_28);
		$.reset(div_26);

		$.template_effect(() => {
			$.set_text(text_28, $.get(scenario).scenario);
			$.set_text(text_29, ` ${$.get(scenario).setup ?? ''}`);
			$.set_text(text_30, ` ${$.get(scenario).privateIPs ?? ''}`);
			$.set_text(text_31, ` ${$.get(scenario).publicIP ?? ''}`);
			$.set_text(text_32, ` ${$.get(scenario).natBehavior ?? ''}`);
		});

		$.append($$anchor, div_26);
	});

	$.reset(div_25);

	var div_33 = $.sibling(div_25, 2);
	var node_3 = $.sibling($.child(div_33), 2);

	$.each(node_3, 19, () => privateVsPublicContent.troubleshooting, (issue, index) => `${issue.issue}-${index}`, ($$anchor, issue) => {
		var div_34 = root_7();
		var div_35 = $.child(div_34);
		var node_4 = $.child(div_35);

		Icon(node_4, { name: 'help-circle', size: 'sm' });

		var text_33 = $.sibling(node_4);

		$.reset(div_35);

		var div_36 = $.sibling(div_35, 2);
		var p_3 = $.child(div_36);
		var text_34 = $.sibling($.child(p_3));

		$.reset(p_3);

		var p_4 = $.sibling(p_3, 2);
		var text_35 = $.sibling($.child(p_4));

		$.reset(p_4);

		var p_5 = $.sibling(p_4, 2);
		var text_36 = $.sibling($.child(p_5));

		$.reset(p_5);
		$.reset(div_36);
		$.reset(div_34);

		$.template_effect(
			($0) => {
				$.set_text(text_33, ` ${$.get(issue).issue ?? ''}`);
				$.set_text(text_34, ` ${$0 ?? ''}`);
				$.set_text(text_35, ` ${$.get(issue).diagnosis ?? ''}`);
				$.set_text(text_36, ` ${$.get(issue).solution ?? ''}`);
			},
			[() => $.get(issue).possibleCauses.join(', ')]
		);

		$.append($$anchor, div_34);
	});

	$.reset(div_33);

	var div_37 = $.sibling(div_33, 2);
	var node_5 = $.sibling($.child(div_37), 2);

	$.each(node_5, 19, () => privateVsPublicContent.securityConsiderations, (security, index) => `${security.aspect}-${index}`, ($$anchor, security) => {
		var div_38 = root_8();
		var div_39 = $.child(div_38);
		var text_37 = $.only_child(div_39, true);
		var div_40 = $.sibling(div_39, 2);
		var ul_4 = $.child(div_40);

		$.each(ul_4, 23, () => $.get(security).considerations, (consideration, index) => `consideration-${index}`, ($$anchor, consideration, index, $$array_1) => {
			var li_5 = root_2();
			var text_38 = $.only_child(li_5, true);

			$.template_effect(() => $.set_text(text_38, $.get(consideration)));
			$.append($$anchor, li_5);
		});

		$.reset(ul_4);
		$.reset(div_40);
		$.reset(div_38);
		$.template_effect(() => $.set_text(text_37, $.get(security).aspect));
		$.append($$anchor, div_38);
	});

	$.reset(div_37);

	var div_41 = $.sibling(div_37, 2);
	var ul_5 = $.sibling($.child(div_41), 2);

	$.each(ul_5, 23, () => privateVsPublicContent.bestPractices, (practice, index) => `practice-${index}`, ($$anchor, practice) => {
		var li_6 = root_2();
		var text_39 = $.only_child(li_6, true);

		$.template_effect(() => $.set_text(text_39, $.get(practice)));
		$.append($$anchor, li_6);
	});

	$.reset(ul_5);
	$.reset(div_41);

	var div_42 = $.sibling(div_41, 2);
	var div_43 = $.sibling($.child(div_42), 2);
	var div_44 = $.child(div_43);
	var node_6 = $.sibling($.child(div_44), 2);

	$.each(node_6, 19, () => privateVsPublicContent.quickReference.privateRanges, (range, index) => `qr-range-${index}`, ($$anchor, range) => {
		var div_45 = root_9();
		var text_40 = $.only_child(div_45, true);

		$.template_effect(() => $.set_text(text_40, $.get(range)));
		$.append($$anchor, div_45);
	});

	$.reset(div_44);

	var div_46 = $.sibling(div_44, 2);
	var node_7 = $.sibling($.child(div_46), 2);

	$.each(node_7, 19, () => privateVsPublicContent.quickReference.identificationTips, (tip, index) => `qr-tip-${index}`, ($$anchor, tip) => {
		var div_47 = root_10();
		var text_41 = $.only_child(div_47, true);

		$.template_effect(() => $.set_text(text_41, $.get(tip)));
		$.append($$anchor, div_47);
	});

	$.reset(div_46);
	$.reset(div_43);

	var div_48 = $.sibling(div_43, 2);
	var div_49 = $.child(div_48);
	var node_8 = $.child(div_49);

	Icon(node_8, { name: 'key', size: 'sm' });
	$.next();
	$.reset(div_49);
	$.next(2);
	$.reset(div_48);
	$.reset(div_42);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, privateVsPublicContent.title);
		$.set_text(text_1, privateVsPublicContent.description);
		$.set_text(text_2, privateVsPublicContent.sections.overview.title);
		$.set_text(text_3, privateVsPublicContent.sections.overview.content);
		$.set_text(text_9, privateVsPublicContent.publicRanges.description);
		$.set_text(text_13, privateVsPublicContent.natImplications.title);
		$.set_text(text_14, privateVsPublicContent.natImplications.privateToPublic.title);
		$.set_text(text_15, privateVsPublicContent.natImplications.privateToPublic.description);
		$.set_text(text_18, privateVsPublicContent.natImplications.publicToPrivate.title);
		$.set_text(text_19, privateVsPublicContent.natImplications.publicToPrivate.description);
	});

	$.append($$anchor, div);
	$.pop();
}