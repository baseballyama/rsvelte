import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/button.svelte';
import * as FileDropZone from '$lib/components/ui/file-drop-zone';
import { Kbd, KbdGroup } from '$lib/components/ui/kbd';
import { cmdOrCtrl } from '$lib/hooks/is-mac.svelte';
import ClipboardIcon from '@lucide/svelte/icons/clipboard';
import XIcon from '@lucide/svelte/icons/x';
import { toast } from 'svelte-sonner';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="hover:bg-accent/25 flex h-48 flex-col place-items-center justify-center gap-2 rounded-lg border border-dashed p-6 transition-all hover:cursor-pointer"><div class="border-border text-muted-foreground flex size-14 place-items-center justify-center rounded-full border border-dashed"><!></div> <span class="text-muted-foreground flex place-items-center gap-1.5 font-medium">Copy an image, then press <!> anywhere on the page</span></div>`);
var root_2 = $.from_html(`<div class="border-border flex place-items-center justify-between gap-2 rounded-md border p-2"><div class="flex place-items-center gap-2"><div class="relative size-9 overflow-clip"><img class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-clip"/></div> <div class="flex flex-col"><span class="text-nowrap"> </span> <span class="text-muted-foreground text-xs"> </span></div></div> <!></div>`);
var root_3 = $.from_html(`<div class="flex w-full flex-col gap-2 p-6"><!> <div class="flex flex-col gap-2"></div></div>`);

export default function File_drop_zone_paste_capture($$anchor, $$props) {
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

	var div = root_3();
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
				capturePaste: true,
				children: ($$anchor, $$slotProps) => {
					var fragment = $.comment();
					var node_1 = $.first_child(fragment);

					$.component(node_1, () => FileDropZone.Trigger, ($$anchor, FileDropZone_Trigger) => {
						FileDropZone_Trigger($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var div_1 = root_1();
								var div_2 = $.child(div_1);
								var node_2 = $.child(div_2);

								ClipboardIcon(node_2, { class: 'size-7' });
								$.reset(div_2);

								var span = $.sibling(div_2, 2);
								var node_3 = $.sibling($.child(span));

								KbdGroup(node_3, {
									children: ($$anchor, $$slotProps) => {
										var fragment_1 = root();
										var node_4 = $.first_child(fragment_1);

										Kbd(node_4, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text();

												$.template_effect(() => $.set_text(text, cmdOrCtrl));
												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});

										var node_5 = $.sibling(node_4, 2);

										Kbd(node_5, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('V');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_1);
									},
									$$slots: { default: true }
								});

								$.next();
								$.reset(span);
								$.reset(div_1);
								$.append($$anchor, div_1);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment);
				},
				$$slots: { default: true }
			});
		});
	}

	var div_3 = $.sibling(node, 2);

	$.each(div_3, 23, () => $.get(files), (file) => file.name, ($$anchor, file, i) => {
		var div_4 = root_2();
		var div_5 = $.child(div_4);
		var div_6 = $.child(div_5);
		var img = $.only_child(div_6);
		var div_7 = $.sibling(div_6, 2);
		var span_1 = $.child(div_7);
		var text_2 = $.only_child(span_1, true);
		var span_2 = $.sibling(span_1, 2);
		var text_3 = $.only_child(span_2, true);

		$.reset(div_7);
		$.reset(div_5);

		var node_6 = $.sibling(div_5, 2);

		Button(node_6, {
			variant: 'outline',
			size: 'icon',
			onclick: () => removeFile($.get(i)),
			children: ($$anchor, $$slotProps) => {
				XIcon($$anchor, {});
			},
			$$slots: { default: true }
		});

		$.reset(div_4);

		$.template_effect(
			($0) => {
				$.set_attribute(img, 'src', $.get(file).url);
				$.set_attribute(img, 'alt', $.get(file).name);
				$.set_text(text_2, $.get(file).name);
				$.set_text(text_3, $0);
			},
			[() => FileDropZone.displaySize($.get(file).size)]
		);

		$.append($$anchor, div_4);
	});

	$.reset(div_3);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}