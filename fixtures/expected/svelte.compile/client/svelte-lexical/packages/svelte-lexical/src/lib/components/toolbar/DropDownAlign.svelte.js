import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<div class="icon-text-container"><i class="icon left-align"></i> <span class="text">Left Align</span></div> <span class="shortcut"> </span>`, 1);
var root_1 = $.from_html(`<div class="icon-text-container"><i class="icon center-align"></i> <span class="text">Center Align</span></div> <span class="shortcut"> </span>`, 1);
var root_2 = $.from_html(`<div class="icon-text-container"><i class="icon right-align"></i> <span class="text">Right Align</span></div> <span class="shortcut"> </span>`, 1);
var root_3 = $.from_html(`<div class="icon-text-container"><i class="icon justify-align"></i> <span class="text">Justify Align</span></div> <span class="shortcut"> </span>`, 1);
var root_4 = $.from_html(`<div class="icon-text-container"><i></i> <span class="text">Outdent</span></div> <span class="shortcut"> </span>`, 1);
var root_5 = $.from_html(`<div class="icon-text-container"><i></i> <span class="text">Indent</span></div> <span class="shortcut"> </span>`, 1);
var root_6 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function DropDownAlign($$anchor, $$props) {
	$.push($$props, true);

	const $isEditable = () => $.store_get(isEditable, '$isEditable', $$stores);
	const $activeEditor = () => $.store_get(activeEditor, '$activeEditor', $$stores);
	const $isRTL = () => $.store_get(isRTL, '$isRTL', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const activeEditor = getActiveEditor();
	const isRTL = getContext('isRTL');
	const isEditable = getIsEditable();

	{
		let $0 = $.derived(() => !$isEditable());

		DropDown($$anchor, {
			get disabled() {
				return $.get($0);
			},
			buttonLabel: 'Align',
			buttonIconClassName: 'icon left-align',
			buttonClassName: 'toolbar-item spaced alignment',
			buttonAriaLabel: 'Formatting options for text alignment',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_6();
				var node = $.first_child(fragment_1);

				DropDownItem(node, {
					onclick: () => {
						$activeEditor().dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
					},
					class: 'item wide',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var span = $.sibling($.first_child(fragment_2), 2);
						var text = $.only_child(span, true);

						$.template_effect(() => $.set_text(text, SHORTCUTS.LEFT_ALIGN));
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});

				var node_1 = $.sibling(node, 2);

				DropDownItem(node_1, {
					onclick: () => {
						$activeEditor().dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
					},
					class: 'item wide',
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_1();
						var span_1 = $.sibling($.first_child(fragment_3), 2);
						var text_1 = $.only_child(span_1, true);

						$.template_effect(() => $.set_text(text_1, SHORTCUTS.CENTER_ALIGN));
						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});

				var node_2 = $.sibling(node_1, 2);

				DropDownItem(node_2, {
					onclick: () => {
						$activeEditor().dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
					},
					class: 'item wide',
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root_2();
						var span_2 = $.sibling($.first_child(fragment_4), 2);
						var text_2 = $.only_child(span_2, true);

						$.template_effect(() => $.set_text(text_2, SHORTCUTS.RIGHT_ALIGN));
						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});

				var node_3 = $.sibling(node_2, 2);

				DropDownItem(node_3, {
					onclick: () => {
						$activeEditor().dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
					},
					class: 'item wide',
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root_3();
						var span_3 = $.sibling($.first_child(fragment_5), 2);
						var text_3 = $.only_child(span_3, true);

						$.template_effect(() => $.set_text(text_3, SHORTCUTS.JUSTIFY_ALIGN));
						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_3, 2);

				Divider(node_4, {});

				var node_5 = $.sibling(node_4, 2);

				DropDownItem(node_5, {
					onclick: () => {
						$activeEditor().dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
					},
					class: 'item wide',
					children: ($$anchor, $$slotProps) => {
						var fragment_6 = root_4();
						var div = $.first_child(fragment_6);
						var i = $.child(div);

						$.next(2);
						$.reset(div);

						var span_4 = $.sibling(div, 2);
						var text_4 = $.only_child(span_4, true);

						$.template_effect(() => {
							$.set_class(i, 1, 'icon ' + ($isRTL() ? 'indent' : 'outdent'));
							$.set_text(text_4, SHORTCUTS.OUTDENT);
						});

						$.append($$anchor, fragment_6);
					},
					$$slots: { default: true }
				});

				var node_6 = $.sibling(node_5, 2);

				DropDownItem(node_6, {
					onclick: () => {
						$activeEditor().dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
					},
					class: 'item wide',
					children: ($$anchor, $$slotProps) => {
						var fragment_7 = root_5();
						var div_1 = $.first_child(fragment_7);
						var i_1 = $.child(div_1);

						$.next(2);
						$.reset(div_1);

						var span_5 = $.sibling(div_1, 2);
						var text_5 = $.only_child(span_5, true);

						$.template_effect(() => {
							$.set_class(i_1, 1, 'icon ' + ($isRTL() ? 'outdent' : 'indent'));
							$.set_text(text_5, SHORTCUTS.INDENT);
						});

						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
	$$cleanup();
}