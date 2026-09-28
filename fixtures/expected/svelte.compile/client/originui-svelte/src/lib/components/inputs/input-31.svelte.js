import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Input from '$lib/components/ui/input.svelte';

var root = $.from_html(`<div class="group relative"><label class="bg-background text-foreground absolute start-1 top-0 z-10 block -translate-y-1/2 px-2 text-xs font-medium group-has-disabled:opacity-50">Input with overlapping label</label> <!></div>`);

export default function Input_31($$anchor) {
	const uid = $.props_id();
	var div = root();
	var label = $.child(div);
	var node = $.sibling(label, 2);

	Input(node, {
		get id() {
			return uid;
		},
		class: 'h-10',
		placeholder: 'Email',
		type: 'email'
	});

	$.reset(div);
	$.template_effect(() => $.set_attribute(label, 'for', uid));
	$.append($$anchor, div);
}