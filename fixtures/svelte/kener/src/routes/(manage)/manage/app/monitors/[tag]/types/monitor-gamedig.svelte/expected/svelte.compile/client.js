import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`Game <span class="text-destructive">*</span>`, 1);
var root_1 = $.from_html(`<p class="text-muted-foreground p-2 text-sm">No games found</p>`);
var root_2 = $.from_html(`<div class="p-2"><!></div> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`Host <span class="text-destructive">*</span>`, 1);

var root_5 = $.from_html(`<p class="text-wrap">Used port can be different from client port, depending on queried game. Try this if you have unsuccessful
            responses</p>`);

var root_6 = $.from_html(`<p class="text-wrap">Valve games can provide additional 'rules' to Gamedig monitors. If checked, they will be available in
            \`reponseRaw.raw\`, beware that it may increase query time.</p>`);

var root_7 = $.from_html(`<div class="space-y-4"><div class="flex flex-col gap-2"><!> <!></div> <div class="grid grid-cols-3 gap-4"><div class="flex flex-col gap-2"><!> <!></div> <div class="flex flex-col gap-2"><!> <!></div> <div class="flex flex-col gap-2"><!> <!></div></div> <div class="flex gap-6"><div class="flex items-center space-x-2"><!></div> <div class="flex items-center space-x-2"><!></div></div> <div class="flex flex-col gap-2"><!> <div class="rounded-md border"><!></div> <p class="text-muted-foreground mt-1 text-xs"></p></div></div>`);

