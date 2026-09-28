import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Inspect } from '$lib/index.js';
import { getContext } from 'svelte';
import Code from '../Code.svelte';
import Stack from '../Stack.svelte';
import rawCode from './gettersandsetters.txt?raw';

var root = $.from_html(`<!> <!>`, 1);

var root_1 = $.from_html(`<div class="flex col"><h3 id="getters">Getters and Setters</h3> <p>Getters and setters render as interactive nodes as to avoid executing potential side effects
    until they are manually called.<br/> Setters can be called with valid JSON input.</p> <!></div>`);

export default function GettersAndSetters($$anchor, $$props) {
	$.push($$props, true);

	let value = $.proxy({
		name: {
			first: 'Ringo',
			last: 'Starr',
			get full() {
				return `${this.first} ${this.last}`;
			},

			set firstName(value) {
				// eslint-disable-next-line no-console
				console.assert(typeof value === 'string');

				this.first = value;
			}
		},
		value: 10,
		multiplier: 4.2,
		lastChecked: '',
		get current() {
			this.readValues.push(this.value);
			this.lastChecked = new Date().toUTCString();

			return this.value;
		},

		set current(value) {
			if (typeof value !== 'number') throw 'not a number';

			this.value = value;
		},

		get double() {
			this.readValues.push(this.value * 2);

			return this.value * 2;
		},

		set currentMultiplier(value) {
			if (typeof value !== 'number') throw 'not a number';

			this.multiplier = value;
		},

		get multiplied() {
			const result = this.value * this.multiplier;

			this.readValues.push(result);

			return result;
		},

		get lastReadValue() {
			return this.readValues.pop();
		},
		readValues: [],
		set errorSetter(value) {
			JSON.parse('{ invalid }');
		},

		get aPromise() {
			return new Promise((resolve) => {
				setTimeout(
					() => {
						resolve(this.current);
					},
					1000
				);
			});
		}
	});

	getContext('toc')?.set('Getters & Setters', 'getters');

	var div = root_1();
	var node = $.sibling($.child(div), 4);

	Stack(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Code(node_1, {
				get code() {
					return rawCode;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					$.html(node_2, () => $$props.code);
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_1, 2);

			Inspect(node_3, {
				name: 'gettersAndSetters',
				style: 'flex-basis: 50%',
				get value() {
					return value;
				}
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}