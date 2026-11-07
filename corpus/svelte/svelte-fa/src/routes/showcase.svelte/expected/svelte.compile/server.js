import * as $ from 'svelte/internal/server';
import { Fa } from "$lib/index.js";
import { faFlag, faHome, faCog, faSeedling } from "@fortawesome/free-solid-svg-icons";

export default function Showcase($$renderer) {
	let model = { size: 5, pull: undefined, flip: undefined, rotate: 0 };
	let pull = ["None", "Left", "Right"];
	let flip = ["None", "Horizontal", "Vertical", "Both"];
	let icons = [faFlag, faHome, faCog, faSeedling];
	let iconsTitles = ["flag", "home", "cog", "seedling"];

	function setPull(value) {
		let pull = undefined;

		if (value === "Left") {
			pull = "left";
		} else if (value === "Right") {
			pull = "right";
		}

		model.pull = pull;
	}

	function setFlip(value) {
		let flip = undefined;

		if (value === "Horizontal") {
			flip = "horizontal";
		} else if (value === "Vertical") {
			flip = "vertical";
		} else if (value === "Both") {
			flip = "both";
		}

		model.flip = flip;
	}

	$$renderer.push(`<div class="p-5 bg-body-tertiary rounded"><div class="row"><div class="col-md"><h1 class="hue svelte-8eaich"><strong><a href="https://github.com/Cweili/svelte-fa" target="_blank">svelte-fa</a></strong></h1> <p><a href="https://www.npmjs.com/package/svelte-fa" target="_blank"><img src="https://img.shields.io/npm/v/svelte-fa.svg" alt="npm version"/></a> <a href="https://bundlephobia.com/result?p=svelte-fa" target="_blank"><img src="https://img.shields.io/bundlephobia/minzip/svelte-fa.svg" alt="bundle size"/></a> <a href="https://github.com/Cweili/svelte-fa/blob/master/LICENSE" target="_blank"><img src="https://img.shields.io/npm/l/svelte-fa.svg" alt="MIT licence"/></a> <a href="https://www.npmjs.com/package/svelte-fa" target="_blank"><img src="https://img.shields.io/npm/dt/svelte-fa.svg" alt="npm downloads"/></a> <a href="https://github.com/Cweili/svelte-fa" target="_blank"><img src="https://img.shields.io/github/issues/Cweili/svelte-fa.svg" alt="github issues"/></a></p> <p class="lead mb-5">Tiny <a class="hue svelte-8eaich" href="https://fontawesome.com/" target="_blank">FontAwesome</a> component for <a class="hue svelte-8eaich" href="https://svelte.dev/" target="_blank">Svelte</a>.</p> <form><div class="row mb-3"><label for="iconSizeInput" class="col-sm-3 col-form-label">Icon Sizes</label> <div class="col-sm-9 row"><div class="col-md-8 py-2"><input${$.attr('value', model.size)} type="range" class="form-control-range" id="iconSizeInput" min="1" max="10" step="0.1"/></div> <div class="col-md-4"><div class="form-control text-center">${$.escape(model.size)}x</div></div></div></div> <div class="row mb-3"><span class="col-sm-3 col-form-label">Pulled Icons</span> <div class="col-sm-9"><div class="btn-group" role="group" aria-label="Basic example"><!--[-->`);

	const each_array = $.ensure_array_like(pull);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let p = each_array[$$index];

		$$renderer.push(`<button${$.attr_class(`btn btn-${model.pull == (p == "None" ? undefined : p.toLowerCase()) ? "primary" : "secondary"}`, 'svelte-8eaich')} type="button">${$.escape(p)}</button>`);
	}

	$$renderer.push(`<!--]--></div></div></div> <div class="row mb-3"><span class="col-sm-3 col-form-label">Flip</span> <div class="col-sm-9"><div class="btn-group" role="group" aria-label="Basic example"><!--[-->`);

	const each_array_1 = $.ensure_array_like(flip);

	for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
		let f = each_array_1[$$index_1];

		$$renderer.push(`<button${$.attr_class(`btn btn-${model.flip == (f == "None" ? undefined : f.toLowerCase()) ? "primary" : "secondary"}`, 'svelte-8eaich')} type="button">${$.escape(f)}</button>`);
	}

	$$renderer.push(`<!--]--></div></div></div> <div class="row mb-3"><label for="rotateInput" class="col-sm-3 col-form-label">Rotate</label> <div class="col-sm-9 row"><div class="col-md-8 py-2"><input${$.attr('value', model.rotate)} type="range" class="form-control-range" id="rotateInput" min="-360" max="360" step="1"/></div> <div class="col-md-4"><div class="form-control text-center">${$.escape(model.rotate)}deg</div></div></div></div></form></div> <div class="col-md row"><!--[-->`);

	const each_array_2 = $.ensure_array_like(icons);

	for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
		let icon = each_array_2[i];

		$$renderer.push(`<div class="col text-center hue svelte-8eaich">`);

		Fa($$renderer, {
			icon,
			flip: model.flip,
			pull: model.pull,
			rotate: model.rotate,
			size: `${model.size}x`,
			title: iconsTitles[i]
		});

		$$renderer.push(`<!----></div>`);
	}

	$$renderer.push(`<!--]--></div></div></div>`);
}