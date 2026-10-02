import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

let Plotly = $.state(void 0);

export function initPlotly(module) {
	$.set(Plotly, module, true);
}

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`Add commentMore actions <p>Error! Plotly.js not initialized.</p>`, 1);

export default function Plotly_1($$anchor, $$props) {
	// export const onUpdate = () => {}; // TODO: connect to plotly events
	function create(node) {
		if ($.get(Plotly)) {
			$.get(Plotly).newPlot(node, $$props.data, $$props.layout, $$props.config);

			return () => $.get(Plotly).purge(node);
		}
	}

	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.attach(div, () => create);
			$.append($$anchor, div);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_1();

			$.next();
			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(Plotly)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
}