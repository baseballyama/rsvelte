import * as $ from 'svelte/internal/server';
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

export default function Monitor_api($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let { data = void 0 } = $$props;

		// Initialize defaults if not set
		if (!data.url) data.url = "";

		if (!data.method) data.method = "GET";
		if (!data.headers) data.headers = [];
		if (!data.body) data.body = "";
		if (!data.timeout) data.timeout = 10000;
		if (!data.eval) data.eval = DefaultAPIEval;
		if (data.allowSelfSignedCert === undefined) data.allowSelfSignedCert = false;
		if (data.follow_redirects === undefined) data.follow_redirects = true;
		if (data.max_redirects === undefined) data.max_redirects = 5;

		const methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

		function addHeader() {
			data.headers = [...data.headers || [], { key: "", value: "" }];
		}

		function removeHeader(index) {
			data.headers = data.headers?.filter((_, i) => i !== index);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="space-y-4"><div class="grid grid-cols-4 gap-4"><div class="col-span-3 flex flex-col gap-2">`);

			Label($$renderer, {
				for: 'api-url',
				children: ($$renderer) => {
					$$renderer.push(`<!---->URL <span class="text-destructive">*</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				id: 'api-url',
				placeholder: 'https://api.example.com/health',
				get value() {
					return data.url;
				},

				set value($$value) {
					data.url = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="col-span-1 flex flex-col gap-2">`);

			Label($$renderer, {
				for: 'api-method',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Method`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (Select.Root) {
				$$renderer.push('<!--[-->');

				Select.Root($$renderer, {
					type: 'single',
					value: data.method,
					onValueChange: (v) => {
						if (v) data.method = v;
					},

					children: ($$renderer) => {
						if (Select.Trigger) {
							$$renderer.push('<!--[-->');

							Select.Trigger($$renderer, {
								id: 'api-method',
								class: 'w-full',
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(data.method)}`);
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

									const each_array = $.ensure_array_like(methods);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let method = each_array[$$index];

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: method,
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(method)}`);
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

			$$renderer.push(`</div></div> <div class="flex flex-col gap-2">`);

			Label($$renderer, {
				for: 'api-timeout',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Timeout (ms)`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				id: 'api-timeout',
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

			$$renderer.push(`<!----></div> <div><div class="mb-2 flex items-center justify-between">`);

			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Headers`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'outline',
				size: 'sm',
				onclick: addHeader,
				children: ($$renderer) => {
					Plus($$renderer, { class: 'mr-1 size-4' });
					$$renderer.push(`<!----> Add Header`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			if (data.headers && data.headers.length > 0) {
				$$renderer.push(`<!--[0--><div class="space-y-2"><!--[-->`);

				const each_array_1 = $.ensure_array_like(data.headers);

				for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
					let header = each_array_1[index];

					$$renderer.push(`<div class="flex items-center gap-2">`);

					Input($$renderer, {
						placeholder: 'Header Key',
						class: 'flex-1',
						get value() {
							return header.key;
						},

						set value($$value) {
							header.key = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Input($$renderer, {
						placeholder: 'Header Value',
						class: 'flex-1',
						get value() {
							return header.value;
						},

						set value($$value) {
							header.value = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						variant: 'ghost',
						size: 'icon',
						onclick: () => removeHeader(index),
						children: ($$renderer) => {
							X($$renderer, { class: 'size-4' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			if (data.method !== "GET" && data.method !== "HEAD") {
				$$renderer.push(`<!--[0--><div class="flex flex-col gap-2">`);

				Label($$renderer, {
					for: 'api-body',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Request Body`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Textarea($$renderer, {
					id: 'api-body',
					placeholder: '{"key": "value"}',
					rows: 4,
					get value() {
						return data.body;
					},

					set value($$value) {
						data.body = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="flex items-center space-x-2">`);

			Switch($$renderer, {
				id: 'api-self-signed',
				get checked() {
					return data.allowSelfSignedCert;
				},

				set checked($$value) {
					data.allowSelfSignedCert = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Label($$renderer, {
				for: 'api-self-signed',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Allow Self-Signed Certificates`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="flex items-center space-x-2">`);

			Switch($$renderer, {
				id: 'api-follow-redirects',
				get checked() {
					return data.follow_redirects;
				},

				set checked($$value) {
					data.follow_redirects = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Label($$renderer, {
				for: 'api-follow-redirects',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Follow Redirects`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="flex flex-col gap-2">`);

			Label($$renderer, {
				for: 'api-max-redirects',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Max Redirects`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				id: 'api-max-redirects',
				type: 'number',
				min: '0',
				max: '20',
				step: '1',
				disabled: !data.follow_redirects,
				get value() {
					return data.max_redirects;
				},

				set value($$value) {
					data.max_redirects = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="flex flex-col gap-2">`);

			Label($$renderer, {
				for: 'api-eval',
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

			$$renderer.push(`<!----></div> <p class="text-muted-foreground mt-1 text-xs">Function receives (statusCode, responseTime, responseRaw, modules) and should return { status, latency }</p></div></div>`);
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