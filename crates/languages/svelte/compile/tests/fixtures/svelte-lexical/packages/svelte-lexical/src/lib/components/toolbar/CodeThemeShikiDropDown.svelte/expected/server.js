import * as $ from 'svelte/internal/server';
import { $isCodeNode as isCodeNode } from '@lexical/code';
import { getCodeThemeOptions } from '@lexical/code-shiki';
import { $getNodeByKey as getNodeByKey } from 'lexical';
import { getContext } from 'svelte';
import { getActiveEditor, getIsEditable } from '$lib/core/composerContext.js';
import DropDown from '../generic/dropdown/DropDown.svelte';
import DropDownItem from '../generic/dropdown/DropDownItem.svelte';

export default function CodeThemeShikiDropDown($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const activeEditor = getActiveEditor();
		const isEditable = getIsEditable();
		const selectedElementKey = getContext('selectedElementKey');
		const codeTheme = getContext('codeTheme');

		const CODE_THEME_OPTIONS_SHIKI = getCodeThemeOptions().filter((option) => [
			'catppuccin-latte',
			'everforest-light',
			'github-light',
			'gruvbox-light-medium',
			'kanagawa-lotus',
			'dark-plus',
			'light-plus',
			'material-theme-lighter',
			'min-light',
			'one-light',
			'rose-pine-dawn',
			'slack-ochin',
			'snazzy-light',
			'solarized-light',
			'vitesse-light'
		].includes(option[0]));

		function getThemeFriendlyName(theme) {
			const themeObj = CODE_THEME_OPTIONS_SHIKI.find((option) => option[0] === theme);

			return themeObj ? themeObj[1] : theme;
		}

		function onCodeThemeSelect(value) {
			$.store_get($$store_subs ??= {}, '$activeEditor', activeEditor).update(() => {
				if ($.store_get($$store_subs ??= {}, '$selectedElementKey', selectedElementKey) !== null) {
					const node = getNodeByKey($.store_get($$store_subs ??= {}, '$selectedElementKey', selectedElementKey));

					if (isCodeNode(node)) {
						node.setTheme(value);
					}
				}
			});
		}

		DropDown($$renderer, {
			disabled: !$.store_get($$store_subs ??= {}, '$isEditable', isEditable),
			buttonClassName: 'toolbar-item code-language',
			buttonLabel: getThemeFriendlyName($.store_get($$store_subs ??= {}, '$codeTheme', codeTheme)),
			buttonAriaLabel: 'Select language',
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(CODE_THEME_OPTIONS_SHIKI);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let [value, name] = each_array[$$index];

					DropDownItem($$renderer, {
						class: `item ${value === $.store_get($$store_subs ??= {}, '$codeTheme', codeTheme) ? 'active dropdown-item-active' : ''}`,
						onclick: () => onCodeThemeSelect(value),
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