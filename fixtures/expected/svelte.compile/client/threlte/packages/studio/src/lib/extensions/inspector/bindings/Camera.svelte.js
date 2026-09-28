import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as CamerakitPlugin from '@tweakpane/plugin-camerakit';
import { OrthographicCamera, PerspectiveCamera } from 'three';
import TransactionalBinding from './TransactionalBinding.svelte';
import { areOfType } from './utils.js';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Camera($$anchor, $$props) {
	$.push($$props, true);

	const orthographicKeys = ['bottom', 'left', 'top', 'right'];
	var fragment = root_1();
	var node = $.first_child(fragment);

	TransactionalBinding(node, {
		get objects() {
			return $$props.objects;
		},
		key: 'near',
		label: 'near',
		$$events: {
			change: () => {
				$$props.objects.forEach((object) => {
					object.updateProjectionMatrix();
				});
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	TransactionalBinding(node_1, {
		get objects() {
			return $$props.objects;
		},
		key: 'far',
		label: 'far',
		$$events: {
			change: () => {
				$$props.objects.forEach((object) => {
					object.updateProjectionMatrix();
				});
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	TransactionalBinding(node_2, {
		get objects() {
			return $$props.objects;
		},
		key: 'zoom',
		label: 'zoom',
		options: { min: 0 },
		$$events: {
			change: () => {
				$$props.objects.forEach((object) => {
					object.updateProjectionMatrix();
				});
			}
		}
	});

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var node_4 = $.first_child(fragment_1);

			TransactionalBinding(node_4, {
				get objects() {
					return $$props.objects;
				},
				key: 'fov',
				label: 'fov',
				get plugin() {
					return CamerakitPlugin;
				},
				options: { view: 'cameraring', min: 0, max: 180, format: (n) => `${n}°` },
				$$events: {
					change: () => {
						$$props.objects.forEach((object) => {
							object.updateProjectionMatrix();
						});
					}
				}
			});

			var node_5 = $.sibling(node_4, 2);

			TransactionalBinding(node_5, {
				get objects() {
					return $$props.objects;
				},
				key: 'filmOffset',
				label: 'filmOffset',
				$$events: {
					change: () => {
						$$props.objects.forEach((object) => {
							object.updateProjectionMatrix();
						});
					}
				}
			});

			var node_6 = $.sibling(node_5, 2);

			TransactionalBinding(node_6, {
				get objects() {
					return $$props.objects;
				},
				key: 'filmGauge',
				label: 'filmGauge',
				$$events: {
					change: () => {
						$$props.objects.forEach((object) => {
							object.updateProjectionMatrix();
						});
					}
				}
			});

			$.append($$anchor, fragment_1);
		};

		var d = $.derived(() => areOfType($$props.objects, 'isPerspectiveCamera'));

		var consequent_1 = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_7 = $.first_child(fragment_2);

			$.each(node_7, 16, () => orthographicKeys, (key) => key, ($$anchor, key) => {
				TransactionalBinding($$anchor, {
					get objects() {
						return $$props.objects;
					},

					get key() {
						return key;
					},

					get label() {
						return key;
					},

					$$events: {
						change: () => {
							$$props.objects.forEach((object) => {
								object.updateProjectionMatrix();
							});
						}
					}
				});
			});

			$.append($$anchor, fragment_2);
		};

		var d_1 = $.derived(() => areOfType($$props.objects, 'isOrthographicCamera'));

		$.if(node_3, ($$render) => {
			if ($.get(d)) $$render(consequent); else if ($.get(d_1)) $$render(consequent_1, 1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}