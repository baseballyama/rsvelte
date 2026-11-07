import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="svelte-1qo1fkp"></div> <span></span> <div class="svelte-1qo1fkp"><span class="svelte-1qo1fkp"></span></div> <div class="foo svelte-1qo1fkp"></div> <span class="foo"></span> <div class="svelte-1qo1fkp"><span class="foo svelte-1qo1fkp"></span></div> <div></div> <span></span> <div class="svelte-1qo1fkp"><span></span></div> <div></div> <span></span> <div class="svelte-1qo1fkp"><span></span></div> <div></div> <span></span> <div class="svelte-1qo1fkp"><span></span></div> <div></div> <span></span> <div class="svelte-1qo1fkp"><span></span></div> <div></div> <span></span> <div class="svelte-1qo1fkp"><span></span></div>`, 1);

export default function Main($$anchor, $$props) {
	let foo = $.prop($$props, 'foo', 3, false),
		bar = $.prop($$props, 'bar', 3, true);

	var fragment = root();
	var div = $.sibling($.first_child(fragment), 12);
	let classes;
	var span = $.sibling(div, 2);
	let classes_1;
	var div_1 = $.sibling(span, 2);
	var span_1 = $.child(div_1);
	let classes_2;

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	let classes_3;
	var span_2 = $.sibling(div_2, 2);
	let classes_4;
	var div_3 = $.sibling(span_2, 2);
	var span_3 = $.child(div_3);
	let classes_5;

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	let classes_6;
	var span_4 = $.sibling(div_4, 2);
	let classes_7;
	var div_5 = $.sibling(span_4, 2);
	var span_5 = $.child(div_5);
	let classes_8;

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	let classes_9;
	var span_6 = $.sibling(div_6, 2);
	let classes_10;
	var div_7 = $.sibling(span_6, 2);
	var span_7 = $.child(div_7);
	let classes_11;

	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	let classes_12;
	var span_8 = $.sibling(div_8, 2);
	let classes_13;
	var div_9 = $.sibling(span_8, 2);
	var span_9 = $.child(div_9);
	let classes_14;

	$.reset(div_9);

	$.template_effect(() => {
		classes = $.set_class(div, 1, 'foo svelte-1qo1fkp', null, classes, { bar: bar() });
		classes_1 = $.set_class(span, 1, 'foo', null, classes_1, { bar: bar() });
		classes_2 = $.set_class(span_1, 1, 'foo svelte-1qo1fkp', null, classes_2, { bar: bar() });
		classes_3 = $.set_class(div_2, 1, 'foo svelte-1qo1fkp', null, classes_3, { foo: foo() });
		classes_4 = $.set_class(span_2, 1, 'foo', null, classes_4, { foo: foo() });
		classes_5 = $.set_class(span_3, 1, 'foo svelte-1qo1fkp', null, classes_5, { foo: foo() });
		classes_6 = $.set_class(div_4, 1, 'foo svelte-1qo1fkp', null, classes_6, { bar: bar(), foo: foo() });
		classes_7 = $.set_class(span_4, 1, 'foo', null, classes_7, { bar: bar(), foo: foo() });
		classes_8 = $.set_class(span_5, 1, 'foo svelte-1qo1fkp', null, classes_8, { bar: bar(), foo: foo() });
		classes_9 = $.set_class(div_6, 1, 'football svelte-1qo1fkp', null, classes_9, { bar: bar(), foo: foo() });
		classes_10 = $.set_class(span_6, 1, 'football', null, classes_10, { bar: bar(), foo: foo() });
		classes_11 = $.set_class(span_7, 1, 'football svelte-1qo1fkp', null, classes_11, { bar: bar(), foo: foo() });
		classes_12 = $.set_class(div_8, 1, 'foo svelte-1qo1fkp', null, classes_12, { bar: bar(), foo: foo(), 'not-foo': !foo() });
		classes_13 = $.set_class(span_8, 1, 'foo', null, classes_13, { bar: bar(), foo: foo(), 'not-foo': !foo() });
		classes_14 = $.set_class(span_9, 1, 'foo svelte-1qo1fkp', null, classes_14, { bar: bar(), foo: foo(), 'not-foo': !foo() });
	});

	$.append($$anchor, fragment);
}