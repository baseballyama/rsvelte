import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Command } from "bits-ui";
import Home from "./home.svelte";
import Projects from "./projects.svelte";
import "./vercel.css";

var root = $.from_html(`<div data-command-vercel-badge=""> </div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div></div> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="vercel"><!></div>`);

export default function Vercel_command($$anchor) {
	let inputValue = $.state("");
	let pages = $.state($.proxy(["home"]));
	const activePage = $.derived(() => $.get(pages)[$.get(pages).length - 1]);
	const isHome = $.derived(() => $.get(activePage) === "home");

	function popPage() {
		const next = [...$.get(pages)];

		next.splice(-1, 1);
		$.set(pages, next, true);
	}

	function bounce(node) {
		node.style.transform = "scale(0.96)";

		setTimeout(
			() => {
				node.style.transform = "";
			},
			100
		);

		$.set(inputValue, "");
	}

	function handleKeydown(e) {
		const currTarget = e.currentTarget;

		if (!currTarget) return;

		if (e.key === "Enter") {
			bounce(currTarget);
		}

		if ($.get(isHome) || $.get(inputValue).length) {
			return;
		}

		if (e.key === "Backspace") {
			e.preventDefault();
			popPage();
			bounce(currTarget);
		}
	}

	var div = root_3();
	var node_1 = $.child(div);

	$.component(node_1, () => Command.Root, ($$anchor, Command_Root) => {
		Command_Root($$anchor, {
			onkeydown: handleKeydown,
			children: ($$anchor, $$slotProps) => {
				var fragment = root_2();
				var div_1 = $.first_child(fragment);

				$.each(div_1, 20, () => $.get(pages), (page) => page, ($$anchor, page) => {
					var div_2 = root();
					var text = $.only_child(div_2, true);

					$.template_effect(() => $.set_text(text, page));
					$.append($$anchor, div_2);
				});

				$.reset(div_1);

				var node_2 = $.sibling(div_1, 2);

				$.component(node_2, () => Command.Input, ($$anchor, Command_Input) => {
					Command_Input($$anchor, {
						autofocus: true,
						placeholder: 'What do you need?',
						get value() {
							return $.get(inputValue);
						},

						set value($$value) {
							$.set(inputValue, $$value, true);
						}
					});
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => Command.List, ($$anchor, Command_List) => {
					Command_List($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_4 = $.first_child(fragment_1);

							$.component(node_4, () => Command.Viewport, ($$anchor, Command_Viewport) => {
								Command_Viewport($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root_1();
										var node_5 = $.first_child(fragment_2);

										$.component(node_5, () => Command.Empty, ($$anchor, Command_Empty) => {
											Command_Empty($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('No results found.');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_6 = $.sibling(node_5, 2);

										$.key(node_6, () => $.get(activePage), ($$anchor) => {
											var fragment_3 = root_1();
											var node_7 = $.first_child(fragment_3);

											{
												var consequent = ($$anchor) => {
													Home($$anchor, {
														searchProjects: () => {
															$.set(pages, [...$.get(pages), "projects"], true);
														}
													});
												};

												$.if(node_7, ($$render) => {
													if ($.get(activePage) === "home") $$render(consequent);
												});
											}

											var node_8 = $.sibling(node_7, 2);

											{
												var consequent_1 = ($$anchor) => {
													Projects($$anchor, {});
												};

												$.if(node_8, ($$render) => {
													if ($.get(activePage) === "projects") $$render(consequent_1);
												});
											}

											$.append($$anchor, fragment_3);
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
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}