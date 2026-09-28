import * as $ from 'svelte/internal/server';
import { AppBar } from '../../src/index.js';

export default function App_bar($$renderer) {
	AppBar($$renderer, {
		'data-testid': 'root',
		children: ($$renderer) => {
			if (AppBar.Toolbar) {
				$$renderer.push('<!--[-->');

				AppBar.Toolbar($$renderer, {
					'data-testid': 'toolbar',
					children: ($$renderer) => {
						if (AppBar.Lead) {
							$$renderer.push('<!--[-->');
							AppBar.Lead($$renderer, { 'data-testid': 'lead' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (AppBar.Headline) {
							$$renderer.push('<!--[-->');
							AppBar.Headline($$renderer, { 'data-testid': 'headline' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (AppBar.Trail) {
							$$renderer.push('<!--[-->');
							AppBar.Trail($$renderer, { 'data-testid': 'trail' });
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
}