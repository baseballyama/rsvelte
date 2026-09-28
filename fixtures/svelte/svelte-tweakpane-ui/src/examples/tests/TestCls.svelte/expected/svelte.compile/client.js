import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<p><code>&lt;Pane&gt;</code><br/> <code>&lt;Element&gt;</code><br/> Whatever you want. <code>&lt;/Element&gt;</code><br/> <code>&lt;/Pane&gt;</code></p>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <h1>Textarea</h1> <!> <h1>Textarea</h1> <!> <h1>Rotation</h1> <!> <h1>Rotation</h1> <!> <h1>Rotation</h1> <!> <h1>Rotation</h1> <!> <h1>Profiler</h1> <!> <h1>RG</h1> <!> <h1>FPS</h1> <!> <h1>FPS</h1> <!> <h1>FPS</h1> <!> <h1>CB</h1> <!> <h1>CB</h1> <!> <h1>CB</h1> <!> <h1>CB</h1> <!> <h1>Button Grid</h1> <!> <h1>Ring</h1> <!> <h1>Wheel</h1> <!> <h1>Color</h1> <!> <h1>Color</h1> <!> <h1>Color</h1> <!> <h1>Color</h1> <!> <h1>Color</h1> <!> <h1>Text</h1> <!> <h1>Slider</h1> <!> <h1>Separator</h1> <!> <h1>Point 2D</h1> <!> <h1>Point 3D</h1> <!> <h1>Point 4D</h1> <!> <h1>Point 2D</h1> <!> <h1>Point 2D No Label</h1> <!> <h1>wave Monitor</h1> <!> <!> <h1>Monitor String Rows without Multiline</h1> <!> <!> <!> <h1>Monitor String Multiline</h1> <!> <h1>Monitor String Multiline With Rows</h1> <!> <h1>Monitor Boolean test</h1> <!> <h1>Monitor Boolean Basic</h1> <!> <h1>Monitor Boolean Basic</h1> <!> <h1>Monitor Boolean Basic</h1> <!> <h1>Monitor Boolean Big Buffer Big Rows</h1> <!> <h1>Monitor Boolean Small Buffer Big Rows</h1> <!> <h1>Monitor Boolean Big Buffer Small Rows</h1> <!> <h1>Monitor Boolean Big Buffer No Rows</h1> <!> <h1>Monitor Boolean No Buffer Big Rows</h1> <!> <h1>Monitor Number</h1> <!> <h1>Monitor Number Graph</h1> <!> <h1>List</h1> <!> <h1>Element Standalone</h1> <!> <h1>Binding</h1> <!> <h1>Auto object</h1> <!> <h1>single tab</h1> <!> <h1>Tabs Short first</h1> <!> <h1>Tabs tall first</h1> <!> <h1>Tab page no group</h1> <!> <h1>Tab group no pages</h1> <!> <h1>Pane</h1> <!> <h1>Slider</h1> <!> <h1>Pane Title</h1> <!> <h1>Pane Folded</h1> <!> <h1>Pane Title Folded</h1> <!> <h1>Blade</h1> <!> <h1>Button</h1> <!> <h1>Folder expanded</h1> <!> <h1>Folder collapsed</h1> <!> <hr/>`, 1);

export default function TestCls($$anchor, $$props) {
	$.push($$props, true);

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

	var fragment = root_4();
	var node = $.first_child(fragment);

	Pane(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Button(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			Button(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			Button(node_3, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 2);

	Pane(node_4, {
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_5 = $.first_child(fragment_2);

			Button(node_5, {});

			var node_6 = $.sibling(node_5, 2);

			Button(node_6, {});

			var node_7 = $.sibling(node_6, 2);

			Button(node_7, {});
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_4, 4);

	Textarea(node_8, {
		placeholder: 'The void',
		get value() {
			return text2;
		},

		set value($$value) {
			text2 = $$value;
		}
	});

	var node_9 = $.sibling(node_8, 4);

	Textarea(node_9, {
		placeholder: 'The void',
		rows: 8,
		get value() {
			return text2;
		},

		set value($$value) {
			text2 = $$value;
		}
	});

	var node_10 = $.sibling(node_9, 4);

	RotationQuaternion(node_10, {
		expanded: true,
		label: 'CSS Rotation',
		picker: 'inline',
		get value() {
			return rev2;
		},

		set value($$value) {
			rev2 = $$value;
		}
	});

	var node_11 = $.sibling(node_10, 4);

	RotationQuaternion(node_11, {
		expanded: true,
		picker: 'inline',
		get value() {
			return rev2;
		},

		set value($$value) {
			rev2 = $$value;
		}
	});

	var node_12 = $.sibling(node_11, 4);

	RotationEuler(node_12, {
		expanded: true,
		label: 'CSS Rotation',
		picker: 'inline',
		get value() {
			return rev;
		},

		set value($$value) {
			rev = $$value;
		}
	});

	var node_13 = $.sibling(node_12, 4);

	RotationEuler(node_13, {
		expanded: true,
		picker: 'inline',
		get value() {
			return rev;
		},

		set value($$value) {
			rev = $$value;
		}
	});

	var node_14 = $.sibling(node_13, 4);

	Profiler(node_14, {
		label: 'Profiler',
		get measure() {
			return measure;
		},

		set measure($$value) {
			measure = $$value;
		}
	});

	var node_15 = $.sibling(node_14, 4);

	RadioGrid(node_15, {
		prefix: 'Color Scheme ',
		values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
		get value() {
			return rv;
		},

		set value($$value) {
			rv = $$value;
		}
	});

	var node_16 = $.sibling(node_15, 4);

	FpsGraph(node_16, { rows: 1 });

	var node_17 = $.sibling(node_16, 4);

	FpsGraph(node_17, { rows: 5 });

	var node_18 = $.sibling(node_17, 4);

	FpsGraph(node_18, {});

	var node_19 = $.sibling(node_18, 4);

	CubicBezier(node_19, {
		expanded: true,
		picker: 'inline',
		get value() {
			return callback;
		},

		set value($$value) {
			callback = $$value;
		}
	});

	var node_20 = $.sibling(node_19, 4);

	CubicBezier(node_20, {
		expanded: true,
		label: 'bla',
		picker: 'inline',
		get value() {
			return callback;
		},

		set value($$value) {
			callback = $$value;
		}
	});

	var node_21 = $.sibling(node_20, 4);

	CubicBezier(node_21, {
		expanded: true,
		label: 'bla',
		get value() {
			return callback;
		},

		set value($$value) {
			callback = $$value;
		}
	});

	var node_22 = $.sibling(node_21, 4);

	CubicBezier(node_22, {
		label: 'bla',
		get value() {
			return callback;
		},

		set value($$value) {
			callback = $$value;
		}
	});

	var node_23 = $.sibling(node_22, 4);

	ButtonGrid(node_23, {
		get buttons() {
			return keyboard;
		}
	});

	var node_24 = $.sibling(node_23, 4);

	Ring(node_24, { label: 'Scale', value: 1 });

	var node_25 = $.sibling(node_24, 4);

	Wheel(node_25, { label: 'Scale', value: 1 });

	var node_26 = $.sibling(node_25, 4);

	Color(node_26, {
		label: 'Start Color',
		get value() {
			return startColor;
		},

		set value($$value) {
			startColor = $$value;
		}
	});

	var node_27 = $.sibling(node_26, 4);

	Color(node_27, {
		expanded: true,
		label: 'Start Color',
		picker: 'inline',
		get value() {
			return startColor;
		},

		set value($$value) {
			startColor = $$value;
		}
	});

	var node_28 = $.sibling(node_27, 4);

	Color(node_28, {
		expanded: true,
		picker: 'inline',
		get value() {
			return startColor;
		},

		set value($$value) {
			startColor = $$value;
		}
	});

	var node_29 = $.sibling(node_28, 4);

	Color(node_29, {
		expanded: true,
		label: 'Start Color',
		picker: 'inline',
		get value() {
			return startColorA;
		},

		set value($$value) {
			startColorA = $$value;
		}
	});

	var node_30 = $.sibling(node_29, 4);

	Color(node_30, {
		expanded: true,
		picker: 'inline',
		get value() {
			return startColorA;
		},

		set value($$value) {
			startColorA = $$value;
		}
	});

	var node_31 = $.sibling(node_30, 4);

	Text(node_31, {
		label: 'The Message',
		get value() {
			return text;
		},

		set value($$value) {
			text = $$value;
		}
	});

	var node_32 = $.sibling(node_31, 4);

	Slider(node_32, { label: 'Scale', value: 1 });

	var node_33 = $.sibling(node_32, 4);

	Separator(node_33, {});

	var node_34 = $.sibling(node_33, 4);

	Point(node_34, {
		expanded: false,
		label: '2D Point Picker',
		picker: 'inline',
		get value() {
			return point2d;
		},

		set value($$value) {
			point2d = $$value;
		}
	});

	var node_35 = $.sibling(node_34, 4);

	Point(node_35, {
		label: '3D Point Picker',
		get optionsX() {
			return point3dxOptions;
		},

		get value() {
			return point3d;
		},

		set value($$value) {
			point3d = $$value;
		}
	});

	var node_36 = $.sibling(node_35, 4);

	Point(node_36, {
		label: '4D Point Picker',
		max: 100,
		min: 0,
		get value() {
			return point4d;
		},

		set value($$value) {
			point4d = $$value;
		}
	});

	var node_37 = $.sibling(node_36, 4);

	Point(node_37, {
		expanded: true,
		label: '2D Point Picker',
		picker: 'inline',
		get value() {
			return point2d;
		},

		set value($$value) {
			point2d = $$value;
		}
	});

	var node_38 = $.sibling(node_37, 4);

	Pane(node_38, {
		position: 'inline',
		get theme() {
			return theme;
		},
		width: 300,
		children: ($$anchor, $$slotProps) => {
			Point($$anchor, {
				expanded: true,
				picker: 'inline',
				get value() {
					return point2d;
				},

				set value($$value) {
					point2d = $$value;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_39 = $.sibling(node_38, 4);

	WaveformMonitor(node_39, {
		lineStyle: 'bezier',
		max: 11,
		min: -1,
		get value() {
			return waveData;
		}
	});

	var node_40 = $.sibling(node_39, 2);

	WaveformMonitor(node_40, {
		bufferSize: 500,
		lineStyle: 'bezier',
		max: 11,
		min: -1,
		rows: 10,
		get value() {
			return waveData;
		}
	});

	var node_41 = $.sibling(node_40, 4);

	Monitor(node_41, {
		label: 'String Monitor',
		multiline: true,
		get value() {
			return stringToMonitor;
		}
	});

	var node_42 = $.sibling(node_41, 2);

	Monitor(node_42, {
		bufferSize: 2,
		label: 'String Monitor',
		get value() {
			return stringToMonitor;
		}
	});

	var node_43 = $.sibling(node_42, 2);

	Monitor(node_43, {
		label: 'String Monitor',
		get value() {
			return stringToMonitor;
		}
	});

	var node_44 = $.sibling(node_43, 4);

	Monitor(node_44, {
		bufferSize: 10,
		label: 'String Monitor',
		multiline: true,
		rows: 10,
		get value() {
			return stringToMonitor;
		}
	});

	var node_45 = $.sibling(node_44, 4);

	Monitor(node_45, {
		bufferSize: 50,
		label: 'String Monitor',
		multiline: true,
		rows: 10,
		get value() {
			return stringToMonitor;
		}
	});

	var node_46 = $.sibling(node_45, 4);

	Monitor(node_46, {
		bufferSize: 3,
		label: 'Boolean Monitor',
		rows: 2,
		get value() {
			return booleanToMonitor;
		}
	});

	var node_47 = $.sibling(node_46, 4);

	Monitor(node_47, {
		graph: true,
		label: 'Boolean Monitor',
		get value() {
			return numberToMonitor;
		}
	});

	var node_48 = $.sibling(node_47, 4);

	Monitor(node_48, {
		graph: true,
		label: 'Boolean Monitor',
		rows: 20,
		get value() {
			return numberToMonitor;
		}
	});

	var node_49 = $.sibling(node_48, 4);

	Monitor(node_49, {
		label: 'Boolean Monitor',
		get value() {
			return numberToMonitor;
		}
	});

	var node_50 = $.sibling(node_49, 4);

	Monitor(node_50, {
		bufferSize: 20,
		label: 'Boolean Monitor',
		rows: 10,
		get value() {
			return numberToMonitor;
		}
	});

	var node_51 = $.sibling(node_50, 4);

	Monitor(node_51, {
		bufferSize: 2,
		label: 'Boolean Monitor',
		rows: 10,
		get value() {
			return numberToMonitor;
		}
	});

	var node_52 = $.sibling(node_51, 4);

	Monitor(node_52, {
		bufferSize: 10,
		label: 'Boolean Monitor',
		rows: 1,
		get value() {
			return numberToMonitor;
		}
	});

	var node_53 = $.sibling(node_52, 4);

	Monitor(node_53, {
		bufferSize: 2,
		label: 'Boolean Monitor',
		get value() {
			return numberToMonitor;
		}
	});

	var node_54 = $.sibling(node_53, 4);

	Monitor(node_54, {
		label: 'Boolean Monitor',
		rows: 10,
		get value() {
			return numberToMonitor;
		}
	});

	var node_55 = $.sibling(node_54, 4);

	Monitor(node_55, {
		bufferSize: 50,
		rows: 10,
		get value() {
			return numberToMonitor;
		}
	});

	var node_56 = $.sibling(node_55, 4);

	Monitor(node_56, {
		graph: true,
		rows: 10,
		get value() {
			return numberToMonitor;
		}
	});

	var node_57 = $.sibling(node_56, 4);

	List(node_57, {
		label: 'Alphanumerics',
		get options() {
			return options;
		},

		get value() {
			return selection;
		},

		set value($$value) {
			selection = $$value;
		}
	});

	var node_58 = $.sibling(node_57, 4);

	Element(node_58, {
		children: ($$anchor, $$slotProps) => {
			var p = root_1();

			$.append($$anchor, p);
		},
		$$slots: { default: true }
	});

	var node_59 = $.sibling(node_58, 4);

	Binding(node_59, {
		key: 'r',
		label: 'Reticulation',
		get object() {
			return bindingObject;
		},

		set object($$value) {
			bindingObject = $$value;
		}
	});

	var node_60 = $.sibling(node_59, 4);

	AutoObject(node_60, {
		get object() {
			return object;
		},

		set object($$value) {
			object = $$value;
		}
	});

	var node_61 = $.sibling(node_60, 4);

	TabGroup(node_61, {
		children: ($$anchor, $$slotProps) => {
			TabPage($$anchor, {
				title: 'B!!!!',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_62 = $.sibling(node_61, 4);

	TabGroup(node_62, {
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root_2();
			var node_63 = $.first_child(fragment_6);

			TabPage(node_63, {
				title: 'A',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {});
				},
				$$slots: { default: true }
			});

			var node_64 = $.sibling(node_63, 2);

			TabPage(node_64, {
				title: 'B',
				children: ($$anchor, $$slotProps) => {
					var fragment_8 = root();
					var node_65 = $.first_child(fragment_8);

					Button(node_65, {});

					var node_66 = $.sibling(node_65, 2);

					Button(node_66, {});

					var node_67 = $.sibling(node_66, 2);

					Button(node_67, {});
					$.append($$anchor, fragment_8);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	var node_68 = $.sibling(node_62, 4);

	TabGroup(node_68, {
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root_2();
			var node_69 = $.first_child(fragment_9);

			TabPage(node_69, {
				title: 'A',
				children: ($$anchor, $$slotProps) => {
					var fragment_10 = root();
					var node_70 = $.first_child(fragment_10);

					Button(node_70, {});

					var node_71 = $.sibling(node_70, 2);

					Button(node_71, {});

					var node_72 = $.sibling(node_71, 2);

					Button(node_72, {});
					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});

			var node_73 = $.sibling(node_69, 2);

			TabPage(node_73, {
				title: 'B',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});

	var node_74 = $.sibling(node_68, 4);

	TabPage(node_74, {
		title: 'A',
		children: ($$anchor, $$slotProps) => {
			var fragment_12 = root();
			var node_75 = $.first_child(fragment_12);

			Button(node_75, {});

			var node_76 = $.sibling(node_75, 2);

			Button(node_76, {});

			var node_77 = $.sibling(node_76, 2);

			Button(node_77, {});
			$.append($$anchor, fragment_12);
		},
		$$slots: { default: true }
	});

	var node_78 = $.sibling(node_74, 4);

	TabGroup(node_78, {});

	var node_79 = $.sibling(node_78, 4);

	Pane(node_79, {
		position: 'inline',
		children: ($$anchor, $$slotProps) => {
			var fragment_13 = root_3();
			var node_80 = $.first_child(fragment_13);

			Slider(node_80, { label: 'Scale', value: 1 });

			var node_81 = $.sibling(node_80, 2);

			Slider(node_81, { label: 'Scale', value: 1 });

			var node_82 = $.sibling(node_81, 2);

			Slider(node_82, { label: 'Scale', value: 1 });

			var node_83 = $.sibling(node_82, 2);

			Slider(node_83, { label: 'Scale', value: 1 });

			var node_84 = $.sibling(node_83, 2);

			Slider(node_84, { label: 'Scale', value: 1 });

			var node_85 = $.sibling(node_84, 2);

			Slider(node_85, { label: 'Scale', value: 1 });

			var node_86 = $.sibling(node_85, 2);

			Slider(node_86, { label: 'Scale', value: 1 });

			var node_87 = $.sibling(node_86, 2);

			Slider(node_87, { label: 'Scale', value: 1 });

			var node_88 = $.sibling(node_87, 2);

			Slider(node_88, { label: 'Scale', value: 1 });

			var node_89 = $.sibling(node_88, 2);

			Slider(node_89, { label: 'Scale', value: 1 });

			var node_90 = $.sibling(node_89, 2);

			Slider(node_90, { label: 'Scale', value: 1 });
			$.append($$anchor, fragment_13);
		},
		$$slots: { default: true }
	});

	var node_91 = $.sibling(node_79, 4);

	Slider(node_91, { label: 'Scale', value: 1 });

	var node_92 = $.sibling(node_91, 4);

	Pane(node_92, {
		position: 'inline',
		title: 'Bla',
		children: ($$anchor, $$slotProps) => {
			Slider($$anchor, { label: 'Scale', value: 1 });
		},
		$$slots: { default: true }
	});

	var node_93 = $.sibling(node_92, 4);

	Pane(node_93, {
		position: 'inline',
		get expanded() {
			return expanded;
		},

		set expanded($$value) {
			expanded = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			Slider($$anchor, { label: 'Scale', value: 1 });
		},
		$$slots: { default: true }
	});

	var node_94 = $.sibling(node_93, 4);

	Pane(node_94, {
		position: 'inline',
		title: 'Bla',
		get expanded() {
			return expanded;
		},

		set expanded($$value) {
			expanded = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_16 = root_2();
			var node_95 = $.first_child(fragment_16);

			Slider(node_95, { label: 'Scale', value: 1 });

			var node_96 = $.sibling(node_95, 2);

			Slider(node_96, { label: 'Scale', value: 1 });
			$.append($$anchor, fragment_16);
		},
		$$slots: { default: true }
	});

	var node_97 = $.sibling(node_94, 4);

	Blade(node_97, { options: { view: 'separator' } });

	var node_98 = $.sibling(node_97, 4);

	Button(node_98, {});

	var node_99 = $.sibling(node_98, 4);

	Folder(node_99, {
		title: 'Reticulation Manager',
		children: ($$anchor, $$slotProps) => {
			var fragment_17 = root_2();
			var node_100 = $.first_child(fragment_17);

			Button(node_100, {});

			var node_101 = $.sibling(node_100, 2);

			Button(node_101, {});
			$.append($$anchor, fragment_17);
		},
		$$slots: { default: true }
	});

	var node_102 = $.sibling(node_99, 4);

	Folder(node_102, {
		title: 'Reticulation Manager',
		get expanded() {
			return expanded;
		},

		set expanded($$value) {
			expanded = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_18 = root_2();
			var node_103 = $.first_child(fragment_18);

			Button(node_103, {});

			var node_104 = $.sibling(node_103, 2);

			Button(node_104, {});
			$.append($$anchor, fragment_18);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.append($$anchor, fragment);
	$.pop();
}