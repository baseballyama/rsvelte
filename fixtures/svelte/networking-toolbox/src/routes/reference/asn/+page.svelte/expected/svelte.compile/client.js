import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { asnContent } from '$lib/content/asn.js';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<div class="example-input"> </div>`);
var root_1 = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><div><strong>Range:</strong> <code> </code></div> <div><strong>Description:</strong> </div> <div><strong>Usage:</strong> </div> <div><strong>Examples:</strong></div> <!></div></div>`);
var root_2 = $.from_html(`<div class="grid-item"><div class="item-title"> </div> <div class="item-description"><strong>Definition:</strong> <br/> <strong>Example:</strong> </div></div>`);
var root_3 = $.from_html(`<tr><td><strong> </strong></td><td> </td><td> </td><td><code> </code></td></tr>`);
var root_4 = $.from_html(`<li> </li>`);
var root_5 = $.from_html(`<tr><td><code> </code></td><td><code> </code></td><td><strong> </strong></td><td> </td></tr>`);
var root_6 = $.from_html(`<div class="grid-item"><div class="item-title"> </div> <div class="item-code"> </div> <div class="item-description"> <br/> <em> </em></div></div>`);
var root_7 = $.from_html(`<div class="example-item"><code> </code></div>`);
var root_8 = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><div><strong>Organization:</strong> </div> <div><strong>Role:</strong> </div> <div><strong>IP Blocks:</strong> </div> <div><strong>Peering:</strong> </div></div></div>`);
var root_9 = $.from_html(`<div class="ref-warning"><div class="warning-title"><!> </div> <div class="warning-content"><p><strong>Likely Cause:</strong> </p> <p><strong>Investigation:</strong> </p> <p><strong>Solution:</strong> </p></div></div>`);
var root_10 = $.from_html(`<div class="ref-highlight"><div class="highlight-title"><!> </div> <div class="highlight-content"><p> </p> <p><strong>Action:</strong> </p></div></div>`);
var root_11 = $.from_html(`<div class="example-item"><div class="example-description"> </div></div>`);
var root_12 = $.from_html(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1> </h1> <p class="subtitle"> </p></div> <div class="ref-section"><h2> </h2> <p> </p></div> <div class="ref-section"><h2> </h2> <p> </p></div> <div class="ref-section"><h2>ASN Number Ranges</h2> <!></div> <div class="ref-section"><h2> </h2> <p> </p> <h3>Key BGP Concepts</h3> <div class="ref-grid two-col"></div> <h3>BGP Types</h3> <table class="ref-table"><thead><tr><th>Type</th><th>Description</th><th>Usage</th><th>Port</th></tr></thead><tbody></tbody></table></div> <div class="ref-section"><h2> </h2> <p> </p> <h3>How It Works</h3> <ol></ol> <h3>Real-World Examples</h3> <table class="ref-table"><thead><tr><th>IP Range</th><th>ASN</th><th>Organization</th><th>Description</th></tr></thead><tbody></tbody></table></div> <div class="ref-section"><h2> </h2> <p> </p> <div class="ref-grid three-col"></div> <h3>Common Lookup Commands</h3> <div class="ref-examples"><div class="examples-title">Try These Commands</div> <!></div></div> <div class="ref-section"><h2>Real-World AS Examples</h2> <!></div> <div class="ref-section"><h2>Benefits of the AS System</h2> <ul></ul></div> <div class="ref-section"><h2>Troubleshooting with ASN Information</h2> <!></div> <div class="ref-section"><h2>Getting Started with ASN Knowledge</h2> <!></div> <div class="ref-section"><h2>Quick Facts to Remember</h2> <div class="ref-examples"><div class="examples-title">Key Points</div> <!></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var div = root_12();
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
	var p_2 = $.sibling(h2_1, 2);
	var text_5 = $.only_child(p_2, true);

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node = $.sibling($.child(div_5), 2);

	$.each(node, 19, () => asnContent.asnTypes, (type, index) => `${type.name}-${index}`, ($$anchor, type) => {
		var div_6 = root_1();
		var div_7 = $.child(div_6);
		var text_6 = $.only_child(div_7, true);
		var div_8 = $.sibling(div_7, 2);
		var div_9 = $.child(div_8);
		var code = $.sibling($.child(div_9), 2);
		var text_7 = $.only_child(code, true);

		$.reset(div_9);

		var div_10 = $.sibling(div_9, 2);
		var text_8 = $.sibling($.child(div_10));

		$.reset(div_10);

		var div_11 = $.sibling(div_10, 2);
		var text_9 = $.sibling($.child(div_11));

		$.reset(div_11);

		var node_1 = $.sibling(div_11, 4);

		$.each(node_1, 19, () => $.get(type).examples, (example, index) => `example-${index}`, ($$anchor, example, index, $$array) => {
			var div_12 = root();
			var text_10 = $.only_child(div_12, true);

			$.template_effect(() => $.set_text(text_10, $.get(example)));
			$.append($$anchor, div_12);
		});

		$.reset(div_8);
		$.reset(div_6);

		$.template_effect(() => {
			$.set_text(text_6, $.get(type).name);
			$.set_text(text_7, $.get(type).range);
			$.set_text(text_8, ` ${$.get(type).description ?? ''}`);
			$.set_text(text_9, ` ${$.get(type).usage ?? ''}`);
		});

		$.append($$anchor, div_6);
	});

	$.reset(div_5);

	var div_13 = $.sibling(div_5, 2);
	var h2_2 = $.child(div_13);
	var text_11 = $.only_child(h2_2, true);
	var p_3 = $.sibling(h2_2, 2);
	var text_12 = $.only_child(p_3, true);
	var div_14 = $.sibling(p_3, 4);

	$.each(div_14, 23, () => asnContent.bgpBasics.concepts, (concept, index) => `${concept.term}-${index}`, ($$anchor, concept) => {
		var div_15 = root_2();
		var div_16 = $.child(div_15);
		var text_13 = $.only_child(div_16, true);
		var div_17 = $.sibling(div_16, 2);
		var text_14 = $.sibling($.child(div_17));
		var text_15 = $.sibling(text_14, 4);

		$.reset(div_17);
		$.reset(div_15);

		$.template_effect(() => {
			$.set_text(text_13, $.get(concept).term);
			$.set_text(text_14, ` ${$.get(concept).definition ?? ''}`);
			$.set_text(text_15, ` ${$.get(concept).example ?? ''}`);
		});

		$.append($$anchor, div_15);
	});

	$.reset(div_14);

	var table = $.sibling(div_14, 4);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 23, () => asnContent.bgpBasics.types, (type, index) => `${type.type}-${index}`, ($$anchor, type) => {
		var tr = root_3();
		var td = $.child(tr);
		var strong = $.child(td);
		var text_16 = $.only_child(strong, true);

		$.reset(td);

		var td_1 = $.sibling(td);
		var text_17 = $.only_child(td_1, true);
		var td_2 = $.sibling(td_1);
		var text_18 = $.only_child(td_2, true);
		var td_3 = $.sibling(td_2);
		var code_1 = $.child(td_3);
		var text_19 = $.only_child(code_1, true);

		$.reset(td_3);
		$.reset(tr);

		$.template_effect(() => {
			$.set_text(text_16, $.get(type).type);
			$.set_text(text_17, $.get(type).description);
			$.set_text(text_18, $.get(type).usage);
			$.set_text(text_19, $.get(type).port);
		});

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(div_13);

	var div_18 = $.sibling(div_13, 2);
	var h2_3 = $.child(div_18);
	var text_20 = $.only_child(h2_3, true);
	var p_4 = $.sibling(h2_3, 2);
	var text_21 = $.only_child(p_4, true);
	var ol = $.sibling(p_4, 4);

	$.each(ol, 23, () => asnContent.ipToAsnMapping.process, (step, index) => `mapping-process-${index}`, ($$anchor, step) => {
		var li = root_4();
		var text_22 = $.only_child(li, true);

		$.template_effect(() => $.set_text(text_22, $.get(step)));
		$.append($$anchor, li);
	});

	$.reset(ol);

	var table_1 = $.sibling(ol, 4);
	var tbody_1 = $.sibling($.child(table_1));

	$.each(tbody_1, 23, () => asnContent.ipToAsnMapping.examples, (example, index) => `${example.asn}-${index}`, ($$anchor, example) => {
		var tr_1 = root_5();
		var td_4 = $.child(tr_1);
		var code_2 = $.child(td_4);
		var text_23 = $.only_child(code_2, true);

		$.reset(td_4);

		var td_5 = $.sibling(td_4);
		var code_3 = $.child(td_5);
		var text_24 = $.only_child(code_3, true);

		$.reset(td_5);

		var td_6 = $.sibling(td_5);
		var strong_1 = $.child(td_6);
		var text_25 = $.only_child(strong_1, true);

		$.reset(td_6);

		var td_7 = $.sibling(td_6);
		var text_26 = $.only_child(td_7, true);

		$.reset(tr_1);

		$.template_effect(() => {
			$.set_text(text_23, $.get(example).ipRange);
			$.set_text(text_24, $.get(example).asn);
			$.set_text(text_25, $.get(example).organization);
			$.set_text(text_26, $.get(example).description);
		});

		$.append($$anchor, tr_1);
	});

	$.reset(tbody_1);
	$.reset(table_1);
	$.reset(div_18);

	var div_19 = $.sibling(div_18, 2);
	var h2_4 = $.child(div_19);
	var text_27 = $.only_child(h2_4, true);
	var p_5 = $.sibling(h2_4, 2);
	var text_28 = $.only_child(p_5, true);
	var div_20 = $.sibling(p_5, 2);

	$.each(div_20, 23, () => asnContent.lookupTools.methods, (method, index) => `${method.method}-${index}`, ($$anchor, method) => {
		var div_21 = root_6();
		var div_22 = $.child(div_21);
		var text_29 = $.only_child(div_22, true);
		var div_23 = $.sibling(div_22, 2);
		var text_30 = $.only_child(div_23, true);
		var div_24 = $.sibling(div_23, 2);
		var text_31 = $.child(div_24, true);
		var em = $.sibling(text_31, 3);
		var text_32 = $.only_child(em, true);

		$.reset(div_24);
		$.reset(div_21);

		$.template_effect(() => {
			$.set_text(text_29, $.get(method).method);
			$.set_text(text_30, $.get(method).command);
			$.set_text(text_31, $.get(method).description);
			$.set_text(text_32, $.get(method).example);
		});

		$.append($$anchor, div_21);
	});

	$.reset(div_20);

	var div_25 = $.sibling(div_20, 4);
	var node_2 = $.sibling($.child(div_25), 2);

	$.each(node_2, 19, () => asnContent.lookupTools.commonCommands, (command, index) => `command-${index}`, ($$anchor, command) => {
		var div_26 = root_7();
		var code_4 = $.child(div_26);
		var text_33 = $.only_child(code_4, true);

		$.reset(div_26);
		$.template_effect(() => $.set_text(text_33, $.get(command)));
		$.append($$anchor, div_26);
	});

	$.reset(div_25);
	$.reset(div_19);

	var div_27 = $.sibling(div_19, 2);
	var node_3 = $.sibling($.child(div_27), 2);

	$.each(node_3, 19, () => asnContent.realWorldExamples, (example, index) => `${example.asn}-${index}`, ($$anchor, example) => {
		var div_28 = root_8();
		var div_29 = $.child(div_28);
		var text_34 = $.only_child(div_29);
		var div_30 = $.sibling(div_29, 2);
		var div_31 = $.child(div_30);
		var text_35 = $.sibling($.child(div_31));

		$.reset(div_31);

		var div_32 = $.sibling(div_31, 2);
		var text_36 = $.sibling($.child(div_32));

		$.reset(div_32);

		var div_33 = $.sibling(div_32, 2);
		var text_37 = $.sibling($.child(div_33));

		$.reset(div_33);

		var div_34 = $.sibling(div_33, 2);
		var text_38 = $.sibling($.child(div_34));

		$.reset(div_34);
		$.reset(div_30);
		$.reset(div_28);

		$.template_effect(() => {
			$.set_text(text_34, `${$.get(example).scenario ?? ''}: ${$.get(example).asn ?? ''}`);
			$.set_text(text_35, ` ${$.get(example).organization ?? ''}`);
			$.set_text(text_36, ` ${$.get(example).role ?? ''}`);
			$.set_text(text_37, ` ${$.get(example).ipBlocks ?? ''}`);
			$.set_text(text_38, ` ${$.get(example).peers ?? ''}`);
		});

		$.append($$anchor, div_28);
	});

	$.reset(div_27);

	var div_35 = $.sibling(div_27, 2);
	var ul = $.sibling($.child(div_35), 2);

	$.each(ul, 23, () => asnContent.benefits, (benefit, index) => `benefit-${index}`, ($$anchor, benefit) => {
		var li_1 = root_4();
		var text_39 = $.only_child(li_1, true);

		$.template_effect(() => $.set_text(text_39, $.get(benefit)));
		$.append($$anchor, li_1);
	});

	$.reset(ul);
	$.reset(div_35);

	var div_36 = $.sibling(div_35, 2);
	var node_4 = $.sibling($.child(div_36), 2);

	$.each(node_4, 19, () => asnContent.troubleshooting, (issue, index) => `${issue.issue}-${index}`, ($$anchor, issue) => {
		var div_37 = root_9();
		var div_38 = $.child(div_37);
		var node_5 = $.child(div_38);

		Icon(node_5, { name: 'help-circle', size: 'sm' });

		var text_40 = $.sibling(node_5);

		$.reset(div_38);

		var div_39 = $.sibling(div_38, 2);
		var p_6 = $.child(div_39);
		var text_41 = $.sibling($.child(p_6));

		$.reset(p_6);

		var p_7 = $.sibling(p_6, 2);
		var text_42 = $.sibling($.child(p_7));

		$.reset(p_7);

		var p_8 = $.sibling(p_7, 2);
		var text_43 = $.sibling($.child(p_8));

		$.reset(p_8);
		$.reset(div_39);
		$.reset(div_37);

		$.template_effect(() => {
			$.set_text(text_40, ` ${$.get(issue).issue ?? ''}`);
			$.set_text(text_41, ` ${$.get(issue).cause ?? ''}`);
			$.set_text(text_42, ` ${$.get(issue).investigation ?? ''}`);
			$.set_text(text_43, ` ${$.get(issue).solution ?? ''}`);
		});

		$.append($$anchor, div_37);
	});

	$.reset(div_36);

	var div_40 = $.sibling(div_36, 2);
	var node_6 = $.sibling($.child(div_40), 2);

	$.each(node_6, 19, () => asnContent.gettingStarted, (step, index) => `${step.step}-${index}`, ($$anchor, step) => {
		var div_41 = root_10();
		var div_42 = $.child(div_41);
		var node_7 = $.child(div_42);

		Icon(node_7, { name: 'play-circle', size: 'sm' });

		var text_44 = $.sibling(node_7);

		$.reset(div_42);

		var div_43 = $.sibling(div_42, 2);
		var p_9 = $.child(div_43);
		var text_45 = $.only_child(p_9, true);
		var p_10 = $.sibling(p_9, 2);
		var text_46 = $.sibling($.child(p_10));

		$.reset(p_10);
		$.reset(div_43);
		$.reset(div_41);

		$.template_effect(() => {
			$.set_text(text_44, ` ${$.get(step).step ?? ''}`);
			$.set_text(text_45, $.get(step).description);
			$.set_text(text_46, ` ${$.get(step).action ?? ''}`);
		});

		$.append($$anchor, div_41);
	});

	$.reset(div_40);

	var div_44 = $.sibling(div_40, 2);
	var div_45 = $.sibling($.child(div_44), 2);
	var node_8 = $.sibling($.child(div_45), 2);

	$.each(node_8, 19, () => asnContent.quickFacts, (fact, index) => `fact-${index}`, ($$anchor, fact) => {
		var div_46 = root_11();
		var div_47 = $.child(div_46);
		var text_47 = $.only_child(div_47, true);

		$.reset(div_46);
		$.template_effect(() => $.set_text(text_47, $.get(fact)));
		$.append($$anchor, div_46);
	});

	$.reset(div_45);
	$.reset(div_44);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, asnContent.title);
		$.set_text(text_1, asnContent.description);
		$.set_text(text_2, asnContent.sections.overview.title);
		$.set_text(text_3, asnContent.sections.overview.content);
		$.set_text(text_4, asnContent.sections.asn.title);
		$.set_text(text_5, asnContent.sections.asn.content);
		$.set_text(text_11, asnContent.bgpBasics.title);
		$.set_text(text_12, asnContent.bgpBasics.description);
		$.set_text(text_20, asnContent.ipToAsnMapping.title);
		$.set_text(text_21, asnContent.ipToAsnMapping.description);
		$.set_text(text_27, asnContent.lookupTools.title);
		$.set_text(text_28, asnContent.lookupTools.description);
	});

	$.append($$anchor, div);
	$.pop();
}