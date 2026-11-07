import * as $ from 'svelte/internal/server';
import BannerBlock from './blocks/banner-block.svelte';
import CollectionCarousel from './blocks/collection-carousel.svelte';
import CollectionGrid from './blocks/collection-grid.svelte';
import Collection from './blocks/collection.svelte';
import FeaturedCategories from './blocks/featured-categories.svelte';
import FeaturedProducts from './blocks/featured-products.svelte';
import ImageBlock from './blocks/image-block.svelte';
import RichTextBlock from './blocks/rich-text-block.svelte';

export default function Blocks($$renderer, $$props) {
	let { layouts = [] } = $$props;

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(layouts);

	for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
		let layout = each_array[idx];

		$$renderer.push(`<section${$.attr_class(`${layout.metadata.isFullScreen ? 'px-3' : 'page-width'} grid ${$.stringify(layout.type)}`, 'svelte-wdq3t9')}${$.attr_style(`grid-template-columns: repeat(${$.stringify(layout.columnCount)}, 1fr); column-gap: ${$.stringify(layout.columnGap)}px; row-gap: ${$.stringify(layout.rowGap)}px;`)}><!--[-->`);

		const each_array_1 = $.ensure_array_like(layout.blocks);

		for (let idx = 0, $$length = each_array_1.length; idx < $$length; idx++) {
			let block = each_array_1[idx];
			const verticalAlign = block.metadata?.verticalAlign || 'stretch';
			const horizontalAlign = block.metadata?.horizontalAlign || 'stretch';

			$$renderer.push(`<div${$.attr_class(`${horizontalAlign === 'stretch' ? '' : 'w-fit'} ${verticalAlign === 'stretch' ? '' : 'h-fit'}`)}${$.attr_style(`grid-column-start: ${$.stringify(block.columnStart)}; grid-column-end: ${$.stringify(block.columnEnd)}; grid-row-start: ${$.stringify(block.rowStart)}; grid-row-end: ${$.stringify(block.rowEnd)}; justify-self: ${$.stringify(horizontalAlign)}; align-self: ${$.stringify(verticalAlign)}; ${block.metadata.maxHeightUnit && block.metadata.maxHeight
				? `height: ${block.metadata.maxHeight}${block.metadata.maxHeightUnit};`
				: ''}`)}>`);

			if (block.type == 'RICH_TEXT') {
				$$renderer.push('<!--[0-->');
				RichTextBlock($$renderer, { block });
			} else if (block.type == 'IMAGE') {
				$$renderer.push('<!--[1-->');
				ImageBlock($$renderer, { block });
			} else if (block.type == 'BANNER') {
				$$renderer.push('<!--[2-->');
				BannerBlock($$renderer, { block });
			} else if (block.type == 'COLLECTION') {
				$$renderer.push('<!--[3-->');
				Collection($$renderer, { block });
			} else if (block.type == 'FEATURED_CATEGORIES') {
				$$renderer.push('<!--[4-->');
				FeaturedCategories($$renderer, { block });
			} else if (block.type == 'FEATURED_PRODUCTS') {
				$$renderer.push('<!--[5-->');
				FeaturedProducts($$renderer, { block });
			} else if (block.type == 'COLLECTION_CAROUSEL') {
				$$renderer.push('<!--[6-->');
				CollectionCarousel($$renderer, { block });
			} else if (block.type == 'COLLECTION_GRID') {
				$$renderer.push('<!--[7-->');
				CollectionGrid($$renderer, { block });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></section>`);
	}

	$$renderer.push(`<!--]-->`);
}