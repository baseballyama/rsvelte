import * as $ from 'svelte/internal/server';
import Group from './Group/Group.svelte';
import { setFacetPanel } from '$lib/contexts/facet.js';

export default function FacetPanel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { facet, children } = $$props;

		// Marks read this (via `getMarkData`) to draw this panel's rows, and `Axis` to tell whether it's
		// on the grid's outer edge.  Set once at init against a getter, since context can't be assigned
		// later but `facet` changes as the data does.
		setFacetPanel(() => facet);

		Group($$renderer, {
			x: facet.x,
			y: facet.y,
			children: ($$renderer) => {
				children?.($$renderer, { facet });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}