import * as $ from 'svelte/internal/server';
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import * as InputGroup from "$lib/components/ui/input-group/index.js";

export default function Monitor_ssl($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let { data = void 0 } = $$props;

		// Initialize defaults if not set
		if (!data.host) data.host = "";

		if (!data.port) data.port = "443";
		if (!data.degradedRemainingHours) data.degradedRemainingHours = 168; // 7 days
		if (!data.downRemainingHours) data.downRemainingHours = 24; // 1 day

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="space-y-4"><div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-2">`);

			Label($$renderer, {
				for: 'ssl-host',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Host <span class="text-destructive">*</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				id: 'ssl-host',
				placeholder: 'example.com',
				get value() {
					return data.host;
				},

				set value($$value) {
					data.host = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="flex flex-col gap-2">`);

			Label($$renderer, {
				for: 'ssl-port',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Port`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				id: 'ssl-port',
				placeholder: '443',
				get value() {
					return data.port;
				},

				set value($$value) {
					data.port = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div></div> <div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-2"><div>`);

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
												$$renderer.push(`<span class="text-degraded">Degraded</span> when hours remaining expires in`);
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
								id: 'ssl-degraded',
								type: 'number',
								class: 'text-right',
								placeholder: '168',
								get value() {
									return data.degradedRemainingHours;
								},

								set value($$value) {
									data.degradedRemainingHours = $$value;
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
												$$renderer.push(`<!---->hours`);
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

			$$renderer.push(` <p class="text-muted-foreground mt-1 text-xs">Certificate expiring within this many hours will be marked as DEGRADED</p></div></div> <div class="flex flex-col gap-2"><div>`);

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
												$$renderer.push(`<span class="text-down">Down</span> when hours remaining expires In`);
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
								id: 'ssl-down',
								class: 'text-right',
								type: 'number',
								placeholder: '24',
								get value() {
									return data.downRemainingHours;
								},

								set value($$value) {
									data.downRemainingHours = $$value;
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
												$$renderer.push(`<!---->hours`);
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

			$$renderer.push(` <p class="text-muted-foreground mt-1 text-xs">Certificate expiring within this many hours will be marked as DOWN</p></div></div></div></div>`);
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