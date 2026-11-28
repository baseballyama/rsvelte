;
function $$render() {
  
	let o = { 0x10: 1, [0b11]: 2, 0o17: 3, 1_000: 4, 1e-7: 5, 0x1fn: 6, .5: 7 };
	let /** @typedef {Record<string, any>} $$ComponentProps *//** @type {$$ComponentProps} */ { 0x10: a, 1e3: b, 1_000: c, ...rest } = $props();
	let m = o.x ?? 0xff;
	let xs = [];

;

  async () => {
    a;
    b;
    c;
    m;
    rest;
    {
      for (let x of __rsvelte_each(xs)) {
        const { 0x10: d } = x;
        d;
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const NumbersAsWritten__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof NumbersAsWritten__SvelteComponent_>} NumbersAsWritten__SvelteComponent_ */
export default NumbersAsWritten__SvelteComponent_;
