import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Item from "$lib/registry/ui/item/index.js";

var root = $.from_html(`<img width="32" height="32" class="size-8 rounded object-cover grayscale"/>`);
var root_1 = $.from_html(` <span class="text-muted-foreground"> </span>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<a><!> <!> <!></a>`);
var root_4 = $.from_html(`<div class="flex w-full max-w-md flex-col gap-6"><div class="flex w-full max-w-md flex-col gap-4"></div></div>`);

export default function Item_image_demo($$anchor) {
	const music = [
		{
			title: "Midnight City Lights",
			artist: "Neon Dreams",
			album: "Electric Nights",
			duration: "3:45"
		},

		{
			title: "Coffee Shop Conversations",
			artist: "The Morning Brew",
			album: "Urban Stories",
			duration: "4:05"
		},

		{
			title: "Digital Rain",
			artist: "Cyber Symphony",
			album: "Binary Beats",
			duration: "3:30"
		}
	];

	var div = root_4();
	var div_1 = $.child(div);

	$.each(div_1, 20, () => music, (song) => song, ($$anchor, song) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			const child = ($$anchor, $$arg0) => {
				let props = () => ($$arg0?.()).props;
				var a = root_3();

				$.attribute_effect(a, () => ({ href: '#/', ...props() }));

				var node_1 = $.child(a);

				$.component(node_1, () => Item.Media, ($$anchor, Item_Media) => {
					Item_Media($$anchor, {
						variant: 'image',
						children: ($$anchor, $$slotProps) => {
							var img = root();

							$.template_effect(() => {
								$.set_attribute(img, 'src', `https://avatar.vercel.sh/${song.title}`);
								$.set_attribute(img, 'alt', song.title);
							});

							$.append($$anchor, img);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Item.Content, ($$anchor, Item_Content) => {
					Item_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_2();
							var node_3 = $.first_child(fragment_1);

							$.component(node_3, () => Item.Title, ($$anchor, Item_Title) => {
								Item_Title($$anchor, {
									class: 'line-clamp-1',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_2 = root_1();
										var text = $.first_child(fragment_2);
										var span = $.sibling(text);
										var text_1 = $.only_child(span, true);

										$.template_effect(() => {
											$.set_text(text, `${song.title ?? ''} - `);
											$.set_text(text_1, song.album);
										});

										$.append($$anchor, fragment_2);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Item.Description, ($$anchor, Item_Description) => {
								Item_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text();

										$.template_effect(() => $.set_text(text_2, song.artist));
										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_2, 2);

				$.component(node_5, () => Item.Content, ($$anchor, Item_Content_1) => {
					Item_Content_1($$anchor, {
						class: 'flex-none text-center',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_6 = $.first_child(fragment_4);

							$.component(node_6, () => Item.Description, ($$anchor, Item_Description_1) => {
								Item_Description_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text();

										$.template_effect(() => $.set_text(text_3, song.duration));
										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				$.reset(a);
				$.append($$anchor, a);
			};

			$.component(node, () => Item.Root, ($$anchor, Item_Root) => {
				Item_Root($$anchor, { variant: 'outline', child, $$slots: { child: true } });
			});
		}

		$.append($$anchor, fragment);
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}