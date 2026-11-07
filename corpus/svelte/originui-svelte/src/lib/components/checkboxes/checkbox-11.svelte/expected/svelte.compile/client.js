import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Checkbox from '$lib/components/ui/checkbox.svelte';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';

var root = $.from_html(`<div><div class="flex items-start gap-2"><!> <div class="grow"><div class="grid gap-2"><!> <p class="text-muted-foreground text-xs">You can use this checkbox with a label and a description.</p></div> <div role="region" class="grid transition-all ease-in-out data-[state=collapsed]:grid-rows-[0fr] data-[state=collapsed]:opacity-0 data-[state=expanded]:grid-rows-[1fr] data-[state=expanded]:opacity-100"><div class="-m-2 overflow-hidden p-2"><div class="mt-3"><!></div></div></div></div></div></div>`);

export default function Checkbox_11($$anchor) {
	const uid = $.props_id();
	let checked = $.state(false);
	let inputElement = $.state(null);

	const handleTransitionEnd = () => {
		if ($.get(checked) && $.get(inputElement)) {
			$.get(inputElement).focus();
		}
	};

	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Checkbox(node, {
		get id() {
			return uid;
		},

		get 'aria-controls'() {
			return `${uid}-input`;
		},
		class: 'h-4 w-4',
		get checked() {
			return $.get(checked);
		},

		set checked($$value) {
			$.set(checked, $$value, true);
		}
	});

	var div_2 = $.sibling(node, 2);
	var div_3 = $.child(div_2);
	var node_1 = $.child(div_3);

	Label(node_1, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Checkbox with expansion');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var p = $.sibling(node_1, 2);

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var div_5 = $.child(div_4);
	var div_6 = $.child(div_5);
	var node_2 = $.child(div_6);

	{
		let $0 = $.derived(() => !$.get(checked));

		Input(node_2, {
			type: 'text',
			get id() {
				return `${uid}-additional-info`;
			},
			placeholder: 'Enter details',
			'aria-label': 'Additional Information',
			get disabled() {
				return $.get($0);
			},

			get ref() {
				return $.get(inputElement);
			},

			set ref($$value) {
				$.set(inputElement, $$value, true);
			}
		});
	}

	$.reset(div_6);
	$.reset(div_5);
	$.reset(div_4);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(p, 'id', `${uid}-description`);
		$.set_attribute(div_4, 'id', `${uid}-input`);
		$.set_attribute(div_4, 'aria-labelledby', uid);
		$.set_attribute(div_4, 'data-state', $.get(checked) ? 'expanded' : 'collapsed');
	});

	$.event('transitionend', div_4, handleTransitionEnd);
	$.append($$anchor, div);
}