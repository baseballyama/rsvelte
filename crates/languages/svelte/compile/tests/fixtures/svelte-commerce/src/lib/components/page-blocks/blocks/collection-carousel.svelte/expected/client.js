import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Product from '$lib/components/product-catalogue/product-card.svelte';
import { Carousel, CarouselContent, CarouselItem } from '$lib/components/ui/carousel/index.js';
import CarouselPrevious from '$lib/components/ui/carousel/carousel-previous.svelte';
import CarouselNext from '$lib/components/ui/carousel/carousel-next.svelte';
import { getCollectionState } from '$lib/core/stores/collection.svelte.js';
import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

var root = $.from_html(`<h2 class="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl"> </h2> <div class="mx-auto mt-2 h-1 w-12 bg-primary md:mx-0"></div>`, 1);
var root_1 = $.from_html(`<p class="mt-4 text-sm font-medium text-muted-foreground"> </p>`);
var root_2 = $.from_html(`<div class="mb-6 text-center md:text-left"><!> <!></div>`);
var root_3 = $.from_html(`<div class="h-full"><!></div>`);
var root_4 = $.from_html(`<div class="absolute -right-2 -top-20 hidden items-center gap-2 md:flex"><!> <!></div>`);
var root_5 = $.from_html(`<!> <!>`, 1);
var root_6 = $.from_html(`<div class="mx-auto w-full"><!> <div class="relative"><!></div></div>`);
var root_7 = $.from_html(`<div class="w-full"><!></div>`);

export default function Collection_carousel($$anchor, $$props) {
	$.push($$props, true);

	const collectionState = getCollectionState();
	const collection = $.derived(() => collectionState.getOneById($$props.block.entityId));

	const flexBasis = $.derived(() => {
		const x = 1 / ($$props.block.metadata.viewCount || 6);

		return x * 100;
	});

	var div = root_7();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			Skeleton($$anchor, {});
		};

		var alternate = ($$anchor) => {
			var div_1 = root_6();
			var node_1 = $.child(div_1);

			{
				var consequent_3 = ($$anchor) => {
					var div_2 = root_2();
					var node_2 = $.child(div_2);

					{
						var consequent_1 = ($$anchor) => {
							var fragment_1 = root();
							var h2 = $.first_child(fragment_1);
							var text = $.only_child(h2, true);

							$.next(2);
							$.template_effect(() => $.set_text(text, $.get(collection).name));
							$.append($$anchor, fragment_1);
						};

						$.if(node_2, ($$render) => {
							if ($.get(collection).name) $$render(consequent_1);
						});
					}

					var node_3 = $.sibling(node_2, 2);

					{
						var consequent_2 = ($$anchor) => {
							var p = root_1();
							var text_1 = $.only_child(p, true);

							$.template_effect(() => $.set_text(text_1, $.get(collection).subTitle));
							$.append($$anchor, p);
						};

						$.if(node_3, ($$render) => {
							if ($.get(collection).subTitle) $$render(consequent_2);
						});
					}

					$.reset(div_2);
					$.append($$anchor, div_2);
				};

				$.if(node_1, ($$render) => {
					if ($$props.block.metadata.showHeader) $$render(consequent_3);
				});
			}

			var div_3 = $.sibling(node_1, 2);
			var node_4 = $.child(div_3);

			Carousel(node_4, {
				opts: { align: 'start', loop: true },
				class: 'w-full',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_5();
					var node_5 = $.first_child(fragment_2);

					CarouselContent(node_5, {
						class: '-ml-1',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_6 = $.first_child(fragment_3);

							$.each(node_6, 17, () => $.get(collection)?.collectionvalues, (prod) => prod?.id, ($$anchor, prod) => {
								var fragment_4 = $.comment();
								var node_7 = $.first_child(fragment_4);

								{
									var consequent_4 = ($$anchor) => {
										{
											let $0 = $.derived(() => $.get(flexBasis));
											let $1 = $.derived(() => $$props.block.metadata.gridColumnGap ?? 4);

											CarouselItem($$anchor, {
												get style() {
													return `flex-basis: ${$.get($0) ?? ''}%; padding-left: ${$.get($1) ?? ''}px;`;
												},

												children: ($$anchor, $$slotProps) => {
													var div_4 = root_3();
													var node_8 = $.child(div_4);

													{
														let $0 = $.derived(() => !$$props.block.metadata.showCartControls);

														Product(node_8, {
															get hideCartControls() {
																return $.get($0);
															},

															get product() {
																return $.get(prod).products;
															}
														});
													}

													$.reset(div_4);
													$.append($$anchor, div_4);
												},
												$$slots: { default: true }
											});
										}
									};

									$.if(node_7, ($$render) => {
										if ($.get(prod)?.products) $$render(consequent_4);
									});
								}

								$.append($$anchor, fragment_4);
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_5, 2);

					{
						var consequent_5 = ($$anchor) => {
							var div_5 = root_4();
							var node_10 = $.child(div_5);

							CarouselPrevious(node_10, { class: 'static translate-y-0' });

							var node_11 = $.sibling(node_10, 2);

							CarouselNext(node_11, { class: 'static translate-y-0' });
							$.reset(div_5);
							$.append($$anchor, div_5);
						};

						$.if(node_9, ($$render) => {
							if ($$props.block.metadata.showHeader) $$render(consequent_5);
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.reset(div_3);
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (!$.get(collection) || collectionState.loading) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}