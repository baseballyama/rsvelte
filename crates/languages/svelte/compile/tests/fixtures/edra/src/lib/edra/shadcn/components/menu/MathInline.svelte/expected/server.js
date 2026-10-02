import * as $ from 'svelte/internal/server';
import { Button } from '$lib/components/ui/button/index.js';
import { Input } from '$lib/components/ui/input/index.js';
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
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
				class: 'flex h-fit w-fit items-center gap-1 rounded-lg border bg-popover shadow-lg',
				children: ($$renderer) => {
					Input($$renderer, {
						onchange: updateLatex,
						placeholder: strings.menu.math.enterExpressionPlaceholder,
						class: 'w-64',
						get value() {
							return latex();
						},

						set value($$value) {
							latex($$value);
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						variant: 'default',
						size: 'icon',
						onclick: updateLatex,
						children: ($$renderer) => {
							CornerDownLeft($$renderer, {});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
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