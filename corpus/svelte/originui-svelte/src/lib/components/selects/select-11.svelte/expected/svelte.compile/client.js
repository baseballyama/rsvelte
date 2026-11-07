import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import SelectNative from '$lib/components/ui/select-native.svelte';

var root = $.from_html(`<optgroup label="Frontend"><option>Svelte</option> <option>Vue</option> <option>Angular</option></optgroup> <optgroup label="Backend"><option>Node.js</option> <option>Python</option> <option>Java</option></optgroup>`, 1);
var root_1 = $.from_html(`<div class="space-y-2"><!> <!></div>`);

export default function Select_11($$anchor) {
	const uid = $.props_id();
	var div = root_1();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Select with option groups (native)');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	SelectNative(node_1, {
		get id() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var optgroup = $.first_child(fragment);
			var option = $.child(optgroup);

			option.value = option.__value = 's1';

			var option_1 = $.sibling(option, 2);

			option_1.value = option_1.__value = 's2';

			var option_2 = $.sibling(option_1, 2);

			option_2.value = option_2.__value = 's3';
			$.reset(optgroup);

			var optgroup_1 = $.sibling(optgroup, 2);
			var option_3 = $.child(optgroup_1);

			option_3.value = option_3.__value = 's4';

			var option_4 = $.sibling(option_3, 2);

			option_4.value = option_4.__value = 's5';

			var option_5 = $.sibling(option_4, 2);

			option_5.value = option_5.__value = 's6';
			$.reset(optgroup_1);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}