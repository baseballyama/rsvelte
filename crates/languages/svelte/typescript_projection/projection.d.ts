type __rsvelte_each_value<T> = 0 extends (1 & T) ? T : T extends ArrayLike<infer Value> ? Value : T extends Iterable<infer Value> ? Value : never;
declare function __rsvelte_each<T extends ArrayLike<unknown> | Iterable<unknown>>(values: T | null | undefined): Iterable<readonly [number, __rsvelte_each_value<T>]>;
declare function __rsvelte_component<C extends ((internals: Parameters<import('svelte').Component>[0], props: never) => unknown) | null | undefined>(component: C): NonNullable<C>;
declare function __rsvelte_internals(): Parameters<import('svelte').Component>[0];
declare function __rsvelte_export_component<Props extends Record<string, any>, Exports extends Record<string, any>, Bindings extends keyof Props | ''>(): import('svelte').Component<Props, Exports, Bindings>;
declare function __rsvelte_props<Required extends Record<string, unknown>, Optional extends Record<string, unknown>, Rest extends boolean>(required: Required, optional: Optional, rest: Rest): Required & Partial<Optional> & (Rest extends true ? Record<string, any> : {});
declare function __rsvelte_untyped_prop(): any;
declare function __rsvelte_empty_array(values: unknown[]): any[];
