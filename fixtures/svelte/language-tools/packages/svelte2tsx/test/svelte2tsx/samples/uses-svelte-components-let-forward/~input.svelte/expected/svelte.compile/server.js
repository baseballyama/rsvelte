import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	if (true) {
		$$renderer.push('<!--[0-->');

		Input($$renderer, {
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$renderer, { prop }) => {
					$$renderer.push(`<!--[-->`);
					$.slot($$renderer, $$props, 'default', { prop }, null);
					$$renderer.push(`<!--]-->`);
				}
			}
		});

		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (testComponent) {
		$$renderer.push('<!--[-->');

		testComponent($$renderer, {
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$renderer, { prop }) => {
					$$renderer.push(`<!--[-->`);
					$.slot($$renderer, $$props, 'default', { prop }, null);
					$$renderer.push(`<!--]-->`);
				}
			}
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}