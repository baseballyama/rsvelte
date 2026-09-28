import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Progressradial } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Colors($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Progressradial(node, {
		progress: 65,
		labelOutside: 'default',
		classes: { outside: "dark:text-white" }
	});

	var node_1 = $.sibling(node, 2);

	Progressradial(node_1, {
		color: 'secondary',
		progress: '65',
		labelOutside: 'secondary',
		classes: { outside: "dark:text-white" }
	});

	var node_2 = $.sibling(node_1, 2);

	Progressradial(node_2, {
		color: 'gray',
		progress: '65',
		labelOutside: 'gray',
		classes: { outside: "dark:text-white" }
	});

	var node_3 = $.sibling(node_2, 2);

	Progressradial(node_3, {
		color: 'red',
		progress: '65',
		labelOutside: 'red',
		classes: { outside: "dark:text-white" }
	});

	var node_4 = $.sibling(node_3, 2);

	Progressradial(node_4, {
		color: 'orange',
		progress: '65',
		labelOutside: 'orange',
		classes: { outside: "dark:text-white" }
	});

	var node_5 = $.sibling(node_4, 2);

	Progressradial(node_5, {
		color: 'amber',
		progress: '65',
		labelOutside: 'amber',
		classes: { outside: "dark:text-white" }
	});

	var node_6 = $.sibling(node_5, 2);

	Progressradial(node_6, {
		color: 'yellow',
		progress: '65',
		labelOutside: 'yellow',
		classes: { outside: "dark:text-white" }
	});

	var node_7 = $.sibling(node_6, 2);

	Progressradial(node_7, {
		color: 'lime',
		progress: '65',
		labelOutside: 'lime',
		classes: { outside: "dark:text-white" }
	});

	var node_8 = $.sibling(node_7, 2);

	Progressradial(node_8, {
		color: 'green',
		progress: '65',
		labelOutside: 'green',
		classes: { outside: "dark:text-white" }
	});

	var node_9 = $.sibling(node_8, 2);

	Progressradial(node_9, {
		color: 'emerald',
		progress: '65',
		labelOutside: 'emerald',
		classes: { outside: "dark:text-white" }
	});

	var node_10 = $.sibling(node_9, 2);

	Progressradial(node_10, {
		color: 'teal',
		progress: '65',
		labelOutside: 'teal',
		classes: { outside: "dark:text-white" }
	});

	var node_11 = $.sibling(node_10, 2);

	Progressradial(node_11, {
		color: 'cyan',
		progress: '65',
		labelOutside: 'cyan',
		classes: { outside: "dark:text-white" }
	});

	var node_12 = $.sibling(node_11, 2);

	Progressradial(node_12, {
		color: 'sky',
		progress: '65',
		labelOutside: 'sky',
		classes: { outside: "dark:text-white" }
	});

	var node_13 = $.sibling(node_12, 2);

	Progressradial(node_13, {
		color: 'blue',
		progress: '65',
		labelOutside: 'blue',
		classes: { outside: "dark:text-white" }
	});

	var node_14 = $.sibling(node_13, 2);

	Progressradial(node_14, {
		color: 'indigo',
		progress: '65',
		labelOutside: 'indigo',
		classes: { outside: "dark:text-white" }
	});

	var node_15 = $.sibling(node_14, 2);

	Progressradial(node_15, {
		color: 'violet',
		progress: '65',
		labelOutside: 'violet',
		classes: { outside: "dark:text-white" }
	});

	var node_16 = $.sibling(node_15, 2);

	Progressradial(node_16, {
		color: 'purple',
		progress: '65',
		labelOutside: 'purple',
		classes: { outside: "dark:text-white" }
	});

	var node_17 = $.sibling(node_16, 2);

	Progressradial(node_17, {
		color: 'fuchsia',
		progress: '65',
		labelOutside: 'fuchsia',
		classes: { outside: "dark:text-white" }
	});

	var node_18 = $.sibling(node_17, 2);

	Progressradial(node_18, {
		color: 'pink',
		progress: '65',
		labelOutside: 'pink',
		classes: { outside: "dark:text-white" }
	});

	var node_19 = $.sibling(node_18, 2);

	Progressradial(node_19, {
		color: 'rose',
		progress: '65',
		labelOutside: 'rose',
		classes: { outside: "dark:text-white" }
	});

	$.append($$anchor, fragment);
}