import * as $ from 'svelte/internal/server';
import { Button, ImageLoader } from "carbon-components-svelte";

export default function ProgrammaticImageLoader($$renderer) {
	const src = "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg";
	const srcError = `${src}1`;
	let imageLoader;
	let imageLoadError;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			kind: 'ghost',
			disabled: !imageLoader || imageLoadError,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Simulate error`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		ImageLoader($$renderer, {
			fadeIn: true,
			src,
			get error() {
				return imageLoadError;
			},

			set error($$value) {
				imageLoadError = $$value;
				$$settled = false;
			},

			$$slots: {
				error: ($$renderer) => {
					{
						Button($$renderer, {
							kind: 'ghost',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Error. Try again`);
							},
							$$slots: { default: true }
						});
					}
				}
			}
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}