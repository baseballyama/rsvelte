import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SelectNative from '$lib/components/ui/select-native.svelte';

var root = $.from_html(`<option disabled="" selected="">Select framework</option> <option>Svelte</option> <option>Next.js</option> <option>Astro</option> <option>Gatsby</option>`, 1);
var root_1 = $.from_html(`<div class="border-input bg-background focus-within:border-ring focus-within:ring-ring/20 relative rounded-lg border shadow-xs shadow-black/5 transition-shadow focus-within:ring-[3px] focus-within:outline-hidden has-[select:disabled]:cursor-not-allowed has-[select:disabled]:opacity-50 [&amp;:has(select:is(:disabled))_*]:pointer-events-none"><label class="text-foreground block px-3 pt-2 text-xs font-medium">Select with inset label (native)</label> <!></div>`);

export default function Select_14($$anchor) {
	const uid = $.props_id();
	var div = root_1();
	var label = $.child(div);
	var node = $.sibling(label, 2);

	SelectNative(node, {
		get id() {
			return uid;
		},
		class: 'border-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var option = $.first_child(fragment);

			option.value = option.__value = '';

			var option_1 = $.sibling(option, 2);

			option_1.value = option_1.__value = 's1';

			var option_2 = $.sibling(option_1, 2);

			option_2.value = option_2.__value = 's2';

			var option_3 = $.sibling(option_2, 2);

			option_3.value = option_3.__value = 's3';

			var option_4 = $.sibling(option_3, 2);

			option_4.value = option_4.__value = 's4';
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.template_effect(() => $.set_attribute(label, 'for', uid));
	$.append($$anchor, div);
}