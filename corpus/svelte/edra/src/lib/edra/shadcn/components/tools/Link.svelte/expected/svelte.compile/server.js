import * as $ from 'svelte/internal/server';
import { buttonVariants, Button } from '$lib/components/ui/button/index.js';
import { Input } from '$lib/components/ui/input/index.js';
import * as Popover from '$lib/components/ui/popover/index.js';
import Check from '@lucide/svelte/icons/check';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import Link from '@lucide/svelte/icons/link-2';
import Tooltip from '../Tooltip.svelte';
import { getEditor, useEditorTransaction } from '../../../tiptap/index.js';

export default function Link_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let open = false;
		let value = void 0;
		const editor = getEditor();
		const transaction = useEditorTransaction(editor);

		function isActive() {
			void transaction.version;

			return editor.isActive('link');
		}

		function handleSubmit(e) {
			e.preventDefault();

			if (value === undefined || value.trim() === '') return;

			editor.chain().focus().setLink({ href: value }).run();
			value = undefined;
			open = false;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Popover.Root) {
				$$renderer.push('<!--[-->');

				Popover.Root($$renderer, {
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Popover.Trigger) {
							$$renderer.push('<!--[-->');

							Popover.Trigger($$renderer, {
								children: ($$renderer) => {
									Tooltip($$renderer, {
										tooltip: 'Link',
										children: ($$renderer) => {
											$$renderer.push(`<div${$.attr_class($.clsx(buttonVariants({ variant: 'ghost', size: 'icon' })), void 0, { 'bg-muted': isActive() })}>`);
											Link($$renderer, {});
											$$renderer.push(`<!----> `);
											ChevronDown($$renderer, { class: 'size-2! text-muted-foreground' });
											$$renderer.push(`<!----></div>`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Popover.Content) {
							$$renderer.push('<!--[-->');

							Popover.Content($$renderer, {
								portalProps: { to: document.getElementById('nota-editor') ?? undefined },
								class: 'h-fit w-80 rounded-lg p-0!',
								children: ($$renderer) => {
									$$renderer.push(`<form class="flex items-center gap-0.5">`);

									Input($$renderer, {
										placeholder: 'Type or paste a link...',
										required: true,
										type: 'url',
										get value() {
											return value;
										},

										set value($$value) {
											value = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> `);

									Tooltip($$renderer, {
										tooltip: 'Insert link',
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
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}