import * as $ from 'svelte/internal/server';
import { Inspect } from '$lib/index.js';
import { getContext } from 'svelte';
import Code from '../Code.svelte';
import Stack from '../Stack.svelte';
import rawCode from './gettersandsetters.txt?raw';

export default function GettersAndSetters($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { code } = $$props;

		let value = {
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
		};

		getContext('toc')?.set('Getters & Setters', 'getters');

		$$renderer.push(`<div class="flex col"><h3 id="getters">Getters and Setters</h3> <p>Getters and setters render as interactive nodes as to avoid executing potential side effects
    until they are manually called.<br/> Setters can be called with valid JSON input.</p> `);

		Stack($$renderer, {
			children: ($$renderer) => {
				Code($$renderer, {
					code: rawCode,
					children: ($$renderer) => {
						$$renderer.push(`${$.html(code)}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				Inspect($$renderer, { name: 'gettersAndSetters', style: 'flex-basis: 50%', value });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}