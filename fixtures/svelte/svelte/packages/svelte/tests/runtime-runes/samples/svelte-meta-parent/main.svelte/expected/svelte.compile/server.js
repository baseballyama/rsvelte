import * as $ from 'svelte/internal/server';
import Child from "./child.svelte";
import Passthrough from "./passthrough.svelte";

export default function Main($$renderer) {
	let x = { y: Child };
	let key = 'test';
	let show = true;

	$$renderer.push(`<p>no parent</p> <button>toggle</button> `);

	if (true) {
		$$renderer.push(`<!--[0--><p>if</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array = $.ensure_array_like([1]);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		$$renderer.push(`<p>each</p>`);
	}

	$$renderer.push(`<!--]--> `);

	$.await(
		$$renderer,
		Promise.resolve(),
		() => {
			$$renderer.push(`<p>loading</p>`);
		},
		() => {
			$$renderer.push(`<p>await</p>`);
		}
	);

	$$renderer.push(`<!--]--> <!---->`);

	{
		$$renderer.push(`<p>key</p>`);
	}

	$$renderer.push(`<!----> `);
	Child($$renderer, {});
	$$renderer.push(`<!----> `);

	Passthrough($$renderer, {
		children: ($$renderer) => {
			Child($$renderer, {});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Passthrough($$renderer, {
		children: ($$renderer) => {
			Passthrough($$renderer, {
				children: ($$renderer) => {
					Child($$renderer, {});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	if (show) {
		$$renderer.push('<!--[0-->');

		{
			function named($$renderer) {
				$$renderer.push(`<p>hi</p>`);
			}

			Passthrough($$renderer, { named, $$slots: { named: true } });
		}
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (x.y) {
		$$renderer.push('<!--[-->');
		x.y($$renderer, {});
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}