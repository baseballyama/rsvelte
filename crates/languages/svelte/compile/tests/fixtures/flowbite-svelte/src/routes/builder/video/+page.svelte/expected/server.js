import * as $ from 'svelte/internal/server';
import { Video, Button, Label, Radio, uiHelpers } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Video builder";

		let description = "A quick way to create Video component";
		let title = "Video builder";
		let dir = "builder";
		let controls = true;

		const changeControls = () => {
			controls = !controls;
		};

		let autoplay = false;

		const changeAutoplay = () => {
			autoplay = !autoplay;
		};

		let muted = false;

		const changeMuted = () => {
			muted = !muted;
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

		let selectedClass = "default";

		// let selectedTransition = $state('Fly');
		let currentClass = $.derived(() => videoClasses.find((t) => t.name === selectedClass) || videoClasses[0]);

		// code generator
		let generatedCode = $.derived(() => (() => {
			let props = [];

			if (controls) props.push(" controls");
			if (autoplay) props.push(" autoplay");
			if (muted) props.push(" muted");
			if (currentClass().name !== "default") props.push(` class="${currentClass().class}"`);

			const propsString = props.length > 0
				? props.map((prop) => `\n  ${prop}`).join("") + "\n"
				: "";

			return `<Video src="/videos/flowbite.mp4"${propsString} trackSrc="flowbite.mp4" />`;
		})());

		// for interactive builder
		let builder = uiHelpers();

		let builderExpand = false;
		let showBuilderExpandButton = $.derived(() => isGeneratedCodeOverflow(generatedCode()));

		const handleBuilderExpandClick = () => {
			builderExpand = !builderExpand;
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			MetaTag($$renderer, { breadcrumb_title, description, title, dir });
			$$renderer.push(`<!----> `);

			H1($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Video Player Builder`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			{
				function codeblock($$renderer) {
					DynamicCodeBlockHighlight($$renderer, {
						handleExpandClick: handleBuilderExpandClick,
						expand: builderExpand,
						showExpandButton: showBuilderExpandButton(),
						code: generatedCode()
					});
				}

				CodeWrapper($$renderer, {
					codeblock,
					children: ($$renderer) => {
						$$renderer.push(`<div class="mb-4 md:h-[500px]">`);

						Video($$renderer, {
							src: '/videos/flowbite.mp4',
							controls,
							autoplay,
							muted,
							trackSrc: 'flowbite.mp4',
							class: currentClass().class
						});

						$$renderer.push(`<!----></div> <div class="mb-4 flex flex-wrap space-x-6">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Style`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(videoClasses);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let option = each_array[$$index];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-24" },
								name: 'interactive_toast_color',
								value: option.name,
								get group() {
									return selectedClass;
								},

								set group($$value) {
									selectedClass = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(option.name)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start">`);

						Button($$renderer, {
							class: 'w-40',
							color: 'emerald',
							onclick: changeControls,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(controls ? "Remove controls" : "Add controls")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'blue',
							onclick: changeAutoplay,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(autoplay ? "Remove autoplay" : "Add autoplay")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'pink',
							onclick: changeMuted,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(muted ? "Remove muted" : "Add muted")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div>`);
					},
					$$slots: { codeblock: true, default: true }
				});
			}

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}