import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getTabs } from './context.ts';

var root = $.from_html(
	`<div role="tabpanel"><!></div> <style>.tabs-content {
			margin-top: 0.5rem;
			width: 100%;
			outline: none;
		}</style>`,
	1
);

export default function TabsContent($$anchor, $$props) {
	$.push($$props, true);

	let className = $.prop($$props, 'class', 3, '');
	const ctx = getTabs();
	const active = $.derived(() => ctx.value === $$props.value);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var div = $.first_child(fragment_1);
			var node_1 = $.child(div);

			$.snippet(node_1, () => $$props.children);
			$.reset(div);
			$.next(2);
			$.template_effect(() => $.set_class(div, 1, `tabs-content ${className() ?? ''}`));
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(active)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}