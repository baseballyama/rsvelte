import * as $ from 'svelte/internal/server';
import * as Dialog from '$lib/components/ui/dialog';
import { cn } from '$lib/utils.js';
import { useImageCropperDialog } from './image-cropper.svelte.js';

export default function Image_cropper_dialog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, class: className, $$slots, $$events, ...rest } = $$props;
		const dialogState = useImageCropperDialog();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return dialogState.rootState.open;
					},

					set open($$value) {
						dialogState.rootState.open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, $.spread_props([
								rest,
								{
									showCloseButton: false,
									class: cn('min-h-96 max-w-full rounded-none border-x-0 sm:max-w-lg sm:rounded-lg sm:border-x', className),
									children: ($$renderer) => {
										$$renderer.push(`<div class="flex flex-col gap-4">`);
										children?.($$renderer);
										$$renderer.push(`<!----></div>`);
									},
									$$slots: { default: true }
								}
							]));

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

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}