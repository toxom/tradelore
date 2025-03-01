// src/lib/actions/drag.ts
export function drag(node: HTMLElement, options: { onDragEnd: (distance: number) => void }) {
    let startY: number;
    let isDragging = false;

    function handleMouseDown(event: MouseEvent) {
        if (event.button !== 0) return; // Only handle left click
        startY = event.clientY;
        isDragging = true;
        
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }

    function handleMouseMove(event: MouseEvent) {
        if (!isDragging) return;
        const distance = event.clientY - startY;
        
        // Only allow dragging to the left (negative distance)
        if (distance < 0) {
            node.style.transform = `translateY(${distance}px)`;
        }
    }

    function handleMouseUp(event: MouseEvent) {
        if (!isDragging) return;
        
        const distance = event.clientY - startY;
        node.style.transform = '';
        
        // If dragged more than 100px to the left, trigger the callback
        if (distance < -100) {
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
        destroy() {
            node.removeEventListener('mousedown', handleMouseDown);
            cleanup();
        }
    };
}