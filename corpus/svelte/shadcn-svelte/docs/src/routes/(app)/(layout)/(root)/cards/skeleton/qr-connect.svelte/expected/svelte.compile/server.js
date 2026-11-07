import * as $ from 'svelte/internal/server';
import { Card, CardContent, CardHeader } from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

export default function Qr_connect($$renderer) {
	Card($$renderer, {
		children: ($$renderer) => {
			CardContent($$renderer, {
				class: 'flex justify-center pt-6',
				children: ($$renderer) => {
					Skeleton($$renderer, { class: 'size-44 rounded-xl' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardHeader($$renderer, {
				class: 'items-center gap-2 text-center',
				children: ($$renderer) => {
					Skeleton($$renderer, { class: 'h-5 w-56 rounded-md' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-4 w-64 rounded-md' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-4 w-48 rounded-md' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}