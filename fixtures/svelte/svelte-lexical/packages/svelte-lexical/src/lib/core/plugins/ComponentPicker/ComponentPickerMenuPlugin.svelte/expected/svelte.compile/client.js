import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TypeAheadMenu from '$lib/components/generic/contextmenu/TypeAheadMenu.svelte';
import Portal from '$lib/components/generic/portal/Portal.svelte';
import ComponentPickerMenuItem from './ComponentPickerMenuItem.svelte';
import { getBaseOptions, getDynamicOptions } from './getOptions.js';
import { useBasicTypeaheadTriggerMatch } from '$lib/components/generic/contextmenu/typeAheadMenuHelpers.js';
import { getEditor } from '$lib/core/composerContext.js';

var root = $.from_html(`<div class="typeahead-popover component-picker-menu svelte-lexical"><ul></ul></div> ,`, 1);

export default function ComponentPickerMenuPlugin($$anchor, $$props) {
	$.push($$props, true);

	const /*, showModal*/
	menuRenderFn = ($$anchor, anchorElementRef = $.noop, $$arg1) => {
		let selectedIndex = () => ($$arg1?.()).selectedIndex;
		let selectOptionAndCleanUp = () => ($$arg1?.()).selectOptionAndCleanUp;
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				Portal($$anchor, {
					get target() {
						return anchorElementRef();
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var div = $.first_child(fragment_2);
						var ul = $.child(div);

						$.each(ul, 23, () => $.get(options), (option) => option.key, ($$anchor, option, i) => {
							{
								let $0 = $.derived(() => selectedIndex().value === $.get(i));

								ComponentPickerMenuItem($$anchor, {
									get index() {
										return $.get(i);
									},

									get isSelected() {
										return $.get($0);
									},

									onclick: () => {
										selectedIndex().value = $.get(i);
										selectOptionAndCleanUp()($.get(option));
									},

									onmouseenter: () => {
										selectedIndex().value = $.get(i);
									},

									get option() {
										return $.get(option);
									}
								});
							}
						});

						$.reset(ul);
						$.reset(div);
						$.next();
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			};

			$.if(node, ($$render) => {
				if (anchorElementRef() && $.get(options).length) $$render(consequent);
			});
		}

		$.append($$anchor, fragment);
	};

	const editor = getEditor();
	let queryString = $.state(null);
	const checkForTriggerMatch = useBasicTypeaheadTriggerMatch('/', { allowWhitespace: true, minLength: 0 });
	let options = $.state($.proxy([]));
	const baseOptions = getBaseOptions(editor);

	$.user_effect(() => {
		if (!$.get(queryString)) {
			$.set(options, baseOptions, true);

			return;
		}

		const regex = new RegExp($.get(queryString), 'i');

		$.set(
			options,
			[
				...getDynamicOptions(editor, $.get(queryString)),
				...baseOptions.filter((option) => regex.test(option.title) || option.keywords.some((keyword) => regex.test(keyword)))
			],
			true
		);
	});

	const onSelectOption = (selectedOption, nodeToRemove, closeMenu, matchingString) => {
		editor.update(() => {
			nodeToRemove?.remove();
			selectedOption.onSelect(matchingString);
			closeMenu();
		});
	};

	TypeAheadMenu($$anchor, {
		onQueryChange: (value) => {
			$.set(queryString, value, true);
		},
		onSelectOption,
		get triggerFn() {
			return checkForTriggerMatch;
		},

		get options() {
			return $.get(options);
		},

		get menuRenderFn() {
			return menuRenderFn;
		}
	});

	$.pop();
}