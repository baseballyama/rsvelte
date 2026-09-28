import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import './Thing.svelte';

var root = $.from_html(`<my-thing></my-thing>`, 2);

export default function Main($$anchor) {
	var my_thing = root();

	$.append($$anchor, my_thing);
}