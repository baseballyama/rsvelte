import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

export const FOO = 'BAR';

var root = $.from_html(`<button> </button>`);

export default function Test($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);

	onMount(() => {
		// mounted
	});

	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `Count is: ${$.get(count) ?? ''}`));
	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);