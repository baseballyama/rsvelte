import * as $ from 'svelte/internal/server';
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import { ValidateIpAddress } from "$lib/clientTools";
import Plus from "@lucide/svelte/icons/plus";
import X from "@lucide/svelte/icons/x";
import { DefaultTCPEval } from "$lib/anywhere.js";
import CodeMirror from "svelte-codemirror-editor";
import { javascript } from "@codemirror/lang-javascript";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";
import { mode } from "mode-watcher";
import { PING_HOST_TYPES } from "$lib/types/ping.js";

export default function Monitor_tcp($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data = { hosts: [], tcpEval: DefaultTCPEval } } = $$props;

		function normalizeHostType(value) {
			return typeof value === "string" && PING_HOST_TYPES.includes(value) ? value : "IP4";
		}

		function inferHostType(host) {
			const inferred = ValidateIpAddress((host || "").trim());

			return inferred === "Invalid" ? null : inferred;
		}

		// Initialize defaults if not set
		if (!Array.isArray(data.hosts) || data.hosts.length === 0) {
			data.hosts = [{ type: "IP4", host: "", port: 80, timeout: 1000 }];
		} else {
			data.hosts = data.hosts.map((host) => ({ ...host, type: normalizeHostType(host?.type) }));
		}

		if (!data.tcpEval) data.tcpEval = DefaultTCPEval;

		function addHost() {
			data.hosts = [
				...data.hosts,
				{ type: "IP4", host: "", port: 80, timeout: 1000 }
			];
		}

		function removeHost(index) {
			data.hosts = data.hosts.filter((_, i) => i !== index);
		}

		function onHostChange(host) {
			const inferredType = inferHostType(host.host);

			if (inferredType) {
				host.type = inferredType;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="space-y-4"><div><div class="mb-2 flex items-center justify-between">`);

			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Hosts <span class="text-destructive">*</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'outline',
				size: 'sm',
				onclick: addHost,
				children: ($$renderer) => {
					Plus($$renderer, { class: 'mr-1 size-4' });
					$$renderer.push(`<!----> Add Host`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			if (data.hosts.length > 0) {
				$$renderer.push(`<!--[0--><div class="space-y-3"><!--[-->`);

				const each_array = $.ensure_array_like(data.hosts);

				for (let index = 0, $$length = each_array.length; index < $$length; index++) {
					let host = each_array[index];

					$$renderer.push(`<div class="bg-muted/50 rounded-lg border p-3"><div class="mb-2 flex items-center justify-between"><span class="text-sm font-medium">Host ${$.escape(index + 1)}</span> `);

					Button($$renderer, {
						variant: 'ghost',
						size: 'icon',
						onclick: () => removeHost(index),
						children: ($$renderer) => {
							X($$renderer, { class: 'size-4' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div> <div class="grid grid-cols-5 gap-2"><div class="flex flex-col gap-2">`);

					Label($$renderer, {
						for: `tcp-type-${$.stringify(index)}`,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Type`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					if (Select.Root) {
						$$renderer.push('<!--[-->');

						Select.Root($$renderer, {
							type: 'single',
							value: normalizeHostType(host.type),
							onValueChange: (v) => host.type = normalizeHostType(v),
							children: ($$renderer) => {
								if (Select.Trigger) {
									$$renderer.push('<!--[-->');

									Select.Trigger($$renderer, {
										id: `tcp-type-${$.stringify(index)}`,
										class: 'w-full',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(normalizeHostType(host.type))}`);
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
										children: ($$renderer) => {
											$$renderer.push(`<!--[-->`);

											const each_array_1 = $.ensure_array_like(PING_HOST_TYPES);

											for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
												let typeOption = each_array_1[$$index];

												if (Select.Item) {
													$$renderer.push('<!--[-->');

													Select.Item($$renderer, {
														value: typeOption,
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(typeOption)}`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
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

					$$renderer.push(`</div> <div class="col-span-2 flex flex-col gap-2">`);

					Label($$renderer, {
						for: `tcp-host-${$.stringify(index)}`,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Host`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Input($$renderer, {
						id: `tcp-host-${$.stringify(index)}`,
						oninput: () => onHostChange(host),
						placeholder: 'example.com',
						get value() {
							return host.host;
						},

						set value($$value) {
							host.host = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----></div> <div class="flex flex-col gap-2">`);

					Label($$renderer, {
						for: `tcp-port-${$.stringify(index)}`,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Port`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Input($$renderer, {
						id: `tcp-port-${$.stringify(index)}`,
						type: 'number',
						placeholder: '80',
						get value() {
							return host.port;
						},

						set value($$value) {
							host.port = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----></div> <div class="flex flex-col gap-2">`);

					Label($$renderer, {
						for: `tcp-timeout-${$.stringify(index)}`,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Timeout (ms)`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Input($$renderer, {
						id: `tcp-timeout-${$.stringify(index)}`,
						type: 'number',
						placeholder: '1000',
						get value() {
							return host.timeout;
						},

						set value($$value) {
							host.timeout = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----></div></div></div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push(`<!--[-1--><p class="text-muted-foreground text-sm">No hosts added. Click "Add Host" to add a TCP target.</p>`);
			}

			$$renderer.push(`<!--]--></div> <div class="flex flex-col gap-2">`);

			Label($$renderer, {
				for: 'tcp-eval',
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
					return data.tcpEval;
				},

				set value($$value) {
					data.tcpEval = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <p class="text-muted-foreground mt-1 text-xs">Function receives (arrayOfPings) and should return { status, latency }</p></div></div>`);
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