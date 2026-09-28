import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Chart from '../components/Chart/Chart.svelte';
import Layer from '../components/layers/Layer.svelte';
import Axis from '../components/Axis/Axis.svelte';
import Spline from '../components/Spline/Spline.svelte';
import Highlight from '../components/Highlight/Highlight.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function ComposableLineChart($$anchor, $$props) {
	let layer = $.prop($$props, 'layer', 3, 'svg'),
		axis = $.prop($$props, 'axis', 3, false),
		highlight = $.prop($$props, 'highlight', 3, false);

	Chart($$anchor, {
		get data() {
			return $$props.data;
		},

		get x() {
			return $$props.x;
		},

		get y() {
			return $$props.y;
		},

		get width() {
			return $$props.width;
		},

		get height() {
			return $$props.height;
		},

		get series() {
			return $$props.series;
		},

		get xDomain() {
			return $$props.xDomain;
		},

		get yDomain() {
			return $$props.yDomain;
		},

		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				get type() {
					return layer();
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							var fragment_3 = root();
							var node_1 = $.first_child(fragment_3);

							Axis(node_1, { placement: 'left' });

							var node_2 = $.sibling(node_1, 2);

							Axis(node_2, { placement: 'bottom' });
							$.append($$anchor, fragment_3);
						};

						$.if(node, ($$render) => {
							if (axis()) $$render(consequent);
						});
					}

					var node_3 = $.sibling(node, 2);

					{
						var consequent_1 = ($$anchor) => {
							var fragment_4 = $.comment();
							var node_4 = $.first_child(fragment_4);

							$.each(node_4, 17, () => $$props.series, (s) => s.key, ($$anchor, s) => {
								Spline($$anchor, {
									get seriesKey() {
										return $.get(s).key;
									}
								});
							});

							$.append($$anchor, fragment_4);
						};

						var alternate = ($$anchor) => {
							Spline($$anchor, {});
						};

						$.if(node_3, ($$render) => {
							if ($$props.series) $$render(consequent_1); else $$render(alternate, -1);
						});
					}

					var node_5 = $.sibling(node_3, 2);

					{
						var consequent_2 = ($$anchor) => {
							Highlight($$anchor, {});
						};

						$.if(node_5, ($$render) => {
							if (highlight()) $$render(consequent_2);
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}