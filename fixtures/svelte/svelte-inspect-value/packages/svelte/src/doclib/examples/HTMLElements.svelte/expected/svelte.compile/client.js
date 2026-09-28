import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inspect from '$lib/index.js';
import { getContext } from 'svelte';

var root = $.from_html(`<li></li>`);
var root_1 = $.from_html(`<div class="flex col"><h3 id="html">HTML Elements</h3> <fieldset class="svelte-e2q7hj"><legend>element view</legend> <label class="svelte-e2q7hj"><input type="radio"/> <span>simple</span></label> <label class="svelte-e2q7hj"><input type="radio"/> <span>full</span></label></fieldset> <div><div><label>testid <input type="text" class="svelte-e2q7hj"/></label> <label>width <input type="number" step="10" max="1000" min="450" class="svelte-e2q7hj"/></label> <label>extra class <select><option></option><option>red</option><option>blue</option><option>radius</option></select></label></div> <ul></ul></div> <!></div>`);

export default function HTMLElements($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	let div = $.state(void 0);
	let width = $.state(500);
	let classes = $.state('radius');
	let testid = $.state('demo-div');

	getContext('toc')?.set('HTML Elements', 'html');

	let group = $.state('simple');
	var div_1 = root_1();
	var fieldset = $.sibling($.child(div_1), 2);
	var label = $.sibling($.child(fieldset), 2);
	var input = $.child(label);

	$.remove_input_defaults(input);
	input.value = input.__value = 'simple';
	$.next(2);
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_1 = $.child(label_1);

	$.remove_input_defaults(input_1);
	input_1.value = input_1.__value = 'full';
	$.next(2);
	$.reset(label_1);
	$.reset(fieldset);

	var div_2 = $.sibling(fieldset, 2);
	var div_3 = $.child(div_2);
	var label_2 = $.child(div_3);
	var input_2 = $.sibling($.child(label_2));

	$.remove_input_defaults(input_2);
	$.reset(label_2);

	var label_3 = $.sibling(label_2, 2);
	var input_3 = $.sibling($.child(label_3));

	$.remove_input_defaults(input_3);
	$.reset(label_3);

	var label_4 = $.sibling(label_3, 2);
	var select = $.sibling($.child(label_4));

	$.init_select(select);
	$.reset(label_4);
	$.reset(div_3);

	var ul = $.sibling(div_3, 2);

	$.each(ul, 20, () => ({ length: 100 }), $.index, ($$anchor, $$item, i) => {
		var li = root();

		li.textContent = i;
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(div_2);
	$.bind_this(div_2, ($$value) => $.set(div, $$value), () => $.get(div));

	var node = $.sibling(div_2, 2);

	Inspect(node, {
		get value() {
			return $.get(div);
		},
		name: 'htmlElement',
		style: 'flex-basis: 100%',
		expandLevel: 0,
		get elementView() {
			return $.get(group);
		}
	});

	$.reset(div_1);

	$.template_effect(() => {
		$.set_class(div_2, 1, `demo-div ${$.get(classes) ?? ''}`, 'svelte-e2q7hj');
		$.set_style(div_2, `width: ${$.get(width) ?? ''}px;`);
		$.set_attribute(div_2, 'data-testid', $.get(testid));
	});

	$.bind_group(binding_group, [], input, () => $.get(group), ($$value) => $.set(group, $$value));
	$.bind_group(binding_group, [], input_1, () => $.get(group), ($$value) => $.set(group, $$value));
	$.bind_value(input_2, () => $.get(testid), ($$value) => $.set(testid, $$value));
	$.bind_value(input_3, () => $.get(width), ($$value) => $.set(width, $$value));
	$.bind_select_value(select, () => $.get(classes), ($$value) => $.set(classes, $$value));
	$.append($$anchor, div_1);
	$.pop();
}