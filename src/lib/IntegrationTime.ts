import { IntegrationTime as IntegrationTimeEnum } from './enums/module';

export class IntegrationTime {
    
    /**
     * The integration time enumeration value.
     */
    public readonly value: IntegrationTimeEnum;

    /**
     * Creates a new `IntegrationTime` instance.
     * 
     * @param value - The integration time enumeration value.
     */
    constructor(value: IntegrationTimeEnum) {
        this.value = value;
    }

    /**
     * The integration time multiplier.
     */
    public get multiplier(): number {
        let multiplier = 1;

        switch (this.value) {
            case IntegrationTimeEnum.IT_HALF_T:
                multiplier = 0.5;
                break;
            case IntegrationTimeEnum.IT_1T:
                multiplier = 1;
                break;
            case IntegrationTimeEnum.IT_2T:
                multiplier = 2;
                break;
            case IntegrationTimeEnum.IT_4T:
                multiplier = 4;
                break;
        }

        return multiplier;
    }

}
