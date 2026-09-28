import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor) {
	const $value1 = () => $.store_get(value1, '$value1', $$stores);
	const $value2 = () => $.store_get(value2, '$value2', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	function store() {
		return {
			subscribe: (cb) => {
				setTimeout(
					() => {
						cb(42);
					},
					100
				);

				return () => {};
			}
		};
	}

	const value1 = store();
	const value2 = store();
	const derivedValue = $.derived($value1);

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${$value2() ?? ''} / ${$.get(derivedValue) ?? ''}`));
	$.append($$anchor, text);
	$$cleanup();
}