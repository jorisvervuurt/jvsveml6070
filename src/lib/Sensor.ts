import { CommandRegister } from './CommandRegister';
import { IntegrationTime } from './enums/IntegrationTime';

export class Sensor {

    /**
     * The internal `CommandRegister` instance.
     */
    private _commandRegister: CommandRegister;

    /**
     * Constructs a new `Sensor` instance.
     */
    constructor() {
        this._commandRegister = new CommandRegister();
    }

    /**
     * Retrieves the integration time.
     * 
     * @returns The integration time.
     */
    public getIntegrationTime(): IntegrationTime {
        return this._commandRegister.getIntegrationTime();
    }

    /**
     * Sets the integration time.
     * 
     * @param integrationTime - The integration time.
     */
    public setIntegrationTime(integrationTime: IntegrationTime): void {
        this._commandRegister.setIntegrationTime(integrationTime);
        this._writeCommandRegister();
    }

    /**
     * Writes the command register to the device.
     */
    private _writeCommandRegister(): void {
        // TODO: add implementation.
    }

}
