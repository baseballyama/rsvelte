import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { simplifyStory } from '$lib/services/translateApi';

export default function SimplifyButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			story,
			languageCode = 'en',
			onSimplified,
			isOpen = false,
			onClose
		} = $$props;

		// State
		let isSimplifying = false;

		let error = null;

		// Handle simplification
		async function handleSimplify(level) {
			isSimplifying = true;
			error = null;

			try {
				const result = await simplifyStory(story, languageCode, level);

				if (result.success && result.simplifiedStory) {
					if (onSimplified) {
						onSimplified(result.simplifiedStory, level);
					}

					if (onClose) onClose();
				} else {
					error = result.error || 'Failed to simplify story';
				}
			} catch(err) {
				error = err instanceof Error ? err.message : 'An error occurred';
			} finally {
				isSimplifying = false;
			}
		}

		if (isOpen) {
			$$renderer.push(`<!--[0--><div class="w-48 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">`);

			if (isSimplifying) {
				$$renderer.push(`<!--[0--><div class="py-4 px-4 flex items-center justify-center gap-2"><svg class="animate-spin h-4 w-4 text-gray-600 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> <span class="text-sm text-gray-600 dark:text-gray-400">Simplifying...</span></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="py-1"><div class="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Choose Reading Level</div> <button class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"${$.attr('disabled', isSimplifying, true)}>Very Simple</button> <button class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"${$.attr('disabled', isSimplifying, true)}>Simple</button> <button class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"${$.attr('disabled', isSimplifying, true)}>Normal</button></div>`);
			}

			$$renderer.push(`<!--]--> `);

			if (error) {
				$$renderer.push(`<!--[0--><div class="px-4 py-2 text-xs text-red-600 dark:text-red-400 border-t border-gray-200 dark:border-gray-700">${$.escape(error)}</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}