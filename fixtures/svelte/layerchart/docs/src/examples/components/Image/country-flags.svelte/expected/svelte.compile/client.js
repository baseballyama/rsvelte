import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Image, Axis, Layer } from 'layerchart';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Country_flags($$anchor) {
	const data = [
		{
			country: 'United States',
			code: 'us',
			gdpPerCapita: 76330,
			lifeExpectancy: 77.2
		},

		{
			country: 'Germany',
			code: 'de',
			gdpPerCapita: 51204,
			lifeExpectancy: 80.6
		},

		{
			country: 'Japan',
			code: 'jp',
			gdpPerCapita: 33815,
			lifeExpectancy: 84.8
		},

		{
			country: 'Brazil',
			code: 'br',
			gdpPerCapita: 8918,
			lifeExpectancy: 72.8
		},

		{
			country: 'India',
			code: 'in',
			gdpPerCapita: 2389,
			lifeExpectancy: 67.2
		},

		{
			country: 'Nigeria',
			code: 'ng',
			gdpPerCapita: 2066,
			lifeExpectancy: 52.7
		},

		{
			country: 'Australia',
			code: 'au',
			gdpPerCapita: 64491,
			lifeExpectancy: 83.3
		},

		{
			country: 'South Korea',
			code: 'kr',
			gdpPerCapita: 32255,
			lifeExpectancy: 83.7
		},

		{
			country: 'Mexico',
			code: 'mx',
			gdpPerCapita: 10046,
			lifeExpectancy: 70.2
		},

		{
			country: 'France',
			code: 'fr',
			gdpPerCapita: 44408,
			lifeExpectancy: 82.5
		}
	];

	Chart($$anchor, {
		get data() {
			return data;
		},
		x: 'gdpPerCapita',
		y: 'lifeExpectancy',
		yNice: true,
		padding: { top: 20, bottom: 30, left: 36, right: 20 },
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Axis(node, {
						placement: 'bottom',
						label: 'GDP per capita (USD)',
						rule: true
					});

					var node_1 = $.sibling(node, 2);

					Axis(node_1, {
						placement: 'left',
						label: 'Life expectancy (years)',
						rule: true
					});

					var node_2 = $.sibling(node_1, 2);

					Image(node_2, {
						href: (d) => `https://flagcdn.com/w80/${d.code}.png`,
						x: 'gdpPerCapita',
						y: 'lifeExpectancy',
						r: 14,
						preserveAspectRatio: 'xMidYMid slice'
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}