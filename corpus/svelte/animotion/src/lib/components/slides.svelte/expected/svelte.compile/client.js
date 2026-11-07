import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AnimotionSlide from './slide.svelte';

export default function Slides($$anchor, $$props) {
	$.push($$props, true);

	let center = $.prop($$props, 'center', 3, false);

	const slides = Object.entries(import.meta.glob('/src/slides/**/slide.svelte', { eager: true })).map(([filename, exports]) => {
		const matches = filename.match(/slides\/(?<number>\d+)\/slide.svelte/);

		return [+matches.groups.number, exports];
	}).sort(([a], [b]) => a - b);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => slides, $.index, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let _ = () => $.get($$array)[0];
		let Slide = () => $.get($$array)[1];
		const Wrapper = $.derived(() => Slide().component ?? AnimotionSlide);

		const props = $.derived(() => ({
			class: center()
				? 'h-full place-content-center place-items-center'
				: null,
			...Slide().props ?? {}
		}));

		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		$.component(node_1, () => $.get(Wrapper), ($$anchor, Wrapper_1) => {
			Wrapper_1($$anchor, $.spread_props(() => $.get(props), {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.component(node_2, () => Slide().default, ($$anchor, Slide_default) => {
						Slide_default($$anchor, {});
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			}));
		});

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}