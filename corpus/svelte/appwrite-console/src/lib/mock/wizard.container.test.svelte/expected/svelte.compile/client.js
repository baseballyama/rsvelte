import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { wizard } from '$lib/stores/wizard';

export default function Wizard_container_test($$anchor, $$props) {
	$.push($$props, true);

	const $wizard = () => $.store_get(wizard, '$wizard', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => $wizard().component, ($$anchor, $$component) => {
				$$component($$anchor, {});
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($wizard().show && $wizard().component) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}