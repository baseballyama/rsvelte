import * as $ from 'svelte/internal/server';
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
			class: 'link-menu',
			children: ($$renderer) => {
				if (!isEditing) {
					$$renderer.push('<!--[0-->');

					Tooltip($$renderer, {
						tooltip: strings.menu.link.open,
						children: ($$renderer) => {
							$$renderer.push(`<a class="edra-btn edra-btn-ghost edra-btn-icon btn-size svelte-4q8s1j"${$.attr('href', $.store_get($$store_subs ??= {}, '$editorState', editorState).link)} target="_blank" rel="noopener noreferrer"${$.attr('title', strings.menu.link.open)}>`);
							Link($$renderer, { class: 'link-icon' });
							$$renderer.push(`<!----></a>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Tooltip($$renderer, {
						tooltip: strings.menu.link.edit,
						children: ($$renderer) => {
							$$renderer.push(`<button class="edra-btn edra-btn-ghost edra-btn-icon btn-size svelte-4q8s1j"${$.attr('title', strings.menu.link.edit)}>`);
							Edit($$renderer, { class: 'link-icon' });
							$$renderer.push(`<!----></button>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Tooltip($$renderer, {
						tooltip: strings.menu.link.copy,
						children: ($$renderer) => {
							$$renderer.push(`<button class="edra-btn edra-btn-ghost edra-btn-icon btn-size svelte-4q8s1j"${$.attr('title', strings.menu.link.copy)}>`);
							Copy($$renderer, { class: 'link-icon' });
							$$renderer.push(`<!----></button>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Tooltip($$renderer, {
						tooltip: strings.menu.link.remove,
						children: ($$renderer) => {
							$$renderer.push(`<button class="edra-btn edra-btn-ghost edra-btn-icon btn-size svelte-4q8s1j"${$.attr('title', strings.menu.link.remove)}>`);
							Trash2($$renderer, { class: 'link-icon' });
							$$renderer.push(`<!----></button>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push(`<!--[-1--><form class="link-input-form svelte-4q8s1j"><input class="edra-input link-input-elem svelte-4q8s1j"${$.attr('value', linkInput())} required="" type="url"${$.attr('placeholder', strings.menu.link.enterLinkPlaceholder)}/> `);

					Tooltip($$renderer, {
						tooltip: strings.menu.link.enterLinkButton,
						children: ($$renderer) => {
							$$renderer.push(`<button type="submit" class="edra-btn edra-btn-icon-xs save-btn svelte-4q8s1j">`);
							Check($$renderer, { class: 'link-icon' });
							$$renderer.push(`<!----></button>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></form>`);
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}