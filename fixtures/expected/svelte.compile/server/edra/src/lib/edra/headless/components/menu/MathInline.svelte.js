import * as $ from 'svelte/internal/server';
import strings from '../../../strings.js';
import { BubbleMenu, getEditor, useEditorState } from '../../../tiptap/index.js';
import CornerDownLeft from '@lucide/svelte/icons/corner-down-left';

export default function MathInline($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const editor = getEditor();

		const editorState = useEditorState({
			editor,
			selector: ({ editor }) => ({ latex: editor.getAttributes('inlineMath').latex })
		});

		let latex = $.derived(() => $.store_get($$store_subs ??= {}, '$editorState', editorState).latex);

		function updateLatex() {
			editor.commands.updateInlineMath({ latex: latex() });
		}

		BubbleMenu($$renderer, {
			editor,
			pluginKey: 'math-inline-bubble-menu',
			shouldShow: (props) => {
				const { editor: propsEditor, state } = props;

				if (!propsEditor || !propsEditor.isEditable) return false;
				if (!state) return false;

				return propsEditor.isActive('inlineMath');
			},

			options: {
				shift: true,
				autoPlacement: { allowedPlacements: ['top', 'bottom'] },
				strategy: 'absolute',
				scrollTarget: editor.view.dom.parentElement ?? window
			},
			class: 'math-inline-menu',
			children: ($$renderer) => {
				$$renderer.push(`<input${$.attr('value', latex())}${$.attr('placeholder', strings.menu.math.enterExpressionPlaceholder)} class="edra-input math-inline-input svelte-1evyg74"/> <button class="edra-btn edra-btn-primary edra-btn-icon save-btn svelte-1evyg74">`);
				CornerDownLeft($$renderer, { class: 'action-icon' });
				$$renderer.push(`<!----></button>`);
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}