import * as $ from 'svelte/internal/server';
import { BubbleMenu, getEditor, useEditorState } from '../../../tiptap/index.js';
import strings from '../../../strings.js';

export default function MathBlock($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const editor = getEditor();

		const editorState = useEditorState({
			editor,
			selector: ({ editor }) => ({ latex: editor.getAttributes('blockMath').latex })
		});

		let latex = $.derived(() => $.store_get($$store_subs ??= {}, '$editorState', editorState).latex);

		function updateLatex() {
			editor.commands.updateBlockMath({ latex: latex() });
		}

		BubbleMenu($$renderer, {
			editor,
			pluginKey: 'math-block-bubble-menu',
			shouldShow: (props) => {
				const { editor: propsEditor, state } = props;

				if (!propsEditor || !propsEditor.isEditable) return false;
				if (!state) return false;

				return propsEditor.isActive('blockMath');
			},

			options: {
				shift: true,
				autoPlacement: { allowedPlacements: ['top', 'bottom'] },
				strategy: 'absolute',
				scrollTarget: editor.view.dom.parentElement ?? window
			},
			class: 'math-menu',
			children: ($$renderer) => {
				$$renderer.push(`<textarea${$.attr('placeholder', strings.menu.math.enterExpressionPlaceholder)} class="edra-textarea math-textarea svelte-16ww29m">`);

				const $$body = $.escape(latex());

				if ($$body) {
					$$renderer.push(`${$$body}`);
				} else {}

				$$renderer.push(`</textarea>`);
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}