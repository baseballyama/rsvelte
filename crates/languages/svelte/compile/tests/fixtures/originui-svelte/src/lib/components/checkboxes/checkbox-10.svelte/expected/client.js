import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Checkbox from '$lib/components/ui/checkbox.svelte';
import Label from '$lib/components/ui/label.svelte';

var root = $.from_html(`Label <span class="text-muted-foreground text-xs leading-[inherit] font-normal">(Sublabel)</span>`, 1);
var root_1 = $.from_html(`<div class="flex items-start gap-2"><!> <div class="grid grow gap-2"><!> <p class="text-muted-foreground text-xs">You can use this checkbox with a label and a description.</p></div></div>`);

export default function Checkbox_10($$anchor) {
	const uid = $.props_id();
	var div = root_1();
	var node = $.child(div);

	Checkbox(node, {
		get id() {
			return uid;
		},

		get 'aria-describedby'() {
			return `${uid}-description`;
		}
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	Label(node_1, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment = root();

			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var p = $.sibling(node_1, 2);

	$.reset(div_1);
	$.reset(div);
	$.template_effect(() => $.set_attribute(p, 'id', `${uid}-description`));
	$.append($$anchor, div);
}