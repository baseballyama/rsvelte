import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

var root = $.from_html(`<canvas></canvas>`);

export default function _2_input($$anchor, $$props) {
	$.push($$props, true);

	let canvasElement;

	onMount(() => {
		const ctx = canvasElement.getContext('2d');

		drawStuff(ctx);
	});

	var canvas = root();

	$.bind_this(canvas, ($$value) => canvasElement = $$value, () => canvasElement);
	$.append($$anchor, canvas);
	$.pop();
}