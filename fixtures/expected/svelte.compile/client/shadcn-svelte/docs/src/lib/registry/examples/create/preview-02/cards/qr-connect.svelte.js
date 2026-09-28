import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import QRCode from "qrcode";
import { onMount } from "svelte";
import * as Card from "$lib/registry/ui/card/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<img alt="" width="160" height="160" class="block"/>`);
var root_1 = $.from_html(`<div class="size-[160px] animate-pulse rounded bg-muted"></div>`);
var root_2 = $.from_html(`<div class="rounded-xl border bg-white p-4"><!></div>`);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);

export default function Qr_connect($$anchor, $$props) {
	$.push($$props, true);

	const connectUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
	let dataUrl = $.state("");

	onMount(() => {
		QRCode.toDataURL(connectUrl, { width: 160, margin: 1 }).then((url) => {
			$.set(dataUrl, url, true);
		});
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_4();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'flex justify-center pt-6',
						children: ($$anchor, $$slotProps) => {
							var div = root_2();
							var node_2 = $.child(div);

							{
								var consequent = ($$anchor) => {
									var img = root();

									$.template_effect(() => $.set_attribute(img, 'src', $.get(dataUrl)));
									$.append($$anchor, img);
								};

								var alternate = ($$anchor) => {
									var div_1 = root_1();

									$.append($$anchor, div_1);
								};

								$.if(node_2, ($$render) => {
									if ($.get(dataUrl)) $$render(consequent); else $$render(alternate, -1);
								});
							}

							$.reset(div);
							$.append($$anchor, div);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						class: 'text-center',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_3();
							var node_4 = $.first_child(fragment_2);

							$.component(node_4, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Scan to connect your mobile device');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_5 = $.sibling(node_4, 2);

							$.component(node_5, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Open the Ledger mobile app and scan this code to link your device.');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_6 = $.sibling(node_3, 2);

				$.component(node_6, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								variant: 'secondary',
								class: 'w-full',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Got it');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
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