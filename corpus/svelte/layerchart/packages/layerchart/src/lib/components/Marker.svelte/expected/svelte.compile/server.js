import * as $ from 'svelte/internal/server';
import { cls } from '@layerstack/tailwind';
import { createId } from '$lib/utils/createId.js';

export default function Marker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			type,
			id = createId('marker-', uid),
			size = 10,
			markerWidth = size,
			markerHeight = size,
			markerUnits = 'userSpaceOnUse',
			orient = 'auto-start-reverse',
			refX = ['arrow', 'triangle'].includes(type ?? '') ? 9 : 5,
			refY = 5,
			viewBox = '0 0 10 10',
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<defs><marker${$.attributes(
			{
				id,
				markerWidth,
				markerHeight,
				markerUnits,
				orient,
				refX,
				refY,
				viewBox,
				'data-type': type,
				...restProps,
				class: $.clsx(cls('lc-marker', className))
			},
			'svelte-yb2b8g',
			void 0,
			void 0,
			3
		)}>`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else if (type === 'triangle') {
			$$renderer.push(`<!--[1--><path d="M 0 0 L 10 5 L 0 10 z" class="lc-marker-triangle"></path>`);
		} else if (type === 'arrow') {
			$$renderer.push(`<!--[2--><polyline points="0 0, 10 5, 0 10" class="lc-marker-arrow"></polyline>`);
		} else if (type === 'circle' || type === 'circle-stroke' || type === 'dot') {
			$$renderer.push(`<!--[3--><circle${$.attr('cx', 5)}${$.attr('cy', 5)}${$.attr('r', 5)} class="lc-marker-circle"></circle>`);
		} else if (type === 'line') {
			$$renderer.push(`<!--[4--><polyline points="5 0, 5 10" class="lc-marker-line"></polyline>`);
		} else if (type === 'square' || type === 'square-stroke') {
			$$renderer.push(`<!--[5--><rect${$.attr('x', 0)}${$.attr('y', 0)}${$.attr('width', 10)}${$.attr('height', 10)} class="lc-marker-square"></rect>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></marker></defs>`);
	});
}