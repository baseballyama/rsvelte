import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';
import { setOperationsContent } from '$lib/content/cidr-set-operations';

var root = $.from_html(`<div class="operation-card svelte-1pc2fd8"><div class="operation-header svelte-1pc2fd8"><div class="operation-symbol svelte-1pc2fd8"> </div> <div class="operation-name svelte-1pc2fd8"> </div></div> <div class="operation-desc svelte-1pc2fd8"> </div> <div class="operation-example svelte-1pc2fd8"><strong class="svelte-1pc2fd8">Example:</strong> <code class="svelte-1pc2fd8"> </code></div></div>`);
var root_1 = $.from_html(`<li class="svelte-1pc2fd8"><strong class="svelte-1pc2fd8"> </strong> </li>`);
var root_2 = $.from_html(`<div class="pattern-card svelte-1pc2fd8"><h5 class="svelte-1pc2fd8"><!> </h5> <ul class="svelte-1pc2fd8"></ul></div>`);
var root_3 = $.from_html(`<div class="note-item svelte-1pc2fd8"><h5 class="svelte-1pc2fd8"> </h5> <p class="svelte-1pc2fd8"> </p></div>`);
var root_4 = $.from_html(`<!> <section class="reference svelte-1pc2fd8"><h3 class="svelte-1pc2fd8"> </h3> <p class="svelte-1pc2fd8"> </p> <div class="operations-grid svelte-1pc2fd8"></div> <div class="patterns-section svelte-1pc2fd8"><h4 class="svelte-1pc2fd8">Common Network Patterns</h4> <div class="patterns-grid svelte-1pc2fd8"></div></div> <div class="notes-section svelte-1pc2fd8"><h4 class="svelte-1pc2fd8">Implementation Notes</h4> <div class="notes-grid svelte-1pc2fd8"></div></div> <div class="best-practices info-panel info svelte-1pc2fd8"><h4 class="svelte-1pc2fd8">Best Practices</h4> <ul class="svelte-1pc2fd8"></ul></div></section>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root_4();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, null);

	var section = $.sibling(node, 2);
	var h3 = $.child(section);
	var text = $.only_child(h3, true);
	var p = $.sibling(h3, 2);
	var text_1 = $.only_child(p, true);
	var div = $.sibling(p, 2);

	$.each(div, 21, () => setOperationsContent.operations, $.index, ($$anchor, operation) => {
		var div_1 = root();
		var div_2 = $.child(div_1);
		var div_3 = $.child(div_2);
		var text_2 = $.only_child(div_3, true);
		var div_4 = $.sibling(div_3, 2);
		var text_3 = $.only_child(div_4, true);

		$.reset(div_2);

		var div_5 = $.sibling(div_2, 2);
		var text_4 = $.only_child(div_5, true);
		var div_6 = $.sibling(div_5, 2);
		var code = $.sibling($.child(div_6), 2);
		var text_5 = $.only_child(code, true);

		$.reset(div_6);
		$.reset(div_1);

		$.template_effect(() => {
			$.set_text(text_2, $.get(operation).symbol);
			$.set_text(text_3, $.get(operation).name);
			$.set_text(text_4, $.get(operation).description);
			$.set_text(text_5, $.get(operation).example);
		});

		$.append($$anchor, div_1);
	});

	$.reset(div);

	var div_7 = $.sibling(div, 2);
	var div_8 = $.sibling($.child(div_7), 2);

	$.each(div_8, 21, () => setOperationsContent.patterns, $.index, ($$anchor, pattern) => {
		var div_9 = root_2();
		var h5 = $.child(div_9);
		var node_1 = $.child(h5);

		Icon(node_1, {
			get name() {
				return $.get(pattern).icon;
			},
			size: 'sm'
		});

		var text_6 = $.sibling(node_1);

		$.reset(h5);

		var ul = $.sibling(h5, 2);

		$.each(ul, 21, () => $.get(pattern).items, $.index, ($$anchor, item, index, $$array) => {
			var li = root_1();
			var strong = $.child(li);
			var text_7 = $.only_child(strong);
			var text_8 = $.sibling(strong);

			$.reset(li);

			$.template_effect(() => {
				$.set_text(text_7, `${$.get(item).term ?? ''}:`);
				$.set_text(text_8, ` ${$.get(item).description ?? ''}`);
			});

			$.append($$anchor, li);
		});

		$.reset(ul);
		$.reset(div_9);
		$.template_effect(() => $.set_text(text_6, ` ${$.get(pattern).title ?? ''}`));
		$.append($$anchor, div_9);
	});

	$.reset(div_8);
	$.reset(div_7);

	var div_10 = $.sibling(div_7, 2);
	var div_11 = $.sibling($.child(div_10), 2);

	$.each(div_11, 21, () => setOperationsContent.notes, $.index, ($$anchor, note) => {
		var div_12 = root_3();
		var h5_1 = $.child(div_12);
		var text_9 = $.only_child(h5_1, true);
		var p_1 = $.sibling(h5_1, 2);
		var text_10 = $.only_child(p_1, true);

		$.reset(div_12);

		$.template_effect(() => {
			$.set_text(text_9, $.get(note).title);
			$.set_text(text_10, $.get(note).content);
		});

		$.append($$anchor, div_12);
	});

	$.reset(div_11);
	$.reset(div_10);

	var div_13 = $.sibling(div_10, 2);
	var ul_1 = $.sibling($.child(div_13), 2);

	$.each(ul_1, 21, () => setOperationsContent.bestPractices, $.index, ($$anchor, practice) => {
		var li_1 = root_1();
		var strong_1 = $.child(li_1);
		var text_11 = $.only_child(strong_1);
		var text_12 = $.sibling(strong_1);

		$.reset(li_1);

		$.template_effect(() => {
			$.set_text(text_11, `${$.get(practice).term ?? ''}:`);
			$.set_text(text_12, ` ${$.get(practice).description ?? ''}`);
		});

		$.append($$anchor, li_1);
	});

	$.reset(ul_1);
	$.reset(div_13);
	$.reset(section);

	$.template_effect(() => {
		$.set_text(text, setOperationsContent.title);
		$.set_text(text_1, setOperationsContent.description);
	});

	$.append($$anchor, fragment);
	$.pop();
}