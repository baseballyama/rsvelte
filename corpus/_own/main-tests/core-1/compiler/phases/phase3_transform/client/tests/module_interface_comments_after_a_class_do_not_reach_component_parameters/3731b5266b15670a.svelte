
        <script module lang="ts">
            class Context {
                value = 0;
            }

            export interface TransitionProps {
                /** state of the element */
                show?: boolean;
                /** lifecycle events */
                beforeEnter?: () => void;
            }
        </script>
        <script lang="ts">
            let { show = false }: TransitionProps = $props();
        </script>
        {#if show}<div></div>{/if}
    