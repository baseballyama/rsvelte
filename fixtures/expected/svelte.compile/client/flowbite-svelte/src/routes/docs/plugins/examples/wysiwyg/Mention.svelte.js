import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { UndoRedoButtonGroup, TextEditor, ToolbarRowWrapper } from "@flowbite-svelte-plugins/texteditor";
import { Button } from "flowbite-svelte";

var root = $.from_html(`<!> <div class="mt-4"><!> <!></div>`, 1);

export default function Mention($$anchor) {
	let editorInstance = $.state(null);

	function getEditorContent() {
		return $.get(editorInstance)?.getHTML() ?? "";
	}

	function setEditorContent(content) {
		$.get(editorInstance)?.commands.setContent(content);
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

	var fragment = root();
	var node = $.first_child(fragment);

	TextEditor(node, {
		content,
		get mentions() {
			return mentions;
		},
		contentprops: { id: "mention-ex" },
		get editor() {
			return $.get(editorInstance);
		},

		set editor($$value) {
			$.set(editorInstance, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			ToolbarRowWrapper($$anchor, {
				children: ($$anchor, $$slotProps) => {
					UndoRedoButtonGroup($$anchor, {
						get editor() {
							return $.get(editorInstance);
						}
					});
				},
				$$slots: { default: true }
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