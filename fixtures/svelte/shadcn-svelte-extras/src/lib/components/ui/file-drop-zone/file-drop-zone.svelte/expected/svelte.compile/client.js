import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useFileDropZone } from './file-drop-zone.svelte.js';
import { box } from 'svelte-toolbelt';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'maxFiles',
	'maxFileSize',
	'fileCount',
	'disabled',
	'onUpload',
	'onFileRejected',
	'accept',
	'capturePaste',
	'children'
]);

var root = $.from_html(`<input/> <!>`, 1);

export default function File_drop_zone($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 3, uid),
		disabled = $.prop($$props, 'disabled', 3, false),
		capturePaste = $.prop($$props, 'capturePaste', 3, false),
		rest = $.rest_props($$props, rest_excludes);

	const rootState = useFileDropZone({
		id: box.with(() => id()),
		disabled: box.with(() => disabled() ?? false),
		onUpload: box.with(() => $$props.onUpload),
		maxFiles: box.with(() => $$props.maxFiles),
		fileCount: box.with(() => $$props.fileCount),
		maxFileSize: box.with(() => $$props.maxFileSize),
		onFileRejected: box.with(() => $$props.onFileRejected),
		accept: box.with(() => $$props.accept)
	});

	var fragment = root();

	$.event('paste', $.document, function (...$$args) {
		(capturePaste() ? rootState.onpaste : undefined)?.apply(this, $$args);
	});

	var input = $.first_child(fragment);

	$.attribute_effect(input, () => ({ class: 'hidden', ...rootState.props, ...rest }), void 0, void 0, void 0, void 0, true);

	var node = $.sibling(input, 2);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}