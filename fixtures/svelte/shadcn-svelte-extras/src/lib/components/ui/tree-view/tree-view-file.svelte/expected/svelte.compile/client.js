import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FileIcon from '@lucide/svelte/icons/file';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'name',
	'icon',
	'type',
	'class'
]);

var root = $.from_html(`<button><!> <span> </span></button>`);

export default function Tree_view_file($$anchor, $$props) {
	$.push($$props, true);

	let type = $.prop($$props, 'type', 3, 'button'),
		rest = $.rest_props($$props, rest_excludes);

	var button = root();

	$.attribute_effect(button, ($0) => ({ type: type(), class: $0, ...rest }), [
		() => cn('flex place-items-center gap-1 pl-[3px]', $$props.class)
	]);

	var node = $.child(button);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.icon, () => ({ name: $$props.name }));
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			FileIcon($$anchor, { class: 'size-4' });
		};

		$.if(node, ($$render) => {
			if ($$props.icon) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var span = $.sibling(node, 2);
	var text = $.only_child(span, true);

	$.reset(button);
	$.template_effect(() => $.set_text(text, $$props.name));
	$.append($$anchor, button);
	$.pop();
}