import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div>`, 1);

export default function Input($$anchor) {
	const otherProps = { onblur: () => {}, onfocus: () => {} };
	var fragment = root();
	var div = $.first_child(fragment);
	var div_1 = $.sibling(div, 2);
	var div_2 = $.sibling(div_1, 2);
	var event_handler = () => {};

	$.attribute_effect(div_2, () => ({ onmouseover: event_handler, ...otherProps }));

	var div_3 = $.sibling(div_2, 2);
	var div_4 = $.sibling(div_3, 2);
	var div_5 = $.sibling(div_4, 2);
	var event_handler_1 = () => {};

	$.attribute_effect(div_5, () => ({ onmouseout: event_handler_1, ...otherProps }));

	var div_6 = $.sibling(div_5, 2);
	var div_7 = $.sibling(div_6, 2);

	$.delegated('mouseover', div, () => {});
	$.delegated('mouseover', div_1, () => {});
	$.event('focus', div_1, () => {});
	$.delegated('mouseout', div_3, () => {});
	$.delegated('mouseout', div_4, () => {});
	$.event('blur', div_4, () => {});
	$.delegated('mouseover', div_6, () => {});
	$.delegated('focusin', div_6, () => {});
	$.delegated('mouseout', div_7, () => {});
	$.delegated('focusout', div_7, () => {});
	$.append($$anchor, fragment);
}

$.delegate(['mouseover', 'mouseout', 'focusin', 'focusout']);