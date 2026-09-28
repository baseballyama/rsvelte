import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
import { File, Reset, Download, Trash, Upload } from 'radix-icons-svelte';
import Button from '../Button/Button.svelte';
import IconRenderer from '../IconRenderer/IconRenderer.svelte';
import { Text } from '../Text';
import { FileUpload } from './index';

var root = $.from_html(`<div style="width: 500px;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div style="width: 500px;"><!> <br/> <!> <br/> <!> <br/> <!></div>`);
var root_3 = $.from_html(`<li style="display: flex;align-items: center;gap:10px;margin-bottom:10px;border: 1px solid #ccc;padding: 3px;"><img style="width: 50px; height: 50px;"/> <span style="flex: 1;"> </span> <!></li>`);
var root_4 = $.from_html(`<div style="width: 500px;"><!> <ul style="list-style: none;padding: 0;"></ul></div>`);
var root_5 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function FileUpload_stories($$anchor) {
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

	var fragment = root_5();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/FileUpload',
		get component() {
			return FileUpload;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);
				var div = root();
				var node_2 = $.child(div);

				FileUpload(node_2, $.spread_props(() => $.get(args), {
					get icon() {
						return Upload;
					},

					get fileIcon() {
						return File;
					},

					get removeIcon() {
						return Trash;
					},

					get resetIcon() {
						return Reset;
					}
				}));

				$.reset(div);
				$.append($$anchor, div);
			}
		}
	});

	var node_3 = $.sibling(node_1, 2);

	Story(node_3, { name: 'FileUpload', id: 'fileUploadStory' });

	var node_4 = $.sibling(node_3, 2);

	Story(node_4, {
		name: 'Drop',
		id: 'fileUploadDropStory',
		children: ($$anchor, $$slotProps) => {
			var div_1 = root();
			var node_5 = $.child(div_1);

			FileUpload(node_5, {
				type: 'drag',
				multiple: true,
				size: 'md',
				get icon() {
					return Upload;
				},

				get fileIcon() {
					return File;
				},

				get removeIcon() {
					return Trash;
				},

				get resetIcon() {
					return Reset;
				},
				$$events: { selected: handleSelected },
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_1();
					var node_6 = $.first_child(fragment_1);

					IconRenderer(node_6, {
						iconSize: 48,
						get icon() {
							return Download;
						}
					});

					var node_7 = $.sibling(node_6, 2);

					Text(node_7, {
						align: 'center',
						weight: 'semibold',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Click or drag file to this area to FileUpload');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					Text(node_8, {
						align: 'center',
						size: 'sm',
						color: 'dimmed',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Support for a single or bulk FileUpload. Strictly prohibit from FileUploading company data\n				or other band files');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_4, 2);

	Story(node_9, {
		name: 'Size',
		id: 'fileUploadSizeStory',
		children: ($$anchor, $$slotProps) => {
			var div_2 = root_2();
			var node_10 = $.child(div_2);

			FileUpload(node_10, {
				size: 'lg',
				reset: true,
				get icon() {
					return Upload;
				},

				get fileIcon() {
					return File;
				},

				get removeIcon() {
					return Trash;
				},

				get resetIcon() {
					return Reset;
				}
			});

			var node_11 = $.sibling(node_10, 4);

			FileUpload(node_11, {
				size: 'md',
				reset: true,
				get icon() {
					return Upload;
				},

				get fileIcon() {
					return File;
				},

				get removeIcon() {
					return Trash;
				},

				get resetIcon() {
					return Reset;
				}
			});

			var node_12 = $.sibling(node_11, 4);

			FileUpload(node_12, {
				size: 'sm',
				reset: true,
				get icon() {
					return Upload;
				},

				get fileIcon() {
					return File;
				},

				get removeIcon() {
					return Trash;
				},

				get resetIcon() {
					return Reset;
				}
			});

			var node_13 = $.sibling(node_12, 4);

			FileUpload(node_13, {
				size: 'xs',
				reset: true,
				get icon() {
					return Upload;
				},

				get fileIcon() {
					return File;
				},

				get removeIcon() {
					return Trash;
				},

				get resetIcon() {
					return Reset;
				}
			});

			$.reset(div_2);
			$.append($$anchor, div_2);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_9, 2);

	Story(node_14, {
		name: 'Accept',
		id: 'fileUploadAcceptStory',
		children: ($$anchor, $$slotProps) => {
			var div_3 = root();
			var node_15 = $.child(div_3);

			FileUpload(node_15, {
				size: 'md',
				reset: true,
				accept: 'image/png,image/jpeg',
				get icon() {
					return Upload;
				},

				get fileIcon() {
					return File;
				},

				get removeIcon() {
					return Trash;
				},

				get resetIcon() {
					return Reset;
				}
			});

			$.reset(div_3);
			$.append($$anchor, div_3);
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node_14, 2);

	Story(node_16, {
		name: 'Custom Preview',
		id: 'fileUploadCustomStory',
		children: ($$anchor, $$slotProps) => {
			var div_4 = root_4();
			var node_17 = $.child(div_4);

			FileUpload(node_17, {
				size: 'md',
				multiple: true,
				accept: 'image/png,image/jpeg',
				reset: true,
				preview: false,
				get icon() {
					return Upload;
				},

				get fileIcon() {
					return File;
				},

				get removeIcon() {
					return Trash;
				},

				get resetIcon() {
					return Reset;
				},

				get files() {
					return files;
				},

				set files($$value) {
					files = $$value;
				}
			});

			var ul = $.sibling(node_17, 2);

			$.each(ul, 21, () => files, $.index, ($$anchor, $$item, i) => {
				let file = () => $.get($$item).file;
				var li = root_3();
				var img = $.child(li);

				$.set_attribute(img, 'alt', `image${i}`);

				var span = $.sibling(img, 2);
				var text_2 = $.only_child(span, true);
				var node_18 = $.sibling(span, 2);

				Button(node_18, {
					variant: 'default',
					size: 'md',
					$$events: { click: () => remove(i) },
					children: ($$anchor, $$slotProps) => {
						IconRenderer($$anchor, {
							iconSize: 20,
							get icon() {
								return Trash;
							}
						});
					},
					$$slots: { default: true }
				});

				$.reset(li);

				$.template_effect(
					($0) => {
						$.set_attribute(img, 'src', $0);
						$.set_text(text_2, file().name);
					},
					[() => preview(file())]
				);

				$.append($$anchor, li);
			});

			$.reset(ul);
			$.reset(div_4);
			$.append($$anchor, div_4);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}