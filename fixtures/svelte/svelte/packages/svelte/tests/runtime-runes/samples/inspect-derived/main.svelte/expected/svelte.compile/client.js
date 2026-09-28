import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	/** @type {{ push: (v: any) => void }} */
	let x = $.state('x');

	let y = $.derived(() => $.get(x).toUpperCase());

	;;

	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, $.get(x)));
	$.event('click', button, () => $.set(x, $.get(x) + 'x'));
	$.append($$anchor, button);
	$.pop();
}