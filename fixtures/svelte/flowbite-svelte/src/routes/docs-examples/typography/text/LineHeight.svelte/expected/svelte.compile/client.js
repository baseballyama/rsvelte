import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { P } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function LineHeight($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	P(node, {
		size: '3xl',
		height: 'normal',
		class: 'max-w-lg',
		weight: 'semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('The Al-powered app will help you improve yourself by analysing your everyday life.');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	P(node_1, {
		size: '3xl',
		height: 'relaxed',
		class: 'max-w-lg',
		weight: 'semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('The Al-powered app will help you improve yourself by analysing your everyday life.');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	P(node_2, {
		size: '3xl',
		height: 'loose',
		class: 'max-w-lg',
		weight: 'semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('The Al-powered app will help you improve yourself by analysing your everyday life.');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}