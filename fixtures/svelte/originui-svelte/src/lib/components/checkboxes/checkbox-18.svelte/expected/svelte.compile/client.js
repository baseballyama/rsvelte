import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Checkbox from '$lib/components/ui/checkbox.svelte';

var root = $.from_html(`<label class="border-input ring-offset-background has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary has-data-[state=checked]:text-primary-foreground has-focus-visible:ring-ring/70 relative flex size-9 cursor-pointer flex-col items-center justify-center gap-3 rounded-full border text-center shadow-xs shadow-black/[.04] transition-colors has-focus-visible:ring-2 has-focus-visible:ring-offset-2 has-disabled:cursor-not-allowed has-disabled:opacity-50"><!> <span aria-hidden="true" class="text-sm font-medium"> </span> <span class="sr-only"> </span></label>`);
var root_1 = $.from_html(`<fieldset class="space-y-4"><legend class="text-foreground text-sm leading-none font-medium">Days of the week</legend> <div class="flex gap-1.5"></div></fieldset>`);

export default function Checkbox_18($$anchor) {
	const items = [
		{
			defaultChecked: true,
			id: 'checkbox-18-c1',
			label: 'Monday',
			value: 'c1'
		},

		{
			defaultChecked: true,
			id: 'checkbox-18-c2',
			label: 'Tuesday',
			value: 'c2'
		},
		{ id: 'checkbox-18-c3', label: 'Wednesday', value: 'c3' },
		{
			defaultChecked: true,
			id: 'checkbox-18-c4',
			label: 'Thursday',
			value: 'c4'
		},

		{
			defaultChecked: true,
			id: 'checkbox-18-c5',
			label: 'Friday',
			value: 'c5'
		},
		{ id: 'checkbox-18-c6', label: 'Saturday', value: 'c6' },
		{
			disabled: true,
			id: 'checkbox-18-c7',
			label: 'Sunday',
			value: 'c7'
		}
	];

	var fieldset = root_1();
	var div = $.sibling($.child(fieldset), 2);

	$.each(div, 21, () => items, (item) => item.id, ($$anchor, item) => {
		var label = root();
		var node = $.child(label);

		Checkbox(node, {
			get id() {
				return $.get(item).id;
			},

			get value() {
				return $.get(item).value;
			},
			class: 'sr-only after:absolute after:inset-0',
			get checked() {
				return $.get(item).defaultChecked;
			},

			get disabled() {
				return $.get(item).disabled;
			}
		});

		var span = $.sibling(node, 2);
		var text = $.only_child(span, true);
		var span_1 = $.sibling(span, 2);
		var text_1 = $.only_child(span_1, true);

		$.reset(label);

		$.template_effect(() => {
			$.set_attribute(label, 'for', $.get(item).id);
			$.set_text(text, $.get(item).label[0]);
			$.set_text(text_1, $.get(item).label);
		});

		$.append($$anchor, label);
	});

	$.reset(div);
	$.reset(fieldset);
	$.append($$anchor, fieldset);
}