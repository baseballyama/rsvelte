const o = {
	$state: (v) => v,
	$derived: (v) => v,
	$effect: (f) => f,
	$inspect: (v) => v,
	p: { $derived: (v) => v }
};

export const a = o.$state(1);
export const b = o.$derived(2);
export const c = o.$effect(() => {});
export const d = o.$inspect(3);
export const e = o?.$derived(4);
export const f = o.p.$derived(5);
export const g = o
	.$derived(6);
