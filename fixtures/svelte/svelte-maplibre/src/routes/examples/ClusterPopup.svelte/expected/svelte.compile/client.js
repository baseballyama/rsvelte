import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getSource, getMapContext } from '$lib/context.svelte.js';

var root = $.from_html(`<div class="text-sm"> </div>`);
var root_1 = $.from_html(`<p>Most recent quakes</p> <!>`, 1);

export default function ClusterPopup($$anchor, $$props) {
	$.push($$props, true);

	const $$d = $.derived(getMapContext),
		map = $.derived(() => $.get($$d).map);

	const source = getSource();

	let innerFeaturesPromise = $.derived(async () => {
		if (!$.get(map) || !source?.value || !$$props.feature) {
			return [];
		}

		const features = await $.get(map).getSource(source.value)?.getClusterLeaves($$props.feature.properties.cluster_id, 10000, 0) ?? [];

		features.sort((a, b) => {
			return b.properties.time - a.properties.time;
		});

		return features;
	});

	// Use this instead of an await template tag to avoid flickering
	let innerFeatures = $.state($.proxy([]));

	$.user_effect(() => {
		$.get(innerFeaturesPromise).then((f) => $.set(innerFeatures, f, true));
	});

	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 2);

	$.each(node, 17, () => $.get(innerFeatures).slice(0, 10), $.index, ($$anchor, feat) => {
		var div = root();
		var text = $.only_child(div);

		$.template_effect(($0) => $.set_text(text, `${$0 ?? ''} - ${$.get(feat).properties.mag ?? ''}`), [
			() => new Date($.get(feat).properties.time).toLocaleDateString()
		]);

		$.append($$anchor, div);
	});

	$.append($$anchor, fragment);
	$.pop();
}