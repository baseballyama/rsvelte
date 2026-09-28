import * as $ from 'svelte/internal/server';
import { browser } from '$app/environment';
import Inspect from '$lib/Inspect.svelte';
import { Observable, interval } from 'rxjs';
import { readable, writable } from 'svelte/store';
import sprite from './media/squirtle.png';
import audio from './media/squirtle_cry.ogg';
import { GLOBAL_OPTIONS_CONTEXT } from '$lib/options.svelte.js';
import { getContext } from 'svelte';

export default function AllTypes($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { seeFlashing = false, $$slots, $$events, ...props } = $$props;

		class Greeter {
			static staticProperty = 'hi';
			nonStatic = 'yo';
			name = 'World';

			constructor(name) {
				this.name = name;
			}
		}

		function* fibonacci() {
			let current = 1;
			let next = 1;

			while (true) {
				yield current;
				[current, next] = [next, current + next];
			}
		}

		const string1 = 'Que ma joie demeure';
		const segmenterFrGrapheme = new Intl.Segmenter('fr', { granularity: 'word' });
		const segments = segmenterFrGrapheme.segment(string1)[Symbol.iterator]();

		class StringSubclass extends String {
			static staticprop = { test: 1 };
			anotherProp = { test: 1 };

			constructor(value) {
				super(value);
			}
		}

		function customStore(initialValue = 0) {
			let interval;

			let val = writable(initialValue, () => {
				if (browser) {
					interval = window.setInterval(
						() => {
							val.update((n) => n + 1);
						},
						500
					);
				}

				return () => {
					clearInterval(interval);
				};
			});

			return {
				...val,
				set value(v) {
					val.set(v);
				}
			};
		}

		const o = new Observable((subscriber) => {
			subscriber.next(1);
			subscriber.next(2);
			subscriber.next(3);

			setTimeout(
				() => {
					subscriber.next(4);
					subscriber.complete();
				},
				1000
			);
		});

		const fakeStore = { subscribe: () => {} };

		const allTypes = {
			lotsOfChildren: [
				'a\nb',
				'a\nb',
				'a\nb',
				'a\nb',
				'a\nb',
				'a\nb',
				'a\nb',
				'a\nb',
				'a\nb',
				'a\nb',
				'a\nb',
				'a\nb',
				'a\nb',
				'a\nb',
				'a\nb',
				'a\nb',
				'a\nb',
				'a\nb',
				'a\nb',
				'a\nb',
				'a\nb',
				'a\nb',
				'a\nb',
				'a\nb',
				'a\nb',
				'a\nb',
				'a\nb',
				'a\nb',
				'a\nb',
				'a\nb',
				'a\nb',
				'a\nb',
				'a\nb',
				'a\nb',
				'f00\n\tbar',
				'f00\n\tbar',
				'f00\n\tbar',
				'f00\n\tbar',
				'f00\n\tbar',
				'f00\n\tbar',
				'f00\n\tbar',
				'f00\n\tbar',
				'f00\n\tbar',
				'f00\n\tbar',
				'f00\n\tbar',
				'f00\n\tbar',
				'f00\n\tbar',
				'f00\n\tbar',
				'f00\n\tbar',
				'f00\n\tbar',
				'f00\n\tbar',
				'f00\n\tbar',
				'f00\n\tbar'
			],
			stores: {
				a: readable('test'),
				ab: writable('test'),
				b: writable({ testing: 'haha' }),
				b2: writable({ testing: 'haha' }),
				c: customStore(),
				o,
				interval: interval(1230),
				fakeStore
			},
			strings: {
				basic: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
				multilineString: 'check\n\tthis\n\t\tout',
				urlString: 'https://zombo.com',
				mediaStrings: { image: sprite, audio }
			},
			bigint: 9007199254740991n,
			bools: [true, false],
			symb: Symbol('abcd'),
			reg: /([\w.\-_]+)?\w+@[\w-_]+(\.\w+){1,}/gim,
			nil: [undefined, null, NaN, Infinity],
			array: [1, 2, 3],
			set: new Set([1, 2, 3]),
			map: new Map([
				[0, 0],
				['ya', 'yayaya'],
				[{ id: 123 }, 1],
				[[1, 2, 3], 2],
				[Symbol('key'), 'value'],
				[
					Promise.resolve('foo'),
					{
						get something() {
							return 'something';
						}
					}
				],
				[null, 'null'],
				[undefined, 'undef']
			]),
			date: new Date('1970-01-02 03:45:57'),
			url: new URL('https://alicebob.website/?ref=abcdefg#about'),
			promise: Promise.resolve({
				name: 'a',
				b: { name: 'b', c: { name: 'c', d: { name: 'd' } } },
				g: [{ name: 'b', c: { name: 'c', d: { name: 'd' } } }],
				d: {}
			}),

			nesting: {
				nestedObjects: {
					b: { name: 'b', c: { name: 'c', d: { name: 'd' } } },
					g: [{ test: 1, a: 2, b: 2 }],
					name: 'a'
				},
				nestedPromises: {
					promises: { a: new Promise(() => {}), b: Promise.resolve('foo') }
				},
				nestedArrays: [[[[[[[[[[[[[[[[['end']]]]]]]]]]]]]]]]]
			},
			functions: {
				double: (value) => 2 * value,
				normalFunction: function (some = 'some', thing) {
					return some + thing;
				},
				asyncOneLiner: async (v) => new Promise((r) => setTimeout(() => r(v), v)),
				asyncfn: async function () {
					const boop = await Promise.resolve('boop');

					return boop;
				},
				test: eval(`(function* generator() { yield 'a' })`),
				test2: eval(`(async function* generator() { yield 'a' })`),
				yieldTwo: function* () {
					yield 2;
				},

				asynchronousGenerator: async function* () {
					yield 2;
				},

				get asArray() {
					return Object.values({
						double: (value) => 2 * value,
						normalFunction: function (some = 'some', thing) {
							return some + thing;
						},

						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						asyncOneLiner: async (v) => new Promise((r) => setTimeout(() => r(v), v)),

						asyncfn: async function () {
							const boop = await Promise.resolve('boop');

							return boop;
						},
						test: eval(`(function* generator() { yield 'a' })`),
						test2: eval(`(async function* generator() { yield 'a' })`),
						yieldTwo: function* () {
							yield 2;
						},

						asynchronousGenerator: async function* () {
							yield 2;
						}
					});
				}
			},
			gettersAndSetters: {
				get anObject() {
					return { a: { b: { c: { d: { e: 'end' } } } } };
				},
				count: 1,
				get current() {
					this.getterAccessedTimes++;

					return this.count;
				},

				set current(value) {
					this.count = value;
				},

				get throws() {
					// eslint-disable-next-line no-console
					console.trace('throwing getter accessed');

					throw 'yeet';
				},

				set throws(value) {
					throw 'throwing';
				},
				getterAccessedTimes: 0,
				get getterWithSideEffect() {
					this.test += '@';

					return 'something';
				},

				get throwSomething() {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					let goof;

					goof.doesNotExist.doesNotExist();

					// throw new Error('yayaya')
					return 'blah';
				},

				set throwSomething(value) {
					JSON.parse('t');
				},

				get self() {
					return this;
				},
				test: '@'
			},
			typedArrays: {
				eight: new Int8Array([1, 2, 3]),
				Uint8Array: new Uint8Array([1, 2, 3]),
				Uint8ClampedArray: new Uint8ClampedArray([1, 2, 3]),
				sixteen: new Int16Array([1, 2, 3, 4, 5]),
				Uint16Array: new Uint16Array([1, 2, 3]),
				thirtytwo: new Int32Array([1, 2, 3, 4, 5]),
				Uint32Array: new Uint32Array([1, 2, 3]),
				Float32Array: new Float32Array([1.2, 3.4, 5.6]),
				Float64Array: new Float64Array([1.2345, 3.4, 5.6]),
				BigInt64Array: new BigInt64Array([1n, 2n, 3n]),
				BigUint64Array: new BigUint64Array([1n])
			},
			classes: {
				classCtr: Greeter,
				classInstance: new Greeter('You'),
				classNoEntries: class Foo {}
			},
			errors: {
				error: new Error('oh no!'),
				typeerror: new TypeError('snapple')
			},
			body: null,
			iterators: {
				array: [1, 2, 3, 4].values(),
				set: new Set([12, 34, 45]).values(),
				map: new Map([
					[0, 0],
					[{ id: 123 }, 1],
					[[1, 2, 3], 2],
					[Symbol('key'), 'value'],
					[
						Promise.resolve('foo'),
						{
							get something() {
								return 'something';
							}
						}
					]
				]).entries(),
				fib: fibonacci(),
				stringIterator: ('abdcdefghijklmnopqrstuvwxyzæøå')[Symbol.iterator](),
				// elements: browser ? document.body.childNodes.values() : null,
				segments,

				string: {
					value: 'test1test2',
					regExp: /t(e)(st(?<digit>\d?))/g,
					get matchAll() {
						return this.value.matchAll(this.regExp);
					},

					get exec() {
						return this.regExp.exec(this.value);
					},

					get match() {
						return this.value.match(this.regExp);
					}
				}
			},
			number: 0,
			weirdKeys: {
				42: 'numbers are cool',
				punctuation: {
					'=': 'eq',
					'@': 'at',
					'-': '',
					':': '',
					';': '',
					'.': '',
					',': '',
					'!': 1,
					'?': '',
					'¡': '¿',
					'¿': '!',
					'#': '',
					'~': 'tilde',
					'*': 'asterisk'
				},
				braces: { '{': '', '}': '', '[': '', ']': '', '<': '', '>': '' },
				quotes: { '"': 'double quote', "'": 'single quote', '`': 'backtick' },
				slashesandEscaped: {
					'\\': 'backslash',
					'//': { hmm: 'test' },
					'\n': 'newline',
					'\t': 'tab',
					'\r': 'carriage return'
				},
				accented: {
					a: { å: '', à: '', ä: '', á: '', â: '', ã: '', ā: '', ạ: '' },
					e: { é: 'é', è: 'é', ê: 'ê', ë: '', ė: '' }
				},
				à: '',
				æ: '',
				whiteSpace: {
					'': 'empty string key',
					' ': 'space string key',
					'  ': 'double space string key',
					'      starts   ': ' a    ',
					'spaces in between': ' a    '
				},
				_: 'underscores are legit',
				$: 'dollar signs should be legit',
				'asdf\\': 'oo',
				[Symbol('')]: 'agaga'
			},
			arbitraryObjects: {
				notice: 'objects without a defined specialized view component.\nproperties are enumerated and nested.',
				// navigator: browser ? navigator : null,
				registry: new FinalizationRegistry(() => {})
			},
			empties: {
				object: {},
				array: [],
				set: new Set(),
				map: new Map(),
				string: ''
			},
			primitiveCtr: {
				str: new String('yup'),
				num: new Number(),
				num2: new Number(1),
				bool: new Boolean(),
				strsubclass: new StringSubclass('test'),
				subclass: StringSubclass
			}
		};

		const globalOptions = getContext(GLOBAL_OPTIONS_CONTEXT);

		const allTypesSearch = $.derived(() => {
			const globalOpts = typeof globalOptions === 'function' ? globalOptions() : globalOptions;

			if (globalOpts?.search === false) {
				return 'highlight';
			}

			return globalOpts?.search ?? undefined;
		});

		function heading($$renderer, collapsed) {
			$$renderer.push(`<!---->DEMO `);

			if (!collapsed) {
				$$renderer.push(`<!--[0--><label class="svelte-1st6fhr">increment number <input type="checkbox"${$.attr('checked', seeFlashing, true)}/></label>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		Inspect($$renderer, $.spread_props([
			{
				heading,
				name: 'allTypes',
				values: allTypes,
				search: allTypesSearch()
			},
			props,
			{ expandLevel: 0 }
		]));

		$.bind_props($$props, { seeFlashing });
	});
}