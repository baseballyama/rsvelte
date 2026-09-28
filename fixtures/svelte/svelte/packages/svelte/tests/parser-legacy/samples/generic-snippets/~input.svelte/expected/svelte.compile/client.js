import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const generic = ($$anchor, val = $.noop) => {
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, val()));
	$.append($$anchor, text);
};

const complex_generic = ($$anchor, val = $.noop) => {
	$.next();

	var text_1 = $.text();

	$.template_effect(() => $.set_text(text_1, val()));
	$.append($$anchor, text_1);
};

export default function Input($$anchor) {}