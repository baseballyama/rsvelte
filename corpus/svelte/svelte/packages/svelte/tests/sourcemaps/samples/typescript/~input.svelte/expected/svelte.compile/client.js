import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

var root = $.from_html(`<h1>Hello world!</h1> <div> </div>`, 1);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	let count = 0;

	// send timeout to the void!
	onMount(() => {
		const id = setInterval(() => count++, 1000);
		const clear = () => clearInterval(id);

		return clear;
	});

	var fragment = root();
	var div = $.sibling($.first_child(fragment), 2);
	var text = $.only_child(div);

	$.template_effect(() => $.set_text(text, `Counter value: ${count ?? ''}`));
	$.append($$anchor, fragment);
	$.pop();
}