import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

var root = $.from_html(`<label for="cover-art" class="flex size-full cursor-pointer items-center justify-center"><!></label>`);
var root_1 = $.from_html(`<!> <!> <input id="cover-art" type="file" accept="image/jpeg,image/png" class="sr-only"/>`, 1);
var root_2 = $.from_html(`Minimum 3000 × 3000px <br/> JPEG or PNG only`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Cover_art($$anchor) {
	let fileInput = $.state(void 0);

	function openPicker() {
		$.get(fileInput)?.click();
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_3();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'flex flex-col gap-3',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_2 = $.first_child(fragment_2);

							Label(node_2, {
								for: 'cover-art',
								class: 'text-center text-xs font-normal tracking-wider text-muted-foreground uppercase',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Cover Art');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Item.Root, ($$anchor, Item_Root) => {
								Item_Root($$anchor, {
									class: 'aspect-square',
									variant: 'outline',
									children: ($$anchor, $$slotProps) => {
										var label = root();
										var node_4 = $.child(label);

										IconPlaceholder(node_4, {
											lucide: 'ImageIcon',
											tabler: 'IconPhoto',
											hugeicons: 'Image01Icon',
											phosphor: 'ImageIcon',
											remixicon: 'RiImageLine',
											class: 'size-10 text-muted-foreground/50'
										});

										$.reset(label);
										$.append($$anchor, label);
									},
									$$slots: { default: true }
								});
							});

							var input = $.sibling(node_3, 2);

							$.bind_this(input, ($$value) => $.set(fileInput, $$value), () => $.get(fileInput));
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						class: 'flex-col gap-2',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_3();
							var node_6 = $.first_child(fragment_3);

							Button(node_6, {
								variant: 'secondary',
								class: 'w-full',
								type: 'button',
								onclick: openPicker,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Upload Artwork');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_7 = $.sibling(node_6, 2);

							$.component(node_7, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									class: 'text-center text-xs',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_4 = root_2();

										$.next(2);
										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
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
}