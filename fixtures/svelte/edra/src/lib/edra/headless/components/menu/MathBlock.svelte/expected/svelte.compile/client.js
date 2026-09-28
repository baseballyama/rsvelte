import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BubbleMenu, getEditor, useEditorState } from '../../../tiptap/index.js';
import strings from '../../../strings.js';

var root = $.from_html(`<textarea class="edra-textarea math-textarea svelte-16ww29m"></textarea>`);

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
			class: 'math-menu',
			children: ($$anchor, $$slotProps) => {
				var textarea = root();

				$.remove_textarea_child(textarea);
				$.template_effect(() => $.set_attribute(textarea, 'placeholder', strings.menu.math.enterExpressionPlaceholder));
				$.delegated('input', textarea, updateLatex);
				$.bind_value(textarea, () => $.get(latex), ($$value) => $.set(latex, $$value));
				$.append($$anchor, textarea);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
	$$cleanup();
}

$.delegate(['input']);