import { BytesRead, BytesWritten, openPromisified, PromisifiedBus } from 'i2c-bus';
import { CommandRegister } from './CommandRegister';
import { I2CAddress } from './enums/I2CAddress';
import { IntegrationTime } from './enums/IntegrationTime';
import { ShutdownMode } from './enums/ShutdownMode';

export class Sensor {

    /**
     * The opened bus.
     */
    private _bus!: PromisifiedBus;

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
     * Initializes the sensor.
     * 
     * @param busNumber - The number of the I2C bus/adapter.
     */
    public static init(busNumber: number = 1): Promise<Sensor> {
        return new Promise((resolve, reject) => {
            const sensor = new Sensor();

            openPromisified(busNumber)
                .then((bus: PromisifiedBus) => {
                    sensor._bus = bus;

                    sensor.enable()
                        .then(() => {
                            resolve(sensor);
                        })
                        .catch((reason) => {
                            reject(reason);
                        });
                })
                .catch((reason) => {
                    reject(reason);
                });
        });
    }

    // Enables the sensor (disables shutdown mode).
    public enable(): Promise<BytesWritten> {
        if (ShutdownMode.DISABLED === this._commandRegister.getShutdownMode()) {
            return Promise.reject('Sensor is already enabled.');
        }

        this._commandRegister.setShutdownMode(ShutdownMode.DISABLED);
        return this._writeCommandRegister();
    }

    /**
     * Disables the sensor (enables shutdown mode).
     */
    public disable(): Promise<BytesWritten> {
        if (ShutdownMode.ENABLED === this._commandRegister.getShutdownMode()) {
            return Promise.reject('Sensor is already disabled.');
        }

        this._commandRegister.setShutdownMode(ShutdownMode.ENABLED);
        return this._writeCommandRegister();
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
     * Clears the ACK state.
     */
    private _clearAckState(): Promise<BytesRead> {
        return this._bus.i2cRead(I2CAddress.AR, 1, Buffer.alloc(1));
    }

    /**
     * Writes the command register to the device.
     */
    private async _writeCommandRegister(): Promise<BytesWritten> {
        await this._clearAckState();
        return this._bus.i2cWrite(I2CAddress.CMD, 1, this._commandRegister.toBuffer());
    }

}
