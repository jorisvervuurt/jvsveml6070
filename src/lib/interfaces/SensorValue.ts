import { UvIndex } from '../interfaces/UvIndex';

export interface SensorValue {

    /**
     * The raw value.
     */
    readonly rawValue: number;

    /**
     * The normalized value.
     * This is the raw value divided by the integration time multiplier, resulting in the average sample value.
     */
    readonly normalizedValue: number;

     /**
     * The UV index data.
     * Determined based on the data in the Application Note.
     * 
     * @see {@link https://www.vishay.com/docs/84310/designingveml6070.pdf|Vishay VEML6070 Application Note}, page 5.
     */
    readonly uvIndex: UvIndex;

}
