import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";

var root = $.from_html(`<noscript></noscript> <h1>Hello!</h1><p> </p>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let count = 0;

	onMount(() => count++);

	var fragment = root();
	var p = $.sibling($.first_child(fragment), 3);
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `Count: ${count ?? ''}`));
	$.append($$anchor, fragment);
	$.pop();
}