export default function Monitor_gamedig($$anchor, $$props) {
	$.push($$props, true);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let data = $.prop($$props, 'data', 15);

	const allGamesList = JSON.parse(AllGamesListRaw);

	// Initialize defaults if not set
	if (!data().gameId) data(data().gameId = allGamesList[0]?.id || "", true);

	if (!data().host) data(data().host = "", true);
	if (!data().port) data(data().port = 27015, true);
	if (!data().timeout) data(data().timeout = GAMEDIG_TIMEOUT, true);
	if (!data().eval) data(data().eval = DefaultGamedigEval, true);
	if (data().guessPort === undefined) data(data().guessPort = false, true);
	if (data().requestRules === undefined) data(data().requestRules = false, true);

	let searchQuery = $.state("");

	let filteredGames = $.derived(() => $.get(searchQuery)
		? allGamesList.filter((g) => g.name.toLowerCase().includes($.get(searchQuery).toLowerCase()))
		: allGamesList.slice(0, 50));

	// Show first 50 by default
	let selectedGameName = $.derived(() => allGamesList.find((g) => g.id === data().gameId)?.name || data().gameId);

	var div = root_7();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Label(node, {
		for: 'gamedig-game',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment = root();

			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => Select.Root, ($$anchor, Select_Root) => {
		Select_Root($$anchor, {
			type: 'single',
			get value() {
				return data().gameId;
			},

			onValueChange: (v) => {
				if (v) data(data().gameId = v, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_3();
				var node_2 = $.first_child(fragment_1);

				$.component(node_2, () => Select.Trigger, ($$anchor, Select_Trigger) => {
					Select_Trigger($$anchor, {
						id: 'gamedig-game',
						class: 'w-full',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, $.get(selectedGameName)));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => Select.Content, ($$anchor, Select_Content) => {
					Select_Content($$anchor, {
						class: 'max-h-75',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_2();
							var div_2 = $.first_child(fragment_3);
							var node_4 = $.child(div_2);

							Input(node_4, {
								placeholder: 'Search games...',
								class: 'mb-2',
								get value() {
									return $.get(searchQuery);
								},

								set value($$value) {
									$.set(searchQuery, $$value, true);
								}
							});

							$.reset(div_2);

							var node_5 = $.sibling(div_2, 2);

							$.each(node_5, 17, () => $.get(filteredGames), $.index, ($$anchor, game) => {
								var fragment_4 = $.comment();
								var node_6 = $.first_child(fragment_4);

								$.component(node_6, () => Select.Item, ($$anchor, Select_Item) => {
									Select_Item($$anchor, {
										get value() {
											return $.get(game).id;
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text();

											$.template_effect(() => $.set_text(text_1, $.get(game).name));
											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_4);
							});

							var node_7 = $.sibling(node_5, 2);

							{
								var consequent = ($$anchor) => {
									var p = root_1();

									$.append($$anchor, p);
								};

								$.if(node_7, ($$render) => {
									if ($.get(filteredGames).length === 0) $$render(consequent);
								});
							}

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

	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var div_4 = $.child(div_3);
	var node_8 = $.child(div_4);

	Label(node_8, {
		for: 'gamedig-host',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_6 = root_4();

			$.next();
			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	Input(node_9, {
		id: 'gamedig-host',
		placeholder: 'game.example.com',
		get value() {
			return data().host;
		},

		set value($$value) {
			data(data().host = $$value, true);
		}
	});

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_10 = $.child(div_5);

	Label(node_10, {
		for: 'gamedig-port',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Port');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 2);

	Input(node_11, {
		id: 'gamedig-port',
		type: 'number',
		placeholder: '27015',
		get value() {
			return data().port;
		},

		set value($$value) {
			data(data().port = $$value, true);
		}
	});

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_12 = $.child(div_6);

	Label(node_12, {
		for: 'gamedig-timeout',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Timeout (ms)');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_12, 2);

	Input(node_13, {
		id: 'gamedig-timeout',
		type: 'number',
		placeholder: '10000',
		get value() {
			return data().timeout;
		},

		set value($$value) {
			data(data().timeout = $$value, true);
		}
	});

	$.reset(div_6);
	$.reset(div_3);

	var div_7 = $.sibling(div_3, 2);
	var div_8 = $.child(div_7);
	var node_14 = $.child(div_8);

	$.component(node_14, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
		Tooltip_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_7 = root_3();
				var node_15 = $.first_child(fragment_7);

				$.component(node_15, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
					Tooltip_Trigger($$anchor, {
						class: 'flex items-center space-x-2',
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root_3();
							var node_16 = $.first_child(fragment_8);

							Switch(node_16, {
								id: 'gamedig-guessport',
								get checked() {
									return data().guessPort;
								},

								set checked($$value) {
									data(data().guessPort = $$value, true);
								}
							});

							var node_17 = $.sibling(node_16, 2);

							Label(node_17, {
								for: 'gamedig-guessport',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Guess Port');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});
				});

				var node_18 = $.sibling(node_15, 2);

				$.component(node_18, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
					Tooltip_Content($$anchor, {
						class: 'max-w-xs',
						children: ($$anchor, $$slotProps) => {
							var p_1 = root_5();

							$.append($$anchor, p_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_7);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_8);

	var div_9 = $.sibling(div_8, 2);
	var node_19 = $.child(div_9);

	$.component(node_19, () => Tooltip.Root, ($$anchor, Tooltip_Root_1) => {
		Tooltip_Root_1($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_9 = root_3();
				var node_20 = $.first_child(fragment_9);

				$.component(node_20, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_1) => {
					Tooltip_Trigger_1($$anchor, {
						class: 'flex items-center space-x-2',
						children: ($$anchor, $$slotProps) => {
							var fragment_10 = root_3();
							var node_21 = $.first_child(fragment_10);

							Switch(node_21, {
								id: 'gamedig-rules',
								get checked() {
									return data().requestRules;
								},

								set checked($$value) {
									data(data().requestRules = $$value, true);
								}
							});

							var node_22 = $.sibling(node_21, 2);

							Label(node_22, {
								for: 'gamedig-rules',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Request Rules');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_10);
						},
						$$slots: { default: true }
					});
				});

				var node_23 = $.sibling(node_20, 2);

				$.component(node_23, () => Tooltip.Content, ($$anchor, Tooltip_Content_1) => {
					Tooltip_Content_1($$anchor, {
						class: 'max-w-xs',
						children: ($$anchor, $$slotProps) => {
							var p_2 = root_6();

							$.append($$anchor, p_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_9);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_9);
	$.reset(div_7);

	var div_10 = $.sibling(div_7, 2);
	var node_24 = $.child(div_10);

	Label(node_24, {
		for: 'gamedig-eval',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Custom Eval Function');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var div_11 = $.sibling(node_24, 2);
	var node_25 = $.child(div_11);

	{
		let $0 = $.derived(javascript);
		let $1 = $.derived(() => mode.current === "dark" ? githubDark : githubLight);

		CodeMirror(node_25, {
			get lang() {
				return $.get($0);
			},

			get theme() {
				return $.get($1);
			},
			styles: { "&": { fontSize: "14px", height: "300px" } },
			get value() {
				return data().eval;
			},

			set value($$value) {
				data(data().eval = $$value, true);
			}
		});
	}

	$.reset(div_11);

	var p_3 = $.sibling(div_11, 2);

	p_3.textContent = 'Function receives (responseTime, responseRaw) and should return { status, latency }';
	$.reset(div_10);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}