import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { state } from './store';

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	const $state = () => $.store_get(state, '$state', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const x = $state()();

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, x));
	$.append($$anchor, text);
	$.pop();
	$$cleanup();
}