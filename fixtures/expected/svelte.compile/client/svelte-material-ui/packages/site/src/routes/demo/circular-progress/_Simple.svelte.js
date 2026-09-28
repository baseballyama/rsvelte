import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, onDestroy } from 'svelte';
import CircularProgress from '@smui/circular-progress';
import Checkbox from '@smui/checkbox';
import FormField from '@smui/form-field';
import Button from '@smui/button';

var root = $.from_html(`<div style="display: flex; justify-content: center"><!></div> <br/> <!> <!>`, 1);

export default function _Simple($$anchor, $$props) {
	$.push($$props, true);

	let progress = $.state(0);
	let closed = $.state(false);
	let timer;

	onMount(reset);

	onDestroy(() => {
		clearInterval(timer);
	});

	function reset() {
		$.set(progress, 0);
		$.set(closed, false);
		clearInterval(timer);

		timer = setInterval(
			() => {
				$.set(progress, $.get(progress) + 0.01);

				if ($.get(progress) >= 1) {
					$.set(progress, 1);
					$.set(closed, true);
					clearInterval(timer);
				}
			},
			100
		);
	}

	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	CircularProgress(node, {
		style: 'height: 48px; width: 48px;',
		get progress() {
			return $.get(progress);
		},

		get closed() {
			return $.get(closed);
		}
	});

	$.reset(div);

	var node_1 = $.sibling(div, 4);

	Button(node_1, {
		onclick: reset,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Reset');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	{
		const label = ($$anchor) => {
			$.next();

			var text_1 = $.text('Closed');

			$.append($$anchor, text_1);
		};

		FormField(node_2, {
			label,
			children: ($$anchor, $$slotProps) => {
				Checkbox($$anchor, {
					get checked() {
						return $.get(closed);
					},

					set checked($$value) {
						$.set(closed, $$value, true);
					}
				});
			},
			$$slots: { label: true, default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}