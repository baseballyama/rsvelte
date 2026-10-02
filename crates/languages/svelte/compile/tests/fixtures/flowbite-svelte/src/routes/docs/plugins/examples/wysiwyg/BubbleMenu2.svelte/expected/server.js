import * as $ from 'svelte/internal/server';

import {
	TextEditor,
	AlignmentButtonGroup,
	UndoRedoButtonGroup,
	BubbleMenu
} from "@flowbite-svelte-plugins/texteditor";

export default function BubbleMenu2($$renderer) {
	let editorInstance = null;
	const content = "<p>Flowbite-Svelte is an <strong>open-source library of UI components</strong> based on the utility-first Tailwind CSS framework featuring dark mode support, a Figma design system, and more.</p><p>It includes all of the commonly used components that a website requires, such as buttons, dropdowns, navigation bars, modals, datepickers, advanced charts and the list goes on.</p>";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		TextEditor($$renderer, {
			content,
			contentprops: { id: "bubble-menu-ex2" },
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

				BubbleMenu($$renderer, {
					editor: editorInstance,
					showStrike: false,
					showHighlight: false
				});

				$$renderer.push(`<!---->`);
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