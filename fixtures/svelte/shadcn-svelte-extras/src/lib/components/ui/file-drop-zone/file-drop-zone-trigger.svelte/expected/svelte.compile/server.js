import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { useFileDropZoneTrigger } from './file-drop-zone.svelte.js';
import { displaySize } from './index.js';
import UploadIcon from '@lucide/svelte/icons/upload';

export default function File_drop_zone_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const triggerState = useFileDropZoneTrigger();

		$$renderer.push(`<label${$.attributes({
			class: $.clsx(cn('group/file-drop-zone-trigger', className)),
			...triggerState.props,
			...rest
		})}>`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div class="hover:bg-accent/25 flex h-48 flex-col place-items-center justify-center gap-2 rounded-lg border border-dashed p-6 transition-all group-aria-disabled/file-drop-zone-trigger:opacity-50 hover:cursor-pointer group-aria-disabled/file-drop-zone-trigger:hover:cursor-not-allowed"><div class="border-border text-muted-foreground flex size-14 place-items-center justify-center rounded-full border border-dashed">`);
			UploadIcon($$renderer, { class: 'size-7' });
			$$renderer.push(`<!----></div> <div class="flex flex-col gap-0.5 text-center"><span class="text-muted-foreground font-medium">Drag 'n' drop files here, or click to select files</span> `);

			if (triggerState.rootState.opts.maxFiles.current || triggerState.rootState.opts.maxFileSize.current) {
				$$renderer.push(`<!--[0--><span class="text-muted-foreground/75 text-sm">`);

				if (triggerState.rootState.opts.maxFiles.current) {
					$$renderer.push(`<!--[0--><span>You can upload ${$.escape(triggerState.rootState.opts.maxFiles.current)} files</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (triggerState.rootState.opts.maxFiles.current && triggerState.rootState.opts.maxFileSize.current) {
					$$renderer.push(`<!--[0--><span>(up to ${$.escape(displaySize(triggerState.rootState.opts.maxFileSize.current))} each)</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (triggerState.rootState.opts.maxFileSize.current && !triggerState.rootState.opts.maxFiles.current) {
					$$renderer.push(`<!--[0--><span>Maximum size ${$.escape(displaySize(triggerState.rootState.opts.maxFileSize.current))}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		$$renderer.push(`<!--]--></label>`);
		$.bind_props($$props, { ref });
	});
}