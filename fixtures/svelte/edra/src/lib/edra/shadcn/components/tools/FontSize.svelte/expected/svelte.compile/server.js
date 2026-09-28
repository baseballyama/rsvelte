import * as $ from 'svelte/internal/server';
import { buttonVariants } from '$lib/components/ui/button/index.js';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import Tooltip from '../Tooltip.svelte';
import { getEditor, useEditorTransaction } from '../../../tiptap/index.js';

export default function FontSize($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const editor = getEditor();
		const transaction = useEditorTransaction(editor);

		const currentSize = () => {
			void transaction.version;

			return editor.getAttributes('textStyle').fontSize || '';
		};

		const FONT_SIZE = [
			{ label: 'Tiny', value: '0.7rem' },
			{ label: 'Smaller', value: '0.75rem' },
			{ label: 'Small', value: '0.9rem' },
			{ label: 'Default', value: '' },
			{ label: 'Large', value: '1.25rem' },
			{ label: 'Extra Large', value: '1.5rem' }
		];

		const currentLabel = $.derived(() => {
			const l = FONT_SIZE.find((f) => f.value === currentSize());

			if (l) return l.label.split(' ')[0];

			return 'Medium';
		});

		if (DropdownMenu.Root) {
			$$renderer.push('<!--[-->');

			DropdownMenu.Root($$renderer, {
				children: ($$renderer) => {
					Tooltip($$renderer, {
						tooltip: 'Font Size',
						children: ($$renderer) => {
							if (DropdownMenu.Trigger) {
								$$renderer.push('<!--[-->');

								DropdownMenu.Trigger($$renderer, {
									class: buttonVariants({ variant: 'ghost' }),
									children: ($$renderer) => {
										$$renderer.push(`<span>${$.escape(currentLabel())}</span> `);
										ChevronDown($$renderer, { class: 'size-2! text-muted-foreground' });
										$$renderer.push(`<!---->`);
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

					$$renderer.push(`<!----> `);

					if (DropdownMenu.Content) {
						$$renderer.push('<!--[-->');

						DropdownMenu.Content($$renderer, {
							class: 'w-fit',
							portalProps: { to: editor.view.dom.parentElement ?? undefined },
							children: ($$renderer) => {
								if (DropdownMenu.Label) {
									$$renderer.push('<!--[-->');

									DropdownMenu.Label($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Font Size`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` <!--[-->`);

								const each_array = $.ensure_array_like(FONT_SIZE);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let fontSize = each_array[$$index];

									if (DropdownMenu.Item) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Item($$renderer, {
											onclick: () => {
												editor.chain().focus().setFontSize(fontSize.value).run();
											},

											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(fontSize.label)} `);

												if (DropdownMenu.Shortcut) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Shortcut($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(fontSize.value)}`);
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

								$$renderer.push(`<!--]-->`);
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
	});
}