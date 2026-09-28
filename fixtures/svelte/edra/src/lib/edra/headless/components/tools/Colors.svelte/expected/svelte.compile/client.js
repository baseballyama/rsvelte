import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { quickcolors } from '../../../utils.ts';
import Popover from '../../primitives/Popover.svelte';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import Tooltip from '../Tooltip.svelte';
import { getEditor, useEditorState } from '../../../tiptap/index.js';

var root = $.from_html(`<button class="edra-btn edra-btn-ghost edra-btn-icon colors-trigger svelte-1wtg13v"><span>A</span> <!></button>`);
var root_1 = $.from_html(`<button class="color-btn svelte-1wtg13v">A</button>`);
var root_2 = $.from_html(`<div class="colors-panel svelte-1wtg13v"><div class="title svelte-1wtg13v">Text Colors</div> <div class="colors-grid svelte-1wtg13v"></div> <div class="title margin-top svelte-1wtg13v">Background Colors</div> <div class="colors-grid svelte-1wtg13v"></div></div>`);

export default function Colors($$anchor, $$props) {
	$.push($$props, true);

	const $editorState = () => $.store_get(editorState, '$editorState', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let open = $.state(false);
	const editor = getEditor();

	const editorState = useEditorState({
		editor,
		selector: ({ editor }) => ({
			currentColor: editor.getAttributes('textStyle').color,
			currentHighlight: editor.getAttributes('highlight').color,
			isActive(name, opts) {
				return editor.isActive(name, opts) ?? false;
			}
		})
	});

	const currentColor = $.derived(() => $editorState().currentColor);
	const currentHighlight = $.derived(() => $editorState().currentHighlight);

	{
		const trigger = ($$anchor) => {
			Tooltip($$anchor, {
				tooltip: 'Quick Colors',
				children: ($$anchor, $$slotProps) => {
					var button = root();
					var node = $.sibling($.child(button), 2);

					ChevronDown(node, { class: 'chevron-icon' });
					$.reset(button);
					$.template_effect(() => $.set_style(button, `color: ${$.get(currentColor) || 'inherit'}; background-color: ${$.get(currentHighlight) ? $.get(currentHighlight) + '75' : 'transparent'};`));
					$.append($$anchor, button);
				},
				$$slots: { default: true }
			});
		};

		Popover($$anchor, {
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},
			trigger,
			children: ($$anchor, $$slotProps) => {
				var div = root_2();
				var div_1 = $.sibling($.child(div), 2);

				$.each(div_1, 21, () => quickcolors, (color) => color.label, ($$anchor, color) => {
					var button_1 = root_1();

					$.template_effect(
						($0) => {
							$.set_style(button_1, $0);
							$.set_attribute(button_1, 'title', $.get(color).label);
						},
						[
							() => `color: ${$.get(color).value}; background-color: ${$.get(color).value}30; border-color: ${$editorState().isActive('textStyle', { color: $.get(color).value })
								? 'var(--edra-ink)'
								: $.get(color).value || 'var(--edra-border)'};`
						]
					);

					$.delegated('click', button_1, () => {
						if ($.get(color).value === '' || $.get(color).label === 'Default') {
							editor.chain().focus().unsetColor().run();
						} else {
							editor.chain().focus().setColor($.get(currentColor) === $.get(color).value ? '' : $.get(color).value).run();
						}

						$.set(open, false);
					});

					$.append($$anchor, button_1);
				});

				$.reset(div_1);

				var div_2 = $.sibling(div_1, 4);

				$.each(div_2, 21, () => quickcolors, (color) => color.label, ($$anchor, color) => {
					var button_2 = root_1();

					$.template_effect(
						($0) => {
							$.set_style(button_2, $0);
							$.set_attribute(button_2, 'title', $.get(color).label);
						},
						[
							() => `background-color: ${$.get(color).value ? $.get(color).value + '50' : 'transparent'}; border-color: ${$editorState().isActive('highlight', { color: $.get(color).value }) ? 'var(--edra-ink)' : 'var(--edra-border)'};`
						]
					);

					$.delegated('click', button_2, () => {
						if ($.get(color).value === '' || $.get(color).label === 'Default') {
							editor.chain().focus().unsetHighlight().run();
						} else {
							editor.chain().focus().toggleHighlight({ color: `${$.get(color).value}50` }).run();
						}

						$.set(open, false);
					});

					$.append($$anchor, button_2);
				});

				$.reset(div_2);
				$.reset(div);
				$.append($$anchor, div);
			},
			$$slots: { trigger: true, default: true }
		});
	}

	$.pop();
	$$cleanup();
}

$.delegate(['click']);