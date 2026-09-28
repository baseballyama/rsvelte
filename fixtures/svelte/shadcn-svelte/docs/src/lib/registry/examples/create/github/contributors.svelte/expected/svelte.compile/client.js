import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import { Badge } from "$lib/registry/ui/badge/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`Contributors <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex flex-wrap gap-2"></div>`);
var root_3 = $.from_html(`<a href="#/" class="text-sm underline underline-offset-4">+ 810 contributors</a>`);
var root_4 = $.from_html(`<!> <!> <!>`, 1);

export default function Contributors($$anchor) {
	const usernames = [
		"shadcn",
		"vercel",
		"nextjs",
		"tailwindlabs",
		"typescript-lang",
		"eslint",
		"prettier",
		"babel",
		"webpack",
		"rollup",
		"parcel",
		"vite",
		"react",
		"vue",
		"angular",
		"solid"
	];

	Example($$anchor, {
		title: 'Contributors',
		class: 'items-center lg:p-16',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					class: 'max-w-sm',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_4();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
							Card_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
										Card_Title($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var fragment_4 = root();
												var node_3 = $.sibling($.first_child(fragment_4));

												Badge(node_3, {
													variant: 'secondary',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text = $.text('312');

														$.append($$anchor, text);
													},
													$$slots: { default: true }
												});

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

						var node_4 = $.sibling(node_1, 2);

						$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var div = root_2();

									$.each(div, 20, () => usernames, (username) => username, ($$anchor, username) => {
										var fragment_5 = $.comment();
										var node_5 = $.first_child(fragment_5);

										$.component(node_5, () => Avatar.Root, ($$anchor, Avatar_Root) => {
											Avatar_Root($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root_1();
													var node_6 = $.first_child(fragment_6);

													{
														let $0 = $.derived(() => `https://github.com/${username}.png`);

														$.component(node_6, () => Avatar.Image, ($$anchor, Avatar_Image) => {
															Avatar_Image($$anchor, {
																get src() {
																	return $.get($0);
																},

																get alt() {
																	return username;
																}
															});
														});
													}

													var node_7 = $.sibling(node_6, 2);

													$.component(node_7, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
														Avatar_Fallback($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text();

																$.template_effect(($0) => $.set_text(text_1, $0), [() => username.charAt(0)]);
																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_5);
									});

									$.reset(div);
									$.append($$anchor, div);
								},
								$$slots: { default: true }
							});
						});

						var node_8 = $.sibling(node_4, 2);

						$.component(node_8, () => Card.Footer, ($$anchor, Card_Footer) => {
							Card_Footer($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var a = root_3();

									$.append($$anchor, a);
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
}