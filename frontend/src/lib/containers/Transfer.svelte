<script lang="ts">
    import { ArrowDownToLine, ArrowLeftRight, ArrowUpDown, ArrowUpFromLine, Search, Star } from 'lucide-svelte';




</script>

<div class="container">
    <span class="overlay-shortcut">
        <ArrowLeftRight/>
        <h2>Transfer</h2>
    </span>
</div>
<div>

</div>

<style lang="scss">

    @use "src/styles/themes.scss" as *;
        * {
            font-family: var(--font-family);
        }

    :global(body) {
        margin: 0;
        padding: 0;
        color: #333;
    }

    .container {
        display: flex;
        flex-direction: column;
        margin: 0;
        padding: 0;
        left: 0;
        overflow-x: hidden;

    }

    span.overlay-shortcut {
        display: flex;
        flex-direction: column;
        height: auto;
        padding: 1rem;
        gap: 0;
        justify-content: center;
        align-items: center;

        h2 {
            font-size: 1.5rem;
        }
    }


</style>