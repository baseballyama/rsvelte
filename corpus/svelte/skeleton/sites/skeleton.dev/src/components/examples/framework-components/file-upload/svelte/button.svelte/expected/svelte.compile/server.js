import * as $ from 'svelte/internal/server';
import { FileUpload } from '@skeletonlabs/skeleton-svelte';

export default function Button($$renderer) {
	FileUpload($$renderer, {
		class: 'w-fit',
		onFileAccept: console.log,
		children: ($$renderer) => {
			if (FileUpload.Trigger) {
				$$renderer.push('<!--[-->');

				FileUpload.Trigger($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Browse Files`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (FileUpload.HiddenInput) {
				$$renderer.push('<!--[-->');
				FileUpload.HiddenInput($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}