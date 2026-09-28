import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button/index.js';
import { Input } from '$lib/components/ui/input/index.js';
import Check from '@lucide/svelte/icons/check';
import Copy from '@lucide/svelte/icons/copy';
import Edit from '@lucide/svelte/icons/pen';
import Trash2 from '@lucide/svelte/icons/trash-2';
import { Link } from '@lucide/svelte';
import { slide } from 'svelte/transition';
import Tooltip from '../Tooltip.svelte';
import strings from '../../../strings.js';
import { BubbleMenu, getEditor, useEditorState } from '../../../tiptap/index.js';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<form class="flex w-96 items-center gap-0.5"><!> <!></form>`);

export default function Link_1($$anchor, $$props) {
	$.push($$props, true);

	const $editorState = () => $.store_get(editorState, '$editorState', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const editor = getEditor();

	const editorState = useEditorState({
		editor,
		selector: ({ editor }) => ({ link: editor.getAttributes('link').href })
	});

	let isEditing = $.state(false);
	let linkInput = $.derived(() => $editorState().link);

	function handleSubmit(e) {
		e.preventDefault();

		if (!$.get(linkInput) || $.get(linkInput).trim() === '') return;

		$.set(isEditing, false);
		editor.chain().focus().extendMarkRange('link').setLink({ href: $.get(linkInput) }).run();
	}

	{
		let $0 = $.derived(() => ({
			shift: true,
			autoPlacement: { allowedPlacements: ['top', 'bottom'] },
			strategy: 'absolute',
			scrollTarget: editor.view.dom.parentElement ?? window
		}));

		BubbleMenu($$anchor, {
			get editor() {
				return editor;
			},

			shouldShow: (props) => {
				if (props.editor.isActive('link')) {
					return true;
				} else {
					$.set(isEditing, false);
					$.set(linkInput, '');

					return false;
				}
			},

			get options() {
				return $.get($0);
			},
			class: 'flex h-fit w-fit items-center gap-1 rounded-lg border bg-popover p-0!',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						Tooltip(node_1, {
							get tooltip() {
								return strings.menu.link.open;
							},

							children: ($$anchor, $$slotProps) => {
								Button($$anchor, {
									variant: 'ghost',
									get title() {
										return strings.menu.link.open;
									},
									size: 'icon',
									get href() {
										return $editorState().link;
									},
									target: '_blank',
									children: ($$anchor, $$slotProps) => {
										Link($$anchor, {});
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_2 = $.sibling(node_1, 2);

						Tooltip(node_2, {
							get tooltip() {
								return strings.menu.link.edit;
							},

							children: ($$anchor, $$slotProps) => {
								Button($$anchor, {
									variant: 'ghost',
									size: 'icon',
									get title() {
										return strings.menu.link.edit;
									},

									onclick: () => {
										$.set(isEditing, true);
										editor.commands.blur();
									},

									children: ($$anchor, $$slotProps) => {
										Edit($$anchor, {});
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_3 = $.sibling(node_2, 2);

						Tooltip(node_3, {
							get tooltip() {
								return strings.menu.link.copy;
							},

							children: ($$anchor, $$slotProps) => {
								Button($$anchor, {
									variant: 'ghost',
									get title() {
										return strings.menu.link.copy;
									},
									size: 'icon',
									onclick: () => {
										window.navigator.clipboard.writeText($editorState().link);
									},

									children: ($$anchor, $$slotProps) => {
										Copy($$anchor, {});
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_4 = $.sibling(node_3, 2);

						Tooltip(node_4, {
							get tooltip() {
								return strings.menu.link.remove;
							},

							children: ($$anchor, $$slotProps) => {
								Button($$anchor, {
									variant: 'ghost',
									get title() {
										return strings.menu.link.remove;
									},
									size: 'icon',
									onclick: () => editor.chain().focus().extendMarkRange('link').unsetLink().run(),
									children: ($$anchor, $$slotProps) => {
										Trash2($$anchor, {});
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_2);
					};

					var alternate = ($$anchor) => {
						var form = root_1();
						var node_5 = $.child(form);

						Input(node_5, {
							required: true,
							type: 'url',
							get placeholder() {
								return strings.menu.link.enterLinkPlaceholder;
							},

							get value() {
								return $.get(linkInput);
							},

							set value($$value) {
								$.set(linkInput, $$value);
							}
						});

						var node_6 = $.sibling(node_5, 2);

						Tooltip(node_6, {
							get tooltip() {
								return strings.menu.link.enterLinkButton;
							},

							children: ($$anchor, $$slotProps) => {
								Button($$anchor, {
									type: 'submit',
									size: 'icon',
									children: ($$anchor, $$slotProps) => {
										Check($$anchor, {});
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$.reset(form);
						$.event('submit', form, handleSubmit);
						$.transition(3, form, () => slide, () => ({ axis: 'x' }));
						$.append($$anchor, form);
					};

					$.if(node, ($$render) => {
						if (!$.get(isEditing)) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
	$$cleanup();
}