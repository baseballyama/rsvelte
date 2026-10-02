import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);
var root = $.from_html(`<ul><!></ul>`);

export default function Ul($$anchor, $$props) {
	$.push($$props, true);

	const rest = $.rest_props($$props, rest_excludes);
	const isTaskList = $.derived(() => $$props.class?.includes('contains-task-list'));
	var ul = root();
	var node = $.child(ul);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(ul);
	$.template_effect(() => $.set_class(ul, 1, `${$.get(isTaskList) ? '' : 'list-disc list-outside pl-4'} space-y-1`));
	$.append($$anchor, ul);
	$.pop();
}