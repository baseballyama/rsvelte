import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Heading, P, Button } from "flowbite-svelte";
import { ArrowRightOutline } from "flowbite-svelte-icons";

var root = $.from_html(`Learn more <!>`, 1);
var root_1 = $.from_html(`<div class="text-center"><!> <!> <!></div>`);

export default function Default($$anchor) {
	var div = root_1();
	var node = $.child(div);

	Heading(node, {
		tag: 'h1',
		class: 'mb-4 text-4xl font-extrabold  md:text-5xl lg:text-6xl',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('We invest in the world’s potential');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	P(node_1, {
		class: 'mb-6 text-lg sm:px-16 lg:text-xl xl:px-48 dark:text-gray-400',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Here at Flowbite we focus on markets where technology, innovation, and capital can unlock long-term value and drive economic growth.');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		href: '/',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment = root();
			var node_3 = $.sibling($.first_child(fragment));

			ArrowRightOutline(node_3, { class: 'ms-2 h-6 w-6' });
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}