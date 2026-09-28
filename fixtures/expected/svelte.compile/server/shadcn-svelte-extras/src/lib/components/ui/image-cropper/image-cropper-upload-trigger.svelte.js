import * as $ from 'svelte/internal/server';
import { useImageCropperTrigger } from './image-cropper.svelte.js';

export default function Image_cropper_upload_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null, children, $$slots, $$events, ...rest } = $$props;
		const triggerState = useImageCropperTrigger();

		$$renderer.push(`<label${$.attributes({
			...rest,
			for: triggerState.rootState.id,
			class: 'hover:cursor-pointer'
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></label>`);
		$.bind_props($$props, { ref });
	});
}