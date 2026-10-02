import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ChartGroupState } from '$lib/states/group.svelte.js';
import { setChartGroup } from '$lib/contexts/group.js';

export default function ChartGroup($$anchor, $$props) {
	$.push($$props, true);

	let stateProp = $.prop($$props, 'state', 15);

	// Constructed once — descendant charts hold a reference for the lifetime of the group.  Options
	// are read through getters so changing them stays reactive without re-creating the group.
	const group = new ChartGroupState({
		get pointer() {
			return $$props.pointer;
		},

		get brush() {
			return $$props.brush;
		},

		get domain() {
			return $$props.domain;
		},

		get series() {
			return $$props.series;
		}
	});

	stateProp(group);
	setChartGroup(group);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop, () => ({ group }));
	$.append($$anchor, fragment);
	$.pop();
}