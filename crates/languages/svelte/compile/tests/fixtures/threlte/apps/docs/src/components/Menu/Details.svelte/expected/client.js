import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

var root = $.from_html(`<details><summary class="cursor-pointer list-none font-bold select-none svelte-qinqw1"><div class="mb-0 flex flex-row items-center"><!> <div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 1 16 16" aria-hidden="true"><path fill-rule="evenodd" d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z" class="fill-white"></path></svg></div></div></summary> <div><!></div></details>`);

export default function Details($$anchor, $$props) {
	$.push($$props, true);

	let mounted = $.state(false);

	let open = $.prop($$props, 'open', 15, false),
		id = $.prop($$props, 'id', 3, ''),
		_class = $.prop($$props, 'class', 3, '');

	onMount(() => {
		$.set(mounted, true);
	});

	$.user_effect(() => {
		if ($.get(mounted)) {
			const storage = sessionStorage.getItem(id());

			if (storage) {
				open(JSON.parse(storage));
			}
		}
	});

	$.user_effect(() => {
		if ($.get(mounted)) {
			sessionStorage.setItem(id(), JSON.stringify(open()));
		}
	});

	var details = root();
	var summary_1 = $.child(details);
	var div = $.child(summary_1);
	var node = $.child(div);

	$.snippet(node, () => $$props.summary ?? $.noop);

	var div_1 = $.sibling(node, 2);
	var svg = $.only_child(div_1);

	$.reset(div);
	$.reset(summary_1);

	var div_2 = $.sibling(summary_1, 2);
	var node_1 = $.child(div_2);

	$.snippet(node_1, () => $$props.children ?? $.noop);
	$.reset(div_2);
	$.reset(details);

	$.template_effect(() => {
		$.set_attribute(details, 'id', id());
		$.set_class(details, 1, `block ${_class() ?? ''}`, 'svelte-qinqw1');

		$.set_class(svg, 0, $.clsx([
			'ml-1 h-[1em] w-[1em] translate-y-px rotate-0 transition-all duration-200',
			open() && '-translate-y-px rotate-90'
		]));
	});

	$.bind_property('open', 'toggle', details, open, open);
	$.append($$anchor, details);
	$.pop();
}