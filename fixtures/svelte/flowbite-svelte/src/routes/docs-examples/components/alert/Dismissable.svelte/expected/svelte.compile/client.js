import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Alert } from "flowbite-svelte";
import { InfoCircleSolid, EnvelopeSolid } from "flowbite-svelte-icons";
import { fly } from "svelte/transition";

var root = $.from_html(`A simple default alert with an <a href="/" class="font-semibold underline hover:text-blue-800 dark:hover:text-blue-900">example link</a> . Give it a click if you like.`, 1);
var root_1 = $.from_html(`A simple info alert with an <a href="/" class="font-semibold underline hover:text-blue-800 dark:hover:text-blue-900">example link</a> . Give it a click if you like.`, 1);
var root_2 = $.from_html(`A simple info alert with an <a href="/" class="font-semibold underline hover:text-red-800 dark:hover:text-red-900">example link</a> . Give it a click if you like.`, 1);
var root_3 = $.from_html(`A simple info alert with an <a href="/" class="font-semibold underline hover:text-green-800 dark:hover:text-green-900">example link</a> . Give it a click if you like.`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Dismissable($$anchor) {
	var fragment = root_4();
	var node = $.first_child(fragment);

	{
		const icon = ($$anchor) => {
			InfoCircleSolid($$anchor, { class: 'h-5 w-5' });
		};

		Alert(node, {
			dismissable: true,
			icon,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var fragment_2 = root();

				$.next(2);
				$.append($$anchor, fragment_2);
			},
			$$slots: { icon: true, default: true }
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		const icon = ($$anchor) => {
			InfoCircleSolid($$anchor, { class: 'h-5 w-5' });
		};

		Alert(node_1, {
			color: 'blue',
			dismissable: true,
			icon,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var fragment_4 = root_1();

				$.next(2);
				$.append($$anchor, fragment_4);
			},
			$$slots: { icon: true, default: true }
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		const icon = ($$anchor) => {
			InfoCircleSolid($$anchor, { class: 'h-5 w-5' });
		};

		Alert(node_2, {
			color: 'red',
			dismissable: true,
			icon,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var fragment_6 = root_2();

				$.next(2);
				$.append($$anchor, fragment_6);
			},
			$$slots: { icon: true, default: true }
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		const icon = ($$anchor) => {
			InfoCircleSolid($$anchor, { class: 'h-5 w-5' });
		};

		Alert(node_3, {
			color: 'green',
			dismissable: true,
			icon,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var fragment_8 = root_3();

				$.next(2);
				$.append($$anchor, fragment_8);
			},
			$$slots: { icon: true, default: true }
		});
	}

	var node_4 = $.sibling(node_3, 2);

	{
		const icon = ($$anchor) => {
			InfoCircleSolid($$anchor, { class: 'h-5 w-5' });
		};

		Alert(node_4, {
			color: 'yellow',
			dismissable: true,
			get transition() {
				return fly;
			},
			params: { x: 200 },
			icon,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text('An alert with non default animation - fly away.');

				$.append($$anchor, text);
			},
			$$slots: { icon: true, default: true }
		});
	}

	var node_5 = $.sibling(node_4, 2);

	{
		const icon = ($$anchor) => {
			InfoCircleSolid($$anchor, { class: 'h-5 w-5' });
		};

		Alert(node_5, {
			color: 'purple',
			dismissable: true,
			get closeIcon() {
				return EnvelopeSolid;
			},
			icon,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text('An alert with the custom dismissal button. slot');

				$.append($$anchor, text_1);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$.append($$anchor, fragment);
}