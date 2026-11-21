;
function $$render() {
  
	const list = [1, 2];

;

  async () => {
    {
      svelteHTML.createElement("input", {
        ...(list),
      });
    }
    {
      svelteHTML.createElement("a", {
        "href": "x",
        ...(list),
        "title": "t",
      });
    }
    {
      svelteHTML.createElement("b", {
        ...(list),
      });
    }
    {
      svelteHTML.createElement("x-café", {
        ...(list),
      });
    }
  };
  return __rsvelte_export_isomorphic<globalThis.Record<string, never>, { [evt: string]: CustomEvent<any> }, {}, string>()({});
}
const ElementAttributesFinding__SvelteComponent_ = $$render();
type ElementAttributesFinding__SvelteComponent_ = InstanceType<typeof ElementAttributesFinding__SvelteComponent_>;
export default ElementAttributesFinding__SvelteComponent_;
