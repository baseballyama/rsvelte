type __rsvelte_each_value<T> = 0 extends (1 & T) ? T : T extends ArrayLike<infer Value> ? Value : T extends Iterable<infer Value> ? Value : never;
declare function __rsvelte_each<T extends ArrayLike<unknown> | Iterable<unknown>>(values: T | null | undefined): Iterable<readonly [number, __rsvelte_each_value<T>]>;
// svelte2tsx's `__sveltets_2_ensureComponent` constraint, as a call: a class component, as Svelte 4 types declare one, takes the props of its instance; `any` stays `any`.
declare function __rsvelte_component<C extends ConstructorOfATypedSvelteComponent | import('svelte').Component<any, any, any> | null | undefined>(component: C): NonNullable<C extends (new (options: any) => infer Instance extends { $$prop_def: any }) ? (internals: Parameters<import('svelte').Component>[0], props: Instance['$$prop_def']) => Instance : C>;
declare const __rsvelte_children: () => any;
declare const __rsvelte_any_component: (internals: any, props: any) => any;
// The node of a directive on a component, which the compiler rejects; svelte2tsx passes `undefined.mapElementTag('undefined')`.
declare const __rsvelte_any_node: any;
declare function __rsvelte_slots<Slots = Record<string, Record<string, any>>>(): <Name extends keyof Slots>(name: Name, attributes: Slots[Name]) => Record<string, any>;
declare const __rsvelte_snippet_return: any;
declare function __rsvelte_slot_flags<Key extends string>(): Record<Key, boolean>;
declare function __rsvelte_component_props<C extends (internals: any, props: any) => unknown>(component: C): Parameters<C>[1] & Record<string, any>;
// The instance svelte2tsx constructs; a class component reaches here as the call `__rsvelte_component` makes of it.
declare function __rsvelte_instance<C>(component: C): C extends ConstructorOfATypedSvelteComponent ? InstanceType<C> : C extends ((...args: any) => infer Instance extends ATypedSvelteComponent) ? Instance : C extends import('svelte').Component<infer Props extends Record<string, any>, any, any> ? import('svelte').SvelteComponent<Props, Props['$$events'], Props['$$slots']> : any;
// The instance `$on` reads: a generic component's call constructs it for the generics the props infer.
declare function __rsvelte_constructed<C, Constructed>(component: C, constructed: Constructed): C extends { __rsvelte_instance: any } ? Constructed : ReturnType<typeof __rsvelte_instance<C>>;
// The props a component lets `bind:` pass, as svelte2tsx's `$$bindings`; a class component allows any.
declare function __rsvelte_bindings<C>(component: C): { $$bindings: C extends import('svelte').Component<any, any, infer Bindings extends string> ? Bindings : string };
declare function __rsvelte_internals(): Parameters<import('svelte').Component>[0];
// As svelte2tsx's `__sveltets_2_fn_component`: `keyof Props` of a large union of props is too complex to represent.
// @ts-ignore
declare function __rsvelte_export_component<Props extends Record<string, any>, Exports extends Record<string, any>, Bindings extends string>(): import('svelte').Component<Props, Exports, Bindings>;
// As svelte2tsx's `__sveltets_2_isomorphic_component`: outside runes mode, or with events, a class and a function at once. The events and the slots are values: svelte2tsx's events definition, and the object each `<slot>`'s attributes make.
// @ts-ignore
declare function __rsvelte_export_isomorphic<Props extends Record<string, any>, Exports extends Record<string, any>, Bindings extends string>(): <Events extends Record<string, any>, Slots>(events: Events, slots: Slots) => __sveltets_2_IsomorphicComponent<Props, Events, Slots, Exports, Bindings>;
// As svelte2tsx's `__sveltets_2_isomorphic_component_slots`: a component with slots, whose default slot takes children.
// @ts-ignore
declare function __rsvelte_export_isomorphic_slots<Props extends Record<string, any>, Exports extends Record<string, any>, Bindings extends string>(): <Events extends Record<string, any>, Slots>(events: Events, slots: Slots) => __sveltets_2_IsomorphicComponent<__sveltets_2_PropsWithChildren<Props, Slots>, Events, Slots, Exports, Bindings>;
// svelte2tsx's `__sveltets_2_mapElementEvent` and its siblings, with its maps (the window's and the body's swapped), typing an event no map names as the error leaves it, with no error: svelte-check drops the one svelte2tsx's makes, which maps nowhere.
type __rsvelte_event_of<Events, K> = [K] extends [keyof Events] ? Events[K] : Events[keyof Events];
declare function __rsvelte_element_event<K extends string>(event: K): __rsvelte_event_of<HTMLElementEventMap, K>;
declare function __rsvelte_window_event<K extends string>(event: K): __rsvelte_event_of<HTMLBodyElementEventMap, K>;
declare function __rsvelte_body_event<K extends string>(event: K): __rsvelte_event_of<WindowEventMap, K>;
// The events map a typed dispatcher was created with.
type __rsvelte_dispatcher_events<Dispatcher> = Dispatcher extends import('svelte').EventDispatcher<infer Events> ? Events : never;
// As svelte2tsx's `__sveltets_2_with_any_event`: a component without `strictEvents` takes any event too.
declare function __rsvelte_any_event<Events>(events: Events): Events & { [evt: string]: CustomEvent<any> };
// What a render function returns, or `Unrendered` when a hole closes it before its return: svelte2tsx's helpers then make the component of their constraints.
type __rsvelte_rendered<Rendered, Unrendered> = [Rendered] extends [void] ? Unrendered : Rendered;
type __rsvelte_unrendered_component = import('svelte').Component<Record<string, any>, Record<string, any>, string>;
type __rsvelte_unrendered_generic = import('svelte').Component<any, any, any> & { __rsvelte_bindings?: any; __rsvelte_exports?: any; __rsvelte_events?: any; __rsvelte_slots?: any };
type __rsvelte_unrendered_isomorphic = __sveltets_2_IsomorphicComponent<Record<string, any>, Record<string, any>, Record<string, any>, Record<string, any>, string>;
declare function __rsvelte_value<T>(): T;
// What `bind:this` assigns: a generic component's instance, or else what its call returns.
declare function __rsvelte_bind_this<C>(component: C): C extends { __rsvelte_instance: infer Instance } ? Instance : C;
// `__rsvelte_exports`: the exports without the `$on` and `$set` a call adds, as svelte2tsx's `exports()`.
declare function __rsvelte_export_generic<Props extends Record<string, any>, Exports extends Record<string, any>, Bindings>(): <Events extends Record<string, any>, Slots>(events: Events, slots: Slots) => import('svelte').Component<Props, Exports, any> & { __rsvelte_bindings?: Bindings; __rsvelte_exports?: Exports; __rsvelte_events?: Events; __rsvelte_slots?: Slots };
declare function __rsvelte_props<Required extends Record<string, unknown>, Optional extends Record<string, unknown>, Rest extends boolean>(required: Required, optional: Optional, rest: Rest): Required & Partial<Optional> & (Rest extends true ? Record<string, any> : {});
declare function __rsvelte_untyped_prop(): any;
declare function __rsvelte_array_prop(): any[];
declare function __rsvelte_record_prop(): Record<string, any>;
declare function __rsvelte_function_prop(): Function;
type __rsvelte_props_with_children<Props> = Props extends Record<string, never> ? any : Props & { children?: any };
// The run declares `untypedJavaScript` where an import of a JavaScript component is untyped.
interface __rsvelte_check_options {}
type __rsvelte_javascript_export<T> = __rsvelte_check_options extends { untypedJavaScript: true } ? any : T;
declare function __rsvelte_get_set<T>(get: (() => T) | null | undefined, set: (value: T) => void): T;
declare function __rsvelte_ensure_snippet(value: ReturnType<import('svelte').Snippet> | undefined | null): any;
