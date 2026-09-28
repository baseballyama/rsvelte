import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toolbar, UndoButton, RedoButton } from '$lib/index.js';

var root = $.from_html(`<!> <!>`, 1);

export default function Composer1Toolbar($$anchor) {
	{
		const children = ($$anchor, $$arg0) => {
			let editor = () => ($$arg0?.()).editor;
			let activeEditor = () => ($$arg0?.()).activeEditor;
			let blockType = () => ($$arg0?.()).blockType;
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			UndoButton(node, {});

			var node_1 = $.sibling(node, 2);

			RedoButton(node_1, {});
			$.append($$anchor, fragment_1);
		};

		Toolbar($$anchor, { children, $$slots: { default: true } });
	}
}