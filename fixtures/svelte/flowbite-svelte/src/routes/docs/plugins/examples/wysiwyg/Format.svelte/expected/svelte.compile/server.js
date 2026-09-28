import * as $ from 'svelte/internal/server';
import { FormatButtonGroup, TextEditor } from "@flowbite-svelte-plugins/texteditor";
import { Button } from "flowbite-svelte";

export default function Format($$renderer) {
	let editorInstance = null;

	function getEditorContent() {
		return editorInstance?.getHTML() ?? "";
	}

	function setEditorContent(content) {
		editorInstance?.commands.setContent(content);
	}

	const content = `<p>Flowbite-Svelte is an <strong>open-source library of UI components</strong> based on the utility-first Tailwind CSS framework featuring dark mode support, a Figma design system, and more.</p><p>It includes all of the commonly used components that a website requires, such as buttons, dropdowns, navigation bars, modals, datepickers, advanced charts and the list goes on.</p><p>Here is an example of a code block:</p><pre><code class="language-javascript">for (var i=1; i <= 20; i++)
{
  if (i % 15 == 0)
    console.log("FizzBuzz");
  else if (i % 3 == 0)
    console.log("Fizz");
  else if (i % 5 == 0)
    console.log("Buzz");
  else
    console.log(i);
}</code></pre><p>Learn more about all components from the <a href="https://flowbite-svelte.com/docs/pages/quickstart">Flowbite-Svelte Docs</a>.</p>`;

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		TextEditor($$renderer, {
			content,
			contentprops: { id: "formats-ex" },
			get editor() {
				return editorInstance;
			},

			set editor($$value) {
				editorInstance = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				FormatButtonGroup($$renderer, { editor: editorInstance });
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