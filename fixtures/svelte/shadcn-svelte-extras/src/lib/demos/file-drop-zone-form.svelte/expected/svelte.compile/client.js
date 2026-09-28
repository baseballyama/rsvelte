import 'svelte/internal/disclose-version';
import { schema } from '$lib/docs/file-drop-zone-schema';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/button.svelte';
import * as FileDropZone from '$lib/components/ui/file-drop-zone';
import XIcon from '@lucide/svelte/icons/x';
import { toast } from 'svelte-sonner';
import { superForm, filesProxy } from 'sveltekit-superforms';
import SuperDebug from 'sveltekit-superforms';
import { zod4Client } from 'sveltekit-superforms/adapters';

var root = $.from_html(`<div class="flex place-items-center justify-between gap-2"><div class="flex flex-col"><span> </span> <span class="text-muted-foreground text-xs"> </span></div> <!></div>`);
var root_1 = $.from_html(`<form method="POST" enctype="multipart/form-data" class="flex w-full flex-col gap-2 p-6"><!> <div class="flex flex-col gap-2"></div> <!> <!></form>`);

export default function File_drop_zone_form($$anchor, $$props) {
	$.push($$props, true);

	const $files = () => $.store_get(files, '$files', $$stores);
	const $formData = () => $.store_get(formData, '$formData', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

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
		files.set([...Array.from($files()), ...uploadedFiles]);
	};

	const onFileRejected = async ({ reason, file }) => {
		toast.error(`${file.name} failed to upload!`, { description: reason });
	};

	const files = filesProxy(form, 'attachments');
	var form_1 = root_1();
	var node = $.child(form_1);

	{
		let $0 = $.derived(() => 3 * FileDropZone.MEGABYTE);

		$.component(node, () => FileDropZone.Root, ($$anchor, FileDropZone_Root) => {
			FileDropZone_Root($$anchor, {
				onUpload,
				onFileRejected,
				get maxFileSize() {
					return $.get($0);
				},
				accept: 'image/*',
				maxFiles: 4,
				get fileCount() {
					return $files().length;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment = $.comment();
					var node_1 = $.first_child(fragment);

					$.component(node_1, () => FileDropZone.Trigger, ($$anchor, FileDropZone_Trigger) => {
						FileDropZone_Trigger($$anchor, {});
					});

					$.append($$anchor, fragment);
				},
				$$slots: { default: true }
			});
		});
	}

	var div = $.sibling(node, 2);

	$.each(div, 7, () => Array.from($files()), (file) => file.name, ($$anchor, file, i) => {
		var div_1 = root();
		var div_2 = $.child(div_1);
		var span = $.child(div_2);
		var text = $.only_child(span, true);
		var span_1 = $.sibling(span, 2);
		var text_1 = $.only_child(span_1, true);

		$.reset(div_2);

		var node_2 = $.sibling(div_2, 2);

		Button(node_2, {
			variant: 'outline',
			size: 'icon',
			onclick: () => {
				// we use set instead of an assignment since it accepts a File[]
				files.set([
					...Array.from($files()).slice(0, $.get(i)),
					...Array.from($files()).slice($.get(i) + 1)
				]);
			},

			children: ($$anchor, $$slotProps) => {
				XIcon($$anchor, {});
			},
			$$slots: { default: true }
		});

		$.reset(div_1);

		$.template_effect(
			($0) => {
				$.set_text(text, $.get(file).name);
				$.set_text(text_1, $0);
			},
			[() => FileDropZone.displaySize($.get(file).size)]
		);

		$.append($$anchor, div_1);
	});

	$.reset(div);

	var node_3 = $.sibling(div, 2);

	Button(node_3, {
		type: 'submit',
		class: 'w-fit',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Submit');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	SuperDebug(node_4, {
		get data() {
			return $formData();
		}
	});

	$.reset(form_1);
	$.action(form_1, ($$node) => enhance?.($$node));
	$.append($$anchor, form_1);
	$.pop();
	$$cleanup();
}