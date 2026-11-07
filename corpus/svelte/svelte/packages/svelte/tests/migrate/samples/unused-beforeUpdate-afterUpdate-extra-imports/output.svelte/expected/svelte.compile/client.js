import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";

var root = $.from_html(`<button></button>`);

export default function Output($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);

	onMount(() => {
		console.log($.get(count));
	});

	var button = root();

	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);