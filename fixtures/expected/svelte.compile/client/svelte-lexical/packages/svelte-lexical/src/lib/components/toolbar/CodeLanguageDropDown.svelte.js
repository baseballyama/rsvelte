import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	$isCodeNode as isCodeNode,
	CODE_LANGUAGE_FRIENDLY_NAME_MAP,
	getLanguageFriendlyName
} from '@lexical/code';

import { $getNodeByKey as getNodeByKey } from 'lexical';
import { getContext } from 'svelte';
import { getActiveEditor, getIsEditable } from '$lib/core/composerContext.js';
import DropDown from '../generic/dropdown/DropDown.svelte';
import DropDownItem from '../generic/dropdown/DropDownItem.svelte';

var root = $.from_html(`<span class="text"> </span>`);

export default function CodeLanguageDropDown($$anchor, $$props) {
	$.push($$props, true);

	const $activeEditor = () => $.store_get(activeEditor, '$activeEditor', $$stores);
	const $selectedElementKey = () => $.store_get(selectedElementKey, '$selectedElementKey', $$stores);
	const $isEditable = () => $.store_get(isEditable, '$isEditable', $$stores);
	const $codeLanguage = () => $.store_get(codeLanguage, '$codeLanguage', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const activeEditor = getActiveEditor();
	const isEditable = getIsEditable();
	const selectedElementKey = getContext('selectedElementKey');
	const codeLanguage = getContext('codeLanguage');
	const CODE_LANGUAGE_OPTIONS = getCodeLanguageOptions();

	function getCodeLanguageOptions() {
		const options = [];

		for (const [lang, friendlyName] of Object.entries(CODE_LANGUAGE_FRIENDLY_NAME_MAP)) {
			options.push([lang, friendlyName]);
		}

		return options;
	}

	function onCodeLanguageSelect(value) {
		$activeEditor().update(() => {
			if ($selectedElementKey() !== null) {
				const node = getNodeByKey($selectedElementKey());

				if (isCodeNode(node)) {
					node.setLanguage(value);
				}
			}
		});
	}

	{
		let $0 = $.derived(() => !$isEditable());
		let $1 = $.derived(() => getLanguageFriendlyName($codeLanguage()));

		DropDown($$anchor, {
			get disabled() {
				return $.get($0);
			},
			buttonClassName: 'toolbar-item code-language',
			get buttonLabel() {
				return $.get($1);
			},
			buttonAriaLabel: 'Select language',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.each(node_1, 17, () => CODE_LANGUAGE_OPTIONS, $.index, ($$anchor, $$item) => {
					var $$array = $.derived(() => $.to_array($.get($$item), 2));
					let value = () => $.get($$array)[0];
					let name = () => $.get($$array)[1];

					{
						let $0 = $.derived(() => `item ${value() === $codeLanguage() ? 'active dropdown-item-active' : ''}`);

						DropDownItem($$anchor, {
							get class() {
								return $.get($0);
							},
							onclick: () => onCodeLanguageSelect(value()),
							children: ($$anchor, $$slotProps) => {
								var span = root();
								var text = $.only_child(span, true);

								$.template_effect(() => $.set_text(text, name()));
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