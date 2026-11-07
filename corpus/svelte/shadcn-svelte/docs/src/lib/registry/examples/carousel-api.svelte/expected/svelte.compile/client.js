import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Carousel from "$lib/registry/ui/carousel/index.js";

var root = $.from_html(`<span class="text-4xl font-semibold"></span>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div><!> <div class="py-2 text-center text-sm text-muted-foreground"> </div></div>`);

export default function Carousel_api($$anchor, $$props) {
	$.push($$props, true);

	let api = $.state(void 0);
	const count = $.derived(() => $.get(api) ? $.get(api).scrollSnapList().length : 0);
	let current = $.state(0);

	$.user_effect(() => {
		if ($.get(api)) {
			$.set(current, $.get(api).selectedScrollSnap() + 1);

			$.get(api).on("select", () => {
				$.set(current, $.get(api).selectedScrollSnap() + 1);
			});
		}
	});

	var div = root_2();
	var node = $.child(div);

	$.component(node, () => Carousel.Root, ($$anchor, Carousel_Root) => {
		Carousel_Root($$anchor, {
			setApi: (emblaApi) => $.set(api, emblaApi, true),
			class: 'w-full max-w-xs',
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Carousel.Content, ($$anchor, Carousel_Content) => {
					Carousel_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_2 = $.first_child(fragment_1);

							$.each(node_2, 16, () => Array(5), $.index, ($$anchor, _, i) => {
								var fragment_2 = $.comment();
								var node_3 = $.first_child(fragment_2);

								$.component(node_3, () => Carousel.Item, ($$anchor, Carousel_Item) => {
									Carousel_Item($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = $.comment();
											var node_4 = $.first_child(fragment_3);

											$.component(node_4, () => Card.Root, ($$anchor, Card_Root) => {
												Card_Root($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_4 = $.comment();
														var node_5 = $.first_child(fragment_4);

														$.component(node_5, () => Card.Content, ($$anchor, Card_Content) => {
															Card_Content($$anchor, {
																class: 'flex aspect-square items-center justify-center p-6',
																children: ($$anchor, $$slotProps) => {
																	var span = root();

																	span.textContent = i + 1;
																	$.append($$anchor, span);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_4);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_3);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_2);
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_6 = $.sibling(node_1, 2);

				$.component(node_6, () => Carousel.Previous, ($$anchor, Carousel_Previous) => {
					Carousel_Previous($$anchor, {});
				});

				var node_7 = $.sibling(node_6, 2);

				$.component(node_7, () => Carousel.Next, ($$anchor, Carousel_Next) => {
					Carousel_Next($$anchor, {});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var div_1 = $.sibling(node, 2);
	var text = $.only_child(div_1);

	$.reset(div);
	$.template_effect(() => $.set_text(text, `Slide ${$.get(current) ?? ''} of ${$.get(count) ?? ''}`));
	$.append($$anchor, div);
	$.pop();
}