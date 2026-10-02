import * as $ from 'svelte/internal/server';
import Button from '$lib/components/button.svelte';
import { buttonVariants } from '$lib/components/ui/button';
import * as FileDropZone from '$lib/components/ui/file-drop-zone';
import * as Select from '$lib/components/ui/select';
import ImageIcon from '@lucide/svelte/icons/image';
import SendIcon from '@lucide/svelte/icons/send-horizontal';
import XIcon from '@lucide/svelte/icons/x';
import { cn } from '$lib/utils';
import { slide } from 'svelte/transition';

export default function File_drop_zone_text_area($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const models = [
			{ value: 'claude-opus-4', label: 'Claude Opus 4' },
			{ value: 'claude-sonnet-4', label: 'Claude Sonnet 4' },
			{ value: 'gpt-4o', label: 'GPT-4o' },
			{ value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
			{ value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' }
		];

		let files = [];
		let prompt = '';
		let selectedModel = 'claude-opus-4';

		const onUpload = async (newFiles) => {
			for (const file of newFiles) {
				// don't upload duplicate files
				if (files.find((f) => f.name === file.name)) continue;

				files.push({
					name: file.name,
					type: file.type,
					size: file.size,
					url: URL.createObjectURL(file)
				});
			}
		};

		const removeFile = (index) => {
			const file = files[index];

			URL.revokeObjectURL(file.url);
			files = [...files.slice(0, index), ...files.slice(index + 1)];
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex w-full flex-col gap-4 p-6">`);

			if (FileDropZone.Root) {
				$$renderer.push('<!--[-->');

				FileDropZone.Root($$renderer, {
					onUpload,
					accept: 'image/*',
					maxFiles: 4,
					fileCount: files.length,
					children: ($$renderer) => {
						$$renderer.push(`<div class="bg-card border-border flex flex-col gap-3 rounded-xl border p-3">`);

						if (files.length > 0) {
							$$renderer.push(`<!--[0--><div class="flex flex-wrap gap-2 px-1"><!--[-->`);

							const each_array = $.ensure_array_like(files);

							for (let i = 0, $$length = each_array.length; i < $$length; i++) {
								let file = each_array[i];

								$$renderer.push(`<div class="group relative"><div class="border-border bg-secondary size-16 overflow-hidden rounded-lg border"><img${$.attr('src', file.url)}${$.attr('alt', file.name)} class="h-full w-full object-cover"/></div> `);

								Button($$renderer, {
									size: 'icon',
									variant: 'secondary',
									onclick: () => removeFile(i),
									class: 'absolute -top-1.5 -right-1.5 size-5 rounded-full opacity-0 transition-opacity group-hover:opacity-100',
									children: ($$renderer) => {
										XIcon($$renderer, { class: 'size-3' });
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></div>`);
							}

							$$renderer.push(`<!--]--></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						{
							function child($$renderer, { props }) {
								$$renderer.push(`<textarea${$.attributes({
									...props,
									placeholder: 'Ask me anything...',
									class: 'placeholder:text-muted-foreground min-h-[44px] w-full resize-none border-0 bg-transparent text-[15px] focus:outline-none',
									rows: 1
								})}>`);

								const $$body = $.escape(prompt);

								if ($$body) {
									$$renderer.push(`${$$body}`);
								} else {}

								$$renderer.push(`</textarea>`);
							}

							if (FileDropZone.Textarea) {
								$$renderer.push('<!--[-->');
								FileDropZone.Textarea($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` <div class="flex items-center justify-between gap-2"><div class="flex items-center gap-2">`);

						if (Select.Root) {
							$$renderer.push('<!--[-->');

							Select.Root($$renderer, {
								type: 'single',
								get value() {
									return selectedModel;
								},

								set value($$value) {
									selectedModel = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									if (Select.Trigger) {
										$$renderer.push('<!--[-->');

										Select.Trigger($$renderer, {
											size: 'sm',
											class: 'border-none',
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(models.find((m) => m.value === selectedModel)?.label)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Select.Content) {
										$$renderer.push('<!--[-->');

										Select.Content($$renderer, {
											align: 'start',
											children: ($$renderer) => {
												$$renderer.push(`<!--[-->`);

												const each_array_1 = $.ensure_array_like(models);

												for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
													let model = each_array_1[$$index_1];

													if (Select.Item) {
														$$renderer.push('<!--[-->');
														Select.Item($$renderer, { value: model.value, label: model.label });
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

						$$renderer.push(` `);

						if (FileDropZone.Trigger) {
							$$renderer.push('<!--[-->');

							FileDropZone.Trigger($$renderer, {
								class: cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'bg-accent size-8 cursor-pointer'),
								children: ($$renderer) => {
									ImageIcon($$renderer, { class: 'text-muted-foreground size-5' });
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(`</div> `);

						Button($$renderer, {
							variant: 'destructive',
							size: 'icon',
							class: 'size-8',
							children: ($$renderer) => {
								SendIcon($$renderer, { class: 'size-4' });
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div></div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}