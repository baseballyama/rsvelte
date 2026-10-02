import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Arc, PieChart } from 'layerchart';
import { fruitColors } from '$lib/utils/fruits';
import { longData } from '$lib/utils/data';

export default function Offset_slice($$anchor, $$props) {
	$.push($$props, true);

	const data = longData.filter((d) => d.year === 2019);
	var $$exports = { data };

	{
		const arc = ($$anchor, $$arg0) => {
			let index = () => ($$arg0?.()).index;
			let props = () => ($$arg0?.()).props;

			{
				let $0 = $.derived(() => index() === 1 ? 16 : undefined);

				Arc($$anchor, $.spread_props(props, {
					get offset() {
						return $.get($0);
					}
				}));
			}
		};

		PieChart($$anchor, {
			get data() {
				return data;
			},
			key: 'fruit',
			value: 'value',
			get cRange() {
				return fruitColors;
			},
			height: 300,
			arc,
			$$slots: { arc: true }
		});
	}

	return $.pop($$exports);
}