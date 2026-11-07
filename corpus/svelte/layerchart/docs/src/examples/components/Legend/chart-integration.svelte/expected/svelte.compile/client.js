import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Legend } from 'layerchart';
import { scaleOrdinal } from 'd3-scale';

export default function Chart_integration($$anchor, $$props) {
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
			height: 40,
			children: ($$anchor, $$slotProps) => {
				Legend($$anchor, { title: 'I am Legend' });
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}