import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor) {
	let x = $.proxy({ count: 0 });

	;;

	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, x.count));
	$.event('click', button, () => x.count++);
	$.append($$anchor, button);
}