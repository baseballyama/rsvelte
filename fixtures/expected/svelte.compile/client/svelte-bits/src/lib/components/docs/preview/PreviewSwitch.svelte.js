import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="scrubber"><button type="button" class="scrubber-track scrubber-track--switch" role="switch"><div class="scrubber-label"> </div> <div class="scrubber-switch-toggle"><div class="scrubber-switch-knob"></div></div></button></div>`);

export default function PreviewSwitch($$anchor, $$props) {
	$.push($$props, true);

	let title = $.prop($$props, 'title', 3, ''),
		checked = $.prop($$props, 'checked', 3, false),
		isDisabled = $.prop($$props, 'isDisabled', 3, false);

	function toggle() {
		if (isDisabled()) return;

		$$props.onChange?.(!checked());
	}

	function onKey(e) {
		if (e.key === ' ' || e.key === 'Enter') {
			e.preventDefault();
			toggle();
		}
	}

	var div = root();
	var button = $.child(div);
	var div_1 = $.child(button);
	var text = $.only_child(div_1, true);

	$.next(2);
	$.reset(button);
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(button, 'aria-checked', checked());
		$.set_attribute(button, 'aria-label', title());
		$.set_attribute(button, 'aria-disabled', isDisabled());
		$.set_attribute(button, 'data-disabled', isDisabled());
		$.set_attribute(button, 'data-checked', checked());
		$.set_text(text, title());
	});

	$.delegated('click', button, toggle);
	$.delegated('keydown', button, onKey);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'keydown']);