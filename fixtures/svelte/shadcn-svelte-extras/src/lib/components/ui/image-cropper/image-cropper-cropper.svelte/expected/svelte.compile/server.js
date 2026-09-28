import * as $ from 'svelte/internal/server';
import Cropper from 'svelte-easy-crop';
import { useImageCropperCropper } from './image-cropper.svelte.js';

export default function Image_cropper_cropper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			cropShape = 'round',
			aspect = 1,
			showGrid = false,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const cropperState = useImageCropperCropper();

		$$renderer.push(`<div class="relative h-full w-full">`);

		Cropper($$renderer, $.spread_props([
			rest,
			{
				cropShape,
				aspect,
				showGrid,
				image: cropperState.rootState.tempUrl,
				oncropcomplete: cropperState.onCropComplete
			}
		]));

		$$renderer.push(`<!----></div>`);
	});
}