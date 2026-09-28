import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import Inputmask from 'inputmask';

var root = $.from_html(`<div class="*:not-first:mt-2"><!> <!> <p class="text-muted-foreground mt-2 text-xs" role="region" aria-live="polite">Built with <a class="hover:text-foreground underline" href="https://github.com/RobinHerbots/inputmask" target="_blank" rel="noopener nofollow">inputmask</a></p></div>`);

export default function Input_55($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let inputElement = $.state(null);

	$.user_effect(() => {
		if (!$.get(inputElement)) return;

		const im = new Inputmask('AA99 AAA', { placeholder: '', showMaskOnHover: false }).mask($.get(inputElement));

		return () => im.remove();
	});

	var div = root();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Input with mask');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Input(node_1, {
		get id() {
			return uid;
		},
		placeholder: 'AB12 CDE',
		type: 'text',
		get ref() {
			return $.get(inputElement);
		},

		set ref($$value) {
			$.set(inputElement, $$value, true);
		}
	});

	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}