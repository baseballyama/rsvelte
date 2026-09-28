import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Button from "$lib/registry/ui/button/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> Button`, 1);
var root_2 = $.from_html(`<div class="inse.t-0 absolute z-30 aspect-video bg-primary opacity-50 mix-blend-color"></div> <img src="https://images.unsplash.com/photo-1604076850742-4c7221f3101b?q=80&amp;w=1887&amp;auto=format&amp;fit=crop&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="by mymind on Unsplash" class="relative z-20 aspect-video w-full object-cover brightness-60 grayscale"/> <!> <!>`, 1);

export default function Card_with_image_small($$anchor) {
	Example($$anchor, {
		title: 'With Image (Small)',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					size: 'sm',
					class: 'relative mx-auto w-full max-w-sm pt-0',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_1 = $.sibling($.first_child(fragment_2), 4);

						$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
							Card_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
										Card_Title($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Beautiful Landscape');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
										Card_Description($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('A stunning view that captures the essence of natural beauty.');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_1, 2);

						$.component(node_4, () => Card.Footer, ($$anchor, Card_Footer) => {
							Card_Footer($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_5 = $.first_child(fragment_4);

									$.component(node_5, () => Button.Root, ($$anchor, Button_Root) => {
										Button_Root($$anchor, {
											size: 'sm',
											class: 'w-full',
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root_1();
												var node_6 = $.first_child(fragment_5);

												IconPlaceholder(node_6, {
													lucide: 'PlusIcon',
													tabler: 'IconPlus',
													hugeicons: 'Add01Icon',
													phosphor: 'PlusIcon',
													remixicon: 'RiAddLine',
													'data-icon': 'inline-start'
												});

												$.next();
												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}