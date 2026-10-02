import * as $ from 'svelte/internal/server';
import { cls } from '@layerstack/tailwind';
import { ImageState, imageMarkInfo } from './Image.shared.svelte.js';

export default function Image_html($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			href,
			crossOrigin,
			class: className,
			opacity,
			// Pull internal-only props out
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
			preserveAspectRatio,
			imageRendering,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const c = new ImageState(() => ({
			href,
			crossOrigin,
			class: className,
			opacity,
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
			preserveAspectRatio,
			imageRendering,
			...rest
		}));

		c.chartCtx.registerComponent({
			name: 'Image',
			kind: 'mark',
			markInfo: () => imageMarkInfo({ x, y, data, ...rest }, c.dataMode)
		});

		if (c.dataMode) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(c.resolvedItems);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];
				const resolvedHrefValue = c.resolveHref(item.d);

				$$renderer.push(`<img${$.attributes(
					{
						src: resolvedHrefValue,
						alt: '',
						crossorigin: crossOrigin,
						class: $.clsx(cls('lc-image', className)),
						...rest
					},
					void 0,
					void 0,
					{
						position: 'absolute',
						left: `${$.stringify(item.x - item.width / 2)}px`,
						top: `${$.stringify(item.y - item.height / 2)}px`,
						width: `${$.stringify(item.width)}px`,
						height: `${$.stringify(item.height)}px`,
						'clip-path': item.r !== undefined ? `circle(${item.r}px at center)` : undefined,
						transform: item.rotate ? `rotate(${item.rotate}deg)` : undefined,
						opacity,
						'object-fit': 'cover'
					}
				)} onload="this.__e=event" onerror="this.__e=event"/>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push(`<!--[-1--><img${$.attributes(
				{
					src: typeof href === 'string' ? href : undefined,
					alt: '',
					crossorigin: crossOrigin,
					class: $.clsx(cls('lc-image', className)),
					...rest
				},
				void 0,
				void 0,
				{
					position: 'absolute',
					left: `${$.stringify(c.motionX - c.motionWidth / 2)}px`,
					top: `${$.stringify(c.motionY - c.motionHeight / 2)}px`,
					width: `${$.stringify(c.motionWidth)}px`,
					height: `${$.stringify(c.motionHeight)}px`,
					'clip-path': c.pixelR !== undefined ? `circle(${c.pixelR}px at center)` : undefined,
					transform: c.pixelRotate ? `rotate(${c.pixelRotate}deg)` : undefined,
					opacity,
					'object-fit': 'cover'
				}
			)} onload="this.__e=event" onerror="this.__e=event"/>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}