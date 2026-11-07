import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LoadingPlaceholder } from '@layerstack/docs/components';
import OpenWithButton from '$lib/components/OpenWithButton.svelte';
import { examples } from '@layerstack/docs/context';

var root = $.from_html(`<div class="mb-4"><!></div>`);
var root_1 = $.from_html(`<h1 class="text-3xl font-bold mb-2"> </h1> <!> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	// Override examples context with guide-specific examples loaded by +layout.ts
	const examplesContext = {
		get current() {
			return $$props.data.examples ?? {};
		}
	};

	examples.set(examplesContext);

	var fragment = root_1();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1, true);
	var node = $.sibling(h1, 2);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			{
				let $0 = $.derived(() => $$props.data.metadata.title === 'LLMs');

				OpenWithButton(node_1, {
					get example() {
						return $.get($0);
					}
				});
			}

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.data.metadata.title !== 'LLMs') $$render(consequent);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		const pending = ($$anchor) => {
			LoadingPlaceholder($$anchor, {});
		};

		$.boundary(node_2, { pending }, ($$anchor) => {
			var fragment_2 = $.comment();
			var node_3 = $.first_child(fragment_2);

			$.snippet(node_3, () => $$props.children);
			$.append($$anchor, fragment_2);
		});
	}

	$.template_effect(() => $.set_text(text, $$props.data.metadata.title));
	$.append($$anchor, fragment);
	$.pop();
}