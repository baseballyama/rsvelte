import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/button.svelte';
import { useImageCropperCancel } from './image-cropper.svelte.js';
import Trash2Icon from '@lucide/svelte/icons/trash-2';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'variant',
	'size',
	'onclick'
]);

var root = $.from_html(`<!> <span>Cancel</span>`, 1);

export default function Image_cropper_cancel($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		variant = $.prop($$props, 'variant', 3, 'outline'),
		size = $.prop($$props, 'size', 3, 'sm'),
		rest = $.rest_props($$props, rest_excludes);

	const cancelState = useImageCropperCancel();

	Button($$anchor, $.spread_props(() => rest, {
		get size() {
			return size();
		},

		get variant() {
			return variant();
		},

		onclick: (e) => {
			$$props.onclick?.(e);
			cancelState.onclick();
		},

		get ref() {
			return ref();
		},

		set ref($$value) {
			ref($$value);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Trash2Icon(node, {});
			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	}));

	$.pop();
}