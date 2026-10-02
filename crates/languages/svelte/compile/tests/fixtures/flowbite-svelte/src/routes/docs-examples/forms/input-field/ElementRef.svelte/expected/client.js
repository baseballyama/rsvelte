import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Modal, Input, Label } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Totam cumque quisquam dolores doloribus. Aperiam perferendis quod ea repudiandae odit libero tempore error?</p> <form><div class="mb-6 grid gap-6 md:grid-cols-2"><div><!> <!></div> <div><!> <!></div> <div><!> <!></div> <div><!> <!></div></div></form>`, 1);

export default function ElementRef($$anchor) {
	let defaultModal = $.state(false);
	let elementRef = $.state(void 0);

	const handleClick = () => {
		$.set(defaultModal, true);
		$.get(elementRef)?.focus();
	};

	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		onclick: handleClick,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Default modal');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	{
		const header = ($$anchor) => {
			$.next();

			var text_1 = $.text('Form title');

			$.append($$anchor, text_1);
		};

		const footer = ($$anchor) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			Button(node_2, {
				onclick: () => alert("Handle submit"),
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Submit');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Button(node_3, {
				color: 'alternative',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Cancel');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		};

		Modal(node_1, {
			dismissable: false,
			get open() {
				return $.get(defaultModal);
			},

			set open($$value) {
				$.set(defaultModal, $$value, true);
			},
			header,
			footer,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_1();
				var form = $.sibling($.first_child(fragment_2), 2);
				var div = $.child(form);
				var div_1 = $.child(div);
				var node_4 = $.child(div_1);

				Label(node_4, {
					for: 'first_name',
					class: 'mb-2',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('First name');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node_4, 2);

				Input(node_5, {
					type: 'text',
					id: 'first_name',
					placeholder: 'John',
					required: true,
					get elementRef() {
						return $.get(elementRef);
					},

					set elementRef($$value) {
						$.set(elementRef, $$value, true);
					}
				});

				$.reset(div_1);

				var div_2 = $.sibling(div_1, 2);
				var node_6 = $.child(div_2);

				Label(node_6, {
					for: 'last_name',
					class: 'mb-2',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Last name');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				var node_7 = $.sibling(node_6, 2);

				Input(node_7, {
					type: 'text',
					id: 'last_name',
					placeholder: 'Doe',
					required: true
				});

				$.reset(div_2);

				var div_3 = $.sibling(div_2, 2);
				var node_8 = $.child(div_3);

				Label(node_8, {
					for: 'company',
					class: 'mb-2',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text('Company');

						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});

				var node_9 = $.sibling(node_8, 2);

				Input(node_9, {
					type: 'text',
					id: 'company',
					placeholder: 'Flowbite',
					required: true
				});

				$.reset(div_3);

				var div_4 = $.sibling(div_3, 2);
				var node_10 = $.child(div_4);

				Label(node_10, {
					for: 'phone',
					class: 'mb-2',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text('Phone number');

						$.append($$anchor, text_7);
					},
					$$slots: { default: true }
				});

				var node_11 = $.sibling(node_10, 2);

				Input(node_11, {
					type: 'tel',
					id: 'phone',
					placeholder: '123-45-678',
					pattern: "[0-9]{3}-[0-9]{2}-[0-9]{3}",
					required: true
				});

				$.reset(div_4);
				$.reset(div);
				$.reset(form);
				$.append($$anchor, fragment_2);
			},
			$$slots: { header: true, footer: true, default: true }
		});
	}

	$.append($$anchor, fragment);
}