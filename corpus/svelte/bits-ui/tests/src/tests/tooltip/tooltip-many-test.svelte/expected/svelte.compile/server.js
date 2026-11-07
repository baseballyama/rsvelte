import * as $ from 'svelte/internal/server';
import { Tooltip } from "bits-ui";

export default function Tooltip_many_test($$renderer, $$props) {
	let {
		count = 50,
		delayDuration = 0,
		skipDelayDuration = 300,
		disableHoverableContent = false
	} = $$props;

	const items = Array.from({ length: count }, (_, i) => i);

	if (Tooltip.Provider) {
		$$renderer.push('<!--[-->');

		Tooltip.Provider($$renderer, {
			delayDuration,
			skipDelayDuration,
			disableHoverableContent,
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(items);

				for (let index = 0, $$length = each_array.length; index < $$length; index++) {
					let item = each_array[index];

					if (Tooltip.Root) {
						$$renderer.push('<!--[-->');

						Tooltip.Root($$renderer, {
							children: ($$renderer) => {
								if (Tooltip.Trigger) {
									$$renderer.push('<!--[-->');

									Tooltip.Trigger($$renderer, {
										'data-testid': `trigger-${item}`,
										children: ($$renderer) => {
											$$renderer.push(`<!---->trigger-${$.escape(item)}`);
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
													'data-testid': `content-${item}`,
													children: ($$renderer) => {
														$$renderer.push(`<!---->content-${$.escape(item)}`);
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
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}