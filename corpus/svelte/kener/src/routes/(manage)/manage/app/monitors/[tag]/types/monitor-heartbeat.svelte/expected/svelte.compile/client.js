import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import Copy from "@lucide/svelte/icons/copy";
import * as InputGroup from "$lib/components/ui/input-group/index.js";
import clientResolve from "$lib/client/resolver.js";
import { resolve } from "$app/paths";
import randomName from "@scaleway/random-name";
import CopyButton from "$lib/components/CopyButton.svelte";
import { Badge } from "$lib/components/ui/badge";

var root = $.from_html(`<span class="text-degraded">DEGRADED</span> if no heartbeat received for`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<span class="text-down">DOWN</span> if no heartbeat received for`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<div class="space-y-4"><div class="grid grid-cols-2 gap-4"><div class="flex flex-col"><!> <p class="text-muted-foreground mt-1 text-xs">Mark as DEGRADED if no heartbeat received for this many minutes</p></div> <div class="flex flex-col"><!> <p class="text-muted-foreground mt-1 text-xs">Mark as DOWN if no heartbeat received for this many minutes</p></div></div> <div class="flex flex-col gap-2"><!> <div><div class="flex items-center gap-2"><!></div> <p class="text-muted-foreground mt-1 text-xs">Send a GET or POST request to this URL to record a heartbeat</p></div></div></div>`);

export default function Monitor_heartbeat($$anchor, $$props) {
	$.push($$props, true);

	let data = $.prop($$props, 'data', 15),
		tag = $.prop($$props, 'tag', 3, "");

	// Initialize defaults if not set
	if (!data().degradedRemainingMinutes) data(data().degradedRemainingMinutes = 5, true);

	if (!data().downRemainingMinutes) data(data().downRemainingMinutes = 10, true);

	$.user_effect(() => {
		if (!data().secretString) data(data().secretString = randomName() + "-" + randomName(), true);
	});

	// Generate heartbeat URL
	let heartbeatUrl = $.derived(() => tag()
		? window.location.origin + clientResolve(resolve, `/ext/heartbeat/${tag()}/${data().secretString}`)
		: "Save the monitor first to get the heartbeat URL");

	//refresh secret string and thus heartbeat URL
	function refreshSecret() {
		data(data().secretString = randomName() + "-" + randomName(), true);
	}

	var div = root_4();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	$.component(node, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
		InputGroup_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
					InputGroup_Addon($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => InputGroup.Text, ($$anchor, InputGroup_Text) => {
								InputGroup_Text($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root();

										$.next();
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

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
					InputGroup_Input($$anchor, {
						class: 'text-right',
						id: 'hb-degraded',
						placeholder: '5',
						get value() {
							return data().degradedRemainingMinutes;
						},

						set value($$value) {
							data(data().degradedRemainingMinutes = $$value, true);
						}
					});
				});

				var node_4 = $.sibling(node_3, 2);

				$.component(node_4, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
					InputGroup_Addon_1($$anchor, {
						align: 'inline-end',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_5 = $.first_child(fragment_3);

							$.component(node_5, () => InputGroup.Text, ($$anchor, InputGroup_Text_1) => {
								InputGroup_Text_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('minutes');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

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

	$.next(2);
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_6 = $.child(div_3);

	$.component(node_6, () => InputGroup.Root, ($$anchor, InputGroup_Root_1) => {
		InputGroup_Root_1($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_4 = root_1();
				var node_7 = $.first_child(fragment_4);

				$.component(node_7, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_2) => {
					InputGroup_Addon_2($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = $.comment();
							var node_8 = $.first_child(fragment_5);

							$.component(node_8, () => InputGroup.Text, ($$anchor, InputGroup_Text_2) => {
								InputGroup_Text_2($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root_2();

										$.next();
										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				});

				var node_9 = $.sibling(node_7, 2);

				$.component(node_9, () => InputGroup.Input, ($$anchor, InputGroup_Input_1) => {
					InputGroup_Input_1($$anchor, {
						class: 'text-right',
						id: 'hb-down',
						placeholder: '10',
						get value() {
							return data().downRemainingMinutes;
						},

						set value($$value) {
							data(data().downRemainingMinutes = $$value, true);
						}
					});
				});

				var node_10 = $.sibling(node_9, 2);

				$.component(node_10, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_3) => {
					InputGroup_Addon_3($$anchor, {
						align: 'inline-end',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = $.comment();
							var node_11 = $.first_child(fragment_7);

							$.component(node_11, () => InputGroup.Text, ($$anchor, InputGroup_Text_3) => {
								InputGroup_Text_3($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('minutes');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		});
	});

	$.next(2);
	$.reset(div_3);
	$.reset(div_1);

	var div_4 = $.sibling(div_1, 2);
	var node_12 = $.child(div_4);

	Label(node_12, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Heartbeat URL');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var div_5 = $.sibling(node_12, 2);
	var div_6 = $.child(div_5);
	var node_13 = $.child(div_6);

	$.component(node_13, () => InputGroup.Root, ($$anchor, InputGroup_Root_2) => {
		InputGroup_Root_2($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_8 = root_1();
				var node_14 = $.first_child(fragment_8);

				$.component(node_14, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_4) => {
					InputGroup_Addon_4($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_9 = $.comment();
							var node_15 = $.first_child(fragment_9);

							$.component(node_15, () => InputGroup.Text, ($$anchor, InputGroup_Text_4) => {
								InputGroup_Text_4($$anchor, {
									children: ($$anchor, $$slotProps) => {
										Badge($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('GET | POST');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_9);
						},
						$$slots: { default: true }
					});
				});

				var node_16 = $.sibling(node_14, 2);

				$.component(node_16, () => InputGroup.Input, ($$anchor, InputGroup_Input_2) => {
					InputGroup_Input_2($$anchor, {
						class: 'text-muted-foreground',
						id: 'hb-secret',
						readonly: true,
						get value() {
							return $.get(heartbeatUrl);
						},

						set value($$value) {
							$.set(heartbeatUrl, $$value);
						}
					});
				});

				var node_17 = $.sibling(node_16, 2);

				$.component(node_17, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_5) => {
					InputGroup_Addon_5($$anchor, {
						align: 'inline-end',
						children: ($$anchor, $$slotProps) => {
							var fragment_11 = root_3();
							var node_18 = $.first_child(fragment_11);

							$.component(node_18, () => InputGroup.Button, ($$anchor, InputGroup_Button) => {
								InputGroup_Button($$anchor, {
									variant: 'secondary',
									onclick: refreshSecret,
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('New URL');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});
							});

							var node_19 = $.sibling(node_18, 2);

							CopyButton(node_19, {
								variant: 'ghost',
								size: 'icon-sm',
								get text() {
									return $.get(heartbeatUrl);
								},

								children: ($$anchor, $$slotProps) => {
									Copy($$anchor, { class: 'size-4' });
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_11);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_8);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_6);
	$.next(2);
	$.reset(div_5);
	$.reset(div_4);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}