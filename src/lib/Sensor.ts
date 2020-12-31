import { openPromisified, PromisifiedBus } from 'i2c-bus';
import { CommandRegister } from './CommandRegister';
import { I2CAddress } from './enums/I2CAddress';
import { I2CBusState } from './enums/I2CBusState';
import { SensorState } from './enums/SensorState';
import { ShutdownMode } from './enums/ShutdownMode';
import { I2CError } from './errors/I2CError';
import { SensorError } from './errors/SensorError';
import { IntegrationTime } from './IntegrationTime';
import { IntegrationTime as IntegrationTimeEnum } from './enums/IntegrationTime';
import { SensorValue } from './SensorValue';
import { delay } from './helpers';

export class Sensor {

    /**
     * The I2C bus number.
     */
    public i2cBusNr: number;

    /**
     * The RSET value (in kΩ), which is used to determine the sensor's refresh time.
     */
    public rSet: number;

    /**
     * The internal `CommandRegister` instance.
     */
    private _commandRegister: CommandRegister;

    /**
     * The sensor state.
     */
    private _state: SensorState;

    /**
     * The I2C bus.
     */
    private _i2cBus: PromisifiedBus | null;

    /**
     * The I2C bus state.
     */
    private _i2cBusState: I2CBusState;

    /**
     * Creates a new `Sensor` instance.
     * 
     * @param i2cBusNr - The I2C bus number. Defaults to 1.
     * @param rSet - The RSET value (in kΩ), which is used to determine the sensor's refresh time. Defaults to 270 kΩ.
     */
    constructor(i2cBusNr: number = 1, rSet: number = 270) {
        this.i2cBusNr = i2cBusNr;
        this.rSet = rSet;

        this._commandRegister = new CommandRegister();
        this._state = SensorState.DISABLED;
        this._i2cBus = null;
        this._i2cBusState = I2CBusState.CLOSED;
    }

    /**
     * Creates a new `Sensor` instance and enables the sensor.
     * 
     * @param i2cBusNr - The I2C bus number. Defaults to 1.
     * @param rSet - The RSET value (in kΩ), which is used to determine the sensor's refresh time. Defaults to 270 kΩ.
     * 
     * @returns A `Promise` that resolves when the sensor has been enabled.
     */
    public static initialize(i2cBusNr: number = 1, rSet: number = 270): Promise<Sensor> {
        return new Promise((resolve, reject) => {
            const sensor = new Sensor(i2cBusNr, rSet);
            sensor.enable()
                .then(() => resolve(sensor))
                .catch((error) => reject(error));
        });
    }

    /**
     * Retrieves the I2C bus state.
     * 
     * @returns The `I2CBusState` enumeration value.
     */
    public getI2cBusState(): I2CBusState {
        return this._i2cBusState;
    }

    /**
     * Retrieves the sensor's state.
     * 
     * @returns The `SensorState` enumeration value.
     */
    public getState(): SensorState {
        return this._state;
    }

    /**
     * Enables the sensor.
     * 
     * @returns A `Promise` that resolves when the sensor has been initialized.
     */
    public enable(): Promise<void> {
        return new Promise((resolve, reject) => {
            const commandRegister = this._commandRegister.clone();
            commandRegister.setShutdownMode(ShutdownMode.DISABLED);

            this._checkState(SensorState.DISABLED)
                .then(() => this._openI2cBus())
                .then(() => this._updateCommandRegister(commandRegister))
                .then(() => {
                    this._state = SensorState.ENABLED;
                    resolve();
                })
                .catch((error) => {
                    reject(new SensorError('Failed to enable the sensor.', error));
                });
        });
    }

    /**
     * Disables the sensor.
     * 
     * @returns A `Promise` that resolves when the sensor has been shut down and all resources have been freed up.
     */
    public disable(): Promise<void> {
        return new Promise((resolve, reject) => {
            const commandRegister = this._commandRegister.clone();
            commandRegister.setShutdownMode(ShutdownMode.ENABLED);

            this._checkState(SensorState.ENABLED)
                .then(() => this._updateCommandRegister(commandRegister))
                .then(() => this._closeI2cBus())
                .then(() => {
                    this._state = SensorState.DISABLED;
                    resolve();
                })
                .catch((error) => {
                    reject(new SensorError('Failed to disable the sensor.', error));
                });
        });
    }

    /**
     * Retrieves the shutdown mode.
     * 
     * @returns The `ShutdownMode` enumeration value.
     */
    public getShutdownMode(): ShutdownMode {
        return this._commandRegister.getShutdownMode();
    }

