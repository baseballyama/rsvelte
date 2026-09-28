import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import Eye from '@lucide/svelte/icons/eye';
import EyeOff from '@lucide/svelte/icons/eye-off';

var root = $.from_html(`<div class="*:not-first:mt-2"><!> <div class="relative"><!> <button class="text-muted-foreground/80 ring-offset-background hover:text-foreground focus-visible:border-ring focus-visible:text-foreground focus-visible:ring-ring/30 absolute inset-y-px end-px flex h-full w-9 items-center justify-center rounded-e-lg transition-shadow focus-visible:border focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50" type="button"><!></button></div></div>`);

export default function Input_23($$anchor) {
	const uid = $.props_id();
	let isVisible = $.state(false);

	function toggleVisibility() {
		$.set(isVisible, !$.get(isVisible));
	}

	var div = root();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Show/hide password input');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	{
		let $0 = $.derived(() => $.get(isVisible) ? 'text' : 'password');

		Input(node_1, {
			get id() {
				return uid;
			},
			class: 'pe-9',
			placeholder: 'Password',
			get type() {
				return $.get($0);
			}
		});
	}

	var button = $.sibling(node_1, 2);
	var node_2 = $.child(button);

	{
		var consequent = ($$anchor) => {
			EyeOff($$anchor, { size: 16, 'aria-hidden': 'true' });
		};

		var alternate = ($$anchor) => {
			Eye($$anchor, { size: 16, 'aria-hidden': 'true' });
		};

		$.if(node_2, ($$render) => {
			if ($.get(isVisible)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(button, 'aria-label', $.get(isVisible) ? 'Hide password' : 'Show password');
		$.set_attribute(button, 'aria-pressed', $.get(isVisible));
		$.set_attribute(button, 'aria-controls', uid);
	});

	$.delegated('click', button, toggleVisibility);
	$.append($$anchor, div);
}

$.delegate(['click']);