import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Tween } from 'svelte/motion';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Lights($$anchor, $$props) {
	$.push($$props, true);

	let machineIsOff = $.prop($$props, 'machineIsOff', 3, false),
		pointLightsOff = $.prop($$props, 'pointLightsOff', 3, false);

	let pointLightIntensity = Tween.of(() => pointLightsOff() ? 1 : 0);
	const options = { duration: 3e3 };
	const blueLightIntensity = Tween.of(() => machineIsOff() ? 0 : 2, options);
	const redLightIntensity = Tween.of(() => machineIsOff() ? 0 : 2, options);
	const whiteLightIntensity = Tween.of(() => machineIsOff() ? 0 : 1, options);
	const whiteAmbientLightIntensity = Tween.of(() => machineIsOff() ? 0 : 1, options);
	var fragment = root();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => 25 * pointLightIntensity.current);

		$.component(node, () => T.PointLight, ($$anchor, T_PointLight) => {
			T_PointLight($$anchor, {
				args: ['black'],
				'position.y': 1.37,
				'position.z': -0.12,
				get intensity() {
					return $.get($0);
				},
				distance: 1.2,
				decay: 2,
				get color() {
					return $$props.lightColor;
				}
			});
		});
	}

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, {
			intensity: 8,
			get color() {
				return $$props.lightColor;
			}
		});
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.AmbientLight, ($$anchor, T_AmbientLight_1) => {
		T_AmbientLight_1($$anchor, {
			get intensity() {
				return whiteAmbientLightIntensity.current;
			},
			color: 'white'
		});
	});

	var node_3 = $.sibling(node_2, 2);

	$.component(node_3, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, {
			get intensity() {
				return redLightIntensity.current;
			},
			color: '#F67F55',
			position: [-2.2, 3.6, 2.6]
		});
	});

	var node_4 = $.sibling(node_3, 2);

	$.component(node_4, () => T.DirectionalLight, ($$anchor, T_DirectionalLight_1) => {
		T_DirectionalLight_1($$anchor, {
			get intensity() {
				return blueLightIntensity.current;
			},
			position: [2.2, 3.4, 2.6],
			color: '#2722F3'
		});
	});

	var node_5 = $.sibling(node_4, 2);

	$.component(node_5, () => T.DirectionalLight, ($$anchor, T_DirectionalLight_2) => {
		T_DirectionalLight_2($$anchor, {
			get intensity() {
				return whiteLightIntensity.current;
			},
			position: [-1, 2.5, 1],
			color: 'white'
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}