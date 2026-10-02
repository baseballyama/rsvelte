import * as $ from 'svelte/internal/server';
import { Tooltip } from "bits-ui";

export default function Tooltip_safe_polygon_intermediate_target_test($$renderer) {
	$$renderer.push(`<main data-testid="main" style="position: relative; width: 360px; height: 320px; padding: 24px;">`);

	if (Tooltip.Provider) {
		$$renderer.push('<!--[-->');

		Tooltip.Provider($$renderer, {
			delayDuration: 0,
			children: ($$renderer) => {
				if (Tooltip.Root) {
					$$renderer.push('<!--[-->');

					Tooltip.Root($$renderer, {
						children: ($$renderer) => {
							if (Tooltip.Trigger) {
								$$renderer.push('<!--[-->');

								Tooltip.Trigger($$renderer, {
									'data-testid': 'trigger',
									style: 'position: absolute; left: 120px; top: 24px;',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Trigger`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Tooltip.Portal) {
								$$renderer.push('<!--[-->');

								Tooltip.Portal($$renderer, {
									children: ($$renderer) => {
										if (Tooltip.Content) {
											$$renderer.push('<!--[-->');

											Tooltip.Content($$renderer, {
												'data-testid': 'content',
												side: 'bottom',
												sideOffset: 72,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Content`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` <button data-testid="rail" style="position: absolute; left: 110px; top: 74px; width: 120px; height: 36px;">Rail</button></main>`);
}