import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import SelectNative from '$lib/components/ui/select-native.svelte';

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<div class="space-y-2"><!> <!></div>`);

export default function Select_12($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	const timezones = Intl.supportedValuesOf('timeZone').map((timezone) => {
		const formatter = new Intl.DateTimeFormat('en', { timeZone: timezone, timeZoneName: 'shortOffset' });
		const parts = formatter.formatToParts(new Date());
		const offset = parts.find((part) => part.type === 'timeZoneName')?.value || '';
		const modifiedOffset = offset === 'GMT' ? 'GMT+0' : offset;

		return {
			label: `(${modifiedOffset}) ${timezone.replace(/_/g, ' ')}`,
			numericOffset: parseInt(offset.replace('GMT', '').replace('+', '') || '0'),
			value: timezone
		};
	}).sort((a, b) => a.numericOffset - b.numericOffset);

	var div = root_1();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Timezone select (native)');

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
			var fragment = $.comment();
			var node_2 = $.first_child(fragment);

			$.each(node_2, 17, () => timezones, (item) => item.value, ($$anchor, item) => {
				var option = root();
				var text_1 = $.only_child(option, true);
				var option_value = {};

				$.template_effect(() => {
					$.set_selected(option, $.get(item).value == 'Europe/London');
					$.set_text(text_1, $.get(item).label);

					if (option_value !== (option_value = $.get(item).value)) {
						option.value = (option.__value = option_value) ?? '';
					}
				});

				$.append($$anchor, option);
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}