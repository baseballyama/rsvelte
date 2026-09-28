import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/button.svelte';
import * as FileDropZone from '$lib/components/ui/file-drop-zone';
import XIcon from '@lucide/svelte/icons/x';
import { toast } from 'svelte-sonner';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="border-border flex place-items-center justify-between gap-2 rounded-md border p-2"><div class="flex place-items-center gap-2"><div class="relative size-9 overflow-clip"><img class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-clip"/></div> <div class="flex flex-col"><span class="text-nowrap"> </span> <span class="text-muted-foreground text-xs"> </span></div></div> <!></div>`);
var root_2 = $.from_html(`<div class="flex w-full flex-col gap-2 p-6"><!> <div class="flex flex-col gap-2"></div></div>`);

export default function File_drop_zone_drag_overlay($$anchor, $$props) {
	$.push($$props, true);

	let files = $.state($.proxy([]));

	const onUpload = async (uploadedFiles) => {
		for (const file of uploadedFiles) {
			$.get(files).push({
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
		URL.revokeObjectURL($.get(files)[index].url);

		$.set(
			files,
			[
				...$.get(files).slice(0, index),
				...$.get(files).slice(index + 1)
			],
			true
		);
	};

	var div = root_2();
	var node = $.child(div);

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
					return $.get(files).length;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment = root();
					var node_1 = $.first_child(fragment);

					$.component(node_1, () => FileDropZone.Trigger, ($$anchor, FileDropZone_Trigger) => {
						FileDropZone_Trigger($$anchor, {});
					});

					var node_2 = $.sibling(node_1, 2);

					$.component(node_2, () => FileDropZone.DragOverlay, ($$anchor, FileDropZone_DragOverlay) => {
						FileDropZone_DragOverlay($$anchor, {});
					});

					$.append($$anchor, fragment);
				},
				$$slots: { default: true }
			});
		});
	}

	var div_1 = $.sibling(node, 2);

	$.each(div_1, 23, () => $.get(files), (file) => file.name, ($$anchor, file, i) => {
		var div_2 = root_1();
		var div_3 = $.child(div_2);
		var div_4 = $.child(div_3);
		var img = $.only_child(div_4);
		var div_5 = $.sibling(div_4, 2);
		var span = $.child(div_5);
		var text = $.only_child(span, true);
		var span_1 = $.sibling(span, 2);
		var text_1 = $.only_child(span_1, true);

		$.reset(div_5);
		$.reset(div_3);

		var node_3 = $.sibling(div_3, 2);

		Button(node_3, {
			variant: 'outline',
			size: 'icon',
			onclick: () => removeFile($.get(i)),
			children: ($$anchor, $$slotProps) => {
				XIcon($$anchor, {});
			},
			$$slots: { default: true }
		});

		$.reset(div_2);

		$.template_effect(
			($0) => {
				$.set_attribute(img, 'src', $.get(file).url);
				$.set_attribute(img, 'alt', $.get(file).name);
				$.set_text(text, $.get(file).name);
				$.set_text(text_1, $0);
			},
			[() => FileDropZone.displaySize($.get(file).size)]
		);

		$.append($$anchor, div_2);
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}