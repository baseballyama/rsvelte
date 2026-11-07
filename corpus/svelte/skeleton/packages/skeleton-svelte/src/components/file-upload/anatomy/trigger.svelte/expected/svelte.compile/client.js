import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { FileUploadRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<button><!></button>`);

export default function Trigger($$anchor, $$props) {
	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);
	const fileUpload = FileUploadRootContext.consume();

	const element = $.derived(() => $$props.element),
		children = $.derived(() => $$props.children),
		rest = $.derived(() => $.exclude_from_object(props, ['element', 'children']));

	const attributes = $.derived(() => mergeProps(fileUpload().getTriggerProps(), $.get(rest)));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $.get(element), () => $.get(attributes));
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var button = root();

			$.attribute_effect(button, () => ({ ...$.get(attributes) }));

			var node_2 = $.child(button);

			$.snippet(node_2, () => $.get(children) ?? $.noop);
			$.reset(button);
			$.append($$anchor, button);
		};

		$.if(node, ($$render) => {
			if ($.get(element)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}