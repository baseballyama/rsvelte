import * as $ from 'svelte/internal/server';
import { fade } from 'svelte/transition';
import { s } from '$lib/client/localization.svelte';
import { keyboardNavigation } from '$lib/stores/keyboardNavigation.svelte';

export default function KeyboardShortcutsHelp($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Note: Keyboard handling (? and Esc) is done in the parent +page.svelte
		// to avoid conflicts with global handlers
		// Full help sections - using derived to support reactivity with language changes
		const helpSections = $.derived(() => [
			{
				title: s('keyboard.section.navigation'),
				shortcuts: [
					{ key: 'j', desc: s('keyboard.action.moveNext') },
					{ key: 'k', desc: s('keyboard.action.movePrevious') },
					{ key: 'gg', desc: s('keyboard.action.jumpFirst') },
					{ key: 'G', desc: s('keyboard.action.jumpLast') },
					{ key: 'h', desc: s('keyboard.action.previousCategory') },
					{ key: 'l', desc: s('keyboard.action.nextCategory') },
					{ key: 'Esc', desc: s('keyboard.action.clearSelection') }
				]
			},

			{
				title: s('keyboard.section.storyActions'),
				shortcuts: [
					{ key: 'Enter', desc: s('keyboard.action.toggleExpand') },
					{ key: 'o', desc: s('keyboard.action.openStory') },
					{ key: 'x', desc: s('keyboard.action.closeStory') },
					{ key: 'm', desc: s('keyboard.action.toggleRead') }
				]
			},

			{
				title: s('keyboard.section.global'),
				shortcuts: [
					{ key: '⌘K', desc: s('keyboard.action.searchMac') },
					{ key: 'Ctrl+K', desc: s('keyboard.action.searchWindows') },
					{ key: '?', desc: s('keyboard.action.toggleHelp') }
				]
			}
		]);

		if (keyboardNavigation.showHelp) {
			$$renderer.push(`<!--[0--><div class="fixed inset-0 z-modal bg-white dark:bg-gray-900 overflow-auto help-page svelte-1wy194f" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts help"><div class="max-w-4xl mx-auto px-4 py-8"><div class="mb-8"><h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">${$.escape(s('keyboard.help.title'))}</h1> <p class="text-sm text-gray-600 dark:text-gray-400">${$.html(s('keyboard.help.closeInstructions', {
				key1: '<kbd class="kbd-key-small">?</kbd>',
				key2: '<kbd class="kbd-key-small">Esc</kbd>'
			}))}</p></div> <!--[-->`);

			const each_array = $.ensure_array_like(helpSections());

			for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
				let section = each_array[$$index_1];

				$$renderer.push(`<div class="mb-8"><h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">${$.escape(section.title)}</h2> <dl class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2"><!--[-->`);

				const each_array_1 = $.ensure_array_like(section.shortcuts);

				for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
					let shortcut = each_array_1[$$index];

					$$renderer.push(`<div class="flex items-center gap-2"><dt class="block"><kbd class="kbd-key svelte-1wy194f">${$.escape(shortcut.key)}</kbd></dt> <dd class="block flex-1 text-gray-700 dark:text-gray-300">${$.escape(shortcut.desc)}</dd></div>`);
				}

				$$renderer.push(`<!--]--></dl></div>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}