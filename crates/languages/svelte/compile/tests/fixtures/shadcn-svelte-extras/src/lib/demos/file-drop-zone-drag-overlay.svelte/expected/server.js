import * as $ from 'svelte/internal/server';
import Button from '$lib/components/button.svelte';
import * as FileDropZone from '$lib/components/ui/file-drop-zone';
import XIcon from '@lucide/svelte/icons/x';
import { toast } from 'svelte-sonner';

export default function File_drop_zone_drag_overlay($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let files = [];

		const onUpload = async (uploadedFiles) => {
			for (const file of uploadedFiles) {
				files.push({
					name: file.name,
					size: file.size,
					url: URL.createObjectURL(file)
				});
			}
		};

		const onFileRejected = ({ reason, file }) => {
			toast.error(`${file.name} failed to upload!`, { description: reason });
		};

		const removeFile = (index) => {
			URL.revokeObjectURL(files[index].url);
			files = [...files.slice(0, index), ...files.slice(index + 1)];
		};

		$$renderer.push(`<div class="flex w-full flex-col gap-2 p-6">`);

		if (FileDropZone.Root) {
			$$renderer.push('<!--[-->');

			FileDropZone.Root($$renderer, {
				onUpload,
				onFileRejected,
				maxFileSize: 3 * FileDropZone.MEGABYTE,
				accept: 'image/*',
				maxFiles: 4,
				fileCount: files.length,
				children: ($$renderer) => {
					if (FileDropZone.Trigger) {
						$$renderer.push('<!--[-->');
						FileDropZone.Trigger($$renderer, {});
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (FileDropZone.DragOverlay) {
						$$renderer.push('<!--[-->');
						FileDropZone.DragOverlay($$renderer, {});
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

		$$renderer.push(` <div class="flex flex-col gap-2"><!--[-->`);

		const each_array = $.ensure_array_like(files);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let file = each_array[i];

			$$renderer.push(`<div class="border-border flex place-items-center justify-between gap-2 rounded-md border p-2"><div class="flex place-items-center gap-2"><div class="relative size-9 overflow-clip"><img${$.attr('src', file.url)}${$.attr('alt', file.name)} class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-clip"/></div> <div class="flex flex-col"><span class="text-nowrap">${$.escape(file.name)}</span> <span class="text-muted-foreground text-xs">${$.escape(FileDropZone.displaySize(file.size))}</span></div></div> `);

			Button($$renderer, {
				variant: 'outline',
				size: 'icon',
				onclick: () => removeFile(i),
				children: ($$renderer) => {
					XIcon($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}