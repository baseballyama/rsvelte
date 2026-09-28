import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowLeft from '@lucide/svelte/icons/arrow-left';
import ArrowLeftFromLine from '@lucide/svelte/icons/arrow-left-from-line';
import ArrowRight from '@lucide/svelte/icons/arrow-right';
import ArrowRightFromLine from '@lucide/svelte/icons/arrow-right-from-line';
import Sheet from '@lucide/svelte/icons/sheet';
import Trash from '@lucide/svelte/icons/trash';
import { isColumnGripSelected, moveColumnLeft, moveColumnRight } from '../../../tiptap/extensions/table/index.js';
import { BubbleMenu, getEditor } from '../../../tiptap/index.js';
import strings from '../../../strings.js';

var root = $.from_html(`<button class="menu-item svelte-138x3k5"><!> <span> </span></button> <div class="divider svelte-138x3k5"></div> <button class="menu-item svelte-138x3k5"><!> <span> </span></button> <button class="menu-item svelte-138x3k5"><!> <span> </span></button> <div class="divider svelte-138x3k5"></div> <button class="menu-item svelte-138x3k5"><!> <span> </span></button> <button class="menu-item svelte-138x3k5"><!> <span> </span></button> <div class="divider svelte-138x3k5"></div> <button class="menu-item delete-item svelte-138x3k5" data-variant="destructive"><!> <span> </span></button>`, 1);

export default function TableCol($$anchor, $$props) {
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
			pluginKey: 'table-col-menu',
			shouldShow: (props) => {
				const { editor: propsEditor, state, view, from } = props;

				if (!propsEditor || !propsEditor.isEditable) return false;
				if (!state) return false;

				return isColumnGripSelected({ editor: propsEditor, view, state, from });
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

				ArrowRightFromLine(node_1, { class: 'icon-mute' });

				var span_1 = $.sibling(node_1, 2);
				var text_1 = $.only_child(span_1, true);

				$.reset(button_1);

				var button_2 = $.sibling(button_1, 2);
				var node_2 = $.child(button_2);

				ArrowLeftFromLine(node_2, { class: 'icon-mute' });

				var span_2 = $.sibling(node_2, 2);
				var text_2 = $.only_child(span_2, true);

				$.reset(button_2);

				var button_3 = $.sibling(button_2, 4);
				var node_3 = $.child(button_3);

				ArrowLeft(node_3, { class: 'icon-mute' });

				var span_3 = $.sibling(node_3, 2);
				var text_3 = $.only_child(span_3, true);

				$.reset(button_3);

				var button_4 = $.sibling(button_3, 2);
				var node_4 = $.child(button_4);

				ArrowRight(node_4, { class: 'icon-mute' });

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
					$.set_attribute(button, 'title', strings.menu.table.headerColumn);
					$.set_text(text, strings.menu.table.headerColumn);
					$.set_attribute(button_1, 'title', strings.menu.table.addColumnAfter);
					$.set_text(text_1, strings.menu.table.addColumnAfter);
					$.set_attribute(button_2, 'title', strings.menu.table.addColumnBefore);
					$.set_text(text_2, strings.menu.table.addColumnBefore);
					$.set_attribute(button_3, 'title', strings.menu.table.moveColumnLeft);
					$.set_text(text_3, strings.menu.table.moveColumnLeft);
					$.set_attribute(button_4, 'title', strings.menu.table.moveColumnRight);
					$.set_text(text_4, strings.menu.table.moveColumnRight);
					$.set_attribute(button_5, 'title', strings.menu.table.deleteColumn);
					$.set_text(text_5, strings.menu.table.deleteColumn);
				});

				$.delegated('click', button, () => editor.chain().focus().toggleHeaderColumn().run());
				$.delegated('click', button_1, () => editor.chain().focus().addColumnAfter().run());
				$.delegated('click', button_2, () => editor.chain().focus().addColumnBefore().run());
				$.delegated('click', button_3, () => editor.view.dispatch(moveColumnLeft(editor.state.tr)));
				$.delegated('click', button_4, () => editor.view.dispatch(moveColumnRight(editor.state.tr)));
				$.delegated('click', button_5, () => editor.chain().focus().deleteColumn().run());
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}

$.delegate(['click']);