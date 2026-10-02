import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div owntypefromold="foo"></div> <div></div> <own-element></own-element> <own-element-from-old></own-element-from-old> <div owntype="foo"></div> <div></div> <own-element></own-element> <own-element></own-element> <div></div> <div></div> <div></div> <div></div> <own-element-from-old></own-element-from-old> <own-element-from-old></own-element-from-old>`, 3);

export default function Input($$anchor) {
	var fragment = root();
	var div = $.sibling($.first_child(fragment), 2);
	var own_element = $.sibling(div, 2);

	$.set_custom_element_data(own_element, 'attribute', 'foo');

	var own_element_from_old = $.sibling(own_element, 2);

	$.set_custom_element_data(own_element_from_old, 'attribute', 'foo');

	var div_1 = $.sibling(own_element_from_old, 4);
	var own_element_1 = $.sibling(div_1, 2);

	$.set_custom_element_data(own_element_1, 'attribute', false);

	var own_element_2 = $.sibling(own_element_1, 2);

	$.set_custom_element_data(own_element_2, 'doesnexist', 'wrong');

	var div_2 = $.sibling(own_element_2, 2);

	$.set_attribute(div_2, 'owntype', false);

	var div_3 = $.sibling(div_2, 2);

	$.set_attribute(div_3, 'owntypefromold', false);

	var div_4 = $.sibling(div_3, 2);
	var div_5 = $.sibling(div_4, 2);
	var own_element_from_old_1 = $.sibling(div_5, 2);

	$.set_custom_element_data(own_element_from_old_1, 'attribute', false);

	var own_element_from_old_2 = $.sibling(own_element_from_old_1, 2);

	$.set_custom_element_data(own_element_from_old_2, 'doesnexist', 'wrong');
	$.event('ownclickfromold', div, (e) => e.detail.foo);
	$.event('ownclick', div_1, (e) => e.detail.foo);
	$.event('ownclick', div_4, (e) => e.detail.wrong);
	$.event('ownclickfromold', div_5, (e) => e.detail.wrong);
	$.append($$anchor, fragment);
}