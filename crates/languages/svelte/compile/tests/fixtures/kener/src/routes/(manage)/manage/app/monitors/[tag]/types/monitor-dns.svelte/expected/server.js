import * as $ from 'svelte/internal/server';
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import { Switch } from "$lib/components/ui/switch/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import * as InputGroup from "$lib/components/ui/input-group/index.js";
import Plus from "@lucide/svelte/icons/plus";
import X from "@lucide/svelte/icons/x";
import { AllRecordTypes } from "$lib/clientTools";

export default function Monitor_dns($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let { data = void 0 } = $$props;

		// Initialize defaults if not set
		if (!data.host) data.host = "";

		if (!data.nameServer) data.nameServer = "";
		if (!data.lookupRecord) data.lookupRecord = "A";
		if (!data.matchType) data.matchType = "ANY";
		if (!data.transport) data.transport = "UDP";
		if (!data.tlsPort) data.tlsPort = 853;
		if (!data.tlsServername) data.tlsServername = "";
		if (data.allowSelfSignedCert === undefined) data.allowSelfSignedCert = false;
		if (!data.values) data.values = [""];

		const recordTypes = Object.keys(AllRecordTypes);
		const usesTls = $.derived(() => data.transport === "TLS");

		function addValue() {
			data.values = [...data.values, ""];
		}

		function removeValue(index) {
			data.values = data.values.filter((_, i) => i !== index);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="space-y-4"><div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-2">`);

			Label($$renderer, {
				for: 'dns-transport',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Transport`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (Select.Root) {
				$$renderer.push('<!--[-->');

				Select.Root($$renderer, {
					type: 'single',
					value: data.transport,
					onValueChange: (v) => {
						if (v) data.transport = v;
					},

					children: ($$renderer) => {
						if (Select.Trigger) {
							$$renderer.push('<!--[-->');

							Select.Trigger($$renderer, {
								id: 'dns-transport',
								class: 'w-full',
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(data.transport === "TLS" ? "DNS-over-TLS" : "UDP")}`);
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
									if (Select.Item) {
										$$renderer.push('<!--[-->');

										Select.Item($$renderer, {
											value: 'UDP',
											children: ($$renderer) => {
												$$renderer.push(`<!---->UDP - Standard DNS (port 53)`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Select.Item) {
										$$renderer.push('<!--[-->');

										Select.Item($$renderer, {
											value: 'TLS',
											children: ($$renderer) => {
												$$renderer.push(`<!---->TLS - DNS-over-TLS (port 853)`);
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
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div> <div class="flex flex-col gap-2">`);

			Label($$renderer, {
				for: 'dns-host',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Host <span class="text-destructive">*</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				id: 'dns-host',
				placeholder: 'example.com',
				get value() {
					return data.host;
				},

				set value($$value) {
					data.host = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div></div> <div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-2">`);

			Label($$renderer, {
				for: 'dns-nameserver',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Name Server `);

					if (usesTls()) {
						$$renderer.push(`<!--[0--><span class="text-destructive">*</span>`);
					} else {
						$$renderer.push(`<!--[-1-->(optional)`);
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				id: 'dns-nameserver',
				placeholder: usesTls()
					? "1.1.1.1 or dns.example.com"
					: "Leave empty for authoritative lookup",

				get value() {
					return data.nameServer;
				},

				set value($$value) {
					data.nameServer = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			if (usesTls()) {
				$$renderer.push(`<!--[0--><p class="text-muted-foreground text-xs">DoT resolver address. For IP resolvers, set TLS Server Name when required (e.g. 8.8.8.8 → dns.google).</p>`);
			} else {
				$$renderer.push(`<!--[-1--><p class="text-muted-foreground text-xs">Leave blank to use authoritative DNS nameservers automatically.</p>`);
			}

			$$renderer.push(`<!--]--></div> `);

			if (usesTls()) {
				$$renderer.push(`<!--[0--><div class="flex flex-col gap-2">`);

				Label($$renderer, {
					for: 'dns-tls-port',
					children: ($$renderer) => {
						$$renderer.push(`<!---->TLS Port`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Input($$renderer, {
					id: 'dns-tls-port',
					type: 'number',
					min: '1',
					max: '65535',
					placeholder: '853',
					get value() {
						return data.tlsPort;
					},

					set value($$value) {
						data.tlsPort = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			if (usesTls()) {
				$$renderer.push(`<!--[0--><div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-2">`);

				Label($$renderer, {
					for: 'dns-tls-servername',
					children: ($$renderer) => {
						$$renderer.push(`<!---->TLS Server Name (optional)`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Input($$renderer, {
					id: 'dns-tls-servername',
					placeholder: 'dns.google',
					get value() {
						return data.tlsServername;
					},

					set value($$value) {
						data.tlsServername = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">SNI hostname for TLS. Required for many public resolvers when using an IP address.</p></div> <div class="flex items-center gap-3 pt-6">`);

				Switch($$renderer, {
					id: 'dns-self-signed',
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
					for: 'dns-self-signed',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Allow self-signed TLS certificates`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-2">`);

			Label($$renderer, {
				for: 'dns-record',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Lookup Record`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (Select.Root) {
				$$renderer.push('<!--[-->');

				Select.Root($$renderer, {
					type: 'single',
					value: data.lookupRecord,
					onValueChange: (v) => {
						if (v) data.lookupRecord = v;
					},

					children: ($$renderer) => {
						if (Select.Trigger) {
							$$renderer.push('<!--[-->');

							Select.Trigger($$renderer, {
								id: 'dns-record',
								class: 'w-full',
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(data.lookupRecord)}`);
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

									const each_array = $.ensure_array_like(recordTypes);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let recordType = each_array[$$index];

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: recordType,
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(recordType)}`);
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

			$$renderer.push(`</div> <div class="flex flex-col gap-2">`);

			Label($$renderer, {
				for: 'dns-matchtype',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Match Type`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (Select.Root) {
				$$renderer.push('<!--[-->');

				Select.Root($$renderer, {
					type: 'single',
					value: data.matchType,
					onValueChange: (v) => {
						if (v) data.matchType = v;
					},

					children: ($$renderer) => {
						if (Select.Trigger) {
							$$renderer.push('<!--[-->');

							Select.Trigger($$renderer, {
								id: 'dns-matchtype',
								class: 'w-full',
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(data.matchType)}`);
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
									if (Select.Item) {
										$$renderer.push('<!--[-->');

										Select.Item($$renderer, {
											value: 'ANY',
											children: ($$renderer) => {
												$$renderer.push(`<!---->ANY - At least one value matches`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Select.Item) {
										$$renderer.push('<!--[-->');

										Select.Item($$renderer, {
											value: 'ALL',
											children: ($$renderer) => {
												$$renderer.push(`<!---->ALL - All values must match`);
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
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div></div> <div><div class="mb-2 flex items-center justify-between">`);

			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Expected Values <span class="text-destructive">*</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'outline',
				size: 'sm',
				onclick: addValue,
				children: ($$renderer) => {
					Plus($$renderer, { class: 'mr-1 size-4' });
					$$renderer.push(`<!----> ${$.escape(data.values.length > 0 ? "Add More Values" : "Add Value")}`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			if (data.values.length > 0) {
				$$renderer.push(`<!--[0--><div class="space-y-2"><!--[-->`);

				const each_array_1 = $.ensure_array_like(data.values);

				for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
					let value = each_array_1[index];

					if (InputGroup.Root) {
						$$renderer.push('<!--[-->');

						InputGroup.Root($$renderer, {
							children: ($$renderer) => {
								if (InputGroup.Addon) {
									$$renderer.push('<!--[-->');

									InputGroup.Addon($$renderer, {
										class: '',
										children: ($$renderer) => {
											if (InputGroup.Text) {
												$$renderer.push('<!--[-->');

												InputGroup.Text($$renderer, {
													class: 'border-r-2 pr-2',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Value ${$.escape(index + 1)}`);
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

								$$renderer.push(` `);

								if (InputGroup.Input) {
									$$renderer.push('<!--[-->');

									InputGroup.Input($$renderer, {
										placeholder: 'Expected DNS value',
										get value() {
											return data.values[index];
										},

										set value($$value) {
											data.values[index] = $$value;
											$$settled = false;
										}
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (InputGroup.Addon) {
									$$renderer.push('<!--[-->');

									InputGroup.Addon($$renderer, {
										align: 'inline-end',
										children: ($$renderer) => {
											if (InputGroup.Button) {
												$$renderer.push('<!--[-->');

												InputGroup.Button($$renderer, {
													variant: 'ghost',
													size: 'icon-xs',
													onclick: () => removeValue(index),
													children: ($$renderer) => {
														X($$renderer, { class: 'size-4' });
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
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push(`<!--[-1--><p class="text-muted-foreground text-sm">No values added. Click "Add Value" to add expected DNS response values.</p>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
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