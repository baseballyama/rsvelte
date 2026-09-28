import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Input from '$lib/components/ui/input.svelte';

var root = $.from_html(`<div class="group relative"><label class="has-[+input:not(:placeholder-shown)):-translate-y-1/2 origin-start text-muted-foreground/70 group-focus-within:text-foreground has-[+input:not(:placeholder-shown)]:text-foreground absolute top-1/2 block -translate-y-1/2 cursor-text px-1 text-sm transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:-translate-y-1/2 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:font-medium"><span class="bg-background inline-flex px-2">Input with label animation</span></label> <!></div>`);

export default function Input_32($$anchor) {
	const uid = $.props_id();
	var div = root();
	var label = $.child(div);
	var node = $.sibling(label, 2);

	Input(node, {
		get id() {
			return uid;
		},
		type: 'email',
		placeholder: ''
	});

	$.reset(div);
	$.template_effect(() => $.set_attribute(label, 'for', uid));
	$.append($$anchor, div);
}