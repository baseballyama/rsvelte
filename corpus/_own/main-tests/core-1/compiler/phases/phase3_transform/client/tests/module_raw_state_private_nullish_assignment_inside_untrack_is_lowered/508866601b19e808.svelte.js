
        import { untrack } from 'svelte';
        export class Query {
            #promise = $state.raw(null);
            #run() { return Promise.resolve(); }
            #get_promise() {
                void untrack(() => (this.#promise ??= this.#run()));
                return this.#promise;
            }
        }
    