import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Legend } from 'layerchart';
import { scaleOrdinal } from 'd3-scale';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Chart_placement($$anchor, $$props) {
	$.push($$props, true);

	{
		let $0 = $.derived(scaleOrdinal);

		Chart($$anchor, {
			data: [{ name: 'One' }, { name: 'Two' }, { name: 'Three' }],
			c: 'name',
			get cScale() {
				return $.get($0);
			},

			cRange: [
				'var(--color-success)',
				'var(--color-warning)',
				'var(--color-danger)'
			],
			height: 200,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node = $.first_child(fragment_1);

				Legend(node, {
					title: 'Top-Left',
					placement: 'top-left',
					variant: 'swatches'
				});

				var node_1 = $.sibling(node, 2);

				Legend(node_1, { title: 'Top', placement: 'top', variant: 'swatches' });

				var node_2 = $.sibling(node_1, 2);

				Legend(node_2, {
					title: 'Top-Right',
					placement: 'top-right',
					variant: 'swatches'
				});

				var node_3 = $.sibling(node_2, 2);

				Legend(node_3, { title: 'Left', placement: 'left', variant: 'swatches' });

				var node_4 = $.sibling(node_3, 2);

				Legend(node_4, { title: 'Center', placement: 'center', variant: 'swatches' });

				var node_5 = $.sibling(node_4, 2);

				Legend(node_5, { title: 'Right', placement: 'right', variant: 'swatches' });

				var node_6 = $.sibling(node_5, 2);

				Legend(node_6, {
					title: 'Bottom-Left',
					placement: 'bottom-left',
					variant: 'swatches'
				});

				var node_7 = $.sibling(node_6, 2);

				Legend(node_7, { title: 'Bottom', placement: 'bottom', variant: 'swatches' });

				var node_8 = $.sibling(node_7, 2);

				Legend(node_8, {
					title: 'Bottom-Right',
					placement: 'bottom-right',
					variant: 'swatches'
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}