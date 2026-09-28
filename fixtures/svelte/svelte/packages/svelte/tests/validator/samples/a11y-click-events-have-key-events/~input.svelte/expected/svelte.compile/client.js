import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div aria-hidden="false"></div> <section></section> <main></main> <article></article> <header></header> <footer></footer> <footer></footer> <div class="foo"></div> <a href="http://x.y.z">foo</a> <button>click me</button> <select></select> <input type="button"/> <input/> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <input type="hidden"/> <div aria-hidden="true"></div> <div aria-hidden="true"></div> <div aria-hidden="false"></div> <div></div> <div role="presentation"></div> <div role="none"></div> <div></div> <div></div> <!>`, 1);

export default function Input($$anchor) {
	function noop() {}

	let props = {};
	const dynamicTypeValue = "checkbox";
	const dynamicAriaHiddenValue = "false";
	const dynamicRole = "button";
	var fragment = root();
	var div = $.first_child(fragment);
	var div_1 = $.sibling(div, 2);
	var section = $.sibling(div_1, 2);
	var main = $.sibling(section, 2);
	var article = $.sibling(main, 2);
	var header = $.sibling(article, 2);
	var footer = $.sibling(header, 2);
	var footer_1 = $.sibling(footer, 2);
	var a = $.sibling(footer_1, 4);
	var button = $.sibling(a, 2);
	var select = $.sibling(button, 2);
	var input = $.sibling(select, 2);
	var input_1 = $.sibling(input, 2);

	$.set_attribute(input_1, 'type', dynamicTypeValue);

	var div_2 = $.sibling(input_1, 2);

	$.attribute_effect(div_2, () => ({ ...props }));

	var div_3 = $.sibling(div_2, 2);
	var div_4 = $.sibling(div_3, 2);
	var div_5 = $.sibling(div_4, 2);
	var div_6 = $.sibling(div_5, 2);
	var div_7 = $.sibling(div_6, 2);
	var div_8 = $.sibling(div_7, 2);
	var div_9 = $.sibling(div_8, 2);
	var input_2 = $.sibling(div_9, 2);
	var div_10 = $.sibling(input_2, 2);
	var div_11 = $.sibling(div_10, 2);
	var div_12 = $.sibling(div_11, 2);
	var div_13 = $.sibling(div_12, 2);

	$.set_attribute(div_13, 'aria-hidden', dynamicAriaHiddenValue);

	var div_14 = $.sibling(div_13, 2);
	var div_15 = $.sibling(div_14, 2);
	var div_16 = $.sibling(div_15, 2);

	$.set_attribute(div_16, 'role', dynamicRole);

	var div_17 = $.sibling(div_16, 2);

	$.set_attribute(div_17, 'role', dynamicRole);

	var node = $.sibling(div_17, 2);

	$.element(node, () => Math.random() ? 'button' : 'div', false, ($$element, $$anchor) => {
		$.event('click', $$element, noop);
	});

	$.event('click', div, noop);
	$.event('click', div_1, noop);
	$.event('click', section, noop);
	$.event('click', main, noop);
	$.event('click', article, noop);
	$.event('click', header, noop);
	$.event('click', footer, noop);
	$.event('click', footer_1, noop);
	$.event('click', a, noop);
	$.event('click', button, noop);
	$.event('click', select, noop);
	$.event('click', input, noop);
	$.event('click', input_1, noop);
	$.event('click', div_2, noop);
	$.event('click', div_3, noop);
	$.event('keydown', div_3, noop);
	$.event('click', div_4, noop);
	$.event('keyup', div_4, noop);
	$.event('click', div_5, noop);
	$.event('keypress', div_5, noop);
	$.event('click', div_6, noop);
	$.event('keydown', div_6, noop);
	$.event('keyup', div_6, noop);
	$.event('click', div_7, noop);
	$.event('keyup', div_7, noop);
	$.event('keypress', div_7, noop);
	$.event('click', div_8, noop);
	$.event('keypress', div_8, noop);
	$.event('keydown', div_8, noop);
	$.event('click', div_9, noop);
	$.event('keydown', div_9, noop);
	$.event('keyup', div_9, noop);
	$.event('keypress', div_9, noop);
	$.event('click', input_2, noop);
	$.event('click', div_10, noop);
	$.event('click', div_11, noop);
	$.event('click', div_12, noop);
	$.event('keydown', div_12, noop);
	$.event('click', div_13, noop);
	$.event('click', div_14, noop);
	$.event('click', div_15, noop);
	$.event('click', div_16, noop);
	$.event('click', div_17, noop);
	$.append($$anchor, fragment);
}