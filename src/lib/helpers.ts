import { IntegrationTime } from './enums/IntegrationTime';
import { UvIndexRiskLevel } from './enums/UvIndexRiskLevel';

/**
 * Calculates the integration time multiplier.
 * 
 * @param integrationTime - The integration time.
 * 
 * @returns The integration time multiplier.
 */
export function calculateIntegrationTimeMultiplier(integrationTime: IntegrationTime): number {
    let multiplier: number = 1;

    switch (integrationTime) {
        case IntegrationTime.IT_HALF_T:
            multiplier = 0.5;
            break;
        case IntegrationTime.IT_1T:
            multiplier = 1;
            break;
        case IntegrationTime.IT_2T:
            multiplier = 2;
            break;
        case IntegrationTime.IT_4T:
            multiplier = 4;
            break;
    }

    return multiplier;
}

/**
 * Calculates the normalized value.
 * 
 * @param rawValue - The raw value.
 * @param integrationTime - The integration time.
 * 
 * @returns The normalized value.
 */
export function calculateNormalizedValue(rawValue: number, integrationTime: IntegrationTime): number {
    const multiplier: number = calculateIntegrationTimeMultiplier(integrationTime);
    return rawValue / multiplier;
}

/**
 * Calculates the refresh time.
 * 
 * @param rSet - The RSET value (in kΩ).
 * @param integrationTime - The integration time.
 * 
 * @returns The refresh time in milliseconds.
 */
export function calculateRefreshTime(rSet: number, integrationTime: IntegrationTime): number {
    const multiplier: number = calculateIntegrationTimeMultiplier(integrationTime);
    return multiplier * (rSet * (125 / 300));
}

/**
 * Calculates the UV index.
 * 
 * @param rSet - The RSET value (in kΩ).
 * @param normalizedValue - The normalized value. 
 *                          This is the raw value divided by the integration time multiplier.
 * 
 * @returns The UV index.
 */
export function calculateUvIndex(rSet: number, normalizedValue: number): number {
    return Math.trunc(normalizedValue / (rSet * (186.67 / 270)));
}

/**
 * Calculates the UV index risk level.
 * 
 * @param uvIndex - The UV index.
 * 
 * @returns The UV index risk level.
 */
export function calculateUvIndexRiskLevel(uvIndex: number): UvIndexRiskLevel {
    let riskLevel: UvIndexRiskLevel = UvIndexRiskLevel.LOW;

    if (uvIndex <= 2) {
        riskLevel = UvIndexRiskLevel.LOW;
    } else if (uvIndex >= 3 && uvIndex <= 5) {
        riskLevel = UvIndexRiskLevel.MODERATE;
    } else if (uvIndex >= 6 && uvIndex <= 7) {
        riskLevel = UvIndexRiskLevel.HIGH;
    } else if (uvIndex >= 8 && uvIndex <= 10) {
        riskLevel = UvIndexRiskLevel.VERY_HIGH;
    } else if (uvIndex >= 11) {
        riskLevel = UvIndexRiskLevel.EXTREME;
    }

    return riskLevel;
}

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
