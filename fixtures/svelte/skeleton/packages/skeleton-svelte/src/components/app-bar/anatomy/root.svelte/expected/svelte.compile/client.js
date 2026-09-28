import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LocaleProviderRootContext } from '../../locale-provider/modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<header><!></header>`);

export default function Root($$anchor, $$props) {
	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);
	const locale = LocaleProviderRootContext.consume();

	const element = $.derived(() => $$props.element),
		children = $.derived(() => $$props.children),
		rest = $.derived(() => $.exclude_from_object(props, ['element', 'children']));

	const attributes = $.derived(() => mergeProps(
		{
			dir: locale().dir,
			'data-scope': 'app-bar',
			'data-part': 'root'
		},
		$.get(rest)
	));

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
			var header = root();

			$.attribute_effect(header, () => ({ ...$.get(attributes) }));

			var node_2 = $.child(header);

			$.snippet(node_2, () => $.get(children) ?? $.noop);
			$.reset(header);
			$.append($$anchor, header);
		};

		$.if(node, ($$render) => {
			if ($.get(element)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}