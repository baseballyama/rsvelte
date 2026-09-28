import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Progressradial, Button } from "flowbite-svelte";
import { sineOut } from "svelte/easing";

var root = $.from_html(`<!> <!>`, 1);

export default function Animation($$anchor) {
	let progress = $.state(45);
	var fragment = root();
	var node = $.first_child(fragment);

	Progressradial(node, {
		get progress() {
			return $.get(progress);
		},
		animate: true,
		precision: 1,
		labelOutside: 'Animation',
		labelInside: true,
		tweenDuration: 1000,
		get easing() {
			return sineOut;
		},
		classes: { outside: "dark:text-white", label: "dark:text-white" }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		onclick: () => $.set(progress, Math.round(Math.random() * 100), true),
		class: 'mx-auto mt-8 w-24',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Randomize');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}