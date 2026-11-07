import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Progressbar, Button } from "flowbite-svelte";
import { sineOut } from "svelte/easing";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Animation($$anchor) {
	let progress = "45";
	var fragment = root();
	var node = $.first_child(fragment);

	Progressbar(node, {
		get progress() {
			return progress;
		},
		animate: true,
		precision: 2,
		labelOutside: 'With animation',
		labelInside: true,
		tweenDuration: 1500,
		get easing() {
			return sineOut;
		},
		size: 'h-6',
		classes: {
			label: "bg-blue-600 text-blue-100 text-base font-medium text-center p-1 leading-none rounded-full"
		},
		class: 'mb-8'
	});

	var node_1 = $.sibling(node, 2);

	Progressbar(node_1, {
		get progress() {
			return progress;
		},
		labelOutside: 'Without animation',
		labelInside: true,
		size: 'h-6',
		classes: {
			label: "bg-blue-600 text-blue-100 text-base font-medium text-center p-1 leading-none rounded-full"
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		onclick: () => progress = `${Math.round(Math.random() * 100)}`,
		class: 'mt-8',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Randomize');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}