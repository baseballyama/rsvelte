import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { motion } from '$lib/Stores';
import { onMount } from 'svelte';
import { fade } from 'svelte/transition';

var root = $.from_html(`<div class="svelte-1e75gt5"><svg viewBox="0 0 50 50" class="svelte-1e75gt5"><circle cx="25" cy="25" r="20" class="svelte-1e75gt5"></circle></svg></div>`);

export default function Loader($$anchor, $$props) {
	$.push($$props, true);

	const $motion = () => $.store_get(motion, '$motion', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let mounted = false;

	onMount(() => {
		mounted = true;
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.transition(1, div, () => fade, () => ({ duration: $motion(), delay: $motion() }));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (mounted) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}