import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TaskListButtonGroup, TextEditor } from "@flowbite-svelte-plugins/texteditor";

export default function Tasklist($$anchor) {
	let editorInstance = $.state(null);

	const content = `Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi veniam nulla impedit, fugit similique nihil deserunt velit ea, laboriosam sequi!
        <ul data-type="taskList">
          <li data-type="taskItem" data-checked="true">A list item</li>
          <li data-type="taskItem" data-checked="false">And another one</li>
        </ul>
  Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi veniam nulla impedit, fugit similique nihil deserunt velit ea, laboriosam sequi!
      `;

	TextEditor($$anchor, {
		content,
		contentprops: { id: "task-ex" },
		get editor() {
			return $.get(editorInstance);
		},

		set editor($$value) {
			$.set(editorInstance, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			TaskListButtonGroup($$anchor, {
				get editor() {
					return $.get(editorInstance);
				}
			});
		},
		$$slots: { default: true }
	});
}