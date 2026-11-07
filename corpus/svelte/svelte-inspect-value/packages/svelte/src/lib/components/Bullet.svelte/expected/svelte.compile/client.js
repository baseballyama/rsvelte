import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { flash } from '../attachments/update-flash.svelte.js';
import { useOptions } from '../options.svelte.js';

var root = $.from_html(`<div class="bullet svelte-utdyfi" role="presentation"><div></div></div>`);

export default function Bullet($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 3, undefined);
	let flashing = $.state(false);
	let options = useOptions();

	const $$d = $.derived(() => options.value),
		flashOnUpdate = $.derived(() => $.get($$d).flashOnUpdate),
		noanimate = $.derived(() => $.get($$d).noanimate);

	function flashBullet() {
		if ($.get(flashing)) return;

		$.set(flashing, true);

		window.setTimeout(
			() => {
				$.set(flashing, false);
			},
			options.flashDuration
		);
	}

	var $$exports = { flashBullet };
	var div = root();
	var div_1 = $.child(div);

	$.set_attribute(div_1, 'aria-hidden', true);

	let classes;

	$.attach(div_1, () => flash(() => value(), flashBullet, $.get(flashOnUpdate)));
	$.reset(div);
	$.template_effect(() => classes = $.set_class(div_1, 1, 'dash svelte-utdyfi', null, classes, { flashing: $.get(flashing), noanimate: $.get(noanimate) }));
	$.append($$anchor, div);

	return $.pop($$exports);
}