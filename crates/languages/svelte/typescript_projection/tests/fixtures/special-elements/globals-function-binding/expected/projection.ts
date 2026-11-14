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
const GlobalsFunctionBinding__SvelteComponent_ = __rsvelte_export_component();
export default GlobalsFunctionBinding__SvelteComponent_;
