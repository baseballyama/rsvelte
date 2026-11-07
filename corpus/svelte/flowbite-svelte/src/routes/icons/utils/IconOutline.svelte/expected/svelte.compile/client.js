import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Icon',
	'size',
	'role',
	'color',
	'ariaLabel',
	'class'
]);

export default function IconOutline($$anchor, $$props) {
	let color = $.prop($$props, 'color', 3, "currentColor"),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => $$props.Icon, ($$anchor, Icon_1) => {
		Icon_1($$anchor, $.spread_props(
			{
				fill: 'none',
				get color() {
					return color();
				}
			},
			() => restProps,
			{
				get role() {
					return $$props.role;
				},

				get size() {
					return $$props.size;
				},

				get class() {
					return $$props.class;
				},

				get ariaLabel() {
					return $$props.ariaLabel;
				}
			}
		));
	});

	$.append($$anchor, fragment);
}