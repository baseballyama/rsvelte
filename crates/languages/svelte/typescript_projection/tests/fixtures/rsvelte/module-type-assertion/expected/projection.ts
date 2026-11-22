;

	export const wrap = <T>(value: T) => (() => (value) as Inner<T>) as Box<T>;
	const n = (("text") as unknown) as number;
	function f() {
		return (n) as Missing;
	}

;

function $$render() {
  
	let kept = <string>(<unknown>1);

;

  async () => {
    {
      svelteHTML.createElement("p", {});
      kept;
    }
  };
  return __rsvelte_export_isomorphic<globalThis.Record<string, never>, {}, string>()(__rsvelte_any_event({}), {});
}
const ModuleTypeAssertion__SvelteComponent_ = $$render();
type ModuleTypeAssertion__SvelteComponent_ = InstanceType<typeof ModuleTypeAssertion__SvelteComponent_>;
export default ModuleTypeAssertion__SvelteComponent_;
