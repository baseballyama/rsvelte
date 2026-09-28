import * as $ from 'svelte/internal/server';
import { ChartGroupState } from '$lib/states/group.svelte.js';
import { setChartGroup } from '$lib/contexts/group.js';

export default function ChartGroup($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			pointer,
			brush,
			domain,
			series,
			state: stateProp = void 0,
			children
		} = $$props;

		// Constructed once — descendant charts hold a reference for the lifetime of the group.  Options
		// are read through getters so changing them stays reactive without re-creating the group.
		const group = new ChartGroupState({
			get pointer() {
				return pointer;
			},

			get brush() {
				return brush;
			},

			get domain() {
				return domain;
			},

			get series() {
				return series;
			}
		});

		stateProp = group;
		setChartGroup(group);
		children?.($$renderer, { group });
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { state: stateProp });
	});
}