import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

var root = $.from_html(`<div class="container"><div class="box svelte-s15w6y"></div> <button class="svelte-s15w6y">Replay</button></div>`);

export default function Gsap_box($$anchor, $$props) {
	$.push($$props, true);

	let animation;

	onMount(() => {
		animation = window.gsap.to('.box', { rotation: 180, x: 100, duration: 1 });
	});

	var div = root();
	var button = $.sibling($.child(div), 2);

	$.reset(div);
	$.delegated('click', button, () => animation.restart());
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);