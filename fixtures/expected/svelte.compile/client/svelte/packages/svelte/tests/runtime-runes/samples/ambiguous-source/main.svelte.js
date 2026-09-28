import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setup } from './utils.js';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let tmp = setup(), num = $.state($.proxy(tmp.num));

	let tmp_1 = setup(),
		num_frozen = $.state($.proxy(tmp_1.num));

	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `${$.get(num) ?? ''} / ${$.get(num_frozen) ?? ''}`));

	$.event('click', button, () => {
		$.update(num);
		$.update(num_frozen);
	});

	$.append($$anchor, button);
	$.pop();
}