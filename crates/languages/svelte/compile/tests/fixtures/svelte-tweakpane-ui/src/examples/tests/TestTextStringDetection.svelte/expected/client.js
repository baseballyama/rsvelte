import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AutoObject, AutoValue, Color, Text } from '$lib';

var root = $.from_html(`<hr/> <h1>Text Component</h1> <!> <hr/> <h1>Auto Value</h1> <!> <hr/> <h1>Auto Object</h1> <!> <hr/> <h1>Color Component</h1> <!>`, 1);

export default function TestTextStringDetection($$anchor) {
	// Svelte Tweakpane UI's Text component should NOT give color-like string
	// special treatment, use the Color component instead.
	//
	// Related:
	// https://github.com/kitschpatrol/svelte-tweakpane-ui/issues/17
	let strings = {
		sample01: 'Hi',
		sample02: '1',
		sample03: '0x13',
		sample04: '0x1337',
		sample05: '0xEE1337',
		sample06: '0x1337AA',
		sample07: '0x1337AA13',
		sample08: '#13',
		sample09: '#1337',
		sample10: '#EE1337',
		sample11: '#1337AA',
		sample12: '#1337AA13',
		sample13: '238, 19, 55',
		sample14: '238, 19, 55, 0.5',
		sample15: 'rgb(238, 19, 55)',
		sample16: 'rgba(238, 19, 55, 0.5)',
		sample17: 'hsl(238, 19, 55)',
		sample18: 'hsla(238, 19, 55, 0.5)',
		sample19: 'hsv(238, 19, 55)',
		sample20: 'hsva(238, 19, 55, 0.5)',
		sample21: 'True',
		sample22: 'true',
		sample23: 'False',
		sample24: 'false',
		sample25: 'red'
	};

	var fragment = root();
	var node = $.sibling($.first_child(fragment), 4);

	$.each(node, 17, () => Object.keys(strings), $.index, ($$anchor, key) => {
		Text($$anchor, {
			get label() {
				return $.get(key);
			},

			get value() {
				return strings[$.get(key)];
			},

			set value($$value) {
				strings[$.get(key)] = $$value;
			}
		});
	});

	var node_1 = $.sibling(node, 6);

	$.each(node_1, 17, () => Object.keys(strings), $.index, ($$anchor, key) => {
		AutoValue($$anchor, {
			get label() {
				return $.get(key);
			},

			get value() {
				return strings[$.get(key)];
			},

			set value($$value) {
				strings[$.get(key)] = $$value;
			}
		});
	});

	var node_2 = $.sibling(node_1, 6);

	AutoObject(node_2, {
		get object() {
			return strings;
		},

		set object($$value) {
			strings = $$value;
		}
	});

	var node_3 = $.sibling(node_2, 6);

	$.each(node_3, 17, () => Object.keys(strings), $.index, ($$anchor, key) => {
		Color($$anchor, {
			get label() {
				return $.get(key);
			},

			get value() {
				return strings[$.get(key)];
			},

			set value($$value) {
				strings[$.get(key)] = $$value;
			}
		});
	});

	$.append($$anchor, fragment);
}