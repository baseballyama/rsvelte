import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label, Input, CloseButton } from "flowbite-svelte";
import { EnvelopeSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<div>Small input - left icon</div> <!>`, 1);
var root_1 = $.from_html(`<div>Default input - right icon</div> <!>`, 1);
var root_2 = $.from_html(`<div>Large input - both icons</div> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Icon($$anchor) {
	var fragment = root_3();
	var node = $.first_child(fragment);

	Label(node, {
		class: 'space-y-2',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.sibling($.first_child(fragment_1), 2);

			{
				const left = ($$anchor) => {
					EnvelopeSolid($$anchor, { class: 'h-4 w-4' });
				};

				Input(node_1, {
					type: 'email',
					placeholder: 'name@flowbite.com',
					size: 'sm',
					class: 'ps-8',
					left,
					$$slots: { left: true }
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	Label(node_2, {
		class: 'space-y-2',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_1();
			var node_3 = $.sibling($.first_child(fragment_3), 2);

			{
				const left = ($$anchor) => {
					EnvelopeSolid($$anchor, { class: 'h-5 w-5' });
				};

				Input(node_3, {
					type: 'email',
					placeholder: 'name@flowbite.com',
					size: 'md',
					class: 'ps-9',
					left,
					$$slots: { left: true }
				});
			}

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_2, 2);

	Label(node_4, {
		class: 'space-y-2',
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_2();
			var node_5 = $.sibling($.first_child(fragment_5), 2);

			{
				const left = ($$anchor) => {
					EnvelopeSolid($$anchor, { class: 'h-6 w-6' });
				};

				const right = ($$anchor) => {
					CloseButton($$anchor, {});
				};

				Input(node_5, {
					type: 'email',
					placeholder: 'name@flowbite.com',
					size: 'lg',
					class: 'ps-11',
					left,
					right,
					$$slots: { left: true, right: true }
				});
			}

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}