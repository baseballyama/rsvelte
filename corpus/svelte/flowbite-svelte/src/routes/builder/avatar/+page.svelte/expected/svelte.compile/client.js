import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar, avatar, Label, Radio, Button, uiHelpers } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`<div class="mb-4 flex h-36 justify-center"><!> <!> <!></div> <div class="mb-4 flex flex-wrap space-x-4"><!> <!></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start"><!> <!> <!> <!> <!> <!> <!> <!></div>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];

	// MetaTag
	let breadcrumb_title = "Avatar builder";

	let description = "A quick way to create Avatar component";
	let title = "Avatar builder";
	let dir = "builder";

	// reactive example, rounded, border, stacked, size, className
	const sizes = Object.keys(avatar.variants.size);

	let avatarSize = $.state("md");
	let isRounded = $.state(false);

	const toggleCornerStyle = () => {
		$.set(isRounded, !$.get(isRounded));
	};

	let border = $.state(false);

	const changeBorder = () => {
		$.set(border, !$.get(border));
	};

	let stacked = $.state(false);

	const changeStacked = () => {
		$.set(stacked, !$.get(stacked));
	};

	let classStatus = $.state(false);

	const changeClassStatus = () => {
		$.set(classStatus, !$.get(classStatus));
		changeClass();
	};

	let avatarClass = $.state("");

	const changeClass = () => {
		const parts = [];

		if ($.get(classStatus)) {
			parts.push("mx-0.5");
		}

		if ($.get(eventStatus)) {
			parts.push("hover:cursor-pointer");
		}

		$.set(avatarClass, parts.join(" "), true);
	};

	let hrefStatus = $.state(false);

	const changeHrf = () => {
		$.set(hrefStatus, !$.get(hrefStatus));

		if (!$.get(hrefStatus)) $.set(targetStatus, false);
	};

	let dotStatus = $.state(false);

	const changeDot = () => {
		$.set(dotStatus, !$.get(dotStatus));
	};

	let targetStatus = $.state(false);

	const changeTarget = () => {
		$.set(targetStatus, !$.get(targetStatus));

		if ($.get(targetStatus)) $.set(hrefStatus, true);
	};

	let eventStatus = $.state(false);

	const changeEventStatus = () => {
		$.set(eventStatus, !$.get(eventStatus));
		changeClass();
	};

	// code generator
	let generatedCode = $.derived(() => (() => {
		let props = [];

		if ($.get(isRounded)) props.push('cornerStyle="rounded"');
		if ($.get(avatarSize) !== "md") props.push(`size="${$.get(avatarSize)}"`);
		if ($.get(border)) props.push("border");
		if ($.get(stacked)) props.push("stacked");
		if ($.get(avatarClass)) props.push(`class="${$.get(avatarClass)}"`);
		if ($.get(hrefStatus)) props.push('href="/"');
		if ($.get(dotStatus)) props.push('dot={{ placement: "bottom-right", color: "green" }}');
		if ($.get(targetStatus)) props.push('target="_blank"');
		if ($.get(eventStatus)) props.push('onclick={()=> alert("Clicked!")}');

		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		return `<Avatar src="/images/profile-picture-1.webp" alt="Profile picture 1"${propsString} />`;
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

			var text = $.text('Avatar Builder');

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

				{
					let $0 = $.derived(() => $.get(isRounded) ? "rounded" : undefined);
					let $1 = $.derived(() => $.get(hrefStatus) ? "/" : "");

					let $2 = $.derived(() => $.get(dotStatus)
						? { placement: "bottom-right", color: "green" }
						: undefined);

					let $3 = $.derived(() => $.get(targetStatus) ? "_blank" : undefined);
					let $4 = $.derived(() => $.get(eventStatus) ? () => alert("Clicked!") : undefined);

					Avatar(node_3, {
						src: '/images/profile-picture-1.webp',
						alt: 'Profile picture 1',
						get cornerStyle() {
							return $.get($0);
						},

						get border() {
							return $.get(border);
						},

						get stacked() {
							return $.get(stacked);
						},

						get class() {
							return $.get(avatarClass);
						},

						get size() {
							return $.get(avatarSize);
						},

						get href() {
							return $.get($1);
						},

						get dot() {
							return $.get($2);
						},

						get target() {
							return $.get($3);
						},

						get onclick() {
							return $.get($4);
						}
					});
				}

				var node_4 = $.sibling(node_3, 2);

				{
					let $0 = $.derived(() => $.get(isRounded) ? "rounded" : undefined);
					let $1 = $.derived(() => $.get(hrefStatus) ? "/" : "");

					let $2 = $.derived(() => $.get(dotStatus)
						? { placement: "bottom-right", color: "green" }
						: undefined);

					let $3 = $.derived(() => $.get(targetStatus) ? "_blank" : undefined);
					let $4 = $.derived(() => $.get(eventStatus) ? () => alert("Clicked!") : undefined);

					Avatar(node_4, {
						src: '/images/profile-picture-2.webp',
						alt: 'Profile picture 2',
						get cornerStyle() {
							return $.get($0);
						},

						get border() {
							return $.get(border);
						},

						get stacked() {
							return $.get(stacked);
						},

						get class() {
							return $.get(avatarClass);
						},

						get size() {
							return $.get(avatarSize);
						},

						get href() {
							return $.get($1);
						},

						get dot() {
							return $.get($2);
						},

						get target() {
							return $.get($3);
						},

						get onclick() {
							return $.get($4);
						}
					});
				}

				var node_5 = $.sibling(node_4, 2);

				{
					let $0 = $.derived(() => $.get(isRounded) ? "rounded" : undefined);
					let $1 = $.derived(() => $.get(hrefStatus) ? "/" : "");

					let $2 = $.derived(() => $.get(dotStatus)
						? { placement: "bottom-right", color: "green" }
						: undefined);

					let $3 = $.derived(() => $.get(targetStatus) ? "_blank" : undefined);
					let $4 = $.derived(() => $.get(eventStatus) ? () => alert("Clicked!") : undefined);

					Avatar(node_5, {
						src: '/images/profile-picture-3.webp',
						alt: 'Profile picture 3',
						get cornerStyle() {
							return $.get($0);
						},

						get border() {
							return $.get(border);
						},

						get stacked() {
							return $.get(stacked);
						},

						get class() {
							return $.get(avatarClass);
						},

						get size() {
							return $.get(avatarSize);
						},

						get href() {
							return $.get($1);
						},

						get dot() {
							return $.get($2);
						},

						get target() {
							return $.get($3);
						},

						get onclick() {
							return $.get($4);
						}
					});
				}

				$.reset(div);

				var div_1 = $.sibling(div, 2);
				var node_6 = $.child(div_1);

				Label(node_6, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Size');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var node_7 = $.sibling(node_6, 2);

				$.each(node_7, 17, () => sizes, $.index, ($$anchor, size) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-12" },
						name: 'spinnersize',
						get value() {
							return $.get(size);
						},

						get group() {
							return $.get(avatarSize);
						},

						set group($$value) {
							$.set(avatarSize, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text();

							$.template_effect(() => $.set_text(text_2, $.get(size)));
							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_1);

				var div_2 = $.sibling(div_1, 2);
				var node_8 = $.child(div_2);

				Button(node_8, {
					class: 'w-40',
					color: 'blue',
					onclick: toggleCornerStyle,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text();

						$.template_effect(() => $.set_text(text_3, $.get(isRounded) ? "Default: circular" : "Rounded"));
						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				var node_9 = $.sibling(node_8, 2);

				Button(node_9, {
					class: 'w-40',
					color: 'red',
					onclick: changeBorder,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text();

						$.template_effect(() => $.set_text(text_4, $.get(border) ? "Remove border" : "Add border"));
						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				var node_10 = $.sibling(node_9, 2);

				Button(node_10, {
					class: 'w-40',
					color: 'green',
					onclick: changeStacked,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text();

						$.template_effect(() => $.set_text(text_5, $.get(stacked) ? "Remove stacked" : "Add  stacked"));
						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				var node_11 = $.sibling(node_10, 2);

				Button(node_11, {
					class: 'w-40',
					color: 'purple',
					onclick: changeClassStatus,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text();

						$.template_effect(() => $.set_text(text_6, $.get(classStatus) ? "Remove class" : "Add class"));
						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});

				var node_12 = $.sibling(node_11, 2);

				Button(node_12, {
					class: 'w-40',
					color: 'yellow',
					onclick: changeHrf,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text();

						$.template_effect(() => $.set_text(text_7, $.get(hrefStatus) ? "Remove href" : "Add href"));
						$.append($$anchor, text_7);
					},
					$$slots: { default: true }
				});

				var node_13 = $.sibling(node_12, 2);

				Button(node_13, {
					class: 'w-40',
					color: 'cyan',
					onclick: changeDot,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_8 = $.text();

						$.template_effect(() => $.set_text(text_8, $.get(dotStatus) ? "Remove dot" : "Add dot"));
						$.append($$anchor, text_8);
					},
					$$slots: { default: true }
				});

				var node_14 = $.sibling(node_13, 2);

				Button(node_14, {
					class: 'w-40',
					color: 'pink',
					onclick: changeTarget,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_9 = $.text();

						$.template_effect(() => $.set_text(text_9, $.get(targetStatus) ? "Remove target" : "Add target"));
						$.append($$anchor, text_9);
					},
					$$slots: { default: true }
				});

				var node_15 = $.sibling(node_14, 2);

				Button(node_15, {
					class: 'w-40',
					color: 'gray',
					onclick: changeEventStatus,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_10 = $.text();

						$.template_effect(() => $.set_text(text_10, $.get(eventStatus) ? "Remove event" : "Add event"));
						$.append($$anchor, text_10);
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