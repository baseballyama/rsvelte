import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

let foo;
var root = $.from_html(`<div> </div>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let bar;

	onMount(() => bar = foo);

	var div = root();
	var text = $.only_child(div, true);

	$.bind_this(div, ($$value) => foo = $$value, () => foo);
	$.template_effect(() => $.set_text(text, typeof bar));
	$.append($$anchor, div);
	$.pop();
}