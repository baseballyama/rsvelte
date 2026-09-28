import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useFileDropZoneTextarea } from './file-drop-zone.svelte.js';
import { box, mergeProps } from 'svelte-toolbelt';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'onpaste',
	'ondragover',
	'ondrop',
	'child'
]);

var root = $.from_html(`<textarea></textarea>`);

export default function File_drop_zone_textarea($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);

	const fileDropZoneTextareaState = useFileDropZoneTextarea({
		onpaste: box.with(() => $$props.onpaste),
		ondragover: box.with(() => $$props.ondragover),
		ondrop: box.with(() => $$props.ondrop)
	});

	const mergedProps = $.derived(() => mergeProps(fileDropZoneTextareaState.props, rest));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.child, () => ({ props: $.get(mergedProps) }));
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var textarea = root();

			$.remove_textarea_child(textarea);
			$.attribute_effect(textarea, () => ({ ...$.get(mergedProps) }));
			$.append($$anchor, textarea);
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}