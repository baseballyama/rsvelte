import * as $ from 'svelte/internal/server';
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { Switch } from "$lib/components/ui/switch/index.js";

export default function Monitor_grpc($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let { data = void 0 } = $$props;

		// Initialize defaults if not set
		if (!data.host) data.host = "";

		if (!data.port) data.port = 50051;
		if (!data.service) data.service = "";
		if (!data.timeout) data.timeout = 10000;
		if (data.tls === undefined) data.tls = false;
		if (data.insecure === undefined) data.insecure = false;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="space-y-4"><div class="grid grid-cols-3 gap-4"><div class="col-span-2 flex flex-col gap-2">`);

			Label($$renderer, {
				for: 'grpc-host',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Host <span class="text-destructive">*</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				id: 'grpc-host',
				placeholder: 'localhost',
				get value() {
					return data.host;
				},

				set value($$value) {
					data.host = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="col-span-1 flex flex-col gap-2">`);

			Label($$renderer, {
				for: 'grpc-port',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Port <span class="text-destructive">*</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				id: 'grpc-port',
				type: 'number',
				placeholder: '50051',
				get value() {
					return data.port;
				},

				set value($$value) {
					data.port = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div></div> <div class="flex flex-col gap-2">`);

			Label($$renderer, {
				for: 'grpc-service',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Service Name`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				id: 'grpc-service',
				placeholder: 'my.package.ServiceName',
				get value() {
					return data.service;
				},

				set value($$value) {
					data.service = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <p class="text-muted-foreground mt-1 text-xs">The fully qualified gRPC service name to health check. Leave empty to check overall server health.</p></div> <div class="flex flex-col gap-2">`);

			Label($$renderer, {
				for: 'grpc-timeout',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Timeout (ms)`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				id: 'grpc-timeout',
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

			$$renderer.push(`<!----></div> <div class="flex items-center space-x-2">`);

			Switch($$renderer, {
				id: 'grpc-tls',
				get checked() {
					return data.tls;
				},

				set checked($$value) {
					data.tls = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Label($$renderer, {
				for: 'grpc-tls',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Use TLS`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			if (data.tls) {
				$$renderer.push(`<!--[0--><div class="flex items-center space-x-2">`);

				Switch($$renderer, {
					id: 'grpc-insecure',
					get checked() {
						return data.insecure;
					},

					set checked($$value) {
						data.insecure = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Label($$renderer, {
					for: 'grpc-insecure',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Allow Insecure TLS (skip certificate verification)`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
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