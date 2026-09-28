import * as $ from 'svelte/internal/server';
import { Button } from '../ui/button';
import { X } from '@lucide/svelte';

export default function ImageLightbox($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { imageUrl, onClose } = $$props;

		function handleKeydown(e) {
			if (e.key === 'Escape') {
				e.preventDefault();
				onClose();
			}
		}

		$$renderer.push(`<div role="dialog" aria-modal="true" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80"${$.attr('tabindex', 0)}><img${$.attr('src', imageUrl)} alt="Expanded screenshot" class="max-h-[80vh] max-w-[80vw] object-contain"/> `);

		Button($$renderer, {
			variant: 'ghost',
			size: 'icon',
			class: 'absolute top-4 right-4 text-white hover:text-white',
			onclick: onClose,
			children: ($$renderer) => {
				X($$renderer, { class: 'size-6' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}