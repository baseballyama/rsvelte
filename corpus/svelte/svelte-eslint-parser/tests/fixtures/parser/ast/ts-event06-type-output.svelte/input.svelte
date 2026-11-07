<script lang="ts">
    import Component from './ts-event03-input.svelte'; // Component: __sveltets_2_IsomorphicComponent<{}, { foo: CustomEvent<number>; bar: CustomEvent<string>; } & { [evt: string]: CustomEvent<any>; }, {}, Record<string, any>, string>
</script>

<Component on:foo="{e=>{ // Component: __sveltets_2_IsomorphicComponent<{}, { foo: CustomEvent<number>; bar: CustomEvent<string>; } & { [evt: string]: CustomEvent<any>; }, {}, Record<string, any>, string>, e: CustomEvent<number>
    // e.detail is number
    e.detail; // e.detail: number
}}" />
