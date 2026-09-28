import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LoadingPlaceholder } from '@layerstack/docs/components';
import OpenWithButton from '$lib/components/OpenWithButton.svelte';

var root = $.from_html(`<h1 class="text-3xl font-bold mb-2"> </h1> <div class="mb-4"><!></div> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1, true);
	var div = $.sibling(h1, 2);
	var node = $.child(div);

	OpenWithButton(node, {});
	$.reset(div);

	var node_1 = $.sibling(div, 2);

	{
		const pending = ($$anchor) => {
			LoadingPlaceholder($$anchor, {});
		};

		$.boundary(node_1, { pending }, ($$anchor) => {
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			$.snippet(node_2, () => $$props.children);
			$.append($$anchor, fragment_2);
		});
	}

	$.template_effect(() => $.set_text(text, $$props.data.metadata.title));
	$.append($$anchor, fragment);
	$.pop();
}