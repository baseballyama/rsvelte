import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Inspect } from '@components';

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

	Inspect($$anchor, {
		class: 'not-content mt',
		name: 'gettersAndSetters',
		style: 'flex-basis: 50%',
		get value() {
			return value;
		}
	});

	$.pop();
}