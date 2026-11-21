;
function $$render() {
  
	let o = $state({});
	let xs = $state([]);
	let { 10n: big, [null]: none, ...derived } = $derived(o);
	let { 1.5: half, ...state } = $state({});
	let yes, regex, assigned;

	function assign(value) {
		({ [true]: yes, [/x/g]: regex, ...assigned } = value);
	}

;

  async () => {
    big;
    none;
    derived;
    half;
    state;
    yes;
    regex;
    assigned;
    {
      for (let [, { 1n: one, ['s']: s, ...item }] of __rsvelte_each(xs)) {
        one;
        s;
        item;
      }
    }
    {
      svelteHTML.createElement("button", {
        "onclick": () => assign(o),
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const RestExcludeLiteralKeys__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof RestExcludeLiteralKeys__SvelteComponent_>} */ (RestExcludeLiteralKeys__SvelteComponent_);
