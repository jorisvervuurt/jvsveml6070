import { IntegrationTime } from './IntegrationTime';
import { UvIndex } from './UvIndex';

export class SensorValue {

    /**
     * The raw value.
     */
    public readonly rawValue: number;

    /**
     * The normalized value.
     * This is the raw value divided by the integration time multiplier, resulting in the 1T value.
     */
    public readonly normalizedValue: number;

    /**
     * The UV index data.
     * Calculated based on the data in the Application Note.
     * 
     * @see {@link https://www.vishay.com/docs/84310/designingveml6070.pdf|Vishay VEML6070 Application Note}, page 5.
     */
    public readonly uvIndex: UvIndex;

    /**
     * Creates a new `SensorValue` instance.
     * 
     * @param rawValue - The raw value.
     * @param normalizedValue - The normalized value.
     * @param uvIndex - The `UvIndex` instance.
     */
    constructor(rawValue: number, normalizedValue: number, uvIndex: UvIndex) {
        this.rawValue = rawValue;
        this.normalizedValue = normalizedValue;
        this.uvIndex = uvIndex;
    }

    /**
     * Creates a new `SensorValue` instance from a raw value.
     * 
     * @param rSet - The RSET value (in kΩ).
     * @param integrationTime - The `IntegrationTime` instance.
     * @param rawValue - The raw value.
     * 
     * @returns The `SensorValue` instance.
     */
    public static fromRawValue(rSet: number, integrationTime: IntegrationTime, rawValue: number): SensorValue {
        const normalizedValue = rawValue / integrationTime.multiplier,
            uvIndex = UvIndex.fromSensorValue(rSet, normalizedValue);

        return new SensorValue(rawValue, normalizedValue, uvIndex);
    }

}
