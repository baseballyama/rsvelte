import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import IconCircleUserRound from '@lucide/svelte/icons/circle-user-round';

export default function Button_48($$renderer) {
	let fileInput;
	let files = null;
	let fileName = null;
	let previewUrl = null;

	const handleButtonClick = () => {
		fileInput.click();
	};

	const handleFileChange = (e) => {
		const file = e.currentTarget.files?.[0];

		if (file) {
			fileName = file.name;
			previewUrl = URL.createObjectURL(file);
		}
	};

	const handleRemove = () => {
		fileName = null;
		previewUrl = null;
		fileInput.value = '';
	};

	$$renderer.push(`<div><div class="inline-flex items-center space-x-2 rtl:space-x-reverse"><div class="border-input relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border" role="img"${$.attr('aria-label', previewUrl ? 'Preview of uploaded file' : 'Default user avatar')}>`);

	if (previewUrl) {
		$$renderer.push(`<!--[0--><img class="h-full w-full object-cover"${$.attr('src', previewUrl)} alt="Preview of uploaded file" width="32" height="32"/>`);
	} else {
		$$renderer.push(`<!--[-1--><div aria-hidden="true">`);
		IconCircleUserRound($$renderer, { class: 'opacity-60', size: 16, 'stroke-width': '2' });
		$$renderer.push(`<!----></div>`);
	}

	$$renderer.push(`<!--]--></div> <div class="relative inline-block">`);

	Button($$renderer, {
		onclick: handleButtonClick,
		children: ($$renderer) => {
			$$renderer.push(`<!---->${$.escape(fileName ? 'Change image' : 'Upload image')}`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <input type="file" class="hidden" accept="image/*" aria-label="Upload image file"/></div></div> `);

	if (fileName) {
		$$renderer.push(`<!--[0--><div class="mt-2 inline-flex gap-2 text-xs"><p class="text-muted-foreground truncate" aria-live="polite">${$.escape(fileName)}</p> <button class="font-medium text-red-500 hover:underline"${$.attr('aria-label', `Remove ${fileName}`)}>Remove</button></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <div class="sr-only" aria-live="polite" role="status">${$.escape(previewUrl
		? 'Image uploaded and preview available'
		: 'No image uploaded')}</div></div>`);
}