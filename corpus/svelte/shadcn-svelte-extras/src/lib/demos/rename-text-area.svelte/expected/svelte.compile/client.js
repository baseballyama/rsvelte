import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Rename from '$lib/components/ui/rename';

var root = $.from_html(`<div class="flex flex-col gap-2"><!> <p>Value: <span class="font-bold"> </span></p></div>`);

export default function Rename_text_area($$anchor) {
	let value = $.state('This is a text area');
	var div = root();
	var node = $.child(div);

	$.component(node, () => Rename.Root, ($$anchor, Rename_Root) => {
		Rename_Root($$anchor, {
			this: 'p',
			inputTag: 'textarea',
			validate: (value) => value.length > 0,
			class: 'text-xl',
			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			}
		});
	});

	var p = $.sibling(node, 2);
	var span = $.sibling($.child(p));
	var text = $.only_child(span, true);

	$.reset(p);
	$.reset(div);
	$.template_effect(() => $.set_text(text, $.get(value)));
	$.append($$anchor, div);
}