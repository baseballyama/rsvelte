import * as $ from 'svelte/internal/server';
import { Separator } from '$lib/components/ui/separator/index.js';
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
			class: 'z-50 flex h-fit w-fit flex-col gap-1 rounded-lg border bg-popover! p-2',
			children: ($$renderer) => {
				$$renderer.push(`<button class="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground data-inset:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:hover:bg-destructive/10 data-[variant=destructive]:hover:text-destructive dark:data-[variant=destructive]:hover:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 [&amp;_svg:not([class*='size-'])]:size-4 [&amp;_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!"${$.attr('title', strings.menu.table.headerRow)}>`);
				Sheet($$renderer, {});
				$$renderer.push(`<!----> ${$.escape(strings.menu.table.headerRow)}</button> `);
				Separator($$renderer, {});
				$$renderer.push(`<!----> <button class="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground data-inset:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:hover:bg-destructive/10 data-[variant=destructive]:hover:text-destructive dark:data-[variant=destructive]:hover:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 [&amp;_svg:not([class*='size-'])]:size-4 [&amp;_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!"${$.attr('title', strings.menu.table.addRowAfter)}>`);
				ArrowDownFromLine($$renderer, {});
				$$renderer.push(`<!----> ${$.escape(strings.menu.table.addRowAfter)}</button> <button class="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground data-inset:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:hover:bg-destructive/10 data-[variant=destructive]:hover:text-destructive dark:data-[variant=destructive]:hover:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 [&amp;_svg:not([class*='size-'])]:size-4 [&amp;_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!"${$.attr('title', strings.menu.table.addRowBefore)}>`);
				ArrowUpFromLine($$renderer, {});
				$$renderer.push(`<!----> ${$.escape(strings.menu.table.addRowBefore)}</button> `);
				Separator($$renderer, {});
				$$renderer.push(`<!----> <button class="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground data-inset:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:hover:bg-destructive/10 data-[variant=destructive]:hover:text-destructive dark:data-[variant=destructive]:hover:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 [&amp;_svg:not([class*='size-'])]:size-4 [&amp;_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!"${$.attr('title', strings.menu.table.moveRowUp)}>`);
				ArrowUp($$renderer, {});
				$$renderer.push(`<!----> ${$.escape(strings.menu.table.moveRowUp)}</button> <button class="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground data-inset:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:hover:bg-destructive/10 data-[variant=destructive]:hover:text-destructive dark:data-[variant=destructive]:hover:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 [&amp;_svg:not([class*='size-'])]:size-4 [&amp;_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!"${$.attr('title', strings.menu.table.moveRowDown)}>`);
				ArrowDown($$renderer, {});
				$$renderer.push(`<!----> ${$.escape(strings.menu.table.moveRowDown)}</button> `);
				Separator($$renderer, {});
				$$renderer.push(`<!----> <button class="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground data-inset:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:hover:bg-destructive/10 data-[variant=destructive]:hover:text-destructive dark:data-[variant=destructive]:hover:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 [&amp;_svg:not([class*='size-'])]:size-4 [&amp;_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!"${$.attr('title', strings.menu.table.deleteRow)} data-variant="destructive">`);
				Trash($$renderer, {});
				$$renderer.push(`<!----> ${$.escape(strings.menu.table.deleteRow)}</button>`);
			},
			$$slots: { default: true }
		});
	});
}