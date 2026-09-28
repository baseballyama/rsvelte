import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import LiveWaveform from "./live-waveform.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Waveform_demo($$anchor) {
	let active = $.state(false);
	let processing = $.state(true);
	let mode = $.state("static");

	function handleToggleActive() {
		$.set(active, !$.get(active));

		if ($.get(active)) {
			$.set(processing, false);
		}
	}

	function handleToggleProcessing() {
		$.set(processing, !$.get(processing));

		if ($.get(processing)) {
			$.set(active, false);
		}
	}

	Example($$anchor, {
		title: 'Waveform',
		class: 'items-center justify-center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
							Card_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
										Card_Title($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Live Audio Waveform');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
										Card_Description($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Real-time microphone input visualization with audio reactivity');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_1, 2);

						$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									LiveWaveform($$anchor, {
										get active() {
											return $.get(active);
										},

										get processing() {
											return $.get(processing);
										},
										height: 80,
										barWidth: 3,
										barGap: 2,
										get mode() {
											return $.get(mode);
										},
										fadeEdges: true,
										barColor: 'gray',
										historySize: 120
									});
								},
								$$slots: { default: true }
							});
						});

						var node_5 = $.sibling(node_4, 2);

						$.component(node_5, () => Card.Footer, ($$anchor, Card_Footer) => {
							Card_Footer($$anchor, {
								class: 'gap-2',
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_1();
									var node_6 = $.first_child(fragment_5);

									{
										let $0 = $.derived(() => $.get(active) ? "default" : "outline");

										Button(node_6, {
											size: 'sm',
											get variant() {
												return $.get($0);
											},
											onclick: handleToggleActive,
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text();

												$.template_effect(() => $.set_text(text_2, `${$.get(active) ? "Stop" : "Start"} Listening`));
												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									}

									var node_7 = $.sibling(node_6, 2);

									{
										let $0 = $.derived(() => $.get(processing) ? "default" : "outline");

										Button(node_7, {
											size: 'sm',
											get variant() {
												return $.get($0);
											},
											onclick: handleToggleProcessing,
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text();

												$.template_effect(() => $.set_text(text_3, `${$.get(processing) ? "Stop" : "Start"} Processing`));
												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									}

									var node_8 = $.sibling(node_7, 2);

									Button(node_8, {
										size: 'sm',
										variant: 'outline',
										onclick: () => $.set(mode, $.get(mode) === "static" ? "scrolling" : "static", true),
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text();

											$.template_effect(() => $.set_text(text_4, $.get(mode) === "static" ? "Static" : "Scrolling"));
											$.append($$anchor, text_4);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}