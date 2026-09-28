import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);
var root = $.from_html(`<li><!></li>`);

export default function Li($$anchor, $$props) {
	$.push($$props, true);

	const rest = $.rest_props($$props, rest_excludes);
	const isTask = $.derived(() => $$props.class?.includes('task-list-item'));
	var li = root();

	$.attribute_effect(li, () => ({
		class: `${$.get(isTask) ? 'list-none *:first:mr-1' : ''} ${$$props.class ?? ''}`,
		...rest
	}));

	var node = $.child(li);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(li);
	$.append($$anchor, li);
	$.pop();
}