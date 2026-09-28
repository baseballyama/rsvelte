import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { box } from 'svelte-toolbelt';
import { useImageCropperRoot } from './image-cropper.svelte.js';
import { onDestroy } from 'svelte';
import { useId } from 'bits-ui';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'src',
	'onCropped',
	'onUnsupportedFile',
	'children'
]);

var root = $.from_html(`<!> <input/>`, 1);

export default function Image_cropper($$anchor, $$props) {
	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, useId),
		src = $.prop($$props, 'src', 15, ''),
		onCropped = $.prop($$props, 'onCropped', 3, () => {}),
		onUnsupportedFile = $.prop($$props, 'onUnsupportedFile', 3, () => {}),
		rest = $.rest_props($$props, rest_excludes);

	const rootState = useImageCropperRoot({
		id: box.with(() => id()),
		src: box.with(() => src(), (v) => src(v)),
		onCropped: box.with(() => onCropped()),
		onUnsupportedFile: box.with(() => onUnsupportedFile())
	});

	onDestroy(() => rootState.dispose());

	var fragment = root();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);

	var input = $.sibling(node, 2);

	var event_handler = (e) => {
		const file = e.currentTarget.files?.[0];

		if (!file) return;

		rootState.onUpload(file);

		// reset so that we can reupload the same file
		e.target.value = '';
	};

	$.attribute_effect(
		input,
		() => ({
			...rest,
			onchange: event_handler,
			type: 'file',
			id: id(),
			style: 'display: none;'
		}),
		void 0,
		void 0,
		void 0,
		void 0,
		true
	);

	$.append($$anchor, fragment);
	$.pop();
}