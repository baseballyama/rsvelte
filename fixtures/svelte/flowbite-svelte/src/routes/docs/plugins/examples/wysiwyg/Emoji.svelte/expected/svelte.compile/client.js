import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { UndoRedoButtonGroup, TextEditor, ToolbarRowWrapper } from "@flowbite-svelte-plugins/texteditor";
import { Button } from "flowbite-svelte";

var root = $.from_html(`<!> <div class="mt-4"><!> <!></div>`, 1);

export default function Emoji($$anchor) {
	let editorInstance = $.state(null);

	function getEditorContent() {
		return $.get(editorInstance)?.getHTML() ?? "";
	}

	function setEditorContent(content) {
		$.get(editorInstance)?.commands.setContent(content);
	}

	let content = `
        <p>
          These <span data-type="emoji" data-name="smiley"></span>
          are <span data-type="emoji" data-name="fire"></span>
          some <span data-type="emoji" data-name="smiley_cat"></span>
          emojis <span data-type="emoji" data-name="exploding_head"></span>
          rendered <span data-type="emoji" data-name="ghost"></span>
          as <span data-type="emoji" data-name="massage"></span>
          inline <span data-type="emoji" data-name="v"></span>
          nodes.
        </p>
        <p>
          Type <code>:</code> to open the autocomplete.
        </p>
        <p>
          Even <span data-type="emoji" data-name="octocat"></span>
          custom <span data-type="emoji" data-name="trollface"></span>
          emojis <span data-type="emoji" data-name="neckbeard"></span>
          are <span data-type="emoji" data-name="rage1"></span>
          supported.
        </p>
        <p>
          And unsupported emojis (without a fallback image) are rendered as just the shortcode <span data-type="emoji" data-name="this_does_not_exist"></span>.
        </p>
        <pre><code>In code blocks all emojis are rendered as plain text. 👩‍💻👨‍💻</code></pre>
      `;

	var fragment = root();
	var node = $.first_child(fragment);

	TextEditor(node, {
		content,
		contentprops: { id: "emoji-ex" },
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