import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext, setContext } from 'svelte';

export default function Main($$anchor, $$props) {
	$.push($$props, true);
	setContext('val', 'hello world');

	const get_val = () => {
		return getContext('val');
	};

	$.next();

	var text = $.text();

	$.template_effect(($0) => $.set_text(text, $0), [() => get_val()]);
	$.append($$anchor, text);
	$.pop();
}