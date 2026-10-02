import * as $ from 'svelte/internal/server';
import TypeAheadMenu from '$lib/components/generic/contextmenu/TypeAheadMenu.svelte';
import Portal from '$lib/components/generic/portal/Portal.svelte';
import ComponentPickerMenuItem from './ComponentPickerMenuItem.svelte';
import { getBaseOptions, getDynamicOptions } from './getOptions.js';
import { useBasicTypeaheadTriggerMatch } from '$lib/components/generic/contextmenu/typeAheadMenuHelpers.js';
import { getEditor } from '$lib/core/composerContext.js';

export default function ComponentPickerMenuPlugin($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const editor = getEditor();
		let queryString = null;
		const checkForTriggerMatch = useBasicTypeaheadTriggerMatch('/', { allowWhitespace: true, minLength: 0 });
		let options = [];
		const baseOptions = getBaseOptions(editor /*, showModal*/);

		const onSelectOption = (selectedOption, nodeToRemove, closeMenu, matchingString) => {
			editor.update(() => {
				nodeToRemove?.remove();
				selectedOption.onSelect(matchingString);
				closeMenu();
			});
		};

		function menuRenderFn(
			$$renderer,
			anchorElementRef,
			{ selectedIndex, selectOptionAndCleanUp }
		) {
			if (anchorElementRef && options.length) {
				$$renderer.push('<!--[0-->');

				Portal($$renderer, {
					target: anchorElementRef,
					children: ($$renderer) => {
						$$renderer.push(`<div class="typeahead-popover component-picker-menu svelte-lexical"><ul><!--[-->`);

						const each_array = $.ensure_array_like(options);

						for (let i = 0, $$length = each_array.length; i < $$length; i++) {
							let option = each_array[i];

							ComponentPickerMenuItem($$renderer, {
								index: i,
								isSelected: selectedIndex.value === i,
								onclick: () => {
									selectedIndex.value = i;
									selectOptionAndCleanUp(option);
								},

								onmouseenter: () => {
									selectedIndex.value = i;
								},
								option
							});
						}

						$$renderer.push(`<!--]--></ul></div> ,`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		TypeAheadMenu($$renderer, {
			onQueryChange: (value) => {
				queryString = value;
			},
			onSelectOption,
			triggerFn: checkForTriggerMatch,
			options,
			menuRenderFn
		});
	});
}