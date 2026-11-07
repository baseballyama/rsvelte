import * as $ from 'svelte/internal/server';
import { Button, Tags } from "flowbite-svelte";

export default function Default($$renderer) {
	let tags = [];

	const handleClick = () => {
		alert(`Submitted: ${tags}`);
	};

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<form>`);

		Tags($$renderer, {
			class: 'mt-5 mb-3',
			get value() {
				return tags;
			},

			set value($$value) {
				tags = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		if (tags.length > 0) {
			$$renderer.push(`<!--[0--><pre class="dark:text-white">${$.escape(JSON.stringify(tags, null, 2))}</pre>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		Button($$renderer, {
			onclick: handleClick,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Submit`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></form>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}