import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<form><p>Input/Textarea value</p> <div class="test-1"><input/> <input/> <input/> <input/> <textarea></textarea> <textarea></textarea> <textarea></textarea> <textarea></textarea></div> <div class="test-2"><input/> <input/> <input/> <input/> <textarea></textarea> <textarea></textarea> <textarea></textarea> <textarea></textarea></div> <div class="test-3"><input/> <input/> <input/> <input/> <textarea></textarea> <textarea></textarea> <textarea></textarea> <textarea></textarea></div> <p>Input checked</p> <div class="test-4"><input type="checkbox"/> <input type="checkbox"/> <input type="checkbox"/> <input type="checkbox"/></div> <div class="test-5"><input type="checkbox"/> <input type="checkbox"/> <input type="checkbox"/> <input type="checkbox"/></div> <div class="test-6"><input type="checkbox"/> <input type="checkbox"/> <input type="checkbox"/> <input type="checkbox"/></div> <div class="test-7"><input type="checkbox"/> <input type="checkbox"/></div> <p>Select (single)</p> <select><option>A</option><option selected="">B</option><option>C</option></select> <select><option>A</option><option>B</option><option>C</option></select> <select><option>A</option><option selected="">B</option><option>C</option></select> <select><option>A</option><option>B</option><option>C</option></select> <p>Select (multiple)</p>  <select multiple=""><option>A</option><option selected="">B</option><option>C</option></select> <select multiple=""><option>A</option><option>B</option><option>C</option></select> <p>Static values</p> <div class="test-14"><input value="x"/> <input type="checkbox" checked=""/> <textarea>x</textarea></div> <input type="reset" value="Reset"/></form> <p>Bound values: <span class="test-1"> </span> <span class="test-2"> </span> <span class="test-3"> </span> <span class="test-4"> </span> <span class="test-5"> </span> <span class="test-6"> </span> <span class="test-7"> </span> <span class="test-8"> </span> <span class="test-9"> </span> <span class="test-10"> </span> <span class="test-11"> </span> <span class="test-12"> </span> <span class="test-13"> </span></p>`, 1);

export default function Main($$anchor) {
	let value1 = $.state(void 0);
	let value2 = void 0;
	let value3 = $.state(void 0);
	let value4 = void 0;
	let value5 = void 0;
	let value6 = $.state(void 0);
	let value7 = void 0;
	let value8 = $.state(void 0);
	let value9 = $.state(null);
	let value10 = null;
	let value11 = null;
	let value12 = $.state(null);
	let value13 = null;
	let value14 = $.state(null);
	let value15 = null;
	let value16 = $.state(null);
	let value17 = $.state('y');
	let value18 = 'y';
	let value19 = 'y';
	let value20 = $.state('y');
	let value21 = 'y';
	let value22 = $.state('y');
	let value23 = 'y';
	let value24 = $.state('y');
	let checked1 = void 0;
	let checked2 = $.state(void 0);
	let checked3 = void 0;
	let checked4 = $.state(void 0);
	let checked5 = null;
	let checked6 = $.state(null);
	let checked7 = null;
	let checked8 = $.state(null);
	let checked9 = false;
	let checked10 = $.state(false);
	let checked11 = false;
	let checked12 = $.state(false);
	let checked13 = true;
	let checked14 = $.state(true);
	let selected1 = $.state(void 0);
	let selected2 = $.state(void 0);
	let selected3 = $.state('c');
	let selected4 = $.state('c');
	let selected5 = $.state($.proxy(['c']));
	let selected6 = $.state($.proxy(['c']));
	let defaultValue = 'x';
	let defaultChecked = true;
	var fragment = root();
	var form = $.first_child(fragment);
	var div = $.sibling($.child(form), 2);
	var input = $.child(div);

	input.defaultValue = defaultValue;

	var input_1 = $.sibling(input, 2);

	input_1.defaultValue = defaultValue;
	$.set_value(input_1, value2);

	var input_2 = $.sibling(input_1, 2);

	input_2.defaultValue = 'x';

	var input_3 = $.sibling(input_2, 2);

	input_3.defaultValue = 'x';
	$.set_value(input_3, value4);

	var textarea = $.sibling(input_3, 2);

	$.remove_textarea_child(textarea);
	textarea.defaultValue = defaultValue;
	$.set_value(textarea, value5);

	var textarea_1 = $.sibling(textarea, 2);

	$.remove_textarea_child(textarea_1);
	textarea_1.defaultValue = defaultValue;

	var textarea_2 = $.sibling(textarea_1, 2);

	$.remove_textarea_child(textarea_2);
	textarea_2.defaultValue = 'x';
	$.set_value(textarea_2, value7);

	var textarea_3 = $.sibling(textarea_2, 2);

	$.remove_textarea_child(textarea_3);
	textarea_3.defaultValue = 'x';
	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var input_4 = $.child(div_1);

	input_4.defaultValue = defaultValue;

	var input_5 = $.sibling(input_4, 2);

	input_5.defaultValue = defaultValue;
	$.set_value(input_5, value10);

	var input_6 = $.sibling(input_5, 2);

	input_6.defaultValue = 'x';
	$.set_value(input_6, value11);

	var input_7 = $.sibling(input_6, 2);

	input_7.defaultValue = 'x';

	var textarea_4 = $.sibling(input_7, 2);

	$.remove_textarea_child(textarea_4);
	textarea_4.defaultValue = defaultValue;
	$.set_value(textarea_4, value13);

	var textarea_5 = $.sibling(textarea_4, 2);

	$.remove_textarea_child(textarea_5);
	textarea_5.defaultValue = defaultValue;

	var textarea_6 = $.sibling(textarea_5, 2);

	$.remove_textarea_child(textarea_6);
	textarea_6.defaultValue = 'x';
	$.set_value(textarea_6, value15);

	var textarea_7 = $.sibling(textarea_6, 2);

	$.remove_textarea_child(textarea_7);
	textarea_7.defaultValue = 'x';
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var input_8 = $.child(div_2);

	input_8.defaultValue = defaultValue;

	var input_9 = $.sibling(input_8, 2);

	input_9.defaultValue = defaultValue;
	$.set_value(input_9, value18);

	var input_10 = $.sibling(input_9, 2);

	input_10.defaultValue = 'x';
	$.set_value(input_10, value19);

	var input_11 = $.sibling(input_10, 2);

	input_11.defaultValue = 'x';

	var textarea_8 = $.sibling(input_11, 2);

	$.remove_textarea_child(textarea_8);
	textarea_8.defaultValue = defaultValue;
	$.set_value(textarea_8, value21);

	var textarea_9 = $.sibling(textarea_8, 2);

	$.remove_textarea_child(textarea_9);
	textarea_9.defaultValue = defaultValue;

	var textarea_10 = $.sibling(textarea_9, 2);

	$.remove_textarea_child(textarea_10);
	textarea_10.defaultValue = 'x';
	$.set_value(textarea_10, value23);

	var textarea_11 = $.sibling(textarea_10, 2);

	$.remove_textarea_child(textarea_11);
	textarea_11.defaultValue = 'x';
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 4);
	var input_12 = $.child(div_3);

	input_12.defaultChecked = defaultChecked;
	$.set_checked(input_12, checked1);

	var input_13 = $.sibling(input_12, 2);

	input_13.defaultChecked = defaultChecked;

	var input_14 = $.sibling(input_13, 2);

	input_14.defaultChecked = true;
	$.set_checked(input_14, checked3);

	var input_15 = $.sibling(input_14, 2);

	input_15.defaultChecked = true;
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var input_16 = $.child(div_4);

	input_16.defaultChecked = defaultChecked;
	$.set_checked(input_16, checked5);

	var input_17 = $.sibling(input_16, 2);

	input_17.defaultChecked = defaultChecked;

	var input_18 = $.sibling(input_17, 2);

	input_18.defaultChecked = true;
	$.set_checked(input_18, checked7);

	var input_19 = $.sibling(input_18, 2);

	input_19.defaultChecked = true;
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var input_20 = $.child(div_5);

	input_20.defaultChecked = defaultChecked;
	$.set_checked(input_20, checked9);

	var input_21 = $.sibling(input_20, 2);

	input_21.defaultChecked = defaultChecked;

	var input_22 = $.sibling(input_21, 2);

	input_22.defaultChecked = true;
	$.set_checked(input_22, checked11);

	var input_23 = $.sibling(input_22, 2);

	input_23.defaultChecked = true;
	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var input_24 = $.child(div_6);

	input_24.defaultChecked = false;
	$.set_checked(input_24, checked13);

	var input_25 = $.sibling(input_24, 2);

	input_25.defaultChecked = false;
	$.reset(div_6);

	var select = $.sibling(div_6, 4);
	var option = $.child(select);

	option.value = option.__value = 'a';

	var option_1 = $.sibling(option);

	option_1.value = option_1.__value = 'b';

	var option_2 = $.sibling(option_1);

	option_2.value = option_2.__value = 'c';
	$.reset(select);
	$.init_select(select);

	var select_1 = $.sibling(select, 2);
	var option_3 = $.child(select_1);

	option_3.value = option_3.__value = 'a';

	var option_4 = $.sibling(option_3);

	$.set_selected(option_4, defaultChecked);
	option_4.value = option_4.__value = 'b';

	var option_5 = $.sibling(option_4);

	option_5.value = option_5.__value = 'c';
	$.reset(select_1);
	$.init_select(select_1);

	var select_2 = $.sibling(select_1, 2);
	var option_6 = $.child(select_2);

	option_6.value = option_6.__value = 'a';

	var option_7 = $.sibling(option_6);

	option_7.value = option_7.__value = 'b';

	var option_8 = $.sibling(option_7);

	option_8.value = option_8.__value = 'c';
	$.reset(select_2);
	$.init_select(select_2);

	var select_3 = $.sibling(select_2, 2);
	var option_9 = $.child(select_3);

	option_9.value = option_9.__value = 'a';

	var option_10 = $.sibling(option_9);

	$.set_selected(option_10, defaultChecked);
	option_10.value = option_10.__value = 'b';

	var option_11 = $.sibling(option_10);

	option_11.value = option_11.__value = 'c';
	$.reset(select_3);
	$.init_select(select_3);

	var select_4 = $.sibling(select_3, 4);
	var option_12 = $.child(select_4);

	option_12.value = option_12.__value = 'a';

	var option_13 = $.sibling(option_12);

	option_13.value = option_13.__value = 'b';

	var option_14 = $.sibling(option_13);

	option_14.value = option_14.__value = 'c';
	$.reset(select_4);
	$.init_select(select_4);

	var select_5 = $.sibling(select_4, 2);
	var option_15 = $.child(select_5);

	option_15.value = option_15.__value = 'a';

	var option_16 = $.sibling(option_15);

	$.set_selected(option_16, defaultChecked);
	option_16.value = option_16.__value = 'b';

	var option_17 = $.sibling(option_16);

	option_17.value = option_17.__value = 'c';
	$.reset(select_5);
	$.init_select(select_5);

	var div_7 = $.sibling(select_5, 4);
	var input_26 = $.child(div_7);

	$.set_default_value(input_26, 'y');

	var input_27 = $.sibling(input_26, 2);

	$.set_default_checked(input_27, false);

	var textarea_12 = $.sibling(input_27, 2);

	$.set_default_value(textarea_12, 'y');
	$.reset(div_7);

	var input_28 = $.sibling(div_7, 2);

	$.reset(form);

	var p = $.sibling(form, 2);
	var span = $.sibling($.child(p));
	var text = $.only_child(span);
	var span_1 = $.sibling(span, 2);
	var text_1 = $.only_child(span_1);
	var span_2 = $.sibling(span_1, 2);
	var text_2 = $.only_child(span_2);
	var span_3 = $.sibling(span_2, 2);
	var text_3 = $.only_child(span_3);
	var span_4 = $.sibling(span_3, 2);
	var text_4 = $.only_child(span_4);
	var span_5 = $.sibling(span_4, 2);
	var text_5 = $.only_child(span_5);
	var span_6 = $.sibling(span_5, 2);
	var text_6 = $.only_child(span_6, true);
	var span_7 = $.sibling(span_6, 2);
	var text_7 = $.only_child(span_7, true);
	var span_8 = $.sibling(span_7, 2);
	var text_8 = $.only_child(span_8, true);
	var span_9 = $.sibling(span_8, 2);
	var text_9 = $.only_child(span_9, true);
	var span_10 = $.sibling(span_9, 2);
	var text_10 = $.only_child(span_10, true);
	var span_11 = $.sibling(span_10, 2);
	var text_11 = $.only_child(span_11, true);
	var span_12 = $.sibling(span_11, 2);
	var text_12 = $.only_child(span_12, true);

	$.reset(p);

	$.template_effect(() => {
		$.set_text(text, `${$.get(value1) ?? ''} ${$.get(value3) ?? ''} ${$.get(value6) ?? ''} ${$.get(value8) ?? ''}`);
		$.set_text(text_1, `${$.get(value9) ?? ''} ${$.get(value12) ?? ''} ${$.get(value14) ?? ''} ${$.get(value16) ?? ''}`);
		$.set_text(text_2, `${$.get(value17) ?? ''} ${$.get(value20) ?? ''} ${$.get(value22) ?? ''} ${$.get(value24) ?? ''}`);
		$.set_text(text_3, `${$.get(checked2) ?? ''} ${$.get(checked4) ?? ''}`);
		$.set_text(text_4, `${$.get(checked6) ?? ''} ${$.get(checked8) ?? ''}`);
		$.set_text(text_5, `${$.get(checked10) ?? ''} ${$.get(checked12) ?? ''}`);
		$.set_text(text_6, $.get(checked14));
		$.set_text(text_7, $.get(selected1));
		$.set_text(text_8, $.get(selected2));
		$.set_text(text_9, $.get(selected3));
		$.set_text(text_10, $.get(selected4));
		$.set_text(text_11, $.get(selected5));
		$.set_text(text_12, $.get(selected6));
	});

	$.bind_value(input, () => $.get(value1), ($$value) => $.set(value1, $$value));
	$.bind_value(input_2, () => $.get(value3), ($$value) => $.set(value3, $$value));
	$.bind_value(textarea_1, () => $.get(value6), ($$value) => $.set(value6, $$value));
	$.bind_value(textarea_3, () => $.get(value8), ($$value) => $.set(value8, $$value));
	$.bind_value(input_4, () => $.get(value9), ($$value) => $.set(value9, $$value));
	$.bind_value(input_7, () => $.get(value12), ($$value) => $.set(value12, $$value));
	$.bind_value(textarea_5, () => $.get(value14), ($$value) => $.set(value14, $$value));
	$.bind_value(textarea_7, () => $.get(value16), ($$value) => $.set(value16, $$value));
	$.bind_value(input_8, () => $.get(value17), ($$value) => $.set(value17, $$value));
	$.bind_value(input_11, () => $.get(value20), ($$value) => $.set(value20, $$value));
	$.bind_value(textarea_9, () => $.get(value22), ($$value) => $.set(value22, $$value));
	$.bind_value(textarea_11, () => $.get(value24), ($$value) => $.set(value24, $$value));
	$.bind_checked(input_13, () => $.get(checked2), ($$value) => $.set(checked2, $$value));
	$.bind_checked(input_15, () => $.get(checked4), ($$value) => $.set(checked4, $$value));
	$.bind_checked(input_17, () => $.get(checked6), ($$value) => $.set(checked6, $$value));
	$.bind_checked(input_19, () => $.get(checked8), ($$value) => $.set(checked8, $$value));
	$.bind_checked(input_21, () => $.get(checked10), ($$value) => $.set(checked10, $$value));
	$.bind_checked(input_23, () => $.get(checked12), ($$value) => $.set(checked12, $$value));
	$.bind_checked(input_25, () => $.get(checked14), ($$value) => $.set(checked14, $$value));
	$.bind_select_value(select, () => $.get(selected1), ($$value) => $.set(selected1, $$value));
	$.bind_select_value(select_1, () => $.get(selected2), ($$value) => $.set(selected2, $$value));
	$.bind_select_value(select_2, () => $.get(selected3), ($$value) => $.set(selected3, $$value));
	$.bind_select_value(select_3, () => $.get(selected4), ($$value) => $.set(selected4, $$value));
	$.bind_select_value(select_4, () => $.get(selected5), ($$value) => $.set(selected5, $$value));
	$.bind_select_value(select_5, () => $.get(selected6), ($$value) => $.set(selected6, $$value));
	$.append($$anchor, fragment);
}