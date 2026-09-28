import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useImageCropperTrigger } from './image-cropper.svelte.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'children']);
var root = $.from_html(`<label><!></label>`);

export default function Image_cropper_upload_trigger($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		rest = $.rest_props($$props, rest_excludes);

	const triggerState = useImageCropperTrigger();
	var label = root();

	$.attribute_effect(label, () => ({
		...rest,
		for: triggerState.rootState.id,
		class: 'hover:cursor-pointer'
	}));

	var node = $.child(label);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(label);
	$.bind_this(label, ($$value) => ref($$value), () => ref());
	$.append($$anchor, label);
	$.pop();
}