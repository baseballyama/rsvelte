import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowDown from '@lucide/svelte/icons/arrow-down';
import ArrowDownFromLine from '@lucide/svelte/icons/arrow-down-from-line';
import ArrowUp from '@lucide/svelte/icons/arrow-up';
import ArrowUpFromLine from '@lucide/svelte/icons/arrow-up-from-line';
import Sheet from '@lucide/svelte/icons/sheet';
import Trash from '@lucide/svelte/icons/trash';
import { isRowGripSelected, moveRowDown, moveRowUp } from '../../../tiptap/extensions/table/utils.js';
import { BubbleMenu, getEditor } from '../../../tiptap/index.js';
import strings from '../../../strings.js';

var root = $.from_html(`<button class="menu-item svelte-hw73bj"><!> <span> </span></button> <div class="divider svelte-hw73bj"></div> <button class="menu-item svelte-hw73bj"><!> <span> </span></button> <button class="menu-item svelte-hw73bj"><!> <span> </span></button> <div class="divider svelte-hw73bj"></div> <button class="menu-item svelte-hw73bj"><!> <span> </span></button> <button class="menu-item svelte-hw73bj"><!> <span> </span></button> <div class="divider svelte-hw73bj"></div> <button class="menu-item delete-item svelte-hw73bj" data-variant="destructive"><!> <span> </span></button>`, 1);

export default function TableRow($$anchor, $$props) {
	$.push($$props, true);

	const editor = getEditor();

	{
		let $0 = $.derived(() => ({
			shift: true,
			autoPlacement: { allowedPlacements: ['top', 'bottom'] },
			strategy: 'absolute',
			scrollTarget: editor.view.dom.parentElement ?? window
		}));

		BubbleMenu($$anchor, {
			get editor() {
				return editor;
			},
			pluginKey: 'table-row-menu',
			shouldShow: (props) => {
				const { editor: propsEditor, state, view, from } = props;

				if (!propsEditor || !propsEditor.isEditable) return false;
				if (!state) return false;

				return isRowGripSelected({ editor: propsEditor, view, state, from });
			},

			get options() {
				return $.get($0);
			},
			class: 'table-menu',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var button = $.first_child(fragment_1);
				var node = $.child(button);

				Sheet(node, { class: 'icon-mute' });

				var span = $.sibling(node, 2);
				var text = $.only_child(span, true);

				$.reset(button);

				var button_1 = $.sibling(button, 4);
				var node_1 = $.child(button_1);

				ArrowDownFromLine(node_1, { class: 'icon-mute' });

				var span_1 = $.sibling(node_1, 2);
				var text_1 = $.only_child(span_1, true);

				$.reset(button_1);

				var button_2 = $.sibling(button_1, 2);
				var node_2 = $.child(button_2);

				ArrowUpFromLine(node_2, { class: 'icon-mute' });

				var span_2 = $.sibling(node_2, 2);
				var text_2 = $.only_child(span_2, true);

				$.reset(button_2);

				var button_3 = $.sibling(button_2, 4);
				var node_3 = $.child(button_3);

				ArrowUp(node_3, { class: 'icon-mute' });

				var span_3 = $.sibling(node_3, 2);
				var text_3 = $.only_child(span_3, true);

				$.reset(button_3);

				var button_4 = $.sibling(button_3, 2);
				var node_4 = $.child(button_4);

				ArrowDown(node_4, { class: 'icon-mute' });

				var span_4 = $.sibling(node_4, 2);
				var text_4 = $.only_child(span_4, true);

				$.reset(button_4);

				var button_5 = $.sibling(button_4, 4);
				var node_5 = $.child(button_5);

				Trash(node_5, { class: 'trash-icon' });

				var span_5 = $.sibling(node_5, 2);
				var text_5 = $.only_child(span_5, true);

				$.reset(button_5);

				$.template_effect(() => {
					$.set_attribute(button, 'title', strings.menu.table.headerRow);
					$.set_text(text, strings.menu.table.headerRow);
					$.set_attribute(button_1, 'title', strings.menu.table.addRowAfter);
					$.set_text(text_1, strings.menu.table.addRowAfter);
					$.set_attribute(button_2, 'title', strings.menu.table.addRowBefore);
					$.set_text(text_2, strings.menu.table.addRowBefore);
					$.set_attribute(button_3, 'title', strings.menu.table.moveRowUp);
					$.set_text(text_3, strings.menu.table.moveRowUp);
					$.set_attribute(button_4, 'title', strings.menu.table.moveRowDown);
					$.set_text(text_4, strings.menu.table.moveRowDown);
					$.set_attribute(button_5, 'title', strings.menu.table.deleteRow);
					$.set_text(text_5, strings.menu.table.deleteRow);
				});

				$.delegated('click', button, () => editor.chain().focus().toggleHeaderRow().run());
				$.delegated('click', button_1, () => editor.chain().focus().addRowAfter().run());
				$.delegated('click', button_2, () => editor.chain().focus().addRowBefore().run());
				$.delegated('click', button_3, () => editor.view.dispatch(moveRowUp(editor.state.tr)));
				$.delegated('click', button_4, () => editor.view.dispatch(moveRowDown(editor.state.tr)));
				$.delegated('click', button_5, () => editor.chain().focus().deleteRow().run());
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}

$.delegate(['click']);