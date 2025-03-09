export function drag(node: HTMLElement, options: { onDragStart?: (distance: number) => void; onDragEnd?: (distance: number) => void }) {
    let startY: number;
    let isDragging = false;

    function handleMouseDown(event: MouseEvent) {
        if (event.button !== 0) return;
        startY = event.clientY;
        isDragging = true;

        if (options.onDragStart) {
            options.onDragStart(0); // Notify drag started
        }

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }

    function handleMouseMove(event: MouseEvent) {
        if (!isDragging) return;
        const distance = event.clientY - startY;

        // Allow dragging both up and down
        node.style.transform = `translateY(${distance}px)`;
    }

    function handleMouseUp(event: MouseEvent) {
        if (!isDragging) return;
        
        const distance = event.clientY - startY;
        node.style.transform = '';

        if (options.onDragEnd) {
            options.onDragEnd(distance);
        }

        cleanup();
    }

    function cleanup() {
        isDragging = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    }

    node.addEventListener('mousedown', handleMouseDown);

    return {
        update(newOptions: { onDragStart?: (distance: number) => void; onDragEnd?: (distance: number) => void }) {
            options = newOptions;
        },
        destroy() {
            node.removeEventListener('mousedown', handleMouseDown);
            cleanup();
        }
    };
}