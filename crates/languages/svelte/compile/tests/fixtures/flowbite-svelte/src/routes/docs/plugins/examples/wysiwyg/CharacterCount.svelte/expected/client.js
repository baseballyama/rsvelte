import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CharacterCount, UndoRedoButtonGroup, TextEditor } from "@flowbite-svelte-plugins/texteditor";

export default function CharacterCount_1($$anchor) {
	let editorInstance = $.state(null);

	const content = `<p>
    Let‘s make sure people can’t write more than 280 characters. I bet you could build one of the biggest social networks on that idea.
  </p>`;

	{
		const footer = ($$anchor) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					CharacterCount($$anchor, {
						get editor() {
							return $.get(editorInstance);
						},
						limit: 280
					});
				};

				$.if(node, ($$render) => {
					if ($.get(editorInstance)) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		};

		TextEditor($$anchor, {
			content,
			get editor() {
				return $.get(editorInstance);
			},

			set editor($$value) {
				$.set(editorInstance, $$value, true);
			},
			footer,
			children: ($$anchor, $$slotProps) => {
				UndoRedoButtonGroup($$anchor, {
					get editor() {
						return $.get(editorInstance);
					}
				});
			},
			$$slots: { footer: true, default: true }
		});
	}
}