import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade } from 'svelte/transition';
import { s } from '$lib/client/localization.svelte';
import { keyboardNavigation } from '$lib/stores/keyboardNavigation.svelte';

var root = $.from_html(`<div class="flex items-center gap-2"><dt class="block"><kbd class="kbd-key svelte-1wy194f"> </kbd></dt> <dd class="block flex-1 text-gray-700 dark:text-gray-300"> </dd></div>`);
var root_1 = $.from_html(`<div class="mb-8"><h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4"> </h2> <dl class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2"></dl></div>`);
var root_2 = $.from_html(`<div class="fixed inset-0 z-modal bg-white dark:bg-gray-900 overflow-auto help-page svelte-1wy194f" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts help"><div class="max-w-4xl mx-auto px-4 py-8"><div class="mb-8"><h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2"> </h1> <p class="text-sm text-gray-600 dark:text-gray-400"></p></div> <!></div></div>`);

export default function KeyboardShortcutsHelp($$anchor, $$props) {
	$.push($$props, true);

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

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root_2();
			var div_1 = $.child(div);
			var div_2 = $.child(div_1);
			var h1 = $.child(div_2);
			var text = $.only_child(h1, true);
			var p = $.sibling(h1, 2);

			$.html(
				p,
				() => s('keyboard.help.closeInstructions', {
					key1: '<kbd class="kbd-key-small">?</kbd>',
					key2: '<kbd class="kbd-key-small">Esc</kbd>'
				}),
				true
			);

			$.reset(p);
			$.reset(div_2);

			var node_1 = $.sibling(div_2, 2);

			$.each(node_1, 17, () => $.get(helpSections), $.index, ($$anchor, section) => {
				var div_3 = root_1();
				var h2 = $.child(div_3);
				var text_1 = $.only_child(h2, true);
				var dl = $.sibling(h2, 2);

				$.each(dl, 21, () => $.get(section).shortcuts, $.index, ($$anchor, shortcut) => {
					var div_4 = root();
					var dt = $.child(div_4);
					var kbd = $.child(dt);
					var text_2 = $.only_child(kbd, true);

					$.reset(dt);

					var dd = $.sibling(dt, 2);
					var text_3 = $.only_child(dd, true);

					$.reset(div_4);

					$.template_effect(() => {
						$.set_text(text_2, $.get(shortcut).key);
						$.set_text(text_3, $.get(shortcut).desc);
					});

					$.append($$anchor, div_4);
				});

				$.reset(dl);
				$.reset(div_3);
				$.template_effect(() => $.set_text(text_1, $.get(section).title));
				$.append($$anchor, div_3);
			});

			$.reset(div_1);
			$.reset(div);
			$.template_effect(($0) => $.set_text(text, $0), [() => s('keyboard.help.title')]);
			$.transition(3, div, () => fade, () => ({ duration: 150 }));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (keyboardNavigation.showHelp) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}