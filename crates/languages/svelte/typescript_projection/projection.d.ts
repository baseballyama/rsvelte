type __rsvelte_each_value<T> = 0 extends (1 & T) ? T : T extends ArrayLike<infer Value> ? Value : T extends Iterable<infer Value> ? Value : never;
declare function __rsvelte_each<T extends ArrayLike<unknown> | Iterable<unknown>>(values: T | null | undefined): Iterable<readonly [number, __rsvelte_each_value<T>]>;
// A class component, as Svelte 4 types declare one, takes the props of its instance; `any` stays `any`.
declare function __rsvelte_component<C extends (new (options: any) => { $$prop_def: any }) | ((internals: Parameters<import('svelte').Component>[0], props: never) => unknown) | null | undefined>(component: C): NonNullable<C extends (new (options: any) => infer Instance extends { $$prop_def: any }) ? (internals: Parameters<import('svelte').Component>[0], props: Instance['$$prop_def']) => Instance : C>;
declare const __rsvelte_children: () => any;
declare const __rsvelte_any_component: (internals: any, props: any) => any;
declare function __rsvelte_slots<Slots = Record<string, Record<string, any>>>(): <Name extends keyof Slots>(name: Name, attributes: Slots[Name]) => void;
declare const __rsvelte_snippet_return: any;
declare function __rsvelte_slot_flags<Key extends string>(): Record<Key, boolean>;
declare function __rsvelte_component_props<C extends (internals: any, props: any) => unknown>(component: C): Parameters<C>[1] & Record<string, any>;
declare function __rsvelte_instance<C>(component: C): C extends ConstructorOfATypedSvelteComponent ? InstanceType<C> : C extends { __rsvelte_events: infer Events; __rsvelte_slot_def: infer Slots } & import('svelte').Component<infer Props extends Record<string, any>, any, any> ? import('svelte').SvelteComponent<Props, Events, Slots> : C extends import('svelte').Component<infer Props extends Record<string, any>, any, any> ? import('svelte').SvelteComponent<Props, { [event: string]: CustomEvent<any> }, any> : any;
// The props a component lets `bind:` pass, as svelte2tsx's `$$bindings`; a class component allows any.
declare function __rsvelte_bindings<C>(component: C): { $$bindings: C extends import('svelte').Component<any, any, infer Bindings extends string> ? Bindings : string };
declare function __rsvelte_internals(): Parameters<import('svelte').Component>[0];
// As svelte2tsx's `__sveltets_2_fn_component`: `keyof Props` of a large union of props is too complex to represent.
// @ts-ignore
declare function __rsvelte_export_component<Props extends Record<string, any>, Exports extends Record<string, any>, Bindings extends string>(): import('svelte').Component<Props, Exports, Bindings>;
// A component that declares `$$Events` or `$$Slots`, whose instance svelte2tsx types with exactly those.
// @ts-ignore
declare function __rsvelte_export_typed<Props extends Record<string, any>, Exports extends Record<string, any>, Bindings extends string, Events, Slots>(): import('svelte').Component<Props, Exports, Bindings> & { __rsvelte_events: Events; __rsvelte_slot_def: Slots };
// A component that types its slots by its `<slot>` elements, with svelte2tsx's events of any name.
declare function __rsvelte_with_slots<C, Slots>(component: C, slots: Slots): C & { __rsvelte_events: { [event: string]: CustomEvent<any> }; __rsvelte_slot_def: Slots };
declare function __rsvelte_export_generic<Props extends Record<string, any>, Exports extends Record<string, any>, Bindings>(): import('svelte').Component<Props, Exports, any> & { __rsvelte_bindings?: Bindings };
declare function __rsvelte_props<Required extends Record<string, unknown>, Optional extends Record<string, unknown>, Rest extends boolean>(required: Required, optional: Optional, rest: Rest): Required & Partial<Optional> & (Rest extends true ? Record<string, any> : {});
declare function __rsvelte_untyped_prop(): any;
declare function __rsvelte_array_prop(): any[];
declare function __rsvelte_record_prop(): Record<string, any>;
declare function __rsvelte_function_prop(): Function;
type __rsvelte_no_props = Record<string, never>;
type __rsvelte_props_with_children<Props> = Props extends __rsvelte_no_props ? any : Props & { children?: any };
type __rsvelte_store<T> = { subscribe: (run: (value: T) => any, invalidate?: any) => any };
type __rsvelte_store_value<Store> = Store extends __rsvelte_store<infer T> ? T : Store;
// The run declares `untypedJavaScript` where an import of a JavaScript component is untyped.
interface __rsvelte_check_options {}
type __rsvelte_javascript_export<T> = __rsvelte_check_options extends { untypedJavaScript: true } ? any : T;
declare function __rsvelte_store_get<Store>(store: Store): __rsvelte_store_value<Store>;
declare function __rsvelte_get_set<T>(get: (() => T) | null | undefined, set: (value: T) => void): T;
declare function __rsvelte_ensure_snippet(value: ReturnType<import('svelte').Snippet> | undefined | null): any;
