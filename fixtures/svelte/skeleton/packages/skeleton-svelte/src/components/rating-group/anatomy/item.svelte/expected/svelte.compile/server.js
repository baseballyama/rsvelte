import * as $ from 'svelte/internal/server';
import StarEmpty from '../../../internal/components/star-empty.svelte';
import StarFull from '../../../internal/components/star-full.svelte';
import StarHalf from '../../../internal/components/star-half.svelte';
import { RatingGroupRootContext } from '../modules/root-context.js';
import { splitItemProps } from '@zag-js/rating-group';
import { mergeProps } from '@zag-js/svelte';

function starEmpty($$renderer) {
	StarEmpty($$renderer, {});
}

function starHalf($$renderer) {
	StarHalf($$renderer, {});
}

function starFull($$renderer) {
	StarFull($$renderer, {});
}

export default function Item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const ratingGroup = RatingGroupRootContext.consume();

		const $$d = $.derived(() => splitItemProps(props)),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			itemProps = $.derived(() => $$derived_array()[0]),
			componentProps = $.derived(() => $$derived_array()[1]);

		const element = $.derived(() => componentProps().element),
			children = $.derived(() => componentProps().children),
			empty = $.derived(() => $.fallback(componentProps().empty, starEmpty)),
			half = $.derived(() => $.fallback(componentProps().half, starHalf)),
			full = $.derived(() => $.fallback(componentProps().full, starFull)),
			rest = $.derived(() => $.exclude_from_object(componentProps(), ['element', 'children', 'empty', 'half', 'full']));

		const itemState = $.derived(() => ratingGroup().getItemState(itemProps()));
		const attributes = $.derived(() => mergeProps(ratingGroup().getItemProps(itemProps()), rest()));

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes({ ...attributes() })}>`);

			if (children()) {
				$$renderer.push('<!--[0-->');
				children()($$renderer);
				$$renderer.push(`<!---->`);
			} else if (!itemState().highlighted) {
				$$renderer.push('<!--[1-->');
				empty()?.($$renderer);
				$$renderer.push(`<!---->`);
			} else if (itemState().half) {
				$$renderer.push('<!--[2-->');
				half()?.($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
				full()?.($$renderer);
				$$renderer.push(`<!---->`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}