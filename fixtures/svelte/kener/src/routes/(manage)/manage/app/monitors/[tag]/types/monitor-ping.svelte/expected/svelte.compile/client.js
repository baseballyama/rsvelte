import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import { ValidateIpAddress } from "$lib/clientTools";
import Plus from "@lucide/svelte/icons/plus";
import X from "@lucide/svelte/icons/x";
import { DefaultPingEval } from "$lib/anywhere.js";
import CodeMirror from "svelte-codemirror-editor";
import { javascript } from "@codemirror/lang-javascript";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";
import { mode } from "mode-watcher";
import { PING_HOST_TYPES } from "$lib/types/ping.js";

var root = $.from_html(`Hosts <span class="text-destructive">*</span>`, 1);
var root_1 = $.from_html(`<!> Add Host`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="bg-muted/50 rounded-lg border p-3"><div class="mb-2 flex items-center justify-between"><span class="text-sm font-medium"></span> <!></div> <div class="grid grid-cols-5 gap-2"><div class="flex flex-col gap-2"><!> <!></div> <div class="col-span-2 flex flex-col gap-2"><!> <!></div> <div class="flex flex-col gap-2"><!> <!></div> <div class="flex flex-col gap-2"><!> <!></div></div></div>`);
var root_4 = $.from_html(`<div class="space-y-3"></div>`);
var root_5 = $.from_html(`<p class="text-muted-foreground text-sm">No hosts added. Click "Add Host" to add a ping target.</p>`);
var root_6 = $.from_html(`<div class="space-y-4"><div class="flex flex-col gap-2"><div class="mb-2 flex items-center justify-between"><!> <!></div> <!></div> <div class="flex flex-col gap-2"><!> <div class="rounded-md border"><!></div> <p class="text-muted-foreground mt-1 text-xs"></p></div></div>`);

export default function Monitor_ping($$anchor, $$props) {
	$.push($$props, true);

	let data = $.prop($$props, 'data', 31, () => $.proxy({ hosts: [], pingEval: DefaultPingEval }));

	function normalizeHostType(value) {
		return typeof value === "string" && PING_HOST_TYPES.includes(value) ? value : "IP4";
	}

	function inferHostType(host) {
		const inferred = ValidateIpAddress((host || "").trim());

		return inferred === "Invalid" ? null : inferred;
	}

	// Initialize defaults if not set
	if (!Array.isArray(data().hosts) || data().hosts.length === 0) data(data().hosts = [{ type: "IP4", host: "", timeout: 1000, count: 3 }], true); else {
		data(data().hosts = data().hosts.map((host) => ({ ...host, type: normalizeHostType(host?.type) })), true);
	}

	if (!data().pingEval) data(data().pingEval = DefaultPingEval, true);

	function addHost() {
		data(
			data().hosts = [
				...data().hosts,
				{ type: "IP4", host: "", timeout: 1000, count: 3 }
			],
			true
		);
	}

	function removeHost(index) {
		data(data().hosts = data().hosts.filter((_, i) => i !== index), true);
	}

	function onHostChange(host) {
		const inferredType = inferHostType(host.host);

		if (inferredType) {
			host.type = inferredType;
		}
	}

	var div = root_6();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	Label(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment = root();

			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		variant: 'outline',
		size: 'sm',
		onclick: addHost,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_2 = $.first_child(fragment_1);

			Plus(node_2, { class: 'mr-1 size-4' });
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var node_3 = $.sibling(div_2, 2);

	{
		var consequent = ($$anchor) => {
			var div_3 = root_4();

			$.each(div_3, 21, () => data().hosts, $.index, ($$anchor, host, index) => {
				var div_4 = root_3();
				var div_5 = $.child(div_4);
				var span = $.child(div_5);

				span.textContent = `Host ${index + 1}`;

				var node_4 = $.sibling(span, 2);

				Button(node_4, {
					variant: 'ghost',
					size: 'icon',
					onclick: () => removeHost(index),
					children: ($$anchor, $$slotProps) => {
						X($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});

				$.reset(div_5);

				var div_6 = $.sibling(div_5, 2);
				var div_7 = $.child(div_6);
				var node_5 = $.child(div_7);

				Label(node_5, {
					for: `ping-type-${index}`,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Type');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_6 = $.sibling(node_5, 2);

				{
					let $0 = $.derived(() => normalizeHostType($.get(host).type));

					$.component(node_6, () => Select.Root, ($$anchor, Select_Root) => {
						Select_Root($$anchor, {
							type: 'single',
							get value() {
								return $.get($0);
							},
							onValueChange: (v) => ($.get(host).type = normalizeHostType(v)),
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root_2();
								var node_7 = $.first_child(fragment_3);

								$.component(node_7, () => Select.Trigger, ($$anchor, Select_Trigger) => {
									Select_Trigger($$anchor, {
										id: `ping-type-${index}`,
										class: 'w-full',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text();

											$.template_effect(($0) => $.set_text(text_1, $0), [() => normalizeHostType($.get(host).type)]);
											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});
								});

								var node_8 = $.sibling(node_7, 2);

								$.component(node_8, () => Select.Content, ($$anchor, Select_Content) => {
									Select_Content($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = $.comment();
											var node_9 = $.first_child(fragment_5);

											$.each(node_9, 16, () => PING_HOST_TYPES, (typeOption) => typeOption, ($$anchor, typeOption) => {
												var fragment_6 = $.comment();
												var node_10 = $.first_child(fragment_6);

												$.component(node_10, () => Select.Item, ($$anchor, Select_Item) => {
													Select_Item($$anchor, {
														get value() {
															return typeOption;
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text();

															$.template_effect(() => $.set_text(text_2, typeOption));
															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
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
				}

				$.reset(div_7);

				var div_8 = $.sibling(div_7, 2);
				var node_11 = $.child(div_8);

				Label(node_11, {
					for: `ping-host-${index}`,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('Host');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				var node_12 = $.sibling(node_11, 2);

				Input(node_12, {
					id: `ping-host-${index}`,
					oninput: () => onHostChange($.get(host)),
					placeholder: '8.8.8.8, 2001:db8::1, or example.com',
					get value() {
						return $.get(host).host;
					},

					set value($$value) {
						($.get(host).host = $$value);
					}
				});

				$.reset(div_8);

				var div_9 = $.sibling(div_8, 2);
				var node_13 = $.child(div_9);

				Label(node_13, {
					for: `ping-timeout-${index}`,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('Timeout (ms)');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				var node_14 = $.sibling(node_13, 2);

				Input(node_14, {
					id: `ping-timeout-${index}`,
					type: 'number',
					placeholder: '1000',
					get value() {
						return $.get(host).timeout;
					},

					set value($$value) {
						($.get(host).timeout = $$value);
					}
				});

				$.reset(div_9);

				var div_10 = $.sibling(div_9, 2);
				var node_15 = $.child(div_10);

				Label(node_15, {
					for: `ping-count-${index}`,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Count');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				var node_16 = $.sibling(node_15, 2);

				Input(node_16, {
					id: `ping-count-${index}`,
					type: 'number',
					placeholder: '3',
					get value() {
						return $.get(host).count;
					},

					set value($$value) {
						($.get(host).count = $$value);
					}
				});

				$.reset(div_10);
				$.reset(div_6);
				$.reset(div_4);
				$.append($$anchor, div_4);
			});

			$.reset(div_3);
			$.append($$anchor, div_3);
		};

		var alternate = ($$anchor) => {
			var p = root_5();

			$.append($$anchor, p);
		};

		$.if(node_3, ($$render) => {
			if (data().hosts.length > 0) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div_1);

	var div_11 = $.sibling(div_1, 2);
	var node_17 = $.child(div_11);

	Label(node_17, {
		for: 'ping-eval',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Custom Eval Function');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var div_12 = $.sibling(node_17, 2);
	var node_18 = $.child(div_12);

	{
		let $0 = $.derived(javascript);
		let $1 = $.derived(() => mode.current === "dark" ? githubDark : githubLight);

		CodeMirror(node_18, {
			get lang() {
				return $.get($0);
			},

			get theme() {
				return $.get($1);
			},
			styles: { "&": { fontSize: "14px", height: "300px" } },
			get value() {
				return data().pingEval;
			},

			set value($$value) {
				data(data().pingEval = $$value, true);
			}
		});
	}

	$.reset(div_12);

	var p_1 = $.sibling(div_12, 2);

	p_1.textContent = 'Function receives (arrayOfPings) and should return { status, latency }';
	$.reset(div_11);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}