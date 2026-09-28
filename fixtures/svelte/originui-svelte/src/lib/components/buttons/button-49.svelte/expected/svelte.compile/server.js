import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import IconCircleUserRound from '@lucide/svelte/icons/circle-user-round';
import IconX from '@lucide/svelte/icons/x';

export default function Button_49($$renderer) {
	let fileInput;
	let fileName = null;
	let previewUrl = null;

	function handleThumbnailClick() {
		fileInput.click();
	}

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

	$$renderer.push(`<div><div class="relative inline-flex">`);

	Button($$renderer, {
		variant: 'outline',
		class: 'relative size-16 overflow-hidden',
		onclick: handleThumbnailClick,
		'aria-label': previewUrl ? 'Change image' : 'Upload image',
		children: ($$renderer) => {
			if (previewUrl) {
				$$renderer.push(`<!--[0--><img class="absolute inset-0 h-full w-full object-cover"${$.attr('src', previewUrl)} alt="Preview of uploaded file"/>`);
			} else {
				$$renderer.push(`<!--[-1--><div aria-hidden="true">`);

				IconCircleUserRound($$renderer, {
					class: 'opacity-60',
					width: '16',
					height: '16',
					'stroke-width': '2'
				});

				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	if (previewUrl) {
		$$renderer.push('<!--[0-->');

		Button($$renderer, {
			onclick: handleRemove,
			size: 'icon',
			variant: 'destructive',
			class: 'border-background absolute -top-2 -right-2 size-6 rounded-full border-2',
			'aria-label': 'Remove image',
			children: ($$renderer) => {
				IconX($$renderer, { size: 16 });
			},
			$$slots: { default: true }
		});
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <input type="file" class="hidden" accept="image/*" aria-label="Upload image file"/></div> `);

	if (fileName) {
		$$renderer.push(`<!--[0--><p class="text-muted-foreground mt-2 text-xs lg:opacity-0 lg:group-focus-within/item:opacity-100 lg:group-hover/item:opacity-100">${$.escape(fileName)}</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <div class="sr-only" aria-live="polite" role="status">${$.escape(previewUrl
		? 'Image uploaded and preview available'
		: 'No image uploaded')}</div></div>`);
}