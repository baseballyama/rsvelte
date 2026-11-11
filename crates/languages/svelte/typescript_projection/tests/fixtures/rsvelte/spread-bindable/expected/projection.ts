;

	let { value = $bindable(), text = $bindable('x'), ...properties }: typeof __rsvelte_public_props0 = $props();

;

const __rsvelte_public_props0 = __rsvelte_props({}, {
  value: __rsvelte_untyped_prop(),
  text: 'x',
}, true);
async () => {
  {
    svelteHTML.createElement("button", {
      ...(properties),
      "onclick": () => value++,
    });
    (value);
  }
  {
    svelteHTML.createElement("p", {
      "title": text,
    });
    (text);
  }
};
const SpreadBindable__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "value" | "text">();
type SpreadBindable__SvelteComponent_ = ReturnType<typeof SpreadBindable__SvelteComponent_>;
export default SpreadBindable__SvelteComponent_;
