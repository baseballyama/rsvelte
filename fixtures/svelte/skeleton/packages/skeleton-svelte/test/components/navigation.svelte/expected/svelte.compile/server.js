import * as $ from 'svelte/internal/server';
import { Navigation } from '../../src/index.js';

export default function Navigation_1($$renderer) {
	Navigation($$renderer, {
		'data-testid': 'root',
		children: ($$renderer) => {
			if (Navigation.Header) {
				$$renderer.push('<!--[-->');
				Navigation.Header($$renderer, { 'data-testid': 'header' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Navigation.Content) {
				$$renderer.push('<!--[-->');
				Navigation.Content($$renderer, { 'data-testid': 'content' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Navigation.Group) {
				$$renderer.push('<!--[-->');
				Navigation.Group($$renderer, { 'data-testid': 'group' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Navigation.Label) {
				$$renderer.push('<!--[-->');
				Navigation.Label($$renderer, { 'data-testid': 'label' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Navigation.Menu) {
				$$renderer.push('<!--[-->');
				Navigation.Menu($$renderer, { 'data-testid': 'menu' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Navigation.Footer) {
				$$renderer.push('<!--[-->');
				Navigation.Footer($$renderer, { 'data-testid': 'footer' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}