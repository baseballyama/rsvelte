import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SourceButtonGroup, TextEditor } from "@flowbite-svelte-plugins/texteditor";

export default function SourceAndHtml($$anchor) {
	let editorInstance = $.state(null);

	const content = `<p>Flowbite-Svelte is an <strong>open-source library of UI components</strong> based on the utility-first Tailwind CSS framework featuring dark mode support, a Figma design system, and more.</p>
    <p>Here is an example of a code block:</p><pre><code class="language-javascript">for (var i=1; i <= 20; i++)
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

	TextEditor($$anchor, {
		content,
		contentprops: { id: "sources-ex" },
		get editor() {
			return $.get(editorInstance);
		},

		set editor($$value) {
			$.set(editorInstance, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			SourceButtonGroup($$anchor, {
				get editor() {
					return $.get(editorInstance);
				}
			});
		},
		$$slots: { default: true }
	});
}