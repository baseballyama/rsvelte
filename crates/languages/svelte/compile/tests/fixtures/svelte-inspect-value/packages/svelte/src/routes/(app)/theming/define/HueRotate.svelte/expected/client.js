import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="flex row gap align-center justify-center"><label class="flex row">hue rotate <div class="flex row"><input type="range"/> <input type="number"/></div></label> <button type="button" title="clear rotation" class="unstyled">cancel</button> <button type="button" title="apply rotation" class="unstyled">apply</button></div>`);

export default function HueRotate($$anchor, $$props) {
	$.push($$props, true);

	let rotation = $.prop($$props, 'rotation', 15, 0);
	var div = root();
	var label = $.child(div);
	var div_1 = $.sibling($.child(label));
	var input = $.child(div_1);

	$.set_attribute(input, 'min', -360);
	$.set_attribute(input, 'max', 360);
	input.defaultValue = 0;

	var input_1 = $.sibling(input, 2);

	$.set_attribute(input_1, 'min', -360);
	$.set_attribute(input_1, 'max', 360);
	input_1.defaultValue = 0;
	$.reset(div_1);
	$.reset(label);

	var button = $.sibling(label, 2);
	var button_1 = $.sibling(button, 2);

	$.reset(div);

	$.template_effect(() => {
		button.disabled = rotation() === 0;
		button_1.disabled = rotation() === 0;
	});

	$.bind_value(input, rotation);
	$.bind_value(input_1, rotation);

	$.delegated('click', button, function (...$$args) {
		$$props.oncancel?.apply(this, $$args);
	});

	$.delegated('click', button_1, function (...$$args) {
		$$props.onapply?.apply(this, $$args);
	});

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);