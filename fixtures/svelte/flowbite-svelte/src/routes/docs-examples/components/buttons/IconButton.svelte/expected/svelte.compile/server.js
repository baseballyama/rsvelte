import * as $ from 'svelte/internal/server';
import { Button } from "flowbite-svelte";
import { ThumbsUpSolid, ArrowRightOutline } from "flowbite-svelte-icons";

export default function IconButton($$renderer) {
	Button($$renderer, {
		class: 'p-2!',
		children: ($$renderer) => {
			ArrowRightOutline($$renderer, { class: 'h-6 w-6' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		pill: true,
		class: 'p-2!',
		children: ($$renderer) => {
			ArrowRightOutline($$renderer, { class: 'h-6 w-6' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		outline: true,
		class: 'p-2!',
		size: 'lg',
		children: ($$renderer) => {
			ThumbsUpSolid($$renderer, { class: 'text-primary-700 h-7 w-7' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		pill: true,
		outline: true,
		class: 'p-2!',
		size: 'xl',
		children: ($$renderer) => {
			ThumbsUpSolid($$renderer, { class: 'text-primary-700 h-6 w-6' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}