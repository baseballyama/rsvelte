import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { usePreviewControls } from "@components/preview-ctx.svelte";
import Preview from "@components/preview.svelte";
import { getters } from "melt";
import { FileUpload } from "melt/builders";
import { SvelteSet } from "svelte/reactivity";
import UploadIcon from "~icons/tabler/cloud-upload";
import XIcon from "~icons/tabler/x";

var root = $.from_html(`<p class="text-accent-400 font-medium">Drop files here</p>`);
var root_1 = $.from_html(`<span> </span>`);
var root_2 = $.from_html(`<div class="pointer-events-none flex flex-col items-center gap-2"><!> <p class="text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold text-gray-900 dark:text-white">Click to upload</span> or drag and drop</p> <p class="text-xs text-gray-500 dark:text-gray-400"> <!></p></div>`);

var root_3 = $.from_html(`<li class="flex items-center gap-2 overflow-hidden py-3"><div class="flex min-w-0 flex-1 items-center justify-between gap-8"><div class="min-w-0 flex-1"><p class="truncate text-sm font-medium text-gray-900 dark:text-white"> </p> <p class="truncate text-xs text-gray-500 dark:text-gray-400"> </p></div> <div class="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400"> </div></div> <button class="grid place-items-center bg-transparent text-gray-500
							hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-300"><!></button></li>`);

var root_4 = $.from_html(`<ul class="w-[300px] list-none divide-y divide-gray-200 p-0 dark:divide-gray-700"></ul>`);
var root_5 = $.from_html(`<div class="flex flex-col items-center gap-4"><input/> <div><!></div> <!></div>`);

export default function File_upload($$anchor, $$props) {
	$.push($$props, true);

	const controls = usePreviewControls({
		multiple: { type: "boolean", label: "Multiple files", defaultValue: true },
		avoidDuplicates: {
			type: "boolean",
			label: "Avoid duplicates",
			defaultValue: true
		},
		accept: { type: "string", label: "Accept", defaultValue: "" },
		maxSize: {
			type: "number",
			label: "Max size (bytes)",
			defaultValue: 5 * 1024 * 1024 // 5MB
		}
	});

	const fileUpload = new FileUpload({
		...getters(controls),
		selected: [new File([""], "empty.txt", { type: "text/plain" })],
		onError: (e) => {
			console.log(e);
		}
	});

	const files = $.derived(() => {
		if (fileUpload.selected instanceof SvelteSet) {
			return Array.from(fileUpload.selected);
		}

		return [fileUpload.selected].filter((f) => !!f);
	});

	function formatFileSize(bytes) {
		if (bytes === 0) return "0 Bytes";

		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	}

	Preview($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var div = root_5();
			var input = $.child(div);

			$.attribute_effect(input, () => ({ ...fileUpload.input }), void 0, void 0, void 0, void 0, true);

			var div_1 = $.sibling(input, 2);

			$.attribute_effect(div_1, () => ({
				...fileUpload.dropzone,
				class: 'relative flex min-h-[200px] w-[300px] cursor-pointer\n				flex-col items-center justify-center gap-4\n				rounded-xl border-2 border-dashed border-gray-300 bg-gray-50\n				p-6 text-center transition-colors\n				hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700',
				[$.CLASS]: { '!border-accent-500': fileUpload.isDragging }
			}));

			var node = $.child(div_1);

			{
				var consequent = ($$anchor) => {
					var p = root();

					$.append($$anchor, p);
				};

				var alternate = ($$anchor) => {
					var div_2 = root_2();
					var node_1 = $.child(div_2);

					UploadIcon(node_1, { class: 'text-4xl' });

					var p_1 = $.sibling(node_1, 4);
					var text = $.child(p_1);
					var node_2 = $.sibling(text);

					{
						var consequent_1 = ($$anchor) => {
							var span = root_1();
							var text_1 = $.only_child(span);

							$.template_effect(($0) => $.set_text(text_1, `(up to ${$0 ?? ''})`), [() => formatFileSize(controls.maxSize)]);
							$.append($$anchor, span);
						};

						$.if(node_2, ($$render) => {
							if (controls.maxSize) $$render(consequent_1);
						});
					}

					$.reset(p_1);
					$.reset(div_2);
					$.template_effect(() => $.set_text(text, `${controls.accept ?? ''} `));
					$.append($$anchor, div_2);
				};

				$.if(node, ($$render) => {
					if (fileUpload.isDragging) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(div_1);

			var node_3 = $.sibling(div_1, 2);

			{
				var consequent_2 = ($$anchor) => {
					var ul = root_4();

					$.each(ul, 21, () => $.get(files), $.index, ($$anchor, file) => {
						var li = root_3();
						var div_3 = $.child(li);
						var div_4 = $.child(div_3);
						var p_2 = $.child(div_4);
						var text_2 = $.only_child(p_2, true);
						var p_3 = $.sibling(p_2, 2);
						var text_3 = $.only_child(p_3, true);

						$.reset(div_4);

						var div_5 = $.sibling(div_4, 2);
						var text_4 = $.only_child(div_5, true);

						$.reset(div_3);

						var button = $.sibling(div_3, 2);
						var node_4 = $.child(button);

						XIcon(node_4, {});
						$.reset(button);
						$.reset(li);

						$.template_effect(
							($0) => {
								$.set_text(text_2, $.get(file).name);
								$.set_text(text_3, $.get(file).type);
								$.set_text(text_4, $0);
							},
							[() => formatFileSize($.get(file).size)]
						);

						$.delegated('click', button, () => {
							fileUpload.remove($.get(file));
						});

						$.append($$anchor, li);
					});

					$.reset(ul);
					$.append($$anchor, ul);
				};

				$.if(node_3, ($$render) => {
					if ($.get(files).length > 0) $$render(consequent_2);
				});
			}

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);