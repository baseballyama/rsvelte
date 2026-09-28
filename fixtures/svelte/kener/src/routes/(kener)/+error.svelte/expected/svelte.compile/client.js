import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/stores";
import { Button } from "$lib/components/ui/button/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import Home from "@lucide/svelte/icons/home";
import ArrowLeft from "@lucide/svelte/icons/arrow-left";
import AlertCircle from "@lucide/svelte/icons/alert-circle";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

var root = $.from_html(`<!> Go Back`, 1);
var root_1 = $.from_html(`<!> Home`, 1);
var root_2 = $.from_html(`<div class="bg-muted flex size-16 items-center justify-center rounded-full"><!></div> <div class="space-y-2"><h1 class="text-4xl font-bold"> </h1> <p class="text-muted-foreground text-lg"><!></p></div> <div class="flex gap-3"><!> <!></div>`, 1);
var root_3 = $.from_html(`<div class="flex min-h-[60vh] items-center justify-center p-4"><!></div>`);

export default function _error($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var div = root_3();
	var node = $.child(div);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			class: 'w-full max-w-md rounded-3xl border bg-transparent shadow-none',
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'flex flex-col items-center gap-6 pt-10 pb-8 text-center',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_2();
							var div_1 = $.first_child(fragment_1);
							var node_2 = $.child(div_1);

							AlertCircle(node_2, { class: 'text-muted-foreground size-8' });
							$.reset(div_1);

							var div_2 = $.sibling(div_1, 2);
							var h1 = $.child(div_2);
							var text = $.only_child(h1, true);
							var p = $.sibling(h1, 2);
							var node_3 = $.child(p);

							{
								var consequent = ($$anchor) => {
									var text_1 = $.text();

									$.template_effect(() => $.set_text(text_1, $page().error.message));
									$.append($$anchor, text_1);
								};

								var consequent_1 = ($$anchor) => {
									var text_2 = $.text('The page you\'re looking for doesn\'t exist or has been moved.');

									$.append($$anchor, text_2);
								};

								var consequent_2 = ($$anchor) => {
									var text_3 = $.text('Something went wrong on our end. Please try again later.');

									$.append($$anchor, text_3);
								};

								var alternate = ($$anchor) => {
									var text_4 = $.text('An unexpected error occurred.');

									$.append($$anchor, text_4);
								};

								$.if(node_3, ($$render) => {
									if ($page().error?.message) $$render(consequent); else if ($page().status === 404) $$render(consequent_1, 1); else if ($page().status === 500) $$render(consequent_2, 2); else $$render(alternate, -1);
								});
							}

							$.reset(p);
							$.reset(div_2);

							var div_3 = $.sibling(div_2, 2);
							var node_4 = $.child(div_3);

							Button(node_4, {
								variant: 'outline',
								onclick: () => history.back(),
								class: 'rounded-full',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_5 = $.first_child(fragment_3);

									ArrowLeft(node_5, { class: 'mr-2 size-4' });
									$.next();
									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});

							var node_6 = $.sibling(node_4, 2);

							{
								let $0 = $.derived(() => clientResolver(resolve, "/"));

								Button(node_6, {
									get href() {
										return $.get($0);
									},
									class: 'rounded-full',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_1();
										var node_7 = $.first_child(fragment_4);

										Home(node_7, { class: 'mr-2 size-4' });
										$.next();
										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							}

							$.reset(div_3);
							$.template_effect(() => $.set_text(text, $page().status));
							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}