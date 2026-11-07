import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Group from './Group/Group.svelte';
import { setFacetPanel } from '$lib/contexts/facet.js';

export default function FacetPanel($$anchor, $$props) {
	$.push($$props, true);

	// Marks read this (via `getMarkData`) to draw this panel's rows, and `Axis` to tell whether it's
	// on the grid's outer edge.  Set once at init against a getter, since context can't be assigned
	// later but `facet` changes as the data does.
	setFacetPanel(() => $$props.facet);

	Group($$anchor, {
		get x() {
			return $$props.facet.x;
		},

		get y() {
			return $$props.facet.y;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.snippet(node, () => $$props.children ?? $.noop, () => ({ facet: $$props.facet }));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}