import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Image, Axis, Layer } from 'layerchart';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Sports_logos($$anchor) {
	const data = [
		{
			team: 'Kansas City Chiefs',
			wins: 15,
			pointsScored: 496,
			abbrev: 'kc'
		},

		{
			team: 'San Francisco 49ers',
			wins: 12,
			pointsScored: 457,
			abbrev: 'sf'
		},

		{
			team: 'Dallas Cowboys',
			wins: 12,
			pointsScored: 509,
			abbrev: 'dal'
		},

		{
			team: 'Baltimore Ravens',
			wins: 13,
			pointsScored: 483,
			abbrev: 'bal'
		},

		{
			team: 'Detroit Lions',
			wins: 12,
			pointsScored: 461,
			abbrev: 'det'
		},

		{
			team: 'Buffalo Bills',
			wins: 11,
			pointsScored: 451,
			abbrev: 'buf'
		},

		{
			team: 'Miami Dolphins',
			wins: 11,
			pointsScored: 496,
			abbrev: 'mia'
		},

		{
			team: 'Green Bay Packers',
			wins: 9,
			pointsScored: 383,
			abbrev: 'gb'
		},

		{
			team: 'Philadelphia Eagles',
			wins: 11,
			pointsScored: 433,
			abbrev: 'phi'
		},

		{
			team: 'Cleveland Browns',
			wins: 11,
			pointsScored: 396,
			abbrev: 'cle'
		}
	];

	Chart($$anchor, {
		get data() {
			return data;
		},
		x: 'wins',
		y: 'pointsScored',
		xDomain: [8, 16],
		yNice: true,
		padding: { top: 20, bottom: 30, left: 44, right: 20 },
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Axis(node, { placement: 'bottom', label: 'Wins', rule: true });

					var node_1 = $.sibling(node, 2);

					Axis(node_1, { placement: 'left', label: 'Points scored', rule: true });

					var node_2 = $.sibling(node_1, 2);

					Image(node_2, {
						href: (d) => `https://a.espncdn.com/i/teamlogos/nfl/500/${d.abbrev}.png`,
						x: 'wins',
						y: 'pointsScored',
						width: 32,
						height: 32
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}