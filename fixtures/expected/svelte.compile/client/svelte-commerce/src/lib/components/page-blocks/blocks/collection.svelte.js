import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
import { getCollectionState } from '$lib/core/stores/collection.svelte.js';

var root = $.from_html(`<div class="flex items-center justify-center"><img class="h-full object-contain" alt=""/></div>`);

export default function Collection($$anchor, $$props) {
	$.push($$props, true);

	const collectionState = getCollectionState();
	const collection = $.derived(() => collectionState.getOneById($$props.block.entityId));

	const $$d = $.derived(() => $$props.block.metadata.aspectRatio?.split(':') || ['1', '1']),
		$$array = $.derived(() => $.to_array($.get($$d), 2)),
		aspectWidth = $.derived(() => $.get($$array)[0]),
		aspectHeight = $.derived(() => $.get($$array)[1]);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			Skeleton($$anchor, {});
		};

		var consequent_1 = ($$anchor) => {
			var div = root();
			var img = $.only_child(div);

			$.template_effect(() => {
				$.set_style(div, `aspect-ratio: ${$.get(aspectWidth) ?? ''}/${$.get(aspectHeight) ?? ''}; ${$$props.block.metadata.maxWidth
					? `max-width: ${$$props.block.metadata.maxWidth}px;`
					: ``}`);

				$.set_attribute(img, 'src', $.get(collection).img);
			});

			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (collectionState.loading) $$render(consequent); else if ($.get(collection)) $$render(consequent_1, 1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}