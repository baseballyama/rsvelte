import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import SelectNative from '$lib/components/ui/select-native.svelte';

var root = $.from_html(`<option>Svelte</option> <option>Next.js</option> <option>Astro</option> <option>Gatsby</option>`, 1);
var root_1 = $.from_html(`<div class="[&amp;_svg]:text-destructive/80 space-y-2"><!> <!> <p class="text-destructive mt-2 text-xs" role="alert" aria-live="polite">Selected option is invalid</p></div>`);

export default function Select_06($$anchor) {
	const uid = $.props_id();
	var div = root_1();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Select with error (native)');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	SelectNative(node_1, {
		get id() {
			return uid;
		},
		class: 'border-destructive/80 text-destructive focus-visible:border-destructive/80 focus-visible:ring-destructive/20',
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

	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
}