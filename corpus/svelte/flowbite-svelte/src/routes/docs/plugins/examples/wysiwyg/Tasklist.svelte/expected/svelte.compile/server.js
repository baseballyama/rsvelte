import * as $ from 'svelte/internal/server';
import { TaskListButtonGroup, TextEditor } from "@flowbite-svelte-plugins/texteditor";

export default function Tasklist($$renderer) {
	let editorInstance = null;

	const content = `Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi veniam nulla impedit, fugit similique nihil deserunt velit ea, laboriosam sequi!
        <ul data-type="taskList">
          <li data-type="taskItem" data-checked="true">A list item</li>
          <li data-type="taskItem" data-checked="false">And another one</li>
        </ul>
  Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi veniam nulla impedit, fugit similique nihil deserunt velit ea, laboriosam sequi!
      `;

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		TextEditor($$renderer, {
			content,
			contentprops: { id: "task-ex" },
			get editor() {
				return editorInstance;
			},

			set editor($$value) {
				editorInstance = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				TaskListButtonGroup($$renderer, { editor: editorInstance });
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
}