import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import strings from '../../../strings.js';
import { BubbleMenu, getEditor, useEditorState } from '../../../tiptap/index.js';
import CornerDownLeft from '@lucide/svelte/icons/corner-down-left';

var root = $.from_html(`<input class="edra-input math-inline-input svelte-1evyg74"/> <button class="edra-btn edra-btn-primary edra-btn-icon save-btn svelte-1evyg74"><!></button>`, 1);

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
			class: 'math-inline-menu',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var input = $.first_child(fragment_1);

				$.remove_input_defaults(input);

				var button = $.sibling(input, 2);
				var node = $.child(button);

				CornerDownLeft(node, { class: 'action-icon' });
				$.reset(button);
				$.template_effect(() => $.set_attribute(input, 'placeholder', strings.menu.math.enterExpressionPlaceholder));
				$.delegated('change', input, updateLatex);
				$.bind_value(input, () => $.get(latex), ($$value) => $.set(latex, $$value));
				$.delegated('click', button, updateLatex);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
	$$cleanup();
}

$.delegate(['change', 'click']);