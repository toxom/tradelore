<script lang="ts">
    export let size = 300;
    export let bgColor = 'cornflowerblue';
    export let fgColor = 'orange';

    // Test data structure
    interface PieSegment {
        label: string;
        value: number;
        color: string;
    }

    const testData: PieSegment[] = [
        { label: 'Segment 1', value: 30, color: '#FF6384' },
        { label: 'Segment 2', value: 50, color: '#36A2EB' },
        { label: 'Segment 3', value: 20, color: '#FFCE56' },
        { label: 'Segment 4', value: 40, color: '#4BC0C0' },
        { label: 'Segment 5', value: 60, color: '#9966FF' }
    ];

    let hoveredSegment: number | null = null;

    $: viewBox = `0 0 ${size} ${size}`;
    $: radius = size / 2;
    $: total = testData.reduce((sum, segment) => sum + segment.value, 0);

    // Calculate segment paths and positions
    $: segments = testData.map((segment, index) => {
        const startAngle = calculateStartAngle(index);
        const endAngle = startAngle + calculateAngle(segment.value);
        
        const x1 = radius + radius * Math.cos(startAngle);
        const y1 = radius + radius * Math.sin(startAngle);
        const x2 = radius + radius * Math.cos(endAngle);
        const y2 = radius + radius * Math.sin(endAngle);

        const largeArcFlag = calculateAngle(segment.value) > Math.PI ? 1 : 0;

        const d = `
            M ${radius} ${radius}
            L ${x1} ${y1}
            A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
            Z
        `;

        return {
            ...segment,
            path: d,
            startAngle,
            endAngle
        };
    });

    function calculateStartAngle(index: number): number {
        const startValue = testData.slice(0, index).reduce((sum, segment) => sum + segment.value, 0);
        return (startValue / total) * (2 * Math.PI) - Math.PI / 2;
    }

    function calculateAngle(value: number): number {
        return (value / total) * (2 * Math.PI);
    }

    function handleMouseEnter(index: number) {
        hoveredSegment = index;
    }

    function handleMouseLeave() {
        hoveredSegment = null;
    }
</script>

<div class="container">
    <svg 
        width={size} 
        height={size} 
        {viewBox}
    >
        {#each segments as segment, index}
            <path
                d={segment.path}
                fill={segment.color}
                class:hover={hoveredSegment === index}
                on:mouseenter={() => handleMouseEnter(index)}
                on:mouseleave={handleMouseLeave}
                class="pie-segment"
            />
        {/each}
        
        <circle 
            r={radius / 2.5} 
            cx={radius} 
            cy={radius} 
            fill={bgColor} 
        />

    </svg>
</div>

<style>
    .container {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding: 2rem;
    }

    .pie-segment {
        transition: transform 0.3s ease;
        transform-origin: center;
        transform: scale(0.9);

    }

    .pie-segment.hover {
        transform: scale(1);
        filter: brightness(1.2);
    }
</style>