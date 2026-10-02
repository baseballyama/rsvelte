import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import Switch from '$lib/components/ui/switch.svelte';
import IconMoon from '@lucide/svelte/icons/moon';
import IconSun from '@lucide/svelte/icons/sun';

var root = $.from_html(`<span class="sr-only">Toggle switch</span> <!>`, 1);
var root_1 = $.from_html(`<div class="inline-flex items-center gap-2"><!> <!></div>`);

export default function Switch_10($$anchor) {
	const uid = $.props_id();
	let checked = $.state(true);
	var div = root_1();
	var node = $.child(div);

	Switch(node, {
		get id() {
			return uid;
		},
		'aria-label': 'Toggle switch',
		get checked() {
			return $.get(checked);
		},

		set checked($$value) {
			$.set(checked, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	Label(node_1, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_2 = $.sibling($.first_child(fragment), 2);

			{
				var consequent = ($$anchor) => {
					IconSun($$anchor, { size: 16, 'aria-hidden': 'true' });
				};

				var alternate = ($$anchor) => {
					IconMoon($$anchor, { size: 16, 'aria-hidden': 'true' });
				};

				$.if(node_2, ($$render) => {
					if ($.get(checked)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}