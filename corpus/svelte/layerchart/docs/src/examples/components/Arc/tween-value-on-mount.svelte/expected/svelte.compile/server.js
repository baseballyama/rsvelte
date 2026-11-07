import * as $ from 'svelte/internal/server';
import { cubicInOut } from 'svelte/easing';
import { Arc, Chart, Layer } from 'layerchart';
import ShowControl from '$lib/components/controls/fields/ShowField.svelte';

export default function Tween_value_on_mount($$renderer, $$props) {
	let show = void 0;

	const data = {
		arcs: [
			{
				initialValue: 0,
				value: 40,
				fillClass: 'fill-red-500',
				trackClass: 'fill-red-500/10'
			},

			{
				initialValue: 0,
				value: 60,
				fillClass: 'fill-lime-400',
				trackClass: 'fill-lime-400/10'
			},

			{
				initialValue: 0,
				value: 80,
				fillClass: 'fill-cyan-400',
				trackClass: 'fill-cyan-500/10'
			}
		]
	};

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		ShowControl($$renderer, {
			label: 'Show Arcs',
			get show() {
				return show;
			},

			set show($$value) {
				show = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Chart($$renderer, {
			height: 200,
			padding: 20,
			children: ($$renderer) => {
				Layer($$renderer, {
					center: true,
					children: ($$renderer) => {
						if (show) {
							$$renderer.push('<!--[0-->');

							Arc($$renderer, {
								initialValue: 0,
								value: 40,
								innerRadius: -20,
								cornerRadius: 10,
								class: 'fill-red-500',
								track: { class: 'fill-red-500/10' },
								motion: { type: 'tween', duration: 1000, easing: cubicInOut }
							});

							$$renderer.push(`<!----> `);

							Arc($$renderer, {
								initialValue: 0,
								value: 60,
								outerRadius: -25,
								innerRadius: -20,
								cornerRadius: 10,
								class: 'fill-lime-400',
								track: { class: 'fill-lime-400/10' },
								motion: { type: 'tween', duration: 1000, easing: cubicInOut }
							});

							$$renderer.push(`<!----> `);

							Arc($$renderer, {
								initialValue: 0,
								value: 80,
								outerRadius: -50,
								innerRadius: -20,
								cornerRadius: 10,
								class: 'fill-cyan-400',
								track: { class: 'fill-cyan-500/10' },
								motion: { type: 'tween', duration: 1000, easing: cubicInOut }
							});

							$$renderer.push(`<!---->`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
	$.bind_props($$props, { data });
}