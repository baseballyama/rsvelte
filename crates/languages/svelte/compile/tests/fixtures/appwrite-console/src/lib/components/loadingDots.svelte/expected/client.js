import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><div class="dot svelte-13j78r0"></div> <div class="dot svelte-13j78r0"></div> <div class="dot svelte-13j78r0"></div></div>`);

export default function LoadingDots($$anchor, $$props) {
	$.push($$props, true);

	let className = '';

	var $$exports = {
		get class() {
			return className;
		},

		set class($$value) {
			className = $$value;
		}
	};

	var div = root();

	$.template_effect(() => $.set_class(div, 1, `loading-dots ${className ?? ''}`, 'svelte-13j78r0'));
	$.append($$anchor, div);

	return $.pop($$exports);
}