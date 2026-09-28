import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	let klass = '';

	var $$exports = {
		get class() {
			return klass;
		},

		set class($$value) {
			klass = $$value;
		}
	};

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, klass));
	$.append($$anchor, text);

	return $.pop($$exports);
}