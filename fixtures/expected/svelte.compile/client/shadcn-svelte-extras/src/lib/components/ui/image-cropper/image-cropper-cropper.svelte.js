import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Cropper from 'svelte-easy-crop';
import { useImageCropperCropper } from './image-cropper.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'cropShape',
	'aspect',
	'showGrid'
]);

var root = $.from_html(`<div class="relative h-full w-full"><!></div>`);

export default function Image_cropper_cropper($$anchor, $$props) {
	$.push($$props, true);

	let cropShape = $.prop($$props, 'cropShape', 3, 'round'),
		aspect = $.prop($$props, 'aspect', 3, 1),
		showGrid = $.prop($$props, 'showGrid', 3, false),
		rest = $.rest_props($$props, rest_excludes);

	const cropperState = useImageCropperCropper();
	var div = root();
	var node = $.child(div);

	Cropper(node, $.spread_props(() => rest, {
		get cropShape() {
			return cropShape();
		},

		get aspect() {
			return aspect();
		},

		get showGrid() {
			return showGrid();
		},

		get image() {
			return cropperState.rootState.tempUrl;
		},

		get oncropcomplete() {
			return cropperState.onCropComplete;
		}
	}));

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}