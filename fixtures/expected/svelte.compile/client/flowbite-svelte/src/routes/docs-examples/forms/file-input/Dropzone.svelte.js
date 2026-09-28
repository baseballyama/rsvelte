import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Dropzone } from "flowbite-svelte";

var root = $.from_html(`<p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p> <p class="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>`, 1);
var root_1 = $.from_html(`<p class="text-sm text-green-600"> </p> <button class="mt-2 text-sm text-red-500 hover:underline">Clear Files</button>`, 1);
var root_2 = $.from_html(`<svg aria-hidden="true" class="mb-3 h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg> <!>`, 1);

export default function Dropzone_1($$anchor, $$props) {
	$.push($$props, true);

	let filesInDropzone = $.state(null);

	function handleOnChange(event) {
		console.log("handleOnChange fired.");

		const target = event.target;

		$.set(filesInDropzone, target.files, true);
	}

	function handleOnDrop(event) {
		console.log("handleOnDrop fired.");
		event.preventDefault();
		$.set(filesInDropzone, event.dataTransfer?.files ?? null, true);
	}

	function showFiles(files) {
		console.log("showFiles fired.");

		if (!files || files.length === 0) return "No files selected.";

		return Array.from(files).map((file) => file.name).join(", ");
	}

	Dropzone($$anchor, {
		id: 'my-awesome-dropzone',
		onChange: handleOnChange,
		onDrop: handleOnDrop,
		multiple: true,
		accept: '.jpg,.png,.gif',
		get files() {
			return $.get(filesInDropzone);
		},

		set files($$value) {
			$.set(filesInDropzone, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.sibling($.first_child(fragment_1), 2);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = root();

					$.next(2);
					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var fragment_3 = root_1();
					var p = $.first_child(fragment_3);
					var text = $.only_child(p, true);
					var button = $.sibling(p, 2);

					$.template_effect(($0) => $.set_text(text, $0), [() => showFiles($.get(filesInDropzone))]);
					$.delegated('click', button, () => $.set(filesInDropzone, null));
					$.append($$anchor, fragment_3);
				};

				$.if(node, ($$render) => {
					if (!$.get(filesInDropzone) || $.get(filesInDropzone).length === 0) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);