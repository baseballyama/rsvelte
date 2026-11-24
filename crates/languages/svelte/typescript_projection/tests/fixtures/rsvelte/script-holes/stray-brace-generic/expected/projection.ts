;
function $$render<T>() {
  
	type $$ComponentProps = { v: T };
let { v }: $$ComponentProps = $props();
	}
	let z = 1;

;

  async () => {
    {
      svelteHTML.createElement("p", {});
      v;
      z;
    }
  };
  return __rsvelte_export_generic<$$ComponentProps, {}, "">()({}, {});
}
// @ts-ignore
class __rsvelte_Render<T> { props(): Parameters<__rsvelte_rendered<Awaited<ReturnType<typeof $$render<T>>>, __rsvelte_unrendered_generic>>[1] { return null as any; } exports(): NonNullable<__rsvelte_rendered<Awaited<ReturnType<typeof $$render<T>>>, __rsvelte_unrendered_generic>['__rsvelte_exports']> { return null as any; } events(): NonNullable<__rsvelte_rendered<Awaited<ReturnType<typeof $$render<T>>>, __rsvelte_unrendered_generic>['__rsvelte_events']> { return null as any; } slots(): NonNullable<__rsvelte_rendered<Awaited<ReturnType<typeof $$render<T>>>, __rsvelte_unrendered_generic>['__rsvelte_slots']> { return null as any; } instance(): import('svelte').SvelteComponent<ReturnType<__rsvelte_Render<T>['props']>, ReturnType<__rsvelte_Render<T>['events']>, ReturnType<__rsvelte_Render<T>['slots']>> & ReturnType<__rsvelte_Render<T>['exports']> { return null as any; } }
// @ts-ignore
interface $$IsomorphicComponent { <T>(internals: Parameters<import('svelte').Component>[0], props: ReturnType<__rsvelte_Render<T>['props']>): ReturnType<__rsvelte_Render<T>['exports']>; __rsvelte_instance: <T>(internals: Parameters<import('svelte').Component>[0], props: ReturnType<__rsvelte_Render<T>['props']>) => ReturnType<__rsvelte_Render<T>['instance']>; element?: typeof HTMLElement; z_$$bindings?: NonNullable<__rsvelte_rendered<Awaited<ReturnType<typeof $$render<any>>>, __rsvelte_unrendered_generic>['__rsvelte_bindings']>; }
const StrayBraceGeneric__SvelteComponent_: $$IsomorphicComponent = null as any;
// @ts-ignore
type StrayBraceGeneric__SvelteComponent_<T> = ReturnType<__rsvelte_Render<T>['instance']>;
export default StrayBraceGeneric__SvelteComponent_;
