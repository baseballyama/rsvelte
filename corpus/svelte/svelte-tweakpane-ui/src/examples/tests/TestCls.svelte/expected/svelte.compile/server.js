import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

import {
	AutoObject,
	Binding,
	Blade,
	Button,
	ButtonGrid,
	Color,
	CubicBezier,
	Element,
	Folder,
	FpsGraph,
	List,
	Monitor,
	Pane,
	Point,
	Profiler,
	RadioGrid,
	Ring,
	RotationEuler,
	RotationQuaternion,
	Separator,
	Slider,
	TabGroup,
	TabPage,
	Text,
	Textarea,
	ThemeUtils,
	WaveformMonitor,
	Wheel
} from '$lib';

export default function TestCls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let text = 'Cosmic Manifold';
		let waveData = [5, 6, 7, 8, 9, 3, 9, 8, 7, 6, 5];

		setInterval(
			() => {
				waveData = waveData.map((v) => Math.max(0, Math.min(10, v + (Math.random() * 2 - 1) * 0.5)));
			},
			10
		);

		let selection = 1;
		const options = { a: 1, b: 2, c: 3 };
		let booleanToMonitor = false;
		let stringToMonitor = 'Reticulating';
		let numberToMonitor = 85;

		setInterval(
			() => {
				numberToMonitor = Math.random() * 100;
			},
			50
		);

		setInterval(
			() => {
				booleanToMonitor = !booleanToMonitor;

				// eslint-disable-next-line ts/no-misused-spread, unicorn/no-array-reverse
				stringToMonitor = [...stringToMonitor].reverse().join('');
			},
			1000
		);

		let rev = { x: 0, y: 0, z: 0 };
		let rev2 = { x: 0, y: 0, z: 0, w: 0 };
		let text2 = '';

		let object = {
			someBoolean: true, // Creates a <Checkbox>
			someColor: {
				r: 255,
				g: 0,
				// Creates a <Color> picker
				b: 55
			},
			someFolder: {
				// Wraps children in a <Folder>
				a: 1,
				b: 2,
				c: 3
			},
			someNumber: 1, // Creates a <Slider>
			somePoint: {
				// Creates a <Point>
				x: 1,
				y: 2
			},
			someString: 'test' // Creates a <Text>
		};

		let startColor = '#fff000';
		let startColorA = { r: 255, g: 0, b: 55, a: 50 };
		let bindingObject = { r: 0 };
		let expanded = false;
		let point2d = { x: 0, y: 0 };

		// Tuples are also fine
		let point3d = [0, 0, 0];

		// Dimension-specific option type needs to know the type of the point value
		const point3dxOptions = { min: -100, max: 100 };

		const theme = {
			...ThemeUtils.presets.standard,
			bladeHorizontalPadding: '20px',
			containerUnitSize: '130px'
		};

		let callback = [0, 0, 0, 0];

		const keyboard = [
			...Array.from({ length: 26 }, (_, index) => String.fromCodePoint(65 + index)),
			',',
			'.',
			'!',
			'⌫'
		];

		let rv = 1;

		// Const radioValues = [ ['magenta', 'orange'], ['yellow', 'red'], ['violet', 'gold'], ['red',
		//  'rebeccapurple']
		// ];
		// let src = 'placeholder';
		let point4d = { x: 0, y: 0, z: 0, w: 0 };

		// This is a readonly function handle assigned by Profiler component first used in onMount since
		// it is not bound until then
		let measure;

		const loopExponent = 1;

		// Helper to test Math functions
		function hardWork(functionToMeasure, exponent) {
			measure(functionToMeasure.name, () => {
				for (let sum = 0; sum < Number('1e' + exponent); sum++) {
					functionToMeasure(sum);
				}
			});
		}

		onMount(() => {
			let animationFrameHandle;

			(function tick() {
				// Nesting measurements creates a hierarchy in the Profile visualization
				measure('Tick', () => {
					measure('Trigonometry', () => {
						hardWork(Math.sin, loopExponent);
						hardWork(Math.cos, loopExponent);
						hardWork(Math.tan, loopExponent);
						hardWork(Math.atan, loopExponent);
						hardWork(Math.acos, loopExponent);
						hardWork(Math.acosh, loopExponent);
					});

					measure('Logarithms', () => {
						hardWork(Math.log, loopExponent);
						hardWork(Math.log10, loopExponent);
						hardWork(Math.log1p, loopExponent);
						hardWork(Math.log2, loopExponent);
					});

					measure('Rounding', () => {
						hardWork(Math.round, loopExponent);
						hardWork(Math.floor, loopExponent);
						hardWork(Math.ceil, loopExponent);
						hardWork(Math.fround, loopExponent);
					});
				});

				animationFrameHandle = requestAnimationFrame(tick);
			})();

			return () => {
				cancelAnimationFrame(animationFrameHandle);
			};
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Pane($$renderer, {
				children: ($$renderer) => {
					Button($$renderer, {});
					$$renderer.push(`<!----> `);
					Button($$renderer, {});
					$$renderer.push(`<!----> `);
					Button($$renderer, {});
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Pane($$renderer, {
				position: 'fixed',
				children: ($$renderer) => {
					Button($$renderer, {});
					$$renderer.push(`<!----> `);
					Button($$renderer, {});
					$$renderer.push(`<!----> `);
					Button($$renderer, {});
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h1>Textarea</h1> `);

			Textarea($$renderer, {
				placeholder: 'The void',
				get value() {
					return text2;
				},

				set value($$value) {
					text2 = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <h1>Textarea</h1> `);

			Textarea($$renderer, {
				placeholder: 'The void',
				rows: 8,
				get value() {
					return text2;
				},

				set value($$value) {
					text2 = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <h1>Rotation</h1> `);

			RotationQuaternion($$renderer, {
				expanded: true,
				label: 'CSS Rotation',
				picker: 'inline',
				get value() {
					return rev2;
				},

				set value($$value) {
					rev2 = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <h1>Rotation</h1> `);

			RotationQuaternion($$renderer, {
				expanded: true,
				picker: 'inline',
				get value() {
					return rev2;
				},

				set value($$value) {
					rev2 = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <h1>Rotation</h1> `);

			RotationEuler($$renderer, {
				expanded: true,
				label: 'CSS Rotation',
				picker: 'inline',
				get value() {
					return rev;
				},

				set value($$value) {
					rev = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <h1>Rotation</h1> `);

			RotationEuler($$renderer, {
				expanded: true,
				picker: 'inline',
				get value() {
					return rev;
				},

				set value($$value) {
					rev = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <h1>Profiler</h1> `);

			Profiler($$renderer, {
				label: 'Profiler',
				get measure() {
					return measure;
				},

				set measure($$value) {
					measure = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <h1>RG</h1> `);

			RadioGrid($$renderer, {
				prefix: 'Color Scheme ',
				values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
				get value() {
					return rv;
				},

				set value($$value) {
					rv = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <h1>FPS</h1> `);
			FpsGraph($$renderer, { rows: 1 });
			$$renderer.push(`<!----> <h1>FPS</h1> `);
			FpsGraph($$renderer, { rows: 5 });
			$$renderer.push(`<!----> <h1>FPS</h1> `);
			FpsGraph($$renderer, {});
			$$renderer.push(`<!----> <h1>CB</h1> `);

			CubicBezier($$renderer, {
				expanded: true,
				picker: 'inline',
				get value() {
					return callback;
				},

				set value($$value) {
					callback = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <h1>CB</h1> `);

			CubicBezier($$renderer, {
				expanded: true,
				label: 'bla',
				picker: 'inline',
				get value() {
					return callback;
				},

				set value($$value) {
					callback = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <h1>CB</h1> `);

			CubicBezier($$renderer, {
				expanded: true,
				label: 'bla',
				get value() {
					return callback;
				},

				set value($$value) {
					callback = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <h1>CB</h1> `);

			CubicBezier($$renderer, {
				label: 'bla',
				get value() {
					return callback;
				},

				set value($$value) {
					callback = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <h1>Button Grid</h1> `);
			ButtonGrid($$renderer, { buttons: keyboard });
			$$renderer.push(`<!----> <h1>Ring</h1> `);
			Ring($$renderer, { label: 'Scale', value: 1 });
			$$renderer.push(`<!----> <h1>Wheel</h1> `);
			Wheel($$renderer, { label: 'Scale', value: 1 });
			$$renderer.push(`<!----> <h1>Color</h1> `);

			Color($$renderer, {
				label: 'Start Color',
				get value() {
					return startColor;
				},

				set value($$value) {
					startColor = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <h1>Color</h1> `);

			Color($$renderer, {
				expanded: true,
				label: 'Start Color',
				picker: 'inline',
				get value() {
					return startColor;
				},

				set value($$value) {
					startColor = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <h1>Color</h1> `);

			Color($$renderer, {
				expanded: true,
				picker: 'inline',
				get value() {
					return startColor;
				},

				set value($$value) {
					startColor = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <h1>Color</h1> `);

			Color($$renderer, {
				expanded: true,
				label: 'Start Color',
				picker: 'inline',
				get value() {
					return startColorA;
				},

				set value($$value) {
					startColorA = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <h1>Color</h1> `);

			Color($$renderer, {
				expanded: true,
				picker: 'inline',
				get value() {
					return startColorA;
				},

				set value($$value) {
					startColorA = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <h1>Text</h1> `);

			Text($$renderer, {
				label: 'The Message',
				get value() {
					return text;
				},

				set value($$value) {
					text = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <h1>Slider</h1> `);
			Slider($$renderer, { label: 'Scale', value: 1 });
			$$renderer.push(`<!----> <h1>Separator</h1> `);
			Separator($$renderer, {});
			$$renderer.push(`<!----> <h1>Point 2D</h1> `);

			Point($$renderer, {
				expanded: false,
				label: '2D Point Picker',
				picker: 'inline',
				get value() {
					return point2d;
				},

				set value($$value) {
					point2d = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <h1>Point 3D</h1> `);

			Point($$renderer, {
				label: '3D Point Picker',
				optionsX: point3dxOptions,
				get value() {
					return point3d;
				},

				set value($$value) {
					point3d = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <h1>Point 4D</h1> `);

			Point($$renderer, {
				label: '4D Point Picker',
				max: 100,
				min: 0,
				get value() {
					return point4d;
				},

				set value($$value) {
					point4d = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <h1>Point 2D</h1> `);

			Point($$renderer, {
				expanded: true,
				label: '2D Point Picker',
				picker: 'inline',
				get value() {
					return point2d;
				},

				set value($$value) {
					point2d = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <h1>Point 2D No Label</h1> `);

			Pane($$renderer, {
				position: 'inline',
				theme,
				width: 300,
				children: ($$renderer) => {
					Point($$renderer, {
						expanded: true,
						picker: 'inline',
						get value() {
							return point2d;
						},

						set value($$value) {
							point2d = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h1>wave Monitor</h1> `);
			WaveformMonitor($$renderer, { lineStyle: 'bezier', max: 11, min: -1, value: waveData });
			$$renderer.push(`<!----> `);

			WaveformMonitor($$renderer, {
				bufferSize: 500,
				lineStyle: 'bezier',
				max: 11,
				min: -1,
				rows: 10,
				value: waveData
			});

			$$renderer.push(`<!----> <h1>Monitor String Rows without Multiline</h1> `);

			Monitor($$renderer, {
				label: 'String Monitor',
				multiline: true,
				value: stringToMonitor
			});

			$$renderer.push(`<!----> `);

			Monitor($$renderer, {
				bufferSize: 2,
				label: 'String Monitor',
				value: stringToMonitor
			});

			$$renderer.push(`<!----> `);
			Monitor($$renderer, { label: 'String Monitor', value: stringToMonitor });
			$$renderer.push(`<!----> <h1>Monitor String Multiline</h1> `);

			Monitor($$renderer, {
				bufferSize: 10,
				label: 'String Monitor',
				multiline: true,
				rows: 10,
				value: stringToMonitor
			});

			$$renderer.push(`<!----> <h1>Monitor String Multiline With Rows</h1> `);

			Monitor($$renderer, {
				bufferSize: 50,
				label: 'String Monitor',
				multiline: true,
				rows: 10,
				value: stringToMonitor
			});

			$$renderer.push(`<!----> <h1>Monitor Boolean test</h1> `);

			Monitor($$renderer, {
				bufferSize: 3,
				label: 'Boolean Monitor',
				rows: 2,
				value: booleanToMonitor
			});

			$$renderer.push(`<!----> <h1>Monitor Boolean Basic</h1> `);

			Monitor($$renderer, {
				graph: true,
				label: 'Boolean Monitor',
				value: numberToMonitor
			});

			$$renderer.push(`<!----> <h1>Monitor Boolean Basic</h1> `);

			Monitor($$renderer, {
				graph: true,
				label: 'Boolean Monitor',
				rows: 20,
				value: numberToMonitor
			});

			$$renderer.push(`<!----> <h1>Monitor Boolean Basic</h1> `);
			Monitor($$renderer, { label: 'Boolean Monitor', value: numberToMonitor });
			$$renderer.push(`<!----> <h1>Monitor Boolean Big Buffer Big Rows</h1> `);

			Monitor($$renderer, {
				bufferSize: 20,
				label: 'Boolean Monitor',
				rows: 10,
				value: numberToMonitor
			});

			$$renderer.push(`<!----> <h1>Monitor Boolean Small Buffer Big Rows</h1> `);

			Monitor($$renderer, {
				bufferSize: 2,
				label: 'Boolean Monitor',
				rows: 10,
				value: numberToMonitor
			});

			$$renderer.push(`<!----> <h1>Monitor Boolean Big Buffer Small Rows</h1> `);

			Monitor($$renderer, {
				bufferSize: 10,
				label: 'Boolean Monitor',
				rows: 1,
				value: numberToMonitor
			});

			$$renderer.push(`<!----> <h1>Monitor Boolean Big Buffer No Rows</h1> `);

			Monitor($$renderer, {
				bufferSize: 2,
				label: 'Boolean Monitor',
				value: numberToMonitor
			});

			$$renderer.push(`<!----> <h1>Monitor Boolean No Buffer Big Rows</h1> `);
			Monitor($$renderer, { label: 'Boolean Monitor', rows: 10, value: numberToMonitor });
			$$renderer.push(`<!----> <h1>Monitor Number</h1> `);
			Monitor($$renderer, { bufferSize: 50, rows: 10, value: numberToMonitor });
			$$renderer.push(`<!----> <h1>Monitor Number Graph</h1> `);
			Monitor($$renderer, { graph: true, rows: 10, value: numberToMonitor });
			$$renderer.push(`<!----> <h1>List</h1> `);

			List($$renderer, {
				label: 'Alphanumerics',
				options,
				get value() {
					return selection;
				},

				set value($$value) {
					selection = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <h1>Element Standalone</h1> `);

			Element($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<p><code>&lt;Pane></code><br/> <code>&lt;Element></code><br/> Whatever you want. <code>&lt;/Element></code><br/> <code>&lt;/Pane></code></p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h1>Binding</h1> `);

			Binding($$renderer, {
				key: 'r',
				label: 'Reticulation',
				get object() {
					return bindingObject;
				},

				set object($$value) {
					bindingObject = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <h1>Auto object</h1> `);

			AutoObject($$renderer, {
				get object() {
					return object;
				},

				set object($$value) {
					object = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <h1>single tab</h1> `);

			TabGroup($$renderer, {
				children: ($$renderer) => {
					TabPage($$renderer, {
						title: 'B!!!!',
						children: ($$renderer) => {
							Button($$renderer, {});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h1>Tabs Short first</h1> `);

			TabGroup($$renderer, {
				children: ($$renderer) => {
					TabPage($$renderer, {
						title: 'A',
						children: ($$renderer) => {
							Button($$renderer, {});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TabPage($$renderer, {
						title: 'B',
						children: ($$renderer) => {
							Button($$renderer, {});
							$$renderer.push(`<!----> `);
							Button($$renderer, {});
							$$renderer.push(`<!----> `);
							Button($$renderer, {});
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h1>Tabs tall first</h1> `);

			TabGroup($$renderer, {
				children: ($$renderer) => {
					TabPage($$renderer, {
						title: 'A',
						children: ($$renderer) => {
							Button($$renderer, {});
							$$renderer.push(`<!----> `);
							Button($$renderer, {});
							$$renderer.push(`<!----> `);
							Button($$renderer, {});
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TabPage($$renderer, {
						title: 'B',
						children: ($$renderer) => {
							Button($$renderer, {});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h1>Tab page no group</h1> `);

			TabPage($$renderer, {
				title: 'A',
				children: ($$renderer) => {
					Button($$renderer, {});
					$$renderer.push(`<!----> `);
					Button($$renderer, {});
					$$renderer.push(`<!----> `);
					Button($$renderer, {});
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h1>Tab group no pages</h1> `);
			TabGroup($$renderer, {});
			$$renderer.push(`<!----> <h1>Pane</h1> `);

			Pane($$renderer, {
				position: 'inline',
				children: ($$renderer) => {
					Slider($$renderer, { label: 'Scale', value: 1 });
					$$renderer.push(`<!----> `);
					Slider($$renderer, { label: 'Scale', value: 1 });
					$$renderer.push(`<!----> `);
					Slider($$renderer, { label: 'Scale', value: 1 });
					$$renderer.push(`<!----> `);
					Slider($$renderer, { label: 'Scale', value: 1 });
					$$renderer.push(`<!----> `);
					Slider($$renderer, { label: 'Scale', value: 1 });
					$$renderer.push(`<!----> `);
					Slider($$renderer, { label: 'Scale', value: 1 });
					$$renderer.push(`<!----> `);
					Slider($$renderer, { label: 'Scale', value: 1 });
					$$renderer.push(`<!----> `);
					Slider($$renderer, { label: 'Scale', value: 1 });
					$$renderer.push(`<!----> `);
					Slider($$renderer, { label: 'Scale', value: 1 });
					$$renderer.push(`<!----> `);
					Slider($$renderer, { label: 'Scale', value: 1 });
					$$renderer.push(`<!----> `);
					Slider($$renderer, { label: 'Scale', value: 1 });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h1>Slider</h1> `);
			Slider($$renderer, { label: 'Scale', value: 1 });
			$$renderer.push(`<!----> <h1>Pane Title</h1> `);

			Pane($$renderer, {
				position: 'inline',
				title: 'Bla',
				children: ($$renderer) => {
					Slider($$renderer, { label: 'Scale', value: 1 });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h1>Pane Folded</h1> `);

			Pane($$renderer, {
				position: 'inline',
				get expanded() {
					return expanded;
				},

				set expanded($$value) {
					expanded = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					Slider($$renderer, { label: 'Scale', value: 1 });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h1>Pane Title Folded</h1> `);

			Pane($$renderer, {
				position: 'inline',
				title: 'Bla',
				get expanded() {
					return expanded;
				},

				set expanded($$value) {
					expanded = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					Slider($$renderer, { label: 'Scale', value: 1 });
					$$renderer.push(`<!----> `);
					Slider($$renderer, { label: 'Scale', value: 1 });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h1>Blade</h1> `);
			Blade($$renderer, { options: { view: 'separator' } });
			$$renderer.push(`<!----> <h1>Button</h1> `);
			Button($$renderer, {});
			$$renderer.push(`<!----> <h1>Folder expanded</h1> `);

			Folder($$renderer, {
				title: 'Reticulation Manager',
				children: ($$renderer) => {
					Button($$renderer, {});
					$$renderer.push(`<!----> `);
					Button($$renderer, {});
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h1>Folder collapsed</h1> `);

			Folder($$renderer, {
				title: 'Reticulation Manager',
				get expanded() {
					return expanded;
				},

				set expanded($$value) {
					expanded = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					Button($$renderer, {});
					$$renderer.push(`<!----> `);
					Button($$renderer, {});
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <hr/>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}