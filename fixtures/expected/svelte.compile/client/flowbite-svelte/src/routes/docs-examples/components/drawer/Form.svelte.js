import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Avatar,
	Drawer,
	CardPlaceholder,
	Button,
	Label,
	Input,
	Textarea
} from "flowbite-svelte";

import { InfoCircleSolid, UserAddOutline, CalendarEditSolid } from "flowbite-svelte-icons";

var root = $.from_html(`Title <!>`, 1);
var root_1 = $.from_html(`Description <!>`, 1);
var root_2 = $.from_html(`<!>Add`, 1);
var root_3 = $.from_html(`<!> Create event`, 1);
var root_4 = $.from_html(`<h5 class="mb-6 inline-flex items-center text-base font-semibold text-gray-500 uppercase dark:text-gray-400"><!>New event</h5> <!> <!> <!> <!> <div class="mb-4 flex"><!> <!> <!> <!></div> <!>`, 1);
var root_5 = $.from_html(`<div class="text-center"><!> <!></div> <!>`, 1);

export default function Form($$anchor) {
	let open4 = $.state(false);
	var fragment = root_5();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Button(node, {
		onclick: () => $.set(open4, true),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Show drawer form');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	CardPlaceholder(node_1, { size: '2xl', class: 'mt-6' });
	$.reset(div);

	var node_2 = $.sibling(div, 2);

	Drawer(node_2, {
		form: true,
		classes: { form: "space-y-6 mb-6" },
		get open() {
			return $.get(open4);
		},

		set open($$value) {
			$.set(open4, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_4();
			var h5 = $.first_child(fragment_1);
			var node_3 = $.child(h5);

			InfoCircleSolid(node_3, { class: 'me-2.5 h-5 w-5' });
			$.next();
			$.reset(h5);

			var node_4 = $.sibling(h5, 2);

			Label(node_4, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_2 = root();
					var node_5 = $.sibling($.first_child(fragment_2));

					Input(node_5, {
						name: 'title',
						class: 'mt-2',
						required: true,
						placeholder: 'Apple Keynote'
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_4, 2);

			Label(node_6, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_3 = root_1();
					var node_7 = $.sibling($.first_child(fragment_3));

					Textarea(node_7, {
						placeholder: 'Write event description...',
						rows: 4,
						name: 'message',
						class: 'mt-2 w-full font-normal'
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_6, 2);

			Input(node_8, { name: 'date', required: true, type: 'date' });

			var node_9 = $.sibling(node_8, 2);

			{
				const right = ($$anchor) => {
					Button($$anchor, {
						size: 'xs',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_2();
							var node_10 = $.first_child(fragment_5);

							UserAddOutline(node_10, { class: 'me-1.5 h-4 w-4 text-white' });
							$.next();
							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				};

				Input(node_9, {
					placeholder: 'Add guest email',
					right,
					$$slots: { right: true }
				});
			}

			var div_1 = $.sibling(node_9, 2);
			var node_11 = $.child(div_1);

			Avatar(node_11, {
				src: '/images/profile-picture-1.webp',
				stacked: true,
				size: 'sm'
			});

			var node_12 = $.sibling(node_11, 2);

			Avatar(node_12, {
				src: '/images/profile-picture-2.webp',
				stacked: true,
				size: 'sm'
			});

			var node_13 = $.sibling(node_12, 2);

			Avatar(node_13, {
				src: '/images/profile-picture-3.webp',
				stacked: true,
				size: 'sm'
			});

			var node_14 = $.sibling(node_13, 2);

			Avatar(node_14, {
				src: '/images/profile-picture-4.webp',
				stacked: true,
				size: 'sm'
			});

			$.reset(div_1);

			var node_15 = $.sibling(div_1, 2);

			Button(node_15, {
				type: 'submit',
				class: 'w-full',
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root_3();
					var node_16 = $.first_child(fragment_6);

					CalendarEditSolid(node_16, { class: 'me-2.5 h-3.5 w-3.5 text-white' });
					$.next();
					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}