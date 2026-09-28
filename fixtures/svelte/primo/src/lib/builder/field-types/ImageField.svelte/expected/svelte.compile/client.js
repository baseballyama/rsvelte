import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as _ from 'lodash-es';
import Icon from '@iconify/svelte';
import TextInput from '../ui/TextInput.svelte';
import Spinner from '../ui/Spinner.svelte';
import imageCompression from 'browser-image-compression';
import { LibraryUploads, SiteUploads } from '$lib/pocketbase/collections';
import { site_context } from '../stores/context';
import { self } from '$lib/pocketbase/managers';
import { watch } from 'runed';

var root = $.from_html(`<div class="spinner-container svelte-1k4e24l"><!></div>`);
var root_1 = $.from_html(`<span class="field-size svelte-1k4e24l"></span>`);
var root_2 = $.from_html(`<span class="field-dimensions svelte-1k4e24l"> </span>`);
var root_3 = $.from_html(`<img alt="Preview" class="svelte-1k4e24l"/>`);
var root_4 = $.from_html(`<span class="svelte-1k4e24l">Upload</span>`);
var root_5 = $.from_html(`<!> <!> <!> <label class="image-upload svelte-1k4e24l"><!> <!> <input type="file" accept="image/*" class="svelte-1k4e24l"/></label>`, 1);
var root_6 = $.from_html(`<div><span class="primo--field-label svelte-1k4e24l"> </span> <div class="image-info svelte-1k4e24l"><div class="image-preview svelte-1k4e24l"><!></div> <div class="inputs svelte-1k4e24l"><!> <!></div></div></div>`);

