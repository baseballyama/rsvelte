import 'svelte/internal/disclose-version';
import { splitItemProps } from '@zag-js/file-upload';
import * as $ from 'svelte/internal/client';
import { FileUploadItemContext } from '../modules/item-context.js';
import { FileUploadRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<li><!></li>`);

export default function Item($$anchor, $$props) {
	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);
	const fileUpload = FileUploadRootContext.consume();

	const $$d = $.derived(() => splitItemProps(props)),
		$$array = $.derived(() => $.to_array($.get($$d), 2)),
		itemProps = $.derived(() => $.get($$array)[0]),
		componentProps = $.derived(() => $.get($$array)[1]);

	const element = $.derived(() => $.get(componentProps).element),
		children = $.derived(() => $.get(componentProps).children),
		rest = $.derived(() => $.exclude_from_object($.get(componentProps), ['element', 'children']));

	const attributes = $.derived(() => mergeProps(fileUpload().getItemProps($.get(itemProps)), $.get(rest)));

	FileUploadItemContext.provide(() => $.get(itemProps));

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
			var li = root();

			$.attribute_effect(li, () => ({ ...$.get(attributes) }));

			var node_2 = $.child(li);

			$.snippet(node_2, () => $.get(children) ?? $.noop);
			$.reset(li);
			$.append($$anchor, li);
		};

		$.if(node, ($$render) => {
			if ($.get(element)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}