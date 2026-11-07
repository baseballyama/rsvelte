import * as $ from 'svelte/internal/server';
import { tweened } from 'svelte/motion';
import { cubicOut } from 'svelte/easing';

export default function Tweened_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const progress = tweened(0, { duration: 400, easing: cubicOut });

		$$renderer.push(`<progress${$.attr('value', $.store_get($$store_subs ??= {}, '$progress', progress))} class="svelte-1jmmb80"></progress> <button>0%</button> <button>25%</button> <button>50%</button> <button>75%</button> <button>100%</button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}