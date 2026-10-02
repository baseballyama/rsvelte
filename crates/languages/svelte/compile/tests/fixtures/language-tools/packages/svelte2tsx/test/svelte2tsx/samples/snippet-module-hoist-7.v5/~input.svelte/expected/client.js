import 'svelte/internal/disclose-version';
import { store2 } from './foo';
import * as $ from 'svelte/internal/client';
import { store } from './foo';

export default function Input($$anchor) {
	const $store = () => $.store_get(store, '$store', $$stores);
	const $store2 = () => $.store_get(store2, '$store2', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const _foo = ($$anchor) => {
		$.next();

		var text = $.text();

		$.template_effect(() => $.set_text(text, $store()));
		$.append($$anchor, text);
	};

	const _foo2 = ($$anchor) => {
		$.next();

		var text_1 = $.text();

		$.template_effect(() => $.set_text(text_1, $store2()));
		$.append($$anchor, text_1);
	};

	$$cleanup();
}