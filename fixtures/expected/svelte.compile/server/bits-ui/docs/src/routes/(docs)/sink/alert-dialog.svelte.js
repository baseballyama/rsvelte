import * as $ from 'svelte/internal/server';
import { AlertDialog } from "bits-ui";
import { onDestroy, onMount } from "svelte";

export default function Alert_dialog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			title = "Loading",
			message = "Please wait while we load your settings"
		} = $$props;

		onMount(() => {
			console.log("onMount loader");
		});

		onDestroy(async () => {
			console.log("onDestroy loader");

			// Fix
			// if (document.body.style.pointerEvents === 'none') {
			// 	document.body.style.pointerEvents = '';
			// }
		});

		if (AlertDialog.Root) {
			$$renderer.push('<!--[-->');

			AlertDialog.Root($$renderer, {
				open: true,
				children: ($$renderer) => {
					if (AlertDialog.Portal) {
						$$renderer.push('<!--[-->');

						AlertDialog.Portal($$renderer, {
							children: ($$renderer) => {
								if (AlertDialog.Overlay) {
									$$renderer.push('<!--[-->');
									AlertDialog.Overlay($$renderer, { class: 'fixed inset-0 z-[90]  bg-black/30' });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (AlertDialog.Content) {
									$$renderer.push('<!--[-->');

									AlertDialog.Content($$renderer, {
										class: 'fixed\n      left-[50%] top-[50%] z-[90] w-full max-w-[calc(100%-2rem)]\n      translate-x-[-50%] translate-y-[-50%] rounded-xl\n      border bg-black p-5\n      md:w-[350px]\n      ',
										children: ($$renderer) => {
											$$renderer.push(`<div class="flex h-full flex-col items-center justify-center gap-2 text-white">`);

											if (AlertDialog.Title) {
												$$renderer.push('<!--[-->');

												AlertDialog.Title($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(title)}`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (message) {
												$$renderer.push(`<!--[0--><div class="text-center italic text-white">${$.escape(message)}</div>`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--> <div class="border-neutral-e4 border-t-primary mb-2 mt-6 h-10 w-10 rounded-full border-[5px] [animation:spin_0.5s_linear_infinite]"></div></div>`);
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
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$.bind_props($$props, { title, message });
	});
}