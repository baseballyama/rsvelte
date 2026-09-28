import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Textarea } from '$lib/components/ui/textarea/index.js';
import { BubbleMenu, getEditor, useEditorState } from '../../../tiptap/index.js';
import strings from '../../../strings.js';

export default function MathBlock($$anchor, $$props) {
	$.push($$props, true);

	const $editorState = () => $.store_get(editorState, '$editorState', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const editor = getEditor();

	const editorState = useEditorState({
		editor,
		selector: ({ editor }) => ({ latex: editor.getAttributes('blockMath').latex })
	});

	let latex = $.derived(() => $editorState().latex);

	function updateLatex() {
		editor.commands.updateBlockMath({ latex: $.get(latex) });
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
			pluginKey: 'math-block-bubble-menu',
			shouldShow: (props) => {
				const { editor: propsEditor, state } = props;

				if (!propsEditor || !propsEditor.isEditable) return false;
				if (!state) return false;

				return propsEditor.isActive('blockMath');
			},

			get options() {
				return $.get($0);
			},
			class: 'h-fit w-fit flex-col items-center gap-1 rounded-lg border bg-popover shadow-lg',
			children: ($$anchor, $$slotProps) => {
				Textarea($$anchor, {
					oninput: updateLatex,
					get placeholder() {
						return strings.menu.math.enterExpressionPlaceholder;
					},
					class: 'h-48 w-96',
					get value() {
						return $.get(latex);
					},

					set value($$value) {
						$.set(latex, $$value);
					}
				});
			},
			$$slots: { default: true }
		});
	}

	$.pop();
	$$cleanup();
}