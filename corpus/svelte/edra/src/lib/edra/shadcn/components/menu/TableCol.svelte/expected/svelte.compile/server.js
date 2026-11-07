import * as $ from 'svelte/internal/server';
import { Separator } from '$lib/components/ui/separator/index.js';
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
			class: 'z-50 flex h-fit w-fit flex-col gap-1 rounded-lg border bg-popover! p-2',
			children: ($$renderer) => {
				$$renderer.push(`<button class="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground data-inset:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:hover:bg-destructive/10 data-[variant=destructive]:hover:text-destructive dark:data-[variant=destructive]:hover:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 [&amp;_svg:not([class*='size-'])]:size-4 [&amp;_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!"${$.attr('title', strings.menu.table.headerColumn)}>`);
				Sheet($$renderer, {});
				$$renderer.push(`<!----> ${$.escape(strings.menu.table.headerColumn)}</button> `);
				Separator($$renderer, {});
				$$renderer.push(`<!----> <button class="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground data-inset:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:hover:bg-destructive/10 data-[variant=destructive]:hover:text-destructive dark:data-[variant=destructive]:hover:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 [&amp;_svg:not([class*='size-'])]:size-4 [&amp;_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!"${$.attr('title', strings.menu.table.addColumnAfter)}>`);
				ArrowRightFromLine($$renderer, {});
				$$renderer.push(`<!----> ${$.escape(strings.menu.table.addColumnAfter)}</button> <button class="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground data-inset:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:hover:bg-destructive/10 data-[variant=destructive]:hover:text-destructive dark:data-[variant=destructive]:hover:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 [&amp;_svg:not([class*='size-'])]:size-4 [&amp;_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!"${$.attr('title', strings.menu.table.addColumnBefore)}>`);
				ArrowLeftFromLine($$renderer, {});
				$$renderer.push(`<!----> ${$.escape(strings.menu.table.addColumnBefore)}</button> `);
				Separator($$renderer, {});
				$$renderer.push(`<!----> <button class="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground data-inset:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:hover:bg-destructive/10 data-[variant=destructive]:hover:text-destructive dark:data-[variant=destructive]:hover:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 [&amp;_svg:not([class*='size-'])]:size-4 [&amp;_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!"${$.attr('title', strings.menu.table.moveColumnLeft)}>`);
				ArrowLeft($$renderer, {});
				$$renderer.push(`<!----> ${$.escape(strings.menu.table.moveColumnLeft)}</button> <button class="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground data-inset:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:hover:bg-destructive/10 data-[variant=destructive]:hover:text-destructive dark:data-[variant=destructive]:hover:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 [&amp;_svg:not([class*='size-'])]:size-4 [&amp;_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!"${$.attr('title', strings.menu.table.moveColumnRight)}>`);
				ArrowRight($$renderer, {});
				$$renderer.push(`<!----> ${$.escape(strings.menu.table.moveColumnRight)}</button> `);
				Separator($$renderer, {});
				$$renderer.push(`<!----> <button class="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground data-inset:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:hover:bg-destructive/10 data-[variant=destructive]:hover:text-destructive dark:data-[variant=destructive]:hover:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 [&amp;_svg:not([class*='size-'])]:size-4 [&amp;_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!"${$.attr('title', strings.menu.table.deleteColumn)} data-variant="destructive">`);
				Trash($$renderer, {});
				$$renderer.push(`<!----> ${$.escape(strings.menu.table.deleteColumn)}</button>`);
			},
			$$slots: { default: true }
		});
	});
}