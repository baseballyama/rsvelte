import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover, Button } from "flowbite-svelte";
import { blur, fade, slide } from "svelte/transition";

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Animation($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Fade popover');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Popover(node_1, {
		class: 'w-64 text-sm font-light',
		title: 'Popover title',
		get transition() {
			return fade;
		},
		transitionParams: { duration: 1000 },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('And here\'s some amazing content. It\'s very engaging. Right?');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Blur popover');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Popover(node_3, {
		class: 'w-64 text-sm font-light',
		title: 'Popover title',
		get transition() {
			return blur;
		},
		transitionParams: { duration: 1000 },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('And here\'s some amazing content. It\'s very engaging. Right?');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Button(node_4, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Slide popover');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Popover(node_5, {
		class: 'w-64 text-sm font-light',
		title: 'Popover title',
		get transition() {
			return slide;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('And here\'s some amazing content. It\'s very engaging. Right?');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}