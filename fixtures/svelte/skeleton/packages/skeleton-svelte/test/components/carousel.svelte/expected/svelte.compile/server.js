import * as $ from 'svelte/internal/server';
import { Carousel } from '../../src/index.js';

export default function Carousel_1($$renderer) {
	Carousel($$renderer, {
		slideCount: 3,
		'data-testid': 'root',
		children: ($$renderer) => {
			if (Carousel.Control) {
				$$renderer.push('<!--[-->');

				Carousel.Control($$renderer, {
					'data-testid': 'control',
					children: ($$renderer) => {
						if (Carousel.PrevTrigger) {
							$$renderer.push('<!--[-->');
							Carousel.PrevTrigger($$renderer, { 'data-testid': 'prev-trigger' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Carousel.NextTrigger) {
							$$renderer.push('<!--[-->');
							Carousel.NextTrigger($$renderer, { 'data-testid': 'next-trigger' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Carousel.AutoplayTrigger) {
							$$renderer.push('<!--[-->');
							Carousel.AutoplayTrigger($$renderer, { 'data-testid': 'autoplay-trigger' });
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

			if (Carousel.ItemGroup) {
				$$renderer.push('<!--[-->');

				Carousel.ItemGroup($$renderer, {
					'data-testid': 'item-group',
					children: ($$renderer) => {
						if (Carousel.Item) {
							$$renderer.push('<!--[-->');
							Carousel.Item($$renderer, { index: 0, 'data-testid': 'item' });
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

			if (Carousel.IndicatorGroup) {
				$$renderer.push('<!--[-->');

				Carousel.IndicatorGroup($$renderer, {
					'data-testid': 'indicator-group',
					children: ($$renderer) => {
						if (Carousel.Indicator) {
							$$renderer.push('<!--[-->');
							Carousel.Indicator($$renderer, { index: 0, 'data-testid': 'indicator' });
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

			if (Carousel.ProgressText) {
				$$renderer.push('<!--[-->');
				Carousel.ProgressText($$renderer, { 'data-testid': 'progress-text' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}