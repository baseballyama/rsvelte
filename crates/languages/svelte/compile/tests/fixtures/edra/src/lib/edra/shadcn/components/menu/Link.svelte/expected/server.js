import * as $ from 'svelte/internal/server';
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

export default function Link_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const editor = getEditor();

		const editorState = useEditorState({
			editor,
			selector: ({ editor }) => ({ link: editor.getAttributes('link').href })
		});

		let isEditing = false;
		let linkInput = $.derived(() => $.store_get($$store_subs ??= {}, '$editorState', editorState).link);

		function handleSubmit(e) {
			e.preventDefault();

			if (!linkInput() || linkInput().trim() === '') return;

			isEditing = false;
			editor.chain().focus().extendMarkRange('link').setLink({ href: linkInput() }).run();
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			BubbleMenu($$renderer, {
				editor,
				shouldShow: (props) => {
					if (props.editor.isActive('link')) {
						return true;
					} else {
						isEditing = false;
						linkInput('');

						return false;
					}
				},

				options: {
					shift: true,
					autoPlacement: { allowedPlacements: ['top', 'bottom'] },
					strategy: 'absolute',
					scrollTarget: editor.view.dom.parentElement ?? window
				},
				class: 'flex h-fit w-fit items-center gap-1 rounded-lg border bg-popover p-0!',
				children: ($$renderer) => {
					if (!isEditing) {
						$$renderer.push('<!--[0-->');

						Tooltip($$renderer, {
							tooltip: strings.menu.link.open,
							children: ($$renderer) => {
								Button($$renderer, {
									variant: 'ghost',
									title: strings.menu.link.open,
									size: 'icon',
									href: $.store_get($$store_subs ??= {}, '$editorState', editorState).link,
									target: '_blank',
									children: ($$renderer) => {
										Link($$renderer, {});
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Tooltip($$renderer, {
							tooltip: strings.menu.link.edit,
							children: ($$renderer) => {
								Button($$renderer, {
									variant: 'ghost',
									size: 'icon',
									title: strings.menu.link.edit,
									onclick: () => {
										isEditing = true;
										editor.commands.blur();
									},

									children: ($$renderer) => {
										Edit($$renderer, {});
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Tooltip($$renderer, {
							tooltip: strings.menu.link.copy,
							children: ($$renderer) => {
								Button($$renderer, {
									variant: 'ghost',
									title: strings.menu.link.copy,
									size: 'icon',
									onclick: () => {
										window.navigator.clipboard.writeText($.store_get($$store_subs ??= {}, '$editorState', editorState).link);
									},

									children: ($$renderer) => {
										Copy($$renderer, {});
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Tooltip($$renderer, {
							tooltip: strings.menu.link.remove,
							children: ($$renderer) => {
								Button($$renderer, {
									variant: 'ghost',
									title: strings.menu.link.remove,
									size: 'icon',
									onclick: () => editor.chain().focus().extendMarkRange('link').unsetLink().run(),
									children: ($$renderer) => {
										Trash2($$renderer, {});
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push(`<!--[-1--><form class="flex w-96 items-center gap-0.5">`);

						Input($$renderer, {
							required: true,
							type: 'url',
							placeholder: strings.menu.link.enterLinkPlaceholder,
							get value() {
								return linkInput();
							},

							set value($$value) {
								linkInput($$value);
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Tooltip($$renderer, {
							tooltip: strings.menu.link.enterLinkButton,
							children: ($$renderer) => {
								Button($$renderer, {
									type: 'submit',
									size: 'icon',
									children: ($$renderer) => {
										Check($$renderer, {});
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></form>`);
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}