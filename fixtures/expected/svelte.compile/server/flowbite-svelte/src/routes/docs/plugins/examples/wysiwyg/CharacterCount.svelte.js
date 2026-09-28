import * as $ from 'svelte/internal/server';
import { CharacterCount, UndoRedoButtonGroup, TextEditor } from "@flowbite-svelte-plugins/texteditor";

export default function CharacterCount_1($$renderer) {
	let editorInstance = null;

	const content = `<p>
    Let‘s make sure people can’t write more than 280 characters. I bet you could build one of the biggest social networks on that idea.
  </p>`;

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		{
			function footer($$renderer) {
				if (editorInstance) {
					$$renderer.push('<!--[0-->');
					CharacterCount($$renderer, { editor: editorInstance, limit: 280 });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			TextEditor($$renderer, {
				content,
				get editor() {
					return editorInstance;
				},

				set editor($$value) {
					editorInstance = $$value;
					$$settled = false;
				},
				footer,
				children: ($$renderer) => {
					UndoRedoButtonGroup($$renderer, { editor: editorInstance });
				},
				$$slots: { footer: true, default: true }
			});
		}
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}