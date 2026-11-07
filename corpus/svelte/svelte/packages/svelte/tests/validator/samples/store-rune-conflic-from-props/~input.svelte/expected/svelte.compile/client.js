import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	const $state = () => $.store_get($$props.state, '$state', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let x = $state()();

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, $state()));
	$.append($$anchor, text);
	$.pop();
	$$cleanup();
}