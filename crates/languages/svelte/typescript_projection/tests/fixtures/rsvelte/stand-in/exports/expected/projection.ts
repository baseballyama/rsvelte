;

	export const answer = 42;
	export type Answer = number;
	export function double(n: number) {
		return n * 2;
	}

;

function $$render() {
  
	let value = $state('');

;

  async () => {
    {
      svelteHTML.createElement("p", {
        "title": value,
      });
      if (value) {
        {
          __rsvelte_component(__rsvelte_any_component)(__rsvelte_internals(), {});
        }
      }
    }
  };
  return __rsvelte_export_component<globalThis.Record<string, never>, {}, "">();
}
const Exports__SvelteComponent_ = $$render();
type Exports__SvelteComponent_ = ReturnType<typeof Exports__SvelteComponent_>;
export default Exports__SvelteComponent_;
