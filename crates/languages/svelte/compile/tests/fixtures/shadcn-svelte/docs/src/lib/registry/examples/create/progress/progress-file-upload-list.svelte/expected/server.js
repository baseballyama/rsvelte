import * as $ from 'svelte/internal/server';
import * as Item from "$lib/registry/ui/item/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Progress } from "$lib/registry/ui/progress/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Progress_file_upload_list($$renderer) {
	const files = [
		{
			id: "1",
			name: "document.pdf",
			progress: 45,
			timeRemaining: "2m 30s"
		},

		{
			id: "2",
			name: "presentation.pptx",
			progress: 78,
			timeRemaining: "45s"
		},

		{
			id: "3",
			name: "spreadsheet.xlsx",
			progress: 12,
			timeRemaining: "5m 12s"
		},

		{
			id: "4",
			name: "image.jpg",
			progress: 100,
			timeRemaining: "Complete"
		}
	];

	Example($$renderer, {
		title: 'File Upload List',
		children: ($$renderer) => {
			if (Item.Group) {
				$$renderer.push('<!--[-->');

				Item.Group($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(files);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let file = each_array[$$index];

							if (Item.Root) {
								$$renderer.push('<!--[-->');

								Item.Root($$renderer, {
									size: 'xs',
									class: 'px-0',
									children: ($$renderer) => {
										if (Item.Media) {
											$$renderer.push('<!--[-->');

											Item.Media($$renderer, {
												variant: 'icon',
												children: ($$renderer) => {
													IconPlaceholder($$renderer, {
														lucide: 'FileIcon',
														tabler: 'IconFile',
														hugeicons: 'FileIcon',
														phosphor: 'FileIcon',
														remixicon: 'RiFileLine',
														class: 'size-5'
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

										if (Item.Content) {
											$$renderer.push('<!--[-->');

											Item.Content($$renderer, {
												class: 'inline-block truncate',
												children: ($$renderer) => {
													if (Item.Title) {
														$$renderer.push('<!--[-->');

														Item.Title($$renderer, {
															class: 'inline',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(file.name)}`);
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

										if (Item.Content) {
											$$renderer.push('<!--[-->');

											Item.Content($$renderer, {
												children: ($$renderer) => {
													Progress($$renderer, { value: file.progress, class: 'w-32' });
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Item.Actions) {
											$$renderer.push('<!--[-->');

											Item.Actions($$renderer, {
												class: 'w-16 justify-end',
												children: ($$renderer) => {
													$$renderer.push(`<span class="text-sm text-muted-foreground">${$.escape(file.timeRemaining)}</span>`);
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
}