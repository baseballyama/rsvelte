import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	if (name == "world") {
		$$renderer.push('<!--[0-->');

		if (bla) {
			$$renderer.push(`<!--[0-->asd`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if (bla) {
			$$renderer.push(`<!--[0-->asd`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	} else if (foo) {
		$$renderer.push('<!--[1-->');

		if (bla) {
			$$renderer.push(`<!--[0-->asd`);
		} else {
			$$renderer.push(`<!--[-1-->bar`);
		}

		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push('<!--[-1-->');

		if (bla) {
			$$renderer.push(`<!--[0-->asd`);
		} else if (blubb) {
			$$renderer.push(`<!--[1-->asd`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	}

	$$renderer.push(`<!--]--> `);

	if (name == "world") {
		$$renderer.push('<!--[0-->');

		if (bla) {
			$$renderer.push(`<!--[0-->asd`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (bla) {
			$$renderer.push(`<!--[0-->asd`);
		} else {
			$$renderer.push(`<!--[-1-->bar`);
		}

		$$renderer.push(`<!--]--> `);

		if (bla) {
			$$renderer.push(`<!--[0-->asd`);
		} else if (blubb) {
			$$renderer.push(`<!--[1-->bar`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (bla) {
			$$renderer.push(`<!--[0-->asd`);
		} else if (blubb) {
			$$renderer.push(`<!--[1-->bar`);
		} else {
			$$renderer.push(`<!--[-1-->foo`);
		}

		$$renderer.push(`<!--]-->`);
	} else if (foo) {
		$$renderer.push('<!--[1-->');

		if (bla) {
			$$renderer.push(`<!--[0-->asd`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (bla) {
			$$renderer.push(`<!--[0-->asd`);
		} else {
			$$renderer.push(`<!--[-1-->bar`);
		}

		$$renderer.push(`<!--]--> `);

		if (bla) {
			$$renderer.push(`<!--[0-->asd`);
		} else if (blubb) {
			$$renderer.push(`<!--[1-->bar`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (bla) {
			$$renderer.push(`<!--[0-->asd`);
		} else if (blubb) {
			$$renderer.push(`<!--[1-->bar`);
		} else {
			$$renderer.push(`<!--[-1-->foo`);
		}

		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push('<!--[-1-->');

		if (bla) {
			$$renderer.push(`<!--[0-->asd`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (bla) {
			$$renderer.push(`<!--[0-->asd`);
		} else {
			$$renderer.push(`<!--[-1-->bar`);
		}

		$$renderer.push(`<!--]--> `);

		if (bla) {
			$$renderer.push(`<!--[0-->asd`);
		} else if (blubb) {
			$$renderer.push(`<!--[1-->bar`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (bla) {
			$$renderer.push(`<!--[0-->asd`);
		} else if (blubb) {
			$$renderer.push(`<!--[1-->bar`);
		} else {
			$$renderer.push(`<!--[-1-->foo`);
		}

		$$renderer.push(`<!--]-->`);
	}

	$$renderer.push(`<!--]-->`);
}