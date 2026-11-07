import * as $ from 'svelte/internal/server';
import { UndoRedoButtonGroup, TextEditor, ToolbarRowWrapper } from "@flowbite-svelte-plugins/texteditor";
import { Button } from "flowbite-svelte";

export default function Mention($$renderer) {
	let editorInstance = null;

	function getEditorContent() {
		return editorInstance?.getHTML() ?? "";
	}

	function setEditorContent(content) {
		editorInstance?.commands.setContent(content);
	}

	let content = `
        <p>Hi everyone! Don’t forget the daily stand up at 8 AM.</p>
        <p><span data-type="mention" data-id="Jennifer Grey"></span> Would you mind to share what you’ve been working on lately? We fear not much happened since Dirty Dancing.
        <p><span data-type="mention" data-id="Winona Ryder"></span> <span data-type="mention" data-id="Axl Rose"></span> Let’s go through your most important points quickly.</p>
        <p>I have a meeting with <span data-type="mention" data-id="Christina Applegate"></span> and don’t want to come late.</p>
        <p>– Thanks, your big boss</p>
      `;

	const mentions = [
		"Lea Thompson",
		"Cyndi Lauper",
		"Tom Cruise",
		"Madonna",
		"Jerry Hall",
		"Joan Collins",
		"Winona Ryder",
		"Christina Applegate",
		"Alyssa Milano",
		"Molly Ringwald",
		"Ally Sheedy",
		"Debbie Harry",
		"Olivia Newton-John",
		"Elton John",
		"Michael J. Fox",
		"Axl Rose",
		"Emilio Estevez",
		"Ralph Macchio",
		"Rob Lowe",
		"Jennifer Grey",
		"Mickey Rourke",
		"John Cusack",
		"Matthew Broderick",
		"Justine Bateman",
		"Lisa Bonet"
	];

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		TextEditor($$renderer, {
			content,
			mentions,
			contentprops: { id: "mention-ex" },
			get editor() {
				return editorInstance;
			},

			set editor($$value) {
				editorInstance = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				ToolbarRowWrapper($$renderer, {
					children: ($$renderer) => {
						UndoRedoButtonGroup($$renderer, { editor: editorInstance });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="mt-4">`);

		Button($$renderer, {
			onclick: () => console.log(getEditorContent()),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Get Content`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => setEditorContent("<p>New content!</p>"),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Set Content`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}