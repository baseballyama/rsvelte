import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

var root = $.from_html(`<button> </button> <div class="text-6"> </div>`, 1);

export default function Test($$anchor, $$props) {
	$.push($$props, true);

	let message = $.prop($$props, 'message', 3, 'World');
	let count = $.state(0);

	onMount(() => {
		console.log('mount');
	});

	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button);
	var div = $.sibling(button, 2);
	var text_1 = $.only_child(div);

	$.template_effect(() => {
		$.set_text(text, `Count is: ${$.get(count) ?? ''}`);
		$.set_text(text_1, `Hello, ${message() ?? ''}`);
	});

	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);