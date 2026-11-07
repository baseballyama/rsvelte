import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const content = ($$anchor, $$arg0) => {
	var $$array = $.derived(() => $.to_array($$arg0?.(), 1));
	let x = () => $.get($$array)[0];

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, x()));
	$.append($$anchor, text);
};

export default function Main($$anchor) {
	let array = $.proxy(['a', 'b', 'c']);

	content($$anchor, () => array);
}