import * as $ from 'svelte/internal/server';

export default function _1_input($$renderer, $$props) {
	$$renderer.push(`<div><!--[-->`);

	$.slot($$renderer, $$props, 'header', {}, () => {
		$$renderer.push(`No header was provided`);
	});

	$$renderer.push(`<!--]--> <p>Some content between header and footer</p> <!--[-->`);
	$.slot($$renderer, $$props, 'footer', {}, null);
	$$renderer.push(`<!--]--></div> `);

	Widget($$renderer, {
		$$slots: {
			header: ($$renderer) => {
				$$renderer.push(`<h1 slot="header">Hello</h1>`);
			},

			footer: ($$renderer) => {
				{
					$$renderer.push(`<p>All rights reserved.</p> <p>Copyright (c) 2019 Svelte Industries</p>`);
				}
			}
		}
	});

	$$renderer.push(`<!---->`);
}