import * as $ from 'svelte/internal/server';
import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
import { getCollectionState } from '$lib/core/stores/collection.svelte.js';

export default function Collection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { block } = $$props;
		const collectionState = getCollectionState();
		const collection = $.derived(() => collectionState.getOneById(block.entityId));

		const $$d = $.derived(() => block.metadata.aspectRatio?.split(':') || ['1', '1']),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			aspectWidth = $.derived(() => $$derived_array()[0]),
			aspectHeight = $.derived(() => $$derived_array()[1]);

		if (collectionState.loading) {
			$$renderer.push('<!--[0-->');
			Skeleton($$renderer, {});
		} else if (collection()) {
			$$renderer.push(`<!--[1--><div${$.attr_style(`aspect-ratio: ${$.stringify(aspectWidth())}/${$.stringify(aspectHeight())}; ${block.metadata.maxWidth ? `max-width: ${block.metadata.maxWidth}px;` : ``}`)} class="flex items-center justify-center"><img${$.attr('src', collection().img)} class="h-full object-contain" alt=""/></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}