export class SensorValue {

    /**
     * The raw value.
     */
    public readonly rawValue: number;

    /**
     * The normalized value.
     * This is the raw value divided by the integration time multiplier, resulting in the average sample value.
     */
    public readonly normalizedValue: number;

    /**
     * Creates a new `SensorValue` instance.
     * 
     * @param rawValue - The raw value.
     * @param normalizedValue - The normalized value.
     */
    constructor(rawValue: number, normalizedValue: number) {
        this.rawValue = rawValue;
        this.normalizedValue = normalizedValue;
    }

    /**
     * The UV index.
     * Determined based on the data in the Application Note.
     * 
     * @see {@link https://www.vishay.com/docs/84310/designingveml6070.pdf|Vishay VEML6070 Application Note}, page 5.
     * 
     * @returns The UV index.
     */
    public get uvIndex(): number {
        // TODO: add implementation.
        
        return this.rawValue;
    }

}
