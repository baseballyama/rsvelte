import * as $ from 'svelte/internal/server';
import { useStudio } from '../../internal/extensions.js';
import { transactionsScope } from './types.js';

export default function Changes($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { useExtension } = useStudio();
		const extension = useExtension(transactionsScope);

		const fileNames = $.derived(() => {
			if (!extension.state.queue) return [];

			return [
				...new Set(extension.state.queue.syncQueue.map((t) => t.moduleId.replace(/^.*[\\/]/, '')))
			];
		});

		$$renderer.push(`<div class="svelte-82x53i">`);

		if (fileNames().length) {
			$$renderer.push(`<!--[0-->Unsaved changes in:<br/> <ul class="svelte-82x53i"><!--[-->`);

			const each_array = $.ensure_array_like(fileNames());

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let fileName = each_array[$$index];

				$$renderer.push(`<li>${$.escape(fileName)}</li>`);
			}

			$$renderer.push(`<!--]--></ul>`);
		} else {
			$$renderer.push(`<!--[-1-->Up-to-date`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}