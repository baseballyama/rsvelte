import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { settingsSpacing } from '$lib/state/generator.svelte';

var root = $.from_html(`<button type="button"> </button>`);
var root_1 = $.from_html(`<div class="space-y-4"><p class="opacity-60">Set the scale factor for <a href="https://tailwindcss.com/docs/customizing-spacing" target="_blank" class="text-inherit underline">Tailwind Spacing</a> utilities.</p> <label class="label"><span class="label-text">Scale Factor</span> <div class="grid grid-cols-3 gap-4"></div></label></div>`);

export default function ControlsSpacing($$anchor, $$props) {
	$.push($$props, true);

	const options = [
		{ label: 'Tight', size: '0.22rem' },
		{ label: 'Base', size: '0.25rem' },
		{ label: 'Loose', size: '0.28rem' }
	];

	function set(newValue) {
		settingsSpacing['--spacing'] = newValue;
	}

	function activeClass(size) {
		return settingsSpacing['--spacing'] === size ? 'preset-filled' : 'preset-tonal';
	}

	var div = root_1();
	var label = $.sibling($.child(div), 2);
	var div_1 = $.sibling($.child(label), 2);

	$.each(div_1, 20, () => options, (o) => o, ($$anchor, o) => {
		var button = root();
		var text = $.only_child(button, true);

		$.template_effect(
			($0) => {
				$.set_class(button, 1, `btn ${$0 ?? ''}`);
				$.set_text(text, o.label);
			},
			[() => activeClass(o.size)]
		);

		$.delegated('click', button, () => set(o.size));
		$.append($$anchor, button);
	});

	$.reset(div_1);
	$.reset(label);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);