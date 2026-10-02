import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import Switch from '$lib/components/ui/switch.svelte';
import IconMoon from '@lucide/svelte/icons/moon';
import IconSun from '@lucide/svelte/icons/sun';

var root = $.from_html(`<div><!> <div class="group inline-flex items-center gap-2"><button class="group-data-[state=checked]:text-muted-foreground/70 flex-1 cursor-pointer text-right text-sm font-medium"><!></button> <!> <button class="group-data-[state=unchecked]:text-muted-foreground/70 flex-1 cursor-pointer text-left text-sm font-medium"><!></button></div></div>`);

export default function Switch_11($$anchor) {
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
	var node_1 = $.child(button);

	IconMoon(node_1, { size: 16, 'aria-hidden': 'true' });
	$.reset(button);

	var node_2 = $.sibling(button, 2);

	Switch(node_2, {
		get id() {
			return uid;
		},

		get 'aria-labelledby'() {
			return `${uid}-off-label ${uid}-on-label`;
		},
		'aria-label': 'Toggle between dark and light mode',
		get checked() {
			return $.get(checked);
		},

		set checked($$value) {
			$.set(checked, $$value, true);
		}
	});

	var button_1 = $.sibling(node_2, 2);
	var node_3 = $.child(button_1);

	IconSun(node_3, { size: 16, 'aria-hidden': 'true' });
	$.reset(button_1);
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