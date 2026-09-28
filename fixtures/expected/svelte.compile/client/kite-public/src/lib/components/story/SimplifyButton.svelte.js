import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { simplifyStory } from '$lib/services/translateApi';

var root = $.from_html(`<div class="py-4 px-4 flex items-center justify-center gap-2"><svg class="animate-spin h-4 w-4 text-gray-600 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> <span class="text-sm text-gray-600 dark:text-gray-400">Simplifying...</span></div>`);
var root_1 = $.from_html(`<div class="py-1"><div class="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Choose Reading Level</div> <button class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Very Simple</button> <button class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Simple</button> <button class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Normal</button></div>`);
var root_2 = $.from_html(`<div class="px-4 py-2 text-xs text-red-600 dark:text-red-400 border-t border-gray-200 dark:border-gray-700"> </div>`);
var root_3 = $.from_html(`<div class="w-48 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"><!> <!></div>`);

export default function SimplifyButton($$anchor, $$props) {
	$.push($$props, true);

	let languageCode = $.prop($$props, 'languageCode', 3, 'en'),
		isOpen = $.prop($$props, 'isOpen', 3, false);

	// State
	let isSimplifying = $.state(false);

	let error = $.state(null);

	// Handle simplification
	async function handleSimplify(level) {
		$.set(isSimplifying, true);
		$.set(error, null);

		try {
			const result = await simplifyStory($$props.story, languageCode(), level);

			if (result.success && result.simplifiedStory) {
				if ($$props.onSimplified) {
					$$props.onSimplified(result.simplifiedStory, level);
				}

				if ($$props.onClose) $$props.onClose();
			} else {
				$.set(error, result.error || 'Failed to simplify story', true);
			}
		} catch(err) {
			$.set(error, err instanceof Error ? err.message : 'An error occurred', true);
		} finally {
			$.set(isSimplifying, false);
		}
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var div = root_3();
			var node_1 = $.child(div);

			{
				var consequent = ($$anchor) => {
					var div_1 = root();

					$.append($$anchor, div_1);
				};

				var alternate = ($$anchor) => {
					var div_2 = root_1();
					var button = $.sibling($.child(div_2), 2);
					var button_1 = $.sibling(button, 2);
					var button_2 = $.sibling(button_1, 2);

					$.reset(div_2);

					$.template_effect(() => {
						button.disabled = $.get(isSimplifying);
						button_1.disabled = $.get(isSimplifying);
						button_2.disabled = $.get(isSimplifying);
					});

					$.delegated('click', button, () => handleSimplify('very-simple'));
					$.delegated('click', button_1, () => handleSimplify('simple'));
					$.delegated('click', button_2, () => handleSimplify('normal'));
					$.append($$anchor, div_2);
				};

				$.if(node_1, ($$render) => {
					if ($.get(isSimplifying)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent_1 = ($$anchor) => {
					var div_3 = root_2();
					var text = $.only_child(div_3, true);

					$.template_effect(() => $.set_text(text, $.get(error)));
					$.append($$anchor, div_3);
				};

				$.if(node_2, ($$render) => {
					if ($.get(error)) $$render(consequent_1);
				});
			}

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (isOpen()) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);