import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { openStackblitzProject } from '@/modules/stackblitz/stackblitz';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<button><svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 16 16"><path class="fill-current" d="m5 15l8-8H9l2-6l-8 8h4z"></path></svg></button>`);

export default function Open_in_stackblitz($$anchor, $$props) {
	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);

	const framework = $.derived(() => $$props.framework),
		files = $.derived(() => $$props.files),
		rest = $.derived(() => $.exclude_from_object(props, ['framework', 'files']));

	function openInStackblitz() {
		openStackblitzProject($.get(framework), $.get(files));
	}

	var button = root();

	$.attribute_effect(button, () => ({
		...$.get(rest),
		type: 'button',
		onclick: openInStackblitz,
		class: `btn-icon preset-tonal hover:preset-tonal ${$.get(rest).class ?? ''}`,
		title: 'Open on Stackblitz',
		'aria-label': 'Open on Stackblitz'
	}));

	$.append($$anchor, button);
	$.pop();
}