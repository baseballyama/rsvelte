{#if visible}
                <section>
                    <slot name="nested" value={item} />
                    <button on:click />
                </section>
            {/if}
            <Component on:change />