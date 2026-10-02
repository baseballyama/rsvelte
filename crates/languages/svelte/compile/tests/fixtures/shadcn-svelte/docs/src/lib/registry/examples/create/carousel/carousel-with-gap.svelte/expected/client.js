import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Carousel from "$lib/registry/ui/carousel/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<span class="text-2xl font-semibold"></span>`);
var root_1 = $.from_html(`<div class="p-1"><!></div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Carousel_with_gap($$anchor) {
	Example($$anchor, {
		title: 'With Gap',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Carousel.Root, ($$anchor, Carousel_Root) => {
				Carousel_Root($$anchor, {
					class: 'mx-auto max-w-xs sm:max-w-sm',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Carousel.Content, ($$anchor, Carousel_Content) => {
							Carousel_Content($$anchor, {
								class: '-ml-1',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_2 = $.first_child(fragment_3);

									$.each(node_2, 16, () => Array(5), $.index, ($$anchor, _, index) => {
										var fragment_4 = $.comment();
										var node_3 = $.first_child(fragment_4);

										$.component(node_3, () => Carousel.Item, ($$anchor, Carousel_Item) => {
											Carousel_Item($$anchor, {
												class: 'pl-1 md:basis-1/2',
												children: ($$anchor, $$slotProps) => {
													var div = root_1();
													var node_4 = $.child(div);

													$.component(node_4, () => Card.Root, ($$anchor, Card_Root) => {
														Card_Root($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = $.comment();
																var node_5 = $.first_child(fragment_5);

																$.component(node_5, () => Card.Content, ($$anchor, Card_Content) => {
																	Card_Content($$anchor, {
																		class: 'flex aspect-square items-center justify-center p-6',
																		children: ($$anchor, $$slotProps) => {
																			var span = root();

																			span.textContent = index + 1;
																			$.append($$anchor, span);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_5);
															},
															$$slots: { default: true }
														});
													});

													$.reset(div);
													$.append($$anchor, div);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_6 = $.sibling(node_1, 2);

						$.component(node_6, () => Carousel.Previous, ($$anchor, Carousel_Previous) => {
							Carousel_Previous($$anchor, { class: 'hidden sm:inline-flex' });
						});

						var node_7 = $.sibling(node_6, 2);

						$.component(node_7, () => Carousel.Next, ($$anchor, Carousel_Next) => {
							Carousel_Next($$anchor, { class: 'hidden sm:inline-flex' });
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