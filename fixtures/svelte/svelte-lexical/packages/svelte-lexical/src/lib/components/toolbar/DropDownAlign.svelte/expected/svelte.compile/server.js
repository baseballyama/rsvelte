import * as $ from 'svelte/internal/server';

import {
	FORMAT_ELEMENT_COMMAND,
	INDENT_CONTENT_COMMAND,
	OUTDENT_CONTENT_COMMAND
} from 'lexical';

import DropDown from '../generic/dropdown/DropDown.svelte';
import DropDownItem from '../generic/dropdown/DropDownItem.svelte';
import Divider from './Divider.svelte';
import { getActiveEditor, getIsEditable } from '$lib/core/composerContext.js';
import { getContext } from 'svelte';
import { SHORTCUTS } from './shortcuts.js';

export default function DropDownAlign($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const activeEditor = getActiveEditor();
		const isRTL = getContext('isRTL');
		const isEditable = getIsEditable();

		DropDown($$renderer, {
			disabled: !$.store_get($$store_subs ??= {}, '$isEditable', isEditable),
			buttonLabel: 'Align',
			buttonIconClassName: 'icon left-align',
			buttonClassName: 'toolbar-item spaced alignment',
			buttonAriaLabel: 'Formatting options for text alignment',
			children: ($$renderer) => {
				DropDownItem($$renderer, {
					onclick: () => {
						$.store_get($$store_subs ??= {}, '$activeEditor', activeEditor).dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
					},
					class: 'item wide',
					children: ($$renderer) => {
						$$renderer.push(`<div class="icon-text-container"><i class="icon left-align"></i> <span class="text">Left Align</span></div> <span class="shortcut">${$.escape(SHORTCUTS.LEFT_ALIGN)}</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				DropDownItem($$renderer, {
					onclick: () => {
						$.store_get($$store_subs ??= {}, '$activeEditor', activeEditor).dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
					},
					class: 'item wide',
					children: ($$renderer) => {
						$$renderer.push(`<div class="icon-text-container"><i class="icon center-align"></i> <span class="text">Center Align</span></div> <span class="shortcut">${$.escape(SHORTCUTS.CENTER_ALIGN)}</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				DropDownItem($$renderer, {
					onclick: () => {
						$.store_get($$store_subs ??= {}, '$activeEditor', activeEditor).dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
					},
					class: 'item wide',
					children: ($$renderer) => {
						$$renderer.push(`<div class="icon-text-container"><i class="icon right-align"></i> <span class="text">Right Align</span></div> <span class="shortcut">${$.escape(SHORTCUTS.RIGHT_ALIGN)}</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				DropDownItem($$renderer, {
					onclick: () => {
						$.store_get($$store_subs ??= {}, '$activeEditor', activeEditor).dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
					},
					class: 'item wide',
					children: ($$renderer) => {
						$$renderer.push(`<div class="icon-text-container"><i class="icon justify-align"></i> <span class="text">Justify Align</span></div> <span class="shortcut">${$.escape(SHORTCUTS.JUSTIFY_ALIGN)}</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				Divider($$renderer, {});
				$$renderer.push(`<!----> `);

				DropDownItem($$renderer, {
					onclick: () => {
						$.store_get($$store_subs ??= {}, '$activeEditor', activeEditor).dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
					},
					class: 'item wide',
					children: ($$renderer) => {
						$$renderer.push(`<div class="icon-text-container"><i${$.attr_class('icon ' + ($.store_get($$store_subs ??= {}, '$isRTL', isRTL) ? 'indent' : 'outdent'))}></i> <span class="text">Outdent</span></div> <span class="shortcut">${$.escape(SHORTCUTS.OUTDENT)}</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				DropDownItem($$renderer, {
					onclick: () => {
						$.store_get($$store_subs ??= {}, '$activeEditor', activeEditor).dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
					},
					class: 'item wide',
					children: ($$renderer) => {
						$$renderer.push(`<div class="icon-text-container"><i${$.attr_class('icon ' + ($.store_get($$store_subs ??= {}, '$isRTL', isRTL) ? 'outdent' : 'indent'))}></i> <span class="text">Indent</span></div> <span class="shortcut">${$.escape(SHORTCUTS.INDENT)}</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}