import * as $ from 'svelte/internal/server';
import { Textarea } from '$lib/components/ui/textarea/index.js';
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
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
				class: 'h-fit w-fit flex-col items-center gap-1 rounded-lg border bg-popover shadow-lg',
				children: ($$renderer) => {
					Textarea($$renderer, {
						oninput: updateLatex,
						placeholder: strings.menu.math.enterExpressionPlaceholder,
						class: 'h-48 w-96',
						get value() {
							return latex();
						},

						set value($$value) {
							latex($$value);
							$$settled = false;
						}
					});
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}