import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'ref',
	'title'
]);

var root = $.from_html(`<div><h1 id="title" class="text-foreground mb-3 font-serif text-4xl/[1.1] font-bold md:text-5xl/[1.1]"> </h1> <p class="text-muted-foreground text-lg"><!></p></div>`);

export default function Page_header($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var div = root();
	var h1 = $.child(div);
	var text = $.only_child(h1, true);
	var p = $.sibling(h1, 2);
	var node = $.child(p);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(p);
	$.reset(div);
	$.bind_this(div, ($$value) => ref($$value), () => ref());

	$.template_effect(
		($0) => {
			$.set_class(div, 1, $0);
			$.set_text(text, $$props.title);
		},
		[() => $.clsx(cn('mb-16 text-center', $$props.class))]
	);

	$.append($$anchor, div);
	$.pop();
}