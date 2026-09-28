import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { wildcardMasksContent } from '$lib/content/wildcard-masks.js';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><div><strong>Subnet Mask:</strong> <code> </code></div> <div><strong>Subnet Binary:</strong> <code> </code></div> <div><strong>Wildcard Mask:</strong> <code> </code></div> <div><strong>Wildcard Binary:</strong> <code> </code></div></div></div>`);
var root_1 = $.from_html(`<li> </li>`);
var root_2 = $.from_html(`<tr><td><code> </code></td><td> </td><td><code> </code></td></tr>`);
var root_3 = $.from_html(`<div class="ref-examples"><div class="examples-title"> </div> <div class="example-item"><div><strong>ACL Entry:</strong> <code> </code></div> <div><strong>Explanation:</strong> </div></div></div>`);
var root_4 = $.from_html(`<h3> </h3> <!>`, 1);
var root_5 = $.from_html(`<div class="grid-item"><div class="item-title"> </div> <div class="item-code"> </div> <div class="item-description"><strong>Meaning:</strong> <br/> <strong>Usage:</strong> </div></div>`);
var root_6 = $.from_html(`<tr><td><strong> </strong></td><td><code style="font-size: 0.8em;"> </code></td><td><code style="font-size: 0.8em;"> </code></td><td> </td></tr>`);
var root_7 = $.from_html(`<tr><td><code> </code></td><td><code> </code></td><td><code> </code></td><td> </td></tr>`);
var root_8 = $.from_html(`<div class="ref-warning"><div class="warning-title"><!> </div> <div class="warning-content"><p><strong>Problem:</strong> </p> <p><strong>Solution:</strong> </p></div></div>`);
var root_9 = $.from_html(`<div class="example-item"><div class="example-description"> </div></div>`);

var root_10 = $.from_html(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1> </h1> <p class="subtitle"> </p></div> <div class="ref-section"><h2> </h2> <p> </p></div> <div class="ref-section"><h2> </h2> <p> </p> <div class="ref-highlight"><div class="highlight-title"><!> Key Difference</div> <div class="highlight-content">Wildcard masks are the bitwise inverse of subnet masks. If you know one, you can calculate the other by
          subtracting from 255.255.255.255.</div></div></div> <div class="ref-section"><h2>Conversion Examples</h2> <!></div> <div class="ref-section"><h2> </h2> <p><strong>Formula:</strong> <code> </code></p> <h3>Steps:</h3> <ol></ol> <h3>Examples:</h3> <table class="ref-table"><thead><tr><th>Subnet Mask</th><th>Calculation</th><th>Wildcard Mask</th></tr></thead><tbody></tbody></table></div> <div class="ref-section"><h2>ACL Examples by Platform</h2> <!></div> <div class="ref-section"><h2>Special Cases</h2> <div class="ref-grid two-col"></div></div> <div class="ref-section"><h2>Platform Differences</h2> <table class="ref-table"><thead><tr><th>Platform</th><th>Format</th><th>Example</th><th>Notes</th></tr></thead><tbody></tbody></table></div> <div class="ref-section"><h2>Quick Reference Table</h2> <table class="ref-table"><thead><tr><th>CIDR</th><th>Subnet Mask</th><th>Wildcard Mask</th><th>Addresses</th></tr></thead><tbody></tbody></table></div> <div class="ref-section"><h2>Common Mistakes</h2> <!></div> <div class="ref-section"><h2>Tips for Success</h2> <div class="ref-examples"><div class="examples-title">Remember These</div> <!></div> <div class="ref-highlight"><div class="highlight-title"><!> Quick Memory Aid</div> <div class="highlight-content">Wildcard 0 = "must match exactly", Wildcard 1 = "don't care". Think of it as a mask where 0 blocks changes and
          1 allows anything.</div></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var div = root_10();
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
	var div_5 = $.sibling(p_2, 2);
	var div_6 = $.child(div_5);
	var node = $.child(div_6);

	Icon(node, { name: 'eye', size: 'sm' });
	$.next();
	$.reset(div_6);
	$.next(2);
	$.reset(div_5);
	$.reset(div_4);

	var div_7 = $.sibling(div_4, 2);
	var node_1 = $.sibling($.child(div_7), 2);

	$.each(node_1, 19, () => wildcardMasksContent.conversionExamples, (example, exIdx) => `${example.subnet}-${exIdx}`, ($$anchor, example) => {
		var div_8 = root();
		var div_9 = $.child(div_8);
		var text_6 = $.only_child(div_9, true);
		var div_10 = $.sibling(div_9, 2);
		var div_11 = $.child(div_10);
		var code = $.sibling($.child(div_11), 2);
		var text_7 = $.only_child(code, true);

		$.reset(div_11);

		var div_12 = $.sibling(div_11, 2);
		var code_1 = $.sibling($.child(div_12), 2);
		var text_8 = $.only_child(code_1, true);

		$.reset(div_12);

		var div_13 = $.sibling(div_12, 2);
		var code_2 = $.sibling($.child(div_13), 2);
		var text_9 = $.only_child(code_2, true);

		$.reset(div_13);

		var div_14 = $.sibling(div_13, 2);
		var code_3 = $.sibling($.child(div_14), 2);
		var text_10 = $.only_child(code_3, true);

		$.reset(div_14);
		$.reset(div_10);
		$.reset(div_8);

		$.template_effect(() => {
			$.set_text(text_6, $.get(example).description);
			$.set_text(text_7, $.get(example).subnet);
			$.set_text(text_8, $.get(example).subnetBinary);
			$.set_text(text_9, $.get(example).wildcard);
			$.set_text(text_10, $.get(example).wildcardBinary);
		});

		$.append($$anchor, div_8);
	});

	$.reset(div_7);

	var div_15 = $.sibling(div_7, 2);
	var h2_2 = $.child(div_15);
	var text_11 = $.only_child(h2_2, true);
	var p_3 = $.sibling(h2_2, 2);
	var code_4 = $.sibling($.child(p_3), 2);
	var text_12 = $.only_child(code_4, true);

	$.reset(p_3);

	var ol = $.sibling(p_3, 4);

	$.each(ol, 23, () => wildcardMasksContent.quickConversion.steps, (step, stepIdx) => `${step}-${stepIdx}`, ($$anchor, step) => {
		var li = root_1();
		var text_13 = $.only_child(li, true);

		$.template_effect(() => $.set_text(text_13, $.get(step)));
		$.append($$anchor, li);
	});

	$.reset(ol);

	var table = $.sibling(ol, 4);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 23, () => wildcardMasksContent.quickConversion.examples, (example, qexIdx) => `${example.subnet}-${qexIdx}`, ($$anchor, example) => {
		var tr = root_2();
		var td = $.child(tr);
		var code_5 = $.child(td);
		var text_14 = $.only_child(code_5, true);

		$.reset(td);

		var td_1 = $.sibling(td);
		var text_15 = $.only_child(td_1, true);
		var td_2 = $.sibling(td_1);
		var code_6 = $.child(td_2);
		var text_16 = $.only_child(code_6, true);

		$.reset(td_2);
		$.reset(tr);

		$.template_effect(() => {
			$.set_text(text_14, $.get(example).subnet);
			$.set_text(text_15, $.get(example).calculation);
			$.set_text(text_16, $.get(example).wildcard);
		});

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(div_15);

	var div_16 = $.sibling(div_15, 2);
	var node_2 = $.sibling($.child(div_16), 2);

	$.each(node_2, 19, () => wildcardMasksContent.aclExamples, (platform, pIdx) => `${platform.title}-${pIdx}`, ($$anchor, platform) => {
		var fragment = root_4();
		var h3 = $.first_child(fragment);
		var text_17 = $.only_child(h3, true);
		var node_3 = $.sibling(h3, 2);

		$.each(node_3, 19, () => $.get(platform).entries, (entry, eIdx) => `${entry}-${eIdx}`, ($$anchor, entry) => {
			var div_17 = root_3();
			var div_18 = $.child(div_17);
			var text_18 = $.only_child(div_18, true);
			var div_19 = $.sibling(div_18, 2);
			var div_20 = $.child(div_19);
			var code_7 = $.sibling($.child(div_20), 2);
			var text_19 = $.only_child(code_7, true);

			$.reset(div_20);

			var div_21 = $.sibling(div_20, 2);
			var text_20 = $.sibling($.child(div_21));

			$.reset(div_21);
			$.reset(div_19);
			$.reset(div_17);

			$.template_effect(() => {
				$.set_text(text_18, $.get(entry).meaning);
				$.set_text(text_19, $.get(entry).acl);
				$.set_text(text_20, ` ${$.get(entry).explanation ?? ''}`);
			});

			$.append($$anchor, div_17);
		});

		$.template_effect(() => $.set_text(text_17, $.get(platform).title));
		$.append($$anchor, fragment);
	});

	$.reset(div_16);

	var div_22 = $.sibling(div_16, 2);
	var div_23 = $.sibling($.child(div_22), 2);

	$.each(div_23, 23, () => wildcardMasksContent.specialCases, (specialCase, scIdx) => `${specialCase.case}-${scIdx}`, ($$anchor, specialCase) => {
		var div_24 = root_5();
		var div_25 = $.child(div_24);
		var text_21 = $.only_child(div_25, true);
		var div_26 = $.sibling(div_25, 2);
		var text_22 = $.only_child(div_26);
		var div_27 = $.sibling(div_26, 2);
		var text_23 = $.sibling($.child(div_27));
		var text_24 = $.sibling(text_23, 4);

		$.reset(div_27);
		$.reset(div_24);

		$.template_effect(() => {
			$.set_text(text_21, $.get(specialCase).case);
			$.set_text(text_22, `Wildcard: ${$.get(specialCase).wildcard ?? ''}`);
			$.set_text(text_23, ` ${$.get(specialCase).meaning ?? ''}`);
			$.set_text(text_24, ` ${$.get(specialCase).usage ?? ''}`);
		});

		$.append($$anchor, div_24);
	});

	$.reset(div_23);
	$.reset(div_22);

	var div_28 = $.sibling(div_22, 2);
	var table_1 = $.sibling($.child(div_28), 2);
	var tbody_1 = $.sibling($.child(table_1));

	$.each(tbody_1, 23, () => wildcardMasksContent.platformDifferences, (platform, pdIdx) => `${platform.platform}-${pdIdx}`, ($$anchor, platform) => {
		var tr_1 = root_6();
		var td_3 = $.child(tr_1);
		var strong = $.child(td_3);
		var text_25 = $.only_child(strong, true);

		$.reset(td_3);

		var td_4 = $.sibling(td_3);
		var code_8 = $.child(td_4);
		var text_26 = $.only_child(code_8, true);

		$.reset(td_4);

		var td_5 = $.sibling(td_4);
		var code_9 = $.child(td_5);
		var text_27 = $.only_child(code_9, true);

		$.reset(td_5);

		var td_6 = $.sibling(td_5);
		var text_28 = $.only_child(td_6, true);

		$.reset(tr_1);

		$.template_effect(() => {
			$.set_text(text_25, $.get(platform).platform);
			$.set_text(text_26, $.get(platform).format);
			$.set_text(text_27, $.get(platform).example);
			$.set_text(text_28, $.get(platform).notes);
		});

		$.append($$anchor, tr_1);
	});

	$.reset(tbody_1);
	$.reset(table_1);
	$.reset(div_28);

	var div_29 = $.sibling(div_28, 2);
	var table_2 = $.sibling($.child(div_29), 2);
	var tbody_2 = $.sibling($.child(table_2));

	$.each(tbody_2, 23, () => wildcardMasksContent.quickReference, (row, refIdx) => `${row.subnet}-${refIdx}`, ($$anchor, row) => {
		var tr_2 = root_7();
		var td_7 = $.child(tr_2);
		var code_10 = $.child(td_7);
		var text_29 = $.only_child(code_10, true);

		$.reset(td_7);

		var td_8 = $.sibling(td_7);
		var code_11 = $.child(td_8);
		var text_30 = $.only_child(code_11, true);

		$.reset(td_8);

		var td_9 = $.sibling(td_8);
		var code_12 = $.child(td_9);
		var text_31 = $.only_child(code_12, true);

		$.reset(td_9);

		var td_10 = $.sibling(td_9);
		var text_32 = $.only_child(td_10, true);

		$.reset(tr_2);

		$.template_effect(() => {
			$.set_text(text_29, $.get(row).prefix);
			$.set_text(text_30, $.get(row).subnet);
			$.set_text(text_31, $.get(row).wildcard);
			$.set_text(text_32, $.get(row).use);
		});

		$.append($$anchor, tr_2);
	});

	$.reset(tbody_2);
	$.reset(table_2);
	$.reset(div_29);

	var div_30 = $.sibling(div_29, 2);
	var node_4 = $.sibling($.child(div_30), 2);

	$.each(node_4, 19, () => wildcardMasksContent.commonMistakes, (mistake, mIdx) => `${mistake.mistake}-${mIdx}`, ($$anchor, mistake) => {
		var div_31 = root_8();
		var div_32 = $.child(div_31);
		var node_5 = $.child(div_32);

		Icon(node_5, { name: 'alert-triangle', size: 'sm' });

		var text_33 = $.sibling(node_5);

		$.reset(div_32);

		var div_33 = $.sibling(div_32, 2);
		var p_4 = $.child(div_33);
		var text_34 = $.sibling($.child(p_4));

		$.reset(p_4);

		var p_5 = $.sibling(p_4, 2);
		var text_35 = $.sibling($.child(p_5));

		$.reset(p_5);
		$.reset(div_33);
		$.reset(div_31);

		$.template_effect(() => {
			$.set_text(text_33, ` ${$.get(mistake).mistake ?? ''}`);
			$.set_text(text_34, ` ${$.get(mistake).problem ?? ''}`);
			$.set_text(text_35, ` ${$.get(mistake).solution ?? ''}`);
		});

		$.append($$anchor, div_31);
	});

	$.reset(div_30);

	var div_34 = $.sibling(div_30, 2);
	var div_35 = $.sibling($.child(div_34), 2);
	var node_6 = $.sibling($.child(div_35), 2);

	$.each(node_6, 19, () => wildcardMasksContent.tips, (tip, tipIdx) => `${tip}-${tipIdx}`, ($$anchor, tip) => {
		var div_36 = root_9();
		var div_37 = $.child(div_36);
		var text_36 = $.only_child(div_37, true);

		$.reset(div_36);
		$.template_effect(() => $.set_text(text_36, $.get(tip)));
		$.append($$anchor, div_36);
	});

	$.reset(div_35);

	var div_38 = $.sibling(div_35, 2);
	var div_39 = $.child(div_38);
	var node_7 = $.child(div_39);

	Icon(node_7, { name: 'calculator', size: 'sm' });
	$.next();
	$.reset(div_39);
	$.next(2);
	$.reset(div_38);
	$.reset(div_34);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, wildcardMasksContent.title);
		$.set_text(text_1, wildcardMasksContent.description);
		$.set_text(text_2, wildcardMasksContent.sections.overview.title);
		$.set_text(text_3, wildcardMasksContent.sections.overview.content);
		$.set_text(text_4, wildcardMasksContent.sections.difference.title);
		$.set_text(text_5, wildcardMasksContent.sections.difference.content);
		$.set_text(text_11, wildcardMasksContent.quickConversion.title);
		$.set_text(text_12, wildcardMasksContent.quickConversion.formula);
	});

	$.append($$anchor, div);
	$.pop();
}