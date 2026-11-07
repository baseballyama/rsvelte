import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Textarea from '$lib/components/ui/textarea.svelte';

var root = $.from_html(`<div class="group relative"><label class="has-[+textarea:not(:placeholder-shown)):-translate-y-1/2 origin-start text-muted-foreground/70 group-focus-within:text-foreground has-[+textarea:not(:placeholder-shown)]:text-foreground absolute top-0 block translate-y-2 cursor-text px-1 text-sm transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:-translate-y-1/2 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium has-[+textarea:not(:placeholder-shown)]:pointer-events-none has-[+textarea:not(:placeholder-shown)]:top-0 has-[+textarea:not(:placeholder-shown)]:cursor-default has-[+textarea:not(:placeholder-shown)]:text-xs has-[+textarea:not(:placeholder-shown)]:font-medium"><span class="bg-background inline-flex px-2">Textarea with label animation</span></label> <!></div>`);

export default function Textarea_14($$anchor) {
	const uid = $.props_id();
	var div = root();
	var label = $.child(div);
	var node = $.sibling(label, 2);

	Textarea(node, {
		get id() {
			return uid;
		},
		placeholder: ''
	});

	$.reset(div);
	$.template_effect(() => $.set_attribute(label, 'for', uid));
	$.append($$anchor, div);
}