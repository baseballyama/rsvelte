import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button/index.js';
import { Input } from '$lib/components/ui/input/index.js';
import strings from '../../../strings.js';
import { BubbleMenu, getEditor, useEditorState } from '../../../tiptap/index.js';
import CornerDownLeft from '@lucide/svelte/icons/corner-down-left';

var root = $.from_html(`<!> <!>`, 1);

export default function MathInline($$anchor, $$props) {
	$.push($$props, true);

	const $editorState = () => $.store_get(editorState, '$editorState', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const editor = getEditor();

	const editorState = useEditorState({
		editor,
		selector: ({ editor }) => ({ latex: editor.getAttributes('inlineMath').latex })
	});

	let latex = $.derived(() => $editorState().latex);

	function updateLatex() {
		editor.commands.updateInlineMath({ latex: $.get(latex) });
	}

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
			pluginKey: 'math-inline-bubble-menu',
			shouldShow: (props) => {
				const { editor: propsEditor, state } = props;

				if (!propsEditor || !propsEditor.isEditable) return false;
				if (!state) return false;

				return propsEditor.isActive('inlineMath');
			},

			get options() {
				return $.get($0);
			},
			class: 'flex h-fit w-fit items-center gap-1 rounded-lg border bg-popover shadow-lg',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node = $.first_child(fragment_1);

				Input(node, {
					onchange: updateLatex,
					get placeholder() {
						return strings.menu.math.enterExpressionPlaceholder;
					},
					class: 'w-64',
					get value() {
						return $.get(latex);
					},

					set value($$value) {
						$.set(latex, $$value);
					}
				});

				var node_1 = $.sibling(node, 2);

				Button(node_1, {
					variant: 'default',
					size: 'icon',
					onclick: updateLatex,
					children: ($$anchor, $$slotProps) => {
						CornerDownLeft($$anchor, {});
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