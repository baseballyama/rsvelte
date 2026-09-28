import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

var root = $.from_html(`<div></div> <p> </p>`, 1);

export default function Mount($$anchor, $$props) {
	$.push($$props, true);

	let element;
	let bound = false;

	onMount(() => {
		if (element) bound = true;
	});

	var fragment = root();
	var div = $.first_child(fragment);

	$.bind_this(div, ($$value) => element = $$value, () => element);

	var p = $.sibling(div, 2);
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `Bound? ${bound ?? ''}`));
	$.append($$anchor, fragment);
	$.pop();
}