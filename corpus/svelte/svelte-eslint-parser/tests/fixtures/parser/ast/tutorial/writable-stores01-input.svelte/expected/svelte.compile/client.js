import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { count } from './stores.js';
import Incrementer from './Incrementer.svelte';
import Decrementer from './Decrementer.svelte';
import Resetter from './Resetter.svelte';

var root = $.from_html(`<h1> </h1> <!> <!> <!>`, 1);

export default function Writable_stores01_input($$anchor, $$props) {
	$.push($$props, true);

	let count_value;

	const unsubscribe = count.subscribe((value) => {
		count_value = value;
	});

	var fragment = root();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1);
	var node = $.sibling(h1, 2);

	Incrementer(node, {});

	var node_1 = $.sibling(node, 2);

	Decrementer(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	Resetter(node_2, {});
	$.template_effect(() => $.set_text(text, `The count is ${count_value ?? ''}`));
	$.append($$anchor, fragment);
	$.pop();
}