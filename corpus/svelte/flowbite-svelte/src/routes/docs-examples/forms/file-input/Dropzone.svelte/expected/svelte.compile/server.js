import * as $ from 'svelte/internal/server';
import { Dropzone } from "flowbite-svelte";

export default function Dropzone_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let filesInDropzone = null;

		function handleOnChange(event) {
			console.log("handleOnChange fired.");

			const target = event.target;

			filesInDropzone = target.files;
		}

		function handleOnDrop(event) {
			console.log("handleOnDrop fired.");
			event.preventDefault();
			filesInDropzone = event.dataTransfer?.files ?? null;
		}

		function showFiles(files) {
			console.log("showFiles fired.");

			if (!files || files.length === 0) return "No files selected.";

			return Array.from(files).map((file) => file.name).join(", ");
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Dropzone($$renderer, {
				id: 'my-awesome-dropzone',
				onChange: handleOnChange,
				onDrop: handleOnDrop,
				multiple: true,
				accept: '.jpg,.png,.gif',
				get files() {
					return filesInDropzone;
				},

				set files($$value) {
					filesInDropzone = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<svg aria-hidden="true" class="mb-3 h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg> `);

					if (!filesInDropzone || filesInDropzone.length === 0) {
						$$renderer.push(`<!--[0--><p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p> <p class="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>`);
					} else {
						$$renderer.push(`<!--[-1--><p class="text-sm text-green-600">${$.escape(showFiles(filesInDropzone))}</p> <button class="mt-2 text-sm text-red-500 hover:underline">Clear Files</button>`);
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}