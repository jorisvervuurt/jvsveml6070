import { IntegrationTime } from './lib/enums/IntegrationTime';
import { Sensor } from './lib/Sensor';

export {
    IntegrationTime,
    Sensor,
};

// TODO: remove as this is for testing purposes.
Sensor.init().then((sensor: Sensor) => {
    console.log(sensor);
});
