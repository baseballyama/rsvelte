import * as $ from 'svelte/internal/server';

import {
	TextEditor,
	AlignmentButtonGroup,
	UndoRedoButtonGroup,
	BubbleMenu
} from "@flowbite-svelte-plugins/texteditor";

import { Button } from "flowbite-svelte";

export default function BubbleMenu_1($$renderer) {
	let editorInstance = null;

	function getEditorContent() {
		return editorInstance?.getHTML() ?? "";
	}

	function setEditorContent(content) {
		editorInstance?.commands.setContent(content);
	}

	const content = "<p>Flowbite-Svelte is an <strong>open-source library of UI components</strong> based on the utility-first Tailwind CSS framework featuring dark mode support, a Figma design system, and more.</p><p>It includes all of the commonly used components that a website requires, such as buttons, dropdowns, navigation bars, modals, datepickers, advanced charts and the list goes on.</p>";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		TextEditor($$renderer, {
			content,
			contentprops: { id: "bubble-menu-ex" },
			get editor() {
				return editorInstance;
			},

			set editor($$value) {
				editorInstance = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				UndoRedoButtonGroup($$renderer, { editor: editorInstance });
				$$renderer.push(`<!----> `);
				AlignmentButtonGroup($$renderer, { editor: editorInstance });
				$$renderer.push(`<!----> `);
				BubbleMenu($$renderer, { editor: editorInstance });
				$$renderer.push(`<!---->`);
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