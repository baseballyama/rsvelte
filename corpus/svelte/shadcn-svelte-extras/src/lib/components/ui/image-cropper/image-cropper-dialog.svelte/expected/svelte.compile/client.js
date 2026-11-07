import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Dialog from '$lib/components/ui/dialog';
import { cn } from '$lib/utils.js';
import { useImageCropperDialog } from './image-cropper.svelte.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'class']);
var root = $.from_html(`<div class="flex flex-col gap-4"><!></div>`);

export default function Image_cropper_dialog($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	const dialogState = useImageCropperDialog();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return dialogState.rootState.open;
			},

			set open($$value) {
				dialogState.rootState.open = $$value;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => cn('min-h-96 max-w-full rounded-none border-x-0 sm:max-w-lg sm:rounded-lg sm:border-x', $$props.class));

					$.component(node_1, () => Dialog.Content, ($$anchor, Dialog_Content) => {
						Dialog_Content($$anchor, $.spread_props(() => rest, {
							showCloseButton: false,
							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var div = root();
								var node_2 = $.child(div);

								$.snippet(node_2, () => $$props.children ?? $.noop);
								$.reset(div);
								$.append($$anchor, div);
							},
							$$slots: { default: true }
						}));
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}