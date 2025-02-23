<script lang="ts">
    import { onMount } from 'svelte';
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';

    interface PlayerPosition {
        x: number;
        y: number;
    }

    interface NPC {
        id: number;
        x: number;
        y: number;
        type: string;
    }

    let player = tweened<PlayerPosition>({ x: 50, y: 50 }, { duration: 100, easing: cubicOut });
    let npcs: NPC[] = [
        { id: 1, x: 100, y: 100, type: 'friendly' },
        { id: 2, x: 200, y: 200, type: 'enemy' },
    ];
    let playerDirection = 'down';
    let isMoving = false;
    let animationFrame = 0;
    let zoomFactor = 1;
    let gameContainer: HTMLElement;

    const pixelSize = 40;
    const moveSpeed = pixelSize;
    const mapWidth = 256;
    const mapHeight = 256;
    const minZoom = 0.5;
    const maxZoom = 4;
    const zoomStep = 0.1;

    function handleMovement(event: KeyboardEvent) {
        if (isMoving) return;
        
        let newX = $player.x;
        let newY = $player.y;

        switch(event.key) {
            case 'ArrowUp':
                newY -= moveSpeed;
                playerDirection = 'up';
                break;
            case 'ArrowDown':
                newY += moveSpeed;
                playerDirection = 'down';
                break;
            case 'ArrowLeft':
                newX -= moveSpeed;
                playerDirection = 'left';
                break;
            case 'ArrowRight':
                newX += moveSpeed;
                playerDirection = 'right';
                break;
            default:
                return;
        }

        if (newX >= 0 && newX < mapWidth * pixelSize && newY >= 0 && newY < mapHeight * pixelSize) {
            isMoving = true;
            player.set({ x: newX, y: newY }).then(() => {
                isMoving = false;
            });
        }
    }

    function interactWithNPC(npc: NPC) {
        alert(`Interacting with ${npc.type} NPC ${npc.id}`);
    }

    function animatePlayer() {
        animationFrame = isMoving ? (animationFrame + 1) % 4 : 0;
        requestAnimationFrame(animatePlayer);
    }

    function handleWheel(event: WheelEvent) {
        event.preventDefault();
        const delta = event.deltaY > 0 ? -zoomStep : zoomStep;
        const newZoom = Math.max(minZoom, Math.min(maxZoom, zoomFactor + delta));
        
        if (newZoom !== zoomFactor) {
            const rect = gameContainer.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            zoomFactor = newZoom;
            updateGameContainerTransform(x, y);
        }
    }

    function updateGameContainerTransform(x: number, y: number) {
        if (gameContainer) {
            const scale = zoomFactor;
            const translateX = x - (x * scale);
            const translateY = y - (y * scale);
            gameContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
            
            const playerElem = gameContainer.querySelector('.player') as HTMLElement;
            const npcElems = gameContainer.querySelectorAll('.npc') as NodeListOf<HTMLElement>;
            
            if (playerElem) {
                playerElem.style.transform = `scale(${1 / scale})`;
            }
            
            npcElems.forEach((npc) => {
                npc.style.transform = `scale(${1 / scale})`;
            });
        }
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === '+' || event.key === '=') {
            zoomFactor = Math.min(maxZoom, zoomFactor + zoomStep);
            updateGameContainerTransform(gameContainer.clientWidth / 2, gameContainer.clientHeight / 2);
        } else if (event.key === '-') {
            zoomFactor = Math.max(minZoom, zoomFactor - zoomStep);
            updateGameContainerTransform(gameContainer.clientWidth / 2, gameContainer.clientHeight / 2);
        }
    }

    onMount(() => {
        animatePlayer();
        updateGameContainerTransform(gameContainer.clientWidth / 2, gameContainer.clientHeight / 2);
    });
</script>

<svelte:window on:keydown={handleMovement} on:keydown={handleKeyDown}/>

<div 
    bind:this={gameContainer}
    class="game-container" 
    on:wheel={handleWheel}
    role="application"
    aria-label="Game map"
    tabindex="0"
>
    <div class="basemap-container">
        <!-- Your basemap content here -->
    </div>
    <div class="game-elements">
        <div class="player {playerDirection} frame-{animationFrame}" style="left: {$player.x}px; top: {$player.y}px;"></div>
        {#each npcs as npc (npc.id)}
            <div 
                class="npc {npc.type}" 
                style="left: {npc.x}px; top: {npc.y}px;" 
                on:click={() => interactWithNPC(npc)}
                on:keydown={(e) => e.key === 'Enter' && interactWithNPC(npc)}
                role="button"
                tabindex="0"
                aria-label="{npc.type} NPC"
            ></div>
        {/each}
    </div>
</div>

<style>
    .game-container {
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
        transition: transform 0.1s ease;
        transform-origin: center center;

    }

    .basemap-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
    }

    .game-elements {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
    }

    .player, .npc {
        position: absolute;
        width: 40px;
        height: 40px;
        background-size: 160px 40px;
        image-rendering: pixelated;
    }

    .player {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='40' viewBox='0 0 160 40'%3E%3Cg id='down'%3E%3Crect x='15' y='5' width='10' height='10' fill='%23ffd700'/%3E%3Crect x='10' y='20' width='20' height='5' fill='%23ff0000'/%3E%3Crect x='10' y='25' width='5' height='10' fill='%230000ff'/%3E%3Crect x='25' y='25' width='5' height='10' fill='%230000ff'/%3E%3C/g%3E%3Cg id='left' transform='translate(40 0)'%3E%3Crect x='25' y='5' width='10' height='10' fill='%23ffd700'/%3E%3Crect x='10' y='20' width='20' height='5' fill='%23ff0000'/%3E%3Crect x='5' y='25' width='10' height='5' fill='%230000ff'/%3E%3Crect x='20' y='25' width='10' height='5' fill='%230000ff'/%3E%3C/g%3E%3Cg id='right' transform='translate(80 0)'%3E%3Crect x='5' y='5' width='10' height='10' fill='%23ffd700'/%3E%3Crect x='10' y='20' width='20' height='5' fill='%23ff0000'/%3E%3Crect x='10' y='25' width='10' height='5' fill='%230000ff'/%3E%3Crect x='25' y='25' width='10' height='5' fill='%230000ff'/%3E%3C/g%3E%3Cg id='up' transform='translate(120 0)'%3E%3Crect x='15' y='20' width='10' height='10' fill='%23ffd700'/%3E%3Crect x='10' y='5' width='20' height='5' fill='%23ff0000'/%3E%3Crect x='10' y='10' width='5' height='10' fill='%230000ff'/%3E%3Crect x='25' y='10' width='5' height='10' fill='%230000ff'/%3E%3C/g%3E%3C/svg%3E");
    }
    .player.down { background-position: 0 0; }
    .player.left { background-position: -40px 0; }
    .player.right { background-position: -80px 0; }
    .player.up { background-position: -120px 0; }

    .npc {
        background-size: 40px 40px;
    }
    .npc.friendly {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect x='15' y='5' width='10' height='10' fill='%23ffd700'/%3E%3Crect x='10' y='20' width='20' height='15' fill='%2300ff00'/%3E%3C/svg%3E");
    }
    .npc.enemy {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect x='15' y='5' width='10' height='10' fill='%23ffd700'/%3E%3Crect x='10' y='20' width='20' height='15' fill='%23ff0000'/%3E%3C/svg%3E");
    }
</style>