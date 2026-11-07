import * as $ from 'svelte/internal/server';
import { Accordion } from "bits-ui";

export default function Accordion_test_isolated($$renderer, $$props) {
	let { triggerProps } = $$props;

	if (Accordion.Root) {
		$$renderer.push('<!--[-->');

		Accordion.Root($$renderer, {
			type: 'single',
			value: '1',
			'data-testid': 'root',
			children: ($$renderer) => {
				if (Accordion.Item) {
					$$renderer.push('<!--[-->');

					Accordion.Item($$renderer, {
						value: '1',
						'data-testid': 'item',
						children: ($$renderer) => {
							if (Accordion.Header) {
								$$renderer.push('<!--[-->');

								Accordion.Header($$renderer, {
									'data-testid': 'header',
									children: ($$renderer) => {
										if (Accordion.Trigger) {
											$$renderer.push('<!--[-->');

											Accordion.Trigger($$renderer, $.spread_props([
												{ 'data-testid': 'trigger' },
												triggerProps,
												{
													children: ($$renderer) => {
														$$renderer.push(`<!---->open`);
													},
													$$slots: { default: true }
												}
											]));

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

							$$renderer.push(` `);

							if (Accordion.Content) {
								$$renderer.push('<!--[-->');

								Accordion.Content($$renderer, {
									'data-testid': 'content',
									children: ($$renderer) => {
										$$renderer.push(`<!---->item 1`);
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