import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Check from '@lucide/svelte/icons/check';
import Copy from '@lucide/svelte/icons/copy';
import Edit from '@lucide/svelte/icons/pen';
import Trash2 from '@lucide/svelte/icons/trash-2';
import { Link } from '@lucide/svelte';
import { slide } from 'svelte/transition';
import Tooltip from '../Tooltip.svelte';
import strings from '../../../strings.js';
import { BubbleMenu, getEditor, useEditorState } from '../../../tiptap/index.js';

var root = $.from_html(`<a class="edra-btn edra-btn-ghost edra-btn-icon btn-size svelte-4q8s1j" target="_blank" rel="noopener noreferrer"><!></a>`);
var root_1 = $.from_html(`<button class="edra-btn edra-btn-ghost edra-btn-icon btn-size svelte-4q8s1j"><!></button>`);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<button type="submit" class="edra-btn edra-btn-icon-xs save-btn svelte-4q8s1j"><!></button>`);
var root_4 = $.from_html(`<form class="link-input-form svelte-4q8s1j"><input class="edra-input link-input-elem svelte-4q8s1j" required="" type="url"/> <!></form>`);

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
			class: 'link-menu',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						var fragment_2 = root_2();
						var node_1 = $.first_child(fragment_2);

						Tooltip(node_1, {
							get tooltip() {
								return strings.menu.link.open;
							},

							children: ($$anchor, $$slotProps) => {
								var a = root();
								var node_2 = $.child(a);

								Link(node_2, { class: 'link-icon' });
								$.reset(a);

								$.template_effect(() => {
									$.set_attribute(a, 'href', $editorState().link);
									$.set_attribute(a, 'title', strings.menu.link.open);
								});

								$.append($$anchor, a);
							},
							$$slots: { default: true }
						});

						var node_3 = $.sibling(node_1, 2);

						Tooltip(node_3, {
							get tooltip() {
								return strings.menu.link.edit;
							},

							children: ($$anchor, $$slotProps) => {
								var button = root_1();
								var node_4 = $.child(button);

								Edit(node_4, { class: 'link-icon' });
								$.reset(button);
								$.template_effect(() => $.set_attribute(button, 'title', strings.menu.link.edit));

								$.delegated('click', button, () => {
									$.set(isEditing, true);
									editor.commands.blur();
								});

								$.append($$anchor, button);
							},
							$$slots: { default: true }
						});

						var node_5 = $.sibling(node_3, 2);

						Tooltip(node_5, {
							get tooltip() {
								return strings.menu.link.copy;
							},

							children: ($$anchor, $$slotProps) => {
								var button_1 = root_1();
								var node_6 = $.child(button_1);

								Copy(node_6, { class: 'link-icon' });
								$.reset(button_1);
								$.template_effect(() => $.set_attribute(button_1, 'title', strings.menu.link.copy));

								$.delegated('click', button_1, () => {
									window.navigator.clipboard.writeText($editorState().link);
								});

								$.append($$anchor, button_1);
							},
							$$slots: { default: true }
						});

						var node_7 = $.sibling(node_5, 2);

						Tooltip(node_7, {
							get tooltip() {
								return strings.menu.link.remove;
							},

							children: ($$anchor, $$slotProps) => {
								var button_2 = root_1();
								var node_8 = $.child(button_2);

								Trash2(node_8, { class: 'link-icon' });
								$.reset(button_2);
								$.template_effect(() => $.set_attribute(button_2, 'title', strings.menu.link.remove));
								$.delegated('click', button_2, () => editor.chain().focus().extendMarkRange('link').unsetLink().run());
								$.append($$anchor, button_2);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_2);
					};

					var alternate = ($$anchor) => {
						var form = root_4();
						var input = $.child(form);

						$.remove_input_defaults(input);

						var node_9 = $.sibling(input, 2);

						Tooltip(node_9, {
							get tooltip() {
								return strings.menu.link.enterLinkButton;
							},

							children: ($$anchor, $$slotProps) => {
								var button_3 = root_3();
								var node_10 = $.child(button_3);

								Check(node_10, { class: 'link-icon' });
								$.reset(button_3);
								$.append($$anchor, button_3);
							},
							$$slots: { default: true }
						});

						$.reset(form);
						$.template_effect(() => $.set_attribute(input, 'placeholder', strings.menu.link.enterLinkPlaceholder));
						$.event('submit', form, handleSubmit);
						$.bind_value(input, () => $.get(linkInput), ($$value) => $.set(linkInput, $$value));
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

$.delegate(['click']);