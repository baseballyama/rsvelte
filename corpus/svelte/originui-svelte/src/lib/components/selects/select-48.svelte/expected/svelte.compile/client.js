import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import SelectNative from '$lib/components/ui/select-native.svelte';

var root = $.from_html(`<option>React</option> <option>Next.js</option> <option>Astro</option> <option>Gatsby</option> <option>Vue</option> <option>Angular</option>`, 1);
var root_1 = $.from_html(`<div class="space-y-2"><!> <div class="border-input overflow-hidden rounded-lg border"><!></div></div>`);

export default function Select_48($$anchor) {
	const uid = $.props_id();
	var div = root_1();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Multiple select (native)');

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
		class: 'rounded-none border-none',
		multiple: true,
		value: '',
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

			var option_4 = $.sibling(option_3, 2);

			option_4.value = option_4.__value = 's5';

			var option_5 = $.sibling(option_4, 2);

			option_5.value = option_5.__value = 's6';
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}