import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setEditor } from './editorContext.js';

export default function Tiptap($$anchor, $$props) {
	$.push($$props, true);

	if ($$props.editor) {
		setEditor($$props.editor);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.children);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($$props.editor && $$props.children) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}