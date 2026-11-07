import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inspect from '@components/Inspect.svelte';
import { getContext } from 'svelte';

export default function Functions($$anchor, $$props) {
	$.push($$props, true);
	getContext('toc')?.set('Functions', 'functions');

	const arrowFunction = eval(`(num) => num * 2`);
	const asyncFn = eval(`async (num) => num * 2`);

	const someFunction = eval(`(function someFunction(some, thing) {
    if (!some) return thing
    const obj = {
      some: thing,
      thing: some,
      [Symbol('oh')]: 'doodle',
    }

    try {
      Math.random()
    } catch {
      const { log } = console
      log('oh no')
      log(obj)
    }
    return some + ' ' + thing
  })`);

	const generator = eval(`(function* fibonacci() {
    let current = 1
    let next = 1
    while (true) {
      yield current
      ;[current, next] = [next, current + next]
    }
  })`);

	const asyncGenerator = eval(`(async function* suspensefulFibonacci() {
  let current = 1
  let next = 1
  while (true) {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(undefined)
      }, 1000)
    })
    yield current
    ;[current, next] = [next, current + next]
  }
})`);

	{
		let $0 = $.derived(() => ({
			arrowFunction,
			asyncFn,
			someFunction,
			generator,
			asyncGenerator
		}));

		Inspect($$anchor, {
			get values() {
				return $.get($0);
			},
			expandLevel: 0
		});
	}

	$.pop();
}