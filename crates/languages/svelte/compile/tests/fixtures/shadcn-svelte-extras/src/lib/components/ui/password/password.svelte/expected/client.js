import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { box } from 'svelte-toolbelt';
import { usePassword } from './password.svelte.js';
import { cn } from '$lib/utils.js';

var root = $.from_html(`<div><!></div>`);

export default function Password($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		hidden = $.prop($$props, 'hidden', 15, true),
		minScore = $.prop($$props, 'minScore', 3, 3);

	usePassword({
		hidden: box.with(() => hidden(), (v) => hidden(v)),
		minScore: box.with(() => minScore())
	});

	var div = root();
	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.bind_this(div, ($$value) => ref($$value), () => ref());
	$.template_effect(($0) => $.set_class(div, 1, $0), [() => $.clsx(cn('flex flex-col gap-2', $$props.class))]);
	$.append($$anchor, div);
	$.pop();
}