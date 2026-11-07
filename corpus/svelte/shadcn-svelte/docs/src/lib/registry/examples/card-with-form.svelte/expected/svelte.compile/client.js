import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<form><div class="grid w-full items-center gap-4"><div class="flex flex-col space-y-1.5"><!> <!></div> <div class="flex flex-col space-y-1.5"><!> <!></div></div></form>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Card_with_form($$anchor, $$props) {
	$.push($$props, true);

	const frameworks = [
		{ value: "sveltekit", label: "SvelteKit" },
		{ value: "next", label: "Next.js" },
		{ value: "astro", label: "Astro" },
		{ value: "nuxt", label: "Nuxt.js" }
	];

	let framework = $.state("");
	const selectedFramework = $.derived(() => frameworks.find((f) => f.value === $.get(framework))?.label ?? "Select a framework");
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			class: 'w-[350px]',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Create project');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Deploy your new project in one-click.');

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

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var form = root_1();
							var div = $.child(form);
							var div_1 = $.child(div);
							var node_5 = $.child(div_1);

							Label(node_5, {
								for: 'name',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Name');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							var node_6 = $.sibling(node_5, 2);

							Input(node_6, { id: 'name', placeholder: 'Name of your project' });
							$.reset(div_1);

							var div_2 = $.sibling(div_1, 2);
							var node_7 = $.child(div_2);

							Label(node_7, {
								for: 'framework',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Framework');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							var node_8 = $.sibling(node_7, 2);

							$.component(node_8, () => Select.Root, ($$anchor, Select_Root) => {
								Select_Root($$anchor, {
									type: 'single',
									get value() {
										return $.get(framework);
									},

									set value($$value) {
										$.set(framework, $$value, true);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_9 = $.first_child(fragment_3);

										$.component(node_9, () => Select.Trigger, ($$anchor, Select_Trigger) => {
											Select_Trigger($$anchor, {
												id: 'framework',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text();

													$.template_effect(() => $.set_text(text_4, $.get(selectedFramework)));
													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										});

										var node_10 = $.sibling(node_9, 2);

										$.component(node_10, () => Select.Content, ($$anchor, Select_Content) => {
											Select_Content($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = $.comment();
													var node_11 = $.first_child(fragment_5);

													$.each(node_11, 17, () => frameworks, ({ value, label }) => value, ($$anchor, $$item) => {
														let value = () => $.get($$item).value;
														let label = () => $.get($$item).label;
														var fragment_6 = $.comment();
														var node_12 = $.first_child(fragment_6);

														$.component(node_12, () => Select.Item, ($$anchor, Select_Item) => {
															Select_Item($$anchor, {
																get value() {
																	return value();
																},

																get label() {
																	return label();
																}
															});
														});

														$.append($$anchor, fragment_6);
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div_2);
							$.reset(div);
							$.reset(form);
							$.append($$anchor, form);
						},
						$$slots: { default: true }
					});
				});

				var node_13 = $.sibling(node_4, 2);

				$.component(node_13, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						class: 'flex justify-between',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root();
							var node_14 = $.first_child(fragment_7);

							Button(node_14, {
								variant: 'outline',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Cancel');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});

							var node_15 = $.sibling(node_14, 2);

							Button(node_15, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('Deploy');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_7);
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