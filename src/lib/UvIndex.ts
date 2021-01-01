import { UvIndexRiskLevel } from './enums/module';

export class UvIndex {
    
    /**
     * The UV index.
     */
    public readonly value: number;

    /**
     * Creates a new `UvIndex` instance.
     * 
     * @param value - The UV index.
     */
    constructor(value: number) {
        this.value = value;
    }

    /**
     * Creates a new `UvIndex` instance from a sensor value.
     * 
     * @param rSet - The RSET value (in kΩ).
     * @param normalizedValue - The normalized value.
     *                          This is the raw value divided by the integration time multiplier, resulting in the 1T 
     *                          value.
     * 
     * @returns The created `UvIndex` instance.
     */
    public static fromSensorValue(rSet: number, normalizedValue: number): UvIndex {
        const uvIndex = Math.trunc(normalizedValue / (rSet * (186.67 / 270)));
        return new UvIndex(uvIndex);
    }

    /**
     * The UV index risk level.
     */
    public get riskLevel(): UvIndexRiskLevel {
        let riskLevel = UvIndexRiskLevel.LOW;

        if (this.value >= 3 && this.value <= 5) {
            riskLevel = UvIndexRiskLevel.MODERATE;
        } else if (this.value >= 6 && this.value <= 7) {
            riskLevel = UvIndexRiskLevel.HIGH;
        } else if (this.value >= 8 && this.value <= 10) {
            riskLevel = UvIndexRiskLevel.VERY_HIGH;
        } else if (this.value >= 11) {
            riskLevel = UvIndexRiskLevel.EXTREME;
        }
    
        return riskLevel;
    }

}
