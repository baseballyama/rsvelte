import * as $ from 'svelte/internal/server';

import {
	TextEditor,
	ToolbarRowWrapper,
	AlignmentButtonGroup,
	CharacterCount,
	DetailsButtonGroup,
	Divider,
	EditableButton,
	ExportButtonGroup,
	FormatButtonGroup,
	HeadingButtonGroup,
	ImageButtonGroup,
	InvisibleButtonGroup,
	LayoutButtonGroup,
	ListButtonGroup,
	SourceButtonGroup,
	TableButtonGroup1,
	TableButtonGroup2,
	TaskListButtonGroup,
	UndoRedoButtonGroup,
	YoutubeButtonGroup
} from "@flowbite-svelte-plugins/texteditor";

import { Button } from "flowbite-svelte";

export default function FullFeaturedTexteditor($$renderer) {
	let editorInstance = null;
	let isEditable = true;

	function getEditorContent() {
		return editorInstance?.getHTML() ?? "";
	}

	function setEditorContent(content) {
		editorInstance?.commands.setContent(content);
	}

	const content = `<p>Flowbite-Svelte is an <strong>open-source library of UI components</strong> based on the utility-first Tailwind CSS framework featuring dark mode support, a Figma design system, and more.</p><p>It includes all of the commonly used components that a website requires, such as buttons, dropdowns, navigation bars, modals, datepickers, advanced charts and the list goes on.</p>
    <p>Here is an example of a js block:</p><pre><code class="language-javascript">for (var i=1; i <= 20; i++)
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

	function handleEditableToggle(editable) {
		isEditable = editable;
		console.log("Editor is now:", editable ? "editable" : "read-only");
	}

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
		{
			function footer($$renderer) {
				if (editorInstance) {
					$$renderer.push('<!--[0-->');
					CharacterCount($$renderer, { editor: editorInstance, limit: 700 });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			TextEditor($$renderer, {
				content,
				mentions,
				file: true,
				isEditable,
				contentprops: { id: "drag-handle-editable" },
				get editor() {
					return editorInstance;
				},

				set editor($$value) {
					editorInstance = $$value;
					$$settled = false;
				},
				footer,
				children: ($$renderer) => {
					ToolbarRowWrapper($$renderer, {
						children: ($$renderer) => {
							EditableButton($$renderer, {
								editor: editorInstance,
								onToggle: handleEditableToggle,
								get isEditable() {
									return isEditable;
								},

								set isEditable($$value) {
									isEditable = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);
							Divider($$renderer, {});
							$$renderer.push(`<!----> `);
							FormatButtonGroup($$renderer, { editor: editorInstance });
							$$renderer.push(`<!----> `);
							Divider($$renderer, {});
							$$renderer.push(`<!----> `);
							HeadingButtonGroup($$renderer, { editor: editorInstance });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ToolbarRowWrapper($$renderer, {
						toolbarrawprops: { top: false },
						children: ($$renderer) => {
							UndoRedoButtonGroup($$renderer, { editor: editorInstance });
							$$renderer.push(`<!----> `);
							Divider($$renderer, {});
							$$renderer.push(`<!----> `);
							LayoutButtonGroup($$renderer, { editor: editorInstance });
							$$renderer.push(`<!----> `);
							Divider($$renderer, {});
							$$renderer.push(`<!----> `);
							ImageButtonGroup($$renderer, { editor: editorInstance });
							$$renderer.push(`<!----> `);
							Divider($$renderer, {});
							$$renderer.push(`<!----> `);
							YoutubeButtonGroup($$renderer, { editor: editorInstance });
							$$renderer.push(`<!----> `);
							Divider($$renderer, {});
							$$renderer.push(`<!----> `);
							InvisibleButtonGroup($$renderer, { editor: editorInstance });
							$$renderer.push(`<!----> `);
							Divider($$renderer, {});
							$$renderer.push(`<!----> `);
							SourceButtonGroup($$renderer, { editor: editorInstance });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ToolbarRowWrapper($$renderer, {
						toolbarrawprops: { top: false },
						children: ($$renderer) => {
							DetailsButtonGroup($$renderer, { editor: editorInstance });
							$$renderer.push(`<!----> `);
							Divider($$renderer, {});
							$$renderer.push(`<!----> `);
							ListButtonGroup($$renderer, { editor: editorInstance });
							$$renderer.push(`<!----> `);
							Divider($$renderer, {});
							$$renderer.push(`<!----> `);
							AlignmentButtonGroup($$renderer, { editor: editorInstance });
							$$renderer.push(`<!----> `);
							Divider($$renderer, {});
							$$renderer.push(`<!----> `);
							ExportButtonGroup($$renderer, { editor: editorInstance });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ToolbarRowWrapper($$renderer, {
						toolbarrawprops: { top: false },
						children: ($$renderer) => {
							TaskListButtonGroup($$renderer, { editor: editorInstance });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ToolbarRowWrapper($$renderer, {
						toolbarrawprops: { top: false },
						children: ($$renderer) => {
							TableButtonGroup1($$renderer, { editor: editorInstance });
							$$renderer.push(`<!----> `);
							TableButtonGroup2($$renderer, { editor: editorInstance });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { footer: true, default: true }
			});
		}

		$$renderer.push(`<!----> <div class="mt-4">`);

		Button($$renderer, {
			onclick: () => console.log(getEditorContent()),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Log Content`);
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