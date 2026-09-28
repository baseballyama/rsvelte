import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Clipboard, Input, Tooltip, Modal, Button, Label } from "flowbite-svelte";
import { CheckOutline, ClipboardCleanSolid, ShareNodesOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> Share course`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Modal_1($$anchor) {
	let value = $.state("npm install flowbite-svelte");
	let copyModal = $.state(false);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Button(node, {
		color: 'alternative',
		onclick: () => $.set(copyModal, true),
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			ShareNodesOutline(node_1, { class: 'me-2' });
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	{
		const footer = ($$anchor) => {
			Button($$anchor, {
				onclick: () => $.set(copyModal, false),
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Close');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		};

		Modal(node_2, {
			title: 'Share course',
			autoclose: true,
			class: 'divide-y-0',
			classes: {
				header: "text-lg text-gray-500 dark:text-gray-400",
				footer: "px-5 pb-5"
			},

			get open() {
				return $.get(copyModal);
			},

			set open($$value) {
				$.set(copyModal, $$value, true);
			},
			footer,
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root_1();
				var node_3 = $.first_child(fragment_3);

				Label(node_3, {
					for: 'course-url',
					class: 'mb-2 block text-sm font-medium',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Share the course link below with your friends:');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_3, 2);

				{
					const right = ($$anchor) => {
						{
							const children = ($$anchor, success = $.noop) => {
								var fragment_5 = root_1();
								var node_5 = $.first_child(fragment_5);

								Tooltip(node_5, {
									get isOpen() {
										return success();
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text();

										$.template_effect(() => $.set_text(text_2, success() ? "Copied" : "Copy to clipboard"));
										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});

								var node_6 = $.sibling(node_5, 2);

								{
									var consequent = ($$anchor) => {
										CheckOutline($$anchor, {});
									};

									var alternate = ($$anchor) => {
										ClipboardCleanSolid($$anchor, {});
									};

									$.if(node_6, ($$render) => {
										if (success()) $$render(consequent); else $$render(alternate, -1);
									});
								}

								$.append($$anchor, fragment_5);
							};

							Clipboard($$anchor, {
								embedded: true,
								get value() {
									return $.get(value);
								},

								set value($$value) {
									$.set(value, $$value, true);
								},
								children,
								$$slots: { default: true }
							});
						}
					};

					Input(node_4, {
						id: 'course-url',
						get value() {
							return $.get(value);
						},

						set value($$value) {
							$.set(value, $$value, true);
						},
						right,
						$$slots: { right: true }
					});
				}

				$.append($$anchor, fragment_3);
			},
			$$slots: { footer: true, default: true }
		});
	}

	$.append($$anchor, fragment);
}