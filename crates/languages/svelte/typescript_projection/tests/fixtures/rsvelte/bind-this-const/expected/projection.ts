;
function $$render() {
  
	let items = $state([{ id: 1 }]);
	let els = $state({});
	let refs = $state([]);
	let n = $state(0);

;

  async () => {
    {
      for (let item of __rsvelte_each(items)) {
        let i = 1;
        const key = item.id;
        const k2 = key + n;
        {
          els[key] = svelteHTML.createElement("div", {});
        }
        {
          refs[k2][i] = svelteHTML.createElement("p", {});
        }
        if (n) {
          const inner = item.id;
          {
            els[inner] = svelteHTML.createElement("span", {});
          }
        }
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const BindThisConst__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof BindThisConst__SvelteComponent_>} BindThisConst__SvelteComponent_ */
export default BindThisConst__SvelteComponent_;
