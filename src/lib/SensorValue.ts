export class SensorValue {

    /**
     * The raw value.
     */
    public readonly rawValue: number;

    /**
     * Creates a new `SensorValue` instance.
     * 
     * @param rawValue - The raw value.
     */
    constructor(rawValue: number) {
        this.rawValue = rawValue;
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
