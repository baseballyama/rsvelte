import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<!> <div class="mt-4"><!> <!></div>`, 1);

export default function FullFeaturedTexteditor($$anchor) {
	let editorInstance = $.state(null);
	let isEditable = $.state(true);

	function getEditorContent() {
		return $.get(editorInstance)?.getHTML() ?? "";
	}

	function setEditorContent(content) {
		$.get(editorInstance)?.commands.setContent(content);
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
		$.set(isEditable, editable, true);
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

	var fragment = root_4();
	var node = $.first_child(fragment);

	{
		const footer = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					CharacterCount($$anchor, {
						get editor() {
							return $.get(editorInstance);
						},
						limit: 700
					});
				};

				$.if(node_1, ($$render) => {
					if ($.get(editorInstance)) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		};

		TextEditor(node, {
			content,
			get mentions() {
				return mentions;
			},
			file: true,
			get isEditable() {
				return $.get(isEditable);
			},
			contentprops: { id: "drag-handle-editable" },
			get editor() {
				return $.get(editorInstance);
			},

			set editor($$value) {
				$.set(editorInstance, $$value, true);
			},
			footer,
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root();
				var node_2 = $.first_child(fragment_3);

				ToolbarRowWrapper(node_2, {
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root();
						var node_3 = $.first_child(fragment_4);

						EditableButton(node_3, {
							get editor() {
								return $.get(editorInstance);
							},
							onToggle: handleEditableToggle,
							get isEditable() {
								return $.get(isEditable);
							},

							set isEditable($$value) {
								$.set(isEditable, $$value, true);
							}
						});

						var node_4 = $.sibling(node_3, 2);

						Divider(node_4, {});

						var node_5 = $.sibling(node_4, 2);

						FormatButtonGroup(node_5, {
							get editor() {
								return $.get(editorInstance);
							}
						});

						var node_6 = $.sibling(node_5, 2);

						Divider(node_6, {});

						var node_7 = $.sibling(node_6, 2);

						HeadingButtonGroup(node_7, {
							get editor() {
								return $.get(editorInstance);
							}
						});

						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});

				var node_8 = $.sibling(node_2, 2);

				ToolbarRowWrapper(node_8, {
					toolbarrawprops: { top: false },
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root_1();
						var node_9 = $.first_child(fragment_5);

						UndoRedoButtonGroup(node_9, {
							get editor() {
								return $.get(editorInstance);
							}
						});

						var node_10 = $.sibling(node_9, 2);

						Divider(node_10, {});

						var node_11 = $.sibling(node_10, 2);

						LayoutButtonGroup(node_11, {
							get editor() {
								return $.get(editorInstance);
							}
						});

						var node_12 = $.sibling(node_11, 2);

						Divider(node_12, {});

						var node_13 = $.sibling(node_12, 2);

						ImageButtonGroup(node_13, {
							get editor() {
								return $.get(editorInstance);
							}
						});

						var node_14 = $.sibling(node_13, 2);

						Divider(node_14, {});

						var node_15 = $.sibling(node_14, 2);

						YoutubeButtonGroup(node_15, {
							get editor() {
								return $.get(editorInstance);
							}
						});

						var node_16 = $.sibling(node_15, 2);

						Divider(node_16, {});

						var node_17 = $.sibling(node_16, 2);

						InvisibleButtonGroup(node_17, {
							get editor() {
								return $.get(editorInstance);
							}
						});

						var node_18 = $.sibling(node_17, 2);

						Divider(node_18, {});

						var node_19 = $.sibling(node_18, 2);

						SourceButtonGroup(node_19, {
							get editor() {
								return $.get(editorInstance);
							}
						});

						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});

				var node_20 = $.sibling(node_8, 2);

				ToolbarRowWrapper(node_20, {
					toolbarrawprops: { top: false },
					children: ($$anchor, $$slotProps) => {
						var fragment_6 = root_2();
						var node_21 = $.first_child(fragment_6);

						DetailsButtonGroup(node_21, {
							get editor() {
								return $.get(editorInstance);
							}
						});

						var node_22 = $.sibling(node_21, 2);

						Divider(node_22, {});

						var node_23 = $.sibling(node_22, 2);

						ListButtonGroup(node_23, {
							get editor() {
								return $.get(editorInstance);
							}
						});

						var node_24 = $.sibling(node_23, 2);

						Divider(node_24, {});

						var node_25 = $.sibling(node_24, 2);

						AlignmentButtonGroup(node_25, {
							get editor() {
								return $.get(editorInstance);
							}
						});

						var node_26 = $.sibling(node_25, 2);

						Divider(node_26, {});

						var node_27 = $.sibling(node_26, 2);

						ExportButtonGroup(node_27, {
							get editor() {
								return $.get(editorInstance);
							}
						});

						$.append($$anchor, fragment_6);
					},
					$$slots: { default: true }
				});

				var node_28 = $.sibling(node_20, 2);

				ToolbarRowWrapper(node_28, {
					toolbarrawprops: { top: false },
					children: ($$anchor, $$slotProps) => {
						TaskListButtonGroup($$anchor, {
							get editor() {
								return $.get(editorInstance);
							}
						});
					},
					$$slots: { default: true }
				});

				var node_29 = $.sibling(node_28, 2);

				ToolbarRowWrapper(node_29, {
					toolbarrawprops: { top: false },
					children: ($$anchor, $$slotProps) => {
						var fragment_8 = root_3();
						var node_30 = $.first_child(fragment_8);

						TableButtonGroup1(node_30, {
							get editor() {
								return $.get(editorInstance);
							}
						});

						var node_31 = $.sibling(node_30, 2);

						TableButtonGroup2(node_31, {
							get editor() {
								return $.get(editorInstance);
							}
						});

						$.append($$anchor, fragment_8);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_3);
			},
			$$slots: { footer: true, default: true }
		});
	}

	var div = $.sibling(node, 2);
	var node_32 = $.child(div);

	Button(node_32, {
		onclick: () => console.log(getEditorContent()),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Log Content');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_33 = $.sibling(node_32, 2);

	Button(node_33, {
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