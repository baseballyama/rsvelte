import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import '../app.css';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MenuIcon from '@lucide/svelte/icons/menu';
import * as Sheet from '$site/components/ui/sheet';
import { Button } from '$site/components/ui/button';
import NavBar from './NavBar.svelte';
import LogoAndMenu from './LogoAndMenu.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="bg-background text-foreground flex h-full w-full flex-col"><header class="flex items-center gap-3 border-b px-4 py-2 lg:hidden"><!> <!></header> <div class="flex flex-1 overflow-hidden"><aside class="bg-sidebar hidden w-72 shrink-0 border-r lg:block"><!></aside> <main class="flex-1 overflow-auto p-4"><!></main></div></div>`);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);
	maplibregl.setWorkerUrl(maplibreWorkerUrl);

	let drawerOpen = $.state(false);
	var div = root_1();
	var header = $.child(div);
	var node = $.child(header);

	$.component(node, () => Sheet.Root, ($$anchor, Sheet_Root) => {
		Sheet_Root($$anchor, {
			get open() {
				return $.get(drawerOpen);
			},

			set open($$value) {
				$.set(drawerOpen, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						Button($$anchor, $.spread_props(props, {
							variant: 'ghost',
							size: 'icon',
							'aria-label': 'Toggle menu',
							children: ($$anchor, $$slotProps) => {
								MenuIcon($$anchor, { class: 'size-6' });
							},
							$$slots: { default: true }
						}));
					};

					$.component(node_1, () => Sheet.Trigger, ($$anchor, Sheet_Trigger) => {
						Sheet_Trigger($$anchor, { child, $$slots: { child: true } });
					});
				}

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Sheet.Content, ($$anchor, Sheet_Content) => {
					Sheet_Content($$anchor, {
						side: 'left',
						class: 'w-80 p-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_3 = $.first_child(fragment_3);

							$.component(node_3, () => Sheet.Header, ($$anchor, Sheet_Header) => {
								Sheet_Header($$anchor, {
									class: 'sr-only',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_4 = $.first_child(fragment_4);

										$.component(node_4, () => Sheet.Title, ($$anchor, Sheet_Title) => {
											Sheet_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('Navigation');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => Sheet.Description, ($$anchor, Sheet_Description) => {
											Sheet_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Site navigation links');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							var node_6 = $.sibling(node_3, 2);

							NavBar(node_6, { close: () => $.set(drawerOpen, false) });
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_7 = $.sibling(node, 2);

	LogoAndMenu(node_7, {});
	$.reset(header);

	var div_1 = $.sibling(header, 2);
	var aside = $.child(div_1);
	var node_8 = $.child(aside);

	NavBar(node_8, {});
	$.reset(aside);

	var main = $.sibling(aside, 2);
	var node_9 = $.child(main);

	$.snippet(node_9, () => $$props.children ?? $.noop);
	$.reset(main);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}