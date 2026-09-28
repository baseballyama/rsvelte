import * as $ from 'svelte/internal/server';
import { Fileupload, Helper } from "flowbite-svelte";

export default function Clearable($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let selectedFiles = null;

		let fileNames = $.derived(() => selectedFiles
			? Array.from(selectedFiles).map((file) => file.name).join(", ")
			: "No files selected");

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Fileupload($$renderer, {
				clearable: true,
				multiple: true,
				get files() {
					return selectedFiles;
				},

				set files($$value) {
					selectedFiles = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Helper($$renderer, {
				color: 'emerald',
				class: 'mt-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Selected files: ${$.escape(fileNames())}`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}