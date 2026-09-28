import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import BarVisualizer from "./bar-visualizer.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Bar_visualizer_demo($$anchor) {
	let agentState = $.state("speaking");

	Example($$anchor, {
		title: 'Bar Visualizer',
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

												var text = $.text('Audio Frequency Visualizer');

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

												var text_1 = $.text('Real-time frequency band visualization with animated state transitions');

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
									BarVisualizer($$anchor, {
										get agentState() {
											return $.get(agentState);
										},
										demo: true,
										barCount: 20,
										minHeight: 15,
										maxHeight: 90,
										class: 'h-40 max-w-full'
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
										let $0 = $.derived(() => $.get(agentState) === "connecting" ? "default" : "outline");

										Button(node_6, {
											size: 'sm',
											get variant() {
												return $.get($0);
											},
											onclick: () => $.set(agentState, "connecting"),
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Connecting');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									}

									var node_7 = $.sibling(node_6, 2);

									{
										let $0 = $.derived(() => $.get(agentState) === "listening" ? "default" : "outline");

										Button(node_7, {
											size: 'sm',
											get variant() {
												return $.get($0);
											},
											onclick: () => $.set(agentState, "listening"),
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Listening');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									}

									var node_8 = $.sibling(node_7, 2);

									{
										let $0 = $.derived(() => $.get(agentState) === "speaking" ? "default" : "outline");

										Button(node_8, {
											size: 'sm',
											get variant() {
												return $.get($0);
											},
											onclick: () => $.set(agentState, "speaking"),
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('Speaking');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									}

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