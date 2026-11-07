import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="scrubber"><div class="scrubber-track scrubber-track--color" role="group"><div class="scrubber-label"> </div> <div class="scrubber-color-controls"><input class="scrubber-color-text" type="text"/> <label class="scrubber-color-swatch-preview"><input type="color" style="opacity:0;width:100%;height:100%;cursor:pointer;"/></label></div></div></div>`);

export default function PreviewColorPicker($$anchor, $$props) {
	$.push($$props, true);

	let title = $.prop($$props, 'title', 3, ''),
		value = $.prop($$props, 'value', 3, '#ffffff');

	let hex = $.derived(value);

	function commitHex(v) {
		const trimmed = v.trim();

		if ((/^#?[0-9a-fA-F]{6}$/).test(trimmed)) {
			const next = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;

			$$props.onChange?.(next.toLowerCase());
		}
	}

	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var text = $.only_child(div_2, true);
	var div_3 = $.sibling(div_2, 2);
	var input = $.child(div_3);

	$.remove_input_defaults(input);

	var label = $.sibling(input, 2);
	let styles;
	var input_1 = $.child(label);

	$.remove_input_defaults(input_1);
	$.reset(label);
	$.reset(div_3);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(div_1, 'aria-label', title());
		$.set_text(text, title());
		$.set_value(input, $.get(hex));
		styles = $.set_style(label, '', styles, { background: value() });
		$.set_value(input_1, value());
	});

	$.delegated('input', input, (e) => $.set(hex, e.currentTarget.value));
	$.event('blur', input, (e) => commitHex(e.currentTarget.value));

	$.delegated('keydown', input, (e) => {
		if (e.key === 'Enter') commitHex(e.currentTarget.value);
	});

	$.delegated('input', input_1, (e) => $$props.onChange?.(e.currentTarget.value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['input', 'keydown']);