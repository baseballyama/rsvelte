import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AlertDialog } from "bits-ui";
import { onDestroy, onMount } from "svelte";

var root = $.from_html(`<div class="text-center italic text-white"> </div>`);

var root_1 = $.from_html(`<div class="flex h-full flex-col items-center justify-center gap-2 text-white"><!> <!> <div class="border-neutral-e4 border-t-primary mb-2 mt-6
					h-10 w-10 rounded-full border-[5px] [animation:spin_0.5s_linear_infinite]"></div></div>`);

var root_2 = $.from_html(`<!> <!>`, 1);

export default function Alert_dialog($$anchor, $$props) {
	$.push($$props, true);

	let title = $.prop($$props, 'title', 11, "Loading"),
		message = $.prop($$props, 'message', 11, "Please wait while we load your settings");

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

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => AlertDialog.Root, ($$anchor, AlertDialog_Root) => {
		AlertDialog_Root($$anchor, {
			open: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => AlertDialog.Portal, ($$anchor, AlertDialog_Portal) => {
					AlertDialog_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_2();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => AlertDialog.Overlay, ($$anchor, AlertDialog_Overlay) => {
								AlertDialog_Overlay($$anchor, { class: 'fixed inset-0 z-[90]  bg-black/30' });
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => AlertDialog.Content, ($$anchor, AlertDialog_Content) => {
								AlertDialog_Content($$anchor, {
									class: 'fixed\n      left-[50%] top-[50%] z-[90] w-full max-w-[calc(100%-2rem)]\n      translate-x-[-50%] translate-y-[-50%] rounded-xl\n      border bg-black p-5\n      md:w-[350px]\n      ',
									children: ($$anchor, $$slotProps) => {
										var div = root_1();
										var node_4 = $.child(div);

										$.component(node_4, () => AlertDialog.Title, ($$anchor, AlertDialog_Title) => {
											AlertDialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text();

													$.template_effect(() => $.set_text(text, title()));
													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_4, 2);

										{
											var consequent = ($$anchor) => {
												var div_1 = root();
												var text_1 = $.only_child(div_1, true);

												$.template_effect(() => $.set_text(text_1, message()));
												$.append($$anchor, div_1);
											};

											$.if(node_5, ($$render) => {
												if (message()) $$render(consequent);
											});
										}

										$.next(2);
										$.reset(div);
										$.append($$anchor, div);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}