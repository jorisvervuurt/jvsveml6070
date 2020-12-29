import { openPromisified, PromisifiedBus } from 'i2c-bus';
import { CommandRegister } from './CommandRegister';
import { I2CAddress } from './enums/I2CAddress';
import { IntegrationTime } from './enums/IntegrationTime';
import { ShutdownMode } from './enums/ShutdownMode';
import { I2CError } from './errors/I2CError';
import { SensorError } from './errors/SensorError';

export class Sensor {

    /**
     * The RSET value (in kΩ), which is used to determine the sensor's refresh time.
     */
    public rSet: number;

    /**
     * The I2C bus number.
     */
    public i2cBusNr: number;

    /**
     * The I2C bus.
     */
    private _i2cBus?: PromisifiedBus;

    /**
     * A value that indicates whether the I2C bus is open.
     */
    private _isI2cBusOpen: boolean;

    /**
     * The internal `CommandRegister` instance.
     */
    private _commandRegister: CommandRegister;

    /**
     * A value that indicates whether the sensor is initialized.
     */
    private _isInitialized: boolean;

    /**
     * Creates a new `Sensor` instance.
     * 
     * @param rSet - The RSET value (in kΩ), which is used to determine the sensor's refresh time. Defaults to 270 kΩ.
     * @param i2cBusNr - The I2C bus number. Defaults to 1.
     */
    constructor(rSet: number = 270, i2cBusNr: number = 1) {
        this.rSet = rSet;
        this.i2cBusNr = i2cBusNr;

        this._i2cBus = undefined;
        this._isI2cBusOpen = false;
        this._commandRegister = new CommandRegister();
        this._isInitialized = false;
    }

    /**
     * Initializes the sensor.
     * 
     * @param rSet - The RSET value (in kΩ), which is used to determine the sensor's refresh time. Defaults to 270 kΩ.
     * @param i2cBusNr - The I2C bus number. Defaults to 1.
     * 
     * @returns A `Promise` that resolves when the sensor has been initialized.
     */
    public static initialize(rSet: number = 270, i2cBusNr: number = 1): Promise<Sensor> {
        return new Promise((resolve, reject) => {
            const sensor = new Sensor(rSet, i2cBusNr);
            sensor.initialize()
                .then(() => resolve(sensor))
                .catch((reason) => reject(reason));
        });
    }

    /**
     * Initializes the sensor.
     * 
     * @returns A `Promise` that resolves when the sensor has been initialized.
     */
    public initialize(): Promise<void> {
        return new Promise((resolve, reject) => {
            Promise.all([
                this._checkSensorState(false),
                this._openBus(),
                this._updateCommandRegister(this._commandRegister),
            ]).then(() => {
                this._isInitialized = true;

                resolve();
            }).catch((reason) => {
                reject(new SensorError(`Failed to initialize sensor! ${reason}`));
            });
        });
    }

    /**
     * Shuts down the sensor and frees up all resources.
     * 
     * @returns A `Promise` that resolves when the sensor has been shut down and all resources have been freed up.
     */
    public destroy(): Promise<void> {
        return new Promise((resolve, reject) => {
            const commandRegister = new CommandRegister();
            commandRegister.setShutdownMode(ShutdownMode.ENABLED);

            Promise.all([
                this._checkSensorState(true),
                this._updateCommandRegister(commandRegister),
                this._closeBus(),
            ]).then(() => {
                this._isInitialized = false;

                resolve();
            }).catch((reason) => {
                reject(new SensorError(`Failed to destroy sensor! ${reason}`));
            });
        });
    }

    /**
     * Retrieves the shutdown mode.
     * 
     * @returns The shutdown mode.
     */
    public getShutdownMode(): ShutdownMode {
        return this._commandRegister.getShutdownMode();
    }

