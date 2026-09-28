import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import Switch from '$lib/components/ui/switch.svelte';

var root = $.from_html(`<div><!> <div class="group inline-flex items-center gap-2"><button class="group-data-[state=checked]:text-muted-foreground/70 flex-1 cursor-pointer text-right text-sm font-medium">Off</button> <!> <button class="group-data-[state=unchecked]:text-muted-foreground/70 flex-1 cursor-pointer text-left text-sm font-medium">On</button></div></div>`);

export default function Switch_09($$anchor) {
	const uid = $.props_id();
	let checked = $.state(false);

	function toggleSwitch() {
		$.set(checked, !$.get(checked));
	}

	var div = root();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},
		class: 'sr-only',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Toggle switch');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var button = $.child(div_1);
	var node_1 = $.sibling(button, 2);

	Switch(node_1, {
		get id() {
			return uid;
		},

		get 'aria-labelledby'() {
			return `$${uid}-off-label $${uid}-on-label`;
		},

		get checked() {
			return $.get(checked);
		},

		set checked($$value) {
			$.set(checked, $$value, true);
		}
	});

	var button_1 = $.sibling(node_1, 2);

	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(div_1, 'data-state', $.get(checked) ? 'checked' : 'unchecked');
		$.set_attribute(button, 'id', `${uid}-off-label`);
		$.set_attribute(button_1, 'id', `${uid}-on-label`);
	});

	$.delegated('click', button, toggleSwitch);
	$.delegated('click', button_1, toggleSwitch);
	$.append($$anchor, div);
}

$.delegate(['click']);