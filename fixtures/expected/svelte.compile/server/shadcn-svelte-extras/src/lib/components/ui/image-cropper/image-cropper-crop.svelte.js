import * as $ from 'svelte/internal/server';
import Button from '$lib/components/button.svelte';
import { useImageCropperCrop } from './image-cropper.svelte.js';
import CropIcon from '@lucide/svelte/icons/crop';

export default function Image_cropper_crop($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			variant = 'default',
			size = 'sm',
			onclick,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const cropState = useImageCropperCrop();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Button($$renderer, $.spread_props([
				rest,
				{
					size,
					variant,
					onclick: (e) => {
						onclick?.(e);
						cropState.onclick();
					},

					get ref() {
						return ref;
					},

					set ref($$value) {
						ref = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						CropIcon($$renderer, {});
						$$renderer.push(`<!----> <span>Crop</span>`);
					},
					$$slots: { default: true }
				}
			]));
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref });
	});
}