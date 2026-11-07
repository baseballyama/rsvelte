import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mergeProps } from '@zag-js/svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<nav><!></nav>`);

export default function Lead($$anchor, $$props) {
	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);

	const element = $.derived(() => $$props.element),
		children = $.derived(() => $$props.children),
		rest = $.derived(() => $.exclude_from_object(props, ['element', 'children']));

	const attributes = $.derived(() => mergeProps({ 'data-scope': 'app-bar', 'data-part': 'lead' }, $.get(rest)));
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
			var nav = root();

			$.attribute_effect(nav, () => ({ ...$.get(attributes) }));

			var node_2 = $.child(nav);

			$.snippet(node_2, () => $.get(children) ?? $.noop);
			$.reset(nav);
			$.append($$anchor, nav);
		};

		$.if(node, ($$render) => {
			if ($.get(element)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}