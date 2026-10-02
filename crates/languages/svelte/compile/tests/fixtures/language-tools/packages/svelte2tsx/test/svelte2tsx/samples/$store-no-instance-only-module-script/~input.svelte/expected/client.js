import 'svelte/internal/disclose-version';
import { store1 } from './somewhere';
import * as $ from 'svelte/internal/client';

const store2 = '';

export default function Input($$anchor) {
	const $store1 = () => $.store_get(store1, '$store1', $$stores);
	const $store2 = () => $.store_get(store2, '$store2', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${$store1() ?? ''}
${$store2() ?? ''}`));

	$.append($$anchor, text);
	$$cleanup();
}