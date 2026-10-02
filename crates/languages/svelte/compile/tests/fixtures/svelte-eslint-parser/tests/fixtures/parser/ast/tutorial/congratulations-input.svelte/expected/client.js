import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

var root = $.from_html(`<span class="svelte-oy26ul"> </span>`);

export default function Congratulations_input($$anchor, $$props) {
	$.push($$props, true);

	let characters = ['🥳', '🎉', '✨'];

	let confetti = new Array(100).fill().map((_, i) => {
		return {
			character: characters[i % characters.length],
			x: Math.random() * 100,
			y: -20 - Math.random() * 100,
			r: 0.1 + Math.random() * 1
		};
	}).sort((a, b) => a.r - b.r);

	onMount(() => {
		let frame;

		function loop() {
			frame = requestAnimationFrame(loop);

			confetti = confetti.map((emoji) => {
				emoji.y += 0.7 * emoji.r;

				if (emoji.y > 120) emoji.y = -20;

				return emoji;
			});
		}

		loop();

		return () => cancelAnimationFrame(frame);
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => confetti, $.index, ($$anchor, c) => {
		var span = root();
		var text = $.only_child(span, true);

		$.template_effect(() => {
			$.set_style(span, `left: ${$.get(c).x ?? ''}%; top: ${$.get(c).y ?? ''}%; transform: scale(${$.get(c).r ?? ''})`);
			$.set_text(text, $.get(c).character);
		});

		$.append($$anchor, span);
	});

	$.append($$anchor, fragment);
	$.pop();
}