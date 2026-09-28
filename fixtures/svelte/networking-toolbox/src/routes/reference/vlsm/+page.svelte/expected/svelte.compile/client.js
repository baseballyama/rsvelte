import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { vlsmContent } from '$lib/content/vlsm.js';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<li> </li>`);
var root_1 = $.from_html(`<li><code> </code> </li>`);
var root_2 = $.from_html(`<div class="ref-warning"><div class="warning-title"><!> </div> <div class="warning-content"><p><strong>Problem:</strong> </p> <p><strong>Solution:</strong> </p></div></div>`);
var root_3 = $.from_html(`<div class="example-item"><div class="example-description"> </div></div>`);
var root_4 = $.from_html(`<div class="page-container"><div class="ref-page"><div class="ref-header"><h1> </h1> <p class="subtitle"> </p></div> <div class="ref-section"><h2> </h2> <p> </p></div> <div class="ref-section"><h2> </h2> <p> </p> <div class="ref-highlight"><div class="highlight-title"><!> Key Benefit</div> <div class="highlight-content">VLSM prevents IP address waste by letting you create subnets that are exactly the right size for each purpose.</div></div></div> <div class="ref-section"><h2> </h2> <p> </p></div> <div class="ref-section"><h2> </h2> <p><strong> </strong></p> <div class="ref-grid two-col"><div class="grid-item"><div class="item-title">Requirements</div> <ul></ul></div> <div class="grid-item"><div class="item-title">VLSM Solution</div> <ul></ul></div></div></div> <div class="ref-section"><h2>Common Pitfalls and Solutions</h2> <!></div> <div class="ref-section"><h2>Best Practices</h2> <ul></ul></div> <div class="ref-section"><h2>Quick Tips</h2> <div class="ref-examples"><div class="examples-title">Remember These</div> <!></div></div></div></div>`);

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

	Icon(node, { name: 'lightbulb', size: 'sm' });
	$.next();
	$.reset(div_6);
	$.next(2);
	$.reset(div_5);
	$.reset(div_4);

	var div_7 = $.sibling(div_4, 2);
	var h2_2 = $.child(div_7);
	var text_6 = $.only_child(h2_2, true);
	var p_3 = $.sibling(h2_2, 2);
	var text_7 = $.only_child(p_3, true);

	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var h2_3 = $.child(div_8);
	var text_8 = $.only_child(h2_3, true);
	var p_4 = $.sibling(h2_3, 2);
	var strong = $.child(p_4);
	var text_9 = $.only_child(strong, true);

	$.reset(p_4);

	var div_9 = $.sibling(p_4, 2);
	var div_10 = $.child(div_9);
	var ul = $.sibling($.child(div_10), 2);

	$.each(ul, 23, () => vlsmContent.example.requirements, (req, reqIdx) => `${req.name}-${reqIdx}`, ($$anchor, req) => {
		var li = root();
		var text_10 = $.only_child(li);

		$.template_effect(() => $.set_text(text_10, `${$.get(req).name ?? ''}: ${$.get(req).hosts ?? ''} hosts (needs ${$.get(req).needsPrefix ?? ''})`));
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(div_10);

	var div_11 = $.sibling(div_10, 2);
	var ul_1 = $.sibling($.child(div_11), 2);

	$.each(ul_1, 23, () => vlsmContent.example.solution, (subnet, subIdx) => `${subnet.subnet}-${subIdx}`, ($$anchor, subnet) => {
		var li_1 = root_1();
		var code = $.child(li_1);
		var text_11 = $.only_child(code, true);
		var text_12 = $.sibling(code);

		$.reset(li_1);

		$.template_effect(() => {
			$.set_text(text_11, $.get(subnet).subnet);
			$.set_text(text_12, ` - ${$.get(subnet).use ?? ''} (${$.get(subnet).hosts ?? ''})`);
		});

		$.append($$anchor, li_1);
	});

	$.reset(ul_1);
	$.reset(div_11);
	$.reset(div_9);
	$.reset(div_8);

	var div_12 = $.sibling(div_8, 2);
	var node_1 = $.sibling($.child(div_12), 2);

	$.each(node_1, 19, () => vlsmContent.pitfalls, (pitfall, pitIdx) => `${pitfall.title}-${pitIdx}`, ($$anchor, pitfall) => {
		var div_13 = root_2();
		var div_14 = $.child(div_13);
		var node_2 = $.child(div_14);

		Icon(node_2, { name: 'alert-triangle', size: 'sm' });

		var text_13 = $.sibling(node_2);

		$.reset(div_14);

		var div_15 = $.sibling(div_14, 2);
		var p_5 = $.child(div_15);
		var text_14 = $.sibling($.child(p_5));

		$.reset(p_5);

		var p_6 = $.sibling(p_5, 2);
		var text_15 = $.sibling($.child(p_6));

		$.reset(p_6);
		$.reset(div_15);
		$.reset(div_13);

		$.template_effect(() => {
			$.set_text(text_13, ` ${$.get(pitfall).title ?? ''}`);
			$.set_text(text_14, ` ${$.get(pitfall).problem ?? ''}`);
			$.set_text(text_15, ` ${$.get(pitfall).solution ?? ''}`);
		});

		$.append($$anchor, div_13);
	});

	$.reset(div_12);

	var div_16 = $.sibling(div_12, 2);
	var ul_2 = $.sibling($.child(div_16), 2);

	$.each(ul_2, 23, () => vlsmContent.bestPractices, (practice, pracIdx) => `${practice}-${pracIdx}`, ($$anchor, practice) => {
		var li_2 = root();
		var text_16 = $.only_child(li_2, true);

		$.template_effect(() => $.set_text(text_16, $.get(practice)));
		$.append($$anchor, li_2);
	});

	$.reset(ul_2);
	$.reset(div_16);

	var div_17 = $.sibling(div_16, 2);
	var div_18 = $.sibling($.child(div_17), 2);
	var node_3 = $.sibling($.child(div_18), 2);

	$.each(node_3, 19, () => vlsmContent.tips, (tip, tipIdx) => `${tip}-${tipIdx}`, ($$anchor, tip) => {
		var div_19 = root_3();
		var div_20 = $.child(div_19);
		var text_17 = $.only_child(div_20, true);

		$.reset(div_19);
		$.template_effect(() => $.set_text(text_17, $.get(tip)));
		$.append($$anchor, div_19);
	});

	$.reset(div_18);
	$.reset(div_17);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, vlsmContent.title);
		$.set_text(text_1, vlsmContent.description);
		$.set_text(text_2, vlsmContent.sections.whatIs.title);
		$.set_text(text_3, vlsmContent.sections.whatIs.content);
		$.set_text(text_4, vlsmContent.sections.whenWhy.title);
		$.set_text(text_5, vlsmContent.sections.whenWhy.content);
		$.set_text(text_6, vlsmContent.sections.howItWorks.title);
		$.set_text(text_7, vlsmContent.sections.howItWorks.content);
		$.set_text(text_8, vlsmContent.example.title);
		$.set_text(text_9, vlsmContent.example.scenario);
	});

	$.append($$anchor, div);
	$.pop();
}