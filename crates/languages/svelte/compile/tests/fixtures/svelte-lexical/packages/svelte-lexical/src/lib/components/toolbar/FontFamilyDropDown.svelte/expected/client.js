import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { $patchStyleText as patchStyleText } from '@lexical/selection';
import { $getSelection as getSelection } from 'lexical';
import { getContext } from 'svelte';
import { getActiveEditor, getIsEditable } from '$lib/core/composerContext.js';
import DropDown from '../generic/dropdown/DropDown.svelte';
import DropDownItem from '../generic/dropdown/DropDownItem.svelte';

var root = $.from_html(`<span class="text"> </span>`);

export default function FontFamilyDropDown($$anchor, $$props) {
	$.push($$props, true);

	const $activeEditor = () => $.store_get(activeEditor, '$activeEditor', $$stores);
	const $isEditable = () => $.store_get(isEditable, '$isEditable', $$stores);
	const $value = () => $.store_get(value, '$value', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const FONT_FAMILY_OPTIONS = [
		['Arial', 'Arial'],
		['Courier New', 'Courier New'],
		['Georgia', 'Georgia'],
		['Times New Roman', 'Times New Roman'],
		['Trebuchet MS', 'Trebuchet MS'],
		['Verdana', 'Verdana']
	];

	const activeEditor = getActiveEditor();
	const value = getContext('fontFamily');
	const style = 'font-family';
	const isEditable = getIsEditable();

	const handleClick = (option) => {
		$activeEditor().update(() => {
			const selection = getSelection();

			if (selection !== null) {
				patchStyleText(selection, { [style]: option });
			}
		});
	};

	const buttonAriaLabel = 'Formatting options for font family';

	{
		let $0 = $.derived(() => !$isEditable());

		DropDown($$anchor, {
			get disabled() {
				return $.get($0);
			},
			buttonClassName: 'toolbar-item ' + style,
			get buttonLabel() {
				return $value();
			},
			buttonIconClassName: 'icon block-type font-family',
			buttonAriaLabel,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.each(node, 17, () => FONT_FAMILY_OPTIONS, $.index, ($$anchor, $$item) => {
					var $$array = $.derived(() => $.to_array($.get($$item), 2));
					let option = () => $.get($$array)[0];
					let text = () => $.get($$array)[1];

					{
						let $0 = $.derived(() => `item ${$value() === option() ? 'active dropdown-item-active' : ''}`);

						DropDownItem($$anchor, {
							get class() {
								return $.get($0);
							},
							onclick: () => handleClick(option()),
							children: ($$anchor, $$slotProps) => {
								var span = root();
								var text_1 = $.only_child(span, true);

								$.template_effect(() => $.set_text(text_1, text()));
								$.append($$anchor, span);
							},
							$$slots: { default: true }
						});
					}
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
	$$cleanup();
}