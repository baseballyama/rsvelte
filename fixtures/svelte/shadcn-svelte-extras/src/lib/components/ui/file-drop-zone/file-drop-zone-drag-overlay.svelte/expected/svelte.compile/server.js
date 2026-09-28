import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { useFileDropZoneDragOverlay } from './file-drop-zone.svelte.js';
import UploadIcon from '@lucide/svelte/icons/upload';
import { Portal } from 'bits-ui';
import { box, mergeProps } from 'svelte-toolbelt';

export default function File_drop_zone_drag_overlay($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			disabled = false,
			portalProps,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const dragOverlayState = useFileDropZoneDragOverlay({ disabled: box.with(() => disabled) });
		const mergedProps = $.derived(() => mergeProps(dragOverlayState.props, rest));

		if (dragOverlayState.dragging) {
			$$renderer.push('<!--[0-->');

			Portal($$renderer, $.spread_props([
				portalProps,
				{
					children: ($$renderer) => {
						$$renderer.push(`<div${$.attributes({
							class: $.clsx(cn('animate-in fade-in-0 fixed inset-0 z-50 flex place-items-center justify-center bg-black/25 p-6 duration-100 supports-backdrop-filter:backdrop-blur-xs', className)),
							...mergedProps()
						})}>`);

						if (children) {
							$$renderer.push('<!--[0-->');
							children($$renderer);
							$$renderer.push(`<!---->`);
						} else {
							$$renderer.push(`<!--[-1--><div class="text-foreground flex flex-col place-items-center justify-center gap-3">`);
							UploadIcon($$renderer, { class: 'size-8' });
							$$renderer.push(`<!----> <span class="text-lg font-medium">Drop files here to upload</span></div>`);
						}

						$$renderer.push(`<!--]--></div>`);
					},
					$$slots: { default: true }
				}
			]));
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}