export default function ImageField($$anchor, $$props) {
	$.push($$props, true);

	const default_value = { alt: '', url: '', upload: null, width: null, height: null };

	// Guard the value, not just the entry: legacy/empty image entries can have a null
	// or non-object `value`, which would make every `entry.value.X` access below throw.
	const entry = $.derived(() => {
		const base = $$props.entry || { value: default_value };
		const value = base.value && typeof base.value === 'object' ? { ...default_value, ...base.value } : default_value;

		return { ...base, value };
	});

	const { value: site } = site_context.getOr({ value: null });

	// Helper function to extract image dimensions
	async function get_image_dimensions(source) {
		return new Promise((resolve) => {
			const img = new Image();

			img.onload = () => {
				resolve({ width: img.naturalWidth, height: img.naturalHeight });
			};

			img.onerror = () => {
				resolve(null);
			};

			if (typeof source === 'string') {
				img.src = source;
			} else {
				img.src = URL.createObjectURL(source);
			}
		});
	}

	async function upload_image(image) {
		try {
			$.set(loading, true);

			// Check if the image is an SVG - if so, upload as-is without compression
			const is_svg = image.type === 'image/svg+xml' || image.name.toLowerCase().endsWith('.svg');

			let file_to_upload;

			if (is_svg) {
				// SVGs are vector graphics and should not be compressed
				file_to_upload = image;
			} else {
				// Get compression options from field config or use defaults
				const maxSizeMB = $$props.field.config?.maxSizeMB ?? 1;

				const maxWidthOrHeight = $$props.field.config?.maxWidthOrHeight ?? 1920;

				// Compression options
				const options = {
					maxSizeMB, // Maximum size in MB
					maxWidthOrHeight, // Resize large images to this dimension
					useWebWorker: true // Use web worker for better UI performance
				};

				// Compress the image
				// NOTE: browser-image-compression returns Blob instead of File
				const compressedImage = await imageCompression(image, options);

				file_to_upload = new File([compressedImage], image.name);
			}

			// Extract dimensions from the compressed/final image
			const dimensions = await get_image_dimensions(file_to_upload);

			// Reuse the existing upload record in place when the field already has
			// one, so re-cropping/replacing an image doesn't spawn an orphan record
			// on every edit. Site clones copy uploads (each clone gets its own
			// records), so this only shares within duplicated sections/repeater
			// items in the same site — an accepted trade for not accumulating
			// orphans that eventually bloat the publish snapshot.
			let upload_record;

			if ($.get(upload) && site) {
				upload_record = SiteUploads.update($.get(upload).id, { file: file_to_upload });
			} else if ($.get(upload)) {
				upload_record = LibraryUploads.update($.get(upload).id, { file: file_to_upload });
			} else if (site) {
				upload_record = SiteUploads.create({ file: file_to_upload, site: site.id });
			} else {
				upload_record = LibraryUploads.create({ file: file_to_upload });
			}

			$$props.onchange({
				[$$props.field.key]: {
					0: {
						value: {
							...$.get(entry).value,
							upload: upload_record.id,
							url: '',
							width: dimensions?.width ?? null,
							height: dimensions?.height ?? null
						}
					}
				}
			});
		} finally {
			$.set(loading, false);
		}
	}

	let image_size = null;
	let loading = $.state(false);
	let width = $.state(void 0);
	let collapsed = $.derived(() => !$.get(width) || $.get(width) < 200);

	// Uploads belong to the site when editing within a site context (symbol and page-type
	// fields have no `site` property, so checking the field would wrongly resolve site
	// uploads through LibraryUploads).
	let upload = $.derived(() => $.get(entry).value.upload
		? site
			? SiteUploads.one($.get(entry).value.upload)
			: LibraryUploads.one($.get(entry).value.upload)
		: null);

	let upload_url = $.derived(() => $.get(upload) && (typeof $.get(upload).file === 'string'
		? `${self.instance?.baseURL}/api/files/${site ? 'site_uploads' : 'library_uploads'}/${$.get(upload).id}/${$.get(upload).file}`
		: URL.createObjectURL($.get(upload).file)));

	let input_url = $.derived(() => $.get(entry).value.url);
	let url = $.derived(() => $.get(input_url) || $.get(upload_url));

	// Extract dimensions when URL changes (for external URLs)
	watch(() => $.get(input_url), (current_url) => {
		if (current_url && !$.get(entry).value.width && !$.get(entry).value.height) {
			get_image_dimensions(current_url).then((dimensions) => {
				if (dimensions) {
					$$props.onchange({
						[$$props.field.key]: {
							0: {
								value: {
									...$.get(entry).value,
									width: dimensions.width,
									height: dimensions.height
								}
							}
						}
					});
				}
			});
		}
	});

	var div = root_6();
	let classes;
	var span = $.child(div);
	var text = $.only_child(span, true);
	var div_1 = $.sibling(span, 2);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	{
		var consequent = ($$anchor) => {
			var div_3 = root();
			var node_1 = $.child(div_3);

			Spinner(node_1, {});
			$.reset(div_3);
			$.append($$anchor, div_3);
		};

		var alternate = ($$anchor) => {
			var fragment = root_5();
			var node_2 = $.first_child(fragment);

			{
				var consequent_1 = ($$anchor) => {
					var span_1 = root_1();

					span_1.textContent = 'KB';
					$.append($$anchor, span_1);
				};

				$.if(node_2, ($$render) => {
					if (image_size) $$render(consequent_1);
				});
			}

			var node_3 = $.sibling(node_2, 2);

			{
				var consequent_2 = ($$anchor) => {
					var span_2 = root_2();
					var text_1 = $.only_child(span_2);

					$.template_effect(() => $.set_text(text_1, `${$.get(entry).value.width ?? ''} × ${$.get(entry).value.height ?? ''}`));
					$.append($$anchor, span_2);
				};

				$.if(node_3, ($$render) => {
					if ($.get(entry).value.width && $.get(entry).value.height) $$render(consequent_2);
				});
			}

			var node_4 = $.sibling(node_3, 2);

			{
				var consequent_3 = ($$anchor) => {
					var img_1 = root_3();

					$.template_effect(() => $.set_attribute(img_1, 'src', $.get(url)));
					$.append($$anchor, img_1);
				};

				$.if(node_4, ($$render) => {
					if ($.get(url)) $$render(consequent_3);
				});
			}

			var label = $.sibling(node_4, 2);
			var node_5 = $.child(label);

			Icon(node_5, { icon: 'uil:image-upload' });

			var node_6 = $.sibling(node_5, 2);

			{
				var consequent_4 = ($$anchor) => {
					var span_3 = root_4();

					$.append($$anchor, span_3);
				};

				$.if(node_6, ($$render) => {
					if (!$.get(entry).value.url) $$render(consequent_4);
				});
			}

			var input = $.sibling(node_6, 2);

			$.reset(label);

			$.delegated('change', input, ({ target }) => {
				const { files } = target;

				if (files?.length) {
					const image = files[0];

					upload_image(image);
				}
			});

			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($.get(loading)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var node_7 = $.child(div_4);

	TextInput(node_7, {
		get value() {
			return $.get(entry).value.alt;
		},
		label: 'Description',
		oninput: (alt) => $$props.onchange({
			[$$props.field.key]: { 0: { value: { ...$.get(entry).value, alt } } }
		})
	});

	var node_8 = $.sibling(node_7, 2);

	TextInput(node_8, {
		get value() {
			return $.get(entry).value.url;
		},
		label: 'URL',
		oninput: (value) => {
			$$props.onchange({
				[$$props.field.key]: {
					0: {
						value: { ...$.get(entry).value, url: value, upload: undefined }
					}
				}
			});
		},

		onchange: (value) => {
			$$props.onchange({
				[$$props.field.key]: {
					0: {
						value: { ...$.get(entry).value, url: value, upload: undefined }
					}
				}
			});
		}
	});

	$.reset(div_4);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		classes = $.set_class(div, 1, 'ImageField svelte-1k4e24l', null, classes, { collapsed: $.get(collapsed) });
		$.set_text(text, $$props.field.label);
	});

	$.bind_element_size(div, 'clientWidth', ($$value) => $.set(width, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['change']);