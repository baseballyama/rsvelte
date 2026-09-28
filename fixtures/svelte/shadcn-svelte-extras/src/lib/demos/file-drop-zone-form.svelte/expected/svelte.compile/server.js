import * as $ from 'svelte/internal/server';
import Button from '$lib/components/button.svelte';
import * as FileDropZone from '$lib/components/ui/file-drop-zone';
import XIcon from '@lucide/svelte/icons/x';
import { toast } from 'svelte-sonner';
import { superForm, filesProxy } from 'sveltekit-superforms';
import SuperDebug from 'sveltekit-superforms';
import { zod4Client } from 'sveltekit-superforms/adapters';
import { schema } from '$lib/docs/file-drop-zone-schema';

export default function File_drop_zone_form($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		// Create a mock form data structure for demo purposes
		// In a real app, this would come from +page.server.ts
		const mockFormData = {
			valid: false,
			posted: false,
			errors: {},
			data: { attachments: [] },
			message: undefined,
			id: 'form',
			allErrors: [],
			constraints: {}
		};

		const form = superForm(mockFormData, { validators: zod4Client(schema) });
		const { form: formData, enhance, message } = form;

		message.subscribe((message) => {
			if (message) {
				toast.success(message.text, { description: 'Your attachments were uploaded.' });
			}
		});

		const onUpload = async (uploadedFiles) => {
			// we use set instead of an assignment since it accepts a File[]
			files.set([
				...Array.from($.store_get($$store_subs ??= {}, '$files', files)),
				...uploadedFiles
			]);
		};

		const onFileRejected = async ({ reason, file }) => {
			toast.error(`${file.name} failed to upload!`, { description: reason });
		};

		const files = filesProxy(form, 'attachments');

		$$renderer.push(`<form method="POST" enctype="multipart/form-data" class="flex w-full flex-col gap-2 p-6">`);

		if (FileDropZone.Root) {
			$$renderer.push('<!--[-->');

			FileDropZone.Root($$renderer, {
				onUpload,
				onFileRejected,
				maxFileSize: 3 * FileDropZone.MEGABYTE,
				accept: 'image/*',
				maxFiles: 4,
				fileCount: $.store_get($$store_subs ??= {}, '$files', files).length,
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

		const each_array = $.ensure_array_like(Array.from($.store_get($$store_subs ??= {}, '$files', files)));

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let file = each_array[i];

			$$renderer.push(`<div class="flex place-items-center justify-between gap-2"><div class="flex flex-col"><span>${$.escape(file.name)}</span> <span class="text-muted-foreground text-xs">${$.escape(FileDropZone.displaySize(file.size))}</span></div> `);

			Button($$renderer, {
				variant: 'outline',
				size: 'icon',
				onclick: () => {
					// we use set instead of an assignment since it accepts a File[]
					files.set([
						...Array.from($.store_get($$store_subs ??= {}, '$files', files)).slice(0, i),
						...Array.from($.store_get($$store_subs ??= {}, '$files', files)).slice(i + 1)
					]);
				},

				children: ($$renderer) => {
					XIcon($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]--></div> `);

		Button($$renderer, {
			type: 'submit',
			class: 'w-fit',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Submit`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		SuperDebug($$renderer, {
			data: $.store_get($$store_subs ??= {}, '$formData', formData)
		});

		$$renderer.push(`<!----></form>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}