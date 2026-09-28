import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let a = 0;
		let b = 0;
		let c = 0;
		let d = 0;
		let e = 0;
		let f = 0;
		let g = 0;
		let h = 0;
		let i = 0;
		let j = 0;
		let k = 0;
		let l = 0;
		let m = 0;
		let n = 0;
		let o = 0;
		let p = 0;
		let q = 0;
		let r = 0;
		let s = 0;
		let t = 0;
		let u = 0;
		let v = 0;
		let w = 0;
		let x = 0;
		let y = 0;
		let z = 0;

		const get_vwx = () => {
			return Promise.resolve({ v: 22, rest: [23, 24] });
		};

		const get_y = () => {
			return Promise.resolve([24, 25]);
		};

		const some = { fn: () => {} };

		const update = async () => {
			[a, b] = [1, await Promise.resolve(2)];
			({ c = await Promise.resolve(3), d } = { d: 4 });
			[e] = [await Promise.resolve(2) + await Promise.resolve(3)];
			({ f = false || await Promise.resolve(6) } = {});

			let func = Promise.resolve(() => 7);

			[g = (await func)()] = [];

			let mult = (a, b) => a * b;

			({ h } = { h: mult(2, await Promise.resolve(4)) });
			[i] = [new Date(await Promise.resolve(9)).getTime()];
			[j = "19" ? 10 : await Promise.resolve(11)] = [];

			let obj = { [await Promise.resolve("prop")]: k } = { prop: 11 };

			[l = obj[await Promise.resolve("prop")] + 1] = [];
			[m] = [`${1}${await Promise.resolve("3")}`];
			[n] = [-await Promise.resolve(-14)];
			[o] = [(some.fn(), await Promise.resolve(15))];
			({ anotherprop: p = await Promise.resolve(16) } = obj);

			let val1, val2;

			({
				val1 = (async function (x) {
					return await x;
				})(Promise.resolve(18)),
				r = await val1
			} = {
				val2 = (async (x) => await x)(Promise.resolve(17)),
				q = await val2
			} = []);

			({ u = 21 } = { t = await Promise.resolve(20) } = [s] = [await Promise.resolve(19)]);
			({ v, rest: [w] } = await get_vwx());
			[x, y, ...{ z = 26 }] = await get_y();
		};

		$$renderer.push(`<button>Update me!</button> <p>${$.escape(a)}</p> <p>${$.escape(b)}</p> <p>${$.escape(c)}</p> <p>${$.escape(d)}</p> <p>${$.escape(e)}</p> <p>${$.escape(f)}</p> <p>${$.escape(g)}</p> <p>${$.escape(h)}</p> <p>${$.escape(i)}</p> <p>${$.escape(j)}</p> <p>${$.escape(k)}</p> <p>${$.escape(l)}</p> <p>${$.escape(m)}</p> <p>${$.escape(n)}</p> <p>${$.escape(o)}</p> <p>${$.escape(p)}</p> <p>${$.escape(q)}</p> <p>${$.escape(r)}</p> <p>${$.escape(s)}</p> <p>${$.escape(t)}</p> <p>${$.escape(u)}</p> <p>${$.escape(v)}</p> <p>${$.escape(w)}</p> <p>${$.escape(x)}</p> <p>${$.escape(y)}</p> <p>${$.escape(z)}</p>`);
	});
}