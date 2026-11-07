import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onDestroy } from 'svelte';
import { getId, getMapContext, updatedSourceContext } from './context.svelte.js';
import { addSource, removeSource } from './source.js';
import { flush } from '$lib/flush.js';

export default function ImageSource($$anchor, $$props) {
	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => getId('image'));

	const $$d = $.derived(getMapContext),
		map = $.derived(() => $.get($$d).map),
		loaded = $.derived(() => $.get($$d).loaded);

	const { source } = updatedSourceContext();
	let sourceObj = $.state(void 0);
	let first = $.state(true);

	$.user_effect(() => {
		if ($.get(map) && $.get(loaded) && source.value !== id()) {
			source.value = id();

			addSource(
				$.get(map),
				source.value,
				flush({
					type: 'image',
					url: $$props.url,
					coordinates: $$props.coordinates
				}),
				(sourceId) => $.get(map) && sourceId === source.value,
				() => {
					if (!source.value) {
						return;
					}

					$.set(sourceObj, $.get(map).getSource(source.value), true);
					$.set(first, true);
				}
			);
		}
	});

	// Don't set coordinates again after we've just created it.
	$.user_effect(() => {
		if ($.get(sourceObj)) {
			if ($.get(first)) {
				$.set(first, false);
			} else {
				$.get(sourceObj).setCoordinates($$props.coordinates);
			}
		}
	});

	function handleStyleLoad() {
		if (!$.get(map)) return;

		// When the style changes the current sources are nuked and recreated. Because of this the
		// source object no longer references the current source on the map so we update it here.
		$.set(sourceObj, $.get(map).getSource(id()), true);
	}

	$.user_effect(() => {
		$.get(map)?.on('style.load', handleStyleLoad);
	});

	onDestroy(() => {
		if (source.value && $.get(map)) {
			removeSource($.get(map), source.value, $.get(sourceObj));
			source.value = undefined;
			$.set(sourceObj, undefined);
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.key(node_1, () => source.value, ($$anchor) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				$.snippet(node_2, () => $$props.children ?? $.noop);
				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (source.value) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}