import * as $ from 'svelte/internal/server';
import { Column, Content, Grid, Link, Row } from "carbon-components-svelte";

export default function ____404_($$renderer) {
	$.head('10pcq2c', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>404</title>`);
		});
	});

	Content($$renderer, {
		style: 'min-height: calc(100vh - 6rem - 1px);',
		children: ($$renderer) => {
			Grid($$renderer, {
				children: ($$renderer) => {
					Row($$renderer, {
						children: ($$renderer) => {
							Column($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<h1>404</h1> <div>Page not found. `);

									Link($$renderer, {
										href: '/',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Return home`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div>`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}