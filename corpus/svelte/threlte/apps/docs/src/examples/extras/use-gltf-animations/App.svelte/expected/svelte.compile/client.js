import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Scene from './Scene.svelte';
import { Button, Folder, Pane } from 'svelte-tweakpane-ui';
import { Canvas } from '@threlte/core';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="svelte-1esaq0j"><!></div>`, 1);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	const $actions = () => $.store_get($.get(actions), '$actions', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let scene = $.state(void 0);
	let animating = $.state(false);
	const actions = $.derived(() => $.get(scene)?.actions);
	const action = $.derived(() => $actions()?.['Take 001']);

	// start animating as soon as the action is ready
	$.user_effect(() => {
		$.get(action)?.play();
		$.set(animating, true);
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	Pane(node, {
		position: 'fixed',
		title: 'littlest tokyo',
		children: ($$anchor, $$slotProps) => {
			Folder($$anchor, {
				title: 'animation',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Button(node_1, {
						get disabled() {
							return $.get(animating);
						},
						title: 'play',
						$$events: {
							click: () => {
								$.get(action)?.play();
								$.set(animating, true);
							}
						}
					});

					var node_2 = $.sibling(node_1, 2);

					{
						let $0 = $.derived(() => !$.get(animating));

						Button(node_2, {
							get disabled() {
								return $.get($0);
							},
							title: 'stop',
							$$events: {
								click: () => {
									$.get(action)?.stop();
									$.set(animating, false);
								}
							}
						});
					}

					var node_3 = $.sibling(node_2, 2);

					{
						let $0 = $.derived(() => !$.get(animating));

						Button(node_3, {
							get disabled() {
								return $.get($0);
							},
							title: 'reset',
							$$events: {
								click: () => {
									$.get(action)?.reset();
								}
							}
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_4 = $.child(div);

	Canvas(node_4, {
		children: ($$anchor, $$slotProps) => {
			$.bind_this(Scene($$anchor, {}), ($$value) => $.set(scene, $$value), () => $.get(scene));
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}