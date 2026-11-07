import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button> <button></button> `, 1);

export default function Parent($$anchor, $$props) {
	$.push($$props, true);

	let test = $.prop($$props, 'test', 31, () => $.proxy({}));
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var text = $.sibling(button_1);

	$.template_effect(() => $.set_text(text, ` ${test() ?? ''}`));
	$.delegated('click', button, () => test({}));
	$.delegated('click', button_1, () => test(test().test = {}, true));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);