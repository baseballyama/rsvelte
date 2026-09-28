import * as $ from 'svelte/internal/server';
import { Upload, AlertCircle } from 'lucide-svelte';
import { onMount } from 'svelte';

export default function DropZone($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			onupload,
			class: classname = '',
			invalid = false,
			drop_text = 'Drop your site file here or click to browse',
			accept = '.json'
		} = $$props;

		let file = null;
		let isDragging = false;
		let inputEl;

		function handleDragOver(e) {
			e.preventDefault();
			e.stopPropagation();
			isDragging = true;
		}

		function handleDragLeave(e) {
			e.preventDefault();
			e.stopPropagation();
			isDragging = false;
		}

		function handleDrop(e) {
			e.preventDefault();
			e.stopPropagation();
			isDragging = false;

			const files = e.dataTransfer?.files;

			if (files?.length) {
				handleFiles(files);
			}
		}

		function handle_paste(e) {
			e.preventDefault();

			const items = e.clipboardData?.items;

			if (!items) return;

			for (const item of items) {
				if (item.type.indexOf('image') !== -1) {
					const file = item.getAsFile();

					if (file) handleFiles([file]);

					break;
				}
			}
		}

		function handleFiles(files) {
			file = files[0];
			onupload(file);
		}

		function handle_key_down(e) {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				handle_click();
			}
		}

		function handle_click() {
			inputEl?.click();
		}

		onMount(() => {
			window.addEventListener('paste', handle_paste);

			return () => {
				window.removeEventListener('paste', handle_paste);
			};
		});

		$$renderer.push(`<div role="button" tabindex="0"${$.attr_class(`${$.stringify(classname)} relative p-6 rounded-lg border-2 border-dashed transition-colors duration-200 ease-in-out cursor-pointer flex flex-col items-center justify-center gap-2 ${isDragging
			? 'border-blue-500 bg-blue-500/10'
			: file
				? 'border-green-500/50 bg-green-500/5'
				: 'border-gray-700 hover:border-gray-600'}`)}><input type="file" class="hidden"${$.attr('accept', accept)}/> `);

		if (invalid) {
			$$renderer.push(`<!--[0--><div class="flex flex-col items-center text-sm text-destructive">`);
			AlertCircle($$renderer, { class: 'h-5 w-5 mb-2' });
			$$renderer.push(`<!----> <span>File invalid. Click or drop to try again.</span></div>`);
		} else if (file) {
			$$renderer.push(`<!--[1--><div class="flex flex-col items-center text-sm text-gray-400">`);
			Upload($$renderer, { class: 'h-5 w-5 mb-2 text-green-500' });
			$$renderer.push(`<!----> <span class="font-medium text-green-500">${$.escape(file.name)}</span> <span>Click or drop to replace</span></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="flex flex-col items-center text-sm text-gray-400 text-center">`);
			Upload($$renderer, { class: 'h-5 w-5 mb-2' });
			$$renderer.push(`<!----> <span>${$.escape(drop_text)}</span> <span class="text-xs text-gray-500">Accepts ${$.escape(accept)} files</span></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}