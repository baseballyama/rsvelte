import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { Textarea } from "$lib/components/ui/textarea/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import { Switch } from "$lib/components/ui/switch/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import Plus from "@lucide/svelte/icons/plus";
import X from "@lucide/svelte/icons/x";
import { DefaultAPIEval } from "$lib/anywhere.js";
import CodeMirror from "svelte-codemirror-editor";
import { javascript } from "@codemirror/lang-javascript";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";
import { mode } from "mode-watcher";

var root = $.from_html(`URL <span class="text-destructive">*</span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> Add Header`, 1);
var root_3 = $.from_html(`<div class="flex items-center gap-2"><!> <!> <!></div>`);
var root_4 = $.from_html(`<div class="space-y-2"></div>`);
var root_5 = $.from_html(`<div class="flex flex-col gap-2"><!> <!></div>`);
var root_6 = $.from_html(`<div class="space-y-4"><div class="grid grid-cols-4 gap-4"><div class="col-span-3 flex flex-col gap-2"><!> <!></div> <div class="col-span-1 flex flex-col gap-2"><!> <!></div></div> <div class="flex flex-col gap-2"><!> <!></div> <div><div class="mb-2 flex items-center justify-between"><!> <!></div> <!></div> <!> <div class="flex items-center space-x-2"><!> <!></div> <div class="flex items-center space-x-2"><!> <!></div> <div class="flex flex-col gap-2"><!> <!></div> <div class="flex flex-col gap-2"><!> <div class="rounded-md border"><!></div> <p class="text-muted-foreground mt-1 text-xs"></p></div></div>`);

