import * as $ from 'svelte/internal/server';
import Comp from "./Component.svelte";

export default function Output($$renderer) {
	Comp($$renderer, {
		$$slots: {
			'cool:stuff': ($$renderer) => {
				$$renderer.push(`<div slot="cool:stuff">cool</div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	Comp($$renderer, {
		$$slots: {
			'cool stuff': ($$renderer) => {
				$$renderer.push(`<div slot="cool stuff">cool</div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	Comp($$renderer, {
		$$slots: {
			new: ($$renderer) => {
				$$renderer.push(`<div slot="new">reserved keyword</div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	{
		function stuff($$renderer) {
			$$renderer.push(`<div>cool</div>`);
		}

		Comp($$renderer, { stuff, $$slots: { stuff: true } });
	}

	$$renderer.push(`<!----> `);

	Comp($$renderer, {
		$$slots: {
			'cool:stuff': ($$renderer) => {
				{
					$$renderer.push(`cool`);
				}
			}
		}
	});

	$$renderer.push(`<!----> `);

	Comp($$renderer, {
		$$slots: {
			'cool stuff': ($$renderer) => {
				{
					$$renderer.push(`cool`);
				}
			}
		}
	});

	$$renderer.push(`<!----> `);

	{
		function stuff($$renderer) {
			$$renderer.push(`<!---->cool`);
		}

		Comp($$renderer, { stuff, $$slots: { stuff: true } });
	}

	$$renderer.push(`<!----> `);

	Comp($$renderer, {
		$$slots: {
			'cool:stuff': ($$renderer, { should_stay }) => {
				$$renderer.push(`<div slot="cool:stuff">cool</div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	Comp($$renderer, {
		$$slots: {
			'cool stuff': ($$renderer, { should_stay }) => {
				$$renderer.push(`<div slot="cool stuff">cool</div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	Comp($$renderer, {
		$$slots: {
			'cool:stuff': ($$renderer, { should_stay }) => {
				{
					$$renderer.push(`cool`);
				}
			}
		}
	});

	$$renderer.push(`<!----> `);

	Comp($$renderer, {
		$$slots: {
			'cool stuff': ($$renderer, { should_stay }) => {
				{
					$$renderer.push(`cool`);
				}
			}
		}
	});

	$$renderer.push(`<!---->`);
}