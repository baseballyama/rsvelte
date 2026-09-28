import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { supernetContent } from '$lib/content/supernetting.js';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<div class="example-input"> </div>`);
var root_1 = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><div><strong>Individual Networks:</strong></div> <!> <div class="example-arrow">↓ Summarizes to ↓</div> <div class="example-output"> </div> <div class="example-description"> </div></div></div>`);
var root_2 = $.from_html(`<li> </li>`);
var root_3 = $.from_html(`<tr><td><code> </code></td><td><code> </code></td></tr>`);
var root_4 = $.from_html(`<div class="ref-warning"><div class="warning-title"><!> </div> <div class="warning-content"><p><strong>Problem:</strong> </p> <p><strong>Example:</strong> </p></div></div>`);
var root_5 = $.from_html(`<tr><td> </td><td><code> </code></td><td> </td></tr>`);
var root_6 = $.from_html(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1> </h1> <p class="subtitle"> </p></div> <div class="ref-section"><h2> </h2> <p> </p> <div class="ref-highlight"><div class="highlight-title"><!> Main Goal</div> <div class="highlight-content">Reduce the number of routes in routing tables while maintaining connectivity to all networks.</div></div></div> <div class="ref-section"><h2> </h2> <p> </p></div> <div class="ref-section"><h2>Summarization Examples</h2> <!></div> <div class="ref-section"><h2> </h2> <ol></ol></div> <div class="ref-section"><h2> </h2> <p><strong> </strong></p> <table class="ref-table"><thead><tr><th>Network</th><th>Binary Representation</th></tr></thead><tbody></tbody></table> <div class="ref-highlight"><div class="highlight-title"><!> Analysis</div> <div class="highlight-content"> </div></div></div> <div class="ref-section"><h2>Benefits of Route Summarization</h2> <ul></ul></div> <div class="ref-section"><h2>Common Pitfalls</h2> <!></div> <div class="ref-section"><h2>Quick Reference Table</h2> <table class="ref-table"><thead><tr><th>Input Networks</th><th>Summary Prefix</th><th>Routes Saved</th></tr></thead><tbody></tbody></table></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var div = root_6();
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

	Icon(node, { name: 'target', size: 'sm' });
	$.next();
	$.reset(div_5);
	$.next(2);
	$.reset(div_4);
	$.reset(div_3);

	var div_6 = $.sibling(div_3, 2);
	var h2_1 = $.child(div_6);
	var text_4 = $.only_child(h2_1, true);
	var p_2 = $.sibling(h2_1, 2);
	var text_5 = $.only_child(p_2, true);

	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var node_1 = $.sibling($.child(div_7), 2);

	$.each(node_1, 19, () => supernetContent.examples, (example, exIdx) => `${example.title}-${exIdx}`, ($$anchor, example) => {
		var div_8 = root_1();
		var div_9 = $.child(div_8);
		var text_6 = $.only_child(div_9, true);
		var div_10 = $.sibling(div_9, 2);
		var node_2 = $.sibling($.child(div_10), 2);

		$.each(node_2, 19, () => $.get(example).networks, (network, netIdx) => `${network}-${netIdx}`, ($$anchor, network) => {
			var div_11 = root();
			var text_7 = $.only_child(div_11, true);

			$.template_effect(() => $.set_text(text_7, $.get(network)));
			$.append($$anchor, div_11);
		});

		var div_12 = $.sibling(node_2, 4);
		var text_8 = $.only_child(div_12, true);
		var div_13 = $.sibling(div_12, 2);
		var text_9 = $.only_child(div_13);

		$.reset(div_10);
		$.reset(div_8);

		$.template_effect(() => {
			$.set_text(text_6, $.get(example).title);
			$.set_text(text_8, $.get(example).summary);
			$.set_text(text_9, `${$.get(example).explanation ?? ''} - ${$.get(example).addresses ?? ''}`);
		});

		$.append($$anchor, div_8);
	});

	$.reset(div_7);

	var div_14 = $.sibling(div_7, 2);
	var h2_2 = $.child(div_14);
	var text_10 = $.only_child(h2_2, true);
	var ol = $.sibling(h2_2, 2);

	$.each(ol, 23, () => supernetContent.stepByStep.steps, (step, stepIdx) => `${step}-${stepIdx}`, ($$anchor, step) => {
		var li = root_2();
		var text_11 = $.only_child(li, true);

		$.template_effect(() => $.set_text(text_11, $.get(step)));
		$.append($$anchor, li);
	});

	$.reset(ol);
	$.reset(div_14);

	var div_15 = $.sibling(div_14, 2);
	var h2_3 = $.child(div_15);
	var text_12 = $.only_child(h2_3, true);
	var p_3 = $.sibling(h2_3, 2);
	var strong = $.child(p_3);
	var text_13 = $.only_child(strong, true);

	$.reset(p_3);

	var table = $.sibling(p_3, 2);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 23, () => supernetContent.binaryExample.binary, (row, rowIdx) => `${row.network}-${rowIdx}`, ($$anchor, row) => {
		var tr = root_3();
		var td = $.child(tr);
		var code = $.child(td);
		var text_14 = $.only_child(code, true);

		$.reset(td);

		var td_1 = $.sibling(td);
		var code_1 = $.child(td_1);
		var text_15 = $.only_child(code_1, true);

		$.reset(td_1);
		$.reset(tr);

		$.template_effect(() => {
			$.set_text(text_14, $.get(row).network);
			$.set_text(text_15, $.get(row).binary);
		});

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);

	var div_16 = $.sibling(table, 2);
	var div_17 = $.child(div_16);
	var node_3 = $.child(div_17);

	Icon(node_3, { name: 'eye', size: 'sm' });
	$.next();
	$.reset(div_17);

	var div_18 = $.sibling(div_17, 2);
	var text_16 = $.only_child(div_18, true);

	$.reset(div_16);
	$.reset(div_15);

	var div_19 = $.sibling(div_15, 2);
	var ul = $.sibling($.child(div_19), 2);

	$.each(ul, 23, () => supernetContent.benefits, (benefit, benIdx) => `${benefit}-${benIdx}`, ($$anchor, benefit) => {
		var li_1 = root_2();
		var text_17 = $.only_child(li_1, true);

		$.template_effect(() => $.set_text(text_17, $.get(benefit)));
		$.append($$anchor, li_1);
	});

	$.reset(ul);
	$.reset(div_19);

	var div_20 = $.sibling(div_19, 2);
	var node_4 = $.sibling($.child(div_20), 2);

	$.each(node_4, 19, () => supernetContent.pitfalls, (pitfall, pitIdx) => `${pitfall.title}-${pitIdx}`, ($$anchor, pitfall) => {
		var div_21 = root_4();
		var div_22 = $.child(div_21);
		var node_5 = $.child(div_22);

		Icon(node_5, { name: 'alert-triangle', size: 'sm' });

		var text_18 = $.sibling(node_5);

		$.reset(div_22);

		var div_23 = $.sibling(div_22, 2);
		var p_4 = $.child(div_23);
		var text_19 = $.sibling($.child(p_4));

		$.reset(p_4);

		var p_5 = $.sibling(p_4, 2);
		var text_20 = $.sibling($.child(p_5));

		$.reset(p_5);
		$.reset(div_23);
		$.reset(div_21);

		$.template_effect(() => {
			$.set_text(text_18, ` ${$.get(pitfall).title ?? ''}`);
			$.set_text(text_19, ` ${$.get(pitfall).problem ?? ''}`);
			$.set_text(text_20, ` ${$.get(pitfall).example ?? ''}`);
		});

		$.append($$anchor, div_21);
	});

	$.reset(div_20);

	var div_24 = $.sibling(div_20, 2);
	var table_1 = $.sibling($.child(div_24), 2);
	var tbody_1 = $.sibling($.child(table_1));

	$.each(tbody_1, 23, () => supernetContent.quickReference, (row, refIdx) => `${row.networks}-${refIdx}`, ($$anchor, row) => {
		var tr_1 = root_5();
		var td_2 = $.child(tr_1);
		var text_21 = $.only_child(td_2, true);
		var td_3 = $.sibling(td_2);
		var code_2 = $.child(td_3);
		var text_22 = $.only_child(code_2, true);

		$.reset(td_3);

		var td_4 = $.sibling(td_3);
		var text_23 = $.only_child(td_4, true);

		$.reset(tr_1);

		$.template_effect(() => {
			$.set_text(text_21, $.get(row).networks);
			$.set_text(text_22, $.get(row).summary);
			$.set_text(text_23, $.get(row).saves);
		});

		$.append($$anchor, tr_1);
	});

	$.reset(tbody_1);
	$.reset(table_1);
	$.reset(div_24);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, supernetContent.title);
		$.set_text(text_1, supernetContent.description);
		$.set_text(text_2, supernetContent.sections.whatIs.title);
		$.set_text(text_3, supernetContent.sections.whatIs.content);
		$.set_text(text_4, supernetContent.sections.requirements.title);
		$.set_text(text_5, supernetContent.sections.requirements.content);
		$.set_text(text_10, supernetContent.stepByStep.title);
		$.set_text(text_12, supernetContent.binaryExample.title);
		$.set_text(text_13, supernetContent.binaryExample.scenario);
		$.set_text(text_16, supernetContent.binaryExample.analysis);
	});

	$.append($$anchor, div);
	$.pop();
}