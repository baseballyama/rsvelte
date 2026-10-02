import * as $ from 'svelte/internal/server';
import { Avatar, avatar, Label, Radio, Button, uiHelpers } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Avatar builder";

		let description = "A quick way to create Avatar component";
		let title = "Avatar builder";
		let dir = "builder";

		// reactive example, rounded, border, stacked, size, className
		const sizes = Object.keys(avatar.variants.size);

		let avatarSize = "md";
		let isRounded = false;

		const toggleCornerStyle = () => {
			isRounded = !isRounded;
		};

		let border = false;

		const changeBorder = () => {
			border = !border;
		};

		let stacked = false;

		const changeStacked = () => {
			stacked = !stacked;
		};

		let classStatus = false;

		const changeClassStatus = () => {
			classStatus = !classStatus;
			changeClass();
		};

		let avatarClass = "";

		const changeClass = () => {
			const parts = [];

			if (classStatus) {
				parts.push("mx-0.5");
			}

			if (eventStatus) {
				parts.push("hover:cursor-pointer");
			}

			avatarClass = parts.join(" ");
		};

		let hrefStatus = false;

		const changeHrf = () => {
			hrefStatus = !hrefStatus;

			if (!hrefStatus) targetStatus = false;
		};

		let dotStatus = false;

		const changeDot = () => {
			dotStatus = !dotStatus;
		};

		let targetStatus = false;

		const changeTarget = () => {
			targetStatus = !targetStatus;

			if (targetStatus) hrefStatus = true;
		};

		let eventStatus = false;

		const changeEventStatus = () => {
			eventStatus = !eventStatus;
			changeClass();
		};

		// code generator
		let generatedCode = $.derived(() => (() => {
			let props = [];

			if (isRounded) props.push('cornerStyle="rounded"');
			if (avatarSize !== "md") props.push(`size="${avatarSize}"`);
			if (border) props.push("border");
			if (stacked) props.push("stacked");
			if (avatarClass) props.push(`class="${avatarClass}"`);
			if (hrefStatus) props.push('href="/"');
			if (dotStatus) props.push('dot={{ placement: "bottom-right", color: "green" }}');
			if (targetStatus) props.push('target="_blank"');
			if (eventStatus) props.push('onclick={()=> alert("Clicked!")}');

			const propsString = props.length > 0
				? props.map((prop) => `\n  ${prop}`).join("") + "\n"
				: "";

			return `<Avatar src="/images/profile-picture-1.webp" alt="Profile picture 1"${propsString} />`;
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
					$$renderer.push(`<!---->Avatar Builder`);
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
						$$renderer.push(`<div class="mb-4 flex h-36 justify-center">`);

						Avatar($$renderer, {
							src: '/images/profile-picture-1.webp',
							alt: 'Profile picture 1',
							cornerStyle: isRounded ? "rounded" : undefined,
							border,
							stacked,
							class: avatarClass,
							size: avatarSize,
							href: hrefStatus ? "/" : "",
							dot: dotStatus
								? { placement: "bottom-right", color: "green" }
								: undefined,
							target: targetStatus ? "_blank" : undefined,
							onclick: eventStatus ? () => alert("Clicked!") : undefined
						});

						$$renderer.push(`<!----> `);

						Avatar($$renderer, {
							src: '/images/profile-picture-2.webp',
							alt: 'Profile picture 2',
							cornerStyle: isRounded ? "rounded" : undefined,
							border,
							stacked,
							class: avatarClass,
							size: avatarSize,
							href: hrefStatus ? "/" : "",
							dot: dotStatus
								? { placement: "bottom-right", color: "green" }
								: undefined,
							target: targetStatus ? "_blank" : undefined,
							onclick: eventStatus ? () => alert("Clicked!") : undefined
						});

						$$renderer.push(`<!----> `);

						Avatar($$renderer, {
							src: '/images/profile-picture-3.webp',
							alt: 'Profile picture 3',
							cornerStyle: isRounded ? "rounded" : undefined,
							border,
							stacked,
							class: avatarClass,
							size: avatarSize,
							href: hrefStatus ? "/" : "",
							dot: dotStatus
								? { placement: "bottom-right", color: "green" }
								: undefined,
							target: targetStatus ? "_blank" : undefined,
							onclick: eventStatus ? () => alert("Clicked!") : undefined
						});

						$$renderer.push(`<!----></div> <div class="mb-4 flex flex-wrap space-x-4">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Size`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(sizes);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let size = each_array[$$index];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-12" },
								name: 'spinnersize',
								value: size,
								get group() {
									return avatarSize;
								},

								set group($$value) {
									avatarSize = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(size)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start">`);

						Button($$renderer, {
							class: 'w-40',
							color: 'blue',
							onclick: toggleCornerStyle,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(isRounded ? "Default: circular" : "Rounded")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'red',
							onclick: changeBorder,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(border ? "Remove border" : "Add border")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'green',
							onclick: changeStacked,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(stacked ? "Remove stacked" : "Add  stacked")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'purple',
							onclick: changeClassStatus,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(classStatus ? "Remove class" : "Add class")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'yellow',
							onclick: changeHrf,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(hrefStatus ? "Remove href" : "Add href")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'cyan',
							onclick: changeDot,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(dotStatus ? "Remove dot" : "Add dot")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'pink',
							onclick: changeTarget,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(targetStatus ? "Remove target" : "Add target")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'gray',
							onclick: changeEventStatus,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(eventStatus ? "Remove event" : "Add event")}`);
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