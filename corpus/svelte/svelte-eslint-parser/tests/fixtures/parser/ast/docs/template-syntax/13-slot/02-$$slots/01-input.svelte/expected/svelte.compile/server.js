import * as $ from 'svelte/internal/server';

export default function _1_input($$renderer, $$props) {
	const $$slots = $.sanitize_slots($$props);

	$$renderer.push(`<div><!--[-->`);
	$.slot($$renderer, $$props, 'title', {}, null);
	$$renderer.push(`<!--]--> `);

	if ($$slots.description) {
		$$renderer.push(`<!--[0--><hr/> <!--[-->`);
		$.slot($$renderer, $$props, 'description', {}, null);
		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></div> `);

	Card($$renderer, {
		$$slots: {
			title: ($$renderer) => {
				$$renderer.push(`<h1 slot="title">Blog Post Title</h1>`);
			}
		}
	});

	$$renderer.push(`<!---->`);
}