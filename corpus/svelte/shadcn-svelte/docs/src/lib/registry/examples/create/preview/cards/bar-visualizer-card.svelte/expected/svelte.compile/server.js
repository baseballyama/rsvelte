import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import BarVisualizer from "../../elevenlabs/bar-visualizer.svelte";

export default function Bar_visualizer_card($$renderer) {
	let agentState = "speaking";

	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
			children: ($$renderer) => {
				if (Card.Header) {
					$$renderer.push('<!--[-->');

					Card.Header($$renderer, {
						children: ($$renderer) => {
							if (Card.Title) {
								$$renderer.push('<!--[-->');

								Card.Title($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Audio Frequency Visualizer`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Card.Description) {
								$$renderer.push('<!--[-->');

								Card.Description($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Real-time frequency band visualization with animated state transitions`);
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

				if (Card.Content) {
					$$renderer.push('<!--[-->');

					Card.Content($$renderer, {
						children: ($$renderer) => {
							BarVisualizer($$renderer, {
								agentState,
								demo: true,
								barCount: 20,
								minHeight: 15,
								maxHeight: 90,
								class: 'h-40 max-w-full'
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Card.Footer) {
					$$renderer.push('<!--[-->');

					Card.Footer($$renderer, {
						class: 'gap-2',
						children: ($$renderer) => {
							Button($$renderer, {
								size: 'sm',
								variant: agentState === "connecting" ? "default" : "outline",
								onclick: () => agentState = "connecting",
								children: ($$renderer) => {
									$$renderer.push(`<!---->Connecting`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								size: 'sm',
								variant: agentState === "listening" ? "default" : "outline",
								onclick: () => agentState = "listening",
								children: ($$renderer) => {
									$$renderer.push(`<!---->Listening`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								size: 'sm',
								variant: agentState === "speaking" ? "default" : "outline",
								onclick: () => agentState = "speaking",
								children: ($$renderer) => {
									$$renderer.push(`<!---->Speaking`);
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
}