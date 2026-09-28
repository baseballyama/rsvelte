import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { untrack } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const cache = new SvelteMap();

	function get_async(id) {
		const model = cache.get(id);

		if (!model) {
			const promise = new Promise(async () => {
				await Promise.resolve();
				cache.set(id, id.toString());
			}).then(() => cache.get(id));

			untrack(() => {
				cache.set(id, promise);
			});

			return promise;
		}

		return model;
	}

	const value = $.derived(() => get_async(1));
	const value2 = $.derived(() => get_async(1));

	// both values are read before the set 
	$.get(value);

	$.get(value2);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var text = $.text('Loading');

			$.append($$anchor, text);
		};

		var alternate = ($$anchor) => {
			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, $.get(value)));
			$.append($$anchor, text_1);
		};

		$.if(node, ($$render) => {
			if ($.get(value) instanceof Promise) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}