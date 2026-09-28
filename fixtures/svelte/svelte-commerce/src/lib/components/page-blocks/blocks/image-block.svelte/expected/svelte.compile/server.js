import * as $ from 'svelte/internal/server';

export default function Image_block($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { block } = $$props;

		const $$d = $.derived(() => block.metadata.aspectRatio?.split(':') || ['1', '1']),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			aspectWidth = $.derived(() => $$derived_array()[0]),
			aspectHeight = $.derived(() => $$derived_array()[1]);

		$$renderer.push(`<button${$.attr_style(`aspect-ratio: ${$.stringify(aspectWidth())}/${$.stringify(aspectHeight())}; ${block.metadata.maxWidth ? `max-width: ${block.metadata.maxWidth}px;` : ``}`)}${$.attr_class(`${block.metadata.redirectOnClick ? 'cursor-pointer' : 'cursor-default'} ${block.metadata?.horizontalAlign === 'stretch' ? 'w-full' : ''} flex items-center justify-center`)}><img${$.attr('src', block.metadata.url)} class="h-full w-full object-contain" alt=""/></button>`);
	});
}