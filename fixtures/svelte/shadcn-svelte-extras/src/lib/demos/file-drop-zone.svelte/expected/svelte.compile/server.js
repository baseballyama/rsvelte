import * as $ from 'svelte/internal/server';
import Button from '$lib/components/button.svelte';
import * as FileDropZone from '$lib/components/ui/file-drop-zone';
import { Progress } from '$lib/components/ui/progress';
import { sleep } from '$lib/utils/sleep';
import XIcon from '@lucide/svelte/icons/x';
import { onDestroy } from 'svelte';
import { toast } from 'svelte-sonner';
import { SvelteDate } from 'svelte/reactivity';

export default function File_drop_zone($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const onUpload = async (files) => {
			await Promise.allSettled(files.map((file) => uploadFile(file)));
		};

		const onFileRejected = async ({ reason, file }) => {
			toast.error(`${file.name} failed to upload!`, { description: reason });
		};

		const uploadFile = async (file) => {
			// don't upload duplicate files
			if (files.find((f) => f.name === file.name)) return;

			const urlPromise = new Promise((resolve) => {
				// add some fake loading time
				sleep(1000).then(() => resolve(URL.createObjectURL(file)));
			});

			files.push({
				name: file.name,
				type: file.type,
				size: file.size,
				uploadedAt: Date.now(),
				url: urlPromise
			});

			// we await since we don't want the onUpload to be complete until the files are actually uploaded
			await urlPromise;
		};

		let files = [];
		let date = new SvelteDate();

		onDestroy(async () => {
			for (const file of files) {
				URL.revokeObjectURL(await file.url);
			}
		});

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

			$$renderer.push(`<div class="flex place-items-center justify-between gap-2"><div class="flex place-items-center gap-2">`);

			$.await($$renderer, file.url, () => {}, (src) => {
				$$renderer.push(`<div class="relative size-9 overflow-clip"><img${$.attr('src', src)}${$.attr('alt', file.name)} class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-clip"/></div>`);
			});

			$$renderer.push(`<!--]--> <div class="flex flex-col"><span class="text-nowrap">${$.escape(file.name)}</span> <span class="text-muted-foreground text-xs">${$.escape(FileDropZone.displaySize(file.size))}</span></div></div> `);

			$.await(
				$$renderer,
				file.url,
				() => {
					Progress($$renderer, {
						class: 'h-2 w-full grow',
						value: (date.getTime() - file.uploadedAt) / 1000 * 100,
						max: 100
					});
				},
				(url) => {
					Button($$renderer, {
						variant: 'outline',
						size: 'icon',
						onclick: () => {
							URL.revokeObjectURL(url);
							files = [...files.slice(0, i), ...files.slice(i + 1)];
						},

						children: ($$renderer) => {
							XIcon($$renderer, {});
						},
						$$slots: { default: true }
					});
				}
			);

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}