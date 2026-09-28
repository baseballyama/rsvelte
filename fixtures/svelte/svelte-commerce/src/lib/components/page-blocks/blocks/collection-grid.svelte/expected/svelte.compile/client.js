import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Skeleton } from '$lib/components/ui/skeleton/index.js';
import { Button } from '$lib/components/ui/button/index.js';
import { getCollectionState } from '$lib/core/stores/collection.svelte.js';

var root = $.from_html(`<h2 class="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl"> </h2> <div class="mx-auto mt-2 h-1 w-12 bg-primary md:mx-0"></div>`, 1);
var root_1 = $.from_html(`<p class="mt-4 text-sm font-medium text-muted-foreground"> </p>`);
var root_2 = $.from_svg(` <svg xmlns="http://www.w3.org/2000/svg" class="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`, 1);
var root_3 = $.from_html(`<div class="mb-6 flex flex-col items-center justify-between gap-6 md:flex-row md:items-end"><div class="text-center md:text-left"><!> <!></div> <!></div>`);
var root_4 = $.from_html(`<div class="flex items-center justify-center"><img class="h-full object-contain" alt=""/></div>`);
var root_5 = $.from_html(`<div class="w-full py-8"><!> <div class="intra-gap grid"></div></div>`);

export default function Collection_grid($$anchor, $$props) {
	$.push($$props, true);

	const $$d = $.derived(() => $$props.block.metadata.aspectRatio?.split(':') || ['1', '1']),
		$$array = $.derived(() => $.to_array($.get($$d), 2)),
		aspectWidth = $.derived(() => $.get($$array)[0]),
		aspectHeight = $.derived(() => $.get($$array)[1]);

	const collectionState = getCollectionState();
	var div = root_5();
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
						let $0 = $.derived(() => $$props.block.metadata.redirectsTo || '/products');

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

	$.each(div_3, 21, () => $$props.block.metadata.collectionIds || [], $.index, ($$anchor, id) => {
		const collection = $.derived(() => collectionState.getOneById($.get(id)));
		var fragment_3 = $.comment();
		var node_4 = $.first_child(fragment_3);

		{
			var consequent_4 = ($$anchor) => {
				Skeleton($$anchor, {});
			};

			var alternate = ($$anchor) => {
				var div_4 = root_4();
				var img = $.only_child(div_4);

				$.template_effect(() => {
					$.set_style(div_4, `aspect-ratio: ${$.get(aspectWidth) ?? ''}/${$.get(aspectHeight) ?? ''}; ${$$props.block.metadata.maxWidth
						? `max-width: ${$$props.block.metadata.maxWidth}px;`
						: ``}`);

					$.set_attribute(img, 'src', $.get(collection)?.img);
				});

				$.append($$anchor, div_4);
			};

			$.if(node_4, ($$render) => {
				if (collectionState.loading) $$render(consequent_4); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment_3);
	});

	$.reset(div_3);
	$.reset(div);
	$.template_effect(() => $.set_style(div_3, `grid-template-columns: repeat(${($$props.block.metadata.columnCount || 5) ?? ''}, 1fr); row-gap: ${$$props.block.metadata.gridRowGap ?? 8 ?? ''}px; column-gap: ${$$props.block.metadata.gridColumnGap ?? 8 ?? ''}px;`));
	$.append($$anchor, div);
	$.pop();
}