    /**
     * Sets the shutdown mode.
     * 
     * @param shutdownMode - A `ShutdownMode` enumeration value.
     * 
     * @returns A `Promise` that resolves when the shutdown mode has been set.
     */
    public setShutdownMode(shutdownMode: ShutdownMode): Promise<void> {
        const commandRegister = this._commandRegister.clone();
        commandRegister.setShutdownMode(shutdownMode);

        return this._updateCommandRegister(commandRegister);
    }

    /**
     * Retrieves the integration time.
     * 
     * @returns An `IntegrationTime` instance.
     */
    public getIntegrationTime(): IntegrationTime {
        return new IntegrationTime(this._commandRegister.getIntegrationTime());
    }

    /**
     * Sets the integration time.
     * 
     * @param integrationTime - An `IntegrationTime` enumeration value.
     * 
     * @returns A `Promise` that resolves when the integration time has been set.
     */
    public setIntegrationTime(integrationTime: IntegrationTimeEnum): Promise<void> {
        const commandRegister = this._commandRegister.clone();
        commandRegister.setIntegrationTime(integrationTime);

        return this._updateCommandRegister(commandRegister);
    }

    /**
     * Retrieves the refresh time.
     * 
     * @returns The refresh time in milliseconds.
     */
    public getRefreshTime(): number {
        const integrationTime = this.getIntegrationTime();
        return integrationTime.multiplier * (this.rSet * (125 / 300));
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
            this._checkI2cBusState(I2CBusState.OPENED)
                .then(() => this._i2cBus?.i2cRead(I2CAddress.AR, 1, Buffer.alloc(1)))
                .then(() => resolve())
                .catch((error) => {
                    if (!ignoreError) {
                        reject(new SensorError('Failed to clear the ACK state.', error));
                    } else {
                        resolve();
                    }
                });
        });
    }

    /**
     * Reads the value.
     * 
     * @returns - A `Promise` that resolves when the value has been read.
     */
    public read(): Promise<SensorValue> {
        return new Promise((resolve, reject) => {
            this._checkState(SensorState.ENABLED)
                .then(() => delay(this.getRefreshTime()))
                .then(() => {
                    this._i2cBus?.i2cRead(I2CAddress.DATA_MSB, 1, Buffer.alloc(1)).then((msb) => {
                        this._i2cBus?.i2cRead(I2CAddress.DATA_LSB, 1, Buffer.alloc(1)).then((lsb) => {
                            const rawValue = (msb.buffer[0] << 8) | lsb.buffer[0],
                                sensorValue = SensorValue.fromRawValue(this.rSet, this.getIntegrationTime(), rawValue);

                            resolve(sensorValue);
                        });
                    });
                })
                .catch((error) => {
                    reject(new SensorError('Failed to read value.', error));
                });
        });
    }

    /**
     * Checks the I2C bus state.
     * 
     * @param expectedState - The expected `I2CBusState` enumeration value.
     * 
     * @returns A `Promise` that resolves when the state is as expected.
     */
    private _checkI2cBusState(expectedState: I2CBusState): Promise<void> {
        return new Promise((resolve, reject) => {
            if (expectedState !== this.getI2cBusState()) {
                reject(new I2CError('Invalid bus state.'));
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
    private _openI2cBus(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._checkI2cBusState(I2CBusState.CLOSED)
                .then(() => openPromisified(this.i2cBusNr))
                .then((i2cBus) => {
                    this._i2cBus = i2cBus;
                    this._i2cBusState = I2CBusState.OPENED;
                    resolve();
                })
                .catch((error) => {
                    reject(new SensorError('Failed to open the I2C bus.', error));
                });
        });
    }

    /**
     * Closes the I2C bus.
     * 
     * @returns A `Promise` that resolves when the I2C bus has been closed.
     */
    private _closeI2cBus(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._checkI2cBusState(I2CBusState.OPENED)
                .then(() => this._i2cBus?.close())
                .then(() => {
                    this._i2cBus = null;
                    this._i2cBusState = I2CBusState.CLOSED;
                    resolve();
                })
                .catch((error) => {
                    reject(new SensorError('Failed to close the I2C bus.', error));
                });
        });
    }

    /**
     * Checks the sensor's state.
     * 
     * @param expectedState - The expected `SensorState` enumeration value.
     * 
     * @returns A `Promise` that resolves when the state is as expected.
     */
    private _checkState(expectedState: SensorState): Promise<void> {
        return new Promise((resolve, reject) => {
            if (expectedState !== this.getState()) {
                reject(new SensorError('Invalid state.'));
            } else {
                resolve();
            }
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
            this.clearAckState()
                .then(() => this._i2cBus?.i2cWrite(I2CAddress.CMD, 1, commandRegister.toBuffer()))
                .then(() => {
                    this._commandRegister.writeBits(commandRegister.readBits());
                    resolve();
                }).catch((error) => {
                    reject(new SensorError('Failed to update the sensor\'s command register.', error));    
                });
        });
    }

}
