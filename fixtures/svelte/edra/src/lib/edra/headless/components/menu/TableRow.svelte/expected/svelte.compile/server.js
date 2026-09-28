import * as $ from 'svelte/internal/server';
import ArrowDown from '@lucide/svelte/icons/arrow-down';
import ArrowDownFromLine from '@lucide/svelte/icons/arrow-down-from-line';
import ArrowUp from '@lucide/svelte/icons/arrow-up';
import ArrowUpFromLine from '@lucide/svelte/icons/arrow-up-from-line';
import Sheet from '@lucide/svelte/icons/sheet';
import Trash from '@lucide/svelte/icons/trash';
import { isRowGripSelected, moveRowDown, moveRowUp } from '../../../tiptap/extensions/table/utils.js';
import { BubbleMenu, getEditor } from '../../../tiptap/index.js';
import strings from '../../../strings.js';

export default function TableRow($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const editor = getEditor();

		BubbleMenu($$renderer, {
			editor,
			pluginKey: 'table-row-menu',
			shouldShow: (props) => {
				const { editor: propsEditor, state, view, from } = props;

				if (!propsEditor || !propsEditor.isEditable) return false;
				if (!state) return false;

				return isRowGripSelected({ editor: propsEditor, view, state, from });
			},

			options: {
				shift: true,
				autoPlacement: { allowedPlacements: ['top', 'bottom'] },
				strategy: 'absolute',
				scrollTarget: editor.view.dom.parentElement ?? window
			},
			class: 'table-menu',
			children: ($$renderer) => {
				$$renderer.push(`<button class="menu-item svelte-hw73bj"${$.attr('title', strings.menu.table.headerRow)}>`);
				Sheet($$renderer, { class: 'icon-mute' });
				$$renderer.push(`<!----> <span>${$.escape(strings.menu.table.headerRow)}</span></button> <div class="divider svelte-hw73bj"></div> <button class="menu-item svelte-hw73bj"${$.attr('title', strings.menu.table.addRowAfter)}>`);
				ArrowDownFromLine($$renderer, { class: 'icon-mute' });
				$$renderer.push(`<!----> <span>${$.escape(strings.menu.table.addRowAfter)}</span></button> <button class="menu-item svelte-hw73bj"${$.attr('title', strings.menu.table.addRowBefore)}>`);
				ArrowUpFromLine($$renderer, { class: 'icon-mute' });
				$$renderer.push(`<!----> <span>${$.escape(strings.menu.table.addRowBefore)}</span></button> <div class="divider svelte-hw73bj"></div> <button class="menu-item svelte-hw73bj"${$.attr('title', strings.menu.table.moveRowUp)}>`);
				ArrowUp($$renderer, { class: 'icon-mute' });
				$$renderer.push(`<!----> <span>${$.escape(strings.menu.table.moveRowUp)}</span></button> <button class="menu-item svelte-hw73bj"${$.attr('title', strings.menu.table.moveRowDown)}>`);
				ArrowDown($$renderer, { class: 'icon-mute' });
				$$renderer.push(`<!----> <span>${$.escape(strings.menu.table.moveRowDown)}</span></button> <div class="divider svelte-hw73bj"></div> <button class="menu-item delete-item svelte-hw73bj"${$.attr('title', strings.menu.table.deleteRow)} data-variant="destructive">`);
				Trash($$renderer, { class: 'trash-icon' });
				$$renderer.push(`<!----> <span>${$.escape(strings.menu.table.deleteRow)}</span></button>`);
			},
			$$slots: { default: true }
		});
	});
}