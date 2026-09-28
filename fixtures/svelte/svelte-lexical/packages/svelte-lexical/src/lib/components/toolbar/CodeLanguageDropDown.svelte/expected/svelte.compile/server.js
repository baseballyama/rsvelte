import * as $ from 'svelte/internal/server';

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

export default function CodeLanguageDropDown($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
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
			$.store_get($$store_subs ??= {}, '$activeEditor', activeEditor).update(() => {
				if ($.store_get($$store_subs ??= {}, '$selectedElementKey', selectedElementKey) !== null) {
					const node = getNodeByKey($.store_get($$store_subs ??= {}, '$selectedElementKey', selectedElementKey));

					if (isCodeNode(node)) {
						node.setLanguage(value);
					}
				}
			});
		}

		DropDown($$renderer, {
			disabled: !$.store_get($$store_subs ??= {}, '$isEditable', isEditable),
			buttonClassName: 'toolbar-item code-language',
			buttonLabel: getLanguageFriendlyName($.store_get($$store_subs ??= {}, '$codeLanguage', codeLanguage)),
			buttonAriaLabel: 'Select language',
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(CODE_LANGUAGE_OPTIONS);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let [value, name] = each_array[$$index];

					DropDownItem($$renderer, {
						class: `item ${value === $.store_get($$store_subs ??= {}, '$codeLanguage', codeLanguage) ? 'active dropdown-item-active' : ''}`,
						onclick: () => onCodeLanguageSelect(value),
						children: ($$renderer) => {
							$$renderer.push(`<span class="text">${$.escape(name)}</span>`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}