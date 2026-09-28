import * as $ from 'svelte/internal/server';
import * as Avatar from '$lib/components/ui/avatar';
import { useImageCropperPreview } from './image-cropper.svelte.js';
import UploadIcon from '@lucide/svelte/icons/upload';
import { cn } from '$lib/utils.js';

export default function Image_cropper_preview($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { child, class: className } = $$props;
		const previewState = useImageCropperPreview();

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { src: previewState.rootState.src });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');

			if (Avatar.Root) {
				$$renderer.push('<!--[-->');

				Avatar.Root($$renderer, {
					class: cn('ring-accent ring-offset-background size-20 ring-2 ring-offset-2', className),
					children: ($$renderer) => {
						if (Avatar.Image) {
							$$renderer.push('<!--[-->');
							Avatar.Image($$renderer, { src: previewState.rootState.src });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Avatar.Fallback) {
							$$renderer.push('<!--[-->');

							Avatar.Fallback($$renderer, {
								children: ($$renderer) => {
									UploadIcon($$renderer, { class: 'size-4' });
									$$renderer.push(`<!----> <span class="sr-only">Upload image</span>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(`<!--]-->`);
	});
}