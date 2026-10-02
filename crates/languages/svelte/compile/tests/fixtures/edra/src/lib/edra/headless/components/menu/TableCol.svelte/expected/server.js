import * as $ from 'svelte/internal/server';
import ArrowLeft from '@lucide/svelte/icons/arrow-left';
import ArrowLeftFromLine from '@lucide/svelte/icons/arrow-left-from-line';
import ArrowRight from '@lucide/svelte/icons/arrow-right';
import ArrowRightFromLine from '@lucide/svelte/icons/arrow-right-from-line';
import Sheet from '@lucide/svelte/icons/sheet';
import Trash from '@lucide/svelte/icons/trash';
import { isColumnGripSelected, moveColumnLeft, moveColumnRight } from '../../../tiptap/extensions/table/index.js';
import { BubbleMenu, getEditor } from '../../../tiptap/index.js';
import strings from '../../../strings.js';

export default function TableCol($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const editor = getEditor();

		BubbleMenu($$renderer, {
			editor,
			pluginKey: 'table-col-menu',
			shouldShow: (props) => {
				const { editor: propsEditor, state, view, from } = props;

				if (!propsEditor || !propsEditor.isEditable) return false;
				if (!state) return false;

				return isColumnGripSelected({ editor: propsEditor, view, state, from });
			},

			options: {
				shift: true,
				autoPlacement: { allowedPlacements: ['top', 'bottom'] },
				strategy: 'absolute',
				scrollTarget: editor.view.dom.parentElement ?? window
			},
			class: 'table-menu',
			children: ($$renderer) => {
				$$renderer.push(`<button class="menu-item svelte-138x3k5"${$.attr('title', strings.menu.table.headerColumn)}>`);
				Sheet($$renderer, { class: 'icon-mute' });
				$$renderer.push(`<!----> <span>${$.escape(strings.menu.table.headerColumn)}</span></button> <div class="divider svelte-138x3k5"></div> <button class="menu-item svelte-138x3k5"${$.attr('title', strings.menu.table.addColumnAfter)}>`);
				ArrowRightFromLine($$renderer, { class: 'icon-mute' });
				$$renderer.push(`<!----> <span>${$.escape(strings.menu.table.addColumnAfter)}</span></button> <button class="menu-item svelte-138x3k5"${$.attr('title', strings.menu.table.addColumnBefore)}>`);
				ArrowLeftFromLine($$renderer, { class: 'icon-mute' });
				$$renderer.push(`<!----> <span>${$.escape(strings.menu.table.addColumnBefore)}</span></button> <div class="divider svelte-138x3k5"></div> <button class="menu-item svelte-138x3k5"${$.attr('title', strings.menu.table.moveColumnLeft)}>`);
				ArrowLeft($$renderer, { class: 'icon-mute' });
				$$renderer.push(`<!----> <span>${$.escape(strings.menu.table.moveColumnLeft)}</span></button> <button class="menu-item svelte-138x3k5"${$.attr('title', strings.menu.table.moveColumnRight)}>`);
				ArrowRight($$renderer, { class: 'icon-mute' });
				$$renderer.push(`<!----> <span>${$.escape(strings.menu.table.moveColumnRight)}</span></button> <div class="divider svelte-138x3k5"></div> <button class="menu-item delete-item svelte-138x3k5"${$.attr('title', strings.menu.table.deleteColumn)} data-variant="destructive">`);
				Trash($$renderer, { class: 'trash-icon' });
				$$renderer.push(`<!----> <span>${$.escape(strings.menu.table.deleteColumn)}</span></button>`);
			},
			$$slots: { default: true }
		});
	});
}