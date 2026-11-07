import * as $ from 'svelte/internal/server';
import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
import { File, Reset, Download, Trash, Upload } from 'radix-icons-svelte';
import Button from '../Button/Button.svelte';
import IconRenderer from '../IconRenderer/IconRenderer.svelte';
import { Text } from '../Text';
import { FileUpload } from './index';

export default function FileUpload_stories($$renderer) {
	function handleSelected(files) {
		console.log(files);
	}

	let files = [];

	function preview(file) {
		return URL.createObjectURL(file);
	}

	function remove(index) {
		files = files.filter((e, i) => i !== index);
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Meta($$renderer, { title: 'Components/FileUpload', component: FileUpload });
		$$renderer.push(`<!----> `);

		Template($$renderer, {
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$renderer, { args }) => {
					$$renderer.push(`<div style="width: 500px;">`);

					FileUpload($$renderer, $.spread_props([
						args,
						{
							icon: Upload,
							fileIcon: File,
							removeIcon: Trash,
							resetIcon: Reset
						}
					]));

					$$renderer.push(`<!----></div>`);
				}
			}
		});

		$$renderer.push(`<!----> `);
		Story($$renderer, { name: 'FileUpload', id: 'fileUploadStory' });
		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Drop',
			id: 'fileUploadDropStory',
			children: ($$renderer) => {
				$$renderer.push(`<div style="width: 500px;">`);

				FileUpload($$renderer, {
					type: 'drag',
					multiple: true,
					size: 'md',
					icon: Upload,
					fileIcon: File,
					removeIcon: Trash,
					resetIcon: Reset,
					children: ($$renderer) => {
						IconRenderer($$renderer, { iconSize: 48, icon: Download });
						$$renderer.push(`<!----> `);

						Text($$renderer, {
							align: 'center',
							weight: 'semibold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Click or drag file to this area to FileUpload`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Text($$renderer, {
							align: 'center',
							size: 'sm',
							color: 'dimmed',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Support for a single or bulk FileUpload. Strictly prohibit from FileUploading company data
				or other band files`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Size',
			id: 'fileUploadSizeStory',
			children: ($$renderer) => {
				$$renderer.push(`<div style="width: 500px;">`);

				FileUpload($$renderer, {
					size: 'lg',
					reset: true,
					icon: Upload,
					fileIcon: File,
					removeIcon: Trash,
					resetIcon: Reset
				});

				$$renderer.push(`<!----> <br/> `);

				FileUpload($$renderer, {
					size: 'md',
					reset: true,
					icon: Upload,
					fileIcon: File,
					removeIcon: Trash,
					resetIcon: Reset
				});

				$$renderer.push(`<!----> <br/> `);

				FileUpload($$renderer, {
					size: 'sm',
					reset: true,
					icon: Upload,
					fileIcon: File,
					removeIcon: Trash,
					resetIcon: Reset
				});

				$$renderer.push(`<!----> <br/> `);

				FileUpload($$renderer, {
					size: 'xs',
					reset: true,
					icon: Upload,
					fileIcon: File,
					removeIcon: Trash,
					resetIcon: Reset
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Accept',
			id: 'fileUploadAcceptStory',
			children: ($$renderer) => {
				$$renderer.push(`<div style="width: 500px;">`);

				FileUpload($$renderer, {
					size: 'md',
					reset: true,
					accept: 'image/png,image/jpeg',
					icon: Upload,
					fileIcon: File,
					removeIcon: Trash,
					resetIcon: Reset
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Custom Preview',
			id: 'fileUploadCustomStory',
			children: ($$renderer) => {
				$$renderer.push(`<div style="width: 500px;">`);

				FileUpload($$renderer, {
					size: 'md',
					multiple: true,
					accept: 'image/png,image/jpeg',
					reset: true,
					preview: false,
					icon: Upload,
					fileIcon: File,
					removeIcon: Trash,
					resetIcon: Reset,
					get files() {
						return files;
					},

					set files($$value) {
						files = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> <ul style="list-style: none;padding: 0;"><!--[-->`);

				const each_array = $.ensure_array_like(files);

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let { file } = each_array[i];

					$$renderer.push(`<li style="display: flex;align-items: center;gap:10px;margin-bottom:10px;border: 1px solid #ccc;padding: 3px;"><img style="width: 50px; height: 50px;"${$.attr('src', preview(file))}${$.attr('alt', `image${$.stringify(i)}`)}/> <span style="flex: 1;">${$.escape(file.name)}</span> `);

					Button($$renderer, {
						variant: 'default',
						size: 'md',
						children: ($$renderer) => {
							IconRenderer($$renderer, { iconSize: 20, icon: Trash });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></li>`);
				}

				$$renderer.push(`<!--]--></ul></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}