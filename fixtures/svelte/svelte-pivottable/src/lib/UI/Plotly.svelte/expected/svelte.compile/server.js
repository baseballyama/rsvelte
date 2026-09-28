import * as $ from 'svelte/internal/server';

let Plotly = void 0;

export function initPlotly(module) {
	Plotly = module;
}

export default function Plotly_1($$renderer, $$props) {
	// export const onUpdate = () => {}; // TODO: connect to plotly events
	let { data, layout, config, onUpdate } = $$props;

	function create(node) {
		if (Plotly) {
			Plotly.newPlot(node, data, layout, config);

			return () => Plotly.purge(node);
		}
	}

	if (Plotly) {
		$$renderer.push(`<!--[0--><div></div>`);
	} else {
		$$renderer.push(`<!--[-1-->Add commentMore actions <p>Error! Plotly.js not initialized.</p>`);
	}

	$$renderer.push(`<!--]-->`);
}