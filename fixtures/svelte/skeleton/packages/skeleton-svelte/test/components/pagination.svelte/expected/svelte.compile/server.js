import * as $ from 'svelte/internal/server';
import { Pagination } from '../../src/index.js';

export default function Pagination_1($$renderer) {
	Pagination($$renderer, {
		'data-testid': 'root',
		children: ($$renderer) => {
			if (Pagination.FirstTrigger) {
				$$renderer.push('<!--[-->');
				Pagination.FirstTrigger($$renderer, { 'data-testid': 'first-trigger' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Pagination.PrevTrigger) {
				$$renderer.push('<!--[-->');
				Pagination.PrevTrigger($$renderer, { 'data-testid': 'prev-trigger' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Pagination.Item) {
				$$renderer.push('<!--[-->');
				Pagination.Item($$renderer, { type: 'page', value: 0, 'data-testid': 'item' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Pagination.Ellipsis) {
				$$renderer.push('<!--[-->');
				Pagination.Ellipsis($$renderer, { index: 0, 'data-testid': 'ellipsis' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Pagination.NextTrigger) {
				$$renderer.push('<!--[-->');
				Pagination.NextTrigger($$renderer, { 'data-testid': 'next-trigger' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Pagination.LastTrigger) {
				$$renderer.push('<!--[-->');
				Pagination.LastTrigger($$renderer, { 'data-testid': 'last-trigger' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}