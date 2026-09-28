import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import { Checkbox as CheckboxPrimitive } from 'bits-ui';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'checked',
	'class',
	'indeterminate',
	'ref'
]);

var root = $.from_svg(`<svg width="9" height="9" viewBox="0 0 9 9" fill="currentcolor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.53547 0.62293C8.88226 0.849446 8.97976 1.3142 8.75325 1.66099L4.5083 8.1599C4.38833 8.34356 4.19397 8.4655 3.9764 8.49358C3.75883 8.52167 3.53987 8.45309 3.3772 8.30591L0.616113 5.80777C0.308959 5.52987 0.285246 5.05559 0.563148 4.74844C0.84105 4.44128 1.31533 4.41757 1.62249 4.69547L3.73256 6.60459L7.49741 0.840706C7.72393 0.493916 8.18868 0.396414 8.53547 0.62293Z"></path></svg>`);
var root_1 = $.from_svg(`<svg width="9" height="9" viewBox="0 0 9 9" fill="currentcolor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0.75 4.5C0.75 4.08579 1.08579 3.75 1.5 3.75H7.5C7.91421 3.75 8.25 4.08579 8.25 4.5C8.25 4.91421 7.91421 5.25 7.5 5.25H1.5C1.08579 5.25 0.75 4.91421 0.75 4.5Z"></path></svg>`);
var root_2 = $.from_html(`<div class="grid place-content-center text-current"><!></div>`);

export default function Checkbox($$anchor, $$props) {
	$.push($$props, true);

	let checked = $.prop($$props, 'checked', 15, false),
		indeterminate = $.prop($$props, 'indeterminate', 15, false),
		ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor, $$arg0) => {
			let checked = () => ($$arg0?.()).checked;
			let indeterminate = () => ($$arg0?.()).indeterminate;
			var div = root_2();
			var node_1 = $.child(div);

			{
				var consequent = ($$anchor) => {
					var svg = root();

					$.append($$anchor, svg);
				};

				var consequent_1 = ($$anchor) => {
					var svg_1 = root_1();

					$.append($$anchor, svg_1);
				};

				$.if(node_1, ($$render) => {
					if (checked() === true) $$render(consequent); else if (indeterminate()) $$render(consequent_1, 1);
				});
			}

			$.reset(div);
			$.append($$anchor, div);
		};

		let $0 = $.derived(() => cn('peer border-input focus-visible:border-ring focus-visible:ring-ring/50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground **:aria-[invalid]:border-destructive **:aria-[invalid]:ring-destructive/20 dark:**:aria-[invalid]:ring-destructive/40 size-4 shrink-0 rounded-[4px] border shadow-xs outline-hidden transition-shadow focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50', $$props.class));

		$.component(node, () => CheckboxPrimitive.Root, ($$anchor, CheckboxPrimitive_Root) => {
			CheckboxPrimitive_Root($$anchor, $.spread_props(
				{
					get class() {
						return $.get($0);
					}
				},
				() => restProps,
				{
					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					},

					get checked() {
						return checked();
					},

					set checked($$value) {
						checked($$value);
					},

					get indeterminate() {
						return indeterminate();
					},

					set indeterminate($$value) {
						indeterminate($$value);
					},
					children,
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}