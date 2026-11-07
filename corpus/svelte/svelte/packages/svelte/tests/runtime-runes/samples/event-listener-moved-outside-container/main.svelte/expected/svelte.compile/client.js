import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><button> </button> <button> </button></div>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);
	let el;

	$.user_effect(() => {
		document.getElementsByTagName('body')[0].appendChild(el);
	});

	var div = root();
	var button = $.child(div);
	var text = $.only_child(button);

	$.bind_this(button, ($$value) => el = $$value, () => el);

	var button_1 = $.sibling(button, 2);
	var text_1 = $.only_child(button_1);

	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, `clicks: ${$.get(count) ?? ''}`);
		$.set_text(text_1, `clicks: ${$.get(count) ?? ''}`);
	});

	$.delegated('click', button, () => $.update(count));
	$.delegated('click', button_1, () => $.update(count));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);