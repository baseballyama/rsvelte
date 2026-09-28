import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Sub from './sub.svelte';

var root = $.from_html(`<!> <button> </button>`, 1);

export default function Main($$anchor) {
	let sub = $.state(void 0);
	var fragment = root();
	var node = $.first_child(fragment);

	$.bind_this(Sub(node, {}), ($$value) => $.set(sub, $$value, true), () => $.get(sub));

	var button = $.sibling(node, 2);
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `${$.get(sub)?.count ?? ''} / ${$.get(sub)?.doubled ?? ''}`));
	$.event('click', button, () => $.get(sub).increment());
	$.append($$anchor, fragment);
}