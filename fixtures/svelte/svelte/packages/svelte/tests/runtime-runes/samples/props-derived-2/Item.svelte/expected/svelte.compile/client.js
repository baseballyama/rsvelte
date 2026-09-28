import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Item($$anchor, $$props) {
	$.push($$props, true);

	$.user_pre_effect(() => {
		console.log('active changed', $$props.active);
	});

	var p = root();
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `Item is ${$$props.active ? 'active' : 'inactive'}`));
	$.append($$anchor, p);
	$.pop();
}