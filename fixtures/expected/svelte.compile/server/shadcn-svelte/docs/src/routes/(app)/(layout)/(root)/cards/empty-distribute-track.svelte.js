import * as $ from 'svelte/internal/server';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Card, CardContent } from "$lib/registry/ui/card/index.js";

import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle
} from "$lib/registry/ui/empty/index.js";

export default function Empty_distribute_track($$renderer) {
	Card($$renderer, {
		children: ($$renderer) => {
			CardContent($$renderer, {
				children: ($$renderer) => {
					Empty($$renderer, {
						class: 'p-4',
						children: ($$renderer) => {
							EmptyMedia($$renderer, {
								variant: 'icon',
								children: ($$renderer) => {
									IconPlaceholder($$renderer, {
										lucide: 'PlusIcon',
										tabler: 'IconPlus',
										hugeicons: 'Add01Icon',
										phosphor: 'PlusIcon',
										remixicon: 'RiAddLine'
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							EmptyHeader($$renderer, {
								children: ($$renderer) => {
									EmptyTitle($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Distribute Track`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									EmptyDescription($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Upload your first master to start reaching listeners on Spotify, Apple Music, and more.`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							EmptyContent($$renderer, {
								children: ($$renderer) => {
									Button($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Create Release`);
										},
										$$slots: { default: true }
									});
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
		},
		$$slots: { default: true }
	});
}