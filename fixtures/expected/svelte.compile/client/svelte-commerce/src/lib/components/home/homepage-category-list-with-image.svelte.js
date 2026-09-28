import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import { Skeleton } from '$lib/components/ui/skeleton';
import { Button } from '$lib/components/ui/button';

var root = $.from_svg(`View all categories <svg xmlns="http://www.w3.org/2000/svg" class="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col items-center"><!> <!></div>`);
var root_2 = $.from_html(`<a class="group flex flex-col items-center focus:outline-none"><div class="relative aspect-square w-full overflow-hidden bg-red-200 bg-muted shadow-sm transition-all duration-500 ease-out"><!></div> <span class="mt-2 px-2 text-center text-sm font-bold tracking-tight text-foreground transition-colors duration-300 lg:text-base"> </span></a>`);
var root_3 = $.from_html(`<div class="py-8 w-full"><div class="mb-6 flex flex-col items-center justify-between gap-6 md:flex-row md:items-end"><div class="text-center md:text-left"><h2 class="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl">Top Categories</h2> <div class="mx-auto mt-2 h-1 w-12 bg-primary md:mx-0"></div> <p class="mt-4 text-sm font-medium text-muted-foreground">Discover our curated range of products by category</p></div> <!></div> <div class="grid grid-cols-2 gap-2 px-2 mobiles:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6"><!></div></div>`);

export default function Homepage_category_list_with_image($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var div = root_3();
			var div_1 = $.child(div);
			var node_1 = $.sibling($.child(div_1), 2);

			Button(node_1, {
				href: '/categories',
				class: 'group',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_1 = root();

					$.next();
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var node_2 = $.child(div_2);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_3 = $.first_child(fragment_2);

					$.each(node_3, 16, () => Array(6), $.index, ($$anchor, _) => {
						var div_3 = root_1();
						var node_4 = $.child(div_3);

						Skeleton(node_4, { class: 'aspect-square w-full' });

						var node_5 = $.sibling(node_4, 2);

						Skeleton(node_5, { class: 'mt-4 h-4 w-2/3 rounded-full' });
						$.reset(div_3);
						$.append($$anchor, div_3);
					});

					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var fragment_3 = $.comment();
					var node_6 = $.first_child(fragment_3);

					$.each(
						node_6,
						17,
						() => $$props.categories,
						(
							{ slug, icon, color, name, link, thumbnail, parentCategoryId }
						) => slug,
						($$anchor, $$item) => {
							let slug = () => $.get($$item).slug;
							let icon = () => $.get($$item).icon;
							let color = () => $.get($$item).color;
							let name = () => $.get($$item).name;
							let link = () => $.get($$item).link;
							let thumbnail = () => $.get($$item).thumbnail;
							let parentCategoryId = () => $.get($$item).parentCategoryId;
							var a = root_2();
							var div_4 = $.child(a);
							var node_7 = $.child(div_4);

							LazyImg(node_7, {
								get src() {
									return thumbnail();
								},

								get alt() {
									return name();
								},
								class: 'h-full w-full object-cover transition-transform duration-700 ease-in-out'
							});

							$.reset(div_4);

							var span = $.sibling(div_4, 2);
							var text = $.only_child(span, true);

							$.reset(a);

							$.template_effect(() => {
								$.set_attribute(a, 'href', link() ? link() : slug() ? `/${slug()}` : `/products`);
								$.set_text(text, name());
							});

							$.append($$anchor, a);
						}
					);

					$.append($$anchor, fragment_3);
				};

				$.if(node_2, ($$render) => {
					if ($$props.loading) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(div_2);
			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.categories?.length) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}