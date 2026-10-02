import * as $ from 'svelte/internal/server';
import { Steps } from '../../src/index.js';

export default function Steps_1($$renderer) {
	Steps($$renderer, {
		'data-testid': 'root',
		children: ($$renderer) => {
			if (Steps.List) {
				$$renderer.push('<!--[-->');

				Steps.List($$renderer, {
					'data-testid': 'list',
					children: ($$renderer) => {
						if (Steps.Item) {
							$$renderer.push('<!--[-->');

							Steps.Item($$renderer, {
								index: 0,
								'data-testid': 'item',
								children: ($$renderer) => {
									if (Steps.Trigger) {
										$$renderer.push('<!--[-->');

										Steps.Trigger($$renderer, {
											'data-testid': 'trigger',
											children: ($$renderer) => {
												if (Steps.Indicator) {
													$$renderer.push('<!--[-->');
													Steps.Indicator($$renderer, { 'data-testid': 'indicator' });
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

									if (Steps.Separator) {
										$$renderer.push('<!--[-->');
										Steps.Separator($$renderer, { 'data-testid': 'separator' });
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

			$$renderer.push(` `);

			if (Steps.Content) {
				$$renderer.push('<!--[-->');
				Steps.Content($$renderer, { index: 0, 'data-testid': 'content' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Steps.PrevTrigger) {
				$$renderer.push('<!--[-->');
				Steps.PrevTrigger($$renderer, { 'data-testid': 'prev-trigger' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Steps.NextTrigger) {
				$$renderer.push('<!--[-->');
				Steps.NextTrigger($$renderer, { 'data-testid': 'next-trigger' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}