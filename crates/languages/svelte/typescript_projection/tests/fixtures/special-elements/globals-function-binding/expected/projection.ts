;
let x = $state(0); function get() { return x; } function set(value) { x = value; }
;

async () => {
  {
    svelteHTML.createElement("svelte:window", {
      "bind:scrollX": __rsvelte_get_set(get, set),
    });
  }
};
const GlobalsFunctionBinding__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof GlobalsFunctionBinding__SvelteComponent_>} */ (GlobalsFunctionBinding__SvelteComponent_);
