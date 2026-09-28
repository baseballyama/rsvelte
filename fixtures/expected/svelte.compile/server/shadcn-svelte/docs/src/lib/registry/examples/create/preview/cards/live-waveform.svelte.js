import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import LiveWaveform from "../../elevenlabs/live-waveform.svelte";

export default function Live_waveform($$renderer) {
	let active = false;
	let processing = true;
	let mode = "static";

	function handleToggleActive() {
		active = !active;

		if (active) {
			processing = false;
		}
	}

	function handleToggleProcessing() {
		processing = !processing;

		if (processing) {
			active = false;
		}
	}

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
										$$renderer.push(`<!---->Live Audio Waveform`);
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
										$$renderer.push(`<!---->Real-time microphone input visualization with audio reactivity`);
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
							LiveWaveform($$renderer, {
								active,
								processing,
								height: 80,
								barWidth: 3,
								barGap: 2,
								mode,
								fadeEdges: true,
								barColor: 'gray',
								historySize: 120
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
								variant: active ? "default" : "outline",
								onclick: handleToggleActive,
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(active ? "Stop" : "Start")} Listening`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								size: 'sm',
								variant: processing ? "default" : "outline",
								onclick: handleToggleProcessing,
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(processing ? "Stop" : "Start")} Processing`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								size: 'sm',
								variant: 'outline',
								onclick: () => mode = mode === "static" ? "scrolling" : "static",
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(mode === "static" ? "Static" : "Scrolling")}`);
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