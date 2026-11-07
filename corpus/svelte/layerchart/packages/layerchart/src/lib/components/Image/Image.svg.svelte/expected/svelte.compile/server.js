import * as $ from 'svelte/internal/server';
import { cls } from '@layerstack/tailwind';
import { createId } from '$lib/utils/createId.js';
import { ImageState, imageMarkInfo } from './Image.shared.svelte.js';

export default function Image_svg($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			href,
			ref: refProp = void 0,
			preserveAspectRatio = 'xMidYMid meet',
			crossOrigin,
			imageRendering,
			class: className,
			// Pull out props that collide with `<image>` SVG attribute names so spread
			// doesn't clobber our explicit attrs.
			x,
			y,
			width,
			height,
			r,
			rotate,
			initialX,
			initialY,
			initialWidth,
			initialHeight,
			data,
			key,
			motion,
			opacity,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const c = new ImageState(() => ({
			href,
			x,
			y,
			width,
			height,
			r,
			rotate,
			initialX,
			initialY,
			initialWidth,
			initialHeight,
			data,
			key,
			motion,
			opacity,
			...rest
		}));

		const clipId = createId('image-clip', uid);
		let ref = void 0;

		c.chartCtx.registerComponent({
			name: 'Image',
			kind: 'mark',
			markInfo: () => imageMarkInfo({ x, y, data, ...rest }, c.dataMode)
		});

		if (c.dataMode) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(c.resolvedItems);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let item = each_array[i];
				const resolvedHrefValue = c.resolveHref(item.d);
				const renderX = item.x - item.width / 2;
				const renderY = item.y - item.height / 2;

				if (item.r !== undefined) {
					$$renderer.push(`<!--[0--><defs><clipPath${$.attr('id', `${$.stringify(clipId)}-${$.stringify(i)}`)}><circle${$.attr('cx', item.x)}${$.attr('cy', item.y)}${$.attr('r', item.r)}></circle></clipPath></defs>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--><image${$.attributes(
					{
						...rest,
						href: resolvedHrefValue,
						x: renderX,
						y: renderY,
						width: item.width,
						height: item.height,
						'clip-path': item.r !== undefined ? `url(#${clipId}-${i})` : undefined,
						transform: item.rotate
							? `rotate(${item.rotate}, ${item.x}, ${item.y})`
							: undefined,
						preserveAspectRatio,
						crossorigin: crossOrigin,
						'image-rendering': imageRendering,
						opacity,
						class: $.clsx(cls('lc-image', className))
					},
					void 0,
					void 0,
					void 0,
					3
				)}></image>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');

			if (c.pixelR !== undefined) {
				$$renderer.push(`<!--[0--><defs><clipPath${$.attr('id', clipId)}><circle${$.attr('cx', c.motionX)}${$.attr('cy', c.motionY)}${$.attr('r', c.pixelR)}></circle></clipPath></defs>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--><image${$.attributes(
				{
					...rest,
					href: typeof href === 'string' ? href : undefined,
					x: c.motionX - c.motionWidth / 2,
					y: c.motionY - c.motionHeight / 2,
					width: c.motionWidth,
					height: c.motionHeight,
					'clip-path': c.pixelR !== undefined ? `url(#${clipId})` : undefined,
					transform: c.pixelRotate
						? `rotate(${c.pixelRotate}, ${c.motionX}, ${c.motionY})`
						: undefined,
					preserveAspectRatio,
					crossorigin: crossOrigin,
					'image-rendering': imageRendering,
					opacity,
					class: $.clsx(cls('lc-image', className))
				},
				void 0,
				void 0,
				void 0,
				3
			)}></image>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref: refProp });
	});
}