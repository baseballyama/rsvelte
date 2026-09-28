import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createClassComponent } from 'svelte/legacy';
import Component from './component.svelte';
import { mount, onMount } from 'svelte';

var root = $.from_html(`<button>reset</button> <div></div> <div></div>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let div1;
	let div2;
	let legacy;
	const props = $.proxy({ foo: 'foo', baz: 'baz' });

	onMount(() => {
		legacy = createClassComponent({
			component: Component,
			target: div1,
			props: { foo: 'foo', baz: 'baz' }
		});

		mount(Component, { target: div2, props });
	});

	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.sibling(button);
	var div = $.sibling(text);

	$.bind_this(div, ($$value) => div1 = $$value, () => div1);

	var div_1 = $.sibling(div, 2);

	$.bind_this(div_1, ($$value) => div2 = $$value, () => div2);
	$.template_effect(() => $.set_text(text, ` ${props.foo ?? ''} ${props.bar ?? ''} ${props.baz ?? ''} ${props.buz ?? ''} `));

	$.delegated('click', button, () => {
		legacy.$set({ foo: 'foo', bar: 'bar', baz: 'baz', buz: 'buz' });
		props.foo = 'foo';
		props.bar = 'bar';
		props.baz = 'baz';
		props.buz = 'buz';
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);