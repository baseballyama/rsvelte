import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Avatar from '$lib/components/ui/avatar';
import { useImageCropperPreview } from './image-cropper.svelte.js';
import UploadIcon from '@lucide/svelte/icons/upload';
import { cn } from '$lib/utils.js';

var root = $.from_html(`<!> <span class="sr-only">Upload image</span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Image_cropper_preview($$anchor, $$props) {
	$.push($$props, true);

	const previewState = useImageCropperPreview();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.child, () => ({ src: previewState.rootState.src }));
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			{
				let $0 = $.derived(() => cn('ring-accent ring-offset-background size-20 ring-2 ring-offset-2', $$props.class));

				$.component(node_2, () => Avatar.Root, ($$anchor, Avatar_Root) => {
					Avatar_Root($$anchor, {
						get class() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_3 = $.first_child(fragment_3);

							$.component(node_3, () => Avatar.Image, ($$anchor, Avatar_Image) => {
								Avatar_Image($$anchor, {
									get src() {
										return previewState.rootState.src;
									}
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
								Avatar_Fallback($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_5 = $.first_child(fragment_4);

										UploadIcon(node_5, { class: 'size-4' });
										$.next(2);
										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}