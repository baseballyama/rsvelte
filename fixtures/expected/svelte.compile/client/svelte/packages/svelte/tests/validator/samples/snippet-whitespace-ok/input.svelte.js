import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const ok = ($$anchor) => {
	$.next();

	var text = $.text('asd');

	$.append($$anchor, text);
};

export default function Input($$anchor) {}