import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { Switch } from "$lib/components/ui/switch/index.js";

var root = $.from_html(`Host <span class="text-destructive">*</span>`, 1);
var root_1 = $.from_html(`Port <span class="text-destructive">*</span>`, 1);
var root_2 = $.from_html(`<div class="flex items-center space-x-2"><!> <!></div>`);
var root_3 = $.from_html(`<div class="space-y-4"><div class="grid grid-cols-3 gap-4"><div class="col-span-2 flex flex-col gap-2"><!> <!></div> <div class="col-span-1 flex flex-col gap-2"><!> <!></div></div> <div class="flex flex-col gap-2"><!> <!> <p class="text-muted-foreground mt-1 text-xs">The fully qualified gRPC service name to health check. Leave empty to check overall server health.</p></div> <div class="flex flex-col gap-2"><!> <!></div> <div class="flex items-center space-x-2"><!> <!></div> <!></div>`);

export default function Monitor_grpc($$anchor, $$props) {
	$.push($$props, true);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let data = $.prop($$props, 'data', 15);

	// Initialize defaults if not set
	if (!data().host) data(data().host = "", true);

	if (!data().port) data(data().port = 50051, true);
	if (!data().service) data(data().service = "", true);
	if (!data().timeout) data(data().timeout = 10000, true);
	if (data().tls === undefined) data(data().tls = false, true);
	if (data().insecure === undefined) data(data().insecure = false, true);

	$.user_effect(() => {
		if (!data().tls) data(data().insecure = false, true);
	});

	var div = root_3();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	Label(node, {
		for: 'grpc-host',
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
		id: 'grpc-host',
		placeholder: 'localhost',
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
		for: 'grpc-port',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root_1();

			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Input(node_3, {
		id: 'grpc-port',
		type: 'number',
		placeholder: '50051',
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
	var node_4 = $.child(div_4);

	Label(node_4, {
		for: 'grpc-service',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Service Name');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Input(node_5, {
		id: 'grpc-service',
		placeholder: 'my.package.ServiceName',
		get value() {
			return data().service;
		},

		set value($$value) {
			data(data().service = $$value, true);
		}
	});

	$.next(2);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_6 = $.child(div_5);

	Label(node_6, {
		for: 'grpc-timeout',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Timeout (ms)');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Input(node_7, {
		id: 'grpc-timeout',
		type: 'number',
		placeholder: '10000',
		get value() {
			return data().timeout;
		},

		set value($$value) {
			data(data().timeout = $$value, true);
		}
	});

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_8 = $.child(div_6);

	Switch(node_8, {
		id: 'grpc-tls',
		get checked() {
			return data().tls;
		},

		set checked($$value) {
			data(data().tls = $$value, true);
		}
	});

	var node_9 = $.sibling(node_8, 2);

	Label(node_9, {
		for: 'grpc-tls',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Use TLS');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_6);

	var node_10 = $.sibling(div_6, 2);

	{
		var consequent = ($$anchor) => {
			var div_7 = root_2();
			var node_11 = $.child(div_7);

			Switch(node_11, {
				id: 'grpc-insecure',
				get checked() {
					return data().insecure;
				},

				set checked($$value) {
					data(data().insecure = $$value, true);
				}
			});

			var node_12 = $.sibling(node_11, 2);

			Label(node_12, {
				for: 'grpc-insecure',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Allow Insecure TLS (skip certificate verification)');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.reset(div_7);
			$.append($$anchor, div_7);
		};

		$.if(node_10, ($$render) => {
			if (data().tls) $$render(consequent);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}