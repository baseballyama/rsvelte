;
function $$render<T extends string>() {
  
	type $$ComponentProps = { value: T };
let { value }: $$ComponentProps = $props();
	function open(id: T) {
		return id;
	}

;

  async () => {
    {
      svelteHTML.createElement("p", {});
      value;
    }
  };
  return __rsvelte_export_generic<$$ComponentProps, {
    open: typeof open;
  }, "">()({}, {});
}
// @ts-ignore
class __rsvelte_Render<T extends string> { props(): Parameters<Awaited<ReturnType<typeof $$render<T>>>>[1] { return null as any; } exports(): NonNullable<Awaited<ReturnType<typeof $$render<T>>>['__rsvelte_exports']> { return null as any; } events(): NonNullable<Awaited<ReturnType<typeof $$render<T>>>['__rsvelte_events']> { return null as any; } slots(): NonNullable<Awaited<ReturnType<typeof $$render<T>>>['__rsvelte_slots']> { return null as any; } instance(): import('svelte').SvelteComponent<ReturnType<__rsvelte_Render<T>['props']>, ReturnType<__rsvelte_Render<T>['events']>, ReturnType<__rsvelte_Render<T>['slots']>> & ReturnType<__rsvelte_Render<T>['exports']> { return null as any; } }
// @ts-ignore
interface $$IsomorphicComponent { <T extends string>(internals: Parameters<import('svelte').Component>[0], props: ReturnType<__rsvelte_Render<T>['props']>): ReturnType<__rsvelte_Render<T>['exports']>; __rsvelte_instance: <T extends string>(internals: Parameters<import('svelte').Component>[0], props: ReturnType<__rsvelte_Render<T>['props']>) => ReturnType<__rsvelte_Render<T>['instance']>; element?: typeof HTMLElement; z_$$bindings?: NonNullable<Awaited<ReturnType<typeof $$render<any>>>['__rsvelte_bindings']>; }
const Component__SvelteComponent_: $$IsomorphicComponent = null as any;
// @ts-ignore
type Component__SvelteComponent_<T extends string> = ReturnType<__rsvelte_Render<T>['instance']>;
export default Component__SvelteComponent_;
