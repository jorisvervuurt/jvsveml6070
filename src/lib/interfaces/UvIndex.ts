import { UvIndexRiskLevel } from '../enums/UvIndexRiskLevel';

export interface UvIndex {
    
    /**
     * The UV index.
     */
    readonly value: number;

    /**
     * The UV index risk level.
     */
    readonly riskLevel: UvIndexRiskLevel;

}
