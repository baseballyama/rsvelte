import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useCamera } from '@threlte/core';

var root = $.from_html(`<!> <!>`, 1);

export default function ManualCameraState($$anchor, $$props) {
	$.push($$props, true);

	let firstMakeDefault = $.prop($$props, 'firstMakeDefault', 3, true),
		firstManual = $.prop($$props, 'firstManual', 3, true),
		secondManual = $.prop($$props, 'secondManual', 3, true),
		showSecond = $.prop($$props, 'showSecond', 3, false);

	const camera = useCamera();

	$.user_effect(() => {
		$$props.onmanual(camera.manual.current);
	});

	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			get makeDefault() {
				return firstMakeDefault();
			},

			get manual() {
				return firstManual();
			}
		});
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.component(node_2, () => T.OrthographicCamera, ($$anchor, T_OrthographicCamera) => {
				T_OrthographicCamera($$anchor, {
					makeDefault: true,
					get manual() {
						return secondManual();
					}
				});
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if (showSecond()) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}