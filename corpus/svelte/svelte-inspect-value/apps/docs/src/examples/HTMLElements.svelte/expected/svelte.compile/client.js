import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Inspect } from '@components';

var root = $.from_html(`<li class="svelte-bminps"></li>`);
var root_1 = $.from_html(`<div><label>testid <input type="text" class="svelte-bminps"/></label> <label>width <input type="number" step="10" max="1000" min="450" class="svelte-bminps"/></label> <label>extra class <select class="svelte-bminps"><option></option><option>red</option><option>blue</option><option>radius</option></select></label> <ul></ul> <ul class="horiz svelte-bminps"></ul></div> <!> <div class="input-row"><fieldset class="not-content svelte-bminps"><legend>Element View</legend> <label class="svelte-bminps"><input type="radio"/> <span>simple</span></label> <label class="svelte-bminps"><input type="radio"/> <span>full</span></label></fieldset></div>`, 1);

export default function HTMLElements($$anchor) {
	const binding_group = [];
	let div = $.state(void 0);
	let width = $.state(500);
	let classes = $.state('radius');
	let testid = $.state('demo-div');
	let group = $.state('simple');
	var fragment = root_1();
	var div_1 = $.first_child(fragment);
	var label = $.child(div_1);
	var input = $.sibling($.child(label));

	$.remove_input_defaults(input);
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_1 = $.sibling($.child(label_1));

	$.remove_input_defaults(input_1);
	$.reset(label_1);

	var label_2 = $.sibling(label_1, 2);
	var select = $.sibling($.child(label_2));

	$.init_select(select);
	$.reset(label_2);

	var ul = $.sibling(label_2, 2);

	$.each(ul, 20, () => ({ length: 100 }), $.index, ($$anchor, $$item, i) => {
		var li = root();

		li.textContent = i;
		$.append($$anchor, li);
	});

	$.reset(ul);

	var ul_1 = $.sibling(ul, 2);

	$.each(ul_1, 20, () => ({ length: 100 }), $.index, ($$anchor, $$item, i) => {
		var li_1 = root();

		li_1.textContent = i;
		$.append($$anchor, li_1);
	});

	$.reset(ul_1);
	$.reset(div_1);
	$.bind_this(div_1, ($$value) => $.set(div, $$value), () => $.get(div));

	var node = $.sibling(div_1, 2);

	Inspect(node, {
		get value() {
			return $.get(div);
		},
		name: 'htmlElement',
		class: 'not-content mt',
		expandLevel: 1,
		get elementView() {
			return $.get(group);
		}
	});

	var div_2 = $.sibling(node, 2);
	var fieldset = $.child(div_2);
	var label_3 = $.sibling($.child(fieldset), 2);
	var input_2 = $.child(label_3);

	$.remove_input_defaults(input_2);
	input_2.value = input_2.__value = 'simple';
	$.next(2);
	$.reset(label_3);

	var label_4 = $.sibling(label_3, 2);
	var input_3 = $.child(label_4);

	$.remove_input_defaults(input_3);
	input_3.value = input_3.__value = 'full';
	$.next(2);
	$.reset(label_4);
	$.reset(fieldset);
	$.reset(div_2);

	$.template_effect(() => {
		$.set_class(div_1, 1, `demo-div ${$.get(classes) ?? ''}`, 'svelte-bminps');
		$.set_style(div_1, `width: ${$.get(width) ?? ''}px;`);
		$.set_attribute(div_1, 'data-testid', $.get(testid));
	});

	$.bind_value(input, () => $.get(testid), ($$value) => $.set(testid, $$value));
	$.bind_value(input_1, () => $.get(width), ($$value) => $.set(width, $$value));
	$.bind_select_value(select, () => $.get(classes), ($$value) => $.set(classes, $$value));
	$.bind_group(binding_group, [], input_2, () => $.get(group), ($$value) => $.set(group, $$value));
	$.bind_group(binding_group, [], input_3, () => $.get(group), ($$value) => $.set(group, $$value));
	$.append($$anchor, fragment);
}