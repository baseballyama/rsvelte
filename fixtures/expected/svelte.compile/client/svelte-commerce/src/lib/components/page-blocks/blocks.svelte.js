import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BannerBlock from './blocks/banner-block.svelte';
import CollectionCarousel from './blocks/collection-carousel.svelte';
import CollectionGrid from './blocks/collection-grid.svelte';
import Collection from './blocks/collection.svelte';
import FeaturedCategories from './blocks/featured-categories.svelte';
import FeaturedProducts from './blocks/featured-products.svelte';
import ImageBlock from './blocks/image-block.svelte';
import RichTextBlock from './blocks/rich-text-block.svelte';

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<section></section>`);

export default function Blocks($$anchor, $$props) {
	let layouts = $.prop($$props, 'layouts', 19, () => []);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, layouts, $.index, ($$anchor, layout) => {
		var section = root_1();

		$.each(section, 23, () => $.get(layout).blocks, (block) => block.id, ($$anchor, block, idx, $$array) => {
			const verticalAlign = $.derived(() => $.get(block).metadata?.verticalAlign || 'stretch');
			const horizontalAlign = $.derived(() => $.get(block).metadata?.horizontalAlign || 'stretch');
			var div = root();
			var node_1 = $.child(div);

			{
				var consequent = ($$anchor) => {
					RichTextBlock($$anchor, {
						get block() {
							return $.get(block);
						}
					});
				};

				var consequent_1 = ($$anchor) => {
					ImageBlock($$anchor, {
						get block() {
							return $.get(block);
						}
					});
				};

				var consequent_2 = ($$anchor) => {
					BannerBlock($$anchor, {
						get block() {
							return $.get(block);
						}
					});
				};

				var consequent_3 = ($$anchor) => {
					Collection($$anchor, {
						get block() {
							return $.get(block);
						}
					});
				};

				var consequent_4 = ($$anchor) => {
					FeaturedCategories($$anchor, {
						get block() {
							return $.get(block);
						}
					});
				};

				var consequent_5 = ($$anchor) => {
					FeaturedProducts($$anchor, {
						get block() {
							return $.get(block);
						}
					});
				};

				var consequent_6 = ($$anchor) => {
					CollectionCarousel($$anchor, {
						get block() {
							return $.get(block);
						}
					});
				};

				var consequent_7 = ($$anchor) => {
					CollectionGrid($$anchor, {
						get block() {
							return $.get(block);
						}
					});
				};

				$.if(node_1, ($$render) => {
					if ($.get(block).type == 'RICH_TEXT') $$render(consequent); else if ($.get(block).type == 'IMAGE') $$render(consequent_1, 1); else if ($.get(block).type == 'BANNER') $$render(consequent_2, 2); else if ($.get(block).type == 'COLLECTION') $$render(consequent_3, 3); else if ($.get(block).type == 'FEATURED_CATEGORIES') $$render(consequent_4, 4); else if ($.get(block).type == 'FEATURED_PRODUCTS') $$render(consequent_5, 5); else if ($.get(block).type == 'COLLECTION_CAROUSEL') $$render(consequent_6, 6); else if ($.get(block).type == 'COLLECTION_GRID') $$render(consequent_7, 7);
				});
			}

			$.reset(div);

			$.template_effect(() => {
				$.set_class(div, 1, `${$.get(horizontalAlign) === 'stretch' ? '' : 'w-fit'} ${$.get(verticalAlign) === 'stretch' ? '' : 'h-fit'}`);

				$.set_style(div, `grid-column-start: ${$.get(block).columnStart ?? ''}; grid-column-end: ${$.get(block).columnEnd ?? ''}; grid-row-start: ${$.get(block).rowStart ?? ''}; grid-row-end: ${$.get(block).rowEnd ?? ''}; justify-self: ${$.get(horizontalAlign) ?? ''}; align-self: ${$.get(verticalAlign) ?? ''}; ${$.get(block).metadata.maxHeightUnit && $.get(block).metadata.maxHeight
					? `height: ${$.get(block).metadata.maxHeight}${$.get(block).metadata.maxHeightUnit};`
					: ''}`);
			});

			$.append($$anchor, div);
		});

		$.reset(section);

		$.template_effect(() => {
			$.set_class(section, 1, `${$.get(layout).metadata.isFullScreen ? 'px-3' : 'page-width'} grid ${$.get(layout).type ?? ''}`, 'svelte-wdq3t9');
			$.set_style(section, `grid-template-columns: repeat(${$.get(layout).columnCount ?? ''}, 1fr); column-gap: ${$.get(layout).columnGap ?? ''}px; row-gap: ${$.get(layout).rowGap ?? ''}px;`);
		});

		$.append($$anchor, section);
	});

	$.append($$anchor, fragment);
}