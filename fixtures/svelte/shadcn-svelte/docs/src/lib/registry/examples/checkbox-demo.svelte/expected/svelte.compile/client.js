import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

var root = $.from_html(`<!> <div class="grid gap-1.5 font-normal"><p class="text-sm leading-none font-medium">Enable notifications</p> <p class="text-sm text-muted-foreground">You can enable or disable notifications at any time.</p></div>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col gap-6"><div class="flex items-center gap-3"><!> <!></div> <div class="flex items-start gap-3"><!> <div class="grid gap-2"><!> <p class="text-sm text-muted-foreground">By clicking this checkbox, you agree to the terms and conditions.</p></div></div> <div class="flex items-start gap-3"><!> <!></div> <!></div>`);

export default function Checkbox_demo($$anchor) {
	var div = root_1();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Checkbox(node, { id: 'terms' });

	var node_1 = $.sibling(node, 2);

	Label(node_1, {
		for: 'terms',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Accept terms and conditions');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_2 = $.child(div_2);

	Checkbox(node_2, { id: 'terms-2', checked: true });

	var div_3 = $.sibling(node_2, 2);
	var node_3 = $.child(div_3);

	Label(node_3, {
		for: 'terms-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Accept terms and conditions');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div_3);
	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var node_4 = $.child(div_4);

	Checkbox(node_4, { id: 'toggle', disabled: true });

	var node_5 = $.sibling(node_4, 2);

	Label(node_5, {
		for: 'toggle',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Enable notifications');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_4);

	var node_6 = $.sibling(div_4, 2);

	Label(node_6, {
		class: 'flex items-start gap-3 rounded-lg border p-3 hover:bg-accent/50 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_7 = $.first_child(fragment);

			Checkbox(node_7, {
				id: 'toggle-2',
				checked: true,
				class: 'data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700'
			});

			$.next(2);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}