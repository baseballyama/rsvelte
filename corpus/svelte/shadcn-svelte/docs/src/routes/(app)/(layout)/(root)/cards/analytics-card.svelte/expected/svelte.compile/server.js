import * as $ from 'svelte/internal/server';
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "$lib/registry/ui/card/index.js";

export default function Analytics_card($$renderer) {
	const areaPath = "M0 52L18 40L36 46L54 70L72 50L100 49V86H0Z";
	const strokePath = "M0 52L18 40L36 46L54 70L72 50L100 49";

	Card($$renderer, {
		class: 'mx-auto w-full max-w-sm data-[size=sm]:pb-0',
		size: 'sm',
		children: ($$renderer) => {
			CardHeader($$renderer, {
				children: ($$renderer) => {
					CardTitle($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Analytics`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);

					CardDescription($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->418.2K Visitors `);

							Badge($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->+10%`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);

					CardAction($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								variant: 'outline',
								size: 'sm',
								children: ($$renderer) => {
									$$renderer.push(`<!---->View Analytics`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----><svg viewBox="0 0 100 86" preserveAspectRatio="none" class="aspect-[1/0.35] w-full text-chart-1" role="img" aria-label="Visitor trend"><path${$.attr('d', areaPath)} fill="currentColor" opacity="0.28"></path><path${$.attr('d', strokePath)} fill="none" stroke="currentColor" stroke-width="1.5" vector-effect="non-scaling-stroke"></path></svg>`);
		},
		$$slots: { default: true }
	});
}