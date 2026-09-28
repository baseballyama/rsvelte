import 'svelte/internal/disclose-version';
import { getPenguins } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Chart, Circle } from 'layerchart';
import { RangeField } from 'svelte-ux';

const penguins = await getPenguins();
var root = $.from_html(`<div class="grid grid-cols-2 gap-4 mb-4"><!> <!></div> <!>`, 1);

export default function Facet_spacing($$anchor, $$props) {
	$.push($$props, true);

	const data = penguins.filter((d) => d.flipper_length_mm !== 'NA' && d.body_mass_g !== 'NA');
	let paddingX = $.state(0.1);
	let paddingY = $.state(0.1);
	var $$exports = { data };
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	RangeField(node, {
		label: 'Padding X',
		min: 0,
		max: 0.5,
		step: 0.05,
		get value() {
			return $.get(paddingX);
		},

		set value($$value) {
			$.set(paddingX, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	RangeField(node_1, {
		label: 'Padding Y',
		min: 0,
		max: 0.5,
		step: 0.05,
		get value() {
			return $.get(paddingY);
		},

		set value($$value) {
			$.set(paddingY, $$value, true);
		}
	});

	$.reset(div);

	var node_2 = $.sibling(div, 2);

	{
		const marks = ($$anchor) => {
			Circle($$anchor, {
				cx: 'flipper_length_mm',
				cy: 'body_mass_g',
				r: 2.5,
				fill: 'var(--color-primary)',
				fillOpacity: 0.6
			});
		};

		let $0 = $.derived(() => ({ paddingX: $.get(paddingX), paddingY: $.get(paddingY) }));

		Chart(node_2, {
			get data() {
				return data;
			},
			x: 'flipper_length_mm',
			y: 'body_mass_g',
			fx: 'species',
			fy: 'sex',
			get facet() {
				return $.get($0);
			},
			xNice: true,
			yNice: true,
			padding: { left: 52, bottom: 32, top: 24, right: 60 },
			height: 480,
			marks,
			$$slots: { marks: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}