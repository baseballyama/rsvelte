import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { getAllAppModules } from './_appModules';

export default function _Loader($$anchor, $$props) {
	$.push($$props, true);

	const allAppModules = getAllAppModules();
	let mounted = $.state(false);
	const AppModule = Object.entries(allAppModules).find(([key]) => key === '../../../examples/' + $$props.slug + '/App.svelte')?.[1];

	onMount(() => {
		$.set(mounted, true);
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.await(node_1, AppModule, null, ($$anchor, Mod) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				$.component(node_2, () => $.get(Mod).default, ($$anchor, Mod_default) => {
					Mod_default($$anchor, {});
				});

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(mounted) && AppModule) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}