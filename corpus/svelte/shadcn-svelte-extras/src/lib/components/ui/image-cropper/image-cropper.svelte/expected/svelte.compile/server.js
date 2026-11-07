import * as $ from 'svelte/internal/server';
import { box } from 'svelte-toolbelt';
import { useImageCropperRoot } from './image-cropper.svelte.js';
import { onDestroy } from 'svelte';
import { useId } from 'bits-ui';

export default function Image_cropper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			id = useId(),
			src = '',
			onCropped = () => {},
			onUnsupportedFile = () => {},
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const rootState = useImageCropperRoot({
			id: box.with(() => id),
			src: box.with(() => src, (v) => src = v),
			onCropped: box.with(() => onCropped),
			onUnsupportedFile: box.with(() => onUnsupportedFile)
		});

		onDestroy(() => rootState.dispose());
		children?.($$renderer);

		$$renderer.push(`<!----> <input${$.attributes(
			{
				...rest,
				type: 'file',
				// reset so that we can reupload the same file
				id,
				style: 'display: none;'
			},
			void 0,
			void 0,
			void 0,
			4
		)}/>`);

		$.bind_props($$props, { src });
	});
}