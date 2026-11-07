import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	const id = $.props_id();

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${id} ${$$props.props ?? ''}`));
	$.append($$anchor, text);
}