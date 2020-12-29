/**
 * Waits the specified delay in milliseconds and then resolves.
 * 
 * @param milliseconds - The delay in milliseconds.
 * 
 * @returns A `Promise` that resolves after the provided delay.
 */
export function delay(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
