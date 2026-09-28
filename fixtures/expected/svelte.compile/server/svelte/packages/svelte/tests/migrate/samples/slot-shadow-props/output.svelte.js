import * as $ from 'svelte/internal/server';
import Comp from "./Component.svelte";

export default function Output($$renderer) {
	Comp($$renderer, {
		stuff: 'cool',
		$$slots: {
			stuff: ($$renderer) => {
				$$renderer.push(`<div slot="stuff">cool</div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	Comp($$renderer, {
		stuff: 'cool',
		$$slots: {
			stuff: ($$renderer) => {
				{
					$$renderer.push(`cool`);
				}
			}
		}
	});

	$$renderer.push(`<!----> `);

	Comp($$renderer, {
		stuff: 'cool',
		$$slots: {
			stuff: ($$renderer, { should_stay }) => {
				$$renderer.push(`<div slot="stuff">cool</div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	Comp($$renderer, {
		stuff: 'cool',
		$$slots: {
			stuff: ($$renderer, { should_stay }) => {
				{
					$$renderer.push(`cool`);
				}
			}
		}
	});

	$$renderer.push(`<!---->`);
}