import * as $ from 'svelte/internal/server';
import { FileUploader } from "carbon-components-svelte";

export default function FileUploaderAdvancedFixture($$renderer) {
	/** @type {Array<{ file: File; reason: string }>} */
	let rejectedMax = [];

	let filesMax = [];
	let filesPrepend = [];
	let filesIcon = [];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<section data-testid="section-max">`);

		FileUploader($$renderer, {
			'data-testid': 'uploader-max',
			labelTitle: 'Max file size',
			labelDescription: 'Max 50 bytes.',
			multiple: true,
			maxFileSize: 50,
			status: 'edit',
			buttonLabel: 'Add file',
			iconDescription: 'Remove file',
			get files() {
				return filesMax;
			},

			set files($$value) {
				filesMax = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <p data-testid="rejected-max-len">${$.escape(rejectedMax.length)}</p> `);

		if (rejectedMax[0]) {
			$$renderer.push(`<!--[0--><p data-testid="rejected-max-reason">${$.escape(rejectedMax[0].reason)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></section> <section data-testid="section-prepend">`);

		FileUploader($$renderer, {
			'data-testid': 'uploader-prepend',
			labelTitle: 'Prepend order',
			multiple: true,
			orderFiles: 'prepend',
			status: 'edit',
			buttonLabel: 'Add files',
			iconDescription: 'Remove file',
			get files() {
				return filesPrepend;
			},

			set files($$value) {
				filesPrepend = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----></section> <section data-testid="section-icon-fn">`);

		FileUploader($$renderer, {
			'data-testid': 'uploader-icon-fn',
			labelTitle: 'Custom remove label',
			status: 'edit',
			buttonLabel: 'Add file',
			iconDescription: (ctx) => `Custom remove ${ctx.fileName}`,
			get files() {
				return filesIcon;
			},

			set files($$value) {
				filesIcon = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----></section>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}