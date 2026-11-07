import * as $ from 'svelte/internal/server';
import { UndoRedoButtonGroup, TextEditor, ToolbarRowWrapper } from "@flowbite-svelte-plugins/texteditor";
import { Button } from "flowbite-svelte";

export default function Emoji($$renderer) {
	let editorInstance = null;

	function getEditorContent() {
		return editorInstance?.getHTML() ?? "";
	}

	function setEditorContent(content) {
		editorInstance?.commands.setContent(content);
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

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		TextEditor($$renderer, {
			content,
			contentprops: { id: "emoji-ex" },
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