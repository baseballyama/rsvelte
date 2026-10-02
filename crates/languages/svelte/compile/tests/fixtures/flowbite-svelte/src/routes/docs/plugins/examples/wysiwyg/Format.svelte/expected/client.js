import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { FormatButtonGroup, TextEditor } from "@flowbite-svelte-plugins/texteditor";
import { Button } from "flowbite-svelte";

var root = $.from_html(`<!> <div class="mt-4"><!> <!></div>`, 1);

export default function Format($$anchor) {
	let editorInstance = $.state(null);

	function getEditorContent() {
		return $.get(editorInstance)?.getHTML() ?? "";
	}

	function setEditorContent(content) {
		$.get(editorInstance)?.commands.setContent(content);
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

	var fragment = root();
	var node = $.first_child(fragment);

	TextEditor(node, {
		content,
		contentprops: { id: "formats-ex" },
		get editor() {
			return $.get(editorInstance);
		},

		set editor($$value) {
			$.set(editorInstance, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			FormatButtonGroup($$anchor, {
				get editor() {
					return $.get(editorInstance);
				}
			});
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	Button(node_1, {
		onclick: () => console.log(getEditorContent()),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Get Content');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		onclick: () => setEditorContent("<p>New content!</p>"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Set Content');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}