export default function Monitor_api($$anchor, $$props) {
	$.push($$props, true);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let data = $.prop($$props, 'data', 15);

	// Initialize defaults if not set
	if (!data().url) data(data().url = "", true);

	if (!data().method) data(data().method = "GET", true);
	if (!data().headers) data(data().headers = [], true);
	if (!data().body) data(data().body = "", true);
	if (!data().timeout) data(data().timeout = 10000, true);
	if (!data().eval) data(data().eval = DefaultAPIEval, true);
	if (data().allowSelfSignedCert === undefined) data(data().allowSelfSignedCert = false, true);
	if (data().follow_redirects === undefined) data(data().follow_redirects = true, true);
	if (data().max_redirects === undefined) data(data().max_redirects = 5, true);

	const methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

	function addHeader() {
		data(data().headers = [...data().headers || [], { key: "", value: "" }], true);
	}

	function removeHeader(index) {
		data(data().headers = data().headers?.filter((_, i) => i !== index), true);
	}

	var div = root_6();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	Label(node, {
		for: 'api-url',
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
		id: 'api-url',
		placeholder: 'https://api.example.com/health',
		get value() {
			return data().url;
		},

		set value($$value) {
			data(data().url = $$value, true);
		}
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_2 = $.child(div_3);

	Label(node_2, {
		for: 'api-method',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Method');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	$.component(node_3, () => Select.Root, ($$anchor, Select_Root) => {
		Select_Root($$anchor, {
			type: 'single',
			get value() {
				return data().method;
			},

			onValueChange: (v) => {
				if (v) data(data().method = v, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_4 = $.first_child(fragment_1);

				$.component(node_4, () => Select.Trigger, ($$anchor, Select_Trigger) => {
					Select_Trigger($$anchor, {
						id: 'api-method',
						class: 'w-full',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, data().method));
							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_4, 2);

				$.component(node_5, () => Select.Content, ($$anchor, Select_Content) => {
					Select_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_6 = $.first_child(fragment_3);

							$.each(node_6, 17, () => methods, $.index, ($$anchor, method) => {
								var fragment_4 = $.comment();
								var node_7 = $.first_child(fragment_4);

								$.component(node_7, () => Select.Item, ($$anchor, Select_Item) => {
									Select_Item($$anchor, {
										get value() {
											return $.get(method);
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text();

											$.template_effect(() => $.set_text(text_2, $.get(method)));
											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_4);
							});

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

	$.reset(div_3);
	$.reset(div_1);

	var div_4 = $.sibling(div_1, 2);
	var node_8 = $.child(div_4);

	Label(node_8, {
		for: 'api-timeout',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Timeout (ms)');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	Input(node_9, {
		id: 'api-timeout',
		type: 'number',
		placeholder: '10000',
		get value() {
			return data().timeout;
		},

		set value($$value) {
			data(data().timeout = $$value, true);
		}
	});

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var div_6 = $.child(div_5);
	var node_10 = $.child(div_6);

	Label(node_10, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Headers');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 2);

	Button(node_11, {
		variant: 'outline',
		size: 'sm',
		onclick: addHeader,
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root_2();
			var node_12 = $.first_child(fragment_6);

			Plus(node_12, { class: 'mr-1 size-4' });
			$.next();
			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	$.reset(div_6);

	var node_13 = $.sibling(div_6, 2);

	{
		var consequent = ($$anchor) => {
			var div_7 = root_4();

			$.each(div_7, 21, () => data().headers, $.index, ($$anchor, header, index) => {
				var div_8 = root_3();
				var node_14 = $.child(div_8);

				Input(node_14, {
					placeholder: 'Header Key',
					class: 'flex-1',
					get value() {
						return $.get(header).key;
					},

					set value($$value) {
						($.get(header).key = $$value);
					}
				});

				var node_15 = $.sibling(node_14, 2);

				Input(node_15, {
					placeholder: 'Header Value',
					class: 'flex-1',
					get value() {
						return $.get(header).value;
					},

					set value($$value) {
						($.get(header).value = $$value);
					}
				});

				var node_16 = $.sibling(node_15, 2);

				Button(node_16, {
					variant: 'ghost',
					size: 'icon',
					onclick: () => removeHeader(index),
					children: ($$anchor, $$slotProps) => {
						X($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});

				$.reset(div_8);
				$.append($$anchor, div_8);
			});

			$.reset(div_7);
			$.append($$anchor, div_7);
		};

		$.if(node_13, ($$render) => {
			if (data().headers && data().headers.length > 0) $$render(consequent);
		});
	}

	$.reset(div_5);

	var node_17 = $.sibling(div_5, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_9 = root_5();
			var node_18 = $.child(div_9);

			Label(node_18, {
				for: 'api-body',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Request Body');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			var node_19 = $.sibling(node_18, 2);

			Textarea(node_19, {
				id: 'api-body',
				placeholder: '{"key": "value"}',
				rows: 4,
				get value() {
					return data().body;
				},

				set value($$value) {
					data(data().body = $$value, true);
				}
			});

			$.reset(div_9);
			$.append($$anchor, div_9);
		};

		$.if(node_17, ($$render) => {
			if (data().method !== "GET" && data().method !== "HEAD") $$render(consequent_1);
		});
	}

	var div_10 = $.sibling(node_17, 2);
	var node_20 = $.child(div_10);

	Switch(node_20, {
		id: 'api-self-signed',
		get checked() {
			return data().allowSelfSignedCert;
		},

		set checked($$value) {
			data(data().allowSelfSignedCert = $$value, true);
		}
	});

	var node_21 = $.sibling(node_20, 2);

	Label(node_21, {
		for: 'api-self-signed',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Allow Self-Signed Certificates');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	$.reset(div_10);

	var div_11 = $.sibling(div_10, 2);
	var node_22 = $.child(div_11);

	Switch(node_22, {
		id: 'api-follow-redirects',
		get checked() {
			return data().follow_redirects;
		},

		set checked($$value) {
			data(data().follow_redirects = $$value, true);
		}
	});

	var node_23 = $.sibling(node_22, 2);

	Label(node_23, {
		for: 'api-follow-redirects',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Follow Redirects');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	$.reset(div_11);

	var div_12 = $.sibling(div_11, 2);
	var node_24 = $.child(div_12);

	Label(node_24, {
		for: 'api-max-redirects',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_8 = $.text('Max Redirects');

			$.append($$anchor, text_8);
		},
		$$slots: { default: true }
	});

	var node_25 = $.sibling(node_24, 2);

	{
		let $0 = $.derived(() => !data().follow_redirects);

		Input(node_25, {
			id: 'api-max-redirects',
			type: 'number',
			min: '0',
			max: '20',
			step: '1',
			get disabled() {
				return $.get($0);
			},

			get value() {
				return data().max_redirects;
			},

			set value($$value) {
				data(data().max_redirects = $$value, true);
			}
		});
	}

	$.reset(div_12);

	var div_13 = $.sibling(div_12, 2);
	var node_26 = $.child(div_13);

	Label(node_26, {
		for: 'api-eval',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_9 = $.text('Custom Eval Function');

			$.append($$anchor, text_9);
		},
		$$slots: { default: true }
	});

	var div_14 = $.sibling(node_26, 2);
	var node_27 = $.child(div_14);

	{
		let $0 = $.derived(javascript);
		let $1 = $.derived(() => mode.current === "dark" ? githubDark : githubLight);

		CodeMirror(node_27, {
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

	$.reset(div_14);

	var p = $.sibling(div_14, 2);

	p.textContent = 'Function receives (statusCode, responseTime, responseRaw, modules) and should return { status, latency }';
	$.reset(div_13);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}