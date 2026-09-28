import * as $ from 'svelte/internal/server';
import Button from '$lib/components/button.svelte';
import { useImageCropperCancel } from './image-cropper.svelte.js';
import Trash2Icon from '@lucide/svelte/icons/trash-2';

export default function Image_cropper_cancel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			variant = 'outline',
			size = 'sm',
			onclick,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const cancelState = useImageCropperCancel();
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
						cancelState.onclick();
					},

					get ref() {
						return ref;
					},

					set ref($$value) {
						ref = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						Trash2Icon($$renderer, {});
						$$renderer.push(`<!----> <span>Cancel</span>`);
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