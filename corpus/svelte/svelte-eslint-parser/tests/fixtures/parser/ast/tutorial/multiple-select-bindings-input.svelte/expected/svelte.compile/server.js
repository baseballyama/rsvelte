import * as $ from 'svelte/internal/server';

export default function Multiple_select_bindings_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let scoops = 1;
		let flavours = ['Mint choc chip'];
		let menu = ['Cookies and cream', 'Mint choc chip', 'Raspberry ripple'];

		function join(flavours) {
			if (flavours.length === 1) return flavours[0];

			return `${flavours.slice(0, -1).join(', ')} and ${flavours[flavours.length - 1]}`;
		}

		$$renderer.push(`<h2>Size</h2> <label><input type="radio"${$.attr('checked', scoops === 1, true)}${$.attr('value', 1)}/> One scoop</label> <label><input type="radio"${$.attr('checked', scoops === 2, true)}${$.attr('value', 2)}/> Two scoops</label> <label><input type="radio"${$.attr('checked', scoops === 3, true)}${$.attr('value', 3)}/> Three scoops</label> <h2>Flavours</h2> `);

		$$renderer.select({ multiple: true, value: flavours }, ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(menu);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let flavour = each_array[$$index];

				$$renderer.option({ value: flavour }, ($$renderer) => {
					$$renderer.push(`${$.escape(flavour)}`);
				});
			}

			$$renderer.push(`<!--]-->`);
		});

		$$renderer.push(` `);

		if (flavours.length === 0) {
			$$renderer.push(`<!--[0--><p>Please select at least one flavour</p>`);
		} else if (flavours.length > scoops) {
			$$renderer.push(`<!--[1--><p>Can't order more flavours than scoops!</p>`);
		} else {
			$$renderer.push(`<!--[-1--><p>You ordered ${$.escape(scoops)} ${$.escape(scoops === 1 ? 'scoop' : 'scoops')}
		of ${$.escape(join(flavours))}</p>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}