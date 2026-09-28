import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import * as InputGroup from "$lib/components/ui/input-group/index.js";

var root = $.from_html(`Host <span class="text-destructive">*</span>`, 1);
var root_1 = $.from_html(`<span class="text-degraded">Degraded</span> when hours remaining expires in`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<span class="text-down">Down</span> when hours remaining expires In`, 1);
var root_4 = $.from_html(`<div class="space-y-4"><div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-2"><!> <!></div> <div class="flex flex-col gap-2"><!> <!></div></div> <div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-2"><div><!> <p class="text-muted-foreground mt-1 text-xs">Certificate expiring within this many hours will be marked as DEGRADED</p></div></div> <div class="flex flex-col gap-2"><div><!> <p class="text-muted-foreground mt-1 text-xs">Certificate expiring within this many hours will be marked as DOWN</p></div></div></div></div>`);

export default function Monitor_ssl($$anchor, $$props) {
	$.push($$props, true);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let data = $.prop($$props, 'data', 15);

	// Initialize defaults if not set
	if (!data().host) data(data().host = "", true);

	if (!data().port) data(data().port = "443", true);
	if (!data().degradedRemainingHours) data(data().degradedRemainingHours = 168, true); // 7 days
	if (!data().downRemainingHours) data(data().downRemainingHours = 24, true); // 1 day

	var div = root_4();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	Label(node, {
		for: 'ssl-host',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment = root();

			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Input(node_1, {
		id: 'ssl-host',
		placeholder: 'example.com',
		get value() {
			return data().host;
		},

		set value($$value) {
			data(data().host = $$value, true);
		}
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_2 = $.child(div_3);

	Label(node_2, {
		for: 'ssl-port',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Port');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Input(node_3, {
		id: 'ssl-port',
		placeholder: '443',
		get value() {
			return data().port;
		},

		set value($$value) {
			data(data().port = $$value, true);
		}
	});

	$.reset(div_3);
	$.reset(div_1);

	var div_4 = $.sibling(div_1, 2);
	var div_5 = $.child(div_4);
	var div_6 = $.child(div_5);
	var node_4 = $.child(div_6);

	$.component(node_4, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
		InputGroup_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_5 = $.first_child(fragment_1);

				$.component(node_5, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
					InputGroup_Addon($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_6 = $.first_child(fragment_2);

							$.component(node_6, () => InputGroup.Text, ($$anchor, InputGroup_Text) => {
								InputGroup_Text($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_1();

										$.next();
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_7 = $.sibling(node_5, 2);

				$.component(node_7, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
					InputGroup_Input($$anchor, {
						id: 'ssl-degraded',
						type: 'number',
						class: 'text-right',
						placeholder: '168',
						get value() {
							return data().degradedRemainingHours;
						},

						set value($$value) {
							data(data().degradedRemainingHours = $$value, true);
						}
					});
				});

				var node_8 = $.sibling(node_7, 2);

				$.component(node_8, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
					InputGroup_Addon_1($$anchor, {
						align: 'inline-end',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_9 = $.first_child(fragment_4);

							$.component(node_9, () => InputGroup.Text, ($$anchor, InputGroup_Text_1) => {
								InputGroup_Text_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('hours');

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

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.next(2);
	$.reset(div_6);
	$.reset(div_5);

	var div_7 = $.sibling(div_5, 2);
	var div_8 = $.child(div_7);
	var node_10 = $.child(div_8);

	$.component(node_10, () => InputGroup.Root, ($$anchor, InputGroup_Root_1) => {
		InputGroup_Root_1($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_5 = root_2();
				var node_11 = $.first_child(fragment_5);

				$.component(node_11, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_2) => {
					InputGroup_Addon_2($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = $.comment();
							var node_12 = $.first_child(fragment_6);

							$.component(node_12, () => InputGroup.Text, ($$anchor, InputGroup_Text_2) => {
								InputGroup_Text_2($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_7 = root_3();

										$.next();
										$.append($$anchor, fragment_7);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				});

				var node_13 = $.sibling(node_11, 2);

				$.component(node_13, () => InputGroup.Input, ($$anchor, InputGroup_Input_1) => {
					InputGroup_Input_1($$anchor, {
						id: 'ssl-down',
						class: 'text-right',
						type: 'number',
						placeholder: '24',
						get value() {
							return data().downRemainingHours;
						},

						set value($$value) {
							data(data().downRemainingHours = $$value, true);
						}
					});
				});

				var node_14 = $.sibling(node_13, 2);

				$.component(node_14, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_3) => {
					InputGroup_Addon_3($$anchor, {
						align: 'inline-end',
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = $.comment();
							var node_15 = $.first_child(fragment_8);

							$.component(node_15, () => InputGroup.Text, ($$anchor, InputGroup_Text_3) => {
								InputGroup_Text_3($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('hours');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_5);
			},
			$$slots: { default: true }
		});
	});

	$.next(2);
	$.reset(div_8);
	$.reset(div_7);
	$.reset(div_4);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}