import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<button class="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground data-inset:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:hover:bg-destructive/10 data-[variant=destructive]:hover:text-destructive dark:data-[variant=destructive]:hover:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 [&amp;_svg:not([class*='size-'])]:size-4 [&amp;_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!"><!> </button> <!> <button class="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground data-inset:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:hover:bg-destructive/10 data-[variant=destructive]:hover:text-destructive dark:data-[variant=destructive]:hover:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 [&amp;_svg:not([class*='size-'])]:size-4 [&amp;_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!"><!> </button> <button class="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground data-inset:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:hover:bg-destructive/10 data-[variant=destructive]:hover:text-destructive dark:data-[variant=destructive]:hover:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 [&amp;_svg:not([class*='size-'])]:size-4 [&amp;_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!"><!> </button> <!> <button class="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground data-inset:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:hover:bg-destructive/10 data-[variant=destructive]:hover:text-destructive dark:data-[variant=destructive]:hover:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 [&amp;_svg:not([class*='size-'])]:size-4 [&amp;_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!"><!> </button> <button class="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground data-inset:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:hover:bg-destructive/10 data-[variant=destructive]:hover:text-destructive dark:data-[variant=destructive]:hover:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 [&amp;_svg:not([class*='size-'])]:size-4 [&amp;_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!"><!> </button> <!> <button class="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground data-inset:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:hover:bg-destructive/10 data-[variant=destructive]:hover:text-destructive dark:data-[variant=destructive]:hover:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 [&amp;_svg:not([class*='size-'])]:size-4 [&amp;_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!" data-variant="destructive"><!> </button>`, 1);

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
			class: 'z-50 flex h-fit w-fit flex-col gap-1 rounded-lg border bg-popover! p-2',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var button = $.first_child(fragment_1);
				var node = $.child(button);

				Sheet(node, {});

				var text = $.sibling(node);

				$.reset(button);

				var node_1 = $.sibling(button, 2);

				Separator(node_1, {});

				var button_1 = $.sibling(node_1, 2);
				var node_2 = $.child(button_1);

				ArrowDownFromLine(node_2, {});

				var text_1 = $.sibling(node_2);

				$.reset(button_1);

				var button_2 = $.sibling(button_1, 2);
				var node_3 = $.child(button_2);

				ArrowUpFromLine(node_3, {});

				var text_2 = $.sibling(node_3);

				$.reset(button_2);

				var node_4 = $.sibling(button_2, 2);

				Separator(node_4, {});

				var button_3 = $.sibling(node_4, 2);
				var node_5 = $.child(button_3);

				ArrowUp(node_5, {});

				var text_3 = $.sibling(node_5);

				$.reset(button_3);

				var button_4 = $.sibling(button_3, 2);
				var node_6 = $.child(button_4);

				ArrowDown(node_6, {});

				var text_4 = $.sibling(node_6);

				$.reset(button_4);

				var node_7 = $.sibling(button_4, 2);

				Separator(node_7, {});

				var button_5 = $.sibling(node_7, 2);
				var node_8 = $.child(button_5);

				Trash(node_8, {});

				var text_5 = $.sibling(node_8);

				$.reset(button_5);

				$.template_effect(() => {
					$.set_attribute(button, 'title', strings.menu.table.headerRow);
					$.set_text(text, ` ${strings.menu.table.headerRow ?? ''}`);
					$.set_attribute(button_1, 'title', strings.menu.table.addRowAfter);
					$.set_text(text_1, ` ${strings.menu.table.addRowAfter ?? ''}`);
					$.set_attribute(button_2, 'title', strings.menu.table.addRowBefore);
					$.set_text(text_2, ` ${strings.menu.table.addRowBefore ?? ''}`);
					$.set_attribute(button_3, 'title', strings.menu.table.moveRowUp);
					$.set_text(text_3, ` ${strings.menu.table.moveRowUp ?? ''}`);
					$.set_attribute(button_4, 'title', strings.menu.table.moveRowDown);
					$.set_text(text_4, ` ${strings.menu.table.moveRowDown ?? ''}`);
					$.set_attribute(button_5, 'title', strings.menu.table.deleteRow);
					$.set_text(text_5, ` ${strings.menu.table.deleteRow ?? ''}`);
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