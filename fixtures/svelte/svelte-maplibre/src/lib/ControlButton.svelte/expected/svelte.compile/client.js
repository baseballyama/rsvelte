import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button type="button"><div><!></div></button>`);

export default function ControlButton($$anchor, $$props) {
	/** True if this is an icon button. This will both enable the built-in MapLibre
	 * icon button styling and center the element inside the button.
	 * @default true since most map buttons are icons. */
	let icon = $.prop($$props, 'icon', 3, true),
		center = $.prop($$props, 'center', 3, true),
		title = $.prop($$props, 'title', 3, undefined),
		classNames = $.prop($$props, 'class', 3, undefined);

	var button = root();
	var div = $.child(button);
	let classes;
	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.reset(button);

	$.template_effect(() => {
		$.set_attribute(button, 'title', title());
		classes = $.set_class(div, 1, $.clsx(classNames()), 'svelte-1tv6if0', classes, { 'maplibregl-ctrl-icon': icon(), 'ctrl-btn-center': center() });
	});

	$.delegated('click', button, function (...$$args) {
		$$props.onclick?.apply(this, $$args);
	});

	$.append($$anchor, button);
}

$.delegate(['click']);