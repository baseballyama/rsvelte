import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	const $props = () => $.store_get(props, '$props', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let props = {};
	let id = $props().id();

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${id ?? ''} ${props ?? ''}`));
	$.append($$anchor, text);
	$$cleanup();
}