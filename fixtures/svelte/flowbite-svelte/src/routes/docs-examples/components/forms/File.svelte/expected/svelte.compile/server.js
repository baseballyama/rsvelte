import * as $ from 'svelte/internal/server';
import { Label, Fileupload } from "flowbite-svelte";

export default function File($$renderer) {
	let fileuploadprops = { id: "user_avatar" };

	Label($$renderer, {
		class: 'pb-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Upload file`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Fileupload($$renderer, $.spread_props([fileuploadprops]));
	$$renderer.push(`<!---->`);
}