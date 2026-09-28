import * as $ from 'svelte/internal/server';
import * as _ from 'lodash-es';
import Icon from '@iconify/svelte';
import TextInput from '../ui/TextInput.svelte';
import Spinner from '../ui/Spinner.svelte';
import imageCompression from 'browser-image-compression';
import { LibraryUploads, SiteUploads } from '$lib/pocketbase/collections';
import { site_context } from '../stores/context';
import { self } from '$lib/pocketbase/managers';
import { watch } from 'runed';

export default function ImageField($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { field, entry: passedEntry, onchange } = $$props;
		const default_value = { alt: '', url: '', upload: null, width: null, height: null };

		// Guard the value, not just the entry: legacy/empty image entries can have a null
		// or non-object `value`, which would make every `entry.value.X` access below throw.
		const entry = $.derived(() => {
			const base = passedEntry || { value: default_value };
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
				loading = true;

				// Check if the image is an SVG - if so, upload as-is without compression
				const is_svg = image.type === 'image/svg+xml' || image.name.toLowerCase().endsWith('.svg');

				let file_to_upload;

				if (is_svg) {
					// SVGs are vector graphics and should not be compressed
					file_to_upload = image;
				} else {
					// Get compression options from field config or use defaults
					const maxSizeMB = field.config?.maxSizeMB ?? 1;

					const maxWidthOrHeight = field.config?.maxWidthOrHeight ?? 1920;

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

				if (upload() && site) {
					upload_record = SiteUploads.update(upload().id, { file: file_to_upload });
				} else if (upload()) {
					upload_record = LibraryUploads.update(upload().id, { file: file_to_upload });
				} else if (site) {
					upload_record = SiteUploads.create({ file: file_to_upload, site: site.id });
				} else {
					upload_record = LibraryUploads.create({ file: file_to_upload });
				}

				onchange({
					[field.key]: {
						0: {
							value: {
								...entry().value,
								upload: upload_record.id,
								url: '',
								width: dimensions?.width ?? null,
								height: dimensions?.height ?? null
							}
						}
					}
				});
			} finally {
				loading = false;
			}
		}

		let image_size = null;
		let loading = false;
		let width = void 0;
		let collapsed = $.derived(() => !width || width < 200);

		// Uploads belong to the site when editing within a site context (symbol and page-type
		// fields have no `site` property, so checking the field would wrongly resolve site
		// uploads through LibraryUploads).
		let upload = $.derived(() => entry().value.upload
			? site
				? SiteUploads.one(entry().value.upload)
				: LibraryUploads.one(entry().value.upload)
			: null);

		let upload_url = $.derived(() => upload() && (typeof upload().file === 'string'
			? `${self.instance?.baseURL}/api/files/${site ? 'site_uploads' : 'library_uploads'}/${upload().id}/${upload().file}`
			: URL.createObjectURL(upload().file)));

		let input_url = $.derived(() => entry().value.url);
		let url = $.derived(() => input_url() || upload_url());

		// Extract dimensions when URL changes (for external URLs)
		watch(() => input_url(), (current_url) => {
			if (current_url && !entry().value.width && !entry().value.height) {
				get_image_dimensions(current_url).then((dimensions) => {
					if (dimensions) {
						onchange({
							[field.key]: {
								0: {
									value: {
										...entry().value,
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

		$$renderer.push(`<div${$.attr_class('ImageField svelte-1k4e24l', void 0, { 'collapsed': collapsed() })}><span class="primo--field-label svelte-1k4e24l">${$.escape(field.label)}</span> <div class="image-info svelte-1k4e24l"><div class="image-preview svelte-1k4e24l">`);

		if (loading) {
			$$renderer.push(`<!--[0--><div class="spinner-container svelte-1k4e24l">`);
			Spinner($$renderer, {});
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');

			if (image_size) {
				$$renderer.push(`<!--[0--><span class="field-size svelte-1k4e24l">KB</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (entry().value.width && entry().value.height) {
				$$renderer.push(`<!--[0--><span class="field-dimensions svelte-1k4e24l">${$.escape(entry().value.width)} × ${$.escape(entry().value.height)}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (url()) {
				$$renderer.push(`<!--[0--><img${$.attr('src', url())} alt="Preview" class="svelte-1k4e24l"/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <label class="image-upload svelte-1k4e24l">`);
			Icon($$renderer, { icon: 'uil:image-upload' });
			$$renderer.push(`<!----> `);

			if (!entry().value.url) {
				$$renderer.push(`<!--[0--><span class="svelte-1k4e24l">Upload</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <input type="file" accept="image/*" class="svelte-1k4e24l"/></label>`);
		}

		$$renderer.push(`<!--]--></div> <div class="inputs svelte-1k4e24l">`);

		TextInput($$renderer, {
			value: entry().value.alt,
			label: 'Description',
			oninput: (alt) => onchange({ [field.key]: { 0: { value: { ...entry().value, alt } } } })
		});

		$$renderer.push(`<!----> `);

		TextInput($$renderer, {
			value: entry().value.url,
			label: 'URL',
			oninput: (value) => {
				onchange({
					[field.key]: {
						0: { value: { ...entry().value, url: value, upload: undefined } }
					}
				});
			},

			onchange: (value) => {
				onchange({
					[field.key]: {
						0: { value: { ...entry().value, url: value, upload: undefined } }
					}
				});
			}
		});

		$$renderer.push(`<!----></div></div></div>`);
	});
}