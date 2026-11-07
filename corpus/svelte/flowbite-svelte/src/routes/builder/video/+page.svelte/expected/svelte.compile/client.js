import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Video, Button, Label, Radio, uiHelpers } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`<div class="mb-4 md:h-[500px]"><!></div> <div class="mb-4 flex flex-wrap space-x-6"><!> <!></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start"><!> <!> <!></div>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];

	// MetaTag
	let breadcrumb_title = "Video builder";

	let description = "A quick way to create Video component";
	let title = "Video builder";
	let dir = "builder";
	let controls = $.state(true);

	const changeControls = () => {
		$.set(controls, !$.get(controls));
	};

	let autoplay = $.state(false);

	const changeAutoplay = () => {
		$.set(autoplay, !$.get(autoplay));
	};

	let muted = $.state(false);

	const changeMuted = () => {
		$.set(muted, !$.get(muted));
	};

	const videoClasses = [
		{ name: "default", class: "w-full" },
		{ name: "width", class: "w-96" },
		{ name: "height", class: "h-80" },
		{ name: "responsive", class: "w-full max-w-full h-auto" },
		{
			name: "customStyle",
			class: "w-full max-w-full h-auto rounded-3xl border border-gray-200 dark:border-gray-700"
		}
	];

	let selectedClass = $.state("default");

	// let selectedTransition = $state('Fly');
	let currentClass = $.derived(() => videoClasses.find((t) => t.name === $.get(selectedClass)) || videoClasses[0]);

	// code generator
	let generatedCode = $.derived(() => (() => {
		let props = [];

		if ($.get(controls)) props.push(" controls");
		if ($.get(autoplay)) props.push(" autoplay");
		if ($.get(muted)) props.push(" muted");
		if ($.get(currentClass).name !== "default") props.push(` class="${$.get(currentClass).class}"`);

		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		return `<Video src="/videos/flowbite.mp4"${propsString} trackSrc="flowbite.mp4" />`;
	})());

	// for interactive builder
	let builder = uiHelpers();

	let builderExpand = $.state(false);
	let showBuilderExpandButton = $.derived(() => isGeneratedCodeOverflow($.get(generatedCode)));

	const handleBuilderExpandClick = () => {
		$.set(builderExpand, !$.get(builderExpand));
	};

	$.user_effect(() => {
		$.set(builderExpand, builder.isOpen, true);
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	MetaTag(node, { breadcrumb_title, description, title, dir });

	var node_1 = $.sibling(node, 2);

	H1(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Video Player Builder');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	{
		const codeblock = ($$anchor) => {
			DynamicCodeBlockHighlight($$anchor, {
				handleExpandClick: handleBuilderExpandClick,
				get expand() {
					return $.get(builderExpand);
				},

				get showExpandButton() {
					return $.get(showBuilderExpandButton);
				},

				get code() {
					return $.get(generatedCode);
				}
			});
		};

		CodeWrapper(node_2, {
			codeblock,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var div = $.first_child(fragment_2);
				var node_3 = $.child(div);

				Video(node_3, {
					src: '/videos/flowbite.mp4',
					get controls() {
						return $.get(controls);
					},

					get autoplay() {
						return $.get(autoplay);
					},

					get muted() {
						return $.get(muted);
					},
					trackSrc: 'flowbite.mp4',
					get class() {
						return $.get(currentClass).class;
					}
				});

				$.reset(div);

				var div_1 = $.sibling(div, 2);
				var node_4 = $.child(div_1);

				Label(node_4, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Style');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node_4, 2);

				$.each(node_5, 17, () => videoClasses, $.index, ($$anchor, option) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-24" },
						name: 'interactive_toast_color',
						get value() {
							return $.get(option).name;
						},

						get group() {
							return $.get(selectedClass);
						},

						set group($$value) {
							$.set(selectedClass, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text();

							$.template_effect(() => $.set_text(text_2, $.get(option).name));
							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_1);

				var div_2 = $.sibling(div_1, 2);
				var node_6 = $.child(div_2);

				Button(node_6, {
					class: 'w-40',
					color: 'emerald',
					onclick: changeControls,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text();

						$.template_effect(() => $.set_text(text_3, $.get(controls) ? "Remove controls" : "Add controls"));
						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				var node_7 = $.sibling(node_6, 2);

				Button(node_7, {
					class: 'w-40',
					color: 'blue',
					onclick: changeAutoplay,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text();

						$.template_effect(() => $.set_text(text_4, $.get(autoplay) ? "Remove autoplay" : "Add autoplay"));
						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				var node_8 = $.sibling(node_7, 2);

				Button(node_8, {
					class: 'w-40',
					color: 'pink',
					onclick: changeMuted,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text();

						$.template_effect(() => $.set_text(text_5, $.get(muted) ? "Remove muted" : "Add muted"));
						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				$.reset(div_2);
				$.append($$anchor, fragment_2);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}