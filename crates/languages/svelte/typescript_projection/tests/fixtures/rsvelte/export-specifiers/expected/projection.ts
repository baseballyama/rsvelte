;

	import Imp from './Imp.svelte';
	let { p = 1, q }: typeof __rsvelte_public_props0 = $props();
	let a = 1;
	let s = $state(0);
	let r = $state.raw(0);
	let d = $derived(s * 2);
	let l = 0;
	const c = 3;
	function f() { a = 0; s = 1; r = 2; l = 2; p = 3; q = 4; K = class {}; }
	let K = class {};
	type T = number;
	
	export type { T as U };
	const z = 1;

;

const __rsvelte_public_props0 = __rsvelte_props({
  q: __rsvelte_untyped_prop(),
}, {
  p: 1,
}, false);
() => {
  {
    svelteHTML.createElement("p", {});
    (s);
    (l);
    (a);
  }
};
const ExportSpecifiers__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {
  a: typeof a;
  b: typeof a;
  s: typeof s;
  r: typeof r;
  d: typeof d;
  lll: typeof l;
  "c-d": typeof c;
  f: typeof f;
  K: typeof K;
  Imp: typeof Imp;
  p: typeof p;
  q: typeof q;
  z: typeof z;
}, "">();
type ExportSpecifiers__SvelteComponent_ = ReturnType<typeof ExportSpecifiers__SvelteComponent_>;
export default ExportSpecifiers__SvelteComponent_;
