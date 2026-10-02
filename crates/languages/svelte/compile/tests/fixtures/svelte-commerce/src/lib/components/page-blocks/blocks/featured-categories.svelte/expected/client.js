import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { categoryService } from '$lib/core/services/index.js';
import { onMount } from 'svelte';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import { Skeleton } from '$lib/components/ui/skeleton/index.js';
import { Button } from '$lib/components/ui/button/index.js';
import { toast } from '@misiki/kitcommerce-core';

var root = $.from_html(`<h2 class="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl"> </h2> <div class="mx-auto mt-2 h-1 w-12 bg-primary md:mx-0"></div>`, 1);
var root_1 = $.from_html(`<p class="mt-4 text-sm font-medium text-muted-foreground"> </p>`);
var root_2 = $.from_svg(` <svg xmlns="http://www.w3.org/2000/svg" class="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`, 1);
var root_3 = $.from_html(`<div class="mb-6 flex flex-col items-center justify-between gap-6 md:flex-row md:items-end"><div class="text-center md:text-left"><!> <!></div> <!></div>`);
var root_4 = $.from_html(`<div class="flex flex-col items-center"><!> <!></div>`);
var root_5 = $.from_html(`<span class="mt-2 px-2 text-center text-sm font-bold tracking-tight text-foreground transition-colors duration-300 lg:text-base"> </span>`);
var root_6 = $.from_html(`<a class="group flex flex-col items-center focus:outline-none"><div class="relative w-full overflow-hidden bg-muted shadow-sm transition-all duration-500 ease-out"><!></div> <!></a>`);
var root_7 = $.from_html(`<div class="w-full py-8"><!> <div class="grid gap-2"><!></div></div>`);

export default function Featured_categories($$anchor, $$props) {
	$.push($$props, true);

	let categories = $.state(null);
	let loadingForCategory = $.state(false);

	onMount(async () => {
		try {
			$.set(loadingForCategory, true);

			const res = await categoryService.fetchFeaturedCategories({ limit: $$props.block.metadata.limit || 1000 });

			$.set(categories, res?.data, true);
		} catch(e) {
			toast.error(e?.message || 'Failed to load categories');
		} finally {
			$.set(loadingForCategory, false);
		}
	});

	var div = root_7();
	var node = $.child(div);

	{
		var consequent_3 = ($$anchor) => {
			var div_1 = root_3();
			var div_2 = $.child(div_1);
			var node_1 = $.child(div_2);

			{
				var consequent = ($$anchor) => {
					var fragment = root();
					var h2 = $.first_child(fragment);
					var text = $.only_child(h2, true);

					$.next(2);
					$.template_effect(() => $.set_text(text, $$props.block.metadata.title));
					$.append($$anchor, fragment);
				};

				$.if(node_1, ($$render) => {
					if ($$props.block.metadata.title) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent_1 = ($$anchor) => {
					var p = root_1();
					var text_1 = $.only_child(p, true);

					$.template_effect(() => $.set_text(text_1, $$props.block.metadata.subtitle));
					$.append($$anchor, p);
				};

				$.if(node_2, ($$render) => {
					if ($$props.block.metadata.subtitle) $$render(consequent_1);
				});
			}

			$.reset(div_2);

			var node_3 = $.sibling(div_2, 2);

			{
				var consequent_2 = ($$anchor) => {
					{
						let $0 = $.derived(() => $$props.block.metadata.redirectsTo || '/categories');

						Button($$anchor, {
							get href() {
								return $.get($0);
							},
							class: 'group',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var fragment_2 = root_2();
								var text_2 = $.first_child(fragment_2, true);

								$.next();
								$.template_effect(() => $.set_text(text_2, $$props.block.metadata.viewMoreText));
								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					}
				};

				$.if(node_3, ($$render) => {
					if ($$props.block.metadata.showViewMore) $$render(consequent_2);
				});
			}

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($$props.block.metadata.showHeader) $$render(consequent_3);
		});
	}

	var div_3 = $.sibling(node, 2);
	var node_4 = $.child(div_3);

	{
		var consequent_4 = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_5 = $.first_child(fragment_3);

			$.each(node_5, 16, () => Array(6), $.index, ($$anchor, _) => {
				var div_4 = root_4();
				var node_6 = $.child(div_4);

				Skeleton(node_6, { class: 'aspect-square w-full' });

				var node_7 = $.sibling(node_6, 2);

				Skeleton(node_7, { class: 'mt-4 h-4 w-2/3 rounded-full' });
				$.reset(div_4);
				$.append($$anchor, div_4);
			});

			$.append($$anchor, fragment_3);
		};

		var alternate = ($$anchor) => {
			var fragment_4 = $.comment();
			var node_8 = $.first_child(fragment_4);

			$.each(node_8, 17, () => $.get(categories), ({ slug, name, link, thumbnail }) => slug, ($$anchor, $$item) => {
				let slug = () => $.get($$item).slug;
				let name = () => $.get($$item).name;
				let link = () => $.get($$item).link;
				let thumbnail = () => $.get($$item).thumbnail;
				var a = root_6();
				var div_5 = $.child(a);
				var node_9 = $.child(div_5);

				{
					let $0 = $.derived(() => thumbnail() || '');

					LazyImg(node_9, {
						get src() {
							return $.get($0);
						},

						get aspectRatio() {
							return $$props.block.metadata.aspectRatio;
						},

						get alt() {
							return name();
						},
						class: 'h-full w-full object-contain transition-transform duration-700 ease-in-out'
					});
				}

				$.reset(div_5);

				var node_10 = $.sibling(div_5, 2);

				{
					var consequent_5 = ($$anchor) => {
						var span = root_5();
						var text_3 = $.only_child(span, true);

						$.template_effect(() => $.set_text(text_3, name()));
						$.append($$anchor, span);
					};

					$.if(node_10, ($$render) => {
						if (!$$props.block?.metadata?.hideCategoryName) $$render(consequent_5);
					});
				}

				$.reset(a);
				$.template_effect(() => $.set_attribute(a, 'href', link() ? link() : slug() ? `/${slug()}` : `/products`));
				$.append($$anchor, a);
			});

			$.append($$anchor, fragment_4);
		};

		$.if(node_4, ($$render) => {
			if ($.get(loadingForCategory)) $$render(consequent_4); else $$render(alternate, -1);
		});
	}

	$.reset(div_3);
	$.reset(div);
	$.template_effect(() => $.set_style(div_3, `grid-template-columns: repeat(${($$props.block.metadata.columnCount || 5) ?? ''}, 1fr); row-gap: ${$$props.block.metadata.gridRowGap ?? 8 ?? ''}px; column-gap: ${$$props.block.metadata.gridColumnGap ?? 8 ?? ''}px;`));
	$.append($$anchor, div);
	$.pop();
}