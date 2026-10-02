import * as $ from 'svelte/internal/server';
import { Project, Sheet, Studio } from '../index.js';

export default function Theatre($$renderer, $$props) {
	let { studio = {}, config = undefined, children } = $$props;

	Studio($$renderer, $.spread_props([
		studio,
		{
			children: ($$renderer) => {
				Project($$renderer, {
					config,
					children: ($$renderer) => {
						Sheet($$renderer, {
							children: ($$renderer) => {
								children?.($$renderer);
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		}
	]));
}