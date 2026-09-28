import * as $ from 'svelte/internal/server';
import BaseModal from './BaseModal.svelte';

export default function WikipediaPopup($$renderer, $$props) {
	// Props
	let { visible, title, content, imageUrl, onClose } = $$props;

	BaseModal($$renderer, {
		isOpen: visible,
		onClose,
		title,
		size: 'md',
		position: 'center',
		ariaLabel: 'Wikipedia article information',
		children: ($$renderer) => {
			$$renderer.push(`<div class="p-6">`);

			if (imageUrl) {
				$$renderer.push(`<!--[0--><img${$.attr('src', imageUrl)}${$.attr('alt', title)} class="mb-4 w-full rounded-lg h-full object-contain"/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <p class="text-gray-700 dark:text-gray-300">${$.escape(content)}</p> <a${$.attr('href', `https://en.wikipedia.org/wiki/${$.stringify(encodeURIComponent(title))}`)} target="_blank" rel="noopener noreferrer" class="mt-4 inline-block text-blue-500 hover:underline">Read more on Wikipedia →</a></div>`);
		},
		$$slots: { default: true }
	});
}