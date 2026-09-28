import * as $ from 'svelte/internal/server';
import { Command } from "bits-ui";
import Home from "./home.svelte";
import Projects from "./projects.svelte";
import "./vercel.css";

export default function Vercel_command($$renderer) {
	let inputValue = "";
	let pages = ["home"];
	const activePage = $.derived(() => pages[pages.length - 1]);
	const isHome = $.derived(() => activePage() === "home");

	function popPage() {
		const next = [...pages];

		next.splice(-1, 1);
		pages = next;
	}

	function bounce(node) {
		node.style.transform = "scale(0.96)";

		setTimeout(
			() => {
				node.style.transform = "";
			},
			100
		);

		inputValue = "";
	}

	function handleKeydown(e) {
		const currTarget = e.currentTarget;

		if (!currTarget) return;

		if (e.key === "Enter") {
			bounce(currTarget);
		}

		if (isHome() || inputValue.length) {
			return;
		}

		if (e.key === "Backspace") {
			e.preventDefault();
			popPage();
			bounce(currTarget);
		}
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="vercel">`);

		if (Command.Root) {
			$$renderer.push('<!--[-->');

			Command.Root($$renderer, {
				onkeydown: handleKeydown,
				children: ($$renderer) => {
					$$renderer.push(`<div><!--[-->`);

					const each_array = $.ensure_array_like(pages);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let page = each_array[$$index];

						$$renderer.push(`<div data-command-vercel-badge="">${$.escape(page)}</div>`);
					}

					$$renderer.push(`<!--]--></div> `);

					if (Command.Input) {
						$$renderer.push('<!--[-->');

						Command.Input($$renderer, {
							autofocus: true,
							placeholder: 'What do you need?',
							get value() {
								return inputValue;
							},

							set value($$value) {
								inputValue = $$value;
								$$settled = false;
							}
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Command.List) {
						$$renderer.push('<!--[-->');

						Command.List($$renderer, {
							children: ($$renderer) => {
								if (Command.Viewport) {
									$$renderer.push('<!--[-->');

									Command.Viewport($$renderer, {
										children: ($$renderer) => {
											if (Command.Empty) {
												$$renderer.push('<!--[-->');

												Command.Empty($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->No results found.`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` <!---->`);

											{
												if (activePage() === "home") {
													$$renderer.push('<!--[0-->');

													Home($$renderer, {
														searchProjects: () => {
															pages = [...pages, "projects"];
														}
													});
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]--> `);

												if (activePage() === "projects") {
													$$renderer.push('<!--[0-->');
													Projects($$renderer, {});
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]-->`);
											}

											$$renderer.push(`<!---->`);
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

		$$renderer.push(`</div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}