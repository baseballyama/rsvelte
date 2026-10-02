import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Alert } from "flowbite-svelte";
import { InfoCircleSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<span class="font-medium">Default alert!</span> Change a few things up and try submitting again.`, 1);
var root_1 = $.from_html(`<span class="font-medium">Info alert!</span> Change a few things up and try submitting again.`, 1);
var root_2 = $.from_html(`<span class="font-medium">Danger alert!</span> Change a few things up and try submitting again.`, 1);
var root_3 = $.from_html(`<span class="font-medium">Success alert!</span> Change a few things up and try submitting again.`, 1);
var root_4 = $.from_html(`<span class="font-medium">Warning alert!</span> Change a few things up and try submitting again.`, 1);
var root_5 = $.from_html(`<span class="font-medium">Dark alert!</span> Change a few things up and try submitting again.`, 1);
var root_6 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Icon($$anchor) {
	var fragment = root_6();
	var node = $.first_child(fragment);

	{
		const icon = ($$anchor) => {
			InfoCircleSolid($$anchor, { class: 'h-5 w-5' });
		};

		Alert(node, {
			icon,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();

				$.next();
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
			icon,
			children: ($$anchor, $$slotProps) => {
				var fragment_4 = root_1();

				$.next();
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
			icon,
			children: ($$anchor, $$slotProps) => {
				var fragment_6 = root_2();

				$.next();
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
			icon,
			children: ($$anchor, $$slotProps) => {
				var fragment_8 = root_3();

				$.next();
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
			icon,
			children: ($$anchor, $$slotProps) => {
				var fragment_10 = root_4();

				$.next();
				$.append($$anchor, fragment_10);
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
			color: 'secondary',
			icon,
			children: ($$anchor, $$slotProps) => {
				var fragment_12 = root_5();

				$.next();
				$.append($$anchor, fragment_12);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$.append($$anchor, fragment);
}