import * as $ from 'svelte/internal/server';
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { Textarea } from "$lib/components/ui/textarea/index.js";
import { Switch } from "$lib/components/ui/switch/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import { DefaultGamedigEval, GAMEDIG_TIMEOUT } from "$lib/anywhere.js";
import AllGamesListRaw from "$lib/all-games-list.json?raw";
import * as Tooltip from "$lib/components/ui/tooltip/index.js";
import CodeMirror from "svelte-codemirror-editor";
import { javascript } from "@codemirror/lang-javascript";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";
import { mode } from "mode-watcher";

export default function Monitor_gamedig($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let { data = void 0 } = $$props;

		const allGamesList = JSON.parse(AllGamesListRaw);

		// Initialize defaults if not set
		if (!data.gameId) data.gameId = allGamesList[0]?.id || "";

		if (!data.host) data.host = "";
		if (!data.port) data.port = 27015;
		if (!data.timeout) data.timeout = GAMEDIG_TIMEOUT;
		if (!data.eval) data.eval = DefaultGamedigEval;
		if (data.guessPort === undefined) data.guessPort = false;
		if (data.requestRules === undefined) data.requestRules = false;

		let searchQuery = "";

		let filteredGames = $.derived(() => searchQuery
			? allGamesList.filter((g) => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
			: allGamesList.slice(0, 50));

		// Show first 50 by default
		let selectedGameName = $.derived(() => allGamesList.find((g) => g.id === data.gameId)?.name || data.gameId);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="space-y-4"><div class="flex flex-col gap-2">`);

			Label($$renderer, {
				for: 'gamedig-game',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Game <span class="text-destructive">*</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (Select.Root) {
				$$renderer.push('<!--[-->');

				Select.Root($$renderer, {
					type: 'single',
					value: data.gameId,
					onValueChange: (v) => {
						if (v) data.gameId = v;
					},

					children: ($$renderer) => {
						if (Select.Trigger) {
							$$renderer.push('<!--[-->');

							Select.Trigger($$renderer, {
								id: 'gamedig-game',
								class: 'w-full',
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(selectedGameName())}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Select.Content) {
							$$renderer.push('<!--[-->');

							Select.Content($$renderer, {
								class: 'max-h-75',
								children: ($$renderer) => {
									$$renderer.push(`<div class="p-2">`);

									Input($$renderer, {
										placeholder: 'Search games...',
										class: 'mb-2',
										get value() {
											return searchQuery;
										},

										set value($$value) {
											searchQuery = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></div> <!--[-->`);

									const each_array = $.ensure_array_like(filteredGames());

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let game = each_array[$$index];

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: game.id,
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(game.name)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(`<!--]--> `);

									if (filteredGames().length === 0) {
										$$renderer.push(`<!--[0--><p class="text-muted-foreground p-2 text-sm">No games found</p>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
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

			$$renderer.push(`</div> <div class="grid grid-cols-3 gap-4"><div class="flex flex-col gap-2">`);

			Label($$renderer, {
				for: 'gamedig-host',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Host <span class="text-destructive">*</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				id: 'gamedig-host',
				placeholder: 'game.example.com',
				get value() {
					return data.host;
				},

				set value($$value) {
					data.host = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="flex flex-col gap-2">`);

			Label($$renderer, {
				for: 'gamedig-port',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Port`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				id: 'gamedig-port',
				type: 'number',
				placeholder: '27015',
				get value() {
					return data.port;
				},

				set value($$value) {
					data.port = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="flex flex-col gap-2">`);

			Label($$renderer, {
				for: 'gamedig-timeout',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Timeout (ms)`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				id: 'gamedig-timeout',
				type: 'number',
				placeholder: '10000',
				get value() {
					return data.timeout;
				},

				set value($$value) {
					data.timeout = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div></div> <div class="flex gap-6"><div class="flex items-center space-x-2">`);

			if (Tooltip.Root) {
				$$renderer.push('<!--[-->');

				Tooltip.Root($$renderer, {
					children: ($$renderer) => {
						if (Tooltip.Trigger) {
							$$renderer.push('<!--[-->');

							Tooltip.Trigger($$renderer, {
								class: 'flex items-center space-x-2',
								children: ($$renderer) => {
									Switch($$renderer, {
										id: 'gamedig-guessport',
										get checked() {
											return data.guessPort;
										},

										set checked($$value) {
											data.guessPort = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> `);

									Label($$renderer, {
										for: 'gamedig-guessport',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Guess Port`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Tooltip.Content) {
							$$renderer.push('<!--[-->');

							Tooltip.Content($$renderer, {
								class: 'max-w-xs',
								children: ($$renderer) => {
									$$renderer.push(`<p class="text-wrap">Used port can be different from client port, depending on queried game. Try this if you have unsuccessful
            responses</p>`);
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

			$$renderer.push(`</div> <div class="flex items-center space-x-2">`);

			if (Tooltip.Root) {
				$$renderer.push('<!--[-->');

				Tooltip.Root($$renderer, {
					children: ($$renderer) => {
						if (Tooltip.Trigger) {
							$$renderer.push('<!--[-->');

							Tooltip.Trigger($$renderer, {
								class: 'flex items-center space-x-2',
								children: ($$renderer) => {
									Switch($$renderer, {
										id: 'gamedig-rules',
										get checked() {
											return data.requestRules;
										},

										set checked($$value) {
											data.requestRules = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> `);

									Label($$renderer, {
										for: 'gamedig-rules',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Request Rules`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Tooltip.Content) {
							$$renderer.push('<!--[-->');

							Tooltip.Content($$renderer, {
								class: 'max-w-xs',
								children: ($$renderer) => {
									$$renderer.push(`<p class="text-wrap">Valve games can provide additional 'rules' to Gamedig monitors. If checked, they will be available in
            \`reponseRaw.raw\`, beware that it may increase query time.</p>`);
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

			$$renderer.push(`</div></div> <div class="flex flex-col gap-2">`);

			Label($$renderer, {
				for: 'gamedig-eval',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Custom Eval Function`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="rounded-md border">`);

			CodeMirror($$renderer, {
				lang: javascript(),
				theme: mode.current === "dark" ? githubDark : githubLight,
				styles: { "&": { fontSize: "14px", height: "300px" } },
				get value() {
					return data.eval;
				},

				set value($$value) {
					data.eval = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <p class="text-muted-foreground mt-1 text-xs">Function receives (responseTime, responseRaw) and should return { status, latency }</p></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data });
	});
}