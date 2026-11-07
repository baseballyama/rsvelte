import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import SelectNative from '$lib/components/ui/select-native.svelte';
import Clock from '@lucide/svelte/icons/clock';

var root = $.from_html(`<option>00:00 AM - 11:59 PM</option> <option>01:00 AM - 12:59 PM</option> <option>02:00 AM - 01:59 PM</option> <option>03:00 AM - 02:59 PM</option>`, 1);
var root_1 = $.from_html(`<div class="space-y-2"><!> <div class="group relative"><!> <div class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 group-has-[[disabled]]:opacity-50"><!></div></div></div>`);

export default function Select_03($$anchor) {
	const uid = $.props_id();
	var div = root_1();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Select with icon (native)');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	SelectNative(node_1, {
		get id() {
			return uid;
		},
		class: 'ps-9',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var option = $.first_child(fragment);

			option.value = option.__value = 's1';

			var option_1 = $.sibling(option, 2);

			option_1.value = option_1.__value = 's2';

			var option_2 = $.sibling(option_1, 2);

			option_2.value = option_2.__value = 's3';

			var option_3 = $.sibling(option_2, 2);

			option_3.value = option_3.__value = 's4';
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var div_2 = $.sibling(node_1, 2);
	var node_2 = $.child(div_2);

	Clock(node_2, { size: 16, 'aria-hidden': 'true' });
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}