import * as $ from 'svelte/internal/server';
import QRCode from "qrcode";
import { onMount } from "svelte";
import * as Card from "$lib/registry/ui/card/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Qr_connect($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const connectUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
		let dataUrl = "";

		onMount(() => {
			QRCode.toDataURL(connectUrl, { width: 160, margin: 1 }).then((url) => {
				dataUrl = url;
			});
		});

		if (Card.Root) {
			$$renderer.push('<!--[-->');

			Card.Root($$renderer, {
				children: ($$renderer) => {
					if (Card.Content) {
						$$renderer.push('<!--[-->');

						Card.Content($$renderer, {
							class: 'flex justify-center pt-6',
							children: ($$renderer) => {
								$$renderer.push(`<div class="rounded-xl border bg-white p-4">`);

								if (dataUrl) {
									$$renderer.push(`<!--[0--><img${$.attr('src', dataUrl)} alt="" width="160" height="160" class="block"/>`);
								} else {
									$$renderer.push(`<!--[-1--><div class="size-[160px] animate-pulse rounded bg-muted"></div>`);
								}

								$$renderer.push(`<!--]--></div>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Card.Header) {
						$$renderer.push('<!--[-->');

						Card.Header($$renderer, {
							class: 'text-center',
							children: ($$renderer) => {
								if (Card.Title) {
									$$renderer.push('<!--[-->');

									Card.Title($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Scan to connect your mobile device`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Description) {
									$$renderer.push('<!--[-->');

									Card.Description($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Open the Ledger mobile app and scan this code to link your device.`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Card.Footer) {
						$$renderer.push('<!--[-->');

						Card.Footer($$renderer, {
							children: ($$renderer) => {
								Button($$renderer, {
									variant: 'secondary',
									class: 'w-full',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Got it`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}