    /**
     * Sets the shutdown mode.
     * 
     * @returns A `Promise` that resolves when the shutdown mode has been set.
     */
    public setShutdownMode(shutdownMode: ShutdownMode): Promise<void> {
        const commandRegister: CommandRegister = this._commandRegister.clone();
        commandRegister.setShutdownMode(shutdownMode);

        return this._updateCommandRegister(commandRegister);
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
     * 
     * @returns A `Promise` that resolves when the integration time has been set.
     */
    public setIntegrationTime(integrationTime: IntegrationTime): Promise<void> {
        const commandRegister: CommandRegister = this._commandRegister.clone();
        commandRegister.setIntegrationTime(integrationTime);

        return this._updateCommandRegister(commandRegister);
    }

    /**
     * Clears the ACK state.
     * 
     * @param ignoreError - A `boolean` value that determines whether the returned `Promise` resolves even on error.
     *                      Defaults to `true` because the Alert Response Address seems to be never valid. This seems to
     *                      be an error in the datasheet.
     * 
     * @returns A `Promise` that resolves when the ACK state has been cleared.
     */
    public clearAckState(ignoreError: boolean = true): Promise<void> {
        return new Promise((resolve, reject) => {
            Promise.all([
                this._checkI2cBusState(true),
                this._i2cBus?.i2cRead(I2CAddress.AR, 1, Buffer.alloc(1)),
            ]).then(() => {
                resolve();
            }).catch((reason) => {
                if (!ignoreError) {
                    reject(new SensorError(`Failed to clear ACK state! ${reason}`));
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Checks the I2C bus state.
     * 
     * @param expectedState - The expected I2C bus state.
     * 
     * @returns A `Promise` that resolves when the I2C bus is in the expected state.
     */
    private _checkI2cBusState(expectedState: boolean): Promise<void> {
        return new Promise((resolve, reject) => {
            if (expectedState !== this._isI2cBusOpen) {
                reject(new I2CError('Invalid bus state!'));
            } else {
                resolve();
            }
        });
    }

    /**
     * Checks the sensor state.
     * 
     * @param expectedState - The expected sensor state.
     * 
     * @returns A `Promise` that resolves when the sensor is in the expected state.
     */
    private _checkSensorState(expectedState: boolean): Promise<void> {
        return new Promise((resolve, reject) => {
            if (expectedState !== this._isInitialized) {
                reject(new SensorError('Invalid sensor state!'));
            } else {
                resolve();
            }
        });
    }

    /**
     * Opens the I2C bus.
     * 
     * @returns A `Promise` that resolves when the I2C bus has been opened.
     */
    private _openBus(): Promise<void> {
        return new Promise((resolve, reject) => {
            Promise.all([
                this._checkI2cBusState(false),
                openPromisified(this.i2cBusNr),
            ]).then((results: [void, PromisifiedBus]) => {
                this._i2cBus = results[1];
                this._isI2cBusOpen = true;

                resolve();
            }).catch((reason) => {
                reject(new SensorError(`Failed to open I2C bus! ${reason}`));
            });
        });
    }

    /**
     * Closes the I2C bus.
     * 
     * @returns A `Promise` that resolves when the I2C bus has been closed.
     */
    private _closeBus(): Promise<void> {
        return new Promise((resolve, reject) => {
            Promise.all([
                this._checkI2cBusState(true),
                this._i2cBus?.close(),
            ]).then(() => {
                this._i2cBus = undefined;
                this._isI2cBusOpen = false;

                resolve();
            }).catch((reason) => {
                reject(new SensorError(`Failed to close I2C bus! ${reason}`));
            });
        });
    }

    /**
     * Updates the sensor's command register.
     * On success, the internal `CommandRegister` instance is updated.
     * 
     * @param commandRegister - The `CommandRegister` instance containing the data to write.
     * 
     * @returns A `Promise` that resolves when the sensor's command register has been updated.
     */
    private _updateCommandRegister(commandRegister: CommandRegister): Promise<void> {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.clearAckState(),
                this._checkI2cBusState(true),
                this._i2cBus?.i2cWrite(I2CAddress.CMD, 1, commandRegister.toBuffer()),
            ]).then(() => {
                this._commandRegister.writeBits(commandRegister.readBits());

                resolve();
            }).catch((reason) => {
                reject(new SensorError(`Failed to update the sensor's command register! ${reason}`));    
            });
        });
    }

}
