import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/button.svelte';
import * as FileDropZone from '$lib/components/ui/file-drop-zone';
import { Progress } from '$lib/components/ui/progress';
import { sleep } from '$lib/utils/sleep';
import XIcon from '@lucide/svelte/icons/x';
import { onDestroy } from 'svelte';
import { toast } from 'svelte-sonner';
import { SvelteDate } from 'svelte/reactivity';

var root = $.from_html(`<div class="relative size-9 overflow-clip"><img class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-clip"/></div>`);
var root_1 = $.from_html(`<div class="border-border flex place-items-center justify-between gap-2 rounded-md border p-2"><div class="flex place-items-center gap-2"><!> <div class="flex flex-col"><span class="text-nowrap"> </span> <span class="text-muted-foreground text-xs"> </span></div></div> <!></div>`);
var root_2 = $.from_html(`<div class="flex w-full flex-col gap-2"><!> <div class="flex flex-col gap-2"></div></div>`);

export default function File_drop_zone($$anchor, $$props) {
	$.push($$props, true);

	const onUpload = async (files) => {
		await Promise.allSettled(files.map((file) => uploadFile(file)));
	};

	const onFileRejected = async ({ reason, file }) => {
		toast.error(`${file.name} failed to upload!`, { description: reason });
	};

	const uploadFile = async (file) => {
		// don't upload duplicate files
		if ($.get(files).find((f) => f.name === file.name)) return;

		const urlPromise = new Promise((resolve) => {
			// add some fake loading time
			sleep(1000).then(() => resolve(URL.createObjectURL(file)));
		});

		$.get(files).push({
			name: file.name,
			type: file.type,
			size: file.size,
			uploadedAt: Date.now(),
			url: urlPromise
		});

		// we await since we don't want the onUpload to be complete until the files are actually uploaded
		await urlPromise;
	};

	let files = $.state($.proxy([]));
	let date = new SvelteDate();

	onDestroy(async () => {
		for (const file of $.get(files)) {
			URL.revokeObjectURL(await file.url);
		}
	});

	$.user_effect(() => {
		const interval = setInterval(
			() => {
				date.setTime(Date.now());
			},
			10
		);

		return () => {
			clearInterval(interval);
		};
	});

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

	var div_1 = $.sibling(node, 2);

	$.each(div_1, 23, () => $.get(files), (file) => file.name, ($$anchor, file, i) => {
		var div_2 = root_1();
		var div_3 = $.child(div_2);
		var node_2 = $.child(div_3);

		$.await(node_2, () => $.get(file).url, null, ($$anchor, src) => {
			var div_4 = root();
			var img = $.only_child(div_4);

			$.template_effect(() => {
				$.set_attribute(img, 'src', $.get(src));
				$.set_attribute(img, 'alt', $.get(file).name);
			});

			$.append($$anchor, div_4);
		});

		var div_5 = $.sibling(node_2, 2);
		var span = $.child(div_5);
		var text = $.only_child(span, true);
		var span_1 = $.sibling(span, 2);
		var text_1 = $.only_child(span_1, true);

		$.reset(div_5);
		$.reset(div_3);

		var node_3 = $.sibling(div_3, 2);

		$.await(
			node_3,
			() => $.get(file).url,
			($$anchor) => {
				{
					let $0 = $.derived(() => (date.getTime() - $.get(file).uploadedAt) / 1000 * 100);

					Progress($$anchor, {
						class: 'h-2 w-full grow',
						get value() {
							return $.get($0);
						},
						max: 100
					});
				}
			},
			($$anchor, url) => {
				Button($$anchor, {
					variant: 'outline',
					size: 'icon',
					onclick: () => {
						URL.revokeObjectURL($.get(url));

						$.set(
							files,
							[
								...$.get(files).slice(0, $.get(i)),
								...$.get(files).slice($.get(i) + 1)
							],
							true
						);
					},

					children: ($$anchor, $$slotProps) => {
						XIcon($$anchor, {});
					},
					$$slots: { default: true }
				});
			}
		);

		$.reset(div_2);

		$.template_effect(
			($0) => {
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