import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { dropzone } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'files',
	'class',
	'onDrop',
	'onDragOver',
	'onChange'
]);

var root = $.from_html(`<label><!> <input/></label>`);

export default function Dropzone($$anchor, $$props) {
	$.push($$props, true);

	let files = $.prop($$props, 'files', 15),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("dropzone"));
	let inputElement;

	const handleDrop = function (event) {
		event.preventDefault();

		if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
			files(event.dataTransfer.files);

			if (inputElement) {
				inputElement.files = event.dataTransfer.files;
			}
		}

		if ($$props.onDrop) {
			$$props.onDrop.call(this, event);
		}
	};

	const handleDragOver = function (event) {
		event.preventDefault();

		if ($$props.onDragOver) {
			$$props.onDragOver.call(this, event);
		}
	};

	const handleChange = function (event) {
		if ($$props.onChange) {
			$$props.onChange.call(this, event);
		}
	};

	var label = root();
	var node = $.child(label);

	$.snippet(node, () => $$props.children);

	var input = $.sibling(node, 2);

	$.attribute_effect(
		input,
		() => ({
			...restProps,
			onchange: handleChange,
			type: 'file',
			class: 'hidden'
		}),
		void 0,
		void 0,
		void 0,
		void 0,
		true
	);

	$.bind_this(input, ($$value) => inputElement = $$value, () => inputElement);
	$.reset(label);

	$.template_effect(($0) => $.set_class(label, 1, $0), [
		() => $.clsx(dropzone({ class: clsx($.get(theme), $$props.class) }))
	]);

	$.event('drop', label, handleDrop);
	$.event('dragover', label, handleDragOver);
	$.bind_files(input, files);
	$.append($$anchor, label);
	$.pop();
}