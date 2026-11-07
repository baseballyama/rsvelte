import * as $ from 'svelte/internal/server';
import { Table, TableBody, TableCell, TableRow } from '$lib/components/ui/table';

export default function Table_09($$renderer) {
	$$renderer.push(`<div class="mx-auto max-w-lg"><div class="bg-background overflow-hidden rounded-md border">`);

	Table($$renderer, {
		children: ($$renderer) => {
			TableBody($$renderer, {
				children: ($$renderer) => {
					TableRow($$renderer, {
						class: '*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r',
						children: ($$renderer) => {
							TableCell($$renderer, {
								class: 'bg-muted/50 py-2 font-medium',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Name`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableCell($$renderer, {
								class: 'py-2',
								children: ($$renderer) => {
									$$renderer.push(`<!---->David Kim`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TableRow($$renderer, {
						class: '*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r',
						children: ($$renderer) => {
							TableCell($$renderer, {
								class: 'bg-muted/50 py-2 font-medium',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Email`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableCell($$renderer, {
								class: 'py-2',
								children: ($$renderer) => {
									$$renderer.push(`<!---->d.kim@company.com`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TableRow($$renderer, {
						class: '*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r',
						children: ($$renderer) => {
							TableCell($$renderer, {
								class: 'bg-muted/50 py-2 font-medium',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Location`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableCell($$renderer, {
								class: 'py-2',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Seoul, KR`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TableRow($$renderer, {
						class: '*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r',
						children: ($$renderer) => {
							TableCell($$renderer, {
								class: 'bg-muted/50 py-2 font-medium',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Status`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableCell($$renderer, {
								class: 'py-2',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Active`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TableRow($$renderer, {
						class: '*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r',
						children: ($$renderer) => {
							TableCell($$renderer, {
								class: 'bg-muted/50 py-2 font-medium',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Balance`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableCell($$renderer, {
								class: 'py-2',
								children: ($$renderer) => {
									$$renderer.push(`<!---->$1,000.00`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <p class="text-muted-foreground mt-4 text-center text-sm">Vertical table</p></div>`);
}