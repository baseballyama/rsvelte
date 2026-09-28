import * as $ from 'svelte/internal/server';
import { Pane, Splitpanes } from 'svelte-splitpanes';
import Button from '$comp/Button.svelte';

export default function Code($$renderer) {
	function onClick() {
		visible = !visible;
	}

	let visible = true;

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->${$.escape(visible ? 'Hide' : 'Show')}`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Splitpanes($$renderer, {
		style: 'height: 400px',
		children: ($$renderer) => {
			Pane($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<span>1</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (visible) {
				$$renderer.push('<!--[0-->');

				Pane($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<span>2</span>`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			Pane($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<span>3</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}