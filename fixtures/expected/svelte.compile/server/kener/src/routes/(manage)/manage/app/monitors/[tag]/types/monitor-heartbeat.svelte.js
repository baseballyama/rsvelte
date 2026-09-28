import * as $ from 'svelte/internal/server';
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

export default function Monitor_heartbeat($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data = void 0, tag = "" } = $$props;

		// Initialize defaults if not set
		if (!data.degradedRemainingMinutes) data.degradedRemainingMinutes = 5;

		if (!data.downRemainingMinutes) data.downRemainingMinutes = 10;

		// Generate heartbeat URL
		let heartbeatUrl = $.derived(() => tag
			? window.location.origin + clientResolve(resolve, `/ext/heartbeat/${tag}/${data.secretString}`)
			: "Save the monitor first to get the heartbeat URL");

		//refresh secret string and thus heartbeat URL
		function refreshSecret() {
			data.secretString = randomName() + "-" + randomName();
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="space-y-4"><div class="grid grid-cols-2 gap-4"><div class="flex flex-col">`);

			if (InputGroup.Root) {
				$$renderer.push('<!--[-->');

				InputGroup.Root($$renderer, {
					children: ($$renderer) => {
						if (InputGroup.Addon) {
							$$renderer.push('<!--[-->');

							InputGroup.Addon($$renderer, {
								children: ($$renderer) => {
									if (InputGroup.Text) {
										$$renderer.push('<!--[-->');

										InputGroup.Text($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<span class="text-degraded">DEGRADED</span> if no heartbeat received for`);
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
								class: 'text-right',
								id: 'hb-degraded',
								placeholder: '5',
								get value() {
									return data.degradedRemainingMinutes;
								},

								set value($$value) {
									data.degradedRemainingMinutes = $$value;
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
									if (InputGroup.Text) {
										$$renderer.push('<!--[-->');

										InputGroup.Text($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->minutes`);
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

			$$renderer.push(` <p class="text-muted-foreground mt-1 text-xs">Mark as DEGRADED if no heartbeat received for this many minutes</p></div> <div class="flex flex-col">`);

			if (InputGroup.Root) {
				$$renderer.push('<!--[-->');

				InputGroup.Root($$renderer, {
					children: ($$renderer) => {
						if (InputGroup.Addon) {
							$$renderer.push('<!--[-->');

							InputGroup.Addon($$renderer, {
								children: ($$renderer) => {
									if (InputGroup.Text) {
										$$renderer.push('<!--[-->');

										InputGroup.Text($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<span class="text-down">DOWN</span> if no heartbeat received for`);
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
								class: 'text-right',
								id: 'hb-down',
								placeholder: '10',
								get value() {
									return data.downRemainingMinutes;
								},

								set value($$value) {
									data.downRemainingMinutes = $$value;
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
									if (InputGroup.Text) {
										$$renderer.push('<!--[-->');

										InputGroup.Text($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->minutes`);
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

			$$renderer.push(` <p class="text-muted-foreground mt-1 text-xs">Mark as DOWN if no heartbeat received for this many minutes</p></div></div> <div class="flex flex-col gap-2">`);

			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Heartbeat URL`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div><div class="flex items-center gap-2">`);

			if (InputGroup.Root) {
				$$renderer.push('<!--[-->');

				InputGroup.Root($$renderer, {
					children: ($$renderer) => {
						if (InputGroup.Addon) {
							$$renderer.push('<!--[-->');

							InputGroup.Addon($$renderer, {
								children: ($$renderer) => {
									if (InputGroup.Text) {
										$$renderer.push('<!--[-->');

										InputGroup.Text($$renderer, {
											children: ($$renderer) => {
												Badge($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->GET | POST`);
													},
													$$slots: { default: true }
												});
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
								class: 'text-muted-foreground',
								id: 'hb-secret',
								readonly: true,
								get value() {
									return heartbeatUrl();
								},

								set value($$value) {
									heartbeatUrl($$value);
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
											variant: 'secondary',
											onclick: refreshSecret,
											children: ($$renderer) => {
												$$renderer.push(`<!---->New URL`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									CopyButton($$renderer, {
										variant: 'ghost',
										size: 'icon-sm',
										text: heartbeatUrl(),
										children: ($$renderer) => {
											Copy($$renderer, { class: 'size-4' });
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
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

			$$renderer.push(`</div> <p class="text-muted-foreground mt-1 text-xs">Send a GET or POST request to this URL to record a heartbeat</p></div></div></div>`);
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