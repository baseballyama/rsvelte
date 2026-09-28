import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '$lib';
import { mesh, feature } from 'topojson-client';
import { geoIdentity, geoPath } from 'd3-geo';
import Bubble from './Bubble.svelte';
import us from 'us-atlas/states-albers-10m.json';

var root = $.from_svg(`<path class="svelte-jgosct"></path>`);
var root_1 = $.from_html(`<div class="svelte-jgosct"><svg class="svelte-jgosct"><!></svg> <!></div>`);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	let width = $.state(0);
	const projection = $.derived(() => geoIdentity().scale($.get(width) / 975));
	const path = $.derived(() => geoPath($.get(projection)));

	const centroids = $.derived(() => us
		? feature(us, us.objects.states).features.map($.get(path).centroid).sort(([a], [b]) => b - a)
		: []);

	var div = root_1();
	var svg = $.child(div);
	var node = $.child(svg);

	{
		var consequent = ($$anchor) => {
			var path_1 = root();

			$.template_effect(($0) => $.set_attribute(path_1, 'd', $0), [() => $.get(path)(mesh(us, us.objects.states))]);
			$.append($$anchor, path_1);
		};

		$.if(node, ($$render) => {
			if (us) $$render(consequent);
		});
	}

	$.reset(svg);

	var node_1 = $.sibling(svg, 2);

	Canvas(node_1, {
		onresize: (e) => $.set(width, e.width, true),
		style: 'position: absolute',
		autoplay: true,
		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_2 = $.first_child(fragment);

			$.each(node_2, 17, () => $.get(centroids), $.index, ($$anchor, $$item, i) => {
				var $$array = $.derived(() => $.to_array($.get($$item), 2));
				let x = () => $.get($$array)[0];
				let y = () => $.get($$array)[1];

				Bubble($$anchor, {
					get x() {
						return x();
					},

					get y() {
						return y();
					},
					i
				});
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}