import * as $ from 'svelte/internal/server';
import { CodeSnippet, Stack, Toggle } from "carbon-components-svelte";

export default function HiddenCodeSnippet($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let toggled = false;
		const code = Array.from({ length: 20 }, (_, i) => i + 1).join("\n");
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Stack($$renderer, {
				gap: 5,
				children: ($$renderer) => {
					Toggle($$renderer, {
						size: 'sm',
						labelText: 'Show code snippets',
						get toggled() {
							return toggled;
						},

						set toggled($$value) {
							toggled = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					if (toggled) {
						$$renderer.push(`<!--[0--><h5>"Show more" will not render</h5> <br/>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <div${$.attr_class('svelte-p2s89v', void 0, { 'hidden': !toggled })}>`);
					CodeSnippet($$renderer, { type: 'multi', code });
					$$renderer.push(`<!----></div> `);

					if (toggled) {
						$$renderer.push(`<!--[0--><br/><br/> <h5>"Show more" will render</h5> <br/> <div${$.attr_class('svelte-p2s89v', void 0, { 'hidden': !toggled })}>`);
						CodeSnippet($$renderer, { type: 'multi', code });
						$$renderer.push(`<